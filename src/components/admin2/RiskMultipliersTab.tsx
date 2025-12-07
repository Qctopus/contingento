'use client'

import { useState, useEffect } from 'react'
import { RiskMultiplier, MultiplierFormData, CHARACTERISTIC_TYPES, HAZARD_TYPES } from '@/types/multipliers'
import { RISK_TYPES } from '@/types/admin'

export default function RiskMultipliersTab() {
  const [multipliers, setMultipliers] = useState<RiskMultiplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'es' | 'fr'>('en')
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

  // Language labels and flags
  const languageFlags = { en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷' }
  const languageLabels = { en: 'English', es: 'Español', fr: 'Français' }

  // Helper to parse multilingual JSON
  const parseMultilingual = (value: any): Record<'en' | 'es' | 'fr', string> => {
    if (!value) return { en: '', es: '', fr: '' }
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
  const updateMultilingualField = (field: keyof MultiplierFormData, lang: 'en' | 'es' | 'fr', value: string) => {
    const current = parseMultilingual(formData[field])
    current[lang] = value
    setFormData(prev => ({ ...prev, [field]: JSON.stringify(current) }))
  }

  useEffect(() => {
    fetchMultipliers()
  }, [])

  // Scroll to form when editing starts
  useEffect(() => {
    if (editingId && showForm) {
      const scrollToForm = () => {
        const formElement = document.getElementById('multiplier-form')
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
      // Delay to ensure form is rendered
      const timeoutId = setTimeout(scrollToForm, 200)
      return () => clearTimeout(timeoutId)
    }
  }, [editingId, showForm])

  const fetchMultipliers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin2/multipliers')
      const data = await response.json()
      if (data.success) {
        // API returns data.data, but support data.multipliers for backwards compatibility
        setMultipliers(data.data || data.multipliers || [])
      } else {
        setMultipliers([]) // Ensure we always have an array
      }
    } catch (error) {
      console.error('Error fetching multipliers:', error)
      setMultipliers([]) // Ensure we always have an array on error
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

    // Parse multilingual fields
    let wizardQuestion: any = undefined
    let wizardAnswerOptions: any = undefined
    let wizardHelpText: any = undefined

    try {
      if (multiplier.wizardQuestion) {
        wizardQuestion = typeof multiplier.wizardQuestion === 'string'
          ? JSON.parse(multiplier.wizardQuestion)
          : multiplier.wizardQuestion
      }
      if (multiplier.wizardAnswerOptions) {
        wizardAnswerOptions = typeof multiplier.wizardAnswerOptions === 'string'
          ? JSON.parse(multiplier.wizardAnswerOptions)
          : multiplier.wizardAnswerOptions
      }
      if (multiplier.wizardHelpText) {
        wizardHelpText = typeof multiplier.wizardHelpText === 'string'
          ? JSON.parse(multiplier.wizardHelpText)
          : multiplier.wizardHelpText
      }
    } catch (error) {
      console.error('Error parsing multilingual fields:', error)
    }

    setFormData({
      name: multiplier.name,
      description: multiplier.description,
      characteristicType: multiplier.characteristicType,
      conditionType: multiplier.conditionType as 'boolean' | 'threshold' | 'range',
      thresholdValue: multiplier.thresholdValue || undefined,
      minValue: multiplier.minValue || undefined,
      maxValue: multiplier.maxValue || undefined,
      multiplierFactor: multiplier.multiplierFactor,
      applicableHazards: hazards,
      priority: multiplier.priority,
      reasoning: multiplier.reasoning || undefined,
      wizardQuestion: wizardQuestion ? JSON.stringify(wizardQuestion) : undefined,
      wizardAnswerOptions: wizardAnswerOptions ? JSON.stringify(wizardAnswerOptions) : undefined,
      wizardHelpText: wizardHelpText ? JSON.stringify(wizardHelpText) : undefined,
      isActive: multiplier.isActive
    })

    // Ensure form is shown
    setShowForm(true)

    // Scroll to form after render - use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      setTimeout(() => {
        const formElement = document.getElementById('multiplier-form')
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          // Also focus the first input for better UX
          const firstInput = formElement.querySelector('input') as HTMLInputElement
          if (firstInput) {
            firstInput.focus()
          }
        }
      }, 150)
    })
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

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const multiplier = multipliers.find(m => m.id === id)
      if (!multiplier) return

      const response = await fetch('/api/admin2/multipliers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isActive: !currentStatus
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchMultipliers()
      } else {
        alert('Error toggling multiplier status: ' + data.error)
      }
    } catch (error) {
      console.error('Error toggling multiplier:', error)
      alert('Error toggling multiplier')
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
      wizardQuestion: undefined,
      wizardAnswerOptions: undefined,
      wizardHelpText: undefined,
      reasoning: undefined,
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

  // Default wizard questions for each characteristic type
  const DEFAULT_WIZARD_QUESTIONS: Record<string, { question: any, help: any }> = {
    'location_coastal': {
      question: { en: 'Is your business within 5km of the coast?', es: '¿Su negocio está a 5km de la costa?', fr: 'Votre entreprise est-elle à 5km de la côte?' },
      help: { en: 'Coastal businesses may face hurricane, flood, and storm surge risks.', es: 'Los negocios costeros pueden enfrentar riesgos de huracanes, inundaciones y marejadas.', fr: 'Les entreprises côtières peuvent être exposées aux ouragans, inondations et ondes de tempête.' }
    },
    'location_urban': {
      question: { en: 'Is your business in an urban/city area?', es: '¿Su negocio está en un área urbana/ciudad?', fr: 'Votre entreprise est-elle dans une zone urbaine/ville?' },
      help: { en: 'Urban areas have concentrated infrastructure.', es: 'Las áreas urbanas tienen infraestructura concentrada.', fr: 'Les zones urbaines ont des infrastructures concentrées.' }
    },
    'location_flood_prone': {
      question: { en: 'Is your business in a flood-prone area?', es: '¿Su negocio está en un área propensa a inundaciones?', fr: 'Votre entreprise est-elle dans une zone inondable?' },
      help: { en: 'Flood-prone areas face higher risk of water damage.', es: 'Las áreas propensas a inundaciones enfrentan mayor riesgo de daños por agua.', fr: 'Les zones inondables sont exposées à un risque accru de dégâts des eaux.' }
    },
    'tourism_share': {
      question: { en: 'What percentage of your customers are tourists?', es: '¿Qué porcentaje de sus clientes son turistas?', fr: 'Quel pourcentage de vos clients sont des touristes?' },
      help: { en: 'Tourism-dependent businesses are vulnerable when travel is disrupted.', es: 'Los negocios dependientes del turismo son vulnerables cuando se interrumpe el viaje.', fr: 'Les entreprises dépendantes du tourisme sont vulnérables lorsque les voyages sont perturbés.' }
    },
    'power_dependency': {
      question: { en: 'Can your business operate without electricity?', es: '¿Puede su negocio operar sin electricidad?', fr: 'Votre entreprise peut-elle fonctionner sans électricité?' },
      help: { en: 'Power outages are common during hurricanes and storms.', es: 'Los cortes de energía son comunes durante huracanes y tormentas.', fr: 'Les pannes de courant sont fréquentes pendant les ouragans et les tempêtes.' }
    },
    'digital_dependency': {
      question: { en: 'How dependent is your business on digital systems (computers, POS, internet)?', es: '¿Qué tan dependiente es su negocio de sistemas digitales (computadoras, POS, internet)?', fr: 'Dans quelle mesure votre entreprise dépend-elle des systèmes numériques (ordinateurs, TPV, internet)?' },
      help: { en: 'Digital systems are vulnerable to cyber attacks and power outages.', es: 'Los sistemas digitales son vulnerables a ciberataques y cortes de energía.', fr: 'Les systèmes numériques sont vulnérables aux cyberattaques et aux pannes de courant.' }
    },
    'water_dependency': {
      question: { en: 'Does your business require running water?', es: '¿Su negocio requiere agua corriente?', fr: 'Votre entreprise nécessite-t-elle de l\'eau courante?' },
      help: { en: 'Some businesses cannot operate without water access.', es: 'Algunos negocios no pueden operar sin acceso a agua.', fr: 'Certaines entreprises ne peuvent pas fonctionner sans accès à l\'eau.' }
    },
    'perishable_goods': {
      question: { en: 'Do you sell perishable goods (food, flowers, etc.)?', es: '¿Vende productos perecederos (alimentos, flores, etc.)?', fr: 'Vendez-vous des produits périssables (nourriture, fleurs, etc.)?' },
      help: { en: 'Perishable goods require refrigeration and quick turnover.', es: 'Los productos perecederos requieren refrigeración y rotación rápida.', fr: 'Les produits périssables nécessitent une réfrigération et une rotation rapide.' }
    },
    'just_in_time_inventory': {
      question: { en: 'Do you keep minimal inventory (order as needed)?', es: '¿Mantiene inventario mínimo (ordena según sea necesario)?', fr: 'Maintenez-vous un inventaire minimal (commandez au besoin)?' },
      help: { en: 'Just-in-time inventory is vulnerable to supply chain disruptions.', es: 'El inventario justo a tiempo es vulnerable a interrupciones en la cadena de suministro.', fr: 'L\'inventaire juste-à-temps est vulnérable aux perturbations de la chaîne d\'approvisionnement.' }
    },
    'seasonal_business': {
      question: { en: 'Is your revenue seasonal (concentrated in certain months)?', es: '¿Sus ingresos son estacionales (concentrados en ciertos meses)?', fr: 'Vos revenus sont-ils saisonniers (concentrés sur certains mois)?' },
      help: { en: 'Seasonal businesses are vulnerable when disasters occur during peak season.', es: 'Los negocios estacionales son vulnerables cuando ocurren desastres durante la temporada alta.', fr: 'Les entreprises saisonnières sont vulnérables lorsque des catastrophes surviennent pendant la haute saison.' }
    },
    'physical_asset_intensive': {
      question: { en: 'Do you have expensive equipment or machinery?', es: '¿Tiene equipo o maquinaria costosa?', fr: 'Avez-vous des équipements ou des machines coûteux?' },
      help: { en: 'High-value equipment represents significant financial exposure to damage.', es: 'El equipo de alto valor representa una exposición financiera significativa a daños.', fr: 'Les équipements de grande valeur représentent une exposition financière importante aux dommages.' }
    }
  }

  // Auto-populate wizard question when characteristic type changes
  const handleCharacteristicChange = (characteristicType: string) => {
    const defaults = DEFAULT_WIZARD_QUESTIONS[characteristicType]
    const selectedType = CHARACTERISTIC_TYPES.find(ct => ct.value === characteristicType)

    // Always update wizard questions when characteristic type changes
    // If admin is changing the characteristic, they want the questions for that characteristic!
    const newQuestion = defaults ? JSON.stringify(defaults.question) : ''
    const newHelp = defaults ? JSON.stringify(defaults.help) : ''

    setFormData(prev => ({
      ...prev,
      characteristicType,
      conditionType: selectedType?.inputType === 'boolean' ? 'boolean' : 'threshold',
      wizardQuestion: newQuestion,
      wizardHelpText: newHelp
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
        <div id="multiplier-form" className="bg-white border-2 border-blue-300 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Multiplier' : 'Create New Multiplier'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info - Admin Only (English) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Admin Only) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Coastal Hurricane Risk"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">For admin reference only - not shown to users</p>
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
                Description (Admin Only) *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this multiplier represents..."
                rows={2}
                required
              />
              <p className="text-xs text-gray-500 mt-1">For admin reference only - not shown to users</p>
            </div>

            {/* Characteristic Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Characteristic *
                  <span className="text-xs text-gray-500 ml-2">(What business data does this check?)</span>
                </label>
                <select
                  value={formData.characteristicType}
                  onChange={(e) => handleCharacteristicChange(e.target.value)}
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

                {/* Show characteristic info */}
                {selectedCharType && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      ℹ️ Characteristic Info:
                    </p>
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Input Type:</span> {selectedCharType.inputType}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      This determines how the wizard will collect the user's answer (boolean/percentage/etc.)
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

            {/* Wizard Question Content - Multilingual (User-Facing) */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                🧙 Wizard Question (User-Facing - Multilingual)
              </h4>

              {/* Language Selector */}
              <div className="flex space-x-2 mb-4">
                {(['en', 'es', 'fr'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLanguage(lang)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${activeLanguage === lang
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                  >
                    {languageFlags[lang]} {languageLabels[lang]}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question ({languageLabels[activeLanguage]}) *
                  </label>
                  <input
                    type="text"
                    value={parseMultilingual(formData.wizardQuestion)[activeLanguage] || ''}
                    onChange={(e) => updateMultilingualField('wizardQuestion', activeLanguage, e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-purple-50"
                    placeholder={activeLanguage === 'en' ? 'e.g., Can your business operate without electricity?' : activeLanguage === 'es' ? 'ej., ¿Puede su negocio operar sin electricidad?' : 'ex., Votre entreprise peut-elle fonctionner sans électricité?'}
                  />
                  <p className="text-xs text-purple-600 mt-1">This is what users will see in the wizard</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Help Text ({languageLabels[activeLanguage]})
                  </label>
                  <textarea
                    value={parseMultilingual(formData.wizardHelpText)[activeLanguage] || ''}
                    onChange={(e) => updateMultilingualField('wizardHelpText', activeLanguage, e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-purple-50"
                    placeholder={activeLanguage === 'en' ? 'Optional help text to guide users...' : activeLanguage === 'es' ? 'Texto de ayuda opcional para guiar a los usuarios...' : 'Texte d\'aide facultatif pour guider les utilisateurs...'}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reasoning (Admin Only) - Why this multiplier exists
              </label>
              <textarea
                value={formData.reasoning || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, reasoning: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Explain why this characteristic amplifies risk..."
              />
              <p className="text-xs text-gray-500 mt-1">For admin reference only - not shown to users</p>
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

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{multipliers.length}</div>
          <div className="text-sm text-gray-600">Total Multipliers</div>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{multipliers.filter(m => m.isActive).length}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">{multipliers.filter(m => !m.isActive).length}</div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
        <div className="bg-white border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {multipliers.length > 0 ? Math.round(multipliers.reduce((sum, m) => sum + m.multiplierFactor, 0) / multipliers.length * 100) / 100 : 0}
          </div>
          <div className="text-sm text-gray-600">Avg Factor</div>
        </div>
      </div>

      {/* Multipliers List */}
      <div className="space-y-4">
        {multipliers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No multipliers defined yet.</p>
            <p className="text-sm text-gray-500 mt-1">Create your first multiplier to get started.</p>
          </div>
        ) : (
          <>
            {/* Active Multipliers */}
            {multipliers.filter(m => m.isActive).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Active Multipliers ({multipliers.filter(m => m.isActive).length})
                  </h3>
                </div>
                <div className="grid gap-3">
                  {multipliers.filter(m => m.isActive).map(multiplier => {
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
                        className={`bg-white border rounded-lg p-4 ${multiplier.isActive ? 'border-gray-300' : 'border-gray-200 opacity-60'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {multiplier.name}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${multiplier.isActive
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
                              onClick={() => toggleActive(multiplier.id, multiplier.isActive)}
                              className={`px-3 py-1 text-sm rounded transition-colors ${multiplier.isActive
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              title={multiplier.isActive ? 'Click to deactivate' : 'Click to activate'}
                            >
                              {multiplier.isActive ? '❌ Deactivate' : '✅ Activate'}
                            </button>
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
              </div>
            )}

            {/* Inactive Multipliers */}
            {multipliers.filter(m => !m.isActive).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    Inactive Multipliers ({multipliers.filter(m => !m.isActive).length})
                  </h3>
                </div>
                <div className="grid gap-3">
                  {multipliers.filter(m => !m.isActive).map(multiplier => {
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
                        className="bg-white border border-gray-200 rounded-lg p-4 opacity-60"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {multiplier.name}
                              </h4>
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                                Inactive
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

                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-700">Applies to Risks:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {validHazards.length > 0 ? (
                                  validHazards.map((hazard: string) => {
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
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => toggleActive(multiplier.id, multiplier.isActive)}
                              className={`px-3 py-1 text-sm rounded transition-colors ${multiplier.isActive
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              title={multiplier.isActive ? 'Click to deactivate' : 'Click to activate'}
                            >
                              {multiplier.isActive ? '❌ Deactivate' : '✅ Activate'}
                            </button>
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}



