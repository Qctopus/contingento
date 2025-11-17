/**
 * Helper Functions for Formal BCP Generation
 * Data extraction, filtering, and cost calculation utilities
 */

import type { WizardFormData, StrategyData, FormalBCPData } from '../../types/bcpExports'

// ============================================================================
// BUSINESS SIZE DETERMINATION
// ============================================================================

export interface ContentLimits {
  maxPages: number
  maxRisks: number
  maxStrategiesPerRisk: number
  maxActionsPerStrategy: number
  maxContacts: number
}

export function determineBusinessSize(employeeCount: number): 'micro' | 'small' | 'medium' {
  if (employeeCount <= 5) return 'micro'
  if (employeeCount <= 20) return 'small'
  return 'medium'
}

export function getContentLimits(businessSize: 'micro' | 'small' | 'medium'): ContentLimits {
  // NO LIMITS - Show all content the business owner selected
  // Document will naturally be 8-15 pages based on their actual risks and strategies
  const limits = {
    micro: {
      maxPages: 999, // No page limit
      maxRisks: 999, // Show all HIGH/EXTREME risks
      maxStrategiesPerRisk: 999, // Show all selected strategies
      maxActionsPerStrategy: 3, // Keep limited for readability (most critical actions)
      maxContacts: 999 // Show all contacts
    },
    small: {
      maxPages: 999,
      maxRisks: 999,
      maxStrategiesPerRisk: 999,
      maxActionsPerStrategy: 3,
      maxContacts: 999
    },
    medium: {
      maxPages: 999,
      maxRisks: 999,
      maxStrategiesPerRisk: 999,
      maxActionsPerStrategy: 3,
      maxContacts: 999
    }
  }
  
  return limits[businessSize]
}

// ============================================================================
// RISK FILTERING
// ============================================================================

export interface RiskData {
  hazardId: string
  hazardName: string
  likelihood: string
  impact: string
  riskScore: number
  riskLevel: string
  reasoning?: string
  isSelected: boolean
}

/**
 * Get HIGH and EXTREME priority risks
 * NO LIMITS - returns all HIGH/EXTREME risks the business identified
 */
export function getHighPriorityRisks(formData: WizardFormData, maxRisks?: number): RiskData[] {
  const risks = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
  
  const highPriorityRisks = risks
    .filter((r: any) => r.isSelected === true) // Only explicitly ticked risks
    .map((r: any) => ({
      hazardId: r.hazardId || r.id,
      hazardName: r.hazard || r.hazardName || r['Hazard Name'],
      likelihood: r.likelihood || r.Likelihood || '',
      impact: r.impact || r.Impact || '',
      riskScore: parseFloat(r.riskScore || r['Risk Score'] || r['risk_score'] || 0),
      riskLevel: r.riskLevel || r['Risk Level'] || getRiskLevel(parseFloat(r.riskScore || r['Risk Score'] || 0)),
      reasoning: r.reasoning || r.Reasoning || r.notes || '',
      isSelected: r.isSelected === true
    }))
    .filter(r => r.riskScore >= 6.0) // HIGH and EXTREME only (6.0+)
    .sort((a, b) => b.riskScore - a.riskScore) // Highest first
  
  // Ignore maxRisks - show ALL high-priority risks
  return highPriorityRisks
}

/**
 * Get all selected risks for summary table
 */
export function getAllSelectedRisks(formData: WizardFormData): RiskData[] {
  const risks = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
  
  return risks
    .filter((r: any) => r.isSelected === true) // Only explicitly ticked risks
    .map((r: any) => ({
      hazardId: r.hazardId || r.id,
      hazardName: r.hazard || r.hazardName || r['Hazard Name'],
      likelihood: r.likelihood || r.Likelihood || '',
      impact: r.impact || r.Impact || '',
      riskScore: parseFloat(r.riskScore || r['Risk Score'] || r['risk_score'] || 0),
      riskLevel: r.riskLevel || r['Risk Level'] || getRiskLevel(parseFloat(r.riskScore || r['Risk Score'] || 0)),
      reasoning: r.reasoning || r.Reasoning || r.notes || '',
      isSelected: r.isSelected === true
    }))
    .sort((a, b) => b.riskScore - a.riskScore)
}

/**
 * Determine risk level from score
 */
export function getRiskLevel(score: number): string {
  if (score >= 9.0) return 'Extreme'
  if (score >= 6.0) return 'High'
  if (score >= 3.0) return 'Medium'
  return 'Low'
}

// ============================================================================
// STRATEGY FILTERING
// ============================================================================

/**
 * Get strategies for a specific risk
 * NO LIMITS - returns all strategies the user selected for this risk
 */
export function getStrategiesForRisk(
  formData: WizardFormData,
  strategies: StrategyData[],
  hazardId: string,
  maxStrategies?: number
): StrategyData[] {
  // Get user-selected strategies
  const selectedStrategies = formData.STRATEGIES?.['Business Continuity Strategies'] || 
    formData.CONTINUITY_STRATEGIES?.selectedStrategies || []
  
  // Filter strategies that apply to this risk
  const relevantStrategies = strategies
    .filter(s => {
      const applicableRisks = s.applicableRisks || []
      return applicableRisks.includes(hazardId)
    })
    .filter(s => {
      // Check if this strategy was selected by the user
      return selectedStrategies.some((sel: any) => 
        sel.id === s.id || sel.strategyId === s.strategyId || sel.name === s.name
      )
    })
    .sort((a, b) => {
      // Sort by effectiveness first, then by priority
      if (b.effectiveness !== a.effectiveness) {
        return b.effectiveness - a.effectiveness
      }
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
    })
  
  // Ignore maxStrategies - show ALL selected strategies for this risk
  return relevantStrategies
}

/**
 * Get most critical action steps from a strategy
 */
export function getCriticalActions(actionSteps: any[], maxActions: number): any[] {
  if (!actionSteps || actionSteps.length === 0) return []
  
  // Priority order for phases
  const phaseOrder: Record<string, number> = { 
    immediate: 1, 
    short_term: 2, 
    prevention: 2,
    medium_term: 3, 
    response: 3,
    long_term: 4,
    recovery: 4,
    ongoing: 5
  }
  
  return actionSteps
    .sort((a, b) => {
      const orderA = phaseOrder[a.phase?.toLowerCase()] || 999
      const orderB = phaseOrder[b.phase?.toLowerCase()] || 999
      return orderA - orderB
    })
    .slice(0, maxActions)
}

// ============================================================================
// COST CALCULATIONS
// ============================================================================

/**
 * Parse cost from string (handles ranges like "JMD 50,000-100,000")
 */
export function parseCost(costStr: string): number {
  if (!costStr) return 0
  
  // Extract all numbers from the string
  const amounts = costStr.match(/[\d,]+/g)
  if (!amounts || amounts.length === 0) return 0
  
  // Parse and average if it's a range
  const numbers = amounts.map(a => parseInt(a.replace(/,/g, '')))
  const average = numbers.reduce((sum, val) => sum + val, 0) / numbers.length
  
  return Math.round(average)
}

/**
 * Estimate cost from implementation cost level
 */
export function estimateCostFromLevel(level: string): number {
  const costMap: Record<string, number> = {
    'low': 5000,
    'medium': 20000,
    'high': 50000,
    'very_high': 100000
  }
  
  return costMap[level?.toLowerCase()] || 10000
}

/**
 * Calculate total investment from strategies
 */
export function calculateTotalInvestment(
  strategies: StrategyData[],
  formData: WizardFormData
): number {
  let total = 0
  
  strategies.forEach(s => {
    // Try to get calculated cost first
    if (s.calculatedCostLocal && s.calculatedCostLocal > 0) {
      total += s.calculatedCostLocal
    } else if (s.implementationCost) {
      // Try parsing from cost string
      const parsed = parseCost(s.implementationCost)
      if (parsed > 0) {
        total += parsed
      } else {
        // Estimate from level
        total += estimateCostFromLevel(s.implementationCost)
      }
    } else {
      // Default fallback
      total += 10000
    }
  })
  
  return Math.round(total)
}

/**
 * Calculate investment by category
 */
export function calculateInvestmentByCategory(
  strategies: StrategyData[],
  formData: WizardFormData
): { prevention: number; response: number; recovery: number } {
  const categories = { prevention: 0, response: 0, recovery: 0 }
  
  strategies.forEach(s => {
    let cost = 0
    
    if (s.calculatedCostLocal && s.calculatedCostLocal > 0) {
      cost = s.calculatedCostLocal
    } else if (s.implementationCost) {
      const parsed = parseCost(s.implementationCost)
      cost = parsed > 0 ? parsed : estimateCostFromLevel(s.implementationCost)
    } else {
      cost = 10000
    }
    
    const category = s.category?.toLowerCase()
    if (category === 'prevention' || category === 'preparation') {
      categories.prevention += cost
    } else if (category === 'response') {
      categories.response += cost
    } else if (category === 'recovery') {
      categories.recovery += cost
    } else {
      // Default to prevention
      categories.prevention += cost
    }
  })
  
  return {
    prevention: Math.round(categories.prevention),
    response: Math.round(categories.response),
    recovery: Math.round(categories.recovery)
  }
}

// ============================================================================
// TEXT SIMPLIFICATION
// ============================================================================

/**
 * Simplify jargon for formal document (keep it professional but accessible)
 */
export function simplifyForFormalDocument(text: string | any): string {
  if (!text) return ''
  
  // CRITICAL FIX: Handle multilingual objects (extract English text)
  if (typeof text === 'object' && !Array.isArray(text)) {
    // Extract string from multilingual object
    const extracted = text.en || text.es || text.fr || JSON.stringify(text)
    if (typeof extracted !== 'string') return ''
    text = extracted
  }
  
  // Handle arrays
  if (Array.isArray(text)) {
    return text.length > 0 ? simplifyForFormalDocument(text[0]) : ''
  }
  
  // Ensure we have a string
  if (typeof text !== 'string') {
    return String(text)
  }
  
  const replacements: Record<string, string> = {
    'stakeholder': 'interested party',
    'leverage': 'use',
    'utilize': 'use',
    'facilitate': 'help',
    'implement': 'put in place',
    'execute': 'carry out',
    'synergy': 'working together',
    'paradigm': 'approach',
    'holistic': 'comprehensive'
  }
  
  let result = text
  for (const [complex, simple] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi')
    result = result.replace(regex, simple)
  }
  
  return result
}

// ============================================================================
// DATA EXTRACTION HELPERS
// ============================================================================

/**
 * Extract essential functions from form data
 */
export function extractEssentialFunctions(formData: WizardFormData, maxFunctions: number = 6): any[] {
  const functions: any[] = []
  
  // Try different possible structures
  const essentialFunctions = formData.ESSENTIAL_FUNCTIONS
  
  if (!essentialFunctions) return []
  
  // If it's an array, use it directly
  if (Array.isArray(essentialFunctions)) {
    return essentialFunctions.slice(0, maxFunctions)
  }
  
  // If it's an object with categories
  const categories = [
    'Core Business Operations',
    'Staff Management',
    'Financial Management',
    'Customer Relations',
    'Operational Support',
    'Supply Chain',
    'Technology'
  ]
  
  for (const category of categories) {
    const categoryFunctions = essentialFunctions[category]
    if (categoryFunctions) {
      if (Array.isArray(categoryFunctions)) {
        categoryFunctions.forEach((fn: any) => {
          if (typeof fn === 'string') {
            functions.push({ functionName: category, description: fn })
          } else if (fn.function || fn.name) {
            functions.push({
              functionName: fn.function || fn.name,
              description: fn.description || fn.function || fn.name
            })
          }
        })
      }
    }
    
    if (functions.length >= maxFunctions) break
  }
  
  return functions.slice(0, maxFunctions)
}

/**
 * Extract contacts from form data
 */
export function extractContacts(formData: WizardFormData, category: string, maxContacts: number = 5): any[] {
  const contactsData = formData.CONTACTS_AND_INFORMATION
  if (!contactsData) return []
  
  const contacts = contactsData[category] || []
  
  if (Array.isArray(contacts)) {
    return contacts.slice(0, maxContacts)
  }
  
  return []
}

/**
 * Extract vital records
 */
export function extractVitalRecords(formData: WizardFormData, maxRecords: number = 8): any[] {
  const vitalRecords = formData.VITAL_RECORDS?.['Vital Records'] || []
  
  if (Array.isArray(vitalRecords)) {
    return vitalRecords.slice(0, maxRecords)
  }
  
  return []
}

/**
 * Format currency - supports multiple Caribbean currencies
 */
export function formatCurrency(amount: number, currency: string = 'JMD'): string {
  return `${currency} ${amount.toLocaleString('en-US')}`
}

/**
 * Format currency for JMD (Jamaica)
 */
export function formatCurrencyJMD(amount: number): string {
  return formatCurrency(amount, 'JMD')
}

/**
 * Get currency from country or default to JMD
 */
export function getCurrencyFromCountry(country: string): string {
  const currencyMap: Record<string, string> = {
    'Jamaica': 'JMD',
    'Barbados': 'BBD',
    'Trinidad': 'TTD',
    'Tobago': 'TTD',
    'Grenada': 'XCD',
    'St. Lucia': 'XCD',
    'Saint Lucia': 'XCD',
    'Dominica': 'XCD',
    'St. Vincent': 'XCD',
    'Antigua': 'XCD',
    'St. Kitts': 'XCD',
    'Bahamas': 'BSD',
    'Belize': 'BZD',
    'Guyana': 'GYD',
    'Suriname': 'SRD'
  }
  
  for (const [countryName, curr] of Object.entries(currencyMap)) {
    if (country.includes(countryName)) {
      return curr
    }
  }
  
  return 'JMD' // Default to Jamaica
}

/**
 * Extract competitive advantages from business overview
 */
export function extractCompetitiveAdvantages(formData: WizardFormData): string[] {
  const overview = formData.BUSINESS_OVERVIEW
  if (!overview) return []
  
  // Check for explicit competitive advantages field
  const advantages = overview['Competitive Advantages'] || overview['What Makes Us Special']
  
  if (typeof advantages === 'string') {
    // Split by common delimiters
    return advantages
      .split(/[;,\n]/)
      .map(a => a.trim())
      .filter(a => a.length > 0)
      .slice(0, 3)
  }
  
  if (Array.isArray(advantages)) {
    return advantages.slice(0, 3)
  }
  
  // Try to extract from products and services description
  const productsServices = overview['Products and Services']
  if (typeof productsServices === 'string') {
    const sentences = productsServices.split(/[.!?]/).filter(s => s.trim().length > 0)
    return sentences.slice(0, 3).map(s => s.trim())
  }
  
  return []
}

/**
 * Get mitigation status for a risk based on whether strategies are selected
 */
export function getMitigationStatus(
  hazardId: string,
  strategies: StrategyData[],
  formData: WizardFormData
): string {
  const relevantStrategies = getStrategiesForRisk(formData, strategies, hazardId)
  
  if (relevantStrategies.length === 0) return 'Planned'
  if (relevantStrategies.length < 2) return 'In Progress'
  return 'Addressed'
}

// ============================================================================
// ADDRESS PARSING
// ============================================================================

/**
 * Extract parish and country from address
 */
export function parseAddress(address: string): { parish: string; country: string; fullAddress: string } {
  if (!address) return { parish: '', country: '', fullAddress: '' }
  
  // Common Caribbean countries
  const countries = ['Jamaica', 'Barbados', 'Trinidad', 'Tobago', 'Grenada', 'St. Lucia', 'Dominica']
  
  let country = ''
  for (const c of countries) {
    if (address.includes(c)) {
      country = c
      break
    }
  }
  
  // Try to extract parish (usually appears before country)
  const parts = address.split(',').map(p => p.trim())
  let parish = ''
  
  if (parts.length >= 2) {
    // Usually the second-to-last part is the parish/city
    parish = parts[parts.length - 2]
  }
  
  return {
    parish,
    country,
    fullAddress: address
  }
}

