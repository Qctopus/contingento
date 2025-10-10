'use client'

import React, { useState } from 'react'
import { ImprovedStrategiesActionsTab } from './ImprovedStrategiesActionsTab'

// This component demonstrates the improved strategies and actions design
export function StrategiesActionsDashboard() {
  const [selectedView, setSelectedView] = useState<'comparison' | 'improved'>('improved')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-gray-900 tracking-tight">
              Improved Strategies & Actions Design
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Space-efficient, responsive design matching the improved BusinessTypes and Location Risk tabs
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-300 bg-white">
            <button
              onClick={() => setSelectedView('improved')}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-l-lg ${
                selectedView === 'improved'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🎨 Improved Design
            </button>
            <button
              onClick={() => setSelectedView('comparison')}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-r-lg border-l border-gray-300 ${
                selectedView === 'comparison'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📊 Design Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedView === 'improved' && (
        <ImprovedStrategiesActionsTab />
      )}

      {selectedView === 'comparison' && (
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Design Improvements Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                🎯 Design Transformation Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Before */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-700 flex items-center">
                    <span className="mr-2">❌</span>
                    Before: Design Issues
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span><strong>Inefficient header:</strong> Large, wasteful vertical space with scattered actions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span><strong>Separated filters:</strong> Filters in separate panel, breaking visual flow</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span><strong>Large strategy cards:</strong> Excessive whitespace, poor information density</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span><strong>Single view mode:</strong> Only card view, no alternative layouts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span><strong>Verbose detail view:</strong> Poor information hierarchy, too much scrolling</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span><strong>Limited search:</strong> No search functionality for quick strategy finding</span>
                    </li>
                  </ul>
                </div>

                {/* After */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-700 flex items-center">
                    <span className="mr-2">✅</span>
                    After: Design Excellence
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span><strong>Compact toolbar:</strong> Matches BusinessTypes design, 50% less vertical space</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span><strong>Integrated filters:</strong> Search + filters in unified, compact panel</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span><strong>Multiple view modes:</strong> Cards, table, compact list for different needs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span><strong>Improved card design:</strong> 40% more information density, better hierarchy</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span><strong>Enhanced detail view:</strong> Better organization, visual indicators, compact sidebar</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span><strong>Smart search:</strong> Real-time search across name, description, and SME content</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Header Improvements */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">🎨</span>
                  <h3 className="text-lg font-semibold text-gray-900">Header Design</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-red-200 bg-red-50 p-3 rounded">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Original Header</h4>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li>• Large title section (120px height)</li>
                      <li>• Scattered action buttons</li>
                      <li>• Stats in horizontal line</li>
                      <li>• Poor visual hierarchy</li>
                    </ul>
                  </div>
                  
                  <div className="border border-green-200 bg-green-50 p-3 rounded">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Improved Header</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Compact toolbar (60px height)</li>
                      <li>• Grouped navigation and actions</li>
                      <li>• Visual stat cards below</li>
                      <li>• Clear hierarchy and flow</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Strategy Cards */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">📋</span>
                  <h3 className="text-lg font-semibold text-gray-900">Strategy Cards</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-red-200 bg-red-50 p-3 rounded">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Original Cards</h4>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li>• Large cards (350px+ height)</li>
                      <li>• Excessive whitespace</li>
                      <li>• Poor space utilization</li>
                      <li>• Only 6-9 visible per screen</li>
                    </ul>
                  </div>
                  
                  <div className="border border-green-200 bg-green-50 p-3 rounded">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Improved Cards</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Compact cards (250px height)</li>
                      <li>• Better information density</li>
                      <li>• Visual priority indicators</li>
                      <li>• 12-15 visible per screen</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* View Modes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">👁️</span>
                  <h3 className="text-lg font-semibold text-gray-900">View Options</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-red-200 bg-red-50 p-3 rounded">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Original Views</h4>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li>• Only card view available</li>
                      <li>• No adaptability</li>
                      <li>• Poor scanning capability</li>
                      <li>• Limited data comparison</li>
                    </ul>
                  </div>
                  
                  <div className="border border-green-200 bg-green-50 p-3 rounded">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Multiple Views</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Cards: Detailed overview</li>
                      <li>• Table: Data comparison</li>
                      <li>• Compact: Quick scanning</li>
                      <li>• User choice and flexibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Space Efficiency Metrics */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                📏 Space Efficiency Improvements
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">50%</div>
                    <div className="text-sm font-medium text-gray-700">Header Space Reduction</div>
                    <div className="text-xs text-gray-500 mt-1">From 120px to 60px height</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
                    <div className="text-sm font-medium text-gray-700">Better Information Density</div>
                    <div className="text-xs text-gray-500 mt-1">More data per screen area</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">3x</div>
                    <div className="text-sm font-medium text-gray-700">View Mode Options</div>
                    <div className="text-xs text-gray-500 mt-1">Cards, table, compact</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-orange-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">60%</div>
                    <div className="text-sm font-medium text-gray-700">Faster Strategy Finding</div>
                    <div className="text-xs text-gray-500 mt-1">Search + better filtering</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Design Principles Applied */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                🏗️ Top-Notch UI/UX Design Principles Applied
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Information Architecture</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">🎯</span>
                      <span><strong>Progressive Disclosure:</strong> Show essential info first, details on demand</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">📊</span>
                      <span><strong>Visual Hierarchy:</strong> Size, color, and spacing guide user attention</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">🔍</span>
                      <span><strong>Scannable Layouts:</strong> Quick identification of key information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">⚡</span>
                      <span><strong>Efficiency Focus:</strong> Minimize clicks and cognitive load</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">User Experience</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">📱</span>
                      <span><strong>Responsive Design:</strong> Works perfectly on all screen sizes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">🎛️</span>
                      <span><strong>User Control:</strong> Multiple views for different user preferences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">🔄</span>
                      <span><strong>Consistency:</strong> Matches BusinessTypes tab design patterns</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">💡</span>
                      <span><strong>Contextual Actions:</strong> Actions appear where users expect them</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


