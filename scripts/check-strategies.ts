import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStrategies() {
  console.log('📋 Checking current strategies in database...\n')

  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      name: true,
      _count: {
        select: {
          actionSteps: true
        }
      }
    },
    orderBy: {
      strategyId: 'asc'
    }
  })

  console.log(`Found ${strategies.length} strategies:`)
  console.log('─'.repeat(60))

  strategies.forEach(strategy => {
    const name = JSON.parse(strategy.name as string).en || 'Unknown'
    console.log(`  ${strategy.strategyId}`)
    console.log(`    Name: ${name}`)
    console.log(`    Action Steps: ${strategy._count.actionSteps}`)
    console.log('')
  })

  // Check for generic strategies specifically
  const genericStrategies = strategies.filter(s =>
    s.strategyId.includes('data_backup') ||
    s.strategyId.includes('emergency_contacts') ||
    s.strategyId.includes('contacts')
  )

  if (genericStrategies.length === 0) {
    console.log('✅ SUCCESS: No generic strategies found!')
    console.log('   - data_backup_comprehensive: REMOVED')
    console.log('   - emergency_contacts: REMOVED')
  } else {
    console.log('⚠️  WARNING: Generic strategies still exist:')
    genericStrategies.forEach(s => {
      console.log(`   - ${s.strategyId}`)
    })
  }

  // Count risk-specific vs generic
  const riskSpecific = strategies.filter(s => !s.strategyId.includes('data_backup') && !s.strategyId.includes('contacts'))
  console.log(`\n📊 Summary:`)
  console.log(`   Risk-specific strategies: ${riskSpecific.length}`)
  console.log(`   Generic strategies: ${genericStrategies.length}`)
  console.log(`   Total strategies: ${strategies.length}`)
}

async function main() {
  try {
    await checkStrategies()
  } catch (error) {
    console.error('❌ Error checking strategies:', error)
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

