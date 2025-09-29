import { NextRequest, NextResponse } from 'next/server'
import { 
  getPrismaClient, 
  withDatabase, 
  createSuccessResponse, 
  handleApiError 
} from '@/lib/admin2/api-utils'
import { transformBusinessTypeForApi } from '@/lib/admin2/transformers'

export async function GET() {
  try {
    const businessTypes = await withDatabase(async () => {
      const prisma = getPrismaClient()
      return await prisma.businessType.findMany({
        where: { isActive: true },
        include: {
          riskVulnerabilities: true
        },
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      })
    }, 'GET /api/admin2/business-types')

    // Transform database data to match frontend expectations
    const transformedBusinessTypes = businessTypes.map(transformBusinessTypeForApi)
    
    console.log(`🏢 Business Types GET API: Successfully fetched ${businessTypes.length} business types`)
    return createSuccessResponse(transformedBusinessTypes)
    
  } catch (error) {
    return handleApiError(error, 'Failed to fetch business types')
  }
}