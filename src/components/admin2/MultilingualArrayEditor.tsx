'use client'

import { useState, useMemo } from 'react'

interface MultilingualArrayEditorProps {
  label: string
  value: string | string[] | object
  onChange: (value: string) => void
  helpText?: string
  placeholder?: string
  required?: boolean
}

interface ParsedArrayValue {
  en: string[]
  es: string[]
  fr: string[]
}

export function MultilingualArrayEditor({
  label,
  value,
  onChange,
  helpText,
  placeholder,
  required = false
}: MultilingualArrayEditorProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  // Parse value into multilingual array structure
  const parsedValue = useMemo((): ParsedArrayValue => {
    try {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        const obj = value as any
        return {
          en: Array.isArray(obj.en) ? obj.en : [],
          es: Array.isArray(obj.es) ? obj.es : [],
          fr: Array.isArray(obj.fr) ? obj.fr : []
        }
      }
      
      if (typeof value === 'string' && value.trim()) {
        const parsed = JSON.parse(value)
        
        // Check if already multilingual format
        if (parsed.en || parsed.es || parsed.fr) {
          return {
            en: Array.isArray(parsed.en) ? parsed.en : [],
            es: Array.isArray(parsed.es) ? parsed.es : [],
            fr: Array.isArray(parsed.fr) ? parsed.fr : []
          }
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

  const maxLength = Math.max(
    parsedValue.en.length,
    parsedValue.es.length,
    parsedValue.fr.length
  )

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const updateItem = (index: number, lang: 'en' | 'es' | 'fr', text: string) => {
    const updated = { ...parsedValue }
    
    // Ensure array is long enough
    while (updated[lang].length <= index) {
      updated[lang].push('')
    }
    
    updated[lang][index] = text
    onChange(JSON.stringify(updated))
  }

  const removeItem = (index: number) => {
    const updated = {
      en: parsedValue.en.filter((_, i) => i !== index),
      es: parsedValue.es.filter((_, i) => i !== index),
      fr: parsedValue.fr.filter((_, i) => i !== index)
    }
    onChange(JSON.stringify(updated))
    
    // Remove from expanded set
    const newExpanded = new Set(expandedItems)
    newExpanded.delete(index)
    setExpandedItems(newExpanded)
  }

  const addNewItem = () => {
    const updated = {
      en: [...parsedValue.en, ''],
      es: [...parsedValue.es, ''],
      fr: [...parsedValue.fr, '']
    }
    onChange(JSON.stringify(updated))
    
    // Auto-expand the new item
    setExpandedItems(new Set([...expandedItems, maxLength]))
  }

  const copyFromEnglish = (index: number, targetLang: 'es' | 'fr') => {
    if (parsedValue.en[index]) {
      updateItem(index, targetLang, parsedValue.en[index])
    }
  }

  const hasContent = maxLength > 0
  const enCount = parsedValue.en.filter(t => t.trim()).length
  const esCount = parsedValue.es.filter(t => t.trim()).length
  const frCount = parsedValue.fr.filter(t => t.trim()).length

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {hasContent && (
          <div className="flex items-center gap-2 text-xs">
            <span className={enCount > 0 ? 'text-green-600 font-medium' : 'text-gray-300'}>
              🇬🇧 {enCount}
            </span>
            <span className={esCount > 0 ? 'text-green-600 font-medium' : 'text-gray-300'}>
              🇪🇸 {esCount}
            </span>
            <span className={frCount > 0 ? 'text-green-600 font-medium' : 'text-gray-300'}>
              🇫🇷 {frCount}
            </span>
          </div>
        )}
      </div>

      {helpText && (
        <p className="text-xs text-gray-500 mb-2">{helpText}</p>
      )}

      {/* Items */}
      <div className="space-y-2">
        {Array.from({ length: maxLength }).map((_, index) => {
          const enText = parsedValue.en[index] || ''
          const esText = parsedValue.es[index] || ''
          const frText = parsedValue.fr[index] || ''
          const isExpanded = expandedItems.has(index)
          
          const enEmpty = !enText.trim()
          const esEmpty = !esText.trim()
          const frEmpty = !frText.trim()
          const allEmpty = enEmpty && esEmpty && frEmpty

          return (
            <div 
              key={index}
              className={`border rounded-lg ${
                allEmpty ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Collapsed View - Show English or first available */}
              <div 
                className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">Item {index + 1}</span>
                      <div className="flex gap-1">
                        {!enEmpty && <span className="text-xs">🇬🇧</span>}
                        {!esEmpty && <span className="text-xs">🇪🇸</span>}
                        {!frEmpty && <span className="text-xs">🇫🇷</span>}
                        {allEmpty && <span className="text-xs text-red-500">⚠️ Empty</span>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {enText || esText || frText || '(Empty item)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded View - Show all three languages */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-3 space-y-3 bg-gray-50">
                  {/* English */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700">🇬🇧 English</label>
                      {enEmpty && <span className="text-xs text-red-500">Required</span>}
                    </div>
                    <input
                      type="text"
                      value={enText}
                      onChange={(e) => updateItem(index, 'en', e.target.value)}
                      placeholder={placeholder || 'Enter English text...'}
                      className={`w-full px-2 py-1.5 border rounded text-sm ${
                        enEmpty ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>

                  {/* Spanish */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700">🇪🇸 Español</label>
                      <div className="flex gap-2">
                        {esEmpty && enText && (
                          <button
                            type="button"
                            onClick={() => copyFromEnglish(index, 'es')}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Copy from EN
                          </button>
                        )}
                        {esEmpty && <span className="text-xs text-orange-500">Missing</span>}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={esText}
                      onChange={(e) => updateItem(index, 'es', e.target.value)}
                      placeholder="Enter Spanish text..."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* French */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700">🇫🇷 Français</label>
                      <div className="flex gap-2">
                        {frEmpty && enText && (
                          <button
                            type="button"
                            onClick={() => copyFromEnglish(index, 'fr')}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Copy from EN
                          </button>
                        )}
                        {frEmpty && <span className="text-xs text-orange-500">Missing</span>}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={frText}
                      onChange={(e) => updateItem(index, 'fr', e.target.value)}
                      placeholder="Enter French text..."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => toggleExpand(index)}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      ▲ Collapse
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      ✕ Remove Item
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add New Button */}
      <button
        type="button"
        onClick={addNewItem}
        className="mt-3 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        + Add New Item
      </button>

      {/* Warning if translations incomplete */}
      {hasContent && (enCount !== esCount || enCount !== frCount) && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ Translation mismatch: You have {enCount} English, {esCount} Spanish, and {frCount} French items.
          {enCount > esCount && ' Add Spanish translations.'}
          {enCount > frCount && ' Add French translations.'}
        </div>
      )}
    </div>
  )
}


