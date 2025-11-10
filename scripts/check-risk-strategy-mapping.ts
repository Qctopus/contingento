/**
 * Check Risk-Strategy Mapping
 * Verifies that strategies have applicableRisks that match common risk types
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const COMMON_RISK_TYPES = [
  'hurricane',
  'tropical storm',
  'power outage',
  'electricity',
  'cyber',
  'cyber attack',
  'ransomware',
  'supply chain',
  'supply',
  'water',
  'water contamination',
  'earthquake',
  'flood',
  'fire'
]

async function checkMapping() {
  console.log('🔍 RISK-STRATEGY MAPPING CHECK')
  console.log('='.repeat(70))
  console.log()

  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: { isActive: true },
    select: {
      id: true,
      strategyId: true,
      name: true,
      smeTitle: true,
      category: true,
      selectionTier: true,
      applicableRisks: true
    }
  })

  console.log(`📊 Found ${strategies.length} active strategies\n`)

  // Parse applicableRisks and show mappings
  for (const strategy of strategies) {
    let applicableRisks: string[] = []
    try {
      applicableRisks = JSON.parse(strategy.applicableRisks)
    } catch {
      console.warn(`⚠️  Could not parse applicableRisks for ${strategy.strategyId}:`, strategy.applicableRisks)
      continue
    }

    const name = typeof strategy.smeTitle === 'string' 
      ? strategy.smeTitle 
      : JSON.parse(strategy.smeTitle || '{}').en || strategy.name

    console.log(`📋 ${name}`)
    console.log(`   ID: ${strategy.strategyId}`)
    console.log(`   Category: ${strategy.category}`)
    console.log(`   Tier: ${strategy.selectionTier}`)
    console.log(`   Applicable Risks: ${applicableRisks.join(', ')}`)
    
    // Check which common risks this strategy matches
    const matches = COMMON_RISK_TYPES.filter(riskType => 
      applicableRisks.some(ar => {
        const arNorm = ar.toLowerCase().replace(/_/g, ' ')
        const riskNorm = riskType.toLowerCase()
        return arNorm.includes(riskNorm) || riskNorm.includes(arNorm)
      })
    )
    
    if (matches.length > 0) {
      console.log(`   ✅ Matches: ${matches.join(', ')}`)
    } else {
      console.log(`   ⚠️  No matches with common risk types`)
    }
    console.log()
  }

  // Reverse check: For each common risk, which strategies apply?
  console.log('\n' + '='.repeat(70))
  console.log('📊 REVERSE CHECK: Which strategies apply to common risks?')
  console.log('='.repeat(70))
  console.log()

  for (const riskType of COMMON_RISK_TYPES) {
    const matchingStrategies = strategies.filter(s => {
      let applicableRisks: string[] = []
      try {
        applicableRisks = JSON.parse(s.applicableRisks)
      } catch {
        return false
      }

      return applicableRisks.some(ar => {
        const arNorm = ar.toLowerCase().replace(/_/g, ' ')
        const riskNorm = riskType.toLowerCase()
        return arNorm.includes(riskNorm) || riskNorm.includes(arNorm) || arNorm === riskNorm
      })
    })

    console.log(`🌊 ${riskType}`)
    if (matchingStrategies.length > 0) {
      console.log(`   ✅ ${matchingStrategies.length} strategies:`)
      matchingStrategies.forEach(s => {
        const name = typeof s.smeTitle === 'string' 
          ? s.smeTitle 
          : JSON.parse(s.smeTitle || '{}').en || s.name
        console.log(`      - ${name} (${s.category})`)
      })
    } else {
      console.log(`   ❌ No strategies found`)
    }
    console.log()
  }

  await prisma.$disconnect()
}

checkMapping()
  .then(() => {
    console.log('\n✨ Check complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

