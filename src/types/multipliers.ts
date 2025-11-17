// Types for Risk Multiplier system

export interface RiskMultiplier {
  id: string
  name: string
  description: string
  characteristicType: string
  conditionType: 'boolean' | 'threshold' | 'range'
  thresholdValue?: number | null
  minValue?: number | null
  maxValue?: number | null
  multiplierFactor: number
  applicableHazards: string | string[] // JSON array string or already parsed array
  isActive: boolean
  priority: number
  reasoning?: string | null
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface BusinessCharacteristics {
  // Location facts
  location_coastal: boolean        // Within 5km of coast
  location_urban: boolean          // In urban/city area
  location_flood_prone?: boolean   // In known flood zone
  
  // Revenue/dependency facts (0-100%)
  tourism_share: number            // % of revenue from tourists
  local_customer_share: number     // % from local customers
  export_share: number             // % from exports/international
  
  // Operations facts (0-100% = cannot operate without)
  digital_dependency: number       // Cannot operate without digital systems
  power_dependency: number         // Cannot operate without electricity
  water_dependency: number         // Cannot operate without running water
  
  // Supply chain facts (boolean)
  supply_chain_complex: boolean    // International suppliers or JIT inventory
  perishable_goods: boolean        // Sells perishable goods
  just_in_time_inventory: boolean  // Uses JIT inventory
  
  // Timing facts
  seasonal_business: boolean       // Revenue concentrated in certain months
  peak_season_months?: string[]    // Which months are peak
  
  // Physical facts (boolean)
  physical_asset_intensive: boolean // Significant machinery/equipment value
  own_building: boolean             // Owns business premises
}

export interface AppliedMultiplier {
  name: string
  factor: number
  reasoning: string
}

export interface MultiplierApplicationResult {
  baseScore: number
  finalScore: number
  appliedMultipliers: AppliedMultiplier[]
  reasoning: string
}

// For admin UI
export interface MultiplierFormData {
  name: string
  description: string
  characteristicType: string
  conditionType: 'boolean' | 'threshold' | 'range'
  thresholdValue?: number
  minValue?: number
  maxValue?: number
  multiplierFactor: number
  applicableHazards: string[]
  priority: number
  reasoning?: string
  isActive: boolean
}

// Available characteristic types for UI dropdowns
// Maps to wizard questions that users answer
export const CHARACTERISTIC_TYPES = [
  { 
    value: 'location_coastal', 
    label: 'Coastal Location', 
    inputType: 'boolean',
    wizardQuestion: 'Location: Is your business within 5km of the coast?',
    wizardAnswers: 'Yes/No (from parish data or user confirmation)'
  },
  { 
    value: 'location_urban', 
    label: 'Urban Location', 
    inputType: 'boolean',
    wizardQuestion: 'Location: Is your business in an urban/city area?',
    wizardAnswers: 'Yes/No (from parish data)'
  },
  { 
    value: 'location_flood_prone', 
    label: 'Flood-Prone Area', 
    inputType: 'boolean',
    wizardQuestion: 'Location: Is your business in a flood-prone area?',
    wizardAnswers: 'Yes/No (from parish flood risk level > 7)'
  },
  { 
    value: 'tourism_share', 
    label: 'Tourism Revenue Share', 
    inputType: 'percentage',
    wizardQuestion: 'Customer Base: What is your customer mix?',
    wizardAnswers: 'Mainly tourists (80%) / Mix (40%) / Mainly locals (10%)'
  },
  { 
    value: 'local_customer_share', 
    label: 'Local Customer Share', 
    inputType: 'percentage',
    wizardQuestion: 'Customer Base: What is your customer mix?',
    wizardAnswers: 'Mainly tourists (15%) / Mix (50%) / Mainly locals (85%)'
  },
  { 
    value: 'export_share', 
    label: 'Export/International Share', 
    inputType: 'percentage',
    wizardQuestion: 'Revenue: Do you export or sell internationally?',
    wizardAnswers: 'Currently fixed at 5% (can be enhanced later)'
  },
  { 
    value: 'digital_dependency', 
    label: 'Digital System Dependency', 
    inputType: 'percentage',
    wizardQuestion: 'Operations: How dependent is your business on digital systems (computers, POS, internet)?',
    wizardAnswers: 'Essential (95%) / Helpful (50%) / Not used (10%)'
  },
  { 
    value: 'power_dependency', 
    label: 'Electricity Dependency', 
    inputType: 'percentage',
    wizardQuestion: 'Operations: Can you operate without electricity?',
    wizardAnswers: 'Cannot operate (95%) / Partially (50%) / Can operate (10%)'
  },
  { 
    value: 'water_dependency', 
    label: 'Water Dependency', 
    inputType: 'percentage',
    wizardQuestion: 'Products: Do you sell perishable goods that require water?',
    wizardAnswers: 'Yes (90%) / No (30%)'
  },
  { 
    value: 'supply_chain_complex', 
    label: 'Complex Supply Chain', 
    inputType: 'boolean',
    wizardQuestion: 'Supply Chain: Check all that apply',
    wizardAnswers: 'True if: Imports from overseas OR minimal inventory OR perishable goods'
  },
  { 
    value: 'perishable_goods', 
    label: 'Perishable Goods', 
    inputType: 'boolean',
    wizardQuestion: 'Products: Do you sell perishable goods (food, flowers, etc.)?',
    wizardAnswers: 'Yes/No'
  },
  { 
    value: 'just_in_time_inventory', 
    label: 'Just-in-Time Inventory', 
    inputType: 'boolean',
    wizardQuestion: 'Inventory: Do you keep minimal inventory (order as needed)?',
    wizardAnswers: 'Yes/No'
  },
  { 
    value: 'seasonal_business', 
    label: 'Seasonal Business', 
    inputType: 'boolean',
    wizardQuestion: 'Business Pattern: Is your revenue seasonal (concentrated in certain months)?',
    wizardAnswers: 'Yes/No (from business type data)'
  },
  { 
    value: 'physical_asset_intensive', 
    label: 'Physical Asset Intensive', 
    inputType: 'boolean',
    wizardQuestion: 'Assets: Do you have expensive equipment or machinery?',
    wizardAnswers: 'Yes/No'
  },
  { 
    value: 'own_building', 
    label: 'Own Building', 
    inputType: 'boolean',
    wizardQuestion: 'Property: Do you own your business premises?',
    wizardAnswers: 'Yes/No'
  },
] as const

// Available hazard types
// IMPORTANT: Includes both snake_case and camelCase variants for compatibility
export const HAZARD_TYPES = [
  'hurricane',
  'flood',
  'earthquake',
  'drought',
  'landslide',
  'powerOutage',
  'power_outage',  // snake_case variant
  'fire',
  'cyberAttack',
  'cyber_attack',  // snake_case variant
  'terrorism',
  'pandemicDisease',
  'pandemic',  // snake_case variant
  'economicDownturn',
  'economic_downturn',  // snake_case variant
  'supplyChainDisruption',
  'supply_chain_disruption',  // snake_case variant
  'civilUnrest',
  'civil_unrest',  // snake_case variant
] as const



