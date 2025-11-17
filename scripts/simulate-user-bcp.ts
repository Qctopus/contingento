import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simulate the workbook matching logic exactly
function parseApplicableRisks(applicableRisks: any): string[] {
  if (!applicableRisks) return []

  try {
    if (typeof applicableRisks === 'string') {
      return JSON.parse(applicableRisks)
    }
    return applicableRisks
  } catch {
    return []
  }
}

function normalizeRiskIdentifier(id: string): string {
  if (!id) return ''
  return id.toString()
    .toLowerCase()
    .replace(/[_\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .trim()
}

async function simulateUserBCP() {
  console.log('🎯 Simulating User BCP: 11 Risks Selected\n')

  // Simulate a typical BCP with 11 selected risks
  const userSelectedRisks = [
    { hazardId: 'hurricane', hazardName: 'Hurricane' },
    { hazardId: 'flood', hazardName: 'Flood' },
    { hazardId: 'earthquake', hazardName: 'Earthquake' },
    { hazardId: 'fire', hazardName: 'Fire' },
    { hazardId: 'power_outage', hazardName: 'Power Outage' },
    { hazardId: 'cyber_attack', hazardName: 'Cyber Attack' },
    { hazardId: 'drought', hazardName: 'Drought' },
    { hazardId: 'supply_chain_disruption', hazardName: 'Supply Chain Disruption' },
    { hazardId: 'pandemic', hazardName: 'Pandemic' },
    { hazardId: 'theft', hazardName: 'Theft' },
    { hazardId: 'chemical_spill', hazardName: 'Chemical Spill' },
    { hazardId: 'economic_downturn', hazardName: 'Economic Downturn' },
    { hazardId: 'civil_unrest', hazardName: 'Civil Unrest' }
  ]

  console.log(`User selected ${userSelectedRisks.length} risks:`)
  userSelectedRisks.forEach((risk, i) => {
    console.log(`  ${i + 1}. ${risk.hazardName}`)
  })

  console.log('\n' + '='.repeat(80))
  console.log('📋 WORKBOOK SIMULATION: Strategies per Risk')
  console.log('='.repeat(80))

  // Get risk-specific strategies
  const allStrategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      name: true,
      applicableRisks: true,
      _count: { select: { actionSteps: true } }
    }
  })

  const riskSpecificStrategies = allStrategies.filter(s => {
    const applicableRisks = parseApplicableRisks(s.applicableRisks)
    return applicableRisks.length > 0 && !applicableRisks.includes('all_hazards')
  })

  let totalStrategiesShown = 0

  // Process each user-selected risk
  userSelectedRisks.forEach((risk, riskIndex) => {
    console.log(`\n🎯 RISK ${riskIndex + 1}: ${risk.hazardName} (${risk.hazardId})`)
    console.log('-'.repeat(50))

    // Reset seen strategies for each risk (allow strategies to show under multiple risks)
    const seenStrategyIds = new Set<string>()

    const hazardId = risk.hazardId
    const hazardName = risk.hazardName

    // Find strategies that apply to this risk (same logic as workbook)
    const matchingStrategies = riskSpecificStrategies.filter(s => {
      const applicableRisks = parseApplicableRisks(s.applicableRisks)

      // Skip generic strategies
      if (applicableRisks.length === 0 || applicableRisks.includes('all_hazards')) return false

      // Normalize identifiers for comparison
      const hazardIdNorm = normalizeRiskIdentifier(hazardId || '')
      const hazardNameNorm = normalizeRiskIdentifier(hazardName || '')

      // Check if this strategy matches this risk
      const matchesThisRisk = applicableRisks.some((riskId: string) => {
        const riskIdNorm = normalizeRiskIdentifier(riskId || '')

        // 1. Exact match (normalized)
        if (riskIdNorm === hazardIdNorm || riskIdNorm === hazardNameNorm) return true

        // 2. Contains match
        if (hazardIdNorm.includes(riskIdNorm) || riskIdNorm.includes(hazardIdNorm)) return true
        if (hazardNameNorm.includes(riskIdNorm) || riskIdNorm.includes(hazardNameNorm)) return true

        // 3. Word match
        const hazardWords = hazardNameNorm.split('_')
        const riskWords = riskIdNorm.split('_')
        if (hazardWords.some(w => riskWords.includes(w)) || riskWords.some(w => hazardWords.includes(w))) {
          return true
        }

        return false
      })

          if (!matchesThisRisk) return false

          // Show strategy under ALL risks it applies to - no primary risk filtering
          // This ensures every selected risk shows its applicable strategies
          const strategyId = s.strategyId
          if (seenStrategyIds.has(strategyId)) return false
          seenStrategyIds.add(strategyId)
          return true
    })

    // Display results for this risk
    if (matchingStrategies.length > 0) {
      console.log(`✅ FOUND ${matchingStrategies.length} STRATEGY(IES):`)
      matchingStrategies.forEach(strategy => {
        const name = JSON.parse(strategy.name as string).en
        console.log(`   • ${strategy.strategyId}: ${name} (${strategy._count.actionSteps} steps)`)
        totalStrategiesShown++
      })
    } else {
      console.log(`❌ NO STRATEGIES FOUND for this risk!`)
    }
  })

  console.log('\n' + '='.repeat(80))
  console.log('📊 SIMULATION RESULTS:')
  console.log(`   - User selected risks: ${userSelectedRisks.length}`)
  console.log(`   - Total strategies shown: ${totalStrategiesShown}`)
  console.log(`   - Average strategies per risk: ${(totalStrategiesShown / userSelectedRisks.length).toFixed(1)}`)

  console.log('\n🔍 ANALYSIS:')
  console.log('   - Strategies now show under ALL risks they apply to')
  console.log('   - Multi-risk strategies appear multiple times (once per applicable risk)')
  console.log('   - Hurricane strategy covers hurricane, flooding, power_outage - shows under all 3')
  console.log('   - This ensures every selected risk displays its applicable strategies')

  // Show which risks have no strategies
  const risksWithoutStrategies = userSelectedRisks.filter(risk => {
    const matching = riskSpecificStrategies.filter(s => {
      const applicableRisks = parseApplicableRisks(s.applicableRisks)
      const hazardIdNorm = normalizeRiskIdentifier(risk.hazardId || '')
      const hazardNameNorm = normalizeRiskIdentifier(risk.hazardName || '')
      return applicableRisks.some((riskId: string) => {
        const riskIdNorm = normalizeRiskIdentifier(riskId || '')
        return riskIdNorm === hazardIdNorm || riskIdNorm === hazardNameNorm ||
               hazardIdNorm.includes(riskIdNorm) || riskIdNorm.includes(hazardIdNorm)
      })
    })
    return matching.length === 0
  })

  if (risksWithoutStrategies.length > 0) {
    console.log(`\n⚠️  RISKS WITHOUT STRATEGIES (${risksWithoutStrategies.length}):`)
    risksWithoutStrategies.forEach(risk => {
      console.log(`   ✗ ${risk.hazardName}`)
    })
  }
}

async function main() {
  try {
    await simulateUserBCP()
  } catch (error) {
    console.error('❌ Error simulating user BCP:', error)
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
