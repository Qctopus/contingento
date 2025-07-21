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

interface GuidedRiskAssessmentProps {
  selectedHazards: string[]
  onComplete: (riskItems: RiskItem[]) => void
  onUpdate: (riskItems: RiskItem[]) => void
  riskItems: RiskItem[]
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

export function GuidedRiskAssessment({
  selectedHazards,
  onComplete,
  onUpdate,
  riskItems,
  locationData,
  businessData
}: GuidedRiskAssessmentProps) {
  const [currentRiskIndex, setCurrentRiskIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'guided' | 'overview'>('guided')
  const t = useTranslations('common')

  // Calculate risk level from likelihood and severity - WITH DEBUGGING
  const calculateRiskLevel = (likelihood: string, severity: string): { level: string; score: number } => {
    console.log('🚀 GUIDED ASSESSMENT CALCULATE RISK:', { likelihood, severity, type_l: typeof likelihood, type_s: typeof severity })
    
    const l = parseInt(likelihood) || 0
    const s = parseInt(severity) || 0
    const score = l * s
    
    console.log('🚀 GUIDED PARSED VALUES:', { l, s, score, calculation: `${l} × ${s} = ${score}` })
    
    let result
    if (score >= 12) {
      result = { level: t('extremeRisk'), score }
    } else if (score >= 8) {
      result = { level: t('highRisk'), score }
    } else if (score >= 3) {
      result = { level: t('mediumRisk'), score }
    } else if (score >= 1) {
      result = { level: t('lowRisk'), score }
    } else {
      result = { level: '', score: 0 }
    }
    
    console.log('🚀 GUIDED RESULT:', result)
    return result
  }

  // Update a specific risk item - WITH DEBUGGING
  const updateRiskItem = useCallback((index: number, field: keyof RiskItem, value: string) => {
    console.log('🚀 GUIDED updateRiskItem called:', { index, field, value })
    
    const updatedItems = [...riskItems]
    const currentItem = { ...updatedItems[index] }
    
    console.log('🚀 GUIDED current item before update:', currentItem)
    
    if (field === 'hazard' || field === 'likelihood' || field === 'severity' || field === 'riskLevel' || field === 'planningMeasures') {
      currentItem[field] = value
    }
    
    // Recalculate risk level if likelihood or severity changed
    if (field === 'likelihood' || field === 'severity') {
      const newLikelihood = field === 'likelihood' ? value : currentItem.likelihood
      const newSeverity = field === 'severity' ? value : currentItem.severity
      
      console.log('🚀 GUIDED recalculating with:', { newLikelihood, newSeverity })
      
      if (newLikelihood && newSeverity) {
        const { level, score } = calculateRiskLevel(newLikelihood, newSeverity)
        currentItem.riskLevel = level
        currentItem.riskScore = score
        console.log('🚀 GUIDED risk calculated, updating item:', { level, score })
      } else {
        currentItem.riskLevel = ''
        currentItem.riskScore = 0
        console.log('🚀 GUIDED clearing risk - missing values')
      }
    }
    
    console.log('🚀 GUIDED final item after update:', currentItem)
    
    updatedItems[index] = currentItem
    onUpdate(updatedItems)
  }, [riskItems, onUpdate, calculateRiskLevel])

  // Get contextual guidance for a specific hazard
  const getContextualGuidance = (hazardKey: string) => {
    const location = locationData?.parish || locationData?.country || 'your area'
    const business = businessData?.industryType || 'your business'
    
    const guidanceData: { [key: string]: {
      description: string
      likelihoodGuidance: string
      severityGuidance: string
      examples: string[]
    }} = {
      'hurricane': {
        description: `Hurricanes are major threats in the Caribbean, particularly during the June-November season. In ${location}, these storms can bring devastating winds, flooding, and power outages.`,
        likelihoodGuidance: `Consider ${location}'s hurricane history. Jamaica typically experiences 1-2 significant storms per year during hurricane season.`,
        severityGuidance: business === 'restaurant' ? 'Restaurants face equipment damage, food spoilage, staff inability to work, and potential weeks of closure.' : business === 'grocery_store' ? 'Grocery stores risk inventory loss, refrigeration failure, and supply chain disruption lasting days to weeks.' : 'Consider building damage, equipment loss, employee safety, and business interruption duration.',
        examples: [
          'Power outages affecting refrigeration and POS systems',
          'Blocked roads preventing staff and customers from reaching business',
          'Structural damage requiring repairs before reopening',
          'Supply chain disruptions affecting inventory'
        ]
      },
      'power_outage': {
        description: `Power outages are common in ${location}, ranging from brief interruptions to extended blackouts during storms or infrastructure failures.`,
        likelihoodGuidance: `Caribbean islands typically experience power outages monthly. Consider your area's grid reliability and backup power availability.`,
        severityGuidance: business === 'restaurant' ? 'Critical impact on food safety, cooking, lighting, and payment processing. Even short outages can spoil food.' : business === 'grocery_store' ? 'Refrigeration failure can destroy inventory within hours. POS systems become unusable without backup power.' : 'Consider impact on computers, lighting, security systems, and climate control.',
        examples: [
          'Refrigerated/frozen food spoilage during extended outages',
          'Inability to process electronic payments',
          'Security system failures',
          'Loss of air conditioning affecting comfort and equipment'
        ]
      },
      'flash_flood': {
        description: `Flash flooding occurs rapidly in ${location}, especially during heavy rains. Low-lying areas and poor drainage increase risk.`,
        likelihoodGuidance: `Consider your elevation, drainage, and local flood history. Areas near rivers or with poor drainage flood more frequently.`,
        severityGuidance: business === 'restaurant' ? 'Water damage to kitchen equipment, electrical systems, and food storage can force extended closure.' : business === 'grocery_store' ? 'Ground-level inventory and electrical systems at risk. Customer access may be blocked.' : 'Consider ground-floor equipment, inventory, and structural damage.',
        examples: [
          'Water damage to electrical systems and equipment',
          'Inventory stored at ground level getting waterlogged',
          'Blocked customer and delivery access',
          'Contamination requiring deep cleaning'
        ]
      },
      'crime': {
        description: `Security risks including theft, burglary, and robbery affect businesses in ${location}. Cash-based businesses face higher risks.`,
        likelihoodGuidance: `Consider your location's crime statistics, business hours, cash handling practices, and security measures.`,
        severityGuidance: business === 'restaurant' ? 'Evening operations and cash handling create vulnerability. Loss of equipment and customer confidence.' : business === 'grocery_store' ? 'Valuable inventory and cash registers are targets. Extended closure for investigation possible.' : 'Consider cash loss, equipment theft, property damage, and staff trauma.',
        examples: [
          'Theft of cash, equipment, or inventory',
          'Property damage requiring repairs',
          'Staff reluctance to work following incidents',
          'Customers avoiding the business due to safety concerns'
        ]
      },
      'fire': {
        description: `Fire risk varies by business type and building age. ${business === 'restaurant' ? 'Kitchen operations present elevated fire risk' : 'Electrical systems and storage areas'} are common fire sources.`,
        likelihoodGuidance: `Consider your building's age, electrical condition, fire prevention systems, and activity type. Kitchens have higher risk.`,
        severityGuidance: business === 'restaurant' ? 'Kitchen fires can destroy equipment and force extended closure. Smoke damage affects entire building.' : 'Consider equipment replacement costs, structural damage, and business interruption duration.',
        examples: [
          'Equipment destruction requiring replacement',
          'Smoke damage throughout the building',
          'Extended closure for repairs and cleanup',
          'Increased insurance premiums following claims'
        ]
      },
      'supply_disruption': {
        description: `Supply chain disruptions are common in Caribbean islands due to weather, shipping delays, and limited suppliers. ${business} operations depend on reliable supply access.`,
        likelihoodGuidance: `Island businesses face supply challenges several times per year. Consider your supplier diversity and inventory management.`,
        severityGuidance: business === 'restaurant' ? 'Fresh ingredient shortages can force menu changes or closure. Limited supplier options on islands.' : business === 'grocery_store' ? 'Empty shelves disappoint customers and reduce revenue. Some products may be unavailable for weeks.' : 'Consider revenue impact and customer satisfaction during shortages.',
        examples: [
          'Fresh ingredients unavailable forcing menu limitations',
          'Customer dissatisfaction with limited product selection',
          'Increased costs from emergency supplier purchases',
          'Revenue loss during extended shortages'
        ]
      },
      'economic_downturn': {
        description: `Economic challenges affect Caribbean businesses through reduced tourism, lower local spending, and decreased business investment.`,
        likelihoodGuidance: `Consider economic cycles, seasonal variations, and your customer base's economic stability. Tourism-dependent areas see more volatility.`,
        severityGuidance: business === 'restaurant' ? 'Reduced dining out and discretionary spending. Tourists may cut back on meals.' : business === 'grocery_store' ? 'Customers switch to basic necessities and cheaper alternatives.' : 'Consider reduced customer spending and payment delays.',
        examples: [
          'Decreased customer traffic and average spending',
          'Customers switching to lower-cost alternatives',
          'Delayed payments from business customers',
          'Pressure to reduce prices while costs remain high'
        ]
      }
    }
    
    return guidanceData[hazardKey] || {
      description: `This risk could impact your ${business} operations in ${location}.`,
      likelihoodGuidance: 'Consider how often this type of event occurs in your area and industry.',
      severityGuidance: 'Think about the potential impact on your operations, revenue, and recovery time.',
      examples: ['Consider direct operational impacts', 'Evaluate financial consequences', 'Think about recovery timeframes']
    }
  }

  // Get likelihood options with context
  const getLikelihoodOptions = (hazardKey: string) => {
    const guidance = getContextualGuidance(hazardKey)
    return [
      { 
        value: '1', 
        label: t('veryUnlikely'), 
        description: `${t('veryUnlikelyDesc')} - Less than once every 5 years`,
        contextual: 'Rare events in your specific location and business context'
      },
      { 
        value: '2', 
        label: t('unlikely'), 
        description: `${t('unlikelyDesc')} - Once every 2-5 years`,
        contextual: 'Occasional events that other businesses in your area experience'
      },
      { 
        value: '3', 
        label: t('likely'), 
        description: `${t('likelyDesc')} - Once every 1-2 years`,
        contextual: 'Regular events that most businesses in your industry/location face'
      },
      { 
        value: '4', 
        label: t('veryLikely'), 
        description: `${t('veryLikelyDesc')} - Multiple times per year`,
        contextual: 'Frequent events requiring ongoing preparedness'
      },
    ]
  }

  // Get severity options with context
  const getSeverityOptions = (hazardKey: string) => {
    const guidance = getContextualGuidance(hazardKey)
    return [
      { 
        value: '1', 
        label: t('insignificant'), 
        description: `${t('insignificantDesc')} - Minor disruption, quick recovery`,
        contextual: 'Temporary inconvenience with minimal business impact'
      },
      { 
        value: '2', 
        label: t('minor'), 
        description: `${t('minorDesc')} - Some disruption, recovery within days`,
        contextual: 'Noticeable impact but business continues with adjustments'
      },
      { 
        value: '3', 
        label: t('serious'), 
        description: `${t('seriousDesc')} - Significant disruption, recovery within weeks`,
        contextual: 'Major operational impact requiring substantial response'
      },
      { 
        value: '4', 
        label: t('major'), 
        description: `${t('majorDesc')} - Severe disruption, extended recovery period`,
        contextual: 'Business-threatening impact requiring extensive recovery'
      },
    ]
  }

  const currentRisk = riskItems[currentRiskIndex]
  const isLastRisk = currentRiskIndex === riskItems.length - 1
  const completedRisks = riskItems.filter(r => r.likelihood && r.severity).length

  // Calculate risk levels for pre-populated data on mount/change
  useEffect(() => {
    if (riskItems.length > 0) {
      const needsCalculation = riskItems.some(item => 
        item.likelihood && item.severity && (!item.riskLevel || item.riskScore === 0)
      )
      
      if (needsCalculation) {
        console.log('🚀 CALCULATING RISK LEVELS FOR PRE-POPULATED DATA')
        const updatedItems = riskItems.map(item => {
          if (item.likelihood && item.severity && (!item.riskLevel || item.riskScore === 0)) {
            const { level, score } = calculateRiskLevel(item.likelihood, item.severity)
            console.log(`🚀 CALCULATED FOR ${item.hazard}:`, { 
              likelihood: item.likelihood, 
              severity: item.severity, 
              calculatedLevel: level, 
              calculatedScore: score 
            })
            return {
              ...item,
              riskLevel: level,
              riskScore: score
            }
          }
          return item
        })
        
        onUpdate(updatedItems)
      }
    }
  }, [riskItems, calculateRiskLevel, onUpdate])

  // DEBUG: Log current state
  console.log('🚀 GUIDED ASSESSMENT RENDER:', {
    currentRiskIndex,
    currentRisk,
    totalRiskItems: riskItems.length,
    completedRisks,
    allRiskItems: riskItems
  })

  const handleNext = () => {
    if (isLastRisk) {
      onComplete(riskItems)
    } else {
      setCurrentRiskIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentRiskIndex > 0) {
      setCurrentRiskIndex(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleJumpToRisk = (index: number) => {
    setCurrentRiskIndex(index)
    setViewMode('guided')
  }

  if (!currentRisk) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No risks to assess</div>
      </div>
    )
  }

  const guidance = getContextualGuidance(selectedHazards[currentRiskIndex])
  const likelihoodOptions = getLikelihoodOptions(selectedHazards[currentRiskIndex])
  const severityOptions = getSeverityOptions(selectedHazards[currentRiskIndex])

  if (viewMode === 'overview') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Risk Assessment Progress</h2>
          <button
            onClick={() => setViewMode('guided')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Assessment
          </button>
        </div>

        <div className="grid gap-4">
          {riskItems.map((risk, index) => {
            const isCompleted = risk.likelihood && risk.severity
            const isCurrent = index === currentRiskIndex
            
            return (
              <div 
                key={index}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  isCurrent 
                    ? 'border-blue-500 bg-blue-50'
                    : isCompleted
                    ? 'border-green-500 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => handleJumpToRisk(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted 
                        ? 'bg-green-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{risk.hazard}</h3>
                      {isCompleted && (
                        <p className="text-sm text-gray-600">
                          {risk.riskLevel} Risk (Score: {risk.riskScore})
                        </p>
                      )}
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-sm text-blue-600 font-medium">Current</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{completedRisks} / {riskItems.length}</div>
            <div className="text-sm text-gray-600">Risks Assessed</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Risk</span>
            <span className="font-bold text-lg">{currentRiskIndex + 1}</span>
            <span className="text-sm text-gray-600">of {riskItems.length}</span>
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentRiskIndex + 1) / riskItems.length) * 100}%` }}
            />
          </div>
        </div>
        <button
          onClick={() => setViewMode('overview')}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          View All Risks
        </button>
      </div>

      {/* Risk Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
              {currentRiskIndex + 1}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentRisk.hazard}</h1>
              <p className="text-gray-600">{guidance.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Likelihood Assessment */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How likely is this to affect your business?
              </h3>
              <p className="text-sm text-gray-600">{guidance.likelihoodGuidance}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3">
              {likelihoodOptions.map(option => (
                <div
                  key={option.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    currentRisk.likelihood === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => updateRiskItem(currentRiskIndex, 'likelihood', option.value)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      checked={currentRisk.likelihood === option.value}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 text-blue-600 pointer-events-none"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                      <div className="text-xs text-blue-600 mt-1">{option.contextual}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Assessment */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How severe would the impact be?
              </h3>
              <p className="text-sm text-gray-600">{guidance.severityGuidance}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3">
              {severityOptions.map(option => (
                <div
                  key={option.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    currentRisk.severity === option.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => updateRiskItem(currentRiskIndex, 'severity', option.value)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      checked={currentRisk.severity === option.value}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 text-orange-600 pointer-events-none"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                      <div className="text-xs text-orange-600 mt-1">{option.contextual}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Level Display */}
          {/* RISK LEVEL DISPLAY - ALWAYS SHOW WITH DEBUG */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Calculated Risk Level</h4>
                <p className="text-sm text-gray-600">Based on your likelihood and severity assessment</p>
                <div className="text-xs bg-blue-100 p-2 mt-2 rounded">
                  🚀 DEBUG: GuidedRiskAssessment Component - L={currentRisk?.likelihood || 'none'}, S={currentRisk?.severity || 'none'}
                  <br />
                  <button 
                    onClick={() => {
                      console.log('🚀 MANUAL TRIGGER: Calling updateRiskItem manually')
                      if (currentRisk?.likelihood && currentRisk?.severity) {
                        updateRiskItem(currentRiskIndex, 'likelihood', currentRisk.likelihood)
                      }
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-1"
                  >
                    FORCE RECALCULATE
                  </button>
                </div>
              </div>
              {currentRisk?.likelihood && currentRisk?.severity ? (
                <div className={`px-6 py-3 rounded-full font-bold text-lg ${
                  currentRisk.riskScore >= 12 
                    ? 'bg-black text-white'
                    : currentRisk.riskScore >= 8
                    ? 'bg-red-600 text-white'
                    : currentRisk.riskScore >= 3
                    ? 'bg-yellow-500 text-black'
                    : 'bg-green-500 text-white'
                }`}>
                  {currentRisk.riskLevel} ({currentRisk.riskScore})
                </div>
              ) : (
                <div className="px-6 py-3 rounded-full font-bold text-lg bg-gray-200 text-gray-600">
                  Select both values
                </div>
              )}
            </div>
          </div>

          {/* Examples */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Consider These Scenarios</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {guidance.examples.map((example, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                onClick={handlePrevious}
                disabled={currentRiskIndex === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Skip for Now
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              {currentRisk.likelihood && currentRisk.severity ? (
                <span className="text-sm text-green-600 font-medium">✓ Assessment Complete</span>
              ) : (
                <span className="text-sm text-gray-500">Select likelihood and severity to continue</span>
              )}
              <button
                onClick={handleNext}
                disabled={!currentRisk.likelihood || !currentRisk.severity}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLastRisk ? 'Complete Assessment' : 'Next Risk'} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 