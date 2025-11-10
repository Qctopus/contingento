'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveIndicator } from './AutoSaveIndicator'
import { Strategy, ActionStep } from '../../types/admin'
import { MultilingualArrayEditor } from './MultilingualArrayEditor'
import { MultiCurrencyInput } from './MultiCurrencyInput'
import { ActionStepCostItemSelector } from './ActionStepCostItemSelector'
import { StrategyCostSummary } from './StrategyCostSummary'
import { getLocalizedText } from '@/utils/localizationUtils'

interface StrategyEditorProps {
  strategy?: Strategy | null // If editing existing strategy
  businessTypes: any[]
  onSave: (strategy: Strategy) => void
  onCancel: () => void
  onAutoSave?: (strategy: Strategy) => void // Callback for auto-save updates
}

export function StrategyEditor({ strategy, businessTypes, onSave, onCancel, onAutoSave }: StrategyEditorProps) {
  const [currentTab, setCurrentTab] = useState<'basic' | 'descriptions' | 'actions' | 'guidance'>('basic')
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'es' | 'fr'>('en')
  const [formData, setFormData] = useState<Strategy>({
    id: strategy?.id || '',
    strategyId: strategy?.strategyId || '',
    name: strategy?.name || '',
    category: strategy?.category || 'prevention',
    description: strategy?.description || '',
    smeDescription: strategy?.smeDescription || strategy?.description || '',
    whyImportant: strategy?.whyImportant || `This strategy helps protect your business.`,
    applicableRisks: strategy?.applicableRisks || [],
    implementationCost: strategy?.implementationCost || 'medium',
    implementationTime: strategy?.implementationTime || 'weeks',
    timeToImplement: strategy?.timeToImplement || '',
    effectiveness: strategy?.effectiveness || 5,
    businessTypes: strategy?.businessTypes || [],
    priority: strategy?.priority || 'medium',
    actionSteps: strategy?.actionSteps || [],
    helpfulTips: strategy?.helpfulTips || [],
    commonMistakes: strategy?.commonMistakes || [],
    successMetrics: strategy?.successMetrics || [],
    prerequisites: strategy?.prerequisites || []
  })

  const [editingStep, setEditingStep] = useState<ActionStep | null>(null)
  const [showStepEditor, setShowStepEditor] = useState(false)
  
  // Language labels and flags
  const languageFlags = { en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷' }
  const languageLabels = { en: 'English', es: 'Español', fr: 'Français' }
  
  // Helper to parse multilingual JSON
  const parseMultilingual = (value: any): Record<'en' | 'es' | 'fr', string> => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return { en: value, es: '', fr: '' }
      }
    }
    return value || { en: '', es: '', fr: '' }
  }
  
  // Update formData when strategy prop changes (when editing a different strategy)
  useEffect(() => {
    if (strategy) {
      setFormData({
        id: strategy.id || '',
        strategyId: strategy.strategyId || '',
        name: strategy.name || '',
        category: strategy.category || 'prevention',
        description: strategy.description || '',
        smeDescription: strategy.smeDescription || strategy.description || '',
        whyImportant: strategy.whyImportant || `This strategy helps protect your business.`,
        applicableRisks: strategy.applicableRisks || [],
        implementationCost: strategy.implementationCost || 'medium',
        implementationTime: strategy.implementationTime || 'weeks',
        timeToImplement: strategy.timeToImplement || '',
        effectiveness: strategy.effectiveness || 5,
        businessTypes: strategy.businessTypes || [],
        priority: strategy.priority || 'medium',
        actionSteps: strategy.actionSteps || [],
        helpfulTips: strategy.helpfulTips || [],
        commonMistakes: strategy.commonMistakes || [],
        successMetrics: strategy.successMetrics || [],
        prerequisites: strategy.prerequisites || []
      })
    }
  }, [strategy])
  
  // Helper to update multilingual field
  const updateMultilingualField = (field: keyof Strategy, lang: 'en' | 'es' | 'fr', value: string) => {
    const current = parseMultilingual(formData[field])
    current[lang] = value
    setFormData(prev => ({ ...prev, [field]: JSON.stringify(current) }))
  }

  // Auto-save function using centralized data service
  const saveStrategy = useCallback(async (data: Strategy) => {
    try {
      console.log('📋 StrategyEditor auto-saving via centralDataService:', data.name)
      
      // Validate data before saving to prevent validation errors
      if (!data.name?.trim()) {
        console.log('📋 Skipping auto-save: strategy name is empty')
        return
      }
      
      // Map businessTypes to applicableBusinessTypes for API compatibility
      const strategyDataForApi = {
        ...data,
        applicableBusinessTypes: data.businessTypes || []
      }
      
      // Use centralized data service directly for auto-save
      const { centralDataService } = await import('../../services/centralDataService')
      const savedStrategy = await centralDataService.saveStrategy(strategyDataForApi)
      
      // Notify parent component about auto-save update
      if (onAutoSave) {
        onAutoSave(savedStrategy)
      }
      
      console.log('📋 StrategyEditor auto-save completed successfully')
    } catch (error) {
      console.error('📋 StrategyEditor auto-save failed:', error)
      // Don't throw the error to prevent auto-save retry loops
      // Just log it and stop trying to save this version
    }
  }, [onAutoSave])

  // Use the auto-save hook - only enable if we have a valid strategy with ID
  const { autoSaveStatus, forceSave } = useAutoSave({
    data: formData,
    saveFunction: saveStrategy,
    delay: 1000,
    enabled: !!(formData.id && formData.name) // Only enable if strategy has ID and name
  })

  const categories = [
    { key: 'prevention', name: 'Prevention', icon: '🛡️', description: 'Proactive measures to prevent risks' },
    { key: 'preparation', name: 'Preparation', icon: '📋', description: 'Readiness and planning activities' },
    { key: 'response', name: 'Response', icon: '🚨', description: 'Immediate actions when risks occur' },
    { key: 'recovery', name: 'Recovery', icon: '🔄', description: 'Restoration and business continuity' }
  ]

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

  // Use consistent business type categories
  const businessTypeOptions = [
    { key: 'hospitality', name: 'Hospitality' },
    { key: 'retail', name: 'Retail' },
    { key: 'services', name: 'Services' },
    { key: 'manufacturing', name: 'Manufacturing' },
    { key: 'agriculture', name: 'Agriculture' },
    { key: 'technology', name: 'Technology' },
    { key: 'all', name: 'All Business Types' }
  ]

  const priorityOptions = [
    { key: 'critical', name: 'Critical', description: 'Must do immediately', color: 'red' },
    { key: 'high', name: 'High', description: 'Important to do soon', color: 'orange' },
    { key: 'medium', name: 'Medium', description: 'Good to have', color: 'yellow' },
    { key: 'low', name: 'Low', description: 'Nice to have when possible', color: 'green' }
  ]

  const costOptions = [
    { key: 'low', name: 'Low Cost', jmd: 'Under JMD $10,000', description: 'Minimal investment required' },
    { key: 'medium', name: 'Medium Cost', jmd: 'JMD $10,000 - $50,000', description: 'Moderate investment' },
    { key: 'high', name: 'High Cost', jmd: 'JMD $50,000 - $200,000', description: 'Significant investment' },
    { key: 'very_high', name: 'Very High Cost', jmd: 'Over JMD $200,000', description: 'Major investment required' }
  ]

  const timeOptions = [
    { key: 'hours', name: 'Hours', description: 'Can be done in a few hours' },
    { key: 'days', name: 'Days', description: 'Takes a few days to complete' },
    { key: 'weeks', name: 'Weeks', description: 'Takes several weeks' },
    { key: 'months', name: 'Months', description: 'Long-term implementation' }
  ]

  // Generate strategy ID when name changes
  useEffect(() => {
    if (formData.name && !strategy) {
      const id = formData.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50)
      setFormData(prev => ({ ...prev, strategyId: id }))
    }
  }, [formData.name, strategy])

  // Note: Cost estimates are now calculated from action step cost items
  // The implementationCost field is kept as a categorical reference only

  const handleSave = async () => {
    try {
      // Ensure strategy has proper IDs
      if (!formData.id) {
        const newId = `strategy_${Date.now()}`
        const updatedFormData = {
          ...formData,
          id: newId,
          strategyId: formData.strategyId || formData.name.toLowerCase().replace(/\s+/g, '_')
        }
        setFormData(updatedFormData)
      }
      
      // Force immediate save but STAY in editor for continued editing
      await forceSave()
      
      // For manual saves, notify parent but don't close editor
      // Map businessTypes to applicableBusinessTypes for parent consistency
      const strategyForParent = {
        ...formData,
        applicableBusinessTypes: formData.businessTypes || []
      }
      onSave(strategyForParent)
      
      console.log('✅ Strategy manually saved - staying in editor for continued editing')
    } catch (error) {
      console.error('Failed to save strategy:', error)
      alert('Failed to save strategy. Please try again.')
    }
  }

  const handleAddStep = () => {
    const newStep: ActionStep = {
      id: `step_${Date.now()}`,
      phase: 'immediate',
      title: '',
      action: '',
      description: '',
      smeAction: '',
      timeframe: '',
      responsibility: 'Business Owner',
      resources: [],
      costItems: [],
      checklist: []
    }
    setEditingStep(newStep)
    setShowStepEditor(true)
  }

  const handleEditStep = (step: ActionStep) => {
    setEditingStep(step)
    setShowStepEditor(true)
  }

  const handleSaveStep = (step: ActionStep) => {
    if (step.id && formData.actionSteps.find(s => s.id === step.id)) {
      // Update existing step
      setFormData(prev => ({
        ...prev,
        actionSteps: prev.actionSteps.map(s => s.id === step.id ? step : s)
      }))
    } else {
      // Add new step
      setFormData(prev => ({
        ...prev,
        actionSteps: [...prev.actionSteps, { ...step, id: step.id || `step_${Date.now()}` }]
      }))
    }
    setShowStepEditor(false)
    setEditingStep(null)
  }

  const handleDeleteStep = (stepId: string) => {
    setFormData(prev => ({
      ...prev,
      actionSteps: prev.actionSteps.filter(s => s.id !== stepId)
    }))
  }

  const addListItem = (field: keyof Strategy, item: string) => {
    if (item.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), item.trim()]
      }))
    }
  }

  const removeListItem = (field: keyof Strategy, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const isValid = () => {
    // Check if multilingual fields have at least English content
    const nameObj = parseMultilingual(formData.name)
    const descObj = parseMultilingual(formData.description)
    
    return nameObj.en?.trim() && 
           descObj.en?.trim()
  }

  const tabs = [
    { key: 'basic', name: 'Basic Info', icon: '📋', description: 'Name, category, costs, effectiveness' },
    { key: 'descriptions', name: 'Descriptions', icon: '📝', description: 'Technical and SME descriptions' },
    { key: 'actions', name: 'Action Steps', icon: '🔧', description: 'Implementation steps and timeline' },
    { key: 'guidance', name: 'Guidance', icon: '💡', description: 'Tips, mistakes, success metrics' }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {strategy ? 'Edit Strategy' : 'Create New Strategy'}
            </h2>
            <AutoSaveIndicator autoSaveStatus={autoSaveStatus} />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              ← Back to Overview
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid()}
              className={`px-6 py-2 rounded-lg font-medium ${
                isValid()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              💾 Save & Continue Editing
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  currentTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {currentTab === 'basic' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            {/* Language Selector */}
            <div className="flex space-x-2 mb-4">
              {(['en', 'es', 'fr'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    activeLanguage === lang
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {languageFlags[lang]} {languageLabels[lang]}
                </button>
              ))}
            </div>
            
            {/* Strategy Name and ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strategy Name ({languageLabels[activeLanguage]}) *
                </label>
                <input
                  type="text"
                  value={parseMultilingual(formData.name)[activeLanguage] || ''}
                  onChange={(e) => updateMultilingualField('name', activeLanguage, e.target.value)}
                  placeholder={activeLanguage === 'en' ? 'e.g., Backup Power Generator System' : activeLanguage === 'es' ? 'ej., Sistema de Generador de Energía de Respaldo' : 'ex., Système de Générateur d\'Énergie de Secours'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strategy ID
                </label>
                <input
                  type="text"
                  value={formData.strategyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, strategyId: e.target.value }))}
                  placeholder="Auto-generated from name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(category => (
                    <button
                      key={category.key}
                      onClick={() => setFormData(prev => ({ ...prev, category: category.key as any }))}
                      className={`p-3 text-left border rounded-lg transition-all ${
                        formData.category === category.key
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level *
                </label>
                <div className="space-y-2">
                  {priorityOptions.map(priority => (
                    <button
                      key={priority.key}
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority.key as any }))}
                      className={`w-full p-3 text-left border rounded-lg transition-all ${
                        formData.priority === priority.key
                          ? `border-${priority.color}-500 bg-${priority.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{priority.name}</div>
                      <p className="text-xs text-gray-600">{priority.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cost and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💰 Total Implementation Cost
                </label>
                <StrategyCostSummary
                  strategy={{
                    id: formData.id,
                    name: getLocalizedText(formData.name, 'en') || 'Strategy',
                    actionSteps: formData.actionSteps
                  }}
                  countryCode="JM"
                  showDetailed={false}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Cost is automatically calculated from action step cost items. Add cost items to action steps to see the total.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Implementation Time *
                </label>
                <div className="space-y-2">
                  {timeOptions.map(time => (
                    <button
                      key={time.key}
                      onClick={() => setFormData(prev => ({ ...prev, implementationTime: time.key as any }))}
                      className={`w-full p-3 text-left border rounded-lg transition-all ${
                        formData.implementationTime === time.key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{time.name}</div>
                      <p className="text-xs text-gray-600">{time.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Effectiveness Only (ROI removed) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effectiveness (1-10) *
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.effectiveness}
                    onChange={(e) => setFormData(prev => ({ ...prev, effectiveness: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold text-blue-600 w-8">{formData.effectiveness}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            {/* Applicable Risks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable Risk Types *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {riskTypes.map(risk => (
                  <button
                    key={risk.key}
                    onClick={() => {
                      const currentRisks = formData.applicableRisks
                      const isSelected = currentRisks.includes(risk.key)
                      setFormData(prev => ({
                        ...prev,
                        applicableRisks: isSelected
                          ? currentRisks.filter(r => r !== risk.key)
                          : [...currentRisks, risk.key]
                      }))
                    }}
                    className={`p-3 text-left border rounded-lg transition-all ${
                      formData.applicableRisks.includes(risk.key)
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{risk.icon}</span>
                      <span className="font-medium">{risk.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Business Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable Business Types
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {businessTypeOptions.map(type => (
                  <button
                    key={type.key}
                    onClick={() => {
                      const currentTypes = formData.businessTypes
                      const isSelected = currentTypes.includes(type.key)
                      setFormData(prev => ({
                        ...prev,
                        businessTypes: isSelected
                          ? currentTypes.filter(t => t !== type.key)
                          : [...currentTypes, type.key]
                      }))
                    }}
                    className={`p-3 text-left border rounded-lg transition-all ${
                      formData.businessTypes.includes(type.key)
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'descriptions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Descriptions</h3>
            
            {/* Language Selector */}
            <div className="flex space-x-2 mb-4">
              {(['en', 'es', 'fr'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    activeLanguage === lang
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {languageFlags[lang]} {languageLabels[lang]}
                </button>
              ))}
            </div>
            
            {/* Technical Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technical Description ({languageLabels[activeLanguage]}) *
              </label>
              <textarea
                value={parseMultilingual(formData.description)[activeLanguage] || ''}
                onChange={(e) => updateMultilingualField('description', activeLanguage, e.target.value)}
                placeholder={activeLanguage === 'en' ? 'Detailed technical description of the strategy for admin reference...' : activeLanguage === 'es' ? 'Descripción técnica detallada de la estrategia para referencia administrativa...' : 'Description technique détaillée de la stratégie pour référence administrative...'}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Use technical language and detailed specifications</p>
            </div>

            {/* SME Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SME Description ({languageLabels[activeLanguage]}) - Simple Language *
              </label>
              <textarea
                value={parseMultilingual(formData.smeDescription)[activeLanguage] || ''}
                onChange={(e) => updateMultilingualField('smeDescription', activeLanguage, e.target.value)}
                placeholder={activeLanguage === 'en' ? 'Simple, clear explanation that a mom-and-pop store owner can understand...' : activeLanguage === 'es' ? 'Explicación simple y clara que el dueño de una pequeña tienda pueda entender...' : 'Explication simple et claire qu\'un propriétaire de petite boutique peut comprendre...'}
                rows={4}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
              />
              <p className="text-xs text-blue-600 mt-1">Use simple language, avoid jargon, explain like talking to a neighbor</p>
            </div>

            {/* Why Important */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why This Matters ({languageLabels[activeLanguage]}) *
              </label>
              <textarea
                value={parseMultilingual(formData.whyImportant)[activeLanguage] || ''}
                onChange={(e) => updateMultilingualField('whyImportant', activeLanguage, e.target.value)}
                placeholder={activeLanguage === 'en' ? 'Explain in simple terms why this strategy is important for protecting their business and livelihood...' : activeLanguage === 'es' ? 'Explique en términos simples por qué esta estrategia es importante para proteger su negocio y sustento...' : 'Expliquez en termes simples pourquoi cette stratégie est importante pour protéger leur entreprise et leur subsistance...'}
                rows={3}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
              />
              <p className="text-xs text-green-600 mt-1">Focus on business value, financial protection, and peace of mind</p>
            </div>

            {/* Time Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User-Friendly Time Description
              </label>
              <input
                type="text"
                value={formData.timeToImplement}
                onChange={(e) => setFormData(prev => ({ ...prev, timeToImplement: e.target.value }))}
                placeholder="e.g., 2-4 weeks"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Precise costs are calculated from action step cost items. This field is for general time guidance only.
              </p>
            </div>
          </div>
        )}

        {currentTab === 'actions' && (
          <div className="space-y-6">
            {/* Cost Summary at the top - ALWAYS SHOW */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>💰</span>
                <span>Strategy Cost Calculation</span>
              </h3>
              {formData.actionSteps.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">No action steps yet</p>
                  <p className="text-sm text-gray-500">
                    Add action steps with cost items to see the total strategy cost
                  </p>
                </div>
              ) : (
                <StrategyCostSummary
                  strategy={{
                    id: formData.id,
                    name: getLocalizedText(formData.name, 'en') || 'Strategy',
                    actionSteps: formData.actionSteps
                  }}
                  countryCode="JM"
                  showDetailed={true}
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Action Steps</h3>
              <button
                onClick={handleAddStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Action Step
              </button>
            </div>

            {formData.actionSteps.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <span className="text-4xl mb-4 block">📋</span>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Action Steps Yet</h4>
                <p className="text-gray-600 mb-4">Add implementation steps to guide SME users</p>
                <button
                  onClick={handleAddStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add First Step
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {['before_crisis', 'during_crisis', 'after_crisis'].map(timing => {
                  const timingSteps = formData.actionSteps.filter(step => step.executionTiming === timing)
                  if (timingSteps.length === 0) return null

                  const timingConfig = {
                    before_crisis: { name: '🛡️ BEFORE Crisis (Prevention & Preparation)', icon: '🛡️', description: 'Actions to prepare and prevent crises', color: 'blue' },
                    during_crisis: { name: '⚡ DURING Crisis (Response)', icon: '⚡', description: 'Actions to take when crisis is happening', color: 'orange' },
                    after_crisis: { name: '🔄 AFTER Crisis (Recovery)', icon: '🔄', description: 'Actions for recovery and restoration', color: 'green' }
                  }[timing] || { name: timing, icon: '📋', description: '', color: 'gray' }

                  const borderColor = {
                    blue: 'border-blue-300 bg-blue-50',
                    orange: 'border-orange-300 bg-orange-50',
                    green: 'border-green-300 bg-green-50',
                    gray: 'border-gray-300 bg-gray-50'
                  }[timingConfig.color]

                  return (
                    <div key={timing} className={`border-2 rounded-lg p-6 ${borderColor}`}>
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">{timingConfig.icon}</span>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{timingConfig.name}</h4>
                          <p className="text-sm text-gray-700">{timingConfig.description}</p>
                        </div>
                        <div className="ml-auto text-sm font-medium text-gray-700">
                          {timingSteps.length} step{timingSteps.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {timingSteps.map((step, index) => {
                          const stepTitle = getLocalizedText(step.title || step.smeAction || step.action, 'en')
                          const stepDesc = getLocalizedText(step.description || step.smeAction || step.action, 'en')
                          
                          return (
                          <div key={step.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900">
                                {stepTitle}
                              </h5>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditStep(step)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteStep(step.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Timeframe:</span> {step.timeframe || 'Not set'}
                              </div>
                              <div>
                                <span className="font-medium">Responsibility:</span> {step.responsibility || 'Not set'}
                              </div>
                            </div>
                            {step.costItems && step.costItems.length > 0 && (
                              <div className="text-xs text-blue-600 mt-2">
                                💰 {step.costItems.length} cost item{step.costItems.length !== 1 ? 's' : ''} assigned
                              </div>
                            )}
                            {stepDesc && stepDesc !== stepTitle && (
                              <p className="text-sm text-gray-600 mt-2">{stepDesc}</p>
                            )}
                          </div>
                        )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {currentTab === 'guidance' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>💡</span>
                <span>SME Guidance Content - Multilingual</span>
              </h3>
              <p className="text-sm text-gray-600">
                Provide helpful guidance to SMEs in all three languages. Click the language tabs to switch between EN/ES/FR.
              </p>
            </div>
            
            {/* Helpful Tips */}
            <MultilingualArrayEditor
              label="Helpful Tips 💡"
              value={formData.helpfulTips || []}
              onChange={(value) => {
                // Parse the value as it could be a string or already parsed
                const parsedValue = typeof value === 'string' ? value : JSON.stringify(value)
                setFormData(prev => ({ ...prev, helpfulTips: parsedValue as any }))
              }}
              helpText="Practical tips for successful implementation. Add guidance in all three languages."
              placeholder="Add a helpful tip..."
            />

            {/* Common Mistakes */}
            <MultilingualArrayEditor
              label="Common Mistakes ⚠️"
              value={formData.commonMistakes || []}
              onChange={(value) => {
                const parsedValue = typeof value === 'string' ? value : JSON.stringify(value)
                setFormData(prev => ({ ...prev, commonMistakes: parsedValue as any }))
              }}
              helpText="Mistakes SMEs often make with this strategy. Users will see these as warnings."
              placeholder="Add a common mistake..."
            />

            {/* Success Metrics */}
            <MultilingualArrayEditor
              label="Success Metrics ✓"
              value={formData.successMetrics || []}
              onChange={(value) => {
                const parsedValue = typeof value === 'string' ? value : JSON.stringify(value)
                setFormData(prev => ({ ...prev, successMetrics: parsedValue as any }))
              }}
              helpText="How users can measure if this strategy is working. Provide clear success indicators."
              placeholder="Add a success metric..."
            />

            {/* Prerequisites */}
            <MultilingualArrayEditor
              label="Prerequisites 📋"
              value={formData.prerequisites || []}
              onChange={(value) => {
                const parsedValue = typeof value === 'string' ? value : JSON.stringify(value)
                setFormData(prev => ({ ...prev, prerequisites: parsedValue as any }))
              }}
              helpText="What SMEs need to have in place before starting this strategy."
              placeholder="Add a prerequisite..."
            />
          </div>
        )}
      </div>

      {/* Action Step Editor Modal */}
      {showStepEditor && editingStep && (
        <ActionStepEditor
          step={editingStep}
          onSave={handleSaveStep}
          onCancel={() => {
            setShowStepEditor(false)
            setEditingStep(null)
          }}
        />
      )}
    </div>
  )
}

// Action Step Editor Component
interface ActionStepEditorProps {
  step: ActionStep
  onSave: (step: ActionStep) => void
  onCancel: () => void
}

function ActionStepEditor({ step, onSave, onCancel }: ActionStepEditorProps) {
  const [stepData, setStepData] = useState<ActionStep>(step)
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'es' | 'fr'>('en')

  // Language labels and flags
  const languageFlags = { en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷' }
  const languageLabels = { en: 'English', es: 'Español', fr: 'Français' }
  
  // Helper to parse multilingual JSON
  const parseMultilingual = (value: any): Record<'en' | 'es' | 'fr', string> => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return { en: value, es: '', fr: '' }
      }
    }
    return value || { en: '', es: '', fr: '' }
  }
  
  // Helper to update multilingual field
  const updateMultilingualStepField = (field: keyof ActionStep, lang: 'en' | 'es' | 'fr', value: string) => {
    const current = parseMultilingual(stepData[field])
    current[lang] = value
    setStepData(prev => ({ ...prev, [field]: JSON.stringify(current) }))
  }

  const phaseOptions = [
    { key: 'immediate', name: 'Immediate', description: 'Right now (this week)' },
    { key: 'short_term', name: 'Short-term', description: 'Next 1-4 weeks' },
    { key: 'medium_term', name: 'Medium-term', description: 'Next 1-3 months' },
    { key: 'long_term', name: 'Long-term', description: 'Next 3-12 months' }
  ]

  const responsibilityOptions = [
    'Business Owner', 'Manager', 'Employee', 'Family Member', 
    'Professional Contractor', 'Insurance Agent', 'Government Agency', 'Supplier/Vendor'
  ]

  const addResource = (resource: string) => {
    if (resource.trim()) {
      setStepData(prev => ({
        ...prev,
        resources: [...prev.resources, resource.trim()]
      }))
    }
  }

  const removeResource = (index: number) => {
    setStepData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }))
  }

  const addChecklistItem = (item: string) => {
    if (item.trim()) {
      setStepData(prev => ({
        ...prev,
        checklist: [...(prev.checklist || []), item.trim()]
      }))
    }
  }

  const removeChecklistItem = (index: number) => {
    setStepData(prev => ({
      ...prev,
      checklist: (prev.checklist || []).filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {step.id ? 'Edit Action Step' : 'Add Action Step'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Phase Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Implementation Phase *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {phaseOptions.map(phase => (
                  <button
                    key={phase.key}
                    onClick={() => setStepData(prev => ({ ...prev, phase: phase.key as any }))}
                    className={`p-3 text-left border rounded-lg transition-all ${
                      stepData.phase === phase.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{phase.name}</div>
                    <p className="text-xs text-gray-600">{phase.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex space-x-2">
              {(['en', 'es', 'fr'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    activeLanguage === lang
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {languageFlags[lang]} {languageLabels[lang]}
                </button>
              ))}
            </div>

            {/* Action Descriptions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Step Title ({languageLabels[activeLanguage]}) *
                </label>
                <input
                  type="text"
                  value={parseMultilingual(stepData.title)[activeLanguage] || ''}
                  onChange={(e) => updateMultilingualStepField('title', activeLanguage, e.target.value)}
                  placeholder={activeLanguage === 'en' ? 'e.g., Install storm shutters' : activeLanguage === 'es' ? 'ej., Instalar persianas contra tormentas' : 'ex., Installer des volets anti-tempête'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Description ({languageLabels[activeLanguage]}) *
                </label>
                <textarea
                  value={parseMultilingual(stepData.description)[activeLanguage] || ''}
                  onChange={(e) => updateMultilingualStepField('description', activeLanguage, e.target.value)}
                  placeholder={activeLanguage === 'en' ? 'Technical description for admin reference...' : activeLanguage === 'es' ? 'Descripción técnica para referencia administrativa...' : 'Description technique pour référence administrative...'}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    parseMultilingual(stepData.description)[activeLanguage] ? 'text-gray-900' : 'text-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SME Action Description ({languageLabels[activeLanguage]}) - Simple Language *
                </label>
                <textarea
                  value={parseMultilingual(stepData.smeAction)[activeLanguage] || ''}
                  onChange={(e) => updateMultilingualStepField('smeAction', activeLanguage, e.target.value)}
                  placeholder={activeLanguage === 'en' ? 'Simple, clear description for SME users...' : activeLanguage === 'es' ? 'Descripción simple y clara para usuarios PYME...' : 'Description simple et claire pour les utilisateurs PME...'}
                  rows={3}
                  className={`w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50 ${
                    parseMultilingual(stepData.smeAction)[activeLanguage] ? 'text-gray-900' : 'text-gray-400'
                  }`}
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeframe *
                </label>
                <input
                  type="text"
                  value={stepData.timeframe}
                  onChange={(e) => setStepData(prev => ({ ...prev, timeframe: e.target.value }))}
                  placeholder="e.g., 2-3 days"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibility *
                </label>
                <select
                  value={stepData.responsibility}
                  onChange={(e) => setStepData(prev => ({ ...prev, responsibility: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {responsibilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cost Items Selector */}
            <ActionStepCostItemSelector
              actionStepId={stepData.id}
              selectedItems={stepData.costItems || []}
              onItemsChange={(items) => setStepData(prev => ({ ...prev, costItems: items }))}
              countryCode="JM"
            />

            {/* Resources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                📦 Resources Needed
                <span className="text-xs font-normal text-gray-500">(e.g., equipment, materials, tools)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                {stepData.resources.map((resource, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                    <span className="text-sm flex-1">{resource}</span>
                    <button
                      onClick={() => removeResource(index)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="e.g., power drill, safety equipment, concrete..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    addResource(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 List physical items or materials needed to complete this step. Press Enter to add each item.
              </p>
            </div>

            {/* Checklist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                ✅ SME Implementation Checklist
                <span className="text-xs font-normal text-gray-500">(Simple step-by-step instructions)</span>
              </label>
              <div className="space-y-2 mb-2">
                {(stepData.checklist || []).map((item, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-sm text-green-800 flex-1">{item}</span>
                    <button
                      onClick={() => removeChecklistItem(index)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="e.g., Check local regulations, Measure installation area, Contact supplier..."
                className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    addChecklistItem(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Break down this step into simple tasks an SME can follow. These will show in the business plan wizard. Press Enter to add each task.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(stepData)}
              disabled={!stepData.action || !stepData.smeAction || !stepData.timeframe}
              className={`px-6 py-2 rounded-lg font-medium ${
                stepData.action && stepData.smeAction && stepData.timeframe
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Step
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

