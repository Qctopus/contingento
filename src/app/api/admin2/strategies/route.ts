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
    const skipLocalization = searchParams.get('skipLocalization') === 'true' // Admin needs all languages

    const strategies = await withDatabase(async () => {
      const prisma = getPrismaClient()
      return await prisma.riskMitigationStrategy.findMany({
        where: { isActive: true },
        include: {
          actionSteps: {
            where: { isActive: true },
            include: {
              itemCosts: {
                include: {
                  item: true
                }
              }
            },
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: [
          { name: 'asc' }
        ]
      })
    }, 'GET /api/admin2/strategies')
    
    // Transform database strategies to match frontend format
    let transformedStrategies = strategies.map(transformStrategyForApi)
    
    // Only localize for non-admin contexts (wizard, etc.)
    // Admin interface needs all languages to allow switching
    if (!skipLocalization) {
      transformedStrategies = transformedStrategies.map(strategy => localizeStrategy(strategy, locale))
    }
    
    console.log(`🛡️ Strategies GET API: Successfully fetched ${strategies.length} strategies from database (locale: ${locale}, skipLocalization: ${skipLocalization})`)
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
      
      // Prepare create data - only include fields that exist in the Prisma schema
      const createData: any = {
        strategyId: strategyData.strategyId || `custom_${Date.now()}`,
        name: strategyData.name,
        description: strategyData.description || '',
        applicableRisks: safeJsonStringify(strategyData.applicableRisks || []),
        applicableBusinessTypes: safeJsonStringify(strategyData.applicableBusinessTypes || []),
        isActive: true
      }
      
      // Optional fields that exist in schema
      if (strategyData.smeTitle !== undefined) {
        createData.smeTitle = strategyData.smeTitle
      }
      if (strategyData.smeSummary !== undefined) {
        createData.smeSummary = strategyData.smeSummary
      }
      if (strategyData.smeDescription !== undefined) {
        createData.smeDescription = strategyData.smeDescription
      }
      if (strategyData.whyImportant !== undefined) {
        createData.whyImportant = strategyData.whyImportant
      }
      if (strategyData.benefitsBullets !== undefined) {
        createData.benefitsBullets = typeof strategyData.benefitsBullets === 'string' 
          ? strategyData.benefitsBullets 
          : safeJsonStringify(strategyData.benefitsBullets)
      }
      if (strategyData.realWorldExample !== undefined) {
        createData.realWorldExample = strategyData.realWorldExample
      }
      if (strategyData.selectionTier !== undefined) {
        createData.selectionTier = strategyData.selectionTier
      } else {
        createData.selectionTier = 'recommended' // Default value
      }
      if (strategyData.requiredForRisks !== undefined) {
        createData.requiredForRisks = typeof strategyData.requiredForRisks === 'string'
          ? strategyData.requiredForRisks
          : safeJsonStringify(strategyData.requiredForRisks || [])
      }
      if (strategyData.helpfulTips !== undefined) {
        createData.helpfulTips = typeof strategyData.helpfulTips === 'string'
          ? strategyData.helpfulTips
          : safeJsonStringify(strategyData.helpfulTips || [])
      }
      if (strategyData.commonMistakes !== undefined) {
        createData.commonMistakes = typeof strategyData.commonMistakes === 'string'
          ? strategyData.commonMistakes
          : safeJsonStringify(strategyData.commonMistakes || [])
      }
      if (strategyData.successMetrics !== undefined) {
        createData.successMetrics = typeof strategyData.successMetrics === 'string'
          ? strategyData.successMetrics
          : safeJsonStringify(strategyData.successMetrics || [])
      }
      if (strategyData.lowBudgetAlternative !== undefined) {
        createData.lowBudgetAlternative = strategyData.lowBudgetAlternative
      }
      
      // Calculated costs (from frontend calculation)
      if (typeof strategyData.calculatedCostUSD === 'number') {
        createData.calculatedCostUSD = strategyData.calculatedCostUSD
      }
      if (typeof strategyData.calculatedCostLocal === 'number') {
        createData.calculatedCostLocal = strategyData.calculatedCostLocal
      }
      if (strategyData.currencyCode !== undefined) {
        createData.currencyCode = strategyData.currencyCode
      }
      if (strategyData.currencySymbol !== undefined) {
        createData.currencySymbol = strategyData.currencySymbol
      }
      // Note: schema field is totalEstimatedHours, not estimatedTotalHours
      if (typeof strategyData.estimatedTotalHours === 'number' || typeof strategyData.totalEstimatedHours === 'number') {
        createData.totalEstimatedHours = strategyData.totalEstimatedHours ?? strategyData.estimatedTotalHours
      }
      
      console.log('💰 Creating strategy with calculated costs:', {
        costUSD: createData.calculatedCostUSD,
        costLocal: createData.calculatedCostLocal,
        currency: createData.currencyCode,
        hours: createData.totalEstimatedHours
      })
      
      return await prisma.riskMitigationStrategy.create({
        data: createData
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

