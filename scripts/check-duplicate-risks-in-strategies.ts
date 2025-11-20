import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDuplicateRisks() {
  console.log('🔍 Checking for strategies with duplicate risks in applicableRisks...\n')
  
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: { isActive: true },
    select: {
      id: true,
      strategyId: true,
      smeTitle: true,
      applicableRisks: true
    }
  })
  
  const problematicStrategies: any[] = []
  
  strategies.forEach((strategy) => {
    try {
      const risks = JSON.parse(strategy.applicableRisks || '[]')
      const uniqueRisks = [...new Set(risks)]
      
      if (risks.length !== uniqueRisks.length) {
        // Has duplicates!
        const title = JSON.parse(strategy.smeTitle || '{}')
        problematicStrategies.push({
          strategyId: strategy.strategyId,
          title: title.en || strategy.strategyId,
          risks: risks,
          uniqueRisks: uniqueRisks,
          duplicates: risks.filter((r: string, i: number) => risks.indexOf(r) !== i)
        })
      }
    } catch (e) {
      console.log(`   ⚠️  Could not parse risks for ${strategy.strategyId}`)
    }
  })
  
  if (problematicStrategies.length === 0) {
    console.log('✅ No strategies with duplicate risks found!')
    return
  }
  
  console.log(`❌ Found ${problematicStrategies.length} strategies with duplicate risks:\n`)
  
  problematicStrategies.forEach((s, i) => {
    console.log(`${i + 1}. ${s.strategyId}`)
    console.log(`   Title: ${s.title}`)
    console.log(`   Risks: [${s.risks.join(', ')}]`)
    console.log(`   Duplicates: [${s.duplicates.join(', ')}]`)
    console.log(`   Should be: [${s.uniqueRisks.join(', ')}]`)
    console.log()
  })
  
  console.log('🔧 Fix: Run the deduplication script to clean these up')
}

async function main() {
  try {
    await checkDuplicateRisks()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()




