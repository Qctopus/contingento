import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditStrategyRiskCoverage() {
  console.log('🔍 AUDIT: Strategy Risk Coverage\n')
  console.log('=' .repeat(80))
  
  // Get all active strategies
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: { isActive: true },
    select: {
      strategyId: true,
      smeTitle: true,
      applicableRisks: true,
      selectionTier: true
    },
    orderBy: { strategyId: 'asc' }
  })
  
  console.log(`\n📊 Found ${strategies.length} active strategies\n`)
  
  // Build a map of risk -> strategies
  const riskToStrategies: Record<string, string[]> = {}
  
  strategies.forEach(strategy => {
    try {
      const risks = JSON.parse(strategy.applicableRisks || '[]')
      const title = JSON.parse(strategy.smeTitle || '{}')
      const titleEn = title.en || strategy.strategyId
      
      risks.forEach((risk: string) => {
        if (!riskToStrategies[risk]) {
          riskToStrategies[risk] = []
        }
        riskToStrategies[risk].push(`${strategy.strategyId} (${titleEn})`)
      })
    } catch (e) {
      console.log(`   ⚠️  Error parsing ${strategy.strategyId}`)
    }
  })
  
  // Sort risks by number of strategies (descending)
  const sortedRisks = Object.entries(riskToStrategies)
    .sort((a, b) => b[1].length - a[1].length)
  
  console.log('\n📋 RISK COVERAGE REPORT:\n')
  console.log('Risk ID'.padEnd(40) + 'Strategy Count')
  console.log('-'.repeat(80))
  
  sortedRisks.forEach(([risk, strats]) => {
    console.log(`${risk.padEnd(40)}${strats.length} strategies`)
  })
  
  console.log('\n' + '='.repeat(80))
  console.log('\n🔍 DETAILED BREAKDOWN:\n')
  
  sortedRisks.forEach(([risk, strats]) => {
    console.log(`\n🛡️  ${risk} (${strats.length} strategies):`)
    strats.forEach((strat, i) => {
      console.log(`   ${i + 1}. ${strat}`)
    })
  })
  
  // Find risks with NO strategies
  console.log('\n' + '='.repeat(80))
  console.log('\n⚠️  COMMON RISKS WITH NO STRATEGIES:\n')
  
  const commonRisks = [
    'fire', 'Fire',
    'cyberAttack', 'cyber_attack', 'CyberAttack',
    'theft', 'crime', 'Crime',
    'earthquake', 'Earthquake',
    'drought', 'Drought',
    'powerOutage', 'power_outage', 'PowerOutage',
    'supplyChainDisruption', 'supply_chain_disruption',
    'pandemic', 'pandemicDisease', 'Pandemic'
  ]
  
  const missingRisks: string[] = []
  commonRisks.forEach(risk => {
    if (!riskToStrategies[risk]) {
      missingRisks.push(risk)
    }
  })
  
  if (missingRisks.length > 0) {
    console.log('These common risks have NO strategies assigned:')
    missingRisks.forEach(risk => {
      console.log(`   ❌ ${risk}`)
    })
  } else {
    console.log('✅ All common risks have strategies!')
  }
  
  // Check for strategies with NO risks
  console.log('\n' + '='.repeat(80))
  console.log('\n⚠️  STRATEGIES WITH NO RISKS:\n')
  
  const strategiesWithNoRisks = strategies.filter(s => {
    try {
      const risks = JSON.parse(s.applicableRisks || '[]')
      return risks.length === 0
    } catch {
      return true
    }
  })
  
  if (strategiesWithNoRisks.length > 0) {
    console.log(`Found ${strategiesWithNoRisks.length} strategies with no risks assigned:`)
    strategiesWithNoRisks.forEach(s => {
      try {
        const title = JSON.parse(s.smeTitle || '{}')
        console.log(`   ❌ ${s.strategyId}: ${title.en || '(no title)'}`)
      } catch {
        console.log(`   ❌ ${s.strategyId}`)
      }
    })
  } else {
    console.log('✅ All strategies have risks assigned!')
  }
}

async function main() {
  try {
    await auditStrategyRiskCoverage()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()




