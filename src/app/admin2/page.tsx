'use client'

import { useState, useEffect } from 'react'
import { LocationRisksTab } from '@/components/admin2/LocationRisksTab'
import { BusinessTypesTab } from '@/components/admin2/BusinessTypesTab'
import { StrategiesActionsTab } from '@/components/admin2/StrategiesActionsTab'
import { RiskCalculatorTab } from '@/components/admin2/RiskCalculatorTab'
import { Navigation } from '@/components/admin2/Navigation'
import { GlobalAutoSaveProvider, GlobalAutoSaveIndicator } from '@/contexts/GlobalAutoSaveContext'

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

type MainTab = 'locations' | 'business-types' | 'strategies-actions' | 'risk-calculator'

export default function Admin2Page() {
  const [activeTab, setActiveTab] = useState<MainTab>('locations')

  const TabButton = ({ tab, label, icon, description }: { tab: MainTab; label: string; icon: string; description: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab)
        console.log('🎯 Admin2 tab switched to:', tab)
      }}
      className={`flex-1 text-left p-6 rounded-lg border-2 transition-all ${
        activeTab === tab
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center space-x-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className={`text-lg font-semibold ${activeTab === tab ? 'text-blue-900' : 'text-gray-900'}`}>
          {label}
        </h3>
      </div>
      <p className={`text-sm ${activeTab === tab ? 'text-blue-700' : 'text-gray-600'}`}>
        {description}
      </p>
    </button>
  )

  return (
    <GlobalAutoSaveProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏝️ Jamaica Business Risk Management Platform
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional risk assessment combining location-based hazards with business-type vulnerabilities 
              to create customized risk profiles for Jamaica SMEs
            </p>
            <GlobalAutoSaveIndicator className="text-center mt-4" />
          </div>

          {/* Main Tab Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TabButton
              tab="locations"
              label="Location Risks"
              icon="🌊"
              description="Manage parish-level environmental risks: hurricanes, floods, earthquakes, and more across all 14 Jamaica parishes"
            />
            <TabButton
              tab="business-types"
              label="Business Types"
              icon="🏢"
              description="Configure SME vulnerability profiles: understand how different business types are affected by various risks"
            />
            <TabButton
              tab="strategies-actions"
              label="Strategies & Actions"
              icon="🛡️"
              description="Manage the library of risk mitigation strategies and detailed action plans for businesses"
            />
            <TabButton
              tab="risk-calculator"
              label="Risk Calculator"
              icon="🎯"
              description="Interactive risk calculator: combine location + business type to generate customized risk profiles and strategies"
            />
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'locations' && <LocationRisksTab />}
        {activeTab === 'business-types' && <BusinessTypesTab />}
        {activeTab === 'strategies-actions' && <StrategiesActionsTab />}
        {activeTab === 'risk-calculator' && <RiskCalculatorTab />}
      </div>
      </div>
    </GlobalAutoSaveProvider>
  )
}
