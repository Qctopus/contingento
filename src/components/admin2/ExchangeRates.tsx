'use client'

import React, { useState, useEffect } from 'react'

interface CountryMultiplier {
  id: string
  countryCode: string
  currency: string
  currencySymbol: string
  exchangeRateUSD: number
  lastUpdated: string
  dataSource?: string
  confidenceLevel: string
  notes?: string
  country?: {
    name: string
  }
}

export function ExchangeRates() {
  const [multipliers, setMultipliers] = useState<CountryMultiplier[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<CountryMultiplier>>({})
  
  useEffect(() => {
    fetchMultipliers()
  }, [])
  
  const fetchMultipliers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin2/country-multipliers')
      const data = await res.json()
      setMultipliers(data.multipliers || [])
    } catch (error) {
      console.error('Failed to fetch multipliers:', error)
    }
    setLoading(false)
  }
  
  const handleEdit = (multiplier: CountryMultiplier) => {
    setEditingId(multiplier.id)
    setEditValues(multiplier)
  }
  
  const handleSave = async (id: string) => {
    try {
      await fetch(`/api/admin2/country-multipliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editValues,
          updatedBy: 'admin'
        })
      })
      setEditingId(null)
      fetchMultipliers()
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save exchange rate')
    }
  }
  
  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>
  }
  
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          <strong>⚠️ Exchange Rates:</strong> These rates convert USD base prices to local currencies. 
          Update them regularly to ensure accurate cost estimates. Consider integrating with a currency API for automatic updates.
        </p>
      </div>
      
      {multipliers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium mb-2">No exchange rates configured</p>
          <p className="text-sm">Add countries in Location Management to configure exchange rates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {multipliers.map(m => (
            <div
              key={m.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-all"
            >
              {editingId === m.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {m.country?.name || m.countryCode}
                      </h3>
                      <p className="text-sm text-gray-500">{m.countryCode}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Code
                      </label>
                      <input
                        type="text"
                        value={editValues.currency || m.currency}
                        onChange={(e) => setEditValues(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Symbol
                      </label>
                      <input
                        type="text"
                        value={editValues.currencySymbol || m.currencySymbol}
                        onChange={(e) => setEditValues(prev => ({ ...prev, currencySymbol: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exchange Rate (How many {editValues.currency || m.currency} = 1 USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editValues.exchangeRateUSD || m.exchangeRateUSD}
                      onChange={(e) => setEditValues(prev => ({ ...prev, exchangeRateUSD: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Example: If 1 USD = 157.50 JMD, enter 157.50
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Source
                      </label>
                      <input
                        type="text"
                        value={editValues.dataSource || m.dataSource || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, dataSource: e.target.value }))}
                        placeholder="e.g., World Bank, Manual"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confidence Level
                      </label>
                      <select
                        value={editValues.confidenceLevel || m.confidenceLevel}
                        onChange={(e) => setEditValues(prev => ({ ...prev, confidenceLevel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editValues.notes || m.notes || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(m.id)}
                      className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {m.country?.name || m.countryCode}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        m.confidenceLevel === 'high' ? 'bg-green-100 text-green-800' :
                        m.confidenceLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {m.confidenceLevel} confidence
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Currency:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {m.currency} ({m.currencySymbol})
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Exchange Rate:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          1 USD = {m.exchangeRateUSD} {m.currency}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Last Updated:</span>{' '}
                        <span className="text-gray-700">
                          {formatDate(m.lastUpdated)}
                        </span>
                      </div>
                      
                      {m.dataSource && (
                        <div>
                          <span className="text-gray-500">Source:</span>{' '}
                          <span className="text-gray-700">{m.dataSource}</span>
                        </div>
                      )}
                    </div>
                    
                    {m.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">{m.notes}</p>
                    )}
                    
                    {/* Conversion Examples */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Quick conversions:</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span>$100 USD = {m.currencySymbol}{(100 * m.exchangeRateUSD).toFixed(0)}</span>
                        <span>$500 USD = {m.currencySymbol}{(500 * m.exchangeRateUSD).toFixed(0)}</span>
                        <span>$1,000 USD = {m.currencySymbol}{(1000 * m.exchangeRateUSD).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEdit(m)}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Best Practices:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Update exchange rates at least monthly for accurate cost estimates</li>
          <li>• Use official central bank rates or reliable currency APIs</li>
          <li>• Document your data source for audit purposes</li>
          <li>• Set confidence level based on rate stability (high = stable, low = volatile)</li>
          <li>• Consider using mid-market rates rather than bank buy/sell rates</li>
        </ul>
      </div>
    </div>
  )
}

