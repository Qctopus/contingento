import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStatus() {
  console.log('\n📊 RECOVERY STATUS CHECK\n')
  
  const costItems = await prisma.costItem.count()
  const countries = await prisma.country.count()
  const adminLocations = await prisma.adminLocation.count()
  const countryCostMultipliers = await prisma.countryCostMultiplier.count()
  const adminUnits = await prisma.adminUnit.count()
  const parishes = await prisma.parish.count()
  const businessTypes = await prisma.businessType.count()
  const strategies = await prisma.riskMitigationStrategy.count()
  const actionSteps = await prisma.actionStep.count()
  
  console.log('✅ RECOVERED:')
  if (costItems > 0) console.log(`   💰 Cost Items: ${costItems}`)
  if (adminLocations > 0) console.log(`   🌴 Admin Locations: ${adminLocations}`)
  if (countryCostMultipliers > 0) console.log(`   💱 Country Multipliers: ${countryCostMultipliers}`)
  
  if (parishes > 0) console.log(`   🏝️  Parishes: ${parishes}`)
  if (businessTypes > 0) console.log(`   🏢 Business Types: ${businessTypes}`)
  
  console.log('\n❌ STILL MISSING:')
  if (countries === 0) console.log(`   🌍 Countries table: 0`)
  if (adminUnits === 0) console.log(`   📍 Admin Units: 0`)
  if (strategies === 0) console.log(`   📋 Strategies: 0`)
  if (actionSteps === 0) console.log(`   ✓ Action Steps: 0`)
  
  console.log('\n📈 SUMMARY:')
  console.log(`   Total items recovered: ${costItems + adminLocations + countryCostMultipliers}`)
  console.log(`   Critical missing: Business Types (${businessTypes}), Parishes (${parishes})`)
}

checkStatus()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())

