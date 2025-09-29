'use client'

import React from 'react'
import Link from 'next/link'

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin2" className="text-xl font-medium text-gray-900 hover:text-blue-600 transition-colors">
              Admin Dashboard
            </Link>
            <div className="hidden md:block">
              <span className="text-sm text-gray-500">
                Business Continuity Planning System
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Main Application
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

