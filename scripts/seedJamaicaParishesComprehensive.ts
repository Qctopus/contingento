import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Comprehensive Jamaica Parish Data with Risk Assessments
 * Based on historical disaster data and geographic vulnerabilities
 */

const JAMAICA_PARISHES = [
  {
    name: 'Kingston',
    region: 'Kingston Metropolitan',
    countryCode: 'JM',
    population: 89057,
    area: 21.7,
    elevation: 10,
    coordinates: JSON.stringify({ lat: 18.0179, lng: -76.8099 }),
    risks: {
      hurricaneLevel: 8,
      hurricaneNotes: 'Coastal exposure, hurricane belt, significant wind and storm surge risk',
      floodLevel: 7,
      floodNotes: 'Urban flooding common during heavy rains, inadequate drainage in some areas',
      earthquakeLevel: 9,
      earthquakeNotes: 'Located on Enriquillo–Plantain Garden fault zone, very high seismic risk',
      droughtLevel: 4,
      droughtNotes: 'Urban water infrastructure reduces impact but supply issues during dry season',
      landslideLevel: 3,
      landslideNotes: 'Limited mountainous terrain, low risk',
      powerOutageLevel: 7,
      powerOutageNotes: 'Frequent outages during storms and high demand periods'
    }
  },
  {
    name: 'St. Andrew',
    region: 'Kingston Metropolitan',
    countryCode: 'JM',
    population: 573369,
    area: 430.7,
    elevation: 50,
    coordinates: JSON.stringify({ lat: 18.0352, lng: -76.7534 }),
    risks: {
      hurricaneLevel: 7,
      hurricaneNotes: 'Parts are inland with mountain protection, but lower areas vulnerable',
      floodLevel: 8,
      floodNotes: 'Flash flooding in valleys and urban areas, Hope River overflow risk',
      earthquakeLevel: 9,
      earthquakeNotes: 'Major fault lines through parish, highest seismic risk in Jamaica',
      droughtLevel: 3,
      droughtNotes: 'Better rainfall than southern parishes, mountain watersheds',
      landslideLevel: 7,
      landslideNotes: 'Steep hillsides, frequent landslides during heavy rain',
      powerOutageLevel: 6,
      powerOutageNotes: 'Better infrastructure than rural areas but still frequent outages'
    }
  },
  {
    name: 'St. Thomas',
    region: 'Surrey',
    countryCode: 'JM',
    population: 93902,
    area: 742.8,
    elevation: 25,
    coordinates: JSON.stringify({ lat: 17.9678, lng: -76.3613 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Southeastern coast, direct hurricane path, storm surge and wind',
      floodLevel: 7,
      floodNotes: 'River flooding and coastal flooding during hurricanes',
      earthquakeLevel: 7,
      earthquakeNotes: 'Moderate seismic activity, some fault lines',
      droughtLevel: 6,
      droughtNotes: 'Dry season water shortages, agricultural impact',
      landslideLevel: 6,
      landslideNotes: 'Mountainous terrain in Blue Mountains foothills',
      powerOutageLevel: 8,
      powerOutageNotes: 'Rural areas with long recovery times after storms'
    }
  },
  {
    name: 'Portland',
    region: 'Surrey',
    countryCode: 'JM',
    population: 82183,
    area: 814.0,
    elevation: 30,
    coordinates: JSON.stringify({ lat: 18.1079, lng: -76.4089 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Northeast coast, highest rainfall, frequent tropical systems',
      floodLevel: 9,
      floodNotes: 'Extreme rainfall, flash flooding, multiple rivers',
      earthquakeLevel: 6,
      earthquakeNotes: 'Moderate seismic risk',
      droughtLevel: 2,
      droughtNotes: 'Highest rainfall parish, minimal drought impact',
      landslideLevel: 8,
      landslideNotes: 'Steep terrain, heavy rainfall causes frequent landslides',
      powerOutageLevel: 9,
      powerOutageNotes: 'Remote areas, infrastructure damage from storms and landslides'
    }
  },
  {
    name: 'St. Mary',
    region: 'Middlesex',
    countryCode: 'JM',
    population: 113615,
    area: 610.5,
    elevation: 20,
    coordinates: JSON.stringify({ lat: 18.2333, lng: -77.0167 }),
    risks: {
      hurricaneLevel: 8,
      hurricaneNotes: 'North coast exposure, frequent tropical systems',
      floodLevel: 7,
      floodNotes: 'Coastal and river flooding, agricultural areas affected',
      earthquakeLevel: 5,
      earthquakeNotes: 'Lower seismic risk than southern parishes',
      droughtLevel: 3,
      droughtNotes: 'Good rainfall, limited drought impact',
      landslideLevel: 6,
      landslideNotes: 'Hilly terrain, landslides during heavy rain',
      powerOutageLevel: 7,
      powerOutageNotes: 'Mix of urban and rural, moderate outage frequency'
    }
  },
  {
    name: 'St. Ann',
    region: 'Middlesex',
    countryCode: 'JM',
    population: 172362,
    area: 1212.6,
    elevation: 100,
    coordinates: JSON.stringify({ lat: 18.4378, lng: -77.1932 }),
    risks: {
      hurricaneLevel: 7,
      hurricaneNotes: 'North coast with some mountain protection inland',
      floodLevel: 5,
      floodNotes: 'Limestone terrain provides natural drainage, moderate flood risk',
      earthquakeLevel: 4,
      earthquakeNotes: 'Low to moderate seismic activity',
      droughtLevel: 5,
      droughtNotes: 'Karst limestone terrain, underground water flow, seasonal water challenges',
      landslideLevel: 4,
      landslideNotes: 'Gentler slopes than eastern parishes',
      powerOutageLevel: 6,
      powerOutageNotes: 'Tourist areas have better infrastructure'
    }
  },
  {
    name: 'Trelawny',
    region: 'Cornwall',
    countryCode: 'JM',
    population: 75556,
    area: 874.6,
    elevation: 50,
    coordinates: JSON.stringify({ lat: 18.3611, lng: -77.6113 }),
    risks: {
      hurricaneLevel: 7,
      hurricaneNotes: 'North coast, protected by hills inland',
      floodLevel: 6,
      floodNotes: 'Martha Brae River flooding, coastal storm surge',
      earthquakeLevel: 4,
      earthquakeNotes: 'Low seismic risk',
      droughtLevel: 5,
      droughtNotes: 'Seasonal water issues, agricultural areas affected',
      landslideLevel: 5,
      landslideNotes: 'Cockpit Country terrain, some landslide risk',
      powerOutageLevel: 6,
      powerOutageNotes: 'Mix of coastal and rural infrastructure'
    }
  },
  {
    name: 'St. James',
    region: 'Cornwall',
    countryCode: 'JM',
    population: 183811,
    area: 594.9,
    elevation: 5,
    coordinates: JSON.stringify({ lat: 18.4762, lng: -77.9188 }),
    risks: {
      hurricaneLevel: 8,
      hurricaneNotes: 'Northwest coast, direct hurricane exposure, Montego Bay vulnerable',
      floodLevel: 6,
      floodNotes: 'Coastal flooding and urban drainage issues in Montego Bay',
      earthquakeLevel: 3,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 6,
      droughtNotes: 'Tourist demand strains water supply, dry season challenges',
      landslideLevel: 3,
      landslideNotes: 'Mostly flat coastal area',
      powerOutageLevel: 5,
      powerOutageNotes: 'Tourist infrastructure, better power reliability'
    }
  },
  {
    name: 'Hanover',
    region: 'Cornwall',
    countryCode: 'JM',
    population: 69533,
    area: 450.4,
    elevation: 20,
    coordinates: JSON.stringify({ lat: 18.3993, lng: -78.1347 }),
    risks: {
      hurricaneLevel: 8,
      hurricaneNotes: 'Western tip, hurricane path, coastal exposure',
      floodLevel: 5,
      floodNotes: 'Moderate coastal and river flooding risk',
      earthquakeLevel: 3,
      earthquakeNotes: 'Very low seismic risk',
      droughtLevel: 6,
      droughtNotes: 'Water supply challenges, agricultural area',
      landslideLevel: 4,
      landslideNotes: 'Some hilly areas inland',
      powerOutageLevel: 7,
      powerOutageNotes: 'Rural infrastructure, slower storm recovery'
    }
  },
  {
    name: 'Westmoreland',
    region: 'Cornwall',
    countryCode: 'JM',
    population: 144817,
    area: 807.0,
    elevation: 15,
    coordinates: JSON.stringify({ lat: 18.2676, lng: -78.1563 }),
    risks: {
      hurricaneLevel: 9,
      hurricaneNotes: 'Southwest coast, direct hurricane exposure, Negril vulnerable',
      floodLevel: 7,
      floodNotes: 'Low-lying areas, coastal flooding, Great Morass wetland',
      earthquakeLevel: 4,
      earthquakeNotes: 'Low to moderate seismic activity',
      droughtLevel: 7,
      droughtNotes: 'Agricultural area with seasonal water shortages',
      landslideLevel: 3,
      landslideNotes: 'Mostly flat, limited landslide risk',
      powerOutageLevel: 7,
      powerOutageNotes: 'Tourism areas better, but rural areas vulnerable'
    }
  },
  {
    name: 'St. Elizabeth',
    region: 'Cornwall',
    countryCode: 'JM',
    population: 150205,
    area: 1212.4,
    elevation: 50,
    coordinates: JSON.stringify({ lat: 18.0498, lng: -77.7437 }),
    risks: {
      hurricaneLevel: 7,
      hurricaneNotes: 'South coast, some mountain protection, hurricane vulnerable',
      floodLevel: 4,
      floodNotes: 'Better drainage, Black River area at risk',
      earthquakeLevel: 5,
      earthquakeNotes: 'Moderate seismic risk',
      droughtLevel: 8,
      droughtNotes: 'Driest parish, major agricultural area, frequent water shortages',
      landslideLevel: 4,
      landslideNotes: 'Some hilly terrain, moderate risk',
      powerOutageLevel: 7,
      powerOutageNotes: 'Large rural area with infrastructure challenges'
    }
  },
  {
    name: 'Manchester',
    region: 'Middlesex',
    countryCode: 'JM',
    population: 189797,
    area: 830.1,
    elevation: 600,
    coordinates: JSON.stringify({ lat: 18.0408, lng: -77.5059 }),
    risks: {
      hurricaneLevel: 5,
      hurricaneNotes: 'Interior parish, mountain protection, reduced hurricane impact',
      floodLevel: 5,
      floodNotes: 'Flash flooding in valleys, better drainage at elevation',
      earthquakeLevel: 6,
      earthquakeNotes: 'Moderate seismic activity',
      droughtLevel: 6,
      droughtNotes: 'Highland climate, seasonal water challenges',
      landslideLevel: 6,
      landslideNotes: 'Mountainous terrain, landslides during heavy rain',
      powerOutageLevel: 6,
      powerOutageNotes: 'Mandeville has better infrastructure'
    }
  },
  {
    name: 'Clarendon',
    region: 'Middlesex',
    countryCode: 'JM',
    population: 245103,
    area: 1196.3,
    elevation: 100,
    coordinates: JSON.stringify({ lat: 18.1446, lng: -77.2426 }),
    risks: {
      hurricaneLevel: 6,
      hurricaneNotes: 'Central parish, some coastal areas, partial mountain protection',
      floodLevel: 7,
      floodNotes: 'Rio Minho flooding, low-lying agricultural areas',
      earthquakeLevel: 6,
      earthquakeNotes: 'Moderate seismic risk',
      droughtLevel: 7,
      droughtNotes: 'Large agricultural area, irrigation-dependent, dry season impact',
      landslideLevel: 5,
      landslideNotes: 'Mix of flat and hilly terrain',
      powerOutageLevel: 6,
      powerOutageNotes: 'May Pen urban area better, rural areas more vulnerable'
    }
  },
  {
    name: 'St. Catherine',
    region: 'Middlesex',
    countryCode: 'JM',
    population: 516218,
    area: 1192.4,
    elevation: 50,
    coordinates: JSON.stringify({ lat: 18.0021, lng: -77.0001 }),
    risks: {
      hurricaneLevel: 7,
      hurricaneNotes: 'Coastal exposure, Spanish Town vulnerable, storm surge risk',
      floodLevel: 8,
      floodNotes: 'Rio Cobre flooding, low-lying plains, urban flooding',
      earthquakeLevel: 8,
      earthquakeNotes: 'High seismic risk, fault lines through parish',
      droughtLevel: 6,
      droughtNotes: 'Agricultural areas affected, water supply challenges',
      landslideLevel: 5,
      landslideNotes: 'Hellshire Hills and northern areas',
      powerOutageLevel: 6,
      powerOutageNotes: 'Large population, infrastructure strain'
    }
  }
]

async function seedJamaicaParishes() {
  console.log('🗺️  Seeding Jamaica parishes with risk assessments...\n')
  
  let parishesCreated = 0
  let parishesUpdated = 0
  let risksCreated = 0
  let risksUpdated = 0
  
  for (const parishData of JAMAICA_PARISHES) {
    const { risks, ...parishInfo } = parishData
    
    // Find or create parish
    let parish = await prisma.parish.findFirst({
      where: {
        name: parishInfo.name,
        countryCode: 'JM'
      }
    })
    
    if (parish) {
      // Update existing
      parish = await prisma.parish.update({
        where: { id: parish.id },
        data: parishInfo
      })
      console.log(`  ↻ Updated parish: ${parishInfo.name}`)
      parishesUpdated++
    } else {
      // Create new
      parish = await prisma.parish.create({
        data: parishInfo
      })
      console.log(`  ✓ Created parish: ${parishInfo.name}`)
      parishesCreated++
    }
    
    // Create or update risk data
    const existingRisk = await prisma.parishRisk.findUnique({
      where: { parishId: parish.id }
    })
    
    const riskData = {
      parishId: parish.id,
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
      await prisma.parishRisk.update({
        where: { id: existingRisk.id },
        data: riskData
      })
      console.log(`    ↻ Updated risks for ${parishInfo.name}`)
      risksUpdated++
    } else {
      await prisma.parishRisk.create({
        data: riskData
      })
      console.log(`    ✓ Created risks for ${parishInfo.name}`)
      risksCreated++
    }
  }
  
  console.log(`\n✅ Jamaica Parishes Summary:`)
  console.log(`   - Parishes created: ${parishesCreated}`)
  console.log(`   - Parishes updated: ${parishesUpdated}`)
  console.log(`   - Risk profiles created: ${risksCreated}`)
  console.log(`   - Risk profiles updated: ${risksUpdated}`)
  console.log(`   - Total parishes: ${JAMAICA_PARISHES.length}`)
}

// Run if called directly
if (require.main === module) {
  seedJamaicaParishes()
    .then(() => {
      console.log('\n🎉 Jamaica parishes seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedJamaicaParishes, JAMAICA_PARISHES }









