import { PrismaClient } from '@prisma/client'
import { JAMAICA_PARISHES } from './seedJamaicaParishesComprehensive'
import { seedBarbadosAdminUnits } from './seedBarbadosAdminUnits'
import { seedBahamasAdminUnits } from './seedBahamasAdminUnits'

const prisma = new PrismaClient()

/**
 * Comprehensive seeding script for Jamaica, Barbados, and Bahamas
 * Ensures countries exist and admin units are properly seeded
 */

async function ensureCountry(code: string, name: string, region: string = 'Caribbean') {
  let country = await prisma.country.findUnique({
    where: { code }
  })
  
  if (!country) {
    country = await prisma.country.create({
      data: {
        code,
        name,
        region,
        isActive: true
      }
    })
    console.log(`  ✓ Created country: ${name} (${code})`)
  } else {
    // Update if needed
    if (country.name !== name || country.region !== region) {
      country = await prisma.country.update({
        where: { code },
        data: { name, region }
      })
      console.log(`  ↻ Updated country: ${name} (${code})`)
    } else {
      console.log(`  ⏭️  Country already exists: ${name} (${code})`)
    }
  }
  
  return country
}

async function seedJamaicaAdminUnits() {
  console.log('\n🇯🇲 Seeding Jamaica administrative units (parishes)...\n')
  
  // Ensure Jamaica country exists
  const jamaica = await ensureCountry('JM', 'Jamaica', 'Caribbean')
  
  let unitsCreated = 0
  let unitsUpdated = 0
  let risksCreated = 0
  let risksUpdated = 0
  
  for (const parishData of JAMAICA_PARISHES) {
    const { risks, countryCode, ...unitInfo } = parishData
    
    // Find or create admin unit
    let adminUnit = await prisma.adminUnit.findFirst({
      where: {
        countryId: jamaica.id,
        name: unitInfo.name
      }
    })
    
    if (adminUnit) {
      adminUnit = await prisma.adminUnit.update({
        where: { id: adminUnit.id },
        data: {
          ...unitInfo,
          countryId: jamaica.id,
          type: 'parish' // Jamaica uses parishes
        }
      })
      console.log(`  ↻ Updated: ${unitInfo.name}`)
      unitsUpdated++
    } else {
      adminUnit = await prisma.adminUnit.create({
        data: {
          ...unitInfo,
          countryId: jamaica.id,
          type: 'parish'
        }
      })
      console.log(`  ✓ Created: ${unitInfo.name}`)
      unitsCreated++
    }
    
    // Create or update risk data
    const existingRisk = await prisma.adminUnitRisk.findUnique({
      where: { adminUnitId: adminUnit.id }
    })
    
    const riskData = {
      adminUnitId: adminUnit.id,
      hurricaneLevel: risks.hurricaneLevel,
      hurricaneNotes: risks.hurricaneNotes,
      floodLevel: risks.floodLevel,
      floodNotes: risks.floodNotes,
      earthquakeLevel: risks.earthquakeLevel,
      earthquakeNotes: risks.earthquakeNotes,
      droughtLevel: risks.droughtLevel,
      droughtNotes: risks.droughtNotes,
      landslideLevel: risks.landslideLevel,
      landslideNotes: risks.landslideNotes,
      powerOutageLevel: risks.powerOutageLevel,
      powerOutageNotes: risks.powerOutageNotes,
      riskProfileJson: JSON.stringify({
        hurricane: { level: risks.hurricaneLevel, notes: risks.hurricaneNotes },
        flooding: { level: risks.floodLevel, notes: risks.floodNotes },
        earthquake: { level: risks.earthquakeLevel, notes: risks.earthquakeNotes },
        drought: { level: risks.droughtLevel, notes: risks.droughtNotes },
        landslide: { level: risks.landslideLevel, notes: risks.landslideNotes },
        power_outage: { level: risks.powerOutageLevel, notes: risks.powerOutageNotes }
      }),
      lastUpdated: new Date(),
      updatedBy: 'system_seed',
      isActive: true
    }
    
    if (existingRisk) {
      await prisma.adminUnitRisk.update({
        where: { id: existingRisk.id },
        data: riskData
      })
      console.log(`    ↻ Updated risks for ${unitInfo.name}`)
      risksUpdated++
    } else {
      await prisma.adminUnitRisk.create({
        data: riskData
      })
      console.log(`    ✓ Created risks for ${unitInfo.name}`)
      risksCreated++
    }
  }
  
  console.log(`\n✅ Jamaica Summary:`)
  console.log(`   - Admin units created: ${unitsCreated}`)
  console.log(`   - Admin units updated: ${unitsUpdated}`)
  console.log(`   - Risk profiles created: ${risksCreated}`)
  console.log(`   - Risk profiles updated: ${risksUpdated}`)
  console.log(`   - Total parishes: ${JAMAICA_PARISHES.length}`)
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   SEED JAMAICA, BARBADOS & BAHAMAS                           ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  try {
    // Ensure all three countries exist
    console.log('🌍 Ensuring countries exist...\n')
    await ensureCountry('JM', 'Jamaica', 'Caribbean')
    await ensureCountry('BB', 'Barbados', 'Caribbean')
    await ensureCountry('BS', 'Bahamas', 'Caribbean')
    
    // Seed Jamaica
    await seedJamaicaAdminUnits()
    
    // Seed Barbados
    await seedBarbadosAdminUnits()
    
    // Seed Bahamas
    await seedBahamasAdminUnits()
    
    console.log('\n' + '═'.repeat(65))
    console.log('✅ ALL SEEDING COMPLETE!')
    console.log('═'.repeat(65))
    console.log('')
    console.log('Countries seeded:')
    console.log('  🇯🇲 Jamaica - Parishes with risk assessments')
    console.log('  🇧🇧 Barbados - Parishes with risk assessments')
    console.log('  🇧🇸 Bahamas - Islands/Districts with risk assessments')
    console.log('')
    console.log('All admin units include:')
    console.log('  ✓ Population and geographic data')
    console.log('  ✓ Risk assessments (hurricane, flood, earthquake, etc.)')
    console.log('  ✓ Coordinates for mapping')
    console.log('')
    
  } catch (error) {
    console.error('\n❌ Error during seeding:')
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedJamaicaAdminUnits, ensureCountry }

