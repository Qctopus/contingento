/**
 * Validation schemas and utilities for Admin2 API
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate Parish data
 */
export function validateParishData(data: any): ValidationResult {
  const errors: string[] = []
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Parish name is required and must be a non-empty string')
  }
  
  if (!data.region || typeof data.region !== 'string' || data.region.trim().length === 0) {
    errors.push('Parish region is required and must be a non-empty string')
  }
  
  if (typeof data.population !== 'number' || data.population < 0) {
    errors.push('Population must be a non-negative number')
  }
  
  // Validate risk profile if provided
  if (data.riskProfile) {
    const riskErrors = validateRiskProfile(data.riskProfile)
    errors.push(...riskErrors)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate risk profile data
 */
function validateRiskProfile(riskProfile: any): string[] {
  const errors: string[] = []
  const riskTypes = ['hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage']
  
  for (const riskType of riskTypes) {
    const risk = riskProfile[riskType]
    if (risk) {
      if (typeof risk.level !== 'number' || risk.level < 0 || risk.level > 10) {
        errors.push(`${riskType} level must be a number between 0 and 10`)
      }
      
      if (risk.notes && typeof risk.notes !== 'string') {
        errors.push(`${riskType} notes must be a string`)
      }
    }
  }
  
  return errors
}

/**
 * Validate BusinessType data
 */
export function validateBusinessTypeData(data: any): ValidationResult {
  const errors: string[] = []
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Business type name is required and must be a non-empty string')
  }
  
  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    errors.push('Business type category is required and must be a non-empty string')
  }
  
  // Validate numeric fields
  const numericFields = [
    'seasonalityFactor', 'touristDependency', 'supplyChainComplexity',
    'digitalDependency', 'physicalAssetIntensity', 'customerConcentration', 'regulatoryBurden'
  ]
  
  for (const field of numericFields) {
    if (data[field] !== undefined && data[field] !== null) {
      if (typeof data[field] !== 'number' || data[field] < 0 || data[field] > 10) {
        errors.push(`${field} must be a number between 0 and 10`)
      }
    }
  }
  
  // Validate risk vulnerabilities if provided
  if (data.riskVulnerabilities && Array.isArray(data.riskVulnerabilities)) {
    for (let i = 0; i < data.riskVulnerabilities.length; i++) {
      const rv = data.riskVulnerabilities[i]
      
      if (!rv.riskType || typeof rv.riskType !== 'string') {
        errors.push(`Risk vulnerability ${i + 1}: riskType is required and must be a string`)
      }
      
      if (typeof rv.vulnerabilityLevel !== 'number' || rv.vulnerabilityLevel < 0 || rv.vulnerabilityLevel > 10) {
        errors.push(`Risk vulnerability ${i + 1}: vulnerabilityLevel must be a number between 0 and 10`)
      }
      
      if (typeof rv.impactSeverity !== 'number' || rv.impactSeverity < 0 || rv.impactSeverity > 10) {
        errors.push(`Risk vulnerability ${i + 1}: impactSeverity must be a number between 0 and 10`)
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate Strategy data
 */
export function validateStrategyData(data: any): ValidationResult {
  const errors: string[] = []
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Strategy name is required and must be a non-empty string')
  }
  
  if (!data.category || typeof data.category !== 'string') {
    errors.push('Strategy category is required and must be a string')
  }
  
  const validCategories = ['prevention', 'preparation', 'response', 'recovery']
  if (data.category && !validCategories.includes(data.category)) {
    errors.push(`Strategy category must be one of: ${validCategories.join(', ')}`)
  }
  
  const validCosts = ['low', 'medium', 'high', 'very_high']
  if (data.implementationCost && !validCosts.includes(data.implementationCost)) {
    errors.push(`Implementation cost must be one of: ${validCosts.join(', ')}`)
  }
  
  const validTimes = ['hours', 'days', 'weeks', 'months']
  if (data.implementationTime && !validTimes.includes(data.implementationTime)) {
    errors.push(`Implementation time must be one of: ${validTimes.join(', ')}`)
  }
  
  if (data.effectiveness !== undefined) {
    if (typeof data.effectiveness !== 'number' || data.effectiveness < 1 || data.effectiveness > 10) {
      errors.push('Effectiveness must be a number between 1 and 10')
    }
  }
  
  if (data.roi !== undefined) {
    if (typeof data.roi !== 'number' || data.roi < 0) {
      errors.push('ROI must be a non-negative number')
    }
  }
  
  // Validate arrays
  if (data.applicableRisks && !Array.isArray(data.applicableRisks)) {
    errors.push('Applicable risks must be an array')
  }
  
  if (data.applicableBusinessTypes && !Array.isArray(data.applicableBusinessTypes)) {
    errors.push('Applicable business types must be an array')
  }
  
  if (data.prerequisites && !Array.isArray(data.prerequisites)) {
    errors.push('Prerequisites must be an array')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: any): string {
  if (typeof input !== 'string') return ''
  return input.trim().substring(0, 1000) // Limit length to prevent abuse
}

/**
 * Sanitize and validate array input
 */
export function sanitizeArray(input: any, maxLength: number = 100): any[] {
  if (!Array.isArray(input)) return []
  return input.slice(0, maxLength) // Limit array length
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: any, min: number = 0, max: number = 10): number {
  const num = Number(input)
  if (isNaN(num)) return min
  return Math.max(min, Math.min(max, num))
}
