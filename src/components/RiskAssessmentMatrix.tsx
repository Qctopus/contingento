'use client'

import { useState, useEffect, useCallback } from 'react'

interface RiskItem {
  hazard: string
  likelihood: string
  severity: string
  riskLevel: string
  riskScore: number
  planningMeasures: string
}

interface RiskAssessmentProps {
  selectedHazards: string[]
  onComplete: (riskMatrix: RiskItem[]) => void
  initialValue?: RiskItem[]
  setUserInteracted?: () => void
}

interface RiskLevelDistribution {
  Extreme: number;
  High: number;
  Medium: number;
  Low: number;
}

const LIKELIHOOD_OPTIONS = [
  { value: '1', label: 'Very Unlikely (1)', description: 'Will only occur in exceptional circumstances', color: 'bg-green-100 text-green-800' },
  { value: '2', label: 'Unlikely (2)', description: 'Not likely to occur in the next 3 years', color: 'bg-yellow-100 text-yellow-800' },
  { value: '3', label: 'Likely (3)', description: 'Likely to occur in the next 2 years', color: 'bg-orange-100 text-orange-800' },
  { value: '4', label: 'Very Likely (4)', description: 'Very likely to occur in the next year', color: 'bg-red-100 text-red-800' },
]

const SEVERITY_OPTIONS = [
  { value: '1', label: 'Insignificant (1)', description: 'No special measures required', color: 'bg-green-100 text-green-800' },
  { value: '2', label: 'Minor (2)', description: 'Short disruptions, short-term damage', color: 'bg-yellow-100 text-yellow-800' },
  { value: '3', label: 'Serious (3)', description: 'Some infrastructure damage, medium-term impact', color: 'bg-orange-100 text-orange-800' },
  { value: '4', label: 'Major (4)', description: 'Large-scale damage, long-term business impact', color: 'bg-red-100 text-red-800' },
]

const HAZARD_LABELS: { [key: string]: string } = {
  earthquake: 'Earthquake',
  hurricane: 'Hurricane/Tropical Storm',
  coastal_flood: 'Coastal Flooding',
  flash_flood: 'Flash Flooding',
  landslide: 'Landslide',
  tsunami: 'Tsunami',
  volcanic: 'Volcanic Activity',
  drought: 'Drought',
  epidemic: 'Epidemic (local disease outbreak)',
  pandemic: 'Pandemic (widespread disease)',
  power_outage: 'Extended Power Outage',
  telecom_failure: 'Telecommunications Failure',
  cyber_attack: 'Internet/Cyber Attacks',
  fire: 'Fire',
  crime: 'Crime/Theft/Break-in',
  civil_disorder: 'Civil Disorder/Unrest',
  terrorism: 'Terrorism',
  supply_disruption: 'Supply Chain Disruption',
  staff_unavailable: 'Key Staff Unavailability',
  economic_downturn: 'Economic Downturn',
}

export function RiskAssessmentMatrix({ selectedHazards, onComplete, initialValue, setUserInteracted }: RiskAssessmentProps) {
  const [riskItems, setRiskItems] = useState<RiskItem[]>([])
  const [activeRisk, setActiveRisk] = useState<number | null>(null)

  // Initialize risk items when selectedHazards or initialValue changes
  useEffect(() => {
    if (selectedHazards.length === 0) {
      setRiskItems([])
      onComplete([])
      return
    }

    // Create a map of existing risk items by hazard name
    const existingRisksMap = new Map<string, RiskItem>()
    if (initialValue && Array.isArray(initialValue)) {
      initialValue.forEach(item => {
        existingRisksMap.set(item.hazard, item)
      })
    }

    // Create risk items for all selected hazards
    const newRiskItems = selectedHazards.map(hazardKey => {
      const hazardLabel = HAZARD_LABELS[hazardKey] || hazardKey
      
      // Use existing data if available, otherwise create new item
      const existingItem = existingRisksMap.get(hazardLabel) || existingRisksMap.get(hazardKey)
      
      if (existingItem) {
        return existingItem
      }
      
      return {
        hazard: hazardLabel,
        likelihood: '',
        severity: '',
        riskLevel: '',
        riskScore: 0,
        planningMeasures: '',
      }
    })

    setRiskItems(newRiskItems)
  }, [selectedHazards, initialValue])

  // Notify parent of changes using useCallback to prevent unnecessary re-renders
  const notifyParent = useCallback((items: RiskItem[]) => {
    onComplete(items)
  }, [onComplete])

  // Call parent when risk items change - debounced to prevent excessive calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      notifyParent(riskItems)
    }, 100) // Small delay to batch updates
    
    return () => clearTimeout(timeoutId)
  }, [riskItems, notifyParent])

  const calculateRiskLevel = (likelihood: string, severity: string): { level: string; score: number; color: string } => {
    const l = parseInt(likelihood) || 0
    const s = parseInt(severity) || 0
    const score = l * s
    
    if (score >= 12) return { level: 'Extreme', score, color: 'bg-red-600 text-white' }
    if (score >= 8) return { level: 'High', score, color: 'bg-red-500 text-white' }
    if (score >= 3) return { level: 'Medium', score, color: 'bg-yellow-500 text-white' }
    if (score >= 1) return { level: 'Low', score, color: 'bg-green-500 text-white' }
    return { level: '', score: 0, color: 'bg-gray-200 text-gray-600' }
  }

  const updateRiskItem = useCallback((index: number, field: keyof RiskItem, value: string) => {
    if (setUserInteracted) {
      setUserInteracted()
    }
    
    setRiskItems(prevItems => {
      const updatedItems = [...prevItems]
      const currentItem = { ...updatedItems[index] }
      
      // Handle string fields
      if (field === 'hazard' || field === 'likelihood' || field === 'severity' || field === 'riskLevel' || field === 'planningMeasures') {
        currentItem[field] = value
      }
      
      // Recalculate risk level if likelihood or severity changed
      if (field === 'likelihood' || field === 'severity') {
        const { level, score } = calculateRiskLevel(
          currentItem.likelihood,
          currentItem.severity
        )
        currentItem.riskLevel = level
        currentItem.riskScore = score
      }
      
      updatedItems[index] = currentItem
      return updatedItems
    })
  }, [setUserInteracted])

  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'Extreme': return 'bg-red-600 text-white'
      case 'High': return 'bg-red-500 text-white'
      case 'Medium': return 'bg-yellow-500 text-white'
      case 'Low': return 'bg-green-500 text-white'
      default: return 'bg-gray-200 text-gray-600'
    }
  }

  const getCompletedRisks = () => {
    return riskItems.filter(item => item.likelihood && item.severity && item.planningMeasures.trim())
  }

  const getRiskDistribution = (): RiskLevelDistribution => {
    const distribution: RiskLevelDistribution = { Extreme: 0, High: 0, Medium: 0, Low: 0 };
    riskItems.forEach(item => {
      if (item.riskLevel && item.riskLevel in distribution) {
        distribution[item.riskLevel as keyof RiskLevelDistribution]++;
      }
    });
    return distribution;
  }

  if (selectedHazards.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <svg className="h-12 w-12 text-blue-400 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-blue-900 mb-2">No Hazards Selected</h3>
        <p className="text-blue-700">Please select hazards in the previous step to create your risk assessment matrix.</p>
      </div>
    )
  }

  const distribution = getRiskDistribution()
  const completedRisks = getCompletedRisks()

  return (
    <div className="space-y-6">
      {/* Risk Assessment Overview */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Assessment Overview</h3>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Assessment Progress</span>
            <span className="text-sm font-medium">{completedRisks.length} of {riskItems.length} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${riskItems.length > 0 ? (completedRisks.length / riskItems.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(distribution).map(([level, count]) => (
            <div key={level} className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(level)}`}>
                {count}
              </div>
              <div className="text-xs text-gray-600 mt-1">{level} Risk</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Matrix Visual */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">CARICHAM Risk Matrix</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2"></th>
                <th className="p-2 font-medium text-center">Insignificant (1)</th>
                <th className="p-2 font-medium text-center">Minor (2)</th>
                <th className="p-2 font-medium text-center">Serious (3)</th>
                <th className="p-2 font-medium text-center">Major (4)</th>
                <th className="p-2 font-medium text-center">SEVERITY</th>
              </tr>
            </thead>
            <tbody>
              {[4, 3, 2, 1].map(likelihood => (
                <tr key={likelihood}>
                  <td className="p-2 font-medium text-center align-middle">
                    {likelihood === 4 ? 'Very Likely (4)' : likelihood === 3 ? 'Likely (3)' : likelihood === 2 ? 'Unlikely (2)' : 'Very Unlikely (1)'}
                  </td>
                  {[1, 2, 3, 4].map(severity => {
                    const score = likelihood * severity
                    const { level, color } = calculateRiskLevel(likelihood.toString(), severity.toString())
                    return (
                      <td key={`${likelihood}-${severity}`} className={`p-3 text-center font-medium rounded ${color}`}> 
                        {level}<br/>({score})
                      </td>
                    )
                  })}
                  <td className="p-2 font-medium text-center align-middle rotate-90">{likelihood === 4 ? 'LIKELIHOOD' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Risk Assessments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Individual Risk Assessments</h3>
        
        {riskItems.map((risk, index) => {
          const isActive = activeRisk === index
          const isCompleted = risk.likelihood && risk.severity && risk.planningMeasures.trim()
          
          return (
            <div key={`${risk.hazard}-${index}`} className={`bg-white border rounded-lg transition-all duration-200 ${isActive ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'}`}>
              <button
                onClick={() => setActiveRisk(isActive ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between"
                type="button"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <h4 className="font-medium">{risk.hazard}</h4>
                  {risk.riskLevel && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(risk.riskLevel)}`}>
                      {risk.riskLevel} ({risk.riskScore})
                    </span>
                  )}
                </div>
                <svg 
                  className={`h-5 w-5 text-gray-400 transition-transform ${isActive ? 'rotate-180' : ''}`} 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isActive && (
                <div className="px-4 pb-4 space-y-4 border-t">
                  {/* Likelihood Assessment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Likelihood Assessment
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {LIKELIHOOD_OPTIONS.map(option => (
                        <div 
                          key={`likelihood-${index}-${option.value}`} 
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${risk.likelihood === option.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            updateRiskItem(index, 'likelihood', option.value)
                          }}
                        >
                          <input
                            type="radio"
                            name={`likelihood-${risk.hazard.replace(/\s+/g, '')}-${index}`}
                            value={option.value}
                            checked={risk.likelihood === option.value}
                            onChange={() => {}} // Controlled by parent div click
                            className="h-4 w-4 text-primary-600 mr-3 focus:ring-primary-500 pointer-events-none"
                            readOnly
                          />
                          <div className="pointer-events-none">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Severity Assessment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity Assessment
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {SEVERITY_OPTIONS.map(option => (
                        <div 
                          key={`severity-${index}-${option.value}`} 
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${risk.severity === option.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            updateRiskItem(index, 'severity', option.value)
                          }}
                        >
                          <input
                            type="radio"
                            name={`severity-${risk.hazard.replace(/\s+/g, '')}-${index}`}
                            value={option.value}
                            checked={risk.severity === option.value}
                            onChange={() => {}} // Controlled by parent div click
                            className="h-4 w-4 text-primary-600 mr-3 focus:ring-primary-500 pointer-events-none"
                            readOnly
                          />
                          <div className="pointer-events-none">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Level Display */}
                  {risk.likelihood && risk.severity && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Calculated Risk Level:</div>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium ${getRiskLevelColor(risk.riskLevel)}`}>
                        {risk.riskLevel} Risk (Score: {risk.riskScore})
                      </div>
                    </div>
                  )}

                  {/* Planning Measures */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Planning Measures
                    </label>
                    <textarea
                      value={risk.planningMeasures}
                      onChange={(e) => updateRiskItem(index, 'planningMeasures', e.target.value)}
                      placeholder="Describe specific measures you will take to address this risk..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Consider prevention measures, response procedures, and recovery strategies.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary and Recommendations */}
      {completedRisks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Assessment Summary & Recommendations</h3>
          
          <div className="space-y-3">
            {distribution.Extreme > 0 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <svg className="h-5 w-5 text-red-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800">
                  <strong>Extreme Priority:</strong> You have {distribution.Extreme} extreme risk(s) that require immediate attention and comprehensive mitigation strategies.
                </span>
              </div>
            )}
            
            {distribution.High > 0 && (
              <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <svg className="h-5 w-5 text-orange-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-orange-800">
                  <strong>High Priority:</strong> You have {distribution.High} high risk(s) that should be addressed with robust planning measures.
                </span>
              </div>
            )}
            
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                <strong>Next Steps:</strong> Focus on developing comprehensive strategies for your highest-risk items first. 
                Consider the planning measures you've identified and ensure they are realistic and actionable.
              </p>
              <p>
                Remember that risk assessment is an ongoing process. Review and update these assessments regularly, 
                especially when your business environment changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}