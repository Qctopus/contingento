import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkHazardTypes() {
  console.log('🌪️ Checking Available Hazard Types...\n')

  const hazards = await prisma.adminHazardType.findMany({
    select: {
      hazardId: true,
      name: true,
      category: true
    },
    orderBy: {
      hazardId: 'asc'
    }
  })

  console.log(`Found ${hazards.length} hazard types:`)
  console.log('─'.repeat(50))

  const categories: { [key: string]: number } = {}

  hazards.forEach(hazard => {
    console.log(`  ${hazard.hazardId}: ${hazard.name} (${hazard.category})`)
    categories[hazard.category] = (categories[hazard.category] || 0) + 1
  })

  console.log('\n📊 By Category:')
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} hazards`)
  })

  // Check which hazards have strategies
  console.log('\n🔗 Hazards with Strategy Coverage:')
  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      applicableRisks: true
    }
  })

  const coveredHazards = new Set<string>()

  strategies.forEach(strategy => {
    try {
      const risks = JSON.parse(strategy.applicableRisks as string) || []
      risks.forEach((risk: string) => coveredHazards.add(risk))
    } catch (e) {
      // Ignore parsing errors
    }
  })

  console.log(`  Covered hazards: ${coveredHazards.size}`)
  console.log(`  Total hazards: ${hazards.length}`)

  const uncovered = hazards.filter(h => !coveredHazards.has(h.hazardId))
  if (uncovered.length > 0) {
    console.log('\n⚠️  Hazards WITHOUT strategy coverage:')
    uncovered.forEach(h => console.log(`   - ${h.hazardId}: ${h.name}`))
  } else {
    console.log('\n✅ All hazards have strategy coverage!')
  }
}

async function main() {
  try {
    await checkHazardTypes()
  } catch (error) {
    console.error('❌ Error checking hazard types:', error)
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

