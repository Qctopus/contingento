import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Populate Risk Vulnerabilities for all Business Types
 * Sets vulnerability levels and impact severity for each risk type based on business characteristics
 */

interface RiskVulnerability {
  riskType: string
  vulnerabilityLevel: number // 1-10 scale (how vulnerable this business type is)
  impactSeverity: number // 1-10 scale (how severe impact would be)
  recoveryTime?: string // 'hours', 'days', 'weeks', 'months'
  reasoning: string
  mitigationDifficulty?: number // 1-10 scale
  costToRecover?: string // 'low', 'medium', 'high', 'very_high'
}

const RISK_VULNERABILITIES: Record<string, RiskVulnerability[]> = {
  restaurant: [
    { riskType: 'hurricane', vulnerabilityLevel: 8, impactSeverity: 9, recoveryTime: 'weeks', reasoning: 'Physical damage, power loss, supply chain disruption', mitigationDifficulty: 4, costToRecover: 'high' },
    { riskType: 'flood', vulnerabilityLevel: 9, impactSeverity: 9, recoveryTime: 'weeks', reasoning: 'Equipment damage, food spoilage, structural damage', mitigationDifficulty: 5, costToRecover: 'very_high' },
    { riskType: 'powerOutage', vulnerabilityLevel: 9, impactSeverity: 8, recoveryTime: 'days', reasoning: 'Cannot operate without power for refrigeration, cooking, POS', mitigationDifficulty: 3, costToRecover: 'medium' },
    { riskType: 'fire', vulnerabilityLevel: 7, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Kitchen fires common, complete destruction possible', mitigationDifficulty: 4, costToRecover: 'very_high' },
    { riskType: 'supplyChainDisruption', vulnerabilityLevel: 8, impactSeverity: 7, recoveryTime: 'days', reasoning: 'Dependent on food suppliers, perishable inventory', mitigationDifficulty: 5, costToRecover: 'medium' },
    { riskType: 'economicDownturn', vulnerabilityLevel: 7, impactSeverity: 6, recoveryTime: 'months', reasoning: 'Discretionary spending decreases during economic crisis', mitigationDifficulty: 6, costToRecover: 'low' },
    { riskType: 'pandemicDisease', vulnerabilityLevel: 9, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Dining restrictions, health concerns, staff illness', mitigationDifficulty: 5, costToRecover: 'high' },
    { riskType: 'earthquake', vulnerabilityLevel: 6, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Structural damage, equipment damage, supply disruption', mitigationDifficulty: 4, costToRecover: 'high' },
    { riskType: 'cyberAttack', vulnerabilityLevel: 6, impactSeverity: 5, recoveryTime: 'days', reasoning: 'POS systems vulnerable, customer data at risk', mitigationDifficulty: 4, costToRecover: 'medium' },
    { riskType: 'drought', vulnerabilityLevel: 4, impactSeverity: 5, recoveryTime: 'weeks', reasoning: 'Water restrictions affect operations, supply chain impacts', mitigationDifficulty: 5, costToRecover: 'low' },
    { riskType: 'landslide', vulnerabilityLevel: 3, impactSeverity: 7, recoveryTime: 'weeks', reasoning: 'Location-dependent, access disruption', mitigationDifficulty: 6, costToRecover: 'high' },
    { riskType: 'terrorism', vulnerabilityLevel: 4, impactSeverity: 6, recoveryTime: 'weeks', reasoning: 'Public spaces vulnerable, tourism impact', mitigationDifficulty: 7, costToRecover: 'medium' },
    { riskType: 'civilUnrest', vulnerabilityLevel: 5, impactSeverity: 6, recoveryTime: 'days', reasoning: 'Safety concerns, curfews, reduced foot traffic', mitigationDifficulty: 6, costToRecover: 'low' }
  ],
  fast_food: [
    { riskType: 'hurricane', vulnerabilityLevel: 7, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Physical damage, power loss, supply disruption', mitigationDifficulty: 4, costToRecover: 'high' },
    { riskType: 'flood', vulnerabilityLevel: 8, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Equipment damage, food spoilage', mitigationDifficulty: 5, costToRecover: 'very_high' },
    { riskType: 'powerOutage', vulnerabilityLevel: 9, impactSeverity: 8, recoveryTime: 'days', reasoning: 'Cannot operate without power', mitigationDifficulty: 3, costToRecover: 'medium' },
    { riskType: 'fire', vulnerabilityLevel: 7, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Kitchen fires common', mitigationDifficulty: 4, costToRecover: 'very_high' },
    { riskType: 'supplyChainDisruption', vulnerabilityLevel: 8, impactSeverity: 7, recoveryTime: 'days', reasoning: 'Dependent on food suppliers', mitigationDifficulty: 5, costToRecover: 'medium' },
    { riskType: 'economicDownturn', vulnerabilityLevel: 6, impactSeverity: 5, recoveryTime: 'months', reasoning: 'Price-sensitive customers reduce spending', mitigationDifficulty: 6, costToRecover: 'low' },
    { riskType: 'pandemicDisease', vulnerabilityLevel: 8, impactSeverity: 8, recoveryTime: 'months', reasoning: 'Dining restrictions, health concerns', mitigationDifficulty: 5, costToRecover: 'high' },
    { riskType: 'earthquake', vulnerabilityLevel: 6, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Structural and equipment damage', mitigationDifficulty: 4, costToRecover: 'high' },
    { riskType: 'cyberAttack', vulnerabilityLevel: 6, impactSeverity: 5, recoveryTime: 'days', reasoning: 'POS systems vulnerable', mitigationDifficulty: 4, costToRecover: 'medium' },
    { riskType: 'drought', vulnerabilityLevel: 4, impactSeverity: 4, recoveryTime: 'weeks', reasoning: 'Water restrictions affect operations', mitigationDifficulty: 5, costToRecover: 'low' },
    { riskType: 'landslide', vulnerabilityLevel: 3, impactSeverity: 7, recoveryTime: 'weeks', reasoning: 'Location-dependent', mitigationDifficulty: 6, costToRecover: 'high' },
    { riskType: 'terrorism', vulnerabilityLevel: 4, impactSeverity: 5, recoveryTime: 'weeks', reasoning: 'Public spaces vulnerable', mitigationDifficulty: 7, costToRecover: 'medium' },
    { riskType: 'civilUnrest', vulnerabilityLevel: 5, impactSeverity: 5, recoveryTime: 'days', reasoning: 'Safety concerns, reduced foot traffic', mitigationDifficulty: 6, costToRecover: 'low' }
  ],
  hotel: [
    { riskType: 'hurricane', vulnerabilityLevel: 9, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Physical damage, tourism disruption, guest safety', mitigationDifficulty: 5, costToRecover: 'very_high' },
    { riskType: 'flood', vulnerabilityLevel: 8, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Structural damage, guest displacement, reputation impact', mitigationDifficulty: 5, costToRecover: 'very_high' },
    { riskType: 'powerOutage', vulnerabilityLevel: 8, impactSeverity: 8, recoveryTime: 'days', reasoning: 'Guest comfort, air conditioning, operations', mitigationDifficulty: 4, costToRecover: 'medium' },
    { riskType: 'fire', vulnerabilityLevel: 7, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Guest safety critical, complete closure possible', mitigationDifficulty: 4, costToRecover: 'very_high' },
    { riskType: 'supplyChainDisruption', vulnerabilityLevel: 6, impactSeverity: 5, recoveryTime: 'days', reasoning: 'Supplies for operations, but can adapt', mitigationDifficulty: 4, costToRecover: 'low' },
    { riskType: 'economicDownturn', vulnerabilityLevel: 9, impactSeverity: 8, recoveryTime: 'months', reasoning: 'Tourism-dependent, discretionary travel decreases', mitigationDifficulty: 7, costToRecover: 'high' },
    { riskType: 'pandemicDisease', vulnerabilityLevel: 9, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Travel restrictions, health concerns, guest cancellations', mitigationDifficulty: 6, costToRecover: 'very_high' },
    { riskType: 'earthquake', vulnerabilityLevel: 7, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Structural damage, guest safety, reputation', mitigationDifficulty: 5, costToRecover: 'very_high' },
    { riskType: 'cyberAttack', vulnerabilityLevel: 7, impactSeverity: 7, recoveryTime: 'days', reasoning: 'Guest data, booking systems, payment processing', mitigationDifficulty: 4, costToRecover: 'medium' },
    { riskType: 'drought', vulnerabilityLevel: 5, impactSeverity: 6, recoveryTime: 'weeks', reasoning: 'Water restrictions affect guest services', mitigationDifficulty: 5, costToRecover: 'medium' },
    { riskType: 'landslide', vulnerabilityLevel: 4, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Location-dependent, access disruption', mitigationDifficulty: 6, costToRecover: 'high' },
    { riskType: 'terrorism', vulnerabilityLevel: 8, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Tourism impact, safety concerns, reputation damage', mitigationDifficulty: 7, costToRecover: 'very_high' },
    { riskType: 'civilUnrest', vulnerabilityLevel: 7, impactSeverity: 7, recoveryTime: 'weeks', reasoning: 'Tourism impact, safety concerns, curfews', mitigationDifficulty: 6, costToRecover: 'high' }
  ],
  grocery_store: [
    { riskType: 'hurricane', vulnerabilityLevel: 7, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Physical damage, supply chain disruption, power loss', mitigationDifficulty: 4, costToRecover: 'high' },
    { riskType: 'flood', vulnerabilityLevel: 8, impactSeverity: 9, recoveryTime: 'weeks', reasoning: 'Inventory loss, equipment damage, structural damage', mitigationDifficulty: 5, costToRecover: 'very_high' },
    { riskType: 'powerOutage', vulnerabilityLevel: 9, impactSeverity: 8, recoveryTime: 'days', reasoning: 'Refrigeration critical, cannot operate without power', mitigationDifficulty: 3, costToRecover: 'medium' },
    { riskType: 'fire', vulnerabilityLevel: 6, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Complete inventory loss, structural damage', mitigationDifficulty: 4, costToRecover: 'very_high' },
    { riskType: 'supplyChainDisruption', vulnerabilityLevel: 9, impactSeverity: 8, recoveryTime: 'days', reasoning: 'Completely dependent on suppliers for inventory', mitigationDifficulty: 6, costToRecover: 'high' },
    { riskType: 'economicDownturn', vulnerabilityLevel: 5, impactSeverity: 4, recoveryTime: 'weeks', reasoning: 'Essential business, but reduced spending', mitigationDifficulty: 5, costToRecover: 'low' },
    { riskType: 'pandemicDisease', vulnerabilityLevel: 7, impactSeverity: 7, recoveryTime: 'weeks', reasoning: 'Essential but operational challenges, staff illness', mitigationDifficulty: 5, costToRecover: 'medium' },
    { riskType: 'earthquake', vulnerabilityLevel: 6, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Inventory loss, structural damage', mitigationDifficulty: 4, costToRecover: 'high' },
    { riskType: 'cyberAttack', vulnerabilityLevel: 6, impactSeverity: 6, recoveryTime: 'days', reasoning: 'POS systems, payment processing', mitigationDifficulty: 4, costToRecover: 'medium' },
    { riskType: 'drought', vulnerabilityLevel: 5, impactSeverity: 6, recoveryTime: 'weeks', reasoning: 'Supply chain impacts, water restrictions', mitigationDifficulty: 5, costToRecover: 'medium' },
    { riskType: 'landslide', vulnerabilityLevel: 3, impactSeverity: 7, recoveryTime: 'weeks', reasoning: 'Location-dependent, access disruption', mitigationDifficulty: 6, costToRecover: 'high' },
    { riskType: 'terrorism', vulnerabilityLevel: 4, impactSeverity: 6, recoveryTime: 'weeks', reasoning: 'Public spaces vulnerable', mitigationDifficulty: 7, costToRecover: 'medium' },
    { riskType: 'civilUnrest', vulnerabilityLevel: 5, impactSeverity: 5, recoveryTime: 'days', reasoning: 'Safety concerns, reduced foot traffic', mitigationDifficulty: 6, costToRecover: 'low' }
  ],
  pharmacy: [
    { riskType: 'hurricane', vulnerabilityLevel: 6, impactSeverity: 7, recoveryTime: 'weeks', reasoning: 'Physical damage, supply chain disruption', mitigationDifficulty: 4, costToRecover: 'high' },
    { riskType: 'flood', vulnerabilityLevel: 7, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Inventory loss, equipment damage, medication spoilage', mitigationDifficulty: 5, costToRecover: 'very_high' },
    { riskType: 'powerOutage', vulnerabilityLevel: 8, impactSeverity: 7, recoveryTime: 'days', reasoning: 'Refrigeration for medications critical', mitigationDifficulty: 3, costToRecover: 'medium' },
    { riskType: 'fire', vulnerabilityLevel: 6, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Complete inventory loss, controlled substances', mitigationDifficulty: 4, costToRecover: 'very_high' },
    { riskType: 'supplyChainDisruption', vulnerabilityLevel: 8, impactSeverity: 7, recoveryTime: 'days', reasoning: 'Dependent on pharmaceutical suppliers', mitigationDifficulty: 6, costToRecover: 'high' },
    { riskType: 'economicDownturn', vulnerabilityLevel: 4, impactSeverity: 3, recoveryTime: 'weeks', reasoning: 'Essential healthcare service, stable demand', mitigationDifficulty: 5, costToRecover: 'low' },
    { riskType: 'pandemicDisease', vulnerabilityLevel: 8, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Increased demand but supply challenges, staff illness', mitigationDifficulty: 5, costToRecover: 'high' },
    { riskType: 'earthquake', vulnerabilityLevel: 6, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Inventory loss, structural damage', mitigationDifficulty: 4, costToRecover: 'high' },
    { riskType: 'cyberAttack', vulnerabilityLevel: 7, impactSeverity: 7, recoveryTime: 'days', reasoning: 'Patient data, prescription systems, HIPAA compliance', mitigationDifficulty: 4, costToRecover: 'medium' },
    { riskType: 'drought', vulnerabilityLevel: 3, impactSeverity: 4, recoveryTime: 'weeks', reasoning: 'Minimal water dependency', mitigationDifficulty: 5, costToRecover: 'low' },
    { riskType: 'landslide', vulnerabilityLevel: 3, impactSeverity: 7, recoveryTime: 'weeks', reasoning: 'Location-dependent', mitigationDifficulty: 6, costToRecover: 'high' },
    { riskType: 'terrorism', vulnerabilityLevel: 4, impactSeverity: 6, recoveryTime: 'weeks', reasoning: 'Public spaces vulnerable', mitigationDifficulty: 7, costToRecover: 'medium' },
    { riskType: 'civilUnrest', vulnerabilityLevel: 4, impactSeverity: 5, recoveryTime: 'days', reasoning: 'Essential service, but safety concerns', mitigationDifficulty: 6, costToRecover: 'low' }
  ]
}

// Continue with more business types...
// For brevity, I'll create a function that generates reasonable defaults for business types not explicitly defined

function getDefaultRiskVulnerabilities(businessTypeId: string, category: string): RiskVulnerability[] {
  const baseRisks: RiskVulnerability[] = [
    { riskType: 'hurricane', vulnerabilityLevel: 6, impactSeverity: 7, recoveryTime: 'weeks', reasoning: 'Physical damage, power loss', mitigationDifficulty: 4, costToRecover: 'high' },
    { riskType: 'flood', vulnerabilityLevel: 7, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Equipment and inventory damage', mitigationDifficulty: 5, costToRecover: 'high' },
    { riskType: 'powerOutage', vulnerabilityLevel: 7, impactSeverity: 7, recoveryTime: 'days', reasoning: 'Operations dependent on electricity', mitigationDifficulty: 3, costToRecover: 'medium' },
    { riskType: 'fire', vulnerabilityLevel: 6, impactSeverity: 8, recoveryTime: 'months', reasoning: 'Property and inventory loss', mitigationDifficulty: 4, costToRecover: 'very_high' },
    { riskType: 'supplyChainDisruption', vulnerabilityLevel: 6, impactSeverity: 6, recoveryTime: 'days', reasoning: 'Dependent on suppliers', mitigationDifficulty: 5, costToRecover: 'medium' },
    { riskType: 'economicDownturn', vulnerabilityLevel: 7, impactSeverity: 6, recoveryTime: 'months', reasoning: 'Reduced consumer spending', mitigationDifficulty: 6, costToRecover: 'low' },
    { riskType: 'pandemicDisease', vulnerabilityLevel: 7, impactSeverity: 7, recoveryTime: 'months', reasoning: 'Operational restrictions, health concerns', mitigationDifficulty: 5, costToRecover: 'high' },
    { riskType: 'earthquake', vulnerabilityLevel: 5, impactSeverity: 7, recoveryTime: 'weeks', reasoning: 'Structural and equipment damage', mitigationDifficulty: 4, costToRecover: 'high' },
    { riskType: 'cyberAttack', vulnerabilityLevel: 6, impactSeverity: 6, recoveryTime: 'days', reasoning: 'Digital systems vulnerable', mitigationDifficulty: 4, costToRecover: 'medium' },
    { riskType: 'drought', vulnerabilityLevel: 4, impactSeverity: 5, recoveryTime: 'weeks', reasoning: 'Water restrictions may affect operations', mitigationDifficulty: 5, costToRecover: 'low' },
    { riskType: 'landslide', vulnerabilityLevel: 3, impactSeverity: 6, recoveryTime: 'weeks', reasoning: 'Location-dependent risk', mitigationDifficulty: 6, costToRecover: 'high' },
    { riskType: 'terrorism', vulnerabilityLevel: 4, impactSeverity: 6, recoveryTime: 'weeks', reasoning: 'Public spaces vulnerable', mitigationDifficulty: 7, costToRecover: 'medium' },
    { riskType: 'civilUnrest', vulnerabilityLevel: 5, impactSeverity: 5, recoveryTime: 'days', reasoning: 'Safety concerns, reduced foot traffic', mitigationDifficulty: 6, costToRecover: 'low' }
  ]

  // Adjust based on category
  if (category === 'hospitality') {
    baseRisks.find(r => r.riskType === 'economicDownturn')!.vulnerabilityLevel = 8
    baseRisks.find(r => r.riskType === 'pandemicDisease')!.vulnerabilityLevel = 9
  } else if (category === 'retail') {
    baseRisks.find(r => r.riskType === 'supplyChainDisruption')!.vulnerabilityLevel = 7
  } else if (category === 'healthcare') {
    baseRisks.find(r => r.riskType === 'cyberAttack')!.vulnerabilityLevel = 7
    baseRisks.find(r => r.riskType === 'pandemicDisease')!.vulnerabilityLevel = 8
  }

  return baseRisks
}

async function populateRiskVulnerabilities() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   POPULATE BUSINESS TYPE RISK VULNERABILITIES              ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')

  const businessTypes = await prisma.businessType.findMany({
    where: { isActive: true },
    orderBy: { businessTypeId: 'asc' }
  })

  console.log(`Found ${businessTypes.length} business types\n`)

  let created = 0
  let updated = 0
  let skipped = 0

  for (const bt of businessTypes) {
    const vulnerabilities = RISK_VULNERABILITIES[bt.businessTypeId] || getDefaultRiskVulnerabilities(bt.businessTypeId, bt.category)

    for (const vuln of vulnerabilities) {
      try {
        const existing = await prisma.businessRiskVulnerability.findUnique({
          where: {
            businessTypeId_riskType: {
              businessTypeId: bt.id,
              riskType: vuln.riskType
            }
          }
        })

        if (existing) {
          await prisma.businessRiskVulnerability.update({
            where: { id: existing.id },
            data: {
              vulnerabilityLevel: vuln.vulnerabilityLevel,
              impactSeverity: vuln.impactSeverity,
              recoveryTime: vuln.recoveryTime || 'medium',
              reasoning: vuln.reasoning,
              mitigationDifficulty: vuln.mitigationDifficulty || 5,
              costToRecover: vuln.costToRecover || 'medium'
            }
          })
          updated++
        } else {
          await prisma.businessRiskVulnerability.create({
            data: {
              businessTypeId: bt.id,
              riskType: vuln.riskType,
              vulnerabilityLevel: vuln.vulnerabilityLevel,
              impactSeverity: vuln.impactSeverity,
              recoveryTime: vuln.recoveryTime || 'medium',
              reasoning: vuln.reasoning,
              mitigationDifficulty: vuln.mitigationDifficulty || 5,
              costToRecover: vuln.costToRecover || 'medium'
            }
          })
          created++
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${bt.businessTypeId} - ${vuln.riskType}:`, error)
        skipped++
      }
    }

    const nameObj = typeof bt.name === 'string' ? JSON.parse(bt.name) : bt.name
    console.log(`  ✓ ${nameObj.en || bt.businessTypeId}: ${vulnerabilities.length} risk vulnerabilities`)
  }

  console.log('\n' + '═'.repeat(65))
  console.log('✅ UPDATE SUMMARY')
  console.log('═'.repeat(65))
  console.log(`  Created: ${created}`)
  console.log(`  Updated: ${updated}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Total processed: ${created + updated}`)
  console.log('')
  console.log('✅ Risk vulnerabilities populated for all business types!')
  console.log('')
}

async function main() {
  try {
    await populateRiskVulnerabilities()
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

export { populateRiskVulnerabilities }

