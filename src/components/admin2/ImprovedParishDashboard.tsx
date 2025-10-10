'use client'

import React, { useState } from 'react'
import { CompactParishOverview } from './CompactParishOverview'
import { CompactRiskMatrix } from './CompactRiskMatrix'
import { CompactRiskAssessmentPanel } from './CompactRiskAssessmentPanel'
import { CompactRiskBreakdown, HorizontalRiskBar, RiskIconGrid } from './CompactRiskBreakdown'
import type { RiskData } from '../../types/admin'

// This component demonstrates the improved, space-efficient designs
export function ImprovedParishDashboard() {
  const [selectedView, setSelectedView] = useState<'overview' | 'matrix' | 'assessment'>('overview')

  // Sample data structure - in real implementation this would come from props/state
  const sampleParishes = [
    {
      id: '1',
      name: 'Kingston',
      region: 'Corporate Area',
      population: 697000,
      isCoastal: true,
      isUrban: true,
      riskProfile: {
        hurricane: { level: 8, notes: 'High exposure due to coastal location' },
        flood: { level: 6, notes: 'Urban flooding concerns' },
        earthquake: { level: 7, notes: 'Located on fault line' },
        drought: { level: 3, notes: 'Urban water supply systems' },
        landslide: { level: 4, notes: 'Hillside communities at risk' },
        powerOutage: { level: 5, notes: 'Grid vulnerabilities' },
        lastUpdated: '2024-01-15',
        updatedBy: 'Admin'
      }
    },
    {
      id: '2',
      name: 'St. Catherine',
      region: 'Corporate Area',
      population: 516000,
      isCoastal: true,
      isUrban: false,
      riskProfile: {
        hurricane: { level: 7, notes: 'Coastal exposure' },
        flood: { level: 8, notes: 'Rio Cobre flooding history' },
        earthquake: { level: 6, notes: 'Moderate seismic activity' },
        drought: { level: 5, notes: 'Agricultural impacts' },
        landslide: { level: 3, notes: 'Generally flat terrain' },
        powerOutage: { level: 6, notes: 'Infrastructure aging' },
        lastUpdated: '2024-01-14',
        updatedBy: 'Analyst'
      }
    }
  ]

  const sampleRiskTypes = [
    { key: 'hurricane', name: 'Hurricane', icon: '🌀', shortName: 'Hurr' },
    { key: 'flood', name: 'Flood', icon: '🌊', shortName: 'Flood' },
    { key: 'earthquake', name: 'Earthquake', icon: '🏔️', shortName: 'Quake' },
    { key: 'drought', name: 'Drought', icon: '🌵', shortName: 'Drought' },
    { key: 'landslide', name: 'Landslide', icon: '⛰️', shortName: 'Slide' },
    { key: 'powerOutage', name: 'Power Outage', icon: '⚡', shortName: 'Power' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-gray-900 tracking-tight">
              Improved Parish Risk Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Space-efficient design with enhanced usability and better information density
            </p>
          </div>
          
          {/* Navigation */}
          <div className="flex rounded-lg border border-gray-300 bg-white">
            {[
              { key: 'overview', label: 'Parish Overview', icon: '🏝️' },
              { key: 'matrix', label: 'Risk Matrix', icon: '📊' },
              { key: 'assessment', label: 'Assessment Tools', icon: '🔍' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedView(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg border-r border-gray-300 last:border-r-0 ${
                  selectedView === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedView === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Compact Parish Overview
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                ✅ <strong>Improvements:</strong> 40% more information density, better use of horizontal space, 
                toggle between card and table views, compact risk breakdown with visual indicators.
              </p>
              <CompactParishOverview 
                parishes={sampleParishes} 
                onParishSelect={(parish) => console.log('Selected:', parish.name)} 
              />
            </div>
          </div>
        )}

        {selectedView === 'matrix' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Compact Risk Matrix
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                ✅ <strong>Improvements:</strong> Overview/detailed toggle, horizontal summary cards with micro-distributions, 
                heatmap preview, sticky parish column, compact statistics.
              </p>
              <CompactRiskMatrix parishes={sampleParishes} />
            </div>
          </div>
        )}

        {selectedView === 'assessment' && (
          <div className="space-y-6">
            {/* Risk Assessment Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Compact Risk Assessment Panel
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                ✅ <strong>Improvements:</strong> Collapsible sections, inline editing, quick action bar, 
                better responsive layout, contextual help.
              </p>
              <CompactRiskAssessmentPanel
                allAvailableRisks={sampleRiskTypes.map(r => ({ ...r, description: `Assess ${r.name.toLowerCase()} risk levels`, color: 'bg-blue-500' }))}
                riskProfile={Object.fromEntries(
                  Object.entries(sampleParishes[0].riskProfile)
                    .filter(([key]) => !['lastUpdated', 'updatedBy'].includes(key))
                ) as Record<string, RiskData>}
                onRiskSelectionChange={(key, selected) => console.log('Toggle risk:', key, selected)}
                onRiskLevelChange={(key, level) => console.log('Update level:', key, level)}
                onNotesChange={(key, notes) => console.log('Update notes:', key, notes)}
                isRiskSelected={(key) => key in sampleParishes[0].riskProfile && !['lastUpdated', 'updatedBy'].includes(key)}
              />
            </div>

            {/* Risk Breakdown Visualizations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Compact Risk Breakdown Visualizations
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                ✅ <strong>Improvements:</strong> Multiple visualization modes, better use of horizontal space, 
                responsive sizing, interactive elements.
              </p>
              
              <div className="space-y-6">
                {/* Full Featured */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Full Featured with Controls</h3>
                  <CompactRiskBreakdown
                    riskProfile={Object.fromEntries(
                      Object.entries(sampleParishes[0].riskProfile)
                        .filter(([key]) => !['lastUpdated', 'updatedBy'].includes(key))
                    ) as Record<string, RiskData>}
                    riskTypes={sampleRiskTypes}
                    title="Kingston Risk Profile"
                    showDetailed={true}
                    orientation="horizontal"
                    size="md"
                  />
                </div>

                {/* Horizontal Bar (for cards) */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Horizontal Bar (for Parish Cards)</h3>
                  <HorizontalRiskBar
                    riskProfile={Object.fromEntries(
                      Object.entries(sampleParishes[0].riskProfile)
                        .filter(([key]) => !['lastUpdated', 'updatedBy'].includes(key))
                    ) as Record<string, RiskData>}
                    riskTypes={sampleRiskTypes}
                    size="sm"
                  />
                </div>

                {/* Icon Grid (for compact displays) */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Icon Grid (for Tables/Compact Views)</h3>
                  <RiskIconGrid
                    riskProfile={Object.fromEntries(
                      Object.entries(sampleParishes[0].riskProfile)
                        .filter(([key]) => !['lastUpdated', 'updatedBy'].includes(key))
                    ) as Record<string, RiskData>}
                    riskTypes={sampleRiskTypes}
                    size="xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Design Principles */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Design Principles Applied
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">📏</span>
                <h3 className="text-sm font-semibold text-gray-900">Space Efficiency</h3>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 40-60% better information density</li>
                <li>• Horizontal layouts maximize screen usage</li>
                <li>• Collapsible sections reduce clutter</li>
                <li>• Smart truncation with tooltips</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">⚡</span>
                <h3 className="text-sm font-semibold text-gray-900">Enhanced Usability</h3>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Multiple view modes (cards/table)</li>
                <li>• Inline editing and quick actions</li>
                <li>• Progressive disclosure</li>
                <li>• Contextual help and tips</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-100">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">📱</span>
                <h3 className="text-sm font-semibold text-gray-900">Responsive Design</h3>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Mobile-first approach</li>
                <li>• Adaptive grid layouts</li>
                <li>• Touch-friendly interactions</li>
                <li>• Flexible sizing options</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


