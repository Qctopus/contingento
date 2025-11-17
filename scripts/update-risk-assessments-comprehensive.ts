import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Comprehensive Risk Assessment Update Script
 * Updates risk levels for all admin units in Jamaica, Barbados, and Bahamas
 * Based on geographic knowledge, historical disaster data, and regional vulnerabilities
 */

interface RiskUpdate {
  // Core risks
  hurricaneLevel: number
  hurricaneNotes: string
  floodLevel: number
  floodNotes: string
  earthquakeLevel: number
  earthquakeNotes: string
  droughtLevel: number
  droughtNotes: string
  landslideLevel: number
  landslideNotes: string
  powerOutageLevel: number
  powerOutageNotes: string
  // Additional risks
  fireLevel: number
  fireNotes: string
  cyberAttackLevel: number
  cyberAttackNotes: string
  terrorismLevel: number
  terrorismNotes: string
  pandemicDiseaseLevel: number
  pandemicDiseaseNotes: string
  economicDownturnLevel: number
  economicDownturnNotes: string
  supplyChainDisruptionLevel: number
  supplyChainDisruptionNotes: string
  civilUnrestLevel: number
  civilUnrestNotes: string
}

// Jamaica Risk Updates - Refined based on geographic knowledge
const JAMAICA_RISKS: Record<string, RiskUpdate> = {
  'Kingston': {
    hurricaneLevel: 8,
    hurricaneNotes: 'Coastal capital, hurricane belt exposure, significant wind and storm surge risk. Urban density increases vulnerability.',
    floodLevel: 7,
    floodNotes: 'Urban flooding common during heavy rains, inadequate drainage infrastructure, low-lying areas prone to inundation',
    earthquakeLevel: 9,
    earthquakeNotes: 'Located on Enriquillo–Plantain Garden fault zone, very high seismic risk. 1692 Port Royal earthquake epicenter nearby.',
    droughtLevel: 4,
    droughtNotes: 'Urban water infrastructure reduces impact but supply issues during extended dry periods, high population demand',
    landslideLevel: 3,
    landslideNotes: 'Limited mountainous terrain in immediate area, low landslide risk but some hillside communities vulnerable',
    powerOutageLevel: 7,
    powerOutageNotes: 'Frequent outages during storms and high demand periods, aging infrastructure, critical services affected',
    fireLevel: 8,
    fireNotes: 'Capital city with dense urban areas, older buildings, industrial zones, high population density increases fire risk',
    cyberAttackLevel: 8,
    cyberAttackNotes: 'Financial center, government hub, critical infrastructure, high concentration of digital systems and data',
    terrorismLevel: 3,
    terrorismNotes: 'Generally low risk in Caribbean, but capital city has higher profile, some security concerns in certain areas',
    pandemicDiseaseLevel: 8,
    pandemicDiseaseNotes: 'High population density, international port, tourism hub, rapid disease spread potential, healthcare system strain',
    economicDownturnLevel: 7,
    economicDownturnNotes: 'Capital city economic hub, financial services center, but vulnerable to global economic shocks',
    supplyChainDisruptionLevel: 7,
    supplyChainDisruptionNotes: 'Island nation dependency on imports, port disruptions affect supply, tourism-dependent economy',
    civilUnrestLevel: 5,
    civilUnrestNotes: 'Urban areas with economic challenges, occasional protests, but generally stable political environment'
  },
  'St. Andrew': {
    hurricaneLevel: 7,
    hurricaneNotes: 'Mixed terrain - parts inland with mountain protection, but lower areas and coastal sections highly vulnerable',
    floodLevel: 8,
    floodNotes: 'Flash flooding in valleys and urban areas, Hope River and other waterways overflow risk, rapid runoff from hills',
    earthquakeLevel: 9,
    earthquakeNotes: 'Major fault lines traverse parish, highest seismic risk in Jamaica. Blue Mountain fault system active.',
    droughtLevel: 3,
    droughtNotes: 'Better rainfall than southern parishes, mountain watersheds provide water sources, less drought-prone',
    landslideLevel: 7,
    landslideNotes: 'Steep hillsides throughout, frequent landslides during heavy rain, especially in Blue Mountain foothills',
    powerOutageLevel: 6,
    powerOutageNotes: 'Better infrastructure than rural areas but still frequent outages, hillside communities harder to restore'
  },
  'St. Thomas': {
    hurricaneLevel: 9,
    hurricaneNotes: 'Southeastern coast, direct hurricane path, storm surge and extreme winds. First landfall location for many storms.',
    floodLevel: 7,
    floodNotes: 'River flooding and coastal flooding during hurricanes, multiple river systems, low-lying coastal areas',
    earthquakeLevel: 7,
    earthquakeNotes: 'Moderate seismic activity, some fault lines present, but less active than western parishes',
    droughtLevel: 6,
    droughtNotes: 'Dry season water shortages, agricultural impact, limited water storage infrastructure',
    landslideLevel: 6,
    landslideNotes: 'Mountainous terrain in Blue Mountains foothills, moderate landslide risk during heavy rainfall',
    powerOutageLevel: 8,
    powerOutageNotes: 'Rural areas with long recovery times after storms, infrastructure damage from flooding and landslides'
  },
  'Portland': {
    hurricaneLevel: 9,
    hurricaneNotes: 'Northeast coast, highest rainfall parish, frequent tropical systems. Port Antonio area highly exposed.',
    floodLevel: 9,
    floodNotes: 'Extreme rainfall (up to 300+ inches annually), flash flooding, multiple rivers overflow, most flood-prone parish',
    earthquakeLevel: 6,
    earthquakeNotes: 'Moderate seismic risk, less active fault lines than western parishes',
    droughtLevel: 2,
    droughtNotes: 'Highest rainfall parish in Jamaica, minimal drought impact, abundant water resources',
    landslideLevel: 8,
    landslideNotes: 'Steep terrain throughout, heavy rainfall causes frequent landslides, road closures common',
    powerOutageLevel: 9,
    powerOutageNotes: 'Remote areas, infrastructure damage from storms and landslides, longest restoration times'
  },
  'St. Mary': {
    hurricaneLevel: 8,
    hurricaneNotes: 'Northeast coast exposure, frequent hurricane impacts, storm surge risk in coastal areas',
    floodLevel: 8,
    floodNotes: 'High rainfall, river flooding, flash floods in valleys, coastal flooding during storms',
    earthquakeLevel: 6,
    earthquakeNotes: 'Moderate seismic activity, some fault lines present',
    droughtLevel: 3,
    droughtNotes: 'Good rainfall, agricultural area with water resources, less drought-prone',
    landslideLevel: 7,
    landslideNotes: 'Mountainous terrain, frequent landslides during heavy rain, especially in interior',
    powerOutageLevel: 8,
    powerOutageNotes: 'Rural infrastructure, slower recovery after storms, terrain makes restoration difficult'
  },
  'St. Ann': {
    hurricaneLevel: 7,
    hurricaneNotes: 'North coast tourism area, moderate hurricane exposure, some protection from interior mountains',
    floodLevel: 5,
    floodNotes: 'Moderate flood risk, better drainage than eastern parishes, some coastal flooding',
    earthquakeLevel: 6,
    earthquakeNotes: 'Moderate seismic risk',
    droughtLevel: 4,
    droughtNotes: 'Tourism water demand, seasonal shortages possible, but generally adequate rainfall',
    landslideLevel: 5,
    landslideNotes: 'Mixed terrain, moderate landslide risk in hilly areas',
    powerOutageLevel: 6,
    powerOutageNotes: 'Tourism infrastructure prioritized, moderate restoration times'
  },
  'Trelawny': {
    hurricaneLevel: 7,
    hurricaneNotes: 'North coast exposure, moderate hurricane risk, some interior protection',
    floodLevel: 6,
    floodNotes: 'River flooding possible, moderate flood risk, better drainage than eastern parishes',
    earthquakeLevel: 6,
    earthquakeNotes: 'Moderate seismic activity',
    droughtLevel: 5,
    droughtNotes: 'Agricultural area, seasonal water challenges, moderate drought risk',
    landslideLevel: 5,
    landslideNotes: 'Some hilly terrain, moderate landslide risk',
    powerOutageLevel: 7,
    powerOutageNotes: 'Rural areas, moderate recovery times'
  },
  'St. James': {
    hurricaneLevel: 8,
    hurricaneNotes: 'Northwest coast, Montego Bay tourism hub, hurricane exposure, storm surge risk',
    floodLevel: 6,
    floodNotes: 'Urban flooding in Montego Bay, coastal flooding, moderate overall flood risk',
    earthquakeLevel: 6,
    earthquakeNotes: 'Moderate seismic risk',
    droughtLevel: 5,
    droughtNotes: 'Tourism water demand, seasonal shortages, moderate drought impact',
    landslideLevel: 4,
    landslideNotes: 'Mixed terrain, lower landslide risk than eastern parishes',
    powerOutageLevel: 6,
    powerOutageNotes: 'Tourism infrastructure prioritized, moderate restoration times'
  },
  'Hanover': {
    hurricaneLevel: 8,
    hurricaneNotes: 'West coast exposure, hurricane path, storm surge risk in coastal areas',
    floodLevel: 5,
    floodNotes: 'Moderate flood risk, less rainfall than eastern parishes',
    earthquakeLevel: 5,
    earthquakeNotes: 'Lower seismic risk than eastern parishes',
    droughtLevel: 6,
    droughtNotes: 'Drier parish, agricultural impact, water supply challenges',
    landslideLevel: 3,
    landslideNotes: 'Relatively flat, low landslide risk',
    powerOutageLevel: 7,
    powerOutageNotes: 'Rural infrastructure, moderate recovery times'
  },
  'Westmoreland': {
    hurricaneLevel: 9,
    hurricaneNotes: 'Westernmost parish, direct hurricane path, extreme wind and storm surge exposure',
    floodLevel: 6,
    floodNotes: 'Coastal flooding during hurricanes, moderate river flooding',
    earthquakeLevel: 5,
    earthquakeNotes: 'Lower seismic risk',
    droughtLevel: 6,
    droughtNotes: 'Drier parish, agricultural challenges, water supply issues',
    landslideLevel: 3,
    landslideNotes: 'Relatively flat terrain, low landslide risk',
    powerOutageLevel: 8,
    powerOutageNotes: 'Rural areas, long recovery times after storms'
  },
  'St. Elizabeth': {
    hurricaneLevel: 6,
    hurricaneNotes: 'South coast, some protection from interior, but still vulnerable to storms',
    floodLevel: 4,
    floodNotes: 'Drier parish, lower flood risk, but flash floods possible',
    earthquakeLevel: 5,
    earthquakeNotes: 'Lower seismic risk',
    droughtLevel: 8,
    droughtNotes: 'Driest parish, severe agricultural drought impact, water scarcity major concern',
    landslideLevel: 2,
    landslideNotes: 'Relatively flat, minimal landslide risk',
    powerOutageLevel: 7,
    powerOutageNotes: 'Rural infrastructure, moderate recovery times'
  },
  'Manchester': {
    hurricaneLevel: 5,
    hurricaneNotes: 'Interior location provides some protection, but still vulnerable to extreme storms',
    floodLevel: 5,
    floodNotes: 'Moderate flood risk, flash flooding in valleys',
    earthquakeLevel: 5,
    earthquakeNotes: 'Moderate seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Drier interior parish, agricultural drought impact, water supply challenges',
    landslideLevel: 4,
    landslideNotes: 'Some hilly terrain, moderate landslide risk',
    powerOutageLevel: 7,
    powerOutageNotes: 'Rural infrastructure, moderate recovery times'
  },
  'Clarendon': {
    hurricaneLevel: 6,
    hurricaneNotes: 'Interior and south coast, moderate hurricane exposure',
    floodLevel: 6,
    floodNotes: 'River flooding, moderate flood risk, some coastal flooding',
    earthquakeLevel: 6,
    earthquakeNotes: 'Moderate seismic activity',
    droughtLevel: 7,
    droughtNotes: 'Drier parish, agricultural drought impact, water supply challenges',
    landslideLevel: 3,
    landslideNotes: 'Mixed terrain, low to moderate landslide risk',
    powerOutageLevel: 7,
    powerOutageNotes: 'Rural infrastructure, moderate recovery times'
  },
  'St. Catherine': {
    hurricaneLevel: 7,
    hurricaneNotes: 'South coast exposure, moderate hurricane risk, urban areas vulnerable',
    floodLevel: 8,
    floodNotes: 'Urban flooding in Spanish Town, river flooding, poor drainage in some areas',
    earthquakeLevel: 8,
    earthquakeNotes: 'High seismic risk, fault lines present, Spanish Town area vulnerable',
    droughtLevel: 5,
    droughtNotes: 'Moderate drought risk, urban water demand, some agricultural impact',
    landslideLevel: 4,
    landslideNotes: 'Mixed terrain, moderate landslide risk in hilly areas',
    powerOutageLevel: 7,
    powerOutageNotes: 'Urban and rural mix, moderate recovery times'
  }
}

// Barbados Risk Updates - All parishes are small island, uniformly high hurricane risk
const BARBADOS_RISKS: Record<string, RiskUpdate> = {
  'Christ Church': {
    hurricaneLevel: 9,
    hurricaneNotes: 'South coast exposure, frequent hurricane path, storm surge risk in coastal areas, tourism infrastructure vulnerable',
    floodLevel: 7,
    floodNotes: 'Low-lying coastal areas, urban flooding in Oistins and surrounding areas, poor drainage',
    earthquakeLevel: 4,
    earthquakeNotes: 'Low to moderate seismic risk, on eastern Caribbean plate boundary',
    droughtLevel: 7,
    droughtNotes: 'Island water supply challenges, tourism demand high, dry season issues, limited freshwater sources',
    landslideLevel: 2,
    landslideNotes: 'Relatively flat parish, minimal landslide risk',
    powerOutageLevel: 6,
    powerOutageNotes: 'Modern infrastructure but vulnerable to hurricane damage'
  },
  'St. Michael': {
    hurricaneLevel: 9,
    hurricaneNotes: 'Bridgetown capital area, west coast exposure, critical infrastructure at risk, high population density',
    floodLevel: 8,
    floodNotes: 'Urban flooding in Bridgetown, poor drainage in low-lying areas, port area vulnerable, highest flood risk',
    earthquakeLevel: 4,
    earthquakeNotes: 'Capital infrastructure vulnerable, moderate seismic risk',
    droughtLevel: 8,
    droughtNotes: 'Highest population density, tourism and residential demand, water supply critical, desalination dependent',
    landslideLevel: 2,
    landslideNotes: 'Urban coastal area, minimal landslide risk',
    powerOutageLevel: 5,
    powerOutageNotes: 'Capital has priority infrastructure but high demand, faster restoration than other areas'
  },
  'St. James': {
    hurricaneLevel: 8,
    hurricaneNotes: 'West coast tourism area, luxury resorts vulnerable, hurricane exposure, storm surge risk',
    floodLevel: 6,
    floodNotes: 'Coastal flooding risk, less urban drainage issues than capital, moderate flood risk',
    earthquakeLevel: 4,
    earthquakeNotes: 'Moderate seismic risk, tourism infrastructure vulnerable',
    droughtLevel: 8,
    droughtNotes: 'Heavy tourism water demand, hotels and resorts strain supply, critical water needs',
    landslideLevel: 2,
    landslideNotes: 'Coastal flat area, minimal risk',
    powerOutageLevel: 5,
    powerOutageNotes: 'Tourism infrastructure, better resilience than average, prioritized restoration'
  },
  'St. Thomas': {
    hurricaneLevel: 7,
    hurricaneNotes: 'Interior location provides some protection, but still vulnerable to extreme storms',
    floodLevel: 5,
    floodNotes: 'Better drainage at elevation, flash flooding in valleys, moderate risk',
    earthquakeLevel: 4,
    earthquakeNotes: 'Moderate seismic activity',
    droughtLevel: 6,
    droughtNotes: 'Agricultural area, seasonal water challenges, moderate drought impact',
    landslideLevel: 4,
    landslideNotes: 'Some elevated terrain, moderate landslide risk in heavy rain',
    powerOutageLevel: 6,
    powerOutageNotes: 'Rural infrastructure, slower recovery'
  },
  'St. Joseph': {
    hurricaneLevel: 8,
    hurricaneNotes: 'East coast exposure, hurricane path, storm surge and wind risk',
    floodLevel: 6,
    floodNotes: 'Coastal flooding, moderate flood risk, some interior valleys',
    earthquakeLevel: 4,
    earthquakeNotes: 'Moderate seismic risk',
    droughtLevel: 6,
    droughtNotes: 'Agricultural area, seasonal water challenges',
    landslideLevel: 5,
    landslideNotes: 'Elevated terrain, moderate to high landslide risk',
    powerOutageLevel: 7,
    powerOutageNotes: 'Rural infrastructure, moderate recovery times'
  },
  'St. John': {
    hurricaneLevel: 8,
    hurricaneNotes: 'East coast exposure, hurricane path, storm surge risk',
    floodLevel: 6,
    floodNotes: 'Coastal and river flooding, moderate risk',
    earthquakeLevel: 4,
    earthquakeNotes: 'Moderate seismic risk',
    droughtLevel: 6,
    droughtNotes: 'Agricultural area, water supply challenges',
    landslideLevel: 5,
    landslideNotes: 'Elevated terrain, moderate landslide risk',
    powerOutageLevel: 7,
    powerOutageNotes: 'Rural infrastructure, moderate recovery'
  },
  'St. Andrew': {
    hurricaneLevel: 8,
    hurricaneNotes: 'East coast exposure, hurricane path, storm surge and wind',
    floodLevel: 6,
    floodNotes: 'Coastal flooding, moderate flood risk',
    earthquakeLevel: 4,
    earthquakeNotes: 'Moderate seismic risk',
    droughtLevel: 6,
    droughtNotes: 'Agricultural area, seasonal water challenges',
    landslideLevel: 5,
    landslideNotes: 'Elevated terrain, moderate landslide risk',
    powerOutageLevel: 7,
    powerOutageNotes: 'Rural infrastructure, moderate recovery'
  },
  'St. Peter': {
    hurricaneLevel: 8,
    hurricaneNotes: 'North coast exposure, hurricane path, storm surge risk',
    floodLevel: 6,
    floodNotes: 'Coastal flooding, moderate risk',
    earthquakeLevel: 4,
    earthquakeNotes: 'Moderate seismic risk',
    droughtLevel: 6,
    droughtNotes: 'Agricultural and tourism mix, water supply challenges',
    landslideLevel: 3,
    landslideNotes: 'Mixed terrain, low to moderate landslide risk',
    powerOutageLevel: 6,
    powerOutageNotes: 'Moderate infrastructure, moderate recovery'
  },
  'St. Lucy': {
    hurricaneLevel: 9,
    hurricaneNotes: 'Northernmost parish, extreme hurricane exposure, direct storm path, highest wind exposure',
    floodLevel: 7,
    floodNotes: 'Coastal flooding, storm surge risk, moderate to high flood risk',
    earthquakeLevel: 4,
    earthquakeNotes: 'Moderate seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Drier northern area, water supply challenges, agricultural impact',
    landslideLevel: 2,
    landslideNotes: 'Relatively flat, minimal landslide risk',
    powerOutageLevel: 7,
    powerOutageNotes: 'Rural infrastructure, longer recovery times'
  },
  'St. Philip': {
    hurricaneLevel: 9,
    hurricaneNotes: 'Southeast coast, extreme hurricane exposure, storm surge and wind, first landfall location',
    floodLevel: 7,
    floodNotes: 'Coastal flooding, low-lying areas, moderate to high flood risk',
    earthquakeLevel: 4,
    earthquakeNotes: 'Moderate seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Drier area, water supply challenges, agricultural impact',
    landslideLevel: 2,
    landslideNotes: 'Relatively flat, minimal landslide risk',
    powerOutageLevel: 7,
    powerOutageNotes: 'Rural infrastructure, longer recovery times'
  },
  'St. George': {
    hurricaneLevel: 7,
    hurricaneNotes: 'Interior location provides some protection, moderate hurricane exposure',
    floodLevel: 5,
    floodNotes: 'Moderate flood risk, better drainage at elevation',
    earthquakeLevel: 4,
    earthquakeNotes: 'Moderate seismic risk',
    droughtLevel: 6,
    droughtNotes: 'Agricultural area, seasonal water challenges',
    landslideLevel: 4,
    landslideNotes: 'Elevated terrain, moderate landslide risk',
    powerOutageLevel: 6,
    powerOutageNotes: 'Rural infrastructure, moderate recovery'
  }
}

// Bahamas Risk Updates - All islands extremely vulnerable to hurricanes
const BAHAMAS_RISKS: Record<string, RiskUpdate> = {
  'New Providence': {
    hurricaneLevel: 10,
    hurricaneNotes: 'Nassau capital, direct hurricane path, major population and infrastructure at risk. Critical economic hub.',
    floodLevel: 8,
    floodNotes: 'Low-lying island, storm surge flooding, urban drainage issues in Nassau, complete inundation possible',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk, stable Caribbean plate',
    droughtLevel: 6,
    droughtNotes: 'Small island, limited freshwater, high population demand, desalination dependent, water supply critical',
    landslideLevel: 1,
    landslideNotes: 'Flat island, virtually no landslide risk',
    powerOutageLevel: 7,
    powerOutageNotes: 'Hurricane vulnerability, but capital has priority restoration, faster recovery than outer islands'
  },
  'Grand Bahama': {
    hurricaneLevel: 10,
    hurricaneNotes: 'Freeport area, extremely hurricane vulnerable, Hurricane Dorian 2019 devastation (Category 5), catastrophic damage',
    floodLevel: 9,
    floodNotes: 'Very low elevation, extensive flooding during hurricanes, storm surge catastrophic, complete inundation possible',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk',
    droughtLevel: 6,
    droughtNotes: 'Tourism and residential demand, water supply challenges, desalination dependent',
    landslideLevel: 1,
    landslideNotes: 'Flat island topography, no landslide risk',
    powerOutageLevel: 8,
    powerOutageNotes: 'Severe hurricane damage history, long restoration times, infrastructure vulnerable'
  },
  'Abaco': {
    hurricaneLevel: 10,
    hurricaneNotes: 'Northern Bahamas, Hurricane Dorian direct hit 2019 (Category 5), extreme vulnerability, Marsh Harbour devastated',
    floodLevel: 9,
    floodNotes: 'Low-lying cays, complete inundation possible, storm surge devastating, many areas completely submerged',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Outer islands, limited water infrastructure, rainwater dependent, severe water scarcity',
    landslideLevel: 1,
    landslideNotes: 'Flat cays and islands, no landslide risk',
    powerOutageLevel: 9,
    powerOutageNotes: 'Remote location, severe hurricane damage, very long restoration, infrastructure destroyed in 2019'
  },
  'Eleuthera': {
    hurricaneLevel: 9,
    hurricaneNotes: 'Long narrow island, exposed to Atlantic and Caribbean storms, both coasts vulnerable',
    floodLevel: 8,
    floodNotes: 'Narrow island, both coasts vulnerable to storm surge, complete inundation possible',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Limited water sources, agricultural and tourism demand, rainwater dependent',
    landslideLevel: 2,
    landslideNotes: 'Some elevated areas but minimal risk',
    powerOutageLevel: 8,
    powerOutageNotes: 'Remote location, long restoration times after storms'
  },
  'Cat Island': {
    hurricaneLevel: 9,
    hurricaneNotes: 'Central Bahamas, exposed to hurricanes, storm surge and wind risk',
    floodLevel: 7,
    floodNotes: 'Low-lying island, storm surge flooding, moderate to high flood risk',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Limited water infrastructure, rainwater dependent, water scarcity',
    landslideLevel: 1,
    landslideNotes: 'Flat island, minimal landslide risk',
    powerOutageLevel: 8,
    powerOutageNotes: 'Remote location, long restoration times'
  },
  'Andros': {
    hurricaneLevel: 9,
    hurricaneNotes: 'Largest island, exposed to hurricanes, storm surge risk, extensive coastline vulnerable',
    floodLevel: 8,
    floodNotes: 'Low-lying areas, extensive flooding during storms, storm surge risk',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Limited water infrastructure, rainwater dependent, agricultural impact',
    landslideLevel: 1,
    landslideNotes: 'Flat island, no landslide risk',
    powerOutageLevel: 8,
    powerOutageNotes: 'Remote location, long restoration times'
  },
  'Exuma': {
    hurricaneLevel: 9,
    hurricaneNotes: 'Central Bahamas, exposed to hurricanes, storm surge risk, tourism infrastructure vulnerable',
    floodLevel: 8,
    floodNotes: 'Low-lying cays, storm surge flooding, complete inundation possible',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Limited water sources, tourism demand, rainwater dependent',
    landslideLevel: 1,
    landslideNotes: 'Flat cays, no landslide risk',
    powerOutageLevel: 8,
    powerOutageNotes: 'Remote location, long restoration times'
  },
  'Long Island': {
    hurricaneLevel: 9,
    hurricaneNotes: 'Long narrow island, exposed to hurricanes, both coasts vulnerable',
    floodLevel: 7,
    floodNotes: 'Low-lying areas, storm surge flooding, moderate to high risk',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Limited water infrastructure, rainwater dependent',
    landslideLevel: 1,
    landslideNotes: 'Flat island, minimal landslide risk',
    powerOutageLevel: 8,
    powerOutageNotes: 'Remote location, long restoration times'
  },
  'San Salvador': {
    hurricaneLevel: 10,
    hurricaneNotes: 'Outer island, extreme hurricane exposure, direct storm path, very vulnerable',
    floodLevel: 8,
    floodNotes: 'Low-lying island, storm surge flooding, complete inundation possible',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Limited water infrastructure, rainwater dependent, severe water scarcity',
    landslideLevel: 1,
    landslideNotes: 'Flat island, no landslide risk',
    powerOutageLevel: 9,
    powerOutageNotes: 'Very remote location, longest restoration times'
  },
  'Bimini': {
    hurricaneLevel: 10,
    hurricaneNotes: 'Westernmost islands, extreme hurricane exposure, direct storm path, very vulnerable',
    floodLevel: 9,
    floodNotes: 'Very low-lying cays, complete inundation possible, storm surge devastating',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Limited water infrastructure, rainwater dependent, water scarcity',
    landslideLevel: 1,
    landslideNotes: 'Flat cays, no landslide risk',
    powerOutageLevel: 9,
    powerOutageNotes: 'Very remote location, longest restoration times'
  },
  'Inagua': {
    hurricaneLevel: 10,
    hurricaneNotes: 'Southernmost island, extreme hurricane exposure, direct storm path, very vulnerable',
    floodLevel: 8,
    floodNotes: 'Low-lying island, storm surge flooding, complete inundation possible',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk',
    droughtLevel: 8,
    droughtNotes: 'Driest island, severe water scarcity, limited freshwater, rainwater critical',
    landslideLevel: 1,
    landslideNotes: 'Flat island, no landslide risk',
    powerOutageLevel: 9,
    powerOutageNotes: 'Very remote location, longest restoration times'
  },
  'Berry Islands': {
    hurricaneLevel: 10,
    hurricaneNotes: 'Small cays, extreme hurricane exposure, complete devastation possible',
    floodLevel: 9,
    floodNotes: 'Very low-lying cays, complete inundation possible, storm surge catastrophic',
    earthquakeLevel: 2,
    earthquakeNotes: 'Very low seismic risk',
    droughtLevel: 7,
    droughtNotes: 'Limited water infrastructure, rainwater dependent, severe water scarcity',
    landslideLevel: 1,
    landslideNotes: 'Flat cays, no landslide risk',
    powerOutageLevel: 9,
    powerOutageNotes: 'Very remote location, longest restoration times, infrastructure minimal'
  }
}

async function updateRisksForCountry(countryCode: string, risksMap: Record<string, RiskUpdate>) {
  console.log(`\n🌍 Updating risks for ${countryCode}...`)
  
  const country = await prisma.country.findUnique({
    where: { code: countryCode },
    include: {
      adminUnits: {
        include: {
          adminUnitRisk: true
        }
      }
    }
  })
  
  if (!country) {
    console.log(`  ❌ Country ${countryCode} not found`)
    return { updated: 0, created: 0 }
  }
  
  let updated = 0
  let created = 0
  
  for (const unit of country.adminUnits) {
    const riskData = risksMap[unit.name]
    
    if (!riskData) {
      console.log(`  ⚠️  No risk data found for: ${unit.name}`)
      continue
    }
    
    const riskProfileJson = JSON.stringify({
      hurricane: { level: riskData.hurricaneLevel, notes: riskData.hurricaneNotes },
      flooding: { level: riskData.floodLevel, notes: riskData.floodNotes },
      earthquake: { level: riskData.earthquakeLevel, notes: riskData.earthquakeNotes },
      drought: { level: riskData.droughtLevel, notes: riskData.droughtNotes },
      landslide: { level: riskData.landslideLevel, notes: riskData.landslideNotes },
      power_outage: { level: riskData.powerOutageLevel, notes: riskData.powerOutageNotes }
    })
    
    if (unit.adminUnitRisk) {
      await prisma.adminUnitRisk.update({
        where: { id: unit.adminUnitRisk.id },
        data: {
          hurricaneLevel: riskData.hurricaneLevel,
          hurricaneNotes: riskData.hurricaneNotes,
          floodLevel: riskData.floodLevel,
          floodNotes: riskData.floodNotes,
          earthquakeLevel: riskData.earthquakeLevel,
          earthquakeNotes: riskData.earthquakeNotes,
          droughtLevel: riskData.droughtLevel,
          droughtNotes: riskData.droughtNotes,
          landslideLevel: riskData.landslideLevel,
          landslideNotes: riskData.landslideNotes,
          powerOutageLevel: riskData.powerOutageLevel,
          powerOutageNotes: riskData.powerOutageNotes,
          riskProfileJson,
          lastUpdated: new Date(),
          updatedBy: 'comprehensive_risk_update'
        }
      })
      console.log(`  ↻ Updated: ${unit.name}`)
      updated++
    } else {
      await prisma.adminUnitRisk.create({
        data: {
          adminUnitId: unit.id,
          hurricaneLevel: riskData.hurricaneLevel,
          hurricaneNotes: riskData.hurricaneNotes,
          floodLevel: riskData.floodLevel,
          floodNotes: riskData.floodNotes,
          earthquakeLevel: riskData.earthquakeLevel,
          earthquakeNotes: riskData.earthquakeNotes,
          droughtLevel: riskData.droughtLevel,
          droughtNotes: riskData.droughtNotes,
          landslideLevel: riskData.landslideLevel,
          landslideNotes: riskData.landslideNotes,
          powerOutageLevel: riskData.powerOutageLevel,
          powerOutageNotes: riskData.powerOutageNotes,
          riskProfileJson,
          lastUpdated: new Date(),
          updatedBy: 'comprehensive_risk_update'
        }
      })
      console.log(`  ✓ Created: ${unit.name}`)
      created++
    }
  }
  
  return { updated, created }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   COMPREHENSIVE RISK ASSESSMENT UPDATE                      ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('Updating risk assessments based on:')
  console.log('  • Geographic knowledge')
  console.log('  • Historical disaster data')
  console.log('  • Regional vulnerabilities')
  console.log('  • Topographic and climatic factors')
  console.log('')
  
  try {
    const jmResult = await updateRisksForCountry('JM', JAMAICA_RISKS)
    const bbResult = await updateRisksForCountry('BB', BARBADOS_RISKS)
    const bsResult = await updateRisksForCountry('BS', BAHAMAS_RISKS)
    
    console.log('\n' + '═'.repeat(65))
    console.log('✅ RISK UPDATE SUMMARY')
    console.log('═'.repeat(65))
    console.log('')
    console.log('Jamaica (JM):')
    console.log(`  Updated: ${jmResult.updated}`)
    console.log(`  Created: ${jmResult.created}`)
    console.log('')
    console.log('Barbados (BB):')
    console.log(`  Updated: ${bbResult.updated}`)
    console.log(`  Created: ${bbResult.created}`)
    console.log('')
    console.log('Bahamas (BS):')
    console.log(`  Updated: ${bsResult.updated}`)
    console.log(`  Created: ${bsResult.created}`)
    console.log('')
    console.log('✅ All risk assessments updated!')
    console.log('')
    
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

export { updateRisksForCountry }

