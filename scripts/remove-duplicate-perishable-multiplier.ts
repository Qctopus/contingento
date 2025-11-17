import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeDuplicatePerishableMultiplier() {
  console.log('🔍 Removing duplicate Perishable Goods multiplier...')
  
  const perishableMultiplier = await prisma.riskMultiplier.findFirst({
    where: {
      characteristicType: 'perishable_goods'
    }
  })
  
  if (perishableMultiplier) {
    console.log(`  Found: ${perishableMultiplier.name} (Priority ${perishableMultiplier.priority})`)
    await prisma.riskMultiplier.delete({
      where: { id: perishableMultiplier.id }
    })
    console.log('  ✅ Deleted duplicate Perishable Goods multiplier')
  } else {
    console.log('  ✅ No duplicate found - already removed')
  }
}

async function main() {
  try {
    await removeDuplicatePerishableMultiplier()
  } catch (error) {
    console.error('\n❌ Error removing duplicate:')
    console.error(error)
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






