import { prisma } from '@/lib/prisma'
import { BusinessCharacteristics, AppliedMultiplier, MultiplierApplicationResult } from '@/types/multipliers'

/**
 * Apply admin-defined multipliers to a base risk score based on business characteristics
 */
export async function applyMultipliers(
  baseScore: number,
  hazardType: string,
  userCharacteristics: BusinessCharacteristics
): Promise<MultiplierApplicationResult> {
  try {
    // Fetch all active multipliers from database
    const allMultipliers = await (prisma as any).riskMultiplier.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' } // Apply in priority order
    })

    let finalScore = baseScore
    const appliedMultipliers: AppliedMultiplier[] = []
    const reasoningParts: string[] = []

    // Filter multipliers applicable to this hazard
    for (const multiplier of allMultipliers) {
      const applicableHazards = JSON.parse(multiplier.applicableHazards)
      
      // Normalize both hazard types for comparison (handle camelCase vs snake_case)
      const normalizedHazardType = hazardType.replace(/_/g, '').toLowerCase()
      const normalizedApplicableHazards = applicableHazards.map((h: string) => 
        h.replace(/_/g, '').toLowerCase()
      )
      
      // Check if this multiplier applies to the current hazard
      if (!normalizedApplicableHazards.includes(normalizedHazardType)) {
        continue
      }

      // Check if the condition is met
      const shouldApply = checkMultiplierCondition(
        multiplier,
        userCharacteristics
      )

      if (shouldApply) {
        finalScore *= multiplier.multiplierFactor
        appliedMultipliers.push({
          name: multiplier.name,
          factor: multiplier.multiplierFactor,
          reasoning: multiplier.reasoning || multiplier.description
        })
        
        reasoningParts.push(
          `${multiplier.name} ×${multiplier.multiplierFactor}`
        )
      }
    }

    // Cap final score at 10
    finalScore = Math.min(10, finalScore)

    return {
      baseScore: Math.round(baseScore * 10) / 10,
      finalScore: Math.round(finalScore * 10) / 10,
      appliedMultipliers,
      reasoning: appliedMultipliers.length > 0
        ? `Multipliers applied: ${reasoningParts.join(', ')}`
        : 'No multipliers applied'
    }
  } catch (error) {
    console.error('❌ Error applying multipliers:', error)
    // Fallback: return base score if multiplier system fails
    return {
      baseScore: Math.round(baseScore * 10) / 10,
      finalScore: Math.round(baseScore * 10) / 10,
      appliedMultipliers: [],
      reasoning: 'Multiplier system error - using base score'
    }
  }
}

/**
 * Check if a multiplier's condition is met for the given characteristics
 */
function checkMultiplierCondition(
  multiplier: any,
  userCharacteristics: BusinessCharacteristics
): boolean {
  const charType = multiplier.characteristicType
  const conditionType = multiplier.conditionType
  
  // Get the value from user characteristics
  const userValue = userCharacteristics[charType as keyof BusinessCharacteristics]
  
  if (userValue === undefined || userValue === null) {
    return false
  }

  switch (conditionType) {
    case 'boolean':
      // For boolean conditions, check if the value is true
      return userValue === true

    case 'threshold':
      // For threshold conditions, check if value >= threshold
      if (typeof userValue === 'number' && multiplier.thresholdValue !== null) {
        return userValue >= multiplier.thresholdValue
      }
      return false

    case 'range':
      // For range conditions, check if value is within range
      if (
        typeof userValue === 'number' &&
        multiplier.minValue !== null &&
        multiplier.maxValue !== null
      ) {
        return userValue >= multiplier.minValue && userValue <= multiplier.maxValue
      }
      return false

    default:
      console.warn(`Unknown condition type: ${conditionType}`)
      return false
  }
}

/**
 * Convert simplified user inputs to fact-based characteristics
 * Uses simple yes/no questions that small business owners can easily answer
 */
export function convertSimplifiedInputs(answers: {
  // Customer base
  customerBase?: 'mainly_tourists' | 'mix' | 'mainly_locals'
  
  // Dependencies
  powerDependency?: 'can_operate' | 'partially' | 'cannot_operate'
  digitalDependency?: 'essential' | 'helpful' | 'not_used'
  
  // Supply chain checkboxes
  importsFromOverseas?: boolean
  sellsPerishable?: boolean
  minimalInventory?: boolean
  
  // Physical assets
  expensiveEquipment?: boolean
  
  // Location (from parish selection)
  isCoastal?: boolean
  isUrban?: boolean
  floodRisk?: number
}): BusinessCharacteristics {
  return {
    // Location facts (from parish data)
    location_coastal: answers.isCoastal || false,
    location_urban: answers.isUrban || false,
    location_flood_prone: (answers.floodRisk || 0) > 7,
    
    // Revenue shares (based on customer base)
    tourism_share: 
      answers.customerBase === 'mainly_tourists' ? 80 :
      answers.customerBase === 'mix' ? 40 : 10,
    local_customer_share: 
      answers.customerBase === 'mainly_tourists' ? 15 :
      answers.customerBase === 'mix' ? 50 : 85,
    export_share: 5,
    
    // Power dependency
    power_dependency:
      answers.powerDependency === 'cannot_operate' ? 95 :
      answers.powerDependency === 'partially' ? 50 : 10,
    
    // Digital dependency
    digital_dependency:
      answers.digitalDependency === 'essential' ? 95 :
      answers.digitalDependency === 'helpful' ? 50 : 10,
    
    // Water dependency (high if perishable goods)
    water_dependency: answers.sellsPerishable ? 90 : 30,
    
    // Supply chain
    supply_chain_complex: !!(
      answers.importsFromOverseas || 
      answers.minimalInventory || 
      answers.sellsPerishable
    ),
    perishable_goods: answers.sellsPerishable || false,
    just_in_time_inventory: answers.minimalInventory || false,
    
    // Timing (can add later if needed)
    seasonal_business: false,
    
    // Physical assets
    physical_asset_intensive: answers.expensiveEquipment || false,
    own_building: false,
    significant_inventory: !answers.minimalInventory
  }
}

/**
 * Convert old slider-based characteristics (1-10) to new fact-based characteristics
 * This is for backwards compatibility during transition
 */
export function convertLegacyCharacteristics(legacy: {
  tourismDependency?: number
  digitalDependency?: number
  physicalAssetIntensity?: number
  supplyChainComplexity?: number
  seasonalityFactor?: number
  isCoastal?: boolean
  isUrban?: boolean
}): BusinessCharacteristics {
  return {
    // Location facts
    location_coastal: legacy.isCoastal || false,
    location_urban: legacy.isUrban || false,
    
    // Revenue shares (convert 1-10 scale to 0-100%)
    tourism_share: ((legacy.tourismDependency || 5) - 1) * 11.11, // 1->0%, 10->100%
    local_customer_share: 100 - ((legacy.tourismDependency || 5) - 1) * 11.11,
    export_share: 0,
    
    // Operations (convert 1-10 scale to 0-100%)
    digital_dependency: ((legacy.digitalDependency || 5) - 1) * 11.11,
    power_dependency: ((legacy.digitalDependency || 5) - 1) * 11.11, // Assume similar
    water_dependency: 30, // Default moderate
    
    // Supply chain (convert 1-10 to boolean at threshold 7)
    supply_chain_complex: (legacy.supplyChainComplexity || 5) >= 7,
    perishable_goods: false,
    just_in_time_inventory: (legacy.supplyChainComplexity || 5) >= 7,
    
    // Timing
    seasonal_business: (legacy.seasonalityFactor || 5) >= 7,
    
    // Physical
    physical_asset_intensive: (legacy.physicalAssetIntensity || 5) >= 7,
    own_building: false,
    significant_inventory: (legacy.physicalAssetIntensity || 5) >= 5
  }
}

