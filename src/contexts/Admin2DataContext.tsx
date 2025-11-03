'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface Admin2DataContextType {
  getFromCache: <T>(key: string) => T | null
  setInCache: <T>(key: string, data: T, expiryMs?: number) => void
  invalidateCache: (prefix?: string) => void
}

const Admin2DataContext = createContext<Admin2DataContextType | undefined>(undefined)

const DEFAULT_EXPIRY = 5 * 60 * 1000 // 5 minutes

export function Admin2DataProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Map<string, CacheEntry<any>>>(new Map())

  const getFromCache = useCallback(<T,>(key: string): T | null => {
    const entry = cache.get(key)
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    if (age > DEFAULT_EXPIRY) {
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(key)
        return newCache
      })
      return null
    }

    return entry.data as T
  }, [cache])

  const setInCache = useCallback(<T,>(key: string, data: T, expiryMs: number = DEFAULT_EXPIRY) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.set(key, {
        data,
        timestamp: Date.now()
      })
      return newCache
    })
  }, [])

  const invalidateCache = useCallback((prefix?: string) => {
    setCache(prev => {
      if (!prefix) {
        return new Map()
      }
      
      const newCache = new Map(prev)
      Array.from(newCache.keys()).forEach(key => {
        if (key.startsWith(prefix)) {
          newCache.delete(key)
        }
      })
      return newCache
    })
  }, [])

  return (
    <Admin2DataContext.Provider value={{ getFromCache, setInCache, invalidateCache }}>
      {children}
    </Admin2DataContext.Provider>
  )
}

export function useAdmin2Cache() {
  const context = useContext(Admin2DataContext)
  if (!context) {
    throw new Error('useAdmin2Cache must be used within Admin2DataProvider')
  }
  return context
}













