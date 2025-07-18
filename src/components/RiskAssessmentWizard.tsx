'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { HazardPrefilter } from './HazardPrefilter'
import { GuidedRiskAssessment } from './GuidedRiskAssessment'
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
}

type WizardPhase = 'prefilter' | 'guided' | 'summary' | 'matrix'

export function RiskAssessmentWizard({ 
  selectedHazards, 
  onComplete, 
  initialValue, 
  setUserInteracted,
  locationData,
  businessData
}: RiskAssessmentWizardProps) {
  const [currentPhase, setCurrentPhase] = useState<WizardPhase>('prefilter')
  const [prioritizedHazards, setPrioritizedHazards] = useState<string[]>([])
  const [riskItems, setRiskItems] = useState<RiskItem[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
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

  // Handle hazard prefiltering completion
  const handlePrefilterComplete = useCallback((filteredHazards: string[]) => {
    setPrioritizedHazards(filteredHazards)
    if (filteredHazards.length > 0) {
      setCurrentPhase('guided')
    }
    if (setUserInteracted) {
      setUserInteracted()
    }
  }, [setUserInteracted])

  // Handle guided assessment completion
  const handleGuidedComplete = useCallback((assessedRisks: RiskItem[]) => {
    setRiskItems(assessedRisks)
    setCurrentPhase('summary')
    onComplete(assessedRisks)
    if (setUserInteracted) {
      setUserInteracted()
    }
  }, [onComplete, setUserInteracted])

  // Handle risk item updates during guided assessment
  const handleRiskUpdate = useCallback((updatedRisks: RiskItem[]) => {
    setRiskItems(updatedRisks)
    onComplete(updatedRisks)
    if (setUserInteracted) {
      setUserInteracted()
    }
  }, [onComplete, setUserInteracted])

  // Handle phase navigation
  const handlePhaseChange = (phase: WizardPhase) => {
    setCurrentPhase(phase)
  }

  // Navigation bar component
  const NavigationBar = () => {
    const phases = [
      { id: 'prefilter', label: t('hazardSelection'), icon: '🎯' },
      { id: 'guided', label: t('riskAssessment'), icon: '📊' },
      { id: 'summary', label: t('summary'), icon: '📋' },
    ]

    return (
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <nav className="flex space-x-4">
            {phases.map((phase, index) => {
              const isActive = currentPhase === phase.id
              const isCompleted = (
                (phase.id === 'prefilter' && prioritizedHazards.length > 0) ||
                (phase.id === 'guided' && riskItems.some(r => r.likelihood && r.severity)) ||
                (phase.id === 'summary' && currentPhase === 'summary')
              )
              const isAccessible = (
                phase.id === 'prefilter' ||
                (phase.id === 'guided' && prioritizedHazards.length > 0) ||
                (phase.id === 'summary' && riskItems.some(r => r.likelihood && r.severity))
              )

              return (
                <button
                  key={phase.id}
                  onClick={() => isAccessible && handlePhaseChange(phase.id as WizardPhase)}
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
          
          {/* Advanced tools toggle */}
          <div className="flex items-center space-x-4">
            {riskItems.length > 0 && (
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {showAdvanced ? t('hideAdvanced') : t('showAdvanced')}
              </button>
            )}
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
      {currentPhase === 'prefilter' && (
        <HazardPrefilter
          selectedHazards={selectedHazards}
          onComplete={handlePrefilterComplete}
          locationData={locationData}
          businessData={businessData}
          initialSelection={prioritizedHazards}
        />
      )}
      
      {currentPhase === 'guided' && prioritizedHazards.length > 0 && (
        <GuidedRiskAssessment
          selectedHazards={prioritizedHazards}
          onComplete={handleGuidedComplete}
          onUpdate={handleRiskUpdate}
          riskItems={riskItems}
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
      {showAdvanced && riskItems.length > 0 && (
        <div className="border-t pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('advancedRiskMatrix')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('advancedMatrixDescription')}
            </p>
          </div>
          <RiskAssessmentMatrix
            selectedHazards={prioritizedHazards}
            onComplete={handleRiskUpdate}
            initialValue={riskItems}
            setUserInteracted={setUserInteracted}
          />
        </div>
      )}
    </div>
  )
} 