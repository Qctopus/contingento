'use client'

// Import types from centralized admin types
import type { Strategy, ActionStep, Parish, BusinessType, RiskData } from '../types/admin'

// Central Data Service for Admin2 System
// Provides consistent CRUD operations with auto-save capabilities for all admin entities

// Using imported types from admin.ts instead of local duplicates

// Re-export types from centralized admin types for external use
export type { Strategy, ActionStep, Parish, BusinessType, RiskData } from '../types/admin'

export class CentralDataService {
  private static instance: CentralDataService
  private cache: Map<string, any> = new Map()
  private saveQueue: Map<string, any> = new Map()
  private saving: Set<string> = new Set()

  static getInstance(): CentralDataService {
    if (!CentralDataService.instance) {
      CentralDataService.instance = new CentralDataService()
    }
    return CentralDataService.instance
  }

  // Generic fetch with error handling
  private async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error (${response.status}): ${errorText}`)
      }

      const jsonResponse = await response.json()
      
      // Handle new standardized API response format { success: true, data: T }
      if (jsonResponse.success === true && jsonResponse.data !== undefined) {
        return jsonResponse.data
      }
      
      // Handle legacy response format (direct data)
      return jsonResponse
    } catch (error: any) {
      console.error(`API Error for ${url}:`, error)
      throw new Error(`Failed to ${options?.method || 'fetch'} data: ${error.message}`)
    }
  }

  // PARISH OPERATIONS - ALWAYS FETCH FRESH DATA
  async getParishes(forceRefresh: boolean = true): Promise<Parish[]> {
    console.log('🏝️ CentralDataService: Fetching parishes directly from database (NO CACHE)')
    
    try {
      const parishes = await this.fetchWithErrorHandling<Parish[]>('/api/admin2/parishes')
      console.log('🏝️ CentralDataService: Loaded', parishes.length, 'parishes from database')
      return parishes
    } catch (error) {
      console.error('🏝️ CentralDataService: FAILED to load parishes:', error)
      throw error
    }
  }

  async getParish(id: string): Promise<Parish> {
    const parishes = await this.getParishes()
    const parish = parishes.find(p => p.id === id)
    if (!parish) {
      throw new Error(`Parish with id ${id} not found`)
    }
    return parish
  }

  async saveParish(parish: Parish): Promise<Parish> {
    const saveKey = `parish-${parish.id}`
    
    if (this.saving.has(saveKey)) {
      this.saveQueue.set(saveKey, parish)
      return parish
    }

    try {
      this.saving.add(saveKey)
      console.log('🏝️ CentralDataService: SAVING parish to database:', parish.name)
      console.log('🏝️ Risk profile being saved:', JSON.stringify(parish.riskProfile, null, 2))
      
      const savedParish = await this.fetchWithErrorHandling<Parish>(`/api/admin2/parishes/${parish.id}`, {
        method: 'PUT',
        body: JSON.stringify(parish)
      })

      console.log('🏝️ CentralDataService: Parish SAVED successfully to database:', savedParish.name)
      console.log('🏝️ Saved risk profile:', JSON.stringify(savedParish.riskProfile, null, 2))
      
      // Handle queued save if any
      if (this.saveQueue.has(saveKey)) {
        const queuedParish = this.saveQueue.get(saveKey)
        this.saveQueue.delete(saveKey)
        this.saving.delete(saveKey)
        return this.saveParish(queuedParish)
      }

      return savedParish
    } finally {
      this.saving.delete(saveKey)
    }
  }

  // BUSINESS TYPE OPERATIONS
  async getBusinessTypes(forceRefresh: boolean = false): Promise<BusinessType[]> {
    const cacheKey = 'businessTypes'
    
    // Always fetch fresh data to ensure consistency
    console.log('🏢 CentralDataService fetching business types from database (fresh)')
    const businessTypes = await this.fetchWithErrorHandling<BusinessType[]>('/api/admin2/business-types')
    this.cache.set(cacheKey, businessTypes)
    return businessTypes
  }

  async getBusinessType(id: string): Promise<BusinessType> {
    const businessTypes = await this.getBusinessTypes()
    const businessType = businessTypes.find(bt => bt.id === id)
    if (!businessType) {
      throw new Error(`Business type with id ${id} not found`)
    }
    return businessType
  }

  async saveBusinessType(businessType: BusinessType): Promise<BusinessType> {
    const saveKey = `businessType-${businessType.id}`
    
    if (this.saving.has(saveKey)) {
      this.saveQueue.set(saveKey, businessType)
      return businessType
    }

    try {
      this.saving.add(saveKey)
      console.log('🏢 CentralDataService saving business type:', businessType.name)
      
      const savedBusinessType = await this.fetchWithErrorHandling<BusinessType>(`/api/admin2/business-types/${businessType.id}`, {
        method: 'PUT',
        body: JSON.stringify(businessType)
      })

      // FORCE CACHE INVALIDATION to ensure fresh data on next load
      console.log('🏢 Invalidating business types cache to force fresh data reload')
      this.invalidateCache('businessTypes')

      console.log('🏢 Business type saved successfully:', savedBusinessType.name)
      
      // Handle queued save if any
      if (this.saveQueue.has(saveKey)) {
        const queuedBusinessType = this.saveQueue.get(saveKey)
        this.saveQueue.delete(saveKey)
        this.saving.delete(saveKey)
        return this.saveBusinessType(queuedBusinessType)
      }

      return savedBusinessType
    } finally {
      this.saving.delete(saveKey)
    }
  }

  // STRATEGY OPERATIONS
  async getStrategies(forceRefresh: boolean = false): Promise<Strategy[]> {
    const cacheKey = 'strategies'
    
    // Always fetch fresh data to ensure consistency
    console.log('📋 CentralDataService fetching strategies from database (fresh)')
    const strategies = await this.fetchWithErrorHandling<Strategy[]>('/api/admin2/strategies')
    this.cache.set(cacheKey, strategies)
    return strategies
  }

  async getStrategy(id: string): Promise<Strategy> {
    const strategies = await this.getStrategies()
    const strategy = strategies.find(s => s.id === id)
    if (!strategy) {
      throw new Error(`Strategy with id ${id} not found`)
    }
    return strategy
  }

  async saveStrategy(strategy: Strategy): Promise<Strategy> {
    const saveKey = `strategy-${strategy.id}`
    
    if (this.saving.has(saveKey)) {
      this.saveQueue.set(saveKey, strategy)
      return strategy
    }

    try {
      this.saving.add(saveKey)
      console.log('📋 CentralDataService saving strategy:', strategy.name)
      
      const isNew = !strategy.id || strategy.id.startsWith('temp_')
      const url = isNew ? '/api/admin2/strategies' : `/api/admin2/strategies/${strategy.id}`
      const method = isNew ? 'POST' : 'PUT'

      const savedStrategy = await this.fetchWithErrorHandling<Strategy>(url, {
        method,
        body: JSON.stringify(strategy)
      })

      // FORCE CACHE INVALIDATION to ensure fresh data on next load
      console.log('📋 Invalidating strategies cache to force fresh data reload')
      this.invalidateCache('strategies')

      console.log('📋 Strategy saved successfully:', savedStrategy.name)
      
      // Handle queued save if any
      if (this.saveQueue.has(saveKey)) {
        const queuedStrategy = this.saveQueue.get(saveKey)
        this.saveQueue.delete(saveKey)
        this.saving.delete(saveKey)
        return this.saveStrategy(queuedStrategy)
      }

      return savedStrategy
    } finally {
      this.saving.delete(saveKey)
    }
  }

  async deleteStrategy(id: string): Promise<void> {
    console.log('📋 CentralDataService deleting strategy:', id)
    
    await this.fetchWithErrorHandling(`/api/admin2/strategies/${id}`, {
      method: 'DELETE'
    })

    // FORCE CACHE INVALIDATION to ensure fresh data on next load
    console.log('📋 Invalidating strategies cache after deletion to force fresh data reload')
    this.invalidateCache('strategies')

    console.log('📋 Strategy deleted successfully:', id)
  }

  // CACHE MANAGEMENT
  invalidateCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  // For refreshing data after external changes
  async refreshParishes(): Promise<Parish[]> {
    this.invalidateCache('parishes')
    return this.getParishes()
  }

  async refreshBusinessTypes(): Promise<BusinessType[]> {
    this.invalidateCache('businessTypes')
    return this.getBusinessTypes()
  }

  async refreshStrategies(): Promise<Strategy[]> {
    this.invalidateCache('strategies')
    return this.getStrategies()
  }
}

// Export singleton instance
export const centralDataService = CentralDataService.getInstance()
