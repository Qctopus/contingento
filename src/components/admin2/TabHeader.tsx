'use client'

import React from 'react'

interface ViewMode {
  mode: string
  label: string
  icon: string
  isActive: boolean
  onClick: () => void
}

interface Stat {
  label: string
  value: string
  color: string
}

interface BulkOperations {
  downloadLabel: string
  uploadLabel: string
  onDownload: () => void
  onUpload: () => void
}

interface TabHeaderProps {
  title: string
  description: string
  icon: string
  bulkOperations?: BulkOperations
  viewModes: ViewMode[]
  stats: Stat[]
}

export function TabHeader({ 
  title, 
  description, 
  icon, 
  bulkOperations, 
  viewModes, 
  stats 
}: TabHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Main Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <span>{icon}</span>
            <span>{title}</span>
          </h2>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Bulk Operations */}
          {bulkOperations && (
            <div className="flex items-center space-x-2">
              <button
                onClick={bulkOperations.onDownload}
                className="inline-flex items-center px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="mr-2">📊</span>
                {bulkOperations.downloadLabel}
              </button>
              <button
                onClick={bulkOperations.onUpload}
                className="inline-flex items-center px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="mr-2">📥</span>
                {bulkOperations.uploadLabel}
              </button>
            </div>
          )}
          
          {/* View Mode Selector */}
          <div className="flex space-x-2">
            {viewModes.map(viewMode => (
              <button
                key={viewMode.mode}
                onClick={viewMode.onClick}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode.isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                <span>{viewMode.icon}</span>
                <span>{viewMode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-8 text-sm text-gray-600">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className={`h-2 w-2 ${stat.color} rounded-full`}></span>
              <span>{stat.label}: {stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}