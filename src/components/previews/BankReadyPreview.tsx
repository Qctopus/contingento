/**
 * Bank-Ready BCP Preview Component
 * Shows on-screen preview of what the formal bank document will look like
 * Professional, muted colors, appropriate sizing
 */

import React from 'react'

interface BankReadyPreviewProps {
  formData: any
  riskSummary?: any
  strategies: any[]
  totalInvestment: number
}

export const BankReadyPreview: React.FC<BankReadyPreviewProps> = ({
  formData,
  riskSummary,
  strategies,
  totalInvestment
}) => {
  // Helper to safely get string from potentially multilingual field
  const getStringValue = (value: any): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object' && (value.en || value.es || value.fr)) {
      return value.en || value.es || value.fr || ''
    }
    return String(value)
  }

  const companyName = formData.PLAN_INFORMATION?.['Company Name'] || 'Your Business'
  const planManager = formData.PLAN_INFORMATION?.['Plan Manager'] || 'Not specified'
  const businessLicense = formData.BUSINESS_OVERVIEW?.['Business License Number'] || 'Not provided'
  const businessPurpose = formData.BUSINESS_OVERVIEW?.['Business Purpose'] || 'Not specified'
  
  // Extract risks from multiple possible locations
  const riskMatrix = riskSummary?.['Risk Assessment Matrix'] || 
                     riskSummary?.['Hazard Applicability Assessment'] ||
                     riskSummary?.risks ||
                     []
  
  const risks = Array.isArray(riskMatrix) ? riskMatrix.filter((r: any) => 
    r && (r.hazard || r.Hazard || r.riskType)
  ) : []
  
  const highPriorityRisks = risks.filter((r: any) => {
    const level = getStringValue(r.riskLevel || r.RiskLevel).toLowerCase()
    return level.includes('high') || level.includes('extreme')
  }).length

  return (
    <div className="bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
      {/* Document Header - Mimics PDF cover */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold tracking-wider">UNDP</div>
          <div className="text-xs">Version 1.0</div>
        </div>
        <h1 className="text-2xl font-serif font-bold mb-1">
          BUSINESS CONTINUITY PLAN
        </h1>
        <p className="text-lg text-slate-200">{companyName}</p>
      </div>

      {/* Document Body */}
      <div className="px-8 py-6 space-y-6 text-sm">
        
        {/* Table of Contents */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">TABLE OF CONTENTS</h2>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>1. Executive Summary</span>
              <span>3</span>
            </div>
            <div className="flex justify-between">
              <span>2. Business Profile</span>
              <span>4</span>
            </div>
            <div className="flex justify-between">
              <span>3. Risk Assessment Summary</span>
              <span>5</span>
            </div>
            <div className="flex justify-between">
              <span>4. Continuity Strategy Overview</span>
              <span>7</span>
            </div>
            <div className="flex justify-between">
              <span>5. Governance & Maintenance</span>
              <span>9</span>
            </div>
            <div className="flex justify-between">
              <span>6. Appendices</span>
              <span>11</span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-2">
            SECTION 1: EXECUTIVE SUMMARY
          </h2>
          
          <p className="text-xs text-gray-700 leading-relaxed">
            This Business Continuity Plan has been prepared for {companyName}, documenting 
            comprehensive risk assessment, mitigation strategies, and operational resilience measures. 
            This plan demonstrates our commitment to business continuity and preparedness to respond to disruptions.
          </p>

          {/* Key Metrics - Subtle boxes */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">KEY PLAN METRICS</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="font-semibold text-gray-700">Risks Identified:</div>
                <div className="text-gray-600">{risks.length} ({highPriorityRisks} high priority)</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Mitigation Strategies:</div>
                <div className="text-gray-600">{strategies.length} implemented</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Total Investment:</div>
                <div className="text-gray-600">JMD {totalInvestment.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Plan Status:</div>
                <div className="text-gray-600">Active & Current</div>
              </div>
            </div>
          </div>

          <p className="text-xs italic text-gray-600">
            This plan has been developed in accordance with UNDP Business Continuity Framework 
            and CARICHAM SME Best Practices.
          </p>
        </div>

        {/* Business Profile */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-2">
            SECTION 2: BUSINESS PROFILE
          </h2>
          
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-gray-800 text-sm">2.1 Company Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold text-gray-700">Business Name:</span>
                <span className="ml-2 text-gray-600">{companyName}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">License:</span>
                <span className="ml-2 text-gray-600">{businessLicense}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-gray-800 text-sm">2.2 Business Operations</h3>
            <div>
              <span className="font-semibold text-gray-700">Business Purpose:</span>
              <p className="mt-1 text-gray-600">{businessPurpose}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-gray-800 text-sm">2.3 Plan Management</h3>
            <div>
              <span className="font-semibold text-gray-700">Plan Manager:</span>
              <span className="ml-2 text-gray-600">{planManager}</span>
            </div>
          </div>
        </div>

        {/* Risk Assessment Summary */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-2">
            SECTION 3: RISK ASSESSMENT SUMMARY
          </h2>
          
          <p className="text-xs text-gray-700">
            A comprehensive risk assessment has identified {risks.length} potential risks to business operations, 
            of which {highPriorityRisks} are classified as high priority requiring immediate mitigation strategies.
          </p>

          {/* Risk Table - Professional styling - SHOW ALL RISKS */}
          {risks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">Risk</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">Level</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">Score</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {risks.map((risk: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="px-2 py-2 text-gray-700">
                        {getStringValue(risk.hazard || risk.Hazard)}
                      </td>
                      <td className="px-2 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          getStringValue(risk.riskLevel || risk.RiskLevel).toLowerCase().includes('extreme')
                            ? 'bg-red-100 text-red-800'
                            : getStringValue(risk.riskLevel || risk.RiskLevel).toLowerCase().includes('high')
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getStringValue(risk.riskLevel || risk.RiskLevel)}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-gray-700">{risk.riskScore || 'N/A'}</td>
                      <td className="px-2 py-2 text-gray-600">Mitigated</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Strategy Overview */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-2">
            SECTION 4: CONTINUITY STRATEGY OVERVIEW
          </h2>
          
          <p className="text-xs text-gray-700">
            {strategies.length} continuity strategies have been identified and planned to ensure business resilience, 
            with a total planned investment of JMD {totalInvestment.toLocaleString()}.
          </p>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-800 text-sm">4.1 Recovery Objectives</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-semibold text-gray-700">Recovery Time Objective (RTO):</span>
                <span className="ml-2 text-gray-600">24-48 hours</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Recovery Point Objective (RPO):</span>
                <span className="ml-2 text-gray-600">24 hours</span>
              </div>
            </div>
          </div>

          {strategies.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-gray-800 text-sm">4.2 Strategy Summary - ALL STRATEGIES</h3>
              <div className="space-y-2">
                {strategies.map((strategy: any, idx: number) => (
                  <div key={idx} className="pl-3 border-l-2 border-slate-300">
                    <div className="font-semibold text-gray-800 text-xs">
                      {idx + 1}. {getStringValue(strategy.smeTitle || strategy.name)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {getStringValue(strategy.smeSummary || strategy.description).substring(0, 150)}
                      {getStringValue(strategy.smeSummary || strategy.description).length > 150 ? '...' : ''}
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      Status: Planned | Category: {getStringValue(strategy.category || 'N/A')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Governance */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-2">
            SECTION 5: GOVERNANCE & MAINTENANCE
          </h2>
          
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-gray-700">Plan Owner:</span>
              <span className="ml-2 text-gray-600">{planManager}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Testing Schedule:</span>
              <span className="ml-2 text-gray-600">Quarterly</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Review Schedule:</span>
              <span className="ml-2 text-gray-600">Annual</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Compliance:</span>
              <span className="ml-2 text-gray-600">UNDP Framework, CARICHAM Best Practices</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 mt-6">
          <div className="text-xs text-center text-gray-500 italic">
            UNDP in cooperation with CARICHAM
          </div>
          <div className="text-xs text-center text-gray-400 mt-1">
            Page preview - Full document available via PDF export
          </div>
        </div>
      </div>
    </div>
  )
}

