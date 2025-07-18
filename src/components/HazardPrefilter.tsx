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
  initialSelection?: string[]
}

interface HazardInfo {
  id: string
  name: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  locationBased: boolean
  industryBased: boolean
}

export function HazardPrefilter({
  selectedHazards,
  onComplete,
  locationData,
  businessData,
  initialSelection = []
}: HazardPrefilterProps) {
  const [prioritizedHazards, setPrioritizedHazards] = useState<string[]>(initialSelection)
  const [hazardInfo, setHazardInfo] = useState<HazardInfo[]>([])
  const [showAllHazards, setShowAllHazards] = useState(false)
  const [currentStep, setCurrentStep] = useState<'context' | 'selection' | 'confirmation'>('context')
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({
    high: true,
    medium: false,
    low: false
  })
  
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

  // Get contextual risk information
  const getContextualInfo = (hazardId: string): string => {
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

  // Analyze and prioritize hazards based on context
  useEffect(() => {
    const analyzeHazards = () => {
      const hazardAnalysis: HazardInfo[] = []
      
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
          industryRisks = industryProfile.commonHazards
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
    
    analyzeHazards()
  }, [selectedHazards, locationData, businessData, initialSelection])

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
    } else if (currentStep === 'selection') {
      setCurrentStep('confirmation')
    } else {
      onComplete(prioritizedHazards)
    }
  }

  const handleBack = () => {
    if (currentStep === 'confirmation') {
      setCurrentStep('selection')
    } else if (currentStep === 'selection') {
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
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Risk Prioritization</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your location and business type, we've analyzed the risks most relevant to you.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📍 Your Location</h3>
              <p className="text-gray-700 capitalize">{context.location}</p>
              {locationData?.nearCoast && (
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Coastal Area
                </span>
              )}
              {locationData?.urbanArea && (
                <span className="inline-block mt-1 ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                  Urban Area
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🏢 Your Business</h3>
              <p className="text-gray-700 capitalize">{context.business}</p>
              {businessData?.businessPurpose && (
                <p className="text-sm text-gray-600 mt-1">
                  {businessData.businessPurpose.slice(0, 100)}...
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{context.highPriorityCount}</div>
            <div className="text-sm text-red-800">High Priority Risks</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{context.totalCount - context.highPriorityCount}</div>
            <div className="text-sm text-yellow-800">Other Risks to Consider</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-sm text-green-800">Customized for You</div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Review Risk Priorities →
          </button>
        </div>
      </div>
    )
  }

  const renderSelectionStep = () => {
    const highPriorityHazards = hazardInfo.filter(h => h.priority === 'high')
    const mediumPriorityHazards = hazardInfo.filter(h => h.priority === 'medium')
    const lowPriorityHazards = hazardInfo.filter(h => h.priority === 'low')

    const renderHazardGroup = (hazards: HazardInfo[], title: string, description: string, groupKey: string) => {
      if (hazards.length === 0) return null

      const isExpanded = expandedGroups[groupKey] || false

      return (
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => setExpandedGroups(prev => ({ ...prev, [groupKey]: !isExpanded }))}
            className="w-full px-4 py-3 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
          >
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExpanded && (
            <div className="p-4 space-y-3 border-t border-gray-200">
              {hazards.map(hazard => (
                <div 
                  key={hazard.id}
                  className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    prioritizedHazards.includes(hazard.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleHazardToggle(hazard.id)}
                >
                  <input
                    type="checkbox"
                    checked={prioritizedHazards.includes(hazard.id)}
                    onChange={() => {}} // Controlled by parent div
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded pointer-events-none"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{hazard.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        hazard.priority === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : hazard.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {hazard.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{hazard.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">{getContextualInfo(hazard.id)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Select Your Priority Risks</h2>
          <p className="text-gray-600">
            We've organized risks by priority based on your context. Start with high-priority risks.
          </p>
        </div>

        <div className="space-y-4">
          {renderHazardGroup(
            highPriorityHazards,
            "🔴 High Priority Risks",
            "Most relevant to your location and business type - recommend assessing these first",
            "high"
          )}
          
          {renderHazardGroup(
            mediumPriorityHazards,
            "🟡 Medium Priority Risks",
            "Important considerations based on location or industry factors",
            "medium"
          )}
          
          {renderHazardGroup(
            lowPriorityHazards,
            "⚪ Additional Risks",
            "General risks to consider for comprehensive planning",
            "low"
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">
              <p className="text-blue-800 font-medium">Recommendation:</p>
              <p className="text-blue-700">
                Start with {highPriorityHazards.length} high-priority risks, then add others as needed. 
                You can always modify your selection later.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={prioritizedHazards.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Continue with {prioritizedHazards.length} Risk{prioritizedHazards.length !== 1 ? 's' : ''} →
          </button>
        </div>
      </div>
    )
  }

  const renderConfirmationStep = () => {
    const selectedHazardInfo = hazardInfo.filter(h => prioritizedHazards.includes(h.id))
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to Assess These Risks</h2>
          <p className="text-gray-600">
            You've selected {prioritizedHazards.length} risk{prioritizedHazards.length !== 1 ? 's' : ''} for detailed assessment.
          </p>
        </div>

        <div className="grid gap-3">
          {selectedHazardInfo.map((hazard, index) => (
            <div key={hazard.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{hazard.name}</h4>
                <p className="text-sm text-gray-600">{getContextualInfo(hazard.id)}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                hazard.priority === 'high' 
                  ? 'bg-red-100 text-red-800'
                  : hazard.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {hazard.priority}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">🎯 What's Next?</h3>
          <p className="text-green-800 text-sm">
            You'll assess each risk individually with contextual guidance specific to your business and location. 
            This focused approach ensures more thoughtful and accurate risk evaluations.
          </p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Modify Selection
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Start Risk Assessment →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {currentStep === 'context' && renderContextStep()}
      {currentStep === 'selection' && renderSelectionStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </div>
  )
} 