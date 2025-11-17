'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveIndicator } from './AutoSaveIndicator'
import { Strategy, ActionStep } from '../../types/admin'
import { MultilingualTextInput } from './MultilingualTextInput'
import { MultilingualArrayInput } from './MultilingualArrayInput'
import { MultilingualArrayEditor } from './MultilingualArrayEditor'
import { TranslationStatusBar } from './TranslationStatusBar'

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
    description: '',
    
    // SME-Focused Content (NEW)
    smeTitle: '',
    smeSummary: '',
    benefitsBullets: [],
    realWorldExample: '',
    
    // Backward compatibility
    smeDescription: '',
    whyImportant: '',
    
    applicableRisks: [],
    implementationCost: 'medium',
    costEstimateJMD: '',
    totalEstimatedHours: undefined,
    complexityLevel: 'moderate',
    
    // Wizard Integration (NEW)
    quickWinIndicator: false,
    defaultSelected: false,
    selectionTier: undefined,
    requiredForRisks: [],
    
    businessTypes: [],
    actionSteps: [],
    helpfulTips: [],
    commonMistakes: [],
    successMetrics: [],
    prerequisites: [],
    roi: 3.0,
    
    // Resource-Limited SME Support (NEW)
    lowBudgetAlternative: '',
    diyApproach: '',
    estimatedDIYSavings: '',
    
    // BCP Document Integration (NEW)
    bcpSectionMapping: '',
    bcpTemplateText: '',
    
    // Personalization (NEW)
    industryVariants: {},
    businessSizeGuidance: {}
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
  
  // NEW: State for SME fields
  const [newBenefit, setNewBenefit] = useState('')
  const [newRequiredRisk, setNewRequiredRisk] = useState('')
  const [industryVariantKey, setIndustryVariantKey] = useState('')
  const [industryVariantValue, setIndustryVariantValue] = useState('')
  const [businessSizeKey, setBusinessSizeKey] = useState('')
  const [businessSizeValue, setBusinessSizeValue] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    smeContent: true,
    implementation: true,
    wizardIntegration: false,
    budgetOptions: false,
    bcpIntegration: false,
    personalization: false
  })

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
    { key: 'before', name: '🛡️ Before Crisis (Prevention & Preparation)' },
    { key: 'during', name: '⚠️ During Crisis (Response)' },
    { key: 'after', name: '✅ After Crisis (Recovery)' }
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
      checklist: [],
      
      // NEW SME Context fields
      whyThisStepMatters: '',
      whatHappensIfSkipped: '',
      estimatedMinutes: undefined,
      difficultyLevel: 'medium',
      howToKnowItsDone: '',
      exampleOutput: '',
      dependsOnSteps: [],
      isOptional: false,
      skipConditions: '',
      freeAlternative: '',
      lowTechOption: '',
      commonMistakesForStep: [],
      videoTutorialUrl: '',
      externalResourceUrl: ''
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
  
  // NEW: Helpers for SME array fields
  const addBenefit = (value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        benefitsBullets: [...(prev.benefitsBullets || []), value.trim()]
      }))
    }
  }
  
  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefitsBullets: (prev.benefitsBullets || []).filter((_, i) => i !== index)
    }))
  }
  
  const addRequiredRisk = (risk: string) => {
    if (risk && !formData.requiredForRisks?.includes(risk)) {
      setFormData(prev => ({
        ...prev,
        requiredForRisks: [...(prev.requiredForRisks || []), risk]
      }))
    }
  }
  
  const removeRequiredRisk = (risk: string) => {
    setFormData(prev => ({
      ...prev,
      requiredForRisks: (prev.requiredForRisks || []).filter(r => r !== risk)
    }))
  }
  
  const addIndustryVariant = (key: string, value: string) => {
    if (key.trim() && value.trim()) {
      setFormData(prev => ({
        ...prev,
        industryVariants: {
          ...(prev.industryVariants || {}),
          [key.trim()]: value.trim()
        }
      }))
    }
  }
  
  const removeIndustryVariant = (key: string) => {
    setFormData(prev => {
      const newVariants = { ...(prev.industryVariants || {}) }
      delete newVariants[key]
      return {
        ...prev,
        industryVariants: newVariants
      }
    })
  }
  
  const addBusinessSizeGuidance = (size: string, guidance: string) => {
    if (size.trim() && guidance.trim()) {
      setFormData(prev => ({
        ...prev,
        businessSizeGuidance: {
          ...(prev.businessSizeGuidance || {}),
          [size.trim()]: guidance.trim()
        }
      }))
    }
  }
  
  const removeBusinessSizeGuidance = (size: string) => {
    setFormData(prev => {
      const newGuidance = { ...(prev.businessSizeGuidance || {}) }
      delete newGuidance[size]
      return {
        ...prev,
        businessSizeGuidance: newGuidance
      }
    })
  }
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
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
        {/* Translation Status Indicator */}
        {isEditing && formData.id && (
          <TranslationStatusBar strategy={formData} />
        )}

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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description * (Technical)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Original technical description (legacy)</p>
        </div>

        {/* SME-FOCUSED CONTENT SECTION (NEW) */}
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <button
            type="button"
            onClick={() => toggleSection('smeContent')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
              💬 SME-Focused Content (Plain Language)
              <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded">NEW</span>
            </h3>
            <span className="text-blue-900">{expandedSections.smeContent ? '▼' : '▶'}</span>
          </button>
          
          {expandedSections.smeContent && (
            <div className="mt-4 space-y-4">
              <div>
                <MultilingualTextInput
                  label="SME Title (Plain Language) 🎯"
                  value={formData.smeTitle || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, smeTitle: value }))}
                  type="text"
                  required={true}
                  helpText="Use benefit-driven, conversational language that speaks to small business owners"
                  placeholder="e.g., 'Protect Your Business from Hurricane Damage'"
                />
              </div>

              <div>
                <MultilingualTextInput
                  label="SME Summary (One Sentence)"
                  value={formData.smeSummary || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, smeSummary: value }))}
                  type="textarea"
                  required={true}
                  helpText="Plain language summary that explains WHY this matters to SMEs"
                  placeholder="e.g., 'Hurricane season comes every year in the Caribbean...'"
                />
              </div>

              <div>
                <MultilingualArrayInput
                  label="Benefit Bullets (What You Get) ✅"
                  value={formData.benefitsBullets || []}
                  onChange={(value) => setFormData(prev => ({ ...prev, benefitsBullets: value }))}
                  required={true}
                  helpText="Concrete benefits in business owner language (3-5 bullets)"
                  placeholder="e.g., 'Reopen faster than competitors'"
                  addButtonText="Add Benefit"
                />
              </div>

              <div>
                <MultilingualTextInput
                  label="Real Caribbean Success Story 💚"
                  value={formData.realWorldExample || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, realWorldExample: value }))}
                  type="textarea"
                  helpText="Real example from a Caribbean SME showing the impact. Include location, business type, and specific outcomes."
                  placeholder="e.g., 'When Hurricane Beryl hit Negril in 2024, Miss Claudette's gift shop...'"
                />
              </div>
            </div>
          )}
        </div>

        {/* Implementation Details - ENHANCED */}
        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
          <button
            type="button"
            onClick={() => toggleSection('implementation')}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <h3 className="text-lg font-semibold text-purple-900">
              ⚙️ Implementation Details
            </h3>
            <span className="text-purple-900">{expandedSections.implementation ? '▼' : '▶'}</span>
          </button>
          
          {expandedSections.implementation && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Implementation Cost (Legacy)
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
                    Cost Estimate (JMD) 🆕
                  </label>
                  <input
                    type="text"
                    value={formData.costEstimateJMD || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, costEstimateJMD: e.target.value }))}
                    placeholder="e.g., 'JMD 15,000-80,000'"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Specific JMD range for Caribbean SMEs</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Hours 🆕
                  </label>
                  <input
                    type="number"
                    value={formData.totalEstimatedHours || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalEstimatedHours: parseInt(e.target.value) || undefined }))}
                    placeholder="e.g., 8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Total hours to complete</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complexity Level
                </label>
                <select
                  value={formData.complexityLevel || 'moderate'}
                  onChange={(e) => setFormData(prev => ({ ...prev, complexityLevel: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Implementation difficulty</p>
              </div>
            </>
          )}
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

        {/* WIZARD INTEGRATION SECTION (NEW) */}
        <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
          <button
            type="button"
            onClick={() => toggleSection('wizardIntegration')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-yellow-900 flex items-center">
              🎯 Wizard Integration
              <span className="ml-2 text-xs bg-yellow-200 px-2 py-1 rounded">NEW</span>
            </h3>
            <span className="text-yellow-900">{expandedSections.wizardIntegration ? '▼' : '▶'}</span>
          </button>
          
          {expandedSections.wizardIntegration && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selection Tier ⭐
                  </label>
                  <select
                    value={formData.selectionTier || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, selectionTier: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Auto (from scoring)</option>
                    <option value="essential">🔴 Essential (Must Have)</option>
                    <option value="recommended">🟡 Recommended (Should Have)</option>
                    <option value="optional">🟢 Optional (Nice to Have)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Leave empty to let algorithm decide</p>
                </div>

                <div>
                  <label className="flex items-center space-x-2 cursor-pointer mt-8">
                    <input
                      type="checkbox"
                      checked={formData.quickWinIndicator || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, quickWinIndicator: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                    />
                    <span className="text-sm font-medium">⚡ Quick Win (Fast impact)</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Shows badge in wizard</p>
                </div>

                <div>
                  <label className="flex items-center space-x-2 cursor-pointer mt-8">
                    <input
                      type="checkbox"
                      checked={formData.defaultSelected || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, defaultSelected: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                    />
                    <span className="text-sm font-medium">✓ Pre-select in wizard</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Auto-checked by default</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required For Risks (Force Essential)
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.requiredForRisks || []).map((risk) => (
                      <span key={risk} className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        {risk}
                        <button
                          type="button"
                          onClick={() => removeRequiredRisk(risk)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={newRequiredRisk}
                      onChange={(e) => setNewRequiredRisk(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select risk to add...</option>
                      {riskTypes.map(risk => (
                        <option key={risk.key} value={risk.key}>{risk.icon} {risk.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (newRequiredRisk) {
                          addRequiredRisk(newRequiredRisk)
                          setNewRequiredRisk('')
                        }
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">If user selects these risks, force this strategy to "essential"</p>
              </div>
            </div>
          )}
        </div>

        {/* BUDGET-FRIENDLY OPTIONS SECTION (NEW) */}
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <button
            type="button"
            onClick={() => toggleSection('budgetOptions')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-green-900 flex items-center">
              💰 Budget-Friendly Options
              <span className="ml-2 text-xs bg-green-200 px-2 py-1 rounded">NEW</span>
            </h3>
            <span className="text-green-900">{expandedSections.budgetOptions ? '▼' : '▶'}</span>
          </button>
          
          {expandedSections.budgetOptions && (
            <div className="mt-4 space-y-4">
              <div>
                <MultilingualTextInput
                  label="Low Budget Alternative 💸"
                  value={formData.lowBudgetAlternative || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, lowBudgetAlternative: value }))}
                  type="textarea"
                  helpText="Cheaper alternative for resource-limited SMEs"
                  placeholder="e.g., 'DIY plywood shutters (JMD 5,000-10,000) work almost as well...'"
                />
              </div>

              <div>
                <MultilingualTextInput
                  label="DIY Approach 🔧"
                  value={formData.diyApproach || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, diyApproach: value }))}
                  type="textarea"
                  helpText="Step-by-step DIY instructions"
                  placeholder="e.g., '1) Buy plywood sheets and hinges...'"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated DIY Savings
                </label>
                <input
                  type="text"
                  value={formData.estimatedDIYSavings || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDIYSavings: e.target.value }))}
                  placeholder="e.g., 'JMD 30,000-40,000 compared to professional installation'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">How much money DIY saves</p>
              </div>
            </div>
          )}
        </div>

        {/* BCP INTEGRATION SECTION (NEW) */}
        <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
          <button
            type="button"
            onClick={() => toggleSection('bcpIntegration')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
              📄 BCP Document Integration
              <span className="ml-2 text-xs bg-indigo-200 px-2 py-1 rounded">NEW</span>
            </h3>
            <span className="text-indigo-900">{expandedSections.bcpIntegration ? '▼' : '▶'}</span>
          </button>
          
          {expandedSections.bcpIntegration && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BCP Section Mapping
                </label>
                <input
                  type="text"
                  value={formData.bcpSectionMapping || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bcpSectionMapping: e.target.value }))}
                  placeholder="e.g., 'hurricane_preparedness' or 'financial_preparedness'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Which BCP document section this strategy belongs to</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BCP Template Text
                </label>
                <textarea
                  value={formData.bcpTemplateText || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bcpTemplateText: e.target.value }))}
                  rows={4}
                  placeholder="e.g., 'Hurricane Preparation Checklist:\n✓ Shutters installed or plywood ready\n✓ Critical equipment moved to safe location\n✓ Inventory documented with photos'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Text that appears in the generated BCP document</p>
              </div>
            </div>
          )}
        </div>

        {/* PERSONALIZATION SECTION (NEW) */}
        <div className="border border-pink-200 rounded-lg p-4 bg-pink-50">
          <button
            type="button"
            onClick={() => toggleSection('personalization')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-pink-900 flex items-center">
              🎨 Personalization (Industry & Size)
              <span className="ml-2 text-xs bg-pink-200 px-2 py-1 rounded">NEW</span>
            </h3>
            <span className="text-pink-900">{expandedSections.personalization ? '▼' : '▶'}</span>
          </button>
          
          {expandedSections.personalization && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry-Specific Guidance
                </label>
                <div className="space-y-2">
                  {Object.entries(formData.industryVariants || {}).map(([industry, guidance]) => (
                    <div key={industry} className="flex items-start space-x-2 bg-white p-2 rounded border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{industry}:</p>
                        <p className="text-sm text-gray-600">{guidance}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIndustryVariant(industry)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={industryVariantKey}
                      onChange={(e) => setIndustryVariantKey(e.target.value)}
                      placeholder="Industry (e.g., 'restaurant')"
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={industryVariantValue}
                      onChange={(e) => setIndustryVariantValue(e.target.value)}
                      placeholder="Industry-specific guidance"
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addIndustryVariant(industryVariantKey, industryVariantValue)
                      setIndustryVariantKey('')
                      setIndustryVariantValue('')
                    }}
                    className="px-3 py-2 bg-pink-600 text-white text-sm rounded hover:bg-pink-700"
                  >
                    Add Industry Variant
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Custom guidance for different industries</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Size Guidance
                </label>
                <div className="space-y-2">
                  {Object.entries(formData.businessSizeGuidance || {}).map(([size, guidance]) => (
                    <div key={size} className="flex items-start space-x-2 bg-white p-2 rounded border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{size}:</p>
                        <p className="text-sm text-gray-600">{guidance}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBusinessSizeGuidance(size)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={businessSizeKey}
                      onChange={(e) => setBusinessSizeKey(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select size...</option>
                      <option value="micro">Micro (1-5 employees)</option>
                      <option value="small">Small (6-20 employees)</option>
                      <option value="medium">Medium (21-50 employees)</option>
                    </select>
                    <input
                      type="text"
                      value={businessSizeValue}
                      onChange={(e) => setBusinessSizeValue(e.target.value)}
                      placeholder="Size-specific guidance"
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (businessSizeKey) {
                        addBusinessSizeGuidance(businessSizeKey, businessSizeValue)
                        setBusinessSizeKey('')
                        setBusinessSizeValue('')
                      }
                    }}
                    className="px-3 py-2 bg-pink-600 text-white text-sm rounded hover:bg-pink-700"
                  >
                    Add Size Guidance
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Custom guidance for different business sizes</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Steps - ENHANCED */}
        <div className="border border-teal-200 rounded-lg p-4 bg-teal-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-teal-900">📋 Implementation Action Steps</h3>
            <button
              type="button"
              onClick={addActionStep}
              className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 font-medium"
            >
              + Add Action Step
            </button>
          </div>

          <div className="space-y-6">
            {formData.actionSteps.map((step, index) => (
              <div key={step.id} className="border-2 border-teal-300 rounded-lg p-5 bg-white">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900">Step {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeActionStep(index)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                  >
                    🗑️ Remove Step
                  </button>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phase
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timeframe (Legacy)
                      </label>
                      <input
                        type="text"
                        value={step.timeframe || ''}
                        onChange={(e) => updateActionStep(index, 'timeframe', e.target.value)}
                        placeholder="e.g., 1-2 weeks"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* NEW: Execution Timing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Execution Timing
                      <span className="text-xs text-gray-500 ml-2">
                        (When should this action be executed?)
                      </span>
                    </label>
                    
                    <select
                      value={step.executionTiming || ''}
                      onChange={(e) => updateActionStep(index, 'executionTiming', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select timing...</option>
                      <option value="before_crisis">🛡️ BEFORE Crisis (Preparation/Prevention)</option>
                      <option value="during_crisis">🚨 DURING Crisis (Immediate Response)</option>
                      <option value="after_crisis">🔄 AFTER Crisis (Recovery/Restoration)</option>
                    </select>
                    
                    {/* Helper text based on selected value */}
                    <div className="mt-2 text-xs space-y-2">
                      {!step.executionTiming && (
                        <div className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                          <p className="font-medium mb-1">Choose when to execute this action:</p>
                          <ul className="space-y-1 ml-3">
                            <li><strong>BEFORE:</strong> Preparation - do this NOW (install equipment, train staff, create procedures)</li>
                            <li><strong>DURING:</strong> Crisis response - do this WHEN emergency happens (activate team, evacuate, secure facility)</li>
                            <li><strong>AFTER:</strong> Recovery - do this AFTER crisis passes (assess damage, file claims, restore operations)</li>
                          </ul>
                        </div>
                      )}
                      
                      {step.executionTiming === 'before_crisis' && (
                        <div className="text-blue-700 bg-blue-50 p-3 rounded border border-blue-200">
                          <strong>🛡️ Preparation Action</strong>
                          <p className="mt-1">This will appear in the workbook's "BEFORE (PREPARATION)" section.</p>
                          <p className="mt-1 text-xs">
                            <strong>Good examples:</strong> "Install backup generator", "Train emergency response team", 
                            "Create evacuation plan", "Stock emergency supplies"
                          </p>
                        </div>
                      )}
                      
                      {step.executionTiming === 'during_crisis' && (
                        <div className="text-red-700 bg-red-50 p-3 rounded border border-red-200">
                          <strong>🚨 Crisis Response Action</strong>
                          <p className="mt-1">This will appear in the workbook's "DURING (IMMEDIATE RESPONSE)" section.</p>
                          <p className="mt-1 text-xs">
                            <strong>Good examples:</strong> "Activate emergency team via group text", 
                            "Evacuate building immediately", "Switch to backup generator", "Secure cash and vital records"
                          </p>
                          <p className="mt-1 text-xs font-medium">
                            ⚠️ Write as immediate instructions for WHEN the emergency is happening (imperative voice, specific, fast).
                          </p>
                        </div>
                      )}
                      
                      {step.executionTiming === 'after_crisis' && (
                        <div className="text-green-700 bg-green-50 p-3 rounded border border-green-200">
                          <strong>🔄 Recovery Action</strong>
                          <p className="mt-1">This will appear in the workbook's "AFTER (RECOVERY)" section.</p>
                          <p className="mt-1 text-xs">
                            <strong>Good examples:</strong> "Photograph all damage for insurance", 
                            "Contact insurance company to file claim", "Inspect building systems before reopening", 
                            "Hold team debrief to document lessons learned"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step Title (User-Facing) */}
                  <div>
                    <MultilingualTextInput
                      label="Step Title (User-Facing) 🎯"
                      value={step.title || ''}
                      onChange={(value) => updateActionStep(index, 'title', value)}
                      type="text"
                      required={true}
                      helpText="Clear, action-oriented title that users will see"
                      placeholder="e.g., 'Buy antivirus software for all computers'"
                    />
                  </div>

                  {/* Step Description (User-Facing) */}
                  <div>
                    <MultilingualTextInput
                      label="Step Description (User-Facing) 📝"
                      value={step.description || step.action || ''}
                      onChange={(value) => updateActionStep(index, 'description', value)}
                      type="textarea"
                      required={true}
                      helpText="Detailed, step-by-step instructions in plain language"
                      placeholder="e.g., 'Purchase antivirus software and install it on all business computers...'"
                    />
                  </div>

                  {/* NEW: SME Context Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                      💬 SME Context <span className="ml-2 text-xs bg-blue-200 px-2 py-0.5 rounded">NEW</span>
                    </h5>
                    
                    <div className="space-y-3">
                      <MultilingualTextInput
                        label="Why This Step Matters 🎯"
                        value={step.whyThisStepMatters || ''}
                        onChange={(value) => updateActionStep(index, 'whyThisStepMatters', value)}
                        type="textarea"
                        helpText="Explain the importance in plain language"
                        placeholder="e.g., 'A proper template ensures you don't forget important information...'"
                      />

                      <MultilingualTextInput
                        label="What Happens If Skipped ⚠️"
                        value={step.whatHappensIfSkipped || ''}
                        onChange={(value) => updateActionStep(index, 'whatHappensIfSkipped', value)}
                        type="textarea"
                        helpText="Consequences of not doing this step"
                        placeholder="e.g., 'You'll waste time figuring out what info you need...'"
                      />
                    </div>
                  </div>

                  {/* NEW: Timing & Difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Minutes 🆕
                      </label>
                      <input
                        type="number"
                        value={step.estimatedMinutes || ''}
                        onChange={(e) => updateActionStep(index, 'estimatedMinutes', parseInt(e.target.value) || undefined)}
                        placeholder="e.g., 15"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Actual time in minutes</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty Level 🆕
                      </label>
                      <select
                        value={step.difficultyLevel || 'medium'}
                        onChange={(e) => updateActionStep(index, 'difficultyLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={step.isOptional || false}
                          onChange={(e) => updateActionStep(index, 'isOptional', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                        />
                        <span className="text-sm font-medium">Optional Step</span>
                      </label>
                    </div>
                  </div>

                  {/* NEW: Validation & Completion */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 mb-3 flex items-center">
                      ✓ Completion Criteria <span className="ml-2 text-xs bg-green-200 px-2 py-0.5 rounded">NEW</span>
                    </h5>
                    
                    <div className="space-y-3">
                      <MultilingualTextInput
                        label="How to Know It's Done ✅"
                        value={step.howToKnowItsDone || ''}
                        onChange={(value) => updateActionStep(index, 'howToKnowItsDone', value)}
                        type="textarea"
                        helpText="Clear completion criteria"
                        placeholder="e.g., 'Your template has Name, Phone, WhatsApp, Email fields'"
                      />

                      <MultilingualTextInput
                        label="Example Output 📄"
                        value={step.exampleOutput || ''}
                        onChange={(value) => updateActionStep(index, 'exampleOutput', value)}
                        type="textarea"
                        helpText="What the finished result looks like"
                        placeholder="e.g., 'A simple table with columns for Name, Mobile, WhatsApp...'"
                      />
                    </div>
                  </div>

                  {/* NEW: Budget-Friendly Alternatives */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-900 mb-3 flex items-center">
                      💸 Budget-Friendly Alternatives <span className="ml-2 text-xs bg-yellow-200 px-2 py-0.5 rounded">NEW</span>
                    </h5>
                    
                    <div className="space-y-3">
                      <MultilingualTextInput
                        label="Free Alternative"
                        value={step.freeAlternative || ''}
                        onChange={(value) => updateActionStep(index, 'freeAlternative', value)}
                        type="textarea"
                        helpText="Free or low-cost option"
                        placeholder="e.g., 'Use a simple paper notebook or create a free Google Sheet'"
                      />

                      <MultilingualTextInput
                        label="Low-Tech Option"
                        value={step.lowTechOption || ''}
                        onChange={(value) => updateActionStep(index, 'lowTechOption', value)}
                        type="textarea"
                        helpText="Non-digital alternative"
                        placeholder="e.g., 'Draw a simple table in a notebook'"
                      />
                    </div>
                  </div>

                  {/* Resources & Cost (Existing) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Responsibility</label>
                      <input
                        type="text"
                        value={step.responsibility || ''}
                        onChange={(e) => updateActionStep(index, 'responsibility', e.target.value)}
                        placeholder="e.g., Business Owner"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Resources (comma-separated)</label>
                      <input
                        type="text"
                        value={(step.resources || []).join(', ')}
                        onChange={(e) => updateActionStep(index, 'resources', e.target.value.split(',').map(r => r.trim()))}
                        placeholder="e.g., Equipment, Staff time"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (JMD)</label>
                      <input
                        type="text"
                        value={step.cost || ''}
                        onChange={(e) => updateActionStep(index, 'cost', e.target.value)}
                        placeholder="e.g., JMD $20,000-30,000"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* NEW: Help Resources */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video Tutorial URL 🆕
                      </label>
                      <input
                        type="url"
                        value={step.videoTutorialUrl || ''}
                        onChange={(e) => updateActionStep(index, 'videoTutorialUrl', e.target.value)}
                        placeholder="https://youtube.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        External Resource URL 🆕
                      </label>
                      <input
                        type="url"
                        value={step.externalResourceUrl || ''}
                        onChange={(e) => updateActionStep(index, 'externalResourceUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* NEW: Common Mistakes */}
                  <div>
                    <MultilingualArrayEditor
                      label="Common Mistakes for This Step 🆕"
                      value={step.commonMistakesForStep || []}
                      onChange={(value) => updateActionStep(index, 'commonMistakesForStep', value)}
                      helpText="Step-specific mistakes users often make. Provide warnings in all languages."
                      placeholder="Add a common mistake..."
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.actionSteps.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">No action steps yet</p>
                <p className="text-sm">Click "+ Add Action Step" to create the first step</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information - Enhanced Multilingual Editor */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">SME Guidance Content</h3>
          
          {/* Helpful Tips */}
          <MultilingualArrayEditor
            label="Helpful Tips 💡"
            value={formData.helpfulTips || []}
            onChange={(value) => setFormData(prev => ({ ...prev, helpfulTips: value }))}
            helpText="Practical tips for successful implementation. Add guidance in all three languages."
            placeholder="Add a helpful tip..."
          />

          {/* Common Mistakes */}
          <MultilingualArrayEditor
            label="Common Mistakes ⚠️"
            value={formData.commonMistakes || []}
            onChange={(value) => setFormData(prev => ({ ...prev, commonMistakes: value }))}
            helpText="Mistakes SMEs often make with this strategy. Users will see these as warnings."
            placeholder="Add a common mistake..."
          />

          {/* Success Metrics */}
          <MultilingualArrayEditor
            label="Success Metrics ✓"
            value={formData.successMetrics || []}
            onChange={(value) => setFormData(prev => ({ ...prev, successMetrics: value }))}
            helpText="How users can measure if this strategy is working. Provide clear success indicators."
            placeholder="Add a success metric..."
          />
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
