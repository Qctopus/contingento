import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { locales } from '@/i18n/config'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SessionManager } from '@/components/SessionManager'
import { WizardButton } from '@/components/WizardButton'
import { AuthWrapper } from '@/components/AuthWrapper'
import { LogoutButton } from '@/components/LogoutButton'
import Script from 'next/script'
import Link from 'next/link'
import '../globals.css'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Business Continuity Plan Generator',
  description: 'Generate comprehensive business continuity plans',
}

// Force dynamic rendering for all locale pages
export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound()

  let messages
  try {
    messages = (await import(`@/messages/${locale}.json`)).default
  } catch (error) {
    notFound()
  }

  // Get translations for header
  const t = await getTranslations({ locale, namespace: 'header' })

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script src="https://cdn.jsdelivr.net/npm/@undp/design-system/docs/js/init.min.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorBoundary>
            <AuthWrapper>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                  {/* Main Header Row */}
                  <div className="w-full px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Logos and Titles */}
                      <div className="flex items-center gap-6">
                        {/* UNDP Section */}
                        <Link href={`/${locale}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                          <img src="/undp-logo.png" alt="UNDP Logo" className="h-14 w-auto" />
                          <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                              {t('appTitle')}
                            </h1>
                          </div>
                        </Link>

                        {/* Divider */}
                        <div className="hidden md:block h-12 w-px bg-gray-200" />

                        {/* Partner Credit Section */}
                        <div className="hidden md:flex items-center gap-3">
                          <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                              Built with support from
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              {/* MOFA Logo Icon Only */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 320"
                                className="h-8 w-8 flex-shrink-0"
                                role="img"
                                aria-label="Ministry of Foreign Affairs, Republic of Korea"
                              >
                                <g transform="translate(5, 5)">
                                  <path
                                    fill="#043762"
                                    d=" M 107.71 16.68 C 124.66 10.24 142.81 6.54 160.98 7.02 C 186.05 6.31 211.07 13.01 233.08 24.87 C 261.80 40.37 285.18 65.40 298.86 95.02 C 300.39 98.34 301.91 101.68 302.93 105.20 C 290.16 77.48 268.14 54.04 241.04 39.94 C 214.91 26.28 184.03 22.52 155.22 28.34 C 125.72 34.22 98.24 51.04 80.61 75.54 C 69.62 90.71 62.36 109.10 62.51 128.00 C 62.35 134.75 63.35 141.47 64.95 148.02 C 68.38 161.50 76.82 173.74 88.58 181.26 C 100.68 189.09 116.11 191.55 130.04 187.80 C 142.81 184.55 154.14 176.27 161.27 165.21 C 167.45 155.49 176.47 147.51 187.13 143.07 C 198.96 138.06 212.68 137.87 224.71 142.31 C 239.31 147.64 251.44 159.36 257.16 173.84 C 263.67 189.70 262.70 208.12 255.58 223.62 C 244.05 251.11 223.24 275.18 196.08 288.06 C 172.79 299.35 146.04 302.61 120.51 299.23 C 90.06 294.92 61.87 278.27 42.59 254.43 C 20.85 227.85 9.37 193.29 10.02 159.03 C 9.78 130.13 18.48 101.32 34.01 77.00 C 51.33 49.74 77.52 28.19 107.71 16.68 Z"
                                  />
                                  <path
                                    fill="#e4012d"
                                    d=" M 155.22 28.34 C 184.03 22.52 214.91 26.28 241.04 39.94 C 268.14 54.04 290.16 77.48 302.93 105.20 C 307.79 116.86 310.51 129.35 312.10 141.86 C 314.40 163.71 312.70 186.12 305.87 207.07 C 293.88 245.26 266.23 278.21 230.64 296.56 C 227.21 298.18 223.91 300.44 220.01 300.68 C 237.46 290.21 252.98 276.34 264.51 259.51 C 280.70 236.38 289.48 208.23 289.52 180.01 C 289.78 152.22 280.58 124.44 263.66 102.37 C 244.73 77.27 216.03 59.69 184.96 54.65 C 158.80 50.15 131.04 54.63 107.96 67.88 C 93.24 76.26 80.38 88.34 72.39 103.38 C 67.03 113.38 64.16 124.63 63.81 135.96 C 63.50 140.04 65.02 143.94 64.95 148.02 C 63.35 141.47 62.35 134.75 62.51 128.00 C 62.36 109.10 69.62 90.71 80.61 75.54 C 98.24 51.04 125.72 34.22 155.22 28.34 Z"
                                  />
                                </g>
                              </svg>
                              <div className="flex flex-col leading-tight">
                                <span className="text-sm font-semibold text-gray-800">Ministry of Foreign Affairs</span>
                                <span className="text-xs text-gray-600">Republic of Korea</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Controls */}
                      <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <LogoutButton />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Header Row for Actions */}
                  <div className="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      {/* Left: Wizard Button */}
                      <WizardButton />

                      {/* Right: Session Status (Compact) */}
                      <SessionManager />
                    </div>
                  </div>
                </header>
                <main className="w-full px-2 py-8">
                  {children}
                </main>
              </div>
            </AuthWrapper>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}