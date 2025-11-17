'use client'

import React from 'react'
import { BusinessType } from '../../types/admin'
import { getAverageRiskLevel, getRiskColor } from '../../utils/riskUtils'
import { BUSINESS_CATEGORIES } from '../../constants/admin'

interface BusinessTypeOverviewProps {
  businessTypes: BusinessType[]
  onBusinessTypeSelect: (businessType: BusinessType) => void
  onRefresh: () => void
}

export function BusinessTypeOverview({ businessTypes, onBusinessTypeSelect, onRefresh }: BusinessTypeOverviewProps) {
  const getBusinessTypeRiskLevel = (businessType: BusinessType): number => {
    if (!businessType.riskVulnerabilities || businessType.riskVulnerabilities.length === 0) {
      return 0
    }
    
    const avgVulnerability = businessType.riskVulnerabilities.reduce((sum, risk) => 
      sum + risk.vulnerabilityLevel, 0) / businessType.riskVulnerabilities.length
    
    return Math.round(avgVulnerability)
  }
  
  const getDisplayName = (name: string | any): string => {
    if (!name) return ''
    
    // If it's already an object (multilingual)
    if (typeof name === 'object' && name !== null) {
      return name.en || name.fr || name.es || ''
    }
    
    // If it's a string, try to parse as JSON
    if (typeof name === 'string') {
      try {
        const parsed = JSON.parse(name)
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed.en || parsed.fr || parsed.es || name
        }
        return name
      } catch {
        return name
      }
    }
    
    return String(name)
  }

  return (
    <div className="space-y-6">
      {/* Business Types Grid by Category */}
      {BUSINESS_CATEGORIES.map(category => {
        const categoryBusinessTypes = businessTypes.filter(bt => bt.category === category)
        if (categoryBusinessTypes.length === 0) return null

        return (
          <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {category} ({categoryBusinessTypes.length})
              </h3>
              <div className="text-sm text-gray-500">
                Avg Risk: {Math.round(categoryBusinessTypes.reduce((sum, bt) => sum + getBusinessTypeRiskLevel(bt), 0) / categoryBusinessTypes.length || 0)}/10
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBusinessTypes.map(businessType => {
                const avgRisk = getBusinessTypeRiskLevel(businessType)
                return (
                  <div
                    key={businessType.id}
                    onClick={() => onBusinessTypeSelect(businessType)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{getDisplayName(businessType.name)}</h4>
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(avgRisk)}`} title={`Risk Level: ${avgRisk}/10`}></div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{getDisplayName(businessType.description || '') || 'No description available'}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>📊 Risk Profiles: {businessType.riskVulnerabilities?.length || 0}</div>
                      <div>📝 Example Fields: {[businessType.exampleProducts, businessType.exampleKeyPersonnel, businessType.exampleCustomerBase, businessType.minimumEquipment, businessType.exampleBusinessPurposes].filter(Boolean).length}/5</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{businessTypes.length}</div>
            <div className="text-sm text-blue-700">Total Business Types</div>
          </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {businessTypes.filter(bt => getBusinessTypeRiskLevel(bt) < 4).length}
              </div>
              <div className="text-sm text-green-700">Low Risk</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {businessTypes.filter(bt => {
                  const risk = getBusinessTypeRiskLevel(bt)
                  return risk >= 4 && risk < 7
                }).length}
              </div>
              <div className="text-sm text-yellow-700">Medium Risk</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {businessTypes.filter(bt => getBusinessTypeRiskLevel(bt) >= 7).length}
              </div>
              <div className="text-sm text-red-700">High Risk</div>
            </div>
        </div>
      </div>
    </div>
  )
}