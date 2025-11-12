// Centralized type definitions for admin2 section

export interface Parish {
  id: string
  name: string
  region: string
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

// New types for multi-country support
export interface Country {
  id: string
  name: string
  code: string
  region?: string
  isActive: boolean
  _count?: {
    adminUnits: number
  }
}

export interface AdminUnit {
  id: string
  name: string
  localName?: string
  type: string // 'parish', 'district', 'state', etc.
  region?: string
  countryId: string
  country?: Country
  population: number
  area?: number
  elevation?: number
  coordinates?: string
  isActive: boolean
  adminUnitRisk?: AdminUnitRisk
}

export interface AdminUnitRisk {
  id: string
  adminUnitId: string
  hurricaneLevel: number
  hurricaneNotes: string
  floodLevel: number
  floodNotes: string
  earthquakeLevel: number
  earthquakeNotes: string
  droughtLevel: number
  droughtNotes: string
  landslideLevel: number
  landslideNotes: string
  powerOutageLevel: number
  powerOutageNotes: string
  riskProfileJson: string
  lastUpdated: string
  updatedBy: string
}

export interface RiskData {
  level: number
  notes: string
}

export interface BusinessType {
  id: string
  businessTypeId: string
  name: string // Can be plain string or multilingual object
  category: string
  subcategory?: string
  description?: string // Can be plain string or multilingual object
  
  // Multilingual example content for wizard prefill (JSON arrays)
  // These are business-type-specific suggestions that help users understand what to enter
  exampleBusinessPurposes?: string[] | string // Array of examples or JSON string
  exampleProducts?: string[] | string
  exampleKeyPersonnel?: string[] | string
  exampleCustomerBase?: string[] | string
  minimumEquipment?: string[] | string
  
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

/**
 * Enhanced ActionStep interface for SME-focused Business Continuity Planning
 * Includes comprehensive guidance, validation, dependencies, and alternatives
 */
export interface ActionStep {
  id: string
  stepId?: string
  strategyId?: string
  phase: 'before' | 'during' | 'after'
  title: string
  action?: string // Technical action description (legacy)
  description: string
  smeAction: string // Simple, clear action for SME users
  sortOrder?: number
  
  // SME Context - Why this matters
  whyThisStepMatters?: string // Plain language importance explanation
  whatHappensIfSkipped?: string // Specific consequence if user skips
  
  // Timing & Difficulty
  timeframe?: string // Human-readable ("1-2 hours", "Within a week")
  estimatedMinutes?: number // Precise timing: 15, 30, 60, 120, etc.
  difficultyLevel?: 'easy' | 'medium' | 'hard'
  
  // Resources & Costs
  responsibility?: string
  estimatedCost?: string // Cost estimate string (e.g., "$400 USD", "$0")
  resources?: string[] // Required resources
  costItems?: Array<{
    id?: string
    itemId: string
    quantity: number
    customNotes?: string
    item?: {
      id: string
      itemId: string
      name: string
      description?: string
      category: string
      baseUSD: number
      baseUSDMin?: number
      baseUSDMax?: number
      unit?: string
    }
  }>
  checklist?: string[] // Step-by-step checklist
  
  // Validation & Completion
  howToKnowItsDone?: string // Clear completion criteria
  exampleOutput?: string // What "done" looks like
  
  // Dependencies
  dependsOnSteps?: string[] // stepIds that must complete first
  isOptional?: boolean // Can this be skipped?
  skipConditions?: string // When to skip
  
  // Alternatives for resource-limited SMEs
  freeAlternative?: string // Free way to do this
  lowTechOption?: string // Non-digital approach
  
  // Help Resources
  commonMistakesForStep?: string[] // Mistakes to avoid
  videoTutorialUrl?: string // YouTube or tutorial link
  externalResourceUrl?: string // External guide or template
  helpVideo?: string // Legacy field, use videoTutorialUrl
}

/**
 * Enhanced Strategy interface for SME-focused Business Continuity Planning
 * Includes benefit-driven content, personalization, wizard integration, and BCP document support
 */
export interface Strategy {
  id: string
  strategyId: string
  name: string // Admin-facing technical name
  description: string // Technical description for admin use
  
  // SME-Focused Content (benefit-driven, plain language)
  smeTitle?: string // Benefit-focused title (e.g., "Stay Connected During Emergencies")
  smeSummary?: string // 2-3 sentence plain language summary
  smeDescription?: string // DEPRECATED: Use smeSummary. Kept for backwards compatibility
  whyImportant?: string // DEPRECATED: Use benefitsBullets. Kept for backwards compatibility
  benefitsBullets?: string[] // Array of specific benefits
  realWorldExample?: string // Caribbean success story with real business names
  
  // Implementation Details (enhanced)
  implementationCost: 'low' | 'medium' | 'high' | 'very_high' // Categorical estimate for quick reference
  estimatedTotalHours?: number // Sum of all action step times
  complexityLevel?: 'simple' | 'moderate' | 'advanced'
  roi?: number // Return on investment estimate
  quickWinIndicator?: boolean // Fast + high impact = quick win
  
  // Calculated costs (computed from action step cost items)
  calculatedCostUSD?: number // Aggregated from action steps
  calculatedCostLocal?: number // In local currency
  
  // Wizard Integration (how strategy appears in wizard)
  defaultSelected?: boolean // Should wizard pre-check this?
  selectionTier?: 'essential' | 'recommended' | 'optional'
  requiredForRisks?: string[] // Risk IDs that make this mandatory
  priorityTier?: 'essential' | 'recommended' | 'optional' // Alias for selectionTier
  reasoning?: string // Why we recommend this (from scoring algorithm)
  
  // Guidance (consolidated)
  helpfulTips?: string[] // Tips for successful implementation
  commonMistakes?: string[] // What to avoid
  successMetrics?: string[] // How to measure success
  
  // Resource-Limited SME Support
  lowBudgetAlternative?: string // Cheaper approach
  diyApproach?: string // DIY instructions
  estimatedDIYSavings?: string // "Save JMD 10,000 by..."
  
  // BCP Document Integration
  bcpSectionMapping?: string // Which BCP section this fills
  bcpTemplateText?: string // Pre-written paragraph for BCP
  
  // Personalization
  industryVariants?: Record<string, string> // Industry-specific guidance
  businessSizeGuidance?: Record<string, string> // Size-specific guidance
  
  // Keep existing fields
  applicableRisks: string[] // Risk types this strategy addresses
  applicableBusinessTypes?: string[] // Business categories (null = all)
  businessTypes?: string[] // Alias for applicableBusinessTypes
  prerequisites?: string[] // Requirements before starting
  maintenanceRequirement?: 'low' | 'medium' | 'high'
  actionSteps: ActionStep[]
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
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
// Includes all 13 risk types (6 core + 7 dynamic)
export const RISK_TYPES = [
  { key: 'hurricane', name: 'Hurricane', icon: '🌀' },
  { key: 'flood', name: 'Flood', icon: '🌊' },
  { key: 'earthquake', name: 'Earthquake', icon: '🏔️' },
  { key: 'drought', name: 'Drought', icon: '🌵' },
  { key: 'landslide', name: 'Landslide', icon: '⛰️' },
  { key: 'powerOutage', name: 'Power Outage', icon: '⚡' },
  { key: 'fire', name: 'Fire', icon: '🔥' },
  { key: 'cyberAttack', name: 'Cyber Attack', icon: '💻' },
  { key: 'terrorism', name: 'Security Threats', icon: '🔒' },
  { key: 'pandemicDisease', name: 'Health Emergencies', icon: '🦠' },
  { key: 'economicDownturn', name: 'Economic Crisis', icon: '📉' },
  { key: 'supplyChainDisruption', name: 'Supply Chain Issues', icon: '🚛' },
  { key: 'civilUnrest', name: 'Civil Unrest', icon: '⚡' }
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

