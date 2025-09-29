'use client'

import { useState, useEffect } from 'react'
import { StrategyForm } from './StrategyForm'
import { Strategy, ActionStep } from '../../types/admin'

interface BusinessStrategiesManagerProps {
  businessTypes: any[]
  onUpdate: () => void
}

export function BusinessStrategiesManager({ businessTypes, onUpdate }: BusinessStrategiesManagerProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detail' | 'create' | 'edit'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadStrategies()
  }, [refreshKey])
  
  useEffect(() => {
    // Refresh data when returning to overview mode
    if (viewMode === 'overview') {
      loadStrategies()
    }
  }, [viewMode])

  const loadStrategies = async () => {
    try {
      // Use centralized data service for loading
      const { centralDataService } = await import('../../services/centralDataService')
      const data = await centralDataService.getStrategies()
      setStrategies(data)
    } catch (error) {
      // TODO: Add proper error logging here
      console.error('Failed to load strategies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveStrategy = async (strategy: Strategy) => {
    try {
      // Map businessTypes to applicableBusinessTypes for API compatibility
      const strategyForApi = {
        ...strategy,
        applicableBusinessTypes: strategy.businessTypes || []
      }
      
      // Use centralized data service for saving
      const { centralDataService } = await import('../../services/centralDataService')
      const savedStrategy = await centralDataService.saveStrategy(strategyForApi)
      
      if (strategy.id) {
        // Update existing
        setStrategies(prev => prev.map(s => s.id === strategy.id ? savedStrategy : s))
        // Update selected strategy to reflect saved changes
        setSelectedStrategy(savedStrategy)
      } else {
        // Add new
        setStrategies(prev => [...prev, savedStrategy])
        setSelectedStrategy(savedStrategy)
        // For new strategies, switch to edit mode to continue working
        setViewMode('edit')
      }
      // DON'T automatically return to overview - let user continue editing
      onUpdate() // Notify parent of changes
    } catch (error) {
      console.error('Error saving strategy:', error)
      throw error
    }
  }

  // Handle auto-save updates from StrategyForm
  const handleAutoSaveUpdate = async (savedStrategy: Strategy) => {
    try {
      console.log('📋 BusinessStrategiesManager: Handling auto-save update for:', savedStrategy.name)
      
      // Update local strategies list with auto-saved changes
      setStrategies(prev => prev.map(s => s.id === savedStrategy.id ? savedStrategy : s))
      
      // Update selected strategy if it's the one being edited
      if (selectedStrategy?.id === savedStrategy.id) {
        setSelectedStrategy(savedStrategy)
      }
      
      console.log('📋 Local state updated with auto-saved changes')
    } catch (error) {
      console.error('Failed to handle auto-save update:', error)
    }
  }

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirm('Are you sure you want to delete this strategy? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin2/strategies/${strategyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStrategies(prev => prev.filter(s => s.id !== strategyId))
        setSelectedStrategy(null)
        setViewMode('overview')
      } else {
        throw new Error('Failed to delete strategy')
      }
    } catch (error) {
      console.error('Error deleting strategy:', error)
      alert('Failed to delete strategy. Please try again.')
    }
  }

  const categories = [
    { key: 'prevention', name: 'Prevention', icon: '🛡️', description: 'Proactive measures to prevent risks' },
    { key: 'preparation', name: 'Preparation', icon: '📋', description: 'Readiness and planning activities' },
    { key: 'response', name: 'Response', icon: '🚨', description: 'Immediate actions when risks occur' },
    { key: 'recovery', name: 'Recovery', icon: '🔄', description: 'Restoration and business continuity' }
  ]

  const riskTypes = [
    { key: 'hurricane', name: 'Hurricane', icon: '🌀' },
    { key: 'flood', name: 'Flood', icon: '🌊' },
    { key: 'earthquake', name: 'Earthquake', icon: '🏔️' },
    { key: 'drought', name: 'Drought', icon: '🌵' },
    { key: 'landslide', name: 'Landslide', icon: '⛰️' },
    { key: 'powerOutage', name: 'Power Outage', icon: '⚡' }
  ]

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      case 'very_high': return 'text-red-800 bg-red-100'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredStrategies = strategies.filter(strategy => {
    const categoryMatch = selectedCategory === 'all' || strategy.category === selectedCategory
    const riskMatch = selectedRisk === 'all' || strategy.applicableRisks.includes(selectedRisk)
    return categoryMatch && riskMatch
  })

  const StrategyCard = ({ strategy }: { strategy: Strategy }) => (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer"
      onClick={() => {
        setSelectedStrategy(strategy)
        setViewMode('detail')
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{strategy.name}</h4>
          <p className="text-gray-600 text-sm line-clamp-2">{strategy.description}</p>
        </div>
        <div className="ml-4 text-right">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(strategy.priority)}`}>
            {strategy.priority.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Cost</div>
          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getCostColor(strategy.implementationCost)}`}>
            {strategy.implementationCost.replace('_', ' ')}
          </div>
          {strategy.costEstimateJMD && (
            <div className="text-xs text-gray-500 mt-1">{strategy.costEstimateJMD}</div>
          )}
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Effectiveness</div>
          <div className="text-sm font-medium">{strategy.effectiveness}/10</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Applicable Risks</div>
        <div className="flex flex-wrap gap-1">
          {strategy.applicableRisks.slice(0, 3).map(risk => {
            const riskType = riskTypes.find(r => r.key === risk)
            return (
              <span key={risk} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                {riskType?.icon} {riskType?.name || risk}
              </span>
            )
          })}
          {strategy.applicableRisks.length > 3 && (
            <span className="text-xs text-gray-500">+{strategy.applicableRisks.length - 3} more</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Implementation: {strategy.implementationTime}</span>
        <span>{strategy.actionSteps?.length || 0} action steps</span>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading strategies...</p>
        </div>
      </div>
    )
  }

  if (viewMode === 'detail' && selectedStrategy) {
    return (
      <div className="space-y-6">
        {/* Strategy Detail Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{selectedStrategy.name}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('edit')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDeleteStrategy(selectedStrategy.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => {
                  setSelectedStrategy(null)
                  setViewMode('overview')
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                ← Back
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">{selectedStrategy.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Category</div>
              <div className="font-medium capitalize">{selectedStrategy.category}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Cost</div>
              <div className="font-medium capitalize">{selectedStrategy.implementationCost.replace('_', ' ')}</div>
              {selectedStrategy.costEstimateJMD && (
                <div className="text-xs text-gray-500 mt-1">{selectedStrategy.costEstimateJMD}</div>
              )}
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
              <div className="font-medium capitalize">{selectedStrategy.implementationTime}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Effectiveness</div>
              <div className="font-medium">{selectedStrategy.effectiveness}/10</div>
            </div>
          </div>
        </div>

        {/* Action Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Implementation Action Plan</h3>
          
          {['immediate', 'short_term', 'medium_term', 'long_term'].map(phase => {
            const phaseSteps = selectedStrategy.actionSteps?.filter(step => step.phase === phase) || []
            if (phaseSteps.length === 0) return null

            return (
              <div key={phase} className="mb-8 last:mb-0">
                <h4 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                  {phase.replace('_', ' ')} Actions
                </h4>
                <div className="space-y-4">
                  {phaseSteps.map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{step.action}</h5>
                        <span className="text-sm text-gray-500">{step.timeframe}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Responsibility:</span> {step.responsibility}
                        </div>
                        <div>
                          <span className="font-medium">Resources:</span> {step.resources.join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Estimated Cost:</span> {step.estimatedCostJMD || step.cost}
                        </div>
                      </div>
                      {step.checklist && step.checklist.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium text-gray-700 mb-2">Checklist:</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {step.checklist.map((item, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Information */}
        {(selectedStrategy.helpfulTips?.length || selectedStrategy.commonMistakes?.length || selectedStrategy.successMetrics?.length) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedStrategy.helpfulTips && selectedStrategy.helpfulTips.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">💡 Helpful Tips</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {selectedStrategy.helpfulTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedStrategy.commonMistakes && selectedStrategy.commonMistakes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Common Mistakes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {selectedStrategy.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedStrategy.successMetrics && selectedStrategy.successMetrics.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">📊 Success Metrics</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {selectedStrategy.successMetrics.map((metric, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (viewMode === 'create') {
    return (
      <StrategyForm
        onSave={handleSaveStrategy}
        onCancel={() => setViewMode('overview')}
        isEditing={false}
        onAutoSave={handleAutoSaveUpdate}
      />
    )
  }

  if (viewMode === 'edit' && selectedStrategy) {
    return (
      <StrategyForm
        strategy={selectedStrategy}
        onSave={handleSaveStrategy}
        onCancel={() => setViewMode('detail')}
        isEditing={true}
        onAutoSave={handleAutoSaveUpdate}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Risk Mitigation Strategies & Actions</h2>
            <p className="text-gray-600 mt-2">
              Comprehensive strategies and action plans for Jamaica SME risk management
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setViewMode('create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Strategy
            </button>
            {selectedStrategy && (
              <button 
                onClick={() => setViewMode('edit')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✏️ Edit Strategy
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Risk Type</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Risk Types</option>
              {riskTypes.map(risk => (
                <option key={risk.key} value={risk.key}>{risk.icon} {risk.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Strategy Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map(category => {
          const categoryStrategies = strategies.filter(s => s.category === category.key)
          return (
            <div key={category.key} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl mb-2">{category.icon}</div>
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{category.description}</p>
              <div className="text-2xl font-bold text-blue-600">{categoryStrategies.length}</div>
              <div className="text-xs text-gray-500">strategies</div>
            </div>
          )
        })}
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStrategies.map(strategy => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </div>

      {filteredStrategies.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl mb-4 block">🔍</span>
          <h3 className="text-lg font-medium mb-2">No Strategies Found</h3>
          <p>Try adjusting your filters or add new strategies</p>
        </div>
      )}
    </div>
  )
}
