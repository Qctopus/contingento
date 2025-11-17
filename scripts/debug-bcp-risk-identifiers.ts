import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simulate how BCP risk data is processed
function parseBCPRiskData(risks: any[]): any[] {
  // Simulate how the workbook processes BCP risk data
  return risks.map((risk, index) => {
    // This simulates how the BCP data might look
    const riskData = {
      hazardId: risk.hazardId || risk.id,
      hazardName: risk.hazardName || risk.hazard || risk.name || 'Unknown Risk',
      riskScore: risk.riskScore || risk.score || 0,
      likelihood: risk.likelihood || 'Unknown',
      impact: risk.impact || 'Unknown'
    }

    return riskData
  })
}

// Simulate workbook risk-strategy matching (updated with camelCase handling)
function normalizeRiskIdentifier(id: string): string {
  if (!id) return ''
  return id.toString()
    // Convert camelCase to snake_case (PowerOutage → power_outage)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[_\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_') // collapse multiple underscores
    .replace(/^_|_$/g, '') // remove leading/trailing underscores
    .trim()
}

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

async function debugBCPRiskIdentifiers() {
  console.log('🔍 Debugging BCP Risk Identifiers vs Strategy Matching...\n')

  // Sample BCP risk data based on what we see in the PDF
  const sampleBCPRisks = [
    { hazardId: 'Hurricane', hazardName: 'Hurricane', riskScore: 10.0 },
    { hazardId: 'Flood', hazardName: 'Flood', riskScore: 10.0 },
    { hazardId: 'PowerOutage', hazardName: 'Power Outage', riskScore: 10.0 },
    { hazardId: 'SupplyChainDisruption', hazardName: 'Supply Chain Disruption', riskScore: 10.0 },
    { hazardId: 'EconomicDownturn', hazardName: 'Economic Downturn', riskScore: 10.0 },
    { hazardId: 'PandemicDisease', hazardName: 'Pandemic Disease', riskScore: 10.0 },
    { hazardId: 'CyberAttack', hazardName: 'Cyber Attack', riskScore: 8.4 },
    { hazardId: 'Fire', hazardName: 'Fire', riskScore: 7.3 },
    { hazardId: 'CivilUnrest', hazardName: 'Civil Unrest', riskScore: 6.6 },
    { hazardId: 'Earthquake', hazardName: 'Earthquake', riskScore: 6.2 },
    { hazardId: 'Drought', hazardName: 'Drought', riskScore: 6.0 }
  ]

  console.log('📋 BCP Risk Data (as shown in PDF):')
  sampleBCPRisks.forEach((risk, i) => {
    console.log(`  ${i + 1}. ${risk.hazardName} (${risk.hazardId})`)
  })

  console.log('\n🔄 Normalized Identifiers:')
  sampleBCPRisks.forEach((risk, i) => {
    const normalizedId = normalizeRiskIdentifier(risk.hazardId)
    const normalizedName = normalizeRiskIdentifier(risk.hazardName)
    console.log(`  ${i + 1}. "${risk.hazardId}" → "${normalizedId}" | "${risk.hazardName}" → "${normalizedName}"`)
  })

  // Get strategies
  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      applicableRisks: true
    }
  })

  const riskSpecificStrategies = strategies.filter(s => {
    const applicableRisks = parseApplicableRisks(s.applicableRisks)
    return applicableRisks.length > 0 && !applicableRisks.includes('all_hazards')
  })

  console.log('\n🎯 Matching Analysis:')
  console.log('═'.repeat(80))

  sampleBCPRisks.forEach((bcpRisk, index) => {
    console.log(`\n${index + 1}. BCP Risk: ${bcpRisk.hazardName} (${bcpRisk.hazardId})`)
    console.log(`   Normalized: "${normalizeRiskIdentifier(bcpRisk.hazardId)}" / "${normalizeRiskIdentifier(bcpRisk.hazardName)}"`)

    const matchingStrategies: any[] = []

    riskSpecificStrategies.forEach(strategy => {
      const applicableRisks = parseApplicableRisks(strategy.applicableRisks)

      applicableRisks.forEach(strategyRisk => {
        const strategyRiskNorm = normalizeRiskIdentifier(strategyRisk)

        // Check various matching combinations
        const bcpIdNorm = normalizeRiskIdentifier(bcpRisk.hazardId)
        const bcpNameNorm = normalizeRiskIdentifier(bcpRisk.hazardName)

        const matches = [
          bcpIdNorm === strategyRiskNorm,
          bcpNameNorm === strategyRiskNorm,
          bcpIdNorm.includes(strategyRiskNorm),
          strategyRiskNorm.includes(bcpIdNorm),
          bcpNameNorm.includes(strategyRiskNorm),
          strategyRiskNorm.includes(bcpNameNorm)
        ]

        if (matches.some(m => m)) {
          if (!matchingStrategies.find(s => s.strategyId === strategy.strategyId)) {
            matchingStrategies.push(strategy)
          }
        }
      })
    })

    if (matchingStrategies.length > 0) {
      console.log(`   ✅ MATCHES: ${matchingStrategies.length} strategy(ies)`)
      matchingStrategies.forEach(s => console.log(`      • ${s.strategyId}`))
    } else {
      console.log(`   ❌ NO MATCHES - This explains why no strategies show in PDF!`)

      // Show what the strategy expects vs what BCP provides
      console.log(`   Expected by strategies: Check applicableRisks array`)
    }
  })

  console.log('\n🔧 Strategy Applicable Risks (what they expect):')
  riskSpecificStrategies.forEach(strategy => {
    const applicableRisks = parseApplicableRisks(strategy.applicableRisks)
    console.log(`   ${strategy.strategyId}: [${applicableRisks.map(r => `"${r}"`).join(', ')}]`)
  })

  console.log('\n💡 SOLUTION:')
  console.log('   The BCP risk identifiers (PowerOutage, CyberAttack, etc.) don\'t match')
  console.log('   what our strategies expect (power_outage, cyber_attack, etc.)')
  console.log('   ')
  console.log('   We need to either:')
  console.log('   1. Update strategy applicableRisks to match BCP identifiers')
  console.log('   2. Or update BCP generation to use normalized identifiers')
  console.log('   3. Or improve the matching logic to handle both formats')
}

async function main() {
  try {
    await debugBCPRiskIdentifiers()
  } catch (error) {
    console.error('❌ Error debugging BCP risk identifiers:', error)
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
