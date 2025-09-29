'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AutoSaveIndicator } from './AutoSaveIndicator'
import { useAutoSave } from '../../hooks/useAutoSave'

interface RiskData {
  level: number
  notes: string
}

interface Parish {
  id: string
  name: string
  region: string
  isCoastal: boolean
  isUrban: boolean
  population: number
  riskProfile: {
    [key: string]: RiskData | string // Allow dynamic risk types plus lastUpdated, updatedBy
    hurricane: RiskData
    flood: RiskData
    earthquake: RiskData
    drought: RiskData
    landslide: RiskData
    powerOutage: RiskData
    lastUpdated: string
    updatedBy: string
  }
}

interface ParishEditorProps {
  parish: Parish
  onUpdate: (parish: Parish) => void
  onClose: () => void
}

export function ParishEditor({ parish, onUpdate, onClose }: ParishEditorProps) {
  const [editedParish, setEditedParish] = useState<Parish>({ ...parish })
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'history'>('overview')
  const [changeHistory, setChangeHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [expandedRiskNotes, setExpandedRiskNotes] = useState<string | null>(null)
  const [notesBeingEdited, setNotesBeingEdited] = useState<{[key: string]: string}>({})
  const [isSavingNotes, setIsSavingNotes] = useState<{[key: string]: boolean}>({})

  // Auto-save function using centralized data service
  const saveParish = useCallback(async (data: Parish) => {
    console.log('🏝️ ParishEditor auto-saving parish via centralDataService:', data.name, 'Risk levels:', data.riskProfile)
    
    try {
      // Use centralized data service directly for auto-save
      const { centralDataService } = await import('../../services/centralDataService')
      const savedParish = await centralDataService.saveParish(data)
      
      // Only update local state if the saved data is newer than current state
      // This prevents overriding user changes made during save
      setEditedParish(prevState => {
        const savedTime = new Date(savedParish.riskProfile.lastUpdated).getTime()
        const currentTime = new Date(prevState.riskProfile.lastUpdated).getTime()
        
        if (savedTime >= currentTime) {
          console.log('🏝️ ParishEditor: UI synchronized with saved data')
          return savedParish
        } else {
          console.log('🏝️ ParishEditor: Keeping current state (newer than saved)')
          return prevState
        }
      })
      
      // Notify parent of the update
      onUpdate(savedParish)
      
      console.log('🏝️ ParishEditor auto-save completed successfully')
    } catch (error) {
      console.error('🏝️ ParishEditor auto-save failed:', error)
      throw error
    }
  }, [onUpdate])

  // Use the auto-save hook
  const { autoSaveStatus, forceSave } = useAutoSave({
    data: editedParish,
    saveFunction: saveParish,
    delay: 1500 // Reasonable delay for parish changes
  })

  // Load change history when history tab is opened
  const loadChangeHistory = async () => {
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/admin2/parishes/${parish.id}/history`)
      if (response.ok) {
        const history = await response.json()
        setChangeHistory(history)
      }
    } catch (error) {
      console.error('Failed to load change history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  // Load history when history tab is activated
  useEffect(() => {
    if (activeTab === 'history') {
      loadChangeHistory()
    }
  }, [activeTab])

  const allAvailableRisks = [
    { 
      key: 'hurricane', 
      name: 'Hurricane/Tropical Storm', 
      icon: '🌀',
      description: 'Tropical cyclones with strong winds and heavy rainfall'
    },
    { 
      key: 'flood', 
      name: 'Flooding', 
      icon: '🌊',
      description: 'Water overflow from rivers, rainfall, or storm surge'
    },
    { 
      key: 'earthquake', 
      name: 'Earthquake', 
      icon: '🏔️',
      description: 'Seismic activity and ground shaking'
    },
    { 
      key: 'drought', 
      name: 'Drought', 
      icon: '🌵',
      description: 'Extended periods of water scarcity'
    },
    { 
      key: 'landslide', 
      name: 'Landslide/Rockfall', 
      icon: '⛰️',
      description: 'Slope failure and mass movement'
    },
    { 
      key: 'powerOutage', 
      name: 'Power Outage', 
      icon: '⚡',
      description: 'Electrical grid failures and disruptions'
    },
    { 
      key: 'cyberAttack', 
      name: 'Cyber Attack', 
      icon: '💻',
      description: 'Digital security threats and data breaches'
    },
    { 
      key: 'terrorism', 
      name: 'Terrorism/Security Threat', 
      icon: '🔒',
      description: 'Security threats and terrorist activities'
    },
    { 
      key: 'pandemicDisease', 
      name: 'Pandemic/Disease Outbreak', 
      icon: '🦠',
      description: 'Public health emergencies and disease outbreaks'
    },
    { 
      key: 'economicDownturn', 
      name: 'Economic Downturn', 
      icon: '📉',
      description: 'Economic recession or financial market collapse'
    },
    { 
      key: 'supplyChainDisruption', 
      name: 'Supply Chain Disruption', 
      icon: '🚛',
      description: 'Interruption of goods and services supply'
    },
    { 
      key: 'civilUnrest', 
      name: 'Civil Unrest', 
      icon: '⚡',
      description: 'Social disorder and public disturbances'
    }
  ]

  // Helper function to get parish-specific risk guidance
  const getParishRiskGuidance = (riskType: string, parish: Parish): string => {
    const guidance = {
      hurricane: `How often and severely does ${parish.name} experience hurricanes? Consider historical data, storm paths, and local topography.`,
      flood: `What is ${parish.name}'s flood risk based on rainfall patterns, drainage, and terrain? ${parish.isCoastal ? 'Consider coastal flooding from storm surges.' : 'Focus on river/flash flooding.'}`,
      earthquake: `How seismically active is the ${parish.name} area? Consider proximity to fault lines and historical earthquake activity.`,
      drought: `How frequently does ${parish.name} experience water shortages? Consider rainfall patterns, water infrastructure, and climate trends.`,
      landslide: `What is the landslide risk in ${parish.name}? Consider terrain steepness, soil composition, and rainfall patterns.`,
      powerOutage: `How reliable is the electrical grid in ${parish.name}? Consider infrastructure age, maintenance, and weather vulnerabilities.`
    }
    return guidance[riskType as keyof typeof guidance] || `Assess the ${riskType} risk level for ${parish.name}.`
  }

  // Helper function to get level-specific guidance
  const getParishRiskLevelGuidance = (riskType: string, level: string, parish: Parish): string => {
    const guidance = {
      hurricane: {
        low: 'Rare or minor hurricanes. Historical data shows minimal direct hits or weak storms.',
        medium: 'Occasional hurricanes with moderate impact. Some historical storms caused damage.',
        high: 'Frequent or severe hurricanes. Major storms regularly affect this area with significant damage.'
      },
      flood: {
        low: 'Minimal flood risk. Good drainage, elevated areas, rare flooding events.',
        medium: 'Moderate flood risk. Some low-lying areas flood during heavy rains or storms.',
        high: 'High flood risk. Regular flooding during rainy season, poor drainage, low elevation.'
      },
      earthquake: {
        low: 'Low seismic activity. No major fault lines nearby, rare earthquake events.',
        medium: 'Moderate seismic risk. Some fault activity, occasional minor earthquakes.',
        high: 'High seismic risk. Active fault lines, history of significant earthquakes.'
      },
      drought: {
        low: 'Reliable water supply. Good rainfall, strong infrastructure, rare shortages.',
        medium: 'Occasional water stress. Seasonal dry periods, some infrastructure limitations.',
        high: 'Frequent droughts. Poor rainfall patterns, inadequate water infrastructure.'
      },
      landslide: {
        low: 'Stable terrain. Flat or gently sloping areas, stable soil, rare landslides.',
        medium: 'Moderate risk. Some steep areas, occasional landslides during heavy rains.',
        high: 'High landslide risk. Steep terrain, unstable soil, frequent landslide events.'
      },
      powerOutage: {
        low: 'Reliable power grid. Modern infrastructure, rare outages, quick restoration.',
        medium: 'Moderate reliability. Some infrastructure issues, occasional outages.',
        high: 'Unreliable power. Aging infrastructure, frequent outages, slow restoration.'
      }
    }
    
    const riskGuidance = guidance[riskType as keyof typeof guidance]
    if (riskGuidance) {
      return riskGuidance[level as keyof typeof riskGuidance] || 'Assess based on local conditions.'
    }
    return 'Assess based on local conditions and historical data.'
  }

  // Check if a risk is currently selected for this parish
  const isRiskSelected = (riskKey: string): boolean => {
    const riskData = editedParish.riskProfile[riskKey]
    return !!(riskData && typeof riskData === 'object' && 'level' in riskData)
  }

  // Toggle risk selection with auto-save
  const toggleRiskSelection = async (riskKey: string) => {
    const wasSelected = isRiskSelected(riskKey)
    
    let updatedParish: Parish
    
    if (wasSelected) {
      // Remove the risk
      const newRiskProfile = { ...editedParish.riskProfile }
      delete newRiskProfile[riskKey]
      updatedParish = {
        ...editedParish,
        riskProfile: {
          ...newRiskProfile,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin User'
        }
      }
    } else {
      // Add the risk with default values
      updatedParish = {
        ...editedParish,
        riskProfile: {
          ...editedParish.riskProfile,
          [riskKey]: {
            level: 0,
            notes: ''
          },
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin User'
        }
      }
    }
    
    // Update state and trigger auto-save
    setEditedParish(updatedParish)
    console.log(`🏝️ Parish risk ${wasSelected ? 'removed' : 'added'}:`, riskKey, 'for', updatedParish.name)
  }

  // Handle risk level changes with auto-save
  const handleRiskLevelChange = async (riskType: string, level: number) => {
    const updatedParish = {
      ...editedParish,
      riskProfile: {
        ...editedParish.riskProfile,
        [riskType]: {
          ...(editedParish.riskProfile[riskType] as RiskData),
          level
        },
        lastUpdated: new Date().toISOString(),
        updatedBy: 'Admin User'
      }
    }
    setEditedParish(updatedParish)
    // Auto-save the change
    await onUpdate(updatedParish)
  }

  // Start editing notes
  const startEditingNotes = (riskKey: string) => {
    const currentNotes = (editedParish.riskProfile[riskKey] as RiskData)?.notes || ''
    setNotesBeingEdited(prev => ({ ...prev, [riskKey]: currentNotes }))
    setExpandedRiskNotes(riskKey)
  }

  // Save notes
  const saveNotes = async (riskKey: string) => {
    setIsSavingNotes(prev => ({ ...prev, [riskKey]: true }))
    
    const updatedParish = {
      ...editedParish,
      riskProfile: {
        ...editedParish.riskProfile,
        [riskKey]: {
          ...(editedParish.riskProfile[riskKey] as RiskData),
          notes: notesBeingEdited[riskKey] || ''
        },
        lastUpdated: new Date().toISOString(),
        updatedBy: 'Admin User'
      }
    }
    
    try {
      setEditedParish(updatedParish)
      await onUpdate(updatedParish)
      
      // Clear editing state
      setNotesBeingEdited(prev => {
        const newState = { ...prev }
        delete newState[riskKey]
        return newState
      })
      setExpandedRiskNotes(null)
    } catch (error) {
      console.error('Failed to save notes:', error)
    } finally {
      setIsSavingNotes(prev => ({ ...prev, [riskKey]: false }))
    }
  }

  // Discard notes changes
  const discardNotes = (riskKey: string) => {
    setNotesBeingEdited(prev => {
      const newState = { ...prev }
      delete newState[riskKey]
      return newState
    })
    setExpandedRiskNotes(null)
  }

  const handleRiskChange = (riskType: string, field: 'level' | 'notes', value: number | string) => {
    setEditedParish(prev => ({
      ...prev,
      riskProfile: {
        ...prev.riskProfile,
        [riskType]: {
          ...(prev.riskProfile[riskType as keyof typeof prev.riskProfile] || {} as any),
          [field]: value
        }
      }
    }))
  }


  const getRiskColor = (level: number) => {
    if (level >= 8) return 'text-red-600 bg-red-50 border-red-200'
    if (level >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (level >= 4) return 'text-blue-600 bg-blue-50 border-blue-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getRiskLabel = (level: number) => {
    if (level >= 8) return 'High Risk'
    if (level >= 6) return 'Medium Risk'
    if (level >= 4) return 'Low-Medium Risk'
    return 'Low Risk'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <span>📍</span>
              <span>{editedParish.name} Parish</span>
            </h2>
            <p className="text-gray-600 mt-1">
              {editedParish.region} • Population: {editedParish.population.toLocaleString()}
            </p>
            <div className="mt-2">
              <AutoSaveIndicator autoSaveStatus={autoSaveStatus} className="text-sm" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
        
        {/* Parish Characteristics */}
        <div className="flex items-center space-x-4 mt-3">
          {editedParish.isCoastal && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              🌊 Coastal Parish
            </span>
          )}
          {editedParish.isUrban && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              🏙️ Urban Center
            </span>
          )}
          <span className="text-xs text-gray-500">
            Last updated: {new Date(editedParish.riskProfile.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'risks', label: 'Risk Assessment', icon: '⚠️' },
            { key: 'history', label: 'Change History', icon: '📝' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Risk Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allAvailableRisks.filter(r => isRiskSelected(r.key)).map(risk => {
                const riskData = editedParish.riskProfile[risk.key as keyof typeof editedParish.riskProfile] as { level: number; notes: string }
                return (
                  <div
                    key={risk.key}
                    className={`p-4 rounded-lg border-2 ${getRiskColor(riskData.level)}`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">{risk.icon}</span>
                      <span className="font-medium">{risk.name}</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {riskData.level}/10
                    </div>
                    <div className="text-sm">
                      {getRiskLabel(riskData.level)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Parish Characteristics</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Region: {editedParish.region}</div>
                  <div>Population: {editedParish.population.toLocaleString()}</div>
                  <div>Type: {editedParish.isUrban ? 'Urban' : 'Rural'}</div>
                  <div>Location: {editedParish.isCoastal ? 'Coastal' : 'Inland'}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Risk Summary</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Highest Risk: {Math.max(...allAvailableRisks.filter(r => isRiskSelected(r.key)).map(r => (editedParish.riskProfile[r.key] as RiskData)?.level || 0), 0)}/10</div>
                  <div>Selected Risks: {allAvailableRisks.filter(r => isRiskSelected(r.key)).length}/{allAvailableRisks.length}</div>
                  <div>Updated By: {editedParish.riskProfile.updatedBy}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
                <p className="text-gray-600 text-sm mt-1">Select risks and set levels - changes are saved automatically</p>
              </div>
              <div className="text-sm text-gray-500">
                {allAvailableRisks.filter(r => isRiskSelected(r.key)).length} of {allAvailableRisks.length} risks selected
              </div>
            </div>

            {/* Unified Risk Selection & Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAvailableRisks.map(risk => {
                const isSelected = isRiskSelected(risk.key)
                const riskData = isSelected ? editedParish.riskProfile[risk.key] as RiskData : null
                const isEditingNotes = notesBeingEdited[risk.key] !== undefined
                const isNotesExpanded = expandedRiskNotes === risk.key
                
                return (
                  <div 
                    key={risk.key} 
                    className={`border-2 rounded-lg transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {/* Main Risk Card */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => !isEditingNotes && toggleRiskSelection(risk.key)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{risk.icon}</span>
                          <div>
                            <h4 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                              {risk.name}
                            </h4>
                            <p className={`text-xs mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                              {risk.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {isSelected && riskData && (
                            <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(riskData.level)}`}>
                              {riskData.level}/10
                            </div>
                          )}
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <span className="text-white text-xs">✓</span>}
                          </div>
                        </div>
                      </div>
                      
                      {/* Risk Level Slider */}
                      {isSelected && !isEditingNotes && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-blue-800 mb-2">
                              {risk.name} Risk Level for {editedParish.name}
                            </label>
                            <p className="text-xs text-blue-700 mb-3 font-medium">
                              {getParishRiskGuidance(risk.key, editedParish)}
                            </p>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={riskData?.level || 0}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleRiskLevelChange(risk.key, parseInt(e.target.value))
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-blue-600">0</span>
                              <span className="text-xl font-bold text-blue-800">{riskData?.level || 0}</span>
                              <span className="text-xs text-blue-600">10</span>
                            </div>
                            
                            {/* Risk Level Guidance */}
                            <div className="mt-3 text-xs text-blue-700 space-y-1">
                              <div className={`p-2 rounded ${(riskData?.level || 0) <= 3 ? 'bg-green-50 border border-green-200' : 'bg-blue-50'}`}>
                                <span className="font-medium">Low (0-3):</span> {getParishRiskLevelGuidance(risk.key, 'low', editedParish)}
                              </div>
                              <div className={`p-2 rounded ${(riskData?.level || 0) >= 4 && (riskData?.level || 0) <= 7 ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50'}`}>
                                <span className="font-medium">Medium (4-7):</span> {getParishRiskLevelGuidance(risk.key, 'medium', editedParish)}
                              </div>
                              <div className={`p-2 rounded ${(riskData?.level || 0) >= 8 ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`}>
                                <span className="font-medium">High (8-10):</span> {getParishRiskLevelGuidance(risk.key, 'high', editedParish)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Notes Preview & Edit Button */}
                          <div className="mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditingNotes(risk.key)
                              }}
                              className="flex items-center justify-between w-full text-left p-2 bg-white rounded border border-blue-200 hover:border-blue-300 transition-colors"
                            >
                              <div className="flex-1">
                                <span className="text-xs font-medium text-blue-800">Notes & Justification</span>
                                <p className="text-xs text-blue-600 mt-1 truncate">
                                  {riskData?.notes || 'Click to add notes...'}
                                </p>
                              </div>
                              <span className="text-blue-500 ml-2">✏️</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded Notes Editor */}
                    {isSelected && isNotesExpanded && (
                      <div className="border-t border-blue-200 p-4 bg-blue-25">
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          Notes & Justification for {risk.name}
                        </label>
                        <textarea
                          value={notesBeingEdited[risk.key] || ''}
                          onChange={(e) => setNotesBeingEdited(prev => ({ ...prev, [risk.key]: e.target.value }))}
                          placeholder={`Add detailed notes about ${risk.name.toLowerCase()} risk assessment for ${editedParish.name}...`}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          rows={4}
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2 mt-3">
                          <button
                            onClick={() => discardNotes(risk.key)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Discard
                          </button>
                          <button
                            onClick={() => saveNotes(risk.key)}
                            disabled={isSavingNotes[risk.key]}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isSavingNotes[risk.key] ? 'Saving...' : 'Save Notes'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Quick Summary */}
            {allAvailableRisks.filter(r => isRiskSelected(r.key)).length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Assessment Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Selected Risks:</span>
                    <div className="font-semibold text-blue-900">{allAvailableRisks.filter(r => isRiskSelected(r.key)).length}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Highest Risk:</span>
                    <div className="font-semibold text-blue-900">
                      {Math.max(...allAvailableRisks.filter(r => isRiskSelected(r.key)).map(r => (editedParish.riskProfile[r.key] as RiskData)?.level || 0), 0)}/10
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Average Risk:</span>
                    <div className="font-semibold text-blue-900">
                      {allAvailableRisks.filter(r => isRiskSelected(r.key)).length > 0 
                        ? Math.round(allAvailableRisks.filter(r => isRiskSelected(r.key)).reduce((sum, r) => sum + ((editedParish.riskProfile[r.key] as RiskData)?.level || 0), 0) / allAvailableRisks.filter(r => isRiskSelected(r.key)).length * 10) / 10
                        : 0}/10
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Last Updated:</span>
                    <div className="font-semibold text-blue-900 text-xs">
                      {new Date(editedParish.riskProfile.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Change History</h3>
              <button
                onClick={loadChangeHistory}
                disabled={loadingHistory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loadingHistory ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading change history...</p>
              </div>
            ) : changeHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-4 block">📝</span>
                <h3 className="text-lg font-medium mb-2">No Changes Yet</h3>
                <p>No risk level changes have been recorded for this parish</p>
              </div>
            ) : (
              <div className="space-y-4">
                {changeHistory.map((change, index) => (
                  <div key={change.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {change.summary}
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {change.oldNotes !== change.newNotes && (
                            <>
                              {change.oldNotes && (
                                <p><span className="font-medium">Previous notes:</span> {change.oldNotes}</p>
                              )}
                              {change.newNotes && (
                                <p><span className="font-medium">New notes:</span> {change.newNotes}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-right ml-4">
                        <div>{new Date(change.changedAt).toLocaleDateString()}</div>
                        <div>{new Date(change.changedAt).toLocaleTimeString()}</div>
                        <div className="font-medium">{change.changedBy}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-500">Risk Type:</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                          {change.riskType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-500">Level Change:</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          {change.oldLevel}
                        </span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {change.newLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
