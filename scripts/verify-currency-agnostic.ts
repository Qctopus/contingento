import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyCurrencyAgnostic() {
  console.log('🔍 Checking for remaining currency-specific references...\n')
  
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: { isActive: true },
    include: {
      actionSteps: {
        where: { isActive: true }
      }
    }
  })
  
  const currencyPatterns = [
    /J\$/gi,
    /JMD/gi,
    /USD/gi,
    /\$\d+/g,
    /jamaican/gi,
    /Montego Bay/gi,
    /Kingston/gi
  ]
  
  let foundIssues = false
  
  for (const strategy of strategies) {
    const fieldsToCheck = [
      { name: 'realWorldExample', value: (strategy as any).realWorldExample },
      { name: 'lowBudgetAlternative', value: (strategy as any).lowBudgetAlternative },
      { name: 'whyImportant', value: (strategy as any).whyImportant },
      { name: 'smeDescription', value: (strategy as any).smeDescription },
      { name: 'smeSummary', value: (strategy as any).smeSummary }
    ]
    
    for (const field of fieldsToCheck) {
      if (field.value) {
        let text = ''
        try {
          const parsed = JSON.parse(field.value)
          text = parsed.en || field.value
        } catch {
          text = field.value
        }
        
        for (const pattern of currencyPatterns) {
          if (pattern.test(text)) {
            console.log(`⚠️  Found currency reference in ${strategy.strategyId}:`)
            console.log(`   Field: ${field.name}`)
            console.log(`   Text: ${text.substring(0, 200)}...`)
            console.log('')
            foundIssues = true
            break
          }
        }
      }
    }
    
    // Check action steps
    for (const step of strategy.actionSteps) {
      const stepFieldsToCheck = [
        { name: 'description', value: (step as any).description },
        { name: 'smeAction', value: (step as any).smeAction },
        { name: 'whyThisStepMatters', value: (step as any).whyThisStepMatters },
        { name: 'freeAlternative', value: (step as any).freeAlternative },
        { name: 'estimatedCostJMD', value: (step as any).estimatedCostJMD }
      ]
      
      for (const field of stepFieldsToCheck) {
        if (field.value) {
          const text = typeof field.value === 'string' ? field.value : String(field.value)
          
          for (const pattern of currencyPatterns) {
            if (pattern.test(text)) {
              console.log(`⚠️  Found currency reference in action step ${step.stepId}:`)
              console.log(`   Field: ${field.name}`)
              console.log(`   Text: ${text.substring(0, 200)}...`)
              console.log('')
              foundIssues = true
              break
            }
          }
        }
      }
    }
  }
  
  if (!foundIssues) {
    console.log('✅ No currency-specific references found! All guidance is currency-agnostic.')
  }
}

async function main() {
  try {
    await verifyCurrencyAgnostic()
  } catch (error) {
    console.error('\n❌ Error verifying:')
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

