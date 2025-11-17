import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   RESTORE BETTER HURRICANE ACTION STEPS                      ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  try {
    const strategy = await prisma.riskMitigationStrategy.findFirst({
      where: { strategyId: 'hurricane_comprehensive' }
    })
    
    if (!strategy) {
      console.log('Strategy not found')
      await prisma.$disconnect()
      return
    }
    
    // Find the better steps (with hurricane_step_XX stepIds) that were deactivated
    const betterSteps = await prisma.actionStep.findMany({
      where: {
        strategyId: strategy.id,
        stepId: {
          in: ['hurricane_step_01_inventory', 'hurricane_step_02_shutters', 'hurricane_step_03_elevate']
        }
      }
    })
    
    console.log(`Found ${betterSteps.length} better steps to restore\n`)
    
    // Reactivate the better steps
    for (const step of betterSteps) {
      await prisma.actionStep.update({
        where: { id: step.id },
        data: { isActive: true }
      })
      console.log(`✓ Restored: ${step.stepId}`)
    }
    
    // Deactivate the older duplicate steps
    const oldSteps = await prisma.actionStep.findMany({
      where: {
        strategyId: strategy.id,
        stepId: {
          in: ['hurr_before_1', 'hurr_before_2', 'hurr_before_3']
        },
        isActive: true
      }
    })
    
    console.log(`\nDeactivating ${oldSteps.length} older duplicate steps\n`)
    
    for (const step of oldSteps) {
      await prisma.actionStep.update({
        where: { id: step.id },
        data: { isActive: false }
      })
      console.log(`✗ Deactivated: ${step.stepId}`)
    }
    
    console.log('\n✅ Done! Better steps restored.')
    
    // Show final count
    const finalSteps = await prisma.actionStep.findMany({
      where: {
        strategyId: strategy.id,
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    })
    
    console.log(`\n📋 Final active steps: ${finalSteps.length}`)
    
  } catch (error) {
    console.error('\n❌ Error:')
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)




