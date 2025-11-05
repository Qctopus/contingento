'use client'

import React, { useState, useEffect } from 'react'

interface CostItem {
  id?: string
  itemId: string
  name: string
  description?: string
  category: string
  baseUSD: number
  baseUSDMin?: number
  baseUSDMax?: number
  unit?: string
  complexity: string
  notes?: string
  tags?: string
}

interface CostItemEditorProps {
  item: CostItem | null
  onSave: () => void
  onCancel: () => void
}

export function CostItemEditor({ item, onSave, onCancel }: CostItemEditorProps) {
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'es' | 'fr'>('en')
  const [formData, setFormData] = useState<CostItem>({
    itemId: '',
    name: '',
    description: '',
    category: 'equipment',
    baseUSD: 0,
    baseUSDMin: undefined,
    baseUSDMax: undefined,
    unit: '',
    complexity: 'medium',
    notes: '',
    tags: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // Language labels and flags
  const languageFlags = { en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷' }
  const languageLabels = { en: 'English', es: 'Español', fr: 'Français' }
  
  // Helper to parse multilingual JSON
  const parseMultilingual = (value: any): Record<'en' | 'es' | 'fr', string> => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return { en: value, es: '', fr: '' }
      }
    }
    return value || { en: '', es: '', fr: '' }
  }
  
  // Helper to update multilingual field
  const updateMultilingualField = (field: keyof CostItem, lang: 'en' | 'es' | 'fr', value: string) => {
    const current = parseMultilingual(formData[field])
    current[lang] = value
    setFormData(prev => ({
      ...prev,
      [field]: JSON.stringify(current)
    }))
  }
  
  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        tags: item.tags ? JSON.parse(item.tags).join(', ') : ''
      })
    }
  }, [item])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate English content is present
    const nameObj = parseMultilingual(formData.name)
    if (!nameObj.en || !nameObj.en.trim()) {
      setError('English name is required')
      return
    }
    
    setSaving(true)
    
    try {
      const payload = {
        ...formData,
        baseUSD: parseFloat(formData.baseUSD.toString()),
        baseUSDMin: formData.baseUSDMin ? parseFloat(formData.baseUSDMin.toString()) : undefined,
        baseUSDMax: formData.baseUSDMax ? parseFloat(formData.baseUSDMax.toString()) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      }
      
      const url = item?.id 
        ? `/api/admin2/cost-items/${item.id}`
        : '/api/admin2/cost-items'
      
      const method = item?.id ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        throw new Error('Failed to save item')
      }
      
      onSave()
    } catch (err) {
      setError('Failed to save item. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {item ? 'Edit Cost Item' : 'Create New Cost Item'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item ID */}
        {!item && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.itemId}
              onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value }))}
              placeholder="e.g., hurricane_shutters_std"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Unique identifier (use lowercase, underscores)</p>
          </div>
        )}
        
        {/* Language Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language / Idioma / Langue
          </label>
          <div className="flex space-x-2">
            {(['en', 'es', 'fr'] as const).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLanguage(lang)}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  activeLanguage === lang
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {languageFlags[lang]} {languageLabels[lang]}
              </button>
            ))}
          </div>
        </div>
        
        {/* Name (Multilingual) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name ({languageLabels[activeLanguage]}) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required={activeLanguage === 'en'}
            value={parseMultilingual(formData.name)[activeLanguage] || ''}
            onChange={(e) => updateMultilingualField('name', activeLanguage, e.target.value)}
            placeholder={activeLanguage === 'en' ? 'e.g., Hurricane Shutters (Standard)' : activeLanguage === 'es' ? 'ej., Persianas para Huracanes (Estándar)' : 'ex., Volets Anti-Ouragan (Standard)'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {activeLanguage === 'en' && (
            <p className="text-xs text-gray-500 mt-1">English name is required. Other languages optional.</p>
          )}
        </div>
        
        {/* Description (Multilingual) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description ({languageLabels[activeLanguage]})
          </label>
          <textarea
            value={parseMultilingual(formData.description)[activeLanguage] || ''}
            onChange={(e) => updateMultilingualField('description', activeLanguage, e.target.value)}
            placeholder={activeLanguage === 'en' ? 'Brief description...' : activeLanguage === 'es' ? 'Breve descripción...' : 'Brève description...'}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="construction">Construction</option>
              <option value="equipment">Equipment</option>
              <option value="service">Service</option>
              <option value="supplies">Supplies</option>
            </select>
          </div>
          
          {/* Complexity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complexity
            </label>
            <select
              value={formData.complexity}
              onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="complex">Complex</option>
            </select>
          </div>
        </div>
        
        {/* Base USD Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Price (USD) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              required
              value={formData.baseUSD}
              onChange={(e) => setFormData(prev => ({ ...prev, baseUSD: parseFloat(e.target.value) || 0 }))}
              placeholder="450.00"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
        
        {/* Price Range (Optional) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price (USD)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.baseUSDMin || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, baseUSDMin: e.target.value ? parseFloat(e.target.value) : undefined }))}
                placeholder="350.00"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price (USD)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.baseUSDMax || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, baseUSDMax: e.target.value ? parseFloat(e.target.value) : undefined }))}
                placeholder="550.00"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
        
        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            placeholder="e.g., per window, per unit, per month"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="hurricane, windows, protection (comma-separated)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Internal notes for admins"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Item'}
          </button>
        </div>
      </form>
    </div>
  )
}

