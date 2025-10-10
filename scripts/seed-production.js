#!/usr/bin/env node

/**
 * Production Database Seeding Script
 * Populates database with Jamaican parishes, business types, strategies, and multipliers
 * 
 * Run: node scripts/seed-production.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌴 Starting Jamaica Business Continuity Database Seeding...\n')
  console.log('=' .repeat(70))

  try {
    // 1. SEED JAMAICAN PARISHES
    console.log('\n📍 Seeding Jamaican Parishes...')
    
    const parishes = [
      {
        name: 'Kingston',
        region: 'Kingston Metropolitan',
        isCoastal: true,
        isUrban: true,
        population: 89057,
        risks: { hurricane: 8, flood: 7, earthquake: 9, drought: 4, landslide: 3, powerOutage: 6, fire: 7, cyberAttack: 6, terrorism: 5, pandemicDisease: 7, economicDownturn: 8, supplyChainDisruption: 7, civilUnrest: 6 }
      },
      {
        name: 'St. Andrew',
        region: 'Kingston Metropolitan',
        isCoastal: false,
        isUrban: true,
        population: 573369,
        risks: { hurricane: 7, flood: 6, earthquake: 9, drought: 4, landslide: 7, powerOutage: 5, fire: 6, cyberAttack: 5, terrorism: 4, pandemicDisease: 7, economicDownturn: 7, supplyChainDisruption: 6, civilUnrest: 5 }
      },
      {
        name: 'St. Catherine',
        region: 'South Central',
        isCoastal: true,
        isUrban: true,
        population: 516218,
        risks: { hurricane: 8, flood: 8, earthquake: 7, drought: 5, landslide: 4, powerOutage: 6, fire: 6, cyberAttack: 4, terrorism: 3, pandemicDisease: 6, economicDownturn: 7, supplyChainDisruption: 7, civilUnrest: 5 }
      },
      {
        name: 'Clarendon',
        region: 'South Central',
        isCoastal: true,
        isUrban: false,
        population: 245103,
        risks: { hurricane: 7, flood: 9, earthquake: 5, drought: 8, landslide: 3, powerOutage: 7, fire: 5, cyberAttack: 2, terrorism: 2, pandemicDisease: 5, economicDownturn: 6, supplyChainDisruption: 6, civilUnrest: 3 }
      },
      {
        name: 'Manchester',
        region: 'South Central',
        isCoastal: false,
        isUrban: false,
        population: 189797,
        risks: { hurricane: 5, flood: 4, earthquake: 6, drought: 6, landslide: 7, powerOutage: 8, fire: 4, cyberAttack: 2, terrorism: 1, pandemicDisease: 4, economicDownturn: 5, supplyChainDisruption: 5, civilUnrest: 2 }
      },
      {
        name: 'St. Elizabeth',
        region: 'South West',
        isCoastal: true,
        isUrban: false,
        population: 150205,
        risks: { hurricane: 8, flood: 5, earthquake: 4, drought: 9, landslide: 3, powerOutage: 8, fire: 4, cyberAttack: 2, terrorism: 1, pandemicDisease: 4, economicDownturn: 5, supplyChainDisruption: 6, civilUnrest: 2 }
      },
      {
        name: 'Westmoreland',
        region: 'South West',
        isCoastal: true,
        isUrban: false,
        population: 144817,
        risks: { hurricane: 9, flood: 6, earthquake: 5, drought: 7, landslide: 4, powerOutage: 7, fire: 4, cyberAttack: 3, terrorism: 2, pandemicDisease: 5, economicDownturn: 6, supplyChainDisruption: 6, civilUnrest: 3 }
      },
      {
        name: 'Hanover',
        region: 'North West',
        isCoastal: true,
        isUrban: false,
        population: 69533,
        risks: { hurricane: 9, flood: 5, earthquake: 4, drought: 6, landslide: 3, powerOutage: 7, fire: 3, cyberAttack: 3, terrorism: 2, pandemicDisease: 4, economicDownturn: 6, supplyChainDisruption: 6, civilUnrest: 2 }
      },
      {
        name: 'St. James',
        region: 'North West',
        isCoastal: true,
        isUrban: true,
        population: 183811,
        risks: { hurricane: 9, flood: 6, earthquake: 5, drought: 5, landslide: 4, powerOutage: 5, fire: 5, cyberAttack: 5, terrorism: 4, pandemicDisease: 6, economicDownturn: 5, supplyChainDisruption: 6, civilUnrest: 4 }
      },
      {
        name: 'Trelawny',
        region: 'North Central',
        isCoastal: true,
        isUrban: false,
        population: 75558,
        risks: { hurricane: 9, flood: 6, earthquake: 4, drought: 5, landslide: 5, powerOutage: 7, fire: 3, cyberAttack: 2, terrorism: 2, pandemicDisease: 4, economicDownturn: 5, supplyChainDisruption: 5, civilUnrest: 2 }
      },
      {
        name: 'St. Ann',
        region: 'North Central',
        isCoastal: true,
        isUrban: false,
        population: 172362,
        risks: { hurricane: 8, flood: 5, earthquake: 5, drought: 6, landslide: 6, powerOutage: 6, fire: 4, cyberAttack: 3, terrorism: 3, pandemicDisease: 5, economicDownturn: 5, supplyChainDisruption: 6, civilUnrest: 3 }
      },
      {
        name: 'St. Mary',
        region: 'North East',
        isCoastal: true,
        isUrban: false,
        population: 113615,
        risks: { hurricane: 8, flood: 7, earthquake: 5, drought: 5, landslide: 8, powerOutage: 7, fire: 4, cyberAttack: 2, terrorism: 2, pandemicDisease: 4, economicDownturn: 5, supplyChainDisruption: 6, civilUnrest: 3 }
      },
      {
        name: 'Portland',
        region: 'North East',
        isCoastal: true,
        isUrban: false,
        population: 81744,
        risks: { hurricane: 9, flood: 8, earthquake: 6, drought: 4, landslide: 9, powerOutage: 8, fire: 3, cyberAttack: 2, terrorism: 1, pandemicDisease: 4, economicDownturn: 5, supplyChainDisruption: 7, civilUnrest: 2 }
      },
      {
        name: 'St. Thomas',
        region: 'South East',
        isCoastal: true,
        isUrban: false,
        population: 93902,
        risks: { hurricane: 8, flood: 7, earthquake: 7, drought: 6, landslide: 7, powerOutage: 7, fire: 4, cyberAttack: 2, terrorism: 2, pandemicDisease: 5, economicDownturn: 6, supplyChainDisruption: 6, civilUnrest: 3 }
      }
    ]

    for (const parishData of parishes) {
      const { risks, ...parishInfo } = parishData
      
      // Check if parish exists
      let parish = await prisma.parish.findFirst({
        where: { name: parishData.name }
      })
      
      if (parish) {
        // Update existing
        parish = await prisma.parish.update({
          where: { id: parish.id },
          data: parishInfo
        })
      } else {
        // Create new
        parish = await prisma.parish.create({
          data: parishInfo
        })
      }

      // Create risk profile
      const riskProfile = {
        fire: { level: risks.fire, notes: 'Urban density and infrastructure age' },
        cyberAttack: { level: risks.cyberAttack, notes: 'Digital infrastructure and business connectivity' },
        terrorism: { level: risks.terrorism, notes: 'Security situation and public spaces' },
        pandemicDisease: { level: risks.pandemicDisease, notes: 'Population density and healthcare access' },
        economicDownturn: { level: risks.economicDownturn, notes: 'Economic diversity and tourism dependency' },
        supplyChainDisruption: { level: risks.supplyChainDisruption, notes: 'Transport links and import dependency' },
        civilUnrest: { level: risks.civilUnrest, notes: 'Social stability and economic conditions' }
      }

      // Check if parish risk exists
      let parishRisk = await prisma.parishRisk.findUnique({
        where: { parishId: parish.id }
      })
      
      const riskData = {
        hurricaneLevel: risks.hurricane,
        floodLevel: risks.flood,
        earthquakeLevel: risks.earthquake,
        droughtLevel: risks.drought,
        landslideLevel: risks.landslide,
        powerOutageLevel: risks.powerOutage,
        riskProfileJson: JSON.stringify(riskProfile),
        lastUpdated: new Date(),
        updatedBy: 'system-seed'
      }
      
      if (parishRisk) {
        await prisma.parishRisk.update({
          where: { id: parishRisk.id },
          data: riskData
        })
      } else {
        await prisma.parishRisk.create({
          data: {
            parishId: parish.id,
            ...riskData
          }
        })
      }

      console.log(`  ✅ ${parish.name} (${parish.region})`)
    }

    console.log(`\n✅ Created ${parishes.length} parishes with risk profiles`)

    // 2. SEED MOM & POP BUSINESS TYPES
    console.log('\n🏪 Seeding Jamaican Business Types...')

    const businessTypes = [
      {
        businessTypeId: 'grocery_minimart',
        name: 'Grocery Store / Mini-Mart',
        category: 'retail',
        subcategory: 'food_retail',
        description: 'Small neighborhood grocery store or mini-mart selling daily essentials',
        typicalRevenue: 'JMD 2M-8M annually',
        typicalEmployees: '2-5 employees',
        operatingHours: '7AM-9PM, 6-7 days/week',
        touristDependency: 2,
        supplyChainComplexity: 7,
        digitalDependency: 4,
        physicalAssetIntensity: 6,
        vulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 8, impactSeverity: 9, recoveryTime: 'weeks', reasoning: 'Stock damage, roof/window damage, power loss affects refrigeration' },
          { riskType: 'flood', vulnerabilityLevel: 9, impactSeverity: 10, recoveryTime: 'weeks', reasoning: 'Complete stock loss, structural damage, contamination' },
          { riskType: 'powerOutage', vulnerabilityLevel: 9, impactSeverity: 9, recoveryTime: 'days', reasoning: 'Perishables spoil, cannot operate refrigeration/freezers' },
          { riskType: 'supplyChainDisruption', vulnerabilityLevel: 8, impactSeverity: 8, recoveryTime: 'days', reasoning: 'Cannot restock, customers go elsewhere' },
          { riskType: 'economicDownturn', vulnerabilityLevel: 7, impactSeverity: 7, recoveryTime: 'months', reasoning: 'Reduced customer spending, credit issues' }
        ]
      },
      {
        businessTypeId: 'restaurant_cookshop',
        name: 'Restaurant / Cook Shop',
        category: 'hospitality',
        subcategory: 'food_service',
        description: 'Small restaurant, cook shop, or food vendor serving local cuisine',
        typicalRevenue: 'JMD 1.5M-6M annually',
        typicalEmployees: '2-6 employees',
        operatingHours: '10AM-8PM, 5-7 days/week',
        touristDependency: 4,
        supplyChainComplexity: 8,
        digitalDependency: 3,
        physicalAssetIntensity: 7,
        vulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 7, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Kitchen damage, stock loss, no customers during recovery' },
          { riskType: 'powerOutage', vulnerabilityLevel: 10, impactSeverity: 10, recoveryTime: 'hours', reasoning: 'Cannot cook, food spoils, must close' },
          { riskType: 'fire', vulnerabilityLevel: 9, impactSeverity: 10, recoveryTime: 'months', reasoning: 'Kitchen fire risk, total loss possible' },
          { riskType: 'supplyChainDisruption', vulnerabilityLevel: 9, impactSeverity: 8, recoveryTime: 'days', reasoning: 'Daily fresh food needed, cannot operate without supplies' },
          { riskType: 'pandemicDisease', vulnerabilityLevel: 8, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Forced closures, reduced customers, health regulations' }
        ]
      },
      {
        businessTypeId: 'bar_rumshop',
        name: 'Bar / Rum Shop',
        category: 'hospitality',
        subcategory: 'entertainment',
        description: 'Small bar, rum shop, or community gathering spot',
        typicalRevenue: 'JMD 1M-4M annually',
        typicalEmployees: '1-3 employees',
        operatingHours: '3PM-11PM, 6-7 days/week',
        touristDependency: 3,
        supplyChainComplexity: 5,
        digitalDependency: 2,
        physicalAssetIntensity: 5,
        vulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 6, impactSeverity: 7, recoveryTime: 'weeks', reasoning: 'Building damage, stock loss, reduced customers' },
          { riskType: 'economicDownturn', vulnerabilityLevel: 9, impactSeverity: 9, recoveryTime: 'months', reasoning: 'Discretionary spending, customers reduce drinking' },
          { riskType: 'civilUnrest', vulnerabilityLevel: 7, impactSeverity: 8, recoveryTime: 'weeks', reasoning: 'Community tensions, safety concerns, vandalism' },
          { riskType: 'pandemicDisease', vulnerabilityLevel: 9, impactSeverity: 10, recoveryTime: 'months', reasoning: 'Forced closures, social distancing, fear of crowds' }
        ]
      },
      {
        businessTypeId: 'pharmacy',
        name: 'Pharmacy / Drug Store',
        category: 'health',
        subcategory: 'healthcare_retail',
        description: 'Community pharmacy selling medications and health products',
        typicalRevenue: 'JMD 4M-15M annually',
        typicalEmployees: '2-4 employees',
        operatingHours: '9AM-6PM, 6 days/week',
        touristDependency: 1,
        supplyChainComplexity: 8,
        digitalDependency: 6,
        physicalAssetIntensity: 7,
        vulnerabilities: [
          { riskType: 'powerOutage', vulnerabilityLevel: 8, impactSeverity: 8, recoveryTime: 'days', reasoning: 'Refrigerated medications spoil, cannot process payments' },
          { riskType: 'supplyChainDisruption', vulnerabilityLevel: 9, impactSeverity: 10, recoveryTime: 'weeks', reasoning: 'Critical medications unavailable, life-threatening for customers' },
          { riskType: 'flood', vulnerabilityLevel: 8, impactSeverity: 9, recoveryTime: 'weeks', reasoning: 'Medication contamination, stock loss, regulatory issues' },
          { riskType: 'cyberAttack', vulnerabilityLevel: 6, impactSeverity: 7, recoveryTime: 'days', reasoning: 'Patient records, inventory system, payment processing' }
        ]
      },
      {
        businessTypeId: 'beauty_salon',
        name: 'Beauty Salon / Hairdresser',
        category: 'services',
        subcategory: 'personal_care',
        description: 'Hair salon, beauty parlor, or barbershop',
        typicalRevenue: 'JMD 1M-5M annually',
        typicalEmployees: '1-4 employees',
        operatingHours: '9AM-7PM, 5-6 days/week',
        touristDependency: 2,
        supplyChainComplexity: 4,
        digitalDependency: 3,
        physicalAssetIntensity: 6,
        vulnerabilities: [
          { riskType: 'powerOutage', vulnerabilityLevel: 7, impactSeverity: 8, recoveryTime: 'hours', reasoning: 'Cannot use electric tools, air conditioning needed' },
          { riskType: 'hurricane', vulnerabilityLevel: 5, impactSeverity: 6, recoveryTime: 'days', reasoning: 'Temporary closure, appointment cancellations' },
          { riskType: 'economicDownturn', vulnerabilityLevel: 8, impactSeverity: 8, recoveryTime: 'months', reasoning: 'Discretionary service, customers delay visits' }
        ]
      },
      {
        businessTypeId: 'hardware_store',
        name: 'Hardware Store / Building Supplies',
        category: 'retail',
        subcategory: 'construction_retail',
        description: 'Small hardware store selling tools, paint, and building materials',
        typicalRevenue: 'JMD 3M-12M annually',
        typicalEmployees: '2-5 employees',
        operatingHours: '8AM-6PM, 6 days/week',
        touristDependency: 1,
        supplyChainComplexity: 7,
        digitalDependency: 4,
        physicalAssetIntensity: 8,
        vulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 5, impactSeverity: 6, recoveryTime: 'days', reasoning: 'High demand after storm, opportunity if prepared' },
          { riskType: 'economicDownturn', vulnerabilityLevel: 7, impactSeverity: 8, recoveryTime: 'months', reasoning: 'Construction slows, repairs delayed' },
          { riskType: 'supplyChainDisruption', vulnerabilityLevel: 8, impactSeverity: 7, recoveryTime: 'weeks', reasoning: 'Import dependent, delivery delays' }
        ]
      }
    ]

    for (const btData of businessTypes) {
      const { vulnerabilities, ...btInfo } = btData
      
      // Check if business type exists
      let businessType = await prisma.businessType.findUnique({
        where: { businessTypeId: btData.businessTypeId }
      })
      
      if (businessType) {
        businessType = await prisma.businessType.update({
          where: { id: businessType.id },
          data: btInfo
        })
      } else {
        businessType = await prisma.businessType.create({
          data: btInfo
        })
      }

      // Add vulnerabilities
      for (const vuln of vulnerabilities) {
        // Check if vulnerability exists
        let existing = await prisma.businessRiskVulnerability.findUnique({
          where: {
            businessTypeId_riskType: {
              businessTypeId: businessType.id,
              riskType: vuln.riskType
            }
          }
        })
        
        const vulnData = {
          vulnerabilityLevel: vuln.vulnerabilityLevel,
          impactSeverity: vuln.impactSeverity,
          recoveryTime: vuln.recoveryTime,
          reasoning: vuln.reasoning
        }
        
        if (existing) {
          await prisma.businessRiskVulnerability.update({
            where: { id: existing.id },
            data: vulnData
          })
        } else {
          await prisma.businessRiskVulnerability.create({
            data: {
              businessTypeId: businessType.id,
              riskType: vuln.riskType,
              ...vulnData
            }
          })
        }
      }

      console.log(`  ✅ ${businessType.name} (${vulnerabilities.length} vulnerabilities)`)
    }

    console.log(`\n✅ Created ${businessTypes.length} business types`)

    // 3. SEED MITIGATION STRATEGIES
    console.log('\n🛡️ Seeding Mitigation Strategies...')

    const strategies = [
      {
        strategyId: 'backup_generator',
        name: 'Backup Generator / Solar System',
        category: 'prevention',
        description: 'Install backup generator or solar power system with battery storage',
        smeDescription: 'Keep a generator with fuel or install solar panels so you never lose power',
        whyImportant: 'Power outages are common in Jamaica. This keeps fridges running and business open',
        implementationCost: 'high',
        timeToImplement: 'weeks',
        effectiveness: 9,
        applicableRisks: JSON.stringify(['powerOutage', 'hurricane']),
        applicableBusinessTypes: JSON.stringify(['grocery_minimart', 'restaurant_cookshop', 'pharmacy']),
        actionSteps: [
          { stepId: 'step_1', phase: 'immediate', title: 'Calculate power needs', description: 'Calculate total power requirements for critical equipment', smeAction: 'List all equipment that must run: fridges, freezers, lights, POS', timeframe: '1 hour', responsibility: 'Owner', estimatedCost: 'Free' },
          { stepId: 'step_2', phase: 'short_term', title: 'Get quotes', description: 'Obtain quotes from multiple electrical suppliers', smeAction: 'Visit 3 electrical suppliers for generator/solar quotes', timeframe: '1 week', responsibility: 'Owner', estimatedCost: 'Free' },
          { stepId: 'step_3', phase: 'medium_term', title: 'Purchase system', description: 'Purchase backup generator or solar power system', smeAction: 'Buy generator (JMD 80,000-200,000) or solar setup', timeframe: '2-4 weeks', responsibility: 'Owner', estimatedCost: 'JMD 80,000-300,000' },
          { stepId: 'step_4', phase: 'medium_term', title: 'Install and test', description: 'Install system and train staff on operation', smeAction: 'Have electrician install and show you how to use it', timeframe: '2-3 days', responsibility: 'Licensed electrician', estimatedCost: 'JMD 15,000-30,000' }
        ]
      },
      {
        strategyId: 'emergency_cash_reserve',
        name: 'Emergency Cash Fund',
        category: 'preparation',
        description: 'Maintain emergency fund covering 3-6 months of basic expenses',
        smeDescription: 'Save money each week until you have 3 months of rent, bills, and staff wages',
        whyImportant: 'When disaster strikes or sales slow, you can keep paying bills and staff',
        implementationCost: 'low',
        timeToImplement: 'months',
        effectiveness: 8,
        applicableRisks: JSON.stringify(['hurricane', 'flood', 'economicDownturn', 'pandemicDisease', 'civilUnrest']),
        applicableBusinessTypes: JSON.stringify(['all']),
        actionSteps: [
          { stepId: 'step_1', phase: 'immediate', title: 'Calculate emergency fund target', description: 'Calculate 3-6 months of essential expenses', smeAction: 'Add up 3 months of: rent, utilities, staff wages, minimum stock', timeframe: '1 hour', responsibility: 'Owner', estimatedCost: 'Free' },
          { stepId: 'step_2', phase: 'short_term', title: 'Open separate account', description: 'Open dedicated emergency savings account', smeAction: 'Open a savings account just for emergencies - do not touch it!', timeframe: '1 day', responsibility: 'Owner', estimatedCost: 'Free' },
          { stepId: 'step_3', phase: 'long_term', title: 'Build fund gradually', description: 'Save regularly until target is reached', smeAction: 'Save 5-10% of weekly sales until you reach your target', timeframe: '6-24 months', responsibility: 'Owner', estimatedCost: 'Varies' }
        ]
      },
      {
        strategyId: 'inventory_management',
        name: 'Smart Inventory System',
        category: 'prevention',
        description: 'Track inventory, avoid overstocking perishables, maintain minimum stock levels',
        smeDescription: 'Write down what you have, what sells fast, and always keep minimum stock on hand',
        whyImportant: 'Reduces losses during disasters and ensures you can reopen quickly',
        implementationCost: 'low',
        timeToImplement: 'days',
        effectiveness: 7,
        applicableRisks: JSON.stringify(['hurricane', 'powerOutage', 'supplyChainDisruption', 'flood']),
        applicableBusinessTypes: JSON.stringify(['grocery_minimart', 'restaurant_cookshop', 'pharmacy', 'hardware_store']),
        actionSteps: [
          { stepId: 'step_1', phase: 'immediate', title: 'List critical items', description: 'Identify essential inventory items that sell daily', smeAction: 'Write down top 20 items that sell every day - these are your essentials', timeframe: '2 hours', responsibility: 'Owner/Manager', estimatedCost: 'Free' },
          { stepId: 'step_2', phase: 'immediate', title: 'Set minimum levels', description: 'Establish minimum stock levels for critical items', smeAction: 'Never let critical items go below 1 week supply', timeframe: '1 hour', responsibility: 'Owner/Manager', estimatedCost: 'Free' },
          { stepId: 'step_3', phase: 'short_term', title: 'Create inventory notebook', description: 'Implement manual inventory tracking system', smeAction: 'Keep a notebook - count stock weekly, note what needs ordering', timeframe: '1 day', responsibility: 'Staff', estimatedCost: 'JMD 500' },
          { stepId: 'step_4', phase: 'medium_term', title: 'Consider inventory software', description: 'Evaluate and implement digital inventory management', smeAction: 'Optional: Use free app like Excel or paid system like QuickBooks', timeframe: '1-2 weeks', responsibility: 'Owner', estimatedCost: 'Free-JMD 5,000/month' }
        ]
      },
      {
        strategyId: 'storm_preparation_kit',
        name: 'Hurricane Preparation Kit',
        category: 'preparation',
        description: 'Prepare emergency supplies and storm protection equipment',
        smeDescription: 'Keep plywood, tarp, flashlights, and supplies ready for hurricane season',
        whyImportant: 'When hurricane warning comes, you can protect your business quickly',
        implementationCost: 'medium',
        timeToImplement: 'days',
        effectiveness: 8,
        applicableRisks: JSON.stringify(['hurricane']),
        applicableBusinessTypes: JSON.stringify(['all']),
        actionSteps: [
          { stepId: 'step_1', phase: 'immediate', title: 'Buy storm supplies', description: 'Purchase hurricane preparation materials and equipment', smeAction: 'Buy: plywood for windows, tarp, hammer, nails, flashlights, batteries', timeframe: '1 day', responsibility: 'Owner', estimatedCost: 'JMD 15,000-30,000' },
          { stepId: 'step_2', phase: 'immediate', title: 'Measure and cut plywood', description: 'Prepare window protection materials', smeAction: 'Measure windows, cut plywood to fit, label each piece, store safely', timeframe: '4 hours', responsibility: 'Owner/Staff', estimatedCost: 'Included above' },
          { stepId: 'step_3', phase: 'short_term', title: 'Create action checklist', description: 'Document step-by-step hurricane preparation procedures', smeAction: 'Write steps: 1) Move stock up high, 2) Board windows, 3) Secure roof, 4) Document everything with photos', timeframe: '1 hour', responsibility: 'Owner', estimatedCost: 'Free' },
          { stepId: 'step_4', phase: 'short_term', title: 'Practice drill', description: 'Conduct hurricane preparation drill with staff', smeAction: 'Do a practice run - see how long it takes to prepare for storm', timeframe: '2 hours', responsibility: 'All staff', estimatedCost: 'Free' }
        ]
      },
      {
        strategyId: 'business_insurance',
        name: 'Business Insurance Coverage',
        category: 'preparation',
        description: 'Get insurance covering property, stock, and business interruption',
        smeDescription: 'Pay monthly premiums so insurance covers losses from disasters',
        whyImportant: 'Insurance can save your business when disaster destroys your stock or building',
        implementationCost: 'medium',
        timeToImplement: 'days',
        effectiveness: 9,
        applicableRisks: JSON.stringify(['hurricane', 'flood', 'fire', 'earthquake']),
        applicableBusinessTypes: JSON.stringify(['all']),
        actionSteps: [
          { stepId: 'step_1', phase: 'immediate', title: 'Calculate coverage needed', description: 'Assess total value of property, equipment, and inventory', smeAction: 'Add up: building value, equipment value, typical stock value', timeframe: '2 hours', responsibility: 'Owner', estimatedCost: 'Free' },
          { stepId: 'step_2', phase: 'short_term', title: 'Get 3 quotes', description: 'Obtain insurance quotes from multiple providers', smeAction: 'Visit Sagicor, Guardian, NCB Insurance - ask about small business packages', timeframe: '1 week', responsibility: 'Owner', estimatedCost: 'Free' },
          { stepId: 'step_3', phase: 'short_term', title: 'Purchase policy', description: 'Select and purchase comprehensive business insurance', smeAction: 'Choose policy covering: property, stock, business interruption, liability', timeframe: '1 day', responsibility: 'Owner', estimatedCost: 'JMD 3,000-15,000/month' },
          { stepId: 'step_4', phase: 'short_term', title: 'Document everything', description: 'Create and maintain documentation for insurance claims', smeAction: 'Take photos/videos of your business, keep receipts, update annually', timeframe: '2 hours', responsibility: 'Owner', estimatedCost: 'Free' }
        ]
      },
      {
        strategyId: 'alternative_suppliers',
        name: 'Multiple Supplier Relationships',
        category: 'prevention',
        description: 'Maintain relationships with at least 2-3 suppliers for critical items',
        smeDescription: 'Know at least 2 different suppliers for everything important',
        whyImportant: 'If one supplier cannot deliver, you have backup options',
        implementationCost: 'low',
        timeToImplement: 'days',
        effectiveness: 7,
        applicableRisks: JSON.stringify(['supplyChainDisruption', 'economicDownturn']),
        applicableBusinessTypes: JSON.stringify(['grocery_minimart', 'restaurant_cookshop', 'pharmacy', 'hardware_store']),
        actionSteps: [
          { stepId: 'step_1', phase: 'immediate', title: 'List critical suppliers', description: 'Document all key suppliers and what they provide', smeAction: 'Write down who supplies your top 20 essential items', timeframe: '1 hour', responsibility: 'Owner', estimatedCost: 'Free' },
          { stepId: 'step_2', phase: 'short_term', title: 'Research alternatives', description: 'Identify backup suppliers for critical items', smeAction: 'For each supplier, find 1-2 backup options with phone numbers', timeframe: '1 week', responsibility: 'Owner/Manager', estimatedCost: 'Free' },
          { stepId: 'step_3', phase: 'short_term', title: 'Test alternatives', description: 'Verify quality and reliability of backup suppliers', smeAction: 'Order small amounts from backup suppliers to test quality and reliability', timeframe: '2 weeks', responsibility: 'Owner', estimatedCost: 'Normal stock cost' },
          { stepId: 'step_4', phase: 'medium_term', title: 'Maintain relationships', description: 'Keep all supplier relationships active', smeAction: 'Order from each supplier monthly to keep relationship active', timeframe: 'Ongoing', responsibility: 'Manager', estimatedCost: 'Normal operations' }
        ]
      },
      {
        strategyId: 'staff_emergency_plan',
        name: 'Staff Communication & Emergency Plan',
        category: 'response',
        description: 'Establish emergency communication system and staff roles during disasters',
        smeDescription: 'Have phone numbers for all staff and plan for who does what in emergency',
        whyImportant: 'You can reach staff quickly and everyone knows their job during crisis',
        implementationCost: 'low',
        timeToImplement: 'hours',
        effectiveness: 7,
        applicableRisks: JSON.stringify(['hurricane', 'flood', 'earthquake', 'fire', 'civilUnrest', 'pandemicDisease']),
        applicableBusinessTypes: JSON.stringify(['all']),
        actionSteps: [
          { stepId: 'step_1', phase: 'immediate', title: 'Collect contact info', description: 'Gather complete contact information for all staff', smeAction: 'Get 2 phone numbers for each staff member, plus emergency contact', timeframe: '1 hour', responsibility: 'Owner/Manager', estimatedCost: 'Free' },
          { stepId: 'step_2', phase: 'immediate', title: 'Assign emergency roles', description: 'Define staff responsibilities during emergencies', smeAction: 'Decide who: secures building, moves stock, checks on equipment, contacts customers', timeframe: '1 hour', responsibility: 'Owner', estimatedCost: 'Free' },
          { stepId: 'step_3', phase: 'immediate', title: 'Create WhatsApp group', description: 'Establish emergency communication channel', smeAction: 'Make staff group for emergency updates - test it works', timeframe: '30 minutes', responsibility: 'Manager', estimatedCost: 'Free' },
          { stepId: 'step_4', phase: 'short_term', title: 'Write emergency plan', description: 'Document emergency procedures for all staff', smeAction: 'One-page plan: what to do before, during, after emergency. Give copy to all staff', timeframe: '2 hours', responsibility: 'Owner', estimatedCost: 'JMD 500 printing' }
        ]
      },
      {
        strategyId: 'digital_records_backup',
        name: 'Digital Records & Cloud Backup',
        category: 'prevention',
        description: 'Digitize important documents and back up to cloud storage',
        smeDescription: 'Take photos of important papers, save to Google Drive or cloud',
        whyImportant: 'If your shop floods or burns, you still have records of everything',
        implementationCost: 'low',
        timeToImplement: 'days',
        effectiveness: 8,
        applicableRisks: JSON.stringify(['fire', 'flood', 'hurricane']),
        applicableBusinessTypes: JSON.stringify(['all']),
        actionSteps: [
          { stepId: 'step_1', phase: 'immediate', title: 'Gather documents', description: 'Collect all critical business documents', smeAction: 'Collect: business registration, insurance, leases, licenses, supplier contracts', timeframe: '2 hours', responsibility: 'Owner', estimatedCost: 'Free' },
          { stepId: 'step_2', phase: 'immediate', title: 'Set up cloud storage', description: 'Create cloud backup account for documents', smeAction: 'Create free Google Drive or Dropbox account (15GB free)', timeframe: '30 minutes', responsibility: 'Owner', estimatedCost: 'Free' },
          { stepId: 'step_3', phase: 'short_term', title: 'Scan/photograph docs', description: 'Digitize and upload all documents to cloud', smeAction: 'Use phone to photograph all documents, organize in folders', timeframe: '3 hours', responsibility: 'Owner/Staff', estimatedCost: 'Free' },
          { stepId: 'step_4', phase: 'short_term', title: 'Regular updates', description: 'Maintain current backup of all documents', smeAction: 'Every month: add new receipts, invoices, update inventory list', timeframe: '1 hour/month', responsibility: 'Manager', estimatedCost: 'Free' }
        ]
      }
    ]

    for (const stratData of strategies) {
      const { actionSteps, ...stratInfo } = stratData
      
      // Check if strategy exists
      let strategy = await prisma.riskMitigationStrategy.findUnique({
        where: { strategyId: stratData.strategyId }
      })
      
      if (strategy) {
        strategy = await prisma.riskMitigationStrategy.update({
          where: { id: strategy.id },
          data: stratInfo
        })
      } else {
        strategy = await prisma.riskMitigationStrategy.create({
          data: stratInfo
        })
      }

      // Add action steps
      for (let i = 0; i < actionSteps.length; i++) {
        const step = actionSteps[i]
        
        // Check if action step exists
        let existingStep = await prisma.actionStep.findUnique({
          where: {
            strategyId_stepId: {
              strategyId: strategy.id,
              stepId: step.stepId
            }
          }
        })
        
        const stepData = {
          ...step,
          sortOrder: i + 1
        }
        
        if (existingStep) {
          await prisma.actionStep.update({
            where: { id: existingStep.id },
            data: stepData
          })
        } else {
          await prisma.actionStep.create({
            data: {
              strategyId: strategy.id,
              ...stepData
            }
          })
        }
      }

      console.log(`  ✅ ${strategy.name} (${actionSteps.length} steps)`)
    }

    console.log(`\n✅ Created ${strategies.length} strategies`)

    // 4. SEED RISK MULTIPLIERS
    console.log('\n⚡ Seeding Risk Multipliers...')

    const multipliers = [
      {
        name: 'Coastal Location - Hurricane Risk',
        description: 'Businesses within 5km of coast face higher hurricane impact',
        characteristicType: 'location_coastal',
        conditionType: 'boolean',
        multiplierFactor: 1.3,
        applicableHazards: JSON.stringify(['hurricane', 'flood']),
        reasoning: 'Coastal areas experience stronger winds, storm surge, and flooding'
      },
      {
        name: 'High Tourism Dependency',
        description: 'Businesses heavily dependent on tourists face higher economic vulnerability',
        characteristicType: 'tourism_share',
        conditionType: 'threshold',
        thresholdValue: 70,
        multiplierFactor: 1.4,
        applicableHazards: JSON.stringify(['hurricane', 'pandemicDisease', 'economicDownturn', 'civilUnrest']),
        reasoning: 'Tourist businesses suffer more when visitors stay away'
      },
      {
        name: 'High Power Dependency',
        description: 'Businesses that cannot operate without power',
        characteristicType: 'power_dependency',
        conditionType: 'boolean',
        multiplierFactor: 1.5,
        applicableHazards: JSON.stringify(['powerOutage', 'hurricane']),
        reasoning: 'Refrigeration, cooking equipment, POS systems require continuous power'
      },
      {
        name: 'High Digital Dependency',
        description: 'Businesses heavily reliant on internet and digital systems',
        characteristicType: 'digital_operations',
        conditionType: 'threshold',
        thresholdValue: 80,
        multiplierFactor: 1.3,
        applicableHazards: JSON.stringify(['cyberAttack', 'powerOutage']),
        reasoning: 'Cannot process payments or manage operations without systems'
      },
      {
        name: 'Perishable Goods - Power Outage',
        description: 'Businesses selling perishable goods face total loss during extended outages',
        characteristicType: 'sells_perishable',
        conditionType: 'boolean',
        multiplierFactor: 1.8,
        applicableHazards: JSON.stringify(['powerOutage', 'hurricane', 'flood']),
        reasoning: 'All refrigerated/frozen stock becomes unsellable'
      },
      {
        name: 'Import Dependency',
        description: 'Businesses relying heavily on imported goods',
        characteristicType: 'imports_overseas',
        conditionType: 'boolean',
        multiplierFactor: 1.4,
        applicableHazards: JSON.stringify(['supplyChainDisruption', 'economicDownturn']),
        reasoning: 'Shipping delays, currency fluctuations, port closures affect operations'
      },
      {
        name: 'Minimal Inventory Buffer',
        description: 'Businesses operating with minimal stock reserves',
        characteristicType: 'minimal_inventory',
        conditionType: 'boolean',
        multiplierFactor: 1.5,
        applicableHazards: JSON.stringify(['supplyChainDisruption', 'hurricane']),
        reasoning: 'Cannot continue operating when supply chain is disrupted'
      }
    ]

    for (const multData of multipliers) {
      // Check if multiplier exists
      let existing = await prisma.riskMultiplier.findFirst({
        where: { name: multData.name }
      })
      
      if (existing) {
        await prisma.riskMultiplier.update({
          where: { id: existing.id },
          data: multData
        })
      } else {
        await prisma.riskMultiplier.create({
          data: multData
        })
      }
      console.log(`  ✅ ${multData.name}`)
    }

    console.log(`\n✅ Created ${multipliers.length} risk multipliers`)

    // SUMMARY
    console.log('\n' + '='.repeat(70))
    console.log('🎉 Database Seeding Complete!\n')
    console.log('Summary:')
    console.log(`  ✅ ${parishes.length} Jamaican parishes with risk profiles`)
    console.log(`  ✅ ${businessTypes.length} mom & pop business types`)
    console.log(`  ✅ ${strategies.length} practical mitigation strategies`)
    console.log(`  ✅ ${multipliers.length} risk multipliers`)
    console.log('\n🚀 Your production database is ready for use!')
    console.log('\nTest your data:')
    console.log('  • Visit: https://your-app.vercel.app/admin2')
    console.log('  • Check parishes, business types, and strategies')
    console.log('  • Create a test business continuity plan!')

  } catch (error) {
    console.error('\n❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

