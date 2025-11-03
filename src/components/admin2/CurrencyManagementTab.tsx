'use client'

import React, { useState } from 'react'
import { CostItemsLibrary } from './CostItemsLibrary'
import { CountryMultipliers } from './CountryMultipliers'
import { ExchangeRates } from './ExchangeRates'

type SubTab = 'items' | 'multipliers' | 'rates'

export function CurrencyManagementTab() {
  const [subTab, setSubTab] = useState<SubTab>('items')
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">💰 Currency & Cost Management</h2>
        <p className="text-gray-600">
          Manage cost items, country multipliers, and exchange rates for automatic multi-currency pricing across the Caribbean region.
        </p>
      </div>
      
      {/* Sub-tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <nav className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setSubTab('items')}
            className={`flex-1 py-4 px-6 font-medium text-sm transition-all relative ${
              subTab === 'items'
                ? 'bg-white text-green-600 border-b-2 border-green-600 -mb-px'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">📦</span>
              <span>Cost Items Library</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Define reusable cost items in USD
            </p>
          </button>
          
          <button
            onClick={() => setSubTab('multipliers')}
            className={`flex-1 py-4 px-6 font-medium text-sm transition-all relative ${
              subTab === 'multipliers'
                ? 'bg-white text-green-600 border-b-2 border-green-600 -mb-px'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">🌍</span>
              <span>Country Multipliers</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Adjust for local market conditions
            </p>
          </button>
          
          <button
            onClick={() => setSubTab('rates')}
            className={`flex-1 py-4 px-6 font-medium text-sm transition-all relative ${
              subTab === 'rates'
                ? 'bg-white text-green-600 border-b-2 border-green-600 -mb-px'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">💱</span>
              <span>Exchange Rates</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Manage currency conversions
            </p>
          </button>
        </nav>
        
        {/* Content */}
        <div className="p-6">
          {subTab === 'items' && <CostItemsLibrary />}
          {subTab === 'multipliers' && <CountryMultipliers />}
          {subTab === 'rates' && <ExchangeRates />}
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 How the Currency System Works</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-3">
              1️⃣
            </div>
            <h4 className="font-semibold text-gray-900">Define Cost Items</h4>
            <p className="text-sm text-gray-600">
              Create cost items once with USD base prices. Add price ranges, categories, and metadata. 
              These become your reusable cost library.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl mb-3">
              2️⃣
            </div>
            <h4 className="font-semibold text-gray-900">Set Country Multipliers</h4>
            <p className="text-sm text-gray-600">
              Adjust multipliers per country and category to account for local labor costs, import duties, 
              and market conditions. 1.0 = same as USD.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl mb-3">
              3️⃣
            </div>
            <h4 className="font-semibold text-gray-900">Auto-Calculate Costs</h4>
            <p className="text-sm text-gray-600">
              Link cost items to strategies and action steps. The system automatically calculates and displays 
              costs in users' local currencies.
            </p>
          </div>
        </div>
        
        {/* Formula Explanation */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">📐 Calculation Formula:</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-800">
            Local Cost = (Base USD × Category Multiplier × Exchange Rate) × Quantity
          </div>
          <p className="text-xs text-gray-600 mt-2">
            <strong>Example:</strong> Hurricane shutters ($450 USD base) in Haiti with 0.70 construction multiplier 
            and 132 HTG/USD rate = G 41,580 HTG per window
          </p>
        </div>
      </div>
    </div>
  )
}

