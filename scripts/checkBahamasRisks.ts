/**
 * Check Bahamas admin unit risks
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBahamasRisks() {
  console.log('🔍 Checking Bahamas admin unit risks...\n')

  try {
    // Find Bahamas country
    const bahamas = await prisma.country.findFirst({
      where: { 
        OR: [
          { code: 'BS' },
          { name: { contains: 'Bahamas' } }
        ]
      }
    })

    console.log('Bahamas country:', bahamas)

    if (!bahamas) {
      console.log('❌ Bahamas not found in countries')
      return
    }

    // Get all Bahamas admin units with their risks
    const adminUnits = await prisma.adminUnit.findMany({
      where: { countryId: bahamas.id },
      include: { AdminUnitRisk: true }
    })

    console.log(`\n📍 Found ${adminUnits.length} Bahamas admin units:\n`)

    for (const unit of adminUnits) {
      console.log(`\n${unit.name}:`)
      if (unit.AdminUnitRisk) {
        console.log(`  Hurricane: ${unit.AdminUnitRisk.hurricaneLevel}`)
        console.log(`  Flood: ${unit.AdminUnitRisk.floodLevel}`)
        console.log(`  Earthquake: ${unit.AdminUnitRisk.earthquakeLevel}`)
        console.log(`  Drought: ${unit.AdminUnitRisk.droughtLevel}`)
        console.log(`  Landslide: ${unit.AdminUnitRisk.landslideLevel}`)
        console.log(`  Power Outage: ${unit.AdminUnitRisk.powerOutageLevel}`)
        console.log(`  Risk Profile JSON: ${unit.AdminUnitRisk.riskProfileJson?.substring(0, 100)}...`)
      } else {
        console.log('  ❌ No AdminUnitRisk record!')
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBahamasRisks()

