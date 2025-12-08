'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useAutoSave } from '../../hooks/useAutoSave'
import { AutoSaveIndicator } from './AutoSaveIndicator'
import { BusinessType } from '../../types/admin'
import { BUSINESS_CATEGORIES } from '../../constants/admin'
import { logger } from '../../utils/logger'
import { locales, localeMetadata, type Locale } from '@/i18n/config'

interface BusinessTypeEditorProps {
  businessType: BusinessType
  onUpdate: (businessType: BusinessType) => void
  onClose: () => void
}

export function BusinessTypeEditor({ businessType, onUpdate, onClose }: BusinessTypeEditorProps) {
  const [editedBusinessType, setEditedBusinessType] = useState<BusinessType>(businessType)
  const [activeTab, setActiveTab] = useState<'basic' | 'examples' | 'risks'>('basic')
  const [activeLanguage, setActiveLanguage] = useState<Locale>('en')

  // Sync state when businessType prop changes
  useEffect(() => {
    if (businessType) {
      setEditedBusinessType(businessType)
    }
  }, [businessType])

  // Include ALL risk types
  const riskTypes = [
    'hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage', 
    'fire', 'cyberAttack', 'terrorism', 'pandemicDisease', 'economicDownturn', 
    'supplyChainDisruption', 'civilUnrest'
  ]

  const handleSave = async () => {
    // Force immediate save and close
    await forceSave()
    onClose()
  }

  // Auto-save function using centralized data service
  const saveBusinessType = useCallback(async (data: BusinessType) => {
    try {
      logger.info('BusinessTypeEditor', 'Auto-saving business type', { name: data.name, id: data.id })
      
      // Use centralized data service directly for auto-save
      const { centralDataService } = await import('../../services/centralDataService')
      const savedBusinessType = await centralDataService.saveBusinessType(data)
      
      // Update local state with saved data to keep UI synchronized
      setEditedBusinessType(savedBusinessType)
      
      // Notify parent of the update
      onUpdate(savedBusinessType)
      
      logger.info('BusinessTypeEditor', 'Auto-save completed successfully', { name: savedBusinessType.name })
    } catch (error) {
      logger.error('BusinessTypeEditor', 'Auto-save failed', error)
      throw error
    }
  }, [onUpdate])

  // Use the auto-save hook
  const { autoSaveStatus, forceSave } = useAutoSave({
    data: editedBusinessType,
    saveFunction: saveBusinessType,
    delay: 1000
  })

  const updateField = (field: keyof BusinessType, value: any) => {
    setEditedBusinessType(prev => ({ ...prev, [field]: value }))
  }

  // Helper to parse multilingual JSON
  const parseMultilingual = (value: any): Record<Locale, string> => {
    const result: Record<Locale, string> = { en: '', es: '', fr: '' }
    if (!value) return result
    
    // If it's already an object (multilingual)
    if (typeof value === 'object' && value !== null) {
      for (const loc of locales) {
        result[loc] = value[loc] || ''
      }
      return result
    }
    
    // If it's a string, try to parse as JSON
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (typeof parsed === 'object' && parsed !== null) {
          for (const loc of locales) {
            result[loc] = parsed[loc] || ''
          }
          return result
        }
        result.en = value
        return result
      } catch {
        result.en = value
        return result
      }
    }
    
    return result
  }

  // Helper to parse array of multilingual objects
  // Handles two formats:
  // 1. Array of objects: [{en: "...", es: "...", fr: "..."}, ...]
  // 2. Object with arrays: {en: ["...", "..."], es: ["...", "..."], fr: ["...", "..."]}
  const parseMultilingualArray = (value: any): Array<Record<Locale, string>> => {
    const emptyItem = (): Record<Locale, string> => {
      const item: Record<Locale, string> = {} as Record<Locale, string>
      for (const loc of locales) item[loc] = ''
      return item
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        
        // Format 1: Already an array of multilingual objects
        if (Array.isArray(parsed)) {
          return parsed
        }
        
        // Format 2: Object with language keys containing arrays - need to transpose
        if (parsed && typeof parsed === 'object') {
          const arrays: Record<Locale, string[]> = {} as Record<Locale, string[]>
          let maxLength = 0
          for (const loc of locales) {
            arrays[loc] = parsed[loc] || []
            maxLength = Math.max(maxLength, arrays[loc].length)
          }
          
          const result: Array<Record<Locale, string>> = []
          for (let i = 0; i < maxLength; i++) {
            const item = emptyItem()
            for (const loc of locales) {
              item[loc] = arrays[loc][i] || ''
            }
            result.push(item)
          }
          return result
        }
        
        return []
      } catch {
        return []
      }
    }
    
    // Already parsed
    if (Array.isArray(value)) {
      return value
    }
    
    // Handle object format directly
    if (value && typeof value === 'object') {
      const arrays: Record<Locale, string[]> = {} as Record<Locale, string[]>
      let maxLength = 0
      for (const loc of locales) {
        arrays[loc] = value[loc] || []
        maxLength = Math.max(maxLength, arrays[loc].length)
      }
      
      if (maxLength === 0) return []
      
      const result: Array<Record<Locale, string>> = []
      for (let i = 0; i < maxLength; i++) {
        const item = emptyItem()
        for (const loc of locales) {
          item[loc] = arrays[loc][i] || ''
        }
        result.push(item)
      }
      return result
    }
    
    return []
  }

  // Helper to update multilingual field
  const updateMultilingualField = (field: keyof BusinessType, lang: Locale, value: string) => {
    const current = parseMultilingual(editedBusinessType[field])
    current[lang] = value
    updateField(field, JSON.stringify(current))
  }

  // Helper to update multilingual array
  const updateMultilingualArray = (field: keyof BusinessType, index: number, lang: Locale, value: string) => {
    const current = parseMultilingualArray(editedBusinessType[field])
    if (!current[index]) {
      const emptyItem: Record<Locale, string> = {} as Record<Locale, string>
      for (const loc of locales) emptyItem[loc] = ''
      current[index] = emptyItem
    }
    current[index][lang] = value
    updateField(field, JSON.stringify(current))
  }

  // Helper to add item to multilingual array
  const addMultilingualArrayItem = (field: keyof BusinessType) => {
    const current = parseMultilingualArray(editedBusinessType[field])
    const emptyItem: Record<Locale, string> = {} as Record<Locale, string>
    for (const loc of locales) emptyItem[loc] = ''
    current.push(emptyItem)
    updateField(field, JSON.stringify(current))
  }

  // Helper to remove item from multilingual array
  const removeMultilingualArrayItem = (field: keyof BusinessType, index: number) => {
    const current = parseMultilingualArray(editedBusinessType[field])
    current.splice(index, 1)
    updateField(field, JSON.stringify(current))
  }

  return (
    <>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Business Type: {parseMultilingual(editedBusinessType.name).en || editedBusinessType.businessTypeId}
            </h2>
            <AutoSaveIndicator autoSaveStatus={autoSaveStatus} className="mt-2" />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={autoSaveStatus.isSaving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {autoSaveStatus.isSaving ? 'Saving...' : 'Save & Close'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'basic', label: 'Basic Info', icon: '📋' },
              { key: 'examples', label: 'Wizard Examples (Multilingual)', icon: '🌍' },
              { key: 'risks', label: 'Risk Vulnerabilities', icon: '⚠️' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-blue-800">Business Type Templates</h4>
                  <p className="text-sm text-blue-700 mt-1">This provides reference information and example content that helps users understand what to enter in the wizard. User-specific characteristics (tourism %, seasonality, etc.) are collected from users in the wizard itself.</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            {/* Language Selector for Name & Description */}
            <div className="flex space-x-2 mb-4">
              {locales.map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    activeLanguage === lang
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {localeMetadata[lang].flag} {localeMetadata[lang].label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type Name ({localeMetadata[activeLanguage].label})
                </label>
                <input
                  type="text"
                  value={parseMultilingual(editedBusinessType.name)[activeLanguage] || ''}
                  onChange={(e) => updateMultilingualField('name', activeLanguage, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder={activeLanguage === 'en' ? 'Restaurant (Casual Dining)' : activeLanguage === 'es' ? 'Restaurante (Comida Casual)' : 'Restaurant (Restauration Décontractée)'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description ({localeMetadata[activeLanguage].label})
                </label>
                <textarea
                  value={parseMultilingual(editedBusinessType.description)[activeLanguage] || ''}
                  onChange={(e) => updateMultilingualField('description', activeLanguage, e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder={activeLanguage === 'en' ? 'Describe this business type...' : activeLanguage === 'es' ? 'Describe este tipo de negocio...' : 'Décrivez ce type d\'entreprise...'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={editedBusinessType.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {BUSINESS_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                <input
                  type="text"
                  value={editedBusinessType.subcategory || ''}
                  onChange={(e) => updateField('subcategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., casual_dining, convenience_store"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-green-800">Wizard Prefill Examples</h4>
                  <p className="text-sm text-green-700 mt-1">These examples are shown to users as hints when they fill out the wizard. They help users understand what kind of information to provide. Users can use, modify, or ignore these suggestions. Provide content in all three languages.</p>
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex space-x-2">
              {locales.map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    activeLanguage === lang
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {localeMetadata[lang].flag} {localeMetadata[lang].label}
                </button>
              ))}
            </div>

            {/* Example Business Purposes */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Example Business Purposes ({localeMetadata[activeLanguage].label})
              </h4>
              <p className="text-sm text-gray-600 mb-4">2-3 examples of business purposes users might have</p>
              
              {parseMultilingualArray(editedBusinessType.exampleBusinessPurposes).map((item, index) => (
                <div key={index} className="mb-3 flex items-start space-x-2">
                  <input
                    type="text"
                    value={item[activeLanguage] || ''}
                    onChange={(e) => updateMultilingualArray('exampleBusinessPurposes', index, activeLanguage, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder={activeLanguage === 'en' ? 'Provide quality Caribbean cuisine...' : activeLanguage === 'es' ? 'Proporcionar cocina caribeña de calidad...' : 'Fournir cuisine caribéenne de qualité...'}
                  />
                  <button
                    onClick={() => removeMultilingualArrayItem('exampleBusinessPurposes', index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => addMultilingualArrayItem('exampleBusinessPurposes')}
                className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                + Add Example
              </button>
            </div>

            {/* Example Products */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Example Products/Services ({localeMetadata[activeLanguage].label})
              </h4>
              <p className="text-sm text-gray-600 mb-4">2-3 examples of products or services</p>
              
              {parseMultilingualArray(editedBusinessType.exampleProducts).map((item, index) => (
                <div key={index} className="mb-3 flex items-start space-x-2">
                  <input
                    type="text"
                    value={item[activeLanguage] || ''}
                    onChange={(e) => updateMultilingualArray('exampleProducts', index, activeLanguage, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder={activeLanguage === 'en' ? 'Caribbean meals, jerk dishes, seafood...' : activeLanguage === 'es' ? 'Comidas caribeñas, platos jerk, mariscos...' : 'Repas caribéens, plats jerk, fruits de mer...'}
                  />
                  <button
                    onClick={() => removeMultilingualArrayItem('exampleProducts', index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => addMultilingualArrayItem('exampleProducts')}
                className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                + Add Example
              </button>
            </div>

            {/* Example Key Personnel */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Example Key Personnel ({localeMetadata[activeLanguage].label})
              </h4>
              <p className="text-sm text-gray-600 mb-4">3-5 typical roles</p>
              
              {parseMultilingualArray(editedBusinessType.exampleKeyPersonnel).map((item, index) => (
                <div key={index} className="mb-3 flex items-start space-x-2">
                  <input
                    type="text"
                    value={item[activeLanguage] || ''}
                    onChange={(e) => updateMultilingualArray('exampleKeyPersonnel', index, activeLanguage, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder={activeLanguage === 'en' ? 'Head Chef, Restaurant Manager...' : activeLanguage === 'es' ? 'Chef Principal, Gerente...' : 'Chef Principal, Gérant...'}
                  />
                  <button
                    onClick={() => removeMultilingualArrayItem('exampleKeyPersonnel', index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => addMultilingualArrayItem('exampleKeyPersonnel')}
                className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                + Add Example
              </button>
            </div>

            {/* Example Customer Base */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Example Customer Base ({localeMetadata[activeLanguage].label})
              </h4>
              <p className="text-sm text-gray-600 mb-4">2-3 examples of typical customer types</p>
              
              {parseMultilingualArray(editedBusinessType.exampleCustomerBase).map((item, index) => (
                <div key={index} className="mb-3 flex items-start space-x-2">
                  <input
                    type="text"
                    value={item[activeLanguage] || ''}
                    onChange={(e) => updateMultilingualArray('exampleCustomerBase', index, activeLanguage, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder={activeLanguage === 'en' ? 'Mix of tourists and locals...' : activeLanguage === 'es' ? 'Mezcla de turistas y locales...' : 'Mélange de touristes et locaux...'}
                  />
                  <button
                    onClick={() => removeMultilingualArrayItem('exampleCustomerBase', index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => addMultilingualArrayItem('exampleCustomerBase')}
                className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                + Add Example
              </button>
            </div>

            {/* Minimum Equipment */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Minimum Equipment ({localeMetadata[activeLanguage].label})
              </h4>
              <p className="text-sm text-gray-600 mb-4">4-6 essential equipment items</p>
              
              {parseMultilingualArray(editedBusinessType.minimumEquipment).map((item, index) => (
                <div key={index} className="mb-3 flex items-start space-x-2">
                  <input
                    type="text"
                    value={item[activeLanguage] || ''}
                    onChange={(e) => updateMultilingualArray('minimumEquipment', index, activeLanguage, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder={activeLanguage === 'en' ? 'Commercial kitchen equipment...' : activeLanguage === 'es' ? 'Equipo de cocina comercial...' : 'Équipement de cuisine commerciale...'}
                  />
                  <button
                    onClick={() => removeMultilingualArrayItem('minimumEquipment', index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => addMultilingualArrayItem('minimumEquipment')}
                className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                + Add Example
              </button>
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-yellow-800">Base Risk Vulnerabilities</h4>
                  <p className="text-sm text-yellow-700 mt-1">Set baseline vulnerability levels for this business TYPE. These are multiplied by user-specific factors (location, tourism dependency, etc.) to calculate final risk scores.</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900">Risk Vulnerability Profiles (1-10 scale)</h3>
            <p className="text-sm text-gray-600">Rate how vulnerable this business type is to each risk, and how severe the impact would be.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {riskTypes.map(riskType => {
                const vulnerability = editedBusinessType.BusinessRiskVulnerability?.find(r => r.riskType === riskType)
                const level = vulnerability?.vulnerabilityLevel || 5
                const impact = vulnerability?.impactSeverity || 5
                
                return (
                  <div key={riskType} className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-3 capitalize">
                      {riskType.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Vulnerability Level: {level}/10
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={level}
                          onChange={(e) => {
                            const newVulnerabilities = editedBusinessType.BusinessRiskVulnerability?.filter(r => r.riskType !== riskType) || []
                            newVulnerabilities.push({
                              riskType,
                              vulnerabilityLevel: parseInt(e.target.value),
                              impactSeverity: impact
                            })
                            updateField('riskVulnerabilities', newVulnerabilities)
                          }}
                          className="w-full slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Impact Severity: {impact}/10
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={impact}
                          onChange={(e) => {
                            const newVulnerabilities = editedBusinessType.BusinessRiskVulnerability?.filter(r => r.riskType !== riskType) || []
                            newVulnerabilities.push({
                              riskType,
                              vulnerabilityLevel: level,
                              impactSeverity: parseInt(e.target.value)
                            })
                            updateField('riskVulnerabilities', newVulnerabilities)
                          }}
                          className="w-full slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Minor</span>
                          <span>Severe</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

