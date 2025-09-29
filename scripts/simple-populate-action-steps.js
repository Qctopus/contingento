const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Sample action steps for testing
const sampleActionSteps = [
  {
    strategyId: 'backup_generator',
    steps: [
      {
        stepId: 'step_1',
        phase: 'immediate',
        title: 'Calculate Your Power Needs',
        description: 'Figure out how much electricity your most important equipment uses.',
        smeAction: 'Add up the watts needed for your essential equipment',
        timeframe: '1-2 days',
        responsibility: 'Business Owner',
        estimatedCost: 'Free',
        resources: JSON.stringify(['Electric bills', 'Equipment manuals', 'Calculator']),
        checklist: JSON.stringify([
          'List all essential equipment (lights, refrigerators, computers, etc.)',
          'Check wattage on each piece of equipment',
          'Add up total wattage needed',
          'Add 20% extra for safety margin'
        ])
      },
      {
        stepId: 'step_2',
        phase: 'short_term',
        title: 'Get Generator Quotes',
        description: 'Contact at least 3 suppliers to compare generator prices and installation costs.',
        smeAction: 'Call generator suppliers and get written quotes',
        timeframe: '3-5 days',
        responsibility: 'Business Owner',
        estimatedCost: 'Free',
        resources: JSON.stringify(['Phone', 'Internet', 'Power requirements list']),
        checklist: JSON.stringify([
          'Search for generator dealers in your area',
          'Call at least 3 different suppliers',
          'Ask for written quotes including installation'
        ])
      }
    ]
  },
  {
    strategyId: 'emergency_cash_fund',
    steps: [
      {
        stepId: 'step_1',
        phase: 'immediate',
        title: 'Calculate Monthly Expenses',
        description: 'Add up all your monthly business expenses to know how much cash you need.',
        smeAction: 'Calculate how much money your business needs each month',
        timeframe: '2-3 hours',
        responsibility: 'Business Owner',
        estimatedCost: 'Free',
        resources: JSON.stringify(['Bank statements', 'Bills', 'Calculator']),
        checklist: JSON.stringify([
          'List all monthly expenses (rent, utilities, supplies, etc.)',
          'Add up employee wages',
          'Include loan payments',
          'Calculate total monthly cost'
        ])
      }
    ]
  }
]

async function populateActionSteps() {
  try {
    console.log('🔄 Populating action steps...')

    for (const strategyData of sampleActionSteps) {
      // Find the strategy in the database
      const strategy = await prisma.riskMitigationStrategy.findUnique({
        where: { strategyId: strategyData.strategyId }
      })

      if (!strategy) {
        console.log(`⚠️  Strategy not found: ${strategyData.strategyId}`)
        continue
      }

      console.log(`📋 Adding ${strategyData.steps.length} action steps for: ${strategy.name}`)

      // Delete existing action steps for this strategy
      await prisma.actionStep.deleteMany({
        where: { strategyId: strategy.id }
      })

      // Create new action steps
      for (let i = 0; i < strategyData.steps.length; i++) {
        const stepData = strategyData.steps[i]
        
        await prisma.actionStep.create({
          data: {
            strategyId: strategy.id,
            stepId: stepData.stepId,
            phase: stepData.phase,
            title: stepData.title,
            description: stepData.description,
            smeAction: stepData.smeAction,
            timeframe: stepData.timeframe,
            responsibility: stepData.responsibility,
            estimatedCost: stepData.estimatedCost,
            estimatedCostJMD: stepData.estimatedCost,
            resources: stepData.resources,
            checklist: stepData.checklist,
            sortOrder: i
          }
        })
      }

      // Update strategy with sample additional data
      await prisma.riskMitigationStrategy.update({
        where: { id: strategy.id },
        data: {
          smeDescription: `Simple explanation for ${strategy.name}`,
          whyImportant: `This is important because it protects your business`,
          helpfulTips: JSON.stringify(['Start early', 'Get help if needed', 'Keep records']),
          commonMistakes: JSON.stringify(['Waiting too long', 'Not getting quotes']),
          successMetrics: JSON.stringify(['System installed', 'Tested successfully'])
        }
      })
    }

    console.log('✅ Action steps populated successfully!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateActionSteps()
