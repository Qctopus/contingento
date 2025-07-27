'use client'

import { useState, useEffect } from 'react'

interface BusinessType {
  id: string
  businessTypeId: string
  name: string
  localName: string
  category: string
  description?: string
  isActive: boolean
}

interface HazardType {
  id: string
  hazardId: string
  name: string
  category: string
  description?: string
  defaultFrequency: string
  defaultImpact: string
  isActive: boolean
}

interface BusinessTypeHazardMapping {
  id: string
  businessTypeId: string
  hazardId: string
  riskLevel: string
  frequency?: string
  impact?: string
  notes?: string
  businessType: BusinessType
  hazard: HazardType
}

interface Strategy {
  id: string
  strategyId: string
  title: string
  description: string
  category: string
  reasoning?: string
  icon?: string
  isActive: boolean
}

interface Location {
  id: string
  country: string
  countryCode: string
  parish?: string
  isCoastal: boolean
  isUrban: boolean
  isActive: boolean
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('business-types')
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [hazards, setHazards] = useState<HazardType[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [businessTypeHazardMappings, setBusinessTypeHazardMappings] = useState<BusinessTypeHazardMapping[]>([])
  const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit'>('add')
  const [modalEntity, setModalEntity] = useState<'business-type' | 'hazard' | 'strategy' | 'location' | 'mapping'>('business-type')
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Load business types
      const businessTypesRes = await fetch('/api/admin/business-types')
      if (businessTypesRes.ok) {
        const { businessTypes: btData } = await businessTypesRes.json()
        setBusinessTypes(btData)
      }

      // Load hazards
      const hazardsRes = await fetch('/api/admin/hazards')
      if (hazardsRes.ok) {
        const { hazards: hazardData } = await hazardsRes.json()
        setHazards(hazardData)
      }

      // Load strategies
      const strategiesRes = await fetch('/api/admin/strategies')
      if (strategiesRes.ok) {
        const { strategies: strategyData } = await strategiesRes.json()
        setStrategies(strategyData)
      }

      // Load business type hazard mappings
      const mappingsRes = await fetch('/api/admin/business-type-hazards')
      if (mappingsRes.ok) {
        const { mappings: mappingData } = await mappingsRes.json()
        setBusinessTypeHazardMappings(mappingData)
      }

      // Load locations
      const locationsRes = await fetch('/api/admin/locations')
      if (locationsRes.ok) {
        const { locations: locationData } = await locationsRes.json()
        setLocations(locationData)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (entity: typeof modalEntity, type: typeof modalType, item?: any) => {
    setModalEntity(entity)
    setModalType(type)
    setEditingItem(item || null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
  }

  // CRUD Operations
  const handleSave = async (entityType: typeof modalEntity, data: any) => {
    try {
      setLoading(true)
      
      if (modalType === 'add') {
        await handleCreate(entityType, data)
      } else {
        await handleUpdate(entityType, data)
      }
      
      closeModal()
      await loadData() // Refresh data
    } catch (error) {
      console.error('Save failed:', error)
      setError(`Failed to save ${entityType}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (entityType: typeof modalEntity, data: any) => {
    const endpoints = {
      'business-type': '/api/admin/business-types',
      'hazard': '/api/admin/hazards',
      'location': '/api/admin/locations',
      'strategy': '/api/admin/strategies',
      'mapping': '/api/admin/business-type-hazards'
    }

    const response = await fetch(endpoints[entityType], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Failed to create ${entityType}`)
    }
  }

  const handleUpdate = async (entityType: typeof modalEntity, data: any) => {
    const endpoints = {
      'business-type': '/api/admin/business-types',
      'hazard': '/api/admin/hazards',
      'location': '/api/admin/locations',
      'strategy': '/api/admin/strategies',
      'mapping': '/api/admin/business-type-hazards'
    }

    const response = await fetch(endpoints[entityType], {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Failed to update ${entityType}`)
    }
  }

  const handleDelete = async (entityType: typeof modalEntity, id: string) => {
    try {
      setLoading(true)
      
      const endpoints = {
        'business-type': '/api/admin/business-types',
        'hazard': '/api/admin/hazards',
        'location': '/api/admin/locations',
        'strategy': '/api/admin/strategies',
        'mapping': '/api/admin/business-type-hazards'
      }

      const response = await fetch(`${endpoints[entityType]}?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete ${entityType}`)
      }

      await loadData() // Refresh data
    } catch (error) {
      console.error('Delete failed:', error)
      setError(`Failed to delete ${entityType}`)
    } finally {
      setLoading(false)
    }
  }

  // Modal Component
  const AdminModal = () => {
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
      if (editingItem) {
        setFormData(editingItem)
      } else {
        // Initialize empty form based on entity type
        const initialData = {
          'business-type': {
            businessTypeId: '',
            name: '',
            localName: '',
            category: '',
            description: '',
            typicalOperatingHours: '',
            minimumStaff: '',
            minimumEquipment: '[]',
            minimumUtilities: '[]',
            minimumSpace: '',
            essentialFunctions: '{}',
            criticalSuppliers: '[]',
            exampleBusinessPurposes: '[]',
            exampleProducts: '[]',
            exampleKeyPersonnel: '[]',
            exampleCustomerBase: '[]'
          },
          'hazard': {
            hazardId: '',
            name: '',
            category: '',
            description: '',
            defaultFrequency: 'medium',
            defaultImpact: 'medium'
          },
          'location': {
            country: '',
            countryCode: '',
            parish: '',
            isCoastal: false,
            isUrban: false
          },
          'strategy': {
            strategyId: '',
            title: '',
            description: '',
            category: 'prevention',
            reasoning: '',
            icon: ''
          },
          'mapping': {
            businessTypeId: editingItem?.businessTypeId || '',
            hazardId: '',
            riskLevel: 'medium',
            frequency: '',
            impact: '',
            notes: ''
          }
        }
        setFormData(initialData[modalEntity] || {})
      }
    }, [modalEntity, editingItem])

    const updateField = (field: string, value: any) => {
      setFormData((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      handleSave(modalEntity, formData)
    }

    if (!showModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {modalType === 'add' ? 'Add' : 'Edit'} {modalEntity.replace('-', ' ')}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {modalEntity === 'business-type' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                    <input
                      type="text"
                      value={formData.businessTypeId || ''}
                      onChange={(e) => updateField('businessTypeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., grocery_store"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="retail">Retail</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="services">Services</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="tourism">Tourism</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Grocery Store"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local Name</label>
                  <input
                    type="text"
                    value={formData.localName || ''}
                    onChange={(e) => updateField('localName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Local Grocery/Mini-Mart"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Brief description of this business type"
                  />
                </div>
              </div>
            )}

            {modalEntity === 'hazard' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                    <input
                      type="text"
                      value={formData.hazardId || ''}
                      onChange={(e) => updateField('hazardId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., hurricane"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="natural">Natural</option>
                      <option value="technological">Technological</option>
                      <option value="human">Human</option>
                      <option value="environmental">Environmental</option>
                      <option value="economic">Economic</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Hurricane"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Description of this hazard"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Frequency</label>
                    <select
                      value={formData.defaultFrequency || ''}
                      onChange={(e) => updateField('defaultFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="very_low">Very Low</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="very_high">Very High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Impact</label>
                    <select
                      value={formData.defaultImpact || ''}
                      onChange={(e) => updateField('defaultImpact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="very_low">Very Low</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="very_high">Very High</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {modalEntity === 'location' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country || ''}
                      onChange={(e) => updateField('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Jamaica"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
                    <input
                      type="text"
                      value={formData.countryCode || ''}
                      onChange={(e) => updateField('countryCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., JM"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parish/Region</label>
                  <input
                    type="text"
                    value={formData.parish || ''}
                    onChange={(e) => updateField('parish', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Kingston"
                  />
                </div>
                <div className="flex space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isCoastal"
                      checked={formData.isCoastal || false}
                      onChange={(e) => updateField('isCoastal', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isCoastal" className="ml-2 block text-sm text-gray-900">
                      🌊 Coastal Area
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isUrban"
                      checked={formData.isUrban || false}
                      onChange={(e) => updateField('isUrban', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isUrban" className="ml-2 block text-sm text-gray-900">
                      🏙️ Urban Area
                    </label>
                  </div>
                </div>
              </div>
            )}

            {modalEntity === 'strategy' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                    <input
                      type="text"
                      value={formData.strategyId || ''}
                      onChange={(e) => updateField('strategyId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., backup_power"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="prevention">Prevention</option>
                      <option value="response">Response</option>
                      <option value="recovery">Recovery</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Backup Power System"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Detailed description of the strategy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reasoning</label>
                  <textarea
                    value={formData.reasoning || ''}
                    onChange={(e) => updateField('reasoning', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Why this strategy is effective"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={formData.icon || ''}
                    onChange={(e) => updateField('icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ⚡"
                  />
                </div>
              </div>
            )}

            {modalEntity === 'mapping' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                    <select
                      value={formData.businessTypeId || ''}
                      onChange={(e) => updateField('businessTypeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map(bt => (
                        <option key={bt.businessTypeId} value={bt.businessTypeId}>
                          {bt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hazard</label>
                    <select
                      value={formData.hazardId || ''}
                      onChange={(e) => updateField('hazardId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select hazard</option>
                      {hazards.map(h => (
                        <option key={h.hazardId} value={h.hazardId}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                  <select
                    value={formData.riskLevel || ''}
                    onChange={(e) => updateField('riskLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="very_low">Very Low</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency Override</label>
                    <select
                      value={formData.frequency || ''}
                      onChange={(e) => updateField('frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Use default</option>
                      <option value="very_low">Very Low</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="very_high">Very High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Impact Override</label>
                    <select
                      value={formData.impact || ''}
                      onChange={(e) => updateField('impact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Use default</option>
                      <option value="very_low">Very Low</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="very_high">Very High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Additional notes about this risk mapping"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (modalType === 'add' ? 'Create' : 'Update')}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const TabButton = ({ id, label, isActive, onClick }: { 
    id: string
    label: string
    isActive: boolean
    onClick: () => void 
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )

  const BusinessTypesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Business Types</h2>
        <button 
          onClick={() => openModal('business-type', 'add')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Add Business Type
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businessTypes.map((businessType) => (
                <tr key={businessType.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {businessType.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {businessType.localName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {businessType.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {businessType.businessTypeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      businessType.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {businessType.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => openModal('business-type', 'edit', businessType)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this business type?')) {
                          handleDelete('business-type', businessType.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const HazardsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Hazard Types</h2>
        <button 
          onClick={() => openModal('hazard', 'add')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Add Hazard Type
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hazards.map((hazard) => (
                <tr key={hazard.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {hazard.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {hazard.hazardId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {hazard.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>Frequency: {hazard.defaultFrequency}</div>
                      <div>Impact: {hazard.defaultImpact}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      hazard.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {hazard.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => openModal('hazard', 'edit', hazard)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this hazard?')) {
                          handleDelete('hazard', hazard.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const LocationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Locations & Geography</h2>
        <button 
          onClick={() => openModal('location', 'add')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Add Location
        </button>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">🌍 Location-Based Risk Factors</h3>
        <p className="text-purple-800 text-sm">
          Manage geographical locations and their risk characteristics. Coastal and urban settings automatically modify business risks. Add all Jamaica parishes and other Caribbean territories.
        </p>
      </div>

      {/* Group by country */}
      {['Jamaica', 'Barbados', 'Trinidad and Tobago'].map(country => {
        const countryLocations = locations.filter(l => l.country === country)
        
        return (
          <div key={country} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <span>🏝️</span>
                <span>{country}</span>
                <span className="text-sm font-normal text-gray-500">({countryLocations.length} locations)</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parish/Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Characteristics</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {countryLocations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {location.parish || 'Country Level'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {location.isCoastal && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              🌊 Coastal
                            </span>
                          )}
                          {location.isUrban && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              🏙️ Urban
                            </span>
                          )}
                          {!location.isCoastal && !location.isUrban && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              🌳 Rural
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {location.countryCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => openModal('location', 'edit', location)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this location?')) {
                              handleDelete('location', location.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {countryLocations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No locations defined for {country}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )

  const StrategiesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Business Continuity Strategies</h2>
        <button 
          onClick={() => openModal('strategy', 'add')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Add Strategy
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">🛡️ Strategy Management</h3>
        <p className="text-green-800 text-sm">
          Manage the business continuity strategies that are recommended to users based on their risk assessments. Strategies are organized into three categories: Prevention, Response, and Recovery.
        </p>
      </div>

      {/* Group strategies by category */}
      {['prevention', 'response', 'recovery'].map(category => {
        const categoryStrategies = strategies.filter(s => s.category === category)
        const categoryEmoji = {
          prevention: '🛡️',
          response: '🚨', 
          recovery: '🔄'
        }[category]
        
        return (
          <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <span>{categoryEmoji}</span>
                <span>{category.charAt(0).toUpperCase() + category.slice(1)} Strategies</span>
                <span className="text-sm font-normal text-gray-500">({categoryStrategies.length})</span>
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {categoryStrategies.map((strategy) => (
                <div key={strategy.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{strategy.icon}</span>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{strategy.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                          {strategy.reasoning && (
                            <p className="text-xs text-gray-500 mt-2 italic">💡 {strategy.reasoning}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        strategy.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {strategy.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button 
                        onClick={() => openModal('strategy', 'edit', strategy)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this strategy?')) {
                            handleDelete('strategy', strategy.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {categoryStrategies.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No {category} strategies defined yet.
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  const MappingsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Risk Relationship Matrix</h2>
        <button 
          onClick={() => openModal('mapping', 'add')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Add Risk Mapping
        </button>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 mb-2">🎯 Dynamic Risk Logic</h3>
        <p className="text-orange-800 text-sm">
          <strong>Business Type Risk + Location Modifiers = Final Risk Profile</strong><br/>
          Configure base vulnerabilities for each business type. The system will automatically apply location-based modifiers (coastal, urban, country-specific) on top of these base risks.
        </p>
      </div>

      {/* Business Type Risk Matrix */}
      <div className="grid gap-6">
        {businessTypes.map((businessType) => {
          const businessRisks = businessTypeHazardMappings.filter(m => m.businessTypeId === businessType.businessTypeId)
          
          return (
            <div key={businessType.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                      <span>{businessType.category === 'retail' ? '🏪' : businessType.category === 'hospitality' ? '🍽️' : businessType.category === 'services' ? '💇‍♀️' : '🏢'}</span>
                      <span>{businessType.name}</span>
                      <span className="text-sm font-normal text-gray-500">({businessType.category})</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{businessRisks.length} risk mappings configured</p>
                  </div>
                  <button 
                    onClick={() => openModal('mapping', 'add', { businessTypeId: businessType.businessTypeId })}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    + Add Risk
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {businessRisks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {businessRisks.map((mapping) => (
                      <div key={mapping.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{mapping.hazard.name}</h4>
                            <p className="text-xs text-gray-500">{mapping.hazard.category}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            mapping.riskLevel === 'very_high' ? 'bg-red-200 text-red-900' :
                            mapping.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                            mapping.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            mapping.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {mapping.riskLevel.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Frequency: {mapping.frequency || mapping.hazard.defaultFrequency}</div>
                          <div>Impact: {mapping.impact || mapping.hazard.defaultImpact}</div>
                          {mapping.notes && <div>Notes: {mapping.notes}</div>}
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-3">
                          <button 
                            onClick={() => openModal('mapping', 'edit', mapping)}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Remove this risk mapping?')) {
                                handleDelete('mapping', mapping.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No risk mappings configured for this business type.</p>
                    <button 
                      onClick={() => openModal('mapping', 'add', { businessTypeId: businessType.businessTypeId })}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium mt-2"
                    >
                      + Add your first risk mapping
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium">{error}</div>
          <button 
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🔧 Business Continuity Admin
              </h1>
              <p className="text-gray-600 mt-2">
                Manage business types, hazards, and their relationships
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {businessTypes.length} Business Types • {hazards.length} Hazards • {locations.length} Locations • {strategies.length} Strategies • {businessTypeHazardMappings.length} Risk Mappings
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <TabButton
            id="business-types"
            label="Business Types"
            isActive={activeTab === 'business-types'}
            onClick={() => setActiveTab('business-types')}
          />
          <TabButton
            id="hazards"
            label="Hazard Types"
            isActive={activeTab === 'hazards'}
            onClick={() => setActiveTab('hazards')}
          />
          <TabButton
            id="locations"
            label="Locations"
            isActive={activeTab === 'locations'}
            onClick={() => setActiveTab('locations')}
          />
          <TabButton
            id="mappings"
            label="Risk Mappings"
            isActive={activeTab === 'mappings'}
            onClick={() => setActiveTab('mappings')}
          />
          <TabButton
            id="strategies"
            label="Strategies"
            isActive={activeTab === 'strategies'}
            onClick={() => setActiveTab('strategies')}
          />
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'business-types' && <BusinessTypesTab />}
          {activeTab === 'hazards' && <HazardsTab />}
          {activeTab === 'locations' && <LocationsTab />}
          {activeTab === 'mappings' && <MappingsTab />}
          {activeTab === 'strategies' && <StrategiesTab />}
        </div>
      </div>
      <AdminModal />
    </div>
  )
} 