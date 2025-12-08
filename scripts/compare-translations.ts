/**
 * Compare translation message files to find missing keys
 * Run with: npx tsx scripts/compare-translations.ts
 */
import fs from 'fs'
import path from 'path'

const messagesDir = path.join(process.cwd(), 'src/messages')
const locales = ['en', 'es', 'fr']

function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  
  return keys
}

async function compareTranslations() {
  console.log('🔍 Comparing translation files...\n')
  
  const messagesByLocale: Record<string, Set<string>> = {}
  
  // Load all message files
  for (const locale of locales) {
    const filePath = path.join(messagesDir, `${locale}.json`)
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    messagesByLocale[locale] = new Set(getAllKeys(content))
    console.log(`${locale}.json: ${messagesByLocale[locale].size} keys`)
  }
  
  console.log('')
  
  // Find keys in English but missing in other locales
  const enKeys = messagesByLocale['en']
  
  for (const locale of ['es', 'fr']) {
    const localeKeys = messagesByLocale[locale]
    const missing = [...enKeys].filter(k => !localeKeys.has(k))
    
    if (missing.length > 0) {
      console.log(`\n❌ Keys in en.json but MISSING in ${locale}.json (${missing.length}):`)
      missing.slice(0, 30).forEach(k => console.log(`   - ${k}`))
      if (missing.length > 30) {
        console.log(`   ... and ${missing.length - 30} more`)
      }
    } else {
      console.log(`✅ ${locale}.json has all keys from en.json`)
    }
  }
  
  // Find keys in other locales but not in English (potential orphans)
  for (const locale of ['es', 'fr']) {
    const localeKeys = messagesByLocale[locale]
    const extra = [...localeKeys].filter(k => !enKeys.has(k))
    
    if (extra.length > 0) {
      console.log(`\n⚠️  Keys in ${locale}.json but NOT in en.json (${extra.length}):`)
      extra.slice(0, 10).forEach(k => console.log(`   - ${k}`))
      if (extra.length > 10) {
        console.log(`   ... and ${extra.length - 10} more`)
      }
    }
  }
  
  // Output summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  
  const enCount = messagesByLocale['en'].size
  const esCount = messagesByLocale['es'].size
  const frCount = messagesByLocale['fr'].size
  
  console.log(`English (en.json):  ${enCount} keys`)
  console.log(`Spanish (es.json):  ${esCount} keys (${enCount === esCount ? '✅ Complete' : `❌ Missing ${enCount - esCount}`})`)
  console.log(`French (fr.json):   ${frCount} keys (${enCount === frCount ? '✅ Complete' : `❌ Missing ${enCount - frCount}`})`)
}

compareTranslations().catch(console.error)

