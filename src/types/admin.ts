// Centralized type definitions for admin2 section

export interface Parish {
  id: string
  name: string
  region: string
  isCoastal: boolean
  isUrban: boolean
  population: number
  riskProfile: {
    [key: string]: RiskData | string // Allow dynamic risk types plus lastUpdated, updatedBy
    hurricane: RiskData
    flood: RiskData
    earthquake: RiskData
    drought: RiskData
    landslide: RiskData
    powerOutage: RiskData
    lastUpdated: string
    updatedBy: string
  }
}

export interface RiskData {
  level: number
  notes: string
}

export interface BusinessType {
  id: string
  businessTypeId: string
  name: string
  category: string
  subcategory?: string
  description?: string
  typicalRevenue?: string
  typicalEmployees?: string
  operatingHours?: string
  
  // Core business characteristics (1-10 scale)
  seasonalityFactor: number
  touristDependency: number
  supplyChainComplexity: number
  digitalDependency: number
  physicalAssetIntensity: number
  customerConcentration: number
  regulatoryBurden: number
  cashFlowPattern: string
  
  // Risk exposure factors for location-specific calculations
  hurricaneVulnerability?: number
  floodVulnerability?: number
  earthquakeVulnerability?: number
  droughtVulnerability?: number
  landslideVulnerability?: number
  powerOutageVulnerability?: number
  
  hurricaneRecoveryImpact?: number
  floodRecoveryImpact?: number
  earthquakeRecoveryImpact?: number
  droughtRecoveryImpact?: number
  landslideRecoveryImpact?: number
  powerOutageRecoveryImpact?: number
  
  // Critical dependencies and assets
  essentialUtilities?: string[]
  typicalEquipment?: string[]
  keySupplierTypes?: Array<{name: string, criticality: string}>
  maximumDowntime?: string
  
  strategies: BusinessTypeStrategy[]
  riskVulnerabilities?: Array<{
    riskType: string
    vulnerabilityLevel: number
    impactSeverity: number
  }>
}

export interface BusinessTypeStrategy {
  id: string
  strategyId: string
  relevanceScore: number
  customNotes?: string
  isRecommended: boolean
  priority: string
  strategy: {
    name: string
    category: string
    description: string
    implementationCost: string
    effectiveness: number
  }
}

export interface ActionStep {
  id: string
  phase: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
  action: string // Technical action description
  smeAction: string // Simple, clear action for SME users
  timeframe: string
  responsibility: string
  resources: string[]
  cost: string
  estimatedCostJMD?: string // JMD cost estimate
  checklist?: string[] // Step-by-step checklist for SMEs
  helpVideo?: string // Optional help video URL
}

export interface Strategy {
  id: string
  strategyId: string
  name: string
  category: 'prevention' | 'preparation' | 'response' | 'recovery'
  description: string // Technical description for admin use
  smeDescription?: string // Simple, clear description for SME users
  whyImportant?: string // Plain language explanation of business value
  applicableRisks: string[]
  implementationCost: 'low' | 'medium' | 'high' | 'very_high'
  costEstimateJMD?: string // JMD cost range for SMEs
  implementationTime: 'hours' | 'days' | 'weeks' | 'months'
  timeToImplement?: string // User-friendly time description
  effectiveness: number // 1-10
  businessTypes: string[] // applicable business categories
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionSteps: ActionStep[]
  helpfulTips?: string[] // Tips for successful implementation
  commonMistakes?: string[] // What to avoid
  successMetrics?: string[] // How to measure success
  prerequisites?: string[] // What's needed before starting
  roi?: number // Return on investment estimate
}

export interface CombinedRisk {
  riskType: string
  locationRisk: number
  businessVulnerability: number
  combinedScore: number
  impactSeverity: number
  reasoning: string
  recommendations: string[]
}

// Common risk types used throughout the system
export const RISK_TYPES = [
  { key: 'hurricane', name: 'Hurricane', icon: '🌀' },
  { key: 'flood', name: 'Flood', icon: '🌊' },
  { key: 'earthquake', name: 'Earthquake', icon: '🏔️' },
  { key: 'drought', name: 'Drought', icon: '🌵' },
  { key: 'landslide', name: 'Landslide', icon: '⛰️' },
  { key: 'powerOutage', name: 'Power Outage', icon: '⚡' }
] as const

// Common strategy categories
export const STRATEGY_CATEGORIES = [
  { key: 'prevention', name: 'Prevention', icon: '🛡️', description: 'Proactive measures to prevent risks' },
  { key: 'preparation', name: 'Preparation', icon: '📋', description: 'Readiness and planning activities' },
  { key: 'response', name: 'Response', icon: '🚨', description: 'Immediate actions when risks occur' },
  { key: 'recovery', name: 'Recovery', icon: '🔄', description: 'Restoration and business continuity' }
] as const

// Common priority levels
export const PRIORITY_LEVELS = [
  { key: 'critical', name: 'Critical', description: 'Must do immediately', color: 'red' },
  { key: 'high', name: 'High', description: 'Important to do soon', color: 'orange' },
  { key: 'medium', name: 'Medium', description: 'Good to have', color: 'yellow' },
  { key: 'low', name: 'Low', description: 'Nice to have when possible', color: 'green' }
] as const

