import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simulate the workbook matching logic
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

async function testRiskStrategyMatching() {
  console.log('🧪 Testing Risk-Strategy Matching Logic...\n')

  // Get all strategies
  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      applicableRisks: true
    }
  })

  // Common Caribbean risk types that might be in BCP data
  const testRisks = [
    { hazardId: 'hurricane', hazardName: 'Hurricane' },
    { hazardId: 'flood', hazardName: 'Flood' },
    { hazardId: 'flooding', hazardName: 'Flooding' },
    { hazardId: 'earthquake', hazardName: 'Earthquake' },
    { hazardId: 'fire', hazardName: 'Fire' },
    { hazardId: 'power_outage', hazardName: 'Power Outage' },
    { hazardId: 'cyber_attack', hazardName: 'Cyber Attack' },
    { hazardId: 'drought', hazardName: 'Drought' },
    { hazardId: 'supply_chain', hazardName: 'Supply Chain Disruption' },
    { hazardId: 'tropical_storm', hazardName: 'Tropical Storm' },
    { hazardId: 'wind_damage', hazardName: 'Wind Damage' },
    { hazardId: 'ransomware', hazardName: 'Ransomware' },
    { hazardId: 'data_breach', hazardName: 'Data Breach' }
  ]

  console.log('📋 Risk-Strategy Matching Test Results:')
  console.log('═'.repeat(80))

  let totalMatches = 0

  testRisks.forEach(testRisk => {
    console.log(`\n🎯 Testing Risk: ${testRisk.hazardName} (${testRisk.hazardId})`)
    console.log(`   Normalized: ${normalizeRiskIdentifier(testRisk.hazardId)} / ${normalizeRiskIdentifier(testRisk.hazardName)}`)

    const matchingStrategies: string[] = []

    strategies.forEach(strategy => {
      const applicableRisks = parseApplicableRisks(strategy.applicableRisks)

      // Skip generic strategies
      if (applicableRisks.length === 0 || applicableRisks.includes('all_hazards')) return

      // Normalize identifiers for comparison
      const hazardIdNorm = normalizeRiskIdentifier(testRisk.hazardId || '')
      const hazardNameNorm = normalizeRiskIdentifier(testRisk.hazardName || '')

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

      if (matchesThisRisk) {
        matchingStrategies.push(strategy.strategyId)
      }
    })

    if (matchingStrategies.length > 0) {
      console.log(`   ✅ MATCHES: ${matchingStrategies.join(', ')}`)
      totalMatches += matchingStrategies.length
    } else {
      console.log(`   ❌ NO MATCHES FOUND!`)
    }
  })

  console.log('\n' + '═'.repeat(80))
  console.log('📊 SUMMARY:')
  console.log(`   - Test risks checked: ${testRisks.length}`)
  console.log(`   - Total strategy matches: ${totalMatches}`)
  console.log(`   - Average matches per risk: ${(totalMatches / testRisks.length).toFixed(1)}`)

  // Check for strategies that might not be matching any risks
  console.log('\n🔍 Strategies and their applicable risks:')
  strategies.forEach(strategy => {
    const applicableRisks = parseApplicableRisks(strategy.applicableRisks)
    if (applicableRisks.length > 0 && !applicableRisks.includes('all_hazards')) {
      console.log(`   ${strategy.strategyId}: ${applicableRisks.join(', ')}`)
    }
  })
}

async function main() {
  try {
    await testRiskStrategyMatching()
  } catch (error) {
    console.error('❌ Error testing risk-strategy matching:', error)
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

