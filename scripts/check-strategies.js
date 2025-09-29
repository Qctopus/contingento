const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkStrategies() {
  try {
    const strategies = await prisma.riskMitigationStrategy.findMany()
    console.log(`Found ${strategies.length} strategies in database:`)
    
    strategies.forEach((strategy, index) => {
      console.log(`${index + 1}. ${strategy.strategyId} - ${strategy.name}`)
    })

    if (strategies.length === 0) {
      console.log('\n❌ No strategies found in database!')
      console.log('   Need to populate strategies first before migrating action steps.')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStrategies()
