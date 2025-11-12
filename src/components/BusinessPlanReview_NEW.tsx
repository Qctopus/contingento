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
  <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
    {children}
  </div>
)

const InfoGrid = ({ items }: { items: Array<{ label: string, value: any }> }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map((item, index) => (
      <div key={index} className="bg-gray-50 rounded-lg p-3">
        <dt className="text-sm font-medium text-gray-600 mb-1">{item.label}</dt>
        <dd className="text-sm text-gray-900">{item.value || 'Not specified'}</dd>
      </div>
    ))}
  </div>
)

// Helper functions
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

  // Get selected risks from formData
  const selectedRisks = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix']
    ?.filter((r: any) => r.isSelected === true) || []

  // Get selected strategies from formData
  const selectedStrategies = formData.STRATEGIES?.['Business Continuity Strategies'] || []

  // Get user-selected strategies (they chose these in the wizard)
  const selectedStrategyIds = new Set(selectedStrategies.map((s: any) => s.id || s.strategyId))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Business Continuity Plan</h1>
          <p className="text-primary-100">{formData.BUSINESS_OVERVIEW?.['Company Name'] || 'Your Business'}</p>
          <p className="text-sm text-primary-200 mt-4">
            Generated: {new Date().toLocaleDateString()} | Version 1.0
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ← Back to Edit
          </button>
          <button
            onClick={onExportPDF}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
          >
            📄 Export as PDF
          </button>
        </div>

        {/* SECTION 1: BUSINESS OVERVIEW */}
        <CompactCard>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
            SECTION 1: YOUR BUSINESS
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Business Information</h3>
              <InfoGrid items={[
                { label: 'Company Name', value: formData.BUSINESS_OVERVIEW?.['Company Name'] },
                { label: 'Business Address', value: formData.BUSINESS_OVERVIEW?.['Business Address'] },
                { label: 'Plan Manager', value: formData.PLAN_INFO?.['Plan Manager'] },
                { label: 'Alternate Manager', value: formData.PLAN_INFO?.['Alternate Manager'] }
              ]} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What We Do</h3>
              <p className="text-gray-700 leading-relaxed">
                {formData.BUSINESS_OVERVIEW?.['Business Purpose']}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Products & Services</h3>
              <p className="text-gray-700 leading-relaxed">
                {formData.BUSINESS_OVERVIEW?.['Products & Services']}
              </p>
            </div>
          </div>
        </CompactCard>

        {/* SECTION 2: YOUR RISKS & PROTECTION PLAN */}
        <CompactCard>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
            SECTION 2: YOUR RISKS & PROTECTION PLAN
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
              {/* Risk Overview Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Risk Overview</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-gray-900">{selectedRisks.length}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Risks</div>
                  </div>
                  <div className="bg-black rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-white">
                      {selectedRisks.filter((r: any) => r.riskLevel?.toLowerCase().includes('extreme')).length}
                    </div>
                    <div className="text-sm text-gray-200 mt-1">EXTREME</div>
                  </div>
                  <div className="bg-red-500 rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-white">
                      {selectedRisks.filter((r: any) => {
                        const level = r.riskLevel?.toLowerCase() || ''
                        return level.includes('high') && !level.includes('extreme')
                      }).length}
                    </div>
                    <div className="text-sm text-white mt-1">HIGH</div>
                  </div>
                  <div className="bg-yellow-500 rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-white">
                      {selectedRisks.filter((r: any) => r.riskLevel?.toLowerCase().includes('medium')).length}
                    </div>
                    <div className="text-sm text-white mt-1">MEDIUM</div>
                  </div>
                </div>
              </div>

              {/* Sort risks by score (highest first) */}
              {selectedRisks
                .sort((a: any, b: any) => (b.riskScore || 0) - (a.riskScore || 0))
                .map((risk: any, riskIndex: number) => {
                  const hazardName = transformHazardName(risk.hazard || risk.Hazard)
                  const riskLevel = risk.riskLevel || risk['Risk Level'] || 'Medium'
                  const riskScore = risk.riskScore || risk['Risk Score'] || 5
                  const hazardId = risk.hazardId || risk.hazard
                  const reasoning = getLocalizedText(risk.reasoning, locale)
                  const colors = getRiskLevelBadgeColor(riskLevel)

                  // Find strategies that address this risk AND were selected by user
                  const applicableStrategies = selectedStrategies.filter((strategy: Strategy) => {
                    return strategy.applicableRisks?.includes(hazardId) ||
                           strategy.applicableRisks?.includes(risk.hazard)
                  })

                  // Calculate total investment for this risk
                  const totalInvestment = applicableStrategies.length > 0
                    ? `JMD ${applicableStrategies.length * 50000}-${applicableStrategies.length * 100000}`
                    : 'To be determined'

                  return (
                    <div key={riskIndex} className={`mb-12 border-l-8 ${colors.border} rounded-r-lg bg-white shadow-lg print:break-inside-avoid`}>
                      {/* Risk Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b-2">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-3xl">⚠️</span>
                              <h3 className="text-2xl font-bold text-gray-900">
                                RISK #{riskIndex + 1}: {hazardName.toUpperCase()}
                              </h3>
                            </div>
                          </div>
                          <span className={`${colors.bg} ${colors.text} px-4 py-2 rounded-full text-sm font-bold shadow-sm whitespace-nowrap`}>
                            {typeof riskLevel === 'string' ? riskLevel : getLocalizedText(riskLevel, locale)}
                          </span>
                        </div>

                        {/* Risk Profile */}
                        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="text-lg mr-2">📊</span>
                            YOUR RISK PROFILE
                          </h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded p-3">
                              <div className="text-xs text-gray-600 mb-1">Likelihood</div>
                              <div className="font-semibold text-gray-900">
                                {typeof risk.likelihood === 'string' ? risk.likelihood : getLocalizedText(risk.likelihood, locale)}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded p-3">
                              <div className="text-xs text-gray-600 mb-1">Impact / Severity</div>
                              <div className="font-semibold text-gray-900">
                                {typeof risk.severity === 'string' ? risk.severity : getLocalizedText(risk.severity, locale)}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded p-3">
                              <div className="text-xs text-gray-600 mb-1">Risk Score</div>
                              <div className="font-semibold text-gray-900">{riskScore}/10</div>
                            </div>
                          </div>
                        </div>

                        {/* Why This Matters */}
                        {reasoning && (
                          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                              <span className="text-lg mr-2">🎯</span>
                              WHY THIS MATTERS TO YOUR BUSINESS
                            </h4>
                            <p className="text-blue-800 leading-relaxed">{reasoning}</p>
                          </div>
                        )}
                      </div>

                      {/* Protection Plan for This Risk */}
                      <div className="p-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                          <ShieldCheckIcon className="w-6 h-6 mr-2 text-green-600" />
                          YOUR PROTECTION PLAN
                        </h4>

                        {applicableStrategies.length === 0 ? (
                          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-4">
                            <p className="text-yellow-800">
                              <span className="font-semibold">No strategies selected yet.</span> Go back and select protection strategies for this risk in the wizard.
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-700 mb-6">
                              We recommend {applicableStrategies.length} {applicableStrategies.length === 1 ? 'strategy' : 'strategies'} to protect against this risk:
                            </p>

                            {/* Each Strategy */}
                            {applicableStrategies.map((strategy: Strategy, stratIndex: number) => {
                              const strategyTitle = getLocalizedText(strategy.smeTitle || strategy.name, locale)
                              const strategySummary = getLocalizedText(strategy.smeSummary || strategy.description, locale)
                              const benefits = getLocalizedText(strategy.benefitsBullets, locale) || []
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
                                <div key={stratIndex} className="mb-8 border-2 border-gray-200 rounded-lg overflow-hidden print:break-inside-avoid">
                                  {/* Strategy Header */}
                                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 border-b-2">
                                    <div className="flex items-start justify-between mb-3">
                                      <h5 className="text-lg font-bold text-gray-900 flex items-center flex-1">
                                        <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                          {stratIndex + 1}
                                        </span>
                                        {strategyTitle}
                                      </h5>
                                      {strategy.quickWinIndicator && (
                                        <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ml-4">
                                          Quick Win
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-700 leading-relaxed ml-11">{strategySummary}</p>
                                  </div>

                                  <div className="p-5 space-y-4">
                                    {/* Benefits */}
                                    {Array.isArray(benefits) && benefits.length > 0 && (
                                      <div className="bg-blue-50 rounded-lg p-4">
                                        <h6 className="font-semibold text-blue-900 mb-2">What You Get:</h6>
                                        <ul className="space-y-1">
                                          {benefits.map((benefit: string, idx: number) => (
                                            <li key={idx} className="text-sm text-blue-800 flex items-start">
                                              <span className="text-blue-600 mr-2 mt-0.5">✓</span>
                                              <span>{benefit}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Investment Overview */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center mb-1">
                                          <CurrencyDollarIcon className="w-4 h-4 text-gray-600 mr-1" />
                                          <div className="text-xs text-gray-600">Investment</div>
                                        </div>
                                        <div className="font-semibold text-gray-900">{costEstimate}</div>
                                      </div>
                                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center mb-1">
                                          <ClockIcon className="w-4 h-4 text-gray-600 mr-1" />
                                          <div className="text-xs text-gray-600">Time Required</div>
                                        </div>
                                        <div className="font-semibold text-gray-900">{timeEstimate}</div>
                                      </div>
                                    </div>

                                    {/* Real-world example */}
                                    {realWorldExample && (
                                      <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4">
                                        <h6 className="font-semibold text-green-900 mb-2">Real Success Story:</h6>
                                        <p className="text-sm text-green-800 leading-relaxed">{realWorldExample}</p>
                                      </div>
                                    )}

                                    {/* Budget-friendly options */}
                                    {(lowBudgetAlt || diyApproach) && (
                                      <div className="border-t pt-4 space-y-3">
                                        {lowBudgetAlt && (
                                          <div>
                                            <h6 className="font-semibold text-gray-900 mb-1">💰 Low-Budget Option:</h6>
                                            <p className="text-sm text-gray-700 leading-relaxed">{lowBudgetAlt}</p>
                                          </div>
                                        )}
                                        {diyApproach && (
                                          <div>
                                            <h6 className="font-semibold text-gray-900 mb-1">🔧 Do It Yourself:</h6>
                                            <p className="text-sm text-gray-700 leading-relaxed">{diyApproach}</p>
                                            {estimatedSavings && (
                                              <p className="text-xs text-green-600 mt-1 font-medium">
                                                Potential savings: {estimatedSavings}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Detailed Action Steps */}
                                    {allSteps.length > 0 && (
                                      <div className="border-t pt-4">
                                        <h6 className="font-semibold text-gray-900 mb-4">Exactly What To Do:</h6>

                                        {/* Resources Needed */}
                                        {resources.length > 0 && (
                                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                            <h6 className="font-semibold text-gray-900 mb-2">Resources & Equipment Needed:</h6>
                                            <div className="grid md:grid-cols-2 gap-2">
                                              {resources.map((resource, idx) => (
                                                <div key={idx} className="text-sm text-gray-800 flex items-center">
                                                  <span className="text-yellow-600 mr-2">□</span>
                                                  {resource}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* BEFORE (Immediate Actions) */}
                                        {stepsByPhase.before.length > 0 && (
                                          <div className="mb-6">
                                            <div className="bg-red-50 border-l-4 border-red-600 rounded-r-lg p-3 mb-3">
                                              <h6 className="font-bold text-red-900">🔴 BEFORE (Immediate - 0-24 hours)</h6>
                                              <p className="text-xs text-red-700 mt-1">Critical actions to take immediately</p>
                                            </div>

                                            <div className="space-y-4 ml-4">
                                              {stepsByPhase.before.map((step: ActionStep, stepIdx: number) => (
                                                <ActionStepCard 
                                                  key={stepIdx} 
                                                  step={step} 
                                                  stepNumber={stepIdx + 1} 
                                                  locale={locale}
                                                  color="red"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* DURING (Short-term Actions) */}
                                        {stepsByPhase.during.length > 0 && (
                                          <div className="mb-6">
                                            <div className="bg-orange-50 border-l-4 border-orange-600 rounded-r-lg p-3 mb-3">
                                              <h6 className="font-bold text-orange-900">🟠 DURING (Short-term - 1-7 days)</h6>
                                              <p className="text-xs text-orange-700 mt-1">Actions during and immediately after the event</p>
                                            </div>

                                            <div className="space-y-4 ml-4">
                                              {stepsByPhase.during.map((step: ActionStep, stepIdx: number) => (
                                                <ActionStepCard 
                                                  key={stepIdx} 
                                                  step={step} 
                                                  stepNumber={stepIdx + 1} 
                                                  locale={locale}
                                                  color="orange"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* AFTER (Medium-term Recovery) */}
                                        {stepsByPhase.after.length > 0 && (
                                          <div className="mb-6">
                                            <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-3 mb-3">
                                              <h6 className="font-bold text-blue-900">🔵 AFTER (Recovery - 1-4 weeks)</h6>
                                              <p className="text-xs text-blue-700 mt-1">Recovery and restoration actions</p>
                                            </div>

                                            <div className="space-y-4 ml-4">
                                              {stepsByPhase.after.map((step: ActionStep, stepIdx: number) => (
                                                <ActionStepCard 
                                                  key={stepIdx} 
                                                  step={step} 
                                                  stepNumber={stepIdx + 1} 
                                                  locale={locale}
                                                  color="blue"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* ONGOING (Long-term Prevention) */}
                                        {stepsByPhase.ongoing.length > 0 && (
                                          <div className="mb-6">
                                            <div className="bg-green-50 border-l-4 border-green-600 rounded-r-lg p-3 mb-3">
                                              <h6 className="font-bold text-green-900">🟢 ONGOING (Prevention - 1-6 months)</h6>
                                              <p className="text-xs text-green-700 mt-1">Long-term improvements to reduce future risk</p>
                                            </div>

                                            <div className="space-y-4 ml-4">
                                              {stepsByPhase.ongoing.map((step: ActionStep, stepIdx: number) => (
                                                <ActionStepCard 
                                                  key={stepIdx} 
                                                  step={step} 
                                                  stepNumber={stepIdx + 1} 
                                                  locale={locale}
                                                  color="green"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}

                            {/* Total Investment for This Risk */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-5">
                              <h6 className="font-bold text-gray-900 mb-2">💰 TOTAL INVESTMENT TO ADDRESS THIS RISK</h6>
                              <p className="text-2xl font-bold text-purple-700 mb-2">{totalInvestment}</p>
                              <p className="text-sm text-gray-700">
                                This is the total cost to implement all {applicableStrategies.length} {applicableStrategies.length === 1 ? 'strategy' : 'strategies'} for protecting against {hazardName.toLowerCase()}.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
            SECTION 3: EMERGENCY CONTACTS
          </h2>
          <ContactsSection formData={formData} locale={locale} />
        </CompactCard>

        {/* SECTION 4: TESTING & MAINTENANCE */}
        <CompactCard>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
            SECTION 4: TESTING & MAINTENANCE
          </h2>
          <TestingMaintenanceSection formData={formData} />
        </CompactCard>
      </div>
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
  const stepTitle = getLocalizedText(step.smeAction || step.action || step.title, locale)
  const timeframe = getLocalizedText(step.timeframe, locale)
  const responsibility = getLocalizedText(step.responsibility, locale)
  const whyMatters = getLocalizedText(step.whyThisStepMatters, locale)
  const whatHappens = getLocalizedText(step.whatHappensIfSkipped, locale)
  const howToDone = getLocalizedText(step.howToKnowItsDone, locale)
  const freeAlt = getLocalizedText(step.freeAlternative, locale)
  const cost = getLocalizedText(step.estimatedCostJMD || step.estimatedCost, locale)
  
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
    <div className={`border-l-2 ${borderColor} pl-6 pb-4`}>
      <div className="flex items-start mb-3">
        <span className={`${numberBg} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 -ml-10 flex-shrink-0`}>
          {stepNumber}
        </span>
        <div className="flex-1">
          <h6 className="font-semibold text-gray-900 text-base mb-2">{stepTitle}</h6>
          
          {/* Metadata row */}
          <div className="flex flex-wrap gap-4 mb-3 text-sm">
            {timeframe && (
              <div className="flex items-center text-gray-600">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>{timeframe}</span>
              </div>
            )}
            {responsibility && (
              <div className="flex items-center text-gray-600">
                <UserIcon className="w-4 h-4 mr-1" />
                <span>{responsibility}</span>
              </div>
            )}
            {step.difficultyLevel && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(step.difficultyLevel)}`}>
                {step.difficultyLevel.charAt(0).toUpperCase() + step.difficultyLevel.slice(1)}
              </span>
            )}
          </div>

          {/* Why this matters */}
          {whyMatters && (
            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <div className="text-xs font-semibold text-blue-900 mb-1">Why This Matters:</div>
              <p className="text-sm text-blue-800">{whyMatters}</p>
            </div>
          )}

          {/* What happens if skipped */}
          {whatHappens && (
            <div className="bg-yellow-50 rounded-lg p-3 mb-3">
              <div className="text-xs font-semibold text-yellow-900 mb-1">If You Skip This:</div>
              <p className="text-sm text-yellow-800">{whatHappens}</p>
            </div>
          )}

          {/* Checklist */}
          {Array.isArray(checklist) && checklist.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-700 mb-2">Action Checklist:</div>
              <ul className="space-y-1">
                {checklist.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start">
                    <span className="text-gray-400 mr-2">☐</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Completion criteria */}
          {howToDone && (
            <div className="bg-green-50 rounded-lg p-3 mb-3">
              <div className="text-xs font-semibold text-green-900 mb-1">Done When:</div>
              <p className="text-sm text-green-800">{howToDone}</p>
            </div>
          )}

          {/* Cost and alternatives */}
          <div className="flex flex-wrap gap-4 text-sm mb-3">
            {cost && (
              <div className="text-gray-700">
                <span className="font-medium">💰 Cost:</span> {cost}
              </div>
            )}
            {freeAlt && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded">
                <span className="font-medium">🆓 Free option:</span> {freeAlt}
              </div>
            )}
          </div>

          {/* Common mistakes */}
          {Array.isArray(mistakes) && mistakes.length > 0 && (
            <div className="text-sm">
              <div className="font-semibold text-red-600 mb-1">⚠️ Common Mistakes to Avoid:</div>
              <ul className="list-disc list-inside text-red-700 space-y-1">
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

// Contacts Section Component
const ContactsSection: React.FC<{ formData: any, locale: Locale }> = ({ formData, locale }) => {
  const contacts = formData.CONTACTS || {}
  
  const getFieldString = (field: any) => {
    if (!field) return ''
    return typeof field === 'string' ? field : (field.en || field.es || field.fr || '')
  }

  const renderContactList = (contactList: any[], title: string, icon: string) => {
    if (!contactList || contactList.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">{icon}</span>
          {title}
          <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
            {contactList.length}
          </span>
        </h3>
        <div className="space-y-3">
          {contactList.map((contact: any, idx: number) => {
            const name = getFieldString(contact.Name || contact['Supplier Name'] || contact['Customer Name'] || 'Unknown')
            const position = getFieldString(contact.Position || contact['Type/Notes'] || '')
            const phone = getFieldString(contact['Phone Number'] || contact.Phone || '')
            const email = getFieldString(contact['Email Address'] || contact.Email || '')
            
            return (
              <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="font-medium text-gray-900">{name}</div>
                {position && <div className="text-sm text-gray-600">{position}</div>}
                <div className="mt-1 text-sm text-gray-700 space-y-1">
                  {phone && <div>📞 {phone}</div>}
                  {email && <div>📧 {email}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      {renderContactList(contacts['Staff Contacts'] || [], 'Staff Contacts', '👥')}
      {renderContactList(contacts['Key Suppliers'] || [], 'Key Suppliers', '🏪')}
      {renderContactList(contacts['Key Customers'] || [], 'Key Customers', '🤝')}
      {renderContactList(contacts['Emergency Services'] || [], 'Emergency Services', '🚨')}
    </div>
  )
}

// Testing & Maintenance Section Component
const TestingMaintenanceSection: React.FC<{ formData: any }> = ({ formData }) => {
  const testing = formData.TESTING_MAINTENANCE || {}
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">When to Review This Plan</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Annually (at minimum)</li>
          <li>After any emergency event</li>
          <li>When business operations change significantly</li>
          <li>When key personnel change</li>
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Regular Testing</h3>
        <p className="text-gray-700 mb-3">
          Test your plan at least twice a year. Practice drills help identify gaps and keep staff prepared.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Tip:</span> Start with simple tabletop exercises where you discuss "what would we do if..." scenarios with your team. 
            This is free and highly effective.
          </p>
        </div>
      </div>
    </div>
  )
}












