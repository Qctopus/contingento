const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Mock strategy templates for debugging
const mockStrategyTemplates = [
  { id: 'backup_generator', name: 'Backup Power Generator' },
  { id: 'emergency_cash_fund', name: 'Emergency Cash Reserve' },
  { id: 'supplier_diversification', name: 'Supplier Diversification Plan' },
  { id: 'evacuation_procedures', name: 'Emergency Evacuation Procedures' },
  { id: 'elevated_storage', name: 'Elevated Storage System' },
  { id: 'insurance_review', name: 'Comprehensive Insurance Coverage' },
  { id: 'legacy_communication_plan', name: 'Emergency Communication System' },
  { id: 'legacy_business_recovery', name: 'Rapid Business Recovery Plan' }
]

async function debugMigration() {
  try {
    console.log('🔍 Debugging migration...')
    
    const strategies = await prisma.riskMitigationStrategy.findMany()
    console.log(`\n📊 Database strategies (${strategies.length}):`)
    strategies.forEach(s => console.log(`   ${s.strategyId} - ${s.name}`))
    
    console.log(`\n📋 Template strategies (${mockStrategyTemplates.length}):`)
    mockStrategyTemplates.forEach(t => console.log(`   ${t.id} - ${t.name}`))
    
    console.log(`\n🔗 Matching strategies:`)
    for (const template of mockStrategyTemplates) {
      const strategy = strategies.find(s => s.strategyId === template.id)
      if (strategy) {
        console.log(`   ✅ ${template.id} matches DB strategy ${strategy.id}`)
      } else {
        console.log(`   ❌ ${template.id} NOT found in database`)
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugMigration()
