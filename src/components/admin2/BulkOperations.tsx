'use client'

import React, { useState, useRef } from 'react'

interface BulkOperationsProps {
  onImport: (file: File) => Promise<void>
  onExport: () => void
  importLabel: string
  exportLabel: string
  fileFormatDescription: string
  sampleData?: any[]
  disabled?: boolean
}

export function BulkOperations({
  onImport,
  onExport,
  importLabel,
  exportLabel,
  fileFormatDescription,
  sampleData,
  disabled = false
}: BulkOperationsProps) {
  const [showImportModal, setShowImportModal] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showFormatHelp, setShowFormatHelp] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      await onImport(file)
      setShowImportModal(false)
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed. Please check your file format and try again.')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const generateSampleCSV = () => {
    if (!sampleData || sampleData.length === 0) return ''
    
    const headers = Object.keys(sampleData[0])
    const rows = sampleData.map(item => 
      headers.map(header => {
        const value = item[header]
        // Handle arrays and objects
        if (Array.isArray(value)) {
          return `"${value.join(';')}"`
        } else if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value)}"`
        } else {
          return `"${value || ''}"`
        }
      }).join(',')
    )
    
    return [headers.join(','), ...rows].join('\n')
  }

  const downloadSample = () => {
    const csvContent = generateSampleCSV()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sample_${importLabel.toLowerCase().replace(/\s+/g, '_')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowImportModal(true)}
          disabled={disabled}
          className={`inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md ${
            disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
          }`}
        >
          <span className="mr-2">📥</span>
          {importLabel}
        </button>

        <button
          onClick={onExport}
          disabled={disabled}
          className={`inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md ${
            disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
          }`}
        >
          <span className="mr-2">📊</span>
          {exportLabel}
        </button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">{importLabel}</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input
                          ref={fileInputRef}
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".csv"
                          onChange={handleImport}
                          disabled={isImporting}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV files only</p>
                  </div>
                </div>
              </div>

              {/* Format Help */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-blue-800">File Format Requirements</h4>
                    <div className="mt-2 text-sm text-blue-700">
                      <p className="mb-2">{fileFormatDescription}</p>
                      <button
                        onClick={() => setShowFormatHelp(!showFormatHelp)}
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        {showFormatHelp ? 'Hide' : 'Show'} detailed format guide
                      </button>
                      {showFormatHelp && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <h5 className="font-medium text-gray-900 mb-2">Recommended Workflow:</h5>
                          <ol className="list-decimal list-inside space-y-1 text-sm">
                            <li>Download current data using the Export button</li>
                            <li>Open the CSV file in Excel or Google Sheets</li>
                            <li>Edit the data (add, modify, or remove rows as needed)</li>
                            <li>Save the file as CSV format</li>
                            <li>Upload the modified file using this import tool</li>
                          </ol>
                          {sampleData && sampleData.length > 0 && (
                            <div className="mt-3">
                              <button
                                onClick={downloadSample}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                📄 Download Sample CSV
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  disabled={isImporting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              {isImporting && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Processing file...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

