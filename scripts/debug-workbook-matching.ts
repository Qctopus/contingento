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

async function debugWorkbookMatching() {
  console.log('🐛 Debugging Workbook Risk-Strategy Matching...\n')

  // Get all strategies
  const allStrategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      applicableRisks: true
    }
  })

  // Filter to risk-specific strategies (exclude generics)
  const riskSpecificStrategies = allStrategies.filter(s => {
    const applicableRisks = parseApplicableRisks(s.applicableRisks)
    return applicableRisks.length > 0 && !applicableRisks.includes('all_hazards')
  })

  console.log(`📊 Found ${riskSpecificStrategies.length} risk-specific strategies`)
  console.log(`📊 Found ${allStrategies.length} total strategies\n`)

  // Common risk types that might be in BCP data (11 typical Caribbean risks)
  const typicalCaribbeanRisks = [
    { hazardId: 'hurricane', hazardName: 'Hurricane', category: 'Natural' },
    { hazardId: 'flood', hazardName: 'Flood', category: 'Natural' },
    { hazardId: 'flooding', hazardName: 'Flooding', category: 'Natural' },
    { hazardId: 'earthquake', hazardName: 'Earthquake', category: 'Natural' },
    { hazardId: 'fire', hazardName: 'Fire', category: 'Technical' },
    { hazardId: 'power_outage', hazardName: 'Power Outage', category: 'Technical' },
    { hazardId: 'cyber_attack', hazardName: 'Cyber Attack', category: 'Human' },
    { hazardId: 'drought', hazardName: 'Drought', category: 'Natural' },
    { hazardId: 'supply_chain_disruption', hazardName: 'Supply Chain Disruption', category: 'Human' },
    { hazardId: 'pandemic', hazardName: 'Pandemic', category: 'Human' },
    { hazardId: 'theft', hazardName: 'Theft', category: 'Human' }
  ]

  console.log('🎯 Testing 11 Typical Caribbean Risks:')
  console.log('═'.repeat(80))

  let totalMatches = 0
  let unmatchedRisks: string[] = []

  typicalCaribbeanRisks.forEach((testRisk, index) => {
    console.log(`\n${index + 1}. ${testRisk.category}: ${testRisk.hazardName} (${testRisk.hazardId})`)
    console.log(`   Normalized: "${normalizeRiskIdentifier(testRisk.hazardId)}" / "${normalizeRiskIdentifier(testRisk.hazardName)}"`)

    const matchingStrategies: any[] = []

    riskSpecificStrategies.forEach(strategy => {
      const applicableRisks = parseApplicableRisks(strategy.applicableRisks)

      // Skip generic strategies (already filtered above)
      if (applicableRisks.length === 0 || applicableRisks.includes('all_hazards')) return

      // Normalize identifiers for comparison
      const hazardIdNorm = normalizeRiskIdentifier(testRisk.hazardId || '')
      const hazardNameNorm = normalizeRiskIdentifier(testRisk.hazardName || '')

      // Check if this strategy matches this risk
      const matchesThisRisk = applicableRisks.some((riskId: string) => {
        const riskIdNorm = normalizeRiskIdentifier(riskId || '')

        // 1. Exact match (normalized)
        if (riskIdNorm === hazardIdNorm || riskIdNorm === hazardNameNorm) return true

        // 2. Contains match (for partial IDs like "hurricane" matching "hurricane_preparation")
        if (hazardIdNorm.includes(riskIdNorm) || riskIdNorm.includes(hazardIdNorm)) return true
        if (hazardNameNorm.includes(riskIdNorm) || riskIdNorm.includes(hazardNameNorm)) return true

        // 3. Word match (for "cyber attack" matching "cyberattack")
        const hazardWords = hazardNameNorm.split('_')
        const riskWords = riskIdNorm.split('_')
        if (hazardWords.some(w => riskWords.includes(w)) || riskWords.some(w => hazardWords.includes(w))) {
          return true
        }

        return false
      })

      if (matchesThisRisk) {
        matchingStrategies.push(strategy)
      }
    })

    if (matchingStrategies.length > 0) {
      console.log(`   ✅ MATCHES: ${matchingStrategies.length} strategy(ies)`)
      matchingStrategies.forEach(s => console.log(`      • ${s.strategyId}`))
      totalMatches += matchingStrategies.length
    } else {
      console.log(`   ❌ NO MATCHES FOUND!`)
      unmatchedRisks.push(testRisk.hazardName)
    }
  })

  console.log('\n' + '═'.repeat(80))
  console.log('📊 MATCHING RESULTS:')
  console.log(`   - Risks tested: ${typicalCaribbeanRisks.length}`)
  console.log(`   - Total strategy matches: ${totalMatches}`)
  console.log(`   - Average matches per risk: ${(totalMatches / typicalCaribbeanRisks.length).toFixed(1)}`)

  if (unmatchedRisks.length > 0) {
    console.log(`   - ❌ Unmatched risks: ${unmatchedRisks.length}`)
    console.log('\n🚨 UNMATCHED RISKS:')
    unmatchedRisks.forEach(risk => console.log(`   ✗ ${risk}`))
  }

  console.log('\n🔧 STRATEGY RISK COVERAGE:')
  riskSpecificStrategies.forEach(strategy => {
    const applicableRisks = parseApplicableRisks(strategy.applicableRisks)
    console.log(`   ${strategy.strategyId}: ${applicableRisks.join(', ')}`)
  })

  console.log('\n💡 POSSIBLE ISSUES:')
  console.log('   1. BCP data uses different risk identifiers than strategies expect')
  console.log('   2. Case sensitivity or special characters in risk names')
  console.log('   3. Missing applicableRisks assignments on strategies')
  console.log('   4. Workbook component not passing risk data correctly')
}

async function main() {
  try {
    await debugWorkbookMatching()
  } catch (error) {
    console.error('❌ Error debugging workbook matching:', error)
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

