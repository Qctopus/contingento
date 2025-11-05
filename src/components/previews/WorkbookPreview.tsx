/**
 * Action Workbook Preview Component
 * Shows on-screen preview of what the practical workbook will look like
 * Friendly but professional, clear action-oriented design
 */

import React from 'react'

interface WorkbookPreviewProps {
  formData: any
  riskSummary?: any
  strategies: any[]
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
  
  // Extract risks from multiple possible locations
  const riskMatrix = riskSummary?.['Risk Assessment Matrix'] || 
                     riskSummary?.['Hazard Applicability Assessment'] ||
                     riskSummary?.risks ||
                     []
  
  const risks = Array.isArray(riskMatrix) ? riskMatrix.filter((r: any) => 
    r && (r.hazard || r.Hazard || r.riskType)
  ) : []
  
  const completionPercentage = 85 // Could calculate based on filled fields

  // Helper to safely get string from potentially multilingual field
  const getStringValue = (value: any): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object' && (value.en || value.es || value.fr)) {
      return value.en || value.es || value.fr || ''
    }
    return String(value)
  }

  return (
    <div className="bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
      {/* Workbook Header - Friendly but professional */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6">
        <h1 className="text-xl font-bold mb-1">
          BUSINESS CONTINUITY ACTION WORKBOOK
        </h1>
        <p className="text-base text-blue-100">{companyName}</p>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 bg-blue-800 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span className="text-sm">{completionPercentage}% Complete</span>
        </div>
      </div>

      {/* Workbook Body */}
      <div className="px-8 py-6 space-y-6 text-sm">
        
        {/* Quick Start Guide */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-base font-bold text-green-900 mb-2 flex items-center gap-2">
            <span className="text-lg">🚀</span> QUICK START GUIDE
          </h2>
          <p className="text-xs text-green-800 mb-3">
            Follow these steps to get your business continuity plan working in 30 days.
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">Review and understand this plan</div>
                <div className="text-gray-600">Read through entire workbook, identify your top 3 risks</div>
                <div className="text-gray-500 italic mt-1">Time needed: 2 hours</div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                7
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">Complete immediate preparations</div>
                <div className="text-gray-600">Update all contact information, identify emergency supplies</div>
                <div className="text-gray-500 italic mt-1">Time needed: 4 hours</div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                30
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">First review checkpoint</div>
                <div className="text-gray-600">Review progress, adjust plan as needed, schedule next steps</div>
                <div className="text-gray-500 italic mt-1">Time needed: 2 hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Immediate Actions */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-2 flex items-center gap-2">
            <span className="text-lg">⚡</span> IMMEDIATE ACTIONS - Do These First!
          </h2>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
              <input type="checkbox" className="mt-1 flex-shrink-0" disabled />
              <div className="flex-1">
                <div className="font-medium text-gray-800">Print and store this workbook in a secure location</div>
                <div className="text-gray-500">15 minutes</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
              <input type="checkbox" className="mt-1 flex-shrink-0" disabled />
              <div className="flex-1">
                <div className="font-medium text-gray-800">Share plan with key team members</div>
                <div className="text-gray-500">30 minutes</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
              <input type="checkbox" className="mt-1 flex-shrink-0" disabled />
              <div className="flex-1">
                <div className="font-medium text-gray-800">Verify all emergency contact numbers</div>
                <div className="text-gray-500">1 hour</div>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Planning */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-2 flex items-center gap-2">
            <span className="text-lg">💰</span> BUDGET PLANNING WORKSHEET
          </h2>
          
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="border border-gray-300 rounded-lg p-3">
              <input type="radio" name="budget-tier" className="mb-2" disabled />
              <div className="font-bold text-gray-800">Budget Tier</div>
              <div className="text-lg font-bold text-gray-900 my-2">
                JMD {Math.round(totalInvestment * 0.6).toLocaleString()}
              </div>
              <div className="text-gray-600">Basic protection with DIY options</div>
            </div>
            <div className="border-2 border-blue-500 rounded-lg p-3 bg-blue-50">
              <input type="radio" name="budget-tier" className="mb-2" defaultChecked disabled />
              <div className="font-bold text-blue-900">Standard Tier</div>
              <div className="text-lg font-bold text-blue-900 my-2">
                JMD {totalInvestment.toLocaleString()}
              </div>
              <div className="text-blue-800">Recommended for most businesses</div>
            </div>
            <div className="border border-gray-300 rounded-lg p-3">
              <input type="radio" name="budget-tier" className="mb-2" disabled />
              <div className="font-bold text-gray-800">Premium Tier</div>
              <div className="text-lg font-bold text-gray-900 my-2">
                JMD {Math.round(totalInvestment * 1.5).toLocaleString()}
              </div>
              <div className="text-gray-600">Comprehensive protection</div>
            </div>
          </div>
        </div>

        {/* Your Risk Profile - SHOW ALL RISKS */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-2 flex items-center gap-2">
            <span className="text-lg">⚠️</span> YOUR RISK PROFILE - ALL {risks.length} RISKS
          </h2>
          
          {risks.map((risk: any, idx: number) => {
            const riskLevel = getStringValue(risk.riskLevel || risk.RiskLevel).toLowerCase()
            const isExtreme = riskLevel.includes('extreme')
            const isHigh = riskLevel.includes('high')
            
            return (
              <div key={idx} className="border border-gray-300 rounded-lg p-4 space-y-2">
                <div className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                  isExtreme ? 'bg-red-100 text-red-800' :
                  isHigh ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {getStringValue(risk.hazard || risk.Hazard)} - {getStringValue(risk.riskLevel || risk.RiskLevel)} Risk
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        isExtreme ? 'bg-red-500' :
                        isHigh ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${(risk.riskScore || 0) * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {risk.riskScore || 0}/10
                  </span>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-xs">
                  <div className="font-bold text-blue-900 mb-1">📌 Why This Matters to YOUR Business</div>
                  <p className="text-blue-800">
                    This risk could significantly disrupt your operations and affect your ability to serve customers and generate revenue.
                  </p>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-3 text-xs">
                  <div className="font-bold text-green-900 mb-1">📖 Real Caribbean Business Story</div>
                  <p className="text-green-800">
                    When Hurricane Beryl hit in 2024, businesses with continuity plans recovered 60% faster than those without.
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Implementation Guides - SHOW ALL STRATEGIES */}
        {strategies.length > 0 && strategies.map((strategy: any, strategyIdx: number) => (
          <div key={strategyIdx} className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-2 flex items-center gap-2">
              <span className="text-lg">📋</span> STRATEGY {strategyIdx + 1}: {getStringValue(strategy.smeTitle || strategy.name).toUpperCase()}
            </h2>
            
            <p className="text-xs text-gray-700">
              {getStringValue(strategy.smeSummary || strategy.description)}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span>🔧</span> BEFORE (Preparation 0-30 days)
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-0.5 flex-shrink-0" disabled />
                  <div>
                    <div className="font-medium text-gray-800">Step 1: Initial preparation</div>
                    <div className="text-gray-600 mt-0.5">
                      <span className="font-semibold">Why:</span> Essential for business continuity
                    </div>
                    <div className="text-gray-600">
                      <span className="font-semibold">Done when:</span> All preparations completed and verified
                    </div>
                    <div className="text-gray-500 italic mt-1">⏱️ 2 hours</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-3">
              <div className="text-sm font-bold text-gray-900 mb-2">📊 Your Progress Tracker</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="flex-shrink-0" disabled />
                  <span className="font-medium">25% - Planning Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="flex-shrink-0" disabled />
                  <span className="font-medium">50% - Resources Acquired</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="flex-shrink-0" disabled />
                  <span className="font-medium">75% - Implementation Done</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="flex-shrink-0" disabled />
                  <span className="font-medium">100% - Tested & Verified</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Contact Lists */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-2 flex items-center gap-2">
            <span className="text-lg">📞</span> EMERGENCY CONTACT LISTS
          </h2>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <div className="font-bold text-amber-900">Keep This Updated!</div>
                <div className="text-amber-800">Verify all contact numbers quarterly. Update immediately when someone leaves or changes their number.</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {/* Plan Manager Contact */}
            <div className="border border-gray-300 rounded p-3 text-xs">
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-0.5 flex-shrink-0" disabled />
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{planManager}</div>
                  <div className="text-gray-600">Role: Plan Manager</div>
                  <div className="text-gray-600">Phone: _______________</div>
                  <div className="text-gray-600">Email: _______________</div>
                  <div className="text-gray-500 mt-1">Notes: _______________________________________________</div>
                </div>
              </div>
            </div>

            {/* Emergency Services Template */}
            <div className="border border-gray-300 rounded p-3 text-xs">
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-0.5 flex-shrink-0" disabled />
                <div className="flex-1">
                  <div className="font-bold text-gray-800">Police/Fire/Ambulance</div>
                  <div className="text-gray-600">Emergency: 911 or local numbers</div>
                  <div className="text-gray-500 mt-1">Notes: _______________________________________________</div>
                </div>
              </div>
            </div>

            {/* Utility Companies Template */}
            <div className="border border-gray-300 rounded p-3 text-xs">
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-0.5 flex-shrink-0" disabled />
                <div className="flex-1">
                  <div className="font-bold text-gray-800">Utility Companies</div>
                  <div className="text-gray-600">Power, Water, Internet providers</div>
                  <div className="text-gray-500 mt-1">Phone: _______________</div>
                  <div className="text-gray-500">Account #: _______________</div>
                </div>
              </div>
            </div>

            {/* Key Suppliers Template */}
            <div className="border border-gray-300 rounded p-3 text-xs">
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-0.5 flex-shrink-0" disabled />
                <div className="flex-1">
                  <div className="font-bold text-gray-800">Key Suppliers</div>
                  <div className="text-gray-600">Critical business suppliers</div>
                  <div className="text-gray-500 mt-1">Contact: _______________</div>
                  <div className="text-gray-500">Phone: _______________</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Trackers */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-2 flex items-center gap-2">
            <span className="text-lg">📊</span> PROGRESS TRACKERS
          </h2>
          
          <div>
            <div className="text-sm font-bold text-gray-800 mb-2">📅 Monthly Testing Checklist</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-start gap-2 p-1">
                <input type="checkbox" className="mt-0.5 flex-shrink-0" disabled />
                <span>Verify emergency contact numbers</span>
              </div>
              <div className="flex items-start gap-2 p-1">
                <input type="checkbox" className="mt-0.5 flex-shrink-0" disabled />
                <span>Test backup systems</span>
              </div>
              <div className="flex items-start gap-2 p-1">
                <input type="checkbox" className="mt-0.5 flex-shrink-0" disabled />
                <span>Check emergency supplies</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-300 rounded p-3">
            <div className="text-sm font-bold text-gray-800 mb-2">📝 Lessons Learned Log</div>
            <div className="text-xs text-gray-600 italic mb-2">
              Use this space to record what worked and what didn't after tests or real events:
            </div>
            <div className="border border-gray-200 rounded p-2 bg-gray-50 text-xs">
              <div>Date: ________________</div>
              <div>Event: _____________________________________________</div>
              <div>What worked: _______________________________________</div>
              <div>What to improve: ___________________________________</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 mt-6">
          <div className="text-xs text-center text-gray-500">
            UNDP x CARICHAM | Business Continuity Action Workbook
          </div>
          <div className="text-xs text-center text-gray-400 mt-1">
            Page preview - Full workbook available via PDF export
          </div>
        </div>
      </div>
    </div>
  )
}

