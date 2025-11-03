import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { centralDataService } from '../services/centralDataService'
import type { Strategy, ActionStep } from '../types/admin'
import type { Locale } from '../i18n/config'
import { getLocalizedText } from '../utils/localizationUtils'

// SVG icon components
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
)

const CurrencyDollarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
)

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
)

interface BusinessPlanReviewProps {
  formData: any
  riskSummary?: any
  onBack: () => void
  onExportPDF: () => void
}

// Layout components
const CompactCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm print-compact page-break-avoid ${className}`}>
    {children}
  </div>
)

const InfoGrid = ({ items }: { items: Array<{ label: string, value: any }> }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {items.map((item, index) => (
      <div key={index} className="bg-gray-50 rounded-lg p-2">
        <dt className="text-xs font-medium text-gray-600 mb-0.5">{item.label}</dt>
        <dd className="text-sm text-gray-900">{item.value || 'Not specified'}</dd>
      </div>
    ))}
  </div>
)

// Helper functions for small business language
const simplifyForSmallBusiness = (text: string): string => {
  if (!text) return text
  
  // Replace corporate terms with small business language
  const replacements: Record<string, string> = {
    'operations team': 'you and your staff',
    'management team': 'you as the owner',
    'dedicated staff': 'someone on your team',
    'specialized personnel': 'trained person',
    'department heads': 'key people',
    'organizational structure': 'how your business is set up',
    'stakeholder engagement': 'talking to people involved',
    'implementation phase': 'getting it done',
    'coordination efforts': 'working together',
    'emergency response team': 'key people',
    'staff members': 'you and your employees',
    'team leader': 'owner/manager',
    'operations coordinator': 'second-in-command',
    'communications officer': 'person to contact customers',
    'it specialist': 'person who handles tech',
    'safety officer': 'person responsible for safety',
    'finance coordinator': 'person who handles money'
  }
  
  let simplified = text
  Object.entries(replacements).forEach(([corporate, simple]) => {
    const regex = new RegExp(corporate, 'gi')
    simplified = simplified.replace(regex, simple)
  })
  
  return simplified
}

const getFieldValue = (data: any, field: string, defaultValue: string = 'Not specified'): string => {
  if (!data || !data[field]) return defaultValue
  const value = data[field]
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value.en) return value.en
  return defaultValue
}

const hasData = (data: any): boolean => {
  if (!data) return false
  if (Array.isArray(data)) return data.length > 0
  if (typeof data === 'object') return Object.keys(data).length > 0
  return !!data
}

function getRiskLevelBadgeColor(riskLevel: string): { bg: string, text: string, border: string } {
  const level = riskLevel.toLowerCase()
  if (level.includes('extreme')) return { bg: 'bg-black', text: 'text-white', border: 'border-black' }
  if (level.includes('high')) return { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500' }
  if (level.includes('medium')) return { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-500' }
  return { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' }
}

function getDifficultyColor(level?: string): string {
  switch (level?.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'hard': case 'advanced': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function transformHazardName(hazard: string): string {
  if (!hazard) return ''
  return hazard.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Helper to group action steps by phase (with better naming for users)
function groupStepsByPhase(steps: ActionStep[]): Record<string, ActionStep[]> {
  return {
    before: steps.filter(s => s.phase === 'immediate'),
    during: steps.filter(s => s.phase === 'short_term'),
    after: steps.filter(s => s.phase === 'medium_term'),
    ongoing: steps.filter(s => s.phase === 'long_term')
  }
}

// Helper to aggregate resources from action steps
function aggregateResources(steps: ActionStep[]): string[] {
  const resources = new Set<string>()
  steps.forEach(step => {
    if (step.resources) {
      const resourceList = Array.isArray(step.resources) 
        ? step.resources 
        : typeof step.resources === 'object' 
        ? Object.values(step.resources).flat()
        : []
      resourceList.forEach((r: any) => {
        if (r && typeof r === 'string') resources.add(r)
      })
    }
  })
  return Array.from(resources)
}

// Calculate total cost range for a strategy
function calculateStrategyCost(strategy: Strategy, locale: Locale): string {
  const costEstimate = getLocalizedText(strategy.costEstimateJMD || strategy.implementationCost, locale)
  if (costEstimate) return costEstimate
  
  // Fallback to rough estimate based on complexity
  const complexity = strategy.complexityLevel || 'moderate'
  if (complexity === 'simple') return 'JMD 5,000-25,000'
  if (complexity === 'moderate') return 'JMD 25,000-75,000'
  return 'JMD 75,000-200,000'
}

// CRITICAL: Extract calculated risk data from formData
function getRiskCalculations(formData: any, riskName: string, allRisks: any[]) {
  // Method 1: Check RISK_CALCULATIONS (from wizard pre-fill)
  if (formData.RISK_CALCULATIONS && Array.isArray(formData.RISK_CALCULATIONS)) {
    const calc = formData.RISK_CALCULATIONS.find((r: any) => 
      r.hazardName?.toLowerCase() === riskName.toLowerCase() ||
      r.Hazard?.toLowerCase() === riskName.toLowerCase() ||
      r.name?.toLowerCase() === riskName.toLowerCase()
    )
    if (calc) {
      return {
        likelihood: calc.likelihood || calc.Likelihood || 'Not assessed',
        likelihoodScore: calc.likelihoodScore || calc.LikelihoodScore || null,
        severity: calc.severity || calc.Severity || 'Not assessed',
        severityScore: calc.severityScore || calc.SeverityScore || null,
        riskScore: calc.riskScore || calc['Risk Score'] || calc.RiskScore || null,
        reasoning: calc.reasoning || calc.Reasoning || null
      }
    }
  }
  
  // Method 2: Check risk assessment matrix data
  const riskData = allRisks.find((r: any) => {
    const name = (r.Hazard || r.hazardName || r.name || '').toLowerCase()
    return name === riskName.toLowerCase()
  })
  
  if (riskData) {
    return {
      likelihood: riskData.Likelihood || riskData.likelihood || 'Not assessed',
      likelihoodScore: riskData.likelihoodScore || riskData.LikelihoodScore || null,
      severity: riskData.Severity || riskData.severity || 'Not assessed',
      severityScore: riskData.severityScore || riskData.SeverityScore || null,
      riskScore: riskData['Risk Score'] || riskData.riskScore || riskData.RiskScore || null,
      reasoning: riskData.Reasoning || riskData.reasoning || null
    }
  }
  
  return {
    likelihood: 'Not assessed',
    likelihoodScore: null,
    severity: 'Not assessed',
    severityScore: null,
    riskScore: null,
    reasoning: null
  }
}

// Calculate total cost for multiple strategies
function calculateTotalCost(strategies: any[]): string {
  const costs = strategies
    .map(s => s.costEstimateJMD || '')
    .filter(c => typeof c === 'string' && c.includes('JMD'))
  
  if (costs.length === 0) return 'Contact suppliers for quotes'
  
  // Extract ranges and sum
  const ranges = costs.map(c => {
    const match = c.match(/JMD\s*([\d,]+)(?:-(\d+,?\d*))?/)
    if (!match) return null
    return {
      min: parseInt(match[1].replace(/,/g, '')),
      max: match[2] ? parseInt(match[2].replace(/,/g, '')) : null
    }
  }).filter(Boolean) as Array<{min: number, max: number | null}>
  
  const totalMin = ranges.reduce((sum, r) => sum + r.min, 0)
  const totalMax = ranges.reduce((sum, r) => sum + (r.max || r.min), 0)
  
  if (totalMin === totalMax) {
    return `JMD ${totalMin.toLocaleString()}`
  }
  return `JMD ${totalMin.toLocaleString()} - ${totalMax.toLocaleString()}`
}

export const BusinessPlanReview: React.FC<BusinessPlanReviewProps> = ({
  formData,
  riskSummary,
  onBack,
  onExportPDF,
}) => {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const locale = useLocale() as Locale

  // Load strategies from database
  useEffect(() => {
    async function loadStrategies() {
      try {
        const allStrategies = await centralDataService.getStrategies()
        setStrategies(allStrategies)
      } catch (error) {
        console.error('Failed to load strategies:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStrategies()
  }, [])

  // Comprehensive data debug logging
  useEffect(() => {
    console.log('📊 BusinessPlanReview Data Debug:')
    console.log('  formData keys:', Object.keys(formData))
    console.log('  RISK_ASSESSMENT:', formData.RISK_ASSESSMENT)
    console.log('  RISK_CALCULATIONS:', formData.RISK_CALCULATIONS)
    console.log('  STRATEGIES:', formData.STRATEGIES)
    
    if (formData.RISK_ASSESSMENT?.['Risk Assessment Matrix']) {
      console.log('  Risk Matrix Data:')
      formData.RISK_ASSESSMENT['Risk Assessment Matrix'].forEach((risk: any, idx: number) => {
        console.log(`    ${idx + 1}. ${risk.Hazard || risk.name}:`, {
          likelihood: risk.Likelihood || risk.likelihood,
          severity: risk.Severity || risk.severity,
          score: risk['Risk Score'] || risk.riskScore,
          riskLevel: risk.riskLevel || risk.RiskLevel
        })
      })
    }
  }, [formData])

  // Get selected risks from formData
  // Support both explicit isSelected flag and absence of flag (for sample data compatibility)
  const allRisks = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
  const selectedRisks = allRisks.filter((r: any) => {
    // If isSelected is explicitly set, use that
    if (r.isSelected !== undefined) {
      return r.isSelected === true
    }
    // Otherwise, include the risk (for sample data that doesn't have isSelected flag)
    return true
  })

  // Get selected strategies from formData
  const selectedStrategies = formData.STRATEGIES?.['Business Continuity Strategies'] || []

  // Get user-selected strategies (they chose these in the wizard)
  const selectedStrategyIds = new Set(selectedStrategies.map((s: any) => s.id || s.strategyId))

  // Print styles
  const printStyles = `
@media print {
  .no-print {
    display: none !important;
  }
  
  .space-y-4 {
    row-gap: 0.5rem !important;
  }
  
  .space-y-3 {
    row-gap: 0.375rem !important;
  }
  
  .p-4 {
    padding: 0.5rem !important;
  }
  
  .page-break-avoid {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  .print-compact {
    padding: 0.25rem !important;
    margin: 0.25rem 0 !important;
  }
  
  .bg-white {
    box-shadow: none !important;
    border: 1px solid #d1d5db !important;
  }
}
`

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        
        {/* Compact Professional Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg overflow-hidden no-print">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-bold mb-1">Business Continuity Plan</h1>
                <p className="text-blue-100 text-sm">
                  {getFieldValue(formData.PLAN_INFORMATION, 'Company Name', 'Your Business')}
                </p>
              </div>
              <div className="text-left sm:text-right text-sm">
                <div className="text-blue-100">Version {getFieldValue(formData.PLAN_INFORMATION, 'Plan Version', '1.0')}</div>
                <div className="text-blue-200 text-xs">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          
          {/* Action Bar */}
          <div className="bg-blue-900 bg-opacity-50 px-6 py-3 flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm font-medium text-white hover:text-blue-200 transition-colors"
            >
              ← Back to Edit
            </button>
            <button
              onClick={onExportPDF}
              className="px-4 py-2 bg-white text-blue-900 rounded text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              📄 Export PDF
            </button>
          </div>
        </div>

        {/* SECTION 1: BUSINESS OVERVIEW - Clean Layout */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">📋 SECTION 1: YOUR BUSINESS</h2>
          </div>
          
          <div className="p-4">
            {/* 2-Column Grid for Key Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-4">
              <InfoRow 
                label="Business Name" 
                value={getFieldValue(formData.PLAN_INFORMATION, 'Company Name')} 
              />
              <InfoRow 
                label="Location" 
                value={getFieldValue(formData.PLAN_INFORMATION, 'Business Address')} 
              />
              <InfoRow 
                label="Plan Manager" 
                value={getFieldValue(formData.PLAN_INFORMATION, 'Plan Manager')} 
              />
              <InfoRow 
                label="Emergency Contact" 
                value={getFieldValue(formData.PLAN_INFORMATION, 'Alternate Manager')} 
              />
            </div>
            
            {/* Business Overview */}
            {hasData(formData.BUSINESS_OVERVIEW?.['Business Purpose']) && (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="text-xs font-semibold text-gray-600 mb-1">WHAT WE DO</div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getFieldValue(formData.BUSINESS_OVERVIEW, 'Business Purpose')}
                </p>
              </div>
            )}
            
            {/* Products & Services */}
            {hasData(formData.BUSINESS_OVERVIEW?.['Products and Services'] || formData.BUSINESS_OVERVIEW?.['Products & Services']) && (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="text-xs font-semibold text-gray-600 mb-1">PRODUCTS & SERVICES</div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getFieldValue(formData.BUSINESS_OVERVIEW, 'Products and Services') || getFieldValue(formData.BUSINESS_OVERVIEW, 'Products & Services')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: YOUR RISKS & PROTECTION PLAN */}
        <CompactCard>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 border-b pb-2">
            SECTION 2: WHAT COULD GO WRONG & HOW TO PREPARE
          </h2>

          {selectedRisks.length === 0 ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Risks Identified</h3>
              <p className="text-gray-600">
                Complete the risk assessment step to identify threats to your business.
              </p>
            </div>
          ) : (
            <>
              {/* Risk Overview Summary - Only count risks with strategies */}
              {(() => {
                // Filter to only risks that have strategies selected
                const risksWithStrategies = selectedRisks.filter((r: any) => {
                  const hazardId = r.hazardId || r.hazard
                  return selectedStrategies.some((s: Strategy) =>
                    s.applicableRisks?.includes(hazardId) || s.applicableRisks?.includes(r.hazard)
                  )
                })

                return (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border-2 border-blue-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Your Risk Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">{risksWithStrategies.length}</div>
                        <div className="text-xs text-gray-600 mt-0.5">Risks Addressed</div>
                      </div>
                      <div className="bg-black rounded-lg p-3 text-center shadow-sm">
                        <div className="text-2xl font-bold text-white">
                          {risksWithStrategies.filter((r: any) => r.riskLevel?.toLowerCase().includes('extreme')).length}
                        </div>
                        <div className="text-xs text-gray-200 mt-0.5">EXTREME</div>
                      </div>
                      <div className="bg-red-500 rounded-lg p-3 text-center shadow-sm">
                        <div className="text-2xl font-bold text-white">
                          {risksWithStrategies.filter((r: any) => {
                            const level = r.riskLevel?.toLowerCase() || ''
                            return level.includes('high') && !level.includes('extreme')
                          }).length}
                        </div>
                        <div className="text-xs text-white mt-0.5">HIGH</div>
                      </div>
                      <div className="bg-yellow-500 rounded-lg p-3 text-center shadow-sm">
                        <div className="text-2xl font-bold text-white">
                          {risksWithStrategies.filter((r: any) => r.riskLevel?.toLowerCase().includes('medium')).length}
                        </div>
                        <div className="text-xs text-white mt-0.5">MEDIUM</div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Sort risks by score (highest first) and filter to only those with selected strategies */}
              {selectedRisks
                .sort((a: any, b: any) => {
                  // Get risk scores from multiple possible locations
                  const scoreA = parseFloat(a.riskScore || a['Risk Score'] || a.RiskScore || '0')
                  const scoreB = parseFloat(b.riskScore || b['Risk Score'] || b.RiskScore || '0')
                  return scoreB - scoreA // Highest risk first
                })
                .map((risk: any, riskIndex: number) => {
                  const hazardName = transformHazardName(risk.hazard || risk.Hazard)
                  const riskLevel = risk.riskLevel || risk['Risk Level'] || 'Medium'
                  const hazardId = risk.hazardId || risk.hazard
                  const colors = getRiskLevelBadgeColor(riskLevel)
                  
                  // CRITICAL: Get calculated risk data (likelihood, impact, score)
                  const riskCalc = getRiskCalculations(formData, hazardName, allRisks)
                  const reasoning = riskCalc.reasoning || getLocalizedText(risk.reasoning, locale)

                  // Find strategies that address this risk AND were selected by user
                  const applicableStrategies = selectedStrategies.filter((strategy: Strategy) => {
                    return strategy.applicableRisks?.includes(hazardId) ||
                           strategy.applicableRisks?.includes(risk.hazard)
                  })

                  // IMPORTANT: Only show risks that have at least one strategy selected
                  // This prevents showing risks with "No strategies selected yet" message
                  if (applicableStrategies.length === 0) {
                    console.log(`⚠️ Skipping risk "${hazardName}" - no strategies selected`)
                    return null
                  }

                  // Calculate total investment for this risk
                  const totalInvestment = applicableStrategies.length > 0
                    ? `JMD ${applicableStrategies.length * 50000}-${applicableStrategies.length * 100000}`
                    : 'To be determined'

                  return (
                    <div key={riskIndex} className={`mb-6 border-l-4 ${colors.border} rounded-r-lg bg-white shadow-lg print:break-inside-avoid`}>
                      {/* Risk Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b-2">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-2xl">⚠️</span>
                              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                                RISK #{riskIndex + 1}: {hazardName.toUpperCase()}
                              </h3>
                            </div>
                          </div>
                          <span className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap`}>
                            {typeof riskLevel === 'string' ? riskLevel : getLocalizedText(riskLevel, locale)}
                          </span>
                        </div>

                        {/* Risk Profile - Using MetricBox with real data */}
                        <div className="grid grid-cols-3 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                          <MetricBox
                            label="LIKELIHOOD"
                            value={riskCalc.likelihood}
                            score={riskCalc.likelihoodScore}
                            color="blue"
                          />
                          <MetricBox
                            label="IMPACT"
                            value={riskCalc.severity}
                            score={riskCalc.severityScore}
                            color="orange"
                            borderLeft
                          />
                          <MetricBox
                            label="RISK SCORE"
                            value={riskCalc.riskScore ? 
                              (typeof riskCalc.riskScore === 'number' ? `${riskCalc.riskScore.toFixed(1)}/10` : `${riskCalc.riskScore}/10`) 
                              : 'Not calculated'}
                            score={null}
                            color="red"
                            borderLeft
                          />
                        </div>

                        {/* Why This Matters */}
                        {reasoning && (
                          <div className="mt-3 bg-blue-50 border-l-2 border-blue-500 rounded-r-lg p-3">
                            <h4 className="font-semibold text-blue-900 mb-1 flex items-center text-xs">
                              <span className="text-sm mr-1.5">🎯</span>
                              WHY THIS MATTERS
                            </h4>
                            <p className="text-sm text-blue-800 leading-relaxed">{simplifyForSmallBusiness(reasoning)}</p>
                          </div>
                        )}
                      </div>

                      {/* Protection Plan for This Risk */}
                      <div className="p-4 bg-gray-50">
                        <div className="bg-blue-600 text-white rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold flex items-center">
                              <span className="mr-2">🛡️</span>
                              WHAT YOU NEED TO DO
                            </h4>
                            <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                              {applicableStrategies.length} {applicableStrategies.length === 1 ? 'Action' : 'Actions'}
                            </span>
                          </div>
                        </div>

                        {/* This check is no longer needed since we filter out risks with no strategies above */}
                        {applicableStrategies.length > 0 && (
                          <>

                            {/* Each Strategy */}
                            {applicableStrategies.map((strategy: Strategy, stratIndex: number) => {
                              const strategyTitle = simplifyForSmallBusiness(getLocalizedText(strategy.smeTitle || strategy.name, locale))
                              const strategySummary = simplifyForSmallBusiness(getLocalizedText(strategy.smeSummary || strategy.description, locale))
                              // benefitsBullets is already a string array, not multilingual
                              const benefits = strategy.benefitsBullets || []
                              const realWorldExample = getLocalizedText(strategy.realWorldExample, locale)
                              const lowBudgetAlt = getLocalizedText(strategy.lowBudgetAlternative, locale)
                              const diyApproach = getLocalizedText(strategy.diyApproach, locale)
                              const estimatedSavings = getLocalizedText(strategy.estimatedDIYSavings, locale)
                              const costEstimate = calculateStrategyCost(strategy, locale)
                              const timeEstimate = getLocalizedText(strategy.timeToImplement || strategy.implementationTime, locale) || 'To be determined'
                              
                              // Get action steps for this strategy
                              const allSteps = strategy.actionSteps || []
                              const stepsByPhase = groupStepsByPhase(allSteps)
                              const resources = aggregateResources(allSteps)

                              return (
                                <div key={stratIndex} className="mb-4 border-2 border-gray-300 rounded-lg overflow-hidden print:break-inside-avoid bg-white">
                                  {/* ULTRA-SIMPLE HEADER: Just the title and cost */}
                                  <div className="bg-gray-900 text-white p-3">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-base font-bold flex items-center">
                                        <span className="bg-white text-gray-900 w-7 h-7 text-sm rounded-full flex items-center justify-center mr-2 font-bold">
                                          {stratIndex + 1}
                                        </span>
                                        {strategyTitle}
                                      </h5>
                                      {strategy.quickWinIndicator && (
                                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold uppercase">
                                          Quick Win
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-2 ml-9 text-yellow-300 font-bold text-lg">
                                      💰 {costEstimate}
                                    </div>
                                  </div>

                                  {/* SIMPLIFIED CONTENT: Two clear options */}
                                  <div className="p-4 bg-gray-50">
                                    <div className="bg-white border-2 border-gray-200 rounded-lg p-3 mb-3">
                                      <div className="flex items-start space-x-2">
                                        <span className="text-2xl">👷</span>
                                        <div className="flex-1">
                                          <div className="font-bold text-gray-900 text-sm mb-1">OPTION 1: Hire Someone</div>
                                          <div className="text-xs text-gray-700 mb-2">{strategySummary}</div>
                                          <div className="text-xs text-gray-600">
                                            Cost: {costEstimate} • Time: {timeEstimate}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {(lowBudgetAlt || diyApproach) && (
                                      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 mb-3">
                                        <div className="flex items-start space-x-2">
                                          <span className="text-2xl">🔧</span>
                                          <div className="flex-1">
                                            <div className="font-bold text-gray-900 text-sm mb-1">OPTION 2: Do It Yourself</div>
                                            <div className="text-xs text-gray-700 mb-1">
                                              {simplifyForSmallBusiness(diyApproach || lowBudgetAlt)}
                                            </div>
                                            {estimatedSavings && (
                                              <div className="text-xs text-green-700 font-bold">
                                                💰 Save: {estimatedSavings}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* SIMPLE CHECKBOX LIST - Top 5 most important steps */}
                                    {allSteps.length > 0 && (
                                      <div className="bg-white border-2 border-blue-300 rounded-lg p-3">
                                        <div className="font-bold text-gray-900 text-sm mb-2 flex items-center">
                                          <span className="text-blue-600 mr-2">📋</span>
                                          Your Action Checklist:
                                        </div>
                                        <div className="space-y-2">
                                          {allSteps.slice(0, 5).map((step: ActionStep, idx: number) => {
                                            const stepTitle = simplifyForSmallBusiness(getLocalizedText(step.smeAction || step.action || step.title, locale))
                                            const cost = getLocalizedText(step.estimatedCostJMD, locale)
                                            
                                            return (
                                              <div key={idx} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                                                <input 
                                                  type="checkbox" 
                                                  className="mt-1 w-5 h-5 rounded border-gray-300"
                                                  id={`step-${stratIndex}-${idx}`}
                                                />
                                                <label htmlFor={`step-${stratIndex}-${idx}`} className="flex-1 cursor-pointer">
                                                  <div className="text-sm text-gray-900 font-medium">{stepTitle}</div>
                                                  {cost && (
                                                    <div className="text-xs text-green-700 font-semibold mt-0.5">
                                                      💰 {cost}
                                                    </div>
                                                  )}
                                                </label>
                                              </div>
                                            )
                                          })}
                                        </div>
                                        {allSteps.length > 5 && (
                                          <div className="text-xs text-gray-500 mt-2 text-center">
                                            ...and {allSteps.length - 5} more steps (see full plan for details)
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}

                            {/* Total Investment for This Risk - Using calculateTotalCost */}
                            <div className="bg-green-50 rounded-lg p-3 border border-green-200 mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-green-900">
                                  💰 TOTAL INVESTMENT FOR THIS RISK
                                </span>
                                <span className="text-lg font-bold text-green-900">
                                  {calculateTotalCost(applicableStrategies)}
                                </span>
                              </div>
                              <p className="text-xs text-green-800">
                                Cost to implement all {applicableStrategies.length} {applicableStrategies.length === 1 ? 'strategy' : 'strategies'} for {hazardName.toLowerCase()}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
            </>
          )}
        </CompactCard>

        {/* SECTION 3: CONTACTS */}
        <CompactCard>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 border-b pb-2">
            SECTION 3: WHO TO CALL IN AN EMERGENCY
          </h2>
          <ContactsSection formData={formData} locale={locale} />
        </CompactCard>

        {/* SECTION 4: TESTING & MAINTENANCE */}
        <CompactCard>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 border-b pb-2">
            SECTION 4: KEEPING YOUR PLAN READY
          </h2>
          <TestingMaintenanceSection formData={formData} />
        </CompactCard>
      </div>
    </div>
  )
}

// Helper component for clean info rows
const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div>
    <dt className="text-xs font-semibold text-gray-600">{label}</dt>
    <dd className="text-sm text-gray-900 mt-0.5">{value || 'Not specified'}</dd>
  </div>
)

// Metric Box Component for Risk Display
const MetricBox = ({ 
  label, 
  value, 
  score, 
  color, 
  borderLeft 
}: { 
  label: string
  value: string | number
  score?: number | null
  color: 'blue' | 'orange' | 'red'
  borderLeft?: boolean 
}) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50 border-red-200 text-red-900'
  }
  
  return (
    <div className={`${colors[color]} p-3 ${borderLeft ? 'border-l border-gray-200' : ''}`}>
      <div className="text-xs font-semibold opacity-75 mb-1">{label}</div>
      <div className="text-base font-bold capitalize">
        {typeof value === 'string' ? value.replace(/_/g, ' ') : value}
      </div>
      {score && (
        <div className="text-xs opacity-75 mt-1">Score: {score}/10</div>
      )}
    </div>
  )
}

// Action Step Card Component
interface ActionStepCardProps {
  step: ActionStep
  stepNumber: number
  locale: Locale
  color: 'red' | 'orange' | 'blue' | 'green'
}

const ActionStepCard: React.FC<ActionStepCardProps> = ({ step, stepNumber, locale, color }) => {
  const stepTitle = simplifyForSmallBusiness(getLocalizedText(step.smeAction || step.action || step.title, locale))
  const timeframe = getLocalizedText(step.timeframe, locale)
  const responsibility = simplifyForSmallBusiness(getLocalizedText(step.responsibility, locale))
  const whyMatters = simplifyForSmallBusiness(getLocalizedText(step.whyThisStepMatters, locale))
  const whatHappens = simplifyForSmallBusiness(getLocalizedText(step.whatHappensIfSkipped, locale))
  const howToDone = simplifyForSmallBusiness(getLocalizedText(step.howToKnowItsDone, locale))
  const freeAlt = simplifyForSmallBusiness(getLocalizedText(step.freeAlternative, locale))
  const cost = getLocalizedText(step.estimatedCostJMD, locale)
  
  const checklistRaw = step.checklist
  const checklist = Array.isArray(checklistRaw) 
    ? checklistRaw 
    : (typeof checklistRaw === 'object' ? (checklistRaw as any)[locale] || [] : [])
    
  const mistakesRaw = step.commonMistakesForStep
  const mistakes = Array.isArray(mistakesRaw) 
    ? mistakesRaw 
    : (typeof mistakesRaw === 'object' ? (mistakesRaw as any)[locale] || [] : [])

  const borderColor = {
    red: 'border-l-red-300',
    orange: 'border-l-orange-300',
    blue: 'border-l-blue-300',
    green: 'border-l-green-300'
  }[color]

  const numberBg = {
    red: 'bg-red-600',
    orange: 'bg-orange-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600'
  }[color]

  return (
    <div className={`border-l ${borderColor} pl-3 pb-2`}>
      <div className="flex items-start mb-2">
        <span className={`${numberBg} text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-2 -ml-5 flex-shrink-0`}>
          {stepNumber}
        </span>
        <div className="flex-1">
          <h6 className="font-semibold text-gray-900 text-sm mb-1">{stepTitle}</h6>
          
          {/* Metadata row */}
          <div className="flex flex-wrap gap-2 mb-2 text-xs">
            {timeframe && (
              <div className="flex items-center text-gray-600">
                <ClockIcon className="w-3 h-3 mr-1" />
                <span>{timeframe}</span>
              </div>
            )}
            {responsibility && (
              <div className="flex items-center text-gray-600">
                <UserIcon className="w-3 h-3 mr-1" />
                <span>{responsibility}</span>
              </div>
            )}
            {step.difficultyLevel && (
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getDifficultyColor(step.difficultyLevel)}`}>
                {step.difficultyLevel.charAt(0).toUpperCase() + step.difficultyLevel.slice(1)}
              </span>
            )}
          </div>

          {/* Why this matters */}
          {whyMatters && (
            <div className="bg-blue-50 rounded p-1.5 mb-1.5">
              <div className="text-xs font-semibold text-blue-900 mb-0.5">Why:</div>
              <p className="text-xs text-blue-800">{whyMatters}</p>
            </div>
          )}

          {/* Checklist - prioritize over other info */}
          {Array.isArray(checklist) && checklist.length > 0 && (
            <div className="mb-1.5">
              <ul className="space-y-0.5">
                {checklist.slice(0, 3).map((item: string, i: number) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start">
                    <span className="text-gray-400 mr-1.5">☐</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cost and alternatives */}
          <div className="flex flex-wrap gap-2 text-xs mb-1.5">
            {cost && (
              <div className="text-gray-700">
                <span className="font-medium">💰</span> {cost}
              </div>
            )}
            {freeAlt && (
              <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                <span className="font-medium">🆓</span> {freeAlt}
              </div>
            )}
          </div>

          {/* Common mistakes - only show if critical */}
          {Array.isArray(mistakes) && mistakes.length > 0 && mistakes.length <= 2 && (
            <div className="text-xs">
              <div className="font-semibold text-red-600 mb-0.5">⚠️ Avoid:</div>
              <ul className="list-disc list-inside text-red-700 space-y-0.5">
                {mistakes.map((mistake: string, i: number) => (
                  <li key={i}>{mistake}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Contacts Section Component - Simplified for small businesses
const ContactsSection: React.FC<{ formData: any, locale: Locale }> = ({ formData, locale }) => {
  const contacts = formData.CONTACTS_AND_INFORMATION || {}
  
  const getFieldString = (field: any) => {
    if (!field) return ''
    return typeof field === 'string' ? field : (field.en || field.es || field.fr || '')
  }

  const staffContacts = contacts['Staff Contact Information'] || []
  const suppliers = contacts['Supplier Information'] || []
  const customers = contacts['Key Customer Contacts'] || []
  const emergency = contacts['Emergency Services and Utilities'] || []

  const renderContactList = (contactList: any[], title: string, borderColor: string) => {
    if (!contactList || contactList.length === 0) return null

    return (
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h3>
        <div className="space-y-1.5">
          {contactList.map((contact: any, idx: number) => {
            const name = getFieldString(contact.Name || 'Unknown')
            const position = getFieldString(contact.Position || contact['Contact Person'] || '')
            const phone = getFieldString(contact.Phone || '')
            const email = getFieldString(contact.Email || '')
            const service = getFieldString(contact.Service || contact.Relationship || '')
            
            return (
              <div key={idx} className={`text-xs border-l-2 ${borderColor} pl-2 py-1 bg-gray-50 rounded-r`}>
                <div className="font-medium text-gray-900">{name}</div>
                {position && <div className="text-gray-600">{position}</div>}
                {service && <div className="text-gray-600 italic">{service}</div>}
                {phone && <div className="text-gray-600">📞 {phone}</div>}
                {email && <div className="text-gray-600 text-xs truncate">📧 {email}</div>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        {renderContactList(staffContacts, 'Your People', 'border-blue-300')}
        {renderContactList(emergency, 'Emergency Services', 'border-red-300')}
      </div>
      <div>
        {renderContactList(suppliers, 'Key Suppliers', 'border-green-300')}
        {renderContactList(customers, 'Important Customers', 'border-purple-300')}
      </div>
    </div>
  )
}

// Testing & Maintenance Section Component - Simplified for small businesses
const TestingMaintenanceSection: React.FC<{ formData: any }> = ({ formData }) => {
  const testing = formData.TESTING_AND_MAINTENANCE || {}
  
  const getFieldString = (field: any) => {
    if (!field) return ''
    return typeof field === 'string' ? field : (field.en || field.es || field.fr || '')
  }

  const testingSchedule = testing['Plan Testing Schedule'] || []
  const trainingSchedule = testing['Training Schedule'] || []
  const metrics = testing['Performance Metrics'] || []
  const improvements = testing['Improvement Tracking'] || []
  
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-3">
        Your plan only works if you keep it updated and practice it regularly.
      </p>

      {/* Simple checklist format */}
      <div className="space-y-2">
        <div className="bg-blue-50 rounded p-3">
          <div className="font-semibold text-sm text-gray-900 mb-1">
            📅 Review Your Plan
          </div>
          <div className="text-xs text-gray-700 space-y-0.5">
            <div>• Check it every 6 months (or after any big change)</div>
            <div>• Update phone numbers and contacts</div>
            <div>• Make sure everyone knows where to find it</div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded p-3">
          <div className="font-semibold text-sm text-gray-900 mb-1">
            🏃 Practice Your Plan
          </div>
          <div className="text-xs text-gray-700 space-y-0.5">
            <div>• Do a quick walk-through with your team once a year</div>
            <div>• Make sure everyone knows their role</div>
            <div>• Test your emergency contacts</div>
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded p-3">
          <div className="font-semibold text-sm text-gray-900 mb-1">
            ✅ Track What Needs Fixing
          </div>
          <div className="text-xs text-gray-700 space-y-0.5">
            <div>• Write down things that didn't work during practice</div>
            <div>• Fix them before the next emergency</div>
            <div>• Keep notes on what could be better</div>
          </div>
        </div>
      </div>

      {/* Show any specific schedules if they exist, but keep them simple */}
      {(testingSchedule.length > 0 || trainingSchedule.length > 0) && (
        <div className="border-t pt-3 mt-3">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">Your Schedule</h3>
          <div className="space-y-1.5">
            {testingSchedule.slice(0, 2).map((test: any, idx: number) => (
              <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
                <div className="font-medium text-gray-900">{getFieldString(test['Test Type'])}</div>
                <div className="text-gray-600">
                  {getFieldString(test.Frequency)} • {getFieldString(test.Responsible)}
                </div>
              </div>
            ))}
            {trainingSchedule.slice(0, 2).map((training: any, idx: number) => (
              <div key={idx} className="bg-blue-50 rounded p-2 text-xs">
                <div className="font-medium text-gray-900">{getFieldString(training['Training Topic'])}</div>
                <div className="text-gray-600">
                  {getFieldString(training.Frequency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements if any */}
      {improvements.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">Things to Fix</h3>
          <div className="space-y-1.5">
            {improvements.slice(0, 3).map((improvement: any, idx: number) => (
              <div key={idx} className="bg-yellow-50 rounded p-2 text-xs">
                <div className="font-medium text-gray-900">{getFieldString(improvement['Issue Identified'])}</div>
                <div className="text-gray-600">{getFieldString(improvement['Action Required'])}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

