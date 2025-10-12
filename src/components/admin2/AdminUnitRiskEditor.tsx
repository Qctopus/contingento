'use client'

import React, { useState, useCallback } from 'react'
import { AdminUnit, RISK_TYPES, RiskData } from '../../types/admin'
import { useAutoSave } from '../../hooks/useAutoSave'
import { AutoSaveIndicator } from './AutoSaveIndicator'

interface AdminUnitWithRisk extends AdminUnit {
  adminUnitRisk?: {
    id: string
    hurricaneLevel: number
    hurricaneNotes: string
    floodLevel: number
    floodNotes: string
    earthquakeLevel: number
    earthquakeNotes: string
    droughtLevel: number
    droughtNotes: string
    landslideLevel: number
    landslideNotes: string
    powerOutageLevel: number
    powerOutageNotes: string
    riskProfileJson: string
    lastUpdated: string
    updatedBy: string
  }
}

interface AdminUnitRiskEditorProps {
  unit: AdminUnitWithRisk
  onUpdate: (updatedUnit: AdminUnitWithRisk) => Promise<void>
  onClose: () => void
}

export function AdminUnitRiskEditor({ unit, onUpdate, onClose }: AdminUnitRiskEditorProps) {
  const [editedUnit, setEditedUnit] = useState<AdminUnitWithRisk>({ ...unit })
  const [activeTab, setActiveTab] = useState<'overview' | 'risks'>('risks')
  const [expandedRiskNotes, setExpandedRiskNotes] = useState<string | null>(null)
  const [notesBeingEdited, setNotesBeingEdited] = useState<{[key: string]: string}>({})
  const [isSavingNotes, setIsSavingNotes] = useState<{[key: string]: boolean}>({})

  // Auto-save function
  const saveUnit = useCallback(async (data: AdminUnitWithRisk) => {
    console.log('🏝️ AdminUnitRiskEditor auto-saving unit:', data.name)
    
    try {
      await onUpdate(data)
      console.log('🏝️ AdminUnitRiskEditor auto-save completed successfully')
    } catch (error) {
      console.error('🏝️ AdminUnitRiskEditor auto-save failed:', error)
      throw error
    }
  }, [onUpdate])

  // Use the auto-save hook
  const { autoSaveStatus, forceSave } = useAutoSave({
    data: editedUnit,
    saveFunction: saveUnit,
    delay: 1500
  })

  const allAvailableRisks = RISK_TYPES.map(risk => ({
    ...risk,
    color: risk.key === 'hurricane' ? 'bg-red-500' :
           risk.key === 'flood' ? 'bg-blue-500' :
           risk.key === 'earthquake' ? 'bg-yellow-600' :
           risk.key === 'drought' ? 'bg-orange-500' :
           risk.key === 'landslide' ? 'bg-gray-600' :
           risk.key === 'powerOutage' ? 'bg-purple-500' :
           risk.key === 'cyberAttack' ? 'bg-indigo-500' :
           risk.key === 'terrorism' ? 'bg-red-700' :
           risk.key === 'pandemicDisease' ? 'bg-green-500' :
           risk.key === 'economicDownturn' ? 'bg-red-600' :
           risk.key === 'supplyChainDisruption' ? 'bg-blue-600' :
           risk.key === 'civilUnrest' ? 'bg-orange-600' :
           'bg-red-500',
    description: risk.key === 'hurricane' ? 'Tropical cyclones with strong winds and heavy rainfall' :
                 risk.key === 'flood' ? 'Water overflow from rivers, rainfall, or storm surge' :
                 risk.key === 'earthquake' ? 'Seismic activity and ground shaking' :
                 risk.key === 'drought' ? 'Extended periods of water scarcity' :
                 risk.key === 'landslide' ? 'Slope failure and mass movement' :
                 risk.key === 'powerOutage' ? 'Electrical grid failures and disruptions' :
                 risk.key === 'cyberAttack' ? 'Digital security threats and data breaches' :
                 risk.key === 'terrorism' ? 'Security threats and terrorist activities' :
                 risk.key === 'pandemicDisease' ? 'Public health emergencies and disease outbreaks' :
                 risk.key === 'economicDownturn' ? 'Economic recession or financial market collapse' :
                 risk.key === 'supplyChainDisruption' ? 'Interruption of goods and services supply' :
                 risk.key === 'civilUnrest' ? 'Social disorder and public disturbances' :
                 'Fire and fire hazards'
  }))

  const getRiskValue = (riskKey: string): { level: number; notes: string } => {
    if (!editedUnit.adminUnitRisk) return { level: 0, notes: '' }

    const riskMap: Record<string, { levelKey: keyof typeof editedUnit.adminUnitRisk; notesKey: keyof typeof editedUnit.adminUnitRisk }> = {
      hurricane: { levelKey: 'hurricaneLevel', notesKey: 'hurricaneNotes' },
      flood: { levelKey: 'floodLevel', notesKey: 'floodNotes' },
      earthquake: { levelKey: 'earthquakeLevel', notesKey: 'earthquakeNotes' },
      drought: { levelKey: 'droughtLevel', notesKey: 'droughtNotes' },
      landslide: { levelKey: 'landslideLevel', notesKey: 'landslideNotes' },
      powerOutage: { levelKey: 'powerOutageLevel', notesKey: 'powerOutageNotes' }
    }

    const keys = riskMap[riskKey]
    if (keys) {
      return {
        level: (editedUnit.adminUnitRisk[keys.levelKey] as number) || 0,
        notes: (editedUnit.adminUnitRisk[keys.notesKey] as string) || ''
      }
    }

    // Try to get from JSON profile for dynamic risk types
    try {
      const profile = JSON.parse(editedUnit.adminUnitRisk.riskProfileJson || '{}')
      return profile[riskKey] || { level: 0, notes: '' }
    } catch {
      return { level: 0, notes: '' }
    }
  }

  const handleRiskLevelChange = async (riskType: string, level: number) => {
    if (!editedUnit.adminUnitRisk) return

    const riskMap: Record<string, keyof typeof editedUnit.adminUnitRisk> = {
      hurricane: 'hurricaneLevel',
      flood: 'floodLevel',
      earthquake: 'earthquakeLevel',
      drought: 'droughtLevel',
      landslide: 'landslideLevel',
      powerOutage: 'powerOutageLevel'
    }

    const levelKey = riskMap[riskType]
    if (levelKey) {
      setEditedUnit(prev => ({
        ...prev,
        adminUnitRisk: {
          ...prev.adminUnitRisk!,
          [levelKey]: level,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'admin'
        }
      }))
    }
  }

  const startEditingNotes = (riskKey: string) => {
    const currentNotes = getRiskValue(riskKey).notes
    setNotesBeingEdited(prev => ({ ...prev, [riskKey]: currentNotes }))
    setExpandedRiskNotes(riskKey)
  }

  const saveNotes = async (riskKey: string) => {
    if (!editedUnit.adminUnitRisk) return

    setIsSavingNotes(prev => ({ ...prev, [riskKey]: true }))
    
    const riskMap: Record<string, keyof typeof editedUnit.adminUnitRisk> = {
      hurricane: 'hurricaneNotes',
      flood: 'floodNotes',
      earthquake: 'earthquakeNotes',
      drought: 'droughtNotes',
      landslide: 'landslideNotes',
      powerOutage: 'powerOutageNotes'
    }

    const notesKey = riskMap[riskKey]
    if (notesKey) {
      try {
        setEditedUnit(prev => ({
          ...prev,
          adminUnitRisk: {
            ...prev.adminUnitRisk!,
            [notesKey]: notesBeingEdited[riskKey] || '',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
          }
        }))
        
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
  }

  const discardNotes = (riskKey: string) => {
    setNotesBeingEdited(prev => {
      const newState = { ...prev }
      delete newState[riskKey]
      return newState
    })
    setExpandedRiskNotes(null)
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editedUnit.name}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="capitalize">{editedUnit.type}</span>
                {editedUnit.region && (
                  <>
                    <span>•</span>
                    <span>{editedUnit.region}</span>
                  </>
                )}
                <span>•</span>
                <span>{editedUnit.population.toLocaleString()} residents</span>
                <span>•</span>
                <span>{editedUnit.country?.name}</span>
              </div>
            </div>
            <AutoSaveIndicator autoSaveStatus={autoSaveStatus} className="text-sm" />
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500">
              Updated: {editedUnit.adminUnitRisk ? new Date(editedUnit.adminUnitRisk.lastUpdated).toLocaleDateString() : 'Never'}
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              ← Back to List
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {[
            { key: 'risks', label: 'Risk Assessment' },
            { key: 'overview', label: 'Overview' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Risk Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allAvailableRisks.map(risk => {
                const riskData = getRiskValue(risk.key)
                return (
                  <div
                    key={risk.key}
                    className={`p-4 rounded-lg border-2 ${getRiskColor(riskData.level)}`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-4 h-4 rounded ${risk.color}`}></div>
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
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
                <p className="text-gray-600 text-sm mt-1">Set risk levels for each hazard type - changes are saved automatically</p>
              </div>
              <div className="text-sm text-gray-500">
                {allAvailableRisks.length} risk types
              </div>
            </div>

            {/* Risk Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAvailableRisks.map(risk => {
                const riskData = getRiskValue(risk.key)
                const isEditingNotes = notesBeingEdited[risk.key] !== undefined
                const isNotesExpanded = expandedRiskNotes === risk.key
                
                return (
                  <div 
                    key={risk.key} 
                    className="border-2 rounded-lg border-blue-500 bg-blue-50 shadow-md"
                  >
                    {/* Main Risk Card */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full ${risk.color} flex-shrink-0`}></div>
                          <div>
                            <h4 className="font-semibold text-blue-900">
                              {risk.name}
                            </h4>
                            <p className="text-xs mt-1 text-blue-700">
                              {risk.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(riskData.level)}`}>
                          {riskData.level}/10
                        </div>
                      </div>
                      
                      {/* Risk Level Slider */}
                      {!isEditingNotes && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-blue-800 mb-2">
                              {risk.name} Risk Level for {editedUnit.name}
                            </label>
                            <p className="text-xs text-blue-700 mb-3 font-medium">
                              How often and severely does {editedUnit.name} experience {risk.name.toLowerCase()}? Consider historical data and local conditions.
                            </p>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={riskData.level}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleRiskLevelChange(risk.key, parseInt(e.target.value))
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-blue-600">0 - None</span>
                              <span className="text-xl font-bold text-blue-800">{riskData.level}</span>
                              <span className="text-xs text-blue-600">10 - Critical</span>
                            </div>
                            
                            {/* Risk Level Guidance */}
                            <div className="mt-3 text-xs text-blue-700 space-y-1">
                              <div className={`p-2 rounded ${riskData.level >= 0 && riskData.level <= 3 ? 'bg-green-50 border border-green-200' : 'bg-blue-50'}`}>
                                <span className="font-medium">Low (0-3):</span> {
                                  risk.key === 'hurricane' ? 'Rare or minor hurricanes. Historical data shows minimal direct hits or weak storms.' :
                                  risk.key === 'flood' ? 'Minimal flood risk. Good drainage, elevated areas, rare flooding events.' :
                                  risk.key === 'earthquake' ? 'Low seismic activity. No major fault lines nearby, rare earthquake events.' :
                                  risk.key === 'drought' ? 'Reliable water supply. Good rainfall, strong infrastructure, rare shortages.' :
                                  risk.key === 'landslide' ? 'Stable terrain. Flat or gently sloping areas, stable soil, rare landslides.' :
                                  risk.key === 'powerOutage' ? 'Reliable power grid. Modern infrastructure, rare outages, quick restoration.' :
                                  'Low risk level with minimal impact on normal operations.'
                                }
                              </div>
                              <div className={`p-2 rounded ${riskData.level >= 4 && riskData.level <= 7 ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50'}`}>
                                <span className="font-medium">Medium (4-7):</span> {
                                  risk.key === 'hurricane' ? 'Occasional hurricanes with moderate impact. Some historical storms caused damage.' :
                                  risk.key === 'flood' ? 'Moderate flood risk. Some low-lying areas flood during heavy rains or storms.' :
                                  risk.key === 'earthquake' ? 'Moderate seismic risk. Some fault activity, occasional minor earthquakes.' :
                                  risk.key === 'drought' ? 'Occasional water stress. Seasonal dry periods, some infrastructure limitations.' :
                                  risk.key === 'landslide' ? 'Moderate risk. Some steep areas, occasional landslides during heavy rains.' :
                                  risk.key === 'powerOutage' ? 'Moderate reliability. Some infrastructure issues, occasional outages.' :
                                  'Moderate risk requiring preparation and contingency planning.'
                                }
                              </div>
                              <div className={`p-2 rounded ${riskData.level >= 8 ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`}>
                                <span className="font-medium">High (8-10):</span> {
                                  risk.key === 'hurricane' ? 'Frequent or severe hurricanes. Major storms regularly affect this area with significant damage.' :
                                  risk.key === 'flood' ? 'High flood risk. Regular flooding during rainy season, poor drainage, low elevation.' :
                                  risk.key === 'earthquake' ? 'High seismic risk. Active fault lines, history of significant earthquakes.' :
                                  risk.key === 'drought' ? 'Frequent droughts. Poor rainfall patterns, inadequate water infrastructure.' :
                                  risk.key === 'landslide' ? 'High landslide risk. Steep terrain, unstable soil, frequent landslide events.' :
                                  risk.key === 'powerOutage' ? 'Unreliable power. Aging infrastructure, frequent outages, slow restoration.' :
                                  'High risk requiring immediate attention and robust mitigation measures.'
                                }
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
                                  {riskData.notes || 'Click to add notes...'}
                                </p>
                              </div>
                              <span className="text-blue-500 ml-2">✏️</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded Notes Editor */}
                    {isNotesExpanded && (
                      <div className="border-t border-blue-200 p-4 bg-blue-25">
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          Notes & Justification for {risk.name}
                        </label>
                        <textarea
                          value={notesBeingEdited[risk.key] || ''}
                          onChange={(e) => setNotesBeingEdited(prev => ({ ...prev, [risk.key]: e.target.value }))}
                          placeholder={`Add detailed notes about ${risk.name.toLowerCase()} risk assessment for ${editedUnit.name}...`}
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
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Assessment Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Risks:</span>
                  <div className="font-semibold text-blue-900">{allAvailableRisks.length}</div>
                </div>
                <div>
                  <span className="text-blue-700">Highest Risk:</span>
                  <div className="font-semibold text-blue-900">
                    {Math.max(...allAvailableRisks.map(r => getRiskValue(r.key).level), 0)}/10
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Average Risk:</span>
                  <div className="font-semibold text-blue-900">
                    {Math.round(allAvailableRisks.reduce((sum, r) => sum + getRiskValue(r.key).level, 0) / allAvailableRisks.length * 10) / 10}/10
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Last Updated:</span>
                  <div className="font-semibold text-blue-900 text-xs">
                    {editedUnit.adminUnitRisk ? new Date(editedUnit.adminUnitRisk.lastUpdated).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

