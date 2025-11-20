import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Delete Generic Strategies from Database
 * Removes old generic strategies now that we have comprehensive risk-specific ones
 */

async function deleteGenericStrategies() {
  console.log('🧹 Cleaning up generic strategies...\n')

  const genericStrategyIds = [
    'data_backup_comprehensive',
    'emergency_contacts'
  ]

  for (const strategyId of genericStrategyIds) {
    console.log(`Deleting strategy: ${strategyId}`)

    // First delete all action steps associated with this strategy
    const strategy = await prisma.riskMitigationStrategy.findUnique({
      where: { strategyId },
      include: { actionSteps: true }
    })

    if (strategy) {
      // Delete action steps first (due to foreign key constraints)
      const deletedSteps = await prisma.actionStep.deleteMany({
        where: { strategyId: strategy.id }
      })
      console.log(`  ✓ Deleted ${deletedSteps.count} action steps`)

      // Delete strategy item costs
      const deletedItemCosts = await prisma.strategyItemCost.deleteMany({
        where: { strategyId: strategy.id }
      })
      console.log(`  ✓ Deleted ${deletedItemCosts.count} strategy item costs`)

      // Delete the strategy itself
      await prisma.riskMitigationStrategy.delete({
        where: { strategyId }
      })
      console.log(`  ✓ Deleted strategy: ${strategyId}`)
    } else {
      console.log(`  ⚠️ Strategy not found: ${strategyId}`)
    }

    console.log('')
  }

  console.log('✅ Generic strategy cleanup complete!')
  console.log('📊 Summary:')
  console.log('  - Removed: data_backup_comprehensive (replaced by cyber_security_comprehensive)')
  console.log('  - Removed: emergency_contacts (integrated into other strategies)')
  console.log('  - Preserved: All risk-specific strategies (hurricane, flood, power, fire, cyber, earthquake, drought, supply chain)')
}

async function main() {
  try {
    await deleteGenericStrategies()
  } catch (error) {
    console.error('❌ Error deleting generic strategies:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { deleteGenericStrategies }


