import { NextRequest, NextResponse } from 'next/server'
import {
  getPrismaClient,
  withDatabase,
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  validateId,
  safeJsonStringify
} from '@/lib/admin2/api-utils'
import { transformStrategyForApi } from '@/lib/admin2/transformers'
import { validateStrategyData } from '@/lib/admin2/validation'
import { MultilingualDataService } from '@/services/multilingualDataService'


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    if (!validateId(params.id)) {
      return createErrorResponse('Invalid strategy ID', 400, 'INVALID_ID')
    }

    const body = await request.json()
    const { translations, ...strategyData } = body
    console.log('🛡️ Updating strategy:', params.id)

    // Validate input data (skip validation for now as types changed)
    // const validation = validateStrategyData(strategyData)

    const updatedStrategy = await withDatabase(async () => {
      const prisma = getPrismaClient()
      const dataService = new MultilingualDataService(prisma)

      // Prepare update data for main table - only non-translatable fields
      const updateData: any = {
        implementationCost: strategyData.implementationCost,
        implementationTime: strategyData.implementationTime,
        estimatedTotalHours: strategyData.estimatedTotalHours,
        effectiveness: strategyData.effectiveness,
        complexityLevel: strategyData.complexityLevel,
        difficultyLevel: strategyData.difficultyLevel,
        priority: strategyData.priority,
        quickWinIndicator: strategyData.quickWinIndicator,
        defaultSelected: strategyData.defaultSelected,
        costEstimateJMD: strategyData.costEstimateJMD,
        estimatedDIYSavings: strategyData.estimatedDIYSavings,
        selectionTier: strategyData.selectionTier,
        businessContinuityPhase: strategyData.businessContinuityPhase,
        bcpSectionMapping: strategyData.bcpSectionMapping,

        // JSON fields (now native Json type, so pass objects directly)
        applicableRisks: strategyData.applicableRisks || [],
        applicableBusinessTypes: strategyData.applicableBusinessTypes || [],
        prerequisites: strategyData.prerequisites || [],
        industryVariants: strategyData.industryVariants || {},
        businessSizeGuidance: strategyData.businessSizeGuidance || {},

        isActive: strategyData.isActive ?? true,
        updatedAt: new Date()
      }

      // Update existing database strategy
      const strategy = await prisma.riskMitigationStrategy.update({
        where: { id: params.id },
        data: updateData,
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
        }
      })

      // Handle translations
      // If translations provided, use them. Otherwise fallback to 'en' from root fields
      const translationsToSave = translations || {
        en: {
          name: strategyData.name,
          description: strategyData.description,
          smeTitle: strategyData.smeTitle,
          smeSummary: strategyData.smeSummary,
          realWorldExample: strategyData.realWorldExample,
          whyImportant: strategyData.whyImportant,
          benefitsBullets: strategyData.benefitsBullets,
          helpfulTips: strategyData.helpfulTips,
          commonMistakes: strategyData.commonMistakes,
          successMetrics: strategyData.successMetrics,
          lowBudgetAlternative: strategyData.lowBudgetAlternative
        }
      }

      await dataService.updateStrategyTranslations(params.id, translationsToSave)

      return strategy
    }, 'PUT /api/admin2/strategies/[id]')

    // Transform response using shared transformer
    const transformedStrategy = transformStrategyForApi(updatedStrategy)

    console.log('🛡️ Strategy updated successfully:', transformedStrategy.name)
    return createSuccessResponse(transformedStrategy)

  } catch (error) {
    return handleApiError(error, 'Failed to update strategy')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    if (!validateId(params.id)) {
      return createErrorResponse('Invalid strategy ID', 400, 'INVALID_ID')
    }

    const result = await withDatabase(async () => {
      const prisma = getPrismaClient()

      // Check if strategy exists
      const strategy = await prisma.riskMitigationStrategy.findUnique({
        where: { id: params.id }
      })

      if (!strategy) {
        throw new Error('Strategy not found')
      }

      // Soft delete by setting isActive to false
      await prisma.riskMitigationStrategy.update({
        where: { id: params.id },
        data: { isActive: false, updatedAt: new Date() }
      })

      return strategy
    }, 'DELETE /api/admin2/strategies/[id]')

    console.log('🛡️ Strategy soft-deleted successfully:', result.name)
    return createSuccessResponse({ success: true })

  } catch (error) {
    if (error instanceof Error && error.message === 'Strategy not found') {
      return createErrorResponse('Strategy not found', 404, 'NOT_FOUND')
    }
    return handleApiError(error, 'Failed to delete strategy')
  }
}

//GET: Fetch strategy with all translations (for Admin editing)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!validateId(params.id)) {
      return createErrorResponse('Invalid strategy ID', 400, 'INVALID_ID')
    }

    return withDatabase(async (prisma) => {
      const dataService = new MultilingualDataService(prisma)
      const strategy = await dataService.getStrategyWithAllTranslations(params.id)

      if (!strategy) {
        return createErrorResponse('Strategy not found', 404, 'NOT_FOUND')
      }

      return createSuccessResponse(strategy)
    }, 'GET /api/admin2/strategies/[id]')

  } catch (error) {
    console.error('Error fetching strategy:', error)
    return handleApiError(error)
  }
}
