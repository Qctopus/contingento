import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateSupplyChainRisks() {
  console.log('🔄 Updating Supply Chain Strategy applicableRisks...')

  await prisma.riskMitigationStrategy.update({
    where: { strategyId: 'supply_chain_protection_comprehensive' },
    data: {
      applicableRisks: JSON.stringify([
        'supply_chain_disruption',
        'supplier_failure',
        'transportation_delay',
        'geopolitical_event',
        'pandemic',
        'pandemic_impact',
        'port_closure',
        'fuel_shortage'
      ])
    }
  })

  console.log('✅ Supply Chain Strategy updated to include both "pandemic" and "pandemic_impact"')
}

async function main() {
  try {
    await updateSupplyChainRisks()
  } catch (error) {
    console.error('❌ Error updating supply chain risks:', error)
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


