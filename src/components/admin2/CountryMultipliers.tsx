'use client'

import React, { useState, useEffect } from 'react'

interface CountryMultiplier {
  id: string
  countryCode: string
  construction: number
  equipment: number
  service: number
  supplies: number
  currency: string
  currencySymbol: string
  exchangeRateUSD: number
  confidenceLevel: string
  dataSource?: string
  notes?: string
  country?: {
    name: string
  }
}

export function CountryMultipliers() {
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
        body: JSON.stringify(editValues)
      })
      setEditingId(null)
      fetchMultipliers()
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save multipliers')
    }
  }
  
  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }
  
  const getMultiplierColor = (value: number): string => {
    if (value < 0.8) return 'text-green-600 font-semibold' // Much cheaper
    if (value < 0.95) return 'text-green-700' // Cheaper
    if (value <= 1.05) return 'text-gray-900' // Similar
    if (value <= 1.2) return 'text-orange-600' // More expensive
    return 'text-red-600 font-semibold' // Much more expensive
  }
  
  const getMultiplierLabel = (value: number): string => {
    const percent = ((value - 1) * 100).toFixed(0)
    if (value < 1) return `${Math.abs(parseInt(percent))}% cheaper`
    if (value > 1) return `${percent}% more`
    return 'same'
  }
  
  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>
  }
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Country Multipliers:</strong> Adjust costs based on local market conditions. 
          1.0 = same as USD, 0.7 = 30% cheaper, 1.4 = 40% more expensive. 
          Countries automatically sync from Location Management.
        </p>
      </div>
      
      {multipliers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium mb-2">No country multipliers found</p>
          <p className="text-sm">Countries will auto-sync from Location Management tab</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    🏗️ Construction
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    ⚙️ Equipment
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    🔧 Service
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    📦 Supplies
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {multipliers.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{m.country?.name || m.countryCode}</div>
                      <div className="text-xs text-gray-500">{m.countryCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{m.currency}</div>
                      <div className="text-xs text-gray-500">
                        {m.currencySymbol} (1 USD = {m.exchangeRateUSD})
                      </div>
                    </td>
                    
                    {editingId === m.id ? (
                      <>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            step="0.05"
                            value={editValues.construction || m.construction}
                            onChange={(e) => setEditValues(prev => ({ ...prev, construction: parseFloat(e.target.value) }))}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            step="0.05"
                            value={editValues.equipment || m.equipment}
                            onChange={(e) => setEditValues(prev => ({ ...prev, equipment: parseFloat(e.target.value) }))}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            step="0.05"
                            value={editValues.service || m.service}
                            onChange={(e) => setEditValues(prev => ({ ...prev, service: parseFloat(e.target.value) }))}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            step="0.05"
                            value={editValues.supplies || m.supplies}
                            onChange={(e) => setEditValues(prev => ({ ...prev, supplies: parseFloat(e.target.value) }))}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded"
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-center">
                          <div className={`font-mono ${getMultiplierColor(m.construction)}`}>
                            {m.construction.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getMultiplierLabel(m.construction)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className={`font-mono ${getMultiplierColor(m.equipment)}`}>
                            {m.equipment.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getMultiplierLabel(m.equipment)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className={`font-mono ${getMultiplierColor(m.service)}`}>
                            {m.service.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getMultiplierLabel(m.service)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className={`font-mono ${getMultiplierColor(m.supplies)}`}>
                            {m.supplies.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getMultiplierLabel(m.supplies)}
                          </div>
                        </td>
                      </>
                    )}
                    
                    <td className="px-4 py-3 text-center">
                      {editingId === m.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSave(m.id)}
                            className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(m)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 How to use multipliers:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>1.00</strong> = Cost is the same as USD base price</li>
          <li>• <strong>&lt; 1.00</strong> = Cost is cheaper (e.g., 0.70 = 30% cheaper due to lower labor costs)</li>
          <li>• <strong>&gt; 1.00</strong> = Cost is more expensive (e.g., 1.40 = 40% more due to import duties, island premiums)</li>
          <li>• Different categories can have different multipliers (e.g., labor might be cheap but equipment expensive)</li>
        </ul>
      </div>
    </div>
  )
}

