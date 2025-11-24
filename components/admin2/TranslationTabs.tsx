import React from 'react'
import { Locale } from '@/i18n/config'

interface TranslationTabsProps {
    activeLocale: Locale
    onChange: (locale: Locale) => void
}

export function TranslationTabs({ activeLocale, onChange }: TranslationTabsProps) {
    const locales: { code: Locale; label: string; flag: string }[] = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' }
    ]

    return (
        <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            {locales.map((locale) => (
                <button
                    key={locale.code}
                    type="button"
                    onClick={() => onChange(locale.code)}
                    className={`
            px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 
            ${activeLocale === locale.code
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }
          `}
                >
                    <span className="mr-2">{locale.flag}</span>
                    {locale.label}
                </button>
            ))}
        </div>
    )
}
