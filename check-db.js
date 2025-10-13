const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const allSteps = await prisma.actionStep.findMany()
  
  console.log('Checking smeAction field for [ES] or [FR] prefixes...\n')
  
  allSteps.forEach(s => {
    const smeActionStr = s.smeAction || ''
    if (smeActionStr.includes('[ES]') || smeActionStr.includes('[FR]')) {
      console.log(`${s.stepId}:`)
      console.log(`  smeAction: ${smeActionStr.substring(0, 100)}`)
      console.log(`  title: ${typeof s.title === 'string' ? s.title.substring(0, 100) : JSON.stringify(s.title).substring(0, 100)}`)
      console.log('')
    }
  })
  
  await prisma.$disconnect()
}

main()

