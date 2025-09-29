'use client'

import React, { useState, useCallback } from 'react'
import { useAutoSave } from '../../hooks/useAutoSave'
import { AutoSaveIndicator } from './AutoSaveIndicator'
import { BusinessType } from '../../types/admin'
import { BUSINESS_CATEGORIES, CASH_FLOW_PATTERNS } from '../../constants/admin'
import { logger } from '../../utils/logger'

interface BusinessTypeEditorProps {
  businessType: BusinessType
  onUpdate: (businessType: BusinessType) => void
  onClose: () => void
}

export function BusinessTypeEditor({ businessType, onUpdate, onClose }: BusinessTypeEditorProps) {
  const [editedBusinessType, setEditedBusinessType] = useState<BusinessType>(businessType)
  const [activeTab, setActiveTab] = useState<'basic' | 'characteristics'>('basic')

  const riskTypes = ['hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage']

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
            <h2 className="text-2xl font-bold text-gray-900">Edit Business Type: {editedBusinessType.name}</h2>
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
              { key: 'characteristics', label: 'Risk & Business Characteristics', icon: '📊' }
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
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type Name</label>
                <input
                  type="text"
                  value={editedBusinessType.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typical Revenue</label>
                <input
                  type="text"
                  value={editedBusinessType.typicalRevenue || ''}
                  onChange={(e) => updateField('typicalRevenue', e.target.value)}
                  placeholder="e.g., JMD $500K - $2M annually"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editedBusinessType.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Describe the business type..."
              />
            </div>
          </div>
        )}

        {activeTab === 'characteristics' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Business Profile Configuration</h3>
              <p className="text-gray-600 mb-4">Configure the default risk profile and characteristics for this business type. SME users will see these as starting defaults in their wizard and can adjust them for their specific situation.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-blue-800">Setting Default Profiles</h4>
                    <p className="text-sm text-blue-700 mt-1">These settings create the baseline risk profile that appears when SME users select this business type. Users can then customize these defaults based on their specific business situation.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Core Business Characteristics */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Core Business Characteristics (1-10 scale)</h4>
              <p className="text-sm text-gray-600 mb-6">Rate each characteristic based on typical businesses of this type. Use these specific guidelines:</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  { 
                    key: 'touristDependency', 
                    label: 'Tourist Dependency', 
                    question: 'What % of annual revenue comes from tourists?',
                    scale: {
                      low: '0-20% (1-3): Locals only, minimal tourist impact',
                      medium: '40-60% (4-7): Mixed clientele, moderate tourist seasons', 
                      high: '80-100% (8-10): Almost entirely tourist-dependent'
                    }
                  },
                  { 
                    key: 'supplyChainComplexity', 
                    label: 'Supply Chain Complexity', 
                    question: 'How many critical suppliers and steps to get products?',
                    scale: {
                      low: '1-2 suppliers (1-3): Local/simple sourcing',
                      medium: '3-5 suppliers (4-7): Regional sourcing, some imports',
                      high: '6+ suppliers (8-10): International, complex logistics'
                    }
                  },
                  { 
                    key: 'digitalDependency', 
                    label: 'Digital Dependency', 
                    question: 'How much does business depend on digital systems?',
                    scale: {
                      low: 'Basic/Optional (1-3): Cash-only, manual processes',
                      medium: 'Important (4-7): POS systems, some online presence',
                      high: 'Critical (8-10): Online bookings, digital payments essential'
                    }
                  },
                  { 
                    key: 'physicalAssetIntensity', 
                    label: 'Physical Asset Value', 
                    question: 'How much physical equipment/property is critical?',
                    scale: {
                      low: 'Low value (1-3): Minimal equipment, mostly service-based',
                      medium: 'Moderate (4-7): Some machinery, fixtures, inventory',
                      high: 'High value (8-10): Expensive equipment, large inventory'
                    }
                  },
                  { 
                    key: 'customerConcentration', 
                    label: 'Customer Concentration', 
                    question: 'How concentrated is the customer base?',
                    scale: {
                      low: 'Diverse (1-3): Many small customers, no major clients',
                      medium: 'Mixed (4-7): Some key customers, but diversified',
                      high: 'Concentrated (8-10): Few major customers drive most revenue'
                    }
                  },
                  { 
                    key: 'regulatoryBurden', 
                    label: 'Regulatory Requirements', 
                    question: 'How many licenses, permits, and regulations apply?',
                    scale: {
                      low: 'Minimal (1-3): Basic business license only',
                      medium: 'Moderate (4-7): Some sector-specific requirements',
                      high: 'Heavy (8-10): Multiple agencies, strict compliance'
                    }
                  }
                ].map(char => {
                  const currentValue = editedBusinessType[char.key as keyof BusinessType] as number
                  return (
                    <div key={char.key} className="bg-white p-4 rounded-lg border">
                      <label className="block text-sm font-medium text-gray-900 mb-2">{char.label}</label>
                      <p className="text-sm text-gray-700 mb-3 font-medium">{char.question}</p>
                      
                      <div className="mb-4">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={currentValue}
                          onChange={(e) => updateField(char.key as keyof BusinessType, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">1</span>
                          <span className="text-2xl font-bold text-purple-600">{currentValue}</span>
                          <span className="text-xs text-gray-500">10</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className={`p-2 rounded ${currentValue <= 3 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <span className="font-medium">Low:</span> {char.scale.low}
                        </div>
                        <div className={`p-2 rounded ${currentValue >= 4 && currentValue <= 7 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                          <span className="font-medium">Medium:</span> {char.scale.medium}
                        </div>
                        <div className={`p-2 rounded ${currentValue >= 8 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                          <span className="font-medium">High:</span> {char.scale.high}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Location Risk Factors */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Default Risk Exposure by Environmental Hazard</h4>
              <p className="text-sm text-gray-600 mb-4">Set how vulnerable this business type typically is to each environmental risk. SME users will see these as defaults and can adjust based on their specific situation.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {riskTypes.map(riskType => {
                  const riskLabels = {
                    hurricane: { 
                      name: 'Hurricane', 
                      icon: '🌀', 
                      vulnQuestion: 'How vulnerable is this business type to hurricane damage?',
                      vulnScale: {
                        low: 'Minimal impact (1-3): Indoor service business, minimal inventory',
                        medium: 'Moderate impact (4-7): Some outdoor elements, replaceable assets', 
                        high: 'Severe impact (8-10): Outdoor operations, expensive equipment'
                      },
                      recoveryQuestion: 'How long would it typically take to recover and reopen?',
                      recoveryScale: {
                        low: 'Fast (1-3): 1-3 days, minimal repairs needed',
                        medium: 'Moderate (4-7): 1-2 weeks, some repairs and restocking',
                        high: 'Slow (8-10): Months, major rebuilding required'
                      }
                    },
                    flood: { 
                      name: 'Flooding', 
                      icon: '🌊', 
                      vulnQuestion: 'How vulnerable is this business to flood damage?',
                      vulnScale: {
                        low: 'Minimal (1-3): Upper floors, waterproof operations',
                        medium: 'Moderate (4-7): Ground level, some water-sensitive assets',
                        high: 'Severe (8-10): Below grade, extensive inventory/equipment'
                      },
                      recoveryQuestion: 'How long to clean up and resume operations?',
                      recoveryScale: {
                        low: 'Fast (1-3): 2-5 days, minimal water damage',
                        medium: 'Moderate (4-7): 1-3 weeks, cleaning and restocking',
                        high: 'Slow (8-10): Months, extensive repairs and replacement'
                      }
                    },
                    earthquake: { 
                      name: 'Earthquake', 
                      icon: '🏔️', 
                      vulnQuestion: 'How vulnerable to earthquake structural damage?',
                      vulnScale: {
                        low: 'Minimal (1-3): Modern building, lightweight operations',
                        medium: 'Moderate (4-7): Some fragile equipment or older building',
                        high: 'Severe (8-10): Heavy machinery, fragile inventory, old structure'
                      },
                      recoveryQuestion: 'How long for structural repairs and reopening?',
                      recoveryScale: {
                        low: 'Fast (1-3): Days, minor repairs',
                        medium: 'Moderate (4-7): Weeks, structural inspection and fixes',
                        high: 'Slow (8-10): Months, major reconstruction'
                      }
                    },
                    drought: { 
                      name: 'Drought', 
                      icon: '🌵', 
                      vulnQuestion: 'How dependent is this business on water supply?',
                      vulnScale: {
                        low: 'Minimal (1-3): Low water use, not water-dependent',
                        medium: 'Moderate (4-7): Moderate water needs, some restrictions manageable',
                        high: 'Severe (8-10): High water consumption, water-critical operations'
                      },
                      recoveryQuestion: 'How long to adapt operations during water restrictions?',
                      recoveryScale: {
                        low: 'Fast (1-3): Days, minimal operational changes',
                        medium: 'Moderate (4-7): Weeks, some process modifications',
                        high: 'Slow (8-10): Months, major operational overhaul'
                      }
                    },
                    landslide: { 
                      name: 'Landslide', 
                      icon: '⛰️', 
                      vulnQuestion: 'How vulnerable to landslide damage and access loss?',
                      vulnScale: {
                        low: 'Minimal (1-3): Flat area, multiple access routes',
                        medium: 'Moderate (4-7): Some slope risk, alternative access available',
                        high: 'Severe (8-10): Steep terrain, single access road'
                      },
                      recoveryQuestion: 'How long to restore access and operations?',
                      recoveryScale: {
                        low: 'Fast (1-3): Days, alternative routes available',
                        medium: 'Moderate (4-7): Weeks, road clearing needed',
                        high: 'Slow (8-10): Months, major infrastructure rebuilding'
                      }
                    },
                    powerOutage: { 
                      name: 'Power Outage', 
                      icon: '⚡', 
                      vulnQuestion: 'How dependent is this business on electricity?',
                      vulnScale: {
                        low: 'Minimal (1-3): Manual operations, battery backup sufficient',
                        medium: 'Moderate (4-7): Some electronic systems, short outages manageable',
                        high: 'Severe (8-10): Fully electronic, refrigeration, manufacturing'
                      },
                      recoveryQuestion: 'How long to resume operations after power restored?',
                      recoveryScale: {
                        low: 'Fast (1-3): Immediate, flip switches and resume',
                        medium: 'Moderate (4-7): Hours/days, restart systems and processes',
                        high: 'Slow (8-10): Days/weeks, replace spoiled inventory, reset equipment'
                      }
                    }
                  }
                  const riskInfo = riskLabels[riskType as keyof typeof riskLabels]
                  
                  return (
                    <div key={riskType} className="bg-white p-5 rounded-lg border shadow-sm">
                      <div className="flex items-center mb-4">
                        <span className="text-xl mr-2">{riskInfo.icon}</span>
                        <h5 className="font-medium text-gray-900">{riskInfo.name}</h5>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Vulnerability Assessment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Business Vulnerability Level</label>
                          <p className="text-sm text-gray-700 mb-3 font-medium">{riskInfo.vulnQuestion}</p>
                          
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={editedBusinessType[`${riskType}Vulnerability` as keyof BusinessType] as number || 5}
                            onChange={(e) => updateField(`${riskType}Vulnerability` as keyof BusinessType, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mb-3"
                          />
                          
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-gray-500">1</span>
                            <span className="text-xl font-bold text-purple-600">{editedBusinessType[`${riskType}Vulnerability` as keyof BusinessType] as number || 5}</span>
                            <span className="text-xs text-gray-500">10</span>
                          </div>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className={`p-2 rounded text-xs ${(editedBusinessType[`${riskType}Vulnerability` as keyof BusinessType] as number || 5) <= 3 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                              {riskInfo.vulnScale.low}
                            </div>
                            <div className={`p-2 rounded text-xs ${(editedBusinessType[`${riskType}Vulnerability` as keyof BusinessType] as number || 5) >= 4 && (editedBusinessType[`${riskType}Vulnerability` as keyof BusinessType] as number || 5) <= 7 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                              {riskInfo.vulnScale.medium}
                            </div>
                            <div className={`p-2 rounded text-xs ${(editedBusinessType[`${riskType}Vulnerability` as keyof BusinessType] as number || 5) >= 8 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                              {riskInfo.vulnScale.high}
                            </div>
                          </div>
                        </div>
                        
                        {/* Recovery Time Assessment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Recovery Time Expected</label>
                          <p className="text-sm text-gray-700 mb-3 font-medium">{riskInfo.recoveryQuestion}</p>
                          
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={editedBusinessType[`${riskType}RecoveryImpact` as keyof BusinessType] as number || 5}
                            onChange={(e) => updateField(`${riskType}RecoveryImpact` as keyof BusinessType, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mb-3"
                          />
                          
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-gray-500">1</span>
                            <span className="text-xl font-bold text-purple-600">{editedBusinessType[`${riskType}RecoveryImpact` as keyof BusinessType] as number || 5}</span>
                            <span className="text-xs text-gray-500">10</span>
                          </div>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className={`p-2 rounded text-xs ${(editedBusinessType[`${riskType}RecoveryImpact` as keyof BusinessType] as number || 5) <= 3 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                              {riskInfo.recoveryScale.low}
                            </div>
                            <div className={`p-2 rounded text-xs ${(editedBusinessType[`${riskType}RecoveryImpact` as keyof BusinessType] as number || 5) >= 4 && (editedBusinessType[`${riskType}RecoveryImpact` as keyof BusinessType] as number || 5) <= 7 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                              {riskInfo.recoveryScale.medium}
                            </div>
                            <div className={`p-2 rounded text-xs ${(editedBusinessType[`${riskType}RecoveryImpact` as keyof BusinessType] as number || 5) >= 8 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                              {riskInfo.recoveryScale.high}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Business Continuity Essentials */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Business Continuity Essentials</h4>
              <p className="text-sm text-gray-600 mb-4">Key information needed for effective risk mitigation strategies.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Typical Employees</label>
                  <input
                    type="text"
                    value={editedBusinessType.typicalEmployees || ''}
                    onChange={(e) => updateField('typicalEmployees', e.target.value)}
                    placeholder="e.g., 5-15 employees"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours</label>
                  <input
                    type="text"
                    value={editedBusinessType.operatingHours || ''}
                    onChange={(e) => updateField('operatingHours', e.target.value)}
                    placeholder="e.g., 9 AM - 6 PM Mon-Fri"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cash Flow Pattern</label>
                  <select
                    value={editedBusinessType.cashFlowPattern || 'steady'}
                    onChange={(e) => updateField('cashFlowPattern', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {CASH_FLOW_PATTERNS.map(pattern => (
                      <option key={pattern} value={pattern}>
                        {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seasonality Factor (1-10)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={editedBusinessType.seasonalityFactor}
                      onChange={(e) => updateField('seasonalityFactor', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold text-purple-600 w-8">
                      {editedBusinessType.seasonalityFactor}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">1 = Not seasonal, 10 = Highly seasonal</p>
                </div>
              </div>
            </div>

          </div>
        )}


      </div>
      </div>
    </>
  )
}
