import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Barbados Administrative Units (Parishes)
 * Barbados has 11 parishes - the traditional administrative divisions
 */

const BARBADOS_ADMIN_UNITS = [
  {
    name: 'Christ Church',
    type: 'parish',
    region: 'South',
    population: 54336,
    area: 57.0,
    elevation: 10,
    coordinates: JSON.stringify({ lat: 13.0667, lng: -59.5833 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'South coast exposure, frequent hurricane path, storm surge risk in coastal areas',
      floodLevel: 7,
      floodNotes: 'Low-lying coastal areas, urban flooding in Oistins and surrounding areas',
      earthquakeLevel: 4,
      earthquakeNotes: 'Low to moderate seismic risk, on eastern Caribbean plate boundary',
      droughtLevel: 7,
      droughtNotes: 'Island water supply challenges, tourism demand high, dry season issues',
      landslideLevel: 2,
      landslideNotes: 'Relatively flat parish, minimal landslide risk',
      powerOutageLevel: 6,
      powerOutageNotes: 'Modern infrastructure but vulnerable to hurricane damage'
    }
  },
  {
    name: 'St. Michael',
    type: 'parish',
    region: 'Capital',
    population: 91000,
    area: 39.0,
    elevation: 5,
    coordinates: JSON.stringify({ lat: 13.1000, lng: -59.6167 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Bridgetown capital area, west coast exposure, critical infrastructure at risk',
      floodLevel: 8,
      floodNotes: 'Urban flooding in Bridgetown, poor drainage in low-lying areas, port area vulnerable',
      earthquakeLevel: 4,
      earthquakeNotes: 'Capital infrastructure vulnerable, moderate seismic risk',
      droughtLevel: 8,
      droughtNotes: 'Highest population density, tourism and residential demand, water supply critical',
      landslideLevel: 2,
      landslideNotes: 'Urban coastal area, minimal landslide risk',
      powerOutageLevel: 5,
      powerOutageNotes: 'Capital has priority infrastructure but high demand'
    }
  },
  {
    name: 'St. James',
    type: 'parish',
    region: 'West Coast',
    population: 29000,
    area: 32.0,
    elevation: 5,
    coordinates: JSON.stringify({ lat: 13.1833, lng: -59.6500 }),
    risks: {
      hurricaneLevel: 8,
      hurricaneNotes: 'West coast tourism area, luxury resorts vulnerable, hurricane exposure',
      floodLevel: 6,
      floodNotes: 'Coastal flooding risk, less urban drainage issues than capital',
      earthquakeLevel: 4,
      earthquakeNotes: 'Moderate seismic risk, tourism infrastructure vulnerable',
      droughtLevel: 8,
      droughtNotes: 'Heavy tourism water demand, hotels and resorts strain supply',
      landslideLevel: 2,
      landslideNotes: 'Coastal flat area, minimal risk',
      powerOutageLevel: 5,
      powerOutageNotes: 'Tourism infrastructure, better resilience than average'
    }
  },
  {
    name: 'St. Thomas',
    type: 'parish',
    region: 'Central',
    population: 13500,
    area: 34.0,
    elevation: 200,
    coordinates: JSON.stringify({ lat: 13.1833, lng: -59.5667 }),
    risks: {
      hurricaneLevel: 7,
      hurricaneNotes: 'Interior location provides some protection, but still vulnerable',
      floodLevel: 5,
      floodNotes: 'Better drainage at elevation, flash flooding in valleys',
      earthquakeLevel: 4,
      earthquakeNotes: 'Moderate seismic activity',
      droughtLevel: 6,
      droughtNotes: 'Agricultural area, seasonal water challenges',
      landslideLevel: 4,
      landslideNotes: 'Some elevated terrain, moderate landslide risk in heavy rain',
      powerOutageLevel: 6,
      powerOutageNotes: 'Rural infrastructure, slower recovery'
    }
  },
  {
    name: 'St. Joseph',
    type: 'parish',
    region: 'East Coast',
    population: 6800,
    area: 26.0,
    elevation: 150,
    coordinates: JSON.stringify({ lat: 13.2000, lng: -59.5333 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Atlantic exposure, rugged coastline, full force of hurricanes',
      floodLevel: 6,
      floodNotes: 'Coastal and river flooding, steep terrain causes rapid runoff',
      earthquakeLevel: 5,
      earthquakeNotes: 'Eastern coast, closer to tectonic activity',
      droughtLevel: 5,
      droughtNotes: 'Better rainfall than west coast, agricultural area',
      landslideLevel: 6,
      landslideNotes: 'Steep cliffs and hills, landslide risk during heavy rain',
      powerOutageLevel: 7,
      powerOutageNotes: 'Rugged terrain, infrastructure challenges, slower restoration'
    }
  },
  {
    name: 'St. John',
    type: 'parish',
    region: 'Central',
    population: 10000,
    area: 34.0,
    elevation: 180,
    coordinates: JSON.stringify({ lat: 13.1833, lng: -59.5500 }),
    risks: {
      hurricaneLevel: 7,
      hurricaneNotes: 'Central location, some protection but still vulnerable',
      floodLevel: 5,
      floodNotes: 'Moderate flooding risk, better drainage',
      earthquakeLevel: 4,
      earthquakeNotes: 'Moderate seismic risk',
      droughtLevel: 6,
      droughtNotes: 'Agricultural community, seasonal challenges',
      landslideLevel: 5,
      landslideNotes: 'Elevated terrain, some landslide risk',
      powerOutageLevel: 6,
      powerOutageNotes: 'Rural area, standard infrastructure'
    }
  },
  {
    name: 'St. Andrew',
    type: 'parish',
    region: 'East Central',
    population: 6000,
    area: 36.0,
    elevation: 250,
    coordinates: JSON.stringify({ lat: 13.2000, lng: -59.5500 }),
    risks: {
      hurricaneLevel: 8,
      hurricaneNotes: 'Atlantic coast exposure, elevated areas still vulnerable',
      floodLevel: 6,
      floodNotes: 'Flash flooding in valleys, better drainage at elevation',
      earthquakeLevel: 5,
      earthquakeNotes: 'Eastern location, moderate-high seismic risk',
      droughtLevel: 5,
      droughtNotes: 'Highland climate, better water retention',
      landslideLevel: 7,
      landslideNotes: 'Highest elevated areas, significant landslide risk in storms',
      powerOutageLevel: 7,
      powerOutageNotes: 'Remote areas, challenging terrain for repairs'
    }
  },
  {
    name: 'St. Peter',
    type: 'parish',
    region: 'North',
    population: 11000,
    area: 34.0,
    elevation: 80,
    coordinates: JSON.stringify({ lat: 13.2500, lng: -59.6333 }),
    risks: {
      hurricaneLevel: 8,
      hurricaneNotes: 'North coast exposure, full Atlantic hurricane force',
      floodLevel: 6,
      floodNotes: 'Coastal and localized flooding',
      earthquakeLevel: 4,
      earthquakeNotes: 'Moderate seismic risk',
      droughtLevel: 6,
      droughtNotes: 'Agricultural and tourism mix, water demand',
      landslideLevel: 4,
      landslideNotes: 'Some elevated areas, moderate risk',
      powerOutageLevel: 6,
      powerOutageNotes: 'Mix of infrastructure quality'
    }
  },
  {
    name: 'St. Lucy',
    type: 'parish',
    region: 'North',
    population: 10000,
    area: 36.0,
    elevation: 50,
    coordinates: JSON.stringify({ lat: 13.3000, lng: -59.6333 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Northernmost parish, direct Atlantic exposure, severe hurricane impact',
      floodLevel: 7,
      floodNotes: 'North coast storm surge, flooding in low areas',
      earthquakeLevel: 4,
      earthquakeNotes: 'Moderate seismic risk',
      droughtLevel: 7,
      droughtNotes: 'Limited water infrastructure, agricultural area',
      landslideLevel: 3,
      landslideNotes: 'Coastal cliffs but generally moderate terrain',
      powerOutageLevel: 7,
      powerOutageNotes: 'Remote location, slower recovery times'
    }
  },
  {
    name: 'St. Philip',
    type: 'parish',
    region: 'East',
    population: 20500,
    area: 60.0,
    elevation: 40,
    coordinates: JSON.stringify({ lat: 13.1333, lng: -59.4667 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Atlantic coast, full hurricane exposure, airport vulnerable',
      floodLevel: 7,
      floodNotes: 'Coastal flooding, low-lying areas near airport',
      earthquakeLevel: 5,
      earthquakeNotes: 'Eastern exposure, higher seismic risk',
      droughtLevel: 7,
      droughtNotes: 'Large agricultural area, water challenges',
      landslideLevel: 4,
      landslideNotes: 'Some elevated terrain inland',
      powerOutageLevel: 6,
      powerOutageNotes: 'Airport area has better infrastructure'
    }
  },
  {
    name: 'St. George',
    type: 'parish',
    region: 'Central',
    population: 19000,
    area: 44.0,
    elevation: 100,
    coordinates: JSON.stringify({ lat: 13.1667, lng: -59.5833 }),
    risks: {
      hurricaneLevel: 7,
      hurricaneNotes: 'Central location, some natural protection',
      floodLevel: 5,
      floodNotes: 'Moderate flooding in valleys',
      earthquakeLevel: 4,
      earthquakeNotes: 'Moderate seismic risk',
      droughtLevel: 6,
      droughtNotes: 'Agricultural community, seasonal water issues',
      landslideLevel: 5,
      landslideNotes: 'Mix of flat and hilly terrain',
      powerOutageLevel: 6,
      powerOutageNotes: 'Standard rural infrastructure'
    }
  }
]

async function seedBarbadosAdminUnits() {
  console.log('🇧🇧 Seeding Barbados administrative units...\n')
  
  // First, ensure Barbados country exists
  let barbadosCountry = await prisma.country.findUnique({
    where: { code: 'BB' }
  })
  
  if (!barbadosCountry) {
    barbadosCountry = await prisma.country.create({
      data: {
        name: 'Barbados',
        code: 'BB',
        region: 'Caribbean',
        isActive: true
      }
    })
    console.log('  ✓ Created Barbados country')
  }
  
  let unitsCreated = 0
  let unitsUpdated = 0
  let risksCreated = 0
  let risksUpdated = 0
  
  for (const unitData of BARBADOS_ADMIN_UNITS) {
    const { risks, ...unitInfo } = unitData
    
    // Find or create admin unit
    let adminUnit = await prisma.adminUnit.findFirst({
      where: {
        countryId: barbadosCountry.id,
        name: unitInfo.name
      }
    })
    
    if (adminUnit) {
      adminUnit = await prisma.adminUnit.update({
        where: { id: adminUnit.id },
        data: {
          ...unitInfo,
          countryId: barbadosCountry.id
        }
      })
      console.log(`  ↻ Updated: ${unitInfo.name}`)
      unitsUpdated++
    } else {
      adminUnit = await prisma.adminUnit.create({
        data: {
          ...unitInfo,
          countryId: barbadosCountry.id
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
  
  console.log(`\n✅ Barbados Admin Units Summary:`)
  console.log(`   - Parishes created: ${unitsCreated}`)
  console.log(`   - Parishes updated: ${unitsUpdated}`)
  console.log(`   - Risk profiles created: ${risksCreated}`)
  console.log(`   - Risk profiles updated: ${risksUpdated}`)
  console.log(`   - Total parishes: ${BARBADOS_ADMIN_UNITS.length}`)
}

// Run if called directly
if (require.main === module) {
  seedBarbadosAdminUnits()
    .then(() => {
      console.log('\n🎉 Barbados admin units seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedBarbadosAdminUnits, BARBADOS_ADMIN_UNITS }









