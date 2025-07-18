'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface RiskItem {
  hazard: string
  likelihood: string
  severity: string
  riskLevel: string
  riskScore: number
  planningMeasures: string
}

interface RiskPortfolioSummaryProps {
  riskItems: RiskItem[]
  onUpdate: (riskItems: RiskItem[]) => void
  locationData?: {
    country?: string
    countryCode?: string
    parish?: string
    nearCoast?: boolean
    urbanArea?: boolean
  }
  businessData?: {
    industryType?: string
    businessPurpose?: string
    productsServices?: string
  }
}

export function RiskPortfolioSummary({
  riskItems,
  onUpdate,
  locationData,
  businessData
}: RiskPortfolioSummaryProps) {
  const [activeView, setActiveView] = useState<'overview' | 'priorities' | 'resources' | 'planning'>('overview')
  const t = useTranslations('common')

  // Calculate risk distribution
  const getRiskDistribution = () => {
    const distribution = {
      extreme: riskItems.filter(r => r.riskScore >= 12).length,
      high: riskItems.filter(r => r.riskScore >= 8 && r.riskScore < 12).length,
      medium: riskItems.filter(r => r.riskScore >= 3 && r.riskScore < 8).length,
      low: riskItems.filter(r => r.riskScore >= 1 && r.riskScore < 3).length,
      incomplete: riskItems.filter(r => !r.likelihood || !r.severity).length
    }
    return distribution
  }

  // Get priority risks (high and extreme)
  const getPriorityRisks = () => {
    return riskItems
      .filter(r => r.riskScore >= 8)
      .sort((a, b) => b.riskScore - a.riskScore)
  }

  // Get strategic recommendations based on risk portfolio
  const getStrategicRecommendations = () => {
    const priorityRisks = getPriorityRisks()
    const distribution = getRiskDistribution()
    const location = locationData?.parish || locationData?.country || 'your area'
    const business = businessData?.industryType || 'your business'

    const recommendations = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[]
    }

    // Immediate actions (0-30 days)
    if (distribution.extreme > 0) {
      recommendations.immediate.push(`🚨 URGENT: Address ${distribution.extreme} extreme risk(s) immediately - these could threaten business survival`)
    }
    if (distribution.high > 0) {
      recommendations.immediate.push(`⚠️ HIGH PRIORITY: Develop action plans for ${distribution.high} high-risk(s) within 30 days`)
    }
    
    // Check for common high-priority combinations
    const hasHurricaneRisk = priorityRisks.find(r => r.hazard.toLowerCase().includes('hurricane'))
    const hasPowerRisk = priorityRisks.find(r => r.hazard.toLowerCase().includes('power'))
    
    if (hasHurricaneRisk && hasPowerRisk) {
      recommendations.immediate.push('🔌 Install backup generator system - critical for hurricane season and power outages')
    }
    
    recommendations.immediate.push('📋 Create emergency contact list and communication plan')
    recommendations.immediate.push('💰 Set aside emergency funds (minimum 1 month operating expenses)')

    // Short-term actions (1-6 months)
    recommendations.shortTerm.push('🛡️ Implement prevention measures for your top 3 priority risks')
    recommendations.shortTerm.push('📚 Train all staff on emergency procedures and response protocols')
    recommendations.shortTerm.push('🤝 Establish relationships with backup suppliers and service providers')
    
    if (business === 'restaurant') {
      recommendations.shortTerm.push('🧊 Invest in food safety backup systems (generators, alternative cooling)')
    } else if (business === 'grocery_store') {
      recommendations.shortTerm.push('❄️ Upgrade refrigeration backup and inventory protection systems')
    }

    // Long-term actions (6+ months)
    recommendations.longTerm.push('🏗️ Consider business location and infrastructure improvements')
    recommendations.longTerm.push('📈 Diversify revenue streams to reduce vulnerability')
    recommendations.longTerm.push('🌍 Build community partnerships for mutual support during emergencies')
    recommendations.longTerm.push('🔄 Conduct annual risk assessment reviews and plan updates')

    return recommendations
  }

  // Get resource investment guidance
  const getResourceGuidance = () => {
    const distribution = getRiskDistribution()
    const totalRisks = riskItems.length
    const highPriorityCount = distribution.extreme + distribution.high
    
    const guidance = {
      budgetAllocation: {
        prevention: highPriorityCount > 2 ? 40 : 30,
        response: 30,
        recovery: 20,
        planning: 10
      },
      timeAllocation: {
        weekly: `${Math.max(2, highPriorityCount)} hours per week on business continuity activities`,
        monthly: `1 full day per month for plan review and testing`,
        annually: `2-3 days for comprehensive plan updates and training`
      },
      priorityOrder: [
        'Emergency communication systems',
        'Backup power/alternative energy',
        'Insurance review and updates',
        'Staff training and procedures',
        'Supplier diversification',
        'Financial reserves building'
      ]
    }
    
    return guidance
  }

  const distribution = getRiskDistribution()
  const priorityRisks = getPriorityRisks()
  const recommendations = getStrategicRecommendations()
  const resourceGuidance = getResourceGuidance()

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Risk Portfolio Dashboard */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-black text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{distribution.extreme}</div>
          <div className="text-sm opacity-90">Extreme Risk</div>
          {distribution.extreme > 0 && <div className="text-xs mt-1">IMMEDIATE ACTION</div>}
        </div>
        <div className="bg-red-600 text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{distribution.high}</div>
          <div className="text-sm opacity-90">High Risk</div>
          {distribution.high > 0 && <div className="text-xs mt-1">PRIORITY FOCUS</div>}
        </div>
        <div className="bg-yellow-500 text-black rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{distribution.medium}</div>
          <div className="text-sm opacity-90">Medium Risk</div>
          <div className="text-xs mt-1">MONITOR & PLAN</div>
        </div>
        <div className="bg-green-500 text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{distribution.low}</div>
          <div className="text-sm opacity-90">Low Risk</div>
          <div className="text-xs mt-1">BASIC PREP</div>
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Your Risk Portfolio Assessment</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Risk Profile</h4>
            <div className="space-y-2 text-sm">
              {distribution.extreme > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-black rounded-full"></span>
                  <span className="text-gray-700">Business-critical risks requiring immediate attention</span>
                </div>
              )}
              {distribution.high > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                  <span className="text-gray-700">Significant risks needing priority planning</span>
                </div>
              )}
              {distribution.medium > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span className="text-gray-700">Moderate risks for ongoing monitoring</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Well-positioned for lower-impact risks</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Recommendation</h4>
            <div className="text-sm text-gray-700">
              {distribution.extreme > 0 ? (
                <p className="font-semibold text-red-700">
                  🚨 Critical Action Required: Focus immediately on extreme risks to prevent business failure.
                </p>
              ) : distribution.high > 0 ? (
                <p className="font-semibold text-orange-700">
                  ⚠️ High Priority: Develop comprehensive plans for high-risk areas within 30 days.
                </p>
              ) : distribution.medium > 2 ? (
                <p className="font-semibold text-yellow-700">
                  📋 Balanced Approach: Multiple medium risks need systematic planning and monitoring.
                </p>
              ) : (
                <p className="font-semibold text-green-700">
                  ✅ Good Position: Your risk profile shows manageable threats with proper preparation.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Priority Risks */}
      {priorityRisks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Priority Focus Areas</h3>
          <div className="grid gap-4">
            {priorityRisks.slice(0, 3).map((risk, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      risk.riskScore >= 12 ? 'bg-black' : 'bg-red-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{risk.hazard}</h4>
                      <p className="text-sm text-gray-600">
                        {risk.riskLevel} Risk (Score: {risk.riskScore})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      risk.riskScore >= 12 
                        ? 'bg-black text-white'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {risk.riskScore >= 12 ? 'EXTREME' : 'HIGH'} PRIORITY
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderPriorities = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Strategic Action Priorities</h2>
        <p className="text-gray-600">Recommended timeline for addressing your risk portfolio</p>
      </div>

      {/* Immediate Actions */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">!</span>
          <h3 className="text-lg font-semibold text-red-900">Immediate Actions (0-30 days)</h3>
        </div>
        <ul className="space-y-2">
          {recommendations.immediate.map((action, index) => (
            <li key={index} className="flex items-start space-x-2 text-red-800">
              <span className="mt-1.5 w-1.5 h-1.5 bg-red-600 rounded-full flex-shrink-0"></span>
              <span className="text-sm">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Short-term Actions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
          <h3 className="text-lg font-semibold text-yellow-900">Short-term Actions (1-6 months)</h3>
        </div>
        <ul className="space-y-2">
          {recommendations.shortTerm.map((action, index) => (
            <li key={index} className="flex items-start space-x-2 text-yellow-800">
              <span className="mt-1.5 w-1.5 h-1.5 bg-yellow-600 rounded-full flex-shrink-0"></span>
              <span className="text-sm">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Long-term Actions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
          <h3 className="text-lg font-semibold text-green-900">Long-term Actions (6+ months)</h3>
        </div>
        <ul className="space-y-2">
          {recommendations.longTerm.map((action, index) => (
            <li key={index} className="flex items-start space-x-2 text-green-800">
              <span className="mt-1.5 w-1.5 h-1.5 bg-green-600 rounded-full flex-shrink-0"></span>
              <span className="text-sm">{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  const renderResources = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Resource Investment Guide</h2>
        <p className="text-gray-600">How to allocate your time and budget for maximum impact</p>
      </div>

      {/* Budget Allocation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Recommended Budget Allocation</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Prevention (Equipment, Systems)</span>
                <span className="text-sm font-bold text-blue-600">{resourceGuidance.budgetAllocation.prevention}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${resourceGuidance.budgetAllocation.prevention}%` }}></div>
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Response (Emergency Supplies)</span>
                <span className="text-sm font-bold text-orange-600">{resourceGuidance.budgetAllocation.response}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${resourceGuidance.budgetAllocation.response}%` }}></div>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Recovery (Insurance, Reserves)</span>
                <span className="text-sm font-bold text-green-600">{resourceGuidance.budgetAllocation.recovery}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${resourceGuidance.budgetAllocation.recovery}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Investment Priority Order</h4>
            {resourceGuidance.priorityOrder.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Investment */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">⏰ Time Investment Guide</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Weekly</div>
            <div className="text-sm text-blue-800">{resourceGuidance.timeAllocation.weekly}</div>
            <div className="text-xs text-blue-600 mt-1">Planning & monitoring</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Monthly</div>
            <div className="text-sm text-blue-800">{resourceGuidance.timeAllocation.monthly}</div>
            <div className="text-xs text-blue-600 mt-1">Testing & review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Annually</div>
            <div className="text-sm text-blue-800">{resourceGuidance.timeAllocation.annually}</div>
            <div className="text-xs text-blue-600 mt-1">Comprehensive updates</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPlanning = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Next Steps: Implementation Planning</h2>
        <p className="text-gray-600">Turn your risk assessment into actionable business continuity measures</p>
      </div>

      {/* Action Items by Risk */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Risk-Specific Action Plans</h3>
        <div className="space-y-4">
          {priorityRisks.slice(0, 3).map((risk, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  risk.riskScore >= 12 ? 'bg-black' : 'bg-red-600'
                }`}>
                  {index + 1}
                </span>
                <h4 className="font-semibold text-gray-900">{risk.hazard}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  risk.riskScore >= 12 ? 'bg-black text-white' : 'bg-red-100 text-red-800'
                }`}>
                  Score: {risk.riskScore}
                </span>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">🛡️ Prevention</h5>
                  <p className="text-gray-600">Implement early warning systems and protective measures</p>
                </div>
                <div>
                  <h5 className="font-medium text-orange-900 mb-1">⚡ Response</h5>
                  <p className="text-gray-600">Activate emergency procedures and protect people/assets</p>
                </div>
                <div>
                  <h5 className="font-medium text-green-900 mb-1">🔄 Recovery</h5>
                  <p className="text-gray-600">Restore operations and learn from the experience</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Checklist */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Implementation Checklist</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-green-900 mb-2">First 30 Days</h4>
            <div className="space-y-2 text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-green-800">Create emergency contact lists</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-green-800">Set up emergency fund (1 month expenses)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-green-800">Review and update insurance coverage</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-green-800">Train staff on emergency procedures</span>
              </label>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-green-900 mb-2">Next 90 Days</h4>
            <div className="space-y-2 text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-green-800">Install priority safety equipment</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-green-800">Establish backup supplier relationships</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-green-800">Create detailed response procedures</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-green-800">Test emergency communications</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Portfolio Overview', icon: '📊' },
            { id: 'priorities', label: 'Action Priorities', icon: '🎯' },
            { id: 'resources', label: 'Resource Guide', icon: '💰' },
            { id: 'planning', label: 'Implementation', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeView === 'overview' && renderOverview()}
      {activeView === 'priorities' && renderPriorities()}
      {activeView === 'resources' && renderResources()}
      {activeView === 'planning' && renderPlanning()}

      {/* Action Footer */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">🚀 Ready to Build Your Business Resilience?</h3>
        <p className="text-blue-100 mb-4">
          Your risk assessment is complete. Now it's time to implement your business continuity strategies.
        </p>
        <div className="flex justify-center space-x-4">
          <span className="text-sm text-blue-100">
            ✅ {riskItems.filter(r => r.likelihood && r.severity).length} risks assessed
          </span>
          <span className="text-sm text-blue-100">
            🎯 {priorityRisks.length} priority actions identified
          </span>
          <span className="text-sm text-blue-100">
            📋 Strategic roadmap ready
          </span>
        </div>
      </div>
    </div>
  )
} 