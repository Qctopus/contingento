'use client'

import { useState, useEffect } from 'react'
import { RiskMultiplier, MultiplierFormData, CHARACTERISTIC_TYPES, HAZARD_TYPES } from '@/types/multipliers'
import { RISK_TYPES } from '@/types/admin'

export default function RiskMultipliersTab() {
  const [multipliers, setMultipliers] = useState<RiskMultiplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<MultiplierFormData>({
    name: '',
    description: '',
    characteristicType: '',
    conditionType: 'boolean',
    multiplierFactor: 1.0,
    applicableHazards: [],
    priority: 0,
    isActive: true
  })

  useEffect(() => {
    fetchMultipliers()
  }, [])

  const fetchMultipliers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin2/multipliers')
      const data = await response.json()
      if (data.success) {
        setMultipliers(data.multipliers)
      }
    } catch (error) {
      console.error('Error fetching multipliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = '/api/admin2/multipliers'
      const method = editingId ? 'PATCH' : 'POST'
      const body = editingId ? { ...formData, id: editingId } : formData
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchMultipliers()
        resetForm()
      } else {
        alert('Error saving multiplier: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving multiplier:', error)
      alert('Error saving multiplier')
    }
  }

  const handleEdit = (multiplier: RiskMultiplier) => {
    setEditingId(multiplier.id)
    
    // Parse applicableHazards safely - it might be a string or already an array
    let hazards: string[] = []
    try {
      hazards = typeof multiplier.applicableHazards === 'string' 
        ? JSON.parse(multiplier.applicableHazards)
        : multiplier.applicableHazards || []
    } catch (error) {
      console.error('Error parsing applicableHazards:', error)
      hazards = []
    }
    
    setFormData({
      name: multiplier.name,
      description: multiplier.description,
      characteristicType: multiplier.characteristicType,
      conditionType: multiplier.conditionType,
      thresholdValue: multiplier.thresholdValue || undefined,
      minValue: multiplier.minValue || undefined,
      maxValue: multiplier.maxValue || undefined,
      multiplierFactor: multiplier.multiplierFactor,
      applicableHazards: hazards,
      priority: multiplier.priority,
      reasoning: multiplier.reasoning || undefined,
      isActive: multiplier.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this multiplier?')) return
    
    try {
      const response = await fetch(`/api/admin2/multipliers?id=${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchMultipliers()
      } else {
        alert('Error deleting multiplier: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting multiplier:', error)
      alert('Error deleting multiplier')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      characteristicType: '',
      conditionType: 'boolean',
      multiplierFactor: 1.0,
      applicableHazards: [],
      priority: 0,
      isActive: true
    })
    setEditingId(null)
    setShowForm(false)
  }

  const toggleHazard = (hazard: string) => {
    setFormData(prev => ({
      ...prev,
      applicableHazards: prev.applicableHazards.includes(hazard)
        ? prev.applicableHazards.filter(h => h !== hazard)
        : [...prev.applicableHazards, hazard]
    }))
  }

  const selectedCharType = CHARACTERISTIC_TYPES.find(ct => ct.value === formData.characteristicType)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risk Multipliers</h2>
          <p className="text-sm text-gray-600 mt-1">
            Define how business characteristics amplify risk scores
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Multiplier'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-blue-300 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Multiplier' : 'Create New Multiplier'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Multiplier Factor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="5.0"
                  value={formData.multiplierFactor}
                  onChange={(e) => setFormData(prev => ({ ...prev, multiplierFactor: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 1.2 = 20% increase</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                required
              />
            </div>

            {/* Characteristic Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Characteristic * 
                  <span className="text-xs text-gray-500 ml-2">(What wizard question determines this?)</span>
                </label>
                <select
                  value={formData.characteristicType}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    characteristicType: e.target.value,
                    // Auto-set condition type based on characteristic
                    conditionType: CHARACTERISTIC_TYPES.find(ct => ct.value === e.target.value)?.inputType === 'boolean' 
                      ? 'boolean' 
                      : 'threshold'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select characteristic...</option>
                  {CHARACTERISTIC_TYPES.map(ct => (
                    <option key={ct.value} value={ct.value}>
                      {ct.label} ({ct.inputType})
                    </option>
                  ))}
                </select>
                
                {/* Show wizard question mapping */}
                {selectedCharType && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      📋 Wizard Question:
                    </p>
                    <p className="text-sm text-blue-800 mb-2">
                      "{selectedCharType.wizardQuestion}"
                    </p>
                    <p className="text-xs text-blue-700">
                      <span className="font-semibold">User answers:</span> {selectedCharType.wizardAnswers}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition Type *
                </label>
                <select
                  value={formData.conditionType}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    conditionType: e.target.value as 'boolean' | 'threshold' | 'range'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={selectedCharType?.inputType === 'boolean'}
                >
                  <option value="boolean">Boolean (Yes/No)</option>
                  <option value="threshold">Threshold (≥ value)</option>
                  <option value="range">Range (between values)</option>
                </select>
              </div>
            </div>

            {/* Threshold/Range Values */}
            {formData.conditionType === 'threshold' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Threshold Value *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.thresholdValue || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    thresholdValue: parseFloat(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Multiplier applies when value ≥ this threshold
                  {selectedCharType?.inputType === 'percentage' && ' (%)'}
                </p>
              </div>
            )}

            {formData.conditionType === 'range' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Value *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.minValue || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      minValue: parseFloat(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Value *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.maxValue || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxValue: parseFloat(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {/* Applicable Hazards */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable Hazards * (select all that apply)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {HAZARD_TYPES.map(hazard => (
                  <label 
                    key={hazard}
                    className="flex items-center space-x-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.applicableHazards.includes(hazard)}
                      onChange={() => toggleHazard(hazard)}
                      className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">
                      {hazard.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority (order of application)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reasoning (why this multiplier exists)
              </label>
              <textarea
                value={formData.reasoning || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, reasoning: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Explain why this characteristic amplifies risk..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Update' : 'Create'} Multiplier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Multipliers List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Existing Multipliers ({multipliers.length})
        </h3>
        
        {multipliers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No multipliers defined yet.</p>
            <p className="text-sm text-gray-500 mt-1">Create your first multiplier to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {multipliers.map(multiplier => {
              // Parse applicableHazards safely
              let hazards: string[] = []
              try {
                hazards = typeof multiplier.applicableHazards === 'string' 
                  ? JSON.parse(multiplier.applicableHazards)
                  : multiplier.applicableHazards || []
              } catch (error) {
                console.error('Error parsing applicableHazards for display:', error)
                hazards = []
              }
              
              // Filter to only show valid risks (remove old/invalid risk types)
              const validRiskKeys = RISK_TYPES.map(rt => rt.key)
              const validHazards = hazards.filter(hazard => {
                const normalizedHazard = hazard.replace(/_/g, '').toLowerCase()
                return validRiskKeys.some(key => key.toLowerCase() === normalizedHazard)
              })
              
              const charType = CHARACTERISTIC_TYPES.find(ct => ct.value === multiplier.characteristicType)
              
              return (
                <div 
                  key={multiplier.id}
                  className={`bg-white border rounded-lg p-4 ${
                    multiplier.isActive ? 'border-gray-300' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {multiplier.name}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          multiplier.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {multiplier.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          ×{multiplier.multiplierFactor}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          Priority: {multiplier.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {multiplier.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Characteristic:</span>{' '}
                          <span className="text-gray-600">{charType?.label || multiplier.characteristicType}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Condition:</span>{' '}
                          <span className="text-gray-600">
                            {multiplier.conditionType === 'boolean' && 'Yes/No'}
                            {multiplier.conditionType === 'threshold' && `≥ ${multiplier.thresholdValue}`}
                            {multiplier.conditionType === 'range' && `${multiplier.minValue}-${multiplier.maxValue}`}
                          </span>
                        </div>
                      </div>
                      
                      {/* Wizard Question Mapping */}
                      {charType && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          <div className="flex items-start">
                            <span className="text-blue-600 mr-2">📋</span>
                            <div className="flex-1">
                              <p className="font-medium text-blue-900">Wizard Question:</p>
                              <p className="text-blue-800 mt-1">"{charType.wizardQuestion}"</p>
                              <p className="text-xs text-blue-700 mt-1">
                                Answers: {charType.wizardAnswers}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Applies to Risks:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {validHazards.length > 0 ? (
                            validHazards.map((hazard: string) => {
                              // Find the matching risk type to get the proper display name
                              const riskType = RISK_TYPES.find(rt => 
                                rt.key.toLowerCase() === hazard.replace(/_/g, '').toLowerCase()
                              )
                              return (
                                <span 
                                  key={hazard}
                                  className="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded flex items-center gap-1"
                                >
                                  {riskType?.icon} {riskType?.name || hazard}
                                </span>
                              )
                            })
                          ) : (
                            <span className="text-xs text-gray-500 italic">No valid risks selected</span>
                          )}
                        </div>
                      </div>
                      
                      {multiplier.reasoning && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600 italic">
                          💡 {multiplier.reasoning}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleEdit(multiplier)}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(multiplier.id)}
                        className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}



