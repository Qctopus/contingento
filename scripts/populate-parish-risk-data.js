const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function populateParishRiskData() {
  console.log('🏝️ Populating Jamaica Parish Risk Data...')

  try {
    // Clear existing parish data
    await prisma.riskChangeLog.deleteMany()
    await prisma.parishRisk.deleteMany()
    await prisma.parish.deleteMany()

    console.log('✅ Cleared existing parish data')

    // All 14 Jamaica Parishes with Professional Risk Assessment
    const parishes = [
      // KINGSTON METROPOLITAN AREA
      {
        name: 'Kingston',
        region: 'Kingston Metropolitan',
        isCoastal: true,
        isUrban: true,
        population: 89868,
        area: 25.0,
        elevation: 10,
        coordinates: JSON.stringify({ lat: 17.9771, lng: -76.7674 }),
        risks: {
          hurricane: { level: 8, notes: 'High exposure due to coastal location and urban density. Major port vulnerable to storm surge.' },
          flood: { level: 7, notes: 'Flash flooding from Rio Cobre and poor urban drainage during heavy rainfall.' },
          earthquake: { level: 6, notes: 'Located near Enriquillo Fault. High building density increases vulnerability.' },
          drought: { level: 4, notes: 'Water infrastructure generally adequate but vulnerable during extended dry periods.' },
          landslide: { level: 3, notes: 'Some hillside settlements at risk, particularly in informal communities.' },
          powerOutage: { level: 7, notes: 'Critical infrastructure hub. Outages affect entire national grid and port operations.' }
        }
      },
      {
        name: 'St. Andrew',
        region: 'Kingston Metropolitan',
        isCoastal: false,
        isUrban: true,
        population: 573369,
        area: 430.7,
        elevation: 250,
        coordinates: JSON.stringify({ lat: 18.0311, lng: -76.7746 }),
        risks: {
          hurricane: { level: 7, notes: 'Protected by Blue Mountains but urban density increases vulnerability to wind damage.' },
          flood: { level: 6, notes: 'Hope River and tributaries cause flooding in lower areas during heavy rainfall.' },
          earthquake: { level: 7, notes: 'Highest population density in Jamaica. Many older buildings lack seismic standards.' },
          drought: { level: 5, notes: 'High water demand from large population. Some areas depend on trucked water.' },
          landslide: { level: 8, notes: 'Steep terrain and informal settlements on hillsides create high landslide risk.' },
          powerOutage: { level: 6, notes: 'Major commercial and residential center. High demand can strain grid capacity.' }
        }
      },

      // NORTH COAST PARISHES
      {
        name: 'St. James',
        region: 'North Coast',
        isCoastal: true,
        isUrban: true,
        population: 185801,
        area: 594.9,
        elevation: 15,
        coordinates: JSON.stringify({ lat: 18.4762, lng: -77.9090 }),
        risks: {
          hurricane: { level: 9, notes: 'Major tourism hub with extensive coastal development. Montego Bay extremely vulnerable to storm surge.' },
          flood: { level: 6, notes: 'Montego River and coastal flooding during storms. Urban runoff exacerbates flooding.' },
          earthquake: { level: 5, notes: 'Moderate seismic risk. Many tourism facilities built to higher standards.' },
          drought: { level: 6, notes: 'High water demand from tourism industry. Aquifer over-extraction concerns.' },
          landslide: { level: 4, notes: 'Some hilly areas vulnerable, particularly around informal settlements.' },
          powerOutage: { level: 8, notes: 'Critical tourism infrastructure. Power failures affect airport and resorts significantly.' }
        }
      },
      {
        name: 'Hanover',
        region: 'North Coast',
        isCoastal: true,
        isUrban: false,
        population: 69533,
        area: 450.4,
        elevation: 50,
        coordinates: JSON.stringify({ lat: 18.4019, lng: -78.1357 }),
        risks: {
          hurricane: { level: 8, notes: 'Direct Atlantic exposure with limited natural barriers. Rural infrastructure vulnerable.' },
          flood: { level: 5, notes: 'Rivers swell during storms but good drainage in most areas.' },
          earthquake: { level: 4, notes: 'Lower seismic risk. Mostly single-story rural construction.' },
          drought: { level: 7, notes: 'Agricultural economy highly dependent on rainfall. Limited irrigation infrastructure.' },
          landslide: { level: 5, notes: 'Hilly interior areas with some unstable slopes during heavy rains.' },
          powerOutage: { level: 6, notes: 'Rural distribution network vulnerable to weather. Limited backup systems.' }
        }
      },
      {
        name: 'Westmoreland',
        region: 'North Coast',
        isCoastal: true,
        isUrban: false,
        population: 144817,
        area: 807.0,
        elevation: 30,
        coordinates: JSON.stringify({ lat: 18.2493, lng: -78.1357 }),
        risks: {
          hurricane: { level: 8, notes: 'Negril area highly exposed to hurricanes. Low-lying coastal areas vulnerable to surge.' },
          flood: { level: 6, notes: 'Cabarita River and coastal areas flood during storms. Great Morass wetland area.' },
          earthquake: { level: 4, notes: 'Low to moderate seismic risk. Rural building standards vary.' },
          drought: { level: 8, notes: 'Agriculture and tourism depend heavily on water. Aquifer vulnerability.' },
          landslide: { level: 3, notes: 'Generally flat terrain with minimal landslide risk.' },
          powerOutage: { level: 7, notes: 'Tourism area dependent on reliable power. Rural areas have limited redundancy.' }
        }
      },
      {
        name: 'Trelawny',
        region: 'North Coast',
        isCoastal: true,
        isUrban: false,
        population: 75558,
        area: 874.6,
        elevation: 100,
        coordinates: JSON.stringify({ lat: 18.3499, lng: -77.6499 }),
        risks: {
          hurricane: { level: 7, notes: 'Protected somewhat by interior mountains but coastal areas vulnerable.' },
          flood: { level: 5, notes: 'Martha Brae River flooding during heavy rains. Good natural drainage overall.' },
          earthquake: { level: 5, notes: 'Moderate seismic risk. Mix of rural and tourism infrastructure.' },
          drought: { level: 6, notes: 'Agricultural areas dependent on rainfall. Some irrigation development.' },
          landslide: { level: 6, notes: 'Cockpit Country terrain creates landslide risks in some areas.' },
          powerOutage: { level: 5, notes: 'Rural distribution system with tourism developments requiring reliable power.' }
        }
      },
      {
        name: 'St. Ann',
        region: 'North Coast',
        isCoastal: true,
        isUrban: false,
        population: 172362,
        area: 1212.6,
        elevation: 150,
        coordinates: JSON.stringify({ lat: 18.4341, lng: -77.1969 }),
        risks: {
          hurricane: { level: 7, notes: 'Ocho Rios tourism hub vulnerable. Interior mountains provide some protection.' },
          flood: { level: 4, notes: 'Good drainage from mountains to sea. Limited flooding except in low-lying areas.' },
          earthquake: { level: 5, notes: 'Moderate seismic risk. Tourism facilities generally well-constructed.' },
          drought: { level: 5, notes: 'Diverse elevation provides various microclimates. Good water resources.' },
          landslide: { level: 7, notes: 'Mountainous terrain with steep slopes. Regular landslides during heavy rains.' },
          powerOutage: { level: 6, notes: 'Major tourism areas require reliable power. Bauxite mining operations critical.' }
        }
      },
      {
        name: 'St. Mary',
        region: 'North Coast',
        isCoastal: true,
        isUrban: false,
        population: 113615,
        area: 610.5,
        elevation: 200,
        coordinates: JSON.stringify({ lat: 18.3499, lng: -76.9500 }),
        risks: {
          hurricane: { level: 8, notes: 'Direct exposure to Atlantic storms. Limited coastal development but vulnerable communities.' },
          flood: { level: 6, notes: 'Multiple rivers including Rio Grande. Flash flooding during heavy rains.' },
          earthquake: { level: 6, notes: 'Moderate to high seismic risk. Rural construction standards vary.' },
          drought: { level: 4, notes: 'Good rainfall and water resources from Blue Mountains watershed.' },
          landslide: { level: 8, notes: 'Steep terrain throughout parish. Frequent landslides block roads and damage homes.' },
          powerOutage: { level: 5, notes: 'Rural network vulnerable to weather and landslides blocking access.' }
        }
      },

      // EASTERN PARISHES
      {
        name: 'Portland',
        region: 'Eastern',
        isCoastal: true,
        isUrban: false,
        population: 82183,
        area: 814.4,
        elevation: 300,
        coordinates: JSON.stringify({ lat: 18.1833, lng: -76.4000 }),
        risks: {
          hurricane: { level: 9, notes: 'Highest rainfall parish, extremely vulnerable to hurricanes and storm surge.' },
          flood: { level: 9, notes: 'Rio Grande and multiple rivers cause severe flooding. Flash floods common.' },
          earthquake: { level: 6, notes: 'Mountainous terrain increases seismic vulnerability. Limited evacuation routes.' },
          drought: { level: 2, notes: 'Highest rainfall in Jamaica. Drought rarely a concern.' },
          landslide: { level: 9, notes: 'Blue Mountain slopes extremely unstable. Landslides frequently isolate communities.' },
          powerOutage: { level: 7, notes: 'Infrastructure vulnerable to weather and landslides. Remote areas difficult to restore.' }
        }
      },
      {
        name: 'St. Thomas',
        region: 'Eastern',
        isCoastal: true,
        isUrban: false,
        population: 93902,
        area: 742.8,
        elevation: 150,
        coordinates: JSON.stringify({ lat: 17.9833, lng: -76.2500 }),
        risks: {
          hurricane: { level: 8, notes: 'Southeast coast highly exposed to hurricanes. Morant Bay area vulnerable to surge.' },
          flood: { level: 7, notes: 'Plantain Garden River and others cause flooding. Poor drainage in some areas.' },
          earthquake: { level: 7, notes: 'High seismic risk near fault lines. Rural building standards inconsistent.' },
          drought: { level: 6, notes: 'Eastern areas drier than north coast. Agricultural areas vulnerable.' },
          landslide: { level: 7, notes: 'Blue Mountain foothills unstable. Road networks frequently affected.' },
          powerOutage: { level: 6, notes: 'Rural distribution system vulnerable. Hurricane damage often extensive.' }
        }
      },

      // CENTRAL PARISHES
      {
        name: 'St. Catherine',
        region: 'Central',
        isCoastal: true,
        isUrban: true,
        population: 516218,
        area: 1192.4,
        elevation: 50,
        coordinates: JSON.stringify({ lat: 17.9833, lng: -76.8833 }),
        risks: {
          hurricane: { level: 7, notes: 'Large urban population. Industrial areas and Portmore coastal development vulnerable.' },
          flood: { level: 8, notes: 'Rio Cobre and Rio Minho cause major flooding. Portmore causeway at risk.' },
          earthquake: { level: 8, notes: 'High population density and industrial infrastructure. Major fault lines present.' },
          drought: { level: 6, notes: 'Large population strains water resources. Industrial demand significant.' },
          landslide: { level: 5, notes: 'Some hilly areas in north, but mostly flat terrain.' },
          powerOutage: { level: 8, notes: 'Major industrial and residential areas. Outages affect aluminum refinery and ports.' }
        }
      },
      {
        name: 'Clarendon',
        region: 'Central',
        isCoastal: true,
        isUrban: false,
        population: 245103,
        area: 1196.3,
        elevation: 100,
        coordinates: JSON.stringify({ lat: 17.9333, lng: -77.2500 }),
        risks: {
          hurricane: { level: 6, notes: 'Inland location provides some protection but south coast areas vulnerable.' },
          flood: { level: 7, notes: 'Rio Minho and tributaries cause extensive flooding in flat areas.' },
          earthquake: { level: 6, notes: 'Moderate seismic risk. Mix of rural and industrial development.' },
          drought: { level: 8, notes: 'Major agricultural parish. Irrigation systems critical during dry periods.' },
          landslide: { level: 4, notes: 'Mostly flat terrain with hills in north providing some landslide risk.' },
          powerOutage: { level: 6, notes: 'Agricultural and industrial areas require reliable power for operations.' }
        }
      },
      {
        name: 'Manchester',
        region: 'Central',
        isCoastal: false,
        isUrban: false,
        population: 190812,
        area: 830.1,
        elevation: 800,
        coordinates: JSON.stringify({ lat: 18.0500, lng: -77.5000 }),
        risks: {
          hurricane: { level: 5, notes: 'Interior highland location provides protection from hurricanes.' },
          flood: { level: 4, notes: 'Good drainage from highland terrain. Limited flood risk.' },
          earthquake: { level: 5, notes: 'Moderate seismic risk. Rural construction standards vary.' },
          drought: { level: 7, notes: 'Highland agriculture dependent on rainfall. Water storage limited.' },
          landslide: { level: 6, notes: 'Hilly terrain creates landslide risks during heavy rains.' },
          powerOutage: { level: 5, notes: 'Rural distribution network. Mining operations require reliable power.' }
        }
      },

      // SOUTHWESTERN PARISHES
      {
        name: 'St. Elizabeth',
        region: 'Western',
        isCoastal: true,
        isUrban: false,
        population: 150205,
        area: 1212.4,
        elevation: 200,
        coordinates: JSON.stringify({ lat: 17.9000, lng: -77.7500 }),
        risks: {
          hurricane: { level: 6, notes: 'South coast vulnerable but interior highlands provide some protection.' },
          flood: { level: 5, notes: 'Black River and YS Falls areas can flood but generally good drainage.' },
          earthquake: { level: 4, notes: 'Lower seismic risk. Rural construction primarily single-story.' },
          drought: { level: 9, notes: 'Driest parish in Jamaica. Agriculture heavily dependent on irrigation.' },
          landslide: { level: 5, notes: 'Some hilly areas vulnerable but generally stable terrain.' },
          powerOutage: { level: 5, notes: 'Rural infrastructure. Agricultural operations need reliable power for irrigation.' }
        }
      }
    ]

    // Create parishes and their risk profiles
    for (const parishData of parishes) {
      console.log(`Creating ${parishData.name} parish...`)
      
      // Create parish
      const parish = await prisma.parish.create({
        data: {
          name: parishData.name,
          region: parishData.region,
          isCoastal: parishData.isCoastal,
          isUrban: parishData.isUrban,
          population: parishData.population,
          area: parishData.area,
          elevation: parishData.elevation,
          coordinates: parishData.coordinates
        }
      })

      // Create risk profile
      await prisma.parishRisk.create({
        data: {
          parishId: parish.id,
          hurricaneLevel: parishData.risks.hurricane.level,
          hurricaneNotes: parishData.risks.hurricane.notes,
          floodLevel: parishData.risks.flood.level,
          floodNotes: parishData.risks.flood.notes,
          earthquakeLevel: parishData.risks.earthquake.level,
          earthquakeNotes: parishData.risks.earthquake.notes,
          droughtLevel: parishData.risks.drought.level,
          droughtNotes: parishData.risks.drought.notes,
          landslideLevel: parishData.risks.landslide.level,
          landslideNotes: parishData.risks.landslide.notes,
          powerOutageLevel: parishData.risks.powerOutage.level,
          powerOutageNotes: parishData.risks.powerOutage.notes,
          updatedBy: 'System Migration'
        }
      })

      console.log(`✅ Created ${parishData.name} with risk profile`)
    }

    console.log('🎉 Successfully populated all 14 Jamaica parishes!')
    console.log('\n📊 Parish Risk Summary:')
    console.log(`- Total Parishes: ${parishes.length}`)
    console.log(`- Coastal Parishes: ${parishes.filter(p => p.isCoastal).length}`)
    console.log(`- Urban Parishes: ${parishes.filter(p => p.isUrban).length}`)
    console.log(`- Total Population: ${parishes.reduce((sum, p) => sum + p.population, 0).toLocaleString()}`)
    
    // Risk statistics
    const avgHurricaneRisk = Math.round(parishes.reduce((sum, p) => sum + p.risks.hurricane.level, 0) / parishes.length * 10) / 10
    const avgFloodRisk = Math.round(parishes.reduce((sum, p) => sum + p.risks.flood.level, 0) / parishes.length * 10) / 10
    const avgLandslideRisk = Math.round(parishes.reduce((sum, p) => sum + p.risks.landslide.level, 0) / parishes.length * 10) / 10
    
    console.log(`\n🌊 Average Risk Levels:`)
    console.log(`- Hurricane: ${avgHurricaneRisk}/10`)
    console.log(`- Flood: ${avgFloodRisk}/10`)  
    console.log(`- Landslide: ${avgLandslideRisk}/10`)

  } catch (error) {
    console.error('❌ Error populating parish data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateParishRiskData()










