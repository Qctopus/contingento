const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testActionSteps() {
  try {
    console.log('🔍 Testing ActionStep table...')
    
    // Try to query action steps
    const actionSteps = await prisma.actionStep.findMany()
    console.log(`Found ${actionSteps.length} action steps`)
    
    actionSteps.forEach(step => {
      console.log(`  - ${step.stepId}: ${step.title} (${step.phase})`)
    })

  } catch (error) {
    console.error('❌ Error accessing ActionStep table:', error.message)
    if (error.message.includes('Unknown argument')) {
      console.log('   💡 This suggests the Prisma client needs to be regenerated')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testActionSteps()
