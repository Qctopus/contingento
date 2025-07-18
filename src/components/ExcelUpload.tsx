'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import * as XLSX from 'xlsx'

interface TableRow {
  [key: string]: string
}

interface ExcelUploadProps {
  tableColumns: string[]
  onDataImported: (data: TableRow[]) => void
  className?: string
}

export function ExcelUpload({ tableColumns, onDataImported, className = '' }: ExcelUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<TableRow[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('common')

  const validateFileSize = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit. Please choose a smaller file.')
      return false
    }
    return true
  }

  const validateFileFormat = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ]
    const validExtensions = ['.xlsx', '.xls']
    
    const isValidType = validTypes.includes(file.type)
    const isValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!isValidType && !isValidExtension) {
      setError('Invalid file format. Please upload an Excel file (.xlsx or .xls).')
      return false
    }
    return true
  }

  const normalizeColumnName = (name: string): string => {
    return name.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  }

  const findBestColumnMatch = (excelColumn: string, targetColumns: string[]): string | null => {
    const normalizedExcel = normalizeColumnName(excelColumn)
    
    // First, try exact match
    for (const target of targetColumns) {
      if (normalizeColumnName(target) === normalizedExcel) {
        return target
      }
    }
    
    // Then try partial matches
    for (const target of targetColumns) {
      const normalizedTarget = normalizeColumnName(target)
      if (normalizedExcel.includes(normalizedTarget) || normalizedTarget.includes(normalizedExcel)) {
        return target
      }
    }
    
    return null
  }

  const processExcelData = (workbook: XLSX.WorkBook): TableRow[] => {
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      throw new Error('No worksheets found in the Excel file.')
    }

    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    if (jsonData.length === 0) {
      throw new Error('The Excel file appears to be empty.')
    }

    // Get headers from first row
    const excelHeaders = jsonData[0].map(h => h?.toString() || '')
    if (excelHeaders.length === 0) {
      throw new Error('No column headers found in the Excel file.')
    }

    // Create column mapping
    const columnMapping: { [key: string]: string } = {}
    const unmappedColumns: string[] = []

    for (const excelCol of excelHeaders) {
      if (excelCol.trim()) {
        const match = findBestColumnMatch(excelCol, tableColumns)
        if (match) {
          columnMapping[excelCol] = match
        } else {
          unmappedColumns.push(excelCol)
        }
      }
    }

    // Check if we have at least one column mapped
    if (Object.keys(columnMapping).length === 0) {
      throw new Error(`No matching columns found. Expected columns: ${tableColumns.join(', ')}`)
    }

    // Process data rows
    const processedData: TableRow[] = []
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i]
      if (!row || row.every(cell => !cell)) continue // Skip empty rows

      const processedRow: TableRow = {}
      
      // Initialize all required columns with empty strings
      for (const col of tableColumns) {
        processedRow[col] = ''
      }
      
      // Fill in mapped data
      for (const [excelCol, targetCol] of Object.entries(columnMapping)) {
        const colIndex = excelHeaders.indexOf(excelCol)
        if (colIndex >= 0 && row[colIndex] !== undefined && row[colIndex] !== null) {
          processedRow[targetCol] = row[colIndex].toString().trim()
        }
      }

      processedData.push(processedRow)
    }

    if (processedData.length === 0) {
      throw new Error('No data rows found in the Excel file.')
    }

    return processedData
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset states
    setError(null)
    setSuccess(null)
    setShowPreview(false)
    setPreviewData([])

    // Validate file
    if (!validateFileSize(file) || !validateFileFormat(file)) {
      return
    }

    setIsProcessing(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      const processedData = processExcelData(workbook)
      
      setPreviewData(processedData)
      setShowPreview(true)
      setSuccess(`Successfully processed ${processedData.length} rows from "${file.name}"`)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process Excel file.'
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImportData = () => {
    onDataImported(previewData)
    setShowPreview(false)
    setPreviewData([])
    setSuccess(null)
  }

  const handleCancelImport = () => {
    setShowPreview(false)
    setPreviewData([])
    setSuccess(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <div className="space-y-3">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('uploadExcelFile')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('uploadExcelDescription')}
              <br />
              {t('expectedColumns')}: <span className="font-medium">{tableColumns.join(', ')}</span>
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
            id="excel-upload"
          />
          
          <label
            htmlFor="excel-upload"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
              ${isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700 cursor-pointer'
              } transition-colors`}
          >
                         {isProcessing ? (
               <>
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 {t('processing')}
               </>
             ) : (
               <>
                 <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                 </svg>
                 {t('chooseExcelFile')}
               </>
             )}
          </label>
          
                     <p className="text-xs text-gray-500">
             {t('maximumFileSize')}
           </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
                         <div>
               <h3 className="text-sm font-medium text-red-800">{t('uploadError')}</h3>
               <p className="text-sm text-red-700 mt-1">{error}</p>
             </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && !showPreview && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
                         <div>
               <h3 className="text-sm font-medium text-green-800">{t('uploadSuccessful')}</h3>
               <p className="text-sm text-green-700 mt-1">{success}</p>
             </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && previewData.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
                     <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
             <div className="flex items-center justify-between">
               <h3 className="text-lg font-medium text-gray-900">{t('previewImportedData')}</h3>
               <span className="text-sm text-gray-600">{previewData.length} rows</span>
             </div>
             <p className="text-sm text-gray-600 mt-1">
               {t('reviewDataBeforeImporting')}
             </p>
           </div>
          
          <div className="overflow-x-auto max-h-80">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {tableColumns.map((column, index) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {tableColumns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                        {row[column] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
                     {previewData.length > 5 && (
             <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center">
               {t('andMoreRows', { count: previewData.length - 5 })}
             </div>
           )}
          
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleCancelImport}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
                         <button
               onClick={handleImportData}
               className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 transition-colors"
             >
               {t('importRows', { count: previewData.length })}
             </button>
          </div>
        </div>
      )}
    </div>
  )
} 