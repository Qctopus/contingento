/**
 * Seed default risk data for Admin Units that don't have risk profiles
 * 
 * Run with: npx ts-node scripts/seedAdminUnitRisks.ts
 * Or: npx tsx scripts/seedAdminUnitRisks.ts
 */

import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Use crypto.randomUUID() for generating IDs
const uuidv4 = () => crypto.randomUUID()

// Default risk levels by country/region (can be customized)
// These are reasonable estimates for Caribbean regions
const DEFAULT_RISK_PROFILES: Record<string, {
  hurricaneLevel: number
  floodLevel: number
  earthquakeLevel: number
  droughtLevel: number
  landslideLevel: number
  powerOutageLevel: number
  notes?: string
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

async function seedAdminUnitRisks() {
  console.log('🌍 Starting Admin Unit Risk seeding...\n')

  try {
    // Get all admin units with their country info
    const adminUnits = await prisma.adminUnit.findMany({
      where: { isActive: true },
      include: {
        Country: true,
        AdminUnitRisk: true
      }
    })

    console.log(`📍 Found ${adminUnits.length} active admin units`)

    let created = 0
    let skipped = 0
    let errors = 0

    for (const unit of adminUnits) {
      // Skip if already has risk data
      if (unit.AdminUnitRisk) {
        skipped++
        continue
      }

      // Get country code and default profile
      const countryCode = unit.Country?.code || 'DEFAULT'
      const profile = DEFAULT_RISK_PROFILES[countryCode] || DEFAULT_RISK_PROFILES['DEFAULT']

      try {
        await prisma.adminUnitRisk.create({
          data: {
            id: uuidv4(),
            adminUnitId: unit.id,
            hurricaneLevel: profile.hurricaneLevel,
            hurricaneNotes: `Default risk level for ${countryCode}`,
            floodLevel: profile.floodLevel,
            floodNotes: `Default risk level for ${countryCode}`,
            earthquakeLevel: profile.earthquakeLevel,
            earthquakeNotes: `Default risk level for ${countryCode}`,
            droughtLevel: profile.droughtLevel,
            droughtNotes: `Default risk level for ${countryCode}`,
            landslideLevel: profile.landslideLevel,
            landslideNotes: `Default risk level for ${countryCode}`,
            powerOutageLevel: profile.powerOutageLevel,
            powerOutageNotes: `Default risk level for ${countryCode}`,
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
            updatedBy: 'seed-script'
          }
        })
        created++
        console.log(`  ✅ Created risk profile for: ${unit.name} (${countryCode})`)
      } catch (error) {
        errors++
        console.error(`  ❌ Error creating risk for ${unit.name}:`, error)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`  Created: ${created}`)
    console.log(`  Skipped (already exist): ${skipped}`)
    console.log(`  Errors: ${errors}`)

  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
seedAdminUnitRisks()
  .then(() => {
    console.log('\n✅ Seeding complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })

