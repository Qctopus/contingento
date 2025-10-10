import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Risk level mappings
const FREQUENCY_TO_LIKELIHOOD: Record<string, string> = {
  'rare': 'rare',
  'unlikely': 'unlikely', 
  'possible': 'possible',
  'likely': 'likely',
  'almost_certain': 'almost_certain'
}

const IMPACT_TO_SEVERITY: Record<string, string> = {
  'minimal': 'minimal',
  'minor': 'minor',
  'moderate': 'moderate', 
  'major': 'major',
  'catastrophic': 'catastrophic'
}

const RISK_LEVELS: Record<string, number> = {
  'low': 1,
  'medium': 2,
  'high': 3,
  'very_high': 4
}

const LIKELIHOOD_SCORES: Record<string, number> = {
  'rare': 1,
  'unlikely': 2,
  'possible': 3,
  'likely': 4,
  'almost_certain': 5
}

const SEVERITY_SCORES: Record<string, number> = {
  'minimal': 1,
  'minor': 2,
  'moderate': 3,
  'major': 4,
  'catastrophic': 5
}

// Calculate risk level from likelihood and severity
function calculateRiskLevel(likelihood: string, severity: string): string {
  const likelihoodScore = LIKELIHOOD_SCORES[likelihood] || 3
  const severityScore = SEVERITY_SCORES[severity] || 3
  const riskScore = likelihoodScore * severityScore

  if (riskScore >= 16) return 'very_high'
  if (riskScore >= 9) return 'high' 
  if (riskScore >= 4) return 'medium'
  return 'low'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hazardIds, businessTypeId, countryCode, parish, nearCoast, urbanArea } = body

    if (!hazardIds || !Array.isArray(hazardIds) || !businessTypeId) {
      return NextResponse.json(
        { error: 'hazardIds (array) and businessTypeId are required' },
        { status: 400 }
      )
    }

    // Get business type with hazard mappings
    const businessType = await (prisma as any).adminBusinessType.findUnique({
      where: { businessTypeId },
      include: {
        businessTypeHazards: {
          include: {
            hazard: {
              include: {
                hazardStrategies: {
                  include: {
                    strategy: true
                  },
                  where: { isActive: true }
                }
              }
            }
          },
          where: { 
            isActive: true,
            hazardId: { in: hazardIds }
          }
        }
      }
    })

    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type not found' },
        { status: 404 }
      )
    }

    // Get location data for risk modifiers - USE NEW PARISH SYSTEM
    let parishData = null
    if (parish) {
      console.log('🔍 get-risk-calculations: Looking up parish:', parish)
      parishData = await (prisma as any).parish.findFirst({
        where: {
          OR: [
            { id: parish },  // Try by ID first
            { name: parish } // Fallback to name
          ]
        },
        include: {
          parishRisk: true
        }
      })
      
      if (parishData) {
        console.log('✅ get-risk-calculations: Found parish:', parishData.name)
      } else {
        console.log('⚠️ get-risk-calculations: Parish not found')
      }
    }

    // Process each hazard and calculate risks
    const riskCalculations = []
    const allStrategies = new Map()

    for (const hazardId of hazardIds) {
      // Find business type hazard mapping
      const businessTypeHazard = businessType.businessTypeHazards.find(
        (bth: any) => bth.hazardId === hazardId
      )

      if (!businessTypeHazard) {
        // Check if we have parish risk data for this hazard (including DYNAMIC risk types)
        let parishRiskLevel = 0
        if (parishData?.parishRisk) {
          const parishRisk = parishData.parishRisk
          
          // FIRST: Try hardcoded fields for backward compatibility
          switch (hazardId) {
            case 'hurricane':
              parishRiskLevel = parishRisk.hurricaneLevel || 0
              break
            case 'flood':
            case 'flooding':
              parishRiskLevel = parishRisk.floodLevel || 0
              break
            case 'earthquake':
              parishRiskLevel = parishRisk.earthquakeLevel || 0
              break
            case 'drought':
              parishRiskLevel = parishRisk.droughtLevel || 0
              break
            case 'landslide':
              parishRiskLevel = parishRisk.landslideLevel || 0
              break
            case 'power_outage':
            case 'powerOutage':
              parishRiskLevel = parishRisk.powerOutageLevel || 0
              break
            default:
              // SECOND: Try dynamic risks from riskProfileJson (cyber_attack, pandemic, etc.)
              if (parishRisk.riskProfileJson) {
                try {
                  const dynamicRisks = typeof parishRisk.riskProfileJson === 'string' 
                    ? JSON.parse(parishRisk.riskProfileJson) 
                    : parishRisk.riskProfileJson
                  
                  // Try both snake_case and camelCase formats (cyber_attack vs cyberAttack)
                  const camelCaseKey = hazardId.replace(/_([a-z])/g, (g: string) => g[1].toUpperCase())
                  const riskData = dynamicRisks[hazardId] || dynamicRisks[camelCaseKey]
                  
                  if (riskData && riskData.level !== undefined) {
                    parishRiskLevel = riskData.level || 0
                    console.log(`  ✅ get-risk-calculations: Found dynamic parish risk ${hazardId} (${riskData === dynamicRisks[hazardId] ? 'snake_case' : 'camelCase'}) = ${parishRiskLevel}`)
                  }
                } catch (error) {
                  console.error(`  ⚠️ Failed to parse riskProfileJson for ${hazardId}:`, error)
                }
              }
          }
        }
        
        // Determine if this risk should be pre-selected or just available
        const isPreSelected = parishRiskLevel > 0
        
        if (isPreSelected) {
          // Parish has significant risk data - pre-select this risk
          let parishLikelihoodScore = 1
          if (parishRiskLevel >= 9) parishLikelihoodScore = 5  // almost_certain
          else if (parishRiskLevel >= 7) parishLikelihoodScore = 4  // likely
          else if (parishRiskLevel >= 5) parishLikelihoodScore = 3  // possible
          else if (parishRiskLevel >= 3) parishLikelihoodScore = 2  // unlikely
          else parishLikelihoodScore = 1  // rare
          
          const parishLikelihood = Object.keys(LIKELIHOOD_SCORES).find(
            key => LIKELIHOOD_SCORES[key] === parishLikelihoodScore
          ) || 'possible'
          
          const calculatedRiskLevel = calculateRiskLevel(parishLikelihood, 'moderate')
          
          riskCalculations.push({
            hazardId,
            hazardName: hazardId.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            likelihood: parishLikelihood,
            severity: 'moderate',
            riskLevel: calculatedRiskLevel,
            reasoning: `Based on ${parishData.name} parish risk data (level ${parishRiskLevel}/10). No specific business type vulnerability data available, using moderate impact assumption.`,
            confidence: 'medium',
            isCalculated: true,
            isPreSelected: true,
            dataSource: 'parish_only',
            locationModifier: `${parishData.name} parish risk data (level ${parishRiskLevel}/10)`,
            environmentalModifiers: []
          })
        } else {
          // Parish has no/low risk data - make available but not pre-selected
          riskCalculations.push({
            hazardId,
            hazardName: hazardId.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            likelihood: 'possible',
            severity: 'moderate',
            riskLevel: 'not_applicable',
            reasoning: `This risk is not significant in ${parishData?.name || 'this location'} (parish risk level: ${parishRiskLevel}/10). Available for manual selection if you believe it applies to your situation.`,
            confidence: 'low',
            isCalculated: false,
            isPreSelected: false,
            dataSource: 'available'
          })
        }
        continue
      }

      const hazard = businessTypeHazard.hazard

      // Start with base values from business type hazard mapping
      let baseLikelihood = businessTypeHazard.frequency || hazard.frequency || 'possible'
      let baseSeverity = businessTypeHazard.impact || hazard.impact || 'moderate'
      let baseRiskLevel = businessTypeHazard.riskLevel || 'medium'

      // Apply location modifiers from Parish risk data
      let locationModifier = ''
      let parishRiskLevel = 0
      
      if (parishData?.parishRisk) {
        const parishRisk = parishData.parishRisk
        
        // Map hazardId to parishRisk field (0-10 scale)
        switch (hazardId) {
          case 'hurricane':
            parishRiskLevel = parishRisk.hurricaneLevel || 0
            break
          case 'flood':
          case 'flooding':
            parishRiskLevel = parishRisk.floodLevel || 0
            break
          case 'earthquake':
            parishRiskLevel = parishRisk.earthquakeLevel || 0
            break
          case 'drought':
            parishRiskLevel = parishRisk.droughtLevel || 0
            break
          case 'landslide':
            parishRiskLevel = parishRisk.landslideLevel || 0
            break
          case 'power_outage':
          case 'powerOutage':
            parishRiskLevel = parishRisk.powerOutageLevel || 0
            break
        }
        
        // Convert parish risk level (0-10) to likelihood score (1-5)
        // 0 = not set/no data, 1-2 = rare, 3-4 = unlikely, 5-6 = possible, 7-8 = likely, 9-10 = almost_certain
        if (parishRiskLevel > 0) {
          let parishLikelihoodScore = 1
          if (parishRiskLevel >= 9) parishLikelihoodScore = 5  // almost_certain
          else if (parishRiskLevel >= 7) parishLikelihoodScore = 4  // likely
          else if (parishRiskLevel >= 5) parishLikelihoodScore = 3  // possible
          else if (parishRiskLevel >= 3) parishLikelihoodScore = 2  // unlikely
          else parishLikelihoodScore = 1  // rare
          
          const baseLikelihoodScore = LIKELIHOOD_SCORES[baseLikelihood] || 3
          
          if (parishLikelihoodScore > baseLikelihoodScore) {
            locationModifier = `increased due to ${parishData.name} parish risk data (level ${parishRiskLevel}/10)`
            baseLikelihood = Object.keys(LIKELIHOOD_SCORES).find(
              key => LIKELIHOOD_SCORES[key] === parishLikelihoodScore
            ) || baseLikelihood
          } else if (parishLikelihoodScore < baseLikelihoodScore) {
            locationModifier = `reduced due to ${parishData.name} parish risk data (level ${parishRiskLevel}/10)`
            baseLikelihood = Object.keys(LIKELIHOOD_SCORES).find(
              key => LIKELIHOOD_SCORES[key] === parishLikelihoodScore
            ) || baseLikelihood
          } else {
            locationModifier = `confirmed by ${parishData.name} parish risk data (level ${parishRiskLevel}/10)`
          }
        } else {
          console.log(`  ${hazardId}: No parish risk data set (level = 0), using business type default`)
        }
      }

      // Apply environmental modifiers
      let environmentalModifiers = []
      if (nearCoast && ['hurricane', 'flooding', 'storm_surge', 'coastal_erosion'].includes(hazardId)) {
        environmentalModifiers.push('coastal exposure')
        if (LIKELIHOOD_SCORES[baseLikelihood] < 5) {
          const newScore = Math.min(5, LIKELIHOOD_SCORES[baseLikelihood] + 1)
          baseLikelihood = Object.keys(LIKELIHOOD_SCORES).find(
            key => LIKELIHOOD_SCORES[key] === newScore
          ) || baseLikelihood
        }
      }

      if (urbanArea && ['crime_theft', 'supply_chain_disruption', 'fire'].includes(hazardId)) {
        environmentalModifiers.push('urban environment')
        if (LIKELIHOOD_SCORES[baseLikelihood] < 5) {
          const newScore = Math.min(5, LIKELIHOOD_SCORES[baseLikelihood] + 1)
          baseLikelihood = Object.keys(LIKELIHOOD_SCORES).find(
            key => LIKELIHOOD_SCORES[key] === newScore
          ) || baseLikelihood
        }
      }

      // Calculate final risk level
      const calculatedRiskLevel = calculateRiskLevel(baseLikelihood, baseSeverity)

      // Build reasoning
      let reasoning = `Based on ${businessType.name} vulnerability data`
      if (locationModifier) {
        reasoning += `, ${locationModifier}`
      }
      if (environmentalModifiers.length > 0) {
        reasoning += `, ${environmentalModifiers.join(' and ')} increases risk`
      }

      // Determine confidence level
      let confidence = 'high'
      if (!businessTypeHazard.frequency || !businessTypeHazard.impact) {
        confidence = 'medium'
      }
      if (!parishData?.parishRisk || parishRiskLevel === 0) {
        confidence = 'medium' // Lower confidence when no parish risk data
      }

      // Determine if this risk should be pre-selected
      // Pre-select if parish has significant risk data (level > 0) OR if it's a high-confidence calculation
      const shouldPreSelect = (parishRiskLevel > 0) || (confidence === 'high' && calculatedRiskLevel !== 'low')
      
      riskCalculations.push({
        hazardId,
        hazardName: hazard.name,
        likelihood: baseLikelihood,
        severity: baseSeverity,
        riskLevel: calculatedRiskLevel,
        reasoning,
        confidence,
        isCalculated: true,
        isPreSelected: shouldPreSelect,
        dataSource: 'admin_configured',
        locationModifier: locationModifier || null,
        environmentalModifiers
      })

      // Collect strategies for this hazard
      hazard.hazardStrategies?.forEach((hs: any) => {
        const strategy = hs.strategy
        const key = strategy.strategyId

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
          if (!allStrategies.has(key)) {
            // Calculate effectiveness based on risk level and strategy priority
            const effectiveness = calculateStrategyEffectiveness(
              calculatedRiskLevel, 
              hs.priority, 
              strategy.category
            )

            allStrategies.set(key, {
              strategyId: strategy.strategyId,
              title: strategy.title,
              description: strategy.description,
              category: strategy.category,
              hazards: [hazardId],
              priority: hs.priority,
              effectiveness,
              isRecommended: hs.isRecommended,
              reasoning: strategy.reasoning || `Effective ${strategy.category} strategy for ${hazard.name.toLowerCase()}`,
              worksWellWith: [], // To be populated by compatibility analysis
              conflictsWith: []   // To be populated by compatibility analysis
            })
          } else {
            // Add this hazard to existing strategy
            const existingStrategy = allStrategies.get(key)
            if (!existingStrategy.hazards.includes(hazardId)) {
              existingStrategy.hazards.push(hazardId)
              // Recalculate effectiveness for multi-hazard strategies
              existingStrategy.effectiveness = Math.min(100, existingStrategy.effectiveness + 10)
            }
          }
        }
      })
    }

    // Convert strategies map to array and group by category
    const strategiesArray = Array.from(allStrategies.values())
    
    // Analyze strategy compatibility
    strategiesArray.forEach(strategy => {
      strategy.worksWellWith = findCompatibleStrategies(strategy, strategiesArray)
      strategy.conflictsWith = findConflictingStrategies(strategy, strategiesArray)
    })

    // Group strategies by category
    const groupedStrategies = {
      prevention: strategiesArray.filter(s => s.category === 'prevention').sort((a, b) => b.effectiveness - a.effectiveness),
      response: strategiesArray.filter(s => s.category === 'response').sort((a, b) => b.effectiveness - a.effectiveness),
      recovery: strategiesArray.filter(s => s.category === 'recovery').sort((a, b) => b.effectiveness - a.effectiveness)
    }

    return NextResponse.json({
      riskCalculations: riskCalculations.sort((a, b) => {
        const aScore = RISK_LEVELS[a.riskLevel] || 2
        const bScore = RISK_LEVELS[b.riskLevel] || 2
        return bScore - aScore
      }),
      strategies: groupedStrategies,
      metadata: {
        businessTypeName: businessType.name,
        locationFound: !!parishData,
        parishName: parishData?.name || null,
        totalStrategies: strategiesArray.length,
        highConfidenceCalculations: riskCalculations.filter(r => r.confidence === 'high').length,
        dataQuality: calculateDataQuality(riskCalculations)
      }
    })

  } catch (error) {
    console.error('Error calculating risks:', error)
    return NextResponse.json(
      { error: 'Failed to calculate risks' },
      { status: 500 }
    )
  }
}

// Helper function to calculate strategy effectiveness
function calculateStrategyEffectiveness(riskLevel: string, priority: string, category: string): number {
  const riskScore = RISK_LEVELS[riskLevel] || 2
  const priorityMultiplier = {
    'high': 1.0,
    'medium': 0.8,
    'low': 0.6
  }[priority] || 0.8

  const categoryMultiplier = {
    'prevention': 1.0,
    'response': 0.9,
    'recovery': 0.8
  }[category] || 0.8

  return Math.round(riskScore * priorityMultiplier * categoryMultiplier * 20)
}

// Helper function to find compatible strategies
function findCompatibleStrategies(strategy: any, allStrategies: any[]): string[] {
  const compatible = []
  
  // Strategies in the same category often work well together
  if (strategy.category === 'prevention') {
    const otherPrevention = allStrategies.filter(s => 
      s.category === 'prevention' && s.strategyId !== strategy.strategyId
    )
    compatible.push(...otherPrevention.slice(0, 2).map(s => s.strategyId))
  }

  return compatible
}

// Helper function to find conflicting strategies
function findConflictingStrategies(strategy: any, allStrategies: any[]): string[] {
  const conflicts: string[] = []
  
  // Example: Some strategies might conflict (this would be configurable in real system)
  // For now, return empty array
  return conflicts
}

// Helper function to calculate overall data quality
function calculateDataQuality(calculations: any[]): string {
  const highConfidence = calculations.filter(c => c.confidence === 'high').length
  const percentage = (highConfidence / calculations.length) * 100

  if (percentage >= 80) return 'excellent'
  if (percentage >= 60) return 'good'
  if (percentage >= 40) return 'fair'
  return 'limited'
} 