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

type ViewMode = 'overview' | 'detail' | 'create' | 'edit'
type DisplayMode = 'cards' | 'table' | 'compact'

export function ImprovedStrategiesActionsTab() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('cards')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadStrategies()
  }, [refreshKey])
  
  useEffect(() => {
    if (viewMode === 'overview') {
      loadStrategies()
    }
  }, [viewMode])

  const loadStrategies = async () => {
    try {
      setIsLoading(true)
      const { centralDataService } = await import('../../services/centralDataService')
      const data = await centralDataService.getStrategies()
      setStrategies(data)
    } catch (error) {
      console.error('Failed to load strategies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveStrategy = async (strategy: Strategy) => {
    try {
      const strategyForApi = {
        ...strategy,
        applicableBusinessTypes: strategy.businessTypes || []
      }
      
      const { centralDataService } = await import('../../services/centralDataService')
      const savedStrategy = await centralDataService.saveStrategy(strategyForApi)
      
      if (strategy.id && strategies.find(s => s.id === strategy.id)) {
        setStrategies(prev => prev.map(s => s.id === strategy.id ? savedStrategy : s))
        setSelectedStrategy(savedStrategy)
      } else {
        setStrategies(prev => [...prev, savedStrategy])
        setSelectedStrategy(savedStrategy)
        setViewMode('edit')
      }
    } catch (error) {
      console.error('Failed to save strategy:', error)
      alert('Failed to save strategy. Please try again.')
    }
  }

  const handleAutoSaveUpdate = async (savedStrategy: Strategy) => {
    try {
      setStrategies(prev => prev.map(s => s.id === savedStrategy.id ? savedStrategy : s))
      if (selectedStrategy?.id === savedStrategy.id) {
        setSelectedStrategy(savedStrategy)
      }
    } catch (error) {
      console.error('Failed to handle auto-save update:', error)
    }
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

      const details = result.details
      let message = result.message
      if (details.errors && details.errors.length > 0) {
        message += `\n\nErrors encountered:\n${details.errors.slice(0, 5).join('\n')}`
        if (details.errors.length > 5) {
          message += `\n... and ${details.errors.length - 5} more errors`
        }
      }
      
      alert(message)
      await loadStrategies()
      setShowImportModal(false)
    } catch (error) {
      console.error('Failed to import strategies:', error)
      throw error
    }
  }

  // Filter and search logic
  const filteredStrategies = strategies.filter(strategy => {
    const categoryMatch = selectedCategory === 'all' || strategy.category === selectedCategory
    const riskMatch = selectedRisk === 'all' || strategy.applicableRisks.includes(selectedRisk)
    const priorityMatch = selectedPriority === 'all' || strategy.priority === selectedPriority
    const searchMatch = searchQuery === '' || 
      strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (strategy.smeDescription && strategy.smeDescription.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return categoryMatch && riskMatch && priorityMatch && searchMatch
  })

  const categories = ['prevention', 'preparation', 'response', 'recovery']
  const riskTypes = ['hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage', 'cyberAttack', 'terrorism', 'pandemicDisease', 'economicDownturn', 'supplyChainDisruption', 'civilUnrest']
  const priorities = ['low', 'medium', 'high', 'critical']

  // Statistics
  const stats = [
    {
      label: 'Total Strategies',
      value: strategies.length,
      change: '+2 this week',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '📋'
    },
    {
      label: 'High Priority',
      value: strategies.filter(s => s.priority === 'high' || s.priority === 'critical').length,
      change: '3 critical',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '🚨'
    },
    {
      label: 'Ready to Deploy',
      value: strategies.filter(s => s.actionSteps && s.actionSteps.length > 0).length,
      change: 'with action plans',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '✅'
    },
    {
      label: 'Avg Effectiveness',
      value: Math.round(strategies.reduce((sum, s) => sum + s.effectiveness, 0) / strategies.length * 10) / 10 || 0,
      change: '/10 rating',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '⭐'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading strategies...</p>
        </div>
      </div>
    )
  }

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
      <ImprovedStrategyDetailView
        strategy={selectedStrategy}
        onEdit={() => setViewMode('edit')}
        onBack={() => {
          setSelectedStrategy(null)
          setViewMode('overview')
        }}
      />
    )
  }

  const ViewModeButton = ({ mode, label }: { mode: ViewMode | DisplayMode; label: string }) => (
    <button
      onClick={() => {
        if (['cards', 'table', 'compact'].includes(mode)) {
          setDisplayMode(mode as DisplayMode)
        } else {
          setViewMode(mode as ViewMode)
        }
      }}
      className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md border-r border-gray-300 last:border-r-0 ${
        (viewMode === mode || displayMode === mode)
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div>
      {/* Compact Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-lg font-semibold text-gray-900">Risk Mitigation Strategies</h1>
            <span className="text-sm text-gray-600">
              {strategies.length} strategies • {strategies.filter(s => s.priority === 'high' || s.priority === 'critical').length} high priority
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Display Mode Toggle */}
            <nav className="flex border border-gray-300 rounded-md">
              <ViewModeButton mode="cards" label="Cards" />
              <ViewModeButton mode="table" label="Table" />
              <ViewModeButton mode="compact" label="Compact" />
            </nav>
            
            <div className="flex space-x-2">
              <button
                onClick={handleExportCombined}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Export
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700"
              >
                Import
              </button>
              <button
                onClick={() => setViewMode('create')}
                className="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 border border-transparent rounded hover:bg-purple-700"
              >
                + Create
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Compact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-lg p-4 border border-opacity-20`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                  <div className={`text-xs ${stat.color}`}>{stat.change}</div>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Compact Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search strategies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Filter Dropdowns */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Risk Types</option>
              {riskTypes.map(risk => (
                <option key={risk} value={risk}>
                  {risk.charAt(0).toUpperCase() + risk.slice(1)}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              {filteredStrategies.length} of {strategies.length} strategies
            </div>
          </div>
        </div>

        {/* Content Display */}
        {displayMode === 'cards' && (
          <StrategiesCardsView 
            strategies={filteredStrategies}
            onStrategySelect={(strategy) => {
              setSelectedStrategy(strategy)
              setViewMode('detail')
            }}
            onEditStrategy={(strategy) => {
              setSelectedStrategy(strategy)
              setViewMode('edit')
            }}
          />
        )}

        {displayMode === 'table' && (
          <StrategiesTableView 
            strategies={filteredStrategies}
            onStrategySelect={(strategy) => {
              setSelectedStrategy(strategy)
              setViewMode('detail')
            }}
            onEditStrategy={(strategy) => {
              setSelectedStrategy(strategy)
              setViewMode('edit')
            }}
          />
        )}

        {displayMode === 'compact' && (
          <StrategiesCompactView 
            strategies={filteredStrategies}
            onStrategySelect={(strategy) => {
              setSelectedStrategy(strategy)
              setViewMode('detail')
            }}
            onEditStrategy={(strategy) => {
              setSelectedStrategy(strategy)
              setViewMode('edit')
            }}
          />
        )}

        {/* Empty State */}
        {filteredStrategies.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <span className="text-4xl mb-4 block">🛡️</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Strategies Found</h3>
            <p className="text-gray-600 mb-4">
              {strategies.length === 0 
                ? "Get started by creating your first risk mitigation strategy" 
                : "Try adjusting your filters or create a new strategy"
              }
            </p>
            <button
              onClick={() => setViewMode('create')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create First Strategy
            </button>
          </div>
        )}
      </div>

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

// Compact Strategy Cards View
interface StrategiesViewProps {
  strategies: Strategy[]
  onStrategySelect: (strategy: Strategy) => void
  onEditStrategy: (strategy: Strategy) => void
}

function StrategiesCardsView({ strategies, onStrategySelect, onEditStrategy }: StrategiesViewProps) {
  const getCategoryInfo = (category: string) => {
    const categories = {
      prevention: { icon: '🛡️', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      preparation: { icon: '📋', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      response: { icon: '🚨', color: 'bg-red-100 text-red-800 border-red-200' },
      recovery: { icon: '🔄', color: 'bg-green-100 text-green-800 border-green-200' }
    }
    return categories[category as keyof typeof categories] || { icon: '📋', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  }

  const getPriorityInfo = (priority: string) => {
    const priorities = {
      critical: { icon: '🔴', color: 'bg-red-100 text-red-800 border-red-200' },
      high: { icon: '🟠', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      medium: { icon: '🟡', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      low: { icon: '🟢', color: 'bg-green-100 text-green-800 border-green-200' }
    }
    return priorities[priority as keyof typeof priorities] || { icon: '⚪', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {strategies.map(strategy => {
        const categoryInfo = getCategoryInfo(strategy.category)
        const priorityInfo = getPriorityInfo(strategy.priority)
        
        return (
          <div 
            key={strategy.id} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
            onClick={() => onStrategySelect(strategy)}
          >
            {/* Compact Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate hover:text-blue-600 transition-colors">
                  {strategy.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${categoryInfo.color}`}>
                    <span className="mr-1">{categoryInfo.icon}</span>
                    {strategy.category}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${priorityInfo.color}`}>
                    <span className="mr-1">{priorityInfo.icon}</span>
                    {strategy.priority}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                <div className="text-xs text-gray-500">
                  {strategy.effectiveness}/10
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  strategy.effectiveness >= 8 ? 'bg-green-500' :
                  strategy.effectiveness >= 6 ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`} />
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {strategy.smeDescription || strategy.description}
            </p>

            {/* Compact Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="text-center">
                <div className="text-gray-500">Cost</div>
                <div className="font-medium truncate">
                  {strategy.costEstimateJMD || strategy.implementationCost}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Time</div>
                <div className="font-medium truncate">
                  {strategy.timeToImplement || strategy.implementationTime}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">ROI</div>
                <div className="font-medium">
                  {strategy.roi ? `${strategy.roi}x` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Risks & Actions */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Risks:</span>
                <span className="font-medium">{strategy.applicableRisks.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Action Steps:</span>
                <span className="font-medium">{strategy.actionSteps?.length || 0}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStrategySelect(strategy)
                }}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
              >
                View Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditStrategy(strategy)
                }}
                className="text-green-600 hover:text-green-800 text-xs font-medium transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Table View
function StrategiesTableView({ strategies, onStrategySelect, onEditStrategy }: StrategiesViewProps) {
  const getCategoryIcon = (category: string) => {
    const icons = {
      prevention: '🛡️',
      preparation: '📋',
      response: '🚨',
      recovery: '🔄'
    }
    return icons[category as keyof typeof icons] || '📋'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    }
    return colors[priority as keyof typeof colors] || 'text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Strategy
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effectiveness
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risks
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {strategies.map(strategy => (
              <tr 
                key={strategy.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onStrategySelect(strategy)}
              >
                <td className="px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {strategy.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {strategy.smeDescription || strategy.description}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-lg" title={strategy.category}>
                    {getCategoryIcon(strategy.category)}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`text-sm font-medium ${getPriorityColor(strategy.priority)}`}>
                    {strategy.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-sm font-medium">{strategy.effectiveness}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      strategy.effectiveness >= 8 ? 'bg-green-500' :
                      strategy.effectiveness >= 6 ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-xs text-gray-600">
                  {strategy.costEstimateJMD || strategy.implementationCost}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-sm font-medium text-gray-900">
                    {strategy.applicableRisks.length}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onStrategySelect(strategy)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditStrategy(strategy)
                      }}
                      className="text-green-600 hover:text-green-800 text-xs font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Compact List View
function StrategiesCompactView({ strategies, onStrategySelect, onEditStrategy }: StrategiesViewProps) {
  const getCategoryIcon = (category: string) => {
    const icons = {
      prevention: '🛡️',
      preparation: '📋',
      response: '🚨',
      recovery: '🔄'
    }
    return icons[category as keyof typeof icons] || '📋'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'border-l-red-500 bg-red-50',
      high: 'border-l-orange-500 bg-orange-50',
      medium: 'border-l-yellow-500 bg-yellow-50',
      low: 'border-l-green-500 bg-green-50'
    }
    return colors[priority as keyof typeof colors] || 'border-l-gray-500 bg-gray-50'
  }

  return (
    <div className="space-y-2">
      {strategies.map(strategy => (
        <div 
          key={strategy.id}
          className={`bg-white border-l-4 border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all cursor-pointer ${getPriorityColor(strategy.priority)}`}
          onClick={() => onStrategySelect(strategy)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-lg flex-shrink-0">{getCategoryIcon(strategy.category)}</span>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {strategy.name}
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {strategy.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-600 truncate mt-0.5">
                  {strategy.smeDescription || strategy.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Quick Metrics */}
              <div className="hidden md:flex items-center space-x-3 text-xs text-gray-500">
                <div className="text-center">
                  <div className="font-medium text-gray-900">{strategy.effectiveness}/10</div>
                  <div>Effect</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{strategy.applicableRisks.length}</div>
                  <div>Risks</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{strategy.actionSteps?.length || 0}</div>
                  <div>Steps</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStrategySelect(strategy)
                  }}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                >
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditStrategy(strategy)
                  }}
                  className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 rounded border border-green-200 hover:bg-green-50"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Improved Strategy Detail View
interface ImprovedStrategyDetailViewProps {
  strategy: Strategy
  onEdit: () => void
  onBack: () => void
}

function ImprovedStrategyDetailView({ strategy, onEdit, onBack }: ImprovedStrategyDetailViewProps) {
  const getCategoryInfo = (category: string) => {
    const categories = {
      prevention: { name: 'Prevention', icon: '🛡️', color: 'blue', description: 'Prevent risks before they occur' },
      preparation: { name: 'Preparation', icon: '📋', color: 'yellow', description: 'Prepare for potential risks' },
      response: { name: 'Response', icon: '🚨', color: 'red', description: 'Respond when risks materialize' },
      recovery: { name: 'Recovery', icon: '🔄', color: 'green', description: 'Recover from risk impacts' }
    }
    return categories[category as keyof typeof categories] || { name: category, icon: '📋', color: 'gray', description: '' }
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Compact Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Strategies
            </button>
            <div className="h-4 border-l border-gray-300"></div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">{categoryInfo.icon}</span>
              <h1 className="text-xl font-bold text-gray-900">{strategy.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full border font-medium text-sm ${getPriorityColor(strategy.priority)}`}>
              {strategy.priority.charAt(0).toUpperCase() + strategy.priority.slice(1)} Priority
            </span>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
            >
              Edit Strategy
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-600">{strategy.effectiveness}/10</div>
            <div className="text-blue-700">Effectiveness</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-lg font-bold text-green-600">{strategy.roi || 'N/A'}</div>
            <div className="text-green-700">ROI</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="text-lg font-bold text-purple-600">{strategy.applicableRisks.length}</div>
            <div className="text-purple-700">Risk Types</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <div className="text-lg font-bold text-orange-600">{strategy.actionSteps?.length || 0}</div>
            <div className="text-orange-700">Action Steps</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strategy Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Strategy Overview</h2>
            
            <div className="space-y-4">
              {strategy.smeDescription && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">📋 For Business Owners</h3>
                  <p className="text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {strategy.smeDescription}
                  </p>
                </div>
              )}

              {strategy.whyImportant && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">💡 Why This Matters</h3>
                  <p className="text-gray-600 bg-green-50 p-4 rounded-lg border border-green-200">
                    {strategy.whyImportant}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">🔧 Technical Details</h3>
                <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {strategy.description}
                </p>
              </div>
            </div>
          </div>

          {/* Action Steps - Improved Layout */}
          {strategy.actionSteps && strategy.actionSteps.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Implementation Roadmap</h2>
              
              {['immediate', 'short_term', 'medium_term', 'long_term'].map(phase => {
                const phaseSteps = strategy.actionSteps.filter(step => step.phase === phase)
                if (phaseSteps.length === 0) return null

                const phaseConfig = {
                  immediate: { name: 'Immediate Actions', icon: '⚡', color: 'red', description: 'This week' },
                  short_term: { name: 'Short-term Actions', icon: '📅', color: 'orange', description: '1-4 weeks' },
                  medium_term: { name: 'Medium-term Actions', icon: '📊', color: 'yellow', description: '1-3 months' },
                  long_term: { name: 'Long-term Actions', icon: '🎯', color: 'green', description: '3-12 months' }
                }[phase] || { name: phase, icon: '📋', color: 'gray', description: '' }

                return (
                  <div key={phase} className={`border-l-4 border-${phaseConfig.color}-500 bg-${phaseConfig.color}-50 rounded-lg p-4 mb-4`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-xl">{phaseConfig.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{phaseConfig.name}</h3>
                        <p className="text-sm text-gray-600">{phaseConfig.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {phaseSteps.map((step, index) => (
                        <div key={step.id} className="bg-white rounded p-3 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {index + 1}. {step.smeAction || step.action}
                          </h4>
                          <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 mb-2">
                            <div><span className="font-medium">Timeline:</span> {step.timeframe}</div>
                            <div><span className="font-medium">Responsible:</span> {step.responsibility}</div>
                            <div><span className="font-medium">Cost:</span> {step.estimatedCostJMD || step.cost}</div>
                          </div>
                          {step.checklist && step.checklist.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Checklist:</span>
                              <ul className="mt-1 text-sm text-gray-600 ml-4">
                                {step.checklist.slice(0, 3).map((item, i) => (
                                  <li key={i} className="list-disc">{item}</li>
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
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Reference</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <span className="text-sm text-gray-900 flex items-center">
                  <span className="mr-1">{categoryInfo.icon}</span>
                  {categoryInfo.name}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Implementation Cost:</span>
                <span className="text-sm text-gray-900">{strategy.costEstimateJMD || strategy.implementationCost}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Time to Implement:</span>
                <span className="text-sm text-gray-900">{strategy.timeToImplement || strategy.implementationTime}</span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Applicable Risks:</span>
                <div className="flex flex-wrap gap-1">
                  {strategy.applicableRisks?.slice(0, 6).map(risk => (
                    <span key={risk} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      {risk}
                    </span>
                  ))}
                  {strategy.applicableRisks?.length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{strategy.applicableRisks.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Business Types:</span>
                <div className="flex flex-wrap gap-1">
                  {strategy.businessTypes?.slice(0, 4).map(type => (
                    <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                  {strategy.businessTypes?.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{strategy.businessTypes.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Success Guidance - Compact */}
          {(strategy.helpfulTips?.length || strategy.commonMistakes?.length || strategy.successMetrics?.length) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Success Guide</h2>
              
              <div className="space-y-4">
                {strategy.helpfulTips && strategy.helpfulTips.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                      <span className="mr-1">💡</span> Tips
                    </h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      {strategy.helpfulTips.slice(0, 2).map((tip, index) => (
                        <li key={index} className="text-xs">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {strategy.commonMistakes && strategy.commonMistakes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                      <span className="mr-1">⚠️</span> Avoid
                    </h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      {strategy.commonMistakes.slice(0, 2).map((mistake, index) => (
                        <li key={index} className="text-xs">{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {strategy.successMetrics && strategy.successMetrics.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-purple-700 mb-2 flex items-center">
                      <span className="mr-1">📈</span> Metrics
                    </h3>
                    <ul className="text-sm text-purple-800 space-y-1">
                      {strategy.successMetrics.slice(0, 2).map((metric, index) => (
                        <li key={index} className="text-xs">{metric}</li>
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


