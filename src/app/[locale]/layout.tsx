import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { locales } from '@/i18n/config'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SessionManager } from '@/components/SessionManager'
import { WizardButton } from '@/components/WizardButton'
import { AuthWrapper } from '@/components/AuthWrapper'
import { LogoutButton } from '@/components/LogoutButton'
import Script from 'next/script'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

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

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorBoundary>
            <AuthWrapper>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                  {/* Main Header Row */}
                  <div className="w-full px-4 py-4">
                    <div className="flex justify-between items-center">
                      {/* Left: Logo and Title */}
                      <div className="flex items-center gap-4">
                        <Link href={`/${locale}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                          <img src="/undp-logo.png" alt="UNDP Logo" style={{ height: '64px' }} />
                          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Business Continuity Plan Tool
                          </h1>
                        </Link>
                      </div>
                      
                      {/* Right: Controls */}
                      <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <LogoutButton />
                      </div>
                    </div>
                  </div>
                  
                  {/* Secondary Header Row for Actions */}
                  <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
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