import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

interface CalculatedRisk {
  hazardId: string
  riskLevel: string
  reasoning: string
  seasonalAdjustment: number
  coastalMultiplier: number
  cascadingRisks: string[]
}

interface RecommendedStrategy {
  strategyId: string
  priority: string
  effectiveness: number
  cost: number
  roi: number
  conflicts: string[]
}

interface RiskCalculationResponse {
  businessTypeId: string
  locationId: string
  calculatedRisks: CalculatedRisk[]
  recommendedStrategies: RecommendedStrategy[]
  riskScore: number
  lastCalculated: Date
}

// Helper function to calculate coastal risk multiplier
function calculateCoastalRiskMultiplier(location: any, hazard: any): number {
  if (!location.isCoastal) return 1.0
  
  const coastalHazards = ['hurricane', 'flood', 'storm_surge', 'tsunami']
  if (coastalHazards.includes(hazard.hazardId)) {
    return 1.5 // 50% increase for coastal hazards
  }
  
  return 1.2 // 20% increase for other hazards in coastal areas
}

// Helper function to get seasonal risk adjustment
function getSeasonalRiskAdjustment(hazard: any): number {
  if (!hazard.seasonalPattern || !hazard.peakMonths) return 1.0
  
  const currentMonth = new Date().getMonth() + 1 // 1-12
  const peakMonths = JSON.parse(hazard.peakMonths || '[]')
  
  if (peakMonths.includes(currentMonth.toString())) {
    return 1.3 // 30% increase during peak months
  }
  
  return 1.0
}

// Helper function to find strategy conflicts
function findStrategyConflicts(strategies: any[]): string[] {
  const conflicts: string[] = []
  
  // Check for evacuation vs shelter-in-place conflicts
  const evacuationStrategies = strategies.filter(s => 
    s.title.toLowerCase().includes('evacuation') || 
    s.title.toLowerCase().includes('relocate')
  )
  const shelterStrategies = strategies.filter(s => 
    s.title.toLowerCase().includes('shelter') || 
    s.title.toLowerCase().includes('secure')
  )
  
  if (evacuationStrategies.length > 0 && shelterStrategies.length > 0) {
    conflicts.push('evacuation_shelter_conflict')
  }
  
  return conflicts
}

// Helper function to calculate cascading risks
function calculateCascadingRisks(hazard: any, allHazards: any[]): string[] {
  if (!hazard.cascadingRisks) return []
  
  const cascadingHazardIds = JSON.parse(hazard.cascadingRisks)
  return cascadingHazardIds.filter((hazardId: string) => 
    allHazards.some(h => h.hazardId === hazardId)
  )
}

// Helper function to calculate strategy effectiveness based on business dependencies
function calculateStrategyEffectiveness(strategy: any, businessType: any): number {
  let effectiveness = 0.5 // Base effectiveness
  
  if (!businessType.dependencies) return effectiveness
  
  const dependencies = JSON.parse(businessType.dependencies)
  
  // Power-related strategies for power-critical businesses
  if (dependencies.powerCritical >= 4 && 
      (strategy.title.toLowerCase().includes('generator') || 
       strategy.title.toLowerCase().includes('backup power'))) {
    effectiveness += 0.3
  }
  
  // Water-related strategies for water-intensive businesses
  if (dependencies.waterIntensive >= 4 && 
      strategy.title.toLowerCase().includes('water')) {
    effectiveness += 0.2
  }
  
  // Coastal strategies for coastal businesses
  if (dependencies.coastalExposure >= 3 && 
      (strategy.title.toLowerCase().includes('elevated') || 
       strategy.title.toLowerCase().includes('flood'))) {
    effectiveness += 0.2
  }
  
  return Math.min(effectiveness, 1.0)
}

// Helper function to calculate strategy cost and ROI
function calculateStrategyCostAndROI(strategy: any, businessType: any): { cost: number, roi: number } {
  let cost = 0.5 // Base cost (0-1 scale)
  
  // Adjust cost based on business size indicators
  if (businessType.minimumStaff) {
    const staffCount = parseInt(businessType.minimumStaff) || 1
    if (staffCount > 10) cost *= 1.5
    if (staffCount > 50) cost *= 2.0
  }
  
  // High-cost strategies
  if (strategy.title.toLowerCase().includes('generator') || 
      strategy.title.toLowerCase().includes('backup')) {
    cost *= 2.0
  }
  
  // Low-cost strategies
  if (strategy.title.toLowerCase().includes('training') || 
      strategy.title.toLowerCase().includes('plan')) {
    cost *= 0.5
  }
  
  const effectiveness = calculateStrategyEffectiveness(strategy, businessType)
  const roi = effectiveness / cost
  
  return { cost, roi }
}

export async function POST(request: NextRequest) {
  try {
    const { businessTypeId, locationId } = await request.json()
    
    if (!businessTypeId || !locationId) {
      return NextResponse.json(
        { error: 'businessTypeId and locationId are required' },
        { status: 400 }
      )
    }

    // Fetch all required data
    const [businessType, location, businessTypeHazards, locationHazards, allHazards, allStrategies] = await Promise.all([
      (prisma as any).adminBusinessType.findUnique({
        where: { businessTypeId }
      }),
      (prisma as any).adminLocation.findUnique({
        where: { id: locationId }
      }),
      (prisma as any).adminBusinessTypeHazard.findMany({
        where: { businessTypeId, isActive: true },
        include: { hazard: true }
      }),
      (prisma as any).adminLocationHazard.findMany({
        where: { locationId, isActive: true },
        include: { hazard: true }
      }),
      (prisma as any).adminHazardType.findMany({
        where: { isActive: true }
      }),
      (prisma as any).adminStrategy.findMany({
        where: { isActive: true }
      })
    ])

    if (!businessType || !location) {
      return NextResponse.json(
        { error: 'Business type or location not found' },
        { status: 404 }
      )
    }

    // Calculate risks
    const calculatedRisks: CalculatedRisk[] = []
    let totalRiskScore = 0

    // Process business type hazards
    for (const bth of businessTypeHazards) {
      const hazard = bth.hazard
      const coastalMultiplier = calculateCoastalRiskMultiplier(location, hazard)
      const seasonalAdjustment = getSeasonalRiskAdjustment(hazard)
      
      // Apply location-specific modifiers
      const locationHazard = locationHazards.find((lh: any) => lh.hazardId === hazard.hazardId)
      let finalRiskLevel = bth.riskLevel
      
      if (locationHazard) {
        // Use location-specific risk level if available
        finalRiskLevel = locationHazard.riskLevel
      }
      
      // Apply multipliers
      let riskScore = 0
      switch (finalRiskLevel) {
        case 'very_high': riskScore = 90; break
        case 'high': riskScore = 70; break
        case 'medium': riskScore = 50; break
        case 'low': riskScore = 30; break
        default: riskScore = 50
      }
      
      riskScore *= coastalMultiplier * seasonalAdjustment
      riskScore = Math.min(riskScore, 100)
      
      const cascadingRisks = calculateCascadingRisks(hazard, allHazards)
      
      calculatedRisks.push({
        hazardId: hazard.hazardId,
        riskLevel: finalRiskLevel,
        reasoning: `Base risk: ${bth.riskLevel}, Coastal multiplier: ${coastalMultiplier.toFixed(2)}, Seasonal adjustment: ${seasonalAdjustment.toFixed(2)}`,
        seasonalAdjustment,
        coastalMultiplier,
        cascadingRisks
      })
      
      totalRiskScore += riskScore
    }

    // Calculate average risk score
    const averageRiskScore = calculatedRisks.length > 0 ? Math.round(totalRiskScore / calculatedRisks.length) : 0

    // Generate strategy recommendations
    const recommendedStrategies: RecommendedStrategy[] = []
    
    for (const strategy of allStrategies) {
      const effectiveness = calculateStrategyEffectiveness(strategy, businessType)
      const { cost, roi } = calculateStrategyCostAndROI(strategy, businessType)
      
      // Determine priority based on ROI and effectiveness
      let priority = 'low'
      if (roi > 2.0 || effectiveness > 0.8) priority = 'high'
      else if (roi > 1.0 || effectiveness > 0.6) priority = 'medium'
      
      const conflicts = findStrategyConflicts([strategy])
      
      recommendedStrategies.push({
        strategyId: strategy.strategyId,
        priority,
        effectiveness,
        cost,
        roi,
        conflicts
      })
    }

    // Sort strategies by ROI (highest first)
    recommendedStrategies.sort((a, b) => b.roi - a.roi)

    // Get the actual database IDs for business type and location
    const businessTypeRecord = await (prisma as any).adminBusinessType.findFirst({
      where: { businessTypeId }
    })
    
    const locationRecord = await (prisma as any).adminLocation.findFirst({
      where: { id: locationId }
    })

    if (!businessTypeRecord || !locationRecord) {
      return NextResponse.json(
        { error: 'Business type or location not found' },
        { status: 404 }
      )
    }

    // Save or update risk profile using actual database IDs
    const riskProfile = await (prisma as any).adminRiskProfile.upsert({
      where: {
        businessTypeId_locationId: {
          businessTypeId: businessTypeRecord.id,
          locationId: locationRecord.id
        }
      },
      update: {
        calculatedRisks: JSON.stringify(calculatedRisks),
        recommendedStrategies: JSON.stringify(recommendedStrategies),
        riskScore: averageRiskScore,
        lastCalculated: new Date()
      },
      create: {
        businessTypeId: businessTypeRecord.id,
        locationId: locationRecord.id,
        calculatedRisks: JSON.stringify(calculatedRisks),
        recommendedStrategies: JSON.stringify(recommendedStrategies),
        riskScore: averageRiskScore,
        lastCalculated: new Date()
      }
    })

    const response: RiskCalculationResponse = {
      businessTypeId,
      locationId,
      calculatedRisks,
      recommendedStrategies,
      riskScore: averageRiskScore,
      lastCalculated: riskProfile.lastCalculated
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Risk calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate risk profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessTypeId = searchParams.get('businessTypeId')
    const locationId = searchParams.get('locationId')

    if (!businessTypeId || !locationId) {
      return NextResponse.json(
        { error: 'businessTypeId and locationId are required' },
        { status: 400 }
      )
    }

    const riskProfile = await (prisma as any).adminRiskProfile.findUnique({
      where: {
        businessTypeId_locationId: {
          businessTypeId,
          locationId
        }
      }
    })

    if (!riskProfile) {
      return NextResponse.json(
        { error: 'Risk profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...riskProfile,
      calculatedRisks: JSON.parse(riskProfile.calculatedRisks),
      recommendedStrategies: JSON.parse(riskProfile.recommendedStrategies)
    })

  } catch (error) {
    console.error('Error fetching risk profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch risk profile' },
      { status: 500 }
    )
  }
} 