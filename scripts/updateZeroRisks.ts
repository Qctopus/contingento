/**
 * Update Admin Unit Risks that have all-zero values with sensible defaults
 * 
 * Run with: npx tsx scripts/updateZeroRisks.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default risk levels by country code
const DEFAULT_RISK_PROFILES: Record<string, {
  hurricaneLevel: number
  floodLevel: number
  earthquakeLevel: number
  droughtLevel: number
  landslideLevel: number
  powerOutageLevel: number
}> = {
  // Bahamas - high hurricane risk, moderate flood, low earthquake
  BS: {
    hurricaneLevel: 8,
    floodLevel: 5,
    earthquakeLevel: 2,
    droughtLevel: 3,
    landslideLevel: 1,
    powerOutageLevel: 5
  },
  // Jamaica - high hurricane/flood, moderate earthquake
  JM: {
    hurricaneLevel: 8,
    floodLevel: 7,
    earthquakeLevel: 4,
    droughtLevel: 4,
    landslideLevel: 5,
    powerOutageLevel: 5
  },
  // Trinidad and Tobago - lower hurricane risk, higher flood
  TT: {
    hurricaneLevel: 3,
    floodLevel: 6,
    earthquakeLevel: 5,
    droughtLevel: 3,
    landslideLevel: 4,
    powerOutageLevel: 4
  },
  // Barbados - moderate hurricane, flood
  BB: {
    hurricaneLevel: 6,
    floodLevel: 5,
    earthquakeLevel: 2,
    droughtLevel: 4,
    landslideLevel: 2,
    powerOutageLevel: 4
  },
  // Haiti - very high earthquake/flood risk
  HT: {
    hurricaneLevel: 8,
    floodLevel: 8,
    earthquakeLevel: 8,
    droughtLevel: 5,
    landslideLevel: 6,
    powerOutageLevel: 7
  },
  // Dominican Republic
  DO: {
    hurricaneLevel: 8,
    floodLevel: 7,
    earthquakeLevel: 5,
    droughtLevel: 4,
    landslideLevel: 5,
    powerOutageLevel: 5
  },
  // Default for other Caribbean countries
  DEFAULT: {
    hurricaneLevel: 6,
    floodLevel: 5,
    earthquakeLevel: 3,
    droughtLevel: 4,
    landslideLevel: 3,
    powerOutageLevel: 5
  }
}

async function updateZeroRisks() {
  console.log('🔄 Checking for Admin Units with zero risk values...\n')

  try {
    // Get all admin unit risks with their admin unit and country info
    const adminUnitRisks = await prisma.adminUnitRisk.findMany({
      include: {
        AdminUnit: {
          include: {
            Country: true
          }
        }
      }
    })

    console.log(`📍 Found ${adminUnitRisks.length} admin unit risk records`)

    let updated = 0
    let skipped = 0

    for (const risk of adminUnitRisks) {
      // Check if all basic risk levels are 0
      const hasZeroRisks = 
        risk.hurricaneLevel === 0 &&
        risk.floodLevel === 0 &&
        risk.earthquakeLevel === 0 &&
        risk.droughtLevel === 0 &&
        risk.landslideLevel === 0 &&
        risk.powerOutageLevel === 0

      if (!hasZeroRisks) {
        skipped++
        continue
      }

      // Get country code and default profile
      const countryCode = risk.AdminUnit?.Country?.code || 'DEFAULT'
      const profile = DEFAULT_RISK_PROFILES[countryCode] || DEFAULT_RISK_PROFILES['DEFAULT']

      console.log(`  📝 Updating ${risk.AdminUnit?.name || risk.adminUnitId} (${countryCode}) with default risks...`)

      await prisma.adminUnitRisk.update({
        where: { id: risk.id },
        data: {
          hurricaneLevel: profile.hurricaneLevel,
          hurricaneNotes: `Default estimate for ${countryCode}`,
          floodLevel: profile.floodLevel,
          floodNotes: `Default estimate for ${countryCode}`,
          earthquakeLevel: profile.earthquakeLevel,
          earthquakeNotes: `Default estimate for ${countryCode}`,
          droughtLevel: profile.droughtLevel,
          droughtNotes: `Default estimate for ${countryCode}`,
          landslideLevel: profile.landslideLevel,
          landslideNotes: `Default estimate for ${countryCode}`,
          powerOutageLevel: profile.powerOutageLevel,
          powerOutageNotes: `Default estimate for ${countryCode}`,
          riskProfileJson: JSON.stringify({
            cyber_attack: { level: 3, notes: 'Default estimate' },
            pandemic_disease: { level: 4, notes: 'Default estimate' },
            economic_downturn: { level: 4, notes: 'Default estimate' },
            supply_chain_disruption: { level: 5, notes: 'Caribbean import dependency' },
            civil_unrest: { level: 2, notes: 'Default estimate' },
            terrorism: { level: 1, notes: 'Low risk region' },
            fire: { level: 3, notes: 'Default estimate' }
          }),
          updatedAt: new Date(),
          updatedBy: 'update-zero-risks-script'
        }
      })
      updated++
    }

    console.log('\n📊 Summary:')
    console.log(`  Updated: ${updated}`)
    console.log(`  Skipped (already has data): ${skipped}`)

  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
updateZeroRisks()
  .then(() => {
    console.log('\n✅ Update complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })

