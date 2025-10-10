'use client'

import React, { useState, useEffect } from 'react'
import { BusinessTypeOverview } from './BusinessTypeOverview'
import { BusinessTypeEditor } from './BusinessTypeEditor'
import { BusinessType } from '@/types/admin'

type ViewMode = 'overview' | 'editor'

export function BusinessTypesTab() {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBusinessTypes()
  }, [])

  const loadBusinessTypes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin2/business-types')
      if (!response.ok) throw new Error('Failed to load business types')
      
      const result = await response.json()
      // API returns { success: true, data: [...] }
      const data = result.success ? result.data : result
      setBusinessTypes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load business types:', error)
      setBusinessTypes([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectBusinessType = (businessType: BusinessType) => {
    setSelectedBusinessType(businessType)
    setViewMode('editor')
  }

  const handleBackToOverview = () => {
    setSelectedBusinessType(null)
    setViewMode('overview')
    loadBusinessTypes() // Refresh data
  }

  const handleUpdate = async (updatedBusinessType: BusinessType) => {
    // The BusinessTypeEditor handles the save internally
    await loadBusinessTypes()
    handleBackToOverview()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading business types...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Types Management</h2>
          <p className="text-gray-600 mt-1">
            Configure business type vulnerabilities and risk assessments
          </p>
        </div>
        
        {viewMode === 'editor' && (
          <button
            onClick={handleBackToOverview}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Overview
          </button>
        )}
      </div>

      {/* Content */}
      {viewMode === 'overview' ? (
        <BusinessTypeOverview
          businessTypes={businessTypes}
          onBusinessTypeSelect={handleSelectBusinessType}
          onRefresh={loadBusinessTypes}
        />
      ) : (
        selectedBusinessType && (
          <BusinessTypeEditor
            businessType={selectedBusinessType}
            onUpdate={handleUpdate}
            onClose={handleBackToOverview}
          />
        )
      )}
    </div>
  )
}

