/**
 * Cost Calculation Service
 * 
 * Handles all cost calculations for strategies and action steps,
 * including currency conversion and item-based pricing.
 */

import { calculateStrategyTimeFromSteps } from '@/utils/timeCalculation'

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

interface ActionStepItemCost {
  id?: string
  actionStepId: string
  itemId: string
  quantity: number
  customNotes?: string
  countryOverrides?: string
  item?: CostItem
}

interface CountryCostMultiplier {
  countryCode: string
  construction: number
  equipment: number
  service: number
  supplies: number
  currency: string
  currencySymbol?: string
  exchangeRateUSD: number
}

interface CostBreakdownItem {
  itemId: string
  name: string
  quantity: number
  unitPriceUSD: number
  totalUSD: number
  localAmount: number
  category: string
  unit?: string
}

interface ActionStepCostCalculation {
  totalUSD: number
  localCurrency: {
    code: string
    amount: number
    symbol: string
  }
  itemBreakdown: CostBreakdownItem[]
}

interface StrategyCostCalculation {
  totalUSD: number
  localCurrency: {
    code: string
    amount: number
    symbol: string
  }
  byPhase: {
    immediate: number
    short_term: number
    medium_term: number
    long_term: number
  }
  itemBreakdown: CostBreakdownItem[]
  stepBreakdown: Array<{
    stepId: string
    stepTitle: string
    phase: string
    totalUSD: number
    localAmount: number
  }>
  calculatedHours: number // Added: total implementation time in hours
}

class CostCalculationService {
  private countryMultipliersCache: Map<string, CountryCostMultiplier> = new Map()
  private costItemsCache: Map<string, CostItem> = new Map()

  /**
   * Get country cost multipliers with caching
   */
  async getCountryMultiplier(countryCode: string): Promise<CountryCostMultiplier | null> {
    // Check cache first
    if (this.countryMultipliersCache.has(countryCode)) {
      return this.countryMultipliersCache.get(countryCode)!
    }

    try {
      const response = await fetch(`/api/admin2/country-multipliers?countryCode=${countryCode}`)
      if (!response.ok) {
        console.warn(`No multiplier found for country ${countryCode}, using defaults`)
        return null
      }
      
      const multiplier = await response.json()
      this.countryMultipliersCache.set(countryCode, multiplier)
      return multiplier
    } catch (error) {
      console.error('Error fetching country multiplier:', error)
      return null
    }
  }

  /**
   * Get cost item by ID with caching
   */
  async getCostItem(itemId: string): Promise<CostItem | null> {
    if (this.costItemsCache.has(itemId)) {
      return this.costItemsCache.get(itemId)!
    }

    try {
      const response = await fetch(`/api/admin2/cost-items?itemId=${itemId}`)
      if (!response.ok) return null
      
      const data = await response.json()
      const item = data.items?.[0]
      if (item) {
        this.costItemsCache.set(itemId, item)
      }
      return item || null
    } catch (error) {
      console.error('Error fetching cost item:', error)
      return null
    }
  }

  /**
   * Calculate the price of a cost item in local currency
   */
  async calculateItemPrice(
    item: CostItem,
    quantity: number,
    countryCode: string
  ): Promise<{
    unitPriceUSD: number
    totalUSD: number
    localAmount: number
    localCurrency: { code: string; symbol: string }
  }> {
    const multiplier = await this.getCountryMultiplier(countryCode)
    
    // Get base USD price
    const baseUSD = item.baseUSD || 0
    
    // Apply category multiplier if available
    let categoryMultiplier = 1.0
    if (multiplier) {
      switch (item.category) {
        case 'construction':
          categoryMultiplier = multiplier.construction
          break
        case 'equipment':
          categoryMultiplier = multiplier.equipment
          break
        case 'service':
          categoryMultiplier = multiplier.service
          break
        case 'supplies':
          categoryMultiplier = multiplier.supplies
          break
      }
    }
    
    // Calculate adjusted USD price
    const adjustedUSD = baseUSD * categoryMultiplier
    const totalUSD = adjustedUSD * quantity
    
    // Convert to local currency
    const exchangeRate = multiplier?.exchangeRateUSD || 1.0
    const localAmount = totalUSD * exchangeRate
    
    return {
      unitPriceUSD: adjustedUSD,
      totalUSD,
      localAmount,
      localCurrency: {
        code: multiplier?.currency || 'USD',
        symbol: multiplier?.currencySymbol || '$'
      }
    }
  }

  /**
   * Calculate total cost for an action step
   */
  async calculateActionStepCost(
    actionStepId: string,
    costItems: ActionStepItemCost[],
    countryCode: string = 'US'
  ): Promise<ActionStepCostCalculation> {
    let totalUSD = 0
    let totalLocal = 0
    const itemBreakdown: CostBreakdownItem[] = []
    let localCurrencyInfo = { code: 'USD', symbol: '$' }

    for (const costItemLink of costItems) {
      // Get the full cost item details
      const item = costItemLink.item || await this.getCostItem(costItemLink.itemId)
      if (!item) {
        console.warn(`Cost item ${costItemLink.itemId} not found`)
        continue
      }

      // Calculate price for this item
      const price = await this.calculateItemPrice(item, costItemLink.quantity, countryCode)
      
      totalUSD += price.totalUSD
      totalLocal += price.localAmount
      localCurrencyInfo = price.localCurrency

      itemBreakdown.push({
        itemId: item.itemId,
        name: this.parseMultilingualText(item.name, item.itemId),
        quantity: costItemLink.quantity,
        unitPriceUSD: price.unitPriceUSD,
        totalUSD: price.totalUSD,
        localAmount: price.localAmount,
        category: item.category,
        unit: item.unit
      })
    }

    return {
      totalUSD,
      localCurrency: {
        code: localCurrencyInfo.code,
        amount: totalLocal,
        symbol: localCurrencyInfo.symbol
      },
      itemBreakdown
    }
  }

  /**
   * Calculate total cost for a strategy across all action steps
   */
  async calculateStrategyCost(
    actionSteps: Array<{
      id: string
      title?: string
      smeAction?: string
      action?: string
      phase: string
      costItems?: ActionStepItemCost[]
    }>,
    countryCode: string = 'US'
  ): Promise<StrategyCostCalculation> {
    let totalUSD = 0
    let totalLocal = 0
    const byPhase = {
      immediate: 0,
      short_term: 0,
      medium_term: 0,
      long_term: 0
    }
    const itemBreakdown: CostBreakdownItem[] = []
    const stepBreakdown: Array<{
      stepId: string
      stepTitle: string
      phase: string
      totalUSD: number
      localAmount: number
    }> = []
    let localCurrencyInfo = { code: 'USD', symbol: '$' }

    for (const step of actionSteps) {
      if (!step.costItems || step.costItems.length === 0) {
        continue
      }

      const stepCost = await this.calculateActionStepCost(
        step.id,
        step.costItems,
        countryCode
      )

      totalUSD += stepCost.totalUSD
      totalLocal += stepCost.localCurrency.amount
      localCurrencyInfo = stepCost.localCurrency

      // Add to phase totals
      const phase = step.phase as keyof typeof byPhase
      if (byPhase[phase] !== undefined) {
        byPhase[phase] += stepCost.totalUSD
      }

      // Add items to breakdown (merge duplicates)
      for (const item of stepCost.itemBreakdown) {
        const existingItem = itemBreakdown.find(i => i.itemId === item.itemId)
        if (existingItem) {
          existingItem.quantity += item.quantity
          existingItem.totalUSD += item.totalUSD
          existingItem.localAmount += item.localAmount
        } else {
          itemBreakdown.push({ ...item })
        }
      }

      // Add to step breakdown
      stepBreakdown.push({
        stepId: step.id,
        stepTitle: this.getStepTitle(step),
        phase: step.phase,
        totalUSD: stepCost.totalUSD,
        localAmount: stepCost.localCurrency.amount
      })
    }

    // Calculate total implementation time from action steps
    const calculatedHours = calculateStrategyTimeFromSteps(actionSteps)

    return {
      totalUSD,
      localCurrency: {
        code: localCurrencyInfo.code,
        amount: totalLocal,
        symbol: localCurrencyInfo.symbol
      },
      byPhase,
      itemBreakdown,
      stepBreakdown,
      calculatedHours
    }
  }

  /**
   * Helper to parse multilingual text and extract English
   */
  private parseMultilingualText(text: string | undefined, fallback: string = ''): string {
    if (!text) return fallback
    
    try {
      const parsed = JSON.parse(text)
      if (parsed.en) return parsed.en
      if (typeof parsed === 'object') return fallback
      return text
    } catch {
      return typeof text === 'string' ? text : fallback
    }
  }

  /**
   * Helper to get step title from various formats
   */
  private getStepTitle(step: { title?: string; smeAction?: string; action?: string }): string {
    // Try to parse multilingual title
    const title = this.parseMultilingualText(step.title)
    if (title) return title
    
    // Fallback to smeAction or action
    const smeAction = this.parseMultilingualText(step.smeAction)
    if (smeAction) return smeAction
    
    return step.action || 'Untitled Step'
  }

  /**
   * Format currency amount for display
   */
  formatCurrency(amount: number, currencyCode: string, symbol?: string): string {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    
    const displaySymbol = symbol || this.getCurrencySymbol(currencyCode)
    return `${displaySymbol} ${formatted}`
  }

  /**
   * Get currency symbol for a currency code
   */
  private getCurrencySymbol(code: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      JMD: 'J$',
      TTD: 'TT$',
      BBD: 'Bds$',
      XCD: 'EC$',
      HTG: 'G',
      EUR: '€',
      GBP: '£',
      CAD: 'CA$'
    }
    return symbols[code] || code
  }

  /**
   * Clear caches (useful when data is updated)
   */
  clearCaches() {
    this.countryMultipliersCache.clear()
    this.costItemsCache.clear()
  }
}

// Export singleton instance
export const costCalculationService = new CostCalculationService()

// Export types
export type {
  CostItem,
  ActionStepItemCost,
  CountryCostMultiplier,
  CostBreakdownItem,
  ActionStepCostCalculation,
  StrategyCostCalculation
}
