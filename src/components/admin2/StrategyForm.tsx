'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveIndicator } from './AutoSaveIndicator'
import { Strategy, ActionStep } from '../../types/admin'

interface StrategyFormProps {
  strategy?: Strategy
  onSave: (strategy: Strategy) => Promise<void>
  onCancel: () => void
  isEditing: boolean
  onAutoSave?: (strategy: Strategy) => void // Callback for auto-save updates
}

export function StrategyForm({ strategy, onSave, onCancel, isEditing, onAutoSave }: StrategyFormProps) {
  const [formData, setFormData] = useState<Strategy>({
    id: '',
    strategyId: '',
    name: '',
    category: 'prevention',
    description: '',
    smeDescription: '',
    whyImportant: '',
    applicableRisks: [],
    implementationCost: 'medium',
    costEstimateJMD: '',
    implementationTime: 'weeks',
    timeToImplement: '',
    effectiveness: 5,
    businessTypes: [],
    priority: 'medium',
    actionSteps: [],
    helpfulTips: [],
    commonMistakes: [],
    successMetrics: [],
    prerequisites: [],
    roi: 3.0
  })

  // Auto-save function using centralized data service
  const saveStrategy = useCallback(async (data: Strategy) => {
    try {
      console.log('📋 StrategyForm auto-saving via centralDataService:', data.name)
      
      // Map businessTypes to applicableBusinessTypes for API compatibility
      const strategyDataForApi = {
        ...data,
        applicableBusinessTypes: data.businessTypes || []
      }
      
      // Use centralized data service directly for auto-save
      const { centralDataService } = await import('../../services/centralDataService')
      const savedStrategy = await centralDataService.saveStrategy(strategyDataForApi)
      
      // Update local state with saved data to keep UI synchronized
      setFormData(savedStrategy)
      
      // Notify parent component about auto-save update
      if (onAutoSave) {
        onAutoSave(savedStrategy)
      }
      
      console.log('📋 StrategyForm auto-save completed successfully - UI synchronized')
    } catch (error) {
      console.error('📋 StrategyForm auto-save failed:', error)
      throw error
    }
  }, [onAutoSave])

  // Use the auto-save hook - only enable if we have a valid strategy with ID and name
  const { autoSaveStatus, forceSave } = useAutoSave({
    data: formData,
    saveFunction: saveStrategy,
    delay: 1000,
    enabled: !!(formData.id && formData.name && isEditing) // Only enable for editing existing strategies
  })

  const [newTip, setNewTip] = useState('')
  const [newMistake, setNewMistake] = useState('')
  const [newMetric, setNewMetric] = useState('')
  const [newPrerequisite, setNewPrerequisite] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (strategy) {
      setFormData(strategy)
    }
  }, [strategy])

  // Use centralized risk types for consistency
  const riskTypes = [
    { key: 'hurricane', name: 'Hurricane', icon: '🌀' },
    { key: 'flood', name: 'Flood', icon: '🌊' },
    { key: 'earthquake', name: 'Earthquake', icon: '🏔️' },
    { key: 'drought', name: 'Drought', icon: '🌵' },
    { key: 'landslide', name: 'Landslide', icon: '⛰️' },
    { key: 'powerOutage', name: 'Power Outage', icon: '⚡' },
    { key: 'fire', name: 'Fire', icon: '🔥' },
    { key: 'cyberAttack', name: 'Cyber Attack', icon: '💻' },
    { key: 'terrorism', name: 'Security Threats', icon: '🔒' },
    { key: 'pandemicDisease', name: 'Health Emergencies', icon: '🦠' },
    { key: 'economicDownturn', name: 'Economic Crisis', icon: '📉' },
    { key: 'supplyChainDisruption', name: 'Supply Chain Issues', icon: '🚛' },
    { key: 'civilUnrest', name: 'Civil Unrest', icon: '⚡' }
  ]

  const businessCategories = [
    { key: 'hospitality', name: 'Hospitality' },
    { key: 'retail', name: 'Retail' },
    { key: 'services', name: 'Services' },
    { key: 'manufacturing', name: 'Manufacturing' },
    { key: 'agriculture', name: 'Agriculture' },
    { key: 'technology', name: 'Technology' },
    { key: 'all', name: 'All Business Types' }
  ]

  const phases = [
    { key: 'immediate', name: 'Immediate (0-2 weeks)' },
    { key: 'short_term', name: 'Short Term (2-8 weeks)' },
    { key: 'medium_term', name: 'Medium Term (2-6 months)' },
    { key: 'long_term', name: 'Long Term (6+ months)' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // Generate IDs if creating new
      if (!formData.id) {
        const newFormData = {
          ...formData,
          id: `custom_${Date.now()}`,
          strategyId: formData.strategyId || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        }
        setFormData(newFormData)
      }
      
      // For existing strategies, use auto-save; for new ones, use the callback
      if (isEditing && formData.id) {
        await forceSave()
      } else {
        // Map businessTypes to applicableBusinessTypes for API compatibility
        const strategyForApi = {
          ...formData,
          applicableBusinessTypes: formData.businessTypes || []
        }
        await onSave(strategyForApi)
      }
    } catch (error) {
      console.error('Failed to save strategy:', error)
      alert('Failed to save strategy. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const addActionStep = () => {
    const newStep: ActionStep = {
      id: `step_${Date.now()}`,
      phase: 'immediate',
      action: '',
      smeAction: '',
      timeframe: '',
      responsibility: '',
      resources: [],
      cost: '',
      checklist: []
    }
    setFormData(prev => ({
      ...prev,
      actionSteps: [...prev.actionSteps, newStep]
    }))
  }

  const updateActionStep = (index: number, field: keyof ActionStep, value: any) => {
    setFormData(prev => ({
      ...prev,
      actionSteps: prev.actionSteps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }))
  }

  const removeActionStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actionSteps: prev.actionSteps.filter((_, i) => i !== index)
    }))
  }

  const addToArray = (field: 'helpfulTips' | 'commonMistakes' | 'successMetrics' | 'prerequisites', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }))
    }
  }

  const removeFromArray = (field: 'helpfulTips' | 'commonMistakes' | 'successMetrics' | 'prerequisites', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Strategy' : 'Create New Strategy'}
          </h2>
          {isEditing && <AutoSaveIndicator autoSaveStatus={autoSaveStatus} />}
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strategy Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="prevention">🛡️ Prevention</option>
              <option value="preparation">📋 Preparation</option>
              <option value="response">🚨 Response</option>
              <option value="recovery">🔄 Recovery</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Implementation Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Implementation Cost
            </label>
            <select
              value={formData.implementationCost}
              onChange={(e) => setFormData(prev => ({ ...prev, implementationCost: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low (Under JMD $10K)</option>
              <option value="medium">Medium (JMD $10K-$50K)</option>
              <option value="high">High (JMD $50K-$200K)</option>
              <option value="very_high">Very High (Over JMD $200K)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Implementation Time
            </label>
            <select
              value={formData.implementationTime}
              onChange={(e) => setFormData(prev => ({ ...prev, implementationTime: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effectiveness (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.effectiveness}
              onChange={(e) => setFormData(prev => ({ ...prev, effectiveness: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Applicable Risks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Risk Types *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {riskTypes.map(risk => (
              <label key={risk.key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.applicableRisks.includes(risk.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        applicableRisks: [...prev.applicableRisks, risk.key]
                      }))
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        applicableRisks: prev.applicableRisks.filter(r => r !== risk.key)
                      }))
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{risk.icon} {risk.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Business Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Business Types
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {businessCategories.map(category => (
              <label key={category.key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.businessTypes.includes(category.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        businessTypes: [...prev.businessTypes, category.key]
                      }))
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        businessTypes: prev.businessTypes.filter(b => b !== category.key)
                      }))
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Steps */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Implementation Action Steps</h3>
            <button
              type="button"
              onClick={addActionStep}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              + Add Step
            </button>
          </div>

          <div className="space-y-4">
            {formData.actionSteps.map((step, index) => (
              <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Step {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeActionStep(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                    <select
                      value={step.phase}
                      onChange={(e) => updateActionStep(index, 'phase', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      {phases.map(phase => (
                        <option key={phase.key} value={phase.key}>{phase.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                    <input
                      type="text"
                      value={step.timeframe}
                      onChange={(e) => updateActionStep(index, 'timeframe', e.target.value)}
                      placeholder="e.g., 1-2 weeks"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Description</label>
                  <textarea
                    value={step.action}
                    onChange={(e) => updateActionStep(index, 'action', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsibility</label>
                    <input
                      type="text"
                      value={step.responsibility}
                      onChange={(e) => updateActionStep(index, 'responsibility', e.target.value)}
                      placeholder="e.g., Business Owner"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resources (comma-separated)</label>
                    <input
                      type="text"
                      value={step.resources.join(', ')}
                      onChange={(e) => updateActionStep(index, 'resources', e.target.value.split(',').map(r => r.trim()))}
                      placeholder="e.g., Equipment, Staff time"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (JMD)</label>
                    <input
                      type="text"
                      value={step.cost}
                      onChange={(e) => updateActionStep(index, 'cost', e.target.value)}
                      placeholder="e.g., JMD $20,000-30,000"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Helpful Tips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Helpful Tips</label>
            <div className="space-y-2">
              {(formData.helpfulTips || []).map((tip, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="flex-1 text-sm bg-green-50 p-2 rounded">{tip}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray('helpfulTips', index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  placeholder="Add a helpful tip..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    addToArray('helpfulTips', newTip)
                    setNewTip('')
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Common Mistakes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Common Mistakes</label>
            <div className="space-y-2">
              {(formData.commonMistakes || []).map((mistake, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="flex-1 text-sm bg-yellow-50 p-2 rounded">{mistake}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray('commonMistakes', index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMistake}
                  onChange={(e) => setNewMistake(e.target.value)}
                  placeholder="Add a common mistake..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    addToArray('commonMistakes', newMistake)
                    setNewMistake('')
                  }}
                  className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : isEditing ? 'Update Strategy' : 'Create Strategy'}
          </button>
        </div>
      </form>
    </div>
  )
}
