'use client'

import { useState, useEffect, useRef } from 'react'
import { RiskAssessmentWizard } from './RiskAssessmentWizard'
import { AdminStrategyCards } from './AdminStrategyCards'
import { ExcelUpload } from './ExcelUpload'
import { useTranslations } from 'next-intl'
import { useUserInteraction } from '@/lib/hooks'
import React from 'react' // Added for useEffect
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

interface Option {
  label: string
  value: string
}

interface TableRow {
  [key: string]: string
}

interface StructuredInputProps {
  type: 'text' | 'radio' | 'checkbox' | 'table' | 'special_risk_matrix' | 'special_strategy_cards'
  label: string
  required?: boolean
  prompt: string
  examples?: string[]
  options?: Option[]
  tableColumns?: string[]
  tableRowsPrompt?: string
  priorityOptions?: Option[]
  downtimeOptions?: Option[]
  likelihoodOptions?: Option[]
  severityOptions?: Option[]
  dependsOn?: string
  stepData?: any // Current step's data to access dependencies
  preFillData?: any // Industry and location pre-fill data
  onComplete: (value: any) => void
  initialValue?: any
  setUserInteracted?: () => void
}

export function StructuredInput({
  type,
  label,
  required = false,
  prompt,
  examples,
  options,
  tableColumns = [],
  tableRowsPrompt,
  priorityOptions,
  downtimeOptions,
  likelihoodOptions,
  severityOptions,
  dependsOn,
  stepData,
  preFillData,
  onComplete,
  initialValue,
  setUserInteracted,
}: StructuredInputProps) {
  const [value, setValue] = useState<string | string[] | TableRow[]>(
    type === 'checkbox' ? [] : type === 'table' ? [] : ''
  )

  // State for dynamic table rows (used by table input types)
  const [tableRows, setTableRows] = useState<TableRow[]>([])

  // Smart suggestions state
  const [smartSuggestions, setSmartSuggestions] = useState<{
    examples: string[]
    preFillValue: any
    contextualInfo: string | null
    isSmartSuggestion: boolean
  } | null>(null)
  const [isLoadingSmartSuggestions, setIsLoadingSmartSuggestions] = useState(false)
  const [hasSmartPreFill, setHasSmartPreFill] = useState(false)
  const [smartExamples, setSmartExamples] = useState<string[]>([])

  const t = useTranslations('common')
  
  // Use custom hook for user interaction tracking
  const { hasUserInteracted, didMount, setUserInteracted: setInteracted, resetInteraction } = useUserInteraction()

  // Fetch smart suggestions based on business type and location
  useEffect(() => {
    const fetchSmartSuggestions = async () => {
      if (!preFillData || !label || isLoadingSmartSuggestions || smartSuggestions) return
      
      try {
        setIsLoadingSmartSuggestions(true)
        
        const businessTypeId = preFillData.industry?.id
        const location = preFillData.location
        
        if (!businessTypeId) {
          setIsLoadingSmartSuggestions(false)
          return
        }
        
        // Determine the current step from context or defaults
        let currentStep = 'BUSINESS_OVERVIEW'
        if (label.toLowerCase().includes('function')) {
          currentStep = 'ESSENTIAL_FUNCTIONS'
        } else if (label.toLowerCase().includes('risk') || label.toLowerCase().includes('planning')) {
          currentStep = 'RISK_ASSESSMENT'
        } else if (label.toLowerCase().includes('strategy') || label.toLowerCase().includes('mitigation')) {
          currentStep = 'STRATEGIES'
        } else if (label.toLowerCase().includes('resource') || label.toLowerCase().includes('equipment') || label.toLowerCase().includes('staff')) {
          currentStep = 'RESOURCES'
        }
        
        const requestBody = {
          fieldName: label,
          businessTypeId,
          step: currentStep,
          countryCode: location?.countryCode,
          parish: location?.parish
        }
        
        const response = await fetch('/api/wizard/get-field-suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })
        
        if (response.ok) {
          const suggestions = await response.json()
          setSmartSuggestions(suggestions)
          setSmartExamples(suggestions.examples || [])
          
          // Auto-populate if there's a pre-fill value and user hasn't interacted yet
          if (suggestions.preFillValue && !hasUserInteracted && (!initialValue || initialValue === '')) {
            if (type === 'text') {
              setValue(suggestions.preFillValue)
              setHasSmartPreFill(true)
            } else if (type === 'table' && Array.isArray(suggestions.preFillValue)) {
              const preFilledRows = suggestions.preFillValue.map((item: any) => {
                const row: TableRow = {}
                tableColumns.forEach(column => {
                  row[column] = typeof item === 'string' ? item : item[column] || ''
                })
                return row
              })
              setTableRows(preFilledRows)
              setHasSmartPreFill(true)
            } else if (type === 'checkbox' && Array.isArray(suggestions.preFillValue)) {
              setValue(suggestions.preFillValue)
              setHasSmartPreFill(true)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching smart suggestions:', error)
      } finally {
        setIsLoadingSmartSuggestions(false)
      }
    }
    
    fetchSmartSuggestions()
  }, [preFillData?.industry?.id, label, type, hasUserInteracted, initialValue])

  // Auto-add initial row for tables when component first loads (only if no smart examples available)
  useEffect(() => {
    if (type === 'table' && tableColumns.length > 0 && tableRows.length === 0 && !hasUserInteracted && (!initialValue || (Array.isArray(initialValue) && initialValue.length === 0))) {
      // Only add initial empty row if there are no smart examples available
      if (smartExamples.length === 0 && (!examples || examples.length === 0)) {
        const newRow: TableRow = {}
        tableColumns.forEach(column => {
          newRow[column] = ''
        })
        setTableRows([newRow])
      }
    }
  }, [type, tableColumns, tableRows.length, hasUserInteracted, initialValue, smartExamples.length, examples])

  // Auto-save functionality: only call onComplete after user interaction
  useEffect(() => {
    if (!didMount) return
    
    // Special handling for risk matrix - always save its data
    if (type === 'special_risk_matrix') {
      return // Risk matrix handles its own saving
    }
    
    if (hasUserInteracted) {
      // For other types, only call onComplete after user interaction
      if (type === 'table') {
        onComplete(tableRows)
      } else {
        onComplete(value)
      }
    }
  }, [value, tableRows, type, onComplete, hasUserInteracted, didMount])

  // Initialize value and tableRows from initialValue when type or initialValue changes
  useEffect(() => {
    if (type === 'special_risk_matrix') {
      // For risk matrix, don't manage local state
      return
    }
    
    if (!hasUserInteracted) {
      // For other types, only initialize if user hasn't interacted
      if (type === 'checkbox' || type === 'radio' || type === 'text') {
        if (initialValue !== undefined && initialValue !== null) {
          setValue(initialValue)
        }
      } else if (type === 'table') {
        if (Array.isArray(initialValue)) {
          setTableRows(initialValue)
        }
      }
    }
  }, [type, initialValue, hasUserInteracted])

  // Reset interaction tracking when the question/section changes
  useEffect(() => {
    resetInteraction()
  }, [label, type, resetInteraction])

  const handleChange = (newValue: string | string[]) => {
    setInteracted()
    setUserInteracted?.()
    setValue(newValue)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e.target.value)
  }

  const handleRadioChange = (optionValue: string) => {
    handleChange(optionValue)
  }

  const handleCheckboxChange = (optionValue: string) => {
    const currentValue = value as string[]
    const newValue = currentValue.includes(optionValue)
      ? currentValue.filter(v => v !== optionValue)
      : [...currentValue, optionValue]
    handleChange(newValue)
  }

  // Table handling functions
  const addTableRow = () => {
    setInteracted()
    setUserInteracted?.()
    const newRow: TableRow = {}
    tableColumns.forEach(column => {
      newRow[column] = ''
    })
    setTableRows([...tableRows, newRow])
  }

  const updateTableRow = (rowIndex: number, columnKey: string, cellValue: string) => {
    setInteracted()
    setUserInteracted?.()
    const updatedRows = [...tableRows]
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [columnKey]: cellValue
    }
    setTableRows(updatedRows)
  }

  const deleteTableRow = (rowIndex: number) => {
    setInteracted()
    setUserInteracted?.()
    const updatedRows = tableRows.filter((_, index) => index !== rowIndex)
    // Ensure at least one row remains (add empty row if all deleted)
    if (updatedRows.length === 0 && !smartExamples.length && (!examples || examples.length === 0)) {
      const newRow: TableRow = {}
      tableColumns.forEach(column => {
        newRow[column] = ''
      })
      setTableRows([newRow])
    } else {
      setTableRows(updatedRows)
    }
  }

  // Excel import handling with validation
  const handleExcelImport = (importedData: TableRow[]) => {
    setInteracted()
    setUserInteracted?.()
    
    // Filter out completely empty rows
    const nonEmptyRows = importedData.filter(row => 
      Object.values(row).some(value => value && value.trim() !== '')
    )
    
    // Warn if data was filtered
    if (nonEmptyRows.length < importedData.length) {
      console.log(`Filtered out ${importedData.length - nonEmptyRows.length} empty rows from imported data`)
    }
    
    // Set the cleaned data
    setTableRows(nonEmptyRows.length > 0 ? nonEmptyRows : importedData)
  }

  // Special render for priority assessment table
  const renderPriorityTable = () => (
    <div className="space-y-4">
      {/* Excel Upload Section */}
      <ExcelUpload 
        tableColumns={tableColumns}
        onDataImported={handleExcelImport}
        className="mb-6"
      />
      
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{t('orEnterManually')}</span>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">{tableRowsPrompt}</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {tableColumns.map((column, index) => (
                <th key={index} className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  {column}
                </th>
              ))}
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-4 align-top">
                  <input
                    type="text"
                    value={row[tableColumns[0]] || ''}
                    onChange={(e) => updateTableRow(rowIndex, tableColumns[0], e.target.value)}
                    placeholder="Enter business function"
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-4 align-top">
                  <select
                    value={row[tableColumns[1]] || ''}
                    onChange={(e) => updateTableRow(rowIndex, tableColumns[1], e.target.value)}
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                  >
                    <option value="">Select priority</option>
                    {priorityOptions?.map((option) => (
                      <option key={option.value} value={option.value}>
                        <span className="text-gray-700 text-sm">{option.label}</span>
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 px-4 py-4 align-top">
                  <select
                    value={row[tableColumns[2]] || ''}
                    onChange={(e) => updateTableRow(rowIndex, tableColumns[2], e.target.value)}
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                  >
                    <option value="">Select downtime</option>
                    {downtimeOptions?.map((option) => (
                      <option key={option.value} value={option.value}>
                        <span className="text-gray-700 text-sm">{option.label}</span>
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 px-4 py-4 align-top">
                  <textarea
                    value={row[tableColumns[3]] || ''}
                    onChange={(e) => updateTableRow(rowIndex, tableColumns[3], e.target.value)}
                    placeholder="Additional notes"
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400 min-h-[80px] resize-y"
                    rows={3}
                    style={{ height: 'auto', minHeight: '80px' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.max(80, target.scrollHeight) + 'px';
                    }}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-4 align-top">
                  <button
                    onClick={() => deleteTableRow(rowIndex)}
                    className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                  >
                    {t('deleteRows', { count: 1 })}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between">
        <button
          onClick={addTableRow}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2 text-sm transition-colors"
        >
          <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 4v16m8-8H4" />
          </svg>
          <span>{t('addRow')}</span>
        </button>
        {tableRows.length > 1 && (
          <span className="text-sm text-gray-500">
            {tableRows.length} rows
          </span>
        )}
      </div>
    </div>
  )

  // Generic table render for other table types
  const renderGenericTable = () => (
    <div className="space-y-4">
      {/* Excel Upload Section */}
      <ExcelUpload 
        tableColumns={tableColumns}
        onDataImported={handleExcelImport}
        className="mb-6"
      />
      
      {/* Smart Table Examples */}
      {displayExamples.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {smartExamples.length > 0 ? '💡 Smart Examples:' : 'Examples:'}
            </span>
            {smartExamples.length > 0 && (
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                AI-Generated
              </span>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {displayExamples.slice(0, 3).map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  // Add example as a new table row
                  const newRow: TableRow = {}
                  tableColumns.forEach((column, colIndex) => {
                    newRow[column] = colIndex === 0 ? example : ''
                  })
                  // If table is empty or only has one completely empty row, replace it
                  // Otherwise add as new row
                  setTableRows(prev => {
                    if (prev.length === 0) {
                      return [newRow]
                    }
                    // Check if we only have one row and it's completely empty
                    if (prev.length === 1 && Object.values(prev[0]).every(val => !val || val.trim() === '')) {
                      return [newRow]
                    }
                    // Otherwise add as new row
                    return [...prev, newRow]
                  })
                  setInteracted()
                  setUserInteracted?.()
                  setHasSmartPreFill(false)
                }}
                className="block w-full text-left p-2 text-sm text-gray-600 bg-white hover:bg-gray-100 rounded border border-gray-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{t('orEnterManually')}</span>
        </div>
      </div>
      
      {tableRowsPrompt && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">{tableRowsPrompt}</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              {tableColumns.map((column, index) => (
                <th key={index} className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  {column}
                </th>
              ))}
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, rowIndex) => (
              <tr key={rowIndex} className={`hover:bg-gray-50 ${hasSmartPreFill && rowIndex < tableRows.length ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''}`}>
                {tableColumns.map((column, colIndex) => (
                  <td key={colIndex} className="border border-gray-300 px-4 py-4 align-top">
                    {column.toLowerCase().includes('email') ? (
                      <input
                        type="email"
                        value={row[column] || ''}
                        onChange={(e) => updateTableRow(rowIndex, column, e.target.value)}
                        placeholder="name@example.com"
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                      />
                    ) : column.toLowerCase().includes('phone') || column.toLowerCase().includes('contact') || column.toLowerCase().includes('number') ? (
                      <input
                        type="tel"
                        value={row[column] || ''}
                        onChange={(e) => updateTableRow(rowIndex, column, e.target.value)}
                        placeholder="(123) 456-7890"
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                      />
                    ) : column.toLowerCase().includes('website') || column.toLowerCase().includes('url') || column.toLowerCase().includes('link') ? (
                      <input
                        type="url"
                        value={row[column] || ''}
                        onChange={(e) => updateTableRow(rowIndex, column, e.target.value)}
                        placeholder="https://example.com"
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                      />
                    ) : column.toLowerCase().includes('date') || column.toLowerCase().includes('deadline') || column.toLowerCase().includes('due') || column.toLowerCase().includes('schedule') ? (
                      <DatePicker
                        selected={row[column] && row[column] !== '' ? (() => {
                          const date = new Date(row[column]);
                          return isNaN(date.getTime()) ? null : date;
                        })() : null}
                        onChange={(date: Date | null) => updateTableRow(rowIndex, column, date ? date.toISOString().split('T')[0] : '')}
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                        placeholderText={`Select ${column.toLowerCase()}`}
                        dateFormat="yyyy-MM-dd"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        isClearable
                      />
                    ) : (
                      <textarea
                        value={row[column] || ''}
                        onChange={(e) => updateTableRow(rowIndex, column, e.target.value)}
                        placeholder={`Enter ${column.toLowerCase()}`}
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400 min-h-[80px] resize-y"
                        rows={3}
                        style={{ height: 'auto', minHeight: '80px' }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.max(80, target.scrollHeight) + 'px';
                        }}
                      />
                    )}
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-4 align-top">
                  <button
                    onClick={() => deleteTableRow(rowIndex)}
                    className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50 flex items-center space-x-1"
                  >
                    <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>{t('deleteRows', { count: 1 })}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between">
        <button
          onClick={addTableRow}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2 text-sm transition-colors"
        >
          <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 4v16m8-8H4" />
          </svg>
          <span>{t('addRow')}</span>
        </button>
        {tableRows.length > 1 && (
          <span className="text-sm text-gray-500">
            {tableRows.length} rows
          </span>
        )}
      </div>
    </div>
  )

  const renderTable = () => {
    // Special handling for specific table types
    if (label === 'Function Priority Assessment') {
      return renderPriorityTable()
    }
    return renderGenericTable()
  }

  // Enhanced checkbox rendering with categories
  const renderEnhancedCheckbox = () => {
    // DISABLED: Potential Hazards step is now handled by SimplifiedRiskAssessment
    // Check if this is a Potential Hazards field in any language
    const isPotentialHazards = [
      'Potential Hazards',        // English
      'Dangers Potentiels',       // French
      'Peligros Potenciales',     // Spanish
      'Hazards'                   // New simplified label
    ].includes(label)
    
    if (isPotentialHazards) {
      // Redirect to use SimplifiedRiskAssessment instead
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <svg className="h-12 w-12 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-blue-900 mb-2">Risk Assessment Integrated</h3>
          <p className="text-blue-700 mb-4">
            Risk selection is now handled automatically in the Risk Assessment step using admin backend data.
          </p>
          <p className="text-sm text-blue-600">
            This step has been replaced with smart risk pre-selection based on your business type and location.
          </p>
        </div>
      )
    }
    
    // OLD HARDCODED HAZARD CATEGORIES REMOVED - System now uses Admin2 database exclusively
    // All hazard/risk data now comes from AdminHazardType table in the database

    // Regular checkbox rendering for other cases
    return (
      <div className="space-y-2">
        {options?.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              value={option.value}
              checked={(value as string[]).includes(option.value)}
              onChange={() => handleCheckboxChange(option.value)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
            />
            <span className="text-gray-700 text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    )
  }

  // Enhanced strategy cards component
  const renderStrategyCards = () => {
    const strategies = [
      {
        id: 'maintenance',
        title: 'Regular Maintenance',
        description: 'Systematic upkeep of equipment and facilities',
        category: 'prevention',
        reasoning: 'Prevents equipment failures and reduces downtime',
        icon: '🔧'
      },
      {
        id: 'physical_security',
        title: 'Physical Security',
        description: 'Alarms, cameras, locks, and access controls',
        category: 'prevention',
        reasoning: 'Protects against theft and unauthorized access',
        icon: '🔒'
      },
      {
        id: 'cybersecurity',
        title: 'Cybersecurity',
        description: 'Data protection and network security measures',
        category: 'prevention',
        reasoning: 'Guards against cyber threats and data breaches',
        icon: '🛡️'
      },
      {
        id: 'insurance',
        title: 'Insurance Coverage',
        description: 'Comprehensive business insurance policies',
        category: 'prevention',
        reasoning: 'Financial protection against major losses',
        icon: '📋'
      },
      {
        id: 'employee_training',
        title: 'Staff Training',
        description: 'Emergency preparedness and safety training',
        category: 'prevention',
        reasoning: 'Ensures staff know how to respond to emergencies',
        icon: '👥'
      },
      {
        id: 'emergency_supplies',
        title: 'Emergency Supplies',
        description: 'First aid, flashlights, backup equipment',
        category: 'prevention',
        reasoning: 'Provides immediate resources during emergencies',
        icon: '🏥'
      },
      {
        id: 'emergency_team',
        title: 'Emergency Response Team',
        description: 'Designated team with clear roles and responsibilities',
        category: 'response',
        reasoning: 'Ensures coordinated response during crises',
        icon: '🚨'
      },
      {
        id: 'safety_procedures',
        title: 'Safety Procedures',
        description: 'Staff and customer safety protocols',
        category: 'response',
        reasoning: 'Protects lives during emergency situations',
        icon: '⚡'
      },
              {
          id: 'emergency_communication',
          title: 'Emergency Communication',
          description: 'Communication plan for stakeholders',
          category: 'response',
          reasoning: 'Keeps everyone informed during emergencies',
          icon: '📞'
        },
        {
          id: 'alternative_locations',
          title: 'Alternative Locations',
          description: 'Backup facilities and remote work options',
          category: 'response',
          reasoning: 'Maintains operations when primary location is unusable',
          icon: '🏢'
        },
      {
        id: 'damage_assessment',
        title: 'Damage Assessment',
        description: 'Systematic evaluation of impacts and losses',
        category: 'recovery',
        reasoning: 'Identifies priorities for recovery efforts',
        icon: '📊'
      },
      {
        id: 'business_resumption',
        title: 'Business Resumption',
        description: 'Procedures to restart operations',
        category: 'recovery',
        reasoning: 'Gets business back to normal as quickly as possible',
        icon: '🔄'
      },
      {
        id: 'customer_retention',
        title: 'Customer Retention',
        description: 'Strategies to maintain customer relationships',
        category: 'recovery',
        reasoning: 'Preserves revenue and market position',
        icon: '🤝'
      }
    ]

    const selectedStrategies = Array.isArray(value) ? value as string[] : []

    const getRecommendationReason = (strategyId: string) => {
      // Get reasoning based on pre-fill data if available
      if (preFillData?.preFilledFields?.STRATEGIES) {
        const preFilledStrategies = preFillData.preFilledFields.STRATEGIES
        const recommendedStrategies = preFilledStrategies['Business Continuity Strategies'] || []
        
        if (Array.isArray(recommendedStrategies) && recommendedStrategies.includes(strategyId)) {
          return 'Recommended based on your business type and identified risks'
        }
      }
      return null
    }

    const groupedStrategies = {
      prevention: strategies.filter(s => s.category === 'prevention'),
      response: strategies.filter(s => s.category === 'response'),
      recovery: strategies.filter(s => s.category === 'recovery')
    }

    const categoryTitles = {
      prevention: 'Prevention Strategies (Before Emergencies)',
      response: 'Response Strategies (During Emergencies)',
      recovery: 'Recovery Strategies (After Emergencies)'
    }

    const categoryColors = {
      prevention: 'border-blue-200 bg-blue-50',
      response: 'border-yellow-200 bg-yellow-50',
      recovery: 'border-green-200 bg-green-50'
    }

    return (
      <div className="space-y-8">
        {Object.entries(groupedStrategies).map(([category, categoryStrategies]) => (
          <div key={category} className={`p-6 rounded-lg border-2 ${categoryColors[category as keyof typeof categoryColors]}`}>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {categoryTitles[category as keyof typeof categoryTitles]}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryStrategies.map((strategy) => {
                const isSelected = selectedStrategies.includes(strategy.id)
                const isRecommended = getRecommendationReason(strategy.id)
                
                return (
                  <div
                    key={strategy.id}
                    onClick={() => {
                      const newValue = isSelected 
                        ? selectedStrategies.filter(id => id !== strategy.id)
                        : [...selectedStrategies, strategy.id]
                      handleChange(newValue)
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    } ${isRecommended ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{strategy.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{strategy.title}</h4>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by div onClick
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{strategy.reasoning}</p>
                        {isRecommended && (
                          <div className="mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full inline-block">
                            ✨ Recommended for your business
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Special handling for risk matrix type
  const handleRiskMatrixComplete = (riskMatrix: any[]) => {
    setInteracted()
    onComplete(riskMatrix)
  }

  // Special handling for strategy cards
  const handleStrategyComplete = (strategies: any[]) => {
    setInteracted()
    onComplete(strategies)
  }

  // Get selected hazards from dependency
  const getSelectedHazards = (): string[] => {
    if (type === 'special_risk_matrix' && stepData) {
      // Try to get hazards using possible localized field names
      const possibleFieldNames = [
        'Potential Hazards',        // English
        'Dangers Potentiels',       // French
        'Peligros Potenciales'      // Spanish
      ]
      
      for (const fieldName of possibleFieldNames) {
        const hazards = stepData[fieldName]
        if (Array.isArray(hazards)) {
          return hazards
        }
      }
      
      // If no exact match found, try to find any array field (fallback)
      for (const [key, value] of Object.entries(stepData)) {
        if (Array.isArray(value) && value.length > 0) {
          return value
        }
      }
    }
    return []
  }

  // Extract location and business data from all step data
  const getContextualData = () => {
    // Debug: Log all available data
    if (process.env.NODE_ENV === 'development') {
      console.log('StructuredInput stepData:', stepData)
      console.log('StructuredInput preFillData:', preFillData)
    }

    // Use preFillData first if available, then fall back to stepData
    let locationData = undefined
    let businessData = undefined

    if (preFillData) {
      // Extract from preFillData structure
      locationData = {
        country: preFillData.location?.country || undefined,
        countryCode: preFillData.location?.countryCode || undefined,
        parish: preFillData.location?.parish || undefined,
        nearCoast: preFillData.location?.nearCoast || false,
        urbanArea: preFillData.location?.urbanArea || false
      }
      
      businessData = {
        industryType: preFillData.industry?.id || undefined,
        businessPurpose: stepData?.['Business Purpose'] || undefined,
        productsServices: stepData?.['Products and Services'] || undefined
      }
    } else if (stepData) {
      // Fallback to stepData extraction - try to find from various step fields
      locationData = {
        country: stepData['Country'] || stepData['company_country'] || undefined,
        countryCode: stepData['Country Code'] || stepData['company_country_code'] || undefined,
        parish: stepData['Parish'] || stepData['Region'] || stepData['State'] || undefined,
        nearCoast: stepData['Near Coast'] || stepData['Coastal Location'] || false,
        urbanArea: stepData['Urban Area'] || stepData['City Location'] || false
      }

      businessData = {
        industryType: stepData['Industry Type'] || stepData['Business Type'] || stepData['business_type'] || undefined,
        businessPurpose: stepData['Business Purpose'] || stepData['Company Purpose'] || undefined,
        productsServices: stepData['Products and Services'] || stepData['Services'] || undefined
      }
    }

    // Debug: Log extracted data
    if (process.env.NODE_ENV === 'development') {
      console.log('Extracted contextual data:', { locationData, businessData })
    }

    return { locationData, businessData }
  }

  if (type === 'special_strategy_cards') {
    const { locationData, businessData } = getContextualData()
    
    return (
      <AdminStrategyCards
        initialValue={initialValue}
        onComplete={handleStrategyComplete}
        setUserInteracted={() => { setInteracted() }}
        businessData={businessData}
        locationData={locationData}
        preFillData={preFillData}
      />
    )
  }

  if (type === 'special_risk_matrix') {
    const selectedHazards = getSelectedHazards()
    const { locationData, businessData } = getContextualData()

    // Always render the RiskAssessmentWizard - it will handle empty selectedHazards gracefully
    // The SimplifiedRiskAssessment component will use preFillData if available
    return (
      <RiskAssessmentWizard
        selectedHazards={selectedHazards}
        onComplete={handleRiskMatrixComplete}
        initialValue={initialValue}
        setUserInteracted={() => { setInteracted() }}
        locationData={locationData}
        businessData={businessData}
        preFillData={preFillData}
      />
    )
  }

  // Function to reset smart suggestions
  const resetSmartSuggestions = () => {
    setHasSmartPreFill(false)
    setValue('')
    setTableRows(type === 'table' ? [{
      ...tableColumns.reduce((acc, col) => ({ ...acc, [col]: '' }), {} as TableRow)
    }] : [])
    resetInteraction()
  }

  // Get the current examples to display (prioritize smart examples, avoid duplicates)
  const displayExamples = smartExamples.length > 0 ? smartExamples : (examples || [])
  
  // Remove duplicates if any exist
  const uniqueExamples = Array.from(new Set(displayExamples))

  return (
    <div className="space-y-4">
      {/* Smart Pre-fill Indicator */}
      {hasSmartPreFill && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🤖</span>
            </div>
            <span className="text-blue-800 text-sm font-medium">
              AI Suggested based on your profile
            </span>
            {smartSuggestions?.contextualInfo && (
              <span className="text-blue-600 text-xs">
                • {smartSuggestions.contextualInfo}
              </span>
            )}
          </div>
          <button
            onClick={resetSmartSuggestions}
            className="text-blue-600 hover:text-blue-800 text-xs underline"
            type="button"
          >
            {t('clearAndStartFresh')}
          </button>
        </div>
      )}

      {/* Loading indicator for smart suggestions */}
      {isLoadingSmartSuggestions && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-gray-600 text-sm">{t('loadingSmartSuggestions')}</span>
        </div>
      )}

      {type === 'text' && (
        <div className="space-y-3">
          <textarea
            value={value as string}
            onChange={handleTextChange}
            className={`w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400 ${
              hasSmartPreFill ? 'bg-blue-50 border-blue-300' : ''
            }`}
            placeholder={t('typeAnswerHere')}
            required={required}
          />
          
          {/* Smart Examples Display */}
          {uniqueExamples.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {smartExamples.length > 0 ? t('smartExamples') : t('examples')}
                </span>
                {smartExamples.length > 0 && (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {t('aiGenerated')}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                {uniqueExamples.slice(0, 3).map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setValue(example)
                      setInteracted()
                      setHasSmartPreFill(false)
                    }}
                    className="text-left p-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {type === 'radio' && options && (
        <div className="space-y-3">
          {uniqueExamples.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {smartExamples.length > 0 ? t('smartExamples') : t('examples')}
                </span>
                {smartExamples.length > 0 && (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {t('aiGenerated')}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                {uniqueExamples.slice(0, 3).map((example, index) => (
                  <div
                    key={index}
                    className="p-2 text-sm text-gray-600 bg-gray-50 rounded border border-gray-200"
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={label}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleRadioChange(option.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  required={required}
                />
                <span className="text-gray-700 text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {type === 'checkbox' && options && (
        <div className="space-y-3">
          {displayExamples.length > 0 && !label.toLowerCase().includes('hazard') && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {smartExamples.length > 0 ? t('smartExamples') : t('examples')}
                </span>
                {smartExamples.length > 0 && (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {t('aiGenerated')}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                {displayExamples.slice(0, 3).map((example, index) => (
                  <div
                    key={index}
                    className="p-2 text-sm text-gray-600 bg-gray-50 rounded border border-gray-200"
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}
          {renderEnhancedCheckbox()}
        </div>
      )}

      {type === 'table' && renderTable()}

      {/* Progress indicator for checkbox and table types */}
      {(type === 'checkbox' && Array.isArray(value) && value.length > 0) && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center space-x-2">
          <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span>{value.length} item(s) selected</span>
        </div>
      )}

      {(type === 'table' && tableRows.length > 0) && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-center space-x-2">
          <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {tableRows.length === 1 && !hasUserInteracted 
              ? "Ready to enter data - start typing in the fields above" 
              : `${tableRows.length} row(s) added`
            }
          </span>
        </div>
      )}
    </div>
  )
}