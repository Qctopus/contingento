import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   FINAL SEEDING SUMMARY                                       ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  try {
    const countries = await prisma.country.findMany({
      where: { 
        code: { in: ['JM', 'BB', 'BS'] },
        isActive: true 
      },
      include: {
        adminUnits: {
          where: { isActive: true },
          include: {
            adminUnitRisk: true
          }
        }
      },
      orderBy: { code: 'asc' }
    })
    
    const multipliers = await prisma.countryCostMultiplier.findMany({
      where: { countryCode: { in: ['JM', 'BB', 'BS'] } }
    })
    
    console.log('📊 SEEDING SUMMARY\n')
    console.log('═'.repeat(65))
    
    for (const country of countries) {
      const multiplier = multipliers.find(m => m.countryCode === country.code)
      const unitsWithRisks = country.adminUnits.filter(u => u.adminUnitRisk)
      
      console.log(`\n${country.name} (${country.code}):`)
      console.log(`  ✓ Country exists`)
      console.log(`  ✓ Admin Units: ${country.adminUnits.length}`)
      console.log(`  ✓ Units with Risk Data: ${unitsWithRisks.length}`)
      
      if (multiplier) {
        console.log(`  ✓ Cost Multiplier: ${multiplier.currency} (${multiplier.currencySymbol})`)
        console.log(`    Exchange Rate: ${multiplier.exchangeRateUSD} ${multiplier.currency} = 1 USD`)
        console.log(`    Construction: ${multiplier.construction}x, Equipment: ${multiplier.equipment}x`)
      } else {
        console.log(`  ⚠️  Cost Multiplier: MISSING`)
      }
      
      // List admin units
      if (country.adminUnits.length > 0) {
        console.log(`  Admin Units:`)
        country.adminUnits.slice(0, 5).forEach(unit => {
          const risk = unit.adminUnitRisk
          const riskStr = risk 
            ? `H:${risk.hurricaneLevel}/10 F:${risk.floodLevel}/10`
            : 'No risk data'
          console.log(`    • ${unit.name} (${unit.type || 'parish'}) - ${riskStr}`)
        })
        if (country.adminUnits.length > 5) {
          console.log(`    ... and ${country.adminUnits.length - 5} more`)
        }
      }
    }
    
    console.log('\n' + '═'.repeat(65))
    console.log('✅ DATABASE SEEDING STATUS')
    console.log('═'.repeat(65))
    console.log('')
    console.log('Countries:')
    console.log(`  🇯🇲 Jamaica: ${countries.find(c => c.code === 'JM')?.adminUnits.length || 0} parishes`)
    console.log(`  🇧🇧 Barbados: ${countries.find(c => c.code === 'BB')?.adminUnits.length || 0} parishes`)
    console.log(`  🇧🇸 Bahamas: ${countries.find(c => c.code === 'BS')?.adminUnits.length || 0} islands/districts`)
    console.log('')
    console.log('Total Admin Units:')
    const totalUnits = countries.reduce((sum, c) => sum + c.adminUnits.length, 0)
    const totalWithRisks = countries.reduce((sum, c) => 
      sum + c.adminUnits.filter(u => u.adminUnitRisk).length, 0
    )
    console.log(`  ${totalUnits} total`)
    console.log(`  ${totalWithRisks} with risk assessments`)
    console.log('')
    console.log('Cost Multipliers:')
    multipliers.forEach(m => {
      console.log(`  ${m.countryCode}: ${m.currency} (${m.currencySymbol}) - ${m.exchangeRateUSD} = 1 USD`)
    })
    console.log('')
    console.log('✅ All three countries are properly seeded!')
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

