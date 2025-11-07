/**
 * Crisis-Ready Action Workbook Component
 * Emergency-focused, grab-and-go field guide
 * Print-friendly, single column, large text, practical checklists
 */

import React from 'react'

interface ActionStep {
  id: string
  title: string
  description: string
  smeAction?: string
  whyThisStepMatters?: string
  whatHappensIfSkipped?: string
  estimatedMinutes?: number
  difficultyLevel?: string
  howToKnowItsDone?: string
  exampleOutput?: string
  freeAlternative?: string
  lowTechOption?: string
  commonMistakesForStep?: string[]
  videoTutorialUrl?: string
  phase?: string
  sortOrder: number
  checklist?: string[]
  costItems?: Array<{
    id?: string
    itemId: string
    quantity: number
    notes?: string
    item?: any
  }>
}

interface Strategy {
  id: string
  name: string
  smeTitle?: string
  description: string
  smeSummary?: string
  applicableRisks: string[]
  actionSteps: ActionStep[]
  calculatedCostLocal?: number
  calculatedCostUSD?: number
  currencyCode?: string
  currencySymbol?: string
  benefitsBullets?: string[]
  realWorldExample?: string
  diyApproach?: string
  lowBudgetAlternative?: string
  estimatedDIYSavings?: string
  timeToImplement?: string
}

interface WorkbookPreviewProps {
  formData: any
  riskSummary?: any
  strategies: Strategy[]
  totalInvestment: number
}

export const WorkbookPreview: React.FC<WorkbookPreviewProps> = ({
  formData,
  riskSummary,
  strategies,
  totalInvestment
}) => {
  const companyName = formData.PLAN_INFORMATION?.['Company Name'] || 'Your Business'
  const planManager = formData.PLAN_INFORMATION?.['Plan Manager'] || 'Not specified'
  const planManagerPhone = formData.PLAN_INFORMATION?.['Plan Manager Phone'] || ''
  const planManagerEmail = formData.PLAN_INFORMATION?.['Plan Manager Email'] || ''
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  
  // Extract risks from multiple possible locations
  const riskMatrix = riskSummary?.['Risk Assessment Matrix'] || 
                     riskSummary?.['Hazard Applicability Assessment'] ||
                     riskSummary?.risks ||
                     []
  
  const risks = Array.isArray(riskMatrix) ? riskMatrix.filter((r: any) => 
    r && (r.hazard || r.Hazard || r.riskType)
  ) : []
  
  // Sort risks by severity
  const sortedRisks = [...risks].sort((a, b) => {
    const scoreA = a.riskScore || 0
    const scoreB = b.riskScore || 0
    return scoreB - scoreA
  })
  
  const topThreeRisks = sortedRisks.slice(0, 3)

  // Get currency info from strategies
  const currencySymbol = strategies[0]?.currencySymbol || 'JMD'
  const currencyCode = strategies[0]?.currencyCode || 'JMD'

  // Helper to safely get string from potentially multilingual field
  const getStringValue = (value: any): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object' && (value.en || value.es || value.fr)) {
      return value.en || value.es || value.fr || ''
    }
    return String(value)
  }
  
  // Helper to get risk emoji
  const getRiskEmoji = (hazard: string): string => {
    const h = hazard.toLowerCase()
    if (h.includes('hurricane') || h.includes('tropical')) return '🌀'
    if (h.includes('earthquake')) return '🏚️'
    if (h.includes('flood')) return '🌊'
    if (h.includes('fire')) return '🔥'
    if (h.includes('cyber')) return '💻'
    if (h.includes('power')) return '⚡'
    if (h.includes('pandemic') || h.includes('health')) return '🏥'
    return '⚠️'
  }

  // Helper to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US').format(Math.round(amount))
  }

  // Helper to get strategies for a specific risk
  const getStrategiesForRisk = (risk: any): Strategy[] => {
    const hazardName = getStringValue(risk.hazard || risk.Hazard)
    const hazardId = risk.hazardId || hazardName
    
    return strategies.filter((strategy: Strategy) => {
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
  }

  // Helper to calculate cost for action step
  const calculateStepCost = (step: ActionStep): number => {
    if (!step.costItems || step.costItems.length === 0) return 0
    
    return step.costItems.reduce((sum, ci) => {
      if (ci.item) {
        const qty = ci.quantity || 1
        const cost = ci.item.baseUSDMax || ci.item.baseUSD || 0
        // Assuming exchange rate or using local currency if available
        return sum + (cost * qty * 150) // Default exchange rate
      }
      return sum
    }, 0)
  }

  // Phase configurations
  const phaseConfig: Record<string, { label: string, emoji: string }> = {
    immediate: { label: 'IMMEDIATE (24-48 hours)', emoji: '🔴' },
    short_term: { label: 'SHORT-TERM (1-2 weeks)', emoji: '🟠' },
    medium_term: { label: 'MEDIUM-TERM (1-3 months)', emoji: '🟡' },
    long_term: { label: 'LONG-TERM (3+ months)', emoji: '🟢' }
  }

  return (
    <div className="bg-white print:shadow-none" style={{ maxWidth: '8.5in', margin: '0 auto' }}>
      {/* COVER PAGE - Emergency-First Design */}
      <div className="border-8 border-red-600 p-8 text-center bg-white page-break-after" style={{ minHeight: '11in' }}>
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-4 text-gray-900 tracking-tight" style={{ fontSize: '3rem', lineHeight: '1.1' }}>
            CRISIS ACTION WORKBOOK
          </h1>
          <div className="text-3xl font-bold text-red-600 mb-8" style={{ fontSize: '2rem' }}>
            {companyName}
          </div>
        </div>

        {/* Emergency Quick Access Box */}
        <div className="border-4 border-red-500 bg-red-50 p-6 mb-8 text-left">
          <h2 className="text-2xl font-black mb-4 text-red-900 text-center" style={{ fontSize: '1.5rem' }}>
            ⚠️ IN CASE OF EMERGENCY
          </h2>
          <div className="space-y-4 text-lg" style={{ fontSize: '1.125rem' }}>
            <div className="flex justify-between border-b-2 border-red-200 pb-2">
              <span className="font-bold">Emergency Services:</span>
              <span className="font-mono">________________</span>
            </div>
            <div className="flex justify-between border-b-2 border-red-200 pb-2">
              <span className="font-bold">Plan Manager ({planManager}):</span>
              <span className="font-mono">________________</span>
            </div>
            <div className="flex justify-between border-b-2 border-red-200 pb-2">
              <span className="font-bold">Alternate Contact:</span>
              <span className="font-mono">________________</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-100 border-2 border-yellow-600">
            <p className="text-xl font-bold text-center text-yellow-900" style={{ fontSize: '1.25rem' }}>
              IF YOU'RE READING THIS IN AN EMERGENCY,<br/>GO TO PAGE 2 (QUICK REFERENCE)
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="border-2 border-gray-400 p-6 text-left">
          <h2 className="text-2xl font-black mb-4 text-gray-900" style={{ fontSize: '1.5rem' }}>
            📑 TABLE OF CONTENTS
          </h2>
          <div className="space-y-2 text-base" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Page 1: Quick Reference Guide (Emergency Flowchart)</span>
              <span className="font-mono">2</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Page 2: Emergency Contact Lists</span>
              <span className="font-mono">3</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Page 3: Your Top 3 Critical Risks</span>
              <span className="font-mono">4</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Page 4+: Risk Action Plans (BEFORE/DURING/AFTER)</span>
              <span className="font-mono">5</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Implementation Checklists & Budget Trackers</span>
              <span className="font-mono">{5 + risks.length}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Vital Documents Locator</span>
              <span className="font-mono">{6 + risks.length + strategies.length}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Incident Log Templates (Blank Forms)</span>
              <span className="font-mono">{7 + risks.length + strategies.length}</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-4 border-t-2 border-gray-300">
          <p className="text-base text-gray-600" style={{ fontSize: '1rem' }}>
            <strong>Last Updated:</strong> {currentDate}
          </p>
          <p className="text-base text-gray-600 mt-2" style={{ fontSize: '1rem' }}>
            <strong>Update Schedule:</strong> Review quarterly or after any major change
          </p>
          <p className="text-sm text-gray-500 mt-4" style={{ fontSize: '0.875rem' }}>
            UNDP x CARICHAM Business Continuity Planning Initiative
          </p>
        </div>
      </div>

      {/* PAGE 1: QUICK REFERENCE GUIDE - Single Page Emergency Guide */}
      <div className="p-8 page-break-after border-b-4 border-gray-900" style={{ minHeight: '11in' }}>
        <div className="border-4 border-black p-2 mb-6">
          <h1 className="text-4xl font-black text-center text-red-600" style={{ fontSize: '2.5rem' }}>
            🚨 QUICK REFERENCE GUIDE
          </h1>
          <p className="text-center text-xl font-bold mt-2" style={{ fontSize: '1.25rem' }}>
            ONE-PAGE EMERGENCY FLOWCHART
          </p>
        </div>

        {/* Who to Call First */}
        <div className="border-4 border-red-500 bg-red-50 p-4 mb-6">
          <h2 className="text-2xl font-black mb-4 text-red-900" style={{ fontSize: '1.5rem' }}>
            📞 WHO TO CALL FIRST
          </h2>
          <div className="space-y-3 text-lg" style={{ fontSize: '1.125rem' }}>
            <div className="flex items-center gap-3 bg-white p-3 border-2 border-red-300">
              <span className="text-3xl">☑️</span>
              <div className="flex-1">
                <strong>Emergency Services (Police/Fire/Ambulance):</strong>
                <div className="text-2xl font-mono mt-1 border-b-2 border-gray-400" style={{ fontSize: '1.5rem' }}>
                  ______________________________
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 border-2 border-red-300">
              <span className="text-3xl">☑️</span>
              <div className="flex-1">
                <strong>Plan Manager ({planManager}):</strong>
                <div className="text-2xl font-mono mt-1 border-b-2 border-gray-400" style={{ fontSize: '1.5rem' }}>
                  ______________________________
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 border-2 border-red-300">
              <span className="text-3xl">☑️</span>
              <div className="flex-1">
                <strong>Insurance Agent:</strong>
                <div className="text-2xl font-mono mt-1 border-b-2 border-gray-400" style={{ fontSize: '1.5rem' }}>
                  ______________________________
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Numbers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border-2 border-gray-600 p-4 bg-gray-50">
            <h3 className="text-lg font-black mb-3" style={{ fontSize: '1.125rem' }}>💳 CRITICAL ACCOUNT NUMBERS</h3>
            <div className="space-y-2 text-base" style={{ fontSize: '1rem' }}>
              <div>
                <strong>Insurance Policy #:</strong>
                <div className="border-b-2 border-gray-400 font-mono">_______________</div>
              </div>
              <div>
                <strong>Bank Account #:</strong>
                <div className="border-b-2 border-gray-400 font-mono">_______________</div>
              </div>
              <div>
                <strong>Business License #:</strong>
                <div className="border-b-2 border-gray-400 font-mono">_______________</div>
              </div>
            </div>
          </div>
          <div className="border-2 border-blue-600 p-4 bg-blue-50">
            <h3 className="text-lg font-black mb-3" style={{ fontSize: '1.125rem' }}>📍 EMERGENCY LOCATIONS</h3>
            <div className="space-y-2 text-base" style={{ fontSize: '1rem' }}>
              <div>
                <strong>Assembly Point:</strong>
                <div className="border-b-2 border-gray-400">_______________</div>
              </div>
              <div>
                <strong>Alternate Location:</strong>
                <div className="border-b-2 border-gray-400">_______________</div>
              </div>
              <div>
                <strong>Safe/Vital Records:</strong>
                <div className="border-b-2 border-gray-400">_______________</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Critical Risks */}
        <div className="border-4 border-orange-500 bg-orange-50 p-4">
          <h2 className="text-2xl font-black mb-4 text-orange-900" style={{ fontSize: '1.5rem' }}>
            ⚠️ YOUR TOP 3 CRITICAL RISKS
          </h2>
          <div className="space-y-2">
            {topThreeRisks.map((risk, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-3 border-2 border-orange-300 text-lg" style={{ fontSize: '1.125rem' }}>
                <span className="text-3xl">{getRiskEmoji(getStringValue(risk.hazard || risk.Hazard))}</span>
                <strong className="flex-1">{idx + 1}. {getStringValue(risk.hazard || risk.Hazard)}</strong>
                <span className="px-3 py-1 bg-red-600 text-white font-bold rounded">
                  {getStringValue(risk.riskLevel || risk.RiskLevel)}
                </span>
              </div>
            ))}
            {topThreeRisks.length === 0 && (
              <div className="text-lg text-gray-600 text-center py-4" style={{ fontSize: '1.125rem' }}>
                Complete risk assessment to see your top risks here
              </div>
            )}
          </div>
        </div>

        {/* Page Footer */}
        <div className="mt-6 pt-4 border-t-2 border-gray-400 text-center">
          <p className="text-base text-gray-600" style={{ fontSize: '1rem' }}>
            <strong>Page 1 of {5 + risks.length + strategies.length}</strong> | {companyName} | Updated: {currentDate}
          </p>
        </div>
      </div>

      {/* PAGE 2: EMERGENCY CONTACT LISTS - Large Type, Easy to Read */}
      <div className="p-8 page-break-after border-b-4 border-gray-900" style={{ minHeight: '11in' }}>
        <div className="border-4 border-black p-2 mb-6">
          <h1 className="text-4xl font-black text-center text-blue-600" style={{ fontSize: '2.5rem' }}>
            📞 EMERGENCY CONTACT LISTS
          </h1>
        </div>

        {/* Update Reminder */}
        <div className="bg-yellow-100 border-4 border-yellow-600 p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-xl font-black text-yellow-900 mb-2" style={{ fontSize: '1.25rem' }}>
                KEEP THIS UPDATED!
              </h3>
              <p className="text-lg text-yellow-800" style={{ fontSize: '1.125rem' }}>
                Verify all contact numbers quarterly. Check the box when verified.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Services */}
        <div className="border-4 border-red-500 bg-white p-6 mb-4">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2" style={{ fontSize: '1.5rem' }}>
            <span>🚨</span> EMERGENCY SERVICES
          </h2>
          <div className="space-y-4">
            <div className="border-2 border-gray-400 p-4">
              <div className="flex items-center gap-4 mb-3">
                <input type="checkbox" className="w-8 h-8 flex-shrink-0" style={{ width: '2rem', height: '2rem' }} disabled />
                <span className="text-xl font-bold" style={{ fontSize: '1.25rem' }}>Police</span>
              </div>
              <div className="text-lg space-y-2" style={{ fontSize: '1.125rem' }}>
                <div className="flex justify-between">
                  <strong>Phone:</strong>
                  <span className="text-2xl font-mono border-b-2 border-gray-400 flex-1 ml-4" style={{ fontSize: '1.5rem' }}>
                    ______________________________
                  </span>
                </div>
                <div className="flex justify-between">
                  <strong>Last Verified:</strong>
                  <span className="border-b-2 border-gray-400 flex-1 ml-4">
                    _______________
                  </span>
                </div>
              </div>
            </div>

            <div className="border-2 border-gray-400 p-4">
              <div className="flex items-center gap-4 mb-3">
                <input type="checkbox" className="w-8 h-8 flex-shrink-0" style={{ width: '2rem', height: '2rem' }} disabled />
                <span className="text-xl font-bold" style={{ fontSize: '1.25rem' }}>Fire Department</span>
              </div>
              <div className="text-lg space-y-2" style={{ fontSize: '1.125rem' }}>
                <div className="flex justify-between">
                  <strong>Phone:</strong>
                  <span className="text-2xl font-mono border-b-2 border-gray-400 flex-1 ml-4" style={{ fontSize: '1.5rem' }}>
                    ______________________________
                  </span>
                </div>
                <div className="flex justify-between">
                  <strong>Last Verified:</strong>
                  <span className="border-b-2 border-gray-400 flex-1 ml-4">
                    _______________
                  </span>
                </div>
              </div>
            </div>

            <div className="border-2 border-gray-400 p-4">
              <div className="flex items-center gap-4 mb-3">
                <input type="checkbox" className="w-8 h-8 flex-shrink-0" style={{ width: '2rem', height: '2rem' }} disabled />
                <span className="text-xl font-bold" style={{ fontSize: '1.25rem' }}>Ambulance / Hospital</span>
              </div>
              <div className="text-lg space-y-2" style={{ fontSize: '1.125rem' }}>
                <div className="flex justify-between">
                  <strong>Phone:</strong>
                  <span className="text-2xl font-mono border-b-2 border-gray-400 flex-1 ml-4" style={{ fontSize: '1.5rem' }}>
                    ______________________________
                  </span>
                </div>
                <div className="flex justify-between">
                  <strong>Last Verified:</strong>
                  <span className="border-b-2 border-gray-400 flex-1 ml-4">
                    _______________
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Business Contacts */}
        <div className="border-4 border-blue-500 bg-white p-6">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2" style={{ fontSize: '1.5rem' }}>
            <span>👔</span> KEY BUSINESS CONTACTS
          </h2>
          <div className="space-y-4">
            <div className="border-2 border-gray-400 p-4">
              <div className="flex items-center gap-4 mb-3">
                <input type="checkbox" className="w-8 h-8 flex-shrink-0" style={{ width: '2rem', height: '2rem' }} disabled />
                <span className="text-xl font-bold" style={{ fontSize: '1.25rem' }}>Plan Manager: {planManager}</span>
              </div>
              <div className="text-lg space-y-2" style={{ fontSize: '1.125rem' }}>
                <div className="flex justify-between">
                  <strong>Mobile:</strong>
                  <span className="text-2xl font-mono border-b-2 border-gray-400 flex-1 ml-4" style={{ fontSize: '1.5rem' }}>
                    {planManagerPhone || '______________________________'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <strong>Alt Phone:</strong>
                  <span className="text-2xl font-mono border-b-2 border-gray-400 flex-1 ml-4" style={{ fontSize: '1.5rem' }}>
                    ______________________________
                  </span>
                </div>
                <div className="flex justify-between">
                  <strong>Email:</strong>
                  <span className="border-b-2 border-gray-400 flex-1 ml-4">
                    {planManagerEmail || '_______________________________________'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-2 border-gray-400 p-4">
              <div className="flex items-center gap-4 mb-3">
                <input type="checkbox" className="w-8 h-8 flex-shrink-0" style={{ width: '2rem', height: '2rem' }} disabled />
                <span className="text-xl font-bold" style={{ fontSize: '1.25rem' }}>Insurance Agent</span>
              </div>
              <div className="text-lg space-y-2" style={{ fontSize: '1.125rem' }}>
                <div className="flex justify-between">
                  <strong>Company:</strong>
                  <span className="border-b-2 border-gray-400 flex-1 ml-4">
                    _______________________________________
                  </span>
                </div>
                <div className="flex justify-between">
                  <strong>Agent Name:</strong>
                  <span className="border-b-2 border-gray-400 flex-1 ml-4">
                    _______________________________________
                  </span>
                </div>
                <div className="flex justify-between">
                  <strong>Phone:</strong>
                  <span className="text-2xl font-mono border-b-2 border-gray-400 flex-1 ml-4" style={{ fontSize: '1.5rem' }}>
                    ______________________________
                  </span>
                </div>
                <div className="flex justify-between">
                  <strong>Policy #:</strong>
                  <span className="font-mono border-b-2 border-gray-400 flex-1 ml-4">
                    _______________________________________
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <div className="mt-6 pt-4 border-t-2 border-gray-400 text-center">
          <p className="text-base text-gray-600" style={{ fontSize: '1rem' }}>
            <strong>Page 2 of {5 + risks.length + strategies.length}</strong> | {companyName} | Updated: {currentDate}
          </p>
        </div>
      </div>

      {/* RISK-SPECIFIC ACTION PAGES - One Risk Per Page */}
      {sortedRisks.map((risk: any, riskIdx: number) => {
        const hazardName = getStringValue(risk.hazard || risk.Hazard)
        const riskLevel = getStringValue(risk.riskLevel || risk.RiskLevel)
        const riskEmoji = getRiskEmoji(hazardName)
        const isHighSeverity = riskLevel.toLowerCase().includes('extreme') || riskLevel.toLowerCase().includes('high')
        
        // Get applicable strategies for this risk
        const applicableStrategies = getStrategiesForRisk(risk)
        
        // Collect all action steps from all strategies for this risk
        const allActionSteps: ActionStep[] = []
        applicableStrategies.forEach(strategy => {
          if (strategy.actionSteps && strategy.actionSteps.length > 0) {
            allActionSteps.push(...strategy.actionSteps)
          }
        })
        
        // Group steps by phase
        const stepsByPhase: Record<string, ActionStep[]> = {
          immediate: [],
          short_term: [],
          medium_term: [],
          long_term: []
        }
        
        allActionSteps.forEach(step => {
          const phase = step.phase || 'medium_term'
          if (stepsByPhase[phase]) {
            stepsByPhase[phase].push(step)
          }
        })
        
        return (
          <div key={riskIdx} className="p-8 page-break-after border-b-4 border-gray-900" style={{ minHeight: '11in' }}>
            {/* Risk Header */}
            <div className={`border-4 p-4 mb-6 ${
              isHighSeverity ? 'border-red-600 bg-red-50' : 'border-orange-500 bg-orange-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-black" style={{ fontSize: '2rem' }}>
                  {riskEmoji} RISK: {hazardName.toUpperCase()}
                </h1>
                <div className={`px-4 py-2 rounded font-black text-xl ${
                  isHighSeverity ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                }`} style={{ fontSize: '1.25rem' }}>
                  {riskLevel}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-lg font-bold" style={{ fontSize: '1.125rem' }}>Risk Score:</span>
                <div className="flex-1 bg-white border-2 border-gray-400 rounded-full h-6">
                  <div 
                    className={`h-full rounded-full ${
                      isHighSeverity ? 'bg-red-600' : 'bg-orange-500'
                    }`}
                    style={{ width: `${(risk.riskScore || 0) * 10}%` }}
                  ></div>
                </div>
                <span className="text-xl font-black" style={{ fontSize: '1.25rem' }}>
                  {risk.riskScore || 0}/10
                </span>
              </div>
              
              {/* Show applicable strategies count */}
              {applicableStrategies.length > 0 && (
                <div className="mt-3 text-base font-bold" style={{ fontSize: '1rem' }}>
                  📋 {applicableStrategies.length} {applicableStrategies.length === 1 ? 'Strategy' : 'Strategies'} | {allActionSteps.length} Action {allActionSteps.length === 1 ? 'Step' : 'Steps'}
                </div>
              )}
            </div>

            {/* BEFORE (PREPARATION) Section */}
            <div className="border-4 border-blue-600 bg-blue-50 p-6 mb-6">
              <h2 className="text-2xl font-black mb-4 text-blue-900 flex items-center gap-2" style={{ fontSize: '1.5rem' }}>
                <span>🔧</span> BEFORE (PREPARATION)
              </h2>
              <div className="space-y-4 bg-white p-4 border-2 border-blue-400">
                {/* Show preparation phase steps */}
                {stepsByPhase.immediate.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-red-700 mb-3" style={{ fontSize: '1.125rem' }}>
                      🔴 {phaseConfig.immediate.label}
                    </h3>
                    {stepsByPhase.immediate.slice(0, 3).map((step, idx) => {
                      const stepCost = calculateStepCost(step)
                      const stepTitle = getStringValue(step.smeAction || step.title)
                      return (
                        <div key={step.id} className="flex items-start gap-4 mb-3">
                          <input type="checkbox" className="w-8 h-8 mt-1 flex-shrink-0" style={{ width: '2rem', height: '2rem' }} disabled />
                          <div className="flex-1">
                            <p className="text-lg font-bold mb-2" style={{ fontSize: '1.125rem' }}>
                              {stepTitle}
                            </p>
                            <div className="text-base space-y-1" style={{ fontSize: '1rem' }}>
                              <div>
                                Cost: {stepCost > 0 ? `${currencySymbol}${formatCurrency(stepCost)}` : '$________'} | 
                                Due Date: _____________ | 
                                Responsible: _____________
                              </div>
                              {step.checklist && step.checklist.length > 0 && (
                                <div className="mt-2 ml-4 space-y-1 text-sm" style={{ fontSize: '0.875rem' }}>
                                  {step.checklist.slice(0, 2).map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <span className="text-blue-600">▪</span>
                                      <span>{getStringValue(item)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="mt-2 border-t pt-2">
                                <strong>Notes:</strong>
                                <div className="border border-gray-300 p-2 min-h-[40px] bg-gray-50 mt-1">
                                  _________________________________________________________________
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {stepsByPhase.short_term.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-orange-700 mb-3" style={{ fontSize: '1.125rem' }}>
                      🟠 {phaseConfig.short_term.label}
                    </h3>
                    {stepsByPhase.short_term.slice(0, 3).map((step, idx) => {
                      const stepCost = calculateStepCost(step)
                      const stepTitle = getStringValue(step.smeAction || step.title)
                      return (
                        <div key={step.id} className="flex items-start gap-4 mb-3">
                          <input type="checkbox" className="w-8 h-8 mt-1 flex-shrink-0" style={{ width: '2rem', height: '2rem' }} disabled />
                          <div className="flex-1">
                            <p className="text-lg font-bold mb-2" style={{ fontSize: '1.125rem' }}>
                              {stepTitle}
                            </p>
                            <div className="text-base space-y-1" style={{ fontSize: '1rem' }}>
                              <div>
                                Cost: {stepCost > 0 ? `${currencySymbol}${formatCurrency(stepCost)}` : '$________'} | 
                                Due Date: _____________ | 
                                Responsible: _____________
                              </div>
                              {step.checklist && step.checklist.length > 0 && (
                                <div className="mt-2 ml-4 space-y-1 text-sm" style={{ fontSize: '0.875rem' }}>
                                  {step.checklist.slice(0, 2).map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <span className="text-blue-600">▪</span>
                                      <span>{getStringValue(item)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="mt-2 border-t pt-2">
                                <strong>Notes:</strong>
                                <div className="border border-gray-300 p-2 min-h-[40px] bg-gray-50 mt-1">
                                  _________________________________________________________________
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {allActionSteps.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-lg" style={{ fontSize: '1.125rem' }}>
                    <p>⚠️ No specific preparation steps available.</p>
                    <p className="text-base mt-2" style={{ fontSize: '1rem' }}>Add preparation actions for this risk above.</p>
                  </div>
                )}
              </div>
            </div>

            {/* DURING (RESPONSE) Section */}
            <div className="border-4 border-red-600 bg-red-50 p-6 mb-6">
              <h2 className="text-2xl font-black mb-4 text-red-900 flex items-center gap-2" style={{ fontSize: '1.5rem' }}>
                <span>🚨</span> DURING (IMMEDIATE RESPONSE)
              </h2>
              <div className="space-y-3 bg-white p-4 border-2 border-red-400">
                <div className="text-lg font-bold mb-3 text-red-900" style={{ fontSize: '1.125rem' }}>
                  DO THESE NOW - IN ORDER:
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-black text-red-600 w-8">1.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input type="checkbox" className="w-8 h-8" style={{ width: '2rem', height: '2rem' }} disabled />
                      <span className="text-lg font-bold" style={{ fontSize: '1.125rem' }}>Ensure safety of all personnel</span>
                    </div>
                    <div className="ml-11 space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                        <span className="text-base" style={{ fontSize: '1rem' }}>Account for all staff members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                        <span className="text-base" style={{ fontSize: '1rem' }}>Move to assembly point if needed</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-2xl font-black text-red-600 w-8">2.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input type="checkbox" className="w-8 h-8" style={{ width: '2rem', height: '2rem' }} disabled />
                      <span className="text-lg font-bold" style={{ fontSize: '1.125rem' }}>Contact emergency services if needed</span>
                    </div>
                    <div className="ml-11">
                      <div className="text-base" style={{ fontSize: '1rem' }}>
                        Called: _______ Time: _______ Spoke to: _______________________
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-2xl font-black text-red-600 w-8">3.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input type="checkbox" className="w-8 h-8" style={{ width: '2rem', height: '2rem' }} disabled />
                      <span className="text-lg font-bold" style={{ fontSize: '1.125rem' }}>Secure critical assets and documents</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AFTER (RECOVERY) Section */}
            <div className="border-4 border-green-600 bg-green-50 p-6 mb-6">
              <h2 className="text-2xl font-black mb-4 text-green-900 flex items-center gap-2" style={{ fontSize: '1.5rem' }}>
                <span>🔄</span> AFTER (RECOVERY)
              </h2>
              <div className="space-y-4 bg-white p-4 border-2 border-green-400">
                <div>
                  <h3 className="text-lg font-black mb-3 text-green-900 flex items-center gap-2" style={{ fontSize: '1.125rem' }}>
                    <span>⚡</span> IMMEDIATE (Day 1-3)
                  </h3>
                  <div className="space-y-2 ml-8">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-7 h-7" style={{ width: '1.75rem', height: '1.75rem' }} disabled />
                      <span className="text-base" style={{ fontSize: '1rem' }}>Assess damage and document with photos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-7 h-7" style={{ width: '1.75rem', height: '1.75rem' }} disabled />
                      <span className="text-base" style={{ fontSize: '1rem' }}>Contact insurance company</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-7 h-7" style={{ width: '1.75rem', height: '1.75rem' }} disabled />
                      <span className="text-base" style={{ fontSize: '1rem' }}>Notify customers and key stakeholders</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black mb-3 text-green-900 flex items-center gap-2" style={{ fontSize: '1.125rem' }}>
                    <span>📅</span> SHORT-TERM (Week 1-4)
                  </h3>
                  <div className="space-y-2 ml-8">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-7 h-7" style={{ width: '1.75rem', height: '1.75rem' }} disabled />
                      <span className="text-base" style={{ fontSize: '1rem' }}>Begin repairs and cleanup</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-7 h-7" style={{ width: '1.75rem', height: '1.75rem' }} disabled />
                      <span className="text-base" style={{ fontSize: '1rem' }}>Resume critical operations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-7 h-7" style={{ width: '1.75rem', height: '1.75rem' }} disabled />
                      <span className="text-base" style={{ fontSize: '1rem' }}>Support staff recovery needs</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black mb-3 text-green-900 flex items-center gap-2" style={{ fontSize: '1.125rem' }}>
                    <span>🎯</span> LONG-TERM (Month 1-6)
                  </h3>
                  <div className="space-y-2 ml-8">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-7 h-7" style={{ width: '1.75rem', height: '1.75rem' }} disabled />
                      <span className="text-base" style={{ fontSize: '1rem' }}>Complete all repairs and improvements</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-7 h-7" style={{ width: '1.75rem', height: '1.75rem' }} disabled />
                      <span className="text-base" style={{ fontSize: '1rem' }}>Review and update this plan based on lessons learned</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-7 h-7" style={{ width: '1.75rem', height: '1.75rem' }} disabled />
                      <span className="text-base" style={{ fontSize: '1rem' }}>Return to full normal operations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="border-4 border-gray-600 p-6">
              <h3 className="text-xl font-black mb-3" style={{ fontSize: '1.25rem' }}>
                📝 NOTES / LESSONS LEARNED
              </h3>
              <div className="border-2 border-gray-400 p-4 bg-gray-50 min-h-[150px]">
                <div className="space-y-2 text-base text-gray-400" style={{ fontSize: '1rem' }}>
                  <div>_________________________________________________________________</div>
                  <div>_________________________________________________________________</div>
                  <div>_________________________________________________________________</div>
                  <div>_________________________________________________________________</div>
                  <div>_________________________________________________________________</div>
                </div>
              </div>
            </div>

            {/* Page Footer */}
            <div className="mt-6 pt-4 border-t-2 border-gray-400 text-center">
              <p className="text-base text-gray-600" style={{ fontSize: '1rem' }}>
                <strong>Page {3 + riskIdx} of {5 + risks.length + strategies.length}</strong> | {companyName} | Risk: {hazardName}
              </p>
            </div>
          </div>
        )
      })}

      {/* BUDGET WORKSHEETS */}
      <div className="p-8 page-break-after border-b-4 border-gray-900" style={{ minHeight: '11in' }}>
        <div className="border-4 border-black p-2 mb-6">
          <h1 className="text-4xl font-black text-center text-green-600" style={{ fontSize: '2.5rem' }}>
            💰 BUDGET PLANNING WORKSHEET
          </h1>
        </div>

        {/* Budget Tier Selection */}
        <div className="border-4 border-green-600 bg-green-50 p-6 mb-6">
          <h2 className="text-2xl font-black mb-4 text-green-900" style={{ fontSize: '1.5rem' }}>
            SELECT YOUR BUDGET TIER
          </h2>
          <div className="space-y-4">
            <div className="border-4 border-gray-400 bg-white p-4">
              <div className="flex items-center gap-4 mb-2">
                <input type="radio" name="budget" className="w-8 h-8" style={{ width: '2rem', height: '2rem' }} disabled />
                <div>
                  <h3 className="text-xl font-bold" style={{ fontSize: '1.25rem' }}>BUDGET TIER (60%)</h3>
                  <p className="text-3xl font-black text-green-600 mt-2" style={{ fontSize: '2rem' }}>
                    {currencySymbol}{formatCurrency(Math.round(totalInvestment * 0.6))}
                  </p>
                  <p className="text-lg mt-2" style={{ fontSize: '1.125rem' }}>Basic protection with DIY options</p>
                </div>
              </div>
            </div>

            <div className="border-4 border-blue-600 bg-blue-50 p-4">
              <div className="flex items-center gap-4 mb-2">
                <input type="radio" name="budget" className="w-8 h-8" style={{ width: '2rem', height: '2rem' }} defaultChecked disabled />
                <div>
                  <h3 className="text-xl font-bold text-blue-900" style={{ fontSize: '1.25rem' }}>STANDARD TIER (100%)</h3>
                  <p className="text-3xl font-black text-blue-600 mt-2" style={{ fontSize: '2rem' }}>
                    {currencySymbol}{formatCurrency(totalInvestment)}
                  </p>
                  <p className="text-lg mt-2 text-blue-800" style={{ fontSize: '1.125rem' }}>
                    ⭐ Recommended for most businesses
                  </p>
                </div>
              </div>
            </div>

            <div className="border-4 border-gray-400 bg-white p-4">
              <div className="flex items-center gap-4 mb-2">
                <input type="radio" name="budget" className="w-8 h-8" style={{ width: '2rem', height: '2rem' }} disabled />
                <div>
                  <h3 className="text-xl font-bold" style={{ fontSize: '1.25rem' }}>PREMIUM TIER (150%)</h3>
                  <p className="text-3xl font-black text-green-600 mt-2" style={{ fontSize: '2rem' }}>
                    {currencySymbol}{formatCurrency(Math.round(totalInvestment * 1.5))}
                  </p>
                  <p className="text-lg mt-2" style={{ fontSize: '1.125rem' }}>Comprehensive protection</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Tracker */}
        <div className="border-4 border-blue-600 bg-white p-6">
          <h2 className="text-2xl font-black mb-4" style={{ fontSize: '1.5rem' }}>
            📊 EXPENSE TRACKER
          </h2>
          <table className="w-full border-2 border-gray-600" style={{ fontSize: '1rem' }}>
            <thead>
              <tr className="bg-gray-200">
                <th className="border-2 border-gray-600 p-3 text-left" style={{ width: '5%' }}>✓</th>
                <th className="border-2 border-gray-600 p-3 text-left" style={{ width: '35%' }}>ITEM / STRATEGY</th>
                <th className="border-2 border-gray-600 p-3 text-left" style={{ width: '20%' }}>ESTIMATED</th>
                <th className="border-2 border-gray-600 p-3 text-left" style={{ width: '20%' }}>ACTUAL</th>
                <th className="border-2 border-gray-600 p-3 text-left" style={{ width: '20%' }}>PAID?</th>
              </tr>
            </thead>
            <tbody className="text-base" style={{ fontSize: '1rem' }}>
              {/* Show actual strategies */}
              {strategies.slice(0, 8).map((strategy, idx) => {
                const strategyName = getStringValue(strategy.smeTitle || strategy.name)
                const estimatedCost = strategy.calculatedCostLocal || 0
                return (
                  <tr key={strategy.id}>
                    <td className="border-2 border-gray-600 p-3 text-center">
                      <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                    </td>
                    <td className="border-2 border-gray-600 p-3">
                      <div className="font-semibold">{strategyName}</div>
                    </td>
                    <td className="border-2 border-gray-600 p-3">
                      {estimatedCost > 0 ? (
                        <div className="font-mono">{currencySymbol}{formatCurrency(estimatedCost)}</div>
                      ) : (
                        <div className="border-b-2 border-gray-400">$________</div>
                      )}
                    </td>
                    <td className="border-2 border-gray-600 p-3">
                      <div className="border-b-2 border-gray-400">$________</div>
                    </td>
                    <td className="border-2 border-gray-600 p-3 text-center">
                      <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                    </td>
                  </tr>
                )
              })}
              {/* Add blank rows if fewer than 8 strategies */}
              {strategies.length < 8 && [...Array(8 - strategies.length)].map((_, idx) => (
                <tr key={`blank-${idx}`}>
                  <td className="border-2 border-gray-600 p-3 text-center">
                    <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                  </td>
                  <td className="border-2 border-gray-600 p-3">
                    <div className="border-b-2 border-gray-400">_________________</div>
                  </td>
                  <td className="border-2 border-gray-600 p-3">
                    <div className="border-b-2 border-gray-400">$________</div>
                  </td>
                  <td className="border-2 border-gray-600 p-3">
                    <div className="border-b-2 border-gray-400">$________</div>
                  </td>
                  <td className="border-2 border-gray-600 p-3 text-center">
                    <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={2} className="border-2 border-gray-600 p-3 text-right text-lg" style={{ fontSize: '1.125rem' }}>
                  TOTAL:
                </td>
                <td className="border-2 border-gray-600 p-3">
                  {totalInvestment > 0 ? (
                    <div className="font-mono text-lg" style={{ fontSize: '1.125rem' }}>
                      {currencySymbol}{formatCurrency(totalInvestment)}
                    </div>
                  ) : (
                    <div className="border-b-2 border-gray-600 text-lg" style={{ fontSize: '1.125rem' }}>$________</div>
                  )}
                </td>
                <td className="border-2 border-gray-600 p-3">
                  <div className="border-b-2 border-gray-600 text-lg" style={{ fontSize: '1.125rem' }}>$________</div>
                </td>
                <td className="border-2 border-gray-600 p-3"></td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 space-y-3 text-lg" style={{ fontSize: '1.125rem' }}>
            <div className="flex justify-between border-b-2 border-gray-400 pb-2">
              <strong>Remaining Budget:</strong>
              <span className="font-mono text-xl">$______________</span>
            </div>
            <div className="flex justify-between border-b-2 border-gray-400 pb-2">
              <strong>Payment Method:</strong>
              <span className="border-b-2 border-gray-400 flex-1 ml-4">_________________</span>
            </div>
            <div className="flex justify-between border-b-2 border-gray-400 pb-2">
              <strong>Receipt Location:</strong>
              <span className="border-b-2 border-gray-400 flex-1 ml-4">_________________</span>
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <div className="mt-6 pt-4 border-t-2 border-gray-400 text-center">
          <p className="text-base text-gray-600" style={{ fontSize: '1rem' }}>
            <strong>Page {3 + risks.length} of {5 + risks.length + strategies.length}</strong> | {companyName} | Budget Planning
          </p>
        </div>
      </div>

      {/* PROGRESS TRACKERS */}
      <div className="p-8 page-break-after border-b-4 border-gray-900" style={{ minHeight: '11in' }}>
        <div className="border-4 border-black p-2 mb-6">
          <h1 className="text-4xl font-black text-center text-purple-600" style={{ fontSize: '2.5rem' }}>
            📊 PROGRESS TRACKERS
          </h1>
        </div>

        {/* Monthly Testing Checklist */}
        <div className="border-4 border-purple-600 bg-purple-50 p-6 mb-6">
          <h2 className="text-2xl font-black mb-4 text-purple-900" style={{ fontSize: '1.5rem' }}>
            📅 MONTHLY TESTING CHECKLIST
          </h2>
          <div className="bg-white p-4 border-2 border-purple-400">
            <div className="space-y-3">
              {['January', 'February', 'March', 'April', 'May', 'June'].map((month) => (
                <div key={month} className="border-2 border-gray-400 p-3">
                  <div className="flex items-center gap-4 mb-2">
                    <input type="checkbox" className="w-8 h-8" style={{ width: '2rem', height: '2rem' }} disabled />
                    <h3 className="text-xl font-bold" style={{ fontSize: '1.25rem' }}>{month} 2024</h3>
                  </div>
                  <div className="ml-12 space-y-2 text-base" style={{ fontSize: '1rem' }}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                      <span>Verified emergency contacts</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                      <span>Tested backup systems</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                      <span>Checked emergency supplies</span>
                    </div>
                    <div className="mt-2">
                      <strong>Completed by:</strong> ______________ <strong>Date:</strong> __________
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <div className="mt-6 pt-4 border-t-2 border-gray-400 text-center">
          <p className="text-base text-gray-600" style={{ fontSize: '1rem' }}>
            <strong>Page {4 + risks.length} of {5 + risks.length + strategies.length}</strong> | {companyName} | Progress Tracking
          </p>
        </div>
      </div>

      {/* VITAL DOCUMENTS LOCATOR */}
      <div className="p-8 page-break-after border-b-4 border-gray-900" style={{ minHeight: '11in' }}>
        <div className="border-4 border-black p-2 mb-6">
          <h1 className="text-4xl font-black text-center text-indigo-600" style={{ fontSize: '2.5rem' }}>
            📁 VITAL DOCUMENTS LOCATOR
          </h1>
        </div>

        <div className="bg-yellow-100 border-4 border-yellow-600 p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-xl font-black text-yellow-900 mb-2" style={{ fontSize: '1.25rem' }}>
                CRITICAL: Know Where Everything Is!
              </h3>
              <p className="text-lg text-yellow-800" style={{ fontSize: '1.125rem' }}>
                In a crisis, you need to find documents FAST. Fill this out completely.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { name: 'Business License', icon: '📜' },
            { name: 'Insurance Policies', icon: '🛡️' },
            { name: 'Property Deeds / Lease Agreement', icon: '🏢' },
            { name: 'Bank Account Information', icon: '🏦' },
            { name: 'Employee Records', icon: '👥' },
            { name: 'Financial Records (Tax Returns)', icon: '💰' },
            { name: 'Customer/Client Lists', icon: '📋' },
            { name: 'Supplier Contracts', icon: '📝' },
            { name: 'IT System Passwords & Access', icon: '🔐' },
            { name: 'Building Plans / Utility Shutoffs', icon: '🗺️' }
          ].map((doc, idx) => (
            <div key={idx} className="border-4 border-gray-600 p-4 bg-white">
              <div className="flex items-center gap-4 mb-3">
                <input type="checkbox" className="w-8 h-8" style={{ width: '2rem', height: '2rem' }} disabled />
                <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
                  <span className="text-2xl">{doc.icon}</span>
                  {doc.name}
                </h3>
              </div>
              <div className="ml-12 space-y-2 text-base" style={{ fontSize: '1rem' }}>
                <div>
                  <strong>Physical Location:</strong>
                  <div className="border-b-2 border-gray-400 mt-1">
                    ___________________________________________________________________
                  </div>
                </div>
                <div>
                  <strong>Digital Backup Location:</strong>
                  <div className="border-b-2 border-gray-400 mt-1">
                    ___________________________________________________________________
                  </div>
                </div>
                <div>
                  <strong>Who Has Access:</strong>
                  <div className="border-b-2 border-gray-400 mt-1">
                    ___________________________________________________________________
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Page Footer */}
        <div className="mt-6 pt-4 border-t-2 border-gray-400 text-center">
          <p className="text-base text-gray-600" style={{ fontSize: '1rem' }}>
            <strong>Page {5 + risks.length} of {5 + risks.length + strategies.length}</strong> | {companyName} | Documents
          </p>
        </div>
      </div>

      {/* INCIDENT LOG TEMPLATES (3 Blank Forms) */}
      {[1, 2, 3].map((formNum) => (
        <div key={formNum} className="p-8 page-break-after border-b-4 border-gray-900" style={{ minHeight: '11in' }}>
          <div className="border-4 border-black p-2 mb-6">
            <h1 className="text-4xl font-black text-center text-red-600" style={{ fontSize: '2.5rem' }}>
              📋 INCIDENT LOG #{formNum}
            </h1>
          </div>

          <div className="border-4 border-red-600 bg-white p-6">
            <div className="space-y-6 text-lg" style={{ fontSize: '1.125rem' }}>
              <div>
                <strong className="text-xl block mb-2" style={{ fontSize: '1.25rem' }}>DATE & TIME OF INCIDENT:</strong>
                <div className="border-2 border-gray-600 p-3 bg-gray-50">
                  Date: _________________ Time: _________________
                </div>
              </div>

              <div>
                <strong className="text-xl block mb-2" style={{ fontSize: '1.25rem' }}>TYPE OF INCIDENT:</strong>
                <div className="border-2 border-gray-600 p-3 bg-gray-50 grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                    <span>Hurricane</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                    <span>Flood</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                    <span>Fire</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                    <span>Power Outage</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                    <span>Earthquake</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} disabled />
                    <span>Other: _______</span>
                  </label>
                </div>
              </div>

              <div>
                <strong className="text-xl block mb-2" style={{ fontSize: '1.25rem' }}>DESCRIPTION OF WHAT HAPPENED:</strong>
                <div className="border-2 border-gray-600 p-3 bg-gray-50 min-h-[150px]">
                  <div className="space-y-2 text-gray-400">
                    <div>_________________________________________________________________</div>
                    <div>_________________________________________________________________</div>
                    <div>_________________________________________________________________</div>
                    <div>_________________________________________________________________</div>
                    <div>_________________________________________________________________</div>
                  </div>
                </div>
              </div>

              <div>
                <strong className="text-xl block mb-2" style={{ fontSize: '1.25rem' }}>IMMEDIATE ACTIONS TAKEN:</strong>
                <div className="border-2 border-gray-600 p-3 bg-gray-50 min-h-[120px]">
                  <div className="space-y-2 text-gray-400">
                    <div>_________________________________________________________________</div>
                    <div>_________________________________________________________________</div>
                    <div>_________________________________________________________________</div>
                    <div>_________________________________________________________________</div>
                  </div>
                </div>
              </div>

              <div>
                <strong className="text-xl block mb-2" style={{ fontSize: '1.25rem' }}>DAMAGE ASSESSMENT:</strong>
                <div className="border-2 border-gray-600 p-3 bg-gray-50">
                  <div className="space-y-2">
                    <div>Property Damage: □ None  □ Minor  □ Moderate  □ Severe</div>
                    <div>Equipment Damage: □ None  □ Minor  □ Moderate  □ Severe</div>
                    <div>Injuries: □ None  □ Yes (describe): _____________________</div>
                    <div>Estimated Cost: $______________</div>
                  </div>
                </div>
              </div>

              <div>
                <strong className="text-xl block mb-2" style={{ fontSize: '1.25rem' }}>RECOVERY COST TRACKER:</strong>
                <div className="border-2 border-gray-600 p-3 bg-gray-50">
                  <div className="space-y-2">
                    <div>Insurance Claim Filed: □ Yes  □ No  Claim #: __________</div>
                    <div>Total Repair Costs: $______________</div>
                    <div>Insurance Payout: $______________</div>
                    <div>Out of Pocket: $______________</div>
                  </div>
                </div>
              </div>

              <div>
                <strong className="text-xl block mb-2" style={{ fontSize: '1.25rem' }}>COMPLETED BY:</strong>
                <div className="border-2 border-gray-600 p-3 bg-gray-50">
                  <div>Name: _______________________ Signature: _______________________</div>
                  <div className="mt-2">Date: _______________________</div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Footer */}
          <div className="mt-6 pt-4 border-t-2 border-gray-400 text-center">
            <p className="text-base text-gray-600" style={{ fontSize: '1rem' }}>
              <strong>Page {5 + risks.length + formNum} of {5 + risks.length + strategies.length}</strong> | {companyName} | Incident Log
            </p>
          </div>
        </div>
      ))}

      {/* FINAL FOOTER */}
      <div className="p-8 border-t-4 border-gray-900">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-gray-900" style={{ fontSize: '2rem' }}>
            END OF CRISIS ACTION WORKBOOK
          </h2>
          <p className="text-xl text-gray-700" style={{ fontSize: '1.25rem' }}>
            {companyName}
          </p>
          <p className="text-lg text-gray-600" style={{ fontSize: '1.125rem' }}>
            Last Updated: {currentDate}
          </p>
          <div className="mt-8 pt-6 border-t-2 border-gray-400">
            <p className="text-base text-gray-500" style={{ fontSize: '1rem' }}>
              UNDP x CARICHAM Business Continuity Planning Initiative
            </p>
            <p className="text-sm text-gray-400 mt-2" style={{ fontSize: '0.875rem' }}>
              Supporting Caribbean businesses in building resilience
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

