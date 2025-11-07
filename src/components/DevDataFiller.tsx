'use client'

import { useState } from 'react'

/**
 * Development-only component for filling wizard with sample data
 * Uses EXACTLY the same data structure as scripts/fill-wizard-SIMPLE.js
 * Only renders in development mode
 */
export function DevDataFiller() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const fillWithSampleData = () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Load and execute the FIXED complete plan fill script with correct field names
      fetch('/fill-complete-plan-FIXED.js')
        .then(response => response.text())
        .then(scriptText => {
          // Execute the script
          eval(scriptText)
          setMessage('✅ Complete plan loaded! Refreshing...')
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        })
        .catch(error => {
          console.error('Error loading sample data:', error)
          setMessage('❌ Error loading sample data')
          setIsLoading(false)
        })
    } catch (error) {
      console.error('Error:', error)
      setMessage('❌ Error loading sample data')
      setIsLoading(false)
    }
  }

  const clearData = () => {
    if (confirm('Clear all wizard data? This cannot be undone.')) {
      localStorage.removeItem('bcp-draft')
      localStorage.removeItem('bcp-industry-selected')
      localStorage.removeItem('bcp-prefill-data')
      setMessage('✅ Data cleared! Refreshing...')
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 print:hidden">
      <button
        onClick={fillWithSampleData}
        disabled={isLoading}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {isLoading ? 'Loading...' : '🎯 Fill with Sample Data'}
      </button>
      
      <button
        onClick={clearData}
        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors text-sm font-medium"
      >
        🗑️ Clear Data
      </button>

      {message && (
        <div className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
          message.startsWith('✅') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}

