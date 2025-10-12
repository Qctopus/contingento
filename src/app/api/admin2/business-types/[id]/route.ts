import { NextRequest, NextResponse } from 'next/server'
import { 
  getPrismaClient, 
  withDatabase, 
  createSuccessResponse, 
  handleApiError,
  createErrorResponse,
  validateId
} from '@/lib/admin2/api-utils'
import { transformBusinessTypeForApi } from '@/lib/admin2/transformers'
import { validateBusinessTypeData } from '@/lib/admin2/validation'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    if (!validateId(params.id)) {
      return createErrorResponse('Invalid business type ID', 400, 'INVALID_ID')
    }

    const businessTypeData = await request.json()
    console.log('🏢 Updating business type:', params.id, businessTypeData.name)
    
    // Validate input data
    const validation = validateBusinessTypeData(businessTypeData)
    if (!validation.isValid) {
      return createErrorResponse(
        'Invalid business type data', 
        400, 
        'VALIDATION_ERROR', 
        validation.errors
      )
    }
    
    const result = await withDatabase(async () => {
      const prisma = getPrismaClient()
      
      // Start a transaction to update business type and its vulnerabilities
      return await prisma.$transaction(async (prisma) => {
        // Helper to stringify if needed
        const ensureString = (value: any): string | null => {
          if (!value) return null
          if (typeof value === 'string') return value
          return JSON.stringify(value)
        }

        // Update business type main data
        const updatedBusinessType = await prisma.businessType.update({
          where: { id: params.id },
          data: {
            name: ensureString(businessTypeData.name),
            category: businessTypeData.category,
            subcategory: businessTypeData.subcategory,
            description: ensureString(businessTypeData.description),
            // Multilingual example fields for wizard prefill - must be JSON strings
            exampleBusinessPurposes: ensureString(businessTypeData.exampleBusinessPurposes),
            exampleProducts: ensureString(businessTypeData.exampleProducts),
            exampleKeyPersonnel: ensureString(businessTypeData.exampleKeyPersonnel),
            exampleCustomerBase: ensureString(businessTypeData.exampleCustomerBase),
            minimumEquipment: ensureString(businessTypeData.minimumEquipment),
            updatedAt: new Date()
          }
        })

        // Update or create risk vulnerabilities if provided
        if (businessTypeData.riskVulnerabilities && Array.isArray(businessTypeData.riskVulnerabilities)) {
          // Delete existing vulnerabilities
          await prisma.businessRiskVulnerability.deleteMany({
            where: { businessTypeId: params.id }
          })

          // Create new vulnerabilities
          if (businessTypeData.riskVulnerabilities.length > 0) {
            await prisma.businessRiskVulnerability.createMany({
              data: businessTypeData.riskVulnerabilities.map((rv: any) => ({
                businessTypeId: params.id,
                riskType: rv.riskType,
                vulnerabilityLevel: rv.vulnerabilityLevel,
                impactSeverity: rv.impactSeverity
              }))
            })
          }
        }

        // Return with full relations
        return await prisma.businessType.findUnique({
          where: { id: params.id },
          include: {
            riskVulnerabilities: true
          }
        })
      })
    }, 'PUT /api/admin2/business-types/[id]')

    if (!result) {
      return createErrorResponse('Business type not found', 404, 'NOT_FOUND')
    }

    // Transform using shared transformer and add extra fields for backward compatibility
    const transformedBusinessType = {
      ...transformBusinessTypeForApi(result),
      
      // Add vulnerability levels as direct properties for backward compatibility
      hurricaneVulnerability: businessTypeData.hurricaneVulnerability,
      floodVulnerability: businessTypeData.floodVulnerability,
      earthquakeVulnerability: businessTypeData.earthquakeVulnerability,
      droughtVulnerability: businessTypeData.droughtVulnerability,
      landslideVulnerability: businessTypeData.landslideVulnerability,
      powerOutageVulnerability: businessTypeData.powerOutageVulnerability,
      
      hurricaneRecoveryImpact: businessTypeData.hurricaneRecoveryImpact,
      floodRecoveryImpact: businessTypeData.floodRecoveryImpact,
      earthquakeRecoveryImpact: businessTypeData.earthquakeRecoveryImpact,
      droughtRecoveryImpact: businessTypeData.droughtRecoveryImpact,
      landslideRecoveryImpact: businessTypeData.landslideRecoveryImpact,
      powerOutageRecoveryImpact: businessTypeData.powerOutageRecoveryImpact,
      
      essentialUtilities: businessTypeData.essentialUtilities || [],
      typicalEquipment: businessTypeData.typicalEquipment || [],
      keySupplierTypes: businessTypeData.keySupplierTypes || [],
      maximumDowntime: businessTypeData.maximumDowntime,
      strategies: businessTypeData.strategies || []
    }

    console.log('🏢 Business type updated successfully:', transformedBusinessType.name)
    return createSuccessResponse(transformedBusinessType)
    
  } catch (error) {
    return handleApiError(error, 'Failed to update business type')
  }
}