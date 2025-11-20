import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugUserRiskSelection() {
  console.log('🔍 Debugging User Risk Selection & Strategy Matching...\n')

  // User's selected risks (what they might have chosen)
  const userSelectedRisks = [
    'fire',           // Should match fire_protection_comprehensive
    'pandemic',       // Should match supply_chain_protection_comprehensive
    'drought',        // Should match drought_protection_comprehensive
    'flood',          // Should match flood_protection_comprehensive
    'earthquake',     // Should match earthquake_protection_comprehensive
    'cyber_attack',   // Should match cyber_security_comprehensive
    'theft',          // Should match theft_protection_comprehensive
    'chemical_spill', // Should match chemical_hazard_protection
    'hurricane',      // Should match hurricane_comprehensive
    'supply_chain_disruption' // Should match supply_chain_protection_comprehensive
  ]

  console.log(`User selected ${userSelectedRisks.length} risks:`)
  userSelectedRisks.forEach((risk, i) => console.log(`  ${i + 1}. ${risk}`))

  // Get all strategies
  const allStrategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      name: true,
      applicableRisks: true
    }
  })

  console.log(`\n📊 Found ${allStrategies.length} total strategies in database`)

  // Simulate the API filtering logic
  const allRiskVariants = new Set<string>()

  // Create risk variants (normalize for comparison)
  userSelectedRisks.forEach(risk => {
    allRiskVariants.add(risk)
    allRiskVariants.add(risk.toLowerCase())
    allRiskVariants.add(risk.replace(/[_-]/g, ''))
    allRiskVariants.add(risk.replace(/[_-]/g, '_'))
  })

  console.log(`\n🔄 Risk variants for matching: ${Array.from(allRiskVariants).join(', ')}`)

  // Filter strategies using the same logic as the API
  const filteredStrategies = allStrategies.filter((strategy: any) => {
    // Parse applicableRisks JSON array
    let applicableRisks: string[] = []
    try {
      applicableRisks = JSON.parse(strategy.applicableRisks || '[]')
    } catch (e) {
      console.warn(`⚠️ Failed to parse applicableRisks for ${strategy.strategyId}:`, e)
      applicableRisks = []
    }

    // Check if strategy matches ANY of the user's risks
    const matchesRisk = applicableRisks.some((appRisk: string) => {
      if (!appRisk) return false
      const normalizedAppRisk = appRisk.toLowerCase().replace(/[_-]/g, '')
      return Array.from(allRiskVariants).some(variant => {
        const normalizedVariant = variant.toLowerCase().replace(/[_-]/g, '')
        return normalizedAppRisk === normalizedVariant ||
               appRisk.toLowerCase() === variant.toLowerCase() ||
               appRisk === variant
      })
    })

    return matchesRisk
  })

  console.log(`\n✅ FILTERED RESULT: ${filteredStrategies.length} strategies match user's ${userSelectedRisks.length} selected risks\n`)

  filteredStrategies.forEach((strategy, index) => {
    const applicableRisks = JSON.parse(strategy.applicableRisks || '[]')
    const name = JSON.parse(strategy.name || '{}').en || 'Unknown'

    console.log(`${index + 1}. ${strategy.strategyId}`)
    console.log(`   Name: ${name}`)
    console.log(`   Applicable Risks: ${applicableRisks.join(', ')}`)

    // Show which user risks matched this strategy
    const matchingUserRisks = applicableRisks.filter((risk: string) =>
      userSelectedRisks.some(userRisk =>
        risk.toLowerCase() === userRisk.toLowerCase() ||
        risk.replace(/[_-]/g, '') === userRisk.replace(/[_-]/g, '')
      )
    )
    console.log(`   Matches User Risks: ${matchingUserRisks.join(', ')}`)
    console.log('')
  })

  // Check if any user risks have no matches
  const unmatchedUserRisks = userSelectedRisks.filter(userRisk => {
    return !filteredStrategies.some(strategy => {
      const applicableRisks = JSON.parse(strategy.applicableRisks || '[]')
      return applicableRisks.some((risk: string) =>
        risk.toLowerCase() === userRisk.toLowerCase() ||
        risk.replace(/[_-]/g, '') === userRisk.replace(/[_-]/g, '')
      )
    })
  })

  if (unmatchedUserRisks.length > 0) {
    console.log(`❌ ${unmatchedUserRisks.length} USER RISKS HAVE NO MATCHING STRATEGIES:`)
    unmatchedUserRisks.forEach(risk => console.log(`   ✗ ${risk}`))
  } else {
    console.log('✅ All user-selected risks have matching strategies!')
  }

  console.log(`\n📋 SUMMARY:`)
  console.log(`   User selected: ${userSelectedRisks.length} risks`)
  console.log(`   Strategies shown: ${filteredStrategies.length}`)
  console.log(`   Average strategies per risk: ${(filteredStrategies.length / userSelectedRisks.length).toFixed(1)}`)

  if (filteredStrategies.length !== userSelectedRisks.length && filteredStrategies.length < 5) {
    console.log(`\n🚨 ISSUE DETECTED: User gets only ${filteredStrategies.length} strategies for ${userSelectedRisks.length} risks!`)
    console.log('   This matches the user\'s complaint.')
  }
}

async function main() {
  try {
    await debugUserRiskSelection()
  } catch (error) {
    console.error('❌ Error debugging user risk selection:', error)
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


