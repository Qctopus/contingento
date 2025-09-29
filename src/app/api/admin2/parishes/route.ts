import { NextRequest, NextResponse } from 'next/server'
import { 
  getPrismaClient, 
  withDatabase, 
  createSuccessResponse, 
  handleApiError 
} from '@/lib/admin2/api-utils'
import { transformParishForApi } from '@/lib/admin2/transformers'

export async function GET() {
  try {
    const parishes = await withDatabase(async () => {
      const prisma = getPrismaClient()
      return await prisma.parish.findMany({
        where: { isActive: true },
        include: {
          parishRisk: true
        },
        orderBy: [
          { region: 'asc' },
          { name: 'asc' }
        ]
      })
    }, 'GET /api/admin2/parishes')

    // Transform data for frontend
    const transformedParishes = parishes.map(transformParishForApi)
    
    console.log(`🏝️ Parish GET API: Successfully fetched ${parishes.length} parishes`)
    return createSuccessResponse(transformedParishes)
    
  } catch (error) {
    return handleApiError(error, 'Failed to fetch parishes')
  }
}