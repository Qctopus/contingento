/**
 * Formal BCP Preview Component
 * Browser-based preview showing what will be in the formal BCP document
 * Professional format suitable for bank loan submissions
 */

import React from 'react'

interface FormalBCPPreviewProps {
  formData: any
  strategies: any[]
  risks: any[]
  countryCode?: string  // Optional: country code for currency detection
}

export const FormalBCPPreview: React.FC<FormalBCPPreviewProps> = ({
  formData,
  strategies,
  risks,
  countryCode: propCountryCode
}) => {
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
  const getStringValue = (value: any, locale: string = 'en'): string => {
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

  // Format currency with proper symbol and thousands separators
  const formatCurrency = (amount: number, currency: { code: string; symbol: string } = currencyInfo): string => {
    if (amount === 0 || isNaN(amount)) return 'Cost TBD'
    
    const formatted = Math.round(amount).toLocaleString('en-US')
    return `${currency.symbol}${formatted} ${currency.code}`
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
    .filter((r: any) => r.isSelected !== false) // CRITICAL: Only show user-selected risks
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
      
      return {
        hazardId: r.hazardId || r.id,
        hazardName: getStringValue(r.hazardName || r.Hazard || 'Unnamed Risk'),
        Hazard: getStringValue(r.hazardName || r.Hazard || 'Unnamed Risk'), // Keep for backward compatibility
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
  const risksWithStrategies = riskMatrix.filter((r: any) => {
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
      if (s.calculatedCostLocal && s.calculatedCostLocal > 0) {
        total += s.calculatedCostLocal
      } else {
        // FALLBACK: Parse legacy cost string
        const costStr = s.implementationCost || s.cost || ''
        const parsedCost = parseCostString(costStr)
        
        if (parsedCost > 0) {
          total += parsedCost
        } else if (s.costEstimateJMD && typeof s.costEstimateJMD === 'number') {
          // Last resort: legacy cost estimate
          total += s.costEstimateJMD
        }
      }
    })
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
                           managerContact?.Phone || 
                           managerContact?.phone || 
                           ''
  const planManagerEmail = formData.PLAN_INFORMATION?.['Email'] || 
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
  const improvements = formData.TESTING_AND_MAINTENANCE?.['Improvement Tracking'] || 
                      formData.TESTING?.['Improvement Tracking'] || 
                      formData.TESTING?.['Improvements Needed'] || []
  
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
  
  return (
    <div className="bg-white border-2 border-slate-300 shadow-lg rounded-lg overflow-hidden">
      {/* Professional Header - UNDP Style */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-10 py-8 border-b-4 border-green-600">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider mb-2 opacity-90">Formal Business Continuity Plan</div>
          <h1 className="text-3xl font-bold mb-2">{companyName}</h1>
          <div className="text-sm opacity-90">
            {parish && <span>{parish}, </span>}
            {country}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-600 text-xs">
            Plan Version: 1.0 • Prepared: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
      
      {/* UNDP Certification Footer */}
      <div className="bg-slate-100 px-8 py-3 text-center border-b border-slate-300">
        <div className="text-xs text-slate-600">
          Prepared with technical support from: <span className="font-semibold">UNDP Caribbean | CARICHAM Business Support Program</span>
        </div>
      </div>

      {/* Document Body */}
      <div className="px-10 py-8 space-y-8">
        
        {/* SECTION 1: BUSINESS OVERVIEW */}
        <section>
          <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-slate-800">
            <div className="bg-slate-800 text-white w-8 h-8 rounded flex items-center justify-center font-bold">1</div>
            <h2 className="text-xl font-bold text-slate-900">Business Overview</h2>
          </div>
          
          {/* Business Information Table */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">1.1 Business Information</h3>
            <table className="w-full border border-slate-300 text-sm">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 bg-slate-100 font-semibold w-1/3">Business Name</td>
                  <td className="px-4 py-2">{companyName}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 bg-slate-100 font-semibold">Business Type</td>
                  <td className="px-4 py-2">{businessType}</td>
                </tr>
                <tr className={yearsInOperation || totalPeople || annualRevenue ? "border-b border-slate-300" : ""}>
                  <td className="px-4 py-2 bg-slate-100 font-semibold">Physical Address</td>
                  <td className="px-4 py-2">{businessAddress || 'Not specified'}</td>
                </tr>
                {yearsInOperation && (
                  <tr className={totalPeople || annualRevenue ? "border-b border-slate-300" : ""}>
                    <td className="px-4 py-2 bg-slate-100 font-semibold">Years in Operation</td>
                    <td className="px-4 py-2">{yearsInOperation}</td>
                  </tr>
                )}
                {totalPeople && (
                  <tr className={annualRevenue ? "border-b border-slate-300" : ""}>
                    <td className="px-4 py-2 bg-slate-100 font-semibold">Total People in Business</td>
                    <td className="px-4 py-2">{totalPeople}</td>
                  </tr>
                )}
                {annualRevenue && (
                  <tr>
                    <td className="px-4 py-2 bg-slate-100 font-semibold">Approximate Annual Revenue</td>
                    <td className="px-4 py-2">{formatRevenue(annualRevenue)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Business Purpose */}
          {businessPurpose && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-2">1.2 Business Purpose</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{businessPurpose}</p>
            </div>
          )}
          
          {/* Key Strengths */}
          {competitiveAdvantages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-2">1.3 Key Strengths</h3>
              <ul className="list-none space-y-1">
                {competitiveAdvantages.slice(0, 3).map((adv, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Essential Operations */}
          {topFunctions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-2">1.4 Essential Operations</h3>
              <p className="text-xs text-slate-600 mb-3">These functions are critical to keeping our business running:</p>
              <div className="space-y-2">
                {topFunctions.map((func: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-green-600 bg-slate-50 px-4 py-2">
                    <div className="font-semibold text-sm text-slate-800">{func.name}</div>
                    {func.description && (
                      <div className="text-xs text-slate-600 mt-1">{func.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Target Markets & Customers */}
          {targetMarkets && targetMarkets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-2">1.5 Target Markets</h3>
              <div className="bg-slate-50 p-4 rounded">
                {Array.isArray(targetMarkets) ? (
                  <ul className="space-y-1">
                    {targetMarkets.map((market: any, idx: number) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{getStringValue(market.name || market)}</span>
                        {market.percentage && (
                          <span className="text-slate-600 ml-2">({market.percentage}% of revenue)</span>
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
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-2">1.6 Products & Services</h3>
              <div className="bg-slate-50 p-4 rounded">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {getStringValue(productsServices)}
                </p>
              </div>
            </div>
          )}
          
          {/* Critical Functions Analysis with Priorities */}
          {functionsWithPriorities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">1.7 Critical Function Analysis</h3>
              <p className="text-xs text-slate-600 mb-3">
                Priority levels, maximum acceptable downtime, and recovery objectives for our most critical business functions.
              </p>
              <div className="space-y-3">
                {functionsWithPriorities.map((func: any, idx: number) => (
                  <div key={idx} className="border-2 border-slate-300 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 font-semibold text-sm">
                      {func.name}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-xs">
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
                        <div className="mt-2">
                          <div className="text-xs font-semibold text-slate-700 mb-1">Impact if Disrupted:</div>
                          <div className="text-xs text-slate-700 bg-yellow-50 border-l-4 border-yellow-400 p-2">
                            {func.impact}
                          </div>
                        </div>
                      )}
                      
                      {func.recoveryStrategy && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold text-slate-700 mb-1">Recovery Strategy:</div>
                          <div className="text-xs text-slate-700 bg-green-50 border-l-4 border-green-400 p-2">
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
          <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-slate-800">
            <div className="bg-slate-800 text-white w-8 h-8 rounded flex items-center justify-center font-bold">2</div>
            <h2 className="text-xl font-bold text-slate-900">Risk Assessment</h2>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">2.1 Risk Identification</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              We have identified <strong>{riskMatrix.length} significant risks</strong> that could disrupt our business operations, 
              including <strong className="text-red-700">{highPriorityRisks.length} high-priority risks</strong> requiring immediate attention.
            </p>
          </div>
          
          {/* High-Priority Risks Detail */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">2.2 Major Risks Analysis</h3>
            <div className="space-y-4">
              {highPriorityRisks.map((risk: any, idx: number) => {
                // Risk data already has multilingual content extracted
                const riskName = risk.hazardName || risk.Hazard || 'Unnamed Risk'
                const riskScore = risk.riskScore || risk['Risk Score'] || 0
                const riskLevel = risk.riskLevel || risk['Risk Level'] || (riskScore >= 7.5 ? 'EXTREME' : 'HIGH')
                const likelihood = risk.likelihood || risk.Likelihood || 'Not assessed'
                const impact = risk.impact || risk.Impact || 'Not assessed'
                const reasoning = risk.reasoning || 'Assessment pending'
                
                return (
                  <div key={idx} className="border-2 border-slate-300 rounded-lg overflow-hidden">
                    <div className={`px-4 py-2 font-bold text-sm ${
                      riskLevel === 'EXTREME' ? 'bg-red-700 text-white' : 'bg-orange-600 text-white'
                    }`}>
                      RISK: {riskName}
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="px-4 py-2 bg-slate-50 font-semibold w-1/3">Risk Score</td>
                          <td className="px-4 py-2">{riskScore.toFixed(1)}/10 ({riskLevel})</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-4 py-2 bg-slate-50 font-semibold">Likelihood</td>
                          <td className="px-4 py-2">{likelihood}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-4 py-2 bg-slate-50 font-semibold">Potential Impact</td>
                          <td className="px-4 py-2">{impact}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 bg-slate-50 font-semibold">Our Vulnerability</td>
                          <td className="px-4 py-2 text-slate-700">{reasoning}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Complete Risk Summary Table */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">2.3 Complete Risk Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-slate-300 text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Risk</th>
                    <th className="px-3 py-2 text-left">Likelihood</th>
                    <th className="px-3 py-2 text-left">Impact</th>
                    <th className="px-3 py-2 text-left">Score</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {riskMatrix.map((risk: any, idx: number) => {
                    // Risk matrix already filtered by isSelected
                    const riskScore = risk.riskScore || risk['Risk Score'] || 0
                    const hasStrategies = strategies.some(s => 
                      s.applicableRisks?.includes(risk.hazardId)
                    )
                    
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-3 py-2 border-t border-slate-200">{risk.hazardName || risk.Hazard || 'Unnamed'}</td>
                        <td className="px-3 py-2 border-t border-slate-200">{risk.likelihood || risk.Likelihood || 'N/A'}</td>
                        <td className="px-3 py-2 border-t border-slate-200">{risk.impact || risk.Impact || 'N/A'}</td>
                        <td className="px-3 py-2 border-t border-slate-200 font-semibold">{riskScore.toFixed(1)}</td>
                        <td className="px-3 py-2 border-t border-slate-200">
                          <span className={`text-xs px-2 py-1 rounded ${
                            hasStrategies ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {hasStrategies ? 'Addressed' : 'Planned'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 3: CONTINUITY STRATEGIES */}
        <section>
          <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-slate-800">
            <div className="bg-slate-800 text-white w-8 h-8 rounded flex items-center justify-center font-bold">3</div>
            <h2 className="text-xl font-bold text-slate-900">Continuity Strategies</h2>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">3.1 Investment Summary</h3>
            <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
              <p className="text-sm text-slate-700 mb-2">
                We are investing <strong className="text-green-800 text-lg">{formatCurrency(totalInvestment, currencyInfo)}</strong> in business continuity measures 
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
                  const cost = s.calculatedCostLocal || parseCostString(s.implementationCost || '')
                  const category = (s.category || '').toLowerCase()
                  
                  // Log for debugging
                  const strategyName = getStringValue(s.smeTitle || s.name) || 'Unnamed'
                  console.log(`[Preview] Strategy "${strategyName}" category: "${s.category}" → cost: ${cost}`)
                  
                  if (category.includes('prevent') || category.includes('mitigat') || category.includes('prepar')) {
                    categoryInvestment.prevention += cost
                  } else if (category.includes('response') || category.includes('emergency') || category.includes('react')) {
                    categoryInvestment.response += cost
                  } else if (category.includes('recover') || category.includes('restor') || category.includes('continuity')) {
                    categoryInvestment.recovery += cost
                  } else {
                    // Default to prevention if unclear
                    console.log(`[Preview] Unknown category "${s.category}", defaulting to prevention`)
                    categoryInvestment.prevention += cost
                  }
                })
                
                const totalCategory = categoryInvestment.prevention + categoryInvestment.response + categoryInvestment.recovery
                
                if (totalCategory > 0) {
                  const preventionPct = Math.round((categoryInvestment.prevention / totalCategory) * 100)
                  const responsePct = Math.round((categoryInvestment.response / totalCategory) * 100)
                  const recoveryPct = Math.round((categoryInvestment.recovery / totalCategory) * 100)
                  
                  return (
                    <div className="text-xs text-slate-600 mt-3">
                      <div className="font-semibold mb-1">Investment Breakdown:</div>
                      <div>• Prevention & Mitigation: {formatCurrency(categoryInvestment.prevention, currencyInfo)} ({preventionPct}%)</div>
                      <div>• Response Capabilities: {formatCurrency(categoryInvestment.response, currencyInfo)} ({responsePct}%)</div>
                      <div>• Recovery Resources: {formatCurrency(categoryInvestment.recovery, currencyInfo)} ({recoveryPct}%)</div>
                    </div>
                  )
                } else {
                  return (
                    <div className="text-xs text-slate-600 mt-3">
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
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">3.2 Our Preparation Strategies</h3>
            <p className="text-xs text-slate-600 mb-4">
              These {strategies.length} strategies were selected based on your business needs, location risks, and operational requirements.
            </p>
            
            <div className="space-y-4">
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
                    return matchingRisk.hazardName || matchingRisk.Hazard
                  }
                  
                  // Fallback: Format the risk ID nicely
                  return riskId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
                }).filter(Boolean)
                
                // PRIORITY: Use calculated cost from wizard (already in correct currency)
                const costAmount = strategyCost
                
                // CRITICAL FIX: Always use detected currency (currencyInfo) as the source of truth
                const useCurrency = (strategy.calculatedCostLocal > 0 && strategy.currencySymbol) 
                  ? { symbol: strategy.currencySymbol, code: strategy.currencyCode }
                  : currencyInfo
                
                const costDisplay = costAmount > 0
                  ? `${useCurrency.symbol}${Math.round(costAmount).toLocaleString()} ${useCurrency.code}`
                  : 'Cost TBD'
                
                // Debug log for each strategy
                const stratName = getStringValue(strategy.smeTitle || strategy.name) || 'Unnamed'
                console.log(`[FormalBCP] Rendering strategy #${stratIdx + 1}: "${stratName}" cost=${costAmount}`)
                
                // Extract timeline/timeframe - PRIORITY: Use estimatedTotalHours first
                const getTimeline = (): string => {
                  // PRIORITY 1: Use estimatedTotalHours (what wizard shows)
                  if (strategy.estimatedTotalHours && strategy.estimatedTotalHours > 0) {
                    const hours = strategy.estimatedTotalHours
                    let formatted = ''
                    if (hours < 1) formatted = 'Less than 1 hour'
                    else if (hours === 1) formatted = '1 hour'
                    else if (hours < 8) formatted = `~${hours}h`
                    else if (hours < 40) formatted = `~${Math.round(hours / 8)} days`
                    else if (hours < 160) formatted = `~${Math.round(hours / 40)} weeks`
                    else formatted = `~${Math.round(hours / 160)} months`
                    
                    return formatted
                  }
                  
                  // PRIORITY 2: Use timeToImplement or implementationTime
                  const timeStr = getStringValue(
                    strategy.timeToImplement || 
                    strategy.implementationTime ||
                    strategy.timeframe || 
                    ''
                  )
                  
                  if (timeStr) return timeStr
                  
                  // PRIORITY 3: Fallback to 'TBD'
                  return 'TBD'
                }
                
                const timeline = getTimeline()
                
                // Extract effectiveness rating
                const effectiveness = strategy.effectiveness || 0
                
                // Get priority badge
                const priorityTier = strategy.priorityTier || strategy.selectionTier || 'recommended'
                const priorityBadge = priorityTier === 'essential' 
                  ? { label: 'ESSENTIAL', color: 'bg-red-100 text-red-800' }
                  : priorityTier === 'recommended'
                  ? { label: 'RECOMMENDED', color: 'bg-yellow-100 text-yellow-800' }
                  : { label: 'OPTIONAL', color: 'bg-green-100 text-green-800' }
                
                return (
                  <div key={stratIdx} className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white">
                    {/* Strategy Header */}
                    <div className="bg-slate-100 px-4 py-3 border-b border-slate-300">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-slate-700 text-white px-2 py-1 rounded text-xs font-bold">
                              #{stratIdx + 1}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${priorityBadge.color}`}>
                              {priorityBadge.label}
                            </span>
                            {strategy.quickWinIndicator && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                                ⚡ QUICK WIN
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-base text-slate-900">
                            {getStringValue(strategy.smeTitle || strategy.name || strategy.title)}
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-600">Investment</div>
                          <div className="font-bold text-lg text-green-700">{costDisplay}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Strategy Content */}
                    <div className="p-4">
                      {/* Description */}
                      {(strategy.smeSummary || strategy.description) && (
                        <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                          {getStringValue(strategy.smeSummary || strategy.description)}
                        </p>
                      )}
                      
                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4 bg-slate-50 p-3 rounded">
                        <div>
                          <div className="text-xs text-slate-600 mb-1">Timeline</div>
                          <div className="font-semibold text-sm text-slate-900">{timeline}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 mb-1">Effectiveness</div>
                          <div className="font-semibold text-sm text-slate-900">
                            {effectiveness > 0 ? `${effectiveness}/10` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 mb-1">Complexity</div>
                          <div className="font-semibold text-sm text-slate-900 capitalize">
                            {strategy.complexityLevel || 'Moderate'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Protects Against */}
                      {protectsAgainstNames.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs font-semibold text-slate-700 mb-2">🛡️ Protects Against:</div>
                          <div className="flex flex-wrap gap-2">
                            {protectsAgainstNames.map((riskName: string, idx: number) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {riskName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Steps */}
                      {strategy.actionSteps && strategy.actionSteps.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-slate-700 mb-2">📋 Key Actions:</div>
                          <div className="space-y-2">
                            {strategy.actionSteps.map((step: any, stepIdx: number) => {
                              const actionText = getStringValue(step.smeAction || step.action || step.title || '')
                              const timeframe = step.timeframe ? ` (${step.timeframe})` : ''
                              
                              return (
                                <div key={stepIdx} className="flex gap-2 text-sm text-slate-700">
                                  <span className="text-green-600 font-bold flex-shrink-0">→</span>
                                  <span>{actionText}{timeframe}</span>
                                </div>
                              )
                            })}
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
          <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-slate-800">
            <div className="bg-slate-800 text-white w-8 h-8 rounded flex items-center justify-center font-bold">4</div>
            <h2 className="text-xl font-bold text-slate-900">Emergency Response & Contacts</h2>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">4.1 Emergency Leadership</h3>
            <table className="w-full border border-slate-300 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left border-r border-slate-300">Role</th>
                  <th className="px-4 py-2 text-left border-r border-slate-300">Person</th>
                  <th className="px-4 py-2 text-left">Contact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-t border-slate-300 font-semibold">Plan Manager</td>
                  <td className="px-4 py-2 border-t border-slate-300">{planManagerInfo}</td>
                  <td className="px-4 py-2 border-t border-slate-300">
                    {planManagerContactDisplay}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Staff Contact Roster */}
          {staffContactsData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">4.2 Staff Contact Roster</h3>
              <p className="text-xs text-slate-600 mb-3">Contact information for all team members during emergencies.</p>
              <table className="w-full border border-slate-300 text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Position</th>
                    <th className="px-3 py-2 text-left">Phone</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Emergency Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {staffContactsData.map((contact: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-3 py-2 border-t border-slate-200">{getStringValue(contact.Name || contact.name)}</td>
                      <td className="px-3 py-2 border-t border-slate-200">{getStringValue(contact.Position || contact.position || contact.role || contact.Role)}</td>
                      <td className="px-3 py-2 border-t border-slate-200">{getStringValue(contact.Phone || contact.phone || contact['Mobile Phone'])}</td>
                      <td className="px-3 py-2 border-t border-slate-200 text-xs">{getStringValue(contact.Email || contact.email || contact['Email Address'])}</td>
                      <td className="px-3 py-2 border-t border-slate-200 text-xs">{getStringValue(contact['Emergency Contact'] || contact.emergencyContact || '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Emergency Services */}
          {emergencyContacts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">4.3 Emergency Services</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {emergencyContacts.map((contact: any, idx: number) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="font-semibold text-sm text-slate-800">
                      {getStringValue(contact['Service Type'] || contact.serviceType || contact.type || contact.name)}
                    </div>
                    <div className="text-xs text-slate-700 mt-1">
                      {getStringValue(contact['Organization Name'] || contact.organizationName || contact.organization)}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      📞 {getStringValue(contact['Phone Number'] || contact.phoneNumber || contact.phone)}
                    </div>
                    {contact['24/7 Emergency'] && (
                      <div className="text-xs text-red-700 font-semibold mt-1">
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
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">4.4 Utilities & Essential Services</h3>
              <div className="space-y-2">
                {utilitiesContacts.map((contact: any, idx: number) => (
                  <div key={idx} className="border border-slate-300 rounded p-3 bg-white">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
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
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">4.5 Supplier Directory</h3>
              <p className="text-xs text-slate-600 mb-3">All {allSuppliers.length} suppliers listed with complete contact information.</p>
              <table className="w-full border border-slate-300 text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Supplier Name</th>
                    <th className="px-3 py-2 text-left">Contact Person</th>
                    <th className="px-3 py-2 text-left">Product/Service</th>
                    <th className="px-3 py-2 text-left">Phone</th>
                    <th className="px-3 py-2 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {allSuppliers.map((supplier: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-3 py-2 border-t border-slate-200 font-semibold">
                        {getStringValue(supplier.Name || supplier.name || supplier.companyName || supplier['Supplier Name'])}
                      </td>
                      <td className="px-3 py-2 border-t border-slate-200">
                        {getStringValue(supplier['Contact Person'] || supplier.contactPerson || supplier.contact)}
                      </td>
                      <td className="px-3 py-2 border-t border-slate-200">
                        {getStringValue(supplier.Service || supplier.service || supplier.productType || supplier['Goods/Services Supplied'] || 'Various')}
                      </td>
                      <td className="px-3 py-2 border-t border-slate-200">
                        {getStringValue(supplier.Phone || supplier.phone || supplier.phoneNumber || supplier['Phone Number'])}
                      </td>
                      <td className="px-3 py-2 border-t border-slate-200 text-xs">
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
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">4.6 Insurance & Banking Partners</h3>
              <div className="space-y-3">
                {insuranceContacts.map((contact: any, idx: number) => (
                  <div key={`ins-${idx}`} className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
                    <div className="font-semibold text-sm text-blue-900 mb-2">
                      {getStringValue(contact['Service Type'] || contact.serviceType || 'Insurance')}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
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
                  <div key={`bank-${idx}`} className="border-2 border-green-200 rounded-lg p-3 bg-green-50">
                    <div className="font-semibold text-sm text-green-900 mb-2">
                      {getStringValue(contact['Service Type'] || contact.serviceType || 'Banking')}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
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
            <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-slate-800">
              <div className="bg-slate-800 text-white w-8 h-8 rounded flex items-center justify-center font-bold">5</div>
              <h2 className="text-xl font-bold text-slate-900">Vital Records & Data Protection</h2>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                Critical records and data must be protected, backed up regularly, and recoverable quickly to ensure business continuity. 
                The following records are essential to our operations and have established protection and recovery procedures.
              </p>
            </div>
            
            <div className="space-y-3">
              {vitalRecords.map((record: any, idx: number) => (
                <div key={idx} className="border-2 border-slate-300 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-semibold text-sm flex items-center justify-between">
                    <span>{getStringValue(record['Record Type'] || record.recordType || record.name)}</span>
                    {record.format && (
                      <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                        {getStringValue(record.format)}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
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
                      <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-2">
                        <div className="text-xs font-semibold text-blue-900 mb-1">Backup Procedure:</div>
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
          <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-slate-800">
            <div className="bg-slate-800 text-white w-8 h-8 rounded flex items-center justify-center font-bold">{vitalRecords.length > 0 ? '6' : '5'}</div>
            <h2 className="text-xl font-bold text-slate-900">Plan Maintenance & Testing</h2>
          </div>
          
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                We regularly test our preparedness to ensure this plan works when needed. 
                This plan is reviewed <strong>quarterly</strong> and updated whenever business circumstances change.
              </p>
              <div className="mt-3 text-xs text-slate-600">
                <div className="font-semibold mb-1">Plan Updates When:</div>
                <div>• We move locations or make major facility changes</div>
                <div>• Key personnel change</div>
                <div>• After any actual emergency or disruption</div>
                <div>• Suppliers, insurance, or banking relationships change</div>
                <div>• At least once per year regardless of changes</div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-slate-700 mb-6">
            <div className="font-semibold mb-1">Responsibility:</div>
            <p>{planManagerInfo} is responsible for ensuring the plan stays current and conducting regular tests.</p>
          </div>
          
          {/* Testing Schedule */}
          {testingSchedule.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">
                {vitalRecords.length > 0 ? '6.1' : '5.1'} Testing & Exercise Schedule
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Scheduled tests to verify preparedness and identify improvements needed.
              </p>
              <div className="space-y-2">
                {testingSchedule.map((test: any, idx: number) => (
                  <div key={idx} className="border border-slate-300 rounded p-3 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-sm text-slate-800">
                        {getStringValue(test['Test Type'] || test.testType || test.name)}
                      </div>
                      <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {getStringValue(test.Frequency || test.frequency || 'As scheduled')}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
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
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">
                {vitalRecords.length > 0 ? '6.2' : '5.2'} Training Programs
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Staff training ensures everyone knows their role in emergency response and recovery.
              </p>
              <div className="space-y-2">
                {trainingPrograms.map((program: any, idx: number) => (
                  <div key={idx} className="border-2 border-green-300 rounded-lg p-3 bg-green-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-sm text-green-900">
                        {getStringValue(program['Training Topic'] || program.trainingTopic || program.trainingName || program.name)}
                      </div>
                      {(program.Duration || program.duration) && (
                        <div className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                          {getStringValue(program.Duration || program.duration)}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs mb-2">
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
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">
                {vitalRecords.length > 0 ? '6.3' : '5.3'} Identified Improvements
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Areas for improvement identified through testing, exercises, or actual incidents.
              </p>
              <div className="space-y-2">
                {improvements.map((improvement: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-yellow-400 bg-yellow-50 p-3">
                    <div className="font-semibold text-sm text-yellow-900 mb-1">
                      {getStringValue(improvement['Issue Identified'] || improvement.issueIdentified || improvement.area || improvement.title)}
                    </div>
                    <div className="text-xs text-yellow-800 mb-2">
                      <span className="text-yellow-700">Action Required:</span>{' '}
                      {getStringValue(improvement['Action Required'] || improvement.actionRequired || improvement.action || improvement.description)}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs mt-2">
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
        <section className="border-t-2 border-slate-300 pt-6 mt-8">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Plan Approval</h3>
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-6">
              <p className="text-sm text-slate-700 mb-4">
                This Business Continuity Plan was prepared on <strong>{new Date().toLocaleDateString()}</strong> and is approved for implementation:
              </p>
              <div className="space-y-4">
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
          
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4 text-center">
            <div className="text-xs font-semibold text-green-900 mb-2">Technical Assistance Provided By:</div>
            <div className="text-sm font-bold text-green-800">UNDP Caribbean | CARICHAM</div>
            <div className="text-xs text-green-700 mt-1">(Caribbean Chamber of Commerce)</div>
            <div className="text-xs text-slate-600 mt-3">
              Industry Standards Referenced: UNDP Business Continuity Framework • CARICHAM SME Best Practices
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer Note */}
      <div className="bg-slate-100 px-10 py-4 border-t border-slate-300">
        <div className="text-xs text-slate-600 text-center">
          📄 This is a browser preview. You can scroll through all sections to review your plan before downloading.
        </div>
      </div>
    </div>
  )
}

