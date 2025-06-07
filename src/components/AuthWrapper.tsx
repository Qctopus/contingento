'use client'

import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from './LoginForm'
import { WelcomeScreen } from './WelcomeScreen'
import { useState, useEffect } from 'react'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading, login } = useAuth()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      // Check if user has seen welcome screen before
      const hasSeenWelcome = localStorage.getItem('bcp-welcome-seen')
      const hasExistingData = localStorage.getItem('bcp-industry-selected')
      
      // Show welcome screen if they haven't seen it and don't have existing data
      if (!hasSeenWelcome && !hasExistingData) {
        setShowWelcome(true)
      }
    }
  }, [isAuthenticated])

  const handleGetStarted = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bcp-welcome-seen', 'true')
    }
    setShowWelcome(false)
  }

  const handleSkipWelcome = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bcp-welcome-seen', 'true')
    }
    setShowWelcome(false)
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-700 dark:text-gray-300">Loading...</span>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  // Show welcome screen for new users, otherwise show main app
  if (showWelcome) {
    return <WelcomeScreen onGetStarted={handleGetStarted} onSkipWelcome={handleSkipWelcome} />
  }

  // Show the main app if authenticated
  return <>{children}</>
} 