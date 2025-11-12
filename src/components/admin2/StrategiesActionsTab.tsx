'use client'

import React, { useState, useEffect, useRef } from 'react'
import { StrategyEditor } from './StrategyEditor'
import { BulkUploadModal } from './BulkUploadModal'
import { Strategy, ActionStep } from '../../types/admin'
import { 
  exportStrategiesToCSV, 
  exportActionStepsToCSV, 
  parseStrategiesFromCSV, 
  parseActionStepsFromCSV,
  downloadCSV 
} from '@/utils/csvUtils'

// Component to display calculated strategy cost
function StrategyCostBadge({ strategy }: { strategy: Strategy }) {
  const [cost, setCost] = useState<string>('Calculating...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function calculateCost() {
      try {
        // Count total cost items across all action steps
        const totalCostItems = strategy.actionSteps.reduce((sum, step) => {
          return sum + (step.costItems?.length || 0)
        }, 0)

        if (totalCostItems === 0) {
          setCost('No cost items')
          setLoading(false)
          return
        }

        // Use the cost calculation service
        const { costCalculationService } = await import('../../services/costCalculationService')
        const result = await costCalculationService.calculateStrategyCost(strategy.actionSteps, 'JM')
        
        if (result.localTotal > 0) {
          setCost(`${result.currencySymbol}${result.localTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}`)
        } else if (result.usdTotal > 0) {
          setCost(`$${result.usdTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD`)
        } else {
          setCost('No cost items')
        }
      } catch (error) {
        console.error('Failed to calculate strategy cost:', error)
        setCost('Error')
      } finally {
        setLoading(false)
      }
    }

    calculateCost()
  }, [strategy])

  if (loading) {
    return <span className="text-gray-400 text-xs">...</span>
  }

  if (cost === 'No cost items') {
    return <span className="text-gray-400 text-xs">Not set</span>
  }

  return <span className="text-green-700 font-semibold">{cost}</span>
}

export function StrategiesActionsTab() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detail' | 'create' | 'edit'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [isImporting, setIsImporting] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Force refresh trigger
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadStrategies()
  }, [refreshKey]) // Reload when refreshKey changes
  
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
      console.error('Failed to load strategies:', error)
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
      
      // Update local state
      if (strategy.id && strategies.find(s => s.id === strategy.id)) {
        // Update existing strategy
        setStrategies(prev => prev.map(s => s.id === strategy.id ? savedStrategy : s))
        // Update selected strategy to reflect saved changes
        setSelectedStrategy(savedStrategy)
      } else {
        // Add new strategy
        setStrategies(prev => [...prev, savedStrategy])
        setSelectedStrategy(savedStrategy)
        // For new strategies, switch to edit mode to continue working
        setViewMode('edit')
      }

      // DON'T automatically return to overview - let user continue editing
      console.log('📋 Strategy saved successfully via centralDataService:', savedStrategy.name)
    } catch (error) {
      console.error('📋 Failed to save strategy:', error)
      alert('Failed to save strategy. Please try again.')
    }
  }

  // Handle auto-save updates from StrategyEditor
  const handleAutoSaveUpdate = async (savedStrategy: Strategy) => {
    try {
      console.log('📋 StrategiesActionsTab: Handling auto-save update for:', savedStrategy.name)
      
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

  // Force refresh function
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleExportStrategies = () => {
    const csvContent = exportStrategiesToCSV(strategies)
    downloadCSV(csvContent, 'strategies.csv')
  }

  const handleExportActionSteps = () => {
    const allActionSteps = strategies.flatMap(strategy =>
      strategy.actionSteps.map(step => ({
        ...step,
        strategyId: strategy.strategyId,
        strategyName: strategy.name
      }))
    )
    const csvContent = exportActionStepsToCSV(allActionSteps)
    downloadCSV(csvContent, 'action_steps.csv')
  }

  const handleExportCombined = async () => {
    try {
      const response = await fetch('/api/admin2/strategies/bulk-upload')
      if (!response.ok) {
        throw new Error('Failed to download strategies data')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `strategies_and_actions_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export strategies:', error)
      alert('Failed to download strategies data. Please try again.')
    }
  }

  const handleImportStrategies = async (file: File, replaceAll: boolean) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('replaceAll', replaceAll.toString())

      const response = await fetch('/api/admin2/strategies/bulk-upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      console.log('📋 Strategies import completed', result)
      
      // Show success message with details
      const details = result.details
      let message = result.message
      if (details.errors && details.errors.length > 0) {
        message += `\n\nErrors encountered:\n${details.errors.slice(0, 5).join('\n')}`
        if (details.errors.length > 5) {
          message += `\n... and ${details.errors.length - 5} more errors`
        }
      }
      
      alert(message)
      
      // Refresh data
      await loadStrategies()
      setShowImportModal(false)
    } catch (error) {
      console.error('Failed to import strategies:', error)
      throw error // Re-throw to be handled by the modal
    }
  }

  const filteredStrategies = strategies.filter(strategy => {
    const categoryMatch = selectedCategory === 'all' || strategy.category === selectedCategory
    const riskMatch = selectedRisk === 'all' || strategy.applicableRisks.includes(selectedRisk)
    return categoryMatch && riskMatch
  })

  const categories = ['prevention', 'preparation', 'response', 'recovery']
  const riskTypes = ['hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage', 'cyberAttack', 'terrorism', 'pandemicDisease', 'economicDownturn', 'supplyChainDisruption', 'civilUnrest']

  if (viewMode === 'create') {
    return (
      <StrategyEditor
        businessTypes={[]}
        onSave={handleSaveStrategy}
        onCancel={() => setViewMode('overview')}
        onAutoSave={handleAutoSaveUpdate}
      />
    )
  }

  if (viewMode === 'edit' && selectedStrategy) {
    return (
      <StrategyEditor
        strategy={selectedStrategy}
        businessTypes={[]}
        onSave={handleSaveStrategy}
        onCancel={() => {
          setSelectedStrategy(null)
          setViewMode('overview')
        }}
        onAutoSave={handleAutoSaveUpdate}
      />
    )
  }

  if (viewMode === 'detail' && selectedStrategy) {
    return (
      <StrategyDetailView
        strategy={selectedStrategy}
        onEdit={() => setViewMode('edit')}
        onBack={() => {
          setSelectedStrategy(null)
          setViewMode('overview')
        }}
      />
    )
  }

  const stats = [
    {
      label: 'Total Strategies',
      value: strategies.length.toString(),
      color: 'bg-blue-500'
    },
    {
      label: 'Prevention',
      value: strategies.filter(s => s.category === 'prevention').length.toString(),
      color: 'bg-green-500'
    },
    {
      label: 'Preparation',
      value: strategies.filter(s => s.category === 'preparation').length.toString(),
      color: 'bg-yellow-500'
    },
    {
      label: 'Response',
      value: strategies.filter(s => s.category === 'response').length.toString(),
      color: 'bg-orange-500'
    },
    {
      label: 'Recovery',
      value: strategies.filter(s => s.category === 'recovery').length.toString(),
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <span>🛡️</span>
              <span>Risk Mitigation Strategies & Action Plans</span>
            </h2>
            <p className="text-gray-600 mt-2">
              Manage comprehensive strategies and detailed action plans for Jamaica SME risk mitigation
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Bulk Operations */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportCombined}
                className="inline-flex items-center px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="mr-2">📊</span>
                Download
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="mr-2">📥</span>
                Bulk CSV Upload
              </button>
            </div>
            
            {/* Create Button */}
            <button
              onClick={() => setViewMode('create')}
              className="inline-flex items-center px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="mr-2">+</span>
              Create New Strategy
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-8 text-sm text-gray-600">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className={`h-2 w-2 ${stat.color} rounded-full`}></span>
                <span>{stat.label}: {stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Type</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Risk Types</option>
              {riskTypes.map(risk => (
                <option key={risk} value={risk}>
                  {risk.charAt(0).toUpperCase() + risk.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600 pt-6">
            Showing {filteredStrategies.length} of {strategies.length} strategies
          </div>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStrategies.map(strategy => (
          <div 
            key={strategy.id} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
            onClick={() => {
              setSelectedStrategy(strategy)
              setViewMode('detail')
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{strategy.name}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    strategy.category === 'prevention' ? 'bg-blue-100 text-blue-800' :
                    strategy.category === 'preparation' ? 'bg-green-100 text-green-800' :
                    strategy.category === 'response' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {strategy.category.charAt(0).toUpperCase() + strategy.category.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    strategy.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    strategy.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    strategy.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {strategy.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{strategy.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center text-sm">
              <div>
                <div className="text-gray-500">Cost (Calculated)</div>
                <div className="font-medium">
                  <StrategyCostBadge strategy={strategy} />
                </div>
              </div>
              <div>
                <div className="text-gray-500">Time</div>
                <div className="font-medium">{strategy.timeToImplement || strategy.implementationTime}</div>
              </div>
              <div>
                <div className="text-gray-500">Effectiveness</div>
                <div className="font-medium">{strategy.effectiveness}/10</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Applicable Risks:</div>
              <div className="flex flex-wrap gap-1">
                {strategy.applicableRisks.slice(0, 3).map(risk => (
                  <span key={risk} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {risk}
                  </span>
                ))}
                {strategy.applicableRisks.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                    +{strategy.applicableRisks.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                {strategy.actionSteps.length} action steps
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering the card click
                    setSelectedStrategy(strategy)
                    setViewMode('detail')
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering the card click
                    setSelectedStrategy(strategy)
                    setViewMode('edit')
                  }}
                  className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStrategies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <span className="text-4xl mb-4 block">📋</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Strategies Found</h3>
          <p className="text-gray-600 mb-4">
            {strategies.length === 0 
              ? "Get started by creating your first risk mitigation strategy" 
              : "Try adjusting your filters or create a new strategy"
            }
          </p>
          <button
            onClick={() => setViewMode('create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Strategy
          </button>
        </div>
      )}

      {/* Import Modal */}
      <BulkUploadModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUpload={handleImportStrategies}
        title="Bulk Upload Strategies & Action Plans"
        dataType="strategies and action plans"
        description="CSV file with combined strategies and action steps. Use the 'Data Type' column to distinguish between strategies and action steps. Each action step must link to a strategy via Strategy ID."
        exampleWorkflow={[
          'Download current data using the "Download" button above',
          'Open the CSV file in Excel or Google Sheets',
          'Edit strategies (rows where Data Type = "Strategy")',
          'Edit action steps (rows where Data Type = "Action Step")',
          'Maintain the Strategy ID to link action steps to strategies',
          'Save the file as CSV format and upload'
        ]}
        sampleHeaders={[
          'Data Type', 'Strategy ID', 'Strategy Name', 'Strategy Category', 'Strategy Priority', 
          'Strategy Description', 'SME Description', 'Why Important', 'Implementation Cost', 
          'Time to Implement', 'Effectiveness', 'ROI', 'Applicable Risks', 'Business Types',
          'Action Step ID', 'Action Step Phase', 'Action Step Description', 'SME Action',
          'Action Step Timeframe', 'Action Step Responsibility', 'Action Step Cost', 
          'Action Step Resources', 'Action Step Checklist'
        ]}
        warningMessage="Uploading strategy data will affect all risk mitigation recommendations across the entire system. This includes both the strategies themselves and their detailed implementation action plans."
      />
    </div>
  )
}

// Strategy Detail View Component
interface StrategyDetailViewProps {
  strategy: Strategy
  onEdit: () => void
  onBack: () => void
}

function StrategyDetailView({ strategy, onEdit, onBack }: StrategyDetailViewProps) {
  const getCategoryInfo = (category: string) => {
    const categories = {
      prevention: { name: 'Prevention', icon: '🛡️', color: 'blue' },
      preparation: { name: 'Preparation', icon: '📋', color: 'yellow' },
      response: { name: 'Response', icon: '🚨', color: 'red' },
      recovery: { name: 'Recovery', icon: '🔄', color: 'green' }
    }
    return categories[category as keyof typeof categories] || { name: category, icon: '📋', color: 'gray' }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const categoryInfo = getCategoryInfo(strategy.category)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </button>
            <div className="h-6 border-l border-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">{strategy.name}</h1>
          </div>
          <button
            onClick={onEdit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Edit Strategy
          </button>
        </div>

        {/* Strategy Meta */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{categoryInfo.icon}</span>
            <span className="font-medium">{categoryInfo.name}</span>
          </div>
          <div className={`px-3 py-1 rounded-full border font-medium ${getPriorityColor(strategy.priority)}`}>
            {strategy.priority.charAt(0).toUpperCase() + strategy.priority.slice(1)} Priority
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-medium">Effectiveness:</span>
            <span className="text-blue-600 font-semibold">{strategy.effectiveness}/10</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-medium">ROI:</span>
            <span className="text-green-600 font-semibold">{strategy.roi}x</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descriptions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">For Business Owners</h3>
                <p className="text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  {strategy.smeDescription || strategy.description}
                </p>
              </div>

              {strategy.whyImportant && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Why This Matters</h3>
                  <p className="text-gray-600 bg-green-50 p-4 rounded-lg border border-green-200">
                    {strategy.whyImportant}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Technical Description</h3>
                <p className="text-gray-600 text-sm">
                  {strategy.description}
                </p>
              </div>
            </div>
          </div>

          {/* Action Steps */}
          {strategy.actionSteps && strategy.actionSteps.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Implementation Steps</h2>
              
              <div className="space-y-4">
                {['before', 'during', 'after'].map(phase => {
                  const phaseSteps = strategy.actionSteps.filter(step => step.phase === phase)
                  if (phaseSteps.length === 0) return null

                  const phaseConfig = {
                    before: { name: 'Before Crisis', icon: '🛡️', description: 'Prevention & Preparation' },
                    during: { name: 'During Crisis', icon: '⚠️', description: 'Crisis Response' },
                    after: { name: 'After Crisis', icon: '✅', description: 'Recovery & Follow-up' }
                  }[phase] || { name: phase, icon: '📋', description: '' }

                  return (
                    <div key={phase} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-xl">{phaseConfig.icon}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{phaseConfig.name}</h3>
                          <p className="text-sm text-gray-600">{phaseConfig.description}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {phaseSteps.map((step, index) => (
                          <div key={step.id} className="bg-gray-50 rounded p-3">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Step {index + 1}: {step.smeAction || step.action}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div><span className="font-medium">Time:</span> {step.timeframe}</div>
                              <div><span className="font-medium">Who:</span> {step.responsibility}</div>
                              <div><span className="font-medium">Cost:</span> {step.estimatedCostJMD || step.cost}</div>
                            </div>
                            {step.checklist && step.checklist.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700">Checklist:</span>
                                <ul className="mt-1 text-sm text-gray-600">
                                  {step.checklist.slice(0, 3).map((item, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="text-green-600 mr-1">•</span>
                                      {item}
                                    </li>
                                  ))}
                                  {step.checklist.length > 3 && (
                                    <li className="text-gray-500 italic">...and {step.checklist.length - 3} more</li>
                                  )}
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
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Implementation Cost</span>
                <p className="text-gray-900">{strategy.costEstimateJMD || strategy.implementationCost}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Time to Implement</span>
                <p className="text-gray-900">{strategy.timeToImplement || strategy.implementationTime}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Applicable Risks</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {strategy.applicableRisks?.map(risk => (
                    <span key={risk} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {risk}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Business Types</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {strategy.businessTypes?.map(type => (
                    <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Guidance */}
          {(strategy.helpfulTips?.length || strategy.commonMistakes?.length || strategy.successMetrics?.length) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Guidance</h2>
              
              <div className="space-y-4">
                {strategy.helpfulTips && strategy.helpfulTips.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-green-700 mb-2">💡 Helpful Tips</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      {strategy.helpfulTips.slice(0, 3).map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {strategy.commonMistakes && strategy.commonMistakes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-red-700 mb-2">⚠️ Avoid These Mistakes</h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      {strategy.commonMistakes.slice(0, 3).map((mistake, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-600 mr-1">•</span>
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {strategy.successMetrics && strategy.successMetrics.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-purple-700 mb-2">📈 Success Metrics</h3>
                    <ul className="text-sm text-purple-800 space-y-1">
                      {strategy.successMetrics.slice(0, 3).map((metric, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-1">•</span>
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
