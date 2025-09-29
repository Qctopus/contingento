'use client'

import React, { useState, useRef } from 'react'

interface BulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, replaceAll: boolean) => Promise<void>
  title: string
  dataType: string
  description: string
  exampleWorkflow: string[]
  sampleHeaders: string[]
  warningMessage?: string
}

export function BulkUploadModal({
  isOpen,
  onClose,
  onUpload,
  title,
  dataType,
  description,
  exampleWorkflow,
  sampleHeaders,
  warningMessage
}: BulkUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [replaceAll, setReplaceAll] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file.')
      return
    }

    setSelectedFile(file)
  }

  const handleUploadClick = () => {
    if (!selectedFile) {
      alert('Please select a file first.')
      return
    }

    if (replaceAll) {
      setShowConfirmation(true)
    } else {
      performUpload()
    }
  }

  const performUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      await onUpload(selectedFile, replaceAll)
      onClose()
      setSelectedFile(null)
      setReplaceAll(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please check your file format and try again.')
    } finally {
      setIsUploading(false)
      setShowConfirmation(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setReplaceAll(false)
    setShowConfirmation(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isUploading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Warning Section */}
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-red-800">⚠️ Important Warning</h4>
                <div className="mt-2 text-sm text-red-700">
                  <p className="mb-2">
                    <strong>This upload will modify your live database.</strong> {warningMessage || `Uploading a CSV file will update or replace existing ${dataType} data in the database.`}
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Existing records with matching IDs will be updated</li>
                    <li>New records will be created for non-matching IDs</li>
                    <li>If "Replace All Data" is checked, ALL existing data will be deleted first</li>
                    <li>This action cannot be easily undone</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
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
                      onChange={handleFileSelect}
                      className="sr-only"
                      disabled={isUploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV files only</p>
                {selectedFile && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Replace All Option */}
          <div className="mb-6">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={replaceAll}
                onChange={(e) => setReplaceAll(e.target.checked)}
                disabled={isUploading}
                className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Replace All Data</span>
                <p className="text-sm text-gray-600">
                  Check this box to delete ALL existing {dataType} data and replace it entirely with the CSV data. 
                  <span className="text-red-600 font-medium"> This is irreversible!</span>
                </p>
              </div>
            </label>
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
                  <p className="mb-2">{description}</p>
                  
                  <div className="bg-white rounded border p-3 mt-3">
                    <h5 className="font-medium text-gray-900 mb-2">📝 Recommended Workflow:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {exampleWorkflow.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-gray-50 rounded border p-3 mt-3">
                    <h5 className="font-medium text-gray-900 mb-2">📋 Required Headers:</h5>
                    <div className="text-xs font-mono bg-white border rounded p-2 max-h-32 overflow-y-auto">
                      {sampleHeaders.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadClick}
              disabled={isUploading || !selectedFile}
              className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                replaceAll 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                <>
                  {replaceAll ? '🔄 Replace All Data' : '📥 Upload & Update'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Confirm Data Replacement</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                You are about to <strong className="text-red-600">DELETE ALL existing {dataType} data</strong> and replace it with the CSV data.
              </p>
              <p className="text-sm text-red-600 font-medium">
                This action cannot be undone. Are you absolutely sure?
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={performUpload}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Yes, Replace All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
