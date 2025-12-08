'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

/**
 * Development-only component for filling wizard with sample data
 * Uses EXACTLY the same data structure as scripts/fill-wizard-SIMPLE.js
 * Only renders in development mode
 */
export function DevDataFiller() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const fillWithSampleData = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Load and execute the random wizard fill script
      const script = await fetch('/fill-wizard-random.js')
      if (!script.ok) {
        throw new Error(`Failed to load script: ${script.status}`)
      }
      const scriptText = await script.text()

      // Wrap in try-catch to handle async errors
      try {
        // Pass locale to the script via global variable
        // @ts-ignore
        window.__WIZARD_LOCALE__ = locale

        // Execute the script - it's an async IIFE that will handle its own errors
        eval(scriptText)
        // Give it a moment to start, then check for errors
        setTimeout(() => {
          // If we're still here after 3 seconds and no reload happened, something went wrong
          if (!document.hidden) {
            setMessage('✅ Random data loaded! Refreshing...')
          }
        }, 500)
      } catch (evalError) {
        console.error('Error executing script:', evalError)
        const errorMessage = evalError instanceof Error ? evalError.message : 'Unknown error'
        setMessage(`❌ Error: ${errorMessage}`)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error loading sample data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load script'
      setMessage(`❌ Error: ${errorMessage}`)
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
        {isLoading ? 'Loading...' : '🎲 Fill with Random Data'}
      </button>

      <button
        onClick={clearData}
        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors text-sm font-medium"
      >
        🗑️ Clear Data
      </button>

      {message && (
        <div className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${message.startsWith('✅') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
          {message}
        </div>
      )}
    </div>
  )
}

