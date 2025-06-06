import { useState, useEffect, useCallback, useRef } from 'react'

// Development logging utility
export const useDevLog = (componentName: string) => {
  return useCallback((message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}]: ${message}`, data)
    }
  }, [componentName])
}

// Local storage hook with error handling
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}

// Auto-save hook with debouncing
export const useAutoSave = <T>(
  data: T,
  saveFunction: (data: T) => Promise<void> | void,
  delay: number = 2000
) => {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!data || (typeof data === 'object' && Object.keys(data as any).length === 0)) {
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      setStatus('saving')
      try {
        await saveFunction(data)
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2000)
      } catch (error) {
        console.error('Auto-save failed:', error)
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, saveFunction, delay])

  return status
}

// User interaction tracking hook
export const useUserInteraction = () => {
  const hasInteracted = useRef(false)
  const didMount = useRef(false)

  const setUserInteracted = useCallback(() => {
    hasInteracted.current = true
  }, [])

  const resetInteraction = useCallback(() => {
    hasInteracted.current = false
  }, [])

  // Set didMount to true after first render
  useEffect(() => {
    didMount.current = true
  }, [])

  return {
    hasUserInteracted: hasInteracted.current,
    didMount: didMount.current,
    setUserInteracted,
    resetInteraction
  }
}

// Form validation hook
export const useFormValidation = <T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
) => {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})

  const validate = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    
    requiredFields.forEach(field => {
      const value = data[field]
      if (!value || (Array.isArray(value) && value.length === 0) || 
          (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = 'This field is required'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [data, requiredFields])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const isValid = Object.keys(errors).length === 0

  return {
    errors,
    isValid,
    validate,
    clearErrors
  }
} 