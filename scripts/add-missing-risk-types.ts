import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add missing risk types (Fire, Cyber, Security, Health, Economic, Supply, Civil)
 * to all admin units in Jamaica, Barbados, and Bahamas
 */

interface RiskDefaults {
  fire: { level: number; notes: string }
  cyberAttack: { level: number; notes: string }
  terrorism: { level: number; notes: string }
  pandemicDisease: { level: number; notes: string }
  economicDownturn: { level: number; notes: string }
  supplyChainDisruption: { level: number; notes: string }
  civilUnrest: { level: number; notes: string }
}

// Default risk levels by location type
const getDefaultRisks = (
  unitName: string,
  countryCode: string,
  isCapital: boolean,
  isUrban: boolean,
  isTourismHub: boolean,
  population: number
): RiskDefaults => {
  const isJamaica = countryCode === 'JM'
  const isBarbados = countryCode === 'BB'
  const isBahamas = countryCode === 'BS'
  
  // Fire risk - higher in urban areas, capitals, older buildings
  const fireLevel = isCapital ? 8 : isUrban ? 7 : population > 50000 ? 6 : 5
  const fireNotes = isCapital 
    ? 'Capital city with dense urban areas, older buildings, industrial zones, high population density increases fire risk'
    : isUrban
    ? 'Urban area with concentrated buildings, moderate fire risk, fire department response available'
    : 'Rural area with lower building density, but limited fire response infrastructure'

  // Cyber risk - higher in capitals, financial centers, tourism hubs
  const cyberLevel = isCapital ? 8 : isTourismHub ? 7 : isUrban ? 6 : 4
  const cyberNotes = isCapital
    ? 'Financial center, government hub, critical infrastructure, high concentration of digital systems and data'
    : isTourismHub
    ? 'Tourism hub with hotels and businesses using digital systems, moderate cyber risk'
    : 'Limited digital infrastructure, lower cyber risk but still vulnerable to attacks'

  // Terrorism/Security - generally low in Caribbean
  const terrorismLevel = isCapital ? 3 : isTourismHub ? 2 : 1
  const terrorismNotes = isCapital
    ? 'Generally low risk in Caribbean, but capital city has higher profile, some security concerns in certain areas'
    : 'Very low terrorism risk, stable Caribbean region'

  // Pandemic/Health - higher in densely populated areas, tourism hubs, ports
  const pandemicLevel = isCapital ? 8 : isTourismHub ? 7 : population > 50000 ? 6 : 5
  const pandemicNotes = isCapital
    ? 'High population density, international port, tourism hub, rapid disease spread potential, healthcare system strain'
    : isTourismHub
    ? 'Tourism hub with international visitors, moderate pandemic risk, healthcare facilities available'
    : 'Lower population density reduces spread risk, but limited healthcare infrastructure'

  // Economic - higher in capitals, tourism-dependent areas
  const economicLevel = isCapital ? 7 : isTourismHub ? 8 : isBahamas ? 7 : 6
  const economicNotes = isCapital
    ? 'Capital city economic hub, financial services center, but vulnerable to global economic shocks'
    : isTourismHub
    ? 'Tourism-dependent economy, highly vulnerable to global economic downturns and travel restrictions'
    : isBahamas
    ? 'Island economy heavily dependent on tourism, vulnerable to economic shocks'
    : 'Diversified economy with some resilience, but still vulnerable to global economic conditions'

  // Supply Chain - higher in island nations, remote areas, tourism-dependent
  const supplyLevel = isBahamas ? 9 : isBarbados ? 8 : isJamaica ? 7 : 6
  const supplyNotes = isBahamas
    ? 'Remote island location, extreme dependency on imports, tourism supply chains vulnerable, long shipping distances'
    : isBarbados
    ? 'Small island nation, high dependency on imports, tourism supply chains, limited local production'
    : 'Island nation dependency on imports, port disruptions affect supply, tourism-dependent economy'

  // Civil Unrest - generally low but higher in urban areas with economic challenges
  const civilLevel = isCapital ? 5 : isUrban ? 4 : 3
  const civilNotes = isCapital
    ? 'Urban areas with economic challenges, occasional protests, but generally stable political environment'
    : isUrban
    ? 'Urban areas may experience occasional social tensions, but generally stable'
    : 'Rural areas with lower population density, very low civil unrest risk'

  return {
    fire: { level: fireLevel, notes: fireNotes },
    cyberAttack: { level: cyberLevel, notes: cyberNotes },
    terrorism: { level: terrorismLevel, notes: terrorismNotes },
    pandemicDisease: { level: pandemicLevel, notes: pandemicNotes },
    economicDownturn: { level: economicLevel, notes: economicNotes },
    supplyChainDisruption: { level: supplyLevel, notes: supplyNotes },
    civilUnrest: { level: civilLevel, notes: civilNotes }
  }
}

// Special cases for specific locations
const getSpecialRisks = (unitName: string, countryCode: string): Partial<RiskDefaults> => {
  const special: Record<string, Partial<RiskDefaults>> = {
    // Jamaica capitals and major cities
    'Kingston': {
      fire: { level: 8, notes: 'Capital city with dense urban areas, older buildings, industrial zones, high population density increases fire risk' },
      cyberAttack: { level: 8, notes: 'Financial center, government hub, critical infrastructure, high concentration of digital systems and data' },
      pandemicDisease: { level: 8, notes: 'High population density, international port, tourism hub, rapid disease spread potential, healthcare system strain' }
    },
    'St. Andrew': {
      fire: { level: 7, notes: 'Urban area with mixed residential and commercial, moderate fire risk' },
      cyberAttack: { level: 7, notes: 'Suburban area with businesses and digital infrastructure, moderate cyber risk' }
    },
    'Montego Bay': {
      fire: { level: 7, notes: 'Major tourism city, hotels and commercial areas, moderate fire risk' },
      cyberAttack: { level: 7, notes: 'Tourism hub with hotels and businesses, moderate cyber risk' },
      pandemicDisease: { level: 8, notes: 'Major tourism hub, international airport, high visitor volume increases pandemic risk' },
      economicDownturn: { level: 8, notes: 'Heavily tourism-dependent, extremely vulnerable to travel restrictions and economic downturns' }
    },
    'St. James': {
      fire: { level: 6, notes: 'Tourism area with hotels, moderate fire risk' },
      cyberAttack: { level: 7, notes: 'Tourism hub with hotels and businesses using digital systems' },
      pandemicDisease: { level: 7, notes: 'Tourism hub with international visitors, moderate pandemic risk' },
      economicDownturn: { level: 8, notes: 'Tourism-dependent economy, highly vulnerable to economic downturns' }
    },
    
    // Barbados
    'St. Michael': {
      fire: { level: 8, notes: 'Bridgetown capital, dense urban area, older buildings, high fire risk' },
      cyberAttack: { level: 8, notes: 'Capital city, financial center, government hub, high cyber risk' },
      pandemicDisease: { level: 8, notes: 'Capital with high population density, international port, tourism hub' },
      economicDownturn: { level: 7, notes: 'Capital economic hub, but tourism-dependent economy vulnerable' }
    },
    'Christ Church': {
      fire: { level: 6, notes: 'Tourism area with hotels and commercial zones, moderate fire risk' },
      cyberAttack: { level: 7, notes: 'Tourism hub with hotels and businesses, moderate cyber risk' },
      pandemicDisease: { level: 7, notes: 'Tourism area with international visitors, moderate pandemic risk' },
      economicDownturn: { level: 8, notes: 'Tourism-dependent, highly vulnerable to economic downturns' }
    },
    
    // Bahamas
    'New Providence': {
      fire: { level: 8, notes: 'Nassau capital, dense urban area, high population, high fire risk' },
      cyberAttack: { level: 8, notes: 'Capital city, financial center, tourism hub, high cyber risk' },
      pandemicDisease: { level: 8, notes: 'Capital with high population density, major tourism hub, international airport' },
      economicDownturn: { level: 8, notes: 'Tourism-dependent economy, extremely vulnerable to economic shocks' },
      supplyChainDisruption: { level: 9, notes: 'Island capital, extreme dependency on imports, tourism supply chains, critical port' }
    },
    'Grand Bahama': {
      fire: { level: 7, notes: 'Freeport urban area, commercial zones, moderate fire risk' },
      cyberAttack: { level: 7, notes: 'Tourism and commercial hub, moderate cyber risk' },
      pandemicDisease: { level: 7, notes: 'Tourism hub with international visitors, moderate pandemic risk' },
      economicDownturn: { level: 8, notes: 'Tourism-dependent, vulnerable to economic downturns' },
      supplyChainDisruption: { level: 9, notes: 'Remote island location, extreme dependency on imports, long shipping distances' }
    },
    'Abaco': {
      economicDownturn: { level: 8, notes: 'Tourism-dependent, vulnerable to economic downturns' },
      supplyChainDisruption: { level: 9, notes: 'Remote outer island, extreme dependency on imports, very long shipping distances' }
    }
  }
  
  return special[unitName] || {}
}

async function updateAllAdminUnits() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   ADD MISSING RISK TYPES TO ALL ADMIN UNITS                 ║')
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
  let created = 0
  
  for (const country of countries) {
    console.log(`\n🌍 Processing ${country.name} (${country.code})...`)
    
    for (const unit of country.adminUnits) {
      // Determine characteristics
      const isCapital = unit.name === 'Kingston' || unit.name === 'St. Michael' || unit.name === 'New Providence'
      const isUrban = unit.population > 50000 || isCapital
      const isTourismHub = ['Montego Bay', 'St. James', 'St. Ann', 'Christ Church', 'St. Michael', 
                            'New Providence', 'Grand Bahama', 'Abaco', 'Eleuthera', 'Exuma'].includes(unit.name)
      
      // Get default risks
      const defaults = getDefaultRisks(unit.name, country.code, isCapital, isUrban, isTourismHub, unit.population)
      const special = getSpecialRisks(unit.name, country.code)
      
      // Merge special cases with defaults
      const risks = {
        fire: special.fire || defaults.fire,
        cyberAttack: special.cyberAttack || defaults.cyberAttack,
        terrorism: special.terrorism || defaults.terrorism,
        pandemicDisease: special.pandemicDisease || defaults.pandemicDisease,
        economicDownturn: special.economicDownturn || defaults.economicDownturn,
        supplyChainDisruption: special.supplyChainDisruption || defaults.supplyChainDisruption,
        civilUnrest: special.civilUnrest || defaults.civilUnrest
      }
      
      // Get existing risk profile
      let existingProfile: any = {}
      if (unit.adminUnitRisk?.riskProfileJson) {
        try {
          existingProfile = JSON.parse(unit.adminUnitRisk.riskProfileJson)
        } catch (e) {
          existingProfile = {}
        }
      }
      
      // Ensure core risks are in profile (from direct fields if not in JSON)
      if (unit.adminUnitRisk) {
        if (!existingProfile.hurricane) {
          existingProfile.hurricane = { level: unit.adminUnitRisk.hurricaneLevel || 0, notes: unit.adminUnitRisk.hurricaneNotes || '' }
        }
        if (!existingProfile.flood && !existingProfile.flooding) {
          existingProfile.flood = { level: unit.adminUnitRisk.floodLevel || 0, notes: unit.adminUnitRisk.floodNotes || '' }
        }
        if (!existingProfile.earthquake) {
          existingProfile.earthquake = { level: unit.adminUnitRisk.earthquakeLevel || 0, notes: unit.adminUnitRisk.earthquakeNotes || '' }
        }
        if (!existingProfile.drought) {
          existingProfile.drought = { level: unit.adminUnitRisk.droughtLevel || 0, notes: unit.adminUnitRisk.droughtNotes || '' }
        }
        if (!existingProfile.landslide) {
          existingProfile.landslide = { level: unit.adminUnitRisk.landslideLevel || 0, notes: unit.adminUnitRisk.landslideNotes || '' }
        }
        if (!existingProfile.powerOutage) {
          existingProfile.powerOutage = { level: unit.adminUnitRisk.powerOutageLevel || 0, notes: unit.adminUnitRisk.powerOutageNotes || '' }
        }
      }
      
      // Update risk profile with new risks - using camelCase keys to match RISK_TYPES
      const updatedProfile = {
        ...existingProfile,
        fire: { level: risks.fire.level, notes: risks.fire.notes },
        cyberAttack: { level: risks.cyberAttack.level, notes: risks.cyberAttack.notes },
        terrorism: { level: risks.terrorism.level, notes: risks.terrorism.notes },
        pandemicDisease: { level: risks.pandemicDisease.level, notes: risks.pandemicDisease.notes },
        economicDownturn: { level: risks.economicDownturn.level, notes: risks.economicDownturn.notes },
        supplyChainDisruption: { level: risks.supplyChainDisruption.level, notes: risks.supplyChainDisruption.notes },
        civilUnrest: { level: risks.civilUnrest.level, notes: risks.civilUnrest.notes }
      }
      
      if (unit.adminUnitRisk) {
        await prisma.adminUnitRisk.update({
          where: { id: unit.adminUnitRisk.id },
          data: {
            riskProfileJson: JSON.stringify(updatedProfile),
            lastUpdated: new Date(),
            updatedBy: 'add_missing_risk_types'
          }
        })
        console.log(`  ↻ Updated: ${unit.name}`)
        updated++
      } else {
        // Create risk profile if it doesn't exist
        await prisma.adminUnitRisk.create({
          data: {
            adminUnitId: unit.id,
            riskProfileJson: JSON.stringify(updatedProfile),
            lastUpdated: new Date(),
            updatedBy: 'add_missing_risk_types'
          }
        })
        console.log(`  ✓ Created: ${unit.name}`)
        created++
      }
    }
  }
  
  console.log('\n' + '═'.repeat(65))
  console.log('✅ UPDATE SUMMARY')
  console.log('═'.repeat(65))
  console.log(`  Updated: ${updated}`)
  console.log(`  Created: ${created}`)
  console.log('')
  console.log('✅ All missing risk types added!')
  console.log('')
}

async function main() {
  try {
    await updateAllAdminUnits()
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

