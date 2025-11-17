import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   VERIFY COUNTRIES & ADMIN UNITS                             ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  try {
    const countries = ['JM', 'BB', 'BS']
    const countryNames = { 'JM': 'Jamaica', 'BB': 'Barbados', 'BS': 'Bahamas' }
    
    for (const code of countries) {
      const country = await prisma.country.findUnique({
        where: { code },
        include: {
          adminUnits: {
            where: { isActive: true },
            include: {
              adminUnitRisk: true
            },
            orderBy: { name: 'asc' }
          }
        }
      })
      
      if (!country) {
        console.log(`❌ ${countryNames[code]} (${code}): NOT FOUND`)
        continue
      }
      
      console.log(`\n${countryNames[code]} (${code}):`)
      console.log(`  Country ID: ${country.id}`)
      console.log(`  Region: ${country.region || 'N/A'}`)
      console.log(`  Admin Units: ${country.adminUnits.length}`)
      
      if (country.adminUnits.length === 0) {
        console.log(`  ⚠️  WARNING: No admin units found!`)
      } else {
        console.log(`  Admin Units:`)
        country.adminUnits.forEach((unit, index) => {
          const hasRisk = unit.adminUnitRisk ? '✓' : '⚠️'
          console.log(`    ${index + 1}. ${hasRisk} ${unit.name} (${unit.type || 'parish'})`)
          if (unit.adminUnitRisk) {
            console.log(`       Risk: Hurricane ${unit.adminUnitRisk.hurricaneLevel}/10, Flood ${unit.adminUnitRisk.floodLevel}/10`)
          }
        })
      }
    }
    
    console.log('\n' + '═'.repeat(65))
    console.log('✅ Verification complete!')
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

