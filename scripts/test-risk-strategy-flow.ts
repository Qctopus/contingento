import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Test script to debug risk-to-strategy flow
 * Simulates what happens when risks are selected and passed to strategy section
 */

async function testRiskStrategyFlow() {
  console.log('🧪 Testing Risk-to-Strategy Flow\n')
  console.log('='.repeat(80))

  try {
    // 1. Get all active risks from admin2 backend
    console.log('\n📋 Step 1: Fetching active risks from AdminHazardType...')
    const hazardTypes = await prisma.adminHazardType.findMany({
      where: { isActive: true },
      select: { hazardId: true, name: true },
      orderBy: { hazardId: 'asc' }
    })
    
    console.log(`✅ Found ${hazardTypes.length} active risks:`)
    hazardTypes.forEach((h, i) => {
      console.log(`   ${i + 1}. ${h.hazardId} - ${h.name}`)
    })

    // 2. Simulate risk assessment matrix with 10 selected risks
    console.log('\n📊 Step 2: Simulating risk assessment matrix with 10 selected risks...')
    const simulatedRiskMatrix = [
      { hazardId: 'hurricane', hazard: 'Hurricane', isSelected: true, isPreSelected: true },
      { hazardId: 'flood', hazard: 'Flooding', isSelected: true, isPreSelected: true },
      { hazardId: 'earthquake', hazard: 'Earthquake', isSelected: true, isPreSelected: false },
      { hazardId: 'drought', hazard: 'Drought', isSelected: true, isPreSelected: true },
      { hazardId: 'landslide', hazard: 'Landslide', isSelected: true, isPreSelected: false },
      { hazardId: 'powerOutage', hazard: 'Power Outage', isSelected: true, isPreSelected: true },
      { hazardId: 'fire', hazard: 'Fire', isSelected: true, isPreSelected: true },
      { hazardId: 'cyberAttack', hazard: 'Cyber Attack', isSelected: true, isPreSelected: false },
      { hazardId: 'pandemicDisease', hazard: 'Health Emergencies', isSelected: true, isPreSelected: true },
      { hazardId: 'economicDownturn', hazard: 'Economic Crisis', isSelected: true, isPreSelected: true },
      { hazardId: 'supplyChainDisruption', hazard: 'Supply Chain Issues', isSelected: false, isPreSelected: false },
      { hazardId: 'terrorism', hazard: 'Security Threats', isSelected: false, isPreSelected: false },
      { hazardId: 'civilUnrest', hazard: 'Civil Unrest', isSelected: false, isPreSelected: false },
    ]

    const selectedRisks = simulatedRiskMatrix.filter(r => r.isSelected === true || r.isPreSelected === true)
    console.log(`✅ Simulated ${simulatedRiskMatrix.length} total risks, ${selectedRisks.length} selected:`)
    selectedRisks.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.hazardId} (isSelected: ${r.isSelected}, isPreSelected: ${r.isPreSelected})`)
    })

    // 3. Test the filtering logic (same as AdminStrategyCards)
    console.log('\n🔍 Step 3: Testing filtering logic (AdminStrategyCards)...')
    const normalizeRiskId = (id: string): string => {
      if (!id) return ''
      return id.toLowerCase().replace(/[_\s-]+/g, '').trim()
    }

    const selectedRiskItems = simulatedRiskMatrix.filter((r: any) => {
      const isManuallySelected = r.isSelected === true || r.isSelected === 'true' || r.isSelected === 1
      const isAutoSelected = r.isPreSelected === true || r.isPreSelected === 'true' || r.isPreSelected === 1
      return isManuallySelected || isAutoSelected
    })

    console.log(`✅ Filtered to ${selectedRiskItems.length} selected risks:`)
    selectedRiskItems.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.hazardId} (${r.hazard})`)
    })

    // 4. Map to validHazards format
    console.log('\n🗺️  Step 4: Mapping to validHazards format...')
    const validHazards = selectedRiskItems.map((r: any) => {
      const hazardId = r.hazardId || r.id || r.hazard || ''
      const hazardName = r.hazardName || r.hazard || r['Hazard Name'] || r['Hazard'] || ''
      const normalizedId = normalizeRiskId(hazardId)
      
      return {
        hazardId: hazardId,
        hazardName: hazardName,
        normalizedId: normalizedId
      }
    }).filter((r: any) => r.hazardId && r.hazardName)

    console.log(`✅ Mapped to ${validHazards.length} valid hazards:`)
    validHazards.forEach((h, i) => {
      console.log(`   ${i + 1}. ${h.hazardId} -> "${h.hazardName}" (normalized: ${h.normalizedId})`)
    })

    // 5. Get strategies and check matching
    console.log('\n📚 Step 5: Fetching strategies and checking risk matching...')
    const strategies = await prisma.riskMitigationStrategy.findMany({
      where: { isActive: true },
      select: {
        id: true,
        strategyId: true,
        name: true,
        applicableRisks: true
      },
      take: 50 // Limit for testing
    })

    console.log(`✅ Found ${strategies.length} strategies`)
    
    // 6. Test matching logic (same as StrategySelectionStep)
    console.log('\n🎯 Step 6: Testing risk-strategy matching logic...')
    
    const riskIdsMatch = (riskId1: string, riskId2: string): boolean => {
      if (!riskId1 || !riskId2) return false
      if (riskId1 === riskId2) return true
      
      const norm1 = normalizeRiskId(riskId1)
      const norm2 = normalizeRiskId(riskId2)
      if (norm1 === norm2) return true
      if (norm1.includes(norm2) || norm2.includes(norm1)) return true
      
      return false
    }

    const validRiskIds = new Set(validHazards.map(h => h.hazardId))
    const validNormalizedIds = new Set(validHazards.map(h => normalizeRiskId(h.hazardId)))

    // Group strategies by risk
    const strategiesByRisk: Record<string, any[]> = {}
    
    strategies.forEach(strategy => {
      if (!strategy.applicableRisks) return
      
      let applicableRisks: string[] = []
      try {
        applicableRisks = typeof strategy.applicableRisks === 'string' 
          ? JSON.parse(strategy.applicableRisks)
          : strategy.applicableRisks
      } catch (e) {
        console.warn(`⚠️  Failed to parse applicableRisks for ${strategy.strategyId}:`, e)
        return
      }

      applicableRisks.forEach((riskId: string) => {
        if (!riskId) return
        
        // Check if this risk matches any selected risk
        let matches = false
        let matchedHazard: any = null
        
        for (const validHazard of validHazards) {
          const matchesId = riskIdsMatch(riskId, validHazard.hazardId)
          const matchesName = riskIdsMatch(riskId, validHazard.hazardName)
          if (matchesId || matchesName) {
            matches = true
            matchedHazard = validHazard
            break
          }
        }
        
        if (matches && matchedHazard) {
          // Use the matched hazard's ID as the key (not the strategy's riskId)
          const key = matchedHazard.hazardId
          if (!strategiesByRisk[key]) {
            strategiesByRisk[key] = []
          }
          strategiesByRisk[key].push({
            strategyId: strategy.strategyId,
            name: strategy.name || strategy.strategyId
          })
          console.log(`   ✅ Matched: strategy "${strategy.strategyId}" has risk "${riskId}" -> matches hazard "${matchedHazard.hazardId}"`)
        } else {
          console.log(`   ❌ No match: strategy "${strategy.strategyId}" has risk "${riskId}" -> no matching hazard`)
        }
      })
    })

    console.log(`\n✅ Risk groups found: ${Object.keys(strategiesByRisk).length}`)
    Object.entries(strategiesByRisk).forEach(([risk, riskStrategies]) => {
      console.log(`   📌 ${risk}: ${riskStrategies.length} strategies`)
      riskStrategies.slice(0, 3).forEach(s => {
        console.log(`      - ${s.strategyId}`)
      })
      if (riskStrategies.length > 3) {
        console.log(`      ... and ${riskStrategies.length - 3} more`)
      }
    })

    // 7. Check which selected risks DON'T have strategies
    console.log('\n❌ Step 7: Checking which selected risks have NO strategies...')
    const risksWithoutStrategies = validHazards.filter(h => {
      const normalizedId = normalizeRiskId(h.hazardId)
      return !Object.keys(strategiesByRisk).some(risk => 
        riskIdsMatch(risk, h.hazardId) || riskIdsMatch(risk, h.hazardName)
      )
    })

    if (risksWithoutStrategies.length > 0) {
      console.log(`⚠️  Found ${risksWithoutStrategies.length} selected risks with NO matching strategies:`)
      risksWithoutStrategies.forEach(r => {
        console.log(`   - ${r.hazardId} (${r.hazardName})`)
        
        // Check what strategies have for this risk
        const strategiesWithThisRisk = strategies.filter(s => {
          if (!s.applicableRisks) return false
          try {
            const applicableRisks = typeof s.applicableRisks === 'string' 
              ? JSON.parse(s.applicableRisks)
              : s.applicableRisks
            return applicableRisks.some((ar: string) => 
              riskIdsMatch(ar, r.hazardId) || riskIdsMatch(ar, r.hazardName)
            )
          } catch {
            return false
          }
        })
        
        if (strategiesWithThisRisk.length > 0) {
          console.log(`     ⚠️  BUT found ${strategiesWithThisRisk.length} strategies that SHOULD match:`)
          strategiesWithThisRisk.slice(0, 3).forEach(s => {
            let applicableRisks: string[] = []
            try {
              applicableRisks = typeof s.applicableRisks === 'string' 
                ? JSON.parse(s.applicableRisks)
                : s.applicableRisks
            } catch {}
            console.log(`        - ${s.strategyId}: applicableRisks = [${applicableRisks.join(', ')}]`)
          })
        }
      })
    } else {
      console.log('✅ All selected risks have matching strategies!')
    }

    // 8. Summary
    console.log('\n' + '='.repeat(80))
    console.log('📊 SUMMARY:')
    console.log(`   Total risks in matrix: ${simulatedRiskMatrix.length}`)
    console.log(`   Selected risks: ${selectedRisks.length}`)
    console.log(`   Valid hazards mapped: ${validHazards.length}`)
    console.log(`   Risk groups with strategies: ${Object.keys(strategiesByRisk).length}`)
    console.log(`   Risks without strategies: ${risksWithoutStrategies.length}`)
    console.log('='.repeat(80))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRiskStrategyFlow()

