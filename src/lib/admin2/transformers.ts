/**
 * Data transformers for Admin2 API responses
 * Converts database models to frontend-expected formats
 */

import { safeJsonParse, transformDatesForApi } from './api-utils'
import { parseMultilingualJSON } from '../../utils/localizationUtils'

/**
 * All possible risk types (13 total)
 */
const ALL_RISK_TYPES = [
  'hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage',
  'fire', 'cyberAttack', 'terrorism', 'pandemicDisease', 'economicDownturn', 
  'supplyChainDisruption', 'civilUnrest'
]

/**
 * Transform Parish data from database to API format
 */
export function transformParishForApi(parish: any): any {
  if (!parish) return null

  // CRITICAL: Initialize ALL 13 risks with level 0 first
  let riskProfile: any = {}
  ALL_RISK_TYPES.forEach(riskType => {
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
          console.log(`🔍 transformParishForApi: ${parish.name} has ${nonZeroRisks} risks with level > 0 (out of ${ALL_RISK_TYPES.length} total)`)
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
export function transformBusinessTypeForApi(businessType: any): any {
  if (!businessType) return null

  return {
    id: businessType.id,
    businessTypeId: businessType.businessTypeId,
    name: parseMultilingualJSON(businessType.name) || businessType.name,
    category: businessType.category,
    subcategory: businessType.subcategory,
    description: parseMultilingualJSON(businessType.description) || businessType.description,
    
    // Reference information
    typicalRevenue: businessType.typicalRevenue,
    typicalEmployees: businessType.typicalEmployees,
    operatingHours: businessType.operatingHours,
    
    // Multilingual example content for wizard prefill
    exampleBusinessPurposes: safeJsonParse(businessType.exampleBusinessPurposes, []),
    exampleProducts: safeJsonParse(businessType.exampleProducts, []),
    exampleKeyPersonnel: safeJsonParse(businessType.exampleKeyPersonnel, []),
    exampleCustomerBase: safeJsonParse(businessType.exampleCustomerBase, []),
    minimumEquipment: safeJsonParse(businessType.minimumEquipment, []),
    
    // Transform risk vulnerabilities
    riskVulnerabilities: businessType.riskVulnerabilities?.map((rv: any) => ({
      riskType: rv.riskType,
      vulnerabilityLevel: rv.vulnerabilityLevel,
      impactSeverity: rv.impactSeverity
    })) || [],
    
    // Placeholder for strategies (populated separately)
    strategies: []
  }
}

/**
 * Transform Strategy data from database to API format
 */
export function transformStrategyForApi(strategy: any): any {
  if (!strategy) return null

  const applicableBusinessTypesFromDb = safeJsonParse(strategy.applicableBusinessTypes, [])

  const transformed = {
    ...strategy,
    // Basic Info
    name: parseMultilingualJSON(strategy.name) || strategy.name,
    description: parseMultilingualJSON(strategy.description) || strategy.description,
    
    // SME-Focused Content (NEW)
    smeTitle: parseMultilingualJSON(strategy.smeTitle) || strategy.smeTitle,
    smeSummary: parseMultilingualJSON(strategy.smeSummary) || strategy.smeSummary,
    benefitsBullets: safeJsonParse(strategy.benefitsBullets, []),
    realWorldExample: parseMultilingualJSON(strategy.realWorldExample) || strategy.realWorldExample,
    
    // Backward compatibility (deprecated fields)
    smeDescription: parseMultilingualJSON(strategy.smeDescription) || strategy.smeDescription || strategy.description || '',
    whyImportant: parseMultilingualJSON(strategy.whyImportant) || strategy.whyImportant || `This strategy helps protect your business from ${safeJsonParse(strategy.applicableRisks, []).join(', ')} risks.`,
    
    // Implementation Details (enhanced)
    costEstimateJMD: strategy.costEstimateJMD || getCostEstimateJMD(strategy.implementationCost), // Use DB value if available, otherwise compute
    estimatedTotalHours: strategy.estimatedTotalHours,
    complexityLevel: strategy.complexityLevel || 'moderate',
    
    // Wizard Integration (NEW)
    quickWinIndicator: strategy.quickWinIndicator || false,
    defaultSelected: strategy.defaultSelected || false,
    selectionTier: strategy.selectionTier,
    requiredForRisks: safeJsonParse(strategy.requiredForRisks, []),
    
    // Resource-Limited SME Support (NEW)
    lowBudgetAlternative: parseMultilingualJSON(strategy.lowBudgetAlternative) || strategy.lowBudgetAlternative,
    diyApproach: parseMultilingualJSON(strategy.diyApproach) || strategy.diyApproach,
    estimatedDIYSavings: strategy.estimatedDIYSavings,
    
    // BCP Document Integration (NEW)
    bcpSectionMapping: strategy.bcpSectionMapping,
    bcpTemplateText: parseMultilingualJSON(strategy.bcpTemplateText) || strategy.bcpTemplateText,
    
    // Personalization (NEW)
    industryVariants: safeJsonParse(strategy.industryVariants, {}),
    businessSizeGuidance: safeJsonParse(strategy.businessSizeGuidance, {}),
    
    // Existing risk/business type fields
    applicableRisks: safeJsonParse(strategy.applicableRisks, []),
    applicableBusinessTypes: applicableBusinessTypesFromDb,
    prerequisites: safeJsonParse(strategy.prerequisites, []),
    
    // Backward compatibility fields
    timeToImplement: strategy.implementationTime,
    businessTypes: applicableBusinessTypesFromDb, // Map applicableBusinessTypes to businessTypes for frontend
    
    // Guidance arrays
    helpfulTips: safeJsonParse(strategy.helpfulTips, []),
    commonMistakes: safeJsonParse(strategy.commonMistakes, []),
    successMetrics: safeJsonParse(strategy.successMetrics, []),
    
    // Transform action steps from database (with NEW SME context fields)
    actionSteps: (strategy.actionSteps || []).map((step: any) => ({
      id: step.stepId,
      stepId: step.stepId,
      strategyId: step.strategyId,
      
      // Basic Info
      phase: step.phase,
      title: parseMultilingualJSON(step.title) || step.title,
      action: parseMultilingualJSON(step.description) || step.description,
      description: parseMultilingualJSON(step.description) || step.description,
      smeAction: parseMultilingualJSON(step.smeAction) || step.smeAction,
      sortOrder: step.sortOrder,
      
      // SME Context (NEW)
      whyThisStepMatters: parseMultilingualJSON(step.whyThisStepMatters) || step.whyThisStepMatters,
      whatHappensIfSkipped: parseMultilingualJSON(step.whatHappensIfSkipped) || step.whatHappensIfSkipped,
      
      // Timing & Difficulty (NEW)
      timeframe: step.timeframe,
      estimatedMinutes: step.estimatedMinutes,
      difficultyLevel: step.difficultyLevel || 'medium',
      
      // Resources & Costs
      responsibility: step.responsibility,
      cost: step.estimatedCost,
      estimatedCostJMD: step.estimatedCostJMD,
      resources: safeJsonParse(step.resources, []),
      checklist: safeJsonParse(step.checklist, []),
      
      // Validation & Completion (NEW)
      howToKnowItsDone: parseMultilingualJSON(step.howToKnowItsDone) || step.howToKnowItsDone,
      exampleOutput: parseMultilingualJSON(step.exampleOutput) || step.exampleOutput,
      
      // Dependencies (NEW)
      dependsOnSteps: safeJsonParse(step.dependsOnSteps, []),
      isOptional: step.isOptional || false,
      skipConditions: parseMultilingualJSON(step.skipConditions) || step.skipConditions,
      
      // Alternatives for resource-limited SMEs (NEW)
      freeAlternative: parseMultilingualJSON(step.freeAlternative) || step.freeAlternative,
      lowTechOption: parseMultilingualJSON(step.lowTechOption) || step.lowTechOption,
      
      // Help Resources (NEW)
      commonMistakesForStep: safeJsonParse(step.commonMistakesForStep, []),
      videoTutorialUrl: step.videoTutorialUrl,
      externalResourceUrl: step.externalResourceUrl
    }))
  }


  return transformDatesForApi(transformed)
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
    category: template.category,
    description: template.description,
    applicableRisks: template.applicableRisks,
    implementationCost: template.cost,
    costEstimateJMD: getCostEstimateJMD(template.cost),
    implementationTime: template.implementationTime,
    timeToImplement: template.timeToImplement,
    effectiveness: template.effectiveness,
    businessTypes: template.applicableBusinessTypes,
    priority: template.priority,
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
