import { PrismaClient } from '@prisma/client'
import { seedCaribbeanCountries } from './seedCaribbeanCountries'
import { seedBusinessTypes } from './seedBusinessTypes'
import { seedPremiumStrategies } from './seedPremiumStrategies'
import { seedPremiumActionSteps } from './seedPremiumActionStepsClean'

const prisma = new PrismaClient()

async function seedFreshComplete() {
  console.log('\n' + '═'.repeat(80))
  console.log('🌟  CONTINGENTO - FRESH DATABASE SEEDING  🌟')
  console.log('Caribbean Business Continuity Planning Tool')
  console.log('═'.repeat(80) + '\n')
  
  try {
    // Step 1: Countries and Currency
    console.log('📍 Step 1/4: Caribbean Countries & Currency Multipliers')
    console.log('─'.repeat(80))
    await seedCaribbeanCountries()
    console.log()
    
    // Step 2: Business Types
    console.log('\n📍 Step 2/4: Business Types')
    console.log('─'.repeat(80))
    await seedBusinessTypes()
    console.log()
    
    // Step 3: Premium Strategies
    console.log('\n📍 Step 3/4: Premium BCP Strategies')
    console.log('─'.repeat(80))
    await seedPremiumStrategies()
    console.log()
    
    // Step 4: Action Steps
    console.log('\n📍 Step 4/4: Action Steps with Timing & Costs')
    console.log('─'.repeat(80))
    await seedPremiumActionSteps()
    console.log()
    
    // Final Summary
    console.log('\n' + '═'.repeat(80))
    console.log('✅  DATABASE SEEDING COMPLETE!')
    console.log('═'.repeat(80) + '\n')
    
    // Get counts
    const countriesCount = await prisma.country.count()
    const businessTypesCount = await prisma.businessType.count()
    const strategiesCount = await prisma.riskMitigationStrategy.count()
    const actionStepsCount = await prisma.actionStep.count()
    
    console.log('📊 Database Summary:')
    console.log(`   ✓ ${countriesCount} Caribbean Countries`)
    console.log(`   ✓ ${businessTypesCount} Business Types`)
    console.log(`   ✓ ${strategiesCount} Premium Strategies (multilingual)`)
    console.log(`   ✓ ${actionStepsCount} Action Steps with costs & timing`)
    console.log()
    console.log('🌍 Languages: English, Spanish, French')
    console.log('💰 Currency: All costs in USD with local currency conversion')
    console.log('⏱️  Timing: All action steps have estimated minutes')
    console.log()
    console.log('🚀 Your BCP tool is ready to use!')
    console.log()
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run
seedFreshComplete()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

