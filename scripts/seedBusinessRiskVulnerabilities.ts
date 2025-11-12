import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Business Type Risk Vulnerabilities
 * Defines how vulnerable each business type is to different hazards
 * Scale: 1-10 (1=minimal impact, 10=catastrophic impact)
 */

interface VulnerabilityMapping {
  businessTypeId: string
  vulnerabilities: Array<{
    riskType: string
    vulnerabilityLevel: number
    impactSeverity: number
    recoveryTime: string
    reasoning: string
    mitigationDifficulty: number
    costToRecover: string
    businessImpactAreas: string[]
    criticalDependencies: string[]
  }>
}

const BUSINESS_RISK_VULNERABILITIES: VulnerabilityMapping[] = [
  // GROCERY STORES / SUPERMARKETS
  {
    businessTypeId: 'grocery_store',
    vulnerabilities: [
      {
        riskType: 'hurricane',
        vulnerabilityLevel: 8,
        impactSeverity: 9,
        recoveryTime: 'weeks',
        reasoning: 'Building damage, inventory loss (especially perishables), refrigeration failure, supply chain disruption',
        mitigationDifficulty: 6,
        costToRecover: 'high',
        businessImpactAreas: ['operations', 'inventory', 'assets', 'supply_chain'],
        criticalDependencies: ['power', 'water', 'suppliers', 'refrigeration']
      },
      {
        riskType: 'power_outage',
        vulnerabilityLevel: 10,
        impactSeverity: 9,
        recoveryTime: 'hours',
        reasoning: 'Perishable inventory spoils within hours without refrigeration. Thousands in losses.',
        mitigationDifficulty: 4,
        costToRecover: 'high',
        businessImpactAreas: ['inventory', 'operations'],
        criticalDependencies: ['power', 'refrigeration']
      },
      {
        riskType: 'flooding',
        vulnerabilityLevel: 9,
        impactSeverity: 9,
        recoveryTime: 'weeks',
        reasoning: 'Ground-level inventory destroyed by water, extensive cleanup required',
        mitigationDifficulty: 5,
        costToRecover: 'very_high',
        businessImpactAreas: ['inventory', 'assets', 'operations'],
        criticalDependencies: ['drainage', 'elevation']
      },
      {
        riskType: 'supply_disruption',
        vulnerabilityLevel: 8,
        impactSeverity: 7,
        recoveryTime: 'days',
        reasoning: 'Empty shelves = no sales. Highly dependent on regular deliveries.',
        mitigationDifficulty: 6,
        costToRecover: 'medium',
        businessImpactAreas: ['inventory', 'operations', 'customers'],
        criticalDependencies: ['suppliers', 'transportation']
      }
    ]
  },

  // RESTAURANTS
  {
    businessTypeId: 'restaurant',
    vulnerabilities: [
      {
        riskType: 'power_outage',
        vulnerabilityLevel: 10,
        impactSeverity: 9,
        recoveryTime: 'hours',
        reasoning: 'Can\'t cook, refrigeration fails, food spoils. Complete operational shutdown.',
        mitigationDifficulty: 5,
        costToRecover: 'high',
        businessImpactAreas: ['operations', 'inventory'],
        criticalDependencies: ['power', 'gas', 'refrigeration']
      },
      {
        riskType: 'water_shortage',
        vulnerabilityLevel: 9,
        impactSeverity: 8,
        recoveryTime: 'hours',
        reasoning: 'Can\'t cook, clean dishes, or maintain sanitation. Health code violation.',
        mitigationDifficulty: 4,
        costToRecover: 'low',
        businessImpactAreas: ['operations', 'sanitation'],
        criticalDependencies: ['water']
      },
      {
        riskType: 'fire',
        vulnerabilityLevel: 9,
        impactSeverity: 10,
        recoveryTime: 'months',
        reasoning: 'Kitchen fire risk very high. Grease, open flames, hot equipment. Total loss possible.',
        mitigationDifficulty: 3,
        costToRecover: 'very_high',
        businessImpactAreas: ['assets', 'operations', 'staff'],
        criticalDependencies: ['fire_safety', 'ventilation']
      },
      {
        riskType: 'health_emergency',
        vulnerabilityLevel: 9,
        impactSeverity: 8,
        recoveryTime: 'months',
        reasoning: 'Mandatory closure during pandemics. Social distancing reduces capacity 50%+',
        mitigationDifficulty: 8,
        costToRecover: 'high',
        businessImpactAreas: ['operations', 'customers', 'staff', 'revenue'],
        criticalDependencies: ['customers', 'staff', 'regulations']
      }
    ]
  },

  // PHARMACIES
  {
    businessTypeId: 'pharmacy',
    vulnerabilities: [
      {
        riskType: 'power_outage',
        vulnerabilityLevel: 9,
        impactSeverity: 9,
        recoveryTime: 'hours',
        reasoning: 'Refrigerated medications spoil. Can\'t process prescriptions. Computer systems down.',
        mitigationDifficulty: 5,
        costToRecover: 'very_high',
        businessImpactAreas: ['inventory', 'operations'],
        criticalDependencies: ['power', 'refrigeration', 'internet']
      },
      {
        riskType: 'supply_disruption',
        vulnerabilityLevel: 9,
        impactSeverity: 9,
        recoveryTime: 'days',
        reasoning: 'Critical medications unavailable. People\'s health at risk. No substitute sources.',
        mitigationDifficulty: 8,
        costToRecover: 'medium',
        businessImpactAreas: ['inventory', 'customers', 'operations'],
        criticalDependencies: ['suppliers', 'transportation', 'customs']
      },
      {
        riskType: 'theft_vandalism',
        vulnerabilityLevel: 8,
        impactSeverity: 8,
        recoveryTime: 'days',
        reasoning: 'High-value medications targeted by thieves. Controlled substances = legal issues.',
        mitigationDifficulty: 5,
        costToRecover: 'high',
        businessImpactAreas: ['inventory', 'assets', 'operations'],
        criticalDependencies: ['security']
      }
    ]
  },

  // HOTELS / GUESTHOUSES
  {
    businessTypeId: 'hotel',
    vulnerabilities: [
      {
        riskType: 'hurricane',
        vulnerabilityLevel: 9,
        impactSeverity: 10,
        recoveryTime: 'months',
        reasoning: 'Building damage, guest safety responsibility, cancellations, reputation damage',
        mitigationDifficulty: 7,
        costToRecover: 'very_high',
        businessImpactAreas: ['assets', 'operations', 'customers', 'reputation'],
        criticalDependencies: ['structure', 'power', 'water', 'staff']
      },
      {
        riskType: 'economic_downturn',
        vulnerabilityLevel: 9,
        impactSeverity: 9,
        recoveryTime: 'months',
        reasoning: 'Tourism drops 80%+ during economic crises. High fixed costs (staff, maintenance).',
        mitigationDifficulty: 9,
        costToRecover: 'very_high',
        businessImpactAreas: ['revenue', 'customers', 'staff'],
        criticalDependencies: ['tourism', 'economy']
      },
      {
        riskType: 'health_emergency',
        vulnerabilityLevel: 10,
        impactSeverity: 10,
        recoveryTime: 'months',
        reasoning: 'Travel restrictions = zero bookings. Cannot operate with social distancing.',
        mitigationDifficulty: 10,
        costToRecover: 'very_high',
        businessImpactAreas: ['operations', 'revenue', 'customers', 'staff'],
        criticalDependencies: ['tourism', 'travel', 'regulations']
      }
    ]
  },

  // HAIR SALONS / BARBERSHOPS
  {
    businessTypeId: 'hair_salon',
    vulnerabilities: [
      {
        riskType: 'power_outage',
        vulnerabilityLevel: 7,
        impactSeverity: 6,
        recoveryTime: 'hours',
        reasoning: 'Can\'t use electric tools, limited lighting. Natural light = partial operation.',
        mitigationDifficulty: 3,
        costToRecover: 'low',
        businessImpactAreas: ['operations'],
        criticalDependencies: ['power']
      },
      {
        riskType: 'water_shortage',
        vulnerabilityLevel: 9,
        impactSeverity: 8,
        recoveryTime: 'hours',
        reasoning: 'Can\'t wash hair, clean tools, maintain sanitation. Complete shutdown.',
        mitigationDifficulty: 3,
        costToRecover: 'low',
        businessImpactAreas: ['operations', 'sanitation'],
        criticalDependencies: ['water']
      },
      {
        riskType: 'health_emergency',
        vulnerabilityLevel: 8,
        impactSeverity: 7,
        recoveryTime: 'months',
        reasoning: 'Close contact service. Mandatory closure or severe capacity restrictions.',
        mitigationDifficulty: 7,
        costToRecover: 'medium',
        businessImpactAreas: ['operations', 'customers', 'staff'],
        criticalDependencies: ['regulations', 'customers']
      }
    ]
  },

  // IT SERVICES / COMPUTER REPAIR
  {
    businessTypeId: 'it_services',
    vulnerabilities: [
      {
        riskType: 'internet_outage',
        vulnerabilityLevel: 9,
        impactSeverity: 8,
        recoveryTime: 'hours',
        reasoning: 'Cloud services inaccessible. Remote work impossible. Client services disrupted.',
        mitigationDifficulty: 6,
        costToRecover: 'medium',
        businessImpactAreas: ['operations', 'customers'],
        criticalDependencies: ['internet', 'power']
      },
      {
        riskType: 'equipment_failure',
        vulnerabilityLevel: 7,
        impactSeverity: 6,
        recoveryTime: 'days',
        reasoning: 'Diagnostic tools, servers, backup systems fail. Can\'t serve clients.',
        mitigationDifficulty: 5,
        costToRecover: 'medium',
        businessImpactAreas: ['operations', 'assets'],
        criticalDependencies: ['equipment', 'power']
      },
      {
        riskType: 'cybersecurity_incident',
        vulnerabilityLevel: 8,
        impactSeverity: 8,
        recoveryTime: 'weeks',
        reasoning: 'Client data breach = reputation destroyed. Legal liability. Trust loss.',
        mitigationDifficulty: 6,
        costToRecover: 'high',
        businessImpactAreas: ['reputation', 'operations', 'customers'],
        criticalDependencies: ['security', 'backups']
      }
    ]
  },

  // BAKERIES
  {
    businessTypeId: 'bakery',
    vulnerabilities: [
      {
        riskType: 'power_outage',
        vulnerabilityLevel: 10,
        impactSeverity: 9,
        recoveryTime: 'hours',
        reasoning: 'Ovens don\'t work. Refrigeration fails. Can\'t produce products. Total shutdown.',
        mitigationDifficulty: 5,
        costToRecover: 'medium',
        businessImpactAreas: ['operations', 'production'],
        criticalDependencies: ['power', 'gas']
      },
      {
        riskType: 'supply_disruption',
        vulnerabilityLevel: 8,
        impactSeverity: 8,
        recoveryTime: 'days',
        reasoning: 'Flour, yeast, other ingredients unavailable. Can\'t produce. Daily-production model.',
        mitigationDifficulty: 6,
        costToRecover: 'medium',
        businessImpactAreas: ['operations', 'production', 'customers'],
        criticalDependencies: ['suppliers', 'ingredients']
      },
      {
        riskType: 'equipment_failure',
        vulnerabilityLevel: 9,
        impactSeverity: 8,
        recoveryTime: 'days',
        reasoning: 'Oven breakdown = no production. Mixer failure = major disruption. Expensive repairs.',
        mitigationDifficulty: 7,
        costToRecover: 'high',
        businessImpactAreas: ['operations', 'production'],
        criticalDependencies: ['equipment']
      }
    ]
  },

  // AUTO REPAIR / MECHANICS
  {
    businessTypeId: 'auto_repair',
    vulnerabilities: [
      {
        riskType: 'power_outage',
        vulnerabilityLevel: 6,
        impactSeverity: 5,
        recoveryTime: 'hours',
        reasoning: 'Electric tools unusable but some manual work possible. Reduced efficiency.',
        mitigationDifficulty: 4,
        costToRecover: 'low',
        businessImpactAreas: ['operations'],
        criticalDependencies: ['power', 'tools']
      },
      {
        riskType: 'supply_disruption',
        vulnerabilityLevel: 7,
        impactSeverity: 7,
        recoveryTime: 'weeks',
        reasoning: 'Spare parts unavailable. Can\'t complete repairs. Cars stuck in shop.',
        mitigationDifficulty: 7,
        costToRecover: 'medium',
        businessImpactAreas: ['operations', 'customers'],
        criticalDependencies: ['suppliers', 'parts']
      },
      {
        riskType: 'economic_downturn',
        vulnerabilityLevel: 7,
        impactSeverity: 6,
        recoveryTime: 'months',
        reasoning: 'People defer maintenance. Discretionary service reduced. Basic repairs only.',
        mitigationDifficulty: 8,
        costToRecover: 'medium',
        businessImpactAreas: ['revenue', 'customers'],
        criticalDependencies: ['economy', 'customers']
      }
    ]
  },

  // GENERAL RETAIL / CLOTHING STORES
  {
    businessTypeId: 'clothing_store',
    vulnerabilities: [
      {
        riskType: 'flooding',
        vulnerabilityLevel: 8,
        impactSeverity: 9,
        recoveryTime: 'weeks',
        reasoning: 'Ground-level inventory destroyed by water. Fabric/clothing unrecoverable.',
        mitigationDifficulty: 4,
        costToRecover: 'very_high',
        businessImpactAreas: ['inventory', 'assets'],
        criticalDependencies: ['elevation', 'drainage']
      },
      {
        riskType: 'economic_downturn',
        vulnerabilityLevel: 9,
        impactSeverity: 8,
        recoveryTime: 'months',
        reasoning: 'Discretionary spending drops. People buy essentials only. Fashion is postponable.',
        mitigationDifficulty: 9,
        costToRecover: 'medium',
        businessImpactAreas: ['revenue', 'customers'],
        criticalDependencies: ['economy', 'disposable_income']
      },
      {
        riskType: 'theft_vandalism',
        vulnerabilityLevel: 7,
        impactSeverity: 6,
        recoveryTime: 'days',
        reasoning: 'Attractive inventory for thieves. Break-ins common. Security needed.',
        mitigationDifficulty: 4,
        costToRecover: 'medium',
        businessImpactAreas: ['inventory', 'assets'],
        criticalDependencies: ['security']
      }
    ]
  }
]

async function seedBusinessRiskVulnerabilities() {
  console.log('⚡ Seeding business type risk vulnerabilities...\n')
  
  let created = 0
  let updated = 0
  let skipped = 0
  
  for (const mapping of BUSINESS_RISK_VULNERABILITIES) {
    // Find business type
    const businessType = await prisma.businessType.findUnique({
      where: { businessTypeId: mapping.businessTypeId }
    })
    
    if (!businessType) {
      console.log(`  ⚠️  Business type not found: ${mapping.businessTypeId}`)
      skipped++
      continue
    }
    
    console.log(`\n📊 Processing: ${mapping.businessTypeId}`)
    
    for (const vuln of mapping.vulnerabilities) {
      const existing = await prisma.businessRiskVulnerability.findUnique({
        where: {
          businessTypeId_riskType: {
            businessTypeId: businessType.id,
            riskType: vuln.riskType
          }
        }
      })
      
      const data = {
        businessTypeId: businessType.id,
        riskType: vuln.riskType,
        vulnerabilityLevel: vuln.vulnerabilityLevel,
        impactSeverity: vuln.impactSeverity,
        recoveryTime: vuln.recoveryTime,
        reasoning: vuln.reasoning,
        mitigationDifficulty: vuln.mitigationDifficulty,
        costToRecover: vuln.costToRecover,
        businessImpactAreas: JSON.stringify(vuln.businessImpactAreas),
        criticalDependencies: JSON.stringify(vuln.criticalDependencies),
        isActive: true
      }
      
      if (existing) {
        await prisma.businessRiskVulnerability.update({
          where: { id: existing.id },
          data
        })
        console.log(`  ↻ Updated: ${vuln.riskType} (vulnerability: ${vuln.vulnerabilityLevel}/10)`)
        updated++
      } else {
        await prisma.businessRiskVulnerability.create({
          data
        })
        console.log(`  ✓ Created: ${vuln.riskType} (vulnerability: ${vuln.vulnerabilityLevel}/10)`)
        created++
      }
    }
  }
  
  console.log(`\n✅ Business Risk Vulnerabilities Summary:`)
  console.log(`   - New vulnerabilities created: ${created}`)
  console.log(`   - Existing vulnerabilities updated: ${updated}`)
  console.log(`   - Business types skipped: ${skipped}`)
}

// Run if called directly
if (require.main === module) {
  seedBusinessRiskVulnerabilities()
    .then(() => {
      console.log('\n🎉 Business risk vulnerabilities seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedBusinessRiskVulnerabilities }




