/**
 * Set Strategy Types using raw SQL
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setTypes() {
  console.log('🔧 SETTING STRATEGY TYPES (via SQL)')
  console.log('='.repeat(70))
  console.log()
  
  // Risk-Specific Strategies
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
  
  console.log('📝 Setting risk-specific strategies...\n')
  for (const stratId of RISK_SPECIFIC) {
    await prisma.$executeRaw`
      UPDATE "RiskMitigationStrategy"
      SET "strategyType" = 'risk_specific'
      WHERE "strategyId" = ${stratId}
    `
    console.log(`   ✅ ${stratId} → risk_specific`)
  }
  
  // Generic Strategies
  const GENERIC = [
    'emergency_response_plan',
    'business_recovery_restoration',
    'financial_resilience',
    'security_communication_unrest',
    'communication_backup',
    'equipment_maintenance'
  ]
  
  console.log('\n📝 Setting generic strategies...\n')
  for (const stratId of GENERIC) {
    await prisma.$executeRaw`
      UPDATE "RiskMitigationStrategy"
      SET "strategyType" = 'generic'
      WHERE "strategyId" = ${stratId}
    `
    console.log(`   ✅ ${stratId} → generic`)
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('✅ COMPLETE')
  console.log('='.repeat(70))
  
  // Verify
  const riskSpecificCount = await prisma.$queryRaw`
    SELECT COUNT(*) FROM "RiskMitigationStrategy" 
    WHERE "strategyType" = 'risk_specific' AND "isActive" = true
  `
  const genericCount = await prisma.$queryRaw`
    SELECT COUNT(*) FROM "RiskMitigationStrategy" 
    WHERE "strategyType" = 'generic' AND "isActive" = true
  `
  
  console.log(`\nRisk-Specific: ${(riskSpecificCount as any)[0].count}`)
  console.log(`Generic: ${(genericCount as any)[0].count}`)
  
  await prisma.$disconnect()
}

setTypes()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })

