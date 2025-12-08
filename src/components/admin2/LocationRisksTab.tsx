'use client'

import React, { useState } from 'react'
import { CountryManagement } from './CountryManagement'
import { AdminUnitManagement } from './AdminUnitManagement'

type MainTab = 'countries' | 'admin-units'

export function LocationRisksTab() {
  const [mainTab, setMainTab] = useState<MainTab>('admin-units')

  return (
    <div className="space-y-6">
      {/* Section Header with better spacing */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📍 Location & Risk Management</h2>
        <p className="text-gray-600">Manage countries, administrative units, and their location-based risk profiles</p>
      </div>

      {/* Main Tabs with better design */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <nav className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setMainTab('countries')}
            className={`flex-1 py-4 px-6 font-medium text-sm transition-all relative ${
              mainTab === 'countries'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">🌍</span>
              <span>Countries</span>
            </div>
            {mainTab === 'countries' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => setMainTab('admin-units')}
            className={`flex-1 py-4 px-6 font-medium text-sm transition-all relative ${
              mainTab === 'admin-units'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">📊</span>
              <span>Administrative Units & Risk Profiles</span>
            </div>
            {mainTab === 'admin-units' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
            )}
          </button>
        </nav>

        {/* Tab Content with padding */}
        <div className="p-6">
          {mainTab === 'countries' && <CountryManagement />}
          {mainTab === 'admin-units' && <AdminUnitManagement />}
        </div>
      </div>
    </div>
  )
}
