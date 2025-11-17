import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   FIX DUPLICATE STEPS AND PHASE VALUES                      ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  try {
    // Get all strategies with their action steps
    const strategies = await prisma.riskMitigationStrategy.findMany({
      where: { isActive: true },
      include: {
        actionSteps: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })
    
    let duplicatesRemoved = 0
    let phasesFixed = 0
    
    for (const strategy of strategies) {
      console.log(`\n🛡️  Strategy: ${strategy.strategyId}`)
      
      // Group steps by stepId to find duplicates
      const stepMap = new Map<string, any[]>()
      
      for (const step of strategy.actionSteps) {
        const key = step.stepId || step.id
        if (!stepMap.has(key)) {
          stepMap.set(key, [])
        }
        stepMap.get(key)!.push(step)
      }
      
      // Find and remove duplicates (keep the first one, delete others)
      for (const [stepId, steps] of stepMap.entries()) {
        if (steps.length > 1) {
          console.log(`   ⚠️  Found ${steps.length} duplicates for stepId: ${stepId}`)
          
          // Keep the first one (lowest ID or earliest created)
          const keepStep = steps.sort((a, b) => 
            a.createdAt.getTime() - b.createdAt.getTime()
          )[0]
          
          // Delete the rest
          const deleteSteps = steps.slice(1)
          for (const dupStep of deleteSteps) {
            await prisma.actionStep.update({
              where: { id: dupStep.id },
              data: { isActive: false }
            })
            duplicatesRemoved++
            console.log(`   ✓ Removed duplicate: ${dupStep.id}`)
          }
        }
      }
      
      // Fix phase values - ensure they're before/during/after
      for (const step of strategy.actionSteps) {
        if (!['before', 'during', 'after'].includes(step.phase)) {
          // Map old phases to new ones
          const phaseMap: Record<string, 'before' | 'during' | 'after'> = {
            'immediate': 'before',
            'short_term': 'before',
            'medium_term': 'during',
            'long_term': 'after'
          }
          
          const newPhase = phaseMap[step.phase] || 'before'
          
          await prisma.actionStep.update({
            where: { id: step.id },
            data: { phase: newPhase }
          })
          
          phasesFixed++
          console.log(`   ✓ Fixed phase: ${step.phase} → ${newPhase} (step: ${step.stepId})`)
        }
      }
    }
    
    console.log('\n═'.repeat(65))
    console.log('')
    console.log(`✅ Cleanup complete!`)
    console.log(`   Duplicates removed: ${duplicatesRemoved}`)
    console.log(`   Phases fixed: ${phasesFixed}`)
    console.log('')
    
  } catch (error) {
    console.error('\n❌ Error:')
    console.error(error)
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

