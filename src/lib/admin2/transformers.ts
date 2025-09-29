/**
 * Data transformers for Admin2 API responses
 * Converts database models to frontend-expected formats
 */

import { safeJsonParse, transformDatesForApi } from './api-utils'

/**
 * Transform Parish data from database to API format
 */
export function transformParishForApi(parish: any): any {
  if (!parish) return null

  let riskProfile: any = {}
  
  // Parse complete risk profile from JSON if available
  if (parish.parishRisk?.riskProfileJson) {
    try {
      riskProfile = JSON.parse(parish.parishRisk.riskProfileJson)
    } catch (error) {
      console.error('Failed to parse parish risk profile JSON:', error)
      // Fallback to basic risks
      riskProfile = buildBasicRiskProfile(parish.parishRisk)
    }
  } else if (parish.parishRisk) {
    // Build from individual risk fields
    riskProfile = buildBasicRiskProfile(parish.parishRisk)
  }
  
  // Ensure metadata is always present
  riskProfile.lastUpdated = parish.parishRisk?.lastUpdated?.toISOString() || new Date().toISOString()
  riskProfile.updatedBy = parish.parishRisk?.updatedBy || 'system'
  
  return {
    id: parish.id,
    name: parish.name,
    region: parish.region,
    isCoastal: parish.isCoastal,
    isUrban: parish.isUrban,
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
    name: businessType.name,
    category: businessType.category,
    subcategory: businessType.subcategory,
    description: businessType.description,
    typicalRevenue: businessType.typicalRevenue,
    typicalEmployees: businessType.typicalEmployees,
    operatingHours: businessType.operatingHours,
    seasonalityFactor: businessType.seasonalityFactor,
    touristDependency: businessType.touristDependency || 0,
    supplyChainComplexity: businessType.supplyChainComplexity || 0,
    digitalDependency: businessType.digitalDependency || 0,
    cashFlowPattern: businessType.cashFlowPattern,
    physicalAssetIntensity: businessType.physicalAssetIntensity,
    customerConcentration: businessType.customerConcentration,
    regulatoryBurden: businessType.regulatoryBurden,
    
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
    applicableRisks: safeJsonParse(strategy.applicableRisks, []),
    applicableBusinessTypes: applicableBusinessTypesFromDb,
    prerequisites: safeJsonParse(strategy.prerequisites, []),
    
    // Add computed fields for backward compatibility
    costEstimateJMD: getCostEstimateJMD(strategy.implementationCost),
    timeToImplement: strategy.implementationTime,
    businessTypes: applicableBusinessTypesFromDb, // Map applicableBusinessTypes to businessTypes for frontend
    
    // Add missing fields for StrategyEditor compatibility
    smeDescription: strategy.smeDescription || strategy.description || '',
    whyImportant: strategy.whyImportant || `This strategy helps protect your business from ${safeJsonParse(strategy.applicableRisks, []).join(', ')} risks.`,
    
    // Default empty arrays for optional fields
    helpfulTips: safeJsonParse(strategy.helpfulTips, []),
    commonMistakes: safeJsonParse(strategy.commonMistakes, []),
    successMetrics: safeJsonParse(strategy.successMetrics, []),
    
    // Transform action steps from database
    actionSteps: (strategy.actionSteps || []).map((step: any) => ({
      id: step.stepId,
      phase: step.phase,
      title: step.title,
      action: step.description,
      smeAction: step.smeAction,
      timeframe: step.timeframe,
      responsibility: step.responsibility,
      cost: step.estimatedCost,
      estimatedCostJMD: step.estimatedCostJMD,
      resources: safeJsonParse(step.resources, []),
      checklist: safeJsonParse(step.checklist, []),
      sortOrder: step.sortOrder
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
