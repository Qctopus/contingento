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
  isCalculated?: boolean
  reasoning?: string
  confidence?: string
}

interface RiskAssessmentProps {
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

interface RiskLevelDistribution {
  Extreme: number;
  High: number;
  Medium: number;
  Low: number;
}

export function RiskAssessmentMatrix({ 
  selectedHazards, 
  onComplete, 
  initialValue, 
  setUserInteracted,
  locationData,
  businessData,
  preFillData
}: RiskAssessmentProps) {
  const [riskItems, setRiskItems] = useState<RiskItem[]>([])
  const [activeRisk, setActiveRisk] = useState<number | null>(null)
  
  // Admin calculations state
  const [adminCalculations, setAdminCalculations] = useState<any[]>([])
  const [adminStrategies, setAdminStrategies] = useState<any>({})
  const [isLoadingCalculations, setIsLoadingCalculations] = useState(false)
  const [calculationError, setCalculationError] = useState<string | null>(null)
  const [hasAdminData, setHasAdminData] = useState(false)
  const [manualOverrides, setManualOverrides] = useState<Set<string>>(new Set())
  const [confidenceLevels, setConfidenceLevels] = useState<Map<string, string>>(new Map())
  
  const t = useTranslations('common')
  const tSteps = useTranslations('steps.riskAssessment')

  // Fetch admin risk calculations
  useEffect(() => {
    const fetchAdminCalculations = async () => {
      if (selectedHazards.length === 0) return
      
      try {
        setIsLoadingCalculations(true)
        setCalculationError(null)
        
        // Get business type ID and location data
        const businessTypeId = preFillData?.industry?.id || businessData?.industryType
        const location = preFillData?.location || locationData
        
        if (!businessTypeId) {
          console.warn('No business type ID available for admin calculations')
          setHasAdminData(false)
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

        console.log('Fetching admin risk calculations:', requestBody)

        const response = await fetch('/api/wizard/get-risk-calculations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Admin risk calculations received:', data)
          
          setAdminCalculations(data.riskCalculations || [])
          setAdminStrategies(data.strategies || {})
          setHasAdminData(true)
          
          // Set confidence levels
          const newConfidenceLevels = new Map()
          data.riskCalculations?.forEach((calc: any) => {
            newConfidenceLevels.set(calc.hazardId, calc.confidence)
          })
          setConfidenceLevels(newConfidenceLevels)
          
        } else {
          throw new Error(`Failed to fetch calculations: ${response.status}`)
        }

      } catch (error) {
        console.error('Error fetching admin calculations:', error)
        setCalculationError('Failed to load smart risk calculations')
        setHasAdminData(false)
      } finally {
        setIsLoadingCalculations(false)
      }
    }

    fetchAdminCalculations()
  }, [selectedHazards, preFillData, businessData, locationData])

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

  // Get localized likelihood options with colorblind-friendly styling
  const getLikelihoodOptions = () => [
    { value: '1', label: t('veryUnlikely'), description: t('veryUnlikelyDesc'), color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { value: '2', label: t('unlikely'), description: t('unlikelyDesc'), color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: '3', label: t('likely'), description: t('likelyDesc'), color: 'bg-amber-100 text-amber-900 border-amber-400' },
    { value: '4', label: t('veryLikely'), description: t('veryLikelyDesc'), color: 'bg-rose-100 text-rose-900 border-rose-400' },
  ]

  // Get localized severity options with colorblind-friendly styling
  const getSeverityOptions = () => [
    { value: '1', label: t('insignificant'), description: t('insignificantDesc'), color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { value: '2', label: t('minor'), description: t('minorDesc'), color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: '3', label: t('serious'), description: t('seriousDesc'), color: 'bg-amber-100 text-amber-900 border-amber-400' },
    { value: '4', label: t('major'), description: t('majorDesc'), color: 'bg-rose-100 text-rose-900 border-rose-400' },
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

  // Calculate risk level based on likelihood and severity
  const calculateRiskLevel = useCallback((likelihood: string, severity: string): { level: string; score: number; color: string } => {
    const l = parseInt(likelihood) || 0
    const s = parseInt(severity) || 0
    const score = l * s
    
    console.log(`🧮 Calculating risk level: ${likelihood} × ${severity} = ${score}`)
    
    // Get translation values with fallbacks and ensure consistent casing
    const extremeRisk = (t('extremeRisk') || 'Extreme').charAt(0).toUpperCase() + (t('extremeRisk') || 'Extreme').slice(1).toLowerCase()
    const highRisk = (t('highRisk') || 'High').charAt(0).toUpperCase() + (t('highRisk') || 'High').slice(1).toLowerCase()
    const mediumRisk = (t('mediumRisk') || 'Medium').charAt(0).toUpperCase() + (t('mediumRisk') || 'Medium').slice(1).toLowerCase()
    const lowRisk = (t('lowRisk') || 'Low').charAt(0).toUpperCase() + (t('lowRisk') || 'Low').slice(1).toLowerCase()
    
    console.log(`🌐 Translation values with consistent casing:`, {
      extremeRisk,
      highRisk,
      mediumRisk,
      lowRisk
    })
    
    // Ensure we return valid levels even if translations aren't loaded yet
    if (score >= 12) {
      console.log(`🎯 Risk level: Extreme (score ${score})`)
      return { 
        level: extremeRisk, 
        score, 
        color: 'bg-black text-white border-4 border-black shadow-lg font-bold' 
      }
    }
    if (score >= 8) {
      console.log(`🎯 Risk level: High (score ${score})`)
      return { 
        level: highRisk, 
        score, 
        color: 'bg-gray-800 text-white border-2 border-gray-900 font-semibold' 
      }
    }
    if (score >= 3) {
      console.log(`🎯 Risk level: Medium (score ${score})`)
      return { 
        level: mediumRisk, 
        score, 
        color: 'bg-gray-400 text-black border-2 border-gray-600 font-medium' 
      }
    }
    if (score >= 1) {
      console.log(`🎯 Risk level: Low (score ${score})`)
      return { 
        level: lowRisk, 
        score, 
        color: 'bg-gray-100 text-gray-900 border border-gray-400' 
      }
    }
    console.log(`🎯 Risk level: None (score ${score})`)
    return { level: '', score: 0, color: 'bg-gray-50 text-gray-500 border border-gray-200' }
  }, [t])

  // Helper function to map admin calculation values to UI values
  const mapAdminToUIValue = (adminValue: string, type: 'likelihood' | 'severity'): string => {
    if (type === 'likelihood') {
      const mapping: Record<string, string> = {
        'rare': '1',
        'unlikely': '2', 
        'possible': '3',
        'likely': '4',
        'almost_certain': '4'
      }
      return mapping[adminValue] || '3'
    } else {
      const mapping: Record<string, string> = {
        'minimal': '1',
        'minor': '2',
        'moderate': '3',
        'major': '4',
        'catastrophic': '4'
      }
      return mapping[adminValue] || '3'
    }
  }

  // Initialize risk items when selectedHazards, initialValue, or adminCalculations changes
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

    // Create a map of admin calculations by hazard ID
    const adminCalculationsMap = new Map()
    adminCalculations.forEach(calc => {
      adminCalculationsMap.set(calc.hazardId, calc)
    })

    // Create risk items for all selected hazards
    const newRiskItems = selectedHazards.map(hazardKey => {
      const hazardLabel = getHazardLabel(hazardKey)
      
      // Check for existing data first (manual entries take precedence)
      const existingItem = existingRisksMap.get(hazardKey) || existingRisksMap.get(hazardLabel)
      
      // Check if this hazard has been manually overridden
      const isManualOverride = manualOverrides.has(hazardKey)
      
      if (existingItem && (isManualOverride || !hasAdminData)) {
        // Use existing data if manual override or no admin data
        const updatedItem = {
          ...existingItem,
          hazard: hazardLabel
        }
        
        // FORCE recalculation if likelihood and severity are present
        if (updatedItem.likelihood && updatedItem.severity) {
          const { level, score } = calculateRiskLevel(updatedItem.likelihood, updatedItem.severity)
          updatedItem.riskLevel = level
          updatedItem.riskScore = score
          
          console.log(`Pre-populated risk calculated for ${hazardLabel}:`, {
            likelihood: updatedItem.likelihood,
            severity: updatedItem.severity,
            calculatedLevel: level,
            calculatedScore: score
          })
        } else if (!updatedItem.likelihood || !updatedItem.severity) {
          // Clear risk level if data is incomplete
          updatedItem.riskLevel = ''
          updatedItem.riskScore = 0
        }
        
        return updatedItem
      }
      
      // Check for admin calculation data
      const adminCalc = adminCalculationsMap.get(hazardKey)
      if (adminCalc && hasAdminData && !isManualOverride) {
        // Auto-populate with admin data
        const likelihoodValue = mapAdminToUIValue(adminCalc.likelihood, 'likelihood')
        const severityValue = mapAdminToUIValue(adminCalc.severity, 'severity')
        const { level, score } = calculateRiskLevel(likelihoodValue, severityValue)
        
        console.log(`Auto-populating risk for ${hazardLabel} with admin data:`, {
          adminLikelihood: adminCalc.likelihood,
          adminSeverity: adminCalc.severity,
          uiLikelihood: likelihoodValue,
          uiSeverity: severityValue,
          calculatedLevel: level,
          calculatedScore: score,
          reasoning: adminCalc.reasoning
        })

        return {
          hazard: hazardLabel,
          likelihood: likelihoodValue,
          severity: severityValue,
          riskLevel: level,
          riskScore: score,
          planningMeasures: '',
          isCalculated: true,
          reasoning: adminCalc.reasoning,
          confidence: adminCalc.confidence
        }
      }
      
      // Default empty item
      return {
        hazard: hazardLabel,
        likelihood: '',
        severity: '',
        riskLevel: '',
        riskScore: 0,
        planningMeasures: '',
        isCalculated: false
      }
    })

    setRiskItems(newRiskItems)
  }, [selectedHazards, initialValue, adminCalculations, hasAdminData, manualOverrides, tSteps, calculateRiskLevel])

  // Additional effect to ensure risk levels are calculated after component fully loads
  useEffect(() => {
    if (riskItems.length > 0) {
      const itemsNeedingCalculation = riskItems.filter(item => 
        item.likelihood && item.severity && (!item.riskLevel || item.riskScore === 0)
      )
      
      if (itemsNeedingCalculation.length > 0) {
        console.log(`Found ${itemsNeedingCalculation.length} items needing risk calculation:`, 
          itemsNeedingCalculation.map(item => ({
            hazard: item.hazard,
            likelihood: item.likelihood,
            severity: item.severity,
            currentRiskLevel: item.riskLevel,
            currentRiskScore: item.riskScore
          }))
        )
        
        setRiskItems(prevItems => 
          prevItems.map(item => {
            if (item.likelihood && item.severity) {
              const { level, score } = calculateRiskLevel(item.likelihood, item.severity)
              console.log(`Force recalculated risk for ${item.hazard}:`, { 
                likelihood: item.likelihood,
                severity: item.severity,
                calculatedLevel: level, 
                calculatedScore: score,
                previousLevel: item.riskLevel,
                previousScore: item.riskScore
              })
              return {
                ...item,
                riskLevel: level,
                riskScore: score
              }
            }
            return item
          })
        )
      }
    }
  }, [riskItems, calculateRiskLevel])

  // FORCE recalculation on every render if needed - more aggressive approach
  useEffect(() => {
    const timer = setTimeout(() => {
      setRiskItems(prevItems => {
        let hasChanges = false
        const updatedItems = prevItems.map(item => {
          if (item.likelihood && item.severity) {
            const { level, score } = calculateRiskLevel(item.likelihood, item.severity)
            if (item.riskLevel !== level || item.riskScore !== score) {
              hasChanges = true
              console.log(`FORCED recalculation for ${item.hazard}: ${item.likelihood} × ${item.severity} = ${score} (${level})`)
              return {
                ...item,
                riskLevel: level,
                riskScore: score
              }
            }
          }
          return item
        })
        
        if (hasChanges) {
          console.log('Updated risk items with forced calculation')
          return updatedItems
        }
        return prevItems
      })
    }, 500) // Small delay to ensure everything is loaded
    
    return () => clearTimeout(timer)
  }, [calculateRiskLevel])

  // Recalculate risk levels when translation function changes or when translations load
  useEffect(() => {
    // Check if we have translations loaded
    const hasTranslations = t('extremeRisk') && t('extremeRisk') !== 'extremeRisk'
    
    if (hasTranslations) {
      setRiskItems(prevItems => 
        prevItems.map(item => {
          if (item.likelihood && item.severity) {
            const { level, score } = calculateRiskLevel(item.likelihood, item.severity)
            return {
              ...item,
              riskLevel: level,
              riskScore: score
            }
          }
          return item
        })
      )
    }
  }, [calculateRiskLevel, t])

  // Notify parent of changes using useCallback to prevent unnecessary re-renders
  const notifyParent = useCallback((items: RiskItem[]) => {
    // Format risk items with consistent property names
    const formattedRiskItems = items.map(item => ({
      hazard: item.hazard,
      likelihood: item.likelihood,
      severity: item.severity,
      riskLevel: item.riskLevel,  // Ensure this is always 'riskLevel', not 'Risk Level'
      riskScore: item.riskScore,
      planningMeasures: item.planningMeasures
    }))

    // Add logging to verify the data structure when saving
    console.log('Saving risk matrix with structure:', {
      key: 'Risk Assessment Matrix',
      data: formattedRiskItems,
      sampleItem: formattedRiskItems[0],
      totalItems: formattedRiskItems.length
    })

    onComplete(formattedRiskItems)
  }, [onComplete])

  // Call parent when risk items change - debounced to prevent excessive calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      notifyParent(riskItems)
    }, 100) // Small delay to batch updates
    
    return () => clearTimeout(timeoutId)
  }, [riskItems, notifyParent])

  const updateRiskItem = useCallback((index: number, field: keyof RiskItem, value: string) => {
    console.log('🔄 updateRiskItem called:', { index, field, value })
    
    if (setUserInteracted) {
      setUserInteracted()
    }
    
    setRiskItems(prevItems => {
      console.log('🔄 Updating risk items, current state:', prevItems)
      const updatedItems = [...prevItems]
      const currentItem = { ...updatedItems[index] }
      
      // Mark as manual override when user changes likelihood or severity
      if (field === 'likelihood' || field === 'severity') {
        const hazardKey = selectedHazards[index]
        if (hazardKey) {
          setManualOverrides(prev => new Set(prev).add(hazardKey))
          currentItem.isCalculated = false
          console.log(`🔄 Marked ${hazardKey} as manual override`)
        }
      }
      
      // Handle string fields
      if (field === 'hazard' || field === 'likelihood' || field === 'severity' || field === 'riskLevel' || field === 'planningMeasures') {
        currentItem[field] = value
      }
      
      // ALWAYS recalculate risk level when likelihood or severity exists
      const newLikelihood = field === 'likelihood' ? value : currentItem.likelihood
      const newSeverity = field === 'severity' ? value : currentItem.severity
      
      console.log(`🔄 Updating risk item ${index} (${currentItem.hazard}):`, {
        field,
        value,
        newLikelihood,
        newSeverity,
        hasBoth: !!(newLikelihood && newSeverity)
      })
      
      if (newLikelihood && newSeverity) {
        const { level, score } = calculateRiskLevel(newLikelihood, newSeverity)
        currentItem.riskLevel = level
        currentItem.riskScore = score
        
        console.log(`✅ Risk level calculated for ${currentItem.hazard}:`, {
          likelihood: newLikelihood,
          severity: newSeverity,
          level,
          score
        })
      } else {
        // Clear risk level if either likelihood or severity is missing
        currentItem.riskLevel = ''
        currentItem.riskScore = 0
        
        console.log(`❌ Risk level cleared for ${currentItem.hazard}:`, {
          reason: !newLikelihood ? 'Missing likelihood' : 'Missing severity'
        })
      }
      
      updatedItems[index] = currentItem
      console.log('🔄 Updated items:', updatedItems)
      return updatedItems
    })
  }, [setUserInteracted, calculateRiskLevel, selectedHazards])

  // Function to reset to admin-calculated values
  const resetToCalculatedValues = useCallback((hazardKey: string, index: number) => {
    const adminCalc = adminCalculations.find(calc => calc.hazardId === hazardKey)
    if (adminCalc) {
      const likelihoodValue = mapAdminToUIValue(adminCalc.likelihood, 'likelihood')
      const severityValue = mapAdminToUIValue(adminCalc.severity, 'severity')
      const { level, score } = calculateRiskLevel(likelihoodValue, severityValue)
      
      setRiskItems(prevItems => {
        const updatedItems = [...prevItems]
        updatedItems[index] = {
          ...updatedItems[index],
          likelihood: likelihoodValue,
          severity: severityValue,
          riskLevel: level,
          riskScore: score,
          isCalculated: true,
          reasoning: adminCalc.reasoning,
          confidence: adminCalc.confidence
        }
        return updatedItems
      })
      
      // Remove from manual overrides
      setManualOverrides(prev => {
        const newSet = new Set(prev)
        newSet.delete(hazardKey)
        return newSet
      })
      
      console.log(`Reset ${hazardKey} to calculated values`)
    }
  }, [adminCalculations, calculateRiskLevel, mapAdminToUIValue])

  const getRiskLevelColor = (riskLevel: string): string => {
    if (riskLevel === t('extremeRisk')) return 'bg-black text-white border-4 border-black shadow-lg font-bold'
    if (riskLevel === t('highRisk')) return 'bg-gray-800 text-white border-2 border-gray-900 font-semibold'
    if (riskLevel === t('mediumRisk')) return 'bg-gray-400 text-black border-2 border-gray-600 font-medium'
    if (riskLevel === t('lowRisk')) return 'bg-gray-100 text-gray-900 border border-gray-400'
    if (riskLevel === t('incomplete') || riskLevel === 'Incomplete') return 'bg-gray-200 text-gray-700 border border-gray-300'
    return 'bg-gray-50 text-gray-500 border border-gray-200'
  }

  const getCompletedRisks = () => {
    return riskItems.filter(item => item.likelihood && item.severity)
  }

  const getRiskDistribution = (): { [key: string]: number } => {
    const distribution: { [key: string]: number } = {}
    const riskLevels = [t('extremeRisk'), t('highRisk'), t('mediumRisk'), t('lowRisk')]
    
    // Initialize with translated risk levels
    riskLevels.forEach(level => {
      distribution[level] = 0
    })
    
    // Add category for incomplete assessments
    distribution[t('incomplete') || 'Incomplete'] = 0
    
    riskItems.forEach(item => {
      // Count items that have both likelihood and severity selected as assessed
      if (item.likelihood && item.severity) {
        // Use the calculated risk level directly since it's already translated
        const riskLevel = item.riskLevel
        if (riskLevel && riskLevel.trim() !== '') {
          // Find the matching distribution key
          const matchingKey = riskLevels.find(level => level === riskLevel)
          if (matchingKey) {
            distribution[matchingKey]++
          } else {
            // Fallback: if exact match fails, try to find by content
            const fallbackKey = riskLevels.find(level => 
              level.toLowerCase().includes(riskLevel.toLowerCase()) || 
              riskLevel.toLowerCase().includes(level.toLowerCase())
            )
            if (fallbackKey) {
              distribution[fallbackKey]++
            }
          }
        }
      } else {
        // Count incomplete assessments (missing likelihood or severity)
        distribution[t('incomplete') || 'Incomplete']++
      }
    })
    
    return distribution
  }

  // Helper function to get hazard key from translated label
  const getHazardKey = (hazardLabel: string): string => {
    const foundKey = Object.keys(hazardMappings).find(key => {
      const translatedLabel = tSteps(`hazardLabels.${key}`)
      return translatedLabel === hazardLabel || key === hazardLabel
    })
    return foundKey || hazardLabel.toLowerCase().replace(/\s+/g, '_')
  }

  // Get risk-specific strategy recommendations
  const getRiskStrategies = (hazardKey: string, riskLevel: string, riskScore: number): {
    prevention: string[];
    response: string[];
    recovery: string[];
  } => {
    // First check for admin strategies
    if (hasAdminData && adminStrategies) {
      const adminStrategyData = {
        prevention: adminStrategies.prevention || [],
        response: adminStrategies.response || [],
        recovery: adminStrategies.recovery || []
      }
      
      // Filter strategies that apply to this specific hazard
      const hazardStrategies = {
        prevention: adminStrategyData.prevention.filter((s: any) => 
          s.hazards.includes(hazardKey) || s.hazards.includes(getHazardKey(hazardKey))
        ).map((s: any) => {
          const effectiveness = s.effectiveness ? ` (${s.effectiveness}% effective)` : ''
          const reasoning = s.reasoning ? ` - ${s.reasoning}` : ''
          return `${s.title}${effectiveness}${reasoning}`
        }),
        response: adminStrategyData.response.filter((s: any) => 
          s.hazards.includes(hazardKey) || s.hazards.includes(getHazardKey(hazardKey))
        ).map((s: any) => {
          const effectiveness = s.effectiveness ? ` (${s.effectiveness}% effective)` : ''
          const reasoning = s.reasoning ? ` - ${s.reasoning}` : ''
          return `${s.title}${effectiveness}${reasoning}`
        }),
        recovery: adminStrategyData.recovery.filter((s: any) => 
          s.hazards.includes(hazardKey) || s.hazards.includes(getHazardKey(hazardKey))
        ).map((s: any) => {
          const effectiveness = s.effectiveness ? ` (${s.effectiveness}% effective)` : ''
          const reasoning = s.reasoning ? ` - ${s.reasoning}` : ''
          return `${s.title}${effectiveness}${reasoning}`
        })
      }
      
      // If we have admin strategies for this hazard, return them
      if (hazardStrategies.prevention.length > 0 || hazardStrategies.response.length > 0 || hazardStrategies.recovery.length > 0) {
        return hazardStrategies
      }
    }

    // Fallback to hardcoded strategies
    const strategies = {
      prevention: [] as string[],
      response: [] as string[],
      recovery: [] as string[]
    };

    const actualHazardKey = getHazardKey(hazardKey)
    const isHighRisk = riskScore >= 8

    // Hurricane/Tropical Storm strategies
    if (actualHazardKey.includes('hurricane') || actualHazardKey.includes('storm')) {
      strategies.prevention = [
        "Install storm shutters or plywood covers for windows",
        "Secure outdoor equipment, signs, and furniture",
        "Maintain emergency supplies (food, water, batteries for 7+ days)",
        "Review and update insurance coverage annually",
        "Create detailed evacuation procedures for staff and customers"
      ]
      strategies.response = [
        "Monitor weather alerts and activate emergency team 48-72 hours before impact",
        "Implement orderly closure procedures and secure all equipment",
        "Establish communication with staff, customers, and suppliers",
        "Move to safe locations and avoid travel during the storm",
        "Document any damage with photos for insurance claims"
      ]
      strategies.recovery = [
        "Conduct safety assessment before reopening - check for structural damage",
        "File insurance claims immediately with documentation",
        "Communicate reopening timeline to customers and suppliers",
        "Prioritize critical repairs and equipment replacement",
        "Review and update emergency procedures based on lessons learned"
      ]
    }

    // Power Outage strategies
    else if (actualHazardKey.includes('power')) {
      strategies.prevention = [
        "Install backup generator sized for critical operations",
        "Use Uninterruptible Power Supply (UPS) for computers and POS systems",
        "Maintain emergency lighting and flashlights",
        "Keep battery-powered radio for updates",
        "Develop manual procedures for key processes"
      ]
      strategies.response = [
        "Switch to backup power immediately and test all systems",
        "Implement manual cash handling and record-keeping procedures",
        "Contact utility company to report outage and get estimated repair time",
        "Preserve refrigerated items by keeping doors closed",
        "Use battery-powered communication devices"
      ]
      strategies.recovery = [
        "Test all electrical equipment before full restart",
        "Check for data loss and restore from backups if needed",
        "Reconcile manual transactions with electronic systems",
        "Assess impact on perishable inventory",
        "Evaluate backup power performance and upgrade if necessary"
      ]
    }

    // Fire strategies
    else if (actualHazardKey.includes('fire')) {
      strategies.prevention = [
        "Install smoke detectors and fire alarms throughout premises",
        "Maintain fire extinguishers and train staff on proper use",
        "Keep emergency exits clear and properly marked",
        "Regular electrical system inspections and maintenance",
        "Store flammable materials safely and away from heat sources"
      ]
      strategies.response = [
        "Evacuate all people immediately - do not fight large fires",
        "Call fire department (911) immediately",
        "Use fire extinguisher only for small, contained fires",
        "Meet at predetermined assembly point for headcount",
        "Do not re-enter building until authorized by fire department"
      ]
      strategies.recovery = [
        "Wait for official clearance before entering damaged areas",
        "Document all damage thoroughly for insurance claims",
        "Secure premises against weather and unauthorized entry",
        "Contact restoration specialists for smoke and water damage",
        "Communicate with customers about service interruption and reopening plans"
      ]
    }

    // Crime/Theft strategies
    else if (actualHazardKey.includes('crime') || actualHazardKey.includes('theft')) {
      strategies.prevention = [
        "Install security cameras and adequate lighting",
        "Use secure cash handling procedures - limit cash on hand",
        "Install quality locks and consider security system with monitoring",
        "Train staff on robbery prevention and response procedures",
        "Maintain good visibility into premises from outside"
      ]
      strategies.response = [
        "Comply with demands if confronted - personal safety is priority",
        "Call police (911) as soon as it's safe to do so",
        "Preserve crime scene and avoid touching anything",
        "Provide detailed description of suspects and events to police",
        "Offer support to any staff or customers who witnessed the incident"
      ]
      strategies.recovery = [
        "File police report and provide all available evidence",
        "Contact insurance company to report the loss",
        "Consider counseling services for affected staff",
        "Review and improve security measures based on the incident",
        "Communicate with customers to restore confidence in business safety"
      ]
    }

    // Cyber Attack strategies
    else if (actualHazardKey.includes('cyber') || actualHazardKey.includes('internet')) {
      strategies.prevention = [
        "Use strong passwords and enable two-factor authentication",
        "Keep all software and systems updated with latest security patches",
        "Train staff to recognize phishing emails and suspicious links",
        "Regular data backups stored offline or in secure cloud storage",
        "Install reputable antivirus/anti-malware software"
      ]
      strategies.response = [
        "Disconnect affected systems from internet immediately",
        "Change all passwords, especially for admin and financial accounts",
        "Contact IT support or cybersecurity expert for assistance",
        "Document the attack and preserve evidence",
        "Notify customers if their data may have been compromised"
      ]
      strategies.recovery = [
        "Restore systems from clean backups after thorough security scan",
        "Monitor accounts and credit reports for suspicious activity",
        "Update security policies and staff training based on the incident",
        "Consider cyber insurance claims if coverage exists",
        "Communicate transparently with customers about steps taken to improve security"
      ]
    }

    // Flood strategies
    else if (actualHazardKey.includes('flood')) {
      strategies.prevention = [
        "Elevate critical equipment and inventory above potential flood levels",
        "Install sump pumps and backup power for drainage systems",
        "Maintain flood barriers (sandbags, flood gates) and know how to deploy them",
        "Review flood insurance coverage - standard business insurance may not cover floods",
        "Develop relationships with suppliers outside flood-prone areas"
      ]
      strategies.response = [
        "Monitor weather and flood warnings closely",
        "Evacuate to higher ground if flooding is imminent",
        "Shut off electricity and gas if water is approaching electrical systems",
        "Move inventory, equipment, and important documents to higher levels",
        "Avoid driving or walking through flood waters"
      ]
      strategies.recovery = [
        "Do not enter building until it's been declared safe",
        "Document all damage with photos before cleanup begins",
        "Contact specialized flood restoration services quickly to prevent mold",
        "File flood insurance claims promptly",
        "Consider relocating or elevating critical operations for future protection"
      ]
    }

    // Supply Chain Disruption strategies
    else if (actualHazardKey.includes('supply')) {
      strategies.prevention = [
        "Diversify suppliers across different geographic regions",
        "Maintain strategic inventory of critical items",
        "Develop relationships with backup suppliers",
        "Monitor supplier financial health and business continuity plans",
        "Consider local suppliers to reduce transportation dependencies"
      ]
      strategies.response = [
        "Contact all suppliers immediately to assess impact and timeline",
        "Activate backup suppliers and expedite orders if necessary",
        "Communicate transparently with customers about potential delays",
        "Prioritize critical products/services and adjust offerings temporarily",
        "Explore alternative products or temporary substitutions"
      ]
      strategies.recovery = [
        "Gradually restore normal supply relationships as disruption resolves",
        "Evaluate supplier performance during the crisis",
        "Adjust inventory levels based on lessons learned",
        "Strengthen relationships with suppliers who performed well",
        "Update supplier diversification strategy to improve resilience"
      ]
    }

    // Staff Unavailability strategies
    else if (actualHazardKey.includes('staff')) {
      strategies.prevention = [
        "Cross-train employees in multiple roles and responsibilities",
        "Maintain updated contact information for all staff and backup workers",
        "Develop relationships with temporary staffing agencies",
        "Document all critical procedures and processes clearly",
        "Consider remote work capabilities where feasible"
      ]
      strategies.response = [
        "Assess which staff are available and reassign responsibilities",
        "Contact temporary staffing agencies for immediate assistance",
        "Prioritize essential functions and reduce non-critical services temporarily",
        "Implement remote work arrangements if possible",
        "Communicate with customers about any service limitations"
      ]
      strategies.recovery = [
        "Gradually restore full service levels as staff return",
        "Conduct debriefing with staff about the experience",
        "Update cross-training programs based on gaps identified",
        "Recognize and support staff who took on additional responsibilities",
        "Review and improve flexible work policies"
      ]
    }

    // Economic Downturn strategies
    else if (actualHazardKey.includes('economic')) {
      strategies.prevention = [
        "Maintain emergency cash reserves (3-6 months operating expenses)",
        "Diversify customer base to reduce dependence on single market segment",
        "Monitor economic indicators and customer payment patterns",
        "Maintain flexible cost structure with variable expenses where possible",
        "Strengthen customer relationships and loyalty programs"
      ]
      strategies.response = [
        "Implement cost reduction measures while preserving core capabilities",
        "Focus on cash flow management and collect receivables promptly",
        "Communicate with customers to understand their changing needs",
        "Explore new markets, products, or services that meet current demand",
        "Negotiate with suppliers and landlords for temporary payment adjustments"
      ]
      strategies.recovery = [
        "Gradually restore full operations as economic conditions improve",
        "Invest in growth opportunities that emerged during the downturn",
        "Rebuild cash reserves to prepare for future economic cycles",
        "Evaluate which cost reductions should be maintained permanently",
        "Strengthen market position gained during competitor difficulties"
      ]
    }

    // Generic strategies for unspecified risks
    if (strategies.prevention.length === 0) {
      strategies.prevention = [
        "Conduct regular risk assessments and update emergency procedures",
        "Maintain comprehensive insurance coverage appropriate for your business",
        "Train staff on emergency procedures and communication protocols",
        "Keep emergency contact lists and important documents easily accessible",
        "Establish relationships with local emergency services and business continuity resources"
      ]
      strategies.response = [
        "Activate emergency response team and communication procedures",
        "Ensure safety of all staff and customers as top priority",
        "Document the incident and any damage for insurance and learning purposes",
        "Communicate with stakeholders about the situation and expected timeline",
        "Implement alternative procedures to maintain critical business functions"
      ]
      strategies.recovery = [
        "Assess damage and prioritize restoration of critical business functions",
        "File insurance claims and work with adjusters promptly",
        "Communicate recovery timeline and progress to customers and suppliers",
        "Review and update emergency procedures based on lessons learned",
        "Consider improvements to make business more resilient to similar events"
      ]
    }

    // Add high-risk specific recommendations
    if (isHighRisk) {
      strategies.prevention.unshift("⚠️ HIGH PRIORITY: This risk requires immediate attention and comprehensive preparation")
      strategies.response.unshift("🚨 CRITICAL: Activate emergency procedures immediately when this risk materializes")
      strategies.recovery.unshift("🔄 URGENT: Fast recovery is essential - have specialized services pre-identified")
    }

    return strategies
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
      {/* REORDERED: Individual Risk Assessments First */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('individualRiskAssessments')}</h3>
          {/* Progress indicator */}
          <div className="flex items-center space-x-4">
            {hasAdminData && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700">AI-Calculated</span>
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-700">Manual Entry</span>
              </div>
            )}
            <div className="text-sm text-gray-600">
              {completedRisks.length} {t('of')} {riskItems.length} {t('completed')}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoadingCalculations && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-blue-700">Loading smart risk calculations...</span>
          </div>
        )}

        {/* Error indicator */}
        {calculationError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-yellow-800 font-medium">Smart calculations unavailable</p>
              <p className="text-yellow-700 text-sm">Using standard risk assessment. {calculationError}</p>
            </div>
          </div>
        )}

        {/* Admin data quality indicator */}
        {hasAdminData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium">Smart Risk Analysis Active</span>
            </div>
            <p className="text-green-700 text-sm">
              Risk calculations are based on admin-configured data for your business type and location. 
              You can manually adjust any values and reset to calculated values if needed.
            </p>
          </div>
        )}
        
        <div className="bg-white border rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="h-4 w-4 text-blue-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Assessment Instructions</span>
          </div>
          <p className="text-sm text-gray-600">
            For each hazard, evaluate the <strong>likelihood</strong> of occurrence and potential <strong>severity</strong> of impact on your business. 
            The risk level will be calculated automatically based on your assessment.
          </p>
        </div>
        
        {riskItems.map((risk, index) => {
          const isActive = activeRisk === index
          const isCompleted = risk.likelihood && risk.severity
          const isHighRisk = risk.riskScore >= 8
          const isExtremeRisk = risk.riskScore >= 12
          const hazardKey = selectedHazards[index]
          const isManualOverride = manualOverrides.has(hazardKey)
          const confidence = confidenceLevels.get(hazardKey)
          
          return (
            <div key={`${risk.hazard}-${index}`} className={`bg-white border rounded-lg transition-all duration-200 ${
              isActive ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'
            } ${isExtremeRisk ? 'border-black border-2' : isHighRisk ? 'border-gray-600' : ''} ${
              risk.isCalculated && !isManualOverride ? 'border-l-4 border-l-blue-500' : 
              isManualOverride ? 'border-l-4 border-l-gray-500' : ''
            }`}>
              <button
                onClick={() => {
                  console.log('🖱️ Risk item header clicked:', { index, hazard: risk.hazard, currentActive: activeRisk, newActive: isActive ? null : index })
                  setActiveRisk(isActive ? null : index)
                }}
                className="w-full p-4 text-left flex items-center justify-between"
                type="button"
              >
                <div className="flex items-center space-x-3">
                  {/* Status Indicator */}
                  <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  
                  {/* Hazard Name */}
                  <h4 className="font-medium">{risk.hazard}</h4>
                  
                  {/* Calculation Indicator */}
                  {risk.isCalculated && !isManualOverride && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-blue-600 font-medium">AI</span>
                    </div>
                  )}
                  {isManualOverride && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-xs text-gray-600 font-medium">Manual</span>
                    </div>
                  )}
                  
                  {/* Confidence Level */}
                  {confidence && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      confidence === 'high' ? 'bg-green-100 text-green-700' :
                      confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {confidence} confidence
                    </span>
                  )}
                  
                  {/* Risk Level Badge */}
                  {risk.riskLevel && (
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getRiskLevelColor(risk.riskLevel)}`}>
                        {risk.riskLevel} ({risk.riskScore})
                      </span>
                      
                      {/* High Priority Visual Indicators with colorblind-friendly text */}
                      {isExtremeRisk && (
                        <div className="flex items-center space-x-1">
                          <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-bold border-2 border-black">EXTREME RISK</span>
                        </div>
                      )}
                      {isHighRisk && !isExtremeRisk && (
                        <div className="flex items-center space-x-1">
                          <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-semibold border border-gray-900">HIGH RISK</span>
                        </div>
                      )}
                    </div>
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
                  {/* Admin Calculation Info */}
                  {risk.isCalculated && !isManualOverride && risk.reasoning && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-blue-800 font-medium text-sm">AI Risk Calculation</span>
                        {confidence && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            confidence === 'high' ? 'bg-green-100 text-green-700' :
                            confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {confidence} confidence
                          </span>
                        )}
                      </div>
                      <p className="text-blue-700 text-sm">{risk.reasoning}</p>
                    </div>
                  )}

                  {/* Manual Override Info */}
                  {isManualOverride && hasAdminData && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="text-gray-800 font-medium text-sm">Manual Override Active</span>
                        </div>
                        <button
                          onClick={() => resetToCalculatedValues(hazardKey, index)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                          type="button"
                        >
                          Reset to AI Values
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm">
                        You've manually adjusted this risk assessment. The values below override the AI calculations.
                      </p>
                    </div>
                  )}
                  {/* Likelihood Assessment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('likelihoodAssessment')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {likelihoodOptions.map(option => (
                        <div 
                          key={`likelihood-${index}-${option.value}`} 
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${risk.likelihood === option.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                          onClick={(e) => {
                            console.log('🖱️ Likelihood option clicked:', { option: option.value, index, hazard: risk.hazard })
                            e.preventDefault()
                            e.stopPropagation()
                            updateRiskItem(index, 'likelihood', option.value)
                          }}
                          onMouseDown={(e) => {
                            console.log('🖱️ Likelihood option mouse down:', { option: option.value, index, hazard: risk.hazard })
                          }}
                        >
                          <input
                            type="radio"
                            name={`likelihood-${risk.hazard.replace(/\s+/g, '')}-${index}`}
                            value={option.value}
                            checked={risk.likelihood === option.value}
                            onChange={() => {}} // Controlled by parent div click
                            className="h-4 w-4 text-primary-600 mr-3 focus:ring-primary-500"
                          />
                          <div>
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
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${risk.severity === option.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                          onClick={(e) => {
                            console.log('🖱️ Severity option clicked:', { option: option.value, index, hazard: risk.hazard })
                            e.preventDefault()
                            e.stopPropagation()
                            updateRiskItem(index, 'severity', option.value)
                          }}
                          onMouseDown={(e) => {
                            console.log('🖱️ Severity option mouse down:', { option: option.value, index, hazard: risk.hazard })
                          }}
                        >
                          <input
                            type="radio"
                            name={`severity-${risk.hazard.replace(/\s+/g, '')}-${index}`}
                            value={option.value}
                            checked={risk.severity === option.value}
                            onChange={() => {}} // Controlled by parent div click
                            className="h-4 w-4 text-primary-600 mr-3 focus:ring-primary-500"
                          />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Level Display - ALWAYS show when likelihood and severity are selected */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">{t('calculatedRiskLevel')}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Based on your likelihood and severity assessment
                    </div>
                    {risk.likelihood && risk.severity ? (
                      <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getRiskLevelColor(risk.riskLevel)}`}>
                        {risk.riskLevel || 'Calculating...'} ({risk.riskScore || 0})
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-4 py-2 rounded-full border-2 bg-gray-100 text-gray-600 border-gray-300">
                        Select likelihood and severity to calculate risk level
                      </div>
                    )}

                  </div>

                  {/* Risk-Specific Strategy Recommendations */}
                  {risk.likelihood && risk.severity && (
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-gray-700 mb-3">Recommended Strategies for {risk.hazard}:</div>
                      {(() => {
                        const strategies = getRiskStrategies(risk.hazard, risk.riskLevel, risk.riskScore)
                        return (
                          <div className="space-y-3">
                            {/* Prevention Strategies */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <h5 className="text-sm font-semibold text-blue-900 mb-2">🛡️ Prevention (Before)</h5>
                              <ul className="text-xs text-blue-800 space-y-1">
                                {strategies.prevention.slice(0, 3).map((strategy, i) => (
                                  <li key={`prev-${i}`} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{strategy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Response Strategies */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                              <h5 className="text-sm font-semibold text-orange-900 mb-2">⚡ Response (During)</h5>
                              <ul className="text-xs text-orange-800 space-y-1">
                                {strategies.response.slice(0, 3).map((strategy, i) => (
                                  <li key={`resp-${i}`} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{strategy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Recovery Strategies */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <h5 className="text-sm font-semibold text-green-900 mb-2">🔄 Recovery (After)</h5>
                              <ul className="text-xs text-green-800 space-y-1">
                                {strategies.recovery.slice(0, 3).map((strategy, i) => (
                                  <li key={`rec-${i}`} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{strategy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* Planning Measures */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('planningMeasures')}
                    </label>
                    {risk.likelihood && risk.severity && (
                      <p className="text-xs text-blue-600 mb-2">
                        💡 Use the recommended strategies above as a starting point for your planning measures
                      </p>
                    )}
                    <textarea
                      value={risk.planningMeasures}
                      onChange={(e) => updateRiskItem(index, 'planningMeasures', e.target.value)}
                      placeholder={risk.likelihood && risk.severity 
                        ? "Based on the strategies above, describe your specific implementation plan..." 
                        : t('planningMeasuresPlaceholder')
                      }
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

      {/* MOVED TO BOTTOM: Risk Assessment Overview and Matrix */}
      {completedRisks.length > 0 && (
        <>
          {/* Risk Assessment Overview */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{t('riskOverview')}</h3>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('assessmentProgress')}</span>
                <span className="text-sm font-medium">{completedRisks.length} {t('of')} {riskItems.length} {t('completed')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 border border-gray-300">
                <div 
                  className="bg-gray-800 h-3 rounded-full transition-all duration-300 border border-gray-900" 
                  style={{ width: `${riskItems.length > 0 ? (completedRisks.length / riskItems.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Risk Distribution - Colorblind Friendly */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(distribution).map(([level, count]) => {
                const isIncomplete = level === t('incomplete') || level === 'Incomplete'
                const isHighPriority = level === t('extremeRisk') || level === t('highRisk')
                return (
                  <div key={level} className={`text-center ${isHighPriority && count > 0 ? 'ring-4 ring-black ring-opacity-50 rounded-lg p-2 bg-gray-100' : ''}`}>
                    <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border-2 ${getRiskLevelColor(level)}`}>
                      {count}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 font-medium">
                      {isIncomplete ? (level + ' ' + t('assessments')) : (level + ' ' + t('riskText'))}
                    </div>
                    {level === t('extremeRisk') && count > 0 && (
                      <div className="text-xs text-black font-bold mt-1 bg-black text-white px-1 rounded">
                        EXTREME RISK
                      </div>
                    )}
                    {level === t('highRisk') && count > 0 && (
                      <div className="text-xs text-gray-900 font-bold mt-1 bg-gray-800 text-white px-1 rounded">
                        HIGH RISK
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* High Priority Alert */}
            {(distribution[t('extremeRisk')] > 0 || distribution[t('highRisk')] > 0) && (
              <div className="mt-4 p-4 bg-gray-100 border-2 border-black rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-black text-lg font-bold">⚠️</span>
                  <h4 className="text-sm font-bold text-black">Priority Risk Alert</h4>
                </div>
                <p className="text-sm text-gray-900 font-medium">
                  You have {distribution[t('extremeRisk')] + distribution[t('highRisk')]} high-priority risk(s) that require immediate attention. 
                  Review the recommended strategies and develop comprehensive mitigation plans for these risks first.
                </p>
              </div>
            )}
          </div>

          {/* Risk Matrix Visual - Enhanced and Colorblind Friendly */}
          <div className="bg-white border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{t('riskMatrix')}</h3>
              <p className="text-sm text-gray-600">
                This matrix shows how risk levels are calculated by multiplying likelihood × severity. 
                Higher scores indicate higher priority risks requiring immediate attention.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <table className="w-full border-2 border-gray-400 bg-white rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-200 border-b-2 border-gray-400">
                      <th className="p-3 text-center font-bold text-gray-900 border-r-2 border-gray-400">
                        <div className="transform -rotate-45 origin-center whitespace-nowrap text-sm">
                          LIKELIHOOD →<br/>SEVERITY ↓
                        </div>
                      </th>
                      <th className="p-3 font-bold text-center text-gray-900 border-r border-gray-300">
                        <div className="text-xs mb-1">1</div>
                        <div className="text-sm">{t('insignificant')}</div>
                      </th>
                      <th className="p-3 font-bold text-center text-gray-900 border-r border-gray-300">
                        <div className="text-xs mb-1">2</div>
                        <div className="text-sm">{t('minor')}</div>
                      </th>
                      <th className="p-3 font-bold text-center text-gray-900 border-r border-gray-300">
                        <div className="text-xs mb-1">3</div>
                        <div className="text-sm">{t('serious')}</div>
                      </th>
                      <th className="p-3 font-bold text-center text-gray-900">
                        <div className="text-xs mb-1">4</div>
                        <div className="text-sm">{t('major')}</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[4, 3, 2, 1].map(likelihood => (
                      <tr key={likelihood} className="border-b border-gray-300">
                        <td className="p-3 font-bold text-center align-middle bg-gray-200 border-r-2 border-gray-400">
                          <div className="text-xs mb-1">{likelihood}</div>
                          <div className="text-sm transform -rotate-90 whitespace-nowrap">
                            {likelihoodOptions.find(opt => opt.value === likelihood.toString())?.label || `(${likelihood})`}
                          </div>
                        </td>
                        {[1, 2, 3, 4].map(severity => {
                          const score = likelihood * severity
                          const { level, color } = calculateRiskLevel(likelihood.toString(), severity.toString())
                          
                          // Add pattern classes for better accessibility
                          let patternClass = ""
                          if (score >= 12) patternClass = "bg-black text-white border-4 border-black"
                          else if (score >= 8) patternClass = "bg-gray-800 text-white border-2 border-gray-900"
                          else if (score >= 3) patternClass = "bg-gray-400 text-black border-2 border-gray-600"
                          else patternClass = "bg-gray-100 text-gray-900 border border-gray-400"
                          
                          return (
                            <td key={`${likelihood}-${severity}`} className={`p-4 text-center font-bold text-sm border-r border-gray-300 ${patternClass}`}>
                              <div className="mb-1 font-bold">{level}</div>
                              <div className="text-xs opacity-90">Score: {score}</div>
                              {score >= 12 && <div className="text-xs font-bold mt-1">EXTREME</div>}
                              {score >= 8 && score < 12 && <div className="text-xs font-bold mt-1">HIGH</div>}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Legend */}
                <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Risk Level Guide:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-100 border border-gray-400 rounded"></div>
                      <span><strong>LOW RISK</strong> (1-2): Monitor</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-400 border-2 border-gray-600 rounded"></div>
                      <span><strong>MEDIUM RISK</strong> (3-6): Plan</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-800 border-2 border-gray-900 rounded"></div>
                      <span><strong>HIGH RISK</strong> (8-9): Priority</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-black border-4 border-black rounded"></div>
                      <span><strong>EXTREME RISK</strong> (12-16): Urgent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary and Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">{t('assessmentSummary')}</h3>
            
            <div className="space-y-3">
              {distribution[t('extremeRisk')] > 0 && (
                <div className="flex items-center p-3 bg-black text-white border-2 border-black rounded-lg">
                  <svg className="h-5 w-5 text-white mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-bold">
                    EXTREME PRIORITY: {distribution[t('extremeRisk')]} risk(s) require immediate action
                  </span>
                </div>
              )}
              
              {distribution[t('highRisk')] > 0 && (
                <div className="flex items-center p-3 bg-gray-800 text-white border-2 border-gray-900 rounded-lg">
                  <svg className="h-5 w-5 text-white mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">
                    HIGH PRIORITY: {distribution[t('highRisk')]} risk(s) need priority attention
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
        </>
      )}
    </div>
  )
}