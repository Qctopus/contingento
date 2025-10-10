import React from 'react'
import { AutoSaveStatus } from '../../hooks/useAutoSave'

interface AutoSaveIndicatorProps {
  autoSaveStatus: AutoSaveStatus
  className?: string
}

export function AutoSaveIndicator({ autoSaveStatus, className = '' }: AutoSaveIndicatorProps) {
  const { status, lastSaved, error } = autoSaveStatus

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {status === 'saving' && (
        <div className="flex items-center text-blue-600 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Saving changes...
        </div>
      )}
      
      {status === 'saved' && (
        <div className="flex items-center text-green-600 text-sm">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Changes saved automatically
          {lastSaved && <span className="ml-1">({lastSaved.toLocaleTimeString()})</span>}
        </div>
      )}
      
      {status === 'error' && (
        <div className="flex items-center text-red-600 text-sm">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error || 'Failed to save changes'}
        </div>
      )}
      
      {status === 'idle' && lastSaved && (
        <div className="text-gray-500 text-sm">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}







