import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Risk level ordering for calculations
const RISK_LEVELS: Record<RiskLevel, number> = {
  'low': 1,
  'medium': 2,
  'high': 3,
  'very_high': 4
}

const RISK_LEVEL_NAMES: RiskLevel[] = ['low', 'medium', 'high', 'very_high']

// Coastal hazards that get amplified near coast
const COASTAL_HAZARDS = ['hurricane', 'flooding', 'storm_surge', 'coastal_erosion', 'tsunami']

// Urban hazards that get amplified in urban areas
const URBAN_HAZARDS = ['crime_theft', 'supply_chain_disruption', 'civil_unrest', 'fire', 'accident']

type RiskLevel = 'low' | 'medium' | 'high' | 'very_high'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessTypeId, countryCode, parish, nearCoast, urbanArea } = body

    if (!businessTypeId || !countryCode) {
      return NextResponse.json(
        { error: 'businessTypeId and countryCode are required' },
        { status: 400 }
      )
    }

    // Get business type with dependencies
    const businessType = await (prisma as any).adminBusinessType.findUnique({
      where: { businessTypeId },
      include: {
        AdminBusinessTypeHazard: {
          include: {
            AdminHazardType: {
              include: {
                AdminHazardStrategy: {
                  include: {
                    AdminStrategy: true
                  },
                  where: { isActive: true }
                }
              }
            }
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

    // Find matching location
    const location = await (prisma as any).adminLocation.findFirst({
      where: {
        countryCode,
        parish: parish || null
      },
      include: {
        AdminLocationHazard: {
          include: {
            AdminHazardType: true
          },
          where: { isActive: true }
        }
      }
    })

    // Create location hazard lookup
    const locationHazardMap = new Map()
    if (location) {
      location.AdminLocationHazard.forEach((lh: any) => {
        locationHazardMap.set(lh.hazardId, lh)
      })
    }

    // Get current month for seasonal analysis
    const currentMonth = new Date().getMonth() + 1 // 1-12

    // Process each hazard for this business type
    const risks = []
    const allStrategies = new Map()

    for (const businessTypeHazard of businessType.AdminBusinessTypeHazard) {
      const hazard = businessTypeHazard.AdminHazardType

      // Start with base risk from business type
      let baseRiskLevel = businessTypeHazard.riskLevel as RiskLevel
      let baseRiskScore = RISK_LEVELS[baseRiskLevel] || 2

      // Apply location modifier if available
      let locationModifier = 'none'
      let locationModifierScore = 0

      const locationHazard = locationHazardMap.get(hazard.hazardId)
      if (locationHazard) {
        const locationRiskScore = RISK_LEVELS[locationHazard.riskLevel as RiskLevel] || 2
        locationModifierScore = locationRiskScore - baseRiskScore
        locationModifier = locationHazard.riskLevel
      }

      // Apply environmental modifiers
      let environmentalModifier = 0
      const modifierReasons = []

      // Coastal modifiers
      if (nearCoast && COASTAL_HAZARDS.includes(hazard.hazardId)) {
        environmentalModifier += 1
        modifierReasons.push('coastal exposure increases risk')
      }

      // Urban modifiers  
      if (urbanArea && URBAN_HAZARDS.includes(hazard.hazardId)) {
        environmentalModifier += 1
        modifierReasons.push('urban area increases risk')
      }

      // Calculate final risk score
      let finalRiskScore = Math.max(1, Math.min(4,
        baseRiskScore + locationModifierScore + environmentalModifier
      ))

      const finalRiskLevel = RISK_LEVEL_NAMES[finalRiskScore - 1]

      // Check seasonal patterns
      let isSeasonallyActive = false
      if (hazard.peakMonths) {
        try {
          const peakMonths = JSON.parse(hazard.peakMonths)
          isSeasonallyActive = peakMonths.includes(currentMonth.toString())
        } catch (e) {
          // Handle invalid JSON gracefully
        }
      }

      // Get cascading risks
      let cascadingRisks: string[] = []
      if (hazard.cascadingRisks) {
        try {
          cascadingRisks = JSON.parse(hazard.cascadingRisks) as string[]
        } catch (e) {
          // Handle invalid JSON gracefully
        }
      }

      // Build reasoning
      let reasoning = `Base risk: ${baseRiskLevel}`
      if (locationModifier !== 'none') {
        reasoning += `, location modifier: ${locationModifier}`
      }
      if (modifierReasons.length > 0) {
        reasoning += `, ${modifierReasons.join(', ')}`
      }
      if (isSeasonallyActive) {
        reasoning += `, currently in peak season`
      }

      risks.push({
        hazardId: hazard.hazardId,
        hazardName: hazard.name,
        baseRiskLevel,
        locationModifier,
        finalRiskLevel,
        reasoning,
        isSeasonallyActive,
        cascadingRisks,
        warningTime: hazard.warningTime,
        geographicScope: hazard.geographicScope
      })

      // Collect strategies for this hazard
      hazard.AdminHazardStrategy.forEach((hs: any) => {
        const strategy = hs.AdminStrategy
        const key = strategy.strategyId

        if (!allStrategies.has(key)) {
          // Check if strategy applies to this business type
          let appliesTo = true
          if (hs.businessTypes) {
            try {
              const businessTypes = JSON.parse(hs.businessTypes)
              appliesTo = businessTypes.includes(businessTypeId)
            } catch (e) {
              // If JSON parsing fails, assume it applies
            }
          }

          if (appliesTo) {
            allStrategies.set(key, {
              strategyId: strategy.strategyId,
              title: strategy.title,
              category: strategy.category,
              hazards: [hazard.hazardId],
              priority: hs.priority,
              effectiveness: calculateEffectiveness(finalRiskScore, hs.priority),
              isRecommended: hs.isRecommended,
              reasoning: strategy.reasoning
            })
          }
        } else {
          // Add this hazard to existing strategy
          const existingStrategy = allStrategies.get(key)
          if (!existingStrategy.hazards.includes(hazard.hazardId)) {
            existingStrategy.hazards.push(hazard.hazardId)
          }
        }
      })
    }

    // Convert strategies map to array and sort by priority/effectiveness
    const strategies = Array.from(allStrategies.values()).sort((a: any, b: any) => {
      // Recommended strategies first
      if (a.isRecommended !== b.isRecommended) {
        return a.isRecommended ? -1 : 1
      }

      // Then by priority
      const priorityOrder: Record<string, number> = { 'high': 3, 'medium': 2, 'low': 1 }
      const aPriority = priorityOrder[a.priority as string] || 2
      const bPriority = priorityOrder[b.priority as string] || 2

      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      // Then by effectiveness
      return b.effectiveness - a.effectiveness
    })

    // Build business context from business type data
    const businessContext = {
      vulnerabilities: {} as any,
      criticalDependencies: [] as string[],
      typicalImpacts: [] as string[]
    }

    // Parse business type dependencies and vulnerabilities
    if (businessType.dependencies) {
      try {
        businessContext.vulnerabilities = JSON.parse(businessType.dependencies)
      } catch (e) {
        // Handle invalid JSON gracefully
      }
    }

    if (businessType.criticalSuppliers) {
      try {
        businessContext.criticalDependencies = JSON.parse(businessType.criticalSuppliers)
      } catch (e) {
        // Handle invalid JSON gracefully
      }
    }

    // Generate typical impacts based on high-risk hazards
    const highRiskHazards = risks.filter(r =>
      r.finalRiskLevel === 'high' || r.finalRiskLevel === 'very_high'
    )

    businessContext.typicalImpacts = generateTypicalImpacts(
      highRiskHazards,
      businessContext.vulnerabilities
    )

    return NextResponse.json({
      risks: risks.sort((a, b) => {
        // Sort by final risk level, then by seasonal activity
        const aScore = RISK_LEVELS[a.finalRiskLevel] + (a.isSeasonallyActive ? 0.5 : 0)
        const bScore = RISK_LEVELS[b.finalRiskLevel] + (b.isSeasonallyActive ? 0.5 : 0)
        return bScore - aScore
      }),
      strategies,
      businessContext,
      metadata: {
        locationFound: !!location,
        nearCoast,
        urbanArea,
        currentMonth,
        businessTypeName: businessType.name
      }
    })

  } catch (error) {
    console.error('Error generating smart recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

// Helper function to calculate strategy effectiveness
function calculateEffectiveness(riskScore: number, priority: string): number {
  const priorityMultiplier: Record<string, number> = {
    'high': 1.0,
    'medium': 0.8,
    'low': 0.6
  }

  const multiplier = priorityMultiplier[priority] || 0.8
  return Math.round(riskScore * multiplier * 25) // Scale to 0-100
}

// Helper function to generate typical impacts
function generateTypicalImpacts(
  highRiskHazards: any[],
  vulnerabilities: any
): string[] {
  const impacts: string[] = []

  // Standard impacts based on common vulnerabilities
  if (vulnerabilities.powerCritical >= 4) {
    impacts.push('Extended power outages could halt all operations')
  }

  if (vulnerabilities.waterIntensive >= 4) {
    impacts.push('Water supply disruption could force closure')
  }

  if (vulnerabilities.supplyChainReliant >= 4) {
    impacts.push('Supply chain disruptions could create inventory shortages')
  }

  if (vulnerabilities.perishableGoods >= 3) {
    impacts.push('Product spoilage during extended outages')
  }

  if (vulnerabilities.touristDependent >= 3) {
    impacts.push('Tourist evacuations could eliminate customer base')
  }

  // Hazard-specific impacts
  const hazardImpacts: Record<string, string> = {
    'hurricane': 'Structural damage and extended closure periods',
    'flooding': 'Equipment damage and inventory loss',
    'earthquake': 'Building damage and supply chain disruption',
    'drought': 'Water restrictions affecting operations',
    'fire': 'Total facility loss and equipment replacement needs',
    'crime_theft': 'Inventory loss and employee safety concerns'
  }

  highRiskHazards.forEach(hazard => {
    if (hazardImpacts[hazard.hazardId as string]) {
      impacts.push(hazardImpacts[hazard.hazardId as string])
    }
  })

  return Array.from(new Set(impacts)) // Remove duplicates
}