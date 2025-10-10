'use client'

import React, { useState } from 'react'

interface Parish {
  id: string
  name: string
  region: string
  isCoastal: boolean
  isUrban: boolean
  population: number
  riskProfile: {
    hurricane: { level: number; notes: string }
    flood: { level: number; notes: string }
    earthquake: { level: number; notes: string }
    drought: { level: number; notes: string }
    landslide: { level: number; notes: string }
    powerOutage: { level: number; notes: string }
    lastUpdated: string
    updatedBy: string
  }
}

interface RiskMatrixProps {
  parishes: Parish[]
}

export function CompactRiskMatrix({ parishes }: RiskMatrixProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed'>('overview')
  
  const riskTypes = [
    { key: 'hurricane', name: 'Hurricane', icon: '🌀', shortName: 'Hurr' },
    { key: 'flood', name: 'Flood', icon: '🌊', shortName: 'Flood' },
    { key: 'earthquake', name: 'Earthquake', icon: '🏔️', shortName: 'Quake' },
    { key: 'drought', name: 'Drought', icon: '🌵', shortName: 'Drought' },
    { key: 'landslide', name: 'Landslide', icon: '⛰️', shortName: 'Slide' },
    { key: 'powerOutage', name: 'Power', icon: '⚡', shortName: 'Power' },
    { key: 'fire', name: 'Fire', icon: '🔥', shortName: 'Fire' },
    { key: 'cyberAttack', name: 'Cyber', icon: '💻', shortName: 'Cyber' },
    { key: 'terrorism', name: 'Terror', icon: '🔒', shortName: 'Terror' },
    { key: 'pandemicDisease', name: 'Pandemic', icon: '🦠', shortName: 'Health' },
    { key: 'economicDownturn', name: 'Economic', icon: '📉', shortName: 'Econ' },
    { key: 'supplyChainDisruption', name: 'Supply', icon: '🚛', shortName: 'Supply' },
    { key: 'civilUnrest', name: 'Unrest', icon: '⚡', shortName: 'Unrest' }
  ]

  const getRiskColor = (level: number) => {
    if (level >= 8) return 'bg-red-500'
    if (level >= 6) return 'bg-yellow-500'
    if (level >= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getRiskIntensity = (level: number) => {
    if (level >= 8) return 'opacity-100'
    if (level >= 6) return 'opacity-75'
    if (level >= 4) return 'opacity-50'
    return 'opacity-25'
  }

  // Calculate summary statistics more efficiently
  const riskStatistics = riskTypes.map(risk => {
    const riskLevels = parishes.map(p => {
      const riskData = p.riskProfile[risk.key as keyof typeof p.riskProfile] as { level: number }
      return riskData?.level || 0
    })
    
    const distribution = {
      low: riskLevels.filter(l => l <= 3).length,
      lowMed: riskLevels.filter(l => l >= 4 && l <= 5).length,
      medium: riskLevels.filter(l => l >= 6 && l <= 7).length,
      high: riskLevels.filter(l => l >= 8).length
    }
    
    return {
      ...risk,
      avgLevel: Math.round(riskLevels.reduce((sum, level) => sum + level, 0) / riskLevels.length * 10) / 10,
      maxLevel: Math.max(...riskLevels),
      highRiskCount: distribution.high,
      distribution
    }
  })

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Parish Risk Matrix</h2>
            <p className="text-sm text-gray-600 mt-1">
              Risk levels across {parishes.length} Jamaica parishes
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Compact Legend */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 bg-green-500 opacity-25 rounded"></div>
                <span>Low</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 bg-blue-500 opacity-50 rounded"></div>
                <span>Med</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 bg-yellow-500 opacity-75 rounded"></div>
                <span>High</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 bg-red-500 opacity-100 rounded"></div>
                <span>Critical</span>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex rounded-md border border-gray-300 bg-gray-50">
              <button
                onClick={() => setSelectedView('overview')}
                className={`px-3 py-1 text-xs font-medium rounded-l-md transition-colors ${
                  selectedView === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedView('detailed')}
                className={`px-3 py-1 text-xs font-medium rounded-r-md transition-colors border-l border-gray-300 ${
                  selectedView === 'detailed' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Detailed
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedView === 'overview' && (
        <>
          {/* Compact Summary Cards - Horizontal Layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {riskStatistics.map(risk => (
              <div key={risk.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{risk.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{risk.shortName}</h4>
                    <div className="text-xs text-gray-500">Avg: {risk.avgLevel}/10</div>
                  </div>
                </div>
                
                {/* Compact Risk Distribution Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>High Risk</span>
                    <span className="font-medium">{risk.highRiskCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-red-500 h-1.5 rounded-full transition-all" 
                      style={{ width: `${(risk.highRiskCount / parishes.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Micro Distribution */}
                <div className="flex space-x-0.5 mt-2">
                  {Object.entries(risk.distribution).map(([level, count], index) => {
                    const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-red-500']
                    const width = count > 0 ? Math.max((count / parishes.length) * 100, 5) : 0
                    return (
                      <div 
                        key={level}
                        className={`h-1 ${colors[index]} rounded-sm transition-all`}
                        style={{ width: `${width}%` }}
                        title={`${level}: ${count} parishes`}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Heatmap-style Matrix Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Risk Heatmap</h3>
            <div className="space-y-1">
              {parishes.slice(0, 10).map(parish => { // Show top 10 for overview
                const avgRisk = Math.round(
                  riskTypes.reduce((sum, risk) => {
                    const riskData = parish.riskProfile[risk.key as keyof typeof parish.riskProfile] as { level: number }
                    return sum + (riskData?.level || 0)
                  }, 0) / riskTypes.length * 10
                ) / 10

                return (
                  <div key={parish.id} className="flex items-center space-x-2">
                    <div className="w-24 text-xs font-medium text-gray-700 truncate">
                      {parish.name}
                    </div>
                    <div className="flex space-x-0.5 flex-1">
                      {riskTypes.map(risk => {
                        const riskData = parish.riskProfile[risk.key as keyof typeof parish.riskProfile] as { level: number }
                        const level = riskData?.level || 0
                        return (
                          <div 
                            key={risk.key}
                            className={`h-4 w-8 rounded-sm ${getRiskColor(level)} ${getRiskIntensity(level)} flex items-center justify-center`}
                            title={`${risk.name}: ${level}/10`}
                          >
                            <span className="text-xs font-bold text-white">{level}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getRiskColor(avgRisk)}`}>
                      {avgRisk}
                    </div>
                  </div>
                )
              })}
            </div>
            {parishes.length > 10 && (
              <button 
                onClick={() => setSelectedView('detailed')}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View all {parishes.length} parishes →
              </button>
            )}
          </div>
        </>
      )}

      {selectedView === 'detailed' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                    Parish
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  {riskTypes.map(risk => (
                    <th key={risk.key} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center space-y-0.5">
                        <span className="text-sm">{risk.icon}</span>
                        <span className="text-xs">{risk.shortName}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parishes.map(parish => {
                  const avgRisk = Math.round(
                    riskTypes.reduce((sum, risk) => {
                      const riskData = parish.riskProfile[risk.key as keyof typeof parish.riskProfile] as { level: number }
                      return sum + (riskData?.level || 0)
                    }, 0) / riskTypes.length * 10
                  ) / 10

                  return (
                    <tr key={parish.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap sticky left-0 bg-white">
                        <div className="text-sm font-medium text-gray-900">{parish.name}</div>
                        <div className="text-xs text-gray-500">{(parish.population / 1000).toFixed(0)}k</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {parish.region}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex space-x-0.5">
                          {parish.isCoastal && (
                            <span className="w-4 h-4 text-xs">🌊</span>
                          )}
                          {parish.isUrban && (
                            <span className="w-4 h-4 text-xs">🏙️</span>
                          )}
                        </div>
                      </td>
                      {riskTypes.map(risk => {
                        const riskData = parish.riskProfile[risk.key as keyof typeof parish.riskProfile] as { level: number }
                        const level = riskData?.level || 0
                        return (
                          <td key={risk.key} className="px-2 py-2 text-center">
                            <div 
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${getRiskColor(level)} ${getRiskIntensity(level)}`}
                            >
                              {level}
                            </div>
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white ${getRiskColor(avgRisk)}`}>
                          {avgRisk}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


