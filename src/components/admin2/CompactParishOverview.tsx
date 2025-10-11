'use client'

import React, { useState } from 'react'
import { Parish, RISK_TYPES } from '../../types/admin'
import { getRiskColor, getRiskLabel, getMaxRiskLevel } from '../../utils/riskUtils'

interface ParishOverviewProps {
  parishes: Parish[]
  onParishSelect: (parish: Parish) => void
}

export function CompactParishOverview({ parishes, onParishSelect }: ParishOverviewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('compact')

  const CompactParishCard = ({ parish }: { parish: Parish }) => {
    const maxRisk = getMaxRiskLevel(parish.riskProfile)
    const riskBreakdown = RISK_TYPES.map(riskType => {
      const riskData = parish.riskProfile[riskType.key as keyof typeof parish.riskProfile]
      const level = typeof riskData === 'object' && riskData !== null && 'level' in riskData ? riskData.level : 0
      return { ...riskType, level }
    })
    
    return (
      <div 
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group"
        onClick={() => onParishSelect(parish)}
      >
        {/* Header - More Compact */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{parish.name}</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
              <span>{parish.region}</span>
              <span>•</span>
              <span>{(parish.population / 1000).toFixed(0)}k</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getRiskColor(maxRisk)}`}>
            {maxRisk}
          </div>
        </div>

        {/* Horizontal Risk Breakdown - Much More Compact */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Risk Levels</span>
            <span className="text-xs text-gray-500">{getRiskLabel(maxRisk)}</span>
          </div>
          
          {/* Compact Risk Grid - 2 rows of 3 */}
          <div className="grid grid-cols-3 gap-1 text-xs">
            {riskBreakdown.map(risk => (
              <div key={risk.key} className="flex items-center space-x-1.5 p-1.5 rounded bg-gray-50 group-hover:bg-gray-100">
                <span className="text-xs">{risk.icon}</span>
                <span className="text-xs text-gray-600 truncate flex-1">{risk.name.slice(0,3)}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${getRiskColor(risk.level)}`} />
                <span className="text-xs font-medium w-4 text-right">{risk.level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated - Compact */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{parish.riskProfile.updatedBy}</span>
            <span>{new Date(parish.riskProfile.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    )
  }

  const ListParishRow = ({ parish }: { parish: Parish }) => {
    const maxRisk = getMaxRiskLevel(parish.riskProfile)
    const riskBreakdown = RISK_TYPES.map(riskType => {
      const riskData = parish.riskProfile[riskType.key as keyof typeof parish.riskProfile]
      const level = typeof riskData === 'object' && riskData !== null && 'level' in riskData ? riskData.level : 0
      return { ...riskType, level }
    })
    
    return (
      <tr 
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => onParishSelect(parish)}
      >
        <td className="px-3 py-2">
          <div className="flex items-center space-x-2">
            <div className="font-medium text-sm text-gray-900">{parish.name}</div>
          </div>
          <div className="text-xs text-gray-500">{parish.region} • {(parish.population / 1000).toFixed(0)}k people</div>
        </td>
        
        {/* Compact Risk Cells */}
        {riskBreakdown.map(risk => (
          <td key={risk.key} className="px-2 py-2 text-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${getRiskColor(risk.level)}`}>
              {risk.level}
            </div>
          </td>
        ))}
        
        <td className="px-3 py-2 text-center">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getRiskColor(maxRisk)}`}>
            {maxRisk}
          </div>
        </td>
        
        <td className="px-3 py-2 text-xs text-gray-500">
          {new Date(parish.riskProfile.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </td>
      </tr>
    )
  }

  if (parishes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <span className="text-4xl mb-4 block">🏝️</span>
        <h3 className="text-lg font-medium mb-2">No Parish Data</h3>
        <p>Parish risk data will appear here once loaded</p>
      </div>
    )
  }

  const sortedParishes = parishes.sort((a, b) => getMaxRiskLevel(b.riskProfile) - getMaxRiskLevel(a.riskProfile))

  return (
    <div className="space-y-4">
      {/* Compact Stats Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-700">
                {parishes.filter(p => getMaxRiskLevel(p.riskProfile) >= 8).length} High Risk
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-700">
                {parishes.filter(p => {
                  const risk = getMaxRiskLevel(p.riskProfile)
                  return risk >= 5 && risk < 8
                }).length} Medium Risk
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">
                {0} Coastal
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-purple-700">
                {0} Urban
              </span>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex rounded-md border border-gray-300 bg-white">
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1 text-xs font-medium rounded-l-md transition-colors ${
                viewMode === 'compact' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-medium rounded-r-md transition-colors border-l border-gray-300 ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Content */}
      {viewMode === 'compact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedParishes.map(parish => (
            <CompactParishCard key={parish.id} parish={parish} />
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parish
                  </th>
                  {RISK_TYPES.map(risk => (
                    <th key={risk.key} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <span className="text-sm">{risk.icon}</span>
                        <span className="text-xs">{risk.name.slice(0,4)}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedParishes.map(parish => (
                  <ListParishRow key={parish.id} parish={parish} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


