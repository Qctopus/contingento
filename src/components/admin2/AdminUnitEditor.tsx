'use client'

import React, { useState, useEffect } from 'react'
import { AdminUnit, RISK_TYPES, RiskData } from '../../types/admin'

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

interface AdminUnitEditorProps {
  unit: AdminUnitWithRisk
  onUpdate: (updatedUnit: AdminUnitWithRisk) => Promise<void>
  onClose: () => void
}

export function AdminUnitEditor({ unit, onUpdate, onClose }: AdminUnitEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [riskProfile, setRiskProfile] = useState<Record<string, RiskData>>({})

  useEffect(() => {
    // Initialize risk profile from unit data
    const profile: Record<string, RiskData> = {}
    
    if (unit.adminUnitRisk) {
      // Map the structured fields
      profile.hurricane = { level: unit.adminUnitRisk.hurricaneLevel, notes: unit.adminUnitRisk.hurricaneNotes }
      profile.flood = { level: unit.adminUnitRisk.floodLevel, notes: unit.adminUnitRisk.floodNotes }
      profile.earthquake = { level: unit.adminUnitRisk.earthquakeLevel, notes: unit.adminUnitRisk.earthquakeNotes }
      profile.drought = { level: unit.adminUnitRisk.droughtLevel, notes: unit.adminUnitRisk.droughtNotes }
      profile.landslide = { level: unit.adminUnitRisk.landslideLevel, notes: unit.adminUnitRisk.landslideNotes }
      profile.powerOutage = { level: unit.adminUnitRisk.powerOutageLevel, notes: unit.adminUnitRisk.powerOutageNotes }
      
      // Try to get additional risks from JSON profile
      try {
        const jsonProfile = JSON.parse(unit.adminUnitRisk.riskProfileJson || '{}')
        Object.keys(jsonProfile).forEach(key => {
          if (!profile[key] && jsonProfile[key]) {
            profile[key] = jsonProfile[key]
          }
        })
      } catch (error) {
        console.error('Error parsing risk profile JSON:', error)
      }
    }
    
    // Ensure all risk types have an entry
    RISK_TYPES.forEach(risk => {
      if (!profile[risk.key]) {
        profile[risk.key] = { level: 0, notes: '' }
      }
    })
    
    setRiskProfile(profile)
  }, [unit])

  const handleRiskChange = (riskKey: string, field: 'level' | 'notes', value: number | string) => {
    setRiskProfile(prev => ({
      ...prev,
      [riskKey]: {
        ...prev[riskKey],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Prepare the updated unit with risk data
      const updatedUnit: AdminUnitWithRisk = {
        ...unit,
        adminUnitRisk: {
          id: unit.adminUnitRisk?.id || '',
          hurricaneLevel: riskProfile.hurricane?.level || 0,
          hurricaneNotes: riskProfile.hurricane?.notes || '',
          floodLevel: riskProfile.flood?.level || 0,
          floodNotes: riskProfile.flood?.notes || '',
          earthquakeLevel: riskProfile.earthquake?.level || 0,
          earthquakeNotes: riskProfile.earthquake?.notes || '',
          droughtLevel: riskProfile.drought?.level || 0,
          droughtNotes: riskProfile.drought?.notes || '',
          landslideLevel: riskProfile.landslide?.level || 0,
          landslideNotes: riskProfile.landslide?.notes || '',
          powerOutageLevel: riskProfile.powerOutage?.level || 0,
          powerOutageNotes: riskProfile.powerOutage?.notes || '',
          riskProfileJson: JSON.stringify(riskProfile),
          lastUpdated: new Date().toISOString(),
          updatedBy: 'admin'
        }
      }
      
      await onUpdate(updatedUnit)
      onClose()
    } catch (error) {
      console.error('Error saving risk profile:', error)
      alert('Failed to save risk profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getRiskColor = (level: number) => {
    if (level >= 8) return 'bg-red-500'
    if (level >= 6) return 'bg-orange-500'
    if (level >= 4) return 'bg-yellow-500'
    if (level >= 2) return 'bg-blue-500'
    return 'bg-gray-300'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{unit.name}</h2>
              <p className="text-sm text-gray-600">
                {unit.type.charAt(0).toUpperCase() + unit.type.slice(1)} • {unit.country?.name}
                {unit.region && ` • ${unit.region}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Risk Profile Editor */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Risk Level Scale</h3>
              <div className="grid grid-cols-5 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span>0-1: None</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>2-3: Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>4-5: Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>6-7: High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>8-10: Critical</span>
                </div>
              </div>
            </div>

            {RISK_TYPES.map(risk => {
              const riskData = riskProfile[risk.key] || { level: 0, notes: '' }
              return (
                <div key={risk.key} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{risk.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{risk.name}</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Risk Level: {riskData.level}/10
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={riskData.level}
                              onChange={(e) => handleRiskChange(risk.key, 'level', parseInt(e.target.value))}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${getRiskColor(riskData.level)}`}>
                              {riskData.level}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <textarea
                            value={riskData.notes}
                            onChange={(e) => handleRiskChange(risk.key, 'notes', e.target.value)}
                            placeholder={`Notes about ${risk.name.toLowerCase()} risk in this area...`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Risk Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}




























