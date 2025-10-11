'use client'

import React, { useState, useEffect } from 'react'
import { ParishOverview } from './ParishOverview'
import { ParishEditor } from './ParishEditor'
import { RiskMatrix } from './RiskMatrix'
import { BulkUploadModal } from './BulkUploadModal'
import { Parish, RISK_TYPES } from '../../types/admin'
import { getMaxRiskLevel } from '../../utils/riskUtils'
import { logger } from '../../utils/logger'

type ViewMode = 'overview' | 'matrix' | 'editor'

export function LocationRisksTab() {
  const [parishes, setParishes] = useState<Parish[]>([])
  const [selectedParish, setSelectedParish] = useState<Parish | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    logger.info('LocationRisksTab', 'Component mounted - loading fresh parish data')
    loadParishes(true)
  }, [])

  const loadParishes = async (forceRefresh: boolean = true) => {
    try {
      logger.info('LocationRisksTab', 'Loading parishes', { forceRefresh })
      
      // Use centralized data service for loading - ALWAYS fetch fresh data
      const { centralDataService } = await import('../../services/centralDataService')
      const data = await centralDataService.getParishes(forceRefresh)
      
      // Defensive programming: ensure data is an array
      if (!Array.isArray(data)) {
        logger.error('LocationRisksTab', 'Expected array but got:', { type: typeof data, data })
        setParishes([])
        return
      }
      
      setParishes(data)
      logger.info('LocationRisksTab', 'Successfully loaded parishes', { count: data.length })
    } catch (error) {
      logger.error('LocationRisksTab', 'Failed to load parishes', error)
      setParishes([]) // Ensure parishes is always an array
    } finally {
      setIsLoading(false)
    }
  }

  const handleParishUpdate = async (updatedParish: Parish) => {
    try {
      logger.info('LocationRisksTab', 'Saving parish', { 
        name: updatedParish.name, 
        riskCount: Object.keys(updatedParish.riskProfile).length 
      })
      
      // Use centralized data service for saving
      const { centralDataService } = await import('../../services/centralDataService')
      const savedParish = await centralDataService.saveParish(updatedParish)
      
      logger.info('LocationRisksTab', 'Parish saved successfully', { name: savedParish.name })
      
      // Update local state
      setParishes(prev => prev.map(p => p.id === updatedParish.id ? savedParish : p))
      setSelectedParish(savedParish)
    } catch (error) {
      logger.error('LocationRisksTab', 'Failed to save parish', error)
      // TODO: Replace with notification system
      alert('Failed to save parish changes. Please try again.')
    }
  }

  const handleExportParishes = async () => {
    try {
      const response = await fetch('/api/admin2/parishes/bulk-upload')
      if (!response.ok) {
        throw new Error('Failed to download parishes data')
      }
      
      const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jamaica_parishes_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    } catch (error) {
      logger.error('LocationRisksTab', 'Failed to export parishes', error)
      alert('Failed to download parishes data. Please try again.')
    }
  }

  const handleImportParishes = async (file: File, replaceAll: boolean) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('replaceAll', replaceAll.toString())

      const response = await fetch('/api/admin2/parishes/bulk-upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      logger.info('LocationRisksTab', 'Parish import completed', result)
      
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
      await loadParishes(true)
      setShowImportModal(false)
    } catch (error) {
      logger.error('LocationRisksTab', 'Failed to import parishes', error)
      throw error // Re-throw to be handled by the modal
    }
  }


  const ViewModeButton = ({ mode, label }: { mode: ViewMode; label: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md border-r border-gray-300 last:border-r-0 ${
        viewMode === mode
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )

  const RiskIndicator = ({ level }: { level: number }) => {
    const getRiskColor = (level: number) => {
      if (level >= 8) return 'bg-red-500'
      if (level >= 6) return 'bg-orange-500'
      if (level >= 4) return 'bg-yellow-500'
      if (level >= 2) return 'bg-blue-500'
      return 'bg-gray-300'
    }

    const getRiskText = (level: number) => {
      if (level >= 8) return 'Critical'
      if (level >= 6) return 'High'
      if (level >= 4) return 'Medium'
      if (level >= 2) return 'Low'
      return 'None'
    }

    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${getRiskColor(level)}`}></div>
        <span className="text-sm font-medium text-gray-900">{level}</span>
        <span className="text-xs text-gray-500">{getRiskText(level)}</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parish data...</p>
        </div>
      </div>
    )
  }

  return (
          <div>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-lg font-semibold text-gray-900">Administrative Units</h1>
            <span className="text-sm text-gray-600">
              {parishes.length} administrative units
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <nav className="flex border border-gray-300 rounded-md">
              <ViewModeButton mode="overview" label="List" />
              <ViewModeButton mode="matrix" label="Matrix" />
            </nav>
            <div className="flex space-x-2">
              <button
                onClick={handleExportParishes}
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
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {viewMode === 'overview' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                  {RISK_TYPES.map(risk => (
                    <th key={risk.key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <span className="text-sm">{risk.icon}</span>
                        <span className="text-xs">{risk.name.split(' ')[0]}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parishes.map((parish) => {
                  const maxRisk = getMaxRiskLevel(parish.riskProfile)
                  return (
                    <tr key={parish.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{parish.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parish.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parish.population?.toLocaleString() || 'N/A'}
                      </td>
                      {RISK_TYPES.map(risk => {
                        const riskData = parish.riskProfile[risk.key as keyof typeof parish.riskProfile] as { level: number } | undefined
                        const level = riskData?.level || 0
                        return (
                          <td key={risk.key} className="px-6 py-4 whitespace-nowrap text-center">
                            <RiskIndicator level={level} />
                          </td>
                        )
                      })}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RiskIndicator level={maxRisk} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {viewMode === 'matrix' && (
          <RiskMatrix parishes={parishes} />
        )}
        
        {viewMode === 'editor' && selectedParish && (
          <ParishEditor
            parish={selectedParish}
            onUpdate={handleParishUpdate}
            onClose={() => {
              setSelectedParish(null)
              setViewMode('overview')
            }}
          />
        )}
      </div>

      {/* Import Modal */}
      <BulkUploadModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUpload={handleImportParishes}
        title="Bulk Upload Parish Risk Data"
        dataType="parish risk"
        description="CSV file with parish risk data. Must include Parish Name and Region columns. Risk levels should be on a 1-10 scale."
        exampleWorkflow={[
          'Download current parish data using the "Download Parishes" button',
          'Open the CSV file in Excel or Google Sheets',
          'Edit the parish information and risk levels as needed',
          'Save the file as CSV format',
          'Upload the modified file using this import tool'
        ]}
        sampleHeaders={[
          'Parish Name', 'Region', 'Is Coastal', 'Is Urban', 'Population',
          'Hurricane Risk', 'Hurricane Notes', 'Flood Risk', 'Flood Notes',
          'Earthquake Risk', 'Earthquake Notes', 'Drought Risk', 'Drought Notes',
          'Landslide Risk', 'Landslide Notes', 'Power Outage Risk', 'Power Outage Notes',
          'Area', 'Elevation', 'Coordinates'
        ]}
        warningMessage="Uploading parish data will update risk assessments for all Jamaica parishes. This affects the main risk calculation system used by businesses."
      />
    </div>
  )
}