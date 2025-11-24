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

    // Transform database strategies to match frontend format
    // The transformer will handle flattening the translations
    const transformedStrategies = strategies.map(transformStrategyForApi)

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

      // Calculated costs (from frontend calculation) - these seem to be on the base table based on previous code?
      // Checking schema: calculatedCostUSD is NOT in RiskMitigationStrategy in the schema I viewed (lines 703-735).
      // It has costEstimateJMD, implementationCost, etc.
      // But the previous code was trying to save calculatedCostUSD. 
      // If it's not in schema, it will fail. I will omit them if they are not in schema.
      // Schema has: costEstimateJMD, implementationCost, implementationTime, estimatedTotalHours, estimatedDIYSavings.

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

