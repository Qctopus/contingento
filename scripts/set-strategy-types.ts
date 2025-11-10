/**
 * Set Strategy Types
 * Simple script to set strategyType for all existing strategies
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setTypes() {
  console.log('🔧 SETTING STRATEGY TYPES')
  console.log('='.repeat(70))
  console.log()
  
  // Risk-Specific Strategies (one comprehensive strategy per risk)
  const RISK_SPECIFIC = [
    'hurricane_preparation',
    'flood_prevention',
    'fire_detection_suppression',
    'earthquake_preparedness',
    'backup_power',
    'cybersecurity_protection',
    'supply_chain_diversification',
    'water_conservation',
    'health_safety_protocols'
  ]
  
  // Generic Strategies (apply to multiple risks)
  const GENERIC = [
    'emergency_response_plan',
    'business_recovery_restoration',
    'financial_resilience',
    'security_communication_unrest',
    'communication_backup',
    'equipment_maintenance'
  ]
  
  console.log('📝 Setting risk-specific strategies...\n')
  for (const stratId of RISK_SPECIFIC) {
    const result = await prisma.riskMitigationStrategy.updateMany({
      where: { strategyId: stratId },
      data: { strategyType: 'risk_specific' }
    })
    if (result.count > 0) {
      console.log(`   ✅ ${stratId} → risk_specific`)
    }
  }
  
  console.log('\n📝 Setting generic strategies...\n')
  for (const stratId of GENERIC) {
    const result = await prisma.riskMitigationStrategy.updateMany({
      where: { strategyId: stratId },
      data: { strategyType: 'generic' }
    })
    if (result.count > 0) {
      console.log(`   ✅ ${stratId} → generic`)
    }
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('✅ COMPLETE')
  console.log('='.repeat(70))
  
  const final = await prisma.riskMitigationStrategy.findMany({
    where: { isActive: true },
    select: { strategyId: true, strategyType: true }
  })
  
  const riskSpecific = final.filter(s => s.strategyType === 'risk_specific')
  const generic = final.filter(s => s.strategyType === 'generic')
  
  console.log(`\nRisk-Specific: ${riskSpecific.length}`)
  console.log(`Generic: ${generic.length}`)
  console.log(`Total: ${final.length}`)
  
  await prisma.$disconnect()
}

setTypes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })

