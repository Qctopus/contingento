'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { HazardPrefilter } from './HazardPrefilter'
import { RiskPortfolioSummary } from './RiskPortfolioSummary'
import { RiskAssessmentMatrix } from './RiskAssessmentMatrix'

interface RiskItem {
  hazard: string
  likelihood: string
  severity: string
  riskLevel: string
  riskScore: number
  planningMeasures: string
}

interface RiskAssessmentWizardProps {
  selectedHazards: string[]
  onComplete: (riskMatrix: RiskItem[]) => void
  initialValue?: RiskItem[]
  setUserInteracted?: () => void
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
  preFillData?: any // Add preFillData prop
}

type WizardPhase = 'intelligent_filtering' | 'smart_assessment' | 'summary'

export function RiskAssessmentWizard({ 
  selectedHazards, 
  onComplete, 
  initialValue, 
  setUserInteracted,
  locationData,
  businessData,
  preFillData
}: RiskAssessmentWizardProps) {
  const [currentPhase, setCurrentPhase] = useState<WizardPhase>('intelligent_filtering')
  const [prioritizedHazards, setPrioritizedHazards] = useState<string[]>([])
  const [riskItems, setRiskItems] = useState<RiskItem[]>([])
  const [currentRiskIndex, setCurrentRiskIndex] = useState(0)
  const t = useTranslations('common')
  const tSteps = useTranslations('steps.riskAssessment')

  // Get localized hazard label
  const getHazardLabel = useCallback((hazardKey: string): string => {
    try {
      const translatedLabel = tSteps(`hazardLabels.${hazardKey}`)
      
      if (translatedLabel && translatedLabel !== `hazardLabels.${hazardKey}` && translatedLabel !== `steps.riskAssessment.hazardLabels.${hazardKey}`) {
        return translatedLabel
      }
      
      return hazardKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    } catch (error) {
      return hazardKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }, [tSteps])

  // Initialize risk items when prioritized hazards change
  useEffect(() => {
    if (prioritizedHazards.length === 0) {
      setRiskItems([])
      return
    }

    // Create risk items for prioritized hazards, preserving existing data
    const existingRisksMap = new Map<string, RiskItem>()
    if (initialValue && Array.isArray(initialValue)) {
      initialValue.forEach(item => {
        existingRisksMap.set(item.hazard, item)
      })
    }

    const newRiskItems = prioritizedHazards.map(hazardKey => {
      const hazardLabel = getHazardLabel(hazardKey)
      const existingItem = existingRisksMap.get(hazardLabel) || existingRisksMap.get(hazardKey)
      
      if (existingItem) {
        return { ...existingItem, hazard: hazardLabel }
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
  }, [prioritizedHazards, initialValue, getHazardLabel])

  // Handle hazard filtering completion
  const handleFilteringComplete = useCallback((filteredHazards: string[]) => {
    setPrioritizedHazards(filteredHazards)
    if (filteredHazards.length > 0) {
      setCurrentPhase('smart_assessment')
    }
    if (setUserInteracted) {
      setUserInteracted()
    }
  }, [setUserInteracted])

  // Handle risk item updates
  const handleRiskUpdate = useCallback((updatedRisks: RiskItem[]) => {
    setRiskItems(updatedRisks)
    onComplete(updatedRisks)
    if (setUserInteracted) {
      setUserInteracted()
    }
  }, [onComplete, setUserInteracted])

  // Handle assessment completion
  const handleAssessmentComplete = () => {
    setCurrentPhase('summary')
    onComplete(riskItems)
  }

  // Enhanced navigation
  const NavigationBar = () => {
    const phases = [
      { id: 'intelligent_filtering', label: 'Smart Risk Filtering', icon: '🎯' },
      { id: 'smart_assessment', label: 'Risk Assessment', icon: '📊' },
      { id: 'summary', label: 'Portfolio Summary', icon: '📋' },
    ]

    const completedRisks = riskItems.filter(r => r.likelihood && r.severity).length

    return (
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <nav className="flex space-x-4">
            {phases.map((phase) => {
              const isActive = currentPhase === phase.id
              const isCompleted = (
                (phase.id === 'intelligent_filtering' && prioritizedHazards.length > 0) ||
                (phase.id === 'smart_assessment' && riskItems.some(r => r.likelihood && r.severity)) ||
                (phase.id === 'summary' && currentPhase === 'summary')
              )
              const isAccessible = (
                phase.id === 'intelligent_filtering' ||
                (phase.id === 'smart_assessment' && prioritizedHazards.length > 0) ||
                (phase.id === 'summary' && riskItems.some(r => r.likelihood && r.severity))
              )

              return (
                <button
                  key={phase.id}
                  onClick={() => isAccessible && setCurrentPhase(phase.id as WizardPhase)}
                  disabled={!isAccessible}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : isCompleted
                      ? 'border-green-500 text-green-600 hover:text-green-700'
                      : isAccessible
                      ? 'border-transparent text-gray-500 hover:text-gray-700'
                      : 'border-transparent text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span className="mr-2">{phase.icon}</span>
                  {phase.label}
                  {isCompleted && <span className="ml-2 text-xs">✓</span>}
                </button>
              )
            })}
          </nav>
          
          <div className="text-sm text-gray-600">
            {currentPhase === 'intelligent_filtering' 
              ? `${selectedHazards.length} initial risks`
              : currentPhase === 'smart_assessment'
              ? `${completedRisks} of ${riskItems.length} assessed`
              : `${riskItems.length} risks in portfolio`
            }
          </div>
        </div>
      </div>
    )
  }

  // If no hazards selected initially, show message
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

  return (
    <div className="space-y-6">
      <NavigationBar />
      
      {/* Phase content */}
      {currentPhase === 'intelligent_filtering' && (
        <HazardPrefilter
          selectedHazards={selectedHazards}
          onComplete={handleFilteringComplete}
          locationData={locationData}
          businessData={businessData}
          preFillData={preFillData}
          initialSelection={prioritizedHazards}
        />
      )}
      
      {currentPhase === 'smart_assessment' && prioritizedHazards.length > 0 && (
        <SmartRiskAssessment
          riskItems={riskItems}
          onUpdate={handleRiskUpdate}
          onComplete={handleAssessmentComplete}
          currentRiskIndex={currentRiskIndex}
          setCurrentRiskIndex={setCurrentRiskIndex}
          locationData={locationData}
          businessData={businessData}
        />
      )}
      
      {currentPhase === 'summary' && riskItems.length > 0 && (
        <RiskPortfolioSummary
          riskItems={riskItems}
          onUpdate={handleRiskUpdate}
          locationData={locationData}
          businessData={businessData}
        />
      )}
      
      {/* Advanced matrix view */}
      {/* The advanced matrix view is removed as per the new streamlined approach */}
    </div>
  )
} 

// New Unified Smart Risk Assessment Component
function SmartRiskAssessment({
  riskItems,
  onUpdate,
  onComplete,
  currentRiskIndex,
  setCurrentRiskIndex,
  locationData,
  businessData
}: {
  riskItems: RiskItem[]
  onUpdate: (items: RiskItem[]) => void
  onComplete: () => void
  currentRiskIndex: number
  setCurrentRiskIndex: (index: number) => void
  locationData?: any
  businessData?: any
}) {
  const t = useTranslations('common')
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview')
  
  // Calculate risk level from likelihood and severity
  const calculateRiskLevel = (likelihood: string, severity: string): { level: string; score: number } => {
    const l = parseInt(likelihood) || 0
    const s = parseInt(severity) || 0
    const score = l * s
    
    if (score >= 12) return { level: t('extremeRisk'), score }
    if (score >= 8) return { level: t('highRisk'), score }
    if (score >= 3) return { level: t('mediumRisk'), score }
    if (score >= 1) return { level: t('lowRisk'), score }
    return { level: '', score: 0 }
  }

  // Update risk item
  const updateRiskItem = (index: number, field: string, value: string) => {
    const updatedItems = [...riskItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Auto-calculate risk level when both likelihood and severity are set
    if (field === 'likelihood' || field === 'severity') {
      const item = updatedItems[index]
      const likelihood = field === 'likelihood' ? value : item.likelihood
      const severity = field === 'severity' ? value : item.severity
      
      if (likelihood && severity) {
        const { level, score } = calculateRiskLevel(likelihood, severity)
        updatedItems[index].riskLevel = level
        updatedItems[index].riskScore = score
      }
    }
    
    onUpdate(updatedItems)
  }

  const completedRisks = riskItems.filter(r => r.likelihood && r.severity).length
  const currentRisk = riskItems[currentRiskIndex] || null

  if (riskItems.length === 0) {
    return (
      <div className="text-center py-12 bg-blue-50 rounded border">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Smart Risk Assessment</h3>
        <p className="text-blue-700">We've automatically selected the most relevant risks for your Caribbean business. Assessment loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Caribbean Business Context Header */}
      <div className="bg-gradient-to-r from-blue-600 to-caribbean-blue-700 text-white rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">🌴 Caribbean Business Risk Assessment</h2>
        <p className="text-blue-100">
          Smart-filtered risks based on your {locationData?.parish && `${locationData.parish}, `}
          {businessData?.industryType && `${businessData.industryType} `}business profile
        </p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            <span>Auto-prioritized for Caribbean</span>
          </div>
          {locationData?.nearCoast && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
              <span>Coastal location considerations</span>
            </div>
          )}
        </div>
      </div>

      {/* Dual View Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel: Risk Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Risk Portfolio</h3>
              <span className="text-sm text-gray-600">{completedRisks}/{riskItems.length}</span>
            </div>
            
            <div className="space-y-2">
              {riskItems.map((risk, index) => {
                const isCompleted = risk.likelihood && risk.severity
                const isCurrent = index === currentRiskIndex
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      setCurrentRiskIndex(index)
                      setViewMode('detail')
                    }}
                    className={`p-3 rounded cursor-pointer transition-all border ${
                      isCurrent 
                        ? 'border-blue-500 bg-blue-50'
                        : isCompleted
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-700'
                      }`}>
                        {risk.hazard}
                      </span>
                      <div className="flex items-center space-x-2">
                        {isCompleted ? (
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            risk.riskScore >= 12 ? 'bg-black text-white' :
                            risk.riskScore >= 8 ? 'bg-red-600 text-white' :
                            risk.riskScore >= 3 ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                          }`}>
                            {risk.riskLevel}
                          </div>
                        ) : (
                          <span className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-lg font-bold text-gray-900">{completedRisks}</div>
                  <div className="text-xs text-gray-600">Assessed</div>
                </div>
                <div className="bg-red-50 rounded p-2">
                  <div className="text-lg font-bold text-red-900">
                    {riskItems.filter(r => r.riskScore >= 8).length}
                  </div>
                  <div className="text-xs text-red-600">High Priority</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Assessment Detail */}
        <div className="lg:col-span-2">
          {viewMode === 'overview' || !currentRisk ? (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Assessment Instructions</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 How This Works</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Click any risk on the left to start assessment</li>
                    <li>• Rate likelihood (1-4) and severity (1-4) for your business</li>
                    <li>• Risk level is calculated automatically</li>
                    <li>• Focus on high-priority risks first</li>
                  </ul>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✅ Caribbean Optimized</h4>
                    <p className="text-green-800 text-sm">
                      These risks have been pre-filtered based on Caribbean business patterns and your specific location/industry.
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">⚡ Quick & Focused</h4>
                    <p className="text-orange-800 text-sm">
                      Maximum 8 risks to keep assessments manageable for small businesses. Quality over quantity.
                    </p>
                  </div>
                </div>
                
                {completedRisks === riskItems.length && riskItems.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
                    <h4 className="font-semibold text-green-900 mb-2">🎉 Assessment Complete!</h4>
                    <p className="text-green-800 text-sm mb-3">
                      All risks assessed. Ready to view your portfolio summary and generate action plans.
                    </p>
                    <button
                      onClick={onComplete}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View Portfolio Summary →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <DetailedRiskAssessment
              risk={currentRisk}
              riskIndex={currentRiskIndex}
              updateRiskItem={updateRiskItem}
              onNext={() => {
                if (currentRiskIndex < riskItems.length - 1) {
                  setCurrentRiskIndex(currentRiskIndex + 1)
                } else if (completedRisks === riskItems.length) {
                  onComplete()
                }
              }}
              onPrevious={() => {
                if (currentRiskIndex > 0) {
                  setCurrentRiskIndex(currentRiskIndex - 1)
                }
              }}
              isLast={currentRiskIndex === riskItems.length - 1}
              isFirst={currentRiskIndex === 0}
              allComplete={completedRisks === riskItems.length}
            />
          )}
        </div>
      </div>
    </div>
  )
} 

// Detailed Risk Assessment Component
function DetailedRiskAssessment({
  risk,
  riskIndex,
  updateRiskItem,
  onNext,
  onPrevious,
  isLast,
  isFirst,
  allComplete
}: {
  risk: RiskItem
  riskIndex: number
  updateRiskItem: (index: number, field: string, value: string) => void
  onNext: () => void
  onPrevious: () => void
  isLast: boolean
  isFirst: boolean
  allComplete: boolean
}) {
  const t = useTranslations('common')

  const likelihoodOptions = [
    { value: '1', label: 'Rare', description: 'Unlikely in normal circumstances', context: 'May occur once in 10+ years' },
    { value: '2', label: 'Unlikely', description: 'Could occur but not expected', context: 'May occur once in 5-10 years' },
    { value: '3', label: 'Likely', description: 'Will probably occur', context: 'May occur once in 2-5 years' },
    { value: '4', label: 'Almost Certain', description: 'Expected to occur', context: 'May occur annually or more' }
  ]

  const severityOptions = [
    { value: '1', label: 'Minor', description: 'Minimal impact', context: 'Business continues with minor adjustments' },
    { value: '2', label: 'Moderate', description: 'Some disruption', context: 'Noticeable impact, manageable response' },
    { value: '3', label: 'Major', description: 'Significant disruption', context: 'Substantial impact requiring major response' },
    { value: '4', label: 'Severe', description: 'Business-threatening', context: 'Could threaten business survival' }
  ]

  const isComplete = risk.likelihood && risk.severity

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{risk.hazard}</h3>
            <p className="text-blue-100 text-sm">Risk {riskIndex + 1} Assessment</p>
          </div>
          {isComplete && (
            <div className={`px-4 py-2 rounded-full font-bold text-lg ${
              risk.riskScore >= 12 ? 'bg-black text-white' :
              risk.riskScore >= 8 ? 'bg-red-600 text-white' :
              risk.riskScore >= 3 ? 'bg-yellow-500 text-black' :
              'bg-green-500 text-white'
            }`}>
              {risk.riskLevel} ({risk.riskScore})
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Likelihood Assessment */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            How likely is this to affect your business?
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {likelihoodOptions.map(option => (
              <div
                key={option.value}
                onClick={() => updateRiskItem(riskIndex, 'likelihood', option.value)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  risk.likelihood === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    checked={risk.likelihood === option.value}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 text-blue-600 pointer-events-none"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    <div className="text-xs text-blue-600 mt-1">{option.context}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Assessment */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            How severe would the impact be on your business?
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {severityOptions.map(option => (
              <div
                key={option.value}
                onClick={() => updateRiskItem(riskIndex, 'severity', option.value)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  risk.severity === option.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    checked={risk.severity === option.value}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 text-orange-600 pointer-events-none"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    <div className="text-xs text-orange-600 mt-1">{option.context}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Level Display */}
        {isComplete && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Calculated Risk Level</h4>
                <p className="text-sm text-gray-600">
                  Likelihood ({risk.likelihood}) × Severity ({risk.severity}) = {risk.riskScore}
                </p>
              </div>
              <div className={`px-6 py-3 rounded-full font-bold text-lg ${
                risk.riskScore >= 12 
                  ? 'bg-black text-white'
                  : risk.riskScore >= 8
                  ? 'bg-red-600 text-white'
                  : risk.riskScore >= 3
                  ? 'bg-yellow-500 text-black'
                  : 'bg-green-500 text-white'
              }`}>
                {risk.riskLevel}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 border-t px-6 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous Risk
          </button>
          
          <div className="flex items-center space-x-3">
            {isComplete ? (
              <span className="text-sm text-green-600 font-medium">✓ Assessment Complete</span>
            ) : (
              <span className="text-sm text-gray-500">Select likelihood and severity</span>
            )}
            <button
              onClick={onNext}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isComplete || allComplete
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLast && allComplete ? 'Complete Assessment' : 
               isLast ? 'Finish Later' : 
               'Next Risk'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 