'use client'

import { useState, useMemo } from 'react'

interface MultilingualTextInputProps {
  label: string
  value: string | object
  onChange: (value: string) => void
  type?: 'text' | 'textarea'
  required?: boolean
  helpText?: string
  placeholder?: string
}

export function MultilingualTextInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  helpText,
  placeholder
}: MultilingualTextInputProps) {
  const [activeTab, setActiveTab] = useState<'en' | 'es' | 'fr'>('en')

  // Parse JSON or use as plain string
  const parsedValue = useMemo(() => {
    try {
      if (typeof value === 'object' && value !== null) {
        return value as { en?: string; es?: string; fr?: string }
      }
      if (typeof value === 'string' && value.trim().startsWith('{')) {
        return JSON.parse(value) as { en?: string; es?: string; fr?: string }
      }
      // Plain string - put in English
      return { en: value || '', es: '', fr: '' }
    } catch {
      return { en: value?.toString() || '', es: '', fr: '' }
    }
  }, [value])

  const handleChange = (lang: 'en' | 'es' | 'fr', text: string) => {
    const updated = { ...parsedValue, [lang]: text }
    onChange(JSON.stringify(updated))
  }

  const isEmpty = (text?: string) => !text || text.trim() === ''
  const allLanguagesFilled = !isEmpty(parsedValue.en) && !isEmpty(parsedValue.es) && !isEmpty(parsedValue.fr)
  const someLanguagesFilled = !isEmpty(parsedValue.en) || !isEmpty(parsedValue.es) || !isEmpty(parsedValue.fr)

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {/* Language completion indicator */}
        {someLanguagesFilled && (
          <div className="flex items-center gap-1 text-xs">
            <span className={isEmpty(parsedValue.en) ? 'text-gray-300' : 'text-green-600'}>🇬🇧</span>
            <span className={isEmpty(parsedValue.es) ? 'text-gray-300' : 'text-green-600'}>🇪🇸</span>
            <span className={isEmpty(parsedValue.fr) ? 'text-gray-300' : 'text-green-600'}>🇫🇷</span>
            {allLanguagesFilled && (
              <span className="ml-1 text-green-600 font-medium">✓ Complete</span>
            )}
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
          } ${isEmpty(parsedValue.en) && required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}
        >
          🇬🇧 English
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('es')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'es'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          } ${isEmpty(parsedValue.es) && required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}
        >
          🇪🇸 Español
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fr')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'fr'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          } ${isEmpty(parsedValue.fr) && required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}
        >
          🇫🇷 Français
        </button>
      </div>

      {/* Input field */}
      {type === 'textarea' ? (
        <textarea
          value={parsedValue[activeTab] || ''}
          onChange={(e) => handleChange(activeTab, e.target.value)}
          placeholder={placeholder || `Enter ${activeTab.toUpperCase()} text...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
        />
      ) : (
        <input
          type="text"
          value={parsedValue[activeTab] || ''}
          onChange={(e) => handleChange(activeTab, e.target.value)}
          placeholder={placeholder || `Enter ${activeTab.toUpperCase()} text...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )}

      {/* Help text */}
      {helpText && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}

      {/* Validation warning */}
      {required && someLanguagesFilled && !allLanguagesFilled && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          ⚠️ Please provide translations for all three languages
        </div>
      )}
    </div>
  )
}









