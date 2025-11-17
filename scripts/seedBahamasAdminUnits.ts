import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Bahamas Administrative Units (Islands/Districts)
 * The Bahamas consists of 700+ islands, but only ~30 are inhabited
 * These are the major populated islands/districts
 */

const BAHAMAS_ADMIN_UNITS = [
  {
    name: 'New Providence',
    type: 'island',
    region: 'Northwest',
    population: 274400,
    area: 207.0,
    elevation: 5,
    coordinates: JSON.stringify({ lat: 25.0443, lng: -77.3504 }),
    risks: {
      hurricaneLevel: 10,
      hurricaneNotes: 'Nassau capital, direct hurricane path, major population and infrastructure at risk',
      floodLevel: 8,
      floodNotes: 'Low-lying island, storm surge flooding, urban drainage issues in Nassau',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk, stable Caribbean plate',
      droughtLevel: 6,
      droughtNotes: 'Small island, limited freshwater, high population demand, desalination dependent',
      landslideLevel: 1,
      landslideNotes: 'Flat island, virtually no landslide risk',
      powerOutageLevel: 7,
      powerOutageNotes: 'Hurricane vulnerability, but capital has priority restoration'
    }
  },
  {
    name: 'Grand Bahama',
    type: 'island',
    region: 'Northwest',
    population: 51756,
    area: 1373.0,
    elevation: 5,
    coordinates: JSON.stringify({ lat: 26.6583, lng: -78.3958 }),
    risks: {
      hurricaneLevel: 10,
      hurricaneNotes: 'Freeport area, extremely hurricane vulnerable, Hurricane Dorian 2019 devastation',
      floodLevel: 9,
      floodNotes: 'Very low elevation, extensive flooding during hurricanes, storm surge catastrophic',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 6,
      droughtNotes: 'Tourism and residential demand, water supply challenges',
      landslideLevel: 1,
      landslideNotes: 'Flat island topography',
      powerOutageLevel: 8,
      powerOutageNotes: 'Severe hurricane damage history, long restoration times'
    }
  },
  {
    name: 'Abaco',
    type: 'island',
    region: 'North',
    population: 17224,
    area: 1681.0,
    elevation: 5,
    coordinates: JSON.stringify({ lat: 26.3333, lng: -77.1000 }),
    risks: {
      hurricaneLevel: 10,
      hurricaneNotes: 'Northern Bahamas, Hurricane Dorian direct hit 2019, extreme vulnerability',
      floodLevel: 9,
      floodNotes: 'Low-lying cays, complete inundation possible, storm surge devastating',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 7,
      droughtNotes: 'Outer islands, limited water infrastructure, rainwater dependent',
      landslideLevel: 1,
      landslideNotes: 'Flat cays and islands',
      powerOutageLevel: 9,
      powerOutageNotes: 'Remote location, severe hurricane damage, very long restoration'
    }
  },
  {
    name: 'Eleuthera',
    type: 'island',
    region: 'Central',
    population: 11165,
    area: 518.0,
    elevation: 10,
    coordinates: JSON.stringify({ lat: 25.1500, lng: -76.1500 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Long narrow island, exposed to Atlantic and Caribbean storms',
      floodLevel: 8,
      floodNotes: 'Narrow island, both coasts vulnerable to storm surge',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 7,
      droughtNotes: 'Limited water sources, agricultural and tourism demand',
      landslideLevel: 2,
      landslideNotes: 'Some elevated areas but minimal risk',
      powerOutageLevel: 8,
      powerOutageNotes: 'Outer island, infrastructure challenges'
    }
  },
  {
    name: 'Cat Island',
    type: 'island',
    region: 'Central',
    population: 1522,
    area: 389.0,
    elevation: 63,
    coordinates: JSON.stringify({ lat: 24.4167, lng: -75.5000 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Central Bahamas, exposed to hurricane paths',
      floodLevel: 7,
      floodNotes: 'Highest elevation in Bahamas helps but coasts still vulnerable',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 8,
      droughtNotes: 'Small population but limited water infrastructure',
      landslideLevel: 3,
      landslideNotes: 'Mount Alvernia (highest point) has some risk but generally low',
      powerOutageLevel: 9,
      powerOutageNotes: 'Remote island, limited infrastructure, very long restoration'
    }
  },
  {
    name: 'Andros',
    type: 'island',
    region: 'Central',
    population: 7800,
    area: 5957.0,
    elevation: 5,
    coordinates: JSON.stringify({ lat: 24.7000, lng: -77.9667 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Largest island, western position, hurricane vulnerable',
      floodLevel: 8,
      floodNotes: 'Low-lying, extensive wetlands, major flooding during hurricanes',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 6,
      droughtNotes: 'Largest freshwater lens in Bahamas, better water availability',
      landslideLevel: 1,
      landslideNotes: 'Flat terrain, wetlands, no landslide risk',
      powerOutageLevel: 9,
      powerOutageNotes: 'Sparse population, limited infrastructure, slow restoration'
    }
  },
  {
    name: 'Exuma',
    type: 'district',
    region: 'Central',
    population: 7314,
    area: 290.0,
    elevation: 5,
    coordinates: JSON.stringify({ lat: 23.6167, lng: -75.9667 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Chain of cays, tourism area, hurricane exposed',
      floodLevel: 8,
      floodNotes: 'Low-lying cays, storm surge across narrow islands',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 7,
      droughtNotes: 'Tourism demand, limited water sources',
      landslideLevel: 1,
      landslideNotes: 'Flat cays',
      powerOutageLevel: 8,
      powerOutageNotes: 'Outer islands, tourism areas get priority but still challenging'
    }
  },
  {
    name: 'Long Island',
    type: 'island',
    region: 'South',
    population: 3094,
    area: 596.0,
    elevation: 15,
    coordinates: JSON.stringify({ lat: 23.3000, lng: -75.1000 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Southern Bahamas, hurricane path, long narrow exposure',
      floodLevel: 7,
      floodNotes: 'Both coasts vulnerable, narrow island',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 8,
      droughtNotes: 'Small population, very limited water infrastructure',
      landslideLevel: 2,
      landslideNotes: 'Some cliffs but generally low risk',
      powerOutageLevel: 9,
      powerOutageNotes: 'Remote, small population, very limited infrastructure'
    }
  },
  {
    name: 'San Salvador',
    type: 'island',
    region: 'Central East',
    population: 930,
    area: 163.0,
    elevation: 10,
    coordinates: JSON.stringify({ lat: 24.0500, lng: -74.5333 }),
    risks: {
      hurricaneLevel: 10,
      hurricaneNotes: 'Eastern Bahamas, direct Atlantic hurricane exposure, very vulnerable',
      floodLevel: 8,
      floodNotes: 'Small island, complete storm surge inundation possible',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 8,
      droughtNotes: 'Tiny population but rainwater dependent',
      landslideLevel: 1,
      landslideNotes: 'Flat island',
      powerOutageLevel: 9,
      powerOutageNotes: 'Very remote, minimal infrastructure'
    }
  },
  {
    name: 'Bimini',
    type: 'district',
    region: 'Northwest',
    population: 2000,
    area: 23.0,
    elevation: 3,
    coordinates: JSON.stringify({ lat: 25.7333, lng: -79.3000 }),
    risks: {
      hurricaneLevel: 10,
      hurricaneNotes: 'Closest to Florida, hurricane corridor, extremely exposed',
      floodLevel: 9,
      floodNotes: 'Extremely low elevation, complete inundation risk',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 7,
      droughtNotes: 'Small islands, tourism demand, water barge dependent',
      landslideLevel: 1,
      landslideNotes: 'Flat small islands',
      powerOutageLevel: 9,
      powerOutageNotes: 'Small islands, vulnerable infrastructure'
    }
  },
  {
    name: 'Inagua',
    type: 'district',
    region: 'South',
    population: 913,
    area: 1551.0,
    elevation: 5,
    coordinates: JSON.stringify({ lat: 21.0667, lng: -73.3333 }),
    risks: {
      hurricaneLevel: 10,
      hurricaneNotes: 'Southernmost Bahamas, hurricane alley, extreme exposure',
      floodLevel: 8,
      floodNotes: 'Low-lying, salt production areas flood easily',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 8,
      droughtNotes: 'Very remote, minimal infrastructure, rainwater collection',
      landslideLevel: 1,
      landslideNotes: 'Flat island',
      powerOutageLevel: 10,
      powerOutageNotes: 'Most remote populated island, minimal infrastructure, longest restoration'
    }
  },
  {
    name: 'Berry Islands',
    type: 'district',
    region: 'North Central',
    population: 807,
    area: 31.0,
    elevation: 5,
    coordinates: JSON.stringify({ lat: 25.6333, lng: -77.8333 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Small cays, exposed to hurricanes',
      floodLevel: 8,
      floodNotes: 'Low-lying cays, storm surge risk',
      earthquakeLevel: 2,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 7,
      droughtNotes: 'Small population, limited water sources',
      landslideLevel: 1,
      landslideNotes: 'Flat cays',
      powerOutageLevel: 9,
      powerOutageNotes: 'Small islands, limited infrastructure'
    }
  }
]

async function seedBahamasAdminUnits() {
  console.log('🇧🇸 Seeding Bahamas administrative units...\n')
  
  // First, ensure Bahamas country exists
  let bahamasCountry = await prisma.country.findUnique({
    where: { code: 'BS' }
  })
  
  if (!bahamasCountry) {
    bahamasCountry = await prisma.country.create({
      data: {
        name: 'Bahamas',
        code: 'BS',
        region: 'Caribbean',
        isActive: true
      }
    })
    console.log('  ✓ Created Bahamas country')
  }
  
  let unitsCreated = 0
  let unitsUpdated = 0
  let risksCreated = 0
  let risksUpdated = 0
  
  for (const unitData of BAHAMAS_ADMIN_UNITS) {
    const { risks, ...unitInfo } = unitData
    
    // Find or create admin unit
    let adminUnit = await prisma.adminUnit.findFirst({
      where: {
        countryId: bahamasCountry.id,
        name: unitInfo.name
      }
    })
    
    if (adminUnit) {
      adminUnit = await prisma.adminUnit.update({
        where: { id: adminUnit.id },
        data: {
          ...unitInfo,
          countryId: bahamasCountry.id
        }
      })
      console.log(`  ↻ Updated: ${unitInfo.name}`)
      unitsUpdated++
    } else {
      adminUnit = await prisma.adminUnit.create({
        data: {
          ...unitInfo,
          countryId: bahamasCountry.id
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
      ...risks,
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
  
  console.log(`\n✅ Bahamas Admin Units Summary:`)
  console.log(`   - Islands/districts created: ${unitsCreated}`)
  console.log(`   - Islands/districts updated: ${unitsUpdated}`)
  console.log(`   - Risk profiles created: ${risksCreated}`)
  console.log(`   - Risk profiles updated: ${risksUpdated}`)
  console.log(`   - Total islands/districts: ${BAHAMAS_ADMIN_UNITS.length}`)
}

// Run if called directly
if (require.main === module) {
  seedBahamasAdminUnits()
    .then(() => {
      console.log('\n🎉 Bahamas admin units seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedBahamasAdminUnits, BAHAMAS_ADMIN_UNITS }









