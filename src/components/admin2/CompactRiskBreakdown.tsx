'use client'

import React, { useState } from 'react'

interface RiskData {
  level: number
  notes: string
}

interface RiskProfile {
  [key: string]: RiskData
}

interface Risk {
  key: string
  name: string
  icon: string
  shortName: string
}

interface CompactRiskBreakdownProps {
  riskProfile: RiskProfile
  riskTypes: Risk[]
  title?: string
  showDetailed?: boolean
  orientation?: 'horizontal' | 'vertical' | 'grid'
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export function CompactRiskBreakdown({ 
  riskProfile, 
  riskTypes, 
  title = "Risk Breakdown",
  showDetailed = false,
  orientation = 'horizontal',
  size = 'sm'
}: CompactRiskBreakdownProps) {
  const [hoveredRisk, setHoveredRisk] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'bars' | 'dots' | 'icons'>('bars')

  const getRiskColor = (level: number) => {
    if (level >= 8) return { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-200' }
    if (level >= 6) return { bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-200' }
    if (level >= 4) return { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200' }
    return { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-200' }
  }

  const getRiskLabel = (level: number) => {
    if (level >= 8) return 'High'
    if (level >= 6) return 'Medium'
    if (level >= 4) return 'Low-Med'
    return 'Low'
  }

  const sizeClasses = {
    xs: { text: 'text-xs', padding: 'p-1', gap: 'gap-1', height: 'h-1', icon: 'text-xs' },
    sm: { text: 'text-sm', padding: 'p-2', gap: 'gap-2', height: 'h-2', icon: 'text-sm' },
    md: { text: 'text-base', padding: 'p-3', gap: 'gap-3', height: 'h-3', icon: 'text-base' },
    lg: { text: 'text-lg', padding: 'p-4', gap: 'gap-4', height: 'h-4', icon: 'text-lg' }
  }

  const classes = sizeClasses[size]

  const riskData = riskTypes.map(risk => {
    const data = riskProfile[risk.key] || { level: 0, notes: '' }
    return {
      ...risk,
      level: data.level,
      notes: data.notes,
      color: getRiskColor(data.level),
      label: getRiskLabel(data.level)
    }
  })

  const maxRisk = Math.max(...riskData.map(r => r.level))
  const avgRisk = Math.round(riskData.reduce((sum, r) => sum + r.level, 0) / riskData.length * 10) / 10

  // Bar Chart Visualization
  const BarsView = () => (
    <div className={`space-y-${size === 'xs' ? '1' : '2'}`}>
      {orientation === 'horizontal' ? (
        // Horizontal bars
        <div className="space-y-1">
          {riskData.map(risk => (
            <div key={risk.key} className="flex items-center space-x-2">
              <div className={`w-12 ${classes.text} text-gray-600 truncate`}>
                <span className={classes.icon}>{risk.icon}</span>
                <span className="ml-1">{risk.shortName || risk.name.slice(0, 4)}</span>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                <div 
                  className={`${risk.color.bg} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${(risk.level / 10) * 100}%` }}
                />
              </div>
              <div className={`w-8 text-right ${classes.text} font-medium ${risk.color.text}`}>
                {risk.level}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vertical bars
        <div className="flex items-end space-x-1 h-16">
          {riskData.map(risk => (
            <div key={risk.key} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full ${risk.color.bg} rounded-t transition-all duration-300`}
                style={{ height: `${(risk.level / 10) * 100}%` }}
                onMouseEnter={() => setHoveredRisk(risk.key)}
                onMouseLeave={() => setHoveredRisk(null)}
              />
              <div className={`${classes.text} text-gray-600 mt-1 text-center`}>
                <div className={classes.icon}>{risk.icon}</div>
                <div className="text-xs">{risk.level}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Dot Matrix Visualization
  const DotsView = () => (
    <div className="flex items-center space-x-2">
      {riskData.map(risk => (
        <div key={risk.key} className="flex flex-col items-center space-y-1">
          <span className={classes.icon}>{risk.icon}</span>
          <div className="flex space-x-0.5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i < risk.level ? risk.color.bg : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className={`${classes.text} font-medium ${risk.color.text}`}>
            {risk.level}
          </span>
        </div>
      ))}
    </div>
  )

  // Icon-based Visualization
  const IconsView = () => (
    <div className={orientation === 'grid' ? 'grid grid-cols-3 gap-2' : 'flex items-center space-x-3'}>
      {riskData.map(risk => (
        <div 
          key={risk.key} 
          className={`flex items-center space-x-2 ${classes.padding} rounded-lg ${risk.color.bg} bg-opacity-10 ${risk.color.border} border`}
          onMouseEnter={() => setHoveredRisk(risk.key)}
          onMouseLeave={() => setHoveredRisk(null)}
        >
          <span className={`${classes.icon} ${risk.color.text}`}>{risk.icon}</span>
          <div className="flex-1 min-w-0">
            <div className={`${classes.text} font-medium ${risk.color.text} truncate`}>
              {risk.shortName || risk.name}
            </div>
            <div className="text-xs text-gray-500">{risk.label}</div>
          </div>
          <div className={`${classes.text} font-bold ${risk.color.text}`}>
            {risk.level}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className={`${classes.text} font-medium text-gray-700`}>{title}</h4>
        
        {showDetailed && (
          <div className="flex items-center space-x-2">
            <div className={`${classes.text} text-gray-500`}>
              Max: {maxRisk} • Avg: {avgRisk}
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex rounded border border-gray-300 bg-white">
              {['bars', 'dots', 'icons'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-2 py-1 text-xs font-medium transition-colors first:rounded-l last:rounded-r ${
                    viewMode === mode 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visualization */}
      <div className="relative">
        {viewMode === 'bars' && <BarsView />}
        {viewMode === 'dots' && <DotsView />}
        {viewMode === 'icons' && <IconsView />}
        
        {/* Hover Tooltip */}
        {hoveredRisk && (
          <div className="absolute top-0 left-0 bg-black text-white text-xs rounded px-2 py-1 z-10 pointer-events-none">
            {riskData.find(r => r.key === hoveredRisk)?.name}: {riskData.find(r => r.key === hoveredRisk)?.level}/10
            {riskData.find(r => r.key === hoveredRisk)?.notes && (
              <div className="text-gray-300 mt-1">
                {riskData.find(r => r.key === hoveredRisk)?.notes?.slice(0, 50)}...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Bar */}
      {showDetailed && (
        <div className={`flex items-center justify-between ${classes.padding} bg-gray-50 rounded border border-gray-200`}>
          <div className={`${classes.text} text-gray-600`}>
            Overall Risk Level
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className={`${getRiskColor(maxRisk).bg} h-2 rounded-full transition-all`}
                style={{ width: `${(maxRisk / 10) * 100}%` }}
              />
            </div>
            <div className={`${classes.text} font-bold ${getRiskColor(maxRisk).text}`}>
              {maxRisk}/10
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Specialized variants for common use cases
export function HorizontalRiskBar({ riskProfile, riskTypes, size = 'sm' }: Omit<CompactRiskBreakdownProps, 'orientation'>) {
  return (
    <CompactRiskBreakdown 
      riskProfile={riskProfile} 
      riskTypes={riskTypes} 
      orientation="horizontal"
      size={size}
      title=""
    />
  )
}

export function RiskIconGrid({ riskProfile, riskTypes, size = 'xs' }: Omit<CompactRiskBreakdownProps, 'orientation' | 'showDetailed'>) {
  return (
    <CompactRiskBreakdown 
      riskProfile={riskProfile} 
      riskTypes={riskTypes} 
      orientation="grid"
      size={size}
      showDetailed={false}
      title=""
    />
  )
}

export function MiniRiskDots({ riskProfile, riskTypes }: Omit<CompactRiskBreakdownProps, 'orientation' | 'showDetailed' | 'size'>) {
  return (
    <CompactRiskBreakdown 
      riskProfile={riskProfile} 
      riskTypes={riskTypes} 
      orientation="horizontal"
      size="xs"
      showDetailed={false}
      title=""
    />
  )
}


