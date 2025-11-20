import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listRisksAndStrategies() {
    console.log('📊 DATABASE INVENTORY\n')
    console.log('='.repeat(80))

    // List all hazards/risks
    console.log('\n🎯 RISKS/HAZARDS IN DATABASE:\n')
    const hazards = await prisma.adminHazardType.findMany({
        select: {
            hazardId: true,
            name: true,
            category: true
        },
        orderBy: {
            category: 'asc',
            name: 'asc'
        }
    })

    let currentCategory = ''
    hazards.forEach(h => {
        if (h.category !== currentCategory) {
            currentCategory = h.category
            console.log(`\n  📁 ${currentCategory.toUpperCase()}:`)
        }
        console.log(`     ${h.hazardId.padEnd(30)} → ${h.name}`)
    })

    console.log(`\n  TOTAL: ${hazards.length} risks`)

    // List all strategies
    console.log('\n\n📋 STRATEGIES IN DATABASE:\n')
    const strategies = await prisma.riskMitigationStrategy.findMany({
        select: {
            strategyId: true,
            smeTitle: true,
            name: true,

            selectionTier: true,
            primaryRisk: true,
            secondaryRisks: true
        },
        orderBy: {
            smeTitle: 'asc'
        }
    })

    strategies.forEach(s => {

        const titleParsed = s.smeTitle ? (s.smeTitle.includes('{') ? JSON.parse(s.smeTitle).en : s.smeTitle) : 'NO TITLE'
        const secondary = s.secondaryRisks ? JSON.parse(s.secondaryRisks) : []

        console.log(`     ${s.strategyId.padEnd(35)} [${s.selectionTier?.padEnd(11)}]`)
        console.log(`       Title: ${titleParsed}`)
        console.log(`       Primary: ${s.primaryRisk || '❌ NOT SET'}`)
        if (secondary.length > 0) {
            console.log(`       Secondary: ${secondary.join(', ')}`)
        }
        console.log('')
    })

    console.log(`  TOTAL: ${strategies.length} strategies`)

    console.log('\n' + '='.repeat(80))
    await prisma.$disconnect()
}

listRisksAndStrategies().catch(console.error)
