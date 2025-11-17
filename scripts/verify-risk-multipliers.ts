import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   VERIFY RISK MULTIPLIERS                                      ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')

  const multipliers = await prisma.riskMultiplier.findMany({
    where: { isActive: true },
    orderBy: { priority: 'asc' }
  })

  console.log(`Found ${multipliers.length} active multipliers\n`)
  console.log('═'.repeat(65))

  for (const mult of multipliers) {
    const hazards = JSON.parse(mult.applicableHazards || '[]')
    const question = mult.wizardQuestion ? JSON.parse(mult.wizardQuestion) : null
    const answers = mult.wizardAnswerOptions ? JSON.parse(mult.wizardAnswerOptions) : null
    const help = mult.wizardHelpText ? JSON.parse(mult.wizardHelpText) : null

    console.log(`\n${mult.name}`)
    console.log(`  Priority: ${mult.priority}`)
    console.log(`  Multiplier: ×${mult.multiplierFactor}`)
    console.log(`  Condition: ${mult.conditionType}`)
    if (mult.thresholdValue) console.log(`  Threshold: ${mult.thresholdValue}`)
    if (mult.minValue && mult.maxValue) console.log(`  Range: ${mult.minValue}-${mult.maxValue}`)
    console.log(`  Applies to: ${hazards.join(', ')}`)
    console.log(`  Characteristic: ${mult.characteristicType}`)
    if (question) {
      console.log(`  Question (EN): ${question.en}`)
      if (answers && answers.en) {
        console.log(`  Answers (EN): ${answers.en.join(' | ')}`)
      }
      if (help) {
        console.log(`  Help (EN): ${help.en.substring(0, 80)}...`)
      }
    }
  }

  console.log('\n' + '═'.repeat(65))
  console.log('✅ Verification complete!')
  console.log('')

  await prisma.$disconnect()
}

main().catch(console.error)

