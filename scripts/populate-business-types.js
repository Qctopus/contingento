const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function populateBusinessTypes() {
  console.log('🏢 Populating Jamaica Business Types...')

  try {
    // Clear existing data
    await prisma.businessRiskVulnerability.deleteMany()
    await prisma.businessType.deleteMany()
    console.log('✅ Cleared existing business type data')

    const businessTypes = [
      {
        businessTypeId: 'restaurant',
        name: 'Restaurant',
        category: 'hospitality',
        subcategory: 'Food Service',
        description: 'Local restaurants serving Jamaican cuisine and international food',
        typicalRevenue: 'JMD 5M-25M annually',
        typicalEmployees: '8-25 employees',
        operatingHours: '11:00 AM - 11:00 PM',
        seasonalityFactor: 1.3,
        touristDependency: 7,
        supplyChainComplexity: 6,
        digitalDependency: 4,
        cashFlowPattern: 'seasonal',
        physicalAssetIntensity: 6,
        customerConcentration: 4,
        regulatoryBurden: 5,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 8, impactSeverity: 9, reasoning: 'Outdoor seating and tourist-dependent revenue' },
          { riskType: 'powerOutage', vulnerabilityLevel: 9, impactSeverity: 8, reasoning: 'Critical for refrigeration and cooking equipment' },
          { riskType: 'flood', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Ground-level operations vulnerable to flooding' },
          { riskType: 'earthquake', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Building structural damage affects operations' },
          { riskType: 'drought', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Water supply important for food preparation and cleaning' },
          { riskType: 'landslide', vulnerabilityLevel: 3, impactSeverity: 4, reasoning: 'Location-dependent vulnerability' }
        ]
      },
      {
        businessTypeId: 'grocery_store',
        name: 'Grocery Store',
        category: 'retail',
        subcategory: 'Food Retail',
        description: 'Small to medium grocery stores and supermarkets',
        typicalRevenue: 'JMD 10M-50M annually',
        typicalEmployees: '6-20 employees',
        operatingHours: '7:00 AM - 10:00 PM',
        seasonalityFactor: 1.1,
        touristDependency: 3,
        supplyChainComplexity: 8,
        digitalDependency: 5,
        cashFlowPattern: 'stable',
        physicalAssetIntensity: 7,
        customerConcentration: 2,
        regulatoryBurden: 4,
        riskVulnerabilities: [
          { riskType: 'powerOutage', vulnerabilityLevel: 10, impactSeverity: 9, reasoning: 'Essential for refrigeration and POS systems' },
          { riskType: 'hurricane', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Supply chain disruption and physical damage' },
          { riskType: 'flood', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Inventory damage and access issues' },
          { riskType: 'earthquake', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Shelving and inventory damage' },
          { riskType: 'drought', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Affects fresh produce supply and prices' },
          { riskType: 'landslide', vulnerabilityLevel: 3, impactSeverity: 4, reasoning: 'Access road blockage affects supply and customers' }
        ]
      },
      {
        businessTypeId: 'small_hotel',
        name: 'Small Hotel/Guesthouse',
        category: 'hospitality',
        subcategory: 'Accommodation',
        description: 'Small hotels, guesthouses, and bed & breakfast establishments',
        typicalRevenue: 'JMD 8M-40M annually',
        typicalEmployees: '10-30 employees',
        operatingHours: '24/7',
        seasonalityFactor: 1.8,
        touristDependency: 9,
        supplyChainComplexity: 5,
        digitalDependency: 6,
        cashFlowPattern: 'seasonal',
        physicalAssetIntensity: 8,
        customerConcentration: 6,
        regulatoryBurden: 7,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 9, impactSeverity: 10, reasoning: 'Tourist cancellations and property damage' },
          { riskType: 'powerOutage', vulnerabilityLevel: 8, impactSeverity: 9, reasoning: 'Guest comfort, security systems, and reservations' },
          { riskType: 'flood', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Property damage and guest safety concerns' },
          { riskType: 'earthquake', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Building safety and guest confidence' },
          { riskType: 'drought', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Water supply for guest services and amenities' },
          { riskType: 'landslide', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Access issues and guest safety' }
        ]
      },
      {
        businessTypeId: 'beauty_salon',
        name: 'Beauty Salon/Barbershop',
        category: 'services',
        subcategory: 'Personal Care',
        description: 'Hair salons, barbershops, and beauty treatment centers',
        typicalRevenue: 'JMD 2M-8M annually',
        typicalEmployees: '3-12 employees',
        operatingHours: '9:00 AM - 7:00 PM',
        seasonalityFactor: 1.2,
        touristDependency: 4,
        supplyChainComplexity: 4,
        digitalDependency: 3,
        cashFlowPattern: 'stable',
        physicalAssetIntensity: 4,
        customerConcentration: 5,
        regulatoryBurden: 3,
        riskVulnerabilities: [
          { riskType: 'powerOutage', vulnerabilityLevel: 8, impactSeverity: 7, reasoning: 'Equipment dependent on electricity' },
          { riskType: 'hurricane', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Appointment cancellations and equipment damage' },
          { riskType: 'flood', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Equipment and product damage' },
          { riskType: 'earthquake', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Equipment displacement and client safety' },
          { riskType: 'drought', vulnerabilityLevel: 7, impactSeverity: 6, reasoning: 'Water essential for hair washing and cleaning' },
          { riskType: 'landslide', vulnerabilityLevel: 2, impactSeverity: 3, reasoning: 'Limited impact unless location-specific' }
        ]
      },
      {
        businessTypeId: 'auto_repair',
        name: 'Auto Repair Shop',
        category: 'services',
        subcategory: 'Automotive',
        description: 'Vehicle repair and maintenance services',
        typicalRevenue: 'JMD 3M-15M annually',
        typicalEmployees: '4-15 employees',
        operatingHours: '8:00 AM - 6:00 PM',
        seasonalityFactor: 1.0,
        touristDependency: 2,
        supplyChainComplexity: 7,
        digitalDependency: 4,
        cashFlowPattern: 'stable',
        physicalAssetIntensity: 8,
        customerConcentration: 3,
        regulatoryBurden: 4,
        riskVulnerabilities: [
          { riskType: 'powerOutage', vulnerabilityLevel: 7, impactSeverity: 6, reasoning: 'Electric tools and diagnostic equipment' },
          { riskType: 'hurricane', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Parts supply disruption and equipment damage' },
          { riskType: 'flood', vulnerabilityLevel: 8, impactSeverity: 8, reasoning: 'Ground-level operations and expensive equipment' },
          { riskType: 'earthquake', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Heavy equipment and tool displacement' },
          { riskType: 'drought', vulnerabilityLevel: 3, impactSeverity: 3, reasoning: 'Minimal water dependency' },
          { riskType: 'landslide', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Parts delivery disruption' }
        ]
      },
      {
        businessTypeId: 'pharmacy',
        name: 'Pharmacy',
        category: 'health',
        subcategory: 'Healthcare',
        description: 'Community pharmacies and drugstores',
        typicalRevenue: 'JMD 8M-30M annually',
        typicalEmployees: '4-12 employees',
        operatingHours: '8:00 AM - 8:00 PM',
        seasonalityFactor: 1.0,
        touristDependency: 2,
        supplyChainComplexity: 9,
        digitalDependency: 7,
        cashFlowPattern: 'stable',
        physicalAssetIntensity: 5,
        customerConcentration: 2,
        regulatoryBurden: 9,
        riskVulnerabilities: [
          { riskType: 'powerOutage', vulnerabilityLevel: 9, impactSeverity: 9, reasoning: 'Refrigerated medications and POS systems' },
          { riskType: 'hurricane', vulnerabilityLevel: 8, impactSeverity: 9, reasoning: 'Critical community service and supply chain' },
          { riskType: 'flood', vulnerabilityLevel: 6, impactSeverity: 8, reasoning: 'Medication contamination and access issues' },
          { riskType: 'earthquake', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Medication storage and dispensing disruption' },
          { riskType: 'drought', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Limited direct impact on operations' },
          { riskType: 'landslide', vulnerabilityLevel: 3, impactSeverity: 4, reasoning: 'Supply delivery and customer access issues' }
        ]
      }
    ]

    // Create business types and their risk vulnerabilities
    for (const btData of businessTypes) {
      console.log(`Creating ${btData.name}...`)
      
      // Create business type
      const businessType = await prisma.businessType.create({
        data: {
          businessTypeId: btData.businessTypeId,
          name: btData.name,
          category: btData.category,
          subcategory: btData.subcategory,
          description: btData.description,
          typicalRevenue: btData.typicalRevenue,
          typicalEmployees: btData.typicalEmployees,
          operatingHours: btData.operatingHours,
          seasonalityFactor: btData.seasonalityFactor,
          touristDependency: btData.touristDependency,
          supplyChainComplexity: btData.supplyChainComplexity,
          digitalDependency: btData.digitalDependency,
          cashFlowPattern: btData.cashFlowPattern,
          physicalAssetIntensity: btData.physicalAssetIntensity,
          customerConcentration: btData.customerConcentration,
          regulatoryBurden: btData.regulatoryBurden
        }
      })

      // Create risk vulnerabilities
      for (const vulnerability of btData.riskVulnerabilities) {
        await prisma.businessRiskVulnerability.create({
          data: {
            businessTypeId: businessType.id,
            riskType: vulnerability.riskType,
            vulnerabilityLevel: vulnerability.vulnerabilityLevel,
            impactSeverity: vulnerability.impactSeverity,
            reasoning: vulnerability.reasoning
          }
        })
      }

      console.log(`✅ Created ${btData.name} with ${btData.riskVulnerabilities.length} risk vulnerabilities`)
    }

    console.log('🎉 Successfully populated all Jamaica business types!')
    console.log('\n📊 Business Type Summary:')
    console.log(`- Total Business Types: ${businessTypes.length}`)
    console.log(`- Hospitality: ${businessTypes.filter(bt => bt.category === 'hospitality').length}`)
    console.log(`- Retail: ${businessTypes.filter(bt => bt.category === 'retail').length}`)
    console.log(`- Services: ${businessTypes.filter(bt => bt.category === 'services').length}`)
    console.log(`- Health: ${businessTypes.filter(bt => bt.category === 'health').length}`)

    // Risk statistics
    const avgTouristDependency = Math.round(businessTypes.reduce((sum, bt) => sum + bt.touristDependency, 0) / businessTypes.length * 10) / 10
    const avgSupplyChainComplexity = Math.round(businessTypes.reduce((sum, bt) => sum + bt.supplyChainComplexity, 0) / businessTypes.length * 10) / 10
    const avgDigitalDependency = Math.round(businessTypes.reduce((sum, bt) => sum + bt.digitalDependency, 0) / businessTypes.length * 10) / 10
    
    console.log(`\n📈 Average Dependencies:`)
    console.log(`- Tourist Dependency: ${avgTouristDependency}/10`)
    console.log(`- Supply Chain Complexity: ${avgSupplyChainComplexity}/10`)
    console.log(`- Digital Dependency: ${avgDigitalDependency}/10`)

  } catch (error) {
    console.error('❌ Error populating business types:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateBusinessTypes()
