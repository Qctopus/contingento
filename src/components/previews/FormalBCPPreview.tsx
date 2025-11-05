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
  // Helper to safely get string from potentially multilingual field
  const getStringValue = (value: any): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object' && (value.en || value.es || value.fr)) {
      return value.en || value.es || value.fr || ''
    }
    if (typeof value === 'number') return String(value)
    return String(value)
  }
  
  // Extract key business information
  const companyName = getStringValue(formData.PLAN_INFORMATION?.['Company Name'] || formData.BUSINESS_OVERVIEW?.['Company Name'] || 'Your Business')
  const planManager = getStringValue(formData.PLAN_INFORMATION?.['Plan Manager'] || 'Not specified')
  const businessAddress = getStringValue(formData.BUSINESS_OVERVIEW?.['Business Address'] || '')
  const businessType = getStringValue(formData.BUSINESS_OVERVIEW?.['Business Type'] || '')
  const yearsInOperation = getStringValue(formData.BUSINESS_OVERVIEW?.['Years in Operation'] || 'Not specified')
  const totalPeople = getStringValue(formData.BUSINESS_OVERVIEW?.['Total People in Business'] || 'Not specified')
  const annualRevenue = getStringValue(formData.BUSINESS_OVERVIEW?.['Approximate Annual Revenue'] || 'Not disclosed')
  
  // Parse location
  const addressParts = businessAddress.split(',').map((s: string) => s.trim())
  const parish = addressParts.length > 1 ? addressParts[addressParts.length - 2] : ''
  const country = addressParts.length > 0 ? addressParts[addressParts.length - 1] : ''
  
  // Get business purpose
  const businessPurpose = getStringValue(formData.BUSINESS_OVERVIEW?.['Business Purpose'] || '')
  
  // Get competitive advantages
  const advantages = formData.BUSINESS_OVERVIEW?.['Competitive Advantages']
  const competitiveAdvantages = Array.isArray(advantages) 
    ? advantages.map(a => getStringValue(a)).filter(a => a) 
    : typeof advantages === 'string' 
    ? [getStringValue(advantages)] 
    : []
  
  // Get essential functions
  const essentialFunctions = formData.ESSENTIAL_FUNCTIONS?.['Functions'] || []
  const topFunctions = essentialFunctions.slice(0, 6)
  
  // Get high-priority risks (score >= 6.0)
  const riskMatrix = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
  const highPriorityRisks = riskMatrix
    .filter((r: any) => r && r.isSelected !== false)
    .filter((r: any) => {
      const score = parseFloat(r.riskScore || r['Risk Score'] || 0)
      return score >= 6.0
    })
    .sort((a: any, b: any) => {
      const scoreA = parseFloat(a.riskScore || a['Risk Score'] || 0)
      const scoreB = parseFloat(b.riskScore || b['Risk Score'] || 0)
      return scoreB - scoreA
    })
  
  // Calculate total investment
  const calculateInvestment = () => {
    let total = 0
    strategies.forEach(s => {
      const costStr = s.implementationCost || s.cost || ''
      const amounts = costStr.match(/[\d,]+/g)
      if (amounts) {
        const midpoint = amounts.map((a: string) => parseInt(a.replace(/,/g, '')))
          .reduce((sum: number, val: number) => sum + val, 0) / amounts.length
        total += midpoint
      }
    })
    return total
  }
  
  const totalInvestment = calculateInvestment()
  
  // Format currency (detect from address)
  const formatCurrency = (amount: number): string => {
    const currencyMap: any = {
      'Jamaica': 'JMD',
      'Trinidad and Tobago': 'TTD',
      'Barbados': 'BBD',
      'Bahamas': 'BSD',
    }
    const currency = currencyMap[country] || 'JMD'
    return `${currency} ${amount.toLocaleString()}`
  }
  
  // Format revenue range
  const formatRevenue = (value: string): string => {
    const ranges: any = {
      'under_1m': 'Under JMD 1 million',
      '1m_3m': 'JMD 1-3 million',
      '3m_10m': 'JMD 3-10 million',
      '10m_20m': 'JMD 10-20 million',
      'over_20m': 'Over JMD 20 million',
      'not_disclosed': 'Not disclosed'
    }
    return ranges[value] || value
  }
  
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
                  <td className="px-4 py-2">{businessType || 'Not specified'}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 bg-slate-100 font-semibold">Physical Address</td>
                  <td className="px-4 py-2">{businessAddress}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 bg-slate-100 font-semibold">Years in Operation</td>
                  <td className="px-4 py-2">{yearsInOperation}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 bg-slate-100 font-semibold">Total People in Business</td>
                  <td className="px-4 py-2">{totalPeople}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 bg-slate-100 font-semibold">Approximate Annual Revenue</td>
                  <td className="px-4 py-2">{formatRevenue(annualRevenue)}</td>
                </tr>
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
                    <div className="font-semibold text-sm text-slate-800">{getStringValue(func.name || func.functionName)}</div>
                    {func.description && (
                      <div className="text-xs text-slate-600 mt-1">{getStringValue(func.description)}</div>
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
              We have identified <strong>{riskMatrix.filter((r: any) => r.isSelected !== false).length} significant risks</strong> that could disrupt our business operations, 
              including <strong className="text-red-700">{highPriorityRisks.length} high-priority risks</strong> requiring immediate attention.
            </p>
          </div>
          
          {/* High-Priority Risks Detail */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">2.2 Major Risks Analysis</h3>
            <div className="space-y-4">
              {highPriorityRisks.map((risk: any, idx: number) => {
                const riskName = getStringValue(risk.hazardName || risk.Hazard || risk.riskType || 'Unnamed Risk')
                const riskScore = parseFloat(risk.riskScore || risk['Risk Score'] || 0)
                const riskLevel = getStringValue(risk.riskLevel || risk['Risk Level'] || (riskScore >= 7.5 ? 'EXTREME' : 'HIGH'))
                const likelihood = getStringValue(risk.likelihood || risk.Likelihood || 'Not assessed')
                const impact = getStringValue(risk.impact || risk.Impact || 'Not assessed')
                const reasoning = getStringValue(risk.reasoning || 'Assessment pending')
                
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
                  {riskMatrix.filter((r: any) => r.isSelected !== false).map((risk: any, idx: number) => {
                    const riskScore = parseFloat(risk.riskScore || risk['Risk Score'] || 0)
                    const hasStrategies = strategies.some(s => 
                      s.applicableRisks?.includes(risk.hazardId || risk.id)
                    )
                    
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-3 py-2 border-t border-slate-200">{getStringValue(risk.hazardName || risk.Hazard || 'Unnamed')}</td>
                        <td className="px-3 py-2 border-t border-slate-200">{getStringValue(risk.likelihood || risk.Likelihood || 'N/A')}</td>
                        <td className="px-3 py-2 border-t border-slate-200">{getStringValue(risk.impact || risk.Impact || 'N/A')}</td>
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
                We are investing <strong className="text-green-800 text-lg">{formatCurrency(totalInvestment)}</strong> in business continuity measures 
                to protect our operations, assets, and ability to serve customers during disruptions.
              </p>
              <div className="text-xs text-slate-600 mt-3">
                <div className="font-semibold mb-1">Investment Breakdown:</div>
                <div>• Prevention & Mitigation: Reducing risk likelihood</div>
                <div>• Response Capabilities: Handling emergencies effectively</div>
                <div>• Recovery Resources: Restoring operations quickly</div>
              </div>
            </div>
          </div>
          
          {/* Strategies by Risk */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">3.2 Our Preparation Strategies</h3>
            <div className="space-y-6">
              {highPriorityRisks.map((risk: any, riskIdx: number) => {
                const riskId = risk.hazardId || risk.id
                const riskName = getStringValue(risk.hazardName || risk.Hazard || 'Unnamed Risk')
                const applicableStrategies = strategies.filter(s => 
                  s.applicableRisks?.includes(riskId)
                )
                
                if (applicableStrategies.length === 0) return null
                
                const strategyCost = applicableStrategies.reduce((sum, s) => {
                  const costStr = s.implementationCost || s.cost || ''
                  const amounts = costStr.match(/[\d,]+/g)
                  if (amounts) {
                    const midpoint = amounts.map((a: string) => parseInt(a.replace(/,/g, '')))
                      .reduce((s: number, v: number) => s + v, 0) / amounts.length
                    return sum + midpoint
                  }
                  return sum
                }, 0)
                
                return (
                  <div key={riskIdx} className="border-l-4 border-green-600 bg-slate-50 p-4">
                    <div className="font-bold text-sm text-slate-800 mb-1">Protection Against: {riskName}</div>
                    <div className="text-xs text-slate-600 mb-3">
                      Strategies: {applicableStrategies.length} | Total Investment: {formatCurrency(strategyCost)}
                    </div>
                    
                    <div className="space-y-3">
                      {applicableStrategies.map((strategy: any, stratIdx: number) => {
                        const costStr = getStringValue(strategy.implementationCost || strategy.cost || 'Cost TBD')
                        const effectiveness = getStringValue(strategy.effectiveness || strategy.rating || 'N/A')
                        const timeframe = getStringValue(strategy.timeToImplement || strategy.timeframe || 'TBD')
                        
                        return (
                          <div key={stratIdx} className="bg-white border border-slate-200 rounded p-3">
                            <div className="font-semibold text-sm text-slate-800 mb-2">
                              {stratIdx + 1}. {getStringValue(strategy.name || strategy.title)}
                            </div>
                            
                            {strategy.description && (
                              <p className="text-xs text-slate-600 mb-2 italic">{getStringValue(strategy.description)}</p>
                            )}
                            
                            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                              <div>
                                <span className="font-semibold">Investment:</span> {costStr}
                              </div>
                              <div>
                                <span className="font-semibold">Timeline:</span> {timeframe}
                              </div>
                              <div>
                                <span className="font-semibold">Effectiveness:</span> {effectiveness}/10
                              </div>
                            </div>
                            
                            {strategy.actionSteps && strategy.actionSteps.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <div className="font-semibold text-xs text-slate-700 mb-1">Key Actions:</div>
                                <ul className="text-xs text-slate-600 space-y-1">
                                  {strategy.actionSteps.slice(0, 3).map((action: any, aIdx: number) => (
                                    <li key={aIdx} className="flex items-start">
                                      <span className="text-green-600 mr-1">→</span>
                                      <span>{getStringValue(action.action || action.description)}</span>
                                    </li>
                                  ))}
                                </ul>
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
                  <td className="px-4 py-2 border-t border-slate-300">{planManager}</td>
                  <td className="px-4 py-2 border-t border-slate-300">
                    {formData.PLAN_INFORMATION?.['Phone'] || 'Contact pending'}
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
            <p>{planManager} is responsible for ensuring the plan stays current and conducting regular tests.</p>
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
                  <div className="text-sm font-semibold">{planManager}</div>
                  <div className="text-xs text-slate-600">{getStringValue(formData.PLAN_INFORMATION?.['Phone'] || '')}</div>
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

