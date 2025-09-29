'use client'

import React, { useState, useEffect } from 'react'
import { ParishOverview } from './ParishOverview'
import { ParishEditor } from './ParishEditor'
import { RiskMatrix } from './RiskMatrix'
import { BulkUploadModal } from './BulkUploadModal'
import { Parish } from '../../types/admin'
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
      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
        viewMode === mode
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )

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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-light text-gray-900 tracking-tight">
              Jamaica Parish Risk Assessment
            </h2>
            <p className="text-gray-600 mt-2 text-lg font-light">
              Manage environmental risk levels across all 14 Jamaica parishes
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Bulk Operations */}
              <button
                onClick={handleExportParishes}
              className="admin-btn-outline"
              >
              Download Data
              </button>
              <button
                onClick={() => setShowImportModal(true)}
              className="admin-btn-primary"
              >
              Upload Data
            </button>
          </div>
        </div>
            
        {/* View Mode Selector */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <ViewModeButton mode="overview" label="Parish Overview" />
            <ViewModeButton mode="matrix" label="Risk Matrix" />
            {selectedParish && (
              <ViewModeButton mode="editor" label="Edit Parish" />
            )}
          </nav>
        </div>
      </div>
      
      {/* Statistics Overview */}
      <div className="bg-gray-50 border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-gray-700">High Risk: {Array.isArray(parishes) ? parishes.filter(p => getMaxRiskLevel(p.riskProfile) >= 8).length : 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-700">Medium Risk: {Array.isArray(parishes) ? parishes.filter(p => {
                const risk = getMaxRiskLevel(p.riskProfile)
                return risk >= 5 && risk < 8
              }).length : 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-700">Low Risk: {Array.isArray(parishes) ? parishes.filter(p => getMaxRiskLevel(p.riskProfile) < 5).length : 0}</span>
            </div>
          </div>
          <div className="text-gray-600">
            Total: {parishes.length} parishes • Coastal: {Array.isArray(parishes) ? parishes.filter(p => p.isCoastal).length : 0}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {viewMode === 'overview' && (
          <ParishOverview
            parishes={parishes}
            onParishSelect={(parish: Parish) => {
              setSelectedParish(parish)
              setViewMode('editor')
            }}
          />
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