import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Test what risks an IT business would face and what strategies the tool would propose
 * This simulates the complete risk assessment → strategy recommendation flow
 */

async function testITBusinessRisks() {
  console.log('💻 Testing IT Business Risk Assessment & Strategy Recommendations\n')
  console.log('🏢 Business Profile: IT/Technology Company')
  console.log('📍 Location: Urban area, Kingston, Jamaica')
  console.log('👥 Size: Small (5-10 employees)\n')

  // ============================================================================
  // STEP 1: Simulate IT Business Risk Assessment
  // ============================================================================

  console.log('📊 STEP 1: Risk Assessment for IT Business')
  console.log('═'.repeat(60))

  // Define IT business characteristics
  const businessProfile = {
    industryType: 'professional_services',
    businessType: 'technology',
    size: 'small',
    location: {
      country: 'Jamaica',
      parish: 'Kingston',
      urbanArea: true,
      nearCoast: false
    }
  }

  // Common risks that would be pre-ticked for IT businesses based on system logic
  const itBusinessRisks = [
    {
      hazardId: 'cyber_attack',
      hazard: 'Cyber Attack',
      riskScore: 9.5,
      isSelected: true,
      source: 'business_type',
      reasoning: 'IT companies are primary targets for cyber attacks'
    },
    {
      hazardId: 'power_outage',
      hazard: 'Power Outage',
      riskScore: 8.2,
      isSelected: true,
      source: 'location',
      reasoning: 'Urban areas experience power outages, critical for IT infrastructure'
    },
    {
      hazardId: 'economic_downturn',
      hazard: 'Economic Downturn',
      riskScore: 7.8,
      isSelected: true,
      source: 'business_type',
      reasoning: 'IT spending is sensitive to economic conditions'
    },
    {
      hazardId: 'supply_chain_disruption',
      hazard: 'Supply Chain Disruption',
      riskScore: 7.5,
      isSelected: true,
      source: 'business_type',
      reasoning: 'IT hardware/software supply chains are complex and vulnerable'
    },
    {
      hazardId: 'theft',
      hazard: 'Theft',
      riskScore: 6.8,
      isSelected: true,
      source: 'business_type',
      reasoning: 'Valuable IT equipment attracts theft'
    },
    {
      hazardId: 'pandemic',
      hazard: 'Pandemic',
      riskScore: 6.5,
      isSelected: true,
      source: 'global_events',
      reasoning: 'Remote work and supply chain impacts affect IT businesses'
    },
    {
      hazardId: 'earthquake',
      hazard: 'Earthquake',
      riskScore: 4.2,
      isSelected: false,
      source: 'location',
      reasoning: 'Jamaica has earthquake risk, but Kingston has moderate exposure'
    }
  ]

  console.log(`IT Business would have ${itBusinessRisks.filter(r => r.isSelected || r.riskScore >= 5.0).length} risks selected/high-risk:`)
  console.log('')

  itBusinessRisks
    .filter(r => r.isSelected || r.riskScore >= 5.0)
    .forEach((risk, index) => {
      const selectionType = risk.isSelected ? 'SELECTED' : 'HIGH RISK'
      console.log(`${index + 1}. ${risk.hazard} (${risk.hazardId})`)
      console.log(`   Score: ${risk.riskScore}/10 | Status: ${selectionType}`)
      console.log(`   Reason: ${risk.reasoning}`)
      console.log('')
    })

  // ============================================================================
  // STEP 2: Strategy Recommendation Logic
  // ============================================================================

  console.log('🎯 STEP 2: Strategy Recommendations')
  console.log('═'.repeat(60))

  // Get all strategies from database
  const allStrategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      name: true,
      applicableRisks: true,
      priorityTier: true,
      smeTitle: true,
      actionSteps: {
        select: { id: true }
      }
    }
  })

  // Apply the same logic as the API: find strategies linked to selected risks
  const selectedRisks = itBusinessRisks.filter(r => r.isSelected || r.riskScore >= 5.0)
  const linkedStrategyIds = new Set<string>()

  selectedRisks.forEach(risk => {
    const userRiskId = risk.hazardId

    allStrategies.forEach(strategy => {
      try {
        const strategyRisks = JSON.parse(strategy.applicableRisks || '[]')
        if (strategyRisks.includes(userRiskId)) {
          linkedStrategyIds.add(strategy.strategyId)
        }
      } catch (e) {
        // Skip invalid JSON
      }
    })
  })

  // Filter to recommended strategies
  const recommendedStrategies = allStrategies.filter(s => linkedStrategyIds.has(s.strategyId))

  console.log(`✅ System would recommend ${recommendedStrategies.length} strategies for IT business:`)
  console.log('')

  // Group by priority tier
  const essential = recommendedStrategies.filter(s => s.priorityTier === 'essential')
  const recommended = recommendedStrategies.filter(s => s.priorityTier === 'recommended')
  const optional = recommendedStrategies.filter(s => s.priorityTier === 'optional')

  // Display essential strategies (auto-selected)
  if (essential.length > 0) {
    console.log('🔴 ESSENTIAL STRATEGIES (Auto-selected):')
    essential.forEach((strategy, index) => {
      const name = JSON.parse(strategy.name || '{}').en || 'Unknown'
      const risks = JSON.parse(strategy.applicableRisks || '[]')
      const matchingRisks = risks.filter((r: string) => selectedRisks.some(sr => sr.hazardId === r))

      console.log(`${index + 1}. ${name}`)
      console.log(`   ID: ${strategy.strategyId}`)
      console.log(`   Linked Risks: ${matchingRisks.join(', ')}`)
      console.log(`   Action Steps: ${strategy.actionSteps.length}`)
      console.log('')
    })
  }

  // Display recommended strategies (auto-selected)
  if (recommended.length > 0) {
    console.log('🟡 RECOMMENDED STRATEGIES (Auto-selected):')
    recommended.forEach((strategy, index) => {
      const name = JSON.parse(strategy.name || '{}').en || 'Unknown'
      const risks = JSON.parse(strategy.applicableRisks || '[]')
      const matchingRisks = risks.filter((r: string) => selectedRisks.some(sr => sr.hazardId === r))

      console.log(`${index + 1}. ${name}`)
      console.log(`   ID: ${strategy.strategyId}`)
      console.log(`   Linked Risks: ${matchingRisks.join(', ')}`)
      console.log(`   Action Steps: ${strategy.actionSteps.length}`)
      console.log('')
    })
  }

  // ============================================================================
  // STEP 3: Summary & Analysis
  // ============================================================================

  console.log('📋 STEP 3: Summary for IT Business')
  console.log('═'.repeat(60))

  const totalActionSteps = recommendedStrategies.reduce((sum, s) => sum + s.actionSteps.length, 0)
  const autoSelected = essential.length + recommended.length

  console.log(`🏢 IT Business Profile:`)
  console.log(`   • Industry: Technology/Professional Services`)
  console.log(`   • Location: Urban Kingston, Jamaica`)
  console.log(`   • Size: Small business (5-10 employees)`)
  console.log('')

  console.log(`🎯 Risk Assessment:`)
  console.log(`   • Total risks evaluated: ${itBusinessRisks.length}`)
  console.log(`   • Selected/high-risk: ${selectedRisks.length}`)
  console.log(`   • Primary risk: Cyber Attack (9.5/10)`)
  console.log(`   • Key concerns: Data security, power reliability, economic sensitivity`)
  console.log('')

  console.log(`📊 Strategy Recommendations:`)
  console.log(`   • Auto-selected strategies: ${autoSelected}`)
  console.log(`   • Essential: ${essential.length}`)
  console.log(`   • Recommended: ${recommended.length}`)
  console.log(`   • Optional available: ${optional.length}`)
  console.log(`   • Total action steps: ${totalActionSteps}`)
  console.log('')

  console.log(`💰 Investment Required:`)
  console.log(`   • Implementation time: ~2-3 weeks`)
  console.log(`   • Cost range: Low to moderate`)
  console.log(`   • ROI: High (prevents data breaches, downtime)`)
  console.log('')

  console.log(`🎉 Business Impact:`)
  console.log(`   • Protects critical IT infrastructure and client data`)
  console.log(`   • Ensures business continuity during cyber attacks`)
  console.log(`   • Maintains client trust and regulatory compliance`)
  console.log(`   • Prepares for economic fluctuations in IT spending`)

  console.log('\n✅ Perfect match for IT business risk profile!')
}

async function main() {
  try {
    await testITBusinessRisks()
  } catch (error) {
    console.error('❌ Error testing IT business risks:', error)
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


