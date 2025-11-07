'use client'

import { useState, useEffect } from 'react'
import { CostItemBrowser } from './CostItemBrowser'
import { costCalculationService } from '@/services/costCalculationService'
import type { ActionStepItemCost } from '@/services/costCalculationService'

interface ActionStepCostItemSelectorProps {
  actionStepId: string
  selectedItems: Array<{
    id?: string
    itemId: string
    quantity: number
    customNotes?: string
    item?: {
      id: string
      itemId: string
      name: string
      description?: string
      category: string
      baseUSD: number
      baseUSDMin?: number
      baseUSDMax?: number
      unit?: string
    }
  }>
  onItemsChange: (items: Array<{
    id?: string
    itemId: string
    quantity: number
    customNotes?: string
    item?: any
  }>) => void
  countryCode?: string
}

export function ActionStepCostItemSelector({
  actionStepId,
  selectedItems,
  onItemsChange,
  countryCode = 'JM'
}: ActionStepCostItemSelectorProps) {
  const [showBrowser, setShowBrowser] = useState(false)
  const [loading, setLoading] = useState(false)
  const [costSummary, setCostSummary] = useState<{
    totalUSD: number
    localAmount: number
    localCurrency: string
    localSymbol: string
  } | null>(null)
  const [countryMultiplier, setCountryMultiplier] = useState<any>(null)

  useEffect(() => {
    fetchCountryMultiplier()
  }, [countryCode])

  useEffect(() => {
    if (selectedItems.length > 0) {
      calculateCosts()
    } else {
      setCostSummary(null)
    }
  }, [selectedItems, countryCode])

  const fetchCountryMultiplier = async () => {
    const multiplier = await costCalculationService.getCountryMultiplier(countryCode)
    setCountryMultiplier(multiplier)
  }

  const calculateCosts = async () => {
    setLoading(true)
    try {
      const calculation = await costCalculationService.calculateActionStepCost(
        actionStepId,
        selectedItems as ActionStepItemCost[],
        countryCode
      )
      
      setCostSummary({
        totalUSD: calculation.totalUSD,
        localAmount: calculation.localCurrency.amount,
        localCurrency: calculation.localCurrency.code,
        localSymbol: calculation.localCurrency.symbol
      })
    } catch (error) {
      console.error('Error calculating costs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItems = async (newItems: Array<{ itemId: string; quantity: number }>) => {
    setLoading(true)
    try {
      // Fetch full item details for each new item
      const itemsWithDetails = await Promise.all(
        newItems.map(async ({ itemId, quantity }) => {
          const item = await costCalculationService.getCostItem(itemId)
          return {
            itemId,
            quantity,
            item: item || undefined
          }
        })
      )
      
      // Merge with existing items
      const updatedItems = [...selectedItems]
      
      for (const newItem of itemsWithDetails) {
        const existingIndex = updatedItems.findIndex(i => i.itemId === newItem.itemId)
        if (existingIndex >= 0) {
          // Update quantity of existing item
          updatedItems[existingIndex].quantity += newItem.quantity
        } else {
          // Add new item
          updatedItems.push(newItem)
        }
      }
      
      onItemsChange(updatedItems)
      setShowBrowser(false)
    } catch (error) {
      console.error('Error adding cost items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    onItemsChange(selectedItems.filter(i => i.itemId !== itemId))
  }

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId)
      return
    }
    
    onItemsChange(
      selectedItems.map(i => 
        i.itemId === itemId ? { ...i, quantity } : i
      )
    )
  }

  const formatCurrency = (amount: number, symbol: string) => {
    return `${symbol} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          💰 Cost Items for This Step
        </label>
        <button
          onClick={() => setShowBrowser(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Add Cost Items
        </button>
      </div>

      {/* Selected Items List */}
      {selectedItems.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <span className="text-4xl mb-2 block">💰</span>
          <p className="text-gray-600 mb-2">No cost items added yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Add items from the library to calculate accurate costs
          </p>
          <button
            onClick={() => setShowBrowser(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Browse Cost Items
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedItems.map((selectedItem) => {
            const item = selectedItem.item
            if (!item) return null
            
            const unitPrice = item.baseUSD
            const totalPrice = unitPrice * selectedItem.quantity
            const categoryIcons: Record<string, string> = {
              construction: '🏗️',
              equipment: '⚡',
              service: '👷',
              supplies: '📦'
            }
            
            return (
              <div
                key={selectedItem.itemId}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{categoryIcons[item.category] || '📦'}</span>
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1 ml-7">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 ml-7">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Qty:</label>
                        <button
                          onClick={() => handleUpdateQuantity(selectedItem.itemId, selectedItem.quantity - 1)}
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={selectedItem.quantity}
                          onChange={(e) => handleUpdateQuantity(selectedItem.itemId, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                        />
                        <button
                          onClick={() => handleUpdateQuantity(selectedItem.itemId, selectedItem.quantity + 1)}
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        × ${unitPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD
                        {item.unit && ` / ${item.unit}`}
                      </div>
                      
                      <div className="text-sm font-medium text-blue-600">
                        = ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveItem(selectedItem.itemId)}
                    className="text-red-600 hover:text-red-800 ml-4"
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cost Summary */}
      {costSummary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">💰 Calculated Cost</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">USD Total</div>
              <div className="text-2xl font-bold text-blue-600">
                ${costSummary.totalUSD.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </div>
            </div>
            {costSummary.localCurrency !== 'USD' && (
              <div>
                <div className="text-sm text-gray-600">{costSummary.localCurrency} Total</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(costSummary.localAmount, costSummary.localSymbol)}
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-gray-600">
              💡 Tip: Costs are automatically converted using current exchange rates and country-specific multipliers
            </p>
          </div>
        </div>
      )}

      {/* Cost Item Browser Modal */}
      {showBrowser && (
        <CostItemBrowser
          onSelect={handleAddItems}
          onCancel={() => setShowBrowser(false)}
          countryCode={countryCode}
          exchangeRate={countryMultiplier?.exchangeRateUSD || 1.0}
          localCurrencySymbol={countryMultiplier?.currencySymbol || '$'}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
}




