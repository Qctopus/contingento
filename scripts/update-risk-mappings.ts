/**
 * Update Risk Mappings in Strategies
 * Add more flexible risk identifiers so strategies match wizard risks better
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MAPPINGS = [
  {
    strategyId: 'backup_power',
    applicableRisks: [
      'powerOutage', 'power_outage', 'power', 'electricity', 
      'extended power outage', 'blackout', 'electrical failure'
    ]
  },
  {
    strategyId: 'cybersecurity_protection',
    applicableRisks: [
      'cyberAttack', 'cyber_attack', 'cyber', 'ransomware', 
      'data breach', 'hacking', 'malware', 'phishing'
    ]
  },
  {
    strategyId: 'supply_chain_diversification',
    applicableRisks: [
      'supplyChainDisruption', 'supply_chain', 'supply', 
      'supplier failure', 'delivery delays', 'shortage'
    ]
  },
  {
    strategyId: 'water_conservation',
    applicableRisks: [
      'drought', 'water', 'water shortage', 'water contamination',
      'waterContamination', 'water_contamination'
    ]
  },
  {
    strategyId: 'health_safety_protocols',
    applicableRisks: [
      'pandemicDisease', 'pandemic', 'disease', 'health crisis',
      'outbreak', 'covid', 'virus', 'illness'
    ]
  },
  {
    strategyId: 'equipment_maintenance',
    applicableRisks: [
      'equipment_failure', 'equipment', 'machinery breakdown',
      'business_disruption', 'operational failure', 'breakdown'
    ]
  },
  {
    strategyId: 'financial_resilience',
    applicableRisks: [
      'economicDownturn', 'economic', 'recession', 'financial crisis',
      'cash flow', 'revenue loss', 'bankruptcy'
    ]
  },
  {
    strategyId: 'security_communication_unrest',
    applicableRisks: [
      'civilUnrest', 'civil_unrest', 'unrest', 'riots', 'protests',
      'terrorism', 'violence', 'security threat'
    ]
  },
  {
    strategyId: 'communication_backup',
    applicableRisks: [
      'communication_failure', 'power_outage', 'hurricane', 'equipment_failure',
      'phone outage', 'internet outage', 'network failure', 'connectivity loss'
    ]
  }
]

async function updateMappings() {
  console.log('🔧 UPDATING RISK MAPPINGS')
  console.log('='.repeat(70))
  console.log()

  for (const mapping of MAPPINGS) {
    try {
      await prisma.riskMitigationStrategy.update({
        where: { strategyId: mapping.strategyId },
        data: {
          applicableRisks: JSON.stringify(mapping.applicableRisks)
        }
      })
      console.log(`✅ Updated ${mapping.strategyId}`)
      console.log(`   Now applies to: ${mapping.applicableRisks.slice(0, 5).join(', ')}${mapping.applicableRisks.length > 5 ? '...' : ''}`)
    } catch (error) {
      console.error(`❌ Error updating ${mapping.strategyId}:`, error)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('✅ ALL MAPPINGS UPDATED')
  console.log('='.repeat(70))
  console.log('\nStrategies now have more flexible risk matching!')
  console.log('They will match variations like:')
  console.log('  - "Power Outage" / "Extended Power Outage" / "Electricity"')
  console.log('  - "Cyber Attack" / "Ransomware" / "Data Breach"')
  console.log('  - "Supply Chain Disruption" / "Supplier Failure"')
  console.log('  - etc.')

  await prisma.$disconnect()
}

updateMappings()
  .then(() => {
    console.log('\n✨ Update complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

