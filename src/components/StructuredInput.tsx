'use client'

import { useState, useEffect, useRef } from 'react'
import { RiskAssessmentWizard } from './RiskAssessmentWizard'
import { ExcelUpload } from './ExcelUpload'
import { useTranslations } from 'next-intl'
import { useUserInteraction } from '@/lib/hooks'
import React from 'react' // Added for useEffect
import { getBusinessTypeFromFormData } from '../data/actionPlansMatrix'

interface Option {
  label: string
  value: string
}

interface TableRow {
  [key: string]: string
}

interface StructuredInputProps {
  type: 'text' | 'radio' | 'checkbox' | 'table' | 'special_risk_matrix' | 'special_smart_action_plan'
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
      'Peligros Potenciales',     // Spanish
      'Hazards'                   // New simplified label
    ].includes(label)
    
    if (isPotentialHazards && options) {
      // Comprehensive hazard categories matching the full database
      const COMPREHENSIVE_HAZARD_CATEGORIES = {
        'Natural Disasters': [
          'earthquake', 'hurricane', 'coastal_flood', 'flash_flood', 'urban_flooding', 
          'river_flooding', 'landslide', 'storm_surge', 'coastal_erosion', 'tsunami', 'drought'
        ],
        'Health & Safety': [
          'epidemics', 'pandemic', 'fire'
        ],
        'Infrastructure & Technology': [
          'power_outage', 'telecom_failure', 'cyber_crime', 'infrastructure_failure'
        ],
        'Security & Crime': [
          'crime', 'civil_disorder', 'terrorism'
        ],
        'Business & Economic': [
          'supply_disruption', 'staff_unavailable', 'economic_downturn', 'tourism_disruption'
        ],
        'Environmental & Industrial': [
          'industrial_accident', 'chemical_spill', 'oil_spill', 'environmental_contamination',
          'air_pollution', 'water_contamination', 'water_shortage', 'waste_management_failure', 'sargassum'
        ],
        'Urban & Operational': [
          'traffic_disruption', 'urban_congestion', 'crowd_management', 'waste_management'
        ]
      }

      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Comprehensive Risk Selection</h4>
            <p className="text-blue-800 text-sm">
              Select all risks that could potentially affect your business. In the next step, we'll use your location and business type to intelligently prioritize these risks.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {Object.entries(COMPREHENSIVE_HAZARD_CATEGORIES).map(([category, hazardValues]) => {
              const categoryOptions = options.filter(option => hazardValues.includes(option.value))
              const selectedInCategory = categoryOptions.filter(option => (value as string[]).includes(option.value))
              
              // Category icons and colors
              const categoryConfig = {
                'Natural Disasters': { icon: '🌪️', color: 'red' },
                'Health & Safety': { icon: '🏥', color: 'orange' },
                'Infrastructure & Technology': { icon: '⚡', color: 'blue' },
                'Security & Crime': { icon: '🚨', color: 'purple' },
                'Business & Economic': { icon: '💼', color: 'green' },
                'Environmental & Industrial': { icon: '🏭', color: 'yellow' },
                'Urban & Operational': { icon: '🏙️', color: 'gray' }
              }[category] || { icon: '📋', color: 'gray' }
              
              return (
                <div key={category} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <span>{categoryConfig.icon}</span>
                      <span>{category}</span>
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full bg-${categoryConfig.color}-100 text-${categoryConfig.color}-800`}>
                      {selectedInCategory.length}/{categoryOptions.length}
                    </span>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {categoryOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors text-sm ${
                          (value as string[]).includes(option.value)
                            ? `bg-${categoryConfig.color}-50 border border-${categoryConfig.color}-200`
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={(value as string[]).includes(option.value)}
                          onChange={() => handleCheckboxChange(option.value)}
                          className={`h-3 w-3 rounded text-${categoryConfig.color}-600 focus:ring-${categoryConfig.color}-500`}
                        />
                        <span className="text-gray-700 flex-1">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selection Summary */}
          {Array.isArray(value) && value.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="h-5 w-5 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-green-900">{value.length} risks selected</span>
              </div>
              <p className="text-green-800 text-sm">
                Our intelligent prioritization system will analyze these risks based on your specific location and business type in the next step.
              </p>
            </div>
          )}
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

  if (type === 'special_smart_action_plan') {
    // Generate action plans based on business type and risk assessment
    const generateSmartActionPlans = () => {
      // Enhanced data extraction with multiple fallbacks
      let businessOverview = {}
      let riskAssessment = {}
      
      // Debug: Log all available data
      console.log('🔍 Smart Action Plan - Available stepData:', stepData)
      console.log('🔍 Smart Action Plan - Available preFillData:', preFillData)
      
      // Enhanced debug logging for data structure analysis
      if (stepData) {
        console.log('📊 stepData structure analysis:')
        console.log('  - Type:', typeof stepData)
        console.log('  - Keys:', Object.keys(stepData))
        
        if (stepData.BUSINESS_OVERVIEW) {
          console.log('  - BUSINESS_OVERVIEW keys:', Object.keys(stepData.BUSINESS_OVERVIEW))
          console.log('  - BUSINESS_OVERVIEW content:', stepData.BUSINESS_OVERVIEW)
        }
        
        if (stepData.RISK_ASSESSMENT) {
          console.log('  - RISK_ASSESSMENT keys:', Object.keys(stepData.RISK_ASSESSMENT))
          console.log('  - RISK_ASSESSMENT content:', stepData.RISK_ASSESSMENT)
        }
      }
      
      if (preFillData) {
        console.log('📊 preFillData structure analysis:')
        console.log('  - Industry:', preFillData.industry)
        console.log('  - Location:', preFillData.location)
        console.log('  - Pre-filled fields:', Object.keys(preFillData.preFilledFields))
      }
      
      // Extract business overview data with multiple fallbacks
      if (stepData?.BUSINESS_OVERVIEW) {
        businessOverview = stepData.BUSINESS_OVERVIEW
        console.log('✅ Found BUSINESS_OVERVIEW in stepData:', businessOverview)
      } else if (stepData && typeof stepData === 'object') {
        // Check if business data is stored directly in stepData
        const businessKeys = ['Industry Type', 'business_type', 'Business Purpose', 'Products & Services']
        const hasBusinessData = businessKeys.some(key => (stepData as any)[key] !== undefined)
        if (hasBusinessData) {
          businessOverview = stepData
          console.log('✅ Found business data directly in stepData:', businessOverview)
        }
      }
      
      // Extract risk assessment data with multiple fallbacks
      if (stepData?.RISK_ASSESSMENT) {
        riskAssessment = stepData.RISK_ASSESSMENT
        console.log('✅ Found RISK_ASSESSMENT in stepData:', riskAssessment)
      } else if (stepData && typeof stepData === 'object') {
        // Check if risk data is stored directly in stepData
        const riskKeys = ['Risk Assessment Matrix', 'Risk Matrix', 'riskMatrix']
        const hasRiskData = riskKeys.some(key => (stepData as any)[key] !== undefined)
        if (hasRiskData) {
          riskAssessment = stepData
          console.log('✅ Found risk data directly in stepData:', riskAssessment)
        }
      }
      
      // Import action plans generation logic
      const { 
        HAZARD_ACTION_PLANS, 
        BUSINESS_TYPE_MODIFIERS, 
        getBusinessTypeFromFormData 
      } = require('../data/actionPlansMatrix')

      // Try to get risk matrix from different possible field names
      let riskMatrix = null
      
      // First try the direct array (most common case)
      if (Array.isArray(riskAssessment)) {
        riskMatrix = riskAssessment
      }
      // Then try the "Risk Assessment Matrix" field
      else if ((riskAssessment as any)['Risk Assessment Matrix'] && Array.isArray((riskAssessment as any)['Risk Assessment Matrix'])) {
        riskMatrix = (riskAssessment as any)['Risk Assessment Matrix']
      }
      // Then try other possible field names
      else if ((riskAssessment as any)['Risk Matrix'] && Array.isArray((riskAssessment as any)['Risk Matrix'])) {
        riskMatrix = (riskAssessment as any)['Risk Matrix']
      }
      // Finally, try to find any array field that might contain risk data
      else {
        for (const [key, value] of Object.entries(riskAssessment)) {
          if (Array.isArray(value) && value.length > 0 && value[0] && typeof value[0] === 'object' && value[0].hazard) {
            riskMatrix = value
            console.log(`✅ Found risk matrix in "${key}" field`)
            break
          }
        }
      }
      
      // Additional fallback: check if riskAssessment itself is an array of risk objects
      if (!riskMatrix && Array.isArray(riskAssessment) && riskAssessment.length > 0) {
        const firstItem = riskAssessment[0]
        if (firstItem && typeof firstItem === 'object' && (firstItem.hazard || firstItem.Hazard)) {
          riskMatrix = riskAssessment
          console.log('✅ Found risk matrix as direct array in riskAssessment')
        }
      }

      if (!riskMatrix || !Array.isArray(riskMatrix)) {
        console.log('❌ No valid risk assessment data found:', riskAssessment)
        console.log('Available keys in riskAssessment:', Object.keys(riskAssessment))
        console.log('Risk assessment type:', typeof riskAssessment)
        console.log('Risk assessment content:', riskAssessment)
        return []
      }

      console.log('✅ Found risk matrix:', riskMatrix)
      console.log('📊 Risk matrix length:', riskMatrix.length)
      console.log('📊 Risk matrix sample:', riskMatrix.slice(0, 2))

      // Filter for high and extreme risk hazards (case-insensitive)
      const priorityHazards = riskMatrix.filter((risk: any) => {
        const riskLevel = (risk.riskLevel || risk.RiskLevel || risk.risk_level || '').toLowerCase()
        console.log('Checking risk:', risk.hazard || risk.Hazard, 'with level:', riskLevel)
        return riskLevel.includes('high') || riskLevel.includes('extreme')
      })

      console.log('Priority hazards found:', priorityHazards.length)

      // Get business type for customization with enhanced extraction
      let businessType = getBusinessTypeFromFormData({ BUSINESS_OVERVIEW: businessOverview })
      
      // Fallback: try to extract business type directly from businessOverview
      if (!businessType && businessOverview) {
        businessType = (businessOverview as any)['Industry Type'] || 
                      (businessOverview as any)['business_type'] || 
                      (businessOverview as any)['Business Type'] ||
                      (businessOverview as any)['industry_type']
        console.log('Fallback business type extraction:', businessType)
      }
      
      const businessModifiers = BUSINESS_TYPE_MODIFIERS[businessType] || {}
      
      console.log('Business type detection:', { businessType, businessOverview })

      // Generate action plans for each priority hazard
      return priorityHazards.map((risk: any) => {
        const hazardName = risk.hazard || risk.Hazard || ''
        const riskLevel = risk.riskLevel || risk.RiskLevel || 'High'
        
        // Find matching hazard key in action plans matrix
        const hazardKey = Object.keys(HAZARD_ACTION_PLANS).find((key: string) => {
          const normalizedKey = key.toLowerCase().replace(/_/g, ' ')
          const normalizedHazard = hazardName.toLowerCase().replace(/_/g, ' ')
          
          // Direct matches
          if (normalizedKey === normalizedHazard) return true
          
          // Partial matches
          if (normalizedKey.includes(normalizedHazard) || normalizedHazard.includes(normalizedKey)) return true
          
          // Special mappings for common variations
          const hazardMappings: { [key: string]: string[] } = {
            'hurricane': ['hurricane', 'tropical storm', 'storm', 'cyclone'],
            'power_outage': ['power outage', 'electrical failure', 'blackout', 'extended power outage'],
            'cyber_attack': ['cyber attack', 'cybercrime', 'hacking', 'data breach', 'cyber attack'],
            'fire': ['fire', 'blaze', 'conflagration'],
            'flood': ['flood', 'flooding', 'flash flood', 'coastal flood', 'flash flooding'],
            'earthquake': ['earthquake', 'seismic', 'quake']
          }
          
          const possibleMatches = hazardMappings[key] || [key]
          return possibleMatches.some(match => 
            normalizedHazard.includes(match.toLowerCase()) || 
            match.toLowerCase().includes(normalizedHazard)
          )
        })

        console.log('Hazard matching:', { hazardName, hazardKey })

        // Get base action plan from matrix
        let actionPlan = hazardKey ? { ...HAZARD_ACTION_PLANS[hazardKey] } : {
          resourcesNeeded: [
            'Emergency supplies and first aid kit',
            'Communication systems (radio, phone backup)',
            'Backup procedures and documentation',
            'Emergency contact list',
            'Alternative work location plan',
            'Insurance documentation'
          ],
          immediateActions: [
            { task: 'Activate emergency response procedures', responsible: 'Management', duration: '1 hour', priority: 'high' },
            { task: 'Ensure staff and customer safety', responsible: 'All Staff', duration: '30 minutes', priority: 'high' },
            { task: 'Contact emergency services if needed', responsible: 'Management', duration: '15 minutes', priority: 'high' },
            { task: 'Assess immediate impact and needs', responsible: 'Management', duration: '2 hours', priority: 'high' }
          ],
          shortTermActions: [
            { task: 'Implement alternative business processes', responsible: 'Operations Team', duration: '1 day', priority: 'medium' },
            { task: 'Coordinate with staff on availability', responsible: 'HR Manager', duration: '4 hours', priority: 'medium' },
            { task: 'Update stakeholders on status', responsible: 'Management', duration: '2 hours', priority: 'medium' }
          ],
          mediumTermActions: [
            { task: 'Assess damage and recovery needs', responsible: 'Management', duration: '1 week', priority: 'medium' },
            { task: 'Implement recovery procedures', responsible: 'Operations Team', duration: '2 weeks', priority: 'medium' },
            { task: 'Document lessons learned', responsible: 'Management', duration: '1 week', priority: 'low' }
          ],
          longTermReduction: [
            'Implement prevention measures specific to this hazard',
            'Improve monitoring and early warning systems',
            'Strengthen business resilience and backup procedures',
            'Regular training and plan updates'
          ]
        }

        // Apply business type modifications
        if (businessModifiers.additionalResources) {
          actionPlan.resourcesNeeded = [...actionPlan.resourcesNeeded, ...businessModifiers.additionalResources]
        }

        const actionPlanResult = {
          hazard: hazardName,
          riskLevel: riskLevel,
          businessType: businessType,
          ...actionPlan
        }
        
        console.log('Generated action plan for:', hazardName, actionPlanResult)
        
        return actionPlanResult
      })
    }

    const smartActionPlans = generateSmartActionPlans()
    
    // Debug: Log what data is available
    console.log('🔍 Smart Action Plan Debug:')
    console.log('Step Data Keys:', Object.keys(stepData || {}))
    console.log('Business Overview:', stepData?.BUSINESS_OVERVIEW)
    console.log('Risk Assessment:', stepData?.RISK_ASSESSMENT)
    console.log('Generated Plans:', smartActionPlans.length)
    
    // Auto-complete the entire ACTION_PLAN step when plans are generated
    const hasAutoCompletedRef = React.useRef(false)
    
    React.useEffect(() => {
      if (smartActionPlans.length > 0 && !hasAutoCompletedRef.current) {
        // Generate smart suggestions for other fields
        const businessType = getBusinessTypeFromFormData({ BUSINESS_OVERVIEW: stepData?.BUSINESS_OVERVIEW || {} })
        
        // Create implementation priority based on risk levels
        const priorityOrder = smartActionPlans
          .sort((a, b) => {
            const aLevel = a.riskLevel.toLowerCase()
            const bLevel = b.riskLevel.toLowerCase()
            if (aLevel.includes('extreme') && !bLevel.includes('extreme')) return -1
            if (bLevel.includes('extreme') && !aLevel.includes('extreme')) return 1
            if (aLevel.includes('high') && !bLevel.includes('high')) return -1
            if (bLevel.includes('high') && !aLevel.includes('high')) return 1
            return 0
          })
          .map(plan => plan.hazard)
        
        const implementationPriority = `Start with ${priorityOrder[0]} (highest risk), then ${priorityOrder.slice(1).join(', ')}`
        
        // Generate budget estimate based on business type and number of plans
        const budgetEstimates: Record<string, string> = {
          'tourism': '$15,000 - $25,000',
          'retail': '$10,000 - $20,000', 
          'food_service': '$8,000 - $15,000',
          'manufacturing': '$20,000 - $40,000',
          'technology': '$12,000 - $25,000',
          'general': '$10,000 - $20,000'
        }
        
        const budgetAndResources = `Total budget: ${budgetEstimates[businessType] || budgetEstimates.general} over 6 months, plus 20 hours/week from management team for implementation and training.`
        
        // Generate implementation team based on business type
        const teamSuggestions: Record<string, string> = {
          'tourism': 'Project Manager: Operations Manager, Emergency Coordinator: HR Director, Communication Lead: Marketing Manager',
          'retail': 'Implementation Lead: Store Manager, Operations Coordinator: Assistant Manager, Training Lead: Senior Staff',
          'food_service': 'Kitchen Manager: Emergency Response Lead, Service Manager: Customer Communication, Owner: Overall Coordination',
          'manufacturing': 'Plant Manager: Overall Lead, Safety Manager: Emergency Procedures, Production Manager: Operations Continuity',
          'technology': 'IT Manager: Technical Implementation, Operations Manager: Process Coordination, HR Manager: Staff Training',
          'general': 'Manager: Overall Lead, Assistant Manager: Daily Operations, Senior Staff: Training Coordination'
        }
        
        const implementationTeam = teamSuggestions[businessType] || teamSuggestions.general
        
        // Auto-complete all ACTION_PLAN fields
        const completeActionPlanData = {
          'Auto-Generated Action Plans': smartActionPlans,
          'Implementation Priority': implementationPriority,
          'Budget and Resources': budgetAndResources,
          'Implementation Team': implementationTeam
        }
        
        // Save the complete data
        onComplete(completeActionPlanData)
        
        // Mark as user interacted
        if (setUserInteracted) {
          setUserInteracted()
        }
        
        console.log('✅ Smart Action Plan Auto-Completed Successfully!')
        console.log('📋 Generated Plans:', smartActionPlans.length)
        console.log('🏢 Business Type:', businessType)
        console.log('💰 Budget:', budgetAndResources)
        console.log('👥 Team:', implementationTeam)
        
        hasAutoCompletedRef.current = true
      }
    }, [smartActionPlans.length, onComplete, setUserInteracted, stepData])
    
    if (smartActionPlans.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No High-Priority Risks Found</h3>
          <p className="text-gray-600">
            Complete your risk assessment first to generate customized action plans. 
            The smart action plan requires risks with "High" or "Extreme" risk levels to generate action plans.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
              <p className="font-semibold">Debug Info:</p>
              <p>Step Data Keys: {Object.keys(stepData || {}).join(', ')}</p>
              <p>Risk Assessment Data: {JSON.stringify(stepData?.RISK_ASSESSMENT, null, 2)}</p>
              <p>Business Overview Data: {JSON.stringify(stepData?.BUSINESS_OVERVIEW, null, 2)}</p>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Smart Action Plans Generated & Auto-Completed</h3>
              <p className="text-green-800 text-sm">
                Based on your business type and high-priority risks, we've created {smartActionPlans.length} customized action plan(s) 
                and automatically filled in all required fields. The step is now 100% complete!
              </p>
              <p className="text-green-700 text-sm mt-2 font-medium">
                All fields have been automatically completed based on your risk assessment data.
              </p>
            </div>
            <div className="text-green-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {smartActionPlans.map((plan: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-gray-900">{plan.hazard}</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                plan.riskLevel.toLowerCase().includes('extreme') 
                  ? 'bg-black text-white'
                  : 'bg-red-100 text-red-800'
              }`}>
                {plan.riskLevel} Risk
              </span>
            </div>

            {plan.businessType && plan.businessType !== 'general' && (
              <div className="mb-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  📊 Optimized for {plan.businessType.replace('_', ' ')} business
                </span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Resources */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">📋 Resources Needed:</h5>
                <ul className="space-y-2">
                  {plan.resourcesNeeded?.slice(0, 5).map((resource: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      {resource}
                    </li>
                  ))}
                  {plan.resourcesNeeded?.length > 5 && (
                    <li className="text-sm text-gray-500 italic">
                      + {plan.resourcesNeeded.length - 5} more resources
                    </li>
                  )}
                </ul>
              </div>

              {/* Immediate Actions */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">🚨 Immediate Actions (0-24h):</h5>
                <ul className="space-y-2">
                  {plan.immediateActions?.slice(0, 3).map((action: any, idx: number) => (
                    <li key={idx} className="text-sm">
                      <div className="font-medium text-gray-900">{action.task}</div>
                      <div className="text-gray-600 text-xs">
                        {action.responsible} • {action.duration}
                      </div>
                    </li>
                  ))}
                  {plan.immediateActions?.length > 3 && (
                    <li className="text-sm text-gray-500 italic">
                      + {plan.immediateActions.length - 3} more actions
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h5 className="font-semibold text-gray-900 mb-2">📝 Additional Actions Available:</h5>
              <div className="text-sm text-gray-600">
                • {plan.shortTermActions?.length || 0} short-term actions (1-7 days)
                • {plan.mediumTermActions?.length || 0} medium-term actions (1-4 weeks)  
                • {plan.longTermReduction?.length || 0} long-term prevention measures
              </div>
            </div>
          </div>
        ))}

        {/* Auto-Completed Implementation Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-4">📋 Auto-Completed Implementation Details</h4>
          
          <div className="space-y-4">
            {/* Implementation Priority */}
            <div>
              <h5 className="font-semibold text-blue-900 mb-2">🎯 Implementation Priority</h5>
              <div className="bg-white p-3 rounded border text-sm">
                {smartActionPlans.length > 0 && (() => {
                  const priorityOrder = smartActionPlans
                    .sort((a, b) => {
                      const aLevel = a.riskLevel.toLowerCase()
                      const bLevel = b.riskLevel.toLowerCase()
                      if (aLevel.includes('extreme') && !bLevel.includes('extreme')) return -1
                      if (bLevel.includes('extreme') && !aLevel.includes('extreme')) return 1
                      if (aLevel.includes('high') && !bLevel.includes('high')) return -1
                      if (bLevel.includes('high') && !aLevel.includes('high')) return 1
                      return 0
                    })
                    .map(plan => plan.hazard)
                  return `Start with ${priorityOrder[0]} (highest risk), then ${priorityOrder.slice(1).join(', ')}`
                })()}
              </div>
            </div>

            {/* Budget and Resources */}
            <div>
              <h5 className="font-semibold text-blue-900 mb-2">💰 Budget and Resources</h5>
              <div className="bg-white p-3 rounded border text-sm">
                {smartActionPlans.length > 0 && (() => {
                  const businessType = smartActionPlans[0]?.businessType || 'general'
                  const budgetEstimates: Record<string, string> = {
                    'tourism': '$15,000 - $25,000',
                    'retail': '$10,000 - $20,000', 
                    'food_service': '$8,000 - $15,000',
                    'manufacturing': '$20,000 - $40,000',
                    'technology': '$12,000 - $25,000',
                    'general': '$10,000 - $20,000'
                  }
                  return `Total budget: ${budgetEstimates[businessType] || budgetEstimates.general} over 6 months, plus 20 hours/week from management team for implementation and training.`
                })()}
              </div>
            </div>

            {/* Implementation Team */}
            <div>
              <h5 className="font-semibold text-blue-900 mb-2">👥 Implementation Team</h5>
              <div className="bg-white p-3 rounded border text-sm">
                {smartActionPlans.length > 0 && (() => {
                  const businessType = smartActionPlans[0]?.businessType || 'general'
                  const teamSuggestions: Record<string, string> = {
                    'tourism': 'Project Manager: Operations Manager, Emergency Coordinator: HR Director, Communication Lead: Marketing Manager',
                    'retail': 'Implementation Lead: Store Manager, Operations Coordinator: Assistant Manager, Training Lead: Senior Staff',
                    'food_service': 'Kitchen Manager: Emergency Response Lead, Service Manager: Customer Communication, Owner: Overall Coordination',
                    'manufacturing': 'Plant Manager: Overall Lead, Safety Manager: Emergency Procedures, Production Manager: Operations Continuity',
                    'technology': 'IT Manager: Technical Implementation, Operations Manager: Process Coordination, HR Manager: Staff Training',
                    'general': 'Manager: Overall Lead, Assistant Manager: Daily Operations, Senior Staff: Training Coordination'
                  }
                  return teamSuggestions[businessType] || teamSuggestions.general
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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