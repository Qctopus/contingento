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
          
          console.log('🔍 Re-init guard check:', {
            currentRisksCount: riskItems.length,
            currentSelected: riskItems.filter(r => r.isSelected).map(r => r.hazardId),
            initialValueCount: initialValue.length,
            initialSelected: initialValue.filter((iv: any) => iv.isSelected).map((iv: any) => iv.hazardId),
            dataMatch
          })
          
          if (dataMatch) {
            console.log('⏭️  Skipping re-initialization - all risks loaded and data matches')
            return
          } else {
            console.log('🔄 Re-initializing - risk data changed')
          }
        } else {
          // No user data but have all risks - skip
          console.log('⏭️  Skipping - no user data but all risks already loaded')
          return
        }
      } else {
        console.log('🔄 Re-initializing - missing risks', {
          current: riskItems.length,
          expected: expectedRiskCount
        })
      }
    }
    
    if (preFillData?.hazards && preFillData.hazards.length > 0) {
      console.log('🎯 Initializing risks from prefill data:', preFillData.hazards)
      
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
          (entry: any) => entry.hazard === hazard.hazardName || entry.hazard.toLowerCase().includes(hazard.hazardId)
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
          
          console.log(`🎯 Pre-filling ${hazard.hazardName} with backend calculations:`, {
            likelihood: `${riskMatrixEntry.likelihood} → ${prefilledLikelihood}`,
            severity: `${riskMatrixEntry.severity} → ${prefilledSeverity}`,
            riskLevel: prefilledRiskLevel,
            riskScore: prefilledRiskScore
          })
        }

        // Determine if this risk should be selected
        // PRIORITY: User's previous choice > Backend pre-selection > Default rules
        let shouldBeSelected = false
        
        // NEVER pre-select risks marked as 'not_applicable' (level=0 from parish)
        const isNotApplicable = prefilledRiskLevel === 'not_applicable' || 
                                 riskMatrixEntry?.riskLevel === 'not_applicable' ||
                                 hazard.riskLevel === 'not_applicable'
        
        if (existingData && existingData.isSelected !== undefined) {
          // User has EXPLICITLY set isSelected - preserve their choice
          shouldBeSelected = existingData.isSelected
          console.log(`👤 User choice preserved for ${hazard.hazardName}: isSelected=${shouldBeSelected}`)
        } else {
          // No explicit user choice - use backend pre-selection logic
          console.log(`🔧 No explicit user choice for ${hazard.hazardName}, using backend logic`)
          console.log(`  - prefilledRiskLevel: ${prefilledRiskLevel}`)
          console.log(`  - isNotApplicable: ${isNotApplicable}`)
          console.log(`  - riskMatrixEntry?.isPreSelected: ${riskMatrixEntry?.isPreSelected}`)
          
          if (isNotApplicable) {
            shouldBeSelected = false
            console.log(`  ➡️ Not pre-selecting (not_applicable)`)
          } else if (riskMatrixEntry?.isPreSelected !== undefined) {
            // Use backend's pre-selection logic (respects parish data)
            shouldBeSelected = riskMatrixEntry.isPreSelected
            console.log(`  ➡️ Using backend isPreSelected: ${shouldBeSelected}`)
          } else {
            // Fallback: auto-select high/very_high risks
            shouldBeSelected = hazard.riskLevel === 'high' || hazard.riskLevel === 'very_high'
            console.log(`  ➡️ Fallback based on riskLevel: ${hazard.riskLevel} → ${shouldBeSelected}`)
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
          isSelected: shouldBeSelected, // Use backend pre-selection logic
          isCalculated: !!riskMatrixEntry && !existingData, // Mark as calculated if from backend
          reasoning: riskMatrixEntry?.reasoning || `Based on ${businessData?.industryType || 'business type'} in ${locationData?.parish || 'your location'}`
        }
      })
      
      setRiskItems(initialRisks)
      setHasAdminData(true)
      setLoading(false)
      
      console.log('✅ Initialized risk items:', initialRisks)
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
          console.warn('No business type ID available for admin calculations')
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
          urbanArea: location?.urbanArea || false
        }

        const response = await fetch('/api/wizard/get-risk-calculations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) {
          const data = await response.json()
          console.log('📊 Admin risk calculations received:', data)
          
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
        console.error('Error fetching admin data:', error)
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
          currentItem.riskScore = 0
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
      } else {
        currentItem[field] = value as any
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
      console.log('📤 onComplete sending:', {
        totalRisks: riskItems.length,
        selectedCount: riskItems.filter(r => r.isSelected).length,
        selectedIds: riskItems.filter(r => r.isSelected).map(r => r.hazardId),
        allRisks: riskItems.map(r => `${r.hazardId}(${r.isSelected ? '✓' : '☐'})`)
      })
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Risk Assessment</h3>
          <p className="text-gray-600 text-sm">Analyzing risks for your business...</p>
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
        <h3 className="text-lg font-medium text-blue-900 mb-2">No Risks Loaded</h3>
        <p className="text-blue-700 mb-4">
          Risk assessment should be automatically loaded from your business profile.
        </p>
        {preFillData ? (
          <div className="text-sm text-blue-600">
            <p>✓ PreFill data available: {preFillData.industry?.name || 'Unknown business'}</p>
            <p>✓ Location: {preFillData.location?.parish || locationData?.parish || 'Unknown location'}</p>
            <p className="mt-2 text-blue-800">But no hazards found in prefill data. This might indicate an issue with risk calculation.</p>
          </div>
        ) : (
          <div className="text-sm text-blue-600">
            <p>❌ No prefill data available</p>
            <p>Selected hazards: {selectedHazards.length}</p>
          </div>
        )}
      </div>
    )
  }

  // Separate risks for display
  // Pre-filled risks section: Any risk that was pre-filled (riskLevel != 'not_applicable')
  // Shows both selected and deselected pre-filled risks so user can toggle them
  const preSelectedRisks = riskItems.filter(item => 
    item.riskLevel !== 'not_applicable' && item.riskLevel !== ''
  )
  // Available risks section: Only 'not_applicable' risks that haven't been selected
  const availableRisks = riskItems.filter(item => 
    !item.isSelected && item.riskLevel === 'not_applicable'
  )
  // Selected risks for summary and onComplete (only actually checked risks)
  const selectedRisks = riskItems.filter(item => item.isSelected)
  const assessedRisks = selectedRisks.filter(item => item.likelihood && item.severity)
  const highPriorityRisks = assessedRisks.filter(item => item.riskScore >= 8)

  // Render individual risk card
  const renderRiskCard = (risk: any, actualIndex: number) => {
    const isAvailable = risk.riskLevel === 'not_applicable'

  return (
      <div
        key={risk.hazardId}
            className={`bg-white border rounded-lg overflow-hidden transition-all ${
              risk.isSelected 
                ? 'border-blue-500 shadow-md' 
            : isAvailable
            ? 'border-gray-200 hover:border-gray-300'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Risk Header */}
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <label className="flex items-center mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={risk.isSelected}
                onChange={(e) => updateRiskItem(actualIndex, 'isSelected', e.target.checked)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{risk.hazard}</h3>
                  {risk.reasoning && !isAvailable && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{risk.reasoning}</p>
                  )}
                  {isAvailable && (
                    <p className="text-sm text-gray-500 mt-1">
                      Not significant in {locationData?.parish || 'this location'}. Add if it applies to your specific situation.
                    </p>
                      )}
                    </div>
                    
                <div className="flex items-center space-x-2 ml-4">
                  {risk.isCalculated && !isAvailable && (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200" title="Calculated from admin data">
                      📊 Auto-calculated
                        </span>
                      )}
                      
                  {!isAvailable && risk.riskLevel && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${calculateRiskLevel(risk.likelihood, risk.severity).color}`}>
                      {risk.riskLevel} ({risk.riskScore || 0})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

        {/* Assessment Section - Only show when selected */}
            {risk.isSelected && (
              <div className="border-t bg-gray-50 p-4">
            {risk.isCalculated && risk.reasoning && !isAvailable && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs text-blue-900 space-y-1">
                      <strong>📊 How This Risk Was Calculated:</strong>
                  {risk.reasoning.split('\n').map((line: string, idx: number) => (
                        <div key={idx} className={line.startsWith('   ') ? 'ml-4 text-blue-800' : 'font-medium'}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Likelihood */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Likelihood of Occurrence (1-10)
                      <span className="ml-2 text-xs font-normal text-gray-500">(From location data)</span>
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
                        <span>1-3: Rare</span>
                    <span className="font-bold text-blue-600 text-lg">{risk.likelihood || 1}/10</span>
                        <span>4-6: Possible</span>
                        <span>7-8: Likely</span>
                        <span>9-10: Certain</span>
                      </div>
                    </div>
                {risk.isCalculated && !isAvailable && (
                      <p className="text-xs text-blue-600 italic">
                    📍 Based on parish risk data for {locationData?.parish}
                      </p>
                    )}
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Impact Severity (1-10)
                      <span className="ml-2 text-xs font-normal text-gray-500">(Business impact - you can adjust)</span>
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
                        <span>1-3: Minor</span>
                    <span className="font-bold text-orange-600 text-lg">{risk.severity || 1}/10</span>
                        <span>4-6: Moderate</span>
                        <span>7-8: Major</span>
                        <span>9-10: Severe</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      🏢 How badly would this affect YOUR specific business operations?
                    </p>
                  </div>
                </div>

                {/* Risk Level Display */}
            {(risk.likelihood || 0) > 0 && (risk.severity || 0) > 0 && (
                  <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Calculated Risk Level</div>
                        <div className="text-xs text-gray-500">
                      Likelihood ({risk.likelihood || 1}) × Severity ({risk.severity || 1}) = Score {calculateRiskLevel(risk.likelihood || '1', risk.severity || '1').score}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-semibold ${calculateRiskLevel(risk.likelihood || '1', risk.severity || '1').color}`}>
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
            <h2 className="text-2xl font-bold mb-2">🎯 Risk Assessment</h2>
            <p className="text-blue-100">
              Based on your {businessData?.industryType} business in {locationData?.parish || 'your location'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Progress</div>
            <div className="text-2xl font-bold">{assessedRisks.length}/{preSelectedRisks.length}</div>
          </div>
        </div>
        
        {hasAdminData && (
          <div className="mt-4 bg-blue-800 bg-opacity-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-100 text-sm">Smart analysis active - risks pre-selected based on location and business type</span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">How This Works</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. Review <strong>pre-selected risks</strong> relevant to your location and adjust severity if needed</p>
              <p>2. Add <strong>additional risks</strong> from the available risks section if applicable to your situation</p>
              <p>3. Ensure all selected risks are rated before proceeding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Selected Risks Section */}
      {preSelectedRisks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Identified Risks for Your Location</h3>
            <span className="text-sm text-gray-500">{preSelectedRisks.length} risk(s)</span>
          </div>
          {preSelectedRisks.map((risk) => {
            const actualIndex = riskItems.findIndex(r => r.hazardId === risk.hazardId)
            return renderRiskCard(risk, actualIndex)
          })}
        </div>
      )}

      {/* Available Risks Section (Collapsible) */}
      {availableRisks.length > 0 && (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          <button
            onClick={() => setShowAvailableRisks(!showAvailableRisks)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <svg className={`w-5 h-5 text-gray-600 transition-transform ${showAvailableRisks ? 'transform rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Other Risks (Not Significant in Your Location)</h3>
                <p className="text-sm text-gray-600">Click to expand and add if you believe they apply to your specific situation</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
              {availableRisks.length} available
            </span>
          </button>
          
          {showAvailableRisks && (
            <div className="border-t border-gray-300 p-4 space-y-4 bg-white">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{selectedRisks.length}</div>
              <div className="text-sm text-blue-700">Selected Risks</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{assessedRisks.length}</div>
              <div className="text-sm text-green-700">Fully Assessed</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-900">{highPriorityRisks.length}</div>
              <div className="text-sm text-red-700">High Priority</div>
            </div>
          </div>

          {highPriorityRisks.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="font-medium text-red-900">High Priority Risks Identified</span>
              </div>
              <p className="text-red-800 text-sm">
                You have {highPriorityRisks.length} high-priority risk(s) that require immediate attention: {' '}
                {highPriorityRisks.map(r => r.hazard).join(', ')}
              </p>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p>
              Complete the assessment by rating all selected risks, then proceed to create action plans 
              for your identified risks.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
