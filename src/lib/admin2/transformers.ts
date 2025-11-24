/**
 * Data transformers for Admin2 API responses
 * Converts database models to frontend-expected formats
 */

import { safeJsonParse, transformDatesForApi } from './api-utils'
import { parseMultilingualJSON } from '../../utils/localizationUtils'

/**
 * Default risk types (fallback if database fetch fails)
 * NOTE: In production, risks should be fetched from AdminHazardType table
 * This is just a fallback for backwards compatibility
 */
const DEFAULT_RISK_TYPES = [
  'hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage',
  'fire', 'cyberAttack', 'terrorism', 'pandemicDisease', 'economicDownturn',
  'supplyChainDisruption', 'civilUnrest'
]

/**
 * Transform Parish data from database to API format
 */
export function transformParishForApi(parish: any): any {
  if (!parish) return null

  // CRITICAL: Initialize risks with level 0 first
  // NOTE: In production, this should fetch from AdminHazardType table
  // For now, using default list as fallback
  let riskProfile: any = {}
  DEFAULT_RISK_TYPES.forEach(riskType => {
    riskProfile[riskType] = { level: 0, notes: '' }
  })

  // Override with actual data from database
  if (parish.parishRisk) {
    // Merge basic 6 hardcoded risks
    const basicRisks = buildBasicRiskProfile(parish.parishRisk)
    Object.assign(riskProfile, basicRisks)

    // CRITICAL: Merge in ALL dynamic risks from riskProfileJson
    // This includes: fire, cyberAttack, terrorism, pandemicDisease, etc.
    if (parish.parishRisk.riskProfileJson) {
      try {
        const dynamicRisks = typeof parish.parishRisk.riskProfileJson === 'string'
          ? JSON.parse(parish.parishRisk.riskProfileJson)
          : parish.parishRisk.riskProfileJson

        if (dynamicRisks && typeof dynamicRisks === 'object') {
          // Merge ALL risks from JSON (including overwriting hardcoded ones if they exist)
          Object.keys(dynamicRisks).forEach(riskKey => {
            // Skip metadata fields
            if (['lastUpdated', 'updatedBy'].includes(riskKey)) return

            // Add/update risk data
            if (dynamicRisks[riskKey] && typeof dynamicRisks[riskKey] === 'object') {
              riskProfile[riskKey] = dynamicRisks[riskKey]
            }
          })

          const nonZeroRisks = Object.keys(riskProfile).filter(k =>
            !['lastUpdated', 'updatedBy'].includes(k) && riskProfile[k]?.level > 0
          ).length
          console.log(`🔍 transformParishForApi: ${parish.name} has ${nonZeroRisks} risks with level > 0 (out of ${DEFAULT_RISK_TYPES.length} total)`)
        }
      } catch (error) {
        console.error('⚠️ transformParishForApi: Failed to parse riskProfileJson:', error)
      }
    }
  }

  // Ensure metadata is always present
  riskProfile.lastUpdated = parish.parishRisk?.lastUpdated?.toISOString() || new Date().toISOString()
  riskProfile.updatedBy = parish.parishRisk?.updatedBy || 'system'

  return {
    id: parish.id,
    name: parish.name,
    region: parish.region,
    population: parish.population,
    riskProfile
  }
}

/**
 * Build basic risk profile from individual risk fields
 */
function buildBasicRiskProfile(parishRisk: any): any {
  return {
    hurricane: {
      level: parishRisk.hurricaneLevel || 0,
      notes: parishRisk.hurricaneNotes || ''
    },
    flood: {
      level: parishRisk.floodLevel || 0,
      notes: parishRisk.floodNotes || ''
    },
    earthquake: {
      level: parishRisk.earthquakeLevel || 0,
      notes: parishRisk.earthquakeNotes || ''
    },
    drought: {
      level: parishRisk.droughtLevel || 0,
      notes: parishRisk.droughtNotes || ''
    },
    landslide: {
      level: parishRisk.landslideLevel || 0,
      notes: parishRisk.landslideNotes || ''
    },
    powerOutage: {
      level: parishRisk.powerOutageLevel || 0,
      notes: parishRisk.powerOutageNotes || ''
    }
  }
}

/**
 * Transform BusinessType data from database to API format
 */
/**
 * Transform BusinessType data from database to API format
 */
export function transformBusinessTypeForApi(businessType: any): any {
  if (!businessType) return null

  // Extract translation if available
  const translation = businessType.BusinessTypeTranslation?.[0] || {}

  return {
    id: businessType.id,
    businessTypeId: businessType.businessTypeId,
    category: businessType.category,
    subcategory: businessType.subcategory,

    // Use translation fields with fallback
    name: translation.name || businessType.businessTypeId, // Fallback to ID if no name
    description: translation.description || '',
    exampleBusinessPurposes: translation.exampleBusinessPurposes || [],
    exampleProducts: translation.exampleProducts || [],
    exampleKeyPersonnel: translation.exampleKeyPersonnel || [],
    exampleCustomerBase: translation.exampleCustomerBase || [],
    minimumEquipment: translation.minimumEquipment || [],

    // Non-translatable characteristics
    touristDependency: businessType.touristDependency,
    digitalDependency: businessType.digitalDependency,
    physicalAssetIntensity: businessType.physicalAssetIntensity,
    seasonalityFactor: businessType.seasonalityFactor,
    supplyChainComplexity: businessType.supplyChainComplexity,
    regulatoryCompliance: businessType.regulatoryCompliance,

    // Risk vulnerabilities
    riskVulnerabilities: (businessType.BusinessRiskVulnerability || []).map((rv: any) => ({
      riskType: rv.riskType,
      vulnerabilityLevel: rv.vulnerabilityLevel,
      impactSeverity: rv.impactSeverity
    })),

    // Remove raw arrays
    BusinessTypeTranslation: undefined,
    BusinessRiskVulnerability: undefined,

    // Placeholder for strategies (populated separately)
    strategies: []
  }
}

/**
 * Transform Strategy data from database to API format
 */
export function transformStrategyForApi(strategy: any): any {
  if (!strategy) return null

  // Extract translation if available
  const translation = strategy.StrategyTranslation?.[0] || {}
  const applicableBusinessTypesFromDb = safeJsonParse(strategy.applicableBusinessTypes, [])

  const transformed = {
    ...strategy,
    // Basic Info - Use translation fields, fallback to main table fields
    name: translation.name || strategy.name,
    description: translation.description || strategy.description,

    // SME-Focused Content (NEW)
    smeTitle: translation.smeTitle || strategy.smeTitle,
    smeSummary: translation.smeSummary || strategy.smeSummary,
    benefitsBullets: translation.benefitsBullets || safeJsonParse(strategy.benefitsBullets, []),
    realWorldExample: translation.realWorldExample || strategy.realWorldExample,

    // Backward compatibility (deprecated fields)
    smeDescription: translation.smeDescription || strategy.smeDescription || strategy.description || '',
    whyImportant: translation.whyImportant || strategy.whyImportant || `This strategy helps protect your business from ${safeJsonParse(strategy.applicableRisks, []).join(', ')} risks.`,

    // Implementation Details (enhanced)
    costEstimateJMD: strategy.costEstimateJMD || getCostEstimateJMD(strategy.implementationCost), // Use DB value if available, otherwise compute
    totalEstimatedHours: strategy.totalEstimatedHours,
    complexityLevel: strategy.complexityLevel || 'moderate',

    // Wizard Integration (NEW)
    quickWinIndicator: strategy.quickWinIndicator || false,
    defaultSelected: strategy.defaultSelected || false,
    selectionTier: strategy.selectionTier,
    requiredForRisks: safeJsonParse(strategy.requiredForRisks, []),

    // Resource-Limited SME Support (NEW)
    lowBudgetAlternative: translation.lowBudgetAlternative || strategy.lowBudgetAlternative,
    diyApproach: translation.diyApproach || strategy.diyApproach,
    estimatedDIYSavings: strategy.estimatedDIYSavings,

    // BCP Document Integration (NEW)
    bcpSectionMapping: strategy.bcpSectionMapping,
    bcpTemplateText: translation.bcpTemplateText || strategy.bcpTemplateText,

    // Personalization (NEW)
    industryVariants: safeJsonParse(strategy.industryVariants, {}),
    businessSizeGuidance: safeJsonParse(strategy.businessSizeGuidance, {}),

    // Existing risk/business type fields
    applicableRisks: safeJsonParse(strategy.applicableRisks, []),
    applicableBusinessTypes: applicableBusinessTypesFromDb,
    prerequisites: safeJsonParse(strategy.prerequisites, []),

    // Backward compatibility fields
    businessTypes: applicableBusinessTypesFromDb, // Map applicableBusinessTypes to businessTypes for frontend

    // Guidance arrays
    helpfulTips: translation.helpfulTips || safeJsonParse(strategy.helpfulTips, []),
    commonMistakes: translation.commonMistakes || safeJsonParse(strategy.commonMistakes, []),
    successMetrics: translation.successMetrics || safeJsonParse(strategy.successMetrics, []),

    // Transform action steps with their translations
    actionSteps: (strategy.actionSteps || []).map(transformActionStepForApi),

    // Remove raw translation arrays from response
    StrategyTranslation: undefined
  }

  return transformDatesForApi(transformed)
}

function transformActionStepForApi(step: any): any {
  const translation = step.ActionStepTranslation?.[0] || {}

  return {
    id: step.stepId,
    stepId: step.stepId,
    strategyId: step.strategyId,

    // Basic Info
    phase: step.phase,
    title: translation.title || step.title,
    action: translation.description || step.description,
    description: translation.description || step.description,
    smeAction: translation.smeAction || step.smeAction,
    sortOrder: step.sortOrder,

    // SME Context (NEW)
    whyThisStepMatters: translation.whyThisStepMatters || step.whyThisStepMatters,
    whatHappensIfSkipped: translation.whatHappensIfSkipped || step.whatHappensIfSkipped,

    // Timing & Difficulty (NEW)
    timeframe: translation.timeframe || step.timeframe,
    estimatedMinutes: step.estimatedMinutes,
    difficultyLevel: step.difficultyLevel || 'medium',

    // Resources & Costs
    responsibility: translation.responsibility || step.responsibility,
    cost: step.estimatedCost,
    estimatedCostJMD: step.estimatedCostJMD,
    resources: safeJsonParse(step.resources, []),
    checklist: safeJsonParse(step.checklist, []),

    // Cost Items (NEW - structured costing system)
    costItems: (step.itemCosts || []).map((itemCost: any) => ({
      id: itemCost.id,
      itemId: itemCost.itemId,
      quantity: itemCost.quantity,
      customNotes: itemCost.customNotes,
      item: itemCost.item ? {
        id: itemCost.item.id,
        itemId: itemCost.item.itemId,
        name: itemCost.item.name,
        description: itemCost.item.description,
        category: itemCost.item.category,
        baseUSD: itemCost.item.baseUSD,
        baseUSDMin: itemCost.item.baseUSDMin,
        baseUSDMax: itemCost.item.baseUSDMax,
        unit: itemCost.item.unit
      } : undefined
    })),

    // Validation & Completion (NEW)
    howToKnowItsDone: translation.howToKnowItsDone || step.howToKnowItsDone,
    exampleOutput: translation.exampleOutput || step.exampleOutput,

    // Dependencies (NEW)
    dependsOnSteps: safeJsonParse(step.dependsOnSteps, []),
    isOptional: step.isOptional || false,
    skipConditions: translation.skipConditions || step.skipConditions,

    // Alternatives for resource-limited SMEs (NEW)
    freeAlternative: translation.freeAlternative || step.freeAlternative,
    lowTechOption: translation.lowTechOption || step.lowTechOption,

    // Help Resources (NEW)
    commonMistakesForStep: translation.commonMistakesForStep || safeJsonParse(step.commonMistakesForStep, []),
    videoTutorialUrl: step.videoTutorialUrl,
    externalResourceUrl: step.externalResourceUrl,

    // Remove raw translation array
    ActionStepTranslation: undefined
  }
}

/**
 * Convert cost level to JMD estimate
 */
function getCostEstimateJMD(cost: string): string {
  switch (cost) {
    case 'low':
      return 'Under JMD $10,000'
    case 'medium':
      return 'JMD $10,000 - $50,000'
    case 'high':
      return 'Over JMD $50,000'
    default:
      return 'Cost estimate not available'
  }
}

/**
 * Transform strategy template to API format
 */
export function transformTemplateToStrategy(template: any): any {
  return {
    id: template.id,
    strategyId: template.id,
    name: template.name,
    description: template.description,
    applicableRisks: template.applicableRisks,
    implementationCost: template.cost,
    costEstimateJMD: getCostEstimateJMD(template.cost),
    businessTypes: template.applicableBusinessTypes,
    helpfulTips: template.helpfulTips || [],
    commonMistakes: template.commonMistakes || [],
    successMetrics: template.successMetrics || [],
    prerequisites: template.prerequisites || [],
    roi: template.roi,
    actionSteps: template.implementationSteps?.map((step: any, index: number) => ({
      id: `${template.id}_step_${index + 1}`,
      phase: step.phase,
      action: step.description,
      timeframe: step.timeframe,
      responsibility: step.responsibility,
      resources: step.resources,
      cost: step.estimatedCost,
      estimatedCostJMD: step.estimatedCost,
      checklist: step.checklist || []
    })) || []
  }
}
