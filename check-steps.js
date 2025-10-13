const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: { 
      id: true, 
      name: true, 
      costEstimateJMD: true,
      implementationCost: true 
    },
    take: 3
  })
  
  strategies.forEach(s => {
    const name = typeof s.name === 'string' ? JSON.parse(s.name).en : 'N/A'
    console.log(`\n${name}:`)
    console.log(`  costEstimateJMD: ${s.costEstimateJMD}`)
    console.log(`  implementationCost: ${s.implementationCost}`)
  })
  
  await prisma.$disconnect()
}

main()

