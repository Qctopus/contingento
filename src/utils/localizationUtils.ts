/**
 * Utilities for handling multilingual content in the database
 */

import type { Locale } from '../i18n/config'

// Type for multilingual content stored as JSON
export type MultilingualContent = {
  en: string
  fr?: string
  es?: string
} | string // backward compatibility for existing single-language content

/**
 * Extract localized text from multilingual content
 */
export function getLocalizedText(
  content: MultilingualContent | string | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = 'en'
): string {
  if (!content) return ''

  // If content is a simple string, return it directly
  if (typeof content === 'string') {
    return content
  }

  // If content is an object, try to get the requested locale
  if (typeof content === 'object' && content !== null) {
    // Try requested locale first
    if (content[locale]) {
      return content[locale]
    }

    // Fall back to fallback locale
    if (content[fallbackLocale]) {
      return content[fallbackLocale]
    }

    // Fall back to English if available
    if (content.en) {
      return content.en
    }

    // Fall back to any available language
    const availableValue = Object.values(content).find(value => {
      if (!value) return false
      // Handle string values
      if (typeof value === 'string') {
        return value.trim().length > 0
      }
      return true
    })
    if (availableValue) {
      return String(availableValue)
    }
  }

  return ''
}

/**
 * Create multilingual content object from individual language strings
 */
export function createMultilingualContent(
  en: string,
  fr?: string,
  es?: string
): MultilingualContent {
  const content: MultilingualContent = { en }

  if (fr) content.fr = fr
  if (es) content.es = es

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
    content[locale] = newText
    return content
  }

  // If existing content is null/undefined, create new
  if (!existing) {
    const content: MultilingualContent = { en: '' }
    content[locale] = newText
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

  return !!(content[locale] && content[locale].trim())
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
  if (content.en && content.en.trim()) languages.push('en')
  if (content.fr && content.fr.trim()) languages.push('fr')
  if (content.es && content.es.trim()) languages.push('es')

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
  content[sourceLocale] = existingContent

  return content
}

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
    whyImportant: getLocalizedText(strategy.whyImportant, locale),
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
    smeAction: getLocalizedText(actionStep.smeAction, locale)
  }
}

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
  } catch (error) {
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

/**
 * Extract localized array from multilingual array content
 * Handles format: {"en":["item1","item2"],"es":["..."],"fr":["..."]}
 * Returns array of strings for the requested locale
 */
export function getLocalizedArray(
  content: string | any[] | { en?: any[]; es?: any[]; fr?: any[] } | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = 'en'
): string[] {
  if (!content) return []

  let parsed: any = null

  // If content is a string, return empty array (strings are not arrays)
  if (typeof content === 'string') {
    return []
  }

  parsed = content

  // If it's already an array, return it (assuming it's already localized)
  if (Array.isArray(parsed)) {
    // Ensure each item is a string
    return parsed.map((item: any) => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null) {
        // If it's a multilingual object, extract text for current locale
        return item[locale] || item[fallbackLocale] || item.en || String(item)
      }
      return String(item)
    }).filter((item: string) => item && item.trim().length > 0)
  }

  // If it's an object with language keys
  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    // Try to get array for requested locale
    let array: any[] = []

    if (parsed[locale] && Array.isArray(parsed[locale])) {
      array = parsed[locale]
    } else if (parsed[fallbackLocale] && Array.isArray(parsed[fallbackLocale])) {
      array = parsed[fallbackLocale]
    } else if (parsed.en && Array.isArray(parsed.en)) {
      array = parsed.en
    } else {
      // Try to find any array value
      const values = Object.values(parsed)
      const foundArray = values.find((v: any) => Array.isArray(v))
      if (foundArray) {
        array = foundArray
      }
    }

    // Ensure each item is a string
    return array.map((item: any) => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null) {
        // If it's a multilingual object, extract text for current locale
        return item[locale] || item[fallbackLocale] || item.en || String(item)
      }
      return String(item)
    }).filter((item: string) => item && item.trim().length > 0)
  }

  return []
}
