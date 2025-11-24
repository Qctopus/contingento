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
import { getLocalizedText } from '@/utils/localizationUtils'

type ViewMode = 'overview' | 'detail' | 'create' | 'edit'
type DisplayMode = 'cards' | 'table' | 'compact'

export function ImprovedStrategiesActionsTab() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('cards')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
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
      console.log('🛡️ Loaded strategies:', data.length, 'strategies')
      if (data.length > 0) {
        console.log('🛡️ First strategy:', {
          id: data[0].id,
          name: data[0].name,
          nameType: typeof data[0].name,
          applicableRisks: data[0].applicableRisks,
          actionStepsCount: data[0].actionSteps?.length || 0,
          actionSteps: data[0].actionSteps,
          hasActionSteps: !!data[0].actionSteps && Array.isArray(data[0].actionSteps)
        })
        // Log action steps details for all strategies
        data.forEach((strategy: Strategy, index: number) => {
          const actionStepsCount = strategy.actionSteps?.length || 0
          if (actionStepsCount > 0) {
            console.log(`🛡️ Strategy ${index + 1} (${getLocalizedText(strategy.name, 'en')}): ${actionStepsCount} action steps`, strategy.actionSteps)
          } else {
            console.log(`🛡️ Strategy ${index + 1} (${getLocalizedText(strategy.name, 'en')}): NO action steps`)
          }
        })
      }
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
    const riskMatch = selectedRisk === 'all' || (strategy.applicableRisks && strategy.applicableRisks.includes(selectedRisk))
    const strategyName = getLocalizedText(strategy.name, 'en')
    const strategyDesc = getLocalizedText(strategy.description, 'en')
    const strategySme = getLocalizedText(strategy.smeSummary, 'en')
    const searchMatch = searchQuery === '' ||
      strategyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategyDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (strategySme && strategySme.toLowerCase().includes(searchQuery.toLowerCase()))

    return riskMatch && searchMatch
  })

  console.log('🛡️ Filtered strategies:', filteredStrategies.length, 'of', strategies.length)

  const riskTypes = ['hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage', 'cyberAttack', 'terrorism', 'pandemicDisease', 'economicDownturn', 'supplyChainDisruption', 'civilUnrest']

  // Statistics
  const readyToDeployCount = strategies.filter(s => s.actionSteps && s.actionSteps.length > 0).length
  const multilingualComplete = strategies.filter(s => {
    // Check if strategy has complete multilingual data
    try {
      // Helper to check multilingual field
      const isMultilingual = (field: any) => {
        if (!field) return false
        // Check if it's an object with all three languages
        return field && typeof field === 'object' && field.en && field.es && field.fr
      }

      const hasName = isMultilingual(s.name)
      const hasDesc = isMultilingual(s.description) || isMultilingual(s.smeSummary)
      return hasName && hasDesc
    } catch {
      return false
    }
  }).length

  // Calculate total action steps
  const totalActionSteps = strategies.reduce((sum, s) => sum + (s.actionSteps?.length || 0), 0)
  const avgStepsPerStrategy = strategies.length > 0 ? Math.round(totalActionSteps / strategies.length * 10) / 10 : 0

  const stats = [
    {
      label: 'Total Strategies',
      value: strategies.length,
      change: `${readyToDeployCount} with action plans`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '📋'
    },
    {
      label: 'Multilingual',
      value: multilingualComplete,
      change: `${Math.round(multilingualComplete / Math.max(strategies.length, 1) * 100)}% complete`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '🌍'
    },
    {
      label: 'Action Steps',
      value: totalActionSteps,
      change: `${avgStepsPerStrategy} avg per strategy`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '📝'
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
    console.log('🛡️ ImprovedStrategiesActionsTab: Passing strategy to StrategyEditor:', {
      id: selectedStrategy.id,
      name: getLocalizedText(selectedStrategy.name, 'en'),
      actionStepsCount: selectedStrategy.actionSteps?.length || 0,
      actionSteps: selectedStrategy.actionSteps,
      isArray: Array.isArray(selectedStrategy.actionSteps)
    })
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
      className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md border-r border-gray-300 last:border-r-0 ${(viewMode === mode || displayMode === mode)
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Section Header with better spacing */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">🛡️ Strategies & Action Plans</h2>
        <p className="text-gray-600">Manage mitigation strategies and action plans for business continuity</p>
      </div>

      {/* Compact Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-600">
              {strategies.length} strategies
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
          'Time to Implement', 'Effectiveness', 'Applicable Risks', 'Business Types',
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {strategies.map(strategy => {
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
                  {getLocalizedText(strategy.name, 'en')}
                </h3>
                <div className="flex items-center space-x-2">
                  {strategy.selectionTier && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${strategy.selectionTier === 'essential' ? 'bg-red-100 text-red-800 border-red-200' :
                        strategy.selectionTier === 'recommended' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                      <span className="mr-1">{
                        strategy.selectionTier === 'essential' ? '⭐' :
                          strategy.selectionTier === 'recommended' ? '👍' : '💡'
                      }</span>
                      {strategy.selectionTier}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
                    <span className="mr-1">📊</span>
                    {strategy.actionSteps?.length || 0} steps
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {getLocalizedText(strategy.smeTitle, 'en') || getLocalizedText(strategy.smeSummary || strategy.description, 'en')}
            </p>

            {/* Compact Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="text-center">
                <div className="text-gray-500">Cost</div>
                <div className="font-medium truncate">
                  {(() => {
                    const totalCost = strategy.actionSteps?.reduce((sum, step) => {
                      const costMatch = step.estimatedCost?.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
                      return sum + (costMatch ? parseFloat(costMatch[1].replace(/,/g, '')) : 0);
                    }, 0) || 0;
                    return totalCost > 0 ? `$${totalCost.toFixed(0)}` : 'Low cost';
                  })()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Time</div>
                <div className="font-medium truncate">
                  {(() => {
                    const totalMinutes = strategy.actionSteps?.reduce((sum, step) => sum + (step.estimatedMinutes || 0), 0) || 0;
                    const hours = Math.ceil(totalMinutes / 60);
                    return hours > 0 ? (hours >= 24 ? `${Math.ceil(hours / 8)}d` : `${hours}h`) : 'Quick';
                  })()}
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
                Tier
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
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
                      {getLocalizedText(strategy.name, 'en')}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {getLocalizedText(strategy.smeTitle, 'en') || getLocalizedText(strategy.smeSummary || strategy.description, 'en')}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  {strategy.selectionTier && (
                    <span className={`text-xs px-2 py-1 rounded-full ${strategy.selectionTier === 'essential' ? 'bg-red-100 text-red-700' :
                        strategy.selectionTier === 'recommended' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {strategy.selectionTier}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="text-sm font-medium">
                    {(() => {
                      const totalMinutes = strategy.actionSteps?.reduce((sum, step) => sum + (step.estimatedMinutes || 0), 0) || 0;
                      const hours = Math.ceil(totalMinutes / 60);
                      return hours > 0 ? `${hours}h` : '-';
                    })()}
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-xs text-gray-600">
                  {(() => {
                    const totalCost = strategy.actionSteps?.reduce((sum, step) => {
                      const costMatch = step.estimatedCost?.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
                      return sum + (costMatch ? parseFloat(costMatch[1].replace(/,/g, '')) : 0);
                    }, 0) || 0;
                    return totalCost > 0 ? `$${totalCost.toFixed(0)}` : 'Low';
                  })()}
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

  return (
    <div className="space-y-2">
      {strategies.map(strategy => {
        const totalCost = strategy.actionSteps?.reduce((sum, step) => {
          const costMatch = step.estimatedCost?.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
          return sum + (costMatch ? parseFloat(costMatch[1].replace(/,/g, '')) : 0);
        }, 0) || 0;

        const totalMinutes = strategy.actionSteps?.reduce((sum, step) => sum + (step.estimatedMinutes || 0), 0) || 0;
        const hours = Math.ceil(totalMinutes / 60);

        return (
          <div
            key={strategy.id}
            className={`bg-white border-l-4 border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all cursor-pointer ${strategy.selectionTier === 'essential' ? 'border-l-red-500 bg-red-50' :
                strategy.selectionTier === 'recommended' ? 'border-l-blue-500 bg-blue-50' :
                  'border-l-gray-500 bg-gray-50'
              }`}
            onClick={() => onStrategySelect(strategy)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">📋</span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {getLocalizedText(strategy.name, 'en')}
                    </h3>
                    {strategy.selectionTier && (
                      <span className={`text-xs px-2 py-0.5 rounded ${strategy.selectionTier === 'essential' ? 'bg-red-100 text-red-700' :
                          strategy.selectionTier === 'recommended' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {strategy.selectionTier}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate mt-0.5">
                    {getLocalizedText(strategy.smeTitle, 'en') || getLocalizedText(strategy.smeSummary || strategy.description, 'en')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 flex-shrink-0">
                {/* Quick Metrics */}
                <div className="hidden md:flex items-center space-x-3 text-xs text-gray-500">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">${totalCost}</div>
                    <div>Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{hours}h</div>
                    <div>Time</div>
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
        )
      })}
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
              <span className="text-xl">📋</span>
              <h1 className="text-xl font-bold text-gray-900">{getLocalizedText(strategy.name, 'en')}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {strategy.selectionTier && (
              <span className={`px-3 py-1 rounded-full border font-medium text-sm ${strategy.selectionTier === 'essential' ? 'bg-red-50 border-red-300 text-red-700' :
                  strategy.selectionTier === 'recommended' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                    'bg-gray-50 border-gray-300 text-gray-700'
                }`}>
                {strategy.selectionTier.charAt(0).toUpperCase() + strategy.selectionTier.slice(1)}
              </span>
            )}
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
            >
              Edit Strategy
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-600">
              {(() => {
                const totalMinutes = strategy.actionSteps?.reduce((sum, step) => sum + (step.estimatedMinutes || 0), 0) || 0
                const hours = Math.ceil(totalMinutes / 60)
                return hours > 0 ? `${hours}h` : 'TBD'
              })()}
            </div>
            <div className="text-blue-700">Est. Time</div>
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
              {strategy.smeSummary && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">📋 For Business Owners</h3>
                  <p className="text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {getLocalizedText(strategy.smeSummary, 'en')}
                  </p>
                </div>
              )}

              {strategy.whyImportant && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">💡 Why This Matters</h3>
                  <p className="text-gray-600 bg-green-50 p-4 rounded-lg border border-green-200">
                    {getLocalizedText(strategy.whyImportant, 'en')}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">🔧 Technical Details</h3>
                <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {getLocalizedText(strategy.description, 'en')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Steps - Improved Layout */}
          {(() => {
            // Group action steps by phase
            const phaseGroups: Record<string, any[]> = {
              immediate: [],
              short_term: [],
              medium_term: [],
              long_term: [],
              other: []
            }

            if (strategy.actionSteps && Array.isArray(strategy.actionSteps)) {
              // Use a Set to track step IDs we've already added to prevent duplicates
              const addedStepIds = new Set<string>()

              strategy.actionSteps.forEach(step => {
                if (!step || !step.id) return

                // Skip if we've already added this step
                if (addedStepIds.has(step.id)) {
                  return
                }

                const phase = step.phase || 'other'

                // Only add to phase group if it's a valid phase, otherwise add to 'other'
                if (['before', 'during', 'after'].includes(phase)) {
                  if (!phaseGroups[phase]) {
                    phaseGroups[phase] = []
                  }
                  phaseGroups[phase].push(step)
                  addedStepIds.add(step.id)
                } else {
                  phaseGroups.other.push(step)
                  addedStepIds.add(step.id)
                }
              })
            }

            // Check if we have any steps to display
            const hasSteps = Object.values(phaseGroups).some(steps => steps.length > 0)

            if (!hasSteps) {
              return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Implementation Roadmap</h2>
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl block mb-2">📝</span>
                    <p>No action steps defined yet</p>
                    <button
                      onClick={onEdit}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Add Action Steps
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Implementation Roadmap</h2>

                {['before', 'during', 'after'].map(phase => {
                  const phaseSteps = phaseGroups[phase] || []
                  if (phaseSteps.length === 0) return null

                  const phaseConfig = {
                    before: { name: 'Before Crisis', icon: '🛡️', color: 'blue', description: 'Prevention & Preparation' },
                    during: { name: 'During Crisis', icon: '⚠️', color: 'orange', description: 'Crisis Response' },
                    after: { name: 'After Crisis', icon: '✅', color: 'green', description: 'Recovery & Follow-up' }
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
                        {phaseSteps.map((step, index) => {
                          // Safely get step title with multiple fallbacks
                          const stepTitle = getLocalizedText(step.title || step.smeAction || step.description || 'Untitled Action', 'en')

                          // Parse checklist if it's a JSON string
                          let checklistArray = []
                          if (step.checklist) {
                            try {
                              if (typeof step.checklist === 'string') {
                                checklistArray = JSON.parse(step.checklist)
                              } else if (Array.isArray(step.checklist)) {
                                checklistArray = step.checklist
                              }
                            } catch (e) {
                              console.warn('Failed to parse checklist:', e)
                            }
                          }

                          return (
                            <div key={step.id || index} className="bg-white rounded p-3 shadow-sm">
                              <h4 className="font-medium text-gray-900 mb-2">
                                {index + 1}. {stepTitle}
                              </h4>
                              <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 mb-2">
                                <div><span className="font-medium">Timeline:</span> {getLocalizedText(step.timeframe, 'en') || `${step.estimatedMinutes || 0} min`}</div>
                                <div><span className="font-medium">Responsible:</span> {String(getLocalizedText(step.responsibility, 'en') || 'Owner')}</div>
                                <div><span className="font-medium">Cost:</span> {step.estimatedCost || '$0'}</div>
                              </div>
                              {checklistArray.length > 0 && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Checklist:</span>
                                  <ul className="mt-1 text-sm text-gray-600 ml-4">
                                    {checklistArray.slice(0, 3).map((item, i) => (
                                      <li key={i} className="list-disc">{typeof item === 'string' ? item : getLocalizedText(item, 'en')}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }).filter(Boolean)}

                {/* Show steps without a valid phase */}
                {phaseGroups.other && phaseGroups.other.length > 0 && (
                  <div className="border-l-4 border-gray-500 bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-xl">📋</span>
                      <div>
                        <h3 className="font-medium text-gray-900">Other Actions</h3>
                        <p className="text-sm text-gray-600">Actions without a specified phase</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {phaseGroups.other.map((step, index) => {
                        const stepTitle = getLocalizedText(step.title || step.smeAction || step.description || 'Untitled Action', 'en')
                        return (
                          <div key={step.id || index} className="bg-white rounded p-3 shadow-sm">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {index + 1}. {stepTitle}
                            </h4>
                            <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 mb-2">
                              <div><span className="font-medium">Timeline:</span> {getLocalizedText(step.timeframe, 'en') || `${step.estimatedMinutes || 0} min`}</div>
                              <div><span className="font-medium">Responsible:</span> {getLocalizedText(step.responsibility, 'en') || 'Owner'}</div>
                              <div><span className="font-medium">Cost:</span> {step.estimatedCost || '$0'}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Reference</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Selection Tier:</span>
                <span className={`text-sm px-2 py-1 rounded ${strategy.selectionTier === 'essential' ? 'bg-red-100 text-red-700' :
                    strategy.selectionTier === 'recommended' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                  }`}>
                  {strategy.selectionTier || 'optional'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Implementation Cost:</span>
                <span className="text-sm text-gray-900">
                  {(() => {
                    const totalCost = strategy.actionSteps?.reduce((sum, step) => {
                      const costMatch = step.estimatedCost?.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
                      return sum + (costMatch ? parseFloat(costMatch[1].replace(/,/g, '')) : 0);
                    }, 0) || 0;
                    return totalCost > 0 ? `$${totalCost.toFixed(0)} USD` : 'Low cost';
                  })()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Time to Implement:</span>
                <span className="text-sm text-gray-900">
                  {(() => {
                    const totalMinutes = strategy.actionSteps?.reduce((sum, step) => sum + (step.estimatedMinutes || 0), 0) || 0;
                    const hours = Math.ceil(totalMinutes / 60);
                    return hours > 0 ? (hours >= 24 ? `${Math.ceil(hours / 8)} days` : `${hours} hours`) : 'Quick';
                  })()}
                </span>
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
                        <li key={index} className="text-xs">
                          {typeof tip === 'string' ? tip : getLocalizedText(tip, 'en')}
                        </li>
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
                        <li key={index} className="text-xs">
                          {typeof mistake === 'string' ? mistake : getLocalizedText(mistake, 'en')}
                        </li>
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
                        <li key={index} className="text-xs">
                          {typeof metric === 'string' ? metric : getLocalizedText(metric, 'en')}
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


