import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add Negative Multipliers for Business Types
 * Some business characteristics should REDUCE risk scores
 */

async function addNegativeMultipliers() {
  console.log('➖ Adding Negative Multipliers for Risk Reduction...\n')

  // Define negative multipliers (factors < 1.0 reduce risk)
  const negativeMultipliers = [
    {
      name: 'Cloud-Based Operations',
      description: 'Business operates primarily in the cloud, reducing local power outage impact',
      reasoning: 'Cloud services continue operating even during local power failures',
      multiplierFactor: 0.7, // 30% risk reduction
      applicableHazards: JSON.stringify(['power_outage', 'extended_power_outage']),
      conditionCharacteristic: 'cloud_based',
      conditionValue: true,
      priority: 10
    },
    {
      name: 'Remote Workforce',
      description: 'Employees work remotely, reducing local pandemic restrictions impact',
      reasoning: 'Remote work allows continued operations despite local lockdowns',
      multiplierFactor: 0.6, // 40% risk reduction
      applicableHazards: JSON.stringify(['pandemic', 'pandemic_disease']),
      conditionCharacteristic: 'remote_work',
      conditionValue: true,
      priority: 10
    },
    {
      name: 'Online-Only Business',
      description: 'Digital business model reduces physical location risks',
      reasoning: 'No physical storefront reduces vulnerability to local flooding and fire',
      multiplierFactor: 0.8, // 20% risk reduction
      applicableHazards: JSON.stringify(['flooding', 'fire', 'theft']),
      conditionCharacteristic: 'online_only',
      conditionValue: true,
      priority: 10
    },
    {
      name: 'Digital Services Focus',
      description: 'Service-based business with minimal physical assets',
      reasoning: 'Lower physical asset value reduces damage from disasters',
      multiplierFactor: 0.9, // 10% risk reduction
      applicableHazards: JSON.stringify(['hurricane', 'earthquake', 'flooding', 'fire']),
      conditionCharacteristic: 'service_based',
      conditionValue: true,
      priority: 10
    }
  ]

  console.log('📝 Adding negative multipliers to database...\n')

  for (const multiplier of negativeMultipliers) {
    console.log(`➖ ${multiplier.name}`)
    console.log(`   Factor: ${multiplier.multiplierFactor} (${(1 - multiplier.multiplier.multiplierFactor) * 100}% risk reduction)`)
    console.log(`   Hazards: ${JSON.parse(multiplier.applicableHazards).join(', ')}`)
    console.log(`   Condition: ${multiplier.conditionCharacteristic} = ${multiplier.conditionValue}`)
    console.log('')

    try {
      await (prisma as any).riskMultiplier.upsert({
        where: {
          name: multiplier.name
        },
        update: {
          description: multiplier.description,
          reasoning: multiplier.reasoning,
          multiplierFactor: multiplier.multiplierFactor,
          applicableHazards: multiplier.applicableHazards,
          conditionCharacteristic: multiplier.conditionCharacteristic,
          conditionValue: multiplier.conditionValue,
          priority: multiplier.priority,
          isActive: true
        },
        create: {
          name: multiplier.name,
          description: multiplier.description,
          reasoning: multiplier.reasoning,
          multiplierFactor: multiplier.multiplierFactor,
          applicableHazards: multiplier.applicableHazards,
          conditionCharacteristic: multiplier.conditionCharacteristic,
          conditionValue: multiplier.conditionValue,
          priority: multiplier.priority,
          isActive: true
        }
      })
    } catch (error) {
      console.log(`   ❌ Failed to add ${multiplier.name}: ${error}`)
    }
  }

  console.log('✅ Negative Multipliers Added!')
  console.log('\n🎯 Impact on IT Business:')
  console.log('   • Cloud-based IT: -30% power outage risk')
  console.log('   • Remote work IT: -40% pandemic risk')
  console.log('   • Online IT: -20% flooding/fire/theft risk')
  console.log('   • Service IT: -10% physical disaster risk')
  console.log('\n📋 Total risk reduction potential: Up to 60% for fully digital IT businesses!')
}

async function main() {
  try {
    await addNegativeMultipliers()
  } catch (error) {
    console.error('❌ Error adding negative multipliers:', error)
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

