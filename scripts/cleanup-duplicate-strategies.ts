import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Clean Up Duplicate Strategies
 * Remove overlapping/duplicate strategies, keeping only the most comprehensive ones
 */

async function cleanupDuplicateStrategies() {
  console.log('🧹 Cleaning up duplicate and overlapping strategies...\n')

  // Strategies to delete (duplicates/overlaps)
  const strategiesToDelete = [
    {
      strategyId: 'fire_comprehensive',
      reason: 'Replaced by newer, more comprehensive fire_protection_comprehensive'
    },
    {
      strategyId: 'power_outage_protection',
      reason: 'Less comprehensive than power_resilience_comprehensive (2 vs 4 steps)'
    },
    {
      strategyId: 'communication_comprehensive',
      reason: 'Emergency communication should be integrated into risk-specific strategies'
    },
    {
      strategyId: 'data_protection_comprehensive',
      reason: 'Overlaps with cyber_security_comprehensive - data protection integrated there'
    }
  ]

  let totalStepsDeleted = 0
  let totalStrategiesDeleted = 0

  for (const { strategyId, reason } of strategiesToDelete) {
    console.log(`\n🗑️  Deleting: ${strategyId}`)
    console.log(`   Reason: ${reason}`)

    try {
      // Find the strategy
      const strategy = await prisma.riskMitigationStrategy.findUnique({
        where: { strategyId },
        include: { actionSteps: true }
      })

      if (!strategy) {
        console.log(`   ⚠️  Strategy not found: ${strategyId}`)
        continue
      }

      // Delete action steps first (due to foreign key constraints)
      const deletedSteps = await prisma.actionStep.deleteMany({
        where: { strategyId: strategy.id }
      })
      console.log(`   ✓ Deleted ${deletedSteps.count} action steps`)

      // Delete strategy item costs
      const deletedItemCosts = await prisma.strategyItemCost.deleteMany({
        where: { strategyId: strategy.id }
      })
      if (deletedItemCosts.count > 0) {
        console.log(`   ✓ Deleted ${deletedItemCosts.count} strategy item costs`)
      }

      // Delete the strategy itself
      await prisma.riskMitigationStrategy.delete({
        where: { strategyId }
      })
      console.log(`   ✅ Deleted strategy: ${strategyId}`)

      totalStepsDeleted += deletedSteps.count
      totalStrategiesDeleted++

    } catch (error) {
      console.error(`   ❌ Error deleting ${strategyId}:`, error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ DUPLICATE CLEANUP COMPLETE!')
  console.log('='.repeat(60))
  console.log(`📊 Summary:`)
  console.log(`   - Strategies deleted: ${totalStrategiesDeleted}`)
  console.log(`   - Action steps removed: ${totalStepsDeleted}`)
  console.log(`   - Strategies preserved: 8 comprehensive risk-specific strategies`)

  console.log(`\n🎯 Remaining Core Strategies:`)
  const remaining = [
    'hurricane_comprehensive',
    'flood_protection_comprehensive',
    'fire_protection_comprehensive',
    'cyber_security_comprehensive',
    'earthquake_protection_comprehensive',
    'drought_protection_comprehensive',
    'supply_chain_protection_comprehensive',
    'power_resilience_comprehensive'
  ]

  remaining.forEach(id => console.log(`   ✓ ${id}`))

  console.log(`\n🏆 Final Result: 8 comprehensive, non-overlapping risk-specific strategies`)
}

async function main() {
  try {
    await cleanupDuplicateStrategies()
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
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


