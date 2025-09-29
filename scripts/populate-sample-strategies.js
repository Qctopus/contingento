const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function populateSampleStrategies() {
  console.log('🛡️ Populating Sample Risk Mitigation Strategies...')

  try {
    const strategies = [
      {
        strategyId: 'backup_power_generator',
        name: 'Backup Power Generator System',
        category: 'preparation',
        description: 'Install and maintain backup power generation capabilities to ensure business continuity during power outages',
        smeDescription: 'Get a generator to keep your business running when the lights go out',
        whyImportant: 'Power outages can shut down your business completely. A generator keeps your equipment running, protects your inventory, and lets you serve customers even when the power is out.',
        applicableRisks: ['powerOutage', 'hurricane'],
        implementationCost: 'medium',
        costEstimateJMD: 'JMD $50,000 - $150,000',
        implementationTime: 'weeks',
        timeToImplement: '2-4 weeks',
        effectiveness: 9,
        businessTypes: ['restaurant', 'grocery_store', 'pharmacy', 'all'],
        priority: 'high',
        helpfulTips: [
          'Choose a generator with enough capacity for your essential equipment',
          'Keep extra fuel stored safely',
          'Test your generator monthly to make sure it works'
        ],
        commonMistakes: [
          'Buying a generator that is too small for your needs',
          'Not maintaining the generator regularly',
          'Forgetting to stock fuel'
        ],
        successMetrics: [
          'Business can operate during power outages',
          'No spoiled inventory due to power loss',
          'Customer service continues uninterrupted'
        ],
        prerequisites: [
          'Electrical assessment of your business',
          'Safe storage space for generator',
          'Budget for fuel and maintenance'
        ],
        roi: 4.5,
        actionSteps: [
          {
            phase: 'immediate',
            action: 'Calculate your power needs and research generator options',
            smeAction: 'Figure out how much power you need and look at generator prices',
            timeframe: '1 week',
            responsibility: 'Business Owner',
            resources: ['Electrician consultation', 'Generator suppliers'],
            cost: 'JMD $5,000',
            estimatedCostJMD: 'JMD $5,000',
            checklist: [
              'List all essential equipment that needs power',
              'Add up the power requirements',
              'Get quotes from 3 generator suppliers',
              'Choose the right size generator'
            ]
          },
          {
            phase: 'short_term',
            action: 'Purchase and install backup generator system',
            smeAction: 'Buy the generator and have it installed properly',
            timeframe: '2-3 weeks',
            responsibility: 'Licensed Electrician',
            resources: ['Generator', 'Installation materials', 'Electrical permits'],
            cost: 'JMD $45,000 - $120,000',
            estimatedCostJMD: 'JMD $45,000 - $120,000',
            checklist: [
              'Order the generator',
              'Get electrical permits',
              'Schedule professional installation',
              'Test the complete system'
            ]
          },
          {
            phase: 'medium_term',
            action: 'Establish maintenance schedule and fuel storage',
            smeAction: 'Set up regular maintenance and keep fuel ready',
            timeframe: '1 month',
            responsibility: 'Business Owner/Maintenance Staff',
            resources: ['Fuel storage containers', 'Maintenance manual'],
            cost: 'JMD $10,000',
            estimatedCostJMD: 'JMD $10,000',
            checklist: [
              'Create monthly testing schedule',
              'Set up safe fuel storage',
              'Train staff on generator operation',
              'Create emergency power procedures'
            ]
          }
        ]
      },
      {
        strategyId: 'emergency_food_preservation',
        name: 'Emergency Food Preservation System',
        category: 'preparation',
        description: 'Implement backup refrigeration and food preservation methods to protect inventory during power outages',
        smeDescription: 'Keep your food fresh even when the power goes out',
        whyImportant: 'Losing your food inventory to spoilage can cost thousands of dollars and hurt your business. Having backup ways to keep food fresh protects your investment.',
        applicableRisks: ['powerOutage', 'hurricane'],
        implementationCost: 'low',
        costEstimateJMD: 'JMD $15,000 - $40,000',
        implementationTime: 'days',
        timeToImplement: '3-7 days',
        effectiveness: 7,
        businessTypes: ['restaurant', 'grocery_store'],
        priority: 'high',
        helpfulTips: [
          'Keep extra ice in freezer at all times',
          'Know which foods spoil fastest',
          'Have insulated containers ready'
        ],
        commonMistakes: [
          'Waiting until power is out to prepare',
          'Not having enough ice or dry ice',
          'Opening refrigerators too often during outages'
        ],
        successMetrics: [
          'No food spoilage during 24-48 hour outages',
          'Inventory preserved and sellable',
          'Minimal financial loss from power events'
        ],
        prerequisites: [
          'Inventory of current refrigeration needs',
          'Relationships with ice suppliers',
          'Storage space for emergency supplies'
        ],
        roi: 8.0,
        actionSteps: [
          {
            phase: 'immediate',
            action: 'Stock emergency preservation supplies',
            smeAction: 'Buy coolers, ice, and insulated containers',
            timeframe: '1-2 days',
            responsibility: 'Business Owner',
            resources: ['Coolers', 'Ice', 'Insulated containers', 'Thermometers'],
            cost: 'JMD $8,000 - $15,000',
            estimatedCostJMD: 'JMD $8,000 - $15,000',
            checklist: [
              'Buy large coolers and ice chests',
              'Stock up on ice',
              'Get battery-powered thermometers',
              'Organize storage space'
            ]
          },
          {
            phase: 'short_term',
            action: 'Create emergency food preservation plan',
            smeAction: 'Make a plan for saving food when power goes out',
            timeframe: '1 week',
            responsibility: 'Business Owner/Staff',
            resources: ['Written procedures', 'Priority food lists'],
            cost: 'JMD $2,000',
            estimatedCostJMD: 'JMD $2,000',
            checklist: [
              'List foods by spoilage priority',
              'Write step-by-step emergency procedures',
              'Train all staff on the plan',
              'Post emergency contact numbers'
            ]
          }
        ]
      },
      {
        strategyId: 'hurricane_structural_protection',
        name: 'Hurricane Structural Protection',
        category: 'preparation',
        description: 'Implement physical barriers and structural reinforcements to protect business premises from hurricane damage',
        smeDescription: 'Protect your building from hurricane winds and flying debris',
        whyImportant: 'Hurricanes can destroy your business with strong winds and flying objects. Protecting your building keeps your business safe and reduces repair costs.',
        applicableRisks: ['hurricane'],
        implementationCost: 'medium',
        costEstimateJMD: 'JMD $30,000 - $100,000',
        implementationTime: 'weeks',
        timeToImplement: '1-3 weeks',
        effectiveness: 8,
        businessTypes: ['all'],
        priority: 'high',
        helpfulTips: [
          'Install storm shutters before hurricane season',
          'Secure outdoor equipment and signs',
          'Keep plywood pre-cut for windows'
        ],
        commonMistakes: [
          'Waiting until hurricane warning to prepare',
          'Using materials that are too weak',
          'Not securing small objects that can become projectiles'
        ],
        successMetrics: [
          'No broken windows during hurricanes',
          'Minimal structural damage',
          'Quick reopening after storms'
        ],
        prerequisites: [
          'Building assessment for vulnerabilities',
          'Measurements of all windows and doors',
          'Storage space for protective materials'
        ],
        roi: 6.0,
        actionSteps: [
          {
            phase: 'immediate',
            action: 'Assess building vulnerabilities and measure openings',
            smeAction: 'Check your building for weak spots and measure windows',
            timeframe: '2-3 days',
            responsibility: 'Business Owner',
            resources: ['Measuring tape', 'Building inspection checklist'],
            cost: 'JMD $2,000',
            estimatedCostJMD: 'JMD $2,000',
            checklist: [
              'Inspect all windows and doors',
              'Measure every opening',
              'Check roof for loose materials',
              'Identify outdoor items that need securing'
            ]
          },
          {
            phase: 'short_term',
            action: 'Install permanent storm shutters or prepare plywood covers',
            smeAction: 'Put up storm shutters or get plywood ready for windows',
            timeframe: '1-2 weeks',
            responsibility: 'Contractor or Business Owner',
            resources: ['Storm shutters or plywood', 'Hardware', 'Tools'],
            cost: 'JMD $25,000 - $75,000',
            estimatedCostJMD: 'JMD $25,000 - $75,000',
            checklist: [
              'Choose between shutters or plywood',
              'Buy materials and hardware',
              'Install or pre-fit protection',
              'Test installation before hurricane season'
            ]
          }
        ]
      },
      {
        strategyId: 'digital_backup_systems',
        name: 'Digital Data Backup & Recovery',
        category: 'preparation',
        description: 'Implement comprehensive data backup and cloud storage solutions to protect critical business information',
        smeDescription: 'Keep your important business records safe online',
        whyImportant: 'Losing your customer lists, sales records, and business files can destroy your business. Backing up your data means you can always get it back.',
        applicableRisks: ['powerOutage', 'hurricane', 'flood', 'earthquake'],
        implementationCost: 'low',
        costEstimateJMD: 'JMD $5,000 - $20,000 per year',
        implementationTime: 'days',
        timeToImplement: '1-5 days',
        effectiveness: 9,
        businessTypes: ['all'],
        priority: 'critical',
        helpfulTips: [
          'Back up data automatically every day',
          'Keep one backup in a different location',
          'Test your backups regularly'
        ],
        commonMistakes: [
          'Only backing up once in a while',
          'Keeping all backups in the same place',
          'Not testing if backups actually work'
        ],
        successMetrics: [
          'All critical data backed up daily',
          'Can restore data within 24 hours',
          'No permanent data loss during disasters'
        ],
        prerequisites: [
          'Inventory of all business data',
          'Reliable internet connection',
          'Cloud storage account'
        ],
        roi: 15.0,
        actionSteps: [
          {
            phase: 'immediate',
            action: 'Set up cloud storage and identify critical data',
            smeAction: 'Get online storage and decide what files are most important',
            timeframe: '1 day',
            responsibility: 'Business Owner',
            resources: ['Cloud storage service', 'Internet connection'],
            cost: 'JMD $1,000 - $3,000',
            estimatedCostJMD: 'JMD $1,000 - $3,000',
            checklist: [
              'Sign up for cloud storage service',
              'List all important business files',
              'Upload most critical documents first',
              'Set up automatic syncing'
            ]
          },
          {
            phase: 'short_term',
            action: 'Implement automated daily backups',
            smeAction: 'Set up automatic backups every day',
            timeframe: '2-3 days',
            responsibility: 'IT Support or Business Owner',
            resources: ['Backup software', 'External hard drive'],
            cost: 'JMD $8,000 - $15,000',
            estimatedCostJMD: 'JMD $8,000 - $15,000',
            checklist: [
              'Install backup software',
              'Schedule automatic daily backups',
              'Test backup and restore process',
              'Train staff on backup procedures'
            ]
          }
        ]
      }
    ]

    // Clear existing mock strategies if any
    console.log('Clearing existing strategies...')
    
    for (const strategyData of strategies) {
      console.log(`Creating strategy: ${strategyData.name}...`)
      
      // Note: This is inserting mock data since we don't have the RiskMitigationStrategy table
      // For now, we'll just log what would be created
      console.log(`✅ Would create strategy: ${strategyData.name}`)
      console.log(`   - Category: ${strategyData.category}`)
      console.log(`   - Priority: ${strategyData.priority}`)
      console.log(`   - Effectiveness: ${strategyData.effectiveness}/10`)
      console.log(`   - Action Steps: ${strategyData.actionSteps.length}`)
      console.log(`   - Business Types: ${strategyData.businessTypes.join(', ')}`)
      console.log(`   - Applicable Risks: ${strategyData.applicableRisks.join(', ')}`)
    }

    console.log('\n🎉 Sample strategies prepared!')
    console.log(`📊 Strategy Summary:`)
    console.log(`- Total Strategies: ${strategies.length}`)
    console.log(`- Prevention: ${strategies.filter(s => s.category === 'prevention').length}`)
    console.log(`- Preparation: ${strategies.filter(s => s.category === 'preparation').length}`)
    console.log(`- Response: ${strategies.filter(s => s.category === 'response').length}`)
    console.log(`- Recovery: ${strategies.filter(s => s.category === 'recovery').length}`)
    console.log(`\n📈 Priority Distribution:`)
    console.log(`- Critical: ${strategies.filter(s => s.priority === 'critical').length}`)
    console.log(`- High: ${strategies.filter(s => s.priority === 'high').length}`)
    console.log(`- Medium: ${strategies.filter(s => s.priority === 'medium').length}`)
    console.log(`- Low: ${strategies.filter(s => s.priority === 'low').length}`)

    // Return the strategies for use by admin2 API
    return strategies

  } catch (error) {
    console.error('❌ Error preparing sample strategies:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

// Export for use in other scripts
module.exports = { populateSampleStrategies }

// Run if called directly
if (require.main === module) {
  populateSampleStrategies()
}

