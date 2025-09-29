'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { calculateLocationRisk } from '../data/hazardMappings'
import { industryProfiles } from '../data/industryProfiles'

interface HazardPrefilterProps {
  selectedHazards: string[]
  onComplete: (prioritizedHazards: string[]) => void
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
  initialSelection?: string[]
}

interface HazardInfo {
  id: string
  name: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  locationBased: boolean
  industryBased: boolean
  isSeasonallyActive?: boolean
  cascadingRisks?: string[]
  warningTime?: string
  geographicScope?: string
}

interface SmartRecommendation {
  risks: Array<{
    hazardId: string
    hazardName: string
    baseRiskLevel: string
    locationModifier: string
    finalRiskLevel: string
    reasoning: string
    isSeasonallyActive: boolean
    cascadingRisks: string[]
    warningTime?: string
    geographicScope?: string
  }>
  strategies: Array<{
    strategyId: string
    title: string
    category: string
    hazards: string[]
    priority: string
    effectiveness: number
  }>
  businessContext: {
    vulnerabilities: any
    criticalDependencies: string[]
    typicalImpacts: string[]
  }
  metadata?: {
    locationFound: boolean
    nearCoast: boolean
    urbanArea: boolean
    currentMonth: number
    businessTypeName: string
  }
}

export function HazardPrefilter({
  selectedHazards,
  onComplete,
  locationData,
  businessData,
  preFillData,
  initialSelection = []
}: HazardPrefilterProps) {
  const [prioritizedHazards, setPrioritizedHazards] = useState<string[]>(initialSelection)
  const [hazardInfo, setHazardInfo] = useState<HazardInfo[]>([])
  const [showAllHazards, setShowAllHazards] = useState(false)
  const [currentStep, setCurrentStep] = useState<'context' | 'selection'>('context')
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({
    high: true,
    medium: false,
    low: false
  })
  
  // New state for smart recommendations
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  
  const t = useTranslations('common')
  const tSteps = useTranslations('steps.riskAssessment')

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

  // Get contextual risk information - enhanced with API data
  const getContextualInfo = (hazardId: string): string => {
    // First try to get info from smart recommendations
    if (smartRecommendations) {
      const risk = smartRecommendations.risks.find(r => r.hazardId === hazardId)
      if (risk) {
        let info = risk.reasoning
        
        // Add seasonal information
        if (risk.isSeasonallyActive) {
          info += '. Currently in peak season'
        }
        
        // Add warning time
        if (risk.warningTime) {
          info += `. Warning time: ${risk.warningTime}`
        }
        
        return info
      }
    }
    
    // Fallback to original contextual logic
    const location = locationData?.parish || locationData?.country || 'your area'
    const businessType = businessData?.industryType || 'your business'
    
    // Get a more readable business name
    let business = businessType
    if (businessType && businessType !== 'your business') {
      const industryProfile = industryProfiles.find(p => p.id === businessType)
      business = industryProfile ? industryProfile.name : businessType.replace(/_/g, ' ')
    }
    
    const contextualMessages: { [key: string]: string } = {
      'hurricane': `In ${location}, hurricanes are a significant threat during June-November season. ${business === 'restaurant' ? 'Restaurants lose power, refrigeration, and access.' : business === 'grocery_store' ? 'Grocery stores face supply disruptions and power loss.' : 'Businesses face widespread power and infrastructure damage.'}`,
      'power_outage': `${location} experiences regular power interruptions. ${business === 'restaurant' ? 'Critical for food safety and POS systems.' : business === 'grocery_store' ? 'Essential for refrigeration and checkout systems.' : 'Affects operations and communications.'}`,
      'flash_flood': `Flash flooding affects low-lying areas in ${location}. ${business === 'restaurant' ? 'Can damage kitchen equipment and force closure.' : 'May block customer access and damage inventory.'}`,
      'economic_downturn': `Economic challenges impact ${location} businesses. ${business === 'restaurant' ? 'Reduces dining out and discretionary spending.' : business === 'grocery_store' ? 'Shifts customers to basic necessities only.' : 'Affects cash flow and customer demand.'}`,
      'supply_disruption': `Supply chain issues common in Caribbean regions. ${business === 'restaurant' ? 'Fresh ingredients may be unavailable.' : business === 'grocery_store' ? 'Stock shortages affect customer satisfaction.' : 'Delays in materials and supplies.'}`,
      'crime': `Security considerations for ${location} businesses. ${business === 'restaurant' ? 'Cash handling and late-night operations.' : business === 'grocery_store' ? 'Cash registers and valuable inventory.' : 'Property and equipment protection.'}`,
      'fire': `Fire risk for ${business} operations. ${business === 'restaurant' ? 'Kitchen equipment and gas systems present higher risk.' : 'Electrical systems and storage areas need protection.'}`,
    }
    
    return contextualMessages[hazardId] || `This risk may impact ${business} operations in ${location}.`
  }

  // Fetch smart recommendations from API
  useEffect(() => {
    const fetchSmartRecommendations = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get businessTypeId from preFillData or fallback to businessData
        const businessTypeId = preFillData?.industry?.id || businessData?.industryType
        
        // Get location data from preFillData or fallback to locationData
        const location = preFillData?.location || locationData
        
        if (!businessTypeId || !location?.countryCode) {
          console.warn('Missing businessTypeId or countryCode, falling back to hardcoded analysis')
          setUsingFallback(true)
          setLoading(false)
          return
        }
        
        const requestBody = {
          businessTypeId,
          countryCode: location.countryCode,
          parish: location.parish || null,
          nearCoast: location.nearCoast || false,
          urbanArea: location.urbanArea || false
        }
        
        console.log('Fetching smart recommendations with:', requestBody)
        
        const response = await fetch('/api/wizard/get-smart-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }
        
        const recommendations: SmartRecommendation = await response.json()
        console.log('Smart recommendations received:', recommendations)
        
        setSmartRecommendations(recommendations)
        setUsingFallback(false)
        
      } catch (error) {
        console.error('Error fetching smart recommendations:', error)
        setError('Failed to load smart recommendations')
        setUsingFallback(true)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSmartRecommendations()
  }, [preFillData, businessData, locationData])

  // Analyze and prioritize hazards based on smart recommendations or fallback to original logic
  useEffect(() => {
    const analyzeHazards = () => {
      let hazardAnalysis: HazardInfo[] = []
      
      if (smartRecommendations && !usingFallback) {
        // Use smart recommendations from API
        console.log('Using smart recommendations for hazard analysis')
        
        // Filter risks to only include selected hazards
        const relevantRisks = smartRecommendations.risks.filter(risk => 
          selectedHazards.includes(risk.hazardId)
        )
        
        hazardAnalysis = relevantRisks.map(risk => {
          // Map API risk levels to our priority system
          let priority: 'high' | 'medium' | 'low' = 'low'
          if (risk.finalRiskLevel === 'very_high' || risk.finalRiskLevel === 'high') {
            priority = 'high'
          } else if (risk.finalRiskLevel === 'medium') {
            priority = 'medium'
          }
          
          return {
            id: risk.hazardId,
            name: risk.hazardName,
            priority,
            reason: risk.reasoning,
            locationBased: risk.locationModifier !== 'none',
            industryBased: true, // Assume true since it came from business type mapping
            isSeasonallyActive: risk.isSeasonallyActive,
            cascadingRisks: risk.cascadingRisks,
            warningTime: risk.warningTime,
            geographicScope: risk.geographicScope
          }
        })
        
      } else {
        // Fallback to original hardcoded logic
        console.log('Using fallback hazard analysis')
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('HazardPrefilter - Analyzing hazards with context:', {
            locationData,
            businessData,
            selectedHazards
          })
        }
        
        // Get location-based risk data
        let locationRisks: any[] = []
        if (locationData?.countryCode) {
          locationRisks = calculateLocationRisk(
            locationData.countryCode,
            locationData.parish,
            locationData.nearCoast,
            locationData.urbanArea
          )
        }
        
                 // Get industry-based risk data
         let industryRisks: string[] = []
         if (businessData?.industryType) {
           const industryProfile = industryProfiles.find(p => p.id === businessData.industryType)
           if (industryProfile) {
             industryRisks = industryProfile.vulnerabilities.map(v => v.hazardId)
           }
           
           // Debug logging
           if (process.env.NODE_ENV === 'development') {
             console.log('Industry profile found:', industryProfile)
             console.log('Industry risks:', industryRisks)
           }
         }
        
        // Analyze each selected hazard
        selectedHazards.forEach(hazardId => {
          const hazardName = getHazardLabel(hazardId)
          
          // Check if hazard is location-based
          const locationMatch = locationRisks.find(lr => lr.hazardId === hazardId)
          const isLocationBased = !!locationMatch
          
          // Check if hazard is industry-based
          const isIndustryBased = industryRisks.includes(hazardId)
          
          // Determine priority
          let priority: 'high' | 'medium' | 'low' = 'low'
          let reason = ''
          
          if (isLocationBased && isIndustryBased) {
            priority = 'high'
            reason = `High priority: Common for ${businessData?.industryType || 'your business'} in ${locationData?.parish || locationData?.country}`
          } else if (isLocationBased) {
            const riskLevel = locationMatch?.riskLevel || 'medium'
            priority = riskLevel === 'high' || riskLevel === 'very_high' ? 'high' : 'medium'
            reason = `Location-based: ${riskLevel} risk in ${locationData?.parish || locationData?.country}`
          } else if (isIndustryBased) {
            priority = 'medium'
            reason = `Industry-based: Common for ${businessData?.industryType || 'your business type'}`
          } else {
            priority = 'low'
            reason = 'General risk to consider'
          }
          
          hazardAnalysis.push({
            id: hazardId,
            name: hazardName,
            priority,
            reason,
            locationBased: isLocationBased,
            industryBased: isIndustryBased
          })
        })
      }
      
      // Sort by priority
      hazardAnalysis.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      
      setHazardInfo(hazardAnalysis)
      
      // Auto-select high priority hazards initially
      if (initialSelection.length === 0) {
        const highPriorityHazards = hazardAnalysis
          .filter(h => h.priority === 'high')
          .map(h => h.id)
        setPrioritizedHazards(highPriorityHazards)
      }
    }
    
    if (!loading) {
      analyzeHazards()
    }
  }, [selectedHazards, locationData, businessData, smartRecommendations, usingFallback, loading, initialSelection])

  const handleHazardToggle = (hazardId: string) => {
    setPrioritizedHazards(prev => 
      prev.includes(hazardId)
        ? prev.filter(id => id !== hazardId)
        : [...prev, hazardId]
    )
  }

  const handleContinue = () => {
    if (currentStep === 'context') {
      setCurrentStep('selection')
    } else {
      onComplete(prioritizedHazards)
    }
  }

  const handleBack = () => {
    if (currentStep === 'selection') {
      setCurrentStep('context')
    }
  }

  const getContextSummary = () => {
    const location = (locationData?.parish || locationData?.country || 'your location')
    const businessType = businessData?.industryType || 'your business'
    
    // Get a more readable business name
    let businessDisplay = businessType
    if (businessType && businessType !== 'your business') {
      // Find the industry profile to get a better display name
      const industryProfile = industryProfiles.find(p => p.id === businessType)
      businessDisplay = industryProfile ? industryProfile.localName : businessType.replace(/_/g, ' ')
    }
    
    return {
      location,
      business: businessDisplay,
      highPriorityCount: hazardInfo.filter(h => h.priority === 'high').length,
      totalCount: hazardInfo.length
    }
  }

  const renderContextStep = () => {
    const context = getContextSummary()
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">{smartRecommendations && !usingFallback ? '🤖' : '🎯'}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {smartRecommendations && !usingFallback ? 'AI-Powered Risk Analysis' : 'Smart Risk Analysis'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {smartRecommendations && !usingFallback 
              ? 'Our AI has analyzed your business context using admin-configured data to provide personalized risk recommendations.'
              : 'We\'ve analyzed your business context to prioritize the most relevant risks for your assessment.'
            }
          </p>
          {usingFallback && (
            <div className="mt-3 max-w-lg mx-auto p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <span className="font-medium">⚠️ Limited Smart Features:</span> Using standard analysis due to missing data or configuration.
              </p>
            </div>
          )}
        </div>

        {/* Business Context Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Location Profile</h3>
            </div>
            <p className="text-gray-700 font-medium capitalize">{context.location}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {locationData?.nearCoast && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  🌊 Coastal Area
                </span>
              )}
              {locationData?.urbanArea && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  🏙️ Urban Area
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0H9m11 0H9m11 0H9" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Business Profile</h3>
            </div>
            <p className="text-gray-700 font-medium capitalize">{context.business}</p>
            {businessData?.businessPurpose && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {businessData.businessPurpose.slice(0, 120)}...
              </p>
            )}
          </div>
        </div>

        {/* Risk Analysis Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white bg-opacity-60 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{context.highPriorityCount}</div>
              <div className="text-sm text-red-800 font-medium">High Priority Risks</div>
              <div className="text-xs text-red-600 mt-1">Most relevant to you</div>
            </div>
            <div className="bg-white bg-opacity-60 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{context.totalCount - context.highPriorityCount}</div>
              <div className="text-sm text-yellow-800 font-medium">Additional Risks</div>
              <div className="text-xs text-yellow-600 mt-1">Worth considering</div>
            </div>
            <div className="bg-white bg-opacity-60 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {smartRecommendations && !usingFallback ? '🤖' : '✓'}
              </div>
              <div className="text-sm text-blue-800 font-medium">
                {smartRecommendations && !usingFallback ? 'AI-Powered' : 'Smart Analysis'}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {smartRecommendations && !usingFallback ? 'Admin-configured' : 'Customized analysis'}
              </div>
            </div>
          </div>
          
          {/* Smart recommendations insights */}
          {smartRecommendations && !usingFallback && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-900">🎯 Analysis Type:</span>
                  <div className="text-blue-700 mt-1">
                    • Location-specific risk modifiers
                    <br />
                    • Industry vulnerability mapping  
                    <br />
                    • Seasonal risk patterns
                  </div>
                </div>
                <div>
                  <span className="font-medium text-blue-900">📊 Data Sources:</span>
                  <div className="text-blue-700 mt-1">
                    • Admin-configured hazard profiles
                    <br />
                    • Business type dependencies
                    <br />
                    • Environmental risk factors
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md flex items-center space-x-2 mx-auto"
          >
            <span>Review Risk Selection</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  const renderSelectionStep = () => {
    const highPriorityHazards = hazardInfo.filter(h => h.priority === 'high')
    const mediumPriorityHazards = hazardInfo.filter(h => h.priority === 'medium')
    const lowPriorityHazards = hazardInfo.filter(h => h.priority === 'low')

    const allPriorityGroups = [
      { key: 'high', hazards: highPriorityHazards, title: "🔴 High Priority Risks", description: "Most relevant to your location and business type", color: 'red' },
      { key: 'medium', hazards: mediumPriorityHazards, title: "🟡 Medium Priority Risks", description: "Important considerations based on context", color: 'yellow' },
      { key: 'low', hazards: lowPriorityHazards, title: "⚪ Additional Risks", description: "General risks for comprehensive planning", color: 'gray' }
    ]

    const selectedCount = prioritizedHazards.length

    return (
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className={`bg-gradient-to-r text-white rounded-lg p-6 mb-6 ${
          smartRecommendations && !usingFallback 
            ? 'from-blue-600 to-blue-700' 
            : 'from-gray-600 to-gray-700'
        }`}>
          <h2 className="text-2xl font-bold mb-2">
            {smartRecommendations && !usingFallback ? '🤖 AI-Powered Risk Analysis' : '🎯 Smart Risk Prioritization'}
          </h2>
          <p className={smartRecommendations && !usingFallback ? 'text-blue-100' : 'text-gray-100'}>
            {smartRecommendations && !usingFallback ? (
              <>
                Admin-configured analysis for {smartRecommendations.metadata?.businessTypeName || 'your business'} in{' '}
                {locationData?.parish && `${locationData.parish}, `}
                {locationData?.country || 'the Caribbean'}
                {smartRecommendations.metadata?.nearCoast && ' (coastal area)'}
                {smartRecommendations.metadata?.urbanArea && ' (urban area)'}
              </>
            ) : (
              <>
                Standard analysis based on your {locationData?.parish && `${locationData.parish}, `}
                {businessData?.industryType && `${businessData.industryType} `}business profile
              </>
            )}
          </p>
          {smartRecommendations && !usingFallback && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-800 bg-opacity-50 rounded text-xs">
                ✨ Seasonal Analysis
              </span>
              <span className="px-2 py-1 bg-blue-800 bg-opacity-50 rounded text-xs">
                🔗 Cascading Risks
              </span>
              <span className="px-2 py-1 bg-blue-800 bg-opacity-50 rounded text-xs">
                📊 Risk Calculation
              </span>
              <span className="px-2 py-1 bg-blue-800 bg-opacity-50 rounded text-xs">
                🎯 Context-Aware
              </span>
            </div>
          )}
        </div>

        {/* Dual-Pane Layout */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Panel: Selection Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-4 sticky top-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Risk Selection</h3>
                {selectedCount > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {selectedCount} selected
                  </span>
                )}
              </div>
              
              {/* Priority Breakdown */}
              <div className="space-y-3 mb-4">
                {allPriorityGroups.map(group => {
                  const selectedInGroup = group.hazards.filter(h => prioritizedHazards.includes(h.id)).length
                  const totalInGroup = group.hazards.length
                  const percentage = totalInGroup ? (selectedInGroup / totalInGroup) * 100 : 0
                  
                  const colorClasses = {
                    red: 'bg-red-50 text-red-800 border-red-200',
                    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                    gray: 'bg-gray-50 text-gray-800 border-gray-200'
                  }[group.color]
                  
                  return (
                    <div key={group.key} className={`border rounded-lg p-3 transition-all ${colorClasses} ${selectedInGroup > 0 ? 'ring-1 ring-blue-200' : ''}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{group.title.split(' ')[1]} Priority</span>
                        <span className="text-xs font-mono">{selectedInGroup}/{totalInGroup}</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-current transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {selectedInGroup > 0 && (
                        <div className="text-xs text-current opacity-75 mt-1">
                          {Math.round(percentage)}% selected
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Total Selection */}
              <div className={`border rounded-lg p-4 mb-4 transition-all ${
                selectedCount > 0 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    selectedCount > 0 ? 'text-blue-900' : 'text-gray-500'
                  }`}>
                    {selectedCount}
                  </div>
                  <div className={`text-sm ${
                    selectedCount > 0 ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    Risk{selectedCount !== 1 ? 's' : ''} Selected
                  </div>
                  {selectedCount > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      Ready for assessment
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => {
                    const highPriorityIds = highPriorityHazards.map(h => h.id)
                    setPrioritizedHazards(highPriorityIds)
                  }}
                  disabled={highPriorityHazards.length === 0}
                  className="w-full px-3 py-2 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Select All High Priority ({highPriorityHazards.length})</span>
                </button>
                
                {selectedCount > 0 && (
                  <button
                    onClick={() => setPrioritizedHazards([])}
                    className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Context Reminder */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
                <div className="font-medium text-green-900 mb-2 flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Your Context</span>
                </div>
                <div className="text-green-800 space-y-1">
                  <div>📍 {locationData?.parish || 'Caribbean location'}</div>
                  <div>🏢 {businessData?.industryType?.replace(/_/g, ' ') || 'Small business'}</div>
                  {locationData?.nearCoast && (
                    <div className="text-blue-600">🌊 Coastal location</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Risk Selection */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {allPriorityGroups.map(group => {
                if (group.hazards.length === 0) return null
                
                const isExpanded = expandedGroups[group.key] || false
                const selectedInGroup = group.hazards.filter(h => prioritizedHazards.includes(h.id)).length

                return (
                  <div key={group.key} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedGroups(prev => ({ ...prev, [group.key]: !isExpanded }))}
                      className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{group.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            group.color === 'red' ? 'bg-red-100 text-red-800' :
                            group.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedInGroup}/{group.hazards.length} selected
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-200">
                        <div className="grid md:grid-cols-2 gap-3">
                          {group.hazards.map(hazard => (
                            <div 
                              key={hazard.id}
                              className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                prioritizedHazards.includes(hazard.id)
                                  ? `border-${group.color === 'red' ? 'red' : group.color === 'yellow' ? 'yellow' : 'blue'}-500 bg-${group.color === 'red' ? 'red' : group.color === 'yellow' ? 'yellow' : 'blue'}-50`
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => handleHazardToggle(hazard.id)}
                            >
                              <input
                                type="checkbox"
                                checked={prioritizedHazards.includes(hazard.id)}
                                onChange={() => {}}
                                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded pointer-events-none"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900 text-sm">{hazard.name}</h4>
                                  <div className="flex flex-wrap gap-1 ml-2">
                                    {/* Smart risk badges */}
                                    {hazard.locationBased && (
                                      <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap">
                                        📍 Location
                                      </span>
                                    )}
                                    {hazard.industryBased && (
                                      <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap">
                                        🏢 Industry
                                      </span>
                                    )}
                                    {/* Seasonal indicators */}
                                    {hazard.isSeasonallyActive && (
                                      <span className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full whitespace-nowrap">
                                        🔥 Peak Season
                                      </span>
                                    )}
                                    {/* Warning time indicator */}
                                    {hazard.warningTime && (
                                      <span className="inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full whitespace-nowrap">
                                        ⏰ {hazard.warningTime}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{hazard.reason}</p>
                                <p className="text-xs text-gray-500 mt-1">{getContextualInfo(hazard.id)}</p>
                                
                                {/* Cascading risk warnings */}
                                {hazard.cascadingRisks && hazard.cascadingRisks.length > 0 && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded border-l-2 border-amber-400">
                                    <p className="text-xs text-amber-700 font-medium">
                                      ⚠️ Often leads to: {hazard.cascadingRisks.slice(0, 3).join(', ')}
                                      {hazard.cascadingRisks.length > 3 && ` +${hazard.cascadingRisks.length - 3} more`}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Geographic scope */}
                                {hazard.geographicScope && (
                                  <div className="mt-1">
                                    <span className="text-xs text-gray-500">
                                      📍 Scope: {hazard.geographicScope}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Enhanced Bottom Actions */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    ← Back to Context
                  </button>
                  {selectedCount > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><span className="font-medium text-green-600">{selectedCount}</span> risks ready for assessment</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleContinue}
                  disabled={selectedCount === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedCount === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                  }`}
                >
                  {selectedCount === 0 ? (
                    'Select Risks to Continue'
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>Start Assessment</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
              
              {/* Smart recommendations */}
              {selectedCount > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 text-center">
                    💡 Recommended: Start with high-priority risks for faster completion
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {usingFallback ? 'Analyzing Risk Context' : 'Loading Smart Recommendations'}
            </h3>
            <p className="text-gray-600 text-sm">
              {usingFallback 
                ? 'Using standard risk analysis...'
                : 'AI is processing your location and business profile to prioritize relevant risks...'
              }
            </p>
            {error && (
              <p className="text-yellow-600 text-sm mt-2">
                ⚠️ Using fallback analysis - some smart features may be limited
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {currentStep === 'context' && renderContextStep()}
          {currentStep === 'selection' && renderSelectionStep()}
        </>
      )}
    </div>
  )
} 