'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { centralDataService } from '../services/centralDataService'
import type { Strategy } from '../types/admin'
import type { Locale } from '../i18n/config'
import StrategySelectionStep from './wizard/StrategySelectionStep'
import { getLocalizedText } from '../utils/localizationUtils'

interface AdminStrategyCardsProps {
  initialValue?: Strategy[]
  onComplete: (strategies: Strategy[]) => void
  setUserInteracted?: () => void
  riskData?: any // Risk data to match strategies against
  businessData?: {
    industryType?: string
    businessPurpose?: string
    productsServices?: string
  }
  locationData?: {
    country?: string
    countryCode?: string
    parish?: string
    nearCoast?: boolean
    urbanArea?: boolean
  }
  preFillData?: any
}

export function AdminStrategyCards({
  initialValue,
  onComplete,
  setUserInteracted,
  riskData,
  businessData,
  locationData,
  preFillData
}: AdminStrategyCardsProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>(initialValue || [])
  const [selectedStrategyIds, setSelectedStrategyIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useNewUI, setUseNewUI] = useState(false)
  
  const t = useTranslations('common')
  const locale = useLocale() as Locale

  // Load strategies from admin database
  useEffect(() => {
    const loadStrategies = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Check if we have pre-filled strategies from admin backend
        if (preFillData?.preFilledFields?.STRATEGIES?.['Business Continuity Strategies']) {
          const preFilledStrategies = preFillData.preFilledFields.STRATEGIES['Business Continuity Strategies']
          setStrategies(preFilledStrategies)
          
          // Check if strategies have the new priorityTier field (enhanced recommendation system)
          const hasNewFields = preFilledStrategies.some((s: any) => s.priorityTier !== undefined)
          setUseNewUI(hasNewFields)
          
          if (hasNewFields) {
            // Auto-select essential and recommended strategies
            const autoSelectedIds = preFilledStrategies
              .filter((strategy: any) => 
                strategy.priorityTier === 'essential' || strategy.priorityTier === 'recommended'
              )
              .map((s: any) => s.id)
            setSelectedStrategyIds(autoSelectedIds)
            
            // Also set selectedStrategies for backwards compatibility
            const autoSelected = preFilledStrategies.filter((s: any) => autoSelectedIds.includes(s.id))
            setSelectedStrategies(autoSelected)
          } else {
            // Auto-select high-effectiveness strategies (legacy)
            const autoSelected = preFilledStrategies.filter((strategy: Strategy) => 
              strategy.effectiveness && strategy.effectiveness >= 7
            )
            setSelectedStrategies(autoSelected)
            setSelectedStrategyIds(autoSelected.map(s => s.id))
          }
        } else {
          // Fallback: load all strategies from centralDataService
          const allStrategies = await centralDataService.getStrategies(true, locale)
          
          // Check if strategies have the new priorityTier field
          const hasNewFields = allStrategies.some((s: any) => s.priorityTier !== undefined)
          
          if (hasNewFields) {
            setStrategies(allStrategies)
            setUseNewUI(true)
            
            // Auto-select essential and recommended strategies
            const autoSelectedIds = allStrategies
              .filter((strategy: any) => 
                strategy.priorityTier === 'essential' || strategy.priorityTier === 'recommended'
              )
              .map((s: any) => s.id)
            setSelectedStrategyIds(autoSelectedIds)
            
            // Also set selectedStrategies for backwards compatibility
            const autoSelected = allStrategies.filter((s: any) => autoSelectedIds.includes(s.id))
            setSelectedStrategies(autoSelected)
          } else if (preFillData?.hazards && preFillData.hazards.length > 0) {
            // We have risks but strategies don't have priorityTier - match them dynamically
            
            // Get high-tier risks to determine essential vs recommended strategies
            const highTierRisks = preFillData.hazards.filter((h: any) => h.riskTier === 1 || h.riskScore >= 7)
            const mediumTierRisks = preFillData.hazards.filter((h: any) => h.riskTier === 2 || (h.riskScore >= 5 && h.riskScore < 7))
            
            // Enrich strategies with priority tiers based on risks
            const enrichedStrategies = allStrategies.map((strategy: any) => {
              // Match strategy to risks by checking applicableRisks
              const matchesHighRisk = strategy.applicableRisks?.some((riskId: string) => 
                highTierRisks.some((h: any) => h.hazardId === riskId)
              )
              const matchesMediumRisk = strategy.applicableRisks?.some((riskId: string) => 
                mediumTierRisks.some((h: any) => h.hazardId === riskId)
              )
              
              let priorityTier: 'essential' | 'recommended' | 'optional' = 'optional'
              let reasoning = strategy.reasoning || ''
              
              if (matchesHighRisk) {
                priorityTier = 'essential'
                if (!reasoning) {
                  const matchedRisk = highTierRisks.find((h: any) => 
                    strategy.applicableRisks?.includes(h.hazardId)
                  )
                  reasoning = `This is essential because you have critical ${matchedRisk?.hazardName || 'risk'}. This strategy directly reduces that danger.`
                }
              } else if (matchesMediumRisk) {
                priorityTier = 'recommended'
                if (!reasoning) {
                  const matchedRisk = mediumTierRisks.find((h: any) => 
                    strategy.applicableRisks?.includes(h.hazardId)
                  )
                  reasoning = `We recommend this because it addresses your ${matchedRisk?.hazardName || 'risk'} risk with proven effectiveness.`
                }
              } else if (strategy.effectiveness >= 7) {
                priorityTier = 'recommended'
                if (!reasoning) reasoning = 'Highly effective general strategy recommended for all businesses.'
              }
              
              return {
                ...strategy,
                priorityTier,
                reasoning
              }
            })
            
            setStrategies(enrichedStrategies)
            setUseNewUI(true)
            
            // Auto-select essential and recommended strategies
            const autoSelectedIds = enrichedStrategies
              .filter((strategy: any) => 
                strategy.priorityTier === 'essential' || strategy.priorityTier === 'recommended'
              )
              .map((s: any) => s.id)
            setSelectedStrategyIds(autoSelectedIds)
            
            const autoSelected = enrichedStrategies.filter((s: any) => autoSelectedIds.includes(s.id))
            setSelectedStrategies(autoSelected)
          } else {
            // No priorityTier and no risks - fall back to legacy UI
            setStrategies(allStrategies)
            setUseNewUI(false)
            
            // Auto-select high-effectiveness strategies (legacy)
            const autoSelected = allStrategies.filter((strategy: Strategy) => 
              strategy.effectiveness && strategy.effectiveness >= 7
            )
            setSelectedStrategies(autoSelected)
            setSelectedStrategyIds(autoSelected.map(s => s.id))
          }
        }
        
      } catch (error) {
        console.error('Failed to load strategies:', error)
        setError('Failed to load business continuity strategies')
      } finally {
        setLoading(false)
      }
    }
    
    loadStrategies()
  }, [locale, preFillData])

  // Notify parent when selection changes
  useEffect(() => {
    onComplete(selectedStrategies)
  }, [selectedStrategies, onComplete])

  const handleStrategyToggle = (strategy: Strategy) => {
    if (setUserInteracted) {
      setUserInteracted()
    }
    
    setSelectedStrategies(prev => {
      const isSelected = prev.some(s => s.id === strategy.id)
      if (isSelected) {
        return prev.filter(s => s.id !== strategy.id)
      } else {
        return [...prev, strategy]
      }
    })
    
    // Update selectedStrategyIds as well for new UI
    setSelectedStrategyIds(prev => {
      const isSelected = prev.includes(strategy.id)
      if (isSelected) {
        return prev.filter(id => id !== strategy.id)
      } else {
        return [...prev, strategy.id]
      }
    })
  }
  
  // Handler for new UI (strategy ID-based)
  const handleStrategyIdToggle = (strategyId: string) => {
    if (setUserInteracted) {
      setUserInteracted()
    }
    
    setSelectedStrategyIds(prev => {
      const isSelected = prev.includes(strategyId)
      if (isSelected) {
        return prev.filter(id => id !== strategyId)
      } else {
        return [...prev, strategyId]
      }
    })
    
    // Update selectedStrategies for backwards compatibility
    setSelectedStrategies(prev => {
      const strategy = strategies.find(s => s.id === strategyId)
      if (!strategy) return prev
      
      const isSelected = prev.some(s => s.id === strategyId)
      if (isSelected) {
        return prev.filter(s => s.id !== strategyId)
      } else {
        return [...prev, strategy]
      }
    })
  }
  
  // Auto-save whenever selection changes (with guard to prevent infinite loops)
  const prevSelectedIdsRef = useRef<string>('')
  useEffect(() => {
    if (strategies.length > 0) {
      const fullSelectedStrategies = strategies.filter(s => selectedStrategyIds.includes(s.id))
      const currentIdsString = selectedStrategyIds.sort().join(',')
      
      // Only call onComplete if the selection has actually changed
      if (currentIdsString !== prevSelectedIdsRef.current) {
        prevSelectedIdsRef.current = currentIdsString
        
        if (onComplete) {
          // Call onComplete with strategies array (not wrapped in object)
          onComplete(fullSelectedStrategies)
        }
      }
    }
  }, [selectedStrategyIds, strategies, onComplete])
  
  const handleContinue = () => {
    // Called by StrategySelectionStep's onContinue prop
    // Data is already auto-saved via useEffect above, this is just for the button
    console.log('✅ Strategy selection completed via Continue button')
  }

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'prevention': return '🛡️'
      case 'preparation': return '📋'
      case 'response': return '🚨'
      case 'recovery': return '🔄'
      case 'mitigation': return '⚡'
      default: return '📊'
    }
  }

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 8) return 'bg-green-100 text-green-800 border-green-200'
    if (effectiveness >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (effectiveness >= 4) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-gray-100 text-gray-600 border-gray-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Strategies</h3>
          <p className="text-gray-600 text-sm">Loading business continuity strategies from admin database...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Strategies</h3>
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  if (strategies.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <svg className="h-12 w-12 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-blue-900 mb-2">No Strategies Available</h3>
        <p className="text-blue-700">No business continuity strategies were found in the admin database.</p>
      </div>
    )
  }

  // If strategies have the new priorityTier field, use the enhanced UI
  if (useNewUI) {
    return (
      <StrategySelectionStep
        strategies={strategies as any}
        selectedStrategies={selectedStrategyIds}
        onStrategyToggle={handleStrategyIdToggle}
        onContinue={handleContinue}
        countryCode={locationData?.countryCode || 'JM'}
        validHazards={preFillData?.hazards}
      />
    )
  }

  // Otherwise, use the legacy UI below
  // Group strategies by category
  const strategiesByCategory = strategies.reduce((acc, strategy) => {
    const category = strategy.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(strategy)
    return acc
  }, {} as Record<string, Strategy[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">📋 Business Continuity Strategies</h2>
            <p className="text-green-100">
              Select strategies that are relevant for your {businessData?.industryType} business
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100">Selected</div>
            <div className="text-2xl font-bold">{selectedStrategies.length}/{strategies.length}</div>
          </div>
        </div>
        
        {preFillData?.preFilledFields?.STRATEGIES && (
          <div className="mt-4 bg-green-800 bg-opacity-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-100 text-sm">Strategies pre-loaded from admin database - high-effectiveness strategies auto-selected</span>
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
            <h3 className="font-medium text-gray-900 mb-1">Select Your Business Continuity Strategies</h3>
            <p className="text-sm text-gray-600">
              Choose strategies that are most relevant for your business. High-effectiveness strategies are recommended and may be pre-selected.
            </p>
          </div>
        </div>
      </div>

      {/* Strategy Categories */}
      {Object.entries(strategiesByCategory).map(([category, categoryStrategies]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span className="text-2xl">{getCategoryIcon(category)}</span>
            <span className="capitalize">{category} Strategies</span>
            <span className="text-sm text-gray-500">({categoryStrategies.length})</span>
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStrategies.map((strategy) => {
              const isSelected = selectedStrategies.some(s => s.id === strategy.id)
              
              return (
                <div
                  key={strategy.id}
                  onClick={() => handleStrategyToggle(strategy)}
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                    isSelected 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <label className="flex items-center mt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent div
                        className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </label>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{getLocalizedText(strategy.name, locale)}</h4>
                        {strategy.effectiveness && (
                          <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getEffectivenessColor(strategy.effectiveness)}`}>
                            {strategy.effectiveness}% effective
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{getLocalizedText(strategy.description, locale)}</p>
                      
                      <div className="space-y-2">
                        {strategy.implementationCost && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Cost:</span> {strategy.implementationCost}
                          </div>
                        )}
                        {strategy.timeToImplement && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Timeline:</span> {strategy.timeToImplement}
                          </div>
                        )}
                        {strategy.actionSteps && strategy.actionSteps.length > 0 && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Action Steps:</span> {strategy.actionSteps.length} steps
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Summary */}
      {selectedStrategies.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Strategies Summary</h3>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{selectedStrategies.length}</div>
              <div className="text-sm text-green-700">Selected Strategies</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {selectedStrategies.reduce((sum, s) => sum + (s.actionSteps?.length || 0), 0)}
              </div>
              <div className="text-sm text-blue-700">Total Action Steps</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">
                {selectedStrategies.filter(s => s.effectiveness && s.effectiveness >= 7).length}
              </div>
              <div className="text-sm text-orange-700">High Effectiveness</div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              You have selected strategies that will help protect your business from various risks. 
              These strategies include specific action steps that you can implement to improve your business continuity.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}






