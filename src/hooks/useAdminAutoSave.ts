import { useCallback } from 'react'
import { useAutoSave } from './useAutoSave'
import { 
  centralDataService, 
  Parish, 
  BusinessType, 
  Strategy 
} from '../services/centralDataService'

// Enhanced auto-save hooks specifically for admin data types

export function useParishAutoSave(parish: Parish, enabled: boolean = true) {
  const saveFunction = useCallback(async (parishData: Parish): Promise<void> => {
    await centralDataService.saveParish(parishData)
  }, [])

  return useAutoSave({
    data: parish,
    saveFunction,
    delay: 1000, // 1 second delay
    enabled,
    onSaveStart: () => console.log('🏝️ Auto-saving parish:', parish.name),
    onSaveSuccess: () => console.log('🏝️ Parish auto-saved:', parish.name),
    onSaveError: (error) => console.error('🏝️ Parish auto-save failed:', error)
  })
}

export function useBusinessTypeAutoSave(businessType: BusinessType, enabled: boolean = true) {
  const saveFunction = useCallback(async (businessTypeData: BusinessType): Promise<void> => {
    await centralDataService.saveBusinessType(businessTypeData)
  }, [])

  return useAutoSave({
    data: businessType,
    saveFunction,
    delay: 1000, // 1 second delay
    enabled,
    onSaveStart: () => console.log('🏢 Auto-saving business type:', businessType.name),
    onSaveSuccess: () => console.log('🏢 Business type auto-saved:', businessType.name),
    onSaveError: (error) => console.error('🏢 Business type auto-save failed:', error)
  })
}

export function useStrategyAutoSave(strategy: Strategy, enabled: boolean = true) {
  const saveFunction = useCallback(async (strategyData: Strategy): Promise<void> => {
    await centralDataService.saveStrategy(strategyData)
  }, [])

  return useAutoSave({
    data: strategy,
    saveFunction,
    delay: 1000, // 1 second delay
    enabled,
    onSaveStart: () => console.log('📋 Auto-saving strategy:', strategy.name),
    onSaveSuccess: () => console.log('📋 Strategy auto-saved:', strategy.name),
    onSaveError: (error) => console.error('📋 Strategy auto-save failed:', error)
  })
}

// Generic auto-save hook for any admin data
export function useAdminDataAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  entityName: string = 'data',
  enabled: boolean = true
) {
  return useAutoSave({
    data,
    saveFunction,
    delay: 1000,
    enabled,
    onSaveStart: () => console.log(`💾 Auto-saving ${entityName}...`),
    onSaveSuccess: () => console.log(`💾 ${entityName} auto-saved successfully`),
    onSaveError: (error) => console.error(`💾 ${entityName} auto-save failed:`, error)
  })
}
