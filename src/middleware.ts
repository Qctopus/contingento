import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // The default locale to be used when visiting
  // a non-localized path (e.g. `/about`)
  defaultLocale,
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  localePrefix: 'always'
})

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|admin|_next|.*\\..*).*)']
} 