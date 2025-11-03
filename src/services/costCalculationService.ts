import { prisma } from '@/lib/prisma'

export interface CalculatedCost {
  countryCode: string
  currency: string
  currencySymbol: string
  amount: number
  amountMin?: number
  amountMax?: number
  displayText: string
  isEstimate: boolean
  confidenceLevel: 'high' | 'medium' | 'low'
}

export class CostCalculationService {
  
  /**
   * Calculate cost for a specific item in a specific country
   */
  async calculateItemCost(
    itemId: string,
    countryCode: string,
    quantity: number = 1,
    override?: { amount: number; verified: boolean }
  ): Promise<CalculatedCost> {
    
    // Get cost item
    const item = await prisma.costItem.findUnique({
      where: { itemId }
    })
    
    if (!item) {
      throw new Error(`Cost item ${itemId} not found`)
    }
    
    // Check for manual override
    if (override?.verified) {
      const multiplier = await prisma.countryCostMultiplier.findUnique({
        where: { countryCode }
      })
      
      return {
        countryCode,
        currency: multiplier?.currency || 'USD',
        currencySymbol: multiplier?.currencySymbol || '$',
        amount: override.amount * quantity,
        displayText: this.formatCurrency(
          override.amount * quantity,
          multiplier?.currencySymbol || '$'
        ),
        isEstimate: false,
        confidenceLevel: 'high'
      }
    }
    
    // Get country multiplier
    const multiplier = await prisma.countryCostMultiplier.findUnique({
      where: { countryCode }
    })
    
    if (!multiplier) {
      // Fallback to USD if country not configured
      return {
        countryCode,
        currency: 'USD',
        currencySymbol: '$',
        amount: item.baseUSD * quantity,
        amountMin: item.baseUSDMin ? item.baseUSDMin * quantity : undefined,
        amountMax: item.baseUSDMax ? item.baseUSDMax * quantity : undefined,
        displayText: this.formatCostRange(
          item.baseUSD * quantity,
          item.baseUSDMin ? item.baseUSDMin * quantity : undefined,
          item.baseUSDMax ? item.baseUSDMax * quantity : undefined,
          '$'
        ),
        isEstimate: false,
        confidenceLevel: 'high'
      }
    }
    
    // Calculate cost with multiplier
    const categoryMultiplier = this.getCategoryMultiplier(multiplier, item.category)
    const costInUSD = item.baseUSD * quantity
    const costInLocal = costInUSD * multiplier.exchangeRateUSD * categoryMultiplier
    
    let costMinInLocal, costMaxInLocal
    if (item.baseUSDMin && item.baseUSDMax) {
      costMinInLocal = item.baseUSDMin * quantity * multiplier.exchangeRateUSD * categoryMultiplier
      costMaxInLocal = item.baseUSDMax * quantity * multiplier.exchangeRateUSD * categoryMultiplier
    }
    
    return {
      countryCode,
      currency: multiplier.currency,
      currencySymbol: multiplier.currencySymbol || multiplier.currency,
      amount: Math.round(costInLocal),
      amountMin: costMinInLocal ? Math.round(costMinInLocal) : undefined,
      amountMax: costMaxInLocal ? Math.round(costMaxInLocal) : undefined,
      displayText: this.formatCostRange(
        costInLocal,
        costMinInLocal,
        costMaxInLocal,
        multiplier.currencySymbol || multiplier.currency
      ),
      isEstimate: true,
      confidenceLevel: multiplier.confidenceLevel as any || 'medium'
    }
  }
  
  /**
   * Calculate total cost for a strategy in a specific country
   */
  async calculateStrategyCost(
    strategyId: string,
    countryCode: string
  ): Promise<CalculatedCost> {
    
    const strategyItems = await prisma.strategyItemCost.findMany({
      where: { strategyId },
      include: { item: true }
    })
    
    if (strategyItems.length === 0) {
      // No items linked, return zero
      const multiplier = await prisma.countryCostMultiplier.findUnique({
        where: { countryCode }
      })
      
      return {
        countryCode,
        currency: multiplier?.currency || 'USD',
        currencySymbol: multiplier?.currencySymbol || '$',
        amount: 0,
        displayText: 'No cost data',
        isEstimate: false,
        confidenceLevel: 'low'
      }
    }
    
    let totalCost = 0
    let totalMin = 0
    let totalMax = 0
    let hasRange = false
    let currency = 'USD'
    let currencySymbol = '$'
    
    for (const si of strategyItems) {
      const overrides = si.countryOverrides ? JSON.parse(si.countryOverrides) : {}
      const cost = await this.calculateItemCost(
        si.item.itemId,
        countryCode,
        si.quantity,
        overrides[countryCode]
      )
      
      totalCost += cost.amount
      if (cost.amountMin && cost.amountMax) {
        totalMin += cost.amountMin
        totalMax += cost.amountMax
        hasRange = true
      }
      currency = cost.currency
      currencySymbol = cost.currencySymbol
    }
    
    return {
      countryCode,
      currency,
      currencySymbol,
      amount: Math.round(totalCost),
      amountMin: hasRange ? Math.round(totalMin) : undefined,
      amountMax: hasRange ? Math.round(totalMax) : undefined,
      displayText: this.formatCostRange(
        totalCost,
        hasRange ? totalMin : undefined,
        hasRange ? totalMax : undefined,
        currencySymbol
      ),
      isEstimate: true,
      confidenceLevel: 'medium'
    }
  }
  
  /**
   * Calculate total cost for an action step in a specific country
   */
  async calculateActionStepCost(
    actionStepId: string,
    countryCode: string
  ): Promise<CalculatedCost> {
    
    const actionStepItems = await prisma.actionStepItemCost.findMany({
      where: { actionStepId },
      include: { item: true }
    })
    
    if (actionStepItems.length === 0) {
      const multiplier = await prisma.countryCostMultiplier.findUnique({
        where: { countryCode }
      })
      
      return {
        countryCode,
        currency: multiplier?.currency || 'USD',
        currencySymbol: multiplier?.currencySymbol || '$',
        amount: 0,
        displayText: 'No cost data',
        isEstimate: false,
        confidenceLevel: 'low'
      }
    }
    
    let totalCost = 0
    let totalMin = 0
    let totalMax = 0
    let hasRange = false
    let currency = 'USD'
    let currencySymbol = '$'
    
    for (const asi of actionStepItems) {
      const overrides = asi.countryOverrides ? JSON.parse(asi.countryOverrides) : {}
      const cost = await this.calculateItemCost(
        asi.item.itemId,
        countryCode,
        asi.quantity,
        overrides[countryCode]
      )
      
      totalCost += cost.amount
      if (cost.amountMin && cost.amountMax) {
        totalMin += cost.amountMin
        totalMax += cost.amountMax
        hasRange = true
      }
      currency = cost.currency
      currencySymbol = cost.currencySymbol
    }
    
    return {
      countryCode,
      currency,
      currencySymbol,
      amount: Math.round(totalCost),
      amountMin: hasRange ? Math.round(totalMin) : undefined,
      amountMax: hasRange ? Math.round(totalMax) : undefined,
      displayText: this.formatCostRange(
        totalCost,
        hasRange ? totalMin : undefined,
        hasRange ? totalMax : undefined,
        currencySymbol
      ),
      isEstimate: true,
      confidenceLevel: 'medium'
    }
  }
  
  /**
   * Get category multiplier from country data
   */
  private getCategoryMultiplier(multiplier: any, category: string): number {
    const categoryKey = category as 'construction' | 'equipment' | 'service' | 'supplies'
    return multiplier[categoryKey] || 1.0
  }
  
  /**
   * Format currency with symbol and thousands separator
   */
  private formatCurrency(amount: number, symbol: string): string {
    const formatted = Math.round(amount).toLocaleString('en-US', { 
      maximumFractionDigits: 0 
    })
    return `${symbol}${formatted}`
  }
  
  /**
   * Format cost range or single cost
   */
  private formatCostRange(
    amount: number,
    min: number | undefined,
    max: number | undefined,
    symbol: string
  ): string {
    if (min && max) {
      const minFormatted = Math.round(min).toLocaleString('en-US', { maximumFractionDigits: 0 })
      const maxFormatted = Math.round(max).toLocaleString('en-US', { maximumFractionDigits: 0 })
      return `${symbol}${minFormatted}-${maxFormatted}`
    }
    const formatted = Math.round(amount).toLocaleString('en-US', { maximumFractionDigits: 0 })
    return `~${symbol}${formatted}`
  }
}

// Singleton export
export const costCalculationService = new CostCalculationService()

