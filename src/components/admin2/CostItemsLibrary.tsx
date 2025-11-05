'use client'

import React, { useState, useEffect } from 'react'
import { CostItemEditor } from './CostItemEditor'
import { parseMultilingualJSON } from '@/utils/localizationUtils'

interface CostItem {
  id: string
  itemId: string
  name: string
  description?: string
  category: string
  baseUSD: number
  baseUSDMin?: number
  baseUSDMax?: number
  unit?: string
  complexity: string
  isActive: boolean
  _count?: {
    strategyItems: number
    actionStepItems: number
  }
}

// Helper to get English text from multilingual field
const getEnglishText = (value: string | undefined): string => {
  if (!value) return ''
  try {
    const parsed = parseMultilingualJSON(value)
    return parsed?.en || value
  } catch {
    return value
  }
}

export function CostItemsLibrary() {
  const [items, setItems] = useState<CostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [editingItem, setEditingItem] = useState<CostItem | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  
  useEffect(() => {
    fetchItems()
  }, [])
  
  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin2/cost-items')
      const data = await res.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Failed to fetch cost items:', error)
    }
    setLoading(false)
  }
  
  const handleCreateNew = () => {
    setEditingItem(null)
    setShowEditor(true)
  }
  
  const handleEdit = (item: CostItem) => {
    setEditingItem(item)
    setShowEditor(true)
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cost item? This will remove it from all strategies.')) return
    
    try {
      await fetch(`/api/admin2/cost-items/${id}`, { method: 'DELETE' })
      fetchItems()
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Failed to delete item')
    }
  }
  
  const handleSave = () => {
    setShowEditor(false)
    fetchItems()
  }
  
  const filteredItems = items.filter(item => {
    // Parse multilingual fields for search
    const nameText = getEnglishText(item.name)
    const descText = getEnglishText(item.description)
    
    const matchesSearch = nameText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descText.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    return matchesSearch && matchesCategory && item.isActive
  })
  
  if (showEditor) {
    return (
      <CostItemEditor
        item={editingItem}
        onSave={handleSave}
        onCancel={() => setShowEditor(false)}
      />
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Cost Items Library:</strong> Define reusable cost items once in USD. 
          These will automatically calculate to local currencies using country multipliers and exchange rates.
        </p>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            <option value="construction">🏗️ Construction</option>
            <option value="equipment">⚙️ Equipment</option>
            <option value="service">🔧 Service</option>
            <option value="supplies">📦 Supplies</option>
          </select>
        </div>
        
        <button
          onClick={handleCreateNew}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          + Add New Item
        </button>
      </div>
      
      {/* Items List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium mb-2">No cost items found</p>
          <p className="text-sm">Create your first cost item to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{getEnglishText(item.name)}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.category === 'construction' ? 'bg-orange-100 text-orange-800' :
                      item.category === 'equipment' ? 'bg-blue-100 text-blue-800' :
                      item.category === 'service' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    } capitalize`}>
                      {item.category}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                      {item.complexity}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{getEnglishText(item.description)}</p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Base:</span>{' '}
                      <span className="font-semibold text-gray-900">
                        ${item.baseUSD.toFixed(2)} USD
                      </span>
                      {item.baseUSDMin && item.baseUSDMax && (
                        <span className="text-gray-500 ml-1">
                          (${item.baseUSDMin}-${item.baseUSDMax})
                        </span>
                      )}
                    </div>
                    
                    {item.unit && (
                      <div>
                        <span className="text-gray-500">Unit:</span>{' '}
                        <span className="text-gray-700">{item.unit}</span>
                      </div>
                    )}
                    
                    {item._count && (
                      <div>
                        <span className="text-gray-500">Used in:</span>{' '}
                        <span className="text-gray-700">
                          {item._count.strategyItems} strategies, {item._count.actionStepItems} steps
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
                    disabled={item._count && (item._count.strategyItems > 0 || item._count.actionStepItems > 0)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Summary */}
      {!loading && filteredItems.length > 0 && (
        <div className="text-sm text-gray-500 text-center py-2">
          Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </div>
      )}
    </div>
  )
}

