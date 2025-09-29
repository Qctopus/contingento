'use client'

import React, { useState, useEffect } from 'react'

interface Parish {
  id: string
  name: string
  region: string
  isCoastal: boolean
  isUrban: boolean
  riskProfile: {
    hurricane: { level: number; notes: string }
    flood: { level: number; notes: string }
    earthquake: { level: number; notes: string }
    drought: { level: number; notes: string }
    landslide: { level: number; notes: string }
    powerOutage: { level: number; notes: string }
  }
}

interface BusinessType {
  id: string
  businessTypeId: string
  name: string
  category: string
  touristDependency: number
  supplyChainComplexity: number
  digitalDependency: number
  physicalAssetIntensity: number
  seasonalityFactor: number
  
  // Risk exposure factors
  hurricaneVulnerability?: number
  floodVulnerability?: number
  earthquakeVulnerability?: number
  droughtVulnerability?: number
  landslideVulnerability?: number
  powerOutageVulnerability?: number
  
  hurricaneRecoveryImpact?: number
  floodRecoveryImpact?: number
  earthquakeRecoveryImpact?: number
  droughtRecoveryImpact?: number
  landslideRecoveryImpact?: number
  powerOutageRecoveryImpact?: number
  
  // Critical dependencies and assets
  essentialUtilities?: string[]
  typicalEquipment?: string[]
  keySupplierTypes?: Array<{name: string, criticality: string}>
  maximumDowntime?: string
}

// Removed BusinessRiskVulnerability interface - using direct properties now

interface CombinedRisk {
  riskType: string
  locationRisk: number
  businessVulnerability: number
  combinedScore: number
  impactSeverity: number
  reasoning: string
  recommendations: any[]
}

export function RiskCalculatorTab() {
  const [parishes, setParishes] = useState<Parish[]>([])
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [selectedParish, setSelectedParish] = useState<string>('')
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('')
  const [combinedRisks, setCombinedRisks] = useState<CombinedRisk[]>([])
  const [overallRiskScore, setOverallRiskScore] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [strategies, setStrategies] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedParish && selectedBusinessType) {
      calculateCombinedRisk()
    }
  }, [selectedParish, selectedBusinessType, parishes, businessTypes])

  const loadData = async () => {
    try {
      // Use centralized data service for loading all data
      const { centralDataService } = await import('../../services/centralDataService')
      
      const [parishData, businessData, strategyData] = await Promise.all([
        centralDataService.getParishes(),
        centralDataService.getBusinessTypes(),
        centralDataService.getStrategies()
      ])

      setParishes(parishData)
      setBusinessTypes(businessData)
      setStrategies(strategyData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateCombinedRisk = () => {
    const parish = parishes.find(p => p.id === selectedParish)
    const businessType = businessTypes.find(bt => bt.id === selectedBusinessType)

    if (!parish || !businessType) return

    const riskTypes = ['hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage']
    const calculatedRisks: CombinedRisk[] = []

    riskTypes.forEach(riskType => {
      const locationRisk = parish.riskProfile[riskType as keyof typeof parish.riskProfile]?.level || 0
      
      // Get vulnerability from direct properties
      const businessVulnerability = businessType[`${riskType}Vulnerability` as keyof BusinessType] as number || 5
      const recoveryImpact = businessType[`${riskType}RecoveryImpact` as keyof BusinessType] as number || 5

      // Calculate combined score (weighted average with multipliers)
      let combinedScore = (locationRisk * 0.6) + (businessVulnerability * 0.4)
      
      // Apply business characteristic multipliers
      if (parish.isCoastal && (riskType === 'hurricane' || riskType === 'flood')) {
        combinedScore *= 1.2
      }
      if (businessType.touristDependency > 7 && riskType === 'hurricane') {
        combinedScore *= 1.1
      }
      if (businessType.digitalDependency > 7 && riskType === 'powerOutage') {
        combinedScore *= 1.15
      }
      if (businessType.physicalAssetIntensity > 7 && (riskType === 'hurricane' || riskType === 'flood' || riskType === 'earthquake')) {
        combinedScore *= 1.1
      }
      if (businessType.seasonalityFactor > 7 && (riskType === 'hurricane' || riskType === 'drought')) {
        combinedScore *= 1.05
      }

      combinedScore = Math.min(10, combinedScore) // Cap at 10

      const recommendations = getRecommendationsForRisk(riskType, combinedScore, businessType.category)

      calculatedRisks.push({
        riskType,
        locationRisk,
        businessVulnerability,
        combinedScore: Number(combinedScore.toFixed(1)),
        impactSeverity: recoveryImpact,
        reasoning: `Business vulnerability: ${businessVulnerability}/10, Recovery impact: ${recoveryImpact}/10`,
        recommendations
      })
    })

    setCombinedRisks(calculatedRisks)
    
    // Calculate overall risk score
    const totalScore = calculatedRisks.reduce((sum, risk) => sum + risk.combinedScore, 0)
    setOverallRiskScore(Number((totalScore / calculatedRisks.length).toFixed(1)))
  }

  const getRecommendationsForRisk = (riskType: string, score: number, businessCategory: string): any[] => {
    const recommendations: any[] = []
    
    // Get relevant strategies for this risk type
    const relevantStrategies = strategies.filter(strategy => 
      strategy.applicableRisks.includes(riskType) && 
      (strategy.businessTypes.includes(businessCategory) || strategy.businessTypes.includes('all'))
    )

    // Sort strategies by priority and effectiveness
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const sortedStrategies = relevantStrategies.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1
      if (aPriority !== bPriority) return bPriority - aPriority
      return (b.effectiveness || 5) - (a.effectiveness || 5)
    })

    if (score >= 8) {
      recommendations.push({
        type: 'alert',
        message: '🚨 Critical risk level - implement emergency preparedness immediately',
        priority: 'critical'
      })
      // Add critical and high-priority strategies with full details
      sortedStrategies
        .filter(s => s.priority === 'critical' || s.priority === 'high')
        .slice(0, 3)
        .forEach(s => recommendations.push({
          type: 'strategy',
          strategy: s,
          message: `Critical: ${s.name}`,
          priority: s.priority
        }))
    } else if (score >= 6) {
      recommendations.push({
        type: 'alert',
        message: '⚠️ High risk level - prioritize mitigation strategies',
        priority: 'high'
      })
      sortedStrategies
        .filter(s => s.priority === 'high' || s.priority === 'medium')
        .slice(0, 2)
        .forEach(s => recommendations.push({
          type: 'strategy',
          strategy: s,
          message: `Priority: ${s.name}`,
          priority: s.priority
        }))
    } else if (score >= 4) {
      recommendations.push({
        type: 'alert',
        message: '📋 Medium risk level - implement preventive measures',
        priority: 'medium'
      })
      sortedStrategies
        .filter(s => s.category === 'prevention' || s.priority === 'medium')
        .slice(0, 2)
        .forEach(s => recommendations.push({
          type: 'strategy',
          strategy: s,
          message: `Recommended: ${s.name}`,
          priority: s.priority
        }))
    } else {
      recommendations.push({
        type: 'alert',
        message: '✅ Low risk level - maintain standard precautions',
        priority: 'low'
      })
      if (sortedStrategies.length > 0) {
        recommendations.push({
          type: 'strategy',
          strategy: sortedStrategies[0],
          message: `Optional: ${sortedStrategies[0].name}`,
          priority: sortedStrategies[0].priority
        })
      }
    }

    return recommendations
  }

  const getRiskColor = (score: number): string => {
    if (score >= 8) return 'bg-red-500'
    if (score >= 6) return 'bg-orange-500'
    if (score >= 4) return 'bg-yellow-500'
    if (score >= 2) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getRiskLabel = (score: number): string => {
    if (score >= 8) return 'Critical'
    if (score >= 6) return 'High'
    if (score >= 4) return 'Medium'
    if (score >= 2) return 'Low'
    return 'Very Low'
  }

  const riskLabels = {
    hurricane: 'Hurricane',
    flood: 'Flood', 
    earthquake: 'Earthquake',
    drought: 'Drought',
    landslide: 'Landslide',
    powerOutage: 'Power Outage'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calculator...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-light text-gray-900 tracking-tight mb-2">
          SME Risk Calculator
        </h2>
        <p className="text-lg font-light text-gray-600 mb-8">
          Interactive risk assessment combining parish location and business type data to generate customized risk profiles and strategy recommendations
        </p>
        
        {/* Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Parish Location
            </label>
            <select
              value={selectedParish}
              onChange={(e) => setSelectedParish(e.target.value)}
              className="admin-select"
            >
              <option value="">Choose a parish...</option>
              {parishes.map(parish => (
                <option key={parish.id} value={parish.id}>
                  {parish.name} ({parish.region})
                  {parish.isCoastal ? ' - Coastal' : ''}
                  {parish.isUrban ? ' - Urban' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Business Type
            </label>
            <select
              value={selectedBusinessType}
              onChange={(e) => setSelectedBusinessType(e.target.value)}
              className="admin-select"
            >
              <option value="">Choose a business type...</option>
              {businessTypes.map(bt => (
                <option key={bt.id} value={bt.id}>
                  {bt.name} ({bt.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {selectedParish && selectedBusinessType && combinedRisks.length > 0 && (
        <>
          {/* Overall Risk Score */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Overall Risk Assessment</h3>
              <div className="flex items-center justify-center space-x-4">
                <div className={`w-16 h-16 rounded-full ${getRiskColor(overallRiskScore)} flex items-center justify-center text-white text-xl font-bold`}>
                  {overallRiskScore}
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-gray-900">{getRiskLabel(overallRiskScore)} Risk</div>
                  <div className="text-gray-600">Combined risk score out of 10</div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Risk Breakdown by Type</h3>
            
            <div className="space-y-6">
              {combinedRisks
                .sort((a, b) => b.combinedScore - a.combinedScore)
                .map((risk, index) => (
                  <div key={risk.riskType} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 capitalize">
                            {risk.riskType.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </h4>
                          <p className="text-sm text-gray-600">{risk.reasoning}</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getRiskColor(risk.combinedScore)}`}>
                        {risk.combinedScore}/10 - {getRiskLabel(risk.combinedScore)}
                      </div>
                    </div>

                    {/* Risk Components */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 rounded p-3">
                        <div className="text-sm font-medium text-blue-800">Location Risk</div>
                        <div className="text-xl font-bold text-blue-900">{risk.locationRisk}/10</div>
                        <div className="text-xs text-blue-600">Environmental factors</div>
                      </div>
                      <div className="bg-purple-50 rounded p-3">
                        <div className="text-sm font-medium text-purple-800">Business Vulnerability</div>
                        <div className="text-xl font-bold text-purple-900">{risk.businessVulnerability}/10</div>
                        <div className="text-xs text-purple-600">Business type factors</div>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-sm font-medium text-gray-800">Impact Severity</div>
                        <div className="text-xl font-bold text-gray-900">{risk.impactSeverity}/10</div>
                        <div className="text-xs text-gray-600">Expected damage level</div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {risk.recommendations.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <h5 className="font-medium text-green-800 mb-3">📋 Recommended Actions</h5>
                        <div className="space-y-3">
                          {risk.recommendations.map((rec, idx) => (
                            <div key={idx}>
                              {rec.type === 'alert' ? (
                                <div className="text-sm text-green-700 font-medium mb-2">
                                  {rec.message}
                                </div>
                              ) : rec.type === 'strategy' ? (
                                <div className="border border-green-300 rounded-lg p-3 bg-white">
                                  <div className="flex items-start justify-between mb-2">
                                    <h6 className="font-semibold text-green-900">{rec.strategy.name}</h6>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                      rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {rec.priority}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">{rec.strategy.smeDescription || rec.strategy.description}</p>
                                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-2">
                                    <span>💰 Cost: {rec.strategy.implementationCost}</span>
                                    <span>⏱️ Time: {rec.strategy.timeToImplement}</span>
                                    <span>📊 Effectiveness: {rec.strategy.effectiveness}/10</span>
                                    <span>💹 ROI: {rec.strategy.roi}x</span>
                                  </div>
                                  {rec.strategy.actionSteps && rec.strategy.actionSteps.length > 0 && (
                                    <div className="mt-3">
                                      <div className="text-sm font-medium text-green-800 mb-2">📝 Implementation Steps:</div>
                                      <div className="space-y-2">
                                        {rec.strategy.actionSteps.slice(0, 3).map((step: any, stepIdx: number) => (
                                          <div key={stepIdx} className="bg-green-25 border-l-2 border-green-300 pl-3 py-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">
                                                {step.phase}
                                              </span>
                                              <span className="text-sm font-medium text-gray-900">{step.title}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{step.smeAction || step.action}</p>
                                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                              {step.timeframe && <span>⏰ {step.timeframe}</span>}
                                              {step.responsibility && <span>👤 {step.responsibility}</span>}
                                              {step.cost && <span>💰 {step.cost}</span>}
                                            </div>
                                          </div>
                                        ))}
                                        {rec.strategy.actionSteps.length > 3 && (
                                          <div className="text-xs text-gray-500 italic">
                                            + {rec.strategy.actionSteps.length - 3} more implementation steps
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-green-700">
                                  • {rec}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 Your Business Continuity Action Plan</h3>
            
            {(() => {
              // Gather all recommended strategies from all risks
              const allStrategies = combinedRisks
                .flatMap(risk => risk.recommendations.filter(rec => rec.type === 'strategy'))
                .sort((a, b) => {
                  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
                  return (priorityOrder[b.priority as keyof typeof priorityOrder] || 1) - 
                         (priorityOrder[a.priority as keyof typeof priorityOrder] || 1)
                })

              // Group by phase/timeframe
              const immediateActions = allStrategies.filter(s => 
                s.strategy.actionSteps?.some((step: any) => step.phase === 'immediate')
              ).slice(0, 3)
              
              const shortTermActions = allStrategies.filter(s => 
                s.strategy.actionSteps?.some((step: any) => step.phase === 'short_term')
              ).slice(0, 3)

              const priorityStrategies = allStrategies
                .filter(s => s.priority === 'critical' || s.priority === 'high')
                .slice(0, 4)

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                    <h4 className="font-medium text-blue-800 mb-3">🚀 Immediate Actions (Next 2 weeks)</h4>
                    <div className="space-y-3">
                      {immediateActions.length > 0 ? immediateActions.map((item, idx) => (
                        <div key={idx} className="bg-white border border-blue-200 rounded p-3">
                          <div className="font-medium text-blue-900 text-sm">{item.strategy.name}</div>
                          {item.strategy.actionSteps?.filter((step: any) => step.phase === 'immediate').slice(0, 1).map((step: any, stepIdx: number) => (
                            <div key={stepIdx} className="text-xs text-blue-700 mt-1">
                              📋 {step.smeAction || step.action}
                              {step.timeframe && <span className="text-blue-600"> ({step.timeframe})</span>}
                            </div>
                          ))}
                          <div className="text-xs text-blue-600 mt-1">
                            Cost: {item.strategy.implementationCost} | Effectiveness: {item.strategy.effectiveness}/10
                          </div>
                        </div>
                      )) : (
                        <div className="text-sm text-blue-700">
                          • Review and update emergency contact lists<br/>
                          • Assess current insurance coverage<br/>
                          • Identify critical business operations
                        </div>
                      )}
                    </div>
              </div>
                  
              <div>
                    <h4 className="font-medium text-blue-800 mb-3">📈 Strategic Planning (1-6 months)</h4>
                    <div className="space-y-3">
                      {priorityStrategies.length > 0 ? priorityStrategies.map((item, idx) => (
                        <div key={idx} className="bg-white border border-blue-200 rounded p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-blue-900 text-sm">{item.strategy.name}</div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                              item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <div className="text-xs text-blue-700 mt-1">
                            {item.strategy.whyImportant || `Addresses ${item.strategy.applicableRisks?.join(', ')} risks`}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            ROI: {item.strategy.roi}x | Time: {item.strategy.timeToImplement}
                          </div>
                        </div>
                      )) : (
                        <div className="text-sm text-blue-700">
                          • Implement recommended mitigation strategies<br/>
                          • Develop comprehensive business continuity plan<br/>
                          • Train staff on emergency procedures
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
            
            {/* Business-specific summary */}
            <div className="mt-6 p-4 bg-white border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 For Your Business Type</h4>
              <div className="text-sm text-blue-700">
                As a <strong>{businessTypes.find(bt => bt.id === selectedBusinessType)?.name}</strong> business 
                in <strong>{parishes.find(p => p.id === selectedParish)?.name}</strong>, your highest risks are:{' '}
                {combinedRisks
                  .sort((a, b) => b.combinedScore - a.combinedScore)
                  .slice(0, 3)
                  .map(risk => risk.riskType.replace(/([A-Z])/g, ' $1').toLowerCase())
                  .join(', ')
                }. 
                Focus on the critical and high priority strategies above to build resilience efficiently.
              </div>
            </div>
          </div>
        </>
      )}

      {/* No Selection State */}
      {(!selectedParish || !selectedBusinessType) && (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl mb-4 block">🧮</span>
          <h3 className="text-lg font-medium mb-2">Ready to Calculate Risk</h3>
          <p>Select both a parish location and business type above to see the combined risk assessment</p>
        </div>
      )}
    </div>
  )
}