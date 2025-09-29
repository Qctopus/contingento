/**
 * Migration script to populate database with all template and legacy strategies
 * This ensures all strategies exist in the database like parishes and business types
 */

const { PrismaClient } = require('@prisma/client')

// Import strategy data directly since ES modules don't work with require
const strategyTemplates = [
  {
    id: 'backup_generator',
    name: 'Backup Power Generator',
    category: 'prevention',
    description: 'Install a backup generator to maintain power during outages',
    cost: 'high',
    timeToImplement: '2-4 weeks',
    effectiveness: 9,
    applicableRisks: ['powerOutage', 'hurricane'],
    applicableBusinessTypes: ['hospitality', 'retail', 'services'],
    prerequisites: ['electrical_assessment', 'permits'],
    maintenanceRequired: true,
    roi: 4.5,
    priority: 'high'
  },
  {
    id: 'emergency_cash_fund',
    name: 'Emergency Cash Reserve',
    category: 'preparation',
    description: 'Maintain emergency cash reserves to cover operating expenses during disruptions',
    cost: 'medium',
    timeToImplement: '3-6 months',
    effectiveness: 8,
    applicableRisks: ['hurricane', 'flood', 'earthquake', 'drought'],
    applicableBusinessTypes: ['all'],
    prerequisites: ['financial_planning'],
    maintenanceRequired: false,
    roi: 3.8,
    priority: 'critical'
  },
  {
    id: 'supplier_diversification',
    name: 'Supplier Diversification Plan',
    category: 'prevention',
    description: 'Establish multiple suppliers for critical materials',
    cost: 'medium',
    timeToImplement: '4-8 weeks',
    effectiveness: 7,
    applicableRisks: ['hurricane', 'flood', 'drought'],
    applicableBusinessTypes: ['retail', 'hospitality', 'manufacturing'],
    prerequisites: ['supplier_analysis'],
    maintenanceRequired: true,
    roi: 3.2,
    priority: 'medium'
  },
  {
    id: 'evacuation_procedures',
    name: 'Emergency Evacuation Procedures',
    category: 'response',
    description: 'Develop and practice emergency evacuation procedures',
    cost: 'low',
    timeToImplement: '1-2 weeks',
    effectiveness: 9,
    applicableRisks: ['hurricane', 'flood', 'earthquake', 'landslide'],
    applicableBusinessTypes: ['all'],
    prerequisites: ['safety_assessment'],
    maintenanceRequired: true,
    roi: 5.0,
    priority: 'critical'
  },
  {
    id: 'elevated_storage',
    name: 'Elevated Storage System',
    category: 'prevention',
    description: 'Store critical inventory above potential flood levels',
    cost: 'medium',
    timeToImplement: '2-3 weeks',
    effectiveness: 8,
    applicableRisks: ['flood', 'hurricane'],
    applicableBusinessTypes: ['retail', 'manufacturing'],
    prerequisites: ['flood_risk_assessment'],
    maintenanceRequired: false,
    roi: 3.5,
    priority: 'high'
  },
  {
    id: 'insurance_review',
    name: 'Comprehensive Insurance Coverage',
    category: 'preparation',
    description: 'Review and update insurance policies for adequate coverage',
    cost: 'medium',
    timeToImplement: '2-4 weeks',
    effectiveness: 7,
    applicableRisks: ['hurricane', 'flood', 'earthquake', 'landslide', 'powerOutage'],
    applicableBusinessTypes: ['all'],
    prerequisites: ['policy_review'],
    maintenanceRequired: true,
    roi: 4.0,
    priority: 'high'
  }
]

const mockStrategies = [
  {
    strategyId: 'communication_plan',
    name: 'Emergency Communication System',
    category: 'response',
    description: 'Establish reliable communication channels for emergencies',
    implementationCost: 'low',
    implementationTime: 'days',
    effectiveness: 8,
    applicableRisks: ['hurricane', 'earthquake', 'powerOutage'],
    businessTypes: ['all'],
    priority: 'high',
    roi: 4.2
  },
  {
    strategyId: 'business_recovery',
    name: 'Rapid Business Recovery Plan',
    category: 'recovery',
    description: 'Structured plan to quickly restore business operations',
    implementationCost: 'medium',
    implementationTime: 'weeks',
    effectiveness: 9,
    applicableRisks: ['hurricane', 'flood', 'earthquake', 'powerOutage'],
    businessTypes: ['all'],
    priority: 'critical',
    roi: 4.8
  }
]

const prisma = new PrismaClient()

async function migrateStrategiesToDatabase() {
  console.log('🛡️ Starting strategy migration to database...')
  
  try {
    // Get existing strategies to avoid duplicates
    const existingStrategies = await prisma.riskMitigationStrategy.findMany({
      select: { strategyId: true }
    })
    const existingStrategyIds = new Set(existingStrategies.map(s => s.strategyId))
    
    let migratedCount = 0
    let skippedCount = 0
    
    // Migrate template strategies
    console.log('📋 Migrating template strategies...')
    for (const template of strategyTemplates) {
      if (existingStrategyIds.has(template.id)) {
        console.log(`⏭️  Skipping existing template strategy: ${template.name}`)
        skippedCount++
        continue
      }
      
      await prisma.riskMitigationStrategy.create({
        data: {
          strategyId: template.id,
          name: template.name,
          category: template.category,
          description: template.description,
          implementationCost: template.cost,
          implementationTime: template.timeToImplement.includes('day') ? 'days' : 
                              template.timeToImplement.includes('week') ? 'weeks' : 
                              template.timeToImplement.includes('month') ? 'months' : 'weeks',
          effectiveness: template.effectiveness,
          applicableRisks: JSON.stringify(template.applicableRisks),
          applicableBusinessTypes: JSON.stringify(template.applicableBusinessTypes),
          prerequisites: JSON.stringify(template.prerequisites),
          maintenanceRequirement: template.maintenanceRequired ? 'high' : 'low',
          roi: template.roi,
          priority: template.priority,
          isActive: true
        }
      })
      
      console.log(`✅ Migrated template strategy: ${template.name}`)
      migratedCount++
    }
    
    // Migrate legacy mock strategies
    console.log('📋 Migrating legacy strategies...')
    for (let i = 0; i < mockStrategies.length; i++) {
      const strategy = mockStrategies[i]
      const strategyId = `legacy_${strategy.strategyId}`
      
      if (existingStrategyIds.has(strategyId)) {
        console.log(`⏭️  Skipping existing legacy strategy: ${strategy.name}`)
        skippedCount++
        continue
      }
      
      await prisma.riskMitigationStrategy.create({
        data: {
          strategyId: strategyId,
          name: strategy.name,
          category: strategy.category,
          description: strategy.description,
          implementationCost: strategy.implementationCost,
          implementationTime: strategy.implementationTime,
          effectiveness: strategy.effectiveness,
          applicableRisks: JSON.stringify(strategy.applicableRisks),
          applicableBusinessTypes: JSON.stringify(strategy.businessTypes),
          prerequisites: JSON.stringify([]),
          maintenanceRequirement: 'low',
          roi: strategy.roi || 3.0,
          priority: strategy.priority,
          isActive: true
        }
      })
      
      console.log(`✅ Migrated legacy strategy: ${strategy.name}`)
      migratedCount++
    }
    
    console.log(`🎉 Migration completed!`)
    console.log(`   ✅ Migrated: ${migratedCount} strategies`)
    console.log(`   ⏭️  Skipped: ${skippedCount} existing strategies`)
    
    // Verify final count
    const totalStrategies = await prisma.riskMitigationStrategy.count({
      where: { isActive: true }
    })
    console.log(`📊 Total active strategies in database: ${totalStrategies}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateStrategiesToDatabase()
    .then(() => {
      console.log('✅ Strategy migration completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Strategy migration failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateStrategiesToDatabase }
