/**
 * Formal BCP Preview Component
 * Browser-based preview showing what will be in the formal BCP document
 * Professional format suitable for bank loan submissions
 */

import React from 'react'
import { calculateStrategyTimeFromSteps, formatHoursToDisplay, validateActionStepTimeframes } from '@/utils/timeCalculation'
import { getLocalizedText } from '@/utils/localizationUtils'
import type { Locale } from '@/i18n/config'

// Import translation messages for UI labels
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import frMessages from '@/messages/fr.json'

// Translation helper for UI labels
const getUIText = (key: string, locale: Locale): string => {
  const messages = locale === 'es' ? esMessages : locale === 'fr' ? frMessages : enMessages
  // Navigate nested key path (e.g., "common.name" or "preview.businessOverview")
  const keys = key.split('.')
  let value: any = messages
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return key // Return key if translation not found
    }
  }
  return typeof value === 'string' ? value : key
}

interface FormalBCPPreviewProps {
  formData: any
  strategies: any[]
  risks: any[]
  countryCode?: string  // Optional: country code for currency detection
  locale?: Locale  // Optional: locale for multilingual content ('en', 'es', 'fr')
}

export const FormalBCPPreview: React.FC<FormalBCPPreviewProps> = ({
  formData,
  strategies,
  risks,
  countryCode: propCountryCode,
  locale: propLocale
}) => {
  // Determine locale - default to 'en' if not provided
  const currentLocale: Locale = (propLocale || 'en') as Locale
  // ============================================================================
  // ENHANCED DEBUGGING - Track complete data flow
  // ============================================================================
  console.log('[FormalBCPPreview] ========================================')
  console.log('[FormalBCPPreview] Received props:', {
    strategiesCount: strategies.length,
    risksCount: risks.length,
    hasFormData: !!formData
  })
  
  console.log('[FormalBCPPreview] Individual strategy details:', 
    strategies.map((s, idx) => ({
      index: idx + 1,
      name: s.name || s.smeTitle || 'Unnamed',
      hasCalculatedCost: !!s.calculatedCostLocal,
      calculatedCostLocal: s.calculatedCostLocal,
      currencySymbol: s.currencySymbol,
      currencyCode: s.currencyCode,
      implementationCost: s.implementationCost,
      applicableRisks: s.applicableRisks,
      applicableRisksCount: s.applicableRisks?.length || 0
    }))
  )
  
  console.log('[FormalBCPPreview] Strategy cost summary:', {
    withCalculatedCost: strategies.filter(s => s.calculatedCostLocal > 0).length,
    withCurrencyData: strategies.filter(s => s.currencySymbol && s.currencyCode).length,
    withImplementationCost: strategies.filter(s => s.implementationCost).length,
    totalStrategies: strategies.length
  })
  
  // DIAGNOSTIC: Show all unique risk IDs from strategies
  console.log('[FormalBCPPreview] All applicableRisks IDs from strategies:', 
    [...new Set(strategies.flatMap(s => s.applicableRisks || []))].sort()
  )
  
  // Enhanced helper to safely extract string from multilingual or simple field
  const getStringValue = (value: any, locale: string = currentLocale): string => {
    if (!value) return ''
    
    // Handle simple strings
    if (typeof value === 'string') {
      // Try to parse as JSON if it looks like multilingual content
      if (value.startsWith('{') && (value.includes('"en":') || value.includes('"es":') || value.includes('"fr":'))) {
        try {
          const parsed = JSON.parse(value)
          return getStringValue(parsed, locale)
        } catch {
          // If parsing fails, return original string
          return value
        }
      }
      return value
    }
    
    // Handle multilingual objects
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Try requested locale first
      if (value[locale] && typeof value[locale] === 'string') return value[locale]
      // Fallback chain: en -> es -> fr -> first available
      if (value.en) return value.en
      if (value.es) return value.es
      if (value.fr) return value.fr
      // Get first non-empty value
      const firstValue = Object.values(value).find(v => v && typeof v === 'string')
      if (firstValue) return firstValue as string
    }
    
    // Handle numbers
    if (typeof value === 'number') return String(value)
    
    // Handle arrays (take first element)
    if (Array.isArray(value) && value.length > 0) {
      return getStringValue(value[0], locale)
    }
    
    // Last resort
    return String(value)
  }

  // Detect user's currency from their country selection (NOT from address parsing!)
  const detectCurrency = () => {
    // Get the country they selected in the wizard dropdown
    let countryCode = 'JM' // Default to Jamaica
    let countryName = 'Jamaica'
    
    // PRIORITY 1: Use countryCode passed as prop from BusinessPlanReview
    if (propCountryCode) {
      countryCode = propCountryCode
      console.log('[FormalBCPPreview] Using countryCode from prop:', countryCode)
    } else {
      // PRIORITY 2: Try to get from localStorage prefill data (set during industry/location selection)
      if (typeof window !== 'undefined') {
        try {
          const preFillData = localStorage.getItem('bcp-prefill-data')
          if (preFillData) {
            const data = JSON.parse(preFillData)
            if (data.location?.countryCode) {
              countryCode = data.location.countryCode
              countryName = data.location.country || countryName
              console.log('[FormalBCPPreview] Using countryCode from localStorage:', countryCode)
            }
          }
        } catch (e) {
          console.warn('[FormalBCPPreview] Could not load country from prefill data:', e)
        }
      }
    }
    
    // Map country code to currency
    const currencyByCode: Record<string, { code: string; symbol: string; country: string }> = {
      'JM': { code: 'JMD', symbol: 'J$', country: 'Jamaica' },
      'TT': { code: 'TTD', symbol: 'TT$', country: 'Trinidad and Tobago' },
      'BB': { code: 'BBD', symbol: 'Bds$', country: 'Barbados' },
      'BS': { code: 'BSD', symbol: 'B$', country: 'Bahamas' },
      'HT': { code: 'HTG', symbol: 'G', country: 'Haiti' },
      'DO': { code: 'DOP', symbol: 'RD$', country: 'Dominican Republic' },
      'GD': { code: 'XCD', symbol: 'EC$', country: 'Grenada' },
      'LC': { code: 'XCD', symbol: 'EC$', country: 'Saint Lucia' },
      'AG': { code: 'XCD', symbol: 'EC$', country: 'Antigua and Barbuda' },
      'VC': { code: 'XCD', symbol: 'EC$', country: 'Saint Vincent and the Grenadines' },
      'DM': { code: 'XCD', symbol: 'EC$', country: 'Dominica' },
      'KN': { code: 'XCD', symbol: 'EC$', country: 'Saint Kitts and Nevis' },
    }
    
    const currencyData = currencyByCode[countryCode] || currencyByCode['JM']
    
    return {
      country: countryName,
      countryCode: countryCode,
      code: currencyData.code,
      symbol: currencyData.symbol
    }
  }

  const currencyInfo = detectCurrency()
  
  // Log detected currency (after function is defined)
  console.log('[FormalBCPPreview] Detected currency:', {
    countryCode: currencyInfo.countryCode,
    currencyCode: currencyInfo.code,
    currencySymbol: currencyInfo.symbol,
    country: currencyInfo.country
  })

  // Format currency with proper symbol and thousands separators (symbol only, no code suffix)
  const formatCurrency = (amount: number, currency: { code: string; symbol: string } = currencyInfo): string => {
    if (amount === 0 || isNaN(amount)) return 'Cost TBD'
    
    const formatted = Math.round(amount).toLocaleString('en-US')
    return `${currency.symbol}${formatted}`
  }

  // Parse cost string to get numeric value
  const parseCostString = (costStr: string): number => {
    if (!costStr) return 0
    
    const amounts = costStr.match(/[\d,]+/g)
    if (!amounts || amounts.length === 0) return 0
    
    const numbers = amounts.map((a: string) => parseInt(a.replace(/,/g, '')))
    return numbers.reduce((sum, val) => sum + val, 0) / numbers.length
  }

  // Extract business type from industry selection
  const getBusinessType = (): string => {
    // Try from prefill data first
    if (formData.BUSINESS_CHARACTERISTICS?.industry?.name) {
      return getStringValue(formData.BUSINESS_CHARACTERISTICS.industry.name)
    }
    
    // Try from localStorage (browser context only)
    if (typeof window !== 'undefined') {
      try {
        const industryData = localStorage.getItem('bcp-industry-selected')
        if (industryData) {
          const industry = JSON.parse(industryData)
          if (industry?.name) {
            return getStringValue(industry.name)
          }
        }
      } catch (e) {
        // Silently fail
      }
    }
    
    // Fallback: try to infer from business purpose
    const purpose = getStringValue(formData.BUSINESS_OVERVIEW?.['Business Purpose'] || '').toLowerCase()
    if (purpose.includes('hotel') || purpose.includes('resort') || purpose.includes('accommodation')) {
      return 'Hospitality & Tourism'
    }
    if (purpose.includes('restaurant') || purpose.includes('food') || purpose.includes('dining')) {
      return 'Food & Beverage'
    }
    if (purpose.includes('retail') || purpose.includes('store') || purpose.includes('shop')) {
      return 'Retail'
    }
    
    return 'Small Business'
  }
  
  // Extract key business information
  const companyName = getStringValue(formData.PLAN_INFORMATION?.['Company Name'] || formData.BUSINESS_OVERVIEW?.['Company Name'] || 'Your Business')
  const planManager = getStringValue(formData.PLAN_INFORMATION?.['Plan Manager'] || 'Not specified')
  
  // FIX: Business Address should come from PLAN_INFORMATION first
  const businessAddress = getStringValue(
    formData.PLAN_INFORMATION?.['Business Address'] || 
    formData.BUSINESS_OVERVIEW?.['Business Address'] || 
    ''
  )
  
  // FIX: Business Type extracted from industry selection
  const businessType = getBusinessType()
  
  // Optional fields - may not be in wizard yet
  const yearsInOperation = getStringValue(formData.BUSINESS_OVERVIEW?.['Years in Operation'] || '')
  const totalPeople = getStringValue(formData.BUSINESS_OVERVIEW?.['Total People in Business'] || '')
  const annualRevenue = getStringValue(formData.BUSINESS_OVERVIEW?.['Approximate Annual Revenue'] || '')
  
  // Parse location
  const addressParts = businessAddress.split(',').map((s: string) => s.trim())
  const parish = addressParts.length > 1 ? addressParts[addressParts.length - 2] : ''
  const country = addressParts.length > 0 ? addressParts[addressParts.length - 1] : ''
  
  // Get business purpose
  const businessPurpose = getStringValue(formData.BUSINESS_OVERVIEW?.['Business Purpose'] || '')
  
  // Get competitive advantages with multilingual support
  const advantages = formData.BUSINESS_OVERVIEW?.['Competitive Advantages']
  const competitiveAdvantages = Array.isArray(advantages) 
    ? advantages.map(a => getStringValue(a)).filter(Boolean)
    : typeof advantages === 'string'
    ? [getStringValue(advantages)]
    : typeof advantages === 'object' && advantages !== null
    ? [getStringValue(advantages)] // Handle single multilingual object
    : []
  
  // Get essential functions with multilingual support
  const essentialFunctions = (formData.ESSENTIAL_FUNCTIONS?.['Functions'] || [])
    .map((func: any) => ({
      name: getStringValue(func.name || func.functionName || func.function),
      description: getStringValue(func.description || '')
    }))
    .filter(f => f.name) // Only include if has a name

  const topFunctions = essentialFunctions.slice(0, 6)
  
  // Get ALL functions with their priorities and downtime data
  const functionsWithPriorities = (formData.ESSENTIAL_FUNCTIONS?.['Function Priorities'] || [])
    .map((func: any) => ({
      name: getStringValue(func.functionName || func.name || func.function),
      priority: func.priority || func.priorityLevel || 'N/A',
      maxDowntime: getStringValue(func.maxDowntime || func.maximumDowntime || ''),
      impact: getStringValue(func.impact || func.impactNotes || ''),
      rto: getStringValue(func.rto || func.recoveryTimeObjective || ''),
      rpo: getStringValue(func.rpo || func.recoveryPointObjective || ''),
      recoveryStrategy: getStringValue(func.recoveryStrategy || '')
    }))
    .filter(f => f.name) // Only include if has a name
  
  // Get target markets
  const targetMarkets = formData.BUSINESS_OVERVIEW?.['Target Markets'] || 
                       formData.BUSINESS_OVERVIEW?.['Primary Customers'] || []
  
  // Get full products/services list
  const productsServices = formData.BUSINESS_OVERVIEW?.['Products and Services'] || 
                          formData.BUSINESS_OVERVIEW?.['Key Products/Services'] || ''
  
  // Get risk matrix with proper filtering
  const riskMatrixRaw = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
  
  console.log('[FormalBCPPreview] Raw riskMatrix from formData:', {
    total: riskMatrixRaw.length,
    sample: riskMatrixRaw[0] ? {
      hazardId: riskMatrixRaw[0].hazardId,
      hazardName: riskMatrixRaw[0].hazardName,
      Hazard: riskMatrixRaw[0].Hazard,
      isSelected: riskMatrixRaw[0].isSelected
    } : null
  })
  
  const riskMatrix = riskMatrixRaw
    .filter((r: any) => r.isSelected === true) // CRITICAL: Only show explicitly ticked risks
    .map((r: any) => {
      // FIX: Extract impact - try multiple field names including Severity
      let impactText = getStringValue(r.impact || r.Impact || r.severity || r.Severity || '')
      
      // If impact is numeric, convert to text
      const impactNum = parseFloat(r.impact || r.Impact || r.severityScore || r.severity || 0)
      if (!impactText && impactNum > 0) {
        if (impactNum >= 7) impactText = 'Severe (7-9)'
        else if (impactNum >= 5) impactText = 'Major (5-6)'
        else if (impactNum >= 3) impactText = 'Moderate (3-4)'
        else impactText = 'Minor (1-2)'
      }
      
      // Extract hazard name - try multiple field names
      const hazardNameRaw = r.hazardName || r.Hazard || r.hazard || r.name || ''
      const hazardName = hazardNameRaw ? getStringValue(hazardNameRaw) : 'Unnamed Risk'
      
      // If still showing as JSON, try to parse it
      let finalHazardName = hazardName
      if (hazardName.includes('{') && hazardName.includes('"en":')) {
        try {
          const parsed = JSON.parse(hazardName)
          finalHazardName = getStringValue(parsed)
        } catch {
          // If parsing fails, try to extract from the string
          const match = hazardName.match(/"en"\s*:\s*"([^"]+)"/)
          if (match) finalHazardName = match[1]
        }
      }
      
      return {
        hazardId: r.hazardId || r.id,
        hazardName: finalHazardName,
        Hazard: finalHazardName, // Keep for backward compatibility
        likelihood: getStringValue(r.likelihood || r.Likelihood || 'Not assessed'),
        Likelihood: getStringValue(r.likelihood || r.Likelihood || 'Not assessed'),
        impact: impactText || 'Not assessed',
        Impact: impactText || 'Not assessed',
        riskScore: parseFloat(r.riskScore || r['Risk Score'] || 0),
        'Risk Score': parseFloat(r.riskScore || r['Risk Score'] || 0),
        riskLevel: r.riskLevel || r['Risk Level'] || 'MEDIUM',
        'Risk Level': r.riskLevel || r['Risk Level'] || 'MEDIUM',
        reasoning: getStringValue(r.reasoning || ''),
        isSelected: r.isSelected
      }
    })
  
  // DIAGNOSTIC: Show all risk IDs from riskMatrix
  console.log('[FormalBCPPreview] Risks in riskMatrix:', {
    total: riskMatrix.length,
    hazardIds: riskMatrix.map(r => r.hazardId).sort(),
    hazardNames: riskMatrix.map(r => r.hazardName).sort()
  })
  
  // DIAGNOSTIC: Compare risk IDs
  const strategyRiskIds = [...new Set(strategies.flatMap(s => s.applicableRisks || []))].sort()
  const matrixRiskIds = [...new Set(riskMatrix.map(r => r.hazardId))].sort()
  const matrixRiskNames = [...new Set(riskMatrix.map(r => r.hazardName))].sort()
  
  console.log('[FormalBCPPreview] 🔍 RISK ID COMPARISON:')
  console.log('  Strategy applicableRisks:', strategyRiskIds)
  console.log('  Matrix hazardIds:', matrixRiskIds)
  console.log('  Matrix hazardNames:', matrixRiskNames)
  
  // Check for mismatches
  const unmatchedStrategyRisks = strategyRiskIds.filter(srid => {
    const sridNorm = srid.toLowerCase().replace(/_/g, ' ')
    return !matrixRiskIds.some(mid => {
      const midNorm = (mid || '').toLowerCase().replace(/_/g, ' ')
      return sridNorm === midNorm || sridNorm.includes(midNorm) || midNorm.includes(sridNorm)
    }) && !matrixRiskNames.some(mname => {
      const mnameNorm = mname.toLowerCase().replace(/_/g, ' ')
      return sridNorm === mnameNorm || sridNorm.includes(mnameNorm) || mnameNorm.includes(sridNorm)
    })
  })
  
  if (unmatchedStrategyRisks.length > 0) {
    console.warn('[FormalBCPPreview] ⚠️ WARNING: Some strategy risk IDs don\'t match matrix:',unmatchedStrategyRisks)
  } else {
    console.log('[FormalBCPPreview] ✅ All strategy risk IDs have matches in matrix')
  }

  // Get high-priority risks (HIGH or EXTREME only) for Section 2
  // CRITICAL: Only include risks that are explicitly ticked (already filtered in riskMatrix)
  const highPriorityRisks = riskMatrix.filter((r: any) => {
    const level = (r.riskLevel || r['Risk Level'] || '').toLowerCase()
    return level.includes('high') || level.includes('extreme')
  })
  
  // Helper function to normalize risk IDs for flexible matching
  const normalizeRiskId = (id: string): string => {
    if (!id) return ''
    
    // Convert camelCase to snake_case: cyberAttack → cyber_attack
    const withUnderscores = id.replace(/([a-z])([A-Z])/g, '$1_$2')
    
    // Convert to lowercase and replace underscores/spaces with a common separator
    return withUnderscores.toLowerCase().replace(/[_\s-]+/g, '_')
  }
  
  // Get ALL selected risks that have strategies (for Section 3)
  // ENHANCED: Now handles camelCase ↔ snake_case conversion
  // CRITICAL: Only include risks that are explicitly ticked (isSelected === true) AND have strategies
  const risksWithStrategies = riskMatrix.filter((r: any) => {
    // Only include explicitly ticked risks
    if (r.isSelected !== true) return false
    
    const hazardName = r.hazardName || r.Hazard || ''
    const hazardId = r.hazardId || hazardName
    
    // Normalize the risk identifiers
    const hazardIdNorm = normalizeRiskId(hazardId)
    const hazardNameNorm = normalizeRiskId(hazardName)
    
    // Check if any selected strategy applies to this risk
    const hasStrategy = strategies.some((strategy: any) => {
      if (!strategy.applicableRisks || strategy.applicableRisks.length === 0) return false
      
      return strategy.applicableRisks.some((riskId: string) => {
        const riskIdNorm = normalizeRiskId(riskId)
        
        // Try multiple matching approaches
        return riskIdNorm === hazardIdNorm || 
               riskIdNorm === hazardNameNorm ||
               hazardIdNorm.includes(riskIdNorm) ||
               riskIdNorm.includes(hazardIdNorm) ||
               hazardNameNorm.includes(riskIdNorm) ||
               riskIdNorm.includes(hazardNameNorm)
      })
    })
    
    return hasStrategy
  })
  
  console.log('[FormalBCPPreview] ========================================')
  console.log('[FormalBCPPreview] Display mode: SHOW ALL USER-SELECTED STRATEGIES')
  console.log('[FormalBCPPreview] Risk assessment summary:', {
    totalRisksInMatrix: riskMatrix.length,
    highPriorityRisks: highPriorityRisks.length,
    risksWithMatchedStrategies: risksWithStrategies.length
  })
  
  console.log('[FormalBCPPreview] Strategy display logic:', {
    totalUserSelectedStrategies: strategies.length,
    displayMode: 'ALL STRATEGIES (not filtered by risk)',
    reasoning: 'Wizard already filtered by location, business type, and multipliers'
  })
  
  console.log('[FormalBCPPreview] Individual strategy breakdown:')
  strategies.forEach((s, idx) => {
    const stratName = getStringValue(s.smeTitle || s.name) || 'Unnamed'
    const cost = s.calculatedCostLocal || 0
    const risks = s.applicableRisks?.length || 0
    console.log(`  ${idx + 1}. "${stratName}" - ${cost > 0 ? currencyInfo.symbol + cost : 'Cost TBD'} - Protects: ${risks} risks`)
  })
  
  console.log('[FormalBCPPreview] ========================================')
  
  // Calculate total investment - USE WIZARD'S CALCULATED COSTS
  const calculateInvestment = () => {
    let total = 0
    strategies.forEach(s => {
      // FIRST: Use calculated cost from wizard (already in local currency)
      const calculatedCost = s.calculatedCostLocal
      if (calculatedCost && typeof calculatedCost === 'number' && calculatedCost > 0 && calculatedCost < 1e15) {
        // Sanity check: cost should be reasonable (less than 1 quadrillion)
        total += calculatedCost
      } else {
        // FALLBACK: Parse legacy cost string
        const costStr = s.implementationCost || s.cost || ''
        const parsedCost = parseCostString(costStr)
        
        if (parsedCost > 0 && parsedCost < 1e15) {
          total += parsedCost
        } else if (s.costEstimateJMD && typeof s.costEstimateJMD === 'number' && s.costEstimateJMD < 1e15) {
          // Last resort: legacy cost estimate
          total += s.costEstimateJMD
        }
      }
    })
    
    // Final sanity check
    if (total > 1e15 || isNaN(total) || !isFinite(total)) {
      console.warn('[FormalBCPPreview] Invalid total investment calculated:', total)
      return 0
    }
    
    return total
  }
  
  const totalInvestment = calculateInvestment()
  
  // Format revenue range with detected currency
  const formatRevenue = (value: string): string => {
    const currency = currencyInfo.code
    const ranges: any = {
      'under_1m': `Under ${currency} 1 million`,
      '1m_3m': `${currency} 1-3 million`,
      '3m_10m': `${currency} 3-10 million`,
      '10m_20m': `${currency} 10-20 million`,
      'over_20m': `Over ${currency} 20 million`,
      'not_disclosed': 'Not disclosed'
    }
    return ranges[value] || value
  }
  
  // Extract Plan Manager contact info
  const planManagerInfo = planManager
  const planManagerNameOnly = planManager.split(',')[0]?.trim() || planManager
  
  // Try to find contact info from staff contacts
  const staffContacts = formData.CONTACTS_AND_INFORMATION?.['Staff Contact Information'] || 
                        formData.CONTACTS?.['Staff Contact Information'] || []
  const managerContact = staffContacts.find((contact: any) => 
    contact.Name === planManagerNameOnly || 
    contact.Position?.toLowerCase().includes('manager') ||
    contact.Role?.toLowerCase().includes('manager')
  )
  
  // Build contact display string
  const planManagerPhone = formData.PLAN_INFORMATION?.['Phone'] || 
                           formData.PLAN_INFORMATION?.['Phone Number'] ||
                           managerContact?.['Phone Number'] ||
                           managerContact?.Phone || 
                           managerContact?.phone || 
                           ''
  const planManagerEmail = formData.PLAN_INFORMATION?.['Email'] || 
                           formData.PLAN_INFORMATION?.['Email Address'] ||
                           managerContact?.['Email Address'] ||
                           managerContact?.Email || 
                           managerContact?.email || 
                           ''
  
  const planManagerContactDisplay = [planManagerPhone, planManagerEmail]
    .filter(Boolean)
    .join(' | ') || 'Contact pending'
  
  // Get ALL contacts - FIX: Extract from correct wizard data structure
  // The wizard saves contacts in separate arrays under CONTACTS_AND_INFORMATION, not in a single array with categories
  const contactsAndInfo = formData.CONTACTS_AND_INFORMATION || formData.CONTACTS || {}
  
  // Staff contacts
  const staffContactsData = contactsAndInfo['Staff Contact Information'] || []
  
  // Suppliers
  const allSuppliers = contactsAndInfo['Supplier Information'] || []
  
  // Customers
  const keyCustomers = contactsAndInfo['Key Customer Contacts'] || []
  
  // Emergency Services and Utilities (combined in wizard, need to separate)
  const emergencyServicesAndUtilities = contactsAndInfo['Emergency Services and Utilities'] || []
  
  // Try to separate emergency services from utilities based on service type
  const emergencyContacts = emergencyServicesAndUtilities.filter((c: any) => {
    const serviceType = (c['Service Type'] || c.serviceType || c.type || '').toLowerCase()
    return serviceType.includes('police') || serviceType.includes('fire') || 
           serviceType.includes('ambulance') || serviceType.includes('medical') ||
           serviceType.includes('emergency')
  })
  
  const utilitiesContacts = emergencyServicesAndUtilities.filter((c: any) => {
    const serviceType = (c['Service Type'] || c.serviceType || c.type || '').toLowerCase()
    return serviceType.includes('electric') || serviceType.includes('water') || 
           serviceType.includes('internet') || serviceType.includes('phone') ||
           serviceType.includes('gas') || serviceType.includes('sewage')
  })
  
  // Insurance and Banking (might be combined with utilities, or separate)
  const insuranceContacts = emergencyServicesAndUtilities.filter((c: any) => {
    const serviceType = (c['Service Type'] || c.serviceType || c.type || '').toLowerCase()
    return serviceType.includes('insurance')
  })
  
  const bankingContacts = emergencyServicesAndUtilities.filter((c: any) => {
    const serviceType = (c['Service Type'] || c.serviceType || c.type || '').toLowerCase()
    return serviceType.includes('bank') || serviceType.includes('financial')
  })
  
  // Legacy fallback: Try old 'Contact Information' array with categories if new structure is empty
  const legacyContacts = formData.CONTACTS?.['Contact Information'] || []
  if (legacyContacts.length > 0 && 
      staffContactsData.length === 0 && 
      allSuppliers.length === 0 && 
      emergencyServicesAndUtilities.length === 0) {
    // Use legacy structure with category filtering
    console.warn('[FormalBCPPreview] Using legacy contact structure with categories')
  }
  
  // Get vital records data
  // PRIMARY: 'Vital Records Inventory' (from VITAL_RECORDS step in steps.ts)
  // FALLBACK: 'Records Inventory' (legacy)
  const vitalRecords = formData.VITAL_RECORDS?.['Vital Records Inventory'] || 
                      formData.VITAL_RECORDS?.['Records Inventory'] || []
  
  // Get testing & maintenance data
  // PRIMARY: from TESTING_AND_MAINTENANCE step (matches steps.ts naming)
  // FALLBACK: from TESTING (legacy naming)
  const testingSchedule = formData.TESTING_AND_MAINTENANCE?.['Plan Testing Schedule'] || 
                         formData.TESTING?.['Plan Testing Schedule'] || 
                         formData.TESTING?.['Testing Schedule'] || []
  const trainingPrograms = formData.TESTING_AND_MAINTENANCE?.['Training Schedule'] || 
                          formData.TESTING?.['Training Schedule'] || 
                          formData.TESTING?.['Training Programs'] || []
  // Get improvements and deduplicate by issue text
  const improvementsRaw = formData.TESTING_AND_MAINTENANCE?.['Improvement Tracking'] || 
                          formData.TESTING?.['Improvement Tracking'] || 
                          formData.TESTING?.['Improvements Needed'] || []
  
  // Deduplicate improvements by comparing issue text
  const improvements = Array.isArray(improvementsRaw) ? improvementsRaw.filter((item: any, index: number, self: any[]) => {
    const issueText = getStringValue(item['Issue Identified'] || item.issueIdentified || item.area || item.title || '')
    if (!issueText) return false // Filter out items without issue text
    return index === self.findIndex((other: any) => {
      const otherIssueText = getStringValue(other['Issue Identified'] || other.issueIdentified || other.area || other.title || '')
      return issueText && issueText === otherIssueText
    })
  }) : []
  
  // ============================================================================
  // COMPREHENSIVE DATA AVAILABILITY CHECK - Debug logging
  // ============================================================================
  console.group('🔍 BCP Data Availability Check')
  
  console.log('%c📊 Section 4: Contact Details', 'font-weight: bold; color: #2563eb')
  console.log('  ✓ 4.1 Emergency Leadership:', planManagerInfo ? '✅ Present' : '❌ Missing')
  console.log('  ✓ 4.2 Staff Contact Roster:', staffContactsData.length, 'contacts', staffContactsData.length > 0 ? '✅' : '❌')
  console.log('  ✓ 4.3 Emergency Services:', emergencyContacts.length, 'services', emergencyContacts.length > 0 ? '✅' : '❌')
  console.log('  ✓ 4.4 Utilities & Essential Services:', utilitiesContacts.length, 'utilities', utilitiesContacts.length > 0 ? '✅' : '❌')
  console.log('  ✓ 4.5 Supplier Directory (ALL):', allSuppliers.length, 'suppliers', allSuppliers.length > 0 ? '✅' : '❌')
  console.log('  ✓ 4.6 Insurance & Banking:', 
    `${insuranceContacts.length} insurance + ${bankingContacts.length} banking`,
    (insuranceContacts.length > 0 || bankingContacts.length > 0) ? '✅' : '❌')
  console.log('  ✓ 4.7 Key Customers (optional):', keyCustomers.length, 'customers', keyCustomers.length > 0 ? '✅' : '(optional)')
  
  console.log('%c📊 Section 5: Vital Records & Data Protection', 'font-weight: bold; color: #2563eb')
  console.log('  ✓ Vital Records Inventory:', vitalRecords.length, 'records', vitalRecords.length > 0 ? '✅' : '(optional)')
  
  console.log('%c📊 Section 6: Testing & Maintenance', 'font-weight: bold; color: #2563eb')
  console.log('  ✓ 6.1 Testing Schedule:', testingSchedule.length, 'tests', testingSchedule.length > 0 ? '✅' : '(optional)')
  console.log('  ✓ 6.2 Training Programs:', trainingPrograms.length, 'programs', trainingPrograms.length > 0 ? '✅' : '(optional)')
  console.log('  ✓ 6.3 Improvements Tracking:', improvements.length, 'improvements', improvements.length > 0 ? '✅' : '(optional)')
  
  console.log('%c📊 Section 1: Business Overview Enhancements', 'font-weight: bold; color: #2563eb')
  console.log('  ✓ 1.5 Target Markets:', targetMarkets ? (Array.isArray(targetMarkets) ? `${targetMarkets.length} markets ✅` : 'Present ✅') : '(optional)')
  console.log('  ✓ 1.6 Products/Services:', productsServices ? 'Present ✅' : '(optional)')
  console.log('  ✓ 1.7 Critical Function Analysis:', functionsWithPriorities.length, 'functions', functionsWithPriorities.length > 0 ? '✅' : '(optional)')
  
  // Debug raw data structure - show which top-level keys exist
  console.log('%c🔍 Raw Data Structure Check:', 'font-weight: bold; color: #7c3aed')
  console.log('  - formData.CONTACTS keys:', Object.keys(formData.CONTACTS || {}))
  console.log('  - formData.CONTACTS_AND_INFORMATION keys:', Object.keys(formData.CONTACTS_AND_INFORMATION || {}))
  console.log('  - formData.VITAL_RECORDS keys:', Object.keys(formData.VITAL_RECORDS || {}))
  console.log('  - formData.TESTING keys:', Object.keys(formData.TESTING || {}))
  console.log('  - formData.TESTING_AND_MAINTENANCE keys:', Object.keys(formData.TESTING_AND_MAINTENANCE || {}))
  console.log('  - formData.BUSINESS_OVERVIEW keys:', Object.keys(formData.BUSINESS_OVERVIEW || {}))
  console.log('  - formData.ESSENTIAL_FUNCTIONS keys:', Object.keys(formData.ESSENTIAL_FUNCTIONS || {}))
  
  // Debug contacts structure
  if (emergencyServicesAndUtilities.length > 0) {
    console.log('%c🔍 Emergency Services & Utilities structure:', 'color: #059669')
    console.log('  - Total combined:', emergencyServicesAndUtilities.length)
    console.log('  - Sample entry:', emergencyServicesAndUtilities[0])
    console.log('  - Service types found:', [...new Set(emergencyServicesAndUtilities.map((c: any) => c['Service Type'] || c.serviceType || c.type))].filter(Boolean))
    console.log('  - Emergency services extracted:', emergencyContacts.length)
    console.log('  - Utilities extracted:', utilitiesContacts.length)
    console.log('  - Insurance extracted:', insuranceContacts.length)
    console.log('  - Banking extracted:', bankingContacts.length)
  }
  
  if (allSuppliers.length > 0) {
    console.log('%c🔍 Supplier structure:', 'color: #059669')
    console.log('  - Total suppliers:', allSuppliers.length)
    console.log('  - Sample supplier:', allSuppliers[0])
    console.log('  - All suppliers will be shown in Section 4.5 (not limited to 3)')
  }
  
  // Summary report
  console.log('%c📋 SUMMARY REPORT', 'font-weight: bold; font-size: 14px; color: #dc2626')
  const totalSections = 7 // Total possible sections
  const presentSections = [
    true, // Section 1 always present
    riskMatrix.length > 0, // Section 2
    strategies.length > 0, // Section 3
    true, // Section 4 always present (has 4.1 at minimum)
    vitalRecords.length > 0, // Section 5
    true, // Section 6 always present (base text)
    true, // Section 7 always present (certification)
  ].filter(Boolean).length
  
  const requiredData = {
    'Emergency Leadership (4.1)': planManagerInfo,
    'Staff Contacts (4.2)': staffContactsData.length > 0,
    'Emergency Services (4.3)': emergencyContacts.length > 0,
    'Utilities (4.4)': utilitiesContacts.length > 0,
    'Suppliers (4.5)': allSuppliers.length > 0,
    'Insurance/Banking (4.6)': insuranceContacts.length > 0 || bankingContacts.length > 0,
  }
  
  const optionalData = {
    'Vital Records (Section 5)': vitalRecords.length > 0,
    'Testing Schedule (6.1)': testingSchedule.length > 0,
    'Training Programs (6.2)': trainingPrograms.length > 0,
    'Improvements (6.3)': improvements.length > 0,
    'Target Markets (1.5)': targetMarkets && (Array.isArray(targetMarkets) ? targetMarkets.length > 0 : true),
    'Products/Services (1.6)': !!productsServices,
    'Function Analysis (1.7)': functionsWithPriorities.length > 0,
  }
  
  const requiredPresent = Object.values(requiredData).filter(Boolean).length
  const requiredTotal = Object.keys(requiredData).length
  const optionalPresent = Object.values(optionalData).filter(Boolean).length
  const optionalTotal = Object.keys(optionalData).length
  
  console.log(`  Sections with content: ${presentSections}/${totalSections}`)
  console.log(`  Required data: ${requiredPresent}/${requiredTotal} ${requiredPresent === requiredTotal ? '✅ ALL PRESENT' : '⚠️ SOME MISSING'}`)
  console.log(`  Optional data: ${optionalPresent}/${optionalTotal} present`)
  
  if (requiredPresent < requiredTotal) {
    console.warn('%c⚠️ MISSING REQUIRED DATA:', 'font-weight: bold; color: #dc2626')
    Object.entries(requiredData).forEach(([key, value]) => {
      if (!value) console.warn(`  ❌ ${key}`)
    })
  } else {
    console.log('%c✅ All required data is present!', 'font-weight: bold; color: #059669')
  }
  
  if (optionalPresent > 0) {
    console.log('%cℹ️ Optional enhancements present:', 'font-weight: bold; color: #2563eb')
    Object.entries(optionalData).forEach(([key, value]) => {
      if (value) console.log(`  ✅ ${key}`)
    })
  }
  
  console.groupEnd()
  
  // UNDP Color Scheme
  const undpColors = {
    blue: {
      100: '#B5D5F5',
      200: '#94C4F5',
      300: '#6BABEB',
      400: '#4F95DD',
      500: '#3288CE',
      600: '#0468B1',
      700: '#1F5A95',
    },
    gray: {
      100: '#FAFAFA',
      200: '#F7F7F7',
      300: '#EDEFF0',
      400: '#D4D6D8',
      500: '#A9B1B7',
      600: '#55606E',
      700: '#232E3D',
    },
    accent: {
      yellow: '#FFEB00',
      darkYellow: '#FBC412',
      red: '#EE402D',
      darkRed: '#D12800',
      green: '#6DE354',
      darkGreen: '#59BA47',
      azure: '#60D4F2',
      darkAzure: '#00C1FF',
    }
  }

  return (
    <div className="bg-white shadow-xl overflow-hidden" style={{ border: `1px solid ${undpColors.gray[300]}` }}>
      {/* UNDP Professional Header */}
      <div className="relative" style={{ backgroundColor: undpColors.blue[600] }}>
        {/* UNDP Blue Bar */}
        <div className="h-1.5" style={{ backgroundColor: undpColors.blue[700] }}></div>
        
        {/* Header Content */}
        <div className="px-8 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Left: UNDP Logo and Title */}
            <div className="flex items-center gap-4 flex-1">
              <img 
                src="/undp-logo.png" 
                alt="UNDP Logo" 
                className="h-10 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider mb-0.5" style={{ color: undpColors.blue[200] }}>
                  Formal Business Continuity Plan
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">{companyName}</h1>
                <div className="text-sm mt-0.5" style={{ color: undpColors.blue[200] }}>
                  {parish && <span>{parish}, </span>}
                  {country}
                </div>
              </div>
            </div>
            
            {/* Right: Document Info */}
            <div className="text-right text-white text-sm">
              <div style={{ color: undpColors.blue[200] }}>
                Version 1.0 • {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* UNDP Certification Bar */}
      <div className="px-8 py-2 text-center" style={{ backgroundColor: undpColors.gray[100], borderBottom: `1px solid ${undpColors.gray[300]}` }}>
        <div className="text-xs" style={{ color: undpColors.gray[600] }}>
          Prepared with technical support from: <span className="font-semibold" style={{ color: undpColors.blue[600] }}>UNDP Caribbean | CARICHAM Business Support Program</span>
        </div>
      </div>

      {/* Document Body - Smart Spacing */}
      <div className="px-8 py-5 space-y-5">
        
        {/* SECTION 1: BUSINESS OVERVIEW */}
        <section>
          <div className="flex items-center gap-3 mb-4 pb-2" style={{ borderBottom: `2px solid ${undpColors.blue[600]}` }}>
            <div className="text-white w-9 h-9 rounded flex items-center justify-center font-bold text-sm" style={{ backgroundColor: undpColors.blue[600] }}>1</div>
            <h2 className="text-xl font-bold" style={{ color: undpColors.gray[700] }}>{getUIText('bcpPreview.formalBcp.businessOverview', currentLocale)}</h2>
          </div>
          
          {/* Business Information - Efficient 3-Column Grid */}
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-3" style={{ color: undpColors.gray[700] }}>1.1 {getUIText('bcpPreview.formalBcp.businessInformation', currentLocale)}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2.5">
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: undpColors.gray[600] }}>{getUIText('bcpPreview.formalBcp.businessName', currentLocale)}</div>
                  <div className="text-sm" style={{ color: undpColors.gray[700] }}>{companyName}</div>
                </div>
                {businessAddress && (
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: undpColors.gray[600] }}>Physical Address</div>
                    <div className="text-sm" style={{ color: undpColors.gray[700] }}>{businessAddress}</div>
                  </div>
                )}
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: undpColors.gray[600] }}>Business Type</div>
                  <div className="text-sm" style={{ color: undpColors.gray[700] }}>{businessType}</div>
                </div>
                {yearsInOperation && (
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: undpColors.gray[600] }}>Years in Operation</div>
                    <div className="text-sm" style={{ color: undpColors.gray[700] }}>{yearsInOperation}</div>
                  </div>
                )}
              </div>
              <div className="space-y-2.5">
                {totalPeople && (
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: undpColors.gray[600] }}>Total People</div>
                    <div className="text-sm" style={{ color: undpColors.gray[700] }}>{totalPeople}</div>
                  </div>
                )}
                {annualRevenue && (
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: undpColors.gray[600] }}>Annual Revenue</div>
                    <div className="text-sm" style={{ color: undpColors.gray[700] }}>{formatRevenue(annualRevenue)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Business Purpose & Key Strengths - Side by Side */}
          {(businessPurpose || competitiveAdvantages.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {businessPurpose && (
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: undpColors.gray[700] }}>1.2 Business Purpose</h3>
                  <p className="text-sm leading-relaxed" style={{ color: undpColors.gray[600] }}>{businessPurpose}</p>
                </div>
              )}
              {competitiveAdvantages.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: undpColors.gray[700] }}>1.3 Key Strengths</h3>
                  <ul className="list-none space-y-1">
                    {competitiveAdvantages.slice(0, 3).map((adv, idx) => (
                      <li key={idx} className="text-sm flex items-start" style={{ color: undpColors.gray[700] }}>
                        <span className="mr-2 font-bold" style={{ color: undpColors.accent.darkGreen }}>•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Essential Operations */}
          {topFunctions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">1.4 Essential Operations</h3>
              <p className="text-xs text-slate-600 mb-2">These functions are critical to keeping our business running:</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {topFunctions.map((func: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-green-600 bg-slate-50 px-3 py-1.5">
                    <div className="font-semibold text-sm text-slate-800">{func.name}</div>
                    {func.description && (
                      <div className="text-xs text-slate-600 mt-0.5">{func.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Target Markets & Customers */}
          {targetMarkets && targetMarkets.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">1.5 Target Markets</h3>
              <div className="bg-slate-50 p-3 rounded">
                {Array.isArray(targetMarkets) ? (
                  <ul className="space-y-0.5">
                    {targetMarkets.map((market: any, idx: number) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{getStringValue(market.name || market)}</span>
                        {market.percentage && (
                          <span className="text-xs text-slate-600 ml-2">({market.percentage}% of revenue)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-700">{getStringValue(targetMarkets)}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Full Products & Services */}
          {productsServices && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">1.6 Products & Services</h3>
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-sm text-slate-700 leading-normal whitespace-pre-line">
                  {getStringValue(productsServices)}
                </p>
              </div>
            </div>
          )}
          
          {/* Critical Functions Analysis with Priorities */}
          {functionsWithPriorities.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">1.7 Critical Function Analysis</h3>
              <p className="text-xs text-slate-600 mb-2">
                Priority levels, maximum acceptable downtime, and recovery objectives for our most critical business functions.
              </p>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {functionsWithPriorities.map((func: any, idx: number) => (
                  <div key={idx} className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-100 px-3 py-1.5 font-semibold text-sm">
                      {func.name}
                    </div>
                    <div className="p-3 space-y-1.5">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-600">Priority:</span>{' '}
                          <span className="font-semibold text-slate-900">
                            {func.priority !== 'N/A' ? `${func.priority}/10` : 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Max Downtime:</span>{' '}
                          <span className="font-semibold text-slate-900">
                            {func.maxDowntime || 'Not specified'}
                          </span>
                        </div>
                        {func.rto && (
                          <div>
                            <span className="text-slate-600">RTO:</span>{' '}
                            <span className="font-semibold text-slate-900">{func.rto}</span>
                          </div>
                        )}
                        {func.rpo && (
                          <div>
                            <span className="text-slate-600">RPO:</span>{' '}
                            <span className="font-semibold text-slate-900">{func.rpo}</span>
                          </div>
                        )}
                      </div>
                      
                      {func.impact && (
                        <div>
                          <div className="text-xs font-semibold text-slate-700 mb-0.5">Impact if Disrupted:</div>
                          <div className="text-xs text-slate-700 bg-yellow-50 border-l-2 border-yellow-400 p-1.5">
                            {func.impact}
                          </div>
                        </div>
                      )}
                      
                      {func.recoveryStrategy && (
                        <div>
                          <div className="text-xs font-semibold text-slate-700 mb-0.5">Recovery Strategy:</div>
                          <div className="text-xs text-slate-700 bg-green-50 border-l-2 border-green-400 p-1.5">
                            {func.recoveryStrategy}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: RISK ASSESSMENT */}
        <section>
          <div className="flex items-center gap-3 mb-4 pb-2" style={{ borderBottom: `2px solid ${undpColors.blue[600]}` }}>
            <div className="text-white w-9 h-9 rounded flex items-center justify-center font-bold text-sm" style={{ backgroundColor: undpColors.blue[600] }}>2</div>
            <h2 className="text-xl font-bold" style={{ color: undpColors.gray[700] }}>{getUIText('bcpPreview.formalBcp.riskAssessment', currentLocale)}</h2>
          </div>
          
          {/* Overview Summary */}
          <div className="mb-3">
            <p className="text-sm leading-relaxed" style={{ color: undpColors.gray[700] }}>
              We have identified and assessed <strong>{riskMatrix.length} significant risks</strong> that could disrupt our business operations.
            </p>
          </div>
          
          {/* Risk Severity Legend - Inline */}
          <div className="mb-4">
            <div className="px-3 py-2 rounded inline-flex flex-wrap gap-4 text-xs" style={{ backgroundColor: undpColors.gray[100], border: `1px solid ${undpColors.gray[300]}` }}>
              <span className="font-semibold" style={{ color: undpColors.gray[700] }}>Severity Levels:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: undpColors.accent.darkRed }}></div>
                <span style={{ color: undpColors.gray[600] }}>EXTREME (≥8.0)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: undpColors.accent.red }}></div>
                <span style={{ color: undpColors.gray[600] }}>HIGH (6.0-7.9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: undpColors.accent.darkYellow }}></div>
                <span style={{ color: undpColors.gray[600] }}>MEDIUM (4.0-5.9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: undpColors.accent.darkGreen }}></div>
                <span style={{ color: undpColors.gray[600] }}>LOW (&lt;4.0)</span>
              </div>
            </div>
          </div>
          
          {/* Unified Risk Cards - Optimized Layout */}
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-3" style={{ color: undpColors.gray[700] }}>2.1 Identified Risks & Mitigation Status</h3>
            
            {/* Sort risks by score (highest first) - Show ALL ticked risks */}
            {(() => {
              // riskMatrix already filtered to only ticked risks (isSelected === true)
              const sortedRisks = [...riskMatrix].sort((a, b) => {
                const scoreA = a.riskScore || a['Risk Score'] || 0
                const scoreB = b.riskScore || b['Risk Score'] || 0
                return scoreB - scoreA
              })
              
              return (
                <div className="space-y-2">
                  {sortedRisks.map((risk: any, idx: number) => {
                    const riskName = risk.hazardName || risk.Hazard || 'Unnamed Risk'
                    const riskScore = risk.riskScore || risk['Risk Score'] || 0
                    let riskLevel = risk.riskLevel || risk['Risk Level'] || 'MEDIUM'
                    
                    // Determine risk level from score if not provided
                    if (riskScore >= 8.0) riskLevel = 'EXTREME'
                    else if (riskScore >= 6.0) riskLevel = 'HIGH'
                    else if (riskScore >= 4.0) riskLevel = 'MEDIUM'
                    else riskLevel = 'LOW'
                    
                    const likelihood = risk.likelihood || risk.Likelihood || 'Not assessed'
                    const impact = risk.impact || risk.Impact || 'Not assessed'
                    // Clean reasoning - remove JSON objects and extract readable text
                    let reasoning = risk.reasoning || ''
                    if (reasoning && typeof reasoning === 'string') {
                      // Remove JSON-like objects from reasoning
                      reasoning = reasoning.replace(/\{[^}]*"en"\s*:\s*"[^"]*"[^}]*\}/g, (match) => {
                        try {
                          const parsed = JSON.parse(match)
                          return parsed.en || parsed.es || parsed.fr || match
                        } catch {
                          // Extract English value if JSON parsing fails
                          const enMatch = match.match(/"en"\s*:\s*"([^"]+)"/)
                          return enMatch ? enMatch[1] : match
                        }
                      })
                      // Clean up any remaining JSON artifacts
                      reasoning = reasoning.replace(/\{[^}]*\}/g, '').trim()
                    }
                    reasoning = getStringValue(reasoning)
                    
                    const hasStrategies = strategies.some(s => 
                      s.applicableRisks?.includes(risk.hazardId)
                    )
                    
                    // Color coding by severity using UNDP accent colors
                    const colorClasses = {
                      'EXTREME': {
                        bg: undpColors.accent.lightRed + '20',
                        border: undpColors.accent.darkRed,
                        badge: undpColors.accent.darkRed,
                        text: undpColors.gray[700]
                      },
                      'HIGH': {
                        bg: undpColors.accent.lightRed + '15',
                        border: undpColors.accent.red,
                        badge: undpColors.accent.red,
                        text: undpColors.gray[700]
                      },
                      'MEDIUM': {
                        bg: undpColors.accent.yellow + '20',
                        border: undpColors.accent.darkYellow,
                        badge: undpColors.accent.darkYellow,
                        text: undpColors.gray[700]
                      },
                      'LOW': {
                        bg: undpColors.accent.lightGreen + '20',
                        border: undpColors.accent.darkGreen,
                        badge: undpColors.accent.darkGreen,
                        text: undpColors.gray[700]
                      }
                    }
                    
                    const colors = colorClasses[riskLevel as keyof typeof colorClasses] || colorClasses['MEDIUM']
                    
                    return (
                      <div key={idx} className="rounded overflow-hidden mb-3" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bg }}>
                        <div className="p-3">
                          {/* Header Row - Risk Name, Score, and Metrics Side by Side */}
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-bold px-2 py-0.5 rounded text-white whitespace-nowrap" style={{ backgroundColor: colors.badge }}>
                                  {riskLevel}
                                </span>
                                <h4 className="font-bold text-sm leading-tight" style={{ color: colors.text }}>{riskName}</h4>
                              </div>
                              {reasoning && (
                                <p className="text-xs leading-relaxed mt-1" style={{ color: undpColors.gray[600] }}>{reasoning}</p>
                              )}
                            </div>
                            {/* Score and Metrics - Right Side */}
                            <div className="flex-shrink-0 flex items-start gap-4">
                              {/* Score */}
                              <div className="text-center">
                                <div className="text-xs mb-0.5" style={{ color: undpColors.gray[600] }}>Risk Score</div>
                                <div className="text-2xl font-bold leading-none" style={{ color: colors.badge }}>{riskScore.toFixed(1)}</div>
                                <div className="text-xs" style={{ color: undpColors.gray[500] }}>out of 10</div>
                              </div>
                              {/* Metrics */}
                              <div className="text-right border-l pl-4" style={{ borderColor: undpColors.gray[300] }}>
                                <div className="text-xs font-semibold mb-1" style={{ color: undpColors.gray[600] }}>Metrics</div>
                                <div className="space-y-1 text-xs" style={{ color: undpColors.gray[700] }}>
                                  <div><span className="font-semibold">Likelihood:</span> {likelihood}</div>
                                  <div><span className="font-semibold">Impact:</span> {impact}</div>
                                  {/* Removed Planned/Addressed status - no user input for this */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </section>

        {/* SECTION 3: CONTINUITY STRATEGIES */}
        <section>
          <div className="flex items-center gap-3 mb-4 pb-2" style={{ borderBottom: `2px solid ${undpColors.blue[600]}` }}>
            <div className="text-white w-9 h-9 rounded flex items-center justify-center font-bold text-sm" style={{ backgroundColor: undpColors.blue[600] }}>3</div>
            <h2 className="text-xl font-bold" style={{ color: undpColors.gray[700] }}>{getUIText('bcpPreview.formalBcp.continuityStrategies', currentLocale)}</h2>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-3" style={{ color: undpColors.gray[700] }}>3.1 Investment Summary ({currencyInfo.code})</h3>
            <div className="rounded-lg p-4" style={{ backgroundColor: undpColors.accent.lightGreen + '30', border: `2px solid ${undpColors.accent.darkGreen}` }}>
              <p className="text-sm mb-2 leading-relaxed" style={{ color: undpColors.gray[700] }}>
                We are investing <strong className="text-lg" style={{ color: undpColors.accent.darkGreen }}>{formatCurrency(totalInvestment, currencyInfo)}</strong> in business continuity measures 
                to protect our operations, assets, and ability to serve customers during disruptions.
              </p>
              {(() => {
                // Calculate investment breakdown by category
                const categoryInvestment = {
                  prevention: 0,
                  response: 0,
                  recovery: 0
                }
                
                strategies.forEach(s => {
                  // Use calculatedCostLocal (should be in correct currency already)
                  let cost = s.calculatedCostLocal || 0
                  
                  // Sanity check - filter out invalid costs
                  if (!cost || cost < 0 || cost > 1e15 || isNaN(cost) || !isFinite(cost)) {
                    // Try fallback
                    cost = parseCostString(s.implementationCost || '')
                    if (!cost || cost < 0 || cost > 1e15 || isNaN(cost) || !isFinite(cost)) {
                      return // Skip this strategy if cost is invalid
                    }
                  }
                  
                  // Log for debugging
                  const strategyName = getStringValue(s.smeTitle || s.name) || 'Unnamed'
                  console.log(`[Preview] Strategy "${strategyName}" → cost: ${cost}`)
                  
                  // Categorize by phase of action steps (not executionTiming)
                  // Use step.phase field which is 'before', 'during', or 'after'
                  const beforeSteps = (s.actionSteps || []).filter((step: any) => step.phase === 'before')
                  const duringSteps = (s.actionSteps || []).filter((step: any) => step.phase === 'during')
                  const afterSteps = (s.actionSteps || []).filter((step: any) => step.phase === 'after')
                  
                  const totalSteps = beforeSteps.length + duringSteps.length + afterSteps.length
                  
                  if (totalSteps > 0) {
                    // Distribute cost proportionally based on number of steps in each phase
                    if (beforeSteps.length > 0) {
                      categoryInvestment.prevention += (cost * beforeSteps.length) / totalSteps
                    }
                    if (duringSteps.length > 0) {
                      categoryInvestment.response += (cost * duringSteps.length) / totalSteps
                    }
                    if (afterSteps.length > 0) {
                      categoryInvestment.recovery += (cost * afterSteps.length) / totalSteps
                    }
                  } else {
                    // No phase info - default to prevention
                    categoryInvestment.prevention += cost
                  }
                })
                
                const totalCategory = categoryInvestment.prevention + categoryInvestment.response + categoryInvestment.recovery
                
                if (totalCategory > 0) {
                  const preventionPct = Math.round((categoryInvestment.prevention / totalCategory) * 100)
                  const responsePct = Math.round((categoryInvestment.response / totalCategory) * 100)
                  const recoveryPct = Math.round((categoryInvestment.recovery / totalCategory) * 100)
                  
                  return (
                    <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                      <div className="font-semibold mb-1">Investment Breakdown:</div>
                      <div>• Prevention & Mitigation: {formatCurrency(categoryInvestment.prevention, currencyInfo)} ({preventionPct}%)</div>
                      <div>• Response Capabilities: {formatCurrency(categoryInvestment.response, currencyInfo)} ({responsePct}%)</div>
                      <div>• Recovery Resources: {formatCurrency(categoryInvestment.recovery, currencyInfo)} ({recoveryPct}%)</div>
                    </div>
                  )
                } else {
                  return (
                    <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                      <div className="font-semibold mb-1">Investment Breakdown:</div>
                      <div>• Prevention & Mitigation: Reducing risk likelihood</div>
                      <div>• Response Capabilities: Handling emergencies effectively</div>
                      <div>• Recovery Resources: Restoring operations quickly</div>
                    </div>
                  )
                }
              })()}
            </div>
          </div>
          
          {/* ALL Selected Strategies - Organized by Priority */}
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-2" style={{ color: undpColors.gray[700] }}>3.2 Our Preparation Strategies</h3>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: undpColors.gray[600] }}>
              These {strategies.length} strategies were selected based on your business needs, location risks, and operational requirements.
            </p>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {strategies.map((strategy: any, stratIdx: number) => {
                // Get cost - PRIORITIZE calculatedCostLocal
                const strategyCost = strategy.calculatedCostLocal && strategy.calculatedCostLocal > 0
                  ? strategy.calculatedCostLocal
                  : parseCostString(strategy.implementationCost || strategy.cost || '')
                
                // Get risks this strategy protects against
                const protectsAgainst = strategy.applicableRisks || []
                const protectsAgainstNames = protectsAgainst.map((riskId: string) => {
                  // Find matching risk name from riskMatrix
                  const matchingRisk = riskMatrix.find((r: any) => {
                    const riskIdNorm = normalizeRiskId(riskId)
                    const hazardIdNorm = normalizeRiskId(r.hazardId || '')
                    const hazardNameNorm = normalizeRiskId(r.hazardName || r.Hazard || '')
                    
                    return riskIdNorm === hazardIdNorm || 
                           riskIdNorm === hazardNameNorm ||
                           hazardIdNorm.includes(riskIdNorm) ||
                           hazardNameNorm.includes(riskIdNorm)
                  })
                  
                  if (matchingRisk) {
                    const name = matchingRisk.hazardName || matchingRisk.Hazard || ''
                    // Ensure we return a clean string, not JSON
                    return getStringValue(name)
                  }
                  
                  // Fallback: Format the risk ID nicely
                  return riskId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
                }).filter(Boolean).filter(name => name && name !== 'Unnamed Risk' && !name.includes('{"en"'))
                
                // PRIORITY: Use calculated cost from wizard
                // NOTE: calculatedCostLocal should already be in the user's selected currency
                // But we need to ensure consistency - always use currencyInfo
                let costAmount = strategyCost
                
                // If strategy has currency info that doesn't match, we might need to convert
                // But for now, trust that calculatedCostLocal is already in the correct currency
                // Just ensure we use the consistent currency symbol
                const costDisplay = costAmount > 0 && costAmount < 1e15
                  ? `${currencyInfo.symbol}${Math.round(costAmount).toLocaleString()}`
                  : 'Cost TBD'
                
                // Extract timeline/timeframe - Calculate from action steps
                const stratName = getStringValue(strategy.smeTitle || strategy.name) || 'Unnamed'
                
                const getTimeline = (): string => {
                  // Validate action step timeframes
                  validateActionStepTimeframes(strategy)
                  
                  // ONLY METHOD: Calculate from action steps
                  const calculatedHours = calculateStrategyTimeFromSteps(strategy.actionSteps || [])
                  const formatted = formatHoursToDisplay(calculatedHours)
                  
                  console.log(`[Preview] Strategy "${stratName}": ${calculatedHours}h from ${strategy.actionSteps?.length || 0} steps → "${formatted}"`)
                  
                  // Fallback only if no action steps at all
                  if (calculatedHours === 0 && strategy.totalEstimatedHours) {
                    console.warn(`[Preview] No action steps for "${stratName}", using fallback totalEstimatedHours: ${strategy.totalEstimatedHours}h`)
                    return formatHoursToDisplay(strategy.totalEstimatedHours)
                  }
                  
                  return formatted
                }
                
                const timeline = getTimeline()
                
                // Debug log for each strategy
                console.log(`[Preview] Strategy "${stratName}": ${costDisplay} | Timeline: ${timeline}`)
                
                // Get priority badge
                const priorityTier = strategy.priorityTier || strategy.selectionTier || 'recommended'
                const priorityBadge = priorityTier === 'essential' 
                  ? { label: 'ESSENTIAL', color: 'bg-red-100 text-red-800' }
                  : priorityTier === 'recommended'
                  ? { label: 'RECOMMENDED', color: 'bg-yellow-100 text-yellow-800' }
                  : { label: 'OPTIONAL', color: 'bg-green-100 text-green-800' }
                
                return (
                  <div key={stratIdx} className="rounded overflow-hidden bg-white shadow-sm" style={{ border: `1px solid ${undpColors.gray[300]}` }}>
                    {/* Strategy Header */}
                    <div className="px-4 py-2.5 border-b" style={{ backgroundColor: undpColors.gray[100], borderColor: undpColors.gray[300] }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-white px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap" style={{ backgroundColor: undpColors.blue[600] }}>
                              #{stratIdx + 1}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap" style={{ backgroundColor: priorityBadge.bgColor, color: priorityBadge.textColor }}>
                              {priorityBadge.label}
                            </span>
                            {strategy.quickWinIndicator && (
                              <span className="px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap" style={{ backgroundColor: undpColors.accent.lightGreen + '40', color: undpColors.accent.darkGreen }}>
                                ⚡ QUICK WIN
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm leading-tight" style={{ color: undpColors.gray[700] }}>
                            {getStringValue(strategy.smeTitle || strategy.name || strategy.title)}
                          </h4>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs mb-0.5" style={{ color: undpColors.gray[600] }}>Investment</div>
                          <div className="font-bold text-base leading-tight" style={{ color: undpColors.accent.darkGreen }}>{costDisplay}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Strategy Content */}
                    <div className="p-3">
                      {/* Description */}
                      {(strategy.smeSummary || strategy.description) && (
                        <p className="text-xs mb-2.5 leading-relaxed" style={{ color: undpColors.gray[700] }}>
                          {getStringValue(strategy.smeSummary || strategy.description)}
                        </p>
                      )}
                      
                      {/* Quick Stats & Protects - Side by Side */}
                      <div className="grid grid-cols-2 gap-3 mb-2.5">
                        <div>
                          <div className="text-xs font-semibold mb-0.5" style={{ color: undpColors.gray[600] }}>Timeline</div>
                          <div className="text-xs font-semibold" style={{ color: undpColors.gray[700] }}>{timeline}</div>
                        </div>
                        {protectsAgainstNames.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold mb-0.5" style={{ color: undpColors.gray[600] }}>Protects Against</div>
                            <div className="flex flex-wrap gap-1">
                              {protectsAgainstNames.slice(0, 3).map((riskName: string, idx: number) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] leading-tight" style={{ backgroundColor: undpColors.blue[100], color: undpColors.blue[700] }}>
                                  {riskName}
                                </span>
                              ))}
                              {protectsAgainstNames.length > 3 && (
                                <span className="text-[10px] italic" style={{ color: undpColors.gray[500] }}>+{protectsAgainstNames.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Cost Items - What You Need to Purchase */}
                      {(() => {
                        // Collect all cost items from all action steps
                        const itemMap = new Map<string, { name: string; quantity: number; unit: string; category: string }>()
                        
                        strategy.actionSteps?.forEach((step: any) => {
                          if (step.costItems && Array.isArray(step.costItems)) {
                            step.costItems.forEach((costItem: any) => {
                              // Get item name from multilingual database field
                              // Cost items should always have multilingual names in the database (JSON format)
                              let itemName = 'Unknown Item'
                              
                              // Priority 1: Full item object with multilingual name (from transformers)
                              if (costItem.item?.name) {
                                itemName = getLocalizedText(costItem.item.name, currentLocale)
                              }
                              // Priority 2: costItem nested object (from API prepare-prefill-data)
                              else if (costItem.costItem?.name) {
                                itemName = getLocalizedText(costItem.costItem.name, currentLocale)
                              }
                              // Priority 3: Direct name field
                              else if (costItem.name) {
                                itemName = getLocalizedText(costItem.name, currentLocale)
                              }
                              // If we still don't have a name, log a warning (should not happen if DB is properly populated)
                              else if (costItem.itemId) {
                                console.warn(`[FormalBCPPreview] Cost item ${costItem.itemId} missing multilingual name in database. Please add multilingual name to this cost item.`)
                                // Only use itemId as last resort - this indicates missing data in DB
                                itemName = costItem.itemId
                              }
                              
                              // Ensure we have a valid name (not empty or just whitespace)
                              if (!itemName || itemName.trim().length === 0) {
                                console.warn(`[FormalBCPPreview] Cost item ${costItem.itemId} has empty name for locale ${currentLocale}`)
                                itemName = costItem.itemId || 'Unknown Item'
                              }
                              
                              const quantity = costItem.quantity || 1
                              const unit = costItem.item?.unit || costItem.costItem?.unit || costItem.unit || ''
                              const category = costItem.item?.category || costItem.costItem?.category || costItem.category || 'supplies'
                              
                              // Aggregate by item name (handle multilingual)
                              const key = itemName.toLowerCase()
                              if (itemMap.has(key)) {
                                const existing = itemMap.get(key)!
                                existing.quantity += quantity
                              } else {
                                itemMap.set(key, { name: itemName, quantity, unit, category })
                              }
                            })
                          }
                        })
                        
                        const uniqueItems = Array.from(itemMap.values())
                        
                        if (uniqueItems.length > 0) {
                          return (
                            <div className="mb-2.5 mt-2.5 pt-2.5 border-t" style={{ borderColor: undpColors.gray[300] }}>
                              <div className="text-xs font-semibold mb-1.5" style={{ color: undpColors.gray[700] }}>{getUIText('bcpPreview.formalBcp.itemsToPurchase', currentLocale)}:</div>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                {uniqueItems.map((item, itemIdx) => (
                                  <div key={itemIdx} className="text-xs leading-relaxed" style={{ color: undpColors.gray[700] }}>
                                    {item.quantity > 1 && <span className="font-semibold">{item.quantity}x </span>}
                                    {item.name}
                                    {item.unit && <span className="text-xs" style={{ color: undpColors.gray[500] }}> ({item.unit})</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        }
                        return null
                      })()}
                      
                      {/* Key Actions */}
                      {strategy.actionSteps && strategy.actionSteps.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t" style={{ borderColor: undpColors.gray[300] }}>
                          <div className="text-xs font-semibold mb-1.5" style={{ color: undpColors.gray[700] }}>Key Actions:</div>
                          <div className="space-y-1">
                            {strategy.actionSteps.slice(0, 6).map((step: any, stepIdx: number) => {
                              const actionText = getStringValue(step.smeAction || step.action || step.title || '')
                              // Parse timeframe - handle multilingual objects
                              let timeframeStr = ''
                              if (step.timeframe) {
                                const timeframeParsed = getStringValue(step.timeframe)
                                if (timeframeParsed && !timeframeParsed.includes('{')) {
                                  timeframeStr = ` (${timeframeParsed})`
                                } else if (timeframeParsed && timeframeParsed.includes('"en"')) {
                                  try {
                                    const tfObj = JSON.parse(timeframeParsed)
                                    timeframeStr = ` (${getStringValue(tfObj)})`
                                  } catch {
                                    const match = timeframeParsed.match(/"en"\s*:\s*"([^"]+)"/)
                                    timeframeStr = match ? ` (${match[1]})` : ''
                                  }
                                } else if (timeframeParsed) {
                                  timeframeStr = ` (${timeframeParsed})`
                                }
                              }
                              
                              return (
                                <div key={stepIdx} className="flex gap-1.5 text-xs leading-relaxed" style={{ color: undpColors.gray[700] }}>
                                  <span className="font-bold flex-shrink-0" style={{ color: undpColors.blue[600] }}>→</span>
                                  <span>{actionText}{timeframeStr}</span>
                                </div>
                              )
                            })}
                            {strategy.actionSteps.length > 6 && (
                              <div className="text-xs italic pt-0.5" style={{ color: undpColors.gray[500] }}>
                                +{strategy.actionSteps.length - 6} more actions
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* SECTION 4: EMERGENCY RESPONSE & CONTACTS */}
        <section>
          <div className="flex items-center gap-3 mb-3 pb-2 border-b-2 border-slate-800">
            <div className="bg-slate-800 text-white w-8 h-8 rounded flex items-center justify-center font-bold">4</div>
            <h2 className="text-xl font-bold text-slate-900">{getUIText('bcpPreview.formalBcp.emergencyResponse', currentLocale)}</h2>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-2">4.1 Emergency Leadership</h3>
            <table className="w-full border border-slate-300 text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-1.5 text-left border-r border-slate-300">Role</th>
                  <th className="px-3 py-1.5 text-left border-r border-slate-300">Person</th>
                  <th className="px-3 py-1.5 text-left">Contact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-1.5 border-t border-slate-300 font-semibold">Plan Manager</td>
                  <td className="px-3 py-1.5 border-t border-slate-300">{planManagerInfo}</td>
                  <td className="px-3 py-1.5 border-t border-slate-300">
                    {planManagerContactDisplay}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Staff Contact Roster */}
          {staffContactsData.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">4.2 Staff Contact Roster</h3>
              <p className="text-xs text-slate-600 mb-2">Contact information for all team members during emergencies.</p>
              <table className="w-full border border-slate-300 text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Name</th>
                    <th className="px-2 py-1.5 text-left">Position</th>
                    <th className="px-2 py-1.5 text-left">Phone</th>
                    <th className="px-2 py-1.5 text-left">Email</th>
                    <th className="px-2 py-1.5 text-left">Emergency Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {staffContactsData.map((contact: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-2 py-1.5 border-t border-slate-200">{getStringValue(contact.Name || contact.name)}</td>
                      <td className="px-2 py-1.5 border-t border-slate-200">{getStringValue(contact.Position || contact.position || contact.role || contact.Role)}</td>
                      <td className="px-2 py-1.5 border-t border-slate-200">{getStringValue(contact.Phone || contact.phone || contact['Mobile Phone'])}</td>
                      <td className="px-2 py-1.5 border-t border-slate-200 text-xs">{getStringValue(contact.Email || contact.email || contact['Email Address'])}</td>
                      <td className="px-2 py-1.5 border-t border-slate-200 text-xs">{getStringValue(contact['Emergency Contact'] || contact.emergencyContact || '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Emergency Services */}
          {emergencyContacts.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">4.3 Emergency Services</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {emergencyContacts.map((contact: any, idx: number) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded p-2">
                    <div className="font-semibold text-xs text-slate-800">
                      {getStringValue(contact['Service Type'] || contact.serviceType || contact.type || contact.name)}
                    </div>
                    <div className="text-xs text-slate-700 mt-0.5">
                      {getStringValue(contact['Organization Name'] || contact.organizationName || contact.organization)}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      📞 {getStringValue(contact['Phone Number'] || contact.phoneNumber || contact.phone)}
                    </div>
                    {contact['24/7 Emergency'] && (
                      <div className="text-xs text-red-700 font-semibold mt-0.5">
                        🚨 Emergency: {getStringValue(contact['24/7 Emergency'])}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Utilities Contacts */}
          {utilitiesContacts.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">4.4 Utilities & Essential Services</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {utilitiesContacts.map((contact: any, idx: number) => (
                  <div key={idx} className="border border-slate-300 rounded p-2 bg-white">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                      <div>
                        <span className="text-slate-600">Service:</span>{' '}
                        <span className="font-semibold">{getStringValue(contact['Service Type'] || contact.serviceType || contact.service || contact.type)}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Provider:</span>{' '}
                        <span className="font-semibold">{getStringValue(contact['Organization Name'] || contact.organizationName || contact.provider || contact.company)}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Phone:</span>{' '}
                        <span>{getStringValue(contact['Phone Number'] || contact.phoneNumber || contact.phone)}</span>
                      </div>
                      {(contact['Account Number'] || contact.accountNumber) && (
                        <div>
                          <span className="text-slate-600">Account #:</span>{' '}
                          <span>{getStringValue(contact['Account Number'] || contact.accountNumber)}</span>
                        </div>
                      )}
                      {contact['Email Address'] && (
                        <div className="col-span-2">
                          <span className="text-slate-600">Email:</span>{' '}
                          <span>{getStringValue(contact['Email Address'] || contact.email)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Suppliers */}
          {allSuppliers.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">4.5 Supplier Directory</h3>
              <p className="text-xs text-slate-600 mb-2">All {allSuppliers.length} suppliers listed with complete contact information.</p>
              <table className="w-full border border-slate-300 text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Supplier Name</th>
                    <th className="px-2 py-1.5 text-left">Contact Person</th>
                    <th className="px-2 py-1.5 text-left">Product/Service</th>
                    <th className="px-2 py-1.5 text-left">Phone</th>
                    <th className="px-2 py-1.5 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {allSuppliers.map((supplier: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-2 py-1.5 border-t border-slate-200 font-semibold">
                        {getStringValue(supplier.Name || supplier.name || supplier.companyName || supplier['Supplier Name'])}
                      </td>
                      <td className="px-2 py-1.5 border-t border-slate-200">
                        {getStringValue(supplier['Contact Person'] || supplier.contactPerson || supplier.contact)}
                      </td>
                      <td className="px-2 py-1.5 border-t border-slate-200">
                        {getStringValue(supplier.Service || supplier.service || supplier.productType || supplier['Goods/Services Supplied'] || 'Various')}
                      </td>
                      <td className="px-2 py-1.5 border-t border-slate-200">
                        {getStringValue(supplier.Phone || supplier.phone || supplier.phoneNumber || supplier['Phone Number'])}
                      </td>
                      <td className="px-2 py-1.5 border-t border-slate-200">
                        {getStringValue(supplier.Email || supplier.email || supplier['Email Address'])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Insurance & Banking */}
          {(insuranceContacts.length > 0 || bankingContacts.length > 0) && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">4.6 Insurance & Banking Partners</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {insuranceContacts.map((contact: any, idx: number) => (
                  <div key={`ins-${idx}`} className="border border-blue-200 rounded p-2 bg-blue-50">
                    <div className="font-semibold text-xs text-blue-900 mb-1">
                      {getStringValue(contact['Service Type'] || contact.serviceType || 'Insurance')}
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                      <div>
                        <span className="text-blue-700">Company:</span>{' '}
                        <span className="font-semibold">{getStringValue(contact['Organization Name'] || contact.organizationName || contact.company || contact.name)}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Phone:</span>{' '}
                        <span>{getStringValue(contact['Phone Number'] || contact.phoneNumber || contact.phone)}</span>
                      </div>
                      {(contact['Email Address'] || contact.email) && (
                        <div className="col-span-2">
                          <span className="text-blue-700">Email:</span>{' '}
                          <span>{getStringValue(contact['Email Address'] || contact.email)}</span>
                        </div>
                      )}
                      {(contact['Account Number'] || contact.accountNumber || contact.policyNumber) && (
                        <div className="col-span-2">
                          <span className="text-blue-700">Account/Policy #:</span>{' '}
                          <span>{getStringValue(contact['Account Number'] || contact.accountNumber || contact.policyNumber)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {bankingContacts.map((contact: any, idx: number) => (
                  <div key={`bank-${idx}`} className="border border-green-200 rounded p-2 bg-green-50">
                    <div className="font-semibold text-xs text-green-900 mb-1">
                      {getStringValue(contact['Service Type'] || contact.serviceType || 'Banking')}
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                      <div>
                        <span className="text-green-700">Bank:</span>{' '}
                        <span className="font-semibold">{getStringValue(contact['Organization Name'] || contact.organizationName || contact.bank || contact.name)}</span>
                      </div>
                      <div>
                        <span className="text-green-700">Phone:</span>{' '}
                        <span>{getStringValue(contact['Phone Number'] || contact.phoneNumber || contact.phone)}</span>
                      </div>
                      {(contact['Email Address'] || contact.email) && (
                        <div className="col-span-2">
                          <span className="text-green-700">Email:</span>{' '}
                          <span>{getStringValue(contact['Email Address'] || contact.email)}</span>
                        </div>
                      )}
                      {(contact['Account Number'] || contact.accountNumber) && (
                        <div className="col-span-2">
                          <span className="text-green-700">Account #:</span>{' '}
                          <span>{getStringValue(contact['Account Number'] || contact.accountNumber)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 5: VITAL RECORDS & DATA PROTECTION */}
        {vitalRecords.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-3 pb-2 border-b-2 border-slate-800">
              <div className="bg-slate-800 text-white w-8 h-8 rounded flex items-center justify-center font-bold">5</div>
              <h2 className="text-xl font-bold text-slate-900">Vital Records & Data Protection</h2>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-slate-700 leading-normal">
                Critical records and data must be protected, backed up regularly, and recoverable quickly to ensure business continuity. 
                The following records are essential to our operations and have established protection and recovery procedures.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {vitalRecords.map((record: any, idx: number) => (
                <div key={idx} className="border border-slate-300 rounded overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-semibold text-xs flex items-center justify-between">
                    <span>{getStringValue(record['Record Type'] || record.recordType || record.name)}</span>
                    {record.format && (
                      <span className="text-xs bg-slate-200 px-1.5 py-0.5 rounded">
                        {getStringValue(record.format)}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      {(record.Location || record.location || record.storageLocation) && (
                        <div>
                          <span className="text-slate-600">Primary Location:</span>{' '}
                          <span className="font-semibold">{getStringValue(record.Location || record.location || record.storageLocation)}</span>
                        </div>
                      )}
                      {(record['Backup Location'] || record.backupLocation) && (
                        <div>
                          <span className="text-slate-600">Backup Location:</span>{' '}
                          <span className="font-semibold">{getStringValue(record['Backup Location'] || record.backupLocation)}</span>
                        </div>
                      )}
                      {(record['Update Frequency'] || record.updateFrequency || record.backupFrequency) && (
                        <div>
                          <span className="text-slate-600">Update Frequency:</span>{' '}
                          <span className="font-semibold">{getStringValue(record['Update Frequency'] || record.updateFrequency || record.backupFrequency)}</span>
                        </div>
                      )}
                      {(record['Responsible Person'] || record.responsiblePerson) && (
                        <div>
                          <span className="text-slate-600">Responsible Person:</span>{' '}
                          <span className="font-semibold">{getStringValue(record['Responsible Person'] || record.responsiblePerson)}</span>
                        </div>
                      )}
                      {record.retentionPeriod && (
                        <div>
                          <span className="text-slate-600">Retention Period:</span>{' '}
                          <span className="font-semibold">{getStringValue(record.retentionPeriod)}</span>
                        </div>
                      )}
                      {record.recoveryTime && (
                        <div>
                          <span className="text-slate-600">Recovery Time:</span>{' '}
                          <span className="font-semibold">{getStringValue(record.recoveryTime)}</span>
                        </div>
                      )}
                    </div>
                    
                    {record.backupProcedure && (
                      <div className="mt-1.5 bg-blue-50 border-l-2 border-blue-400 p-1.5">
                        <div className="text-xs font-semibold text-blue-900 mb-0.5">Backup Procedure:</div>
                        <div className="text-xs text-blue-800">{getStringValue(record.backupProcedure)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 6: PLAN MAINTENANCE & TESTING */}
        <section>
          <div className="flex items-center gap-3 mb-3 pb-2 border-b-2 border-slate-800">
            <div className="bg-slate-800 text-white w-8 h-8 rounded flex items-center justify-center font-bold">{vitalRecords.length > 0 ? '6' : '5'}</div>
            <h2 className="text-xl font-bold text-slate-900">Plan Maintenance & Testing</h2>
          </div>
          
          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-slate-700">
                We regularly test our preparedness to ensure this plan works when needed. 
                This plan is reviewed <strong>quarterly</strong> and updated whenever business circumstances change.
              </p>
              <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                <div className="font-semibold mb-0.5">Plan Updates When:</div>
                <div>• We move locations or make major facility changes</div>
                <div>• Key personnel change</div>
                <div>• After any actual emergency or disruption</div>
                <div>• Suppliers, insurance, or banking relationships change</div>
                <div>• At least once per year regardless of changes</div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-slate-700 mb-4">
            <div className="font-semibold mb-1">Responsibility:</div>
            <p>{planManagerInfo} is responsible for ensuring the plan stays current and conducting regular tests.</p>
          </div>
          
          {/* Testing Schedule */}
          {testingSchedule.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">
                {vitalRecords.length > 0 ? '6.1' : '5.1'} Testing & Exercise Schedule
              </h3>
              <p className="text-xs text-slate-600 mb-2">
                Scheduled tests to verify preparedness and identify improvements needed.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {testingSchedule.map((test: any, idx: number) => (
                  <div key={idx} className="border border-slate-300 rounded p-2 bg-white">
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-semibold text-xs text-slate-800">
                        {getStringValue(test['Test Type'] || test.testType || test.name)}
                      </div>
                      <div className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                        {getStringValue(test.Frequency || test.frequency || 'As scheduled')}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(test['Next Date'] || test.nextTestDate || test.nextDate) && (
                        <div>
                          <span className="text-slate-600">Next Test:</span>{' '}
                          <span className="font-semibold">{getStringValue(test['Next Date'] || test.nextTestDate || test.nextDate)}</span>
                        </div>
                      )}
                      {(test.Responsible || test.responsible) && (
                        <div>
                          <span className="text-slate-600">Responsible:</span>{' '}
                          <span className="font-semibold">{getStringValue(test.Responsible || test.responsible)}</span>
                        </div>
                      )}
                      {(test.Participants || test.participants) && (
                        <div className="col-span-2">
                          <span className="text-slate-600">Participants:</span>{' '}
                          <span>{getStringValue(test.Participants || test.participants)}</span>
                        </div>
                      )}
                    </div>
                    {test.description && (
                      <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2 rounded">
                        {getStringValue(test.description)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Training Programs */}
          {trainingPrograms.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">
                {vitalRecords.length > 0 ? '6.2' : '5.2'} Training Programs
              </h3>
              <p className="text-xs text-slate-600 mb-2">
                Staff training ensures everyone knows their role in emergency response and recovery.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {trainingPrograms.map((program: any, idx: number) => (
                  <div key={idx} className="border border-green-300 rounded p-2 bg-green-50">
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-semibold text-xs text-green-900">
                        {getStringValue(program['Training Topic'] || program.trainingTopic || program.trainingName || program.name)}
                      </div>
                      {(program.Duration || program.duration) && (
                        <div className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded">
                          {getStringValue(program.Duration || program.duration)}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-1.5">
                      {(program.Frequency || program.frequency) && (
                        <div>
                          <span className="text-green-700">Frequency:</span>{' '}
                          <span className="font-semibold text-green-900">{getStringValue(program.Frequency || program.frequency)}</span>
                        </div>
                      )}
                      {(program['Next Date'] || program.nextDate || program.nextSessionDate) && (
                        <div>
                          <span className="text-green-700">Next Session:</span>{' '}
                          <span className="font-semibold text-green-900">{getStringValue(program['Next Date'] || program.nextDate || program.nextSessionDate)}</span>
                        </div>
                      )}
                      {(program.Trainer || program.trainer) && (
                        <div className="col-span-2">
                          <span className="text-green-700">Trainer:</span>{' '}
                          <span className="font-semibold text-green-900">{getStringValue(program.Trainer || program.trainer)}</span>
                        </div>
                      )}
                    </div>
                    {program.topics && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-green-800 mb-1">Topics Covered:</div>
                        <div className="text-xs text-green-800">
                          {Array.isArray(program.topics) 
                            ? program.topics.map((t: any) => getStringValue(t)).join(' • ')
                            : getStringValue(program.topics)
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Improvements Needed */}
          {improvements.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">
                {vitalRecords.length > 0 ? '6.3' : '5.3'} Identified Improvements
              </h3>
              <p className="text-xs text-slate-600 mb-2">
                Areas for improvement identified through testing, exercises, or actual incidents.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {improvements.map((improvement: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-yellow-400 bg-yellow-50 p-2">
                    <div className="font-semibold text-xs text-yellow-900 mb-0.5">
                      {getStringValue(improvement['Issue Identified'] || improvement.issueIdentified || improvement.area || improvement.title)}
                    </div>
                    <div className="text-xs text-yellow-800 mb-1">
                      <span className="text-yellow-700">Action Required:</span>{' '}
                      {getStringValue(improvement['Action Required'] || improvement.actionRequired || improvement.action || improvement.description)}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                      {(improvement.Responsible || improvement.responsible) && (
                        <div>
                          <span className="text-yellow-700">Responsible:</span>{' '}
                          <span className="font-semibold text-yellow-900">{getStringValue(improvement.Responsible || improvement.responsible)}</span>
                        </div>
                      )}
                      {(improvement['Due Date'] || improvement.dueDate || improvement.targetDate) && (
                        <div>
                          <span className="text-yellow-700">Due Date:</span>{' '}
                          <span className="font-semibold text-yellow-900">{getStringValue(improvement['Due Date'] || improvement.dueDate || improvement.targetDate)}</span>
                        </div>
                      )}
                      {(improvement.Status || improvement.status) && (
                        <div>
                          <span className="text-yellow-700">Status:</span>{' '}
                          <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
                            (improvement.Status || improvement.status) === 'Completed' ? 'bg-green-100 text-green-800' :
                            (improvement.Status || improvement.status) === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getStringValue(improvement.Status || improvement.status)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 7: CERTIFICATION */}
        <section className="border-t-2 border-slate-300 pt-5 mt-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-2">Plan Approval</h3>
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-4">
              <p className="text-sm text-slate-700 mb-3">
                This Business Continuity Plan was prepared on <strong>{new Date().toLocaleDateString()}</strong> and is approved for implementation:
              </p>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Business Owner/Manager:</div>
                  <div className="border-b-2 border-slate-400 w-64 h-8"></div>
                  <div className="text-xs text-slate-500 mt-1">Signature & Date</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Plan Manager Contact:</div>
                  <div className="text-sm font-semibold">{planManagerInfo}</div>
                  <div className="text-xs text-slate-600">{planManagerContactDisplay}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-3 text-center">
            <div className="text-xs font-semibold text-green-900 mb-1">Technical Assistance Provided By:</div>
            <div className="text-sm font-bold text-green-800">UNDP Caribbean | CARICHAM</div>
            <div className="text-xs text-green-700 mt-0.5">(Caribbean Chamber of Commerce)</div>
            <div className="text-xs text-slate-600 mt-2">
              Industry Standards Referenced: UNDP Business Continuity Framework • CARICHAM SME Best Practices
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer Note */}
      <div className="bg-slate-100 px-6 py-3 border-t border-slate-300">
        <div className="text-xs text-slate-600 text-center">
          📄 This is a browser preview. You can scroll through all sections to review your plan before downloading.
        </div>
      </div>
    </div>
  )
}

