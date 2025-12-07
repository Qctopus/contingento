import { NextRequest, NextResponse } from 'next/server'
import {
  getPrismaClient,
  withDatabase,
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  safeJsonStringify
} from '@/lib/admin2/api-utils'
import { transformStrategyForApi } from '@/lib/admin2/transformers'
import { validateStrategyData } from '@/lib/admin2/validation'
import { localizeStrategy } from '@/utils/localizationUtils'
import { costCalculationService } from '@/services/costCalculationService'
import type { Locale } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') as Locale || 'en'

    // Note: Admin interface might need raw data, but for now we prioritize the standard API response
    // If we need raw data for editing, we might need a different endpoint or param

    const strategies = await withDatabase(async () => {
      const prisma = getPrismaClient()
      return await prisma.riskMitigationStrategy.findMany({
        where: { isActive: true },
        include: {
          ActionStep: {
            where: { isActive: true },
            include: {
              ActionStepTranslation: {
                where: { locale }
              },
              ActionStepItemCost: {
                include: {
                  CostItem: true
                }
              }
            } as any,
            orderBy: { sortOrder: 'asc' }
          },
          StrategyTranslation: {
            where: { locale }
          }
        } as any,
        orderBy: [
          { strategyId: 'asc' }
        ]
      })
    }, 'GET /api/admin2/strategies')

    // Pre-fetch cost calculation data (Multipliers and Cost Items)
    const prisma = getPrismaClient()
    
    // 1. Fetch Country Multiplier for JM (default context)
    const multiplier = await prisma.countryCostMultiplier.findUnique({
      where: { countryCode: 'JM' }
    })

    // 2. Collect all used Cost Items IDs
    const costItemIds = new Set<string>()
    strategies.forEach((s: any) => {
      s.ActionStep?.forEach((step: any) => {
        step.ActionStepItemCost?.forEach((ic: any) => {
          if (ic.itemId) costItemIds.add(ic.itemId)
        })
      })
    })

    // 3. Fetch used Cost Items
    const costItemsList = await prisma.costItem.findMany({
      where: { itemId: { in: Array.from(costItemIds) } }
    })
    
    const costItemsMap = new Map<string, any>()
    costItemsList.forEach(item => costItemsMap.set(item.itemId, item))

    // Prepare Data Context for Service
    const dataContext = {
      countryMultiplier: multiplier,
      costItems: costItemsMap
    }

    // Calculate costs for each strategy using the service with injected data
    const enrichedStrategies = await Promise.all(strategies.map(async (strategy: any) => {
      // Map ActionSteps to the format expected by cost service
      const stepsForCalc = (strategy.ActionStep || []).map((step: any) => ({
        id: step.id,
        phase: step.phase,
        costItems: (step.ActionStepItemCost || []).map((ic: any) => ({
          actionStepId: step.id,
          itemId: ic.itemId,
          quantity: ic.quantity,
          item: ic.CostItem // Prisma include already populated this, but we also have map
        }))
      }))

      // Calculate cost using injected data (no fetch calls)
      const costCalc = await costCalculationService.calculateStrategyCost(stepsForCalc, 'JM', dataContext)
      
      return {
        ...strategy,
        // Inject calculated costs
        calculatedTotalCostUSD: costCalc.totalUSD,
        calculatedTotalCostJMD: costCalc.localCurrency.amount,
        // Override cost estimate if we have real data
        costEstimateJMD: costCalc.totalUSD > 0 
          ? costCalculationService.formatCurrency(costCalc.localCurrency.amount, 'JMD')
          : (strategy.costEstimateJMD || getCostEstimateJMD(strategy.implementationCost))
      }
    }))

    // Transform database strategies to match frontend format
    // The transformer will handle flattening the translations
    const transformedStrategies = enrichedStrategies.map(transformStrategyForApi)

    console.log(`🛡️ Strategies GET API: Successfully fetched ${strategies.length} strategies from database (locale: ${locale})`)
    return createSuccessResponse(transformedStrategies)
    
  } catch (error) {
    return handleApiError(error, 'Failed to fetch strategies')
  }
}

export async function POST(request: NextRequest) {
  try {
    const strategyData = await request.json()

    console.log('🛡️ Creating new strategy:', strategyData.name)

    // Validate input data
    const validation = validateStrategyData(strategyData)
    if (!validation.isValid) {
      return createErrorResponse(
        'Invalid strategy data',
        400,
        'VALIDATION_ERROR',
        validation.errors
      )
    }

    const newStrategy = await withDatabase(async () => {
      const prisma = getPrismaClient()

      // Prepare base data - only include fields that exist in the RiskMitigationStrategy table
      const createData: any = {
        strategyId: strategyData.strategyId || `custom_${Date.now()}`,
        applicableRisks: safeJsonStringify(strategyData.applicableRisks || []),
        applicableBusinessTypes: safeJsonStringify(strategyData.applicableBusinessTypes || []),
        isActive: true,
        selectionTier: strategyData.selectionTier || 'recommended'
      }

      // Prepare translation data
      const translationData: any = {
        locale: 'en', // Default to English
        name: strategyData.name,
        description: strategyData.description || '',
        smeTitle: strategyData.smeTitle,
        smeSummary: strategyData.smeSummary,
        smeDescription: strategyData.smeDescription,
        whyImportant: strategyData.whyImportant,
        realWorldExample: strategyData.realWorldExample,
        lowBudgetAlternative: strategyData.lowBudgetAlternative,

        // JSON fields in translation
        benefitsBullets: typeof strategyData.benefitsBullets === 'string'
          ? strategyData.benefitsBullets
          : safeJsonStringify(strategyData.benefitsBullets),
        helpfulTips: typeof strategyData.helpfulTips === 'string'
          ? strategyData.helpfulTips
          : safeJsonStringify(strategyData.helpfulTips || []),
        commonMistakes: typeof strategyData.commonMistakes === 'string'
          ? strategyData.commonMistakes
          : safeJsonStringify(strategyData.commonMistakes || []),
        successMetrics: typeof strategyData.successMetrics === 'string'
          ? strategyData.successMetrics
          : safeJsonStringify(strategyData.successMetrics || []),
        requiredForRisks: typeof strategyData.requiredForRisks === 'string'
          ? strategyData.requiredForRisks
          : safeJsonStringify(strategyData.requiredForRisks || [])
      }

      // Calculated costs
      if (strategyData.costEstimateJMD !== undefined) createData.costEstimateJMD = strategyData.costEstimateJMD
      if (strategyData.implementationCost !== undefined) createData.implementationCost = strategyData.implementationCost
      if (strategyData.implementationTime !== undefined) createData.implementationTime = strategyData.implementationTime
      if (strategyData.estimatedTotalHours !== undefined) createData.estimatedTotalHours = strategyData.estimatedTotalHours
      if (strategyData.estimatedDIYSavings !== undefined) createData.estimatedDIYSavings = strategyData.estimatedDIYSavings
      if (strategyData.complexityLevel !== undefined) createData.complexityLevel = strategyData.complexityLevel
      if (strategyData.difficultyLevel !== undefined) createData.difficultyLevel = strategyData.difficultyLevel
      if (strategyData.effectiveness !== undefined) createData.effectiveness = strategyData.effectiveness
      if (strategyData.priority !== undefined) createData.priority = strategyData.priority
      if (strategyData.quickWinIndicator !== undefined) createData.quickWinIndicator = strategyData.quickWinIndicator

      console.log('💰 Creating strategy with base data:', createData)

      return await prisma.riskMitigationStrategy.create({
        data: {
          ...createData,
          StrategyTranslation: {
            create: translationData
          }
        },
        include: {
          StrategyTranslation: true
        } as any
      })
    }, 'POST /api/admin2/strategies')

    // Transform response using shared transformer
    const transformedStrategy = transformStrategyForApi(newStrategy)

    console.log('🛡️ Strategy created successfully:', transformedStrategy.name)
    return createSuccessResponse(transformedStrategy, 201)

  } catch (error) {
    return handleApiError(error, 'Failed to create strategy')
  }
}

// Helper for cost estimate (fallback)
function getCostEstimateJMD(cost: string): string {
  switch (cost) {
    case 'low':
      return 'Under JMD $10,000'
    case 'medium':
      return 'JMD $10,000 - $50,000'
    case 'high':
      return 'Over JMD $50,000'
    default:
      return 'Cost estimate not available'
  }
}
