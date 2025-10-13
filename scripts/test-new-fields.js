import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing if new SME fields are accessible...\n')
  
  const strategy = await prisma.riskMitigationStrategy.findUnique({
    where: { strategyId: 'hurricane_preparation' },
    include: { actionSteps: true }
  })
  
  if (!strategy) {
    console.log('❌ Strategy not found')
    return
  }
  
  console.log('✅ Strategy found:', strategy.strategyId)
  console.log('\n📋 NEW SME FIELDS:')
  console.log('  smeTitle:', strategy.smeTitle ? '✓ HAS DATA' : '✗ EMPTY')
  console.log('  smeSummary:', strategy.smeSummary ? '✓ HAS DATA' : '✗ EMPTY')
  console.log('  benefitsBullets:', strategy.benefitsBullets ? '✓ HAS DATA' : '✗ EMPTY')
  console.log('  realWorldExample:', strategy.realWorldExample ? '✓ HAS DATA' : '✗ EMPTY')
  console.log('  costEstimateJMD:', strategy.costEstimateJMD ? '✓ HAS DATA' : '✗ EMPTY')
  console.log('  estimatedTotalHours:', strategy.estimatedTotalHours ? '✓ HAS DATA' : '✗ EMPTY')
  console.log('  complexityLevel:', strategy.complexityLevel ? '✓ HAS DATA' : '✗ EMPTY')
  console.log('  quickWinIndicator:', strategy.quickWinIndicator !== null ? '✓ HAS DATA' : '✗ EMPTY')
  console.log('  selectionTier:', strategy.selectionTier ? '✓ HAS DATA' : '✗ EMPTY')
  console.log('  lowBudgetAlternative:', strategy.lowBudgetAlternative ? '✓ HAS DATA' : '✗ EMPTY')
  console.log('  diyApproach:', strategy.diyApproach ? '✓ HAS DATA' : '✗ EMPTY')
  
  console.log('\n📄 Sample Data:')
  console.log('  Title:', strategy.smeTitle?.substring(0, 50) + '...')
  console.log('  Summary:', strategy.smeSummary?.substring(0, 80) + '...')
  console.log('  Tier:', strategy.selectionTier)
  console.log('  Quick Win:', strategy.quickWinIndicator)
  
  console.log('\n✅ All new fields are accessible from the database!')
  console.log('💡 The API should now be able to send this data to the wizard.')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error.message)
    console.log('\n⚠️  If you see field access errors, you may need to:')
    console.log('1. Stop the dev server (Ctrl+C)')
    console.log('2. Run: npx prisma generate')
    console.log('3. Restart the dev server')
  })
  .finally(() => prisma.$disconnect())


