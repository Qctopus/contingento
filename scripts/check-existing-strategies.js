import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📋 Checking existing strategies in database...\n')
  
  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      id: true,
      strategyId: true,
      name: true,
      category: true,
      _count: {
        select: { actionSteps: true }
      }
    },
    orderBy: { strategyId: 'asc' }
  })
  
  if (strategies.length === 0) {
    console.log('⚠️  No strategies found in database!')
    console.log('\n💡 You need to run a population script to create base strategies first.')
    return
  }
  
  console.log(`Found ${strategies.length} strategies:\n`)
  
  for (const strategy of strategies) {
    console.log(`✓ ${strategy.strategyId}`)
    console.log(`  Name: ${strategy.name}`)
    console.log(`  Category: ${strategy.category}`)
    console.log(`  Action Steps: ${strategy._count.actionSteps}`)
    console.log()
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


