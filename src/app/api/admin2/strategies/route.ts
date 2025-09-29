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

export async function GET() {
  try {
    const strategies = await withDatabase(async () => {
      const prisma = getPrismaClient()
      return await prisma.riskMitigationStrategy.findMany({
        where: { isActive: true },
        include: {
          actionSteps: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      })
    }, 'GET /api/admin2/strategies')
    
    // Transform database strategies to match frontend format
    const transformedStrategies = strategies.map(transformStrategyForApi)
    
    console.log(`🛡️ Strategies GET API: Successfully fetched ${strategies.length} strategies from database`)
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
      return await prisma.riskMitigationStrategy.create({
        data: {
          strategyId: strategyData.strategyId || `custom_${Date.now()}`,
          name: strategyData.name,
          category: strategyData.category || 'preparation',
          description: strategyData.description || '',
          implementationCost: strategyData.implementationCost || 'medium',
          implementationTime: strategyData.implementationTime || 'medium',
          effectiveness: strategyData.effectiveness || 7,
          applicableRisks: safeJsonStringify(strategyData.applicableRisks || []),
          applicableBusinessTypes: safeJsonStringify(strategyData.applicableBusinessTypes || []),
          prerequisites: safeJsonStringify(strategyData.prerequisites || []),
          maintenanceRequirement: strategyData.maintenanceRequirement || 'low',
          roi: strategyData.roi || 3.0,
          priority: strategyData.priority || 'medium',
          isActive: true
        }
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

