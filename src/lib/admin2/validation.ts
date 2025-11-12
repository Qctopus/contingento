/**
 * Validation utilities for Admin2 API routes
 */

export interface ValidationResult {
  isValid: boolean
  errors?: string[]
}

/**
 * Helper to extract string value from multilingual content
 */
function extractStringValue(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') {
    // Check if it's a JSON string representing multilingual content
    if (value.trim().startsWith('{') && value.includes('"en"')) {
      try {
        const parsed = JSON.parse(value)
        if (parsed && typeof parsed === 'object' && parsed.en) {
          return parsed.en
        }
      } catch {
        // If parsing fails, return the original string
      }
    }
    return value
  }
  // If it's an object, try to get the 'en' value
  if (typeof value === 'object' && value !== null && value.en) {
    return value.en
  }
  return ''
}

/**
 * Validate strategy data before creating or updating
 */
export function validateStrategyData(data: any): ValidationResult {
  const errors: string[] = []
  
  // Required fields - handle multilingual content
  const nameValue = extractStringValue(data.name)
  if (!nameValue || nameValue.trim().length === 0) {
    errors.push('Strategy name is required')
  }
  
  if (nameValue && nameValue.length > 200) {
    errors.push('Strategy name must be less than 200 characters')
  }
  
  // Optional validation for category
  if (data.category) {
    const validCategories = ['preparation', 'prevention', 'response', 'recovery', 'mitigation']
    if (!validCategories.includes(data.category.toLowerCase())) {
      errors.push(`Category must be one of: ${validCategories.join(', ')}`)
    }
  }
  
  // Optional validation for effectiveness
  if (data.effectiveness !== undefined) {
    const effectiveness = Number(data.effectiveness)
    if (isNaN(effectiveness) || effectiveness < 0 || effectiveness > 10) {
      errors.push('Effectiveness must be a number between 0 and 10')
    }
  }
  
  // Optional validation for ROI
  if (data.roi !== undefined) {
    const roi = Number(data.roi)
    if (isNaN(roi) || roi < 0) {
      errors.push('ROI must be a positive number')
    }
  }
  
  // Optional validation for priority
  if (data.priority) {
    const validPriorities = ['low', 'medium', 'high', 'critical', 'essential']
    if (!validPriorities.includes(data.priority.toLowerCase())) {
      errors.push(`Priority must be one of: ${validPriorities.join(', ')}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Validate action step data before creating or updating
 */
export function validateActionStepData(data: any): ValidationResult {
  const errors: string[] = []
  
  // Required fields
  if (!data.smeAction && !data.action) {
    errors.push('Action step must have an action description')
  }
  
  if (!data.phase) {
    errors.push('Action step must have a phase (planning, implementation, or ongoing)')
  } else {
    const validPhases = ['planning', 'implementation', 'ongoing', 'maintenance']
    if (!validPhases.includes(data.phase.toLowerCase())) {
      errors.push(`Phase must be one of: ${validPhases.join(', ')}`)
    }
  }
  
  // Optional validation for sortOrder
  if (data.sortOrder !== undefined) {
    const sortOrder = Number(data.sortOrder)
    if (isNaN(sortOrder) || sortOrder < 0) {
      errors.push('Sort order must be a non-negative number')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Validate cost item data before creating or updating
 */
export function validateCostItemData(data: any): ValidationResult {
  const errors: string[] = []
  
  // Required fields
  if (!data.itemName || typeof data.itemName !== 'string' || data.itemName.trim().length === 0) {
    errors.push('Cost item name is required')
  }
  
  // Optional validation for costs
  if (data.baseUSD !== undefined) {
    const baseUSD = Number(data.baseUSD)
    if (isNaN(baseUSD) || baseUSD < 0) {
      errors.push('Base USD cost must be a non-negative number')
    }
  }
  
  if (data.baseUSDMin !== undefined) {
    const baseUSDMin = Number(data.baseUSDMin)
    if (isNaN(baseUSDMin) || baseUSDMin < 0) {
      errors.push('Minimum USD cost must be a non-negative number')
    }
  }
  
  if (data.baseUSDMax !== undefined) {
    const baseUSDMax = Number(data.baseUSDMax)
    if (isNaN(baseUSDMax) || baseUSDMax < 0) {
      errors.push('Maximum USD cost must be a non-negative number')
    }
  }
  
  // Validate min/max relationship
  if (data.baseUSDMin !== undefined && data.baseUSDMax !== undefined) {
    const min = Number(data.baseUSDMin)
    const max = Number(data.baseUSDMax)
    if (!isNaN(min) && !isNaN(max) && min > max) {
      errors.push('Minimum cost cannot be greater than maximum cost')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Validate business type data before creating or updating
 */
export function validateBusinessTypeData(data: any): ValidationResult {
  const errors: string[] = []
  
  // Required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Business type name is required')
  }
  
  if (data.name && data.name.length > 200) {
    errors.push('Business type name must be less than 200 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Validate parish data before creating or updating
 */
export function validateParishData(data: any): ValidationResult {
  const errors: string[] = []
  
  // Required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Parish name is required')
  }
  
  if (data.name && data.name.length > 200) {
    errors.push('Parish name must be less than 200 characters')
  }
  
  // Validate country code if provided
  if (data.countryCode) {
    if (typeof data.countryCode !== 'string' || data.countryCode.length !== 2) {
      errors.push('Country code must be a 2-letter ISO code (e.g., JM, BB)')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}
