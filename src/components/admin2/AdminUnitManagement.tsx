'use client'

import React, { useState, useEffect } from 'react'
import { Country, AdminUnit } from '@/types/admin'

export function AdminUnitManagement() {
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountryId, setSelectedCountryId] = useState<string>('')
  const [adminUnits, setAdminUnits] = useState<AdminUnit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingUnit, setEditingUnit] = useState<AdminUnit | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    localName: '',
    type: 'parish',
    region: '',
    population: 0
  })

  useEffect(() => {
    loadCountries()
  }, [])

  useEffect(() => {
    if (selectedCountryId) {
      loadAdminUnits()
    }
  }, [selectedCountryId])

  const loadCountries = async () => {
    try {
      const response = await fetch('/api/admin2/countries?activeOnly=true')
      const result = await response.json()
      if (result.success) {
        setCountries(result.data)
        if (result.data.length > 0 && !selectedCountryId) {
          setSelectedCountryId(result.data[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load countries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAdminUnits = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin2/admin-units?countryId=${selectedCountryId}`)
      const result = await response.json()
      if (result.success) {
        setAdminUnits(result.data)
      }
    } catch (error) {
      console.error('Failed to load admin units:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUnit(null)
    setFormData({
      name: '',
      localName: '',
      type: 'parish',
      region: '',
      population: 0
    })
    setIsEditing(true)
  }

  const handleEdit = (unit: AdminUnit) => {
    setEditingUnit(unit)
    setFormData({
      name: unit.name,
      localName: unit.localName || '',
      type: unit.type,
      region: unit.region || '',
      population: unit.population
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!selectedCountryId) {
      alert('Please select a country first')
      return
    }

    try {
      const url = '/api/admin2/admin-units'
      const method = editingUnit ? 'PUT' : 'POST'
      const body = editingUnit
        ? { id: editingUnit.id, ...formData }
        : { ...formData, countryId: selectedCountryId }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      if (result.success) {
        await loadAdminUnits()
        setIsEditing(false)
        setEditingUnit(null)
      } else {
        alert('Failed to save admin unit: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to save admin unit:', error)
      alert('Failed to save admin unit')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this administrative unit?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin2/admin-units?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        await loadAdminUnits()
      } else {
        alert('Failed to delete admin unit: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to delete admin unit:', error)
      alert('Failed to delete admin unit')
    }
  }

  if (isLoading && countries.length === 0) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  const selectedCountry = countries.find(c => c.id === selectedCountryId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Administrative Units</h2>
          <p className="text-gray-600 mt-1">Manage administrative divisions (parishes, districts, states, etc.)</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={!selectedCountryId}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          + Add Admin Unit
        </button>
      </div>

      {/* Country Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Country
        </label>
        <select
          value={selectedCountryId}
          onChange={e => setSelectedCountryId(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a country...</option>
          {countries.map(country => (
            <option key={country.id} value={country.id}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>
      </div>

      {/* Admin Units List */}
      {selectedCountryId && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedCountry?.name} - {adminUnits.length} Administrative Units
            </h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading admin units...</div>
          ) : adminUnits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No administrative units found. Click "Add Admin Unit" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Population</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adminUnits.map(unit => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{unit.name}</div>
                        {unit.localName && (
                          <div className="text-sm text-gray-500">{unit.localName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{unit.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{unit.region || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{unit.population.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(unit)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(unit.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit/Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingUnit ? 'Edit Administrative Unit' : 'Create Administrative Unit'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Kingston"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local Name
                </label>
                <input
                  type="text"
                  value={formData.localName}
                  onChange={e => setFormData({ ...formData, localName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Local language name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="parish">Parish</option>
                  <option value="district">District</option>
                  <option value="state">State</option>
                  <option value="province">Province</option>
                  <option value="region">Region</option>
                  <option value="municipality">Municipality</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={e => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Kingston Metropolitan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Population
                </label>
                <input
                  type="number"
                  value={formData.population}
                  onChange={e => setFormData({ ...formData, population: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditingUnit(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

