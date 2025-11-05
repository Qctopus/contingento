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
}

export const FormalBCPPreview: React.FC<FormalBCPPreviewProps> = ({
  formData,
  strategies,
  risks
}) => {
  // Log what we received
  console.log('[FormalBCPPreview] Received props:', {
    strategiesCount: strategies.length,
    risksCount: risks.length,
    strategies: strategies.map(s => ({
      name: s.name,
      category: s.category,
      hasCalculatedCost: !!s.calculatedCostLocal,
      calculatedCostLocal: s.calculatedCostLocal,
      currencySymbol: s.currencySymbol,
      currencyCode: s.currencyCode,
      timeToImplement: s.timeToImplement,
      implementationTime: s.implementationTime,
      actionStepsCount: s.actionSteps?.length,
      applicableRisks: s.applicableRisks
    }))
  })
  
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
    
    // Try to get from localStorage prefill data (set during industry/location selection)
    if (typeof window !== 'undefined') {
      try {
        const preFillData = localStorage.getItem('bcp-prefill-data')
        if (preFillData) {
          const data = JSON.parse(preFillData)
          if (data.location?.countryCode) {
            countryCode = data.location.countryCode
            countryName = data.location.country || countryName
          }
        }
      } catch (e) {
        console.warn('[FormalBCPPreview] Could not load country from prefill data:', e)
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
  
  // Get risk matrix with proper filtering
  const riskMatrix = (formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || [])
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

  // Get high-priority risks (HIGH or EXTREME only) for Section 2
  const highPriorityRisks = riskMatrix.filter((r: any) => {
    const level = (r.riskLevel || r['Risk Level'] || '').toLowerCase()
    return level.includes('high') || level.includes('extreme')
  })
  
  // Get ALL selected risks that have strategies (for Section 3)
  // COPY EXACT LOGIC FROM BusinessPlanReview.tsx lines 286-307
  const risksWithStrategies = riskMatrix.filter((r: any) => {
    const hazardName = r.hazardName || r.Hazard || ''
    const hazardId = r.hazardId || hazardName
    
    // Check if any selected strategy applies to this risk (SAME AS REVIEW SECTION)
    const hasStrategy = strategies.some((strategy: any) => {
      if (!strategy.applicableRisks || strategy.applicableRisks.length === 0) return false
      
      return strategy.applicableRisks.some((riskId: string) => {
        const riskIdLower = riskId.toLowerCase().replace(/_/g, ' ')
        const hazardNameLower = hazardName.toLowerCase()
        const hazardIdLower = (hazardId || '').toString().toLowerCase()
        
        return riskId === hazardId || 
               riskId === r.hazard ||
               riskId === hazardName ||
               riskIdLower === hazardIdLower ||
               riskIdLower === hazardNameLower ||
               hazardNameLower.includes(riskIdLower) ||
               riskIdLower.includes(hazardNameLower)
      })
    })
    
    return hasStrategy
  })
  
  console.log('[FormalBCPPreview] Risk matching results:', {
    totalRisksInMatrix: riskMatrix.length,
    highPriorityRisks: highPriorityRisks.length,
    risksWithStrategies: risksWithStrategies.length,
    riskDetails: risksWithStrategies.map(r => ({
      hazardId: r.hazardId,
      hazardName: r.hazardName || r.Hazard,
      riskLevel: r.riskLevel,
      strategyCount: strategies.filter(s => {
        if (!s.applicableRisks) return false
        const riskIdNorm = (r.hazardId || '').toLowerCase().replace(/_/g, ' ')
        const riskNameNorm = (r.hazardName || r.Hazard || '').toLowerCase().replace(/_/g, ' ')
        return s.applicableRisks.some((srid: string) => {
          const sridNorm = srid.toLowerCase().replace(/_/g, ' ')
          return sridNorm === riskIdNorm || sridNorm === riskNameNorm || 
                 riskNameNorm.includes(sridNorm) || sridNorm.includes(riskNameNorm)
        })
      }).length
    }))
  })
  
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
  
  // Get emergency contacts
  const contacts = formData.CONTACTS?.['Contact Information'] || []
  const emergencyContacts = contacts.filter((c: any) => 
    c.category === 'emergency_services' || c.category === 'utilities'
  )
  const keySuppliers = contacts.filter((c: any) => c.category === 'suppliers').slice(0, 3)
  
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
                  console.log(`[Preview] Strategy "${s.name}" category: "${s.category}" → cost: ${cost}`)
                  
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
          
          {/* Strategies by Risk */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">3.2 Our Preparation Strategies</h3>
            <div className="space-y-6">
              {risksWithStrategies.map((risk: any, riskIdx: number) => {
                // Risk data already has multilingual content extracted
                const hazardName = risk.hazardName || risk.Hazard || 'Unnamed Risk'
                const hazardId = risk.hazardId || hazardName
                
                // Find strategies that apply to this risk (SAME LOGIC AS BusinessPlanReview.tsx)
                const applicableStrategies = strategies.filter(strategy => {
                  if (!strategy.applicableRisks || strategy.applicableRisks.length === 0) return false
                  
                  return strategy.applicableRisks.some((riskId: string) => {
                    const riskIdLower = riskId.toLowerCase().replace(/_/g, ' ')
                    const hazardNameLower = hazardName.toLowerCase()
                    const hazardIdLower = (hazardId || '').toString().toLowerCase()
                    
                    return riskId === hazardId || 
                           riskId === risk.hazard ||
                           riskId === hazardName ||
                           riskIdLower === hazardIdLower ||
                           riskIdLower === hazardNameLower ||
                           hazardNameLower.includes(riskIdLower) ||
                           riskIdLower.includes(hazardNameLower)
                  })
                })
                
                if (applicableStrategies.length === 0) return null
                
                // Calculate total cost for this risk - USE WIZARD'S CALCULATED COSTS
                const strategyCost = applicableStrategies.reduce((sum, s) => {
                  // FIRST: Use calculated cost from wizard
                  if (s.calculatedCostLocal && s.calculatedCostLocal > 0) {
                    return sum + s.calculatedCostLocal
                  }
                  
                  // FALLBACK: Parse legacy cost string
                  const costStr = s.implementationCost || s.cost || ''
                  const parsedCost = parseCostString(costStr)
                  
                  if (parsedCost > 0) {
                    return sum + parsedCost
                  }
                  
                  // Last resort: legacy cost estimate
                  if (s.costEstimateJMD && typeof s.costEstimateJMD === 'number') {
                    return sum + s.costEstimateJMD
                  }
                  
                  return sum
                }, 0)
                
                return (
                  <div key={riskIdx} className="border-l-4 border-green-600 bg-slate-50 p-4">
                    <div className="font-bold text-sm text-slate-800 mb-1">Protection Against: {hazardName}</div>
                    <div className="text-xs text-slate-600 mb-3">
                      Strategies: {applicableStrategies.length} | Total Investment: {formatCurrency(strategyCost, currencyInfo)}
                    </div>
                    
                    <div className="space-y-3">
                      {applicableStrategies.map((strategy: any, stratIdx: number) => {
                        // Use calculated cost if available, fallback to parsing
                        const costAmount = strategy.calculatedCostLocal || parseCostString(strategy.implementationCost || '')
                        const costDisplay = strategy.currencySymbol && costAmount > 0
                          ? `${strategy.currencySymbol}${Math.round(costAmount).toLocaleString()} ${strategy.currencyCode}`
                          : costAmount > 0 
                          ? formatCurrency(costAmount, currencyInfo)
                          : 'Cost TBD'
                        
                        // Extract timeline/timeframe
                        const timeline = getStringValue(
                          strategy.timeToImplement || 
                          strategy.implementationTime ||
                          strategy.timeframe || 
                          'TBD'
                        )
                        
                        // Extract effectiveness rating
                        const effectiveness = strategy.effectiveness || 0
                        
                        return (
                          <div key={stratIdx} className="bg-white border border-slate-200 rounded p-3">
                            <div className="font-semibold text-sm text-slate-800 mb-2">
                              {stratIdx + 1}. {getStringValue(strategy.smeTitle || strategy.name || strategy.title)}
                            </div>
                            
                            {(strategy.smeSummary || strategy.description) && (
                              <p className="text-xs text-slate-600 mb-2 italic">{getStringValue(strategy.smeSummary || strategy.description)}</p>
                            )}
                            
                            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                              <div>
                                <span className="font-semibold">Investment:</span> {costDisplay}
                              </div>
                              <div>
                                <span className="font-semibold">Timeline:</span> {timeline}
                              </div>
                              <div>
                                <span className="font-semibold">Effectiveness:</span> {effectiveness > 0 ? `${effectiveness}/10` : 'N/A'}
                              </div>
                            </div>
                            
                            {/* Show ALL action steps (not just first 3) */}
                            {strategy.actionSteps && strategy.actionSteps.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <div className="font-semibold text-xs text-slate-700 mb-2">Key Actions:</div>
                                {strategy.actionSteps.map((step: any, stepIdx: number) => {
                                  const actionText = getStringValue(step.smeAction || step.action || step.title || '')
                                  const timeframe = step.timeframe ? ` (${step.timeframe})` : ''
                                  
                                  return (
                                    <div key={stepIdx} className="text-xs text-slate-600 flex gap-2">
                                      <span className="text-green-600 font-bold">→</span>
                                      <span>{actionText}{timeframe}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* SECTION 4: EMERGENCY RESPONSE */}
        <section>
          <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-slate-800">
            <div className="bg-slate-800 text-white w-8 h-8 rounded flex items-center justify-center font-bold">4</div>
            <h2 className="text-xl font-bold text-slate-900">Emergency Response</h2>
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
          
          {emergencyContacts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">4.2 Critical Emergency Contacts</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {emergencyContacts.map((contact: any, idx: number) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="font-semibold text-sm text-slate-800">{getStringValue(contact.name || contact.serviceName)}</div>
                    <div className="text-xs text-slate-600">{getStringValue(contact.phone || contact.phoneNumber)}</div>
                    {contact.accountNumber && (
                      <div className="text-xs text-slate-500 mt-1">Account: {getStringValue(contact.accountNumber)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {keySuppliers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">4.3 Key Suppliers</h3>
              <table className="w-full border border-slate-300 text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Supplier</th>
                    <th className="px-3 py-2 text-left">Product/Service</th>
                    <th className="px-3 py-2 text-left">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {keySuppliers.map((supplier: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-3 py-2 border-t border-slate-200">{getStringValue(supplier.name || supplier.companyName)}</td>
                      <td className="px-3 py-2 border-t border-slate-200">{getStringValue(supplier.service || supplier.productType || 'Various')}</td>
                      <td className="px-3 py-2 border-t border-slate-200">{getStringValue(supplier.phone || supplier.phoneNumber)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* SECTION 5: PLAN MAINTENANCE */}
        <section>
          <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-slate-800">
            <div className="bg-slate-800 text-white w-8 h-8 rounded flex items-center justify-center font-bold">5</div>
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
          
          <div className="text-sm text-slate-700">
            <div className="font-semibold mb-1">Responsibility:</div>
            <p>{planManagerInfo} is responsible for ensuring the plan stays current and conducting regular tests.</p>
          </div>
        </section>

        {/* SECTION 6: CERTIFICATION */}
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

