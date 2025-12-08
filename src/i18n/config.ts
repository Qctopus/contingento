/**
 * Centralized Language Configuration
 * This is the SINGLE source of truth for all locale-related configuration.
 * 
 * Usage:
 * - Import { locales, localeMetadata, type Locale } from '@/i18n/config'
 * - Access flags via localeMetadata[locale].flag
 * - Access labels via localeMetadata[locale].label (English name)
 * - Access native names via localeMetadata[locale].nativeLabel
 * 
 * Adding a new language:
 * 1. Add the locale code to the `locales` array
 * 2. Add metadata entry in `localeMetadata`
 * 3. Create corresponding message file in /src/messages/{locale}.json
 * 4. Add database translations for the new locale
 */

export const locales = ['en', 'es', 'fr'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/**
 * Comprehensive metadata for each supported locale
 */
export const localeMetadata: Record<Locale, {
  /** English name of the language (e.g., "Spanish") */
  label: string
  /** Native name of the language (e.g., "Español") */
  nativeLabel: string
  /** Emoji flag for the language */
  flag: string
  /** Text direction: 'ltr' for left-to-right, 'rtl' for right-to-left */
  direction: 'ltr' | 'rtl'
  /** Short code for display (e.g., "EN", "ES") */
  shortCode: string
}> = {
  en: { 
    label: 'English', 
    nativeLabel: 'English', 
    flag: '🇬🇧', 
    direction: 'ltr',
    shortCode: 'EN'
  },
  es: { 
    label: 'Spanish', 
    nativeLabel: 'Español', 
    flag: '🇪🇸', 
    direction: 'ltr',
    shortCode: 'ES'
  },
  fr: { 
    label: 'French', 
    nativeLabel: 'Français', 
    flag: '🇫🇷', 
    direction: 'ltr',
    shortCode: 'FR'
  },
}

// ============================================================================
// Derived types for database multilingual content
// ============================================================================

/**
 * Type for multilingual text fields stored as JSON in the database
 * Example: { en: "Hello", es: "Hola", fr: "Bonjour" }
 */
export type MultilingualText = Partial<Record<Locale, string>>

/**
 * Type for multilingual array fields stored as JSON in the database
 * Example: { en: ["Item 1", "Item 2"], es: ["Elemento 1", "Elemento 2"] }
 */
export type MultilingualArray = Partial<Record<Locale, string[]>>

// ============================================================================
// Helper functions for locale validation
// ============================================================================

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

/**
 * Get a valid locale from a string, with fallback to default
 */
export function getValidLocale(value: string | undefined | null): Locale {
  if (value && isValidLocale(value)) {
    return value
  }
  return defaultLocale
}

// ============================================================================
// Backward compatibility exports (deprecated - use localeMetadata instead)
// ============================================================================

/** @deprecated Use localeMetadata[locale].nativeLabel instead */
export const localeLabels: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français'
}

/** @deprecated Use localeMetadata[locale].label instead */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French'
}

/** @deprecated Use localeMetadata[locale].flag instead */
export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷'
}
