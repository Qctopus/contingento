'use client'

import React from 'react'
import Link from 'next/link'

export function Navigation() {
  return (
    <div className="bg-blue-600 text-white p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/admin2" className="text-xl font-bold hover:text-blue-200">
          🏝️ Parish Risk Manager
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link href="/" className="hover:text-blue-200">
            Main App
          </Link>
        </div>
      </div>
    </div>
  )
}

