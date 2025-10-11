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
import { transformParishForApi } from '@/lib/admin2/transformers'
import { validateParishData } from '@/lib/admin2/validation'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    if (!validateId(params.id)) {
      return createErrorResponse('Invalid parish ID', 400, 'INVALID_ID')
    }

    const parishData = await request.json()
    console.log('🏝️ Parish API received update request for:', params.id, parishData.name)
    
    // Validate input data
    const validation = validateParishData(parishData)
    if (!validation.isValid) {
      return createErrorResponse(
        'Invalid parish data', 
        400, 
        'VALIDATION_ERROR', 
        validation.errors
      )
    }
    
    const result = await withDatabase(async () => {
      const prisma = getPrismaClient()
      
      // Update the parish basic info
      const updatedParish = await prisma.parish.update({
        where: { id: params.id },
        data: {
          name: parishData.name,
          region: parishData.region,
          population: parishData.population
        }
      })

      // Update or create the risk profile - SAVE ALL RISK DATA AS JSON
      const riskData = parishData.riskProfile
      console.log('🏝️ Parish API: Saving complete risk profile as JSON:', JSON.stringify(riskData, null, 2))
      
      const updatedRisk = await prisma.parishRisk.upsert({
        where: { parishId: params.id },
        update: {
          // Save basic risks in individual columns for backward compatibility
          hurricaneLevel: riskData.hurricane?.level || 0,
          hurricaneNotes: riskData.hurricane?.notes || '',
          floodLevel: riskData.flood?.level || 0,
          floodNotes: riskData.flood?.notes || '',
          earthquakeLevel: riskData.earthquake?.level || 0,
          earthquakeNotes: riskData.earthquake?.notes || '',
          droughtLevel: riskData.drought?.level || 0,
          droughtNotes: riskData.drought?.notes || '',
          landslideLevel: riskData.landslide?.level || 0,
          landslideNotes: riskData.landslide?.notes || '',
          powerOutageLevel: riskData.powerOutage?.level || 0,
          powerOutageNotes: riskData.powerOutage?.notes || '',
          
          // CRITICAL: Save the COMPLETE risk profile as JSON to preserve ALL additional risks
          riskProfileJson: safeJsonStringify(riskData),
          
          lastUpdated: new Date(),
          updatedBy: riskData.updatedBy || 'Admin User'
        },
        create: {
          parishId: params.id,
          hurricaneLevel: riskData.hurricane?.level || 0,
          hurricaneNotes: riskData.hurricane?.notes || '',
          floodLevel: riskData.flood?.level || 0,
          floodNotes: riskData.flood?.notes || '',
          earthquakeLevel: riskData.earthquake?.level || 0,
          earthquakeNotes: riskData.earthquake?.notes || '',
          droughtLevel: riskData.drought?.level || 0,
          droughtNotes: riskData.drought?.notes || '',
          landslideLevel: riskData.landslide?.level || 0,
          landslideNotes: riskData.landslide?.notes || '',
          powerOutageLevel: riskData.powerOutage?.level || 0,
          powerOutageNotes: riskData.powerOutage?.notes || '',
          
          // CRITICAL: Save the COMPLETE risk profile as JSON to preserve ALL additional risks
          riskProfileJson: safeJsonStringify(riskData),
          
          lastUpdated: new Date(),
          updatedBy: riskData.updatedBy || 'Admin User'
        }
      })

      // Return the updated parish with risk data for transformation
      return {
        ...updatedParish,
        parishRisk: updatedRisk
      }
    }, 'PUT /api/admin2/parishes/[id]')

    // Transform the result using the shared transformer
    const transformedResult = transformParishForApi(result)
    
    console.log('🏝️ Parish API successfully updated:', transformedResult.name)
    return createSuccessResponse(transformedResult)
    
  } catch (error) {
    return handleApiError(error, 'Failed to update parish')
  }
}