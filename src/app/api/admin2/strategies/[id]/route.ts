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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    if (!validateId(params.id)) {
      return createErrorResponse('Invalid strategy ID', 400, 'INVALID_ID')
    }

    const strategyData = await request.json()
    console.log('🛡️ Updating strategy:', params.id, strategyData.name)
    
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
    
    const updatedStrategy = await withDatabase(async () => {
      const prisma = getPrismaClient()
      
      // Prepare update data - only include fields that exist in the Prisma schema
      const updateData: any = {
        name: strategyData.name,
        description: strategyData.description,
        applicableRisks: safeJsonStringify(strategyData.applicableRisks || []),
        applicableBusinessTypes: safeJsonStringify(strategyData.applicableBusinessTypes || []),
        isActive: strategyData.isActive ?? true,
        updatedAt: new Date()
      }
      
      // Optional fields that exist in schema - only set if provided
      if (strategyData.smeTitle !== undefined) {
        updateData.smeTitle = strategyData.smeTitle
      }
      if (strategyData.smeSummary !== undefined) {
        updateData.smeSummary = strategyData.smeSummary
      }
      if (strategyData.smeDescription !== undefined) {
        updateData.smeDescription = strategyData.smeDescription
      }
      if (strategyData.whyImportant !== undefined) {
        updateData.whyImportant = strategyData.whyImportant
      }
      if (strategyData.benefitsBullets !== undefined) {
        updateData.benefitsBullets = typeof strategyData.benefitsBullets === 'string' 
          ? strategyData.benefitsBullets 
          : safeJsonStringify(strategyData.benefitsBullets)
      }
      if (strategyData.realWorldExample !== undefined) {
        updateData.realWorldExample = strategyData.realWorldExample
      }
      if (strategyData.selectionTier !== undefined) {
        updateData.selectionTier = strategyData.selectionTier
      }
      if (strategyData.requiredForRisks !== undefined) {
        updateData.requiredForRisks = typeof strategyData.requiredForRisks === 'string'
          ? strategyData.requiredForRisks
          : safeJsonStringify(strategyData.requiredForRisks || [])
      }
      if (strategyData.helpfulTips !== undefined) {
        updateData.helpfulTips = typeof strategyData.helpfulTips === 'string'
          ? strategyData.helpfulTips
          : safeJsonStringify(strategyData.helpfulTips || [])
      }
      if (strategyData.commonMistakes !== undefined) {
        updateData.commonMistakes = typeof strategyData.commonMistakes === 'string'
          ? strategyData.commonMistakes
          : safeJsonStringify(strategyData.commonMistakes || [])
      }
      if (strategyData.successMetrics !== undefined) {
        updateData.successMetrics = typeof strategyData.successMetrics === 'string'
          ? strategyData.successMetrics
          : safeJsonStringify(strategyData.successMetrics || [])
      }
      if (strategyData.lowBudgetAlternative !== undefined) {
        updateData.lowBudgetAlternative = strategyData.lowBudgetAlternative
      }
      
      // Calculated costs (from frontend calculation)
      if (typeof strategyData.calculatedCostUSD === 'number') {
        updateData.calculatedCostUSD = strategyData.calculatedCostUSD
      }
      if (typeof strategyData.calculatedCostLocal === 'number') {
        updateData.calculatedCostLocal = strategyData.calculatedCostLocal
      }
      if (strategyData.currencyCode !== undefined) {
        updateData.currencyCode = strategyData.currencyCode
      }
      if (strategyData.currencySymbol !== undefined) {
        updateData.currencySymbol = strategyData.currencySymbol
      }
      if (typeof strategyData.totalEstimatedHours === 'number') {
        updateData.totalEstimatedHours = strategyData.totalEstimatedHours
      }
      
      console.log('💰 Saving calculated costs:', {
        costUSD: updateData.calculatedCostUSD,
        costLocal: updateData.calculatedCostLocal,
        currency: updateData.currencyCode,
        hours: updateData.totalEstimatedHours
      })
      
      // Update existing database strategy and include action steps in response
      return await prisma.riskMitigationStrategy.update({
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
    }, 'PUT /api/admin2/strategies/[id]')
    
    // Transform response using shared transformer
    const transformedStrategy = transformStrategyForApi(updatedStrategy)
    
    console.log('🛡️ Strategy updated successfully:', transformedStrategy.name, 'with', transformedStrategy.actionSteps?.length || 0, 'action steps')
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    if (!validateId(params.id)) {
      return createErrorResponse('Invalid strategy ID', 400, 'INVALID_ID')
    }
    
    const strategy = await withDatabase(async () => {
      const prisma = getPrismaClient()
      return await prisma.riskMitigationStrategy.findUnique({
        where: { id: params.id, isActive: true }
      })
    }, 'GET /api/admin2/strategies/[id]')
    
    if (!strategy) {
      return createErrorResponse('Strategy not found', 404, 'NOT_FOUND')
    }
    
    // Transform response using shared transformer
    const transformedStrategy = transformStrategyForApi(strategy)
    
    console.log('🛡️ Strategy fetched successfully:', transformedStrategy.name)
    return createSuccessResponse(transformedStrategy)
    
  } catch (error) {
    return handleApiError(error, 'Failed to fetch strategy')
  }
}
