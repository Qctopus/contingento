'use client'

import { useState, useEffect } from 'react'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth-token')
        setIsAuthenticated(token === 'authenticated')
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = () => {
    setIsAuthenticated(true)
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
      // Also clear any application data on logout
      localStorage.removeItem('bcp-industry-selected')
      localStorage.removeItem('bcp-prefill-data')
      localStorage.removeItem('bcp-draft')
    }
    setIsAuthenticated(false)
    // Force a page reload to ensure clean state
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  }
} 