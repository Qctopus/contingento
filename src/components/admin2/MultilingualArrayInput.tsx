'use client'

import { useState, useMemo } from 'react'

interface MultilingualArrayInputProps {
  label: string
  value: string | string[] | object
  onChange: (value: string) => void
  required?: boolean
  helpText?: string
  placeholder?: string
  addButtonText?: string
}

export function MultilingualArrayInput({
  label,
  value,
  onChange,
  required = false,
  helpText,
  placeholder,
  addButtonText = 'Add Item'
}: MultilingualArrayInputProps) {
  const [activeTab, setActiveTab] = useState<'en' | 'es' | 'fr'>('en')
  const [newItemText, setNewItemText] = useState<{ en: string; es: string; fr: string }>({
    en: '',
    es: '',
    fr: ''
  })

  // Parse value into array of multilingual objects
  const parsedValue = useMemo(() => {
    try {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // Already parsed multilingual array
        return value as { en?: string[]; es?: string[]; fr?: string[] }
      }
      
      if (typeof value === 'string') {
        const parsed = JSON.parse(value)
        
        // Check if it's already multilingual format
        if (parsed.en || parsed.es || parsed.fr) {
          return parsed as { en?: string[]; es?: string[]; fr?: string[] }
        }
        
        // Plain array - put in English
        if (Array.isArray(parsed)) {
          return { en: parsed, es: [], fr: [] }
        }
      }
      
      if (Array.isArray(value)) {
        return { en: value as string[], es: [], fr: [] }
      }

      return { en: [], es: [], fr: [] }
    } catch {
      return { en: [], es: [], fr: [] }
    }
  }, [value])

  const handleAdd = () => {
    // Only add if at least one language has text
    if (!newItemText.en && !newItemText.es && !newItemText.fr) return

    const updated = {
      en: [...(parsedValue.en || []), newItemText.en],
      es: [...(parsedValue.es || []), newItemText.es],
      fr: [...(parsedValue.fr || []), newItemText.fr]
    }
    onChange(JSON.stringify(updated))
    setNewItemText({ en: '', es: '', fr: '' })
  }

  const handleRemove = (index: number) => {
    const updated = {
      en: (parsedValue.en || []).filter((_, i) => i !== index),
      es: (parsedValue.es || []).filter((_, i) => i !== index),
      fr: (parsedValue.fr || []).filter((_, i) => i !== index)
    }
    onChange(JSON.stringify(updated))
  }

  const handleEdit = (index: number, lang: 'en' | 'es' | 'fr', text: string) => {
    const updated = {
      ...parsedValue,
      [lang]: (parsedValue[lang] || []).map((item, i) => i === index ? text : item)
    }
    onChange(JSON.stringify(updated))
  }

  const currentLangArray = parsedValue[activeTab] || []
  const hasItems = (parsedValue.en?.length || 0) > 0 || 
                   (parsedValue.es?.length || 0) > 0 || 
                   (parsedValue.fr?.length || 0) > 0

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {/* Item count indicator */}
        {hasItems && (
          <div className="flex items-center gap-2 text-xs">
            <span className={`${(parsedValue.en?.length || 0) === 0 ? 'text-gray-300' : 'text-green-600'}`}>
              🇬🇧 {parsedValue.en?.length || 0}
            </span>
            <span className={`${(parsedValue.es?.length || 0) === 0 ? 'text-gray-300' : 'text-green-600'}`}>
              🇪🇸 {parsedValue.es?.length || 0}
            </span>
            <span className={`${(parsedValue.fr?.length || 0) === 0 ? 'text-gray-300' : 'text-green-600'}`}>
              🇫🇷 {parsedValue.fr?.length || 0}
            </span>
          </div>
        )}
      </div>

      {/* Language tabs */}
      <div className="flex gap-2 mb-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('en')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'en'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🇬🇧 English ({parsedValue.en?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('es')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'es'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🇪🇸 Español ({parsedValue.es?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fr')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'fr'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🇫🇷 Français ({parsedValue.fr?.length || 0})
        </button>
      </div>

      {/* Existing items */}
      {currentLangArray.length > 0 && (
        <div className="space-y-2 mb-3">
          {currentLangArray.map((item, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
              <span className="text-gray-500 text-sm mt-2">{index + 1}.</span>
              <input
                type="text"
                value={item}
                onChange={(e) => handleEdit(index, activeTab, e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItemText[activeTab]}
          onChange={(e) => setNewItemText({ ...newItemText, [activeTab]: e.target.value })}
          placeholder={placeholder || `Add ${activeTab.toUpperCase()} item...`}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + {addButtonText}
        </button>
      </div>

      {/* Help text */}
      {helpText && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}

      {/* Warning if items don't match across languages */}
      {hasItems && (
        (parsedValue.en?.length !== parsedValue.es?.length || 
         parsedValue.en?.length !== parsedValue.fr?.length) && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ Item counts don't match across languages. Ensure parallel translations.
          </div>
        )
      )}
    </div>
  )
}


