'use client'

import React from 'react'
import { AdminUnit, RISK_TYPES } from '../../types/admin'

interface AdminUnitWithRisk extends AdminUnit {
  adminUnitRisk?: {
    hurricaneLevel: number
    floodLevel: number
    earthquakeLevel: number
    droughtLevel: number
    landslideLevel: number
    powerOutageLevel: number
    riskProfileJson: string
  }
}

interface AdminUnitRiskMatrixProps {
  adminUnits: AdminUnitWithRisk[]
  onEditUnit?: (unit: AdminUnitWithRisk) => void
}

export function AdminUnitRiskMatrix({ adminUnits, onEditUnit }: AdminUnitRiskMatrixProps) {
  const getRiskColor = (level: number) => {
    if (level >= 8) return 'bg-red-500'
    if (level >= 6) return 'bg-orange-500'
    if (level >= 4) return 'bg-yellow-500'
    if (level >= 2) return 'bg-blue-500'
    return 'bg-gray-300'
  }

  const getRiskIntensity = (level: number) => {
    if (level >= 8) return 'opacity-100'
    if (level >= 6) return 'opacity-75'
    if (level >= 4) return 'opacity-50'
    return 'opacity-25'
  }

  const getRiskLevel = (unit: AdminUnitWithRisk, riskKey: string): number => {
    if (!unit.adminUnitRisk) return 0
    
    const riskMap: Record<string, keyof typeof unit.adminUnitRisk> = {
      hurricane: 'hurricaneLevel',
      flood: 'floodLevel',
      earthquake: 'earthquakeLevel',
      drought: 'droughtLevel',
      landslide: 'landslideLevel',
      powerOutage: 'powerOutageLevel'
    }
    
    const field = riskMap[riskKey]
    if (field && typeof unit.adminUnitRisk[field] === 'number') {
      return unit.adminUnitRisk[field] as number
    }
    
    // Try to get from JSON profile for dynamic risk types
    try {
      const profile = JSON.parse(unit.adminUnitRisk.riskProfileJson || '{}')
      return profile[riskKey]?.level || 0
    } catch {
      return 0
    }
  }

  const getAverageRisk = (unit: AdminUnitWithRisk): number => {
    const risks = RISK_TYPES.map(risk => getRiskLevel(unit, risk.key))
    const sum = risks.reduce((a, b) => a + b, 0)
    return Math.round((sum / risks.length) * 10) / 10
  }

  return (
    <div className="space-y-6">
      {/* Matrix Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Administrative Unit Risk Matrix</h2>
        <p className="text-gray-600 mb-4">
          Visual overview of risk levels across all administrative units. Color intensity indicates risk severity.
        </p>
        
        {/* Legend */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 opacity-25 rounded"></div>
            <span>None (0-1)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 opacity-50 rounded"></div>
            <span>Low (2-3)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 opacity-50 rounded"></div>
            <span>Medium (4-5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 opacity-75 rounded"></div>
            <span>High (6-7)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 opacity-100 rounded"></div>
            <span>Critical (8-10)</span>
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
                  Unit Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Population
                </th>
                {RISK_TYPES.map(risk => (
                  <th key={risk.key} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-lg">{risk.icon}</span>
                      <span className="text-xs">{risk.name.split(' ')[0]}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Risk
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminUnits.length === 0 ? (
                <tr>
                  <td colSpan={RISK_TYPES.length + 6} className="px-6 py-8 text-center text-gray-500">
                    No administrative units found. Select a country and add units to get started.
                  </td>
                </tr>
              ) : (
                adminUnits.map(unit => {
                  const avgRisk = getAverageRisk(unit)
                  return (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                        {unit.localName && (
                          <div className="text-sm text-gray-500">{unit.localName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {unit.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {unit.region || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {unit.population?.toLocaleString() || 'N/A'}
                      </td>
                      {RISK_TYPES.map(risk => {
                        const level = getRiskLevel(unit, risk.key)
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {onEditUnit && (
                          <button
                            onClick={() => onEditUnit(unit)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit Risks
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      {adminUnits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {RISK_TYPES.map(risk => {
            const riskLevels = adminUnits.map(u => getRiskLevel(u, risk.key))
            const avgLevel = Math.round(riskLevels.reduce((sum, level) => sum + level, 0) / riskLevels.length * 10) / 10
            const maxLevel = Math.max(...riskLevels)
            const highRiskCount = riskLevels.filter(level => level >= 8).length

            return (
              <div key={risk.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">{risk.icon}</span>
                  <h3 className="text-sm font-semibold text-gray-900">{risk.name}</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg:</span>
                    <span className="font-medium">{avgLevel}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max:</span>
                    <span className="font-medium">{maxLevel}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">High Risk:</span>
                    <span className="font-medium">{highRiskCount}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


