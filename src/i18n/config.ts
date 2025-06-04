export const locales = ['en', 'es', 'fr'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale = 'en' as const

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français'
}

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French'
}

export const localeFlags: Record<Locale, string> = {
  en: '',
  es: '����',
  fr: '🇫🇷'
} 