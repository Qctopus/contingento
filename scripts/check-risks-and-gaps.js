const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('=== CHECKING RISKS AND STRATEGY COVERAGE ===\n')
  
  // Get all hazard profiles (risks)
  const hazards = await prisma.hazardProfile.findMany({
    select: {
      hazardId: true,
      name: true
    },
    orderBy: { hazardId: 'asc' }
  })
  
  console.log('📊 RISKS IN DATABASE:')
  hazards.forEach(h => {
    const name = typeof h.name === 'string' ? h.name : JSON.parse(h.name).en || JSON.parse(h.name)
    console.log(`  - ${h.hazardId}: ${name}`)
  })
  
  // Get all strategies
  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      name: true,
      applicableRisks: true,
      smeTitle: true
    },
    orderBy: { strategyId: 'asc' }
  })
  
  console.log('\n📋 EXISTING STRATEGIES:')
  strategies.forEach(s => {
    const risks = s.applicableRisks ? JSON.parse(s.applicableRisks) : []
    const name = s.smeTitle || (typeof s.name === 'string' ? s.name : JSON.parse(s.name).en)
    console.log(`  - ${s.strategyId}`)
    console.log(`    Title: ${name}`)
    console.log(`    Covers: ${risks.join(', ') || 'none'}`)
  })
  
  // Identify gaps
  const hazardIds = hazards.map(h => h.hazardId)
  const coveredRisks = new Set()
  strategies.forEach(s => {
    const risks = s.applicableRisks ? JSON.parse(s.applicableRisks) : []
    risks.forEach(r => coveredRisks.add(r))
  })
  
  const uncoveredRisks = hazardIds.filter(h => !coveredRisks.has(h))
  
  console.log('\n🔍 COVERAGE ANALYSIS:')
  console.log(`  Total Risks: ${hazardIds.length}`)
  console.log(`  Covered: ${coveredRisks.size}`)
  console.log(`  Uncovered: ${uncoveredRisks.length}`)
  
  if (uncoveredRisks.length > 0) {
    console.log('\n⚠️ RISKS WITHOUT STRATEGIES:')
    uncoveredRisks.forEach(r => {
      const hazard = hazards.find(h => h.hazardId === r)
      const name = typeof hazard.name === 'string' ? hazard.name : JSON.parse(hazard.name).en
      console.log(`  - ${r}: ${name}`)
    })
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)


