import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { locales } from '@/i18n/config'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

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
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src="/undp-logo.png" alt="UNDP Logo" style={{ height: '64px', marginRight: '1.5rem' }} />
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Business Continuity Plan Tool
                  </h1>
                </div>
                <LanguageSwitcher />
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
        
        {/* UNDP Design System Scripts - Following official documentation */}
        {/* jQuery (required) */}
        <Script 
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          strategy="beforeInteractive"
        />
        
        {/* UNDP Component JS files */}
        <Script 
          src="https://cdn.jsdelivr.net/npm/@undp/design-system/docs/js/components.min.js"
          strategy="afterInteractive"
        />
        
        {/* UNDP Component Initializer (must be last) */}
        <Script 
          src="https://cdn.jsdelivr.net/npm/@undp/design-system/docs/js/init.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
} 