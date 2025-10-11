'use client'

import React from 'react'
import { Parish } from '../../types/admin'
import { getRiskColor, getRiskLabel, getMaxRiskLevel } from '../../utils/riskUtils'
import { RISK_TYPES } from '../../types/admin'

interface ParishOverviewProps {
  parishes: Parish[]
  onParishSelect: (parish: Parish) => void
}

export function ImprovedParishOverview({ parishes, onParishSelect }: ParishOverviewProps) {
  const ParishCard = ({ parish }: { parish: Parish }) => {
    const maxRisk = getMaxRiskLevel(parish.riskProfile)
    
    return (
      <div 
        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
        onClick={() => onParishSelect(parish)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{parish.name}</h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span>{parish.region}</span>
              <span>•</span>
              <span>{parish.population.toLocaleString()} people</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {parish.isCoastal && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                🏖️ Coastal
              </span>
            )}
            {parish.isUrban && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                🏙️ Urban
              </span>
            )}
          </div>
        </div>

        {/* Overall Risk Level */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Risk Level</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getRiskColor(maxRisk)}`}>
              {getRiskLabel(maxRisk)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getRiskColor(maxRisk)}`}
              style={{ width: `${(maxRisk / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Risk Breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Risk Breakdown</div>
          <div className="grid grid-cols-3 gap-2">
            {RISK_TYPES.map(riskType => {
              const riskData = parish.riskProfile[riskType.key as keyof typeof parish.riskProfile]
              const level = typeof riskData === 'object' && riskData !== null && 'level' in riskData ? riskData.level : 0
              return (
                <div key={riskType.key} className="flex items-center space-x-2">
                  <span className="text-sm">{riskType.icon}</span>
                  <span className="text-xs text-gray-600 flex-1">{riskType.name}</span>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getRiskColor(level)}`} />
                    <span className="text-xs font-medium">{level}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Updated by {parish.riskProfile.updatedBy}</span>
            <span>{new Date(parish.riskProfile.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
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

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {parishes.filter(p => getMaxRiskLevel(p.riskProfile) >= 8).length}
            </div>
            <div className="text-sm text-gray-600">High Risk Parishes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {parishes.filter(p => {
                const risk = getMaxRiskLevel(p.riskProfile)
                return risk >= 5 && risk < 8
              }).length}
            </div>
            <div className="text-sm text-gray-600">Medium Risk Parishes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {parishes.filter(p => p.isCoastal).length}
            </div>
            <div className="text-sm text-gray-600">Coastal Parishes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {parishes.filter(p => p.isUrban).length}
            </div>
            <div className="text-sm text-gray-600">Urban Parishes</div>
          </div>
        </div>
      </div>

      {/* Parish Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parishes
          .sort((a, b) => getMaxRiskLevel(b.riskProfile) - getMaxRiskLevel(a.riskProfile))
          .map(parish => (
            <ParishCard key={parish.id} parish={parish} />
          ))}
      </div>
    </div>
  )
}







