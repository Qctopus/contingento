'use client'

import React, { useState, useEffect } from 'react'
import { Country } from '@/types/admin'

export function CountryManagement() {
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [formData, setFormData] = useState({ name: '', code: '', region: '' })

  useEffect(() => {
    loadCountries()
  }, [])

  const loadCountries = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin2/countries')
      const result = await response.json()
      if (result.success) {
        setCountries(result.data)
      }
    } catch (error) {
      console.error('Failed to load countries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCountry(null)
    setFormData({ name: '', code: '', region: '' })
    setIsEditing(true)
  }

  const handleEdit = (country: Country) => {
    setEditingCountry(country)
    setFormData({ 
      name: country.name, 
      code: country.code, 
      region: country.region || '' 
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      const url = '/api/admin2/countries'
      const method = editingCountry ? 'PUT' : 'POST'
      const body = editingCountry 
        ? { id: editingCountry.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      if (result.success) {
        await loadCountries()
        setIsEditing(false)
        setEditingCountry(null)
        setFormData({ name: '', code: '', region: '' })
      } else {
        alert('Failed to save country: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to save country:', error)
      alert('Failed to save country')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country? This will also delete all associated admin units.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin2/countries?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        await loadCountries()
      } else {
        alert('Failed to delete country: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to delete country:', error)
      alert('Failed to delete country')
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading countries...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Countries</h2>
          <p className="text-gray-600 mt-1">Manage countries and their administrative units</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Country
        </button>
      </div>

      {/* Countries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {countries.map(country => (
          <div
            key={country.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{country.name}</h3>
                <p className="text-sm text-gray-600">{country.code}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(country)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(country.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {country.region && <div>Region: {country.region}</div>}
              <div>Admin Units: {country._count?.adminUnits || 0}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingCountry ? 'Edit Country' : 'Create Country'}
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
                  placeholder="e.g., Trinidad and Tobago"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Code * (ISO 2-letter)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., TT"
                />
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
                  placeholder="e.g., Caribbean"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditingCountry(null)
                  setFormData({ name: '', code: '', region: '' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.code}
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

