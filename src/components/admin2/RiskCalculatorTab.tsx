'use client'

import { useState, useEffect } from 'react'

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
      
      // Use fetch with cache control for better performance
      const fetchOptions: RequestInit = {
        next: { revalidate: 300 } // Cache for 5 minutes
      }
      
      const [countriesRes, businessTypesRes, multipliersRes, strategiesRes] = await Promise.all([
        fetch('/api/admin2/countries', fetchOptions),
        fetch('/api/admin2/business-types', fetchOptions),
        fetch('/api/admin2/multipliers', fetchOptions),
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
        const multiplierList = multipliersData.data || multipliersData.multipliers || []
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

  const parseMultilingual = (value: any, lang: string = 'en'): any => {
    if (!value) return null
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return parsed[lang] || parsed.en || value
      } catch {
        return value
      }
    }
    return value[lang] || value.en || value
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
                    {parseMultilingual(bt.name) || bt.name} ({bt.category})
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
                const question = parseMultilingual(multiplier.wizardQuestion) || multiplier.name
                const currentValue = multiplierAnswers[multiplier.id]
                
                return (
                  <div key={multiplier.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {question}
                    </label>
                    
                    {multiplier.conditionType === 'boolean' ? (
                      <div className="flex items-center gap-3">
                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => setMultiplierAnswers(prev => ({
                            ...prev,
                            [multiplier.id]: !prev[multiplier.id]
                          }))}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            currentValue ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              currentValue ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`text-sm font-medium ${currentValue ? 'text-blue-700' : 'text-gray-600'}`}>
                          {currentValue ? 'Yes' : 'No'}
                        </span>
                </div>
                    ) : (
                      <input
                        type="number"
                        value={multiplierAnswers[multiplier.id] || ''}
                        onChange={(e) => setMultiplierAnswers(prev => ({
                          ...prev,
                          [multiplier.id]: parseFloat(e.target.value)
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter value..."
                      />
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
                        className={`p-4 rounded-lg border-2 ${
                          score.isPreselected
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Recommended Strategies</h3>
                
                {(recommendedStrategies || []).length > 0 ? (
                    <div className="space-y-3">
                    {(recommendedStrategies || []).map(strategy => (
                      <div key={strategy.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-gray-900">
                          ✓ {parseMultilingual(strategy.name) || strategy.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Applies to: {(strategy.applicableRisks || []).slice(0, 3).join(', ')}
                          {(strategy.applicableRisks || []).length > 3 && ` +${(strategy.applicableRisks || []).length - 3} more`}
                        </p>
                            </div>
                          ))}
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
