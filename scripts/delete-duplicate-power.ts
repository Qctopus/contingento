import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Delete Duplicate Power Strategy
 * Remove the shorter power_outage_protection strategy, keep the comprehensive power_resilience_comprehensive
 */

async function deleteDuplicatePowerStrategy() {
  console.log('⚡ Deleting Duplicate Power Strategy...\n')

  const strategyToDelete = 'power_outage_protection'
  const strategyToKeep = 'power_resilience_comprehensive'

  console.log(`🗑️  Deleting: ${strategyToDelete}`)
  console.log(`✅ Keeping: ${strategyToKeep}\n`)

  try {
    // Find the strategy to delete
    const strategy = await prisma.riskMitigationStrategy.findUnique({
      where: { strategyId: strategyToDelete },
      include: { actionSteps: true }
    })

    if (!strategy) {
      console.log(`   ⚠️  Strategy ${strategyToDelete} not found`)
      return
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
      where: { strategyId: strategyToDelete }
    })
    console.log(`   ✅ Deleted strategy: ${strategyToDelete}`)

    console.log(`\n📊 Cleanup Complete:`)
    console.log(`   - Deleted: ${strategyToDelete} (${deletedSteps.count} action steps)`)
    console.log(`   - Kept: ${strategyToKeep} (4 action steps - more comprehensive)`)

  } catch (error) {
    console.error(`   ❌ Error deleting ${strategyToDelete}:`, error)
    throw error
  }
}

async function main() {
  try {
    await deleteDuplicatePowerStrategy()
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

