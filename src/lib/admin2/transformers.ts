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
export function transformBusinessTypeForApi(businessType: any, raw: boolean = false): any {
  if (!businessType) return null

  // If raw mode, construct multilingual objects from all translations
  if (raw && Array.isArray(businessType.BusinessTypeTranslation)) {
    const multilingualFields: any = {
      name: { en: '', es: '', fr: '' },
      description: { en: '', es: '', fr: '' },
      exampleBusinessPurposes: { en: [], es: [], fr: [] },
      exampleProducts: { en: [], es: [], fr: [] },
      exampleKeyPersonnel: { en: [], es: [], fr: [] },
      exampleCustomerBase: { en: [], es: [], fr: [] },
      minimumEquipment: { en: [], es: [], fr: [] }
    }

    // Populate multilingual fields from translations
    businessType.BusinessTypeTranslation.forEach((t: any) => {
      if (['en', 'es', 'fr'].includes(t.locale)) {
        const locale = t.locale as 'en' | 'es' | 'fr'
        multilingualFields.name[locale] = t.name || ''
        multilingualFields.description[locale] = t.description || ''
        multilingualFields.exampleBusinessPurposes[locale] = safeJsonParse(t.exampleBusinessPurposes, [])
        multilingualFields.exampleProducts[locale] = safeJsonParse(t.exampleProducts, [])
        multilingualFields.exampleKeyPersonnel[locale] = safeJsonParse(t.exampleKeyPersonnel, [])
        multilingualFields.exampleCustomerBase[locale] = safeJsonParse(t.exampleCustomerBase, [])
        multilingualFields.minimumEquipment[locale] = safeJsonParse(t.minimumEquipment, [])
      }
    })

    // Also check base fields if translation is missing (legacy fallback)
    if (!multilingualFields.name.en && businessType.name) multilingualFields.name.en = businessType.name
    if (!multilingualFields.description.en && businessType.description) multilingualFields.description.en = businessType.description
    
    // Array fallbacks
    if (multilingualFields.exampleBusinessPurposes.en.length === 0 && businessType.exampleBusinessPurposes) 
      multilingualFields.exampleBusinessPurposes.en = safeJsonParse(businessType.exampleBusinessPurposes, [])
    
    if (multilingualFields.exampleProducts.en.length === 0 && businessType.exampleProducts) 
      multilingualFields.exampleProducts.en = safeJsonParse(businessType.exampleProducts, [])
      
    if (multilingualFields.exampleKeyPersonnel.en.length === 0 && businessType.exampleKeyPersonnel) 
      multilingualFields.exampleKeyPersonnel.en = safeJsonParse(businessType.exampleKeyPersonnel, [])
      
    if (multilingualFields.exampleCustomerBase.en.length === 0 && businessType.exampleCustomerBase) 
      multilingualFields.exampleCustomerBase.en = safeJsonParse(businessType.exampleCustomerBase, [])
      
    if (multilingualFields.minimumEquipment.en.length === 0 && businessType.minimumEquipment) 
      multilingualFields.minimumEquipment.en = safeJsonParse(businessType.minimumEquipment, [])

    return {
      id: businessType.id,
      businessTypeId: businessType.businessTypeId,
      category: businessType.category,
      subcategory: businessType.subcategory,
      
      // Multilingual fields (as JSON strings or objects, Editor expects objects for some, strings for others?)
      // The Editor's parseMultilingual expects JSON string OR object.
      // The Editor's parseMultilingualArray expects JSON string OR object.
      // Let's return objects directly, the frontend seems to handle it.
      ...multilingualFields,

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

      // Placeholder for strategies
      strategies: []
    }
  }

  // Extract translation if available (Normal mode)
  const translation = businessType.BusinessTypeTranslation?.[0] || {}

  return {
    id: businessType.id,
    businessTypeId: businessType.businessTypeId,
    category: businessType.category,
    subcategory: businessType.subcategory,

    // Use translation fields (no legacy fallback)
    name: translation.name || '',
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
    // Basic Info - Use translation fields
    name: translation.name || '',
    description: translation.description || '',

    // SME-Focused Content (NEW)
    smeTitle: translation.smeTitle || '',
    smeSummary: translation.smeSummary || '',
    benefitsBullets: translation.benefitsBullets || [],
    realWorldExample: translation.realWorldExample || '',

    // Backward compatibility (deprecated fields)
    smeDescription: translation.smeDescription || '',
    whyImportant: translation.whyImportant || '',
    
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
    lowBudgetAlternative: translation.lowBudgetAlternative || '',
    diyApproach: translation.diyApproach || '',
    estimatedDIYSavings: strategy.estimatedDIYSavings,

    // BCP Document Integration (NEW)
    bcpSectionMapping: strategy.bcpSectionMapping,
    bcpTemplateText: translation.bcpTemplateText || '',

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
    helpfulTips: translation.helpfulTips || [],
    commonMistakes: translation.commonMistakes || [],
    successMetrics: translation.successMetrics || [],

    // Transform action steps with their translations
    actionSteps: (strategy.ActionStep || strategy.actionSteps || []).map(transformActionStepForApi),

    // Remove raw translation arrays from response
    StrategyTranslation: undefined,
    ActionStep: undefined
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
    title: translation.title || '',
    action: translation.description || '',
    description: translation.description || '',
    smeAction: translation.smeAction || '',
    sortOrder: step.sortOrder,

    // SME Context (NEW)
    whyThisStepMatters: translation.whyThisStepMatters || '',
    whatHappensIfSkipped: translation.whatHappensIfSkipped || '',

    // Timing & Difficulty (NEW)
    timeframe: translation.timeframe || '',
    estimatedMinutes: step.estimatedMinutes,
    difficultyLevel: step.difficultyLevel || 'medium',

    // Resources & Costs
    responsibility: translation.responsibility || '',
    cost: step.estimatedCost,
    estimatedCostJMD: step.estimatedCostJMD,
    resources: safeJsonParse(step.resources, []),
    checklist: safeJsonParse(step.checklist, []),

    // Cost Items (NEW - structured costing system)
    // Handle Prisma relation name (ActionStepItemCost)
    costItems: (step.ActionStepItemCost || step.itemCosts || []).map((itemCost: any) => ({
      id: itemCost.id,
      itemId: itemCost.itemId,
      quantity: itemCost.quantity,
      customNotes: itemCost.customNotes,
      item: (itemCost.CostItem || itemCost.item) ? {
        id: (itemCost.CostItem || itemCost.item).id,
        itemId: (itemCost.CostItem || itemCost.item).itemId,
        name: (itemCost.CostItem || itemCost.item).name,
        description: (itemCost.CostItem || itemCost.item).description,
        category: (itemCost.CostItem || itemCost.item).category,
        baseUSD: (itemCost.CostItem || itemCost.item).baseUSD,
        baseUSDMin: (itemCost.CostItem || itemCost.item).baseUSDMin,
        baseUSDMax: (itemCost.CostItem || itemCost.item).baseUSDMax,
        unit: (itemCost.CostItem || itemCost.item).unit
      } : undefined
    })),

    // Validation & Completion (NEW)
    howToKnowItsDone: translation.howToKnowItsDone || '',
    exampleOutput: translation.exampleOutput || '',

    // Dependencies (NEW)
    dependsOnSteps: safeJsonParse(step.dependsOnSteps, []),
    isOptional: step.isOptional || false,
    skipConditions: translation.skipConditions || '',

    // Alternatives for resource-limited SMEs (NEW)
    freeAlternative: translation.freeAlternative || '',
    lowTechOption: translation.lowTechOption || '',

    // Help Resources (NEW)
    commonMistakesForStep: translation.commonMistakesForStep || [],
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
