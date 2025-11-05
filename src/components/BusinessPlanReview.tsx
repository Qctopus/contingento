import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { centralDataService } from '../services/centralDataService'
import type { Strategy, ActionStep } from '../types/admin'
import type { Locale } from '../i18n/config'
import { getLocalizedText } from '../utils/localizationUtils'
import { FormalBCPPreview } from './previews/FormalBCPPreview'
import { WorkbookPreview } from './previews/WorkbookPreview'

interface BusinessPlanReviewProps {
  formData: any
  riskSummary?: any
  onBack: () => void
  onExportPDF: (mode: 'formal' | 'workbook') => void
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely render any value as a string (prevents React "Objects are not valid" errors)
 */
const safeRender = (value: any, locale: Locale = 'en'): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return String(value)
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    if (value.en || value.es || value.fr) {
      return value[locale] || value.en || value.es || value.fr || ''
    }
    return JSON.stringify(value)
  }
  
  return String(value)
}

const getFieldValue = (data: any, field: string, defaultValue: string = 'Not specified', locale: Locale = 'en'): string => {
  if (!data || !data[field]) return defaultValue
  return safeRender(data[field], locale)
}

const simplifyForSmallBusiness = (text: string): string => {
  if (!text) return text
  
  const replacements: Record<string, string> = {
    'operations team': 'you and your staff',
    'management team': 'you as the owner',
    'dedicated staff': 'someone on your team',
    'specialized personnel': 'trained person',
    'department heads': 'key people',
    'organizational structure': 'how your business is set up',
    'stakeholder engagement': 'talking to people involved',
    'implementation phase': 'getting it done',
    'coordination efforts': 'working together'
  }
  
  let simplified = text
  Object.entries(replacements).forEach(([corporate, simple]) => {
    const regex = new RegExp(corporate, 'gi')
    simplified = simplified.replace(regex, simple)
  })
  
  return simplified
}

/**
 * Calculate total cost for a strategy from its action steps' cost items
 */
function calculateStrategyCost(strategy: Strategy, exchangeRate: number = 150): { minJMD: number, maxJMD: number, hasRealData: boolean } {
  let totalMinUSD = 0
  let totalMaxUSD = 0
  let hasRealData = false

  if (strategy.actionSteps && Array.isArray(strategy.actionSteps)) {
    strategy.actionSteps.forEach((step: ActionStep) => {
      if (step.costItems && Array.isArray(step.costItems)) {
        step.costItems.forEach((costItem: any) => {
          if (costItem.item) {
            hasRealData = true
            const quantity = costItem.quantity || 1
            const minCost = (costItem.item.baseUSDMin || costItem.item.baseUSD) * quantity
            const maxCost = (costItem.item.baseUSDMax || costItem.item.baseUSD) * quantity
            totalMinUSD += minCost
            totalMaxUSD += maxCost
          }
        })
      }
    })
  }

  return {
    minJMD: Math.round(totalMinUSD * exchangeRate),
    maxJMD: Math.round(totalMaxUSD * exchangeRate),
    hasRealData
  }
}

/**
 * Format currency nicely
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-JM').format(amount)
}

/**
 * Get risk level color classes
 */
function getRiskLevelColors(riskScore: number): { gradient: string, badge: string, text: string } {
  if (riskScore >= 8) {
  return {
      gradient: 'bg-gradient-to-r from-red-600 to-red-700',
      badge: 'bg-red-100 text-red-800',
      text: 'text-red-700'
    }
  } else if (riskScore >= 6) {
    return {
      gradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
      badge: 'bg-orange-100 text-orange-800',
      text: 'text-orange-700'
    }
  } else if (riskScore >= 4) {
    return {
      gradient: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      badge: 'bg-yellow-100 text-yellow-800',
      text: 'text-yellow-700'
    }
  } else {
      return {
      gradient: 'bg-gradient-to-r from-green-500 to-green-600',
      badge: 'bg-green-100 text-green-800',
      text: 'text-green-700'
    }
  }
}

/**
 * Get risk calculations from formData
 */
function getRiskCalculations(formData: any, riskName: string, allRisks: any[], locale: Locale) {
  const risk = allRisks.find(r => 
    (r.hazard && r.hazard.toLowerCase() === riskName.toLowerCase()) ||
    (r.Hazard && r.Hazard.toLowerCase() === riskName.toLowerCase())
  )

  if (!risk) {
    return {
      riskLevel: 'Not assessed',
      likelihood: 'Not assessed',
      impact: 'Not assessed',
      riskScore: 0,
      reasoning: ''
    }
  }

  const getString = (value: any, defaultValue: string = 'Not assessed'): string => {
    return safeRender(value, locale) || defaultValue
  }

    return {
    riskLevel: getString(risk.riskLevel || risk['Risk Level']),
    likelihood: getString(risk.likelihoodScore || risk.Likelihood),
    impact: getString(risk.impactScore || risk['Impact Severity']),
    riskScore: parseFloat(String(risk.riskScore || risk['Risk Score'] || 0)),
    reasoning: getString(risk.reasoning || risk.Reasoning || risk.notes)
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const BusinessPlanReview: React.FC<BusinessPlanReviewProps> = ({
  formData,
  riskSummary,
  onBack,
  onExportPDF
}) => {
  const locale = useLocale() as Locale
  const [allStrategies, setAllStrategies] = useState<Strategy[]>([])
  const [exportMode, setExportMode] = useState<'formal' | 'workbook'>('formal')

  // Load all strategies from database
  useEffect(() => {
    const loadStrategies = async () => {
      try {
        const data = await centralDataService.getStrategies()
        setAllStrategies(data)
      } catch (error) {
        console.error('Error loading strategies:', error)
      }
    }
    loadStrategies()
  }, [])

  // Get selected risks
  const allRisks = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
  const assessedRisks = allRisks.filter((r: any) => {
    if (r.isSelected !== undefined) {
      return r.isSelected === true
    }
    return true
  })

  // Get selected strategies (ONLY strategies user selected in wizard)
  const selectedStrategies = formData.STRATEGIES?.['Business Continuity Strategies'] || []

  // ONLY show risks that have at least 1 strategy selected
  const selectedRisks = assessedRisks.filter((risk: any) => {
    const hazardName = safeRender(risk.hazard || risk.Hazard, locale) || ''
    const hazardId = risk.hazardId || hazardName
    
    // Check if any selected strategy applies to this risk
    const hasStrategy = selectedStrategies.some((strategy: Strategy) => {
      if (!strategy.applicableRisks || strategy.applicableRisks.length === 0) return false
      
      return strategy.applicableRisks.some((riskId: string) => {
        const riskIdLower = riskId.toLowerCase().replace(/_/g, ' ')
        const hazardNameLower = hazardName.toLowerCase()
        const hazardIdLower = (hazardId || '').toString().toLowerCase()
        
        return riskId === hazardId || 
               riskId === risk.hazard ||
               riskIdLower === hazardNameLower ||
               riskIdLower === hazardIdLower ||
               hazardNameLower.includes(riskIdLower) ||
               riskIdLower.includes(hazardNameLower)
      })
    })
    
    return hasStrategy
  })

  // Calculate executive metrics
  const extremeRisks = selectedRisks.filter((r: any) => {
    const score = parseFloat(String(r.riskScore || r['Risk Score'] || 0))
    return score >= 8
  }).length

  const highRisks = selectedRisks.filter((r: any) => {
    const score = parseFloat(String(r.riskScore || r['Risk Score'] || 0))
    return score >= 6 && score < 8
  }).length

  const totalInvestment = selectedStrategies.reduce((sum: number, strategy: Strategy) => {
    const cost = calculateStrategyCost(strategy)
    return sum + (cost.hasRealData ? cost.maxJMD : 0)
  }, 0)

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* UNDP Professional Header - Only visible in print */}
      <div className="hidden print:block bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
            <img src="/undp-logo.png" alt="UNDP Logo" className="h-16 mb-4" />
            <h1 className="text-4xl font-bold">Business Continuity Plan</h1>
            <p className="text-blue-100 mt-2">United Nations Development Programme</p>
              </div>
          <div className="text-right">
            <p className="text-2xl font-semibold">{getFieldValue(formData.BUSINESS_PROFILE, 'Business Name', '', locale)}</p>
            <p className="text-blue-100">Version 1.0</p>
            <p className="text-blue-100">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
      {/* Screen Header - Hidden in print */}
      <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Continuity Plan</h1>
              <p className="text-sm text-gray-600">
                {getFieldValue(formData.BUSINESS_PROFILE, 'Business Name', '', locale)}
              </p>
              <p className="text-xs text-gray-500">
                Version 1.0 • {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
            <button
              onClick={onBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back to Edit
            </button>
            <button
              onClick={() => onExportPDF(exportMode)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              📄 Export PDF
            </button>
            </div>
          </div>
          </div>
        </div>

      {/* Export Mode Selection - Hidden in print */}
      <div className="print:hidden bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Choose Your Document Format:</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Formal BCP (Loan Submission) */}
            <button
              onClick={() => setExportMode('formal')}
              className={`text-left p-5 rounded-lg border-2 transition-all ${
                exportMode === 'formal'
                  ? 'border-green-600 bg-green-50 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-green-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ${
                  exportMode === 'formal'
                    ? 'border-green-600 bg-green-600'
                    : 'border-gray-400 bg-white'
                } flex items-center justify-center`}>
                  {exportMode === 'formal' && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    🏦 Formal BCP (Loan Submission)
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Professional document for bank loans and insurance applications
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ 8-12 pages, loan-ready format</li>
                    <li>✓ Shows detailed risk assessment & mitigation</li>
                    <li>✓ UNDP/CARICHAM certified framework</li>
                    <li>✓ Suitable for JMD 500K-10M loan applications</li>
                  </ul>
                </div>
              </div>
            </button>

            {/* Action Workbook */}
            <button
              onClick={() => setExportMode('workbook')}
              className={`text-left p-5 rounded-lg border-2 transition-all ${
                exportMode === 'workbook'
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ${
                  exportMode === 'workbook'
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-400 bg-white'
                } flex items-center justify-center`}>
                  {exportMode === 'workbook' && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    ✅ Action Workbook
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Step-by-step implementation guide for your team
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ 20-30 pages with detailed checklists</li>
                    <li>✓ 30-day action plan with deadlines</li>
                    <li>✓ Budget worksheets & progress trackers</li>
                    <li>✓ Print and use to implement your plan</li>
                  </ul>
                </div>
              </div>
            </button>
          </div>

          {/* Tip Box */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-2xl">💡</div>
              <div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">Pro Tip:</h4>
                <p className="text-sm text-blue-800">
                  Download <strong>both formats</strong>! Use the <strong>Formal BCP</strong> when applying for loans or insurance, 
                  and the <strong>Action Workbook</strong> to actually implement your continuity strategies with your team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Browser Preview (NO PDF YET) */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {exportMode === 'formal' ? (
          <FormalBCPPreview 
            formData={formData}
            strategies={selectedStrategies}
            risks={selectedRisks}
          />
        ) : (
          <WorkbookPreview
            formData={formData}
            riskSummary={formData.RISK_ASSESSMENT || riskSummary}
            strategies={selectedStrategies}
            totalInvestment={totalInvestment}
          />
        )}
      </div>

      {/* OLD PREVIEW CONTENT - REMOVED FOR BREVITY BUT KEPT BELOW FOR REFERENCE IF NEEDED */}
      <div className="hidden">
        {/* The old preview content below this div */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">📊 Executive Summary</h2>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
              <div className="text-3xl font-bold text-red-600">{extremeRisks}</div>
              <div className="text-sm text-gray-600">Extreme Risks</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
              <div className="text-3xl font-bold text-orange-600">{highRisks}</div>
              <div className="text-sm text-gray-600">High Risks</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
              <div className="text-3xl font-bold text-blue-600">{selectedStrategies.length}</div>
              <div className="text-sm text-gray-600">Strategies</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
              <div className="text-3xl font-bold text-green-600">
                {totalInvestment > 0 ? `JMD ${formatCurrency(totalInvestment)}` : 'TBD'}
              </div>
              <div className="text-sm text-gray-600">Total Investment</div>
            </div>
          </div>
          
          {/* Summary Text */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              This Business Continuity Plan identifies <strong>{selectedRisks.length} potential risks</strong> that could disrupt{' '}
              <strong>{getFieldValue(formData.BUSINESS_PROFILE, 'Business Name', '', locale)}</strong> and provides{' '}
              <strong>{selectedStrategies.length} actionable strategies</strong> to prepare, respond, and recover from these disruptions.
              {totalInvestment > 0 && (
                <> The total estimated investment required is <strong>JMD {formatCurrency(totalInvestment)}</strong>, which includes equipment, training, and implementation costs based on current market rates.</>
              )}
            </p>
            </div>
            
          {/* Priority Alert */}
          {extremeRisks > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-900">Immediate Action Required</p>
                <p className="text-sm text-red-700">
                  You have {extremeRisks} extreme risk{extremeRisks > 1 ? 's' : ''} that require immediate attention. 
                  Please prioritize implementing the strategies marked as "Quick Win" or "Immediate" first.
                </p>
              </div>
              </div>
            )}
        </div>

        {/* SECTION 1: BUSINESS PROFILE */}
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <div className="border-b-2 border-blue-600 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📋 SECTION 1: YOUR BUSINESS</h2>
          </div>

          {/* Key Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-600">
              <div className="text-xs font-semibold text-blue-700 mb-1">Business Name</div>
              <div className="text-lg font-bold text-gray-900">
                {getFieldValue(formData.BUSINESS_PROFILE, 'Business Name', '', locale)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-600">
              <div className="text-xs font-semibold text-green-700 mb-1">Location</div>
              <div className="text-lg font-bold text-gray-900">
                {getFieldValue(formData.BUSINESS_PROFILE, 'Business Address', '', locale)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-600">
              <div className="text-xs font-semibold text-purple-700 mb-1">👤 Plan Manager</div>
              <div className="text-lg font-bold text-gray-900">
                {getFieldValue(formData.BUSINESS_PROFILE, 'Owner/Manager Name', '', locale)}
              </div>
              {formData.BUSINESS_PROFILE?.['Position/Title'] && (
                <div className="text-sm text-gray-600 mt-1">
                  {getFieldValue(formData.BUSINESS_PROFILE, 'Position/Title', '', locale)}
                </div>
              )}
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-l-4 border-orange-600">
              <div className="text-xs font-semibold text-orange-700 mb-1">Emergency Contact</div>
              <div className="text-lg font-bold text-gray-900">
                {getFieldValue(formData.BUSINESS_PROFILE, 'Emergency Contact Name', '', locale) || 
                 getFieldValue(formData.BUSINESS_PROFILE, 'Owner/Manager Name', '', locale)}
              </div>
              {formData.BUSINESS_PROFILE?.['Emergency Contact Phone'] && (
                <div className="text-sm text-gray-600 mt-1">
                  {getFieldValue(formData.BUSINESS_PROFILE, 'Emergency Contact Phone', '', locale)}
              </div>
            )}
          </div>
        </div>

          {/* Business Description */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">WHAT WE DO</h3>
              <p className="text-gray-700 leading-relaxed">
                {getFieldValue(formData.BUSINESS_PROFILE, 'Business Purpose', '', locale)}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">PRODUCTS & SERVICES</h3>
              <p className="text-gray-700 leading-relaxed">
                {getFieldValue(formData.BUSINESS_PROFILE, 'Key Products/Services', '', locale)}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: RISK ASSESSMENT & STRATEGIES */}
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <div className="border-b-2 border-orange-600 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">⚠️ SECTION 2: WHAT COULD GO WRONG & HOW TO PREPARE</h2>
                      </div>

          {/* Risk Overview Bar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 mb-8 border-l-4 border-gray-600">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Risk Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{selectedRisks.length}</div>
                <div className="text-sm text-gray-600">Risks Addressed</div>
                        </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{extremeRisks}</div>
                <div className="text-sm text-gray-600">EXTREME</div>
                      </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{highRisks}</div>
                <div className="text-sm text-gray-600">HIGH</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {selectedRisks.filter((r: any) => {
                    const score = parseFloat(String(r.riskScore || r['Risk Score'] || 0))
                    return score >= 4 && score < 6
                          }).length}
                        </div>
                <div className="text-sm text-gray-600">MEDIUM</div>
                      </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {selectedRisks.filter((r: any) => {
                    const score = parseFloat(String(r.riskScore || r['Risk Score'] || 0))
                    return score < 4
                  }).length}
                        </div>
                <div className="text-sm text-gray-600">LOW</div>
                      </div>
                    </div>
                  </div>

          {/* Individual Risk Cards */}
          {selectedRisks.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <span className="text-6xl mb-4 block">📋</span>
              <p className="text-gray-600">No risks have been assessed yet. Complete the Risk Assessment section to see your personalized plan.</p>
            </div>
          )}

          {selectedRisks.map((risk: any, riskIndex: number) => {
            const hazardName = safeRender(risk.hazard || risk.Hazard, locale) || `Risk ${riskIndex + 1}`
            const hazardId = risk.hazardId || hazardName
            const riskCalc = getRiskCalculations(formData, hazardName, allRisks, locale)
            const colors = getRiskLevelColors(riskCalc.riskScore)

            // Find applicable strategies (flexible matching)
                  const applicableStrategies = selectedStrategies.filter((strategy: Strategy) => {
              if (!strategy.applicableRisks || strategy.applicableRisks.length === 0) return false
              
              return strategy.applicableRisks.some((riskId: string) => {
                const riskIdLower = riskId.toLowerCase().replace(/_/g, ' ')
                const hazardNameLower = hazardName.toLowerCase()
                const hazardIdLower = (hazardId || '').toString().toLowerCase()
                
                return riskId === hazardId || 
                       riskId === risk.hazard ||
                       riskIdLower === hazardNameLower ||
                       riskIdLower === hazardIdLower ||
                       hazardNameLower.includes(riskIdLower) ||
                       riskIdLower.includes(hazardNameLower)
              })
            })

            // Calculate total cost for this risk
            const riskTotalCost = applicableStrategies.reduce((sum: number, strategy: Strategy) => {
              const cost = calculateStrategyCost(strategy)
              return sum + (cost.hasRealData ? cost.maxJMD : 0)
            }, 0)

            const riskTotalCostMin = applicableStrategies.reduce((sum: number, strategy: Strategy) => {
              const cost = calculateStrategyCost(strategy)
              return sum + (cost.hasRealData ? cost.minJMD : 0)
            }, 0)

                  return (
              <div key={riskIndex} className="mb-8 border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg page-break-avoid">
                {/* Risk Header with Gradient */}
                <div className={`${colors.gradient} text-white p-6`}>
                  <div className="flex items-start justify-between">
                          <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">⚠️</span>
                        <h3 className="text-2xl font-bold uppercase">
                          RISK #{riskIndex + 1}: {hazardName}
                              </h3>
                            </div>
                      <div className={`inline-block ${colors.badge} px-4 py-2 rounded-full text-sm font-bold`}>
                        {riskCalc.riskLevel}
                          </div>
                    </div>
                        </div>

                  {/* Risk Metrics */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="text-xs uppercase font-semibold mb-1">LIKELIHOOD</div>
                      <div className="text-xl font-bold">{riskCalc.likelihood}</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="text-xs uppercase font-semibold mb-1">IMPACT</div>
                      <div className="text-xl font-bold">{riskCalc.impact}</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="text-xs uppercase font-semibold mb-1">RISK SCORE</div>
                      <div className="text-xl font-bold">{riskCalc.riskScore.toFixed(1)}/10</div>
                    </div>
                  </div>
                        </div>

                {/* Risk Content */}
                <div className="p-6 space-y-6">
                        {/* Why This Matters */}
                  {riskCalc.reasoning && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🎯</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-900 mb-2">WHY THIS MATTERS</h4>
                          <p className="text-blue-800 text-sm leading-relaxed">
                            {simplifyForSmallBusiness(riskCalc.reasoning)}
                          </p>
                          </div>
                      </div>
                    </div>
                  )}

                  {/* Strategies for this Risk */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🛡️</span>
                      <h4 className="text-lg font-bold text-gray-900">WHAT YOU NEED TO DO</h4>
                      <span className="text-sm text-gray-600">
                        {applicableStrategies.length} Action{applicableStrategies.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                    {applicableStrategies.length === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <p className="text-yellow-800">
                          ⚠️ No specific strategies have been selected for this risk yet. 
                          Go back to the Strategies section to choose protection measures.
                        </p>
                        </div>
                    )}

                    {/* Strategy Cards */}
                    <div className="space-y-6">
                            {applicableStrategies.map((strategy: Strategy, stratIndex: number) => {
                        const strategyCost = calculateStrategyCost(strategy)
                        const isQuickWin = strategy.quickWinIndicator || strategy.priority === 'critical'

                              return (
                          <div key={strategy.id} className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-md page-break-avoid">
                            {/* Strategy Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl font-bold bg-white text-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
                                          {stratIndex + 1}
                                        </span>
                                    <h5 className="text-xl font-bold">
                                      {safeRender(strategy.smeTitle || strategy.name, locale)}
                                      </h5>
                                    {isQuickWin && (
                                      <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                                          Quick Win
                                        </span>
                                      )}
                                    </div>
                                  {strategyCost.hasRealData && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <span>💰</span>
                                      <span className="font-semibold">
                                        JMD {formatCurrency(strategyCost.minJMD)}-{formatCurrency(strategyCost.maxJMD)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                    </div>
                                  </div>

                            {/* Strategy Content */}
                            <div className="p-6 space-y-4">
                              {/* Summary */}
                              <p className="text-gray-700 leading-relaxed">
                                {simplifyForSmallBusiness(safeRender(strategy.smeSummary || strategy.description, locale))}
                              </p>

                              {/* Benefits */}
                              {strategy.benefitsBullets && strategy.benefitsBullets.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <h6 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                                    <span>✅</span> Key Benefits
                                  </h6>
                                  <ul className="space-y-1">
                                    {strategy.benefitsBullets.slice(0, 3).map((benefit, i) => (
                                      <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span>{simplifyForSmallBusiness(safeRender(benefit, locale))}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Real-World Example */}
                              {strategy.realWorldExample && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <h6 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <span>💡</span> Real Success Story
                                  </h6>
                                  <p className="text-sm text-blue-800 italic">
                                    {simplifyForSmallBusiness(safeRender(strategy.realWorldExample, locale))}
                                  </p>
                                </div>
                              )}

                              {/* Implementation Options */}
                              <div className="border-t-2 border-gray-200 pt-4 space-y-4">
                                {/* Option 1: Professional */}
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-600">
                                  <div className="flex items-start gap-3">
                                        <span className="text-2xl">👷</span>
                                        <div className="flex-1">
                                      <h6 className="font-bold text-blue-900 mb-1">OPTION 1: Hire Someone</h6>
                                      <p className="text-sm text-blue-800 mb-2">
                                        {simplifyForSmallBusiness(safeRender(strategy.smeSummary || strategy.description, locale))}
                                      </p>
                                      <div className="flex flex-wrap gap-4 text-xs">
                                        {strategyCost.hasRealData && (
                                          <div>
                                            <span className="text-blue-700">Cost:</span>{' '}
                                            <span className="font-semibold">
                                              JMD {formatCurrency(strategyCost.minJMD)}-{formatCurrency(strategyCost.maxJMD)}
                                            </span>
                                          </div>
                                        )}
                                        {strategy.timeToImplement && (
                                          <div>
                                            <span className="text-blue-700">Time:</span>{' '}
                                            <span className="font-semibold">
                                              {safeRender(strategy.timeToImplement, locale)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                        </div>
                                      </div>
                                    </div>

                                {/* Option 2: DIY */}
                                {(strategy.diyApproach || strategy.lowBudgetAlternative) && (
                                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border-l-4 border-yellow-600">
                                    <div className="flex items-start gap-3">
                                          <span className="text-2xl">🔧</span>
                                          <div className="flex-1">
                                        <h6 className="font-bold text-yellow-900 mb-1">OPTION 2: Do It Yourself</h6>
                                        <p className="text-sm text-yellow-800 mb-2">
                                          {simplifyForSmallBusiness(
                                            safeRender(strategy.diyApproach || strategy.lowBudgetAlternative, locale)
                                          )}
                                        </p>
                                        {strategy.estimatedDIYSavings && (
                                          <div className="text-xs">
                                            <span className="text-yellow-700">💰 Save:</span>{' '}
                                            <span className="font-semibold text-yellow-900">
                                              {safeRender(strategy.estimatedDIYSavings, locale)}
                                            </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                              </div>

                              {/* Action Steps by Phase */}
                              {strategy.actionSteps && strategy.actionSteps.length > 0 && (
                                <div className="border-t-2 border-gray-200 pt-4">
                                  <h6 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>📋</span> Your Action Checklist:
                                  </h6>

                                  {/* Group by phase */}
                                  {['immediate', 'short_term', 'medium_term', 'long_term'].map(phase => {
                                    const phaseSteps = strategy.actionSteps.filter(s => s.phase === phase)
                                    if (phaseSteps.length === 0) return null

                                    const phaseConfig = {
                                      immediate: { label: '🔴 IMMEDIATE (24-48 hours)', color: 'red' },
                                      short_term: { label: '🟠 SHORT-TERM (1-2 weeks)', color: 'orange' },
                                      medium_term: { label: '🟡 MEDIUM-TERM (1-3 months)', color: 'yellow' },
                                      long_term: { label: '🟢 LONG-TERM (3+ months)', color: 'green' }
                                    }[phase] || { label: phase.toUpperCase(), color: 'gray' }

                                    return (
                                      <div key={phase} className="mb-4">
                                        <div className={`text-sm font-bold text-${phaseConfig.color}-700 mb-2`}>
                                          {phaseConfig.label}
                                        </div>
                                        <div className="space-y-3">
                                          {phaseSteps.map((step: ActionStep, stepIndex: number) => {
                                            const stepCost = step.costItems && step.costItems.length > 0
                                              ? step.costItems.reduce((sum, ci) => {
                                                  if (ci.item) {
                                                    const qty = ci.quantity || 1
                                                    return sum + ((ci.item.baseUSDMax || ci.item.baseUSD) * qty * 150)
                                                  }
                                                  return sum
                                                }, 0)
                                              : 0
                                            
                                            return (
                                              <div key={step.id} className={`bg-${phaseConfig.color}-50 border border-${phaseConfig.color}-200 rounded-lg p-3`}>
                                                <div className="flex items-start gap-3">
                                                  <span className={`bg-${phaseConfig.color}-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                                                    {stepIndex + 1}
                                                  </span>
                                                  <div className="flex-1">
                                                    <h6 className={`font-semibold text-${phaseConfig.color}-900 mb-1`}>
                                                      {simplifyForSmallBusiness(safeRender(step.smeAction || step.title, locale))}
                                                    </h6>
                                                    {step.costItems && step.costItems.length > 0 && (
                                                      <div className={`text-xs text-${phaseConfig.color}-700 font-medium mb-2`}>
                                                        💰 {step.costItems.map(ci => {
                                                          if (ci.item) {
                                                            const minCost = (ci.item.baseUSDMin || ci.item.baseUSD) * (ci.quantity || 1) * 150
                                                            const maxCost = (ci.item.baseUSDMax || ci.item.baseUSD) * (ci.quantity || 1) * 150
                                                            return `JMD ${formatCurrency(minCost)}-${formatCurrency(maxCost)}`
                                                          }
                                                          return ''
                                                        }).filter(Boolean).join(', ')}
                                                    </div>
                                                  )}
                                                    {step.checklist && step.checklist.length > 0 && (
                                                      <ul className="space-y-1 mt-2">
                                                        {step.checklist.slice(0, 3).map((item, i) => (
                                                          <li key={i} className={`text-xs text-${phaseConfig.color}-800 flex items-start gap-2`}>
                                                            <span>□</span>
                                                            <span>{simplifyForSmallBusiness(safeRender(item, locale))}</span>
                                                          </li>
                                                        ))}
                                                      </ul>
                                        )}
                                      </div>
                                  </div>
                                </div>
                              )
                            })}
                              </div>
                            </div>
                                    )
                                  })}
                                </div>
                        )}
                      </div>
                    </div>
                  )
                })}
      </div>
    </div>

                  {/* Total Investment for this Risk */}
                  {riskTotalCost > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500 rounded-lg p-6">
                      <div className="flex items-center justify-between">
  <div>
                          <h5 className="text-lg font-bold text-green-900 mb-1">
                            💰 TOTAL INVESTMENT FOR THIS RISK
                          </h5>
                          <p className="text-sm text-green-700">
                            Cost to implement all {applicableStrategies.length} {applicableStrategies.length === 1 ? 'strategy' : 'strategies'} for {hazardName.toLowerCase()}
                          </p>
  </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-700">
                            JMD {formatCurrency(riskTotalCostMin)} - {formatCurrency(riskTotalCost)}
      </div>
    </div>
              </div>
              </div>
            )}
          </div>
            </div>
            )
          })}
        </section>

        {/* SECTION 3: EMERGENCY CONTACTS */}
        <ContactsSection formData={formData} locale={locale} />

        {/* SECTION 4: PLAN MAINTENANCE */}
        <TestingMaintenanceSection formData={formData} locale={locale} />
      </div>
    </div>
  )
}

// ============================================================================
// CONTACTS SECTION
// ============================================================================

const ContactsSection: React.FC<{ formData: any, locale: Locale }> = ({ formData, locale }) => {
  const contacts = formData.CONTACTS || {}
  const staffContacts = contacts['Staff Contacts'] || []
  const suppliers = contacts['Supplier Information'] || []
  const customers = contacts['Key Customer Contacts'] || []
  const emergency = contacts['Emergency Services and Utilities'] || []
  
  const getFieldString = (field: any) => {
    if (!field) return ''
    if (typeof field === 'string') return field
    if (typeof field === 'object' && (field.en || field.es || field.fr)) {
      return field[locale] || field.en || field.es || field.fr || ''
    }
    return String(field)
  }

  const renderContactList = (contactList: any[], title: string, borderColor: string) => {
    if (!contactList || contactList.length === 0) return null

    return (
      <div className={`bg-white rounded-lg border-l-4 ${borderColor} p-4 shadow-sm`}>
        <h4 className="font-bold text-gray-900 mb-3">{title}</h4>
        <div className="space-y-2">
          {contactList.map((contact, idx) => {
            // Try multiple field name variations
            const name = getFieldString(
              contact.Name || contact.name || 
              contact['Contact Name'] || contact['Contact Person'] || 
              'Contact ' + (idx + 1)
            )
            const position = getFieldString(contact.Position || contact.position || contact.Role || contact.role)
            const phone = getFieldString(contact.Phone || contact.phone || contact['Phone Number'] || contact.phoneNumber)
            const email = getFieldString(contact.Email || contact.email || contact['Email Address'])
            const service = getFieldString(contact.Service || contact.service || contact['Service Type'])

            // Skip if no meaningful data
            if (name.includes('Contact ') && !position && !phone && !email) {
              return null
            }
            
            return (
              <div key={idx} className="border-b border-gray-200 pb-2 last:border-0">
                <div className="font-semibold text-gray-900">{name}</div>
                {position && <div className="text-sm text-gray-600">{position}</div>}
                {service && <div className="text-sm text-gray-600">{service}</div>}
                {phone && <div className="text-sm text-gray-700">📞 {phone}</div>}
                {email && <div className="text-sm text-gray-700">✉️ {email}</div>}
              </div>
            )
          }).filter(Boolean)}
        </div>
      </div>
    )
  }

  return (
    <section className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
      <div className="border-b-2 border-green-600 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📞 SECTION 3: WHO TO CALL IN AN EMERGENCY</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderContactList(staffContacts, '👥 Your People', 'border-blue-500')}
        {renderContactList(emergency, '🚨 Emergency Services', 'border-red-500')}
        {renderContactList(suppliers, '🏪 Key Suppliers', 'border-green-500')}
        {renderContactList(customers, '🤝 Important Customers', 'border-purple-500')}
      </div>

      {staffContacts.length === 0 && suppliers.length === 0 && customers.length === 0 && emergency.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <span className="text-6xl mb-4 block">👥</span>
          <p className="text-gray-600">No contacts have been added yet. Go back to add emergency contacts.</p>
        </div>
      )}
    </section>
  )
}


// ============================================================================
// TESTING & MAINTENANCE SECTION
// ============================================================================

const TestingMaintenanceSection: React.FC<{ formData: any, locale: Locale }> = ({ formData, locale }) => {
  const testing = formData.TESTING || {}
  const schedule = testing['Testing Schedule'] || []
  const improvements = testing['Improvements Needed'] || []
  
  const getFieldString = (field: any) => {
    if (!field) return ''
    if (typeof field === 'string') return field
    if (typeof field === 'object' && (field.en || field.es || field.fr)) {
      return field[locale] || field.en || field.es || field.fr || ''
    }
    return String(field)
  }
  
  return (
    <section className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
      <div className="border-b-2 border-purple-600 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">✅ SECTION 4: KEEPING YOUR PLAN READY</h2>
        <p className="text-gray-600 mt-2">
        Your plan only works if you keep it updated and practice it regularly.
      </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-600">
          <span className="text-3xl mb-3 block">📅</span>
          <h4 className="font-bold text-blue-900 mb-2">Review Your Plan</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check it every 6 months (or after any big change)</li>
            <li>• Update phone numbers and contacts</li>
            <li>• Make sure everyone knows where to find it</li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-600">
          <span className="text-3xl mb-3 block">🏃</span>
          <h4 className="font-bold text-green-900 mb-2">Practice Your Plan</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Do a quick walk-through with your team once a year</li>
            <li>• Make sure everyone knows their role</li>
            <li>• Test your emergency contacts</li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-l-4 border-purple-600">
          <span className="text-3xl mb-3 block">✅</span>
          <h4 className="font-bold text-purple-900 mb-2">Track What Needs Fixing</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Write down things that didn't work during practice</li>
            <li>• Fix them before the next emergency</li>
            <li>• Keep notes on what could be better</li>
          </ul>
        </div>
      </div>

      {/* Schedule */}
      {schedule.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-gray-900 mb-3">Your Schedule</h4>
          <div className="space-y-2">
            {schedule.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div>
                  <span className="font-semibold text-gray-900">
                    {getFieldString(item['Test Name'] || item.testName || item.name)}
                  </span>
                  <span className="text-gray-600 text-sm ml-2">
                    {getFieldString(item.Frequency || item.frequency)}
                  </span>
                </div>
                <span className="text-gray-500">•</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 mb-3">Things to Fix</h4>
          <div className="space-y-2">
            {improvements.map((item: any, idx: number) => (
              <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-800">
                  {getFieldString(item.Issue || item.issue || item.description || item)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default BusinessPlanReview
