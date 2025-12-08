'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import type { Locale } from '../i18n/config'

interface RiskItem {
  hazard: string
  hazardId: string
  likelihood: string
  severity: string
  riskLevel: string
  riskScore: number
  planningMeasures: string
  isSelected: boolean // Whether this risk applies to the business
  isCalculated?: boolean
  reasoning?: string
  confidence?: string
  riskTier?: number // 1 = highly recommended, 2 = recommended, 3 = available
  riskCategory?: string
  userLabel?: string
  initialTier?: number // The tier at pre-fill (determines which section it appears in)
  initialRiskScore?: number // The original pre-fill score (for reference)
  baseScore?: number // Base score before multipliers
  appliedMultipliers?: string // String of applied multipliers
}

interface SimplifiedRiskAssessmentProps {
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
  preFillData?: any
}

export function SimplifiedRiskAssessment({
  selectedHazards,
  onComplete,
  initialValue,
  setUserInteracted,
  locationData,
  businessData,
  preFillData
}: SimplifiedRiskAssessmentProps) {
  const [riskItems, setRiskItems] = useState<RiskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAdminData, setHasAdminData] = useState(false)
  const [confidenceLevels, setConfidenceLevels] = useState<Map<string, string>>(new Map())
  const [showAvailableRisks, setShowAvailableRisks] = useState(false)

  const t = useTranslations('common')
  const tSteps = useTranslations('steps.riskAssessment')
  const locale = useLocale() as Locale

  // Helper to translate risk names from camelCase/snake_case to proper translation
  const translateRiskName = (riskName: string) => {
    if (!riskName) return riskName

    // Convert camelCase to snake_case
    const snakeCase = riskName
      .replace(/ /g, '_')
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/_+/g, '_')

    // Try to get translation
    const translationKey = `steps.riskAssessment.hazardLabels.${snakeCase}`
    const translation = tSteps(`hazardLabels.${snakeCase}` as any)

    // Check if translation was found (it returns the key if not found)
    if (translation && !translation.includes('hazardLabels')) {
      return translation
    }

    // Fallback: return formatted risk name (capitalize first letter of each word)
    return riskName.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase())
  }

  // Get localized hazard label
  const getHazardLabel = (hazardKey: string): string => {
    try {
      const translatedLabel = tSteps(`hazardLabels.${hazardKey}`)

      if (translatedLabel && translatedLabel !== `hazardLabels.${hazardKey}` && translatedLabel !== `steps.riskAssessment.hazardLabels.${hazardKey}`) {
        return translatedLabel
      }

      return hazardKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    } catch (error) {
      return hazardKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  // Initialize from prefill data when available
  useEffect(() => {
    // Allow re-initialization when initialValue changes (e.g., reset button clicked)
    // Skip only if: we have ALL risks loaded (including available) AND selections match initialValue
    if (riskItems.length > 0 && !loading && preFillData?.hazards) {
      const hasUserData = initialValue && initialValue.length > 0

      // Check if we have all expected risks loaded (from preFillData)
      const expectedRiskCount = preFillData.hazards.length
      const hasAllRisks = riskItems.length === expectedRiskCount

      if (hasAllRisks) {
        if (hasUserData) {
          // Check if ALL risks (not just selected) match initialValue
          // Compare both hazardId AND isSelected status
          const dataMatch = riskItems.every(currentRisk => {
            const matchingInitial = initialValue.find((iv: any) => iv.hazardId === currentRisk.hazardId)
            return matchingInitial && matchingInitial.isSelected === currentRisk.isSelected
          })

          if (dataMatch) {
            return
          }
        } else {
          // No user data but have all risks - skip
          return
        }
      }
    }

    if (preFillData?.hazards && preFillData.hazards.length > 0) {
      const initialRisks: RiskItem[] = preFillData.hazards.map((hazard: any) => {
        // Check if this risk already has assessment data
        const existingData = initialValue?.find(item =>
          item.hazard === hazard.hazardName || item.hazardId === hazard.hazardId
        )

        // Map backend risk calculations to UI values
        const mapBackendToUIValue = (backendValue: string | number, type: 'likelihood' | 'severity'): string => {
          // If already a number (from 1-10 scale), return as string
          if (typeof backendValue === 'number') {
            return String(backendValue)
          }

          // If no value, return default
          if (!backendValue) {
            return type === 'likelihood' ? '1' : '5'
          }

          // Convert string labels to numeric values
          const valueStr = String(backendValue).toLowerCase()

          if (type === 'likelihood') {
            const mapping: Record<string, string> = {
              'rare': '1',
              'unlikely': '2',
              'possible': '3',
              'likely': '4',
              'almost_certain': '4'
            }
            return mapping[valueStr] || '3'
          } else {
            const mapping: Record<string, string> = {
              'minimal': '1',
              'minor': '2',
              'moderate': '3',
              'major': '4',
              'catastrophic': '4'
            }
            return mapping[valueStr] || '3'
          }
        }

        // Get pre-calculated values from risk assessment matrix if available
        const riskMatrixEntry = preFillData?.preFilledFields?.RISK_ASSESSMENT?.['Risk Assessment Matrix']?.find(
          (entry: any) => {
            const entryHazard = entry.hazard || entry.Hazard || entry.hazardName || ''
            return entryHazard === hazard.hazardName || entryHazard.toLowerCase().includes(hazard.hazardId)
          }
        )

        let prefilledLikelihood = existingData?.likelihood || ''
        let prefilledSeverity = existingData?.severity || ''
        let prefilledRiskLevel = existingData?.riskLevel || hazard.riskLevel || ''
        let prefilledRiskScore = existingData?.riskScore || 0

        // Use backend calculations if available
        if (riskMatrixEntry && !existingData) {
          prefilledLikelihood = mapBackendToUIValue(riskMatrixEntry.likelihood, 'likelihood')
          prefilledSeverity = mapBackendToUIValue(riskMatrixEntry.severity, 'severity')
          prefilledRiskLevel = riskMatrixEntry.riskLevel || hazard.riskLevel || ''
          prefilledRiskScore = riskMatrixEntry.riskScore || 0
        }

        // Determine if this risk should be selected
        // CRITICAL: Only use backend pre-selection flag - NO auto-selection fallbacks!
        // PRIORITY: User's previous choice > Backend pre-selection flag > NOTHING (default false)
        let shouldBeSelected = false

        // NEVER pre-select risks marked as 'not_applicable' (level=0 from parish)
        const isNotApplicable = prefilledRiskLevel === 'not_applicable' ||
          riskMatrixEntry?.riskLevel === 'not_applicable' ||
          hazard.riskLevel === 'not_applicable'

        if (existingData && existingData.isSelected !== undefined) {
          // User has EXPLICITLY set isSelected - preserve their choice
          shouldBeSelected = existingData.isSelected
        } else {
          // No explicit user choice - use backend initialization
          // The backend now sets isSelected = isPreSelected, so we can trust it
          if (riskMatrixEntry?.isSelected !== undefined) {
            shouldBeSelected = riskMatrixEntry.isSelected
          } else if (riskMatrixEntry?.isPreSelected === true) {
            // Fallback to isPreSelected if isSelected is missing
            shouldBeSelected = true
          } else {
            // Default: NOT selected
            shouldBeSelected = false
          }
        }

        return {
          hazard: hazard.hazardName || getHazardLabel(hazard.hazardId),
          hazardId: hazard.hazardId,
          likelihood: prefilledLikelihood,
          severity: prefilledSeverity,
          riskLevel: prefilledRiskLevel,
          riskScore: prefilledRiskScore,
          planningMeasures: existingData?.planningMeasures || '',
          isSelected: shouldBeSelected, // Use backend pre-selection logic OR user's previous choice
          isPreSelected: riskMatrixEntry?.isPreSelected || hazard.isPreSelected || false, // CRITICAL: Preserve backend auto-selection flag
          // CRITICAL FIX: Always mark as calculated if we have backend data with baseScore
          isCalculated: !!(riskMatrixEntry?.baseScore !== undefined),
          reasoning: riskMatrixEntry?.reasoning || '', // Only use backend reasoning, no generic fallback
          // CRITICAL: Pass through initial tier and score from backend
          initialTier: riskMatrixEntry?.initialTier || riskMatrixEntry?.riskTier ||
            (prefilledRiskScore >= 7.0 ? 1 : prefilledRiskScore >= 5.0 ? 2 : 3),
          initialRiskScore: riskMatrixEntry?.initialRiskScore || prefilledRiskScore,
          riskTier: riskMatrixEntry?.riskTier ||
            (prefilledRiskScore >= 7.0 ? 1 : prefilledRiskScore >= 5.0 ? 2 : 3),
          riskCategory: riskMatrixEntry?.riskCategory,
          // Pass through multiplier information
          baseScore: riskMatrixEntry?.baseScore,
          appliedMultipliers: riskMatrixEntry?.appliedMultipliers
        }
      })

      setRiskItems(initialRisks)
      setHasAdminData(true)
      setLoading(false)
      return
    }

    // Fallback: fetch admin calculations if no prefill data AND we have selectedHazards
    const fetchAdminData = async () => {
      if (selectedHazards.length === 0) {
        // If no prefill data and no selectedHazards, show empty state
        setLoading(false)
        return
      }

      try {
        const businessTypeId = preFillData?.industry?.id || businessData?.industryType
        const location = preFillData?.location || locationData

        if (!businessTypeId) {
          setHasAdminData(false)
          setLoading(false)
          return
        }

        const requestBody = {
          hazardIds: selectedHazards,
          businessTypeId,
          countryCode: location?.countryCode,
          parish: location?.parish,
          nearCoast: location?.nearCoast || false,
          urbanArea: location?.urbanArea || false,
          locale
        }

        const response = await fetch('/api/wizard/get-risk-calculations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) {
          const data = await response.json()

          const calculatedRisks: RiskItem[] = selectedHazards.map(hazardId => {
            const hazardLabel = getHazardLabel(hazardId)
            const calculation = data.riskCalculations?.find((calc: any) => calc.hazardId === hazardId)
            const existingData = initialValue?.find(item =>
              item.hazard === hazardLabel || item.hazardId === hazardId
            )

            return {
              hazard: hazardLabel,
              hazardId,
              likelihood: existingData?.likelihood || '',
              severity: existingData?.severity || '',
              riskLevel: existingData?.riskLevel || '',
              riskScore: existingData?.riskScore || 0,
              planningMeasures: existingData?.planningMeasures || '',
              isSelected: calculation ? calculation.finalRiskLevel === 'high' || calculation.finalRiskLevel === 'very_high' : !!existingData,
              isCalculated: !!calculation,
              reasoning: calculation?.reasoning,
              confidence: calculation?.confidence
            }
          })

          setRiskItems(calculatedRisks)
          setHasAdminData(true)

          // Set confidence levels
          const newConfidenceLevels = new Map()
          data.riskCalculations?.forEach((calc: any) => {
            newConfidenceLevels.set(calc.hazardId, calc.confidence)
          })
          setConfidenceLevels(newConfidenceLevels)
        }
      } catch (error) {
        setError('Failed to load smart risk calculations')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [preFillData, selectedHazards, initialValue, businessData, locationData, tSteps])

  // Calculate risk level using 1-10 scale with admin formula
  const calculateRiskLevel = useCallback((likelihood: string | number, severity: string | number): { level: string; score: number; color: string } => {
    const l = typeof likelihood === 'string' ? parseInt(likelihood) || 0 : likelihood
    const s = typeof severity === 'string' ? parseInt(severity) || 0 : severity

    // Admin formula: (Likelihood × 0.6) + (Severity × 0.4)
    const score = (l * 0.6) + (s * 0.4)

    const veryHighRisk = 'Very High'
    const highRisk = 'High'
    const mediumRisk = 'Medium'
    const lowRisk = 'Low'
    const veryLowRisk = 'Very Low'

    if (score >= 8) {
      return { level: veryHighRisk, score: Number(score.toFixed(1)), color: 'bg-red-600 text-white border-2 border-red-700' }
    }
    if (score >= 6) {
      return { level: highRisk, score: Number(score.toFixed(1)), color: 'bg-orange-500 text-white border-2 border-orange-600' }
    }
    if (score >= 4) {
      return { level: mediumRisk, score: Number(score.toFixed(1)), color: 'bg-yellow-500 text-black border-2 border-yellow-600' }
    }
    if (score >= 2) {
      return { level: lowRisk, score: Number(score.toFixed(1)), color: 'bg-green-500 text-white border-2 border-green-600' }
    }
    return { level: veryLowRisk, score: Number(score.toFixed(1)), color: 'bg-gray-300 text-gray-700 border border-gray-400' }
  }, [t])

  // Update risk item
  const updateRiskItem = useCallback((index: number, field: keyof RiskItem, value: string | boolean) => {
    if (setUserInteracted) {
      setUserInteracted()
    }

    setRiskItems(prevItems => {
      const updatedItems = [...prevItems]
      const currentItem = { ...updatedItems[index] }

      if (field === 'isSelected') {
        currentItem.isSelected = value as boolean
        // Clear user input if deselecting, but preserve original riskLevel for categorization
        if (!value) {
          currentItem.likelihood = ''
          currentItem.severity = ''
          // DON'T clear riskLevel - we need it to know if this was 'not_applicable' or pre-filled
          // currentItem.riskScore = 0 // DON'T clear risk score - we need it for tier calculation even if deselected
          currentItem.planningMeasures = ''
        } else {
          // When selecting a risk, ensure it has default values if it was an "available" risk (level=0)
          const wasAvailable = currentItem.riskLevel === 'not_applicable'
          if (!currentItem.likelihood || currentItem.likelihood === '0' || currentItem.likelihood === '') {
            currentItem.likelihood = '1'
          }
          if (!currentItem.severity || currentItem.severity === '0' || currentItem.severity === '') {
            currentItem.severity = '5' // Default to moderate severity
          }
          // Calculate risk level for newly selected available risks
          if (wasAvailable || !currentItem.riskLevel) {
            const { level, score } = calculateRiskLevel(currentItem.likelihood, currentItem.severity)
            currentItem.riskLevel = level
            currentItem.riskScore = score
          }
        }
      } else if (field === 'likelihood' || field === 'severity') {
        currentItem[field] = value as string
        currentItem.isCalculated = false // Mark as manually adjusted

        // Recalculate risk level if both values exist
        const newLikelihood = field === 'likelihood' ? value as string : currentItem.likelihood
        const newSeverity = field === 'severity' ? value as string : currentItem.severity

        if (newLikelihood && newSeverity) {
          const { level, score } = calculateRiskLevel(newLikelihood, newSeverity)
          currentItem.riskLevel = level
          currentItem.riskScore = score
        } else {
          currentItem.riskLevel = ''
          currentItem.riskScore = 0
        }
      } else if (field === 'planningMeasures') {
        currentItem.planningMeasures = value as string
      } else {
        // For other fields, handle them explicitly
        (currentItem as Record<string, unknown>)[field] = value
      }

      updatedItems[index] = currentItem
      return updatedItems
    })
  }, [setUserInteracted, calculateRiskLevel])

  // Notify parent of changes - ONLY when user interacts, not during initialization
  useEffect(() => {
    // Skip if still loading (initialization phase)
    if (loading) return

    // Skip if no risks loaded yet
    if (riskItems.length === 0) return

    const timeoutId = setTimeout(() => {
      // Send ALL risks to parent (selected and unselected)
      // This prevents re-initialization loop when unselected risks are "lost"
      onComplete(riskItems)  // Send ALL risks, not just selected
    }, 100) // 100ms debounce

    return () => clearTimeout(timeoutId)
  }, [riskItems, onComplete, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('loadingRiskAssessment')}</h3>
          <p className="text-gray-600 text-sm">{t('analyzingRisks')}</p>
        </div>
      </div>
    )
  }

  if (riskItems.length === 0 && !loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <svg className="h-12 w-12 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-blue-900 mb-2">{t('noRisksLoaded')}</h3>
        <p className="text-blue-700 mb-4">
          {t('riskAssessmentAutoLoaded')}
        </p>
        {preFillData ? (
          <div className="text-sm text-blue-600">
            <p>✓ {t('preFillAvailable')}: {preFillData.industry?.name || t('unknownBusiness')}</p>
            <p>✓ Location: {preFillData.location?.parish || locationData?.parish || t('unknownLocation')}</p>
            <p className="mt-2 text-blue-800">{t('noHazardsInPrefill')}</p>
          </div>
        ) : (
          <div className="text-sm text-blue-600">
            <p>❌ {t('noPreFillData')}</p>
            <p>{t('selectedHazards')}: {selectedHazards.length}</p>
          </div>
        )}
      </div>
    )
  }

  // Separate risks by INITIAL tier for display
  // This ensures risks stay in their original section even if user adjusts sliders
  // Visual styling will update dynamically, but cards won't jump between sections

  // Tier 1: Highly Recommended - Use initialTier (from pre-fill) to determine section
  const highlyRecommendedRisks = riskItems.filter(item => {
    const score = item.initialRiskScore || item.riskScore || 0
    const tier = item.initialTier || (score >= 7.0 ? 1 : score >= 5.0 ? 2 : 3)
    return tier === 1
  })

  // Tier 2: Recommended
  const recommendedRisks = riskItems.filter(item => {
    const score = item.initialRiskScore || item.riskScore || 0
    const tier = item.initialTier || (score >= 7.0 ? 1 : score >= 5.0 ? 2 : 3)
    return tier === 2
  })

  // Tier 3: Available (low priority or not applicable)
  const availableRisks = riskItems.filter(item => {
    const score = item.initialRiskScore || item.riskScore || 0
    const tier = item.initialTier || (score >= 7.0 ? 1 : score >= 5.0 ? 2 : 3)
    const isNotApplicable = item.riskLevel === 'not_applicable'
    return tier === 3 || isNotApplicable || score < 5.0
  })

  // Legacy grouping for backwards compatibility
  const preSelectedRisks = riskItems.filter(item =>
    item.riskLevel !== 'not_applicable' && item.riskLevel !== '' && item.riskScore >= 5.0
  )

  // Selected risks for summary and onComplete (only actually checked risks)
  const selectedRisks = riskItems.filter(item => item.isSelected)
  const assessedRisks = selectedRisks.filter(item => item.likelihood && item.severity)
  const highPriorityRisks = assessedRisks.filter(item => item.riskScore >= 7)

  // Render individual risk card
  const renderRiskCard = (risk: any, actualIndex: number) => {
    const isAvailable = risk.riskLevel === 'not_applicable'

    // CRITICAL: Use CURRENT risk score to determine visual styling (not initial tier)
    // This allows the card appearance to update as user adjusts sliders
    // But the card stays in its original section (determined by initialTier)
    const currentScore = risk.riskScore || 0
    const currentTier = currentScore >= 7.0 ? 1 : currentScore >= 5.0 ? 2 : 3

    // Determine tier badge based on CURRENT calculated score
    let tierBadge = null
    let tierLabel = ''
    if (currentTier === 1) {
      tierLabel = 'Critical Priority'
      tierBadge = (
        <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-300">
          🔴 {tierLabel}
        </span>
      )
    } else if (currentTier === 2) {
      tierLabel = 'Important'
      tierBadge = (
        <span className="px-2 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 border border-orange-300">
          🟡 {tierLabel}
        </span>
      )
    } else if (!isAvailable) {
      tierLabel = 'Lower Priority'
      tierBadge = (
        <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700 border border-gray-300">
          ⚪ {tierLabel}
        </span>
      )
    }

    return (
      <div
        key={risk.hazardId}
        className={`bg-white border-2 rounded-lg overflow-hidden transition-all duration-300 ${risk.isSelected
          ? currentTier === 1
            ? 'border-red-400 shadow-lg ring-2 ring-red-200'
            : currentTier === 2
              ? 'border-orange-400 shadow-lg ring-2 ring-orange-200'
              : 'border-blue-500 shadow-md'
          : isAvailable
            ? 'border-gray-200 hover:border-gray-300'
            : currentTier === 1
              ? 'border-red-200 hover:border-red-300'
              : currentTier === 2
                ? 'border-orange-200 hover:border-orange-300'
                : 'border-gray-200 hover:border-gray-300'
          }`}
      >
        {/* Risk Header */}
        <div className={`p-4 transition-colors duration-300 ${risk.isSelected && currentTier === 1 ? 'bg-red-50' :
          risk.isSelected && currentTier === 2 ? 'bg-orange-50' :
            risk.isSelected && currentTier === 3 ? 'bg-gray-50' :
              risk.isSelected ? 'bg-blue-50' : ''
          }`}>
          <div className="flex items-start space-x-3">
            <label className="flex items-center mt-1 cursor-pointer group">
              <input
                type="checkbox"
                checked={risk.isSelected}
                onChange={(e) => updateRiskItem(actualIndex, 'isSelected', e.target.checked)}
                className={`h-6 w-6 border-2 rounded focus:ring-2 transition-all duration-300 ${currentTier === 1 ? 'text-red-600 border-red-300 focus:ring-red-500' :
                  currentTier === 2 ? 'text-orange-600 border-orange-300 focus:ring-orange-500' :
                    'text-blue-600 border-gray-300 focus:ring-blue-500'
                  }`}
              />
            </label>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{translateRiskName(risk.hazard)}</h3>
                    {tierBadge}
                  </div>
                  {!isAvailable && risk.riskScore > 0 && (
                    <div className="text-sm text-gray-600 mb-1">
                      <span className={`font-bold transition-colors duration-300 ${currentTier === 1 ? 'text-red-700' :
                        currentTier === 2 ? 'text-orange-700' :
                          'text-gray-700'
                        }`}>{risk.riskScore?.toFixed(1)}/10</span> {t('riskScoreLabel')}
                    </div>
                  )}
                  {isAvailable && (
                    <p className="text-sm text-gray-500 mt-1">
                      ⚪ {t('notSignificantInLocation', { location: locationData?.parish || 'this location' })}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  {risk.isCalculated && !isAvailable && (
                    <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 border border-green-200" title={t('preFilledForYou')}>
                      ✨ {t('preFilled')}
                    </span>
                  )}
                </div>
              </div>

              {/* Simple reasoning preview - only if meaningful */}
              {risk.reasoning && !isAvailable && risk.isSelected && !risk.isCalculated && (() => {
                const isGeneric = risk.reasoning.includes('risk requires your attention') ||
                  risk.reasoning.includes('Based on') && !risk.reasoning.includes('📍') ||
                  risk.reasoning.length < 50

                if (isGeneric) return null

                return (
                  <div className="mt-2 text-xs text-gray-600 bg-white bg-opacity-60 rounded p-2 border border-gray-200">
                    💡 <span className="font-medium">{t('whyRiskMatters')}:</span> {risk.reasoning.split('\n')[0]}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Assessment Section - Only show when selected */}
        {risk.isSelected && (
          <div className="border-t bg-gray-50 p-4">
            {risk.isCalculated && risk.reasoning && !isAvailable && (() => {
              // Only show if reasoning is meaningful (not generic fallback text)
              const isGeneric = risk.reasoning.includes('risk requires your attention') ||
                risk.reasoning.includes('Based on') && !risk.reasoning.includes('📍') ||
                risk.reasoning.length < 50

              if (isGeneric) return null

              // Clean up any JSON objects in the reasoning text
              let cleanedReasoning = risk.reasoning
              if (typeof cleanedReasoning === 'string') {
                // Remove JSON-like objects and extract the localized text
                cleanedReasoning = cleanedReasoning.replace(/\{[^}]*"en"\s*:\s*"[^"]*"[^}]*\}/g, (match) => {
                  try {
                    const parsed = JSON.parse(match)
                    return parsed.en || parsed.es || parsed.fr || match
                  } catch {
                    // Extract English value if JSON parsing fails
                    const enMatch = match.match(/"en"\s*:\s*"([^"]+)"/)
                    return enMatch ? enMatch[1] : match
                  }
                })
              }

              // Split reasoning into parts and display nicely
              const reasoningLines = cleanedReasoning.split('\n').filter(line => line.trim())

              return (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-900">
                    <strong>💡 {t('whyRiskMatters')}:</strong>
                    <div className="mt-2 space-y-2">
                      {reasoningLines.map((line, idx) => (
                        <p key={idx} className="text-blue-800">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Likelihood */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('likelihoodOccurrence')}
                  {risk.isCalculated && (
                    <span className="ml-2 text-xs font-normal text-gray-500">✨ {t('preFilledFromLocation')}</span>
                  )}
                </label>
                <div className="bg-blue-50 p-3 rounded-lg mb-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={risk.likelihood || 1}
                    onChange={(e) => updateRiskItem(actualIndex, 'likelihood', e.target.value)}
                    disabled={risk.isCalculated}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between text-xs text-gray-700 mt-2">
                    <span>1-3: {t('likelihoodRanges.rare')}</span>
                    <span className="font-bold text-blue-600 text-lg">{risk.likelihood || 1}/10</span>
                    <span>4-6: {t('likelihoodRanges.possible')}</span>
                    <span>7-8: {t('likelihoodRanges.likely')}</span>
                    <span>9-10: {t('likelihoodRanges.certain')}</span>
                  </div>
                </div>
                {risk.isCalculated && !isAvailable && locationData?.parish && (
                  <p className="text-xs text-blue-600 mt-1">
                    ✨ {t('basedOnYourLocation', { location: locationData.parish })}
                  </p>
                )}
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('impactSeverity')}
                </label>
                <div className="bg-orange-50 p-3 rounded-lg mb-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={risk.severity || 1}
                    onChange={(e) => updateRiskItem(actualIndex, 'severity', e.target.value)}
                    className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex justify-between text-xs text-gray-700 mt-2">
                    <span>1-3: {t('severityRanges.minor')}</span>
                    <span className="font-bold text-orange-600 text-lg">{risk.severity || 1}/10</span>
                    <span>4-6: {t('severityRanges.moderate')}</span>
                    <span>7-8: {t('severityRanges.major')}</span>
                    <span>9-10: {t('severityRanges.severe')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Level Display */}
            {(risk.likelihood || 0) > 0 && (risk.severity || 0) > 0 && (
              <div className="mt-4 p-4 bg-white border-2 border-gray-300 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-2">{t('yourRiskLevel')}</div>
                    <div className="text-xs text-gray-600">
                      {t('riskScoreLabel')}: <span className="font-semibold text-gray-800">{risk.riskScore?.toFixed(1) || calculateRiskLevel(risk.likelihood || '1', risk.severity || '1').score}/10</span>
                    </div>
                  </div>
                  <div className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap ${calculateRiskLevel(risk.likelihood || '1', risk.severity || '1').color}`}>
                    {calculateRiskLevel(risk.likelihood || '1', risk.severity || '1').level}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎯 {t('riskAssessment')}</h2>
            <p className="text-blue-100">
              {t('basedOn', { businessType: businessData?.industryType || '', location: locationData?.parish || 'your location' })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">{t('progressLabel')}</div>
            <div className="text-2xl font-bold">{assessedRisks.length}/{preSelectedRisks.length}</div>
          </div>
        </div>

        {hasAdminData && (
          <div className="mt-4 bg-blue-800 bg-opacity-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-100 text-sm">{t('personalizedForYourBusiness')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-2">{t('reviewYourRisks')}</h3>
            <p className="text-sm text-gray-600 mb-3">
              {t('reviewRisksDescription')}
            </p>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-4 h-4 bg-red-100 border border-red-300 rounded flex items-center justify-center text-xs font-medium text-red-700 mt-0.5">1</span>
                <p className="text-gray-600"><strong className="text-gray-800">{t('criticalPriorityLabel')}:</strong> {t('criticalPriorityDescription')}</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-4 h-4 bg-orange-100 border border-orange-300 rounded flex items-center justify-center text-xs font-medium text-orange-700 mt-0.5">2</span>
                <p className="text-gray-600"><strong className="text-gray-800">{t('importantLabel')}:</strong> {t('importantDescription')}</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-4 h-4 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs font-medium text-gray-700 mt-0.5">3</span>
                <p className="text-gray-600"><strong className="text-gray-800">{t('optionalLabel')}:</strong> {t('optionalDescription')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 1: Highly Recommended (Critical Risks) */}
      {highlyRecommendedRisks.length > 0 && (
        <div className="space-y-3">
          <div className="sticky top-0 z-10 bg-red-50 border-l-4 border-red-600 rounded-r-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('criticalPriorityRisks')}</h3>
                  <p className="text-sm text-gray-600">{t('highestThreatLevel')}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-red-100 border border-red-300 text-red-800 text-sm font-medium">
                  {highlyRecommendedRisks.length} risk{highlyRecommendedRisks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {highlyRecommendedRisks.map((risk) => {
              const actualIndex = riskItems.findIndex(r => r.hazardId === risk.hazardId)
              return renderRiskCard(risk, actualIndex)
            })}
          </div>
        </div>
      )}

      {/* Tier 2: Recommended (Important Risks) */}
      {recommendedRisks.length > 0 && (
        <div className="space-y-3">
          <div className="sticky top-0 z-10 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('importantRisks')}</h3>
                  <p className="text-sm text-gray-600">{t('significantRisks')}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-orange-100 border border-orange-300 text-orange-800 text-sm font-medium">
                  {recommendedRisks.length} risk{recommendedRisks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {recommendedRisks.map((risk) => {
              const actualIndex = riskItems.findIndex(r => r.hazardId === risk.hazardId)
              return renderRiskCard(risk, actualIndex)
            })}
          </div>
        </div>
      )}

      {/* Tier 3: Available Risks (Collapsible) */}
      {availableRisks.length > 0 && (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          <button
            onClick={() => setShowAvailableRisks(!showAvailableRisks)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors duration-150 group"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showAvailableRisks ? 'transform rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900">{t('otherAvailableRisks')}</h3>
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                    {t('optionalLabel')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  {showAvailableRisks ? t('clickToCollapse') : t('lowerPriorityRisks')}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-gray-200 text-gray-700 text-sm font-medium">
                {availableRisks.length} {t('availableCount')}
              </span>
            </div>
          </button>

          {showAvailableRisks && (
            <div className="border-t-2 border-gray-300 p-4 space-y-3 bg-white">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-blue-900">
                  {t('availableRisksNote')}
                </p>
              </div>
              {availableRisks.map((risk) => {
                const actualIndex = riskItems.findIndex(r => r.hazardId === risk.hazardId)
                return renderRiskCard(risk, actualIndex)
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {preSelectedRisks.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('assessmentSummary')}</h3>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{selectedRisks.length}</div>
              <div className="text-sm text-blue-700">{t('selectedRisksCount')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{assessedRisks.length}</div>
              <div className="text-sm text-green-700">{t('fullyAssessed')}</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-900">{highPriorityRisks.length}</div>
              <div className="text-sm text-red-700">{t('highPriorityCount')}</div>
            </div>
          </div>

          {highPriorityRisks.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="font-medium text-red-900">{t('highPriorityIdentified')}</span>
              </div>
              <p className="text-red-800 text-sm">
                {t('highPriorityDescription', { count: highPriorityRisks.length })}: {' '}
                {highPriorityRisks.map(r => r.hazard).join(', ')}
              </p>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p>
              {t('completeAssessmentNote')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

