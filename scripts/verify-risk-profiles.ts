import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   VERIFY RISK PROFILES                                        ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  const countries = await prisma.country.findMany({
    where: { code: { in: ['JM', 'BB', 'BS'] } },
    include: {
      adminUnits: {
        include: {
          adminUnitRisk: true
        },
        take: 2 // Sample 2 from each country
      }
    }
  })
  
  for (const country of countries) {
    console.log(`\n${country.name} (${country.code}):`)
    console.log('─'.repeat(65))
    
    for (const unit of country.adminUnits) {
      if (!unit.adminUnitRisk) {
        console.log(`  ⚠️  ${unit.name}: No risk profile`)
        continue
      }
      
      let profile: any = {}
      try {
        profile = JSON.parse(unit.adminUnitRisk.riskProfileJson || '{}')
      } catch (e) {
        console.log(`  ❌ ${unit.name}: Invalid JSON`)
        continue
      }
      
      const riskKeys = Object.keys(profile)
      console.log(`\n  ${unit.name}:`)
      console.log(`    Risk types in profile: ${riskKeys.length}`)
      console.log(`    Risk types: ${riskKeys.join(', ')}`)
      
      // Check for all expected risk types
      const expectedRisks = [
        'hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'power_outage',
        'fire', 'cyber_attack', 'terrorism', 'pandemic', 'economic_downturn', 
        'supply_chain', 'civil_unrest'
      ]
      
      const missing = expectedRisks.filter(r => !riskKeys.includes(r))
      if (missing.length > 0) {
        console.log(`    ⚠️  Missing: ${missing.join(', ')}`)
      } else {
        console.log(`    ✅ All risk types present`)
      }
      
      // Show sample risk levels
      const sampleRisks = ['fire', 'cyber_attack', 'pandemic', 'economic_downturn', 'supply_chain']
      console.log(`    Sample risk levels:`)
      sampleRisks.forEach(key => {
        if (profile[key]) {
          console.log(`      ${key}: ${profile[key].level}/10`)
        }
      })
    }
  }
  
  console.log('\n' + '═'.repeat(65))
  console.log('✅ Verification complete!')
  console.log('')
  
  await prisma.$disconnect()
}

main().catch(console.error)

