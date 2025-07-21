'use client'

import { useState, useEffect, useRef } from 'react'
import { RiskAssessmentWizard } from './RiskAssessmentWizard'
import { ExcelUpload } from './ExcelUpload'
import { useTranslations } from 'next-intl'
import { useUserInteraction } from '@/lib/hooks'

interface Option {
  label: string
  value: string
}

interface TableRow {
  [key: string]: string
}

interface StructuredInputProps {
  type: 'text' | 'radio' | 'checkbox' | 'table' | 'special_risk_matrix'
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
  const [tableRows, setTableRows] = useState<TableRow[]>([])
  const t = useTranslations('common')
  
  // Use custom hook for user interaction tracking
  const { hasUserInteracted, didMount, setUserInteracted: setInteracted, resetInteraction } = useUserInteraction()

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
    setTableRows(updatedRows)
  }

  // Excel import handling
  const handleExcelImport = (importedData: TableRow[]) => {
    setInteracted()
    setUserInteracted?.()
    setTableRows(importedData)
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
      
      <button
        onClick={addTableRow}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2 text-sm"
      >
        <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 4v16m8-8H4" />
        </svg>
        <span>{t('addRow')}</span>
      </button>
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
              <tr key={rowIndex} className="hover:bg-gray-50">
                {tableColumns.map((column, colIndex) => (
                  <td key={colIndex} className="border border-gray-300 px-4 py-4 align-top">
                    {column.toLowerCase().includes('email') ? (
                      <input
                        type="email"
                        value={row[column] || ''}
                        onChange={(e) => updateTableRow(rowIndex, column, e.target.value)}
                        placeholder={`Enter ${column.toLowerCase()}`}
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                      />
                    ) : column.toLowerCase().includes('phone') ? (
                      <input
                        type="tel"
                        value={row[column] || ''}
                        onChange={(e) => updateTableRow(rowIndex, column, e.target.value)}
                        placeholder={`Enter ${column.toLowerCase()}`}
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                      />
                    ) : column.toLowerCase().includes('date') ? (
                      <input
                        type="date"
                        value={row[column] || ''}
                        onChange={(e) => updateTableRow(rowIndex, column, e.target.value)}
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
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
      
      <button
        onClick={addTableRow}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2 text-sm"
      >
        <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 4v16m8-8H4" />
        </svg>
        <span>{t('addRow')}</span>
      </button>
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
    // Check if this is a Potential Hazards field in any language
    const isPotentialHazards = [
      'Potential Hazards',        // English
      'Dangers Potentiels',       // French
      'Peligros Potenciales'      // Spanish
    ].includes(label)
    
    if (isPotentialHazards && options) {
      // Group hazards by category
      const HAZARD_CATEGORIES = {
        'Natural Disasters': [
          'earthquake', 'hurricane', 'coastal_flood', 'flash_flood', 'landslide', 
          'tsunami', 'volcanic', 'drought', 'storm_surge', 'coastal_erosion', 
          'river_flooding', 'urban_flooding'
        ],
        'Health & Safety': ['epidemic', 'pandemic', 'fire', 'air_pollution'],
        'Infrastructure': [
          'power_outage', 'telecom_failure', 'cyber_attack', 'infrastructure_failure',
          'traffic_disruption', 'urban_congestion', 'water_shortage', 'waste_management'
        ],
        'Security & Crime': ['crime', 'civil_disorder', 'terrorism'],
        'Business Operations': [
          'supply_disruption', 'staff_unavailable', 'economic_downturn', 
          'tourism_disruption'
        ],
        'Industrial & Environmental': [
          'industrial_accident', 'oil_spill', 'sargassum', 'crowd_management',
          'chemical_spill', 'environmental_contamination', 'air_pollution', 
          'water_contamination', 'waste_management_failure'
        ]
      }

      return (
        <div className="space-y-6">
          {Object.entries(HAZARD_CATEGORIES).map(([category, hazardValues]) => {
            const categoryOptions = options.filter(option => hazardValues.includes(option.value))
            const selectedInCategory = categoryOptions.filter(option => (value as string[]).includes(option.value))
            
            return (
              <div key={category} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{category}</h4>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {selectedInCategory.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categoryOptions.map((option) => (
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
              </div>
            )
          })}
        </div>
      )
    }

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

  // Special handling for risk matrix type
  const handleRiskMatrixComplete = (riskMatrix: any[]) => {
    setInteracted()
    onComplete(riskMatrix)
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

  if (type === 'special_risk_matrix') {
    const selectedHazards = getSelectedHazards()
    
    if (selectedHazards.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noHazardsSelected')}</h3>
          <p className="text-gray-600">{t('selectHazardsPrompt')}</p>
        </div>
      )
    }

    const { locationData, businessData } = getContextualData()

    return (
      <RiskAssessmentWizard
        selectedHazards={selectedHazards}
        onComplete={handleRiskMatrixComplete}
        initialValue={initialValue}
        setUserInteracted={() => { setInteracted() }}
        locationData={locationData}
        businessData={businessData}
      />
    )
  }

  return (
    <div className="space-y-4">
      {type === 'text' && (
        <textarea
          value={value as string}
          onChange={handleTextChange}
          className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
          placeholder={t('typeAnswerHere')}
          required={required}
        />
      )}

      {type === 'radio' && options && (
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
      )}

      {type === 'checkbox' && options && renderEnhancedCheckbox()}

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
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center space-x-2">
          <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span>{tableRows.length} row(s) added</span>
        </div>
      )}
    </div>
  )
}