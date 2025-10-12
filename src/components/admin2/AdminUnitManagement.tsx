'use client'

import React, { useState, useEffect } from 'react'
import { Country, AdminUnit, RISK_TYPES } from '@/types/admin'
import { AdminUnitRiskMatrix } from './AdminUnitRiskMatrix'
import { AdminUnitRiskEditor } from './AdminUnitRiskEditor'
import { BulkUploadModal } from './BulkUploadModal'
import { logger } from '@/utils/logger'

interface AdminUnitWithRisk extends AdminUnit {
  adminUnitRisk?: {
    id: string
    hurricaneLevel: number
    hurricaneNotes: string
    floodLevel: number
    floodNotes: string
    earthquakeLevel: number
    earthquakeNotes: string
    droughtLevel: number
    droughtNotes: string
    landslideLevel: number
    landslideNotes: string
    powerOutageLevel: number
    powerOutageNotes: string
    riskProfileJson: string
    lastUpdated: string
    updatedBy: string
  }
}

type ViewMode = 'list' | 'matrix' | 'editor'

export function AdminUnitManagement() {
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountryId, setSelectedCountryId] = useState<string>('')
  const [adminUnits, setAdminUnits] = useState<AdminUnitWithRisk[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingUnit, setEditingUnit] = useState<AdminUnitWithRisk | null>(null)
  const [editingRiskUnit, setEditingRiskUnit] = useState<AdminUnitWithRisk | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
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
      logger.error('AdminUnitManagement', 'Failed to load countries', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAdminUnits = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin2/admin-units?countryId=${selectedCountryId}&includeRisks=true`)
      const result = await response.json()
      if (result.success) {
        setAdminUnits(result.data)
      }
    } catch (error) {
      logger.error('AdminUnitManagement', 'Failed to load admin units', error)
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

  const handleEdit = (unit: AdminUnitWithRisk) => {
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

  const handleEditRisks = (unit: AdminUnitWithRisk) => {
    setEditingRiskUnit(unit)
    setViewMode('editor')
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
      logger.error('AdminUnitManagement', 'Failed to save admin unit', error)
      alert('Failed to save admin unit')
    }
  }

  const handleUpdateRisks = async (updatedUnit: AdminUnitWithRisk) => {
    try {
      const response = await fetch('/api/admin2/admin-units/risks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUnitId: updatedUnit.id,
          riskData: updatedUnit.adminUnitRisk
        })
      })

      const result = await response.json()
      if (result.success) {
        await loadAdminUnits()
      } else {
        throw new Error(result.error || 'Failed to update risks')
      }
    } catch (error) {
      logger.error('AdminUnitManagement', 'Failed to update risks', error)
      throw error
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
      logger.error('AdminUnitManagement', 'Failed to delete admin unit', error)
      alert('Failed to delete admin unit')
    }
  }

  const handleExportUnits = async () => {
    try {
      const response = await fetch(`/api/admin2/admin-units/export?countryId=${selectedCountryId}`)
      if (!response.ok) {
        throw new Error('Failed to download units data')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const selectedCountry = countries.find(c => c.id === selectedCountryId)
      link.href = url
      link.download = `${selectedCountry?.name || 'country'}_admin_units_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      logger.error('AdminUnitManagement', 'Failed to export units', error)
      alert('Failed to download units data. Please try again.')
    }
  }

  const handleImportUnits = async (file: File, replaceAll: boolean) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('replaceAll', replaceAll.toString())
      formData.append('countryId', selectedCountryId)

      const response = await fetch('/api/admin2/admin-units/import', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      logger.info('AdminUnitManagement', 'Unit import completed', result)
      
      alert(result.message || 'Import completed successfully!')
      
      // Refresh data
      await loadAdminUnits()
      setShowImportModal(false)
    } catch (error) {
      logger.error('AdminUnitManagement', 'Failed to import units', error)
      throw error // Re-throw to be handled by the modal
    }
  }

  const getRiskLevel = (unit: AdminUnitWithRisk, riskKey: string): number => {
    if (!unit.adminUnitRisk) return 0
    
    const riskMap: Record<string, keyof typeof unit.adminUnitRisk> = {
      hurricane: 'hurricaneLevel',
      flood: 'floodLevel',
      earthquake: 'earthquakeLevel',
      drought: 'droughtLevel',
      landslide: 'landslideLevel',
      powerOutage: 'powerOutageLevel'
    }
    
    const field = riskMap[riskKey]
    if (field && typeof unit.adminUnitRisk[field] === 'number') {
      return unit.adminUnitRisk[field] as number
    }
    
    return 0
  }

  const getMaxRiskLevel = (unit: AdminUnitWithRisk): number => {
    const coreRisks = ['hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage']
    const levels = coreRisks.map(risk => getRiskLevel(unit, risk))
    return Math.max(...levels, 0)
  }

  const getRiskColor = (level: number) => {
    if (level >= 8) return 'bg-red-500'
    if (level >= 6) return 'bg-orange-500'
    if (level >= 4) return 'bg-yellow-500'
    if (level >= 2) return 'bg-blue-500'
    return 'bg-gray-300'
  }

  if (isLoading && countries.length === 0) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  const selectedCountry = countries.find(c => c.id === selectedCountryId)

  const ViewModeButton = ({ mode, label, icon }: { mode: ViewMode; label: string; icon: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md border-r border-gray-300 last:border-r-0 ${
        viewMode === mode
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon} {label}
    </button>
  )

  const RiskIndicator = ({ level }: { level: number }) => {
    const getRiskText = (level: number) => {
      if (level >= 8) return 'Critical'
      if (level >= 6) return 'High'
      if (level >= 4) return 'Medium'
      if (level >= 2) return 'Low'
      return 'None'
    }

    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${getRiskColor(level)}`}></div>
        <span className="text-sm font-medium text-gray-900">{level}</span>
        <span className="text-xs text-gray-500">{getRiskText(level)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Country Selector & Toolbar */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Select Country:
            </label>
            <select
              value={selectedCountryId}
              onChange={e => setSelectedCountryId(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="">Choose a country...</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name} ({country.code}) - {adminUnits.filter(u => u.countryId === country.id).length} units
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCountryId && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <nav className="flex border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <ViewModeButton mode="list" label="List" icon="📋" />
                <ViewModeButton mode="matrix" label="Matrix" icon="🔲" />
              </nav>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportUnits}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 shadow-sm transition-colors"
              >
                📤 Import CSV
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                + Add Unit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {selectedCountryId ? (
        <div>
          {viewMode === 'list' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading admin units...</div>
              ) : adminUnits.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Administrative Units</h3>
                  <p className="text-gray-600 mb-4">Get started by adding units or importing from CSV</p>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={handleCreate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      + Add First Unit
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      📤 Import from CSV
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">Name</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Population</th>
                        {RISK_TYPES.map(risk => (
                          <th key={risk.key} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                            <div className="flex flex-col items-center">
                              <span className="text-base">{risk.icon}</span>
                              <span className="text-xs">{risk.name.split(' ')[0]}</span>
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {adminUnits.map(unit => {
                        const maxRisk = getMaxRiskLevel(unit)
                        return (
                          <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 sticky left-0 bg-white z-10 hover:bg-gray-50">
                              <div className="font-medium text-gray-900">{unit.name}</div>
                              {unit.localName && (
                                <div className="text-sm text-gray-500">{unit.localName}</div>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 capitalize whitespace-nowrap">{unit.type}</td>
                            <td className="px-3 py-4 text-sm text-gray-600 whitespace-nowrap">{unit.region || '-'}</td>
                            <td className="px-3 py-4 text-sm text-gray-600 whitespace-nowrap">{unit.population.toLocaleString()}</td>
                            {RISK_TYPES.map(risk => {
                              const level = getRiskLevel(unit, risk.key)
                              return (
                                <td key={risk.key} className="px-2 py-4 text-center">
                                  <div className="flex items-center justify-center">
                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold ${getRiskColor(level)}`}>
                                      {level}
                                    </span>
                                  </div>
                                </td>
                              )
                            })}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <RiskIndicator level={maxRisk} />
                            </td>
                            <td className="px-4 py-4 sticky right-0 bg-white z-10 hover:bg-gray-50">
                              <div className="flex items-center justify-end space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => handleEditRisks(unit)}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  Edit Risks
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => handleEdit(unit)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Edit
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => handleDelete(unit.id)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {viewMode === 'matrix' && (
            <AdminUnitRiskMatrix 
              adminUnits={adminUnits}
              onEditUnit={handleEditRisks}
            />
          )}

          {viewMode === 'editor' && editingRiskUnit && (
            <AdminUnitRiskEditor
              unit={editingRiskUnit}
              onUpdate={handleUpdateRisks}
              onClose={() => {
                setEditingRiskUnit(null)
                setViewMode('list')
              }}
            />
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Country</h3>
          <p className="text-gray-600">Choose a country from the dropdown above to view and manage its administrative units and risk profiles.</p>
        </div>
      )}

      {/* Edit/Create Unit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
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

      {/* Import Modal */}
      <BulkUploadModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUpload={handleImportUnits}
        title="Bulk Upload Administrative Unit Risk Data"
        dataType="admin unit risk"
        description="CSV file with admin unit risk data. Must include Unit Name columns. Risk levels should be on a 0-10 scale."
        exampleWorkflow={[
          'Download current unit data using the "Export CSV" button',
          'Open the CSV file in Excel or Google Sheets',
          'Edit the unit information and risk levels as needed',
          'Save the file as CSV format',
          'Upload the modified file using this import tool'
        ]}
        sampleHeaders={[
          'Unit Name', 'Local Name', 'Type', 'Region', 'Population',
          'Hurricane Level', 'Hurricane Notes', 'Flood Level', 'Flood Notes',
          'Earthquake Level', 'Earthquake Notes', 'Drought Level', 'Drought Notes',
          'Landslide Level', 'Landslide Notes', 'Power Outage Level', 'Power Outage Notes'
        ]}
        warningMessage={`Uploading admin unit data will update risk assessments for ${selectedCountry?.name || 'the selected country'}. This affects the risk calculation system used by businesses.`}
      />
    </div>
  )
}
