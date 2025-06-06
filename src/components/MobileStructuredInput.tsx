'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface Option {
  value: string
  label: string
}

interface MobileStructuredInputProps {
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'table' | 'checkboxes'
  label: string
  prompt?: string
  placeholder?: string
  required?: boolean
  options?: Option[]
  initialValue?: any
  onComplete: (value: any) => void
  stepData?: any
  isMobile?: boolean
}

export function MobileStructuredInput({ 
  type, 
  label, 
  prompt, 
  placeholder, 
  required, 
  options, 
  initialValue, 
  onComplete,
  stepData,
  isMobile = false
}: MobileStructuredInputProps) {
  const [value, setValue] = useState(initialValue || '')
  const [tableData, setTableData] = useState<any[]>(() => {
    if (type === 'table' && Array.isArray(initialValue)) {
      return initialValue
    }
    return []
  })
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const t = useTranslations()

  useEffect(() => {
    if (initialValue !== undefined) {
      setValue(initialValue)
    }
  }, [initialValue])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && type === 'textarea') {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`
    }
  }, [value, type])

  const handleChange = (newValue: any) => {
    setValue(newValue)
    onComplete(newValue)
  }

  const handleTableAdd = () => {
    let newRow: any = {}
    if (tableData.length > 0) {
      Object.keys(tableData[0]).forEach(key => {
        newRow[key] = ''
      })
    } else {
      // Default structure for new table
      newRow = { item: '', details: '', priority: 'Medium' }
    }
    const updatedData = [...tableData, newRow]
    setTableData(updatedData)
    onComplete(updatedData)
  }

  const handleTableUpdate = (index: number, field: string, newValue: string) => {
    const updatedData = tableData.map((row, i) => 
      i === index ? { ...row, [field]: newValue } : row
    )
    setTableData(updatedData)
    onComplete(updatedData)
  }

  const handleTableDelete = (index: number) => {
    const updatedData = tableData.filter((_, i) => i !== index)
    setTableData(updatedData)
    onComplete(updatedData)
  }

  // Mobile-optimized input styling
  const inputClasses = `
    w-full px-4 py-3 border border-gray-300 rounded-lg 
    ${isFocused ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}
    text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
    ${isMobile ? 'text-lg' : 'text-base'}
    transition-all duration-200
  `

  const buttonClasses = `
    px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
    ${isMobile ? 'min-h-[48px] text-base' : 'py-2 text-sm'}
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  switch (type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <div className="space-y-3">
          <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={inputClasses}
            required={required}
            inputMode={type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'text'}
          />
        </div>
      )

    case 'textarea':
      return (
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={value}
            placeholder={placeholder}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`${inputClasses} min-h-[120px] resize-none`}
            required={required}
            rows={isMobile ? 4 : 6}
          />
        </div>
      )

    case 'select':
      return (
        <div className="space-y-3">
          <select
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`${inputClasses} ${isMobile ? 'text-lg' : 'text-base'}`}
            required={required}
          >
            <option value="">{placeholder || t('common.select')}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )

    case 'radio':
      return (
        <div className="space-y-3">
          {options?.map((option) => (
            <label 
              key={option.value} 
              className={`
                flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer
                ${value === option.value ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                ${isMobile ? 'min-h-[56px]' : 'min-h-[48px]'}
                transition-all duration-200
              `}
            >
              <input
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => handleChange(e.target.value)}
                className="w-5 h-5 text-blue-600 mr-4 flex-shrink-0"
              />
              <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      )

    case 'checkbox':
      return (
        <div className="space-y-3">
          <label className={`
            flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer
            ${value ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
            ${isMobile ? 'min-h-[56px]' : 'min-h-[48px]'}
            transition-all duration-200
          `}>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(e.target.checked)}
              className="w-5 h-5 text-blue-600 mr-4 flex-shrink-0 rounded"
            />
            <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
              {label}
            </span>
          </label>
        </div>
      )

    case 'checkboxes':
      return (
        <div className="space-y-3">
          {options?.map((option) => (
            <label 
              key={option.value}
              className={`
                flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer
                ${Array.isArray(value) && value.includes(option.value) ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                ${isMobile ? 'min-h-[56px]' : 'min-h-[48px]'}
                transition-all duration-200
              `}
            >
              <input
                type="checkbox"
                value={option.value}
                checked={Array.isArray(value) && value.includes(option.value)}
                onChange={(e) => {
                  const currentValues = Array.isArray(value) ? value : []
                  const newValues = e.target.checked
                    ? [...currentValues, option.value]
                    : currentValues.filter(v => v !== option.value)
                  handleChange(newValues)
                }}
                className="w-5 h-5 text-blue-600 mr-4 flex-shrink-0 rounded"
              />
              <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      )

    case 'table':
      return (
        <div className="space-y-4">
          {/* Mobile Table: Card Layout */}
          {isMobile ? (
            <div className="space-y-4">
              {tableData.map((row, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    <button
                      onClick={() => handleTableDelete(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.keys(row).map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                          type="text"
                          value={row[field] || ''}
                          onChange={(e) => handleTableUpdate(index, field, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                          placeholder={`Enter ${field}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop Table: Traditional Layout */
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {tableData.length > 0 && Object.keys(tableData[0]).map((field) => (
                      <th key={field} className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    ))}
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700 w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.keys(row).map((field) => (
                        <td key={field} className="border border-gray-200 px-4 py-2">
                          <input
                            type="text"
                            value={row[field] || ''}
                            onChange={(e) => handleTableUpdate(index, field, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder={`Enter ${field}`}
                          />
                        </td>
                      ))}
                      <td className="border border-gray-200 px-4 py-2">
                        <button
                          onClick={() => handleTableDelete(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={handleTableAdd}
            className={`
              ${buttonClasses}
              bg-blue-600 text-white hover:bg-blue-700
              flex items-center justify-center space-x-2 w-full
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{t('common.addRow') || 'Add Row'}</span>
          </button>
        </div>
      )

    default:
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <p className="text-red-700 text-sm">
            Unsupported input type: {type}
          </p>
        </div>
      )
  }
} 