import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Clean up risk profile JSON to use only camelCase keys matching RISK_TYPES
 */

async function cleanupRiskProfiles() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   CLEANUP RISK PROFILE KEYS                                   ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  const countries = await prisma.country.findMany({
    where: { code: { in: ['JM', 'BB', 'BS'] } },
    include: {
      adminUnits: {
        include: {
          adminUnitRisk: true
        }
      }
    }
  })
  
  let updated = 0
  
  for (const country of countries) {
    console.log(`\n🌍 Processing ${country.name} (${country.code})...`)
    
    for (const unit of country.adminUnits) {
      if (!unit.adminUnitRisk) continue
      
      let profile: any = {}
      try {
        profile = JSON.parse(unit.adminUnitRisk.riskProfileJson || '{}')
      } catch (e) {
        continue
      }
      
      // Create clean profile with only camelCase keys
      const cleanProfile: any = {}
      
      // Core risks - use existing or direct fields
      if (profile.hurricane) {
        cleanProfile.hurricane = profile.hurricane
      } else if (unit.adminUnitRisk) {
        cleanProfile.hurricane = { level: unit.adminUnitRisk.hurricaneLevel || 0, notes: unit.adminUnitRisk.hurricaneNotes || '' }
      }
      
      // Handle flood/flooding
      if (profile.flood) {
        cleanProfile.flood = profile.flood
      } else if (profile.flooding) {
        cleanProfile.flood = profile.flooding
      } else if (unit.adminUnitRisk) {
        cleanProfile.flood = { level: unit.adminUnitRisk.floodLevel || 0, notes: unit.adminUnitRisk.floodNotes || '' }
      }
      
      if (profile.earthquake) {
        cleanProfile.earthquake = profile.earthquake
      } else if (unit.adminUnitRisk) {
        cleanProfile.earthquake = { level: unit.adminUnitRisk.earthquakeLevel || 0, notes: unit.adminUnitRisk.earthquakeNotes || '' }
      }
      
      if (profile.drought) {
        cleanProfile.drought = profile.drought
      } else if (unit.adminUnitRisk) {
        cleanProfile.drought = { level: unit.adminUnitRisk.droughtLevel || 0, notes: unit.adminUnitRisk.droughtNotes || '' }
      }
      
      if (profile.landslide) {
        cleanProfile.landslide = profile.landslide
      } else if (unit.adminUnitRisk) {
        cleanProfile.landslide = { level: unit.adminUnitRisk.landslideLevel || 0, notes: unit.adminUnitRisk.landslideNotes || '' }
      }
      
      // Handle powerOutage/power_outage
      if (profile.powerOutage) {
        cleanProfile.powerOutage = profile.powerOutage
      } else if (profile.power_outage) {
        cleanProfile.powerOutage = profile.power_outage
      } else if (unit.adminUnitRisk) {
        cleanProfile.powerOutage = { level: unit.adminUnitRisk.powerOutageLevel || 0, notes: unit.adminUnitRisk.powerOutageNotes || '' }
      }
      
      // New risks - prefer camelCase, fallback to snake_case
      if (profile.fire) {
        cleanProfile.fire = profile.fire
      }
      
      if (profile.cyberAttack) {
        cleanProfile.cyberAttack = profile.cyberAttack
      } else if (profile.cyber_attack) {
        cleanProfile.cyberAttack = profile.cyber_attack
      }
      
      if (profile.terrorism) {
        cleanProfile.terrorism = profile.terrorism
      }
      
      if (profile.pandemicDisease) {
        cleanProfile.pandemicDisease = profile.pandemicDisease
      } else if (profile.pandemic) {
        cleanProfile.pandemicDisease = profile.pandemic
      }
      
      if (profile.economicDownturn) {
        cleanProfile.economicDownturn = profile.economicDownturn
      } else if (profile.economic_downturn) {
        cleanProfile.economicDownturn = profile.economic_downturn
      }
      
      if (profile.supplyChainDisruption) {
        cleanProfile.supplyChainDisruption = profile.supplyChainDisruption
      } else if (profile.supply_chain) {
        cleanProfile.supplyChainDisruption = profile.supply_chain
      }
      
      if (profile.civilUnrest) {
        cleanProfile.civilUnrest = profile.civilUnrest
      } else if (profile.civil_unrest) {
        cleanProfile.civilUnrest = profile.civil_unrest
      }
      
      // Update the risk profile
      await prisma.adminUnitRisk.update({
        where: { id: unit.adminUnitRisk.id },
        data: {
          riskProfileJson: JSON.stringify(cleanProfile),
          lastUpdated: new Date(),
          updatedBy: 'cleanup_risk_keys'
        }
      })
      
      console.log(`  ✓ Cleaned: ${unit.name}`)
      updated++
    }
  }
  
  console.log('\n' + '═'.repeat(65))
  console.log(`✅ Cleaned ${updated} risk profiles`)
  console.log('')
}

async function main() {
  try {
    await cleanupRiskProfiles()
  } catch (error) {
    console.error('\n❌ Error:')
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

