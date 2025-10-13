const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Check communication backup strategies
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: {
      OR: [
        { name: { contains: 'Communication' } },
        { name: { contains: 'Backup' } }
      ]
    }
  })
  
  strategies.forEach(s => {
    const name = JSON.parse(s.name).en
    console.log(`\n${name}:`)
    console.log('  strategyId:', s.strategyId)
    console.log('  applicableRisks:', s.applicableRisks)
  })
  
  await prisma.$disconnect()
}

main()

