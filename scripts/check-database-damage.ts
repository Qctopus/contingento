import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDamage() {
  console.log('🔍 Checking what data still exists...\n')
  
  const costItems = await prisma.costItem.count()
  const countries = await prisma.country.count()
  const adminUnits = await prisma.adminUnit.count()
  const parishes = await prisma.parish.count()
  const businessTypes = await prisma.businessType.count()
  const strategies = await prisma.riskMitigationStrategy.count()
  const actionSteps = await prisma.actionStep.count()
  
  console.log('Cost Items:', costItems)
  console.log('Countries:', countries)
  console.log('Admin Units:', adminUnits)
  console.log('Parishes:', parishes)
  console.log('Business Types:', businessTypes)
  console.log('Strategies:', strategies)
  console.log('Action Steps:', actionSteps)
  
  if (costItems === 0) {
    console.log('\n❌ OH NO! Cost items were wiped!')
  }
  if (countries === 0) {
    console.log('❌ OH NO! Countries were wiped!')
  }
  if (businessTypes === 0) {
    console.log('❌ OH NO! Business types were wiped!')
  }
}

checkDamage()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())










