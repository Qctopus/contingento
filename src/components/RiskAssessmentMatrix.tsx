'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'

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

export function RiskAssessmentMatrix({ selectedHazards, onComplete, initialValue, setUserInteracted }: RiskAssessmentProps) {
  const [riskItems, setRiskItems] = useState<RiskItem[]>([])
  const [activeRisk, setActiveRisk] = useState<number | null>(null)
  const t = useTranslations('common')
  const tSteps = useTranslations('steps.riskAssessment')

  // Define a mapping of common hazard IDs for reverse lookup
  const hazardMappings: Record<string, string> = {
    'earthquake': 'earthquake',
    'hurricane': 'hurricane', 
    'coastal_flood': 'coastal_flood',
    'flash_flood': 'flash_flood',
    'landslide': 'landslide',
    'tsunami': 'tsunami',
    'volcanic': 'volcanic',
    'drought': 'drought',
    'epidemic': 'epidemic',
    'pandemic': 'pandemic',
    'power_outage': 'power_outage',
    'telecom_failure': 'telecom_failure',
    'cyber_attack': 'cyber_attack',
    'fire': 'fire',
    'crime': 'crime',
    'civil_disorder': 'civil_disorder',
    'terrorism': 'terrorism',
    'supply_disruption': 'supply_disruption',
    'staff_unavailable': 'staff_unavailable',
    'economic_downturn': 'economic_downturn',
    'urban_flooding': 'urban_flooding',
    'traffic_disruption': 'traffic_disruption',
    'storm_surge': 'storm_surge',
    'coastal_erosion': 'coastal_erosion',
    'infrastructure_failure': 'infrastructure_failure',
    'crowd_management': 'crowd_management',
    'river_flooding': 'river_flooding',
    'urban_congestion': 'urban_congestion',
    'water_shortage': 'water_shortage',
    'industrial_accident': 'industrial_accident',
    'air_pollution': 'air_pollution',
    'tourism_disruption': 'tourism_disruption',
    'oil_spill': 'oil_spill',
    'sargassum': 'sargassum',
    'waste_management': 'waste_management'
  }

  // Get localized likelihood options
  const getLikelihoodOptions = () => [
    { value: '1', label: t('veryUnlikely'), description: t('veryUnlikelyDesc'), color: 'bg-green-100 text-green-800' },
    { value: '2', label: t('unlikely'), description: t('unlikelyDesc'), color: 'bg-yellow-100 text-yellow-800' },
    { value: '3', label: t('likely'), description: t('likelyDesc'), color: 'bg-orange-100 text-orange-800' },
    { value: '4', label: t('veryLikely'), description: t('veryLikelyDesc'), color: 'bg-red-100 text-red-800' },
  ]

  // Get localized severity options
  const getSeverityOptions = () => [
    { value: '1', label: t('insignificant'), description: t('insignificantDesc'), color: 'bg-green-100 text-green-800' },
    { value: '2', label: t('minor'), description: t('minorDesc'), color: 'bg-yellow-100 text-yellow-800' },
    { value: '3', label: t('serious'), description: t('seriousDesc'), color: 'bg-orange-100 text-orange-800' },
    { value: '4', label: t('major'), description: t('majorDesc'), color: 'bg-red-100 text-red-800' },
  ]

  // Get localized hazard label
  const getHazardLabel = (hazardKey: string): string => {
    try {
      const translatedLabel = tSteps(`hazardLabels.${hazardKey}`)
      
      // Check if we got a valid translation (not just the key back)
      if (translatedLabel && translatedLabel !== `hazardLabels.${hazardKey}` && translatedLabel !== `steps.riskAssessment.hazardLabels.${hazardKey}`) {
        return translatedLabel
      }
      
      // If translation failed, fall back to formatted key
      return hazardKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    } catch (error) {
      // Fallback to formatted key if translation doesn't exist
      return hazardKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  // Initialize risk items when selectedHazards or initialValue changes
  useEffect(() => {
    if (selectedHazards.length === 0) {
      setRiskItems([])
      onComplete([])
      return
    }

    // Create a map of existing risk items by both hazard ID and translated label
    const existingRisksMap = new Map<string, RiskItem>()
    if (initialValue && Array.isArray(initialValue)) {
      initialValue.forEach(item => {
        // Map by both the current hazard name and potential hazard ID
        existingRisksMap.set(item.hazard, item)
        
        // Also try to map by the hazard ID if the current hazard is already a translated label
        const possibleHazardId = Object.keys(hazardMappings).find(key => {
          const translatedLabel = tSteps(`hazardLabels.${key}`)
          return translatedLabel === item.hazard
        })
        if (possibleHazardId) {
          existingRisksMap.set(possibleHazardId, item)
        }
      })
    }

    // Create risk items for all selected hazards
    const newRiskItems = selectedHazards.map(hazardKey => {
      const hazardLabel = getHazardLabel(hazardKey)
      
      // Use existing data if available (check both by key and by label)
      const existingItem = existingRisksMap.get(hazardKey) || existingRisksMap.get(hazardLabel)
      
      if (existingItem) {
        // Update the hazard field to use the translated label
        return {
          ...existingItem,
          hazard: hazardLabel
        }
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
  }, [selectedHazards, initialValue, tSteps])

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
    
    if (score >= 12) return { level: t('extremeRisk'), score, color: 'bg-red-600 text-white' }
    if (score >= 8) return { level: t('highRisk'), score, color: 'bg-red-500 text-white' }
    if (score >= 3) return { level: t('mediumRisk'), score, color: 'bg-yellow-500 text-white' }
    if (score >= 1) return { level: t('lowRisk'), score, color: 'bg-green-500 text-white' }
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
  }, [setUserInteracted, t])

  const getRiskLevelColor = (riskLevel: string): string => {
    if (riskLevel === t('extremeRisk')) return 'bg-red-600 text-white'
    if (riskLevel === t('highRisk')) return 'bg-red-500 text-white'
    if (riskLevel === t('mediumRisk')) return 'bg-yellow-500 text-white'
    if (riskLevel === t('lowRisk')) return 'bg-green-500 text-white'
    return 'bg-gray-200 text-gray-600'
  }

  const getCompletedRisks = () => {
    return riskItems.filter(item => item.likelihood && item.severity && item.planningMeasures.trim())
  }

  const getRiskDistribution = (): { [key: string]: number } => {
    const distribution: { [key: string]: number } = {}
    const riskLevels = [t('extremeRisk'), t('highRisk'), t('mediumRisk'), t('lowRisk')]
    
    // Initialize with translated risk levels
    riskLevels.forEach(level => {
      distribution[level] = 0
    })
    
    riskItems.forEach(item => {
      if (item.riskLevel && distribution.hasOwnProperty(item.riskLevel)) {
        distribution[item.riskLevel]++
      }
    })
    
    return distribution
  }

  if (selectedHazards.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <svg className="h-12 w-12 text-blue-400 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-blue-900 mb-2">{t('noHazardsSelected')}</h3>
        <p className="text-blue-700">{t('selectHazardsPrompt')}</p>
      </div>
    )
  }

  const distribution = getRiskDistribution()
  const completedRisks = getCompletedRisks()
  const likelihoodOptions = getLikelihoodOptions()
  const severityOptions = getSeverityOptions()

  return (
    <div className="space-y-6">
      {/* Risk Assessment Overview */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{t('riskOverview')}</h3>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{t('assessmentProgress')}</span>
            <span className="text-sm font-medium">{completedRisks.length} {t('of')} {riskItems.length} {t('completed')}</span>
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
              <div className="text-xs text-gray-600 mt-1">{level} {t('riskText')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Matrix Visual */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{t('riskMatrix')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2"></th>
                <th className="p-2 font-medium text-center">{t('insignificant')}</th>
                <th className="p-2 font-medium text-center">{t('minor')}</th>
                <th className="p-2 font-medium text-center">{t('serious')}</th>
                <th className="p-2 font-medium text-center">{t('major')}</th>
                <th className="p-2 font-medium text-center">{t('severity')}</th>
              </tr>
            </thead>
            <tbody>
              {[4, 3, 2, 1].map(likelihood => (
                <tr key={likelihood}>
                  <td className="p-2 font-medium text-center align-middle">
                    {likelihoodOptions.find(opt => opt.value === likelihood.toString())?.label || `(${likelihood})`}
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
                  <td className="p-2 font-medium text-center align-middle rotate-90">{likelihood === 4 ? t('likelihood') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Risk Assessments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('individualRiskAssessments')}</h3>
        
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
                      {t('likelihoodAssessment')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {likelihoodOptions.map(option => (
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
                      {t('severityAssessment')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {severityOptions.map(option => (
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
                      <div className="text-sm font-medium text-gray-700 mb-2">{t('calculatedRiskLevel')}</div>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium ${getRiskLevelColor(risk.riskLevel)}`}>
                        {risk.riskLevel} {t('riskText')} ({t('riskScore')}: {risk.riskScore})
                      </div>
                    </div>
                  )}

                  {/* Planning Measures */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('planningMeasures')}
                    </label>
                    <textarea
                      value={risk.planningMeasures}
                      onChange={(e) => updateRiskItem(index, 'planningMeasures', e.target.value)}
                      placeholder={t('planningMeasuresPlaceholder')}
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('planningMeasuresHelp')}
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
          <h3 className="text-lg font-semibold text-blue-900 mb-4">{t('assessmentSummary')}</h3>
          
          <div className="space-y-3">
            {distribution[t('extremeRisk')] > 0 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <svg className="h-5 w-5 text-red-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800">
                  <strong>{t('extremePriority')}</strong> {t('extremePriorityText', { count: distribution[t('extremeRisk')] })}
                </span>
              </div>
            )}
            
            {distribution[t('highRisk')] > 0 && (
              <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <svg className="h-5 w-5 text-orange-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-orange-800">
                  <strong>{t('highPriority')}</strong> {t('highPriorityText', { count: distribution[t('highRisk')] })}
                </span>
              </div>
            )}
            
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                <strong>{t('nextSteps')}</strong> {t('nextStepsText')}
              </p>
              <p>
                {t('ongoingProcess')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}