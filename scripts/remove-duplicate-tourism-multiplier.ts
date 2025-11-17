import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeDuplicateTourismMultiplier() {
  console.log('🔍 Checking for duplicate tourism multipliers...')
  
  // Find all multipliers with tourism_share characteristic
  const tourismMultipliers = await prisma.riskMultiplier.findMany({
    where: {
      characteristicType: 'tourism_share'
    },
    orderBy: {
      priority: 'asc'
    }
  })
  
  console.log(`Found ${tourismMultipliers.length} tourism multipliers:`)
  tourismMultipliers.forEach(m => {
    console.log(`  - ${m.name} (Priority ${m.priority}, ID: ${m.id})`)
  })
  
  // Keep only the one named "Tourism Dependency" (the new one)
  // Delete any others (including old "High Tourism Dependency" and "Moderate Tourism Dependency")
  const toKeep = tourismMultipliers.find(m => m.name === 'Tourism Dependency')
  const toDelete = tourismMultipliers.filter(m => m.name !== 'Tourism Dependency')
  
  if (toDelete.length > 0) {
    console.log(`\n🗑️  Deleting ${toDelete.length} duplicate tourism multiplier(s):`)
    for (const multiplier of toDelete) {
      console.log(`  - Deleting: ${multiplier.name} (Priority ${multiplier.priority})`)
      await prisma.riskMultiplier.delete({
        where: { id: multiplier.id }
      })
    }
    console.log('✅ Duplicate multipliers removed successfully!')
  } else {
    console.log('\n✅ No duplicates found - only one tourism multiplier exists.')
  }
  
  if (toKeep) {
    console.log(`\n✅ Keeping: ${toKeep.name} (Priority ${toKeep.priority})`)
  } else {
    console.log('\n⚠️  Warning: No tourism multiplier with priority 4 found!')
  }
}

async function main() {
  try {
    await removeDuplicateTourismMultiplier()
  } catch (error) {
    console.error('\n❌ Error removing duplicate tourism multiplier:')
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

export { removeDuplicateTourismMultiplier }

