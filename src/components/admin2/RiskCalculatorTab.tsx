'use client'

import { useState, useEffect } from 'react'
import { getLocalizedText } from '@/utils/localizationUtils'

interface Country {
  id: string
  name: string
  code: string
}

interface AdminUnit {
  id: string
  name: string
  countryId: string
}

interface RiskProfile {
  hurricane: number
  flood: number
  earthquake: number
  drought: number
  landslide: number
  power_outage: number
  fire: number
  cyber_attack: number
  terrorism: number
  pandemic_disease: number
  economic_downturn: number
  supply_chain_disruption: number
  civil_unrest: number
}

interface BusinessType {
  id: string
  name: string
  category: string
  riskVulnerabilities?: any
}

interface RiskMultiplier {
  id: string
  name: string
  characteristicType: string
  conditionType: string
  thresholdValue?: number
  minValue?: number
  maxValue?: number
  multiplierFactor: number
  applicableHazards: string[]
  wizardQuestion?: string
  wizardAnswerOptions?: string
  wizardHelpText?: string
  isActive: boolean
}

interface Strategy {
  id: string
  name: string
  applicableRisks: string[]
  recommendedForBusinessTypes: string[]
}

interface RiskScore {
  riskType: string
  locationRisk: number
  businessVulnerability: number
  baseScore: number
  appliedMultipliers: { name: string, factor: number }[]
  finalScore: number
  isPreselected: boolean
}

const RISK_TYPES = [
  'hurricane', 'flood', 'earthquake', 'drought', 'landslide',
  'power_outage', 'fire', 'cyber_attack', 'terrorism',
  'pandemic_disease', 'economic_downturn', 'supply_chain_disruption', 'civil_unrest'
]

const THRESHOLD = 6

export default function RiskCalculatorTab() {
  const [countries, setCountries] = useState<Country[]>([])
  const [adminUnits, setAdminUnits] = useState<AdminUnit[]>([])
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [multipliers, setMultipliers] = useState<RiskMultiplier[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [error, setError] = useState<string | null>(null)

  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedBusinessType, setSelectedBusinessType] = useState('')
  const [multiplierAnswers, setMultiplierAnswers] = useState<Record<string, any>>({})

  const [riskScores, setRiskScores] = useState<RiskScore[]>([])
  const [recommendedStrategies, setRecommendedStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use fetch without cache for development/debugging
      const fetchOptions: RequestInit = {
        cache: 'no-store'
      }

      const [countriesRes, businessTypesRes, multipliersRes, strategiesRes] = await Promise.all([
        fetch('/api/admin2/countries', fetchOptions),
        fetch('/api/admin2/business-types', fetchOptions),
        fetch('/api/admin2/multipliers?locale=en', fetchOptions),
        fetch('/api/admin2/strategies', fetchOptions)
      ])

      const countriesData = await countriesRes.json()
      const businessTypesData = await businessTypesRes.json()
      const multipliersData = await multipliersRes.json()
      const strategiesData = await strategiesRes.json()

      console.log('🌍 Countries API response:', {
        success: countriesData.success,
        hasData: !!countriesData.data,
        hasCountries: !!countriesData.countries,
        dataLength: countriesData.data?.length || 0,
        countriesLength: countriesData.countries?.length || 0
      })

      if (countriesData.success) {
        // Handle both response formats: { success, data } and { success, countries }
        const countryList = countriesData.data || countriesData.countries || []
        console.log('🌍 Setting countries:', countryList.length)
        if (countryList.length > 0) {
          console.log('🌍 First country:', countryList[0])
        }
        setCountries(countryList)
      } else {
        setCountries([])
      }

      if (businessTypesData.success) {
        const btList = businessTypesData.data || businessTypesData.businessTypes || []
        setBusinessTypes(btList)
      } else {
        setBusinessTypes([])
      }

      if (multipliersData.success) {
        const multiplierList = multipliersData.data || []
        const activeMultipliers = multiplierList.filter((m: RiskMultiplier) => m.isActive)
        setMultipliers(activeMultipliers)
      } else {
        setMultipliers([])
      }

      if (strategiesData.success) {
        const stratList = strategiesData.data || strategiesData.strategies || []
        setStrategies(stratList)
      } else {
        setStrategies([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data. Please refresh the page.')
      // Set empty arrays as fallback
      setCountries([])
      setBusinessTypes([])
      setMultipliers([])
      setStrategies([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminUnits = async (countryId: string) => {
    try {
      const response = await fetch(`/api/admin2/admin-units?countryId=${countryId}`, {
        next: { revalidate: 300 } // Cache for 5 minutes
      })
      const data = await response.json()

      console.log('📍 Admin Units API response:', {
        success: data.success,
        hasData: !!data.data,
        hasAdminUnits: !!data.adminUnits,
        dataLength: data.data?.length || 0,
        adminUnitsLength: data.adminUnits?.length || 0
      })

      if (data.success) {
        // Handle both response formats: { success, data } and { success, adminUnits }
        const unitList = data.data || data.adminUnits || []
        console.log('📍 Setting admin units:', unitList.length)
        setAdminUnits(unitList)
      }
    } catch (error) {
      console.error('Error fetching admin units:', error)
    }
  }

  const handleCountryChange = (countryId: string) => {
    setSelectedCountry(countryId)
    setSelectedUnit('')
    setAdminUnits([])
    if (countryId) {
      fetchAdminUnits(countryId)
    }
  }



  const calculateRisks = async () => {
    if (!selectedUnit || !selectedBusinessType) {
      alert('Please select both location and business type')
      return
    }

    try {
      // Fetch admin unit risk profile
      const unitResponse = await fetch(`/api/admin2/admin-units?countryId=${selectedCountry}`)
      const unitData = await unitResponse.json()

      // Handle both response formats
      const unitList = unitData.data || unitData.adminUnits || []
      const unit = unitList.find((u: any) => u.id === selectedUnit)

      if (!unit) {
        alert('Selected location not found')
        return
      }

      // Parse risk data from adminUnitRisk
      let locationRisks: Record<string, number> = {}

      if (unit.adminUnitRisk) {
        // Map database fields to risk type keys
        locationRisks = {
          hurricane: unit.adminUnitRisk.hurricaneLevel || 0,
          flood: unit.adminUnitRisk.floodLevel || 0,
          earthquake: unit.adminUnitRisk.earthquakeLevel || 0,
          drought: unit.adminUnitRisk.droughtLevel || 0,
          landslide: unit.adminUnitRisk.landslideLevel || 0,
          power_outage: unit.adminUnitRisk.powerOutageLevel || 0,
          fire: 0, // Not in DB, default to 0
          cyber_attack: 0, // Not in DB, default to 0
          terrorism: 0, // Not in DB, default to 0
          pandemic_disease: 0, // Not in DB, default to 0
          economic_downturn: 0, // Not in DB, default to 0
          supply_chain_disruption: 0, // Not in DB, default to 0
          civil_unrest: 0 // Not in DB, default to 0
        }

        // Also try to parse riskProfileJson if it exists
        try {
          if (unit.adminUnitRisk.riskProfileJson && unit.adminUnitRisk.riskProfileJson !== '{}') {
            const parsedProfile = JSON.parse(unit.adminUnitRisk.riskProfileJson)

            // The JSON format is: { "fire": { "level": 3, "notes": "..." }, ... }
            // We need to extract just the level values and map camelCase to snake_case
            const keyMapping: Record<string, string> = {
              'fire': 'fire',
              'cyberAttack': 'cyber_attack',
              'terrorism': 'terrorism',
              'pandemicDisease': 'pandemic_disease',
              'economicDownturn': 'economic_downturn',
              'supplyChainDisruption': 'supply_chain_disruption',
              'civilUnrest': 'civil_unrest'
            }

            Object.entries(parsedProfile).forEach(([key, value]: [string, any]) => {
              if (value && typeof value === 'object' && 'level' in value) {
                const mappedKey = keyMapping[key] || key
                locationRisks[mappedKey] = value.level
              }
            })
          }
        } catch (error) {
          console.error('Error parsing riskProfileJson:', error)
        }
      } else {
        console.warn('No adminUnitRisk found for unit:', unit.name)
      }
      const businessType = businessTypes.find(bt => bt.id === selectedBusinessType)

      if (!businessType) return

      // Parse business vulnerabilities
      let vulnerabilities: Record<string, number> = {}
      if (businessType.riskVulnerabilities) {
        try {
          vulnerabilities = typeof businessType.riskVulnerabilities === 'string'
            ? JSON.parse(businessType.riskVulnerabilities)
            : businessType.riskVulnerabilities
        } catch (error) {
          console.error('Error parsing vulnerabilities:', error)
        }
      }

      // Calculate risk scores for each risk type
      const scores: RiskScore[] = RISK_TYPES.map(riskType => {
        const locationRisk = locationRisks[riskType] || 0
        const businessVulnerability = vulnerabilities[riskType] || 5 // default medium

        // Base score: weighted average
        const baseScore = (locationRisk * 0.6) + (businessVulnerability * 0.4)

        // Apply multipliers
        const appliedMultipliers: { name: string, factor: number }[] = []
        let finalScore = baseScore

        multipliers.forEach(multiplier => {
          // Check if this multiplier applies to this risk type
          const hazardKey = riskType.toLowerCase().replace(/_/g, '')
          const multiplierHazards = (multiplier.applicableHazards || []).map(h => h.toLowerCase().replace(/_/g, ''))

          if (!multiplierHazards.includes(hazardKey)) return

          // Check if condition is met
          const answer = multiplierAnswers[multiplier.id]
          let conditionMet = false

          if (multiplier.conditionType === 'boolean') {
            conditionMet = answer === true || answer === 'true' || answer === 'yes'
          } else if (multiplier.conditionType === 'threshold' && typeof answer === 'number') {
            if (multiplier.thresholdValue !== undefined) {
              conditionMet = answer >= multiplier.thresholdValue
            }
          } else if (multiplier.conditionType === 'range' && typeof answer === 'number') {
            if (multiplier.minValue !== undefined && multiplier.maxValue !== undefined) {
              conditionMet = answer >= multiplier.minValue && answer <= multiplier.maxValue
            }
          }

          if (conditionMet) {
            appliedMultipliers.push({
              name: multiplier.name,
              factor: multiplier.multiplierFactor
            })
            finalScore *= multiplier.multiplierFactor
          }
        })

        // Cap final score at 10
        finalScore = Math.min(finalScore, 10)

        return {
          riskType,
          locationRisk,
          businessVulnerability,
          baseScore: Math.round(baseScore * 10) / 10,
          appliedMultipliers,
          finalScore: Math.round(finalScore * 10) / 10,
          isPreselected: finalScore >= THRESHOLD || locationRisk >= 5
        }
      })

      setRiskScores(scores)

      // Find recommended strategies
      const preselectedRisks = scores.filter(s => s.isPreselected).map(s => s.riskType)
      const recommended = strategies.filter(strategy => {
        // Check if strategy applies to any preselected risk
        const appliesToRisk = (strategy.applicableRisks || []).some(risk =>
          preselectedRisks.includes(risk.toLowerCase().replace(/ /g, '_'))
        )

        // Check if strategy is recommended for this business type
        const appliesToBusinessType = (strategy.recommendedForBusinessTypes || []).length === 0 ||
          (strategy.recommendedForBusinessTypes || []).includes(selectedBusinessType)

        return appliesToRisk && appliesToBusinessType
      })

      setRecommendedStrategies(recommended)
    } catch (error) {
      console.error('Error calculating risks:', error)
      alert('Error calculating risks')
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-800 border-red-300'
    if (score >= 6) return 'bg-orange-100 text-orange-800 border-orange-300'
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  const getRiskLabel = (score: number) => {
    if (score >= 8) return 'High'
    if (score >= 6) return 'Medium-High'
    if (score >= 4) return 'Medium'
    return 'Low'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const filteredUnits = (adminUnits || []).filter(u => u.countryId === selectedCountry)
  const activeMultipliers = (multipliers || []).filter(m => m.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🧮 Risk Calculator & Simulator</h2>
        <p className="text-sm text-gray-600">
          Test the risk calculation system by simulating different user profiles and seeing which risks are preselected and which strategies are recommended.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Simulation Parameters</h3>

          {/* Location Selection */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">📍 Location</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select country...</option>
                {(countries || []).map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Administrative Unit *</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedCountry}
              >
                <option value="">Select admin unit...</option>
                {(filteredUnits || []).map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Business Type Selection */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">🏢 Business Type</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
              <select
                value={selectedBusinessType}
                onChange={(e) => setSelectedBusinessType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select business type...</option>
                {(businessTypes || []).map(bt => (
                  <option key={bt.id} value={bt.id}>
                    {bt.name} ({bt.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Multiplier Questions */}
          {(activeMultipliers || []).length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">🎛️ Multiplier Questions</h4>

              {(activeMultipliers || []).map(multiplier => {
                const question = multiplier.wizardQuestion || multiplier.name
                const helpText = multiplier.wizardHelpText
                const currentValue = multiplierAnswers[multiplier.id]

                // Parse answer options if available
                let answerOptions: any[] = []
                if (multiplier.wizardAnswerOptions) {
                  try {
                    answerOptions = Array.isArray(multiplier.wizardAnswerOptions)
                      ? multiplier.wizardAnswerOptions
                      : typeof multiplier.wizardAnswerOptions === 'string'
                        ? JSON.parse(multiplier.wizardAnswerOptions)
                        : []
                  } catch (error) {
                    console.error('Error parsing answer options:', error)
                  }
                }

                return (
                  <div key={multiplier.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {question}
                    </label>
                    {helpText && (
                      <p className="text-xs text-gray-500">{helpText}</p>
                    )}

                    {multiplier.conditionType === 'boolean' ? (
                      <div className="flex items-center gap-3">
                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => setMultiplierAnswers(prev => ({
                            ...prev,
                            [multiplier.id]: !prev[multiplier.id]
                          }))}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${currentValue ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${currentValue ? 'translate-x-7' : 'translate-x-1'
                              }`}
                          />
                        </button>
                        <span className={`text-sm font-medium ${currentValue ? 'text-blue-700' : 'text-gray-600'}`}>
                          {currentValue ? 'Yes' : 'No'}
                        </span>
                      </div>
                    ) : answerOptions && answerOptions.length > 0 ? (
                      // Dropdown for predefined options
                      <select
                        value={multiplierAnswers[multiplier.id] || ''}
                        onChange={(e) => setMultiplierAnswers(prev => ({
                          ...prev,
                          [multiplier.id]: parseFloat(e.target.value) || e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Select an option...</option>
                        {answerOptions.map((option: any, idx: number) => {
                          const optionValue = option.value !== undefined ? option.value : option
                          const optionLabel = option.label !== undefined ? option.label : option
                          return (
                            <option key={idx} value={optionValue}>
                              {optionLabel}
                            </option>
                          )
                        })}
                      </select>
                    ) : (
                      // Number input for threshold/range
                      <div className="space-y-1">
                        <input
                          type="number"
                          step="0.1"
                          value={multiplierAnswers[multiplier.id] || ''}
                          onChange={(e) => setMultiplierAnswers(prev => ({
                            ...prev,
                            [multiplier.id]: parseFloat(e.target.value)
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder={
                            multiplier.conditionType === 'threshold'
                              ? `Enter value (threshold: ${multiplier.thresholdValue})`
                              : multiplier.conditionType === 'range'
                                ? `Enter value (${multiplier.minValue} - ${multiplier.maxValue})`
                                : 'Enter value...'
                          }
                        />
                        {multiplier.conditionType === 'threshold' && multiplier.thresholdValue !== undefined && (
                          <p className="text-xs text-gray-500">
                            Multiplier applies when value ≥ {multiplier.thresholdValue}
                          </p>
                        )}
                        {multiplier.conditionType === 'range' && multiplier.minValue !== undefined && multiplier.maxValue !== undefined && (
                          <p className="text-xs text-gray-500">
                            Multiplier applies when value is between {multiplier.minValue} and {multiplier.maxValue}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Calculate Button */}
          <button
            onClick={calculateRisks}
            disabled={!selectedUnit || !selectedBusinessType}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            🧮 Calculate Risk Profile
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {riskScores.length > 0 && (
            <>
              {/* Risk Scores */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Risk Assessment Results</h3>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Threshold:</strong> Risks with final score ≥ {THRESHOLD} or location risk ≥ 5 are <strong>preselected</strong>
                  </p>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {(riskScores || [])
                    .sort((a, b) => b.finalScore - a.finalScore)
                    .map(score => (
                      <div
                        key={score.riskType}
                        className={`p-4 rounded-lg border-2 ${score.isPreselected
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-gray-50 border-gray-200'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {score.isPreselected && '✅ '}
                              {score.riskType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              Location: {score.locationRisk}/10 | Business: {score.businessVulnerability}/10 | Base: {score.baseScore}/10
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(score.finalScore)}`}>
                            {score.finalScore}/10 - {getRiskLabel(score.finalScore)}
                          </span>
                        </div>

                        {score.appliedMultipliers.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-1">Applied Multipliers:</p>
                            <div className="flex flex-wrap gap-1">
                              {score.appliedMultipliers.map((mult, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                  {mult.name} (×{mult.factor})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Recommended Strategies */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Recommended Strategies ({(recommendedStrategies || []).length})</h3>

                {(recommendedStrategies || []).length > 0 ? (
                  <div className="space-y-4">
                    {(recommendedStrategies || []).map((strategy: any) => {
                      const displayTitle = strategy.smeTitle || strategy.name
                        ? getLocalizedText(strategy.smeTitle || strategy.name, 'en')
                        : 'Untitled Strategy'
                      const displaySummary = (strategy.smeSummary || strategy.smeDescription || strategy.description)
                        ? getLocalizedText(strategy.smeSummary || strategy.smeDescription || strategy.description, 'en')
                        : ''

                      // Helper to extract string
                      const extractString = (value: any): string => {
                        if (!value) return ''
                        if (typeof value === 'string') return value
                        return String(value)
                      }

                      // Parse array fields
                      const getBenefits = () => {
                        if (!strategy.benefitsBullets) return []
                        if (Array.isArray(strategy.benefitsBullets)) {
                          return strategy.benefitsBullets.map(extractString).filter(Boolean)
                        }
                        return []
                      }

                      const getTips = () => {
                        if (!strategy.helpfulTips) return []
                        if (Array.isArray(strategy.helpfulTips)) {
                          return strategy.helpfulTips.map(extractString).filter(Boolean)
                        }
                        return []
                      }

                      const getMistakes = () => {
                        if (!strategy.commonMistakes) return []
                        if (Array.isArray(strategy.commonMistakes)) {
                          return strategy.commonMistakes.map(extractString).filter(Boolean)
                        }
                        return []
                      }

                      return (
                        <div key={strategy.id} className="bg-white border-2 border-green-200 rounded-lg overflow-hidden">
                          {/* Header */}
                          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold text-gray-900 text-xl flex items-center gap-2 flex-1">
                                {displayTitle}
                                {strategy.quickWinIndicator && (
                                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">⚡ Quick Win</span>
                                )}
                              </h4>
                            </div>

                            <p className="text-sm text-gray-700 mb-3">{displaySummary}</p>

                            {/* Key Metrics */}
                            <div className="flex flex-wrap gap-2 text-sm">
                              <div className="bg-white px-3 py-1 rounded-full">
                                <span className="text-gray-500">⏱️</span>{' '}
                                <span className="font-medium">
                                  {strategy.totalEstimatedHours ? `~${strategy.totalEstimatedHours}h` : (strategy.timeToImplement || strategy.implementationTime)}
                                </span>
                              </div>
                              <div className="bg-white px-3 py-1 rounded-full">
                                <span className="text-gray-500">💰</span>{' '}
                                <span className="font-medium">
                                  {strategy.costEstimateJMD || strategy.implementationCost
                                    ? getLocalizedText(strategy.costEstimateJMD || strategy.implementationCost, 'en')
                                    : 'N/A'}
                                </span>
                              </div>
                              <div className="bg-white px-3 py-1 rounded-full">
                                <span className="text-gray-500">⭐</span>{' '}
                                <span className="font-medium">{strategy.effectiveness}/10</span>
                              </div>
                              {strategy.complexityLevel && (
                                <div className="bg-white px-3 py-1 rounded-full">
                                  <span className="text-gray-500">📊</span>{' '}
                                  <span className="font-medium">{strategy.complexityLevel}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="p-4 space-y-4">
                            {/* Benefits */}
                            {getBenefits().length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">✅ What You'll Get</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {getBenefits().map((benefit: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-green-600 mr-2">•</span>
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Risk Coverage */}
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">📊 Protects Against</p>
                              <div className="flex flex-wrap gap-1">
                                {(strategy.applicableRisks || []).map((risk: string) => (
                                  <span key={risk} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {risk.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Real World Example */}
                            {strategy.realWorldExample && (
                              <div className="bg-green-50 border-l-4 border-green-500 rounded p-3">
                                <h5 className="font-bold text-green-900 mb-2 flex items-center">
                                  <span className="mr-2">💚</span> Real Success Story
                                </h5>
                                <p className="text-sm text-green-800">
                                  {strategy.realWorldExample ? getLocalizedText(strategy.realWorldExample, 'en') : ''}
                                </p>
                              </div>
                            )}

                            {/* Low Budget Alternative */}
                            {strategy.lowBudgetAlternative && (
                              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded p-3">
                                <h5 className="font-bold text-yellow-900 mb-2">💰 Low Budget Alternative</h5>
                                <p className="text-sm text-yellow-800">
                                  {strategy.lowBudgetAlternative ? getLocalizedText(strategy.lowBudgetAlternative, 'en') : ''}
                                </p>
                                {strategy.estimatedDIYSavings && (
                                  <p className="text-xs text-yellow-700 mt-1 italic">
                                    {getLocalizedText(strategy.estimatedDIYSavings, 'en')}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* DIY Approach */}
                            {strategy.diyApproach && (
                              <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3">
                                <h5 className="font-bold text-blue-900 mb-2">🔧 DIY Approach</h5>
                                <p className="text-sm text-blue-800">
                                  {strategy.diyApproach ? getLocalizedText(strategy.diyApproach, 'en') : ''}
                                </p>
                              </div>
                            )}

                            {/* Helpful Tips */}
                            {getTips().length > 0 && (
                              <div className="bg-blue-50 rounded p-3">
                                <h5 className="font-bold text-blue-900 mb-2">💡 Helpful Tips</h5>
                                <ul className="text-sm text-blue-800 space-y-1">
                                  {getTips().map((tip: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-blue-600 mr-2">•</span>
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Common Mistakes */}
                            {getMistakes().length > 0 && (
                              <div className="bg-red-50 rounded p-3">
                                <h5 className="font-bold text-red-900 mb-2">⚠️ Common Mistakes to Avoid</h5>
                                <ul className="text-sm text-red-800 space-y-1">
                                  {getMistakes().map((mistake: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-red-600 mr-2">✗</span>
                                      <span>{mistake}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Action Steps */}
                            {strategy.actionSteps && strategy.actionSteps.length > 0 && (
                              <div>
                                <h5 className="font-bold text-gray-900 mb-2">📋 What You Need to Do ({strategy.actionSteps.length} steps)</h5>
                                <div className="space-y-3">
                                  {strategy.actionSteps.map((step: any, index: number) => (
                                    <div key={step.id} className="bg-white rounded p-3 border border-gray-200">
                                      <div className="flex items-start justify-between mb-2">
                                        <p className="font-medium text-gray-900">
                                          Step {index + 1}: {(step.title || step.smeAction) ? getLocalizedText(step.title || step.smeAction, 'en') : 'Untitled Step'}
                                        </p>
                                        {step.difficultyLevel && (
                                          <span className={`text-xs px-2 py-0.5 rounded ${step.difficultyLevel === 'easy' ? 'bg-green-100 text-green-700' :
                                            step.difficultyLevel === 'hard' ? 'bg-red-100 text-red-700' :
                                              'bg-gray-100 text-gray-700'
                                            }`}>
                                            {step.difficultyLevel}
                                          </span>
                                        )}
                                      </div>

                                      {step.whyThisStepMatters && (
                                        <div className="mb-2 pl-3 border-l-2 border-blue-300">
                                          <p className="text-xs text-blue-700 font-medium">Why this matters:</p>
                                          <p className="text-xs text-blue-600">
                                            {step.whyThisStepMatters ? getLocalizedText(step.whyThisStepMatters, 'en') : ''}
                                          </p>
                                        </div>
                                      )}

                                      <p className="text-sm text-gray-600 mb-2">
                                        {(step.description || step.smeAction) ? getLocalizedText(step.description || step.smeAction, 'en') : ''}
                                      </p>

                                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                        {step.estimatedMinutes && (
                                          <span>⏱️ ~{step.estimatedMinutes} min</span>
                                        )}
                                        {!step.estimatedMinutes && step.timeframe && (
                                          <span>⏱️ {getLocalizedText(step.timeframe, 'en')}</span>
                                        )}
                                        {step.estimatedCostJMD && (
                                          <span>💰 {step.estimatedCostJMD ? getLocalizedText(step.estimatedCostJMD, 'en') : 'N/A'}</span>
                                        )}
                                      </div>

                                      {step.howToKnowItsDone && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                          <p className="text-xs text-gray-600">
                                            <span className="font-medium">✓ Done when:</span> {step.howToKnowItsDone ? getLocalizedText(step.howToKnowItsDone, 'en') : ''}
                                          </p>
                                        </div>
                                      )}

                                      {step.freeAlternative && (
                                        <div className="mt-2 bg-green-50 rounded p-2">
                                          <p className="text-xs text-green-700">
                                            <span className="font-medium">💸 Free option:</span> {step.freeAlternative ? getLocalizedText(step.freeAlternative, 'en') : ''}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Legacy: Why Important */}
                            {!strategy.benefitsBullets && strategy.whyImportant && (
                              <div className="bg-blue-50 rounded p-3">
                                <h5 className="font-bold text-blue-900 mb-1">✨ What You'll Get</h5>
                                <p className="text-sm text-blue-800">
                                  {strategy.whyImportant ? getLocalizedText(strategy.whyImportant, 'en') : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">
                    No strategies recommended for the current risk profile.
                  </p>
                )}
              </div>

              {/* Summary Stats */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {(riskScores || []).filter(s => s.isPreselected).length}
                    </p>
                    <p className="text-sm text-gray-600">Preselected Risks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {(recommendedStrategies || []).length}
                    </p>
                    <p className="text-sm text-gray-600">Recommended Strategies</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {(riskScores || []).length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🧮</div>
              <p className="text-gray-600">
                Select parameters and click "Calculate Risk Profile" to see results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
