'use client'

import { useState, useEffect } from 'react'
import { LocationRisksTab } from '@/components/admin2/LocationRisksTab'
import { BusinessTypesTab } from '@/components/admin2/BusinessTypesTab'
import { StrategiesActionsTab } from '@/components/admin2/StrategiesActionsTab'
import { RiskCalculatorTab } from '@/components/admin2/RiskCalculatorTab'
import { Navigation } from '@/components/admin2/Navigation'
import { GlobalAutoSaveProvider, GlobalAutoSaveIndicator } from '@/contexts/GlobalAutoSaveContext'
import Image from 'next/image'

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

  const TabButton = ({ tab, label, description }: { tab: MainTab; label: string; description: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab)
        console.log('🎯 Admin2 tab switched to:', tab)
      }}
      className={`text-left p-8 transition-all duration-200 border-l-4 ${
        activeTab === tab
          ? 'border-l-blue-600 bg-white shadow-sm'
          : 'border-l-transparent bg-gray-50 hover:bg-white hover:shadow-sm'
      }`}
    >
      <h3 className={`text-xl font-medium mb-3 ${activeTab === tab ? 'text-blue-600' : 'text-gray-700'}`}>
        {label}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </button>
  )

  return (
    <GlobalAutoSaveProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Image 
                  src="/undp-logo.png" 
                  alt="UNDP Logo" 
                  width={60} 
                  height={60}
                  className="h-15 w-auto"
                />
                <div>
                  <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                    Jamaica Business Risk Management Platform
                  </h1>
                  <p className="text-lg text-gray-600 font-light mt-1">
                    Professional risk assessment and business continuity planning
                  </p>
                </div>
              </div>
              <GlobalAutoSaveIndicator />
            </div>

            {/* Main Tab Navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 bg-gray-100 rounded-lg p-1">
              <TabButton
                tab="locations"
                label="Location Risks"
                description="Manage parish-level environmental risks: hurricanes, floods, earthquakes, and more across all 14 Jamaica parishes"
              />
              <TabButton
                tab="business-types"
                label="Business Types"
                description="Configure SME vulnerability profiles: understand how different business types are affected by various risks"
              />
              <TabButton
                tab="strategies-actions"
                label="Strategies & Actions"
                description="Manage the library of risk mitigation strategies and detailed action plans for businesses"
              />
              <TabButton
                tab="risk-calculator"
                label="Risk Calculator"
                description="Interactive risk calculator: combine location + business type to generate customized risk profiles and strategies"
              />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {activeTab === 'locations' && <LocationRisksTab />}
            {activeTab === 'business-types' && <BusinessTypesTab />}
            {activeTab === 'strategies-actions' && <StrategiesActionsTab />}
            {activeTab === 'risk-calculator' && <RiskCalculatorTab />}
          </div>
        </div>
      </div>
    </GlobalAutoSaveProvider>
  )
}
