import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugBusinessTypeFiltering() {
  console.log('🏢 Debugging Business Type Filtering...\n')

  // Test with a common business type
  const testBusinessTypeId = 'retail'
  const testBusinessCategory = 'retail'

  console.log(`Testing with business type: ${testBusinessTypeId} (${testBusinessCategory})`)

  // Get all strategies
  const allStrategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      name: true,
      applicableBusinessTypes: true,
      applicableRisks: true
    }
  })

  console.log(`\n📊 Total strategies: ${allStrategies.length}`)

  // Filter by business type (same logic as API)
  const businessTypeFiltered = allStrategies.filter((strategy: any) => {
    let applicableBusinessTypes: string[] = []
    try {
      applicableBusinessTypes = JSON.parse(strategy.applicableBusinessTypes || '[]')
    } catch (e) {
      console.warn(`⚠️ Failed to parse applicableBusinessTypes for ${strategy.strategyId}:`, e)
      applicableBusinessTypes = []
    }

    // Check if strategy matches business type
    const matchesBusinessType =
      applicableBusinessTypes.length === 0 || // Empty array means "all"
      applicableBusinessTypes.includes('all') ||
      applicableBusinessTypes.includes(testBusinessTypeId) ||
      applicableBusinessTypes.includes(testBusinessCategory) ||
      applicableBusinessTypes.some((bt: string) => bt === null || bt === '')

    return matchesBusinessType
  })

  console.log(`\n✅ After business type filtering: ${businessTypeFiltered.length} strategies`)

  // Show which strategies were filtered out
  const filteredOut = allStrategies.filter(s => !businessTypeFiltered.find(bs => bs.strategyId === s.strategyId))

  if (filteredOut.length > 0) {
    console.log(`\n❌ ${filteredOut.length} strategies filtered out by business type:`)
    filteredOut.forEach(strategy => {
      const businessTypes = JSON.parse(strategy.applicableBusinessTypes || '[]')
      console.log(`   ✗ ${strategy.strategyId}: ${businessTypes.join(', ')}`)
    })
  }

  // Now test risk filtering on the business-type-filtered strategies
  const userSelectedRisks = [
    'fire', 'pandemic', 'drought', 'flood', 'earthquake',
    'cyber_attack', 'theft', 'chemical_spill', 'hurricane', 'supply_chain_disruption'
  ]

  console.log(`\n🎯 Testing risk filtering on ${businessTypeFiltered.length} business-type-matched strategies...`)
  console.log(`User selected risks: ${userSelectedRisks.join(', ')}`)

  // Create risk variants
  const allRiskVariants = new Set<string>()
  userSelectedRisks.forEach(risk => {
    allRiskVariants.add(risk)
    allRiskVariants.add(risk.toLowerCase())
    allRiskVariants.add(risk.replace(/[_-]/g, ''))
    allRiskVariants.add(risk.replace(/[_-]/g, '_'))
  })

  // Filter by risks
  const finalFilteredStrategies = businessTypeFiltered.filter((strategy: any) => {
    let applicableRisks: string[] = []
    try {
      applicableRisks = JSON.parse(strategy.applicableRisks || '[]')
    } catch (e) {
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

  console.log(`\n🎯 FINAL RESULT: ${finalFilteredStrategies.length} strategies match both business type AND user risks`)

  finalFilteredStrategies.forEach((strategy, index) => {
    const name = JSON.parse(strategy.name || '{}').en || 'Unknown'
    const businessTypes = JSON.parse(strategy.applicableBusinessTypes || '[]')
    const applicableRisks = JSON.parse(strategy.applicableRisks || '[]')

    console.log(`\n${index + 1}. ${strategy.strategyId}`)
    console.log(`   Name: ${name}`)
    console.log(`   Business Types: ${businessTypes.join(', ') || 'All'}`)
    console.log(`   Applicable Risks: ${applicableRisks.join(', ')}`)

    // Show which user risks matched
    const matchingUserRisks = applicableRisks.filter((risk: string) =>
      userSelectedRisks.some(userRisk =>
        risk.toLowerCase() === userRisk.toLowerCase() ||
        risk.replace(/[_-]/g, '') === userRisk.replace(/[_-]/g, '')
      )
    )
    console.log(`   Matches User Risks: ${matchingUserRisks.join(', ')}`)
  })

  console.log(`\n📋 COMPARISON:`)
  console.log(`   Without business type filter: 10 strategies`)
  console.log(`   With business type filter: ${finalFilteredStrategies.length} strategies`)
  console.log(`   Business type filtered out: ${allStrategies.length - businessTypeFiltered.length} strategies`)

  if (finalFilteredStrategies.length <= 3) {
    console.log(`\n🚨 ISSUE FOUND: Only ${finalFilteredStrategies.length} strategies shown!`)
    console.log('   This matches the user\'s report of getting only 3 strategies.')
  }
}

async function main() {
  try {
    await debugBusinessTypeFiltering()
  } catch (error) {
    console.error('❌ Error debugging business type filtering:', error)
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


