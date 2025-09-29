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

  const ViewModeButton = ({ mode, label, icon }: { mode: ViewMode; label: string; icon: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        viewMode === mode
          ? 'bg-purple-600 text-white shadow-sm'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <span>🏢</span>
              <span>Jamaica SME Business Types</span>
            </h2>
            <p className="text-gray-600 mt-2">
              Configure business type characteristics and risk profiles to power parish-specific SME risk assessments and strategy recommendations
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Bulk Operations */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportBusinessTypes}
                className="inline-flex items-center px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="mr-2">📊</span>
                Download Business Types
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="mr-2">📥</span>
                Bulk Upload
              </button>
            </div>
            
             {/* View Mode Selector */}
             <div className="flex space-x-2">
               <ViewModeButton mode="overview" label="Overview" icon="📊" />
               <ViewModeButton mode="strategies" label="Strategies & Actions" icon="🛡️" />
               {selectedBusinessType && (
                 <ViewModeButton mode="editor" label="Edit Business" icon="✏️" />
               )}
             </div>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
              <span>Total Business Types: {businessTypes.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
              <span>Hospitality: {businessTypes.filter(bt => bt.category === 'hospitality').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              <span>Retail: {businessTypes.filter(bt => bt.category === 'retail').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-orange-500 rounded-full"></span>
              <span>Services: {businessTypes.filter(bt => bt.category === 'services').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-red-500 rounded-full"></span>
              <span>High Tourism Dependency: {businessTypes.filter(bt => bt.touristDependency >= 7).length}</span>
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
