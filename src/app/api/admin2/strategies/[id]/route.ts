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
      
      // Update existing database strategy (all strategies are now in database)
      return await prisma.riskMitigationStrategy.update({
        where: { id: params.id },
        data: {
          name: strategyData.name,
          category: strategyData.category,
          description: strategyData.description,
          implementationCost: strategyData.implementationCost,
          timeToImplement: strategyData.timeToImplement,
          effectiveness: strategyData.effectiveness,
          applicableRisks: safeJsonStringify(strategyData.applicableRisks || []),
          applicableBusinessTypes: safeJsonStringify(strategyData.applicableBusinessTypes || []),
          prerequisites: safeJsonStringify(strategyData.prerequisites || []),
          maintenanceRequirement: strategyData.maintenanceRequirement,
          priority: strategyData.priority,
          isActive: strategyData.isActive ?? true,
          updatedAt: new Date()
        }
      })
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
