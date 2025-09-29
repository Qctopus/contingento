'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function UNDPHeader() {
  return (
    <header className="bg-white border-b border-gray-200 relative">
      {/* UNDP Header Bar */}
      <div className="bg-blue-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image 
              src="/undp-logo.png" 
              alt="UNDP Logo" 
              width={120} 
              height={45}
              className="h-12 w-auto"
            />
            <div className="border-l border-blue-400 pl-4">
              <h1 className="text-lg font-medium">
                Jamaica Business Continuity Planning Platform
              </h1>
              <p className="text-blue-100 text-sm">
                Administrative Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-blue-100 hover:text-white transition-colors text-sm font-medium px-3 py-1 rounded"
            >
              Main Application
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
