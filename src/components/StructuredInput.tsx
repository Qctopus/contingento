'use client'

import { useState } from 'react'

interface Option {
  label: string
  value: string
}

interface StructuredInputProps {
  type: 'text' | 'radio' | 'checkbox'
  label: string
  required?: boolean
  prompt: string
  examples?: string[]
  options?: Option[]
  onComplete: (value: any) => void
}

export function StructuredInput({
  type,
  label,
  required = false,
  prompt,
  examples,
  options,
  onComplete,
}: StructuredInputProps) {
  const [value, setValue] = useState<string | string[]>(type === 'checkbox' ? [] : '')

  const handleChange = (newValue: string | string[]) => {
    setValue(newValue)
    onComplete(newValue)
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

  return (
    <div className="space-y-4">
      {type === 'text' && (
        <textarea
          value={value as string}
          onChange={handleTextChange}
          className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Type your answer here..."
          required={required}
        />
      )}

      {type === 'radio' && options && (
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
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
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}

      {type === 'checkbox' && options && (
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                value={option.value}
                checked={(value as string[]).includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
} 