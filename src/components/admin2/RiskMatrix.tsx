'use client'

import React from 'react'

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

export function RiskMatrix({ parishes }: RiskMatrixProps) {
  const riskTypes = [
    { key: 'hurricane', name: 'Hurricane', icon: '🌀' },
    { key: 'flood', name: 'Flood', icon: '🌊' },
    { key: 'earthquake', name: 'Earthquake', icon: '🏔️' },
    { key: 'drought', name: 'Drought', icon: '🌵' },
    { key: 'landslide', name: 'Landslide', icon: '⛰️' },
    { key: 'powerOutage', name: 'Power', icon: '⚡' }
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

  return (
    <div className="space-y-6">
      {/* Matrix Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Parish Risk Matrix</h2>
        <p className="text-gray-600 mb-4">
          Visual overview of risk levels across all Jamaica parishes. Color intensity indicates risk severity.
        </p>
        
        {/* Legend */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 opacity-25 rounded"></div>
            <span>Low (0-3)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 opacity-50 rounded"></div>
            <span>Low-Med (4-5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 opacity-75 rounded"></div>
            <span>Medium (6-7)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 opacity-100 rounded"></div>
            <span>High (8-10)</span>
          </div>
        </div>
      </div>

      {/* Risk Matrix Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parish
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                {riskTypes.map(risk => (
                  <th key={risk.key} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-lg">{risk.icon}</span>
                      <span>{risk.name}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Risk
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{parish.name}</div>
                      <div className="text-sm text-gray-500">Pop: {parish.population.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parish.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {parish.isCoastal && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            🌊
                          </span>
                        )}
                        {parish.isUrban && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            🏙️
                          </span>
                        )}
                      </div>
                    </td>
                    {riskTypes.map(risk => {
                      const riskData = parish.riskProfile[risk.key as keyof typeof parish.riskProfile] as { level: number }
                      const level = riskData?.level || 0
                      return (
                        <td key={risk.key} className="px-3 py-4 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getRiskColor(level)} ${getRiskIntensity(level)}`}
                            >
                              {level}
                            </div>
                          </div>
                        </td>
                      )
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold text-white ${getRiskColor(avgRisk)}`}>
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

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {riskTypes.map(risk => {
          const riskLevels = parishes.map(p => {
            const riskData = p.riskProfile[risk.key as keyof typeof p.riskProfile] as { level: number }
            return riskData?.level || 0
          })
          const avgLevel = Math.round(riskLevels.reduce((sum, level) => sum + level, 0) / riskLevels.length * 10) / 10
          const maxLevel = Math.max(...riskLevels)
          const highRiskCount = riskLevels.filter(level => level >= 8).length

          return (
            <div key={risk.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{risk.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{risk.name}</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Level:</span>
                  <span className="font-medium">{avgLevel}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Maximum Level:</span>
                  <span className="font-medium">{maxLevel}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">High Risk Parishes:</span>
                  <span className="font-medium">{highRiskCount}</span>
                </div>
              </div>

              {/* Risk Level Distribution */}
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Distribution:</div>
                <div className="space-y-1">
                  {[
                    { label: 'Low (0-3)', count: riskLevels.filter(l => l <= 3).length, color: 'bg-green-500' },
                    { label: 'Low-Med (4-5)', count: riskLevels.filter(l => l >= 4 && l <= 5).length, color: 'bg-blue-500' },
                    { label: 'Medium (6-7)', count: riskLevels.filter(l => l >= 6 && l <= 7).length, color: 'bg-yellow-500' },
                    { label: 'High (8-10)', count: riskLevels.filter(l => l >= 8).length, color: 'bg-red-500' }
                  ].map(item => (
                    <div key={item.label} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded ${item.color} opacity-75`}></div>
                      <span className="text-xs text-gray-600 flex-1">{item.label}</span>
                      <span className="text-xs font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

