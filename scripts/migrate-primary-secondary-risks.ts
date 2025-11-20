import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Smart migration script to set primaryRisk and secondaryRisks for all existing strategies
 * 
 * Logic:
 * 1. If applicableRisks has only 1 risk -> primaryRisk = that risk, secondaryRisks = []
 * 2. If applicableRisks has multiple risks -> intelligently choose primary based on strategy name/content
 * 3. Remaining risks become secondaryRisks
 */

// Mapping of strategy patterns to their logical primary risk
const STRATEGY_PRIMARY_RISK_HINTS: Record<string, string> = {
  // Exact matches (strategy ID patterns)
  'hurricane': 'hurricane',
  'flood': 'flood',
  'earthquake': 'earthquake',
  'drought': 'drought',
  'power': 'powerOutage',
  'cyber': 'cyberAttack',
  'fire': 'fire',
  'pandemic': 'pandemicDisease',
  'supply': 'supplyChainDisruption',
  'backup_power': 'powerOutage',
  'generator': 'powerOutage',
  'water': 'drought',
  
  // Title/description keywords
  'hurricane preparedness': 'hurricane',
  'hurricane protection': 'hurricane',
  'hurricane readiness': 'hurricane',
  'tropical storm': 'hurricane',
  'flood protection': 'flood',
  'flood damage': 'flood',
  'water damage': 'flood',
  'earthquake safety': 'earthquake',
  'seismic': 'earthquake',
  'drought': 'drought',
  'water shortage': 'drought',
  'water security': 'drought',
  'power outage': 'powerOutage',
  'backup power': 'powerOutage',
  'generator': 'powerOutage',
  'cyber attack': 'cyberAttack',
  'cybersecurity': 'cyberAttack',
  'data protection': 'cyberAttack',
  'fire safety': 'fire',
  'fire protection': 'fire',
  'pandemic': 'pandemicDisease',
  'disease outbreak': 'pandemicDisease',
  'health emergency': 'pandemicDisease',
  'supply chain': 'supplyChainDisruption',
  'supplier': 'supplyChainDisruption'
}

function determinePrimaryRisk(
  strategyId: string,
  smeTitle: string | null,
  smeSummary: string | null,
  applicableRisksArray: string[]
): string {
  if (applicableRisksArray.length === 0) {
    console.warn(`  ⚠️  Strategy ${strategyId} has no applicable risks - using 'general'`)
    return 'general'
  }
  
  if (applicableRisksArray.length === 1) {
    // Only one risk - easy choice
    return applicableRisksArray[0]
  }
  
  // Multiple risks - use intelligent matching
  const searchText = `${strategyId} ${smeTitle || ''} ${smeSummary || ''}`.toLowerCase()
  
  // Check each hint pattern
  for (const [pattern, primaryRisk] of Object.entries(STRATEGY_PRIMARY_RISK_HINTS)) {
    if (searchText.includes(pattern.toLowerCase())) {
      // Verify this risk is actually in the applicableRisks
      if (applicableRisksArray.includes(primaryRisk)) {
        console.log(`  ✓ Matched pattern "${pattern}" → primaryRisk: ${primaryRisk}`)
        return primaryRisk
      }
    }
  }
  
  // Fallback: use first risk in array (maintain backward compatibility)
  console.log(`  ℹ️  No pattern match - using first risk: ${applicableRisksArray[0]}`)
  return applicableRisksArray[0]
}

async function main() {
  console.log('🔄 Starting smart migration: primaryRisk + secondaryRisks')
  console.log('━'.repeat(80))
  
  // Get all strategies
  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      id: true,
      strategyId: true,
      smeTitle: true,
      smeSummary: true,
      applicableRisks: true,
      primaryRisk: true,
      secondaryRisks: true
    }
  })
  
  console.log(`\n📊 Found ${strategies.length} strategies to process\n`)
  
  let updated = 0
  let skipped = 0
  let errors = 0
  
  for (const strategy of strategies) {
    try {
      // Parse applicableRisks JSON
      let applicableRisksArray: string[] = []
      try {
        applicableRisksArray = JSON.parse(strategy.applicableRisks || '[]')
      } catch (e) {
        console.error(`  ❌ Failed to parse applicableRisks for ${strategy.strategyId}:`, e)
        errors++
        continue
      }
      
      // Parse smeTitle JSON (it's multilingual)
      let smeTitleText = null
      if (strategy.smeTitle) {
        try {
          const parsed = JSON.parse(strategy.smeTitle)
          smeTitleText = parsed.en || strategy.smeTitle
        } catch (e) {
          smeTitleText = strategy.smeTitle
        }
      }
      
      // Parse smeSummary JSON
      let smeSummaryText = null
      if (strategy.smeSummary) {
        try {
          const parsed = JSON.parse(strategy.smeSummary)
          smeSummaryText = parsed.en || strategy.smeSummary
        } catch (e) {
          smeSummaryText = strategy.smeSummary
        }
      }
      
      // Skip if already migrated
      if (strategy.primaryRisk && strategy.secondaryRisks) {
        console.log(`⏭️  SKIP: ${strategy.strategyId} (already has primaryRisk + secondaryRisks)`)
        skipped++
        continue
      }
      
      console.log(`\n📋 Processing: ${strategy.strategyId}`)
      console.log(`  Title: ${smeTitleText || '(no title)'}`)
      console.log(`  Applicable risks: [${applicableRisksArray.join(', ')}]`)
      
      // Determine primary risk
      const primaryRisk = determinePrimaryRisk(
        strategy.strategyId,
        smeTitleText,
        smeSummaryText,
        applicableRisksArray
      )
      
      // Secondary risks are all the others
      const secondaryRisksArray = applicableRisksArray.filter(r => r !== primaryRisk)
      const secondaryRisks = JSON.stringify(secondaryRisksArray)
      
      console.log(`  ✅ PRIMARY: ${primaryRisk}`)
      console.log(`  🔗 SECONDARY: [${secondaryRisksArray.join(', ')}]`)
      
      // Update database
      await prisma.riskMitigationStrategy.update({
        where: { id: strategy.id },
        data: {
          primaryRisk,
          secondaryRisks
        }
      })
      
      updated++
      
    } catch (error) {
      console.error(`  ❌ Error processing ${strategy.strategyId}:`, error)
      errors++
    }
  }
  
  console.log('\n' + '━'.repeat(80))
  console.log('📊 Migration Summary:')
  console.log(`  ✅ Updated: ${updated}`)
  console.log(`  ⏭️  Skipped: ${skipped}`)
  console.log(`  ❌ Errors: ${errors}`)
  console.log('━'.repeat(80))
  
  if (errors === 0) {
    console.log('\n🎉 Migration completed successfully!')
  } else {
    console.log('\n⚠️  Migration completed with errors. Please review above.')
  }
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




