'use client'

import React, { useState, useEffect } from 'react'
import { BusinessTypeOverview } from './BusinessTypeOverview'
import { BusinessTypeEditor } from './BusinessTypeEditor'
import { BusinessStrategiesManager } from './BusinessStrategiesManager'
import { BulkUploadModal } from './BulkUploadModal'
import { BusinessType } from '../../types/admin'
import { logger } from '../../utils/logger'

type ViewMode = 'overview' | 'strategies' | 'editor'

export function BusinessTypesTab() {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    loadBusinessTypes()
  }, [])

  const loadBusinessTypes = async (forceRefresh: boolean = true) => {
    try {
      logger.info('BusinessTypesTab', 'Loading business types', { forceRefresh })
      
      // Use centralized data service for loading - ALWAYS fetch fresh data
      const { centralDataService } = await import('../../services/centralDataService')
      const data = await centralDataService.getBusinessTypes(forceRefresh)
      setBusinessTypes(data)
      
      logger.info('BusinessTypesTab', 'Successfully loaded business types', { count: data.length })
    } catch (error) {
      logger.error('BusinessTypesTab', 'Failed to load business types', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBusinessTypeUpdate = async (updatedBusinessType: BusinessType) => {
    try {
      logger.info('BusinessTypesTab', 'Updating business type', { 
        name: updatedBusinessType.name, 
        id: updatedBusinessType.id 
      })
      
      // Use centralized data service for saving
      const { centralDataService } = await import('../../services/centralDataService')
      const savedBusinessType = await centralDataService.saveBusinessType(updatedBusinessType)
      
      // Update local state
      setBusinessTypes(prev => prev.map(bt => bt.id === updatedBusinessType.id ? savedBusinessType : bt))
      setSelectedBusinessType(savedBusinessType)
      
      logger.info('BusinessTypesTab', 'Business type updated successfully', { name: savedBusinessType.name })
    } catch (error) {
      logger.error('BusinessTypesTab', 'Failed to update business type', error)
      // TODO: Replace with notification system
      alert('Failed to save business type changes. Please try again.')
    }
  }

  const handleExportBusinessTypes = async () => {
    try {
      const response = await fetch('/api/admin2/business-types/bulk-upload')
      if (!response.ok) {
        throw new Error('Failed to download business types data')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `business_types_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      logger.error('BusinessTypesTab', 'Failed to export business types', error)
      alert('Failed to download business types data. Please try again.')
    }
  }

  const handleImportBusinessTypes = async (file: File, replaceAll: boolean) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('replaceAll', replaceAll.toString())

      const response = await fetch('/api/admin2/business-types/bulk-upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      logger.info('BusinessTypesTab', 'Business types import completed', result)
      
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
      await loadBusinessTypes(true)
      setShowImportModal(false)
    } catch (error) {
      logger.error('BusinessTypesTab', 'Failed to import business types', error)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business types...</p>
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
            <h1 className="text-lg font-semibold text-gray-900">Business Types</h1>
            <span className="text-sm text-gray-600">
              {businessTypes.length} types • {businessTypes.filter(bt => bt.touristDependency >= 7).length} tourism-dependent
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <nav className="flex border border-gray-300 rounded-md">
              <ViewModeButton mode="overview" label="Overview" />
              <ViewModeButton mode="strategies" label="Strategies" />
              {selectedBusinessType && (
                <ViewModeButton mode="editor" label="Edit" />
              )}
            </nav>
            <div className="flex space-x-2">
              <button
                onClick={handleExportBusinessTypes}
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

      {/* Main Content */}
      <div>
        {viewMode === 'overview' && (
          <BusinessTypeOverview
            businessTypes={businessTypes}
            onBusinessTypeSelect={(businessType) => {
              setSelectedBusinessType(businessType)
              setViewMode('editor')
            }}
            onRefresh={loadBusinessTypes}
          />
         )}
         
         {viewMode === 'strategies' && (
           <BusinessStrategiesManager 
             businessTypes={businessTypes}
             onUpdate={loadBusinessTypes}
           />
         )}
         
         {viewMode === 'editor' && selectedBusinessType && (
          <BusinessTypeEditor
            businessType={selectedBusinessType}
            onUpdate={handleBusinessTypeUpdate}
            onClose={() => {
              setSelectedBusinessType(null)
              setViewMode('overview')
            }}
          />
        )}
      </div>

      {/* Import Modal */}
      <BulkUploadModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUpload={handleImportBusinessTypes}
        title="Bulk Upload Business Types"
        dataType="business types"
        description="CSV file with business type data including characteristics and risk vulnerabilities. Must include Business Type ID, Name, and Category columns."
        exampleWorkflow={[
          'Download current business types using the "Download Business Types" button',
          'Open the CSV file in Excel or Google Sheets',
          'Edit business type characteristics and risk vulnerability data',
          'Save the file as CSV format',
          'Upload the modified file using this import tool'
        ]}
        sampleHeaders={[
          'Business Type ID', 'Name', 'Category', 'Subcategory', 'Description',
          'Typical Revenue', 'Typical Employees', 'Operating Hours',
          'Seasonality Factor', 'Tourist Dependency', 'Supply Chain Complexity', 
          'Digital Dependency', 'Cash Flow Pattern', 'Physical Asset Intensity', 
          'Customer Concentration', 'Regulatory Burden',
          'Hurricane Vulnerability', 'Hurricane Recovery Impact',
          'Flood Vulnerability', 'Flood Recovery Impact',
          'Earthquake Vulnerability', 'Earthquake Recovery Impact',
          'Drought Vulnerability', 'Drought Recovery Impact',
          'Landslide Vulnerability', 'Landslide Recovery Impact',
          'Power Outage Vulnerability', 'Power Outage Recovery Impact'
        ]}
        warningMessage="Uploading business type data will affect risk calculations and strategy recommendations for all users. Each business type has detailed vulnerability assessments that impact the risk calculator."
      />
    </div>
  )
}
