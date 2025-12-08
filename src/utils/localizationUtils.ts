/**
 * Utilities for handling multilingual content in the database
 * 
 * This module provides functions to extract localized content from various formats:
 * - Plain strings (assumed to be English or already localized)
 * - JSON strings containing multilingual objects
 * - Objects with locale keys (e.g., { en: "Hello", es: "Hola" })
 * - Arrays of multilingual objects
 * 
 * Fallback chain: requested locale → fallback locale → default locale → any available
 */

import { type Locale, defaultLocale, locales } from '@/i18n/config'

// Re-export types from config for convenience
export type { MultilingualText, MultilingualArray } from '@/i18n/config'

// Legacy type for backward compatibility
export type MultilingualContent = {
  en: string
  fr?: string
  es?: string
} | string

// ============================================================================
// CORE FUNCTIONS - Simplified and robust
// ============================================================================

/**
 * Get localized text with fallback chain: requested locale → fallback → default → any available
 * Handles: string, object, JSON string, null/undefined
 */
export function getLocalizedText(
  content: unknown,
  locale: Locale,
  fallbackLocale: Locale = defaultLocale
): string {
  if (!content) return ''

  // Plain string - check if it's JSON that needs parsing
  if (typeof content === 'string') {
    // Check if it's a JSON string that needs parsing
    if (content.startsWith('{') && content.includes('"en"')) {
      try {
        const parsed = JSON.parse(content)
        return getLocalizedText(parsed, locale, fallbackLocale)
      } catch {
        return content
      }
    }
    return content
  }

  // Object with locale keys
  if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
    const obj = content as Record<string, unknown>

    // Try requested locale
    if (typeof obj[locale] === 'string' && obj[locale]) {
      return obj[locale] as string
    }

    // Try fallback locale
    if (typeof obj[fallbackLocale] === 'string' && obj[fallbackLocale]) {
      return obj[fallbackLocale] as string
    }

    // Try default locale
    if (typeof obj[defaultLocale] === 'string' && obj[defaultLocale]) {
      return obj[defaultLocale] as string
    }

    // Last resort: first available locale
    for (const loc of locales) {
      if (typeof obj[loc] === 'string' && obj[loc]) {
        return obj[loc] as string
      }
    }
  }

  return ''
}

/**
 * Get localized array with same fallback logic
 * Handles: array of strings, array of multilingual objects, object with locale arrays, JSON string
 */
export function getLocalizedArray(
  content: unknown,
  locale: Locale,
  fallbackLocale: Locale = defaultLocale
): string[] {
  if (!content) return []

  // Already an array
  if (Array.isArray(content)) {
    if (content.length === 0) return []
    
    // Check if it's an array of multilingual objects
    if (typeof content[0] === 'object' && content[0] !== null) {
      return content
        .map(item => getLocalizedText(item, locale, fallbackLocale))
        .filter(Boolean)
    }
    
    // Array of strings
    return content.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }

  // JSON string
  if (typeof content === 'string') {
    if (content.startsWith('[') || content.startsWith('{')) {
      try {
        const parsed = JSON.parse(content)
        return getLocalizedArray(parsed, locale, fallbackLocale)
      } catch {
        return []
      }
    }
    return []
  }

  // Object with locale keys pointing to arrays
  if (typeof content === 'object' && content !== null) {
    const obj = content as Record<string, unknown>

    // Try locales in order: requested → fallback → default → any
    const localesToTry = [locale, fallbackLocale, defaultLocale, ...locales]
    const tried = new Set<string>()

    for (const loc of localesToTry) {
      if (tried.has(loc)) continue
      tried.add(loc)

      if (Array.isArray(obj[loc]) && (obj[loc] as unknown[]).length > 0) {
        return (obj[loc] as unknown[])
          .map(item => typeof item === 'string' ? item : getLocalizedText(item, locale, fallbackLocale))
          .filter(Boolean)
      }
    }
  }

  return []
}

// ============================================================================
// HELPER FUNCTIONS - For creating and updating multilingual content
// ============================================================================

/**
 * Create multilingual content object from individual language strings
 */
export function createMultilingualContent(
  en: string,
  fr?: string,
  es?: string
): MultilingualContent {
  const content: MultilingualContent = { en }
  if (fr) (content as Record<string, string>).fr = fr
  if (es) (content as Record<string, string>).es = es
  return content
}

/**
 * Update a specific language in multilingual content
 */
export function updateMultilingualContent(
  existing: MultilingualContent | null | undefined,
  locale: Locale,
  newText: string
): MultilingualContent {
  // If existing content is a string, convert to object
  if (typeof existing === 'string') {
    const content: MultilingualContent = { en: existing }
    ;(content as Record<string, string>)[locale] = newText
    return content
  }

  // If existing content is null/undefined, create new
  if (!existing) {
    const content: MultilingualContent = { en: '' }
    ;(content as Record<string, string>)[locale] = newText
    return content
  }

  // Update existing object
  return {
    ...existing,
    [locale]: newText
  }
}

/**
 * Check if multilingual content has translation for a specific locale
 */
export function hasTranslation(
  content: MultilingualContent | null | undefined,
  locale: Locale
): boolean {
  if (!content) return false

  if (typeof content === 'string') {
    return locale === 'en' // assume string content is English
  }

  const value = (content as Record<string, string>)[locale]
  return !!(value && value.trim())
}

/**
 * Get available languages for multilingual content
 */
export function getAvailableLanguages(
  content: MultilingualContent | null | undefined
): Locale[] {
  if (!content) return []

  if (typeof content === 'string') {
    return ['en'] // assume string content is English
  }

  const languages: Locale[] = []
  for (const loc of locales) {
    const value = (content as Record<string, string>)[loc]
    if (value && value.trim()) {
      languages.push(loc)
    }
  }
  return languages
}

/**
 * Migrate existing string content to multilingual format
 */
export function migrateToMultilingual(
  existingContent: string | null | undefined,
  sourceLocale: Locale = 'en'
): MultilingualContent {
  if (!existingContent) {
    return { en: '' }
  }

  const content: MultilingualContent = { en: '' }
  ;(content as Record<string, string>)[sourceLocale] = existingContent
  return content
}

// ============================================================================
// ENTITY LOCALIZATION HELPERS - For common data structures
// ============================================================================

/**
 * Localize a business type object
 */
export function localizeBusinessType(businessType: any, locale: Locale) {
  return {
    ...businessType,
    name: getLocalizedText(businessType.name, locale),
    description: getLocalizedText(businessType.description, locale)
  }
}

/**
 * Localize a strategy object
 */
export function localizeStrategy(strategy: any, locale: Locale) {
  return {
    ...strategy,
    name: getLocalizedText(strategy.name, locale),
    description: getLocalizedText(strategy.description, locale),
    smeDescription: getLocalizedText(strategy.smeDescription, locale),
    smeTitle: getLocalizedText(strategy.smeTitle, locale),
    smeSummary: getLocalizedText(strategy.smeSummary, locale),
    whyImportant: getLocalizedText(strategy.whyImportant, locale),
    realWorldExample: getLocalizedText(strategy.realWorldExample, locale),
    lowBudgetAlternative: getLocalizedText(strategy.lowBudgetAlternative, locale),
    helpfulTips: getLocalizedArray(strategy.helpfulTips, locale),
    commonMistakes: getLocalizedArray(strategy.commonMistakes, locale),
    successMetrics: getLocalizedArray(strategy.successMetrics, locale),
    actionSteps: strategy.actionSteps?.map((step: any) => localizeActionStep(step, locale))
  }
}

/**
 * Localize an action step object
 */
export function localizeActionStep(actionStep: any, locale: Locale) {
  return {
    ...actionStep,
    title: getLocalizedText(actionStep.title, locale),
    description: getLocalizedText(actionStep.description, locale),
    smeAction: getLocalizedText(actionStep.smeAction, locale),
    timeframe: getLocalizedText(actionStep.timeframe, locale),
    whyThisStepMatters: getLocalizedText(actionStep.whyThisStepMatters, locale),
    howToKnowItsDone: getLocalizedText(actionStep.howToKnowItsDone, locale),
    whatHappensIfSkipped: getLocalizedText(actionStep.whatHappensIfSkipped, locale),
    exampleOutput: getLocalizedText(actionStep.exampleOutput, locale),
    freeAlternative: getLocalizedText(actionStep.freeAlternative, locale),
    lowTechOption: getLocalizedText(actionStep.lowTechOption, locale),
    commonMistakesForStep: getLocalizedArray(actionStep.commonMistakesForStep, locale)
  }
}

/**
 * Localize a risk multiplier object
 */
export function localizeRiskMultiplier(multiplier: any, locale: Locale) {
  return {
    ...multiplier,
    name: getLocalizedText(multiplier.name, locale),
    description: getLocalizedText(multiplier.description, locale),
    reasoning: getLocalizedText(multiplier.reasoning, locale),
    wizardQuestion: getLocalizedText(multiplier.wizardQuestion, locale),
    wizardHelpText: getLocalizedText(multiplier.wizardHelpText, locale),
    wizardAnswerOptions: getLocalizedArray(multiplier.wizardAnswerOptions, locale)
  }
}

// ============================================================================
// JSON PARSING HELPERS
// ============================================================================

/**
 * Parse JSON content safely - handles both string and object formats
 */
export function parseMultilingualJSON(content: string | null | undefined): MultilingualContent | null {
  if (!content) return null

  try {
    const parsed = JSON.parse(content)
    // If it's already an object with language keys, return it
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed
    }
    // If it's a string, treat as English content
    if (typeof parsed === 'string') {
      return { en: parsed }
    }
  } catch {
    // If JSON parsing fails, treat the content as a plain English string
    return { en: content }
  }

  return null
}

/**
 * Stringify multilingual content for database storage
 */
export function stringifyMultilingualContent(content: MultilingualContent | null | undefined): string {
  if (!content) return ''

  // If it's a simple string, convert to multilingual format
  if (typeof content === 'string') {
    return JSON.stringify({ en: content })
  }

  return JSON.stringify(content)
}
