import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixStrategyRiskMappings() {
    console.log('🔧 Fixing strategy risk mappings with CORRECT strategy IDs...\n')

    // Define correct mappings based on ACTUAL strategy IDs in database
    const mappings = [
        { strategyId: 'break_in_theft_protection', primaryRisk: 'break_in_theft', secondaryRisks: [] },
        { strategyId: 'civil_unrest_protection', primaryRisk: 'civil_unrest', secondaryRisks: [] },
        { strategyId: 'cyber_security_comprehensive', primaryRisk: 'cybersecurity_incident', secondaryRisks: ['internet_outage'] },
        { strategyId: 'earthquake_protection_comprehensive', primaryRisk: 'earthquake', secondaryRisks: [] },
        { strategyId: 'economic_downturn_protection', primaryRisk: 'economic_downturn', secondaryRisks: [] },
        { strategyId: 'fire_protection_comprehensive', primaryRisk: 'fire', secondaryRisks: [] },
        { strategyId: 'flood_protection_comprehensive', primaryRisk: 'flooding', secondaryRisks: [] },
        { strategyId: 'hurricane_comprehensive', primaryRisk: 'hurricane', secondaryRisks: ['high_winds'] },
        { strategyId: 'power_resilience_comprehensive', primaryRisk: 'power_outage', secondaryRisks: [] },
        { strategyId: 'supply_chain_protection_comprehensive', primaryRisk: 'supply_disruption', secondaryRisks: [] },
        { strategyId: 'drought_protection_comprehensive', primaryRisk: 'water_shortage', secondaryRisks: ['drought'] },
        { strategyId: 'chemical_hazard_protection', primaryRisk: 'chemical_spill', secondaryRisks: [] }, // if this hazard exists
    ]

    let successCount = 0
    let notFoundCount = 0

    for (const mapping of mappings) {
        try {
            const result = await prisma.riskMitigationStrategy.updateMany({
                where: {
                    strategyId: mapping.strategyId
                },
                data: {
                    primaryRisk: mapping.primaryRisk,
                    secondaryRisks: JSON.stringify(mapping.secondaryRisks)
                }
            })

            if (result.count > 0) {
                console.log(`✅ Updated ${mapping.strategyId.padEnd(40)} → primary: ${mapping.primaryRisk}`)
                successCount++
            } else {
                console.log(`❌ Strategy not found: ${mapping.strategyId}`)
                notFoundCount++
            }
        } catch (error: any) {
            console.error(`❌ Error updating ${mapping.strategyId}:`, error.message)
        }
    }

    console.log(`\n📊 Summary: ${successCount} updated, ${notFoundCount} not found`)
    console.log('\n✨ Done!')
    await prisma.$disconnect()
}

fixStrategyRiskMappings().catch(console.error)
