// Core data types for industry-based pre-filling

export interface LocationData {
  country: string
  countryCode: string
  parish?: string
  region?: string
  nearCoast: boolean
  urbanArea: boolean
}

export interface IndustryProfile {
  id: string
  name: string
  localName: string
  category: 'retail' | 'hospitality' | 'services' | 'agriculture' | 'manufacturing' | 'tourism' | 'other'
  commonHazards: string[]
  essentialFunctions: {
    core: string[]
    support: string[]
    administrative: string[]
  }
  criticalSuppliers: string[]
  minimumResources: {
    staff: string
    equipment: string[]
    utilities: string[]
    space: string
  }
  typicalOperatingHours: string
  examples: {
    businessPurpose: string[]
    productsServices: string[]
    uniqueSellingPoints: string[]
    keyPersonnel: string[]
    minimumResourcesExamples: string[]
    customerBase: string[]
  }
}

export interface HazardRiskLevel {
  hazardId: string
  hazardName: string
  riskLevel: 'low' | 'medium' | 'high' | 'very_high'
  frequency: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain'
  impact: 'minimal' | 'minor' | 'moderate' | 'major' | 'catastrophic'
}

export interface LocationHazards {
  country: string
  countryCode: string
  baseHazards: HazardRiskLevel[]
  parishSpecific?: {
    [parish: string]: HazardRiskLevel[]
  }
  coastalModifiers?: HazardRiskLevel[]
  urbanModifiers?: HazardRiskLevel[]
}

export interface PreFillData {
  industry: IndustryProfile
  location: LocationData
  hazards: HazardRiskLevel[]
  preFilledFields: {
    [stepId: string]: {
      [fieldName: string]: any
    }
  }
  contextualExamples: {
    [stepId: string]: {
      [fieldName: string]: string[]
    }
  }
  recommendedStrategies: {
    prevention: string[]
    response: string[]
    recovery: string[]
  }
} 