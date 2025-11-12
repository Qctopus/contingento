#!/usr/bin/env tsx
/**
 * Database Population Verification Script
 * 
 * Verifies that all seed data was successfully populated
 * Run after seeding to confirm everything is working
 * 
 * Usage:
 *   npx tsx scripts/verifyDatabasePopulation.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface VerificationResult {
  category: string
  test: string
  expected: number | string
  actual: number | string
  passed: boolean
  details?: string
}

const results: VerificationResult[] = []

function addResult(category: string, test: string, expected: number | string, actual: number | string, details?: string) {
  const passed = typeof expected === 'number' 
    ? (actual as number) >= (expected as number)
    : actual === expected
  
  results.push({
    category,
    test,
    expected,
    actual,
    passed,
    details
  })
}

async function verifyCountries() {
  console.log('\n🌍 Verifying Countries & Currency...')
  
  const countryCount = await prisma.adminLocation.count({
    where: { parish: null, isActive: true }
  })
  addResult('Countries', 'Caribbean countries', 10, countryCount, 'Should have at least 10 countries')
  
  const multiplierCount = await prisma.countryCostMultiplier.count()
  addResult('Countries', 'Currency multipliers', 10, multiplierCount, 'Should have at least 10 currency configs')
  
  // Check Jamaica exists with correct currency
  const jamaica = await prisma.countryCostMultiplier.findUnique({
    where: { countryCode: 'JM' }
  })
  addResult('Countries', 'Jamaica currency setup', 'JMD', jamaica?.currency || 'NOT_FOUND', 'Jamaica should have JMD currency')
}

async function verifyBusinessTypes() {
  console.log('\n🏢 Verifying Business Types...')
  
  const businessTypeCount = await prisma.businessType.count({
    where: { isActive: true }
  })
  addResult('Business Types', 'Active business types', 30, businessTypeCount, 'Should have at least 30 business types')
  
  // Check for multilingual content
  const sampleBusiness = await prisma.businessType.findFirst({
    where: { businessTypeId: 'restaurant' }
  })
  
  if (sampleBusiness) {
    try {
      const nameObj = JSON.parse(sampleBusiness.name)
      const hasMultilingual = nameObj.en && nameObj.es && nameObj.fr
      addResult('Business Types', 'Multilingual support', 'YES', hasMultilingual ? 'YES' : 'NO', 'Names should have en, es, fr translations')
    } catch {
      addResult('Business Types', 'Multilingual support', 'YES', 'NO', 'Name should be JSON with translations')
    }
  }
}

async function verifyCostItems() {
  console.log('\n💰 Verifying Cost Items...')
  
  const costItemCount = await prisma.costItem.count({
    where: { isActive: true }
  })
  addResult('Cost Items', 'Active cost items', 40, costItemCount, 'Should have at least 40 cost items')
  
  // Check categories
  const categories = ['construction', 'equipment', 'service', 'supplies']
  for (const category of categories) {
    const count = await prisma.costItem.count({
      where: { category, isActive: true }
    })
    addResult('Cost Items', `Category: ${category}`, 1, count, `Should have at least 1 ${category} item`)
  }
}

async function verifyHazards() {
  console.log('\n⚠️  Verifying Hazard Types...')
  
  const hazardCount = await prisma.adminHazardType.count({
    where: { isActive: true }
  })
  addResult('Hazards', 'Active hazard types', 15, hazardCount, 'Should have at least 15 hazard types')
  
  // Check for key hazards
  const keyHazards = ['hurricane', 'flooding', 'power_outage', 'fire', 'earthquake']
  for (const hazardId of keyHazards) {
    const hazard = await prisma.adminHazardType.findUnique({
      where: { hazardId, isActive: true }
    })
    addResult('Hazards', `Key hazard: ${hazardId}`, 'EXISTS', hazard ? 'EXISTS' : 'MISSING', `${hazardId} should exist`)
  }
}

async function verifyStrategies() {
  console.log('\n🛡️  Verifying Risk Mitigation Strategies...')
  
  const strategyCount = await prisma.riskMitigationStrategy.count({
    where: { isActive: true }
  })
  addResult('Strategies', 'Active strategies', 8, strategyCount, 'Should have at least 8 strategies')
  
  // Check for multilingual content
  const sampleStrategy = await prisma.riskMitigationStrategy.findFirst({
    where: { strategyId: 'hurricane_preparedness' }
  })
  
  if (sampleStrategy) {
    try {
      const nameObj = JSON.parse(sampleStrategy.name)
      const hasMultilingual = nameObj.en && nameObj.es && nameObj.fr
      addResult('Strategies', 'Multilingual support', 'YES', hasMultilingual ? 'YES' : 'NO', 'Names should have en, es, fr translations')
    } catch {
      addResult('Strategies', 'Multilingual support', 'YES', 'NO', 'Name should be JSON with translations')
    }
    
    // Check for SME-focused content
    const hasSMEContent = !!sampleStrategy.smeTitle && !!sampleStrategy.smeSummary
    addResult('Strategies', 'SME-focused content', 'YES', hasSMEContent ? 'YES' : 'NO', 'Should have smeTitle and smeSummary')
  }
}

async function verifyActionSteps() {
  console.log('\n🎯 Verifying Action Steps...')
  
  const actionStepCount = await prisma.actionStep.count({
    where: { isActive: true }
  })
  addResult('Action Steps', 'Active action steps', 20, actionStepCount, 'Should have at least 20 action steps')
  
  // Check for linked cost items
  const stepsWithCosts = await prisma.actionStepItemCost.count()
  addResult('Action Steps', 'Steps with cost items', 5, stepsWithCosts, 'Should have at least 5 action steps linked to cost items')
  
  // Check for proper timing assignments
  const allSteps = await prisma.actionStep.findMany({
    where: { isActive: true },
    select: { phase: true, executionTiming: true }
  })
  const stepsWithPhase = allSteps.filter(s => s.phase !== null).length
  const stepsWithExecutionTiming = allSteps.filter(s => s.executionTiming !== null).length
  
  addResult('Action Steps', 'Steps with phase assigned', 1, stepsWithPhase, 'Should have at least 1 step with phase')
  addResult('Action Steps', 'Steps with execution timing', 1, stepsWithExecutionTiming, 'Should have at least 1 step with executionTiming')
}

async function verifyParishes() {
  console.log('\n🗺️  Verifying Jamaica Parishes...')
  
  const parishCount = await prisma.parish.count({
    where: { countryCode: 'JM', isActive: true }
  })
  addResult('Parishes', 'Jamaica parishes', 14, parishCount, 'Jamaica should have 14 parishes')
  
  // Check for risk data
  const parishesWithRisk = await prisma.parishRisk.count({
    where: { isActive: true }
  })
  addResult('Parishes', 'Parishes with risk data', 14, parishesWithRisk, 'All parishes should have risk assessments')
  
  // Check specific parish
  const kingston = await prisma.parish.findFirst({
    where: { name: 'Kingston', countryCode: 'JM' },
    include: { parishRisk: true }
  })
  
  if (kingston?.parishRisk) {
    const hasRiskData = kingston.parishRisk.hurricaneLevel > 0 && 
                        kingston.parishRisk.earthquakeLevel > 0
    addResult('Parishes', 'Kingston risk data', 'COMPLETE', hasRiskData ? 'COMPLETE' : 'INCOMPLETE', 'Kingston should have detailed risk data')
  }
}

async function verifyVulnerabilities() {
  console.log('\n⚡ Verifying Business Risk Vulnerabilities...')
  
  const vulnerabilityCount = await prisma.businessRiskVulnerability.count({
    where: { isActive: true }
  })
  addResult('Vulnerabilities', 'Business-hazard mappings', 20, vulnerabilityCount, 'Should have at least 20 vulnerability mappings')
  
  // Check for specific business type
  const restaurant = await prisma.businessType.findUnique({
    where: { businessTypeId: 'restaurant' }
  })
  
  if (restaurant) {
    const restaurantVulns = await prisma.businessRiskVulnerability.count({
      where: { businessTypeId: restaurant.id, isActive: true }
    })
    addResult('Vulnerabilities', 'Restaurant vulnerabilities', 3, restaurantVulns, 'Restaurant should have at least 3 vulnerability mappings')
  }
}

async function displayResults() {
  console.log('\n\n' + '='.repeat(100))
  console.log('📊 VERIFICATION RESULTS')
  console.log('='.repeat(100))
  
  // Group by category
  const categories = [...new Set(results.map(r => r.category))]
  
  let totalTests = 0
  let passedTests = 0
  
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category)
    const categoryPassed = categoryResults.filter(r => r.passed).length
    
    console.log(`\n📌 ${category}: ${categoryPassed}/${categoryResults.length} passed`)
    console.log('─'.repeat(100))
    
    for (const result of categoryResults) {
      const icon = result.passed ? '✅' : '❌'
      const status = result.passed ? 'PASS' : 'FAIL'
      
      console.log(`${icon} ${status}: ${result.test}`)
      console.log(`   Expected: ${result.expected} | Actual: ${result.actual}`)
      if (result.details) {
        console.log(`   ℹ️  ${result.details}`)
      }
      
      totalTests++
      if (result.passed) passedTests++
    }
  }
  
  console.log('\n' + '='.repeat(100))
  console.log(`🎯 OVERALL: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`)
  console.log('='.repeat(100))
  
  if (passedTests === totalTests) {
    console.log('\n✅ 🎉 EXCELLENT! Your database is fully populated and ready to use!')
    console.log('\n🚀 Next steps:')
    console.log('   1. Start dev server: npm run dev')
    console.log('   2. Visit http://localhost:3000/admin2')
    console.log('   3. Visit http://localhost:3000/wizard')
    return 0
  } else if (passedTests / totalTests >= 0.8) {
    console.log('\n⚠️  GOOD! Most data is populated, but some issues detected.')
    console.log('   Review the failed tests above and re-run specific seed scripts if needed.')
    return 1
  } else {
    console.log('\n❌ ISSUES DETECTED! Several tests failed.')
    console.log('   Please run the seeding script again:')
    console.log('   npx tsx scripts/seedDatabaseComplete.ts')
    return 2
  }
}

async function main() {
  console.log('\n' + '='.repeat(100))
  console.log('🔍 DATABASE POPULATION VERIFICATION')
  console.log('='.repeat(100))
  console.log('\nChecking if all seed data was successfully populated...')
  
  try {
    await verifyCountries()
    await verifyBusinessTypes()
    await verifyCostItems()
    await verifyHazards()
    await verifyStrategies()
    await verifyActionSteps()
    await verifyParishes()
    await verifyVulnerabilities()
    
    const exitCode = await displayResults()
    process.exit(exitCode)
  } catch (error) {
    console.error('\n❌ Verification failed with error:')
    console.error(error)
    process.exit(3)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })

