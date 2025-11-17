import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyTourismMultipliers() {
  console.log('🔍 Verifying tourism multipliers...')
  
  const tourismMultipliers = await prisma.riskMultiplier.findMany({
    where: {
      characteristicType: 'tourism_share',
      isActive: true
    },
    orderBy: {
      priority: 'asc'
    }
  })
  
  console.log(`\nFound ${tourismMultipliers.length} active tourism multiplier(s):\n`)
  
  if (tourismMultipliers.length === 0) {
    console.log('⚠️  No tourism multipliers found!')
    return
  }
  
  tourismMultipliers.forEach((m, index) => {
    console.log(`${index + 1}. ${m.name}`)
    console.log(`   Priority: ${m.priority}`)
    console.log(`   ID: ${m.id}`)
    
    // Parse wizard question
    try {
      const question = JSON.parse(m.wizardQuestion || '{}')
      console.log(`   Question (EN): ${question.en || 'N/A'}`)
    } catch {
      console.log(`   Question: ${m.wizardQuestion || 'N/A'}`)
    }
    
    // Parse answer options
    try {
      const options = JSON.parse(m.wizardAnswerOptions || '[]')
      console.log(`   Answer Options: ${options.length} options`)
      options.forEach((opt: any, i: number) => {
        const label = typeof opt.label === 'object' ? opt.label.en : opt.label
        console.log(`     ${i + 1}. ${label} (value: ${opt.value})`)
      })
    } catch {
      console.log(`   Answer Options: ${m.wizardAnswerOptions || 'None'}`)
    }
    
    console.log('')
  })
  
  if (tourismMultipliers.length === 1) {
    console.log('✅ Perfect! Only one tourism multiplier exists.')
  } else {
    console.log(`⚠️  Warning: ${tourismMultipliers.length} tourism multipliers found. Should be only 1.`)
  }
}

async function main() {
  try {
    await verifyTourismMultipliers()
  } catch (error) {
    console.error('\n❌ Error verifying tourism multipliers:')
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

