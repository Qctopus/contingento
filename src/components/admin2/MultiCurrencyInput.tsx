'use client'

import { useState, useMemo } from 'react'

interface MultiCurrencyInputProps {
  label: string
  value: string | object
  onChange: (value: string) => void
  required?: boolean
  helpText?: string
  placeholder?: string
}

// Common currencies for the system
const CURRENCIES = [
  { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar', flag: '🇯🇲' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad & Tobago Dollar', flag: '🇹🇹' },
  { code: 'BBD', symbol: 'B$', name: 'Barbados Dollar', flag: '🇧🇧' },
  { code: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar', flag: '🏝️' }
]

export function MultiCurrencyInput({
  label,
  value,
  onChange,
  required = false,
  helpText,
  placeholder
}: MultiCurrencyInputProps) {
  const [activeTab, setActiveTab] = useState<string>('JMD') // Default to JMD

  // Parse JSON or use as plain string
  const parsedValue = useMemo(() => {
    try {
      if (typeof value === 'object' && value !== null) {
        return value as Record<string, string>
      }
      if (typeof value === 'string' && value.trim().startsWith('{')) {
        return JSON.parse(value) as Record<string, string>
      }
      // Plain string - assume it's JMD (legacy)
      return { JMD: value || '' }
    } catch {
      return { JMD: value?.toString() || '' }
    }
  }, [value])

  const handleChange = (currency: string, text: string) => {
    const updated = { ...parsedValue, [currency]: text }
    // Remove empty currencies to keep JSON clean
    Object.keys(updated).forEach(key => {
      if (!updated[key] || updated[key].trim() === '') {
        delete updated[key]
      }
    })
    onChange(JSON.stringify(updated))
  }

  const isEmpty = (text?: string) => !text || text.trim() === ''
  const activeCurrencies = CURRENCIES.filter(c => !isEmpty(parsedValue[c.code]))
  const hasMultipleCurrencies = activeCurrencies.length > 1

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {/* Currency completion indicator */}
        {activeCurrencies.length > 0 && (
          <div className="flex items-center gap-1 text-xs">
            {activeCurrencies.map(curr => (
              <span key={curr.code} className="text-green-600" title={curr.name}>
                {curr.flag}
              </span>
            ))}
            {hasMultipleCurrencies && (
              <span className="ml-1 text-green-600 font-medium">
                ✓ {activeCurrencies.length} currencies
              </span>
            )}
          </div>
        )}
      </div>

      {/* Currency tabs */}
      <div className="flex flex-wrap gap-1 mb-2 border-b border-gray-200 pb-1">
        {CURRENCIES.map(curr => (
          <button
            key={curr.code}
            type="button"
            onClick={() => setActiveTab(curr.code)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-t ${
              activeTab === curr.code
                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600'
                : isEmpty(parsedValue[curr.code])
                ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={curr.name}
          >
            {curr.flag} {curr.code}
          </button>
        ))}
      </div>

      {/* Input field with currency symbol */}
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-medium">
          {CURRENCIES.find(c => c.code === activeTab)?.symbol || '$'}
        </span>
        <input
          type="text"
          value={parsedValue[activeTab] || ''}
          onChange={(e) => handleChange(activeTab, e.target.value)}
          placeholder={placeholder || `e.g., 50,000-100,000 or Free`}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {/* Help text */}
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}

      {/* Quick copy feature */}
      {activeCurrencies.length > 0 && activeCurrencies.length < CURRENCIES.length && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <p className="text-blue-900 mb-1">
            💡 <strong>Tip:</strong> Add costs in other currencies to support multi-country users
          </p>
          {activeCurrencies.length === 1 && (
            <p className="text-blue-700">
              Currently showing costs in {activeCurrencies[0].name} only. Click other currency tabs to add more.
            </p>
          )}
        </div>
      )}

      {/* Display all entered currencies */}
      {hasMultipleCurrencies && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs font-medium text-green-900 mb-1">Multi-currency support active:</p>
          <div className="flex flex-wrap gap-2">
            {activeCurrencies.map(curr => (
              <span key={curr.code} className="text-xs bg-white px-2 py-1 rounded border border-green-300 text-green-800">
                {curr.flag} {curr.code}: {curr.symbol}{parsedValue[curr.code]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}









