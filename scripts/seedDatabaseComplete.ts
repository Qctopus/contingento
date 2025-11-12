#!/usr/bin/env tsx
/**
 * MASTER DATABASE SEEDING SCRIPT
 * 
 * Populates complete database for Caribbean Business Continuity Planning tool
 * Run this script to populate all essential data for the application
 * 
 * Usage:
 *   npx tsx scripts/seedDatabaseComplete.ts
 * 
 * Or step-by-step:
 *   npx tsx scripts/seedDatabaseComplete.ts --countries
 *   npx tsx scripts/seedDatabaseComplete.ts --business-types
 *   ... etc
 */

import { PrismaClient } from '@prisma/client'
import { seedCaribbeanCountries } from './seedCaribbeanCountries'
import { seedBusinessTypes } from './seedBusinessTypes'
import { seedComprehensiveCostItems } from '../prisma/seeds/comprehensiveCostItems'
import { seedHazardTypes } from './seedHazardTypes'
import { seedComprehensiveStrategies } from './seedComprehensiveStrategies'
import { seedActionStepsWithCosts } from './seedActionStepsWithCosts'
import { seedJamaicaParishes } from './seedJamaicaParishesComprehensive'
import { seedBusinessRiskVulnerabilities } from './seedBusinessRiskVulnerabilities'
import { seedBarbadosAdminUnits } from './seedBarbadosAdminUnits'
import { seedBahamasAdminUnits } from './seedBahamasAdminUnits'

const prisma = new PrismaClient()

interface SeedStep {
  name: string
  description: string
  fn: () => Promise<void>
  required: boolean
}

const SEED_STEPS: SeedStep[] = [
  {
    name: 'countries',
    description: 'Caribbean countries and currency multipliers',
    fn: seedCaribbeanCountries,
    required: true
  },
  {
    name: 'business-types',
    description: 'Business types (restaurants, shops, services, etc.)',
    fn: seedBusinessTypes,
    required: true
  },
  {
    name: 'cost-items',
    description: 'Cost items library (equipment, supplies, services)',
    fn: seedComprehensiveCostItems,
    required: true
  },
  {
    name: 'hazards',
    description: 'Hazard types (hurricanes, floods, earthquakes, etc.)',
    fn: seedHazardTypes,
    required: true
  },
  {
    name: 'strategies',
    description: 'Risk mitigation strategies (multilingual)',
    fn: seedComprehensiveStrategies,
    required: true
  },
  {
    name: 'action-steps',
    description: 'Action steps for each strategy with cost items',
    fn: seedActionStepsWithCosts,
    required: true
  },
  {
    name: 'parishes',
    description: 'Jamaica parishes with risk assessments',
    fn: seedJamaicaParishes,
    required: false
  },
  {
    name: 'barbados-units',
    description: 'Barbados parishes with risk assessments',
    fn: seedBarbadosAdminUnits,
    required: false
  },
  {
    name: 'bahamas-units',
    description: 'Bahamas islands/districts with risk assessments',
    fn: seedBahamasAdminUnits,
    required: false
  },
  {
    name: 'vulnerabilities',
    description: 'Business type to hazard vulnerability mappings',
    fn: seedBusinessRiskVulnerabilities,
    required: true
  }
]

async function displayMenu() {
  console.log('\n' + '='.repeat(80))
  console.log('🌴 CARIBBEAN BUSINESS CONTINUITY PLANNING - DATABASE SEEDING')
  console.log('='.repeat(80))
  console.log('\nThis script will populate your database with:')
  console.log('  • 12 Caribbean countries with currency data')
  console.log('  • 35+ business types (restaurants, shops, services)')
  console.log('  • 45+ cost items (equipment, supplies, services)')
  console.log('  • 20+ hazard types (hurricanes, floods, etc.)')
  console.log('  • 10+ comprehensive mitigation strategies (multilingual)')
  console.log('  • 40+ detailed action steps')
  console.log('  • 14 Jamaica parishes with risk data')
  console.log('  • 11 Barbados parishes with risk data')
  console.log('  • 12 Bahamas islands/districts with risk data')
  console.log('  • 100+ business-hazard vulnerability mappings')
  console.log('\n' + '='.repeat(80))
}

async function confirmContinue(): Promise<boolean> {
  console.log('\n⚠️  WARNING: This will modify your database!')
  console.log('   - Existing data will be updated/merged where possible')
  console.log('   - New data will be created')
  console.log('   - No data will be deleted')
  
  // Check if running in non-interactive mode (CI/CD)
  if (process.env.CI || process.argv.includes('--yes') || process.argv.includes('-y')) {
    console.log('\n✓ Auto-confirming (non-interactive mode)')
    return true
  }
  
  // For interactive mode, just proceed
  console.log('\n✓ Proceeding with database seeding...')
  return true
}

async function runSeeding(steps: string[] = []) {
  const startTime = Date.now()
  let successCount = 0
  let failureCount = 0
  let skippedCount = 0
  
  // If specific steps requested
  const stepsToRun = steps.length > 0 
    ? SEED_STEPS.filter(s => steps.includes(s.name))
    : SEED_STEPS
  
  if (stepsToRun.length === 0) {
    console.error('\n❌ No valid steps specified')
    process.exit(1)
  }
  
  console.log('\n' + '='.repeat(80))
  console.log(`📦 Running ${stepsToRun.length} seeding step(s)...`)
  console.log('='.repeat(80))
  
  for (const step of stepsToRun) {
    console.log(`\n\n${'─'.repeat(80)}`)
    console.log(`📌 STEP: ${step.name.toUpperCase()}`)
    console.log(`   ${step.description}`)
    console.log('─'.repeat(80))
    
    try {
      await step.fn()
      successCount++
      console.log(`\n✅ ${step.name} completed successfully!`)
    } catch (error) {
      failureCount++
      console.error(`\n❌ ${step.name} failed:`)
      console.error(error)
      
      if (step.required) {
        console.error(`\n💥 FATAL: Required step "${step.name}" failed. Aborting.`)
        throw error
      } else {
        console.log(`\n⚠️  Optional step "${step.name}" failed but continuing...`)
      }
    }
  }
  
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(1)
  
  console.log('\n\n' + '='.repeat(80))
  console.log('🏁 SEEDING COMPLETE!')
  console.log('='.repeat(80))
  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${failureCount}`)
  console.log(`   ⊘ Skipped: ${skippedCount}`)
  console.log(`   ⏱️  Duration: ${duration} seconds`)
  console.log('\n' + '='.repeat(80))
  
  if (failureCount > 0) {
    console.log('\n⚠️  Some steps failed. Check the errors above.')
    console.log('   You can re-run specific failed steps using:')
    console.log('   npx tsx scripts/seedDatabaseComplete.ts --<step-name>')
    process.exitCode = 1
  } else {
    console.log('\n🎉 Your database is now fully populated and ready to use!')
    console.log('\n🚀 Next steps:')
    console.log('   1. Start your dev server: npm run dev')
    console.log('   2. Visit http://localhost:3000/admin2 to view the admin panel')
    console.log('   3. Visit http://localhost:3000/wizard to test the wizard')
  }
}

async function showHelp() {
  console.log('\n' + '='.repeat(80))
  console.log('USAGE')
  console.log('='.repeat(80))
  console.log('\nRun all seeding steps:')
  console.log('  npx tsx scripts/seedDatabaseComplete.ts')
  console.log('\nRun specific steps:')
  console.log('  npx tsx scripts/seedDatabaseComplete.ts --countries --business-types')
  console.log('\nAuto-confirm (no prompts):')
  console.log('  npx tsx scripts/seedDatabaseComplete.ts --yes')
  console.log('\nAvailable steps:')
  SEED_STEPS.forEach(step => {
    const req = step.required ? '[REQUIRED]' : '[OPTIONAL]'
    console.log(`  --${step.name.padEnd(20)} ${req} ${step.description}`)
  })
  console.log('\n' + '='.repeat(80))
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }
  
  // Display menu
  await displayMenu()
  
  // Confirm
  const confirmed = await confirmContinue()
  if (!confirmed) {
    console.log('\n❌ Seeding cancelled by user')
    process.exit(0)
  }
  
  // Get specific steps if provided
  const requestedSteps = args
    .filter(arg => arg.startsWith('--') && !['--yes', '-y', '--help', '-h'].includes(arg))
    .map(arg => arg.replace('--', ''))
  
  // Run seeding
  await runSeeding(requestedSteps)
}

// Run main function
main()
  .catch((e) => {
    console.error('\n💥 FATAL ERROR:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

