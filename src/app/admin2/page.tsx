'use client'

import { useState, useEffect } from 'react'
import { LocationRisksTab } from '@/components/admin2/LocationRisksTab'
import { BusinessTypesTab } from '@/components/admin2/BusinessTypesTab'
import { ImprovedStrategiesActionsTab } from '@/components/admin2/ImprovedStrategiesActionsTab'
import { ImprovedRiskCalculatorTab } from '@/components/admin2/ImprovedRiskCalculatorTab'
import RiskMultipliersTab from '@/components/admin2/RiskMultipliersTab'
import { UNDPHeader } from '@/components/admin2/UNDPHeader'
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

type MainTab = 'locations' | 'business-types' | 'strategies-actions' | 'risk-calculator' | 'risk-multipliers'

export default function Admin2Page() {
  const [activeTab, setActiveTab] = useState<MainTab>('locations')

  const TabButton = ({ tab, label }: { tab: MainTab; label: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab)
        console.log('🎯 Admin2 tab switched to:', tab)
      }}
      className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
        activeTab === tab
          ? 'border-blue-600 text-blue-600 bg-blue-50'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )

  return (
    <GlobalAutoSaveProvider>
      <div className="min-h-screen bg-white">
        <UNDPHeader />
        
        {/* Main Navigation */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <nav className="flex space-x-0">
                <TabButton tab="locations" label="Location Risks" />
                <TabButton tab="business-types" label="Business Types" />
                <TabButton tab="strategies-actions" label="Strategies & Actions" />
                <TabButton tab="risk-multipliers" label="Risk Multipliers" />
                <TabButton tab="risk-calculator" label="Risk Calculator" />
              </nav>
              <div className="px-6 py-3">
                <GlobalAutoSaveIndicator />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'locations' && <LocationRisksTab />}
          {activeTab === 'business-types' && <BusinessTypesTab />}
          {activeTab === 'strategies-actions' && <ImprovedStrategiesActionsTab />}
          {activeTab === 'risk-multipliers' && <RiskMultipliersTab />}
          {activeTab === 'risk-calculator' && <ImprovedRiskCalculatorTab />}
        </div>
      </div>
    </GlobalAutoSaveProvider>
  )
}
