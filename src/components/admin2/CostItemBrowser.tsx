'use client'

import { useState, useEffect, useMemo } from 'react'
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
  tags?: string
}

interface CostItemBrowserProps {
  onSelect: (items: Array<{ itemId: string; quantity: number }>) => void
  onCancel: () => void
  countryCode?: string
  exchangeRate?: number
  localCurrencySymbol?: string
}

const CATEGORY_INFO = {
  construction: { icon: '🏗️', name: 'Construction', color: 'orange' },
  equipment: { icon: '⚡', name: 'Equipment', color: 'blue' },
  service: { icon: '👷', name: 'Services', color: 'green' },
  supplies: { icon: '📦', name: 'Supplies', color: 'purple' }
}

export function CostItemBrowser({ 
  onSelect, 
  onCancel, 
  countryCode = 'US',
  exchangeRate = 1.0,
  localCurrencySymbol = '$'
}: CostItemBrowserProps) {
  const [items, setItems] = useState<CostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map())
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCostItems()
  }, [])

  const fetchCostItems = async () => {
    try {
      const response = await fetch('/api/admin2/cost-items')
      if (!response.ok) throw new Error('Failed to fetch cost items')
      
      const data = await response.json()
      setItems(data.items || [])
    } catch (err) {
      console.error('Error fetching cost items:', err)
      setError('Failed to load cost items')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Parse multilingual name and description
      const nameText = typeof item.name === 'string' ? 
        (parseMultilingualJSON(item.name)?.en || item.name) : 
        (item.name as any).en || ''
      const descText = item.description && typeof item.description === 'string' ? 
        (parseMultilingualJSON(item.description)?.en || item.description) : 
        (item.description as any)?.en || ''
      
      const matchesSearch = searchTerm === '' || 
        nameText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        descText.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [items, searchTerm, selectedCategory])

  const groupedItems = useMemo(() => {
    const grouped: Record<string, CostItem[]> = {}
    filteredItems.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })
    return grouped
  }, [filteredItems])

  const handleToggleItem = (itemId: string) => {
    const newSelected = new Map(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.set(itemId, 1) // Default quantity of 1
    }
    setSelectedItems(newSelected)
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const newSelected = new Map(selectedItems)
    if (quantity > 0) {
      newSelected.set(itemId, quantity)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleAddSelected = () => {
    const itemsToAdd = Array.from(selectedItems.entries()).map(([itemId, quantity]) => ({
      itemId,
      quantity
    }))
    onSelect(itemsToAdd)
  }

  const formatPrice = (priceUSD: number) => {
    const localPrice = priceUSD * exchangeRate
    return {
      usd: `$${priceUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      local: `${localCurrencySymbol} ${localPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading cost items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Select Cost Items</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.icon} {info.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">🔍</span>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No items found</h4>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, categoryItems]) => {
                const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]
                return (
                  <div key={category}>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">{categoryInfo.icon}</span>
                      <h4 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
                        {categoryInfo.name}
                      </h4>
                      <span className="text-sm text-gray-500">({categoryItems.length})</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryItems.map(item => {
                        const isSelected = selectedItems.has(item.itemId)
                        const quantity = selectedItems.get(item.itemId) || 1
                        const prices = formatPrice(item.baseUSD)
                        
                        return (
                          <div
                            key={item.id}
                            className={`border rounded-lg p-4 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleToggleItem(item.itemId)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleItem(item.itemId)}
                                    className="h-4 w-4 text-blue-600 rounded"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <h5 className="font-medium text-gray-900">
                                    {parseMultilingualJSON(item.name)?.en || item.name}
                                  </h5>
                                </div>
                                
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1 ml-6">
                                    {parseMultilingualJSON(item.description)?.en || item.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-3 mt-2 ml-6">
                                  <span className="text-sm font-medium text-blue-600">
                                    {prices.usd} USD
                                  </span>
                                  {countryCode !== 'US' && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-sm text-gray-600">
                                        {prices.local}
                                      </span>
                                    </>
                                  )}
                                  {item.unit && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-xs text-gray-500">{item.unit}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Quantity Selector */}
                            {isSelected && (
                              <div className="mt-3 ml-6 flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                <label className="text-sm font-medium text-gray-700">Qty:</label>
                                <button
                                  onClick={() => handleQuantityChange(item.itemId, quantity - 1)}
                                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={quantity}
                                  onChange={(e) => handleQuantityChange(item.itemId, parseInt(e.target.value) || 1)}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                />
                                <button
                                  onClick={() => handleQuantityChange(item.itemId, quantity + 1)}
                                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                  +
                                </button>
                                <span className="text-sm text-gray-600">
                                  = {formatPrice(item.baseUSD * quantity).local}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedItems.size > 0 ? (
                <span className="font-medium">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
              ) : (
                <span>Select items to add to this action step</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelected}
                disabled={selectedItems.size === 0}
                className={`px-6 py-2 rounded-lg font-medium ${
                  selectedItems.size > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add Selected Items
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

