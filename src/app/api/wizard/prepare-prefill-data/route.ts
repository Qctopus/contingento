import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDynamicPreFillData } from '@/services/dynamicPreFillService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessTypeId, location } = body

    if (!businessTypeId || !location) {
      return NextResponse.json(
        { error: 'businessTypeId and location are required' },
        { status: 400 }
      )
    }

    // Get business type with all related data
    const businessType = await (prisma as any).adminBusinessType.findUnique({
      where: { businessTypeId },
      include: {
        businessTypeHazards: {
          include: {
            hazard: true
          },
          where: { isActive: true }
        }
      }
    })

    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type not found' },
        { status: 404 }
      )
    }

    // Get location data if available
    let locationData = null
    if (location.countryCode) {
      locationData = await (prisma as any).adminLocation.findFirst({
        where: {
          countryCode: location.countryCode,
          parish: location.parish || null
        },
        include: {
          locationHazards: {
            include: {
              hazard: true
            },
            where: { isActive: true }
          }
        }
      })
    }

    // Parse JSON fields safely
    const parseJsonField = (field: string | null): any => {
      if (!field) return []
      try {
        return JSON.parse(field)
      } catch (e) {
        return []
      }
    }

    // Build comprehensive pre-fill data package
    const preFillData: any = {
      industry: {
        id: businessType.businessTypeId,
        name: businessType.name,
        localName: businessType.localName,
        category: businessType.category,
        description: businessType.description
      },
      location: {
        country: location.country,
        countryCode: location.countryCode,
        parish: location.parish,
        region: location.region,
        nearCoast: location.nearCoast || false,
        urbanArea: location.urbanArea || false
      },
      businessProfile: {
        dependencies: parseJsonField(businessType.dependencies),
        vulnerabilityMatrix: parseJsonField(businessType.vulnerabilityMatrix),
        operationalThresholds: parseJsonField(businessType.operationalThresholds),
        typicalOperatingHours: businessType.typicalOperatingHours,
        minimumStaff: businessType.minimumStaff,
        minimumSpace: businessType.minimumSpace
      },
      preFilledFields: {
        BUSINESS_OVERVIEW: {
          'Business Purpose': parseJsonField(businessType.exampleBusinessPurposes)[0] || '',
          'Products and Services': parseJsonField(businessType.exampleProducts)[0] || '',
          'Operating Hours': businessType.typicalOperatingHours || '',
          'Key Personnel Involved': parseJsonField(businessType.exampleKeyPersonnel)[0] || '',
          'Customer Base': parseJsonField(businessType.exampleCustomerBase)[0] || ''
        },
        ESSENTIAL_FUNCTIONS: {
          'Supply Chain Management Functions': parseJsonField(businessType.essentialFunctions)?.supply_chain || [],
          'Staff Management Functions': parseJsonField(businessType.essentialFunctions)?.staff_management || [],
          'Technology Functions': parseJsonField(businessType.essentialFunctions)?.technology || [],
          'Product and Service Delivery': parseJsonField(businessType.essentialFunctions)?.service_delivery || [],
          'Sales and Marketing Functions': parseJsonField(businessType.essentialFunctions)?.sales_marketing || [],
          'Administrative Functions': parseJsonField(businessType.essentialFunctions)?.administrative || [],
          'Infrastructure and Facilities': parseJsonField(businessType.essentialFunctions)?.infrastructure || []
        },
        // RISK_ASSESSMENT and STRATEGIES will be appended below via dynamic analysis
      },
      contextualExamples: {
        BUSINESS_OVERVIEW: {
          'Business Purpose': parseJsonField(businessType.exampleBusinessPurposes).slice(0, 3),
          'Products and Services': parseJsonField(businessType.exampleProducts).slice(0, 3),
          'Key Personnel Involved': parseJsonField(businessType.exampleKeyPersonnel).slice(0, 3),
          'Customer Base': parseJsonField(businessType.exampleCustomerBase).slice(0, 3)
        },
        ESSENTIAL_FUNCTIONS: {}
      },
      hazards: businessType.businessTypeHazards.map((bth: any) => ({
        hazardId: bth.hazard.hazardId,
        hazardName: bth.hazard.name,
        riskLevel: bth.riskLevel,
        frequency: bth.frequency || bth.hazard.frequency,
        impact: bth.impact || bth.hazard.impact,
        seasonalPattern: bth.hazard.seasonalPattern,
        warningTime: bth.hazard.warningTime,
        geographicScope: bth.hazard.geographicScope
      })),
      locationRisks: locationData?.locationHazards?.map((lh: any) => ({
        hazardId: lh.hazard.hazardId,
        hazardName: lh.hazard.name,
        locationRiskLevel: lh.riskLevel,
        notes: lh.notes
      })) || [],
      riskPreview: {
        highRiskHazards: businessType.businessTypeHazards
          .filter((bth: any) => bth.riskLevel === 'high' || bth.riskLevel === 'very_high')
          .map((bth: any) => bth.hazard.name)
          .slice(0, 5),
        totalRisks: businessType.businessTypeHazards.length,
        locationModifiers: locationData?.locationHazards?.length || 0
      },
      locationWarnings: generateLocationWarnings(location, locationData),
      metadata: {
        businessTypeName: businessType.name,
        locationFound: !!locationData,
        dataQuality: calculateDataQuality(businessType, locationData),
        generatedAt: new Date().toISOString()
      }
    }

    // Enrich with dynamic risk matrix and strategies to ensure RISK_ASSESSMENT and STRATEGIES are prefilled
    const dynamic = await generateDynamicPreFillData(businessTypeId, preFillData.location)
    if (dynamic) {
      preFillData.preFilledFields.RISK_ASSESSMENT = {
        'Risk Assessment Matrix': dynamic.riskAssessments || []
      }
      preFillData.preFilledFields.STRATEGIES = {
        'Business Continuity Strategies': [
          ...(dynamic.recommendedStrategies?.prevention || []),
          ...(dynamic.recommendedStrategies?.response || []),
          ...(dynamic.recommendedStrategies?.recovery || [])
        ]
      }
    }

    return NextResponse.json(preFillData)

  } catch (error) {
    console.error('Error preparing pre-fill data:', error)
    return NextResponse.json(
      { error: 'Failed to prepare pre-fill data' },
      { status: 500 }
    )
  }
}

// Helper function to generate location-specific warnings
function generateLocationWarnings(location: any, locationData: any): string[] {
  const warnings = []

  if (location.nearCoast) {
    warnings.push('⚠️ Coastal location: Increased risk for hurricanes, flooding, and storm surge')
  }

  if (location.urbanArea) {
    warnings.push('🏙️ Urban area: Consider traffic disruption, crime, and supply chain issues')
  }

  if (locationData?.locationHazards?.length > 0) {
    warnings.push(`📍 Location-specific risks identified: ${locationData.locationHazards.length} additional hazards`)
  }

  if (location.countryCode === 'JM' && (location.parish === 'Kingston' || location.parish === 'St. Andrew')) {
    warnings.push('🌪️ Hurricane season (June-November): Enhanced preparation recommended')
  }

  if (!locationData) {
    warnings.push('ℹ️ Limited location data: Using general Caribbean risk profiles')
  }

  return warnings
}

// Helper function to calculate data quality score
function calculateDataQuality(businessType: any, locationData: any): string {
  let score = 0
  let maxScore = 0

  // Business type data quality
  maxScore += 10
  if (businessType.description) score += 1
  if (businessType.essentialFunctions) score += 2
  if (businessType.exampleBusinessPurposes) score += 1
  if (businessType.exampleProducts) score += 1
  if (businessType.dependencies) score += 2
  if (businessType.minimumEquipment) score += 1
  if (businessType.typicalOperatingHours) score += 1
  if (businessType.businessTypeHazards?.length > 0) score += 1

  // Location data quality
  maxScore += 5
  if (locationData) score += 2
  if (locationData?.locationHazards?.length > 0) score += 3

  const percentage = (score / maxScore) * 100

  if (percentage >= 80) return 'excellent'
  if (percentage >= 60) return 'good'
  if (percentage >= 40) return 'fair'
  return 'limited'
} 