/**
 * Database Translation Helpers
 * 
 * Utilities for fetching and processing multilingual content from the database.
 * These helpers standardize how we query translation tables and extract localized content.
 */

import { type Locale, defaultLocale, locales } from '@/i18n/config'

// ============================================================================
// Prisma Include Helpers
// ============================================================================

/**
 * Prisma include helper for fetching translations for a specific locale
 * Use this when you only need one language
 * 
 * @example
 * const strategy = await prisma.riskMitigationStrategy.findUnique({
 *   where: { id },
 *   include: {
 *     StrategyTranslation: withTranslation('es')
 *   }
 * })
 */
export const withTranslation = (locale: Locale) => ({
  where: { locale }
})

/**
 * Prisma include with fallback - fetches requested locale + default locale
 * Use this when you want automatic fallback to English if translation is missing
 * 
 * @example
 * const strategy = await prisma.riskMitigationStrategy.findUnique({
 *   where: { id },
 *   include: {
 *     StrategyTranslation: withTranslationFallback('es')
 *   }
 * })
 */
export const withTranslationFallback = (locale: Locale, fallback: Locale = defaultLocale) => {
  const localesToFetch = locale === fallback ? [locale] : [locale, fallback]
  return {
    where: {
      locale: { in: localesToFetch }
    }
  }
}

/**
 * Prisma include for fetching ALL translations (for admin editing)
 * 
 * @example
 * const strategy = await prisma.riskMitigationStrategy.findUnique({
 *   where: { id },
 *   include: {
 *     StrategyTranslation: withAllTranslations
 *   }
 * })
 */
export const withAllTranslations = {
  where: {
    locale: { in: [...locales] }
  }
}

// ============================================================================
// Translation Extraction Helpers
// ============================================================================

/**
 * Extract first (best) translation from an array of translations
 * Prioritizes: requested locale → default locale → any available
 * 
 * @example
 * const strategy = await prisma.riskMitigationStrategy.findUnique({
 *   include: { StrategyTranslation: withTranslationFallback('es') }
 * })
 * const translation = extractTranslation(strategy.StrategyTranslation, 'es')
 */
export function extractTranslation<T extends { locale: string }>(
  translations: T[] | undefined | null,
  preferredLocale: Locale = defaultLocale
): T | null {
  if (!translations || translations.length === 0) return null

  // Try to find preferred locale
  const preferred = translations.find(t => t.locale === preferredLocale)
  if (preferred) return preferred

  // Try default locale
  const fallback = translations.find(t => t.locale === defaultLocale)
  if (fallback) return fallback

  // Return first available
  return translations[0] || null
}

/**
 * Extract translations as a locale-keyed object (for admin editing)
 * 
 * @example
 * const translations = extractTranslationsMap(strategy.StrategyTranslation)
 * // { en: {...}, es: {...}, fr: {...} }
 */
export function extractTranslationsMap<T extends { locale: string }>(
  translations: T[] | undefined | null
): Partial<Record<Locale, Omit<T, 'locale'>>> {
  if (!translations || translations.length === 0) return {}

  const map: Partial<Record<Locale, Omit<T, 'locale'>>> = {}

  for (const translation of translations) {
    if (locales.includes(translation.locale as Locale)) {
      const { locale, ...rest } = translation
      map[locale as Locale] = rest
    }
  }

  return map
}

/**
 * Get a specific field from translations with fallback
 * Useful when you just need one field, not the whole translation
 * 
 * @example
 * const name = extractTranslationField(strategy.StrategyTranslation, 'name', 'es')
 */
export function extractTranslationField<T extends { locale: string }>(
  translations: T[] | undefined | null,
  field: keyof Omit<T, 'locale'>,
  locale: Locale = defaultLocale
): string {
  const translation = extractTranslation(translations, locale)
  if (!translation) return ''
  
  const value = translation[field as keyof T]
  return typeof value === 'string' ? value : ''
}

// ============================================================================
// Upsert Helpers
// ============================================================================

/**
 * Create upsert data for a translation
 * Useful for saving translations in admin forms
 * 
 * @example
 * await prisma.strategyTranslation.upsert({
 *   ...createTranslationUpsert('strategyId', strategy.id, 'locale', 'es'),
 *   update: translationData,
 *   create: { strategyId: strategy.id, locale: 'es', ...translationData }
 * })
 */
export function createTranslationUpsert(
  foreignKeyField: string,
  foreignKeyValue: string,
  localeValue: Locale
) {
  return {
    where: {
      [`${foreignKeyField}_locale`]: {
        [foreignKeyField]: foreignKeyValue,
        locale: localeValue
      }
    }
  }
}

// ============================================================================
// Batch Translation Helpers
// ============================================================================

/**
 * Check if an entity has translations for all required locales
 */
export function hasAllTranslations<T extends { locale: string }>(
  translations: T[] | undefined | null,
  requiredLocales: Locale[] = [...locales]
): boolean {
  if (!translations) return false
  const existingLocales = new Set(translations.map(t => t.locale))
  return requiredLocales.every(loc => existingLocales.has(loc))
}

/**
 * Get missing translation locales for an entity
 */
export function getMissingTranslations<T extends { locale: string }>(
  translations: T[] | undefined | null,
  requiredLocales: Locale[] = [...locales]
): Locale[] {
  if (!translations) return requiredLocales
  const existingLocales = new Set(translations.map(t => t.locale))
  return requiredLocales.filter(loc => !existingLocales.has(loc))
}

// ============================================================================
// Type Helpers
// ============================================================================

/**
 * Type for an entity with its translations included
 */
export type WithTranslations<TEntity, TTranslation> = TEntity & {
  translations: TTranslation[]
}

/**
 * Type for localized entity (translation merged into entity)
 */
export type Localized<TEntity, TTranslation extends { locale: string }> = 
  Omit<TEntity, keyof TTranslation> & Omit<TTranslation, 'locale' | 'id'>

