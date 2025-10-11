'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface GlobalAutoSaveStatus {
  lastSaved: Date | null
  isSaving: boolean
  saveCount: number
}

interface GlobalAutoSaveContextType {
  globalStatus: GlobalAutoSaveStatus
  updateLastSaved: (timestamp: Date) => void
  setSaving: (saving: boolean) => void
  incrementSaveCount: () => void
}

const GlobalAutoSaveContext = createContext<GlobalAutoSaveContextType | null>(null)

export function GlobalAutoSaveProvider({ children }: { children: React.ReactNode }) {
  const [globalStatus, setGlobalStatus] = useState<GlobalAutoSaveStatus>({
    lastSaved: null,
    isSaving: false,
    saveCount: 0
  })

  const updateLastSaved = useCallback((timestamp: Date) => {
    setGlobalStatus(prev => ({
      ...prev,
      lastSaved: timestamp,
      isSaving: false
    }))
  }, [])

  const setSaving = useCallback((saving: boolean) => {
    setGlobalStatus(prev => ({
      ...prev,
      isSaving: saving
    }))
  }, [])

  const incrementSaveCount = useCallback(() => {
    setGlobalStatus(prev => ({
      ...prev,
      saveCount: prev.saveCount + 1
    }))
  }, [])

  return (
    <GlobalAutoSaveContext.Provider value={{
      globalStatus,
      updateLastSaved,
      setSaving,
      incrementSaveCount
    }}>
      {children}
    </GlobalAutoSaveContext.Provider>
  )
}

export function useGlobalAutoSave() {
  const context = useContext(GlobalAutoSaveContext)
  if (!context) {
    throw new Error('useGlobalAutoSave must be used within GlobalAutoSaveProvider')
  }
  return context
}

export function GlobalAutoSaveIndicator({ className = '' }: { className?: string }) {
  const { globalStatus } = useGlobalAutoSave()

  if (!globalStatus.lastSaved && !globalStatus.isSaving) {
    return null
  }

  return (
    <div className={`flex items-center text-sm text-gray-500 ${className}`}>
      {globalStatus.isSaving ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-2"></div>
          <span>Saving...</span>
        </div>
      ) : globalStatus.lastSaved ? (
        <div className="flex items-center">
          <svg className="w-3 h-3 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Last saved: {globalStatus.lastSaved.toLocaleTimeString()}</span>
        </div>
      ) : null}
    </div>
  )
}








