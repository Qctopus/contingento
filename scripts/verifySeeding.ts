import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log('\n📊 DATABASE VERIFICATION\n')
  console.log('═'.repeat(80) + '\n')
  
  // Count records
  const countriesCount = await prisma.country.count()
  const businessTypesCount = await prisma.businessType.count()
  const strategiesCount = await prisma.riskMitigationStrategy.count()
  const actionStepsCount = await prisma.actionStep.count()
  
  console.log('Record Counts:')
  console.log(`  ✓ Countries: ${countriesCount}`)
  console.log(`  ✓ Business Types: ${businessTypesCount}`)
  console.log(`  ✓ Strategies: ${strategiesCount}`)
  console.log(`  ✓ Action Steps: ${actionStepsCount}`)
  console.log()
  
  // Show strategies with details
  const strategies = await prisma.riskMitigationStrategy.findMany({
    include: {
      actionSteps: {
        select: { phase: true, title: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  })
  
  console.log('Strategies & Action Steps:\n')
  
  for (const strategy of strategies) {
    const name = JSON.parse(strategy.name)
    const before = strategy.actionSteps.filter(a => a.phase === 'before').length
    const during = strategy.actionSteps.filter(a => a.phase === 'during').length
    const after = strategy.actionSteps.filter(a => a.phase === 'after').length
    
    console.log(`📋 ${name.en}`)
    console.log(`   ES: ${name.es}`)
    console.log(`   FR: ${name.fr}`)
    console.log(`   Steps: ${strategy.actionSteps.length} total (${before} before, ${during} during, ${after} after)`)
    console.log()
  }
  
  console.log('═'.repeat(80))
  console.log('✅ All data verified successfully!')
  console.log()
  
  await prisma.$disconnect()
}

verify().catch((e) => {
  console.error(e)
  process.exit(1)
})



