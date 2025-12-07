'use client'

import { useState, useMemo } from 'react'

interface TranslationStatusBarProps {
  strategy: any // Strategy object with all fields
  onShowDetails?: () => void
}

interface FieldStatus {
  field: string
  label: string
  en: boolean
  es: boolean
  fr: boolean
}

export function TranslationStatusBar({ strategy, onShowDetails }: TranslationStatusBarProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Helper to check if a field has content in a language
  const hasContent = (value: any, lang: 'en' | 'es' | 'fr'): boolean => {
    if (!value) return false
    
    try {
      // Parse if JSON string
      const parsed = typeof value === 'string' && value.startsWith('{') 
        ? JSON.parse(value) 
        : value
      
      // Check if multilingual object
      if (typeof parsed === 'object' && parsed[lang] !== undefined) {
        const content = parsed[lang]
        
        // For arrays, check if has non-empty items
        if (Array.isArray(content)) {
          return content.some((item: string) => item && item.trim())
        }
        
        // For strings, check if not empty
        return typeof content === 'string' && content.trim().length > 0
      }
      
      // For plain strings/arrays, only count as English
      if (lang === 'en') {
        if (Array.isArray(parsed)) {
          return parsed.length > 0
        }
        return typeof parsed === 'string' && parsed.trim().length > 0
      }
      
      return false
    } catch {
      // Not JSON, treat as plain string (only English)
      if (lang === 'en') {
        return typeof value === 'string' && value.trim().length > 0
      }
      return false
    }
  }

  // Define all user-facing fields that need translation
  const fields: Array<{ field: keyof typeof strategy; label: string; required: boolean }> = [
    // Critical user-facing content
    { field: 'smeTitle', label: 'Strategy Title', required: true },
    { field: 'smeSummary', label: 'Strategy Summary', required: true },
    { field: 'benefitsBullets', label: 'Key Benefits', required: true },
    { field: 'realWorldExample', label: 'Success Story', required: false },
    { field: 'lowBudgetAlternative', label: 'Budget Alternative', required: false },
    { field: 'diyApproach', label: 'DIY Approach', required: false },
    { field: 'helpfulTips', label: 'Helpful Tips', required: false },
    { field: 'commonMistakes', label: 'Common Mistakes', required: false },
    { field: 'successMetrics', label: 'Success Metrics', required: false },
  ]

  // Calculate status for each field
  const fieldStatuses: FieldStatus[] = useMemo(() => {
    return fields.map(({ field, label }) => ({
      field: field as string,
      label,
      en: hasContent(strategy?.[field], 'en'),
      es: hasContent(strategy?.[field], 'es'),
      fr: hasContent(strategy?.[field], 'fr')
    }))
  }, [strategy])

  // Count action steps translations
  const actionStepsStatus = useMemo(() => {
    const steps = strategy?.actionSteps || []
    let enCount = 0, esCount = 0, frCount = 0
    
    steps.forEach((step: any) => {
      if (hasContent(step.title, 'en') || hasContent(step.description, 'en')) enCount++
      if (hasContent(step.title, 'es') || hasContent(step.description, 'es')) esCount++
      if (hasContent(step.title, 'fr') || hasContent(step.description, 'fr')) frCount++
    })
    
    return {
      total: steps.length,
      en: enCount,
      es: esCount,
      fr: frCount
    }
  }, [strategy?.actionSteps])

  // Calculate overall completion
  const totalFields = fieldStatuses.length + actionStepsStatus.total
  const enComplete = fieldStatuses.filter(f => f.en).length + actionStepsStatus.en
  const esComplete = fieldStatuses.filter(f => f.es).length + actionStepsStatus.es
  const frComplete = fieldStatuses.filter(f => f.fr).length + actionStepsStatus.fr

  const enPercent = totalFields > 0 ? Math.round((enComplete / totalFields) * 100) : 0
  const esPercent = totalFields > 0 ? Math.round((esComplete / totalFields) * 100) : 0
  const frPercent = totalFields > 0 ? Math.round((frComplete / totalFields) * 100) : 0

  const missingES = fieldStatuses.filter(f => f.en && !f.es)
  const missingFR = fieldStatuses.filter(f => f.en && !f.fr)

  if (totalFields === 0) {
    return null // No fields to translate yet
  }

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Compact Status Bar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Translation Completeness</h3>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showDetails ? 'Hide Details' : 'View Details'} {showDetails ? '▼' : '▶'}
          </button>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2">
          {/* English */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20">🇬🇧 English</span>
            <div className="flex-1 bg-gray-200 rounded-full h-5 overflow-hidden">
              <div
                className="bg-green-500 h-full flex items-center justify-center text-xs font-medium text-white transition-all duration-300"
                style={{ width: `${enPercent}%` }}
              >
                {enPercent > 15 && `${enPercent}%`}
              </div>
            </div>
            <span className="text-xs text-gray-600 w-16 text-right">
              {enComplete}/{totalFields}
            </span>
          </div>

          {/* Spanish */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20">🇪🇸 Español</span>
            <div className="flex-1 bg-gray-200 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full flex items-center justify-center text-xs font-medium text-white transition-all duration-300 ${
                  esPercent === 100 ? 'bg-green-500' : esPercent >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ width: `${esPercent}%` }}
              >
                {esPercent > 15 && `${esPercent}%`}
              </div>
            </div>
            <span className="text-xs text-gray-600 w-16 text-right">
              {esComplete}/{totalFields}
            </span>
          </div>

          {/* French */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20">🇫🇷 Français</span>
            <div className="flex-1 bg-gray-200 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full flex items-center justify-center text-xs font-medium text-white transition-all duration-300 ${
                  frPercent === 100 ? 'bg-green-500' : frPercent >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ width: `${frPercent}%` }}
              >
                {frPercent > 15 && `${frPercent}%`}
              </div>
            </div>
            <span className="text-xs text-gray-600 w-16 text-right">
              {frComplete}/{totalFields}
            </span>
          </div>
        </div>

        {/* Warning for incomplete translations */}
        {(esPercent < 100 || frPercent < 100) && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            ⚠️ Translations incomplete. Users in Spanish or French will see incomplete content in the wizard.
          </div>
        )}
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Missing Spanish */}
            {missingES.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  🇪🇸 Missing Spanish ({missingES.length} fields)
                </h4>
                <ul className="space-y-1">
                  {missingES.map((field) => (
                    <li key={field.field} className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="text-orange-500">○</span>
                      {field.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing French */}
            {missingFR.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  🇫🇷 Missing French ({missingFR.length} fields)
                </h4>
                <ul className="space-y-1">
                  {missingFR.map((field) => (
                    <li key={field.field} className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="text-orange-500">○</span>
                      {field.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Steps Status */}
            {actionStepsStatus.total > 0 && (
              <div className="md:col-span-2 pt-3 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  📋 Action Steps ({actionStepsStatus.total} steps)
                </h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span>🇬🇧 English:</span>
                    <span className={actionStepsStatus.en === actionStepsStatus.total ? 'text-green-600 font-medium' : 'text-orange-600'}>
                      {actionStepsStatus.en}/{actionStepsStatus.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🇪🇸 Español:</span>
                    <span className={actionStepsStatus.es === actionStepsStatus.total ? 'text-green-600 font-medium' : 'text-orange-600'}>
                      {actionStepsStatus.es}/{actionStepsStatus.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🇫🇷 Français:</span>
                    <span className={actionStepsStatus.fr === actionStepsStatus.total ? 'text-green-600 font-medium' : 'text-orange-600'}>
                      {actionStepsStatus.fr}/{actionStepsStatus.total}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* All Complete Message */}
          {esPercent === 100 && frPercent === 100 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              ✓ All translations complete! This strategy is ready for users in all three languages.
            </div>
          )}
        </div>
      )}
    </div>
  )
}






























