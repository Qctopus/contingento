import { prisma } from '@/lib/prisma'

interface LocationData {
  country?: string
  countryCode?: string
  parish?: string
  adminUnitId?: string
  nearCoast?: boolean
  urbanArea?: boolean
}

interface BusinessData {
  industryType?: string
  businessPurpose?: string
  productsServices?: string
}

interface RiskAssessment {
  hazard: string
  likelihood: string
  severity: string
  riskScore: number
  riskLevel: string
  source: 'business_type' | 'location' | 'combined'
}

interface DynamicPreFillData {
  businessType: any
  location: LocationData
  riskAssessments: RiskAssessment[]
  recommendedStrategies: {
    prevention: string[]
    response: string[]
    recovery: string[]
  }
  preFilledFields: any
}

// Risk level calculations
const RISK_SCORE_MAPPINGS = {
  'almost_certain': 5,
  'likely': 4,
  'possible': 3,
  'unlikely': 2,
  'rare': 1
} as const

const IMPACT_SCORE_MAPPINGS = {
  'catastrophic': 5,
  'major': 4,
  'moderate': 3,
  'minor': 2,
  'minimal': 1
} as const

const calculateRiskScore = (frequency: string, impact: string): number => {
  const freqScore = RISK_SCORE_MAPPINGS[frequency as keyof typeof RISK_SCORE_MAPPINGS] || 3
  const impactScore = IMPACT_SCORE_MAPPINGS[impact as keyof typeof IMPACT_SCORE_MAPPINGS] || 3
  return freqScore * impactScore
}

const getRiskLevel = (score: number): string => {
  if (score >= 20) return 'very_high'
  if (score >= 15) return 'high'
  if (score >= 8) return 'medium'
  if (score >= 4) return 'low'
  return 'very_low'
}

// Location-based risk modifiers
const applyLocationModifiers = (
  baseRisk: any,
  location: LocationData
): { frequency: string; impact: string } => {
  let frequency = baseRisk.frequency || baseRisk.hazard.defaultFrequency
  let impact = baseRisk.impact || baseRisk.hazard.defaultImpact

  const hazardId = baseRisk.hazardId || baseRisk.hazard.hazardId

  // Coastal modifiers
  if (location.nearCoast) {
    if (['hurricane', 'storm_surge', 'coastal_flooding', 'tsunami'].includes(hazardId)) {
      frequency = increaseRiskLevel(frequency)
      impact = increaseRiskLevel(impact)
    }
  }

  // Urban modifiers
  if (location.urbanArea) {
    if (['power_outage', 'infrastructure_failure', 'cyber_attack', 'crime'].includes(hazardId)) {
      frequency = increaseRiskLevel(frequency)
    }
    if (['fire', 'traffic_disruption'].includes(hazardId)) {
      impact = increaseRiskLevel(impact)
    }
  }

  // Country/region specific modifiers
  if (location.countryCode === 'JM') { // Jamaica
    if (['hurricane', 'earthquake'].includes(hazardId)) {
      frequency = increaseRiskLevel(frequency)
    }
  }

  return { frequency, impact }
}

const increaseRiskLevel = (currentLevel: string): string => {
  const levels = ['rare', 'unlikely', 'possible', 'likely', 'almost_certain']
  const impactLevels = ['minimal', 'minor', 'moderate', 'major', 'catastrophic']
  
  if (levels.includes(currentLevel)) {
    const index = levels.indexOf(currentLevel)
    return levels[Math.min(index + 1, levels.length - 1)]
  }
  
  if (impactLevels.includes(currentLevel)) {
    const index = impactLevels.indexOf(currentLevel)
    return impactLevels[Math.min(index + 1, impactLevels.length - 1)]
  }
  
  return currentLevel
}

// Main function to generate dynamic pre-fill data
export const generateDynamicPreFillData = async (
  businessTypeId: string,
  location: LocationData
): Promise<DynamicPreFillData | null> => {
  try {
    // Get business type with its hazard mappings
    const businessType = await prisma.adminBusinessType.findUnique({
      where: { businessTypeId, isActive: true },
      include: {
        businessTypeHazards: {
          where: { isActive: true },
          include: { hazard: true }
        }
      }
    })

    if (!businessType) {
      console.warn(`Business type ${businessTypeId} not found`)
      return null
    }

    // Get location-specific hazards if location data is available
    let locationHazards: any[] = []
    if (location.countryCode) {
      const locationRecord = await prisma.adminLocation.findFirst({
        where: {
          countryCode: location.countryCode,
          parish: location.parish || undefined,
          isActive: true
        },
        include: {
          locationHazards: {
            where: { isActive: true },
            include: { hazard: true }
          }
        }
      })

      if (locationRecord) {
        locationHazards = locationRecord.locationHazards
      }
    }

    // Combine business type and location hazards
    const combinedHazards = new Map()

    // Add business type hazards
    businessType.businessTypeHazards.forEach(bth => {
      const modifiedRisk = applyLocationModifiers(bth, location)
      combinedHazards.set(bth.hazardId, {
        ...bth,
        ...modifiedRisk,
        source: 'business_type'
      })
    })

    // Add/modify with location-specific hazards
    locationHazards.forEach(lh => {
      const existing = combinedHazards.get(lh.hazardId)
      if (existing) {
        // Location can increase risk level
        const newFrequency = increaseRiskLevel(existing.frequency)
        const newImpact = increaseRiskLevel(existing.impact)
        combinedHazards.set(lh.hazardId, {
          ...existing,
          frequency: newFrequency,
          impact: newImpact,
          source: 'combined'
        })
      } else {
        // Add new location-specific hazard
        const modifiedRisk = applyLocationModifiers(lh, location)
        combinedHazards.set(lh.hazardId, {
          ...lh,
          ...modifiedRisk,
          source: 'location'
        })
      }
    })

    // Generate risk assessments
    const riskAssessments: RiskAssessment[] = Array.from(combinedHazards.values()).map(hazardRisk => {
      const riskScore = calculateRiskScore(hazardRisk.frequency, hazardRisk.impact)
      const riskLevel = getRiskLevel(riskScore)
      
      return {
        hazard: hazardRisk.hazard.name,
        likelihood: hazardRisk.frequency,
        severity: hazardRisk.impact,
        riskScore,
        riskLevel,
        source: hazardRisk.source
      }
    })

    // Get recommended strategies based on identified hazards
    const hazardIds = Array.from(combinedHazards.keys())
    const recommendedStrategies = await getRecommendedStrategies(hazardIds, businessTypeId)

    // Build pre-filled fields
    const preFilledFields = buildPreFilledFields(businessType, riskAssessments, recommendedStrategies)

    return {
      businessType,
      location,
      riskAssessments,
      recommendedStrategies,
      preFilledFields
    }

  } catch (error) {
    console.error('Error generating dynamic pre-fill data:', error)
    return null
  }
}

// Get strategies recommended for specific hazards and business type
const getRecommendedStrategies = async (
  hazardIds: string[],
  businessTypeId: string
) => {
  const strategies = await prisma.adminHazardStrategy.findMany({
    where: {
      hazardId: { in: hazardIds },
      isActive: true,
      OR: [
        { businessTypes: null }, // Applies to all business types
        { businessTypes: { contains: businessTypeId } } // Specific to this business type
      ]
    },
    include: {
      strategy: true
    },
    orderBy: [
      { priority: 'desc' },
      { isRecommended: 'desc' }
    ]
  })

  const categorizedStrategies = {
    prevention: [] as string[],
    response: [] as string[],
    recovery: [] as string[]
  }

  strategies.forEach(hs => {
    const category = hs.strategy.category as keyof typeof categorizedStrategies
    if (category && categorizedStrategies[category]) {
      if (!categorizedStrategies[category].includes(hs.strategy.strategyId)) {
        categorizedStrategies[category].push(hs.strategy.strategyId)
      }
    }
  })

  return categorizedStrategies
}

// Build pre-filled fields structure
const buildPreFilledFields = (
  businessType: any,
  riskAssessments: RiskAssessment[],
  strategies: any
) => {
  return {
    BUSINESS_OVERVIEW: {
      'Business Purpose': businessType.exampleBusinessPurposes ? 
        JSON.parse(businessType.exampleBusinessPurposes)[0] : '',
      'Products and Services': businessType.exampleProducts ? 
        JSON.parse(businessType.exampleProducts)[0] : '',
      'Key Personnel Involved': businessType.exampleKeyPersonnel ? 
        JSON.parse(businessType.exampleKeyPersonnel)[0] : '',
      'Operating Hours': businessType.typicalOperatingHours || '',
      'Minimum Resource Requirements': businessType.minimumStaff || '',
      'Customer Base': businessType.exampleCustomerBase ? 
        JSON.parse(businessType.exampleCustomerBase)[0] : ''
    },
    RISK_ASSESSMENT: {
      'Risk Assessment Matrix': riskAssessments
    },
    STRATEGIES: {
      'Business Continuity Strategies': [
        ...strategies.prevention,
        ...strategies.response,
        ...strategies.recovery
      ]
    }
  }
}

// Helper function to check if a field was pre-filled
export const isFieldDynamicallyPreFilled = (
  stepId: string,
  fieldName: string,
  currentValue: any,
  preFillData: DynamicPreFillData | null
): boolean => {
  if (!preFillData || !preFillData.preFilledFields[stepId] || !preFillData.preFilledFields[stepId][fieldName]) {
    return false
  }
  
  const preFillValue = preFillData.preFilledFields[stepId][fieldName]
  
  if (Array.isArray(preFillValue) && Array.isArray(currentValue)) {
    return JSON.stringify(preFillValue) === JSON.stringify(currentValue)
  }
  
  return preFillValue === currentValue
} 