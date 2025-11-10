import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkIds() {
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: { isActive: true },
    select: { id: true, strategyId: true, name: true, category: true }
  })
  
  console.log('Current strategies in database:')
  strategies.forEach(s => {
    console.log(`  ${s.strategyId} - ${s.name} (${s.category})`)
  })
  
  await prisma.$disconnect()
}

checkIds()

