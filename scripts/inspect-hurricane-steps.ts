import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getEnglishText(field: string | null | undefined): string {
  if (!field) return ''
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed.en || parsed.En || ''
      }
      return field
    } catch {
      return field
    }
  }
  return String(field)
}

async function main() {
  const strategy = await prisma.riskMitigationStrategy.findFirst({
    where: { 
      strategyId: 'hurricane_comprehensive',
      isActive: true 
    },
    include: {
      actionSteps: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
  
  if (!strategy) {
    console.log('Strategy not found')
    await prisma.$disconnect()
    return
  }
  
  console.log(`\n📋 Strategy: ${strategy.strategyId}`)
  console.log(`📊 Total steps: ${strategy.actionSteps.length}\n`)
  console.log('═'.repeat(80))
  
  strategy.actionSteps.forEach((step, idx) => {
    const title = getEnglishText(step.title)
    console.log(`\n${idx + 1}. ${title}`)
    console.log(`   ID: ${step.id}`)
    console.log(`   stepId: ${step.stepId || '(none)'}`)
    console.log(`   phase: ${step.phase}`)
    console.log(`   sortOrder: ${step.sortOrder}`)
    console.log(`   createdAt: ${step.createdAt.toISOString().split('T')[0]}`)
  })
  
  console.log('\n═'.repeat(80))
  console.log('\nLooking for similar titles...\n')
  
  // Check for similar titles
  const titles = strategy.actionSteps.map(s => ({
    step: s,
    title: getEnglishText(s.title).toLowerCase()
  }))
  
  for (let i = 0; i < titles.length; i++) {
    for (let j = i + 1; j < titles.length; j++) {
      const title1 = titles[i].title
      const title2 = titles[j].title
      
      // Check if titles are very similar (contain same key words)
      const words1 = title1.split(/\s+/).filter(w => w.length > 3)
      const words2 = title2.split(/\s+/).filter(w => w.length > 3)
      
      const commonWords = words1.filter(w => words2.includes(w))
      if (commonWords.length >= 2 && (title1.includes('document') && title2.includes('document') || 
          title1.includes('elevate') && title2.includes('elevate') ||
          title1.includes('install') && title2.includes('install'))) {
        console.log(`⚠️  Similar titles found:`)
        console.log(`   "${titles[i].step.stepId || titles[i].step.id}": ${getEnglishText(titles[i].step.title)}`)
        console.log(`   "${titles[j].step.stepId || titles[j].step.id}": ${getEnglishText(titles[j].step.title)}`)
        console.log(`   Common words: ${commonWords.join(', ')}`)
        console.log('')
      }
    }
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)





