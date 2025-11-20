import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixSupplyChainStrategy() {
    console.log('🔧 FIXING SUPPLY CHAIN STRATEGY RISK ASSOCIATIONS\n')

    // Update the supply chain strategy to remove health_emergency from applicableRisks
    const result = await prisma.riskMitigationStrategy.updateMany({
        where: {
            strategyId: 'supply_chain_protection_comprehensive'
        },
        data: {
            applicableRisks: '["supply_disruption"]'
        }
    })

    console.log(`✅ Updated ${result.count} strategies`)
    console.log('   Removed health_emergency from applicableRisks')
    console.log('   Now only includes: supply_disruption')

    // Verify the change
    const updated = await prisma.riskMitigationStrategy.findFirst({
        where: {
            strategyId: 'supply_chain_protection_comprehensive'
        },
        select: {
            strategyId: true,
            name: true,
            primaryRisk: true,
            secondaryRisks: true,
            applicableRisks: true
        }
    })

    console.log('\n📊 Verified updated strategy:')
    console.log(`  Strategy: ${updated?.strategyId}`)
    console.log(`  Primary Risk: ${updated?.primaryRisk}`)
    console.log(`  Secondary Risks: ${updated?.secondaryRisks}`)
    console.log(`  Applicable Risks: ${updated?.applicableRisks}`)

    await prisma.$disconnect()
}

fixSupplyChainStrategy()
