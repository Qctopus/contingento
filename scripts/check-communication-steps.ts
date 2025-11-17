import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const strategy = await prisma.riskMitigationStrategy.findFirst({
    where: { strategyId: 'communication_comprehensive' },
    include: {
      actionSteps: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
  
  if (!strategy) {
    console.log('Strategy not found')
    await prisma.$disconnect()
    return
  }
  
  console.log(`Strategy: ${strategy.strategyId}`)
  console.log(`Action Steps: ${strategy.actionSteps.length}\n`)
  
  strategy.actionSteps.forEach((step, index) => {
    const title = typeof step.title === 'string' ? step.title : JSON.parse(step.title).en || ''
    console.log(`${index + 1}. ${title}`)
    console.log(`   ID: ${step.id}`)
    console.log(`   stepId: ${step.stepId}`)
    console.log(`   phase: ${step.phase}`)
    console.log(`   sortOrder: ${step.sortOrder}`)
    console.log('')
  })
  
  // Check for duplicates by title
  const titleMap = new Map<string, any[]>()
  strategy.actionSteps.forEach(step => {
    const title = typeof step.title === 'string' ? step.title : JSON.parse(step.title).en || ''
    if (!titleMap.has(title)) {
      titleMap.set(title, [])
    }
    titleMap.get(title)!.push(step)
  })
  
  console.log('\nDuplicate titles:')
  for (const [title, steps] of titleMap.entries()) {
    if (steps.length > 1) {
      console.log(`  "${title}": ${steps.length} occurrences`)
      steps.forEach(step => {
        console.log(`    - ID: ${step.id}, stepId: ${step.stepId}, phase: ${step.phase}`)
      })
    }
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)

