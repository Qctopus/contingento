import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPriorityTiers() {
  console.log('🏷️ Checking Strategy Priority Tiers...\n')

  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      priorityTier: true,
      name: true
    }
  })

  const byTier: { [key: string]: any[] } = {}

  strategies.forEach(strategy => {
    const tier = strategy.priorityTier || 'none'
    if (!byTier[tier]) byTier[tier] = []
    byTier[tier].push(strategy)
  })

  console.log('📊 Strategies by Priority Tier:')
  Object.entries(byTier).forEach(([tier, strategies]) => {
    console.log(`\n${tier.toUpperCase()} (${strategies.length} strategies):`)
    strategies.forEach(strategy => {
      const name = JSON.parse(strategy.name as string)?.en || 'Unknown'
      console.log(`   • ${strategy.strategyId}: ${name}`)
    })
  })

  console.log(`\n🎯 KEY INSIGHT:`)
  console.log(`   The wizard auto-selects "essential" + "recommended" strategies`)
  console.log(`   User sees: ${byTier.essential?.length || 0} essential + ${byTier.recommended?.length || 0} recommended = ${(byTier.essential?.length || 0) + (byTier.recommended?.length || 0)} auto-selected`)

  if ((byTier.essential?.length || 0) + (byTier.recommended?.length || 0) === 3) {
    console.log(`\n✅ FOUND THE ISSUE: Only 3 strategies are auto-selected!`)
    console.log(`   Essential: ${byTier.essential?.length || 0}`)
    console.log(`   Recommended: ${byTier.recommended?.length || 0}`)
    console.log(`   Total auto-selected: 3`)
  }
}

async function main() {
  try {
    await checkPriorityTiers()
  } catch (error) {
    console.error('❌ Error checking priority tiers:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}


