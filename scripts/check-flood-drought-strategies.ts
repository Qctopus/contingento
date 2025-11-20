import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStrategies() {
    const strategies = await prisma.riskMitigationStrategy.findMany()

    console.log('Checking strategies for flood/flooding and drought...')

    const floodStrategies = strategies.filter(s => {
        const risks = s.applicableRisks ? s.applicableRisks.toLowerCase() : ''
        return risks.includes('flood')
    })

    const droughtStrategies = strategies.filter(s => {
        const risks = s.applicableRisks ? s.applicableRisks.toLowerCase() : ''
        return risks.includes('drought')
    })

    console.log(`\nFound ${floodStrategies.length} flood-related strategies:`)
    floodStrategies.forEach(s => {
        console.log(`- ${s.name} (ID: ${s.strategyId})`)
        console.log(`  applicableRisks: ${s.applicableRisks}`)
    })

    console.log(`\nFound ${droughtStrategies.length} drought-related strategies:`)
    droughtStrategies.forEach(s => {
        console.log(`- ${s.name} (ID: ${s.strategyId})`)
        console.log(`  applicableRisks: ${s.applicableRisks}`)
    })
}

checkStrategies()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
