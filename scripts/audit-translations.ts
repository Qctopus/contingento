/**
 * Translation Audit Script
 * 
 * Audits all translation tables to find entities missing translations for one or more locales.
 * Run with: npx tsx scripts/audit-translations.ts
 * 
 * Output:
 * - Summary of translation coverage per table
 * - List of entities with missing translations
 * - Recommendations for fixing gaps
 */

import { PrismaClient } from '@prisma/client'
import { locales, type Locale } from '../src/i18n/config'

const prisma = new PrismaClient()

interface TranslationGap {
  table: string
  id: string
  identifier: string
  missing: Locale[]
  existing: Locale[]
}

interface TableStats {
  table: string
  total: number
  fullyTranslated: number
  partiallyTranslated: number
  noTranslations: number
  coverage: string
}

async function auditTranslations() {
  console.log('\n🔍 Translation Audit Report')
  console.log('=' .repeat(60))
  console.log(`📅 Generated: ${new Date().toISOString()}`)
  console.log(`🌐 Supported Locales: ${locales.join(', ')}`)
  console.log('=' .repeat(60))

  const results: TranslationGap[] = []
  const stats: TableStats[] = []

  // ========================================================================
  // Audit Strategies
  // ========================================================================
  console.log('\n📋 Auditing RiskMitigationStrategy translations...')
  
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: { isActive: true },
    select: {
      id: true,
      strategyId: true,
      StrategyTranslation: { select: { locale: true, name: true } }
    }
  })

  let strategyFull = 0, strategyPartial = 0, strategyNone = 0

  for (const s of strategies) {
    const existing = s.StrategyTranslation.map(t => t.locale) as Locale[]
    const missing = locales.filter(l => !existing.includes(l))
    
    if (missing.length === locales.length) strategyNone++
    else if (missing.length > 0) strategyPartial++
    else strategyFull++

    if (missing.length > 0) {
      results.push({
        table: 'RiskMitigationStrategy',
        id: s.id,
        identifier: s.strategyId,
        missing,
        existing
      })
    }
  }

  stats.push({
    table: 'RiskMitigationStrategy',
    total: strategies.length,
    fullyTranslated: strategyFull,
    partiallyTranslated: strategyPartial,
    noTranslations: strategyNone,
    coverage: `${((strategyFull / strategies.length) * 100).toFixed(1)}%`
  })

  // ========================================================================
  // Audit Business Types
  // ========================================================================
  console.log('📋 Auditing BusinessType translations...')

  const businessTypes = await prisma.businessType.findMany({
    where: { isActive: true },
    select: {
      id: true,
      businessTypeId: true,
      BusinessTypeTranslation: { select: { locale: true, name: true } }
    }
  })

  let btFull = 0, btPartial = 0, btNone = 0

  for (const bt of businessTypes) {
    const existing = bt.BusinessTypeTranslation.map(t => t.locale) as Locale[]
    const missing = locales.filter(l => !existing.includes(l))
    
    if (missing.length === locales.length) btNone++
    else if (missing.length > 0) btPartial++
    else btFull++

    if (missing.length > 0) {
      results.push({
        table: 'BusinessType',
        id: bt.id,
        identifier: bt.businessTypeId,
        missing,
        existing
      })
    }
  }

  stats.push({
    table: 'BusinessType',
    total: businessTypes.length,
    fullyTranslated: btFull,
    partiallyTranslated: btPartial,
    noTranslations: btNone,
    coverage: `${((btFull / businessTypes.length) * 100).toFixed(1)}%`
  })

  // ========================================================================
  // Audit Action Steps
  // ========================================================================
  console.log('📋 Auditing ActionStep translations...')

  const actionSteps = await prisma.actionStep.findMany({
    where: { isActive: true },
    select: {
      id: true,
      stepId: true,
      strategyId: true,
      ActionStepTranslation: { select: { locale: true, title: true } }
    }
  })

  let stepFull = 0, stepPartial = 0, stepNone = 0

  for (const step of actionSteps) {
    const existing = step.ActionStepTranslation.map(t => t.locale) as Locale[]
    const missing = locales.filter(l => !existing.includes(l))
    
    if (missing.length === locales.length) stepNone++
    else if (missing.length > 0) stepPartial++
    else stepFull++

    if (missing.length > 0) {
      results.push({
        table: 'ActionStep',
        id: step.id,
        identifier: step.stepId,
        missing,
        existing
      })
    }
  }

  stats.push({
    table: 'ActionStep',
    total: actionSteps.length,
    fullyTranslated: stepFull,
    partiallyTranslated: stepPartial,
    noTranslations: stepNone,
    coverage: `${((stepFull / actionSteps.length) * 100).toFixed(1)}%`
  })

  // ========================================================================
  // Audit Risk Multipliers
  // ========================================================================
  console.log('📋 Auditing RiskMultiplier translations...')

  const multipliers = await prisma.riskMultiplier.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      RiskMultiplierTranslation: { select: { locale: true, name: true } }
    }
  })

  let multFull = 0, multPartial = 0, multNone = 0

  for (const m of multipliers) {
    const existing = m.RiskMultiplierTranslation.map(t => t.locale) as Locale[]
    const missing = locales.filter(l => !existing.includes(l))
    
    if (missing.length === locales.length) multNone++
    else if (missing.length > 0) multPartial++
    else multFull++

    if (missing.length > 0) {
      results.push({
        table: 'RiskMultiplier',
        id: m.id,
        identifier: m.name,
        missing,
        existing
      })
    }
  }

  stats.push({
    table: 'RiskMultiplier',
    total: multipliers.length,
    fullyTranslated: multFull,
    partiallyTranslated: multPartial,
    noTranslations: multNone,
    coverage: `${((multFull / multipliers.length) * 100).toFixed(1)}%`
  })

  // ========================================================================
  // Print Summary
  // ========================================================================
  console.log('\n' + '='.repeat(60))
  console.log('📊 TRANSLATION COVERAGE SUMMARY')
  console.log('='.repeat(60))
  
  console.log('\n┌─────────────────────────┬───────┬──────────┬─────────┬────────┬──────────┐')
  console.log('│ Table                   │ Total │ Complete │ Partial │ None   │ Coverage │')
  console.log('├─────────────────────────┼───────┼──────────┼─────────┼────────┼──────────┤')
  
  for (const s of stats) {
    const row = [
      s.table.padEnd(23),
      String(s.total).padStart(5),
      String(s.fullyTranslated).padStart(8),
      String(s.partiallyTranslated).padStart(7),
      String(s.noTranslations).padStart(6),
      s.coverage.padStart(8)
    ]
    console.log(`│ ${row.join(' │ ')} │`)
  }
  
  console.log('└─────────────────────────┴───────┴──────────┴─────────┴────────┴──────────┘')

  // ========================================================================
  // Print Gaps
  // ========================================================================
  if (results.length === 0) {
    console.log('\n✅ All entities have complete translations for all locales!')
  } else {
    console.log(`\n⚠️  Found ${results.length} entities with missing translations:\n`)
    
    // Group by table
    const byTable = results.reduce((acc, r) => {
      if (!acc[r.table]) acc[r.table] = []
      acc[r.table].push(r)
      return acc
    }, {} as Record<string, TranslationGap[]>)

    for (const [table, gaps] of Object.entries(byTable)) {
      console.log(`\n📁 ${table} (${gaps.length} gaps):`)
      console.log('-'.repeat(50))
      
      // Show first 10 gaps per table
      const toShow = gaps.slice(0, 10)
      for (const gap of toShow) {
        console.log(`   ${gap.identifier}`)
        console.log(`      Missing: ${gap.missing.join(', ')}`)
        if (gap.existing.length > 0) {
          console.log(`      Has: ${gap.existing.join(', ')}`)
        }
      }
      
      if (gaps.length > 10) {
        console.log(`   ... and ${gaps.length - 10} more`)
      }
    }

    // Recommendations
    console.log('\n' + '='.repeat(60))
    console.log('💡 RECOMMENDATIONS')
    console.log('='.repeat(60))
    
    const totalMissing = results.length
    const missingByLocale: Record<Locale, number> = {} as Record<Locale, number>
    
    for (const r of results) {
      for (const loc of r.missing) {
        missingByLocale[loc] = (missingByLocale[loc] || 0) + 1
      }
    }
    
    console.log('\nMissing translations by locale:')
    for (const [loc, count] of Object.entries(missingByLocale)) {
      console.log(`   ${loc}: ${count} entities need translation`)
    }
    
    console.log('\nTo fix:')
    console.log('1. Export entities missing translations')
    console.log('2. Use a translation service or manual translation')
    console.log('3. Import translations via admin UI or seed script')
    console.log('4. Re-run this audit to verify completeness')
  }

  // ========================================================================
  // Output JSON for automation
  // ========================================================================
  const jsonOutput = {
    generatedAt: new Date().toISOString(),
    locales,
    stats,
    gaps: results
  }

  console.log('\n' + '='.repeat(60))
  console.log('📄 JSON Output (for automation):')
  console.log('='.repeat(60))
  console.log(JSON.stringify(jsonOutput, null, 2))

  await prisma.$disconnect()
  
  // Exit with error code if gaps found
  if (results.length > 0) {
    process.exit(1)
  }
}

auditTranslations().catch(error => {
  console.error('❌ Audit failed:', error)
  prisma.$disconnect()
  process.exit(1)
})

