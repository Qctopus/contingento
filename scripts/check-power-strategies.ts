import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPowerStrategies() {
  console.log('⚡ Checking all power-related strategies...\n')
  
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: {
      OR: [
        { strategyId: { contains: 'power' } },
        { smeTitle: { contains: 'Power' } },
        { smeSummary: { contains: 'power' } },
        { applicableRisks: { contains: 'power' } },
        { applicableRisks: { contains: 'Power' } }
      ]
    },
    select: {
      id: true,
      strategyId: true,
      smeTitle: true,
      smeSummary: true,
      applicableRisks: true,
      primaryRisk: true,
      secondaryRisks: true,
      selectionTier: true,
      isActive: true
    }
  })
  
  console.log(`Found ${strategies.length} power-related strategies:\n`)
  
  strategies.forEach((strategy, index) => {
    console.log(`${index + 1}. ${strategy.strategyId}`)
    console.log(`   ID: ${strategy.id}`)
    
    // Parse smeTitle
    try {
      const title = JSON.parse(strategy.smeTitle || '{}')
      console.log(`   Title: ${title.en || '(no title)'}`)
    } catch (e) {
      console.log(`   Title: ${strategy.smeTitle || '(no title)'}`)
    }
    
    // Parse applicableRisks
    try {
      const risks = JSON.parse(strategy.applicableRisks || '[]')
      console.log(`   Applicable Risks: [${risks.join(', ')}]`)
    } catch (e) {
      console.log(`   Applicable Risks: ${strategy.applicableRisks}`)
    }
    
    console.log(`   Primary Risk: ${strategy.primaryRisk || '(not set)'}`)
    
    // Parse secondaryRisks
    if (strategy.secondaryRisks) {
      try {
        const secondary = JSON.parse(strategy.secondaryRisks)
        console.log(`   Secondary Risks: [${secondary.join(', ')}]`)
      } catch (e) {
        console.log(`   Secondary Risks: ${strategy.secondaryRisks}`)
      }
    } else {
      console.log(`   Secondary Risks: (not set)`)
    }
    
    console.log(`   Tier: ${strategy.selectionTier}`)
    console.log(`   Active: ${strategy.isActive}`)
    console.log()
  })
  
  console.log('━'.repeat(80))
  console.log('\n💡 Recommendation:')
  console.log('If you see multiple strategies showing under "Power Outage" in wizard:')
  console.log('  1. Check their primaryRisk field')
  console.log('  2. Only ONE should have primaryRisk: "powerOutage" or "PowerOutage"')
  console.log('  3. Others should have different primaryRisk values')
  console.log('  4. Run migration script if primaryRisk is not set:')
  console.log('     npx tsx scripts/migrate-primary-secondary-risks.ts')
}

async function main() {
  try {
    await checkPowerStrategies()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()




