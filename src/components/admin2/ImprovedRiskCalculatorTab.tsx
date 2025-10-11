'use client'

import React, { useState, useEffect } from 'react'

interface Parish {
  id: string
  name: string
  region: string
  population: number
  riskProfile: {
    hurricane: { level: number; notes: string }
    flood: { level: number; notes: string }
    earthquake: { level: number; notes: string }
    drought: { level: number; notes: string }
    landslide: { level: number; notes: string }
    powerOutage: { level: number; notes: string }
  }
}

interface BusinessType {
  id: string
  businessTypeId: string
  name: string
  category: string
  touristDependency: number
  supplyChainComplexity: number
  digitalDependency: number
  physicalAssetIntensity: number
  seasonalityFactor: number
  
  hurricaneVulnerability?: number
  floodVulnerability?: number
  earthquakeVulnerability?: number
  droughtVulnerability?: number
  landslideVulnerability?: number
  powerOutageVulnerability?: number
  
  hurricaneRecoveryImpact?: number
  floodRecoveryImpact?: number
  earthquakeRecoveryImpact?: number
  droughtRecoveryImpact?: number
  landslideRecoveryImpact?: number
  powerOutageRecoveryImpact?: number
}

interface CombinedRisk {
  riskType: string
  locationRisk: number
  businessVulnerability: number
  combinedScore: number
  impactSeverity: number
  reasoning: string
  recommendations: any[]
  calculationDetails: {
    baseScore: number
    multipliers: Array<{name: string, factor: number, applied: boolean}>
    finalScore: number
  }
}

export function ImprovedRiskCalculatorTab() {
  const [parishes, setParishes] = useState<Parish[]>([])
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [multipliers, setMultipliers] = useState<any[]>([])
  const [selectedParish, setSelectedParish] = useState<string>('')
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('')
  const [combinedRisks, setCombinedRisks] = useState<CombinedRisk[]>([])
  const [overallRiskScore, setOverallRiskScore] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [strategies, setStrategies] = useState<any[]>([])
  const [showCalculationDetails, setShowCalculationDetails] = useState(false)
  const [selectedView, setSelectedView] = useState<'calculator' | 'methodology' | 'insights'>('calculator')
  
  // Business characteristics for multiplier testing (emulates user wizard answers)
  const [businessChars, setBusinessChars] = useState({
    customerBase: 'mix' as 'mainly_tourists' | 'mix' | 'mainly_locals',
    powerDependency: 'partially' as 'can_operate' | 'partially' | 'cannot_operate',
    digitalDependency: 'helpful' as 'essential' | 'helpful' | 'not_used',
    importsFromOverseas: false,
    sellsPerishable: false,
    minimalInventory: false,
    expensiveEquipment: false
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedParish && selectedBusinessType) {
      calculateCombinedRisk()
    }
  }, [selectedParish, selectedBusinessType, parishes, businessTypes, multipliers, businessChars])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const { centralDataService } = await import('../../services/centralDataService')
      
      const [parishData, businessData, strategyData, multipliersResponse] = await Promise.all([
        centralDataService.getParishes(),
        centralDataService.getBusinessTypes(),
        centralDataService.getStrategies(),
        fetch('/api/admin2/multipliers').then(res => res.json())
      ])

      setParishes(parishData)
      setBusinessTypes(businessData)
      setStrategies(strategyData)
      setMultipliers(multipliersResponse.success ? multipliersResponse.multipliers : [])
      
      console.log(`📊 Loaded ${multipliersResponse.success ? multipliersResponse.multipliers.length : 0} multipliers from database`)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateCombinedRisk = async () => {
    const parish = parishes.find(p => p.id === selectedParish)
    const businessType = businessTypes.find(bt => bt.id === selectedBusinessType)

    if (!parish || !businessType) return

    // Import multiplier service for characteristic conversion
    const { convertSimplifiedInputs } = await import('../../services/multiplierService')
    
    // Convert business characteristics (emulates user wizard answers)
    const businessCharacteristics = convertSimplifiedInputs({
      customerBase: businessChars.customerBase,
      powerDependency: businessChars.powerDependency,
      digitalDependency: businessChars.digitalDependency,
      importsFromOverseas: businessChars.importsFromOverseas,
      sellsPerishable: businessChars.sellsPerishable,
      minimalInventory: businessChars.minimalInventory,
      expensiveEquipment: businessChars.expensiveEquipment,
      isCoastal: false, // Admin calculator - not user-specific
      isUrban: false, // Admin calculator - not user-specific
      floodRisk: parish.riskProfile.flood?.level || 0
    })

    // Get ALL risk types from parish (includes dynamic risks like fire, cyberAttack, etc.)
    const riskTypes = Object.keys(parish.riskProfile).filter(key => 
      !['lastUpdated', 'updatedBy'].includes(key) && 
      typeof (parish.riskProfile as any)[key] === 'object'
    )
    const calculatedRisks: CombinedRisk[] = []

    riskTypes.forEach(riskType => {
      const locationRisk = parish.riskProfile[riskType as keyof typeof parish.riskProfile]?.level || 0
      const businessVulnerability = businessType[`${riskType}Vulnerability` as keyof BusinessType] as number || 5
      const recoveryImpact = businessType[`${riskType}RecoveryImpact` as keyof BusinessType] as number || 5

      // Step 1: Calculate base combined score using weighted average
      const baseScore = (locationRisk * 0.6) + (businessVulnerability * 0.4)
      
      // Step 2: Apply database multipliers (same logic as wizard)
      const appliedMultipliers: Array<{name: string, factor: number, applied: boolean}> = []
      
      // Normalize risk type for comparison (handle both camelCase and snake_case)
      const normalizedRiskType = riskType.replace(/_/g, '').toLowerCase()
      
      let combinedScore = baseScore
      
      // Apply each active multiplier from database
      multipliers.forEach((mult: any) => {
        if (!mult.isActive) return
        
        // Parse applicable hazards
        const applicableHazards = Array.isArray(mult.applicableHazards) 
          ? mult.applicableHazards 
          : (typeof mult.applicableHazards === 'string' ? JSON.parse(mult.applicableHazards) : [])
        
        // Normalize applicable hazards for comparison
        const normalizedHazards = applicableHazards.map((h: string) => h.replace(/_/g, '').toLowerCase())
        
        // Check if this multiplier applies to current hazard
        if (!normalizedHazards.includes(normalizedRiskType)) {
          return
        }
        
        // Check if business characteristics match the multiplier condition
        let conditionMet = false
        const charValue = (businessCharacteristics as any)[mult.characteristicType]
        
        if (mult.conditionType === 'boolean') {
          conditionMet = charValue === true
        } else if (mult.conditionType === 'threshold') {
          conditionMet = typeof charValue === 'number' && charValue >= (mult.thresholdValue || 0)
        } else if (mult.conditionType === 'range') {
          conditionMet = typeof charValue === 'number' && 
                        charValue >= (mult.minValue || 0) && 
                        charValue <= (mult.maxValue || 100)
        }
        
        if (conditionMet) {
          combinedScore *= mult.multiplierFactor
          appliedMultipliers.push({
            name: mult.name,
            factor: mult.multiplierFactor,
            applied: true
          })
        }
      })

      combinedScore = Math.min(10, combinedScore) // Cap at 10

      const recommendations = getRecommendationsForRisk(riskType, combinedScore, businessType.category)

      calculatedRisks.push({
        riskType,
        locationRisk,
        businessVulnerability,
        combinedScore: Number(combinedScore.toFixed(1)),
        impactSeverity: recoveryImpact,
        reasoning: appliedMultipliers.length > 0 
          ? `Base score ${baseScore.toFixed(1)}, then ${appliedMultipliers.map(m => `${m.name} ×${m.factor}`).join(', ')}`
          : `Location risk weighted at 60%, business vulnerability at 40% (no multipliers applied)`,
        recommendations,
        calculationDetails: {
          baseScore: Number(baseScore.toFixed(2)),
          multipliers: appliedMultipliers,
          finalScore: Number(combinedScore.toFixed(2))
        }
      })
    })

    setCombinedRisks(calculatedRisks)
    
    // Calculate overall risk score using weighted average
    const weightedTotal = calculatedRisks.reduce((sum, risk) => {
      const weight = risk.combinedScore >= 8 ? 1.2 : risk.combinedScore >= 6 ? 1.1 : 1.0
      return sum + (risk.combinedScore * weight)
    }, 0)
    const totalWeight = calculatedRisks.reduce((sum, risk) => {
      const weight = risk.combinedScore >= 8 ? 1.2 : risk.combinedScore >= 6 ? 1.1 : 1.0
      return sum + weight
    }, 0)
    
    setOverallRiskScore(Number((weightedTotal / totalWeight).toFixed(1)))
  }

  const getRecommendationsForRisk = (riskType: string, score: number, businessCategory: string): any[] => {
    const recommendations: any[] = []
    
    const relevantStrategies = strategies.filter(strategy => 
      strategy.applicableRisks.includes(riskType) && 
      (strategy.businessTypes.includes(businessCategory) || strategy.businessTypes.includes('all'))
    )

    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const sortedStrategies = relevantStrategies.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1
      if (aPriority !== bPriority) return bPriority - aPriority
      return (b.effectiveness || 5) - (a.effectiveness || 5)
    })

    if (score >= 8) {
      recommendations.push({
        type: 'alert',
        message: '🚨 Critical risk level - implement emergency preparedness immediately',
        priority: 'critical'
      })
      sortedStrategies
        .filter(s => s.priority === 'critical' || s.priority === 'high')
        .slice(0, 3)
        .forEach(s => recommendations.push({
          type: 'strategy',
          strategy: s,
          message: `Critical: ${s.name}`,
          priority: s.priority
        }))
    } else if (score >= 6) {
      recommendations.push({
        type: 'alert',
        message: '⚠️ High risk level - prioritize mitigation strategies',
        priority: 'high'
      })
      sortedStrategies
        .filter(s => s.priority === 'high' || s.priority === 'medium')
        .slice(0, 2)
        .forEach(s => recommendations.push({
          type: 'strategy',
          strategy: s,
          message: `Priority: ${s.name}`,
          priority: s.priority
        }))
    } else if (score >= 4) {
      recommendations.push({
        type: 'alert',
        message: '📋 Medium risk level - implement preventive measures',
        priority: 'medium'
      })
      sortedStrategies
        .filter(s => s.category === 'prevention' || s.priority === 'medium')
        .slice(0, 2)
        .forEach(s => recommendations.push({
          type: 'strategy',
          strategy: s,
          message: `Recommended: ${s.name}`,
          priority: s.priority
        }))
    } else {
      recommendations.push({
        type: 'alert',
        message: '✅ Low risk level - maintain standard precautions',
        priority: 'low'
      })
      if (sortedStrategies.length > 0) {
        recommendations.push({
          type: 'strategy',
          strategy: sortedStrategies[0],
          message: `Optional: ${sortedStrategies[0].name}`,
          priority: sortedStrategies[0].priority
        })
      }
    }

    return recommendations
  }

  const getRiskColor = (score: number): string => {
    if (score >= 8) return 'bg-red-500'
    if (score >= 6) return 'bg-orange-500'
    if (score >= 4) return 'bg-yellow-500'
    if (score >= 2) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getRiskLabel = (score: number): string => {
    if (score >= 8) return 'Critical'
    if (score >= 6) return 'High'
    if (score >= 4) return 'Medium'
    if (score >= 2) return 'Low'
    return 'Very Low'
  }

  const riskLabels = {
    hurricane: { name: 'Hurricane', icon: '🌀' },
    flood: { name: 'Flood', icon: '🌊' },
    earthquake: { name: 'Earthquake', icon: '🏔️' },
    drought: { name: 'Drought', icon: '🌵' },
    landslide: { name: 'Landslide', icon: '⛰️' },
    powerOutage: { name: 'Power Outage', icon: '⚡' },
    fire: { name: 'Fire', icon: '🔥' },
    cyberAttack: { name: 'Cyber Attack', icon: '💻' },
    terrorism: { name: 'Security Threats', icon: '🔒' },
    pandemicDisease: { name: 'Health Emergencies', icon: '🦠' },
    economicDownturn: { name: 'Economic Crisis', icon: '📉' },
    supplyChainDisruption: { name: 'Supply Chain Issues', icon: '🚛' },
    civilUnrest: { name: 'Civil Unrest', icon: '⚡' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading risk calculator...</p>
        </div>
      </div>
    )
  }

  const ViewModeButton = ({ mode, label, icon }: { mode: typeof selectedView; label: string; icon: string }) => (
    <button
      onClick={() => setSelectedView(mode)}
      className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md border-r border-gray-300 last:border-r-0 ${
        selectedView === mode
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  )

  return (
    <div>
      {/* Compact Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-lg font-semibold text-gray-900">SME Risk Calculator</h1>
            <span className="text-sm text-gray-600">
              Advanced risk assessment with transparent calculations
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <nav className="flex border border-gray-300 rounded-md">
              <ViewModeButton mode="calculator" label="Calculator" icon="🧮" />
              <ViewModeButton mode="methodology" label="Methodology" icon="📊" />
              <ViewModeButton mode="insights" label="Admin Insights" icon="🔍" />
            </nav>
            
            {combinedRisks.length > 0 && (
              <button
                onClick={() => setShowCalculationDetails(!showCalculationDetails)}
                className={`px-3 py-1.5 text-sm font-medium border border-gray-300 rounded transition-colors ${
                  showCalculationDetails 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {showCalculationDetails ? 'Hide Details' : 'Show Calculations'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedView === 'calculator' && (
          <CalculatorView
            parishes={parishes}
            businessTypes={businessTypes}
            selectedParish={selectedParish}
            selectedBusinessType={selectedBusinessType}
            setSelectedParish={setSelectedParish}
            setSelectedBusinessType={setSelectedBusinessType}
            combinedRisks={combinedRisks}
            overallRiskScore={overallRiskScore}
            showCalculationDetails={showCalculationDetails}
            getRiskColor={getRiskColor}
            getRiskLabel={getRiskLabel}
            riskLabels={riskLabels}
            businessChars={businessChars}
            setBusinessChars={setBusinessChars}
          />
        )}

        {selectedView === 'methodology' && <MethodologyView />}

        {selectedView === 'insights' && (
          <AdminInsightsView
            parishes={parishes}
            businessTypes={businessTypes}
            strategies={strategies}
            combinedRisks={combinedRisks}
          />
        )}
      </div>
    </div>
  )
}

// Calculator View Component
interface CalculatorViewProps {
  parishes: Parish[]
  businessTypes: BusinessType[]
  selectedParish: string
  selectedBusinessType: string
  setSelectedParish: (id: string) => void
  setSelectedBusinessType: (id: string) => void
  combinedRisks: CombinedRisk[]
  overallRiskScore: number
  showCalculationDetails: boolean
  getRiskColor: (score: number) => string
  getRiskLabel: (score: number) => string
  riskLabels: Record<string, {name: string, icon: string}>
  businessChars: {
    customerBase: 'mainly_tourists' | 'mix' | 'mainly_locals'
    powerDependency: 'can_operate' | 'partially' | 'cannot_operate'
    digitalDependency: 'essential' | 'helpful' | 'not_used'
    importsFromOverseas: boolean
    sellsPerishable: boolean
    minimalInventory: boolean
    expensiveEquipment: boolean
  }
  setBusinessChars: (chars: any) => void
}

function CalculatorView({
  parishes,
  businessTypes,
  selectedParish,
  selectedBusinessType,
  setSelectedParish,
  setSelectedBusinessType,
  combinedRisks,
  overallRiskScore,
  showCalculationDetails,
  getRiskColor,
  getRiskLabel,
  riskLabels,
  businessChars,
  setBusinessChars
}: CalculatorViewProps) {
  const selectedParishData = parishes.find(p => p.id === selectedParish)
  const selectedBusinessData = businessTypes.find(bt => bt.id === selectedBusinessType)

  return (
    <div className="space-y-6">
      {/* Input Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parish Location
            </label>
            <select
              value={selectedParish}
              onChange={(e) => setSelectedParish(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a parish...</option>
              {parishes.map(parish => (
                <option key={parish.id} value={parish.id}>
                  {parish.name} ({parish.region})
                </option>
              ))}
            </select>
            {selectedParishData && (
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Population: {selectedParishData.population?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <select
              value={selectedBusinessType}
              onChange={(e) => setSelectedBusinessType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a business type...</option>
              {businessTypes.map(bt => (
                <option key={bt.id} value={bt.id}>
                  {bt.name} ({bt.category})
                </option>
              ))}
            </select>
            {selectedBusinessData && (
              <div className="mt-2 text-sm text-gray-600">
                <div className="grid grid-cols-2 gap-2">
                  <span>Tourism Dep: {selectedBusinessData.touristDependency}/10</span>
                  <span>Digital Dep: {selectedBusinessData.digitalDependency}/10</span>
                  <span>Seasonality: {selectedBusinessData.seasonalityFactor}/10</span>
                  <span>Asset Intensity: {selectedBusinessData.physicalAssetIntensity}/10</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Business Characteristics for Multiplier Testing */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Business Characteristics (Test Multipliers)</h3>
            <span className="text-xs text-gray-500">Simulates user wizard answers</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Base */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Customer Base</label>
              <select
                value={businessChars.customerBase}
                onChange={(e) => setBusinessChars({ ...businessChars, customerBase: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mainly_locals">Mainly Locals (10% tourism)</option>
                <option value="mix">Mix (40% tourism)</option>
                <option value="mainly_tourists">Mainly Tourists (80%)</option>
              </select>
            </div>
            
            {/* Power Dependency */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Power Dependency</label>
              <select
                value={businessChars.powerDependency}
                onChange={(e) => setBusinessChars({ ...businessChars, powerDependency: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="can_operate">Can Operate (10%)</option>
                <option value="partially">Partially (50%)</option>
                <option value="cannot_operate">Cannot Operate (95%)</option>
              </select>
            </div>
            
            {/* Digital Dependency */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Digital Systems</label>
              <select
                value={businessChars.digitalDependency}
                onChange={(e) => setBusinessChars({ ...businessChars, digitalDependency: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="not_used">Not Used (10%)</option>
                <option value="helpful">Helpful (50%)</option>
                <option value="essential">Essential (95%)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {/* Boolean characteristics */}
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={businessChars.importsFromOverseas}
                onChange={(e) => setBusinessChars({ ...businessChars, importsFromOverseas: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Imports from Overseas</span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={businessChars.sellsPerishable}
                onChange={(e) => setBusinessChars({ ...businessChars, sellsPerishable: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Sells Perishable Goods</span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={businessChars.minimalInventory}
                onChange={(e) => setBusinessChars({ ...businessChars, minimalInventory: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Minimal Inventory</span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={businessChars.expensiveEquipment}
                onChange={(e) => setBusinessChars({ ...businessChars, expensiveEquipment: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Expensive Equipment</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      {selectedParish && selectedBusinessType && combinedRisks.length > 0 && (
        <>
          {/* Overall Risk Score */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Risk Assessment</h3>
                <div className="flex items-center justify-center space-x-4">
                  <div className={`w-16 h-16 rounded-full ${getRiskColor(overallRiskScore)} flex items-center justify-center text-white text-xl font-bold`}>
                    {overallRiskScore}
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-gray-900">{getRiskLabel(overallRiskScore)} Risk</div>
                    <div className="text-gray-600">Weighted average of all risks</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Risk Distribution</h4>
                {['Critical', 'High', 'Medium', 'Low'].map((level, index) => {
                  const count = combinedRisks.filter(r => {
                    const score = r.combinedScore
                    return index === 0 ? score >= 8 : 
                           index === 1 ? score >= 6 && score < 8 :
                           index === 2 ? score >= 4 && score < 6 :
                           score < 4
                  }).length
                  
                  return (
                    <div key={level} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{level}:</span>
                      <span className="font-medium">{count} risks</span>
                    </div>
                  )
                })}
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Top Risk Factors</h4>
                {combinedRisks
                  .sort((a, b) => b.combinedScore - a.combinedScore)
                  .slice(0, 3)
                  .map(risk => (
                    <div key={risk.riskType} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span>{riskLabels[risk.riskType as keyof typeof riskLabels]?.icon || '⚠️'}</span>
                        <span className="text-gray-600">{riskLabels[risk.riskType as keyof typeof riskLabels]?.name || risk.riskType}</span>
                      </div>
                      <span className="font-medium">{risk.combinedScore}/10</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Risk Analysis</h3>
              <div className="text-sm text-gray-600">
                Sorted by risk level (highest to lowest)
              </div>
            </div>
            
            <div className="space-y-6">
              {combinedRisks
                .sort((a, b) => b.combinedScore - a.combinedScore)
                .map((risk, index) => (
                  <RiskDetailCard 
                    key={risk.riskType}
                    risk={risk}
                    riskLabel={riskLabels[risk.riskType as keyof typeof riskLabels] || { name: risk.riskType, icon: '⚠️' }}
                    showCalculationDetails={showCalculationDetails}
                    getRiskColor={getRiskColor}
                    getRiskLabel={getRiskLabel}
                  />
                ))}
            </div>
          </div>
        </>
      )}

      {/* No Selection State */}
      {(!selectedParish || !selectedBusinessType) && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">🧮</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Calculate Risk</h3>
          <p className="text-gray-600 mb-4">
            Select both a parish location and business type above to see the comprehensive risk assessment
          </p>
          <div className="text-sm text-gray-500">
            The calculator uses advanced algorithms combining location risks with business-specific vulnerabilities
          </div>
        </div>
      )}
    </div>
  )
}

// Risk Detail Card Component
interface RiskDetailCardProps {
  risk: CombinedRisk
  riskLabel: {name: string, icon: string}
  showCalculationDetails: boolean
  getRiskColor: (score: number) => string
  getRiskLabel: (score: number) => string
}

function RiskDetailCard({ risk, riskLabel, showCalculationDetails, getRiskColor, getRiskLabel }: RiskDetailCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">{riskLabel.icon}</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{riskLabel.name}</h4>
            <p className="text-sm text-gray-600">{risk.reasoning}</p>
          </div>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getRiskColor(risk.combinedScore)}`}>
          {risk.combinedScore}/10 - {getRiskLabel(risk.combinedScore)}
        </div>
      </div>

      {/* Risk Components */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-800 mb-1">Location Risk Factor</div>
          <div className="text-2xl font-bold text-blue-900 mb-1">{risk.locationRisk}/10</div>
          <div className="text-xs text-blue-600">Environmental & geographic hazards</div>
          <div className="text-xs text-blue-500 mt-1">Weight: 60% of base score</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm font-medium text-purple-800 mb-1">Business Vulnerability</div>
          <div className="text-2xl font-bold text-purple-900 mb-1">{risk.businessVulnerability}/10</div>
          <div className="text-xs text-purple-600">Business type specific factors</div>
          <div className="text-xs text-purple-500 mt-1">Weight: 40% of base score</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-sm font-medium text-orange-800 mb-1">Recovery Impact</div>
          <div className="text-2xl font-bold text-orange-900 mb-1">{risk.impactSeverity}/10</div>
          <div className="text-xs text-orange-600">Expected damage & downtime</div>
          <div className="text-xs text-orange-500 mt-1">Used for strategy prioritization</div>
        </div>
      </div>

      {/* Calculation Details */}
      {showCalculationDetails && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h5 className="font-medium text-gray-800 mb-3">🔍 Calculation Breakdown</h5>
          
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-medium text-gray-700 mb-2">Step 1: Base Score Calculation</div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-mono text-xs mb-2">
                    Base = (Location × 0.6) + (Business × 0.4)
                  </div>
                  <div className="font-mono text-xs">
                    Base = ({risk.locationRisk} × 0.6) + ({risk.businessVulnerability} × 0.4) = {risk.calculationDetails.baseScore}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="font-medium text-gray-700 mb-2">Step 2: Applied Multipliers</div>
                <div className="bg-white p-3 rounded border space-y-1">
                  {risk.calculationDetails.multipliers.map((multiplier, idx) => (
                    <div key={idx} className={`text-xs flex justify-between ${multiplier.applied ? 'text-green-700' : 'text-gray-400'}`}>
                      <span>{multiplier.name}:</span>
                      <span>{multiplier.applied ? `×${multiplier.factor}` : 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-100 p-3 rounded border border-blue-200">
              <div className="font-medium text-blue-800 mb-1">Final Calculation</div>
              <div className="font-mono text-xs text-blue-700">
                Final Score = {risk.calculationDetails.baseScore} × Applied Multipliers = {risk.calculationDetails.finalScore} (capped at 10)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {risk.recommendations.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-medium text-green-800 mb-3">📋 AI-Generated Recommendations</h5>
          <div className="space-y-3">
            {risk.recommendations.map((rec, idx) => (
              <div key={idx}>
                {rec.type === 'alert' ? (
                  <div className="text-sm text-green-700 font-medium mb-2 p-2 bg-green-100 rounded">
                    {rec.message}
                  </div>
                ) : rec.type === 'strategy' ? (
                  <div className="border border-green-300 rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <h6 className="font-semibold text-green-900">{rec.strategy.name}</h6>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{rec.strategy.smeDescription || rec.strategy.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <span>💰</span>
                        <span>{rec.strategy.costEstimateJMD || rec.strategy.implementationCost}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>⏱️</span>
                        <span>{rec.strategy.timeToImplement || rec.strategy.implementationTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📊</span>
                        <span>Effectiveness: {rec.strategy.effectiveness}/10</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>💹</span>
                        <span>ROI: {rec.strategy.roi ? `${rec.strategy.roi}x` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Methodology View Component
function MethodologyView() {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Risk Calculation Methodology</h2>
        
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700 mb-6">
            Our risk calculator uses a sophisticated multi-factor algorithm that combines location-specific hazard data 
            with business-type vulnerabilities to generate comprehensive risk assessments for Jamaican SMEs.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">🎯 Core Calculation Formula</h3>
            <div className="bg-white p-4 rounded border border-blue-300 font-mono text-sm">
              <div className="mb-2"><strong>Step 1:</strong> Base Score = (Location Risk × 0.6) + (Business Vulnerability × 0.4)</div>
              <div className="mb-2"><strong>Step 2:</strong> Apply Multipliers based on business characteristics</div>
              <div className="mb-2"><strong>Step 3:</strong> Final Score = Base Score × Applied Multipliers (capped at 10)</div>
              <div><strong>Step 4:</strong> Overall Risk = Weighted average of all risk types</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed methodology content would go here */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Calculation Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Location Risk Factors (60% Weight)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Parish-level hazard assessments</li>
              <li>• Historical risk patterns</li>
              <li>• Geographic vulnerabilities</li>
              <li>• Infrastructure resilience</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Business Vulnerability (40% Weight)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Industry-specific risk factors</li>
              <li>• Operational dependencies</li>
              <li>• Recovery time requirements</li>
              <li>• Asset exposure levels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin Insights View Component
interface AdminInsightsViewProps {
  parishes: Parish[]
  businessTypes: BusinessType[]
  strategies: any[]
  combinedRisks: CombinedRisk[]
}

function AdminInsightsView({ parishes, businessTypes, strategies }: AdminInsightsViewProps) {
  return (
    <div className="space-y-8">
      {/* Data Quality Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">📊 Data Quality Assessment</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{parishes.length}</div>
            <div className="text-sm font-medium text-blue-800">Total Parishes</div>
            <div className="text-xs text-blue-600 mt-1">Complete risk assessments</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{businessTypes.length}</div>
            <div className="text-sm font-medium text-green-800">Business Types</div>
            <div className="text-xs text-green-600 mt-1">With vulnerability data</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{strategies.length}</div>
            <div className="text-sm font-medium text-purple-800">Available Strategies</div>
            <div className="text-xs text-purple-600 mt-1">Risk mitigation options</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {strategies.reduce((sum, s) => sum + (s.actionSteps?.length || 0), 0)}
            </div>
            <div className="text-sm font-medium text-orange-800">Action Steps</div>
            <div className="text-xs text-orange-600 mt-1">Implementation guidance</div>
          </div>
        </div>
      </div>

      {/* System Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 System Performance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Risk Distribution</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">High Risk Parishes:</span>
                <span className="font-medium">
                  {parishes.filter(p => {
                    const avgRisk = Object.values(p.riskProfile).reduce((sum, risk) => {
                      return sum + ((risk as any)?.level || 0)
                    }, 0) / 6
                    return avgRisk >= 6
                  }).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coastal Parishes:</span>
                <span className="font-medium">{0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Urban Parishes:</span>
                <span className="font-medium">{0}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Strategy Coverage</h4>
            <div className="space-y-2 text-sm">
              {['prevention', 'preparation', 'response', 'recovery'].map(category => {
                const count = strategies.filter(s => s.category === category).length
                return (
                  <div key={category} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{category}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Data Quality Tips</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="p-2 bg-blue-50 rounded">
                <strong>📊 Improve Accuracy:</strong> Ensure all parishes have complete risk assessments
              </div>
              <div className="p-2 bg-green-50 rounded">
                <strong>🎯 Enhance Coverage:</strong> Add more business type vulnerability data
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <strong>🚀 Expand Strategies:</strong> Include more prevention and preparation strategies
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


