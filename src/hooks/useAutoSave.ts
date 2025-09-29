import { useCallback, useRef, useState, useEffect } from 'react'
import { useGlobalAutoSave } from '../contexts/GlobalAutoSaveContext'

export interface AutoSaveConfig<T> {
  data: T
  saveFunction: (data: T) => Promise<void>
  delay?: number
  onSaveStart?: () => void
  onSaveSuccess?: (data: T) => void
  onSaveError?: (error: any) => void
  enabled?: boolean
}

export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved: Date | null
  isSaving: boolean
  error: string | null
}

export function useAutoSave<T>({
  data,
  saveFunction,
  delay = 1000,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
  enabled = true
}: AutoSaveConfig<T>) {
  const [status, setStatus] = useState<AutoSaveStatus['status']>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Try to use global auto-save context, but don't require it
  let globalAutoSave: ReturnType<typeof useGlobalAutoSave> | null = null
  try {
    globalAutoSave = useGlobalAutoSave()
  } catch {
    // Context not available, continue without it
  }
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastDataRef = useRef<T>(data)
  const saveInProgressRef = useRef(false)
  const pendingSaveRef = useRef(false)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const performSave = useCallback(async (dataToSave: T) => {
    if (saveInProgressRef.current) {
      // If a save is already in progress, mark that we need another save
      pendingSaveRef.current = true
      return
    }

    try {
      saveInProgressRef.current = true
      setIsSaving(true)
      setStatus('saving')
      setError(null)
      
      // Update global auto-save status
      globalAutoSave?.setSaving(true)
      
      onSaveStart?.()
      
      console.log('Auto-saving data:', dataToSave)
      await saveFunction(dataToSave)
      
      const savedTime = new Date()
      setLastSaved(savedTime)
      setStatus('saved')
      
      // Update global auto-save status
      globalAutoSave?.updateLastSaved(savedTime)
      globalAutoSave?.incrementSaveCount()
      
      onSaveSuccess?.(dataToSave)
      
      // Clear saved status after 3 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
      
    } catch (err: any) {
      console.error('Auto-save error:', err)
      setError(err.message || 'Failed to save')
      setStatus('error')
      onSaveError?.(err)
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setError(null)
      }, 5000)
    } finally {
      setIsSaving(false)
      saveInProgressRef.current = false
      
      // If there's a pending save, trigger it
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false
        // Use the latest data
        setTimeout(() => performSave(data), 100)
      }
    }
  }, [saveFunction, onSaveStart, onSaveSuccess, onSaveError, data])

  const debouncedSave = useCallback(() => {
    if (!enabled) return
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // Only save if data has actually changed
      if (JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
        lastDataRef.current = data
        performSave(data)
      }
    }, delay)
  }, [data, delay, enabled, performSave])

  // Trigger save when data changes
  useEffect(() => {
    debouncedSave()
  }, [debouncedSave])

  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await performSave(data)
  }, [data, performSave])

  return {
    status,
    lastSaved,
    isSaving,
    error,
    forceSave,
    autoSaveStatus: {
      status,
      lastSaved,
      isSaving,
      error
    } as AutoSaveStatus
  }
}
