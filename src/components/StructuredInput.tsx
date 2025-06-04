'use client'

import { useState, useEffect, useRef } from 'react'
import { RiskAssessmentMatrix } from './RiskAssessmentMatrix'
import { useTranslations } from 'next-intl'

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
  onComplete: (value: any) => void
  initialValue?: any
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
  onComplete,
  initialValue,
}: StructuredInputProps) {
  const [value, setValue] = useState<string | string[] | TableRow[]>(
    type === 'checkbox' ? [] : type === 'table' ? [] : ''
  )
  const [tableRows, setTableRows] = useState<TableRow[]>([])
  const didMount = useRef(false)
  const hasUserInteracted = useRef(false)
  const t = useTranslations('common')

  // Auto-save functionality: only call onComplete after user interaction
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    
    // Special handling for risk matrix - always save its data
    if (type === 'special_risk_matrix') {
      return // Risk matrix handles its own saving
    }
    
    if (hasUserInteracted.current) {
      // For other types, only call onComplete after user interaction
      if (type === 'table') {
        onComplete(tableRows)
      } else {
        onComplete(value)
      }
    }
  }, [value, tableRows, type, onComplete])

  // Initialize value and tableRows from initialValue when type or initialValue changes
  useEffect(() => {
    if (type === 'special_risk_matrix') {
      // For risk matrix, don't manage local state
      return
    }
    
    if (!hasUserInteracted.current) {
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
  }, [type, initialValue])

  // Reset hasUserInteracted when the question/section changes
  useEffect(() => {
    hasUserInteracted.current = false
  }, [label, type])

  const handleChange = (newValue: string | string[]) => {
    hasUserInteracted.current = true
    setValue(newValue)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    hasUserInteracted.current = true
    handleChange(e.target.value)
  }

  const handleRadioChange = (optionValue: string) => {
    hasUserInteracted.current = true
    handleChange(optionValue)
  }

  const handleCheckboxChange = (optionValue: string) => {
    hasUserInteracted.current = true
    const currentValue = value as string[]
    const newValue = currentValue.includes(optionValue)
      ? currentValue.filter(v => v !== optionValue)
      : [...currentValue, optionValue]
    handleChange(newValue)
  }

  // Table handling functions
  const addTableRow = () => {
    hasUserInteracted.current = true
    const newRow: TableRow = {}
    tableColumns.forEach(column => {
      newRow[column] = ''
    })
    setTableRows([...tableRows, newRow])
  }

  const updateTableRow = (rowIndex: number, columnKey: string, cellValue: string) => {
    hasUserInteracted.current = true
    const updatedRows = [...tableRows]
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [columnKey]: cellValue
    }
    setTableRows(updatedRows)
  }

  const deleteTableRow = (rowIndex: number) => {
    hasUserInteracted.current = true
    const updatedRows = tableRows.filter((_, index) => index !== rowIndex)
    setTableRows(updatedRows)
  }

  // Special render for priority assessment table
  const renderPriorityTable = () => (
    <div className="space-y-4">
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
                <td className="border border-gray-300 px-4 py-3">
                  <input
                    type="text"
                    value={row[tableColumns[0]] || ''}
                    onChange={(e) => updateTableRow(rowIndex, tableColumns[0], e.target.value)}
                    placeholder="Enter business function"
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-3">
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
                <td className="border border-gray-300 px-4 py-3">
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
                <td className="border border-gray-300 px-4 py-3">
                  <textarea
                    value={row[tableColumns[3]] || ''}
                    onChange={(e) => updateTableRow(rowIndex, tableColumns[3], e.target.value)}
                    placeholder="Additional notes"
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                    rows={2}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-3">
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
                  <td key={colIndex} className="border border-gray-300 px-4 py-3">
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
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-gray-400"
                        rows={2}
                      />
                    )}
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-3">
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
    if (label === 'Potential Hazards' && options) {
      // Group hazards by category
      const HAZARD_CATEGORIES = {
        'Natural Disasters': ['earthquake', 'hurricane', 'coastal_flood', 'flash_flood', 'landslide', 'tsunami', 'volcanic', 'drought'],
        'Health & Safety': ['epidemic', 'pandemic', 'fire'],
        'Infrastructure': ['power_outage', 'telecom_failure', 'cyber_attack'],
        'Security & Crime': ['crime', 'civil_disorder', 'terrorism'],
        'Business Operations': ['supply_disruption', 'staff_unavailable', 'economic_downturn'],
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

  // Get selected hazards from dependency
  const getSelectedHazards = (): string[] => {
    if (type === 'special_risk_matrix' && stepData) {
      // Get the hazards from the 'Potential Hazards' input
      const hazards = stepData['Potential Hazards']
      return Array.isArray(hazards) ? hazards : []
    }
    return []
  }

  // Special handling for risk matrix type
  const handleRiskMatrixComplete = (riskMatrix: any[]) => {
    hasUserInteracted.current = true
    onComplete(riskMatrix)
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

      {type === 'special_risk_matrix' && (
        <RiskAssessmentMatrix 
          selectedHazards={getSelectedHazards()} 
          onComplete={handleRiskMatrixComplete}
          initialValue={initialValue}
          setUserInteracted={() => { hasUserInteracted.current = true }}
        />
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