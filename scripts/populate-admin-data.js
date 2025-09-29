const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function populateAdminData() {
  console.log('🌱 Populating database with admin data...')

  try {
    // Clear existing data
    await prisma.adminRiskProfile.deleteMany()
    await prisma.adminHazardActionPlan.deleteMany()
    await prisma.adminHazardStrategy.deleteMany()
    await prisma.adminBusinessTypeHazard.deleteMany()
    await prisma.adminLocationHazard.deleteMany()
    await prisma.adminActionPlan.deleteMany()
    await prisma.adminStrategy.deleteMany()
    await prisma.adminHazardType.deleteMany()
    await prisma.adminLocation.deleteMany()
    await prisma.adminBusinessType.deleteMany()

    console.log('✅ Cleared existing data')

    // Create Business Types
    const businessTypes = [
      {
        businessTypeId: 'restaurant',
        name: 'Restaurant',
        localName: 'Local Restaurant',
        category: 'hospitality',
        description: 'Full-service restaurant with dining area and kitchen',
        typicalOperatingHours: '6:00 AM - 11:00 PM',
        minimumStaff: '8',
        minimumEquipment: '["refrigerator", "stove", "dishwasher", "pos_system"]',
        minimumUtilities: '["electricity", "water", "gas", "internet"]',
        minimumSpace: '1500 sq ft',
        essentialFunctions: '{"core": ["food_preparation", "customer_service"], "support": ["cleaning", "inventory"], "administrative": ["accounting", "marketing"]}',
        criticalSuppliers: '["food_suppliers", "beverage_suppliers", "cleaning_supplies"]',
        exampleBusinessPurposes: '["Provide quality dining experience with authentic Caribbean cuisine and hospitality services", "Offer fresh, locally-sourced meals and beverages in a welcoming atmosphere", "Deliver exceptional food service with cultural authenticity and customer satisfaction"]',
        exampleProducts: '["Restaurant dining services", "Takeaway and delivery meals", "Catering services", "Beverage service", "Special event hosting"]',
        exampleKeyPersonnel: '["Restaurant Manager", "Head Chef", "Kitchen Staff", "Servers and Waitstaff", "Host/Hostess", "Cashier"]',
        exampleCustomerBase: '["Local residents and families", "Tourists visiting Jamaica", "Business professionals", "Special event customers", "Regular dining patrons"]',
        dependencies: '{"powerCritical": 5, "waterIntensive": 4, "touristDependent": 3, "supplyChainReliant": 4, "perishableGoods": 5, "outdoorOperations": 1, "coastalExposure": 2}'
      },
      {
        businessTypeId: 'grocery_store',
        name: 'Grocery Store',
        localName: 'Local Grocery/Mini-Mart',
        category: 'retail',
        description: 'Small to medium grocery store with fresh produce and household items',
        typicalOperatingHours: '7:00 AM - 10:00 PM',
        minimumStaff: '6',
        minimumEquipment: '["refrigerators", "freezers", "pos_system", "security_system"]',
        minimumUtilities: '["electricity", "water", "internet"]',
        minimumSpace: '2000 sq ft',
        essentialFunctions: '{"core": ["sales", "inventory_management"], "support": ["cleaning", "stocking"], "administrative": ["accounting", "ordering"]}',
        criticalSuppliers: '["food_distributors", "beverage_distributors", "household_supplies"]',
        exampleBusinessPurposes: '["Provide fresh groceries and household essentials to the local community", "Offer convenient shopping for daily necessities and local products", "Serve as a neighborhood market with quality goods and friendly service"]',
        exampleProducts: '["Fresh produce and groceries", "Household and personal care items", "Local and imported food products", "Beverages and snacks", "Basic pharmacy items"]',
        exampleKeyPersonnel: '["Store Manager", "Cashiers", "Stock Personnel", "Produce Manager", "Security Guard", "Customer Service Representative"]',
        exampleCustomerBase: '["Local residents and families", "Small businesses requiring supplies", "Elderly customers", "Students and young professionals", "Tourists needing daily essentials"]',
        dependencies: '{"powerCritical": 5, "waterIntensive": 2, "touristDependent": 2, "supplyChainReliant": 5, "perishableGoods": 5, "outdoorOperations": 1, "coastalExposure": 1}'
      },
      {
        businessTypeId: 'hotel',
        name: 'Hotel',
        localName: 'Local Hotel/Resort',
        category: 'hospitality',
        description: 'Tourist accommodation with rooms and amenities',
        typicalOperatingHours: '24/7',
        minimumStaff: '15',
        minimumEquipment: '["ac_systems", "security_system", "pos_system", "laundry_equipment"]',
        minimumUtilities: '["electricity", "water", "internet", "sewage"]',
        minimumSpace: '5000 sq ft',
        essentialFunctions: '{"core": ["guest_services", "housekeeping"], "support": ["maintenance", "security"], "administrative": ["front_desk", "accounting"]}',
        criticalSuppliers: '["linen_suppliers", "cleaning_supplies", "food_beverage"]',
        exampleBusinessPurposes: '["Provide comfortable accommodation and hospitality services to tourists and business travelers", "Offer luxury resort experience with Caribbean charm and modern amenities", "Deliver exceptional guest service with cultural authenticity and relaxation"]',
        exampleProducts: '["Hotel room accommodation", "Restaurant and bar services", "Conference and event facilities", "Recreation and entertainment", "Concierge and tour services"]',
        exampleKeyPersonnel: '["Hotel Manager", "Front Desk Staff", "Housekeeping Manager", "Restaurant Manager", "Maintenance Staff", "Security Personnel"]',
        exampleCustomerBase: '["International tourists", "Business travelers", "Local guests for events", "Conference and meeting attendees", "Honeymooners and couples"]',
        dependencies: '{"powerCritical": 5, "waterIntensive": 4, "touristDependent": 5, "supplyChainReliant": 3, "perishableGoods": 2, "outdoorOperations": 2, "coastalExposure": 3}'
      },
      {
        businessTypeId: 'construction_company',
        name: 'Construction Company',
        localName: 'Local Construction',
        category: 'services',
        description: 'Building and construction services',
        typicalOperatingHours: '7:00 AM - 5:00 PM',
        minimumStaff: '12',
        minimumEquipment: '["heavy_machinery", "tools", "vehicles"]',
        minimumUtilities: '["electricity", "water"]',
        minimumSpace: '3000 sq ft',
        essentialFunctions: '{"core": ["construction", "project_management"], "support": ["equipment_maintenance", "safety"], "administrative": ["estimating", "accounting"]}',
        criticalSuppliers: '["material_suppliers", "equipment_rental", "subcontractors"]',
        dependencies: '{"powerCritical": 3, "waterIntensive": 2, "touristDependent": 1, "supplyChainReliant": 4, "perishableGoods": 1, "outdoorOperations": 5, "coastalExposure": 2}'
      }
    ]

    for (const bt of businessTypes) {
      await prisma.adminBusinessType.create({ data: bt })
    }
    console.log('✅ Created business types')

    // Create Hazard Types
    const hazardTypes = [
      {
        hazardId: 'hurricane',
        name: 'Hurricane/Tropical Storm',
        category: 'natural',
        description: 'Tropical cyclones with high winds and heavy rainfall',
        defaultFrequency: 'likely',
        defaultImpact: 'major',
        seasonalPattern: 'june-november',
        peakMonths: '["8", "9", "10"]',
        warningTime: 'days',
        geographicScope: 'regional',
        cascadingRisks: '["flood", "power_outage", "supply_disruption"]'
      },
      {
        hazardId: 'flood',
        name: 'Flooding',
        category: 'natural',
        description: 'Water overflow from heavy rainfall or storm surge',
        defaultFrequency: 'possible',
        defaultImpact: 'moderate',
        seasonalPattern: 'june-november',
        peakMonths: '["9", "10"]',
        warningTime: 'hours',
        geographicScope: 'localized',
        cascadingRisks: '["power_outage", "water_contamination", "road_closures"]'
      },
      {
        hazardId: 'power_outage',
        name: 'Power Outage',
        category: 'technological',
        description: 'Electrical grid failure or disruption',
        defaultFrequency: 'likely',
        defaultImpact: 'moderate',
        seasonalPattern: 'year-round',
        peakMonths: '["8", "9", "10"]',
        warningTime: 'minutes',
        geographicScope: 'localized',
        cascadingRisks: '["communication_failure", "refrigeration_loss", "security_system_failure"]'
      },
      {
        hazardId: 'earthquake',
        name: 'Earthquake',
        category: 'natural',
        description: 'Seismic activity causing structural damage',
        defaultFrequency: 'rare',
        defaultImpact: 'catastrophic',
        seasonalPattern: 'year-round',
        peakMonths: '[]',
        warningTime: 'none',
        geographicScope: 'regional',
        cascadingRisks: '["structural_damage", "fire", "communication_failure"]'
      },
      {
        hazardId: 'fire',
        name: 'Fire',
        category: 'human',
        description: 'Uncontrolled fire causing property damage',
        defaultFrequency: 'unlikely',
        defaultImpact: 'major',
        seasonalPattern: 'year-round',
        peakMonths: '[]',
        warningTime: 'minutes',
        geographicScope: 'localized',
        cascadingRisks: '["smoke_damage", "structural_damage", "business_interruption"]'
      },
      {
        hazardId: 'supply_disruption',
        name: 'Supply Chain Disruption',
        category: 'economic',
        description: 'Interruption in delivery of goods and services',
        defaultFrequency: 'possible',
        defaultImpact: 'moderate',
        seasonalPattern: 'year-round',
        peakMonths: '[]',
        warningTime: 'days',
        geographicScope: 'regional',
        cascadingRisks: '["inventory_shortage", "price_increases", "customer_dissatisfaction"]'
      }
    ]

    for (const ht of hazardTypes) {
      await prisma.adminHazardType.create({ data: ht })
    }
    console.log('✅ Created hazard types')

    // Create Locations
    const locations = [
      {
        country: 'Jamaica',
        countryCode: 'JM',
        parish: 'Kingston',
        isCoastal: true,
        isUrban: true
      },
      {
        country: 'Jamaica',
        countryCode: 'JM',
        parish: 'Montego Bay',
        isCoastal: true,
        isUrban: true
      },
      {
        country: 'Jamaica',
        countryCode: 'JM',
        parish: 'Ocho Rios',
        isCoastal: true,
        isUrban: false
      },
      {
        country: 'Jamaica',
        countryCode: 'JM',
        parish: 'Negril',
        isCoastal: true,
        isUrban: false
      },
      {
        country: 'Barbados',
        countryCode: 'BB',
        parish: 'Bridgetown',
        isCoastal: true,
        isUrban: true
      },
      {
        country: 'Trinidad and Tobago',
        countryCode: 'TT',
        parish: 'Port of Spain',
        isCoastal: true,
        isUrban: true
      }
    ]

    for (const loc of locations) {
      await prisma.adminLocation.create({ data: loc })
    }
    console.log('✅ Created locations')

    // Create Business Type Hazard Mappings
    const businessTypeHazards = [
      // Restaurant mappings
      { businessTypeId: 'restaurant', hazardId: 'hurricane', riskLevel: 'high', frequency: 'likely', impact: 'major' },
      { businessTypeId: 'restaurant', hazardId: 'flood', riskLevel: 'medium', frequency: 'possible', impact: 'moderate' },
      { businessTypeId: 'restaurant', hazardId: 'power_outage', riskLevel: 'high', frequency: 'likely', impact: 'major' },
      { businessTypeId: 'restaurant', hazardId: 'supply_disruption', riskLevel: 'high', frequency: 'possible', impact: 'major' },
      
      // Grocery Store mappings
      { businessTypeId: 'grocery_store', hazardId: 'hurricane', riskLevel: 'high', frequency: 'likely', impact: 'major' },
      { businessTypeId: 'grocery_store', hazardId: 'power_outage', riskLevel: 'very_high', frequency: 'likely', impact: 'catastrophic' },
      { businessTypeId: 'grocery_store', hazardId: 'supply_disruption', riskLevel: 'high', frequency: 'possible', impact: 'major' },
      
      // Hotel mappings
      { businessTypeId: 'hotel', hazardId: 'hurricane', riskLevel: 'very_high', frequency: 'likely', impact: 'catastrophic' },
      { businessTypeId: 'hotel', hazardId: 'flood', riskLevel: 'high', frequency: 'possible', impact: 'major' },
      { businessTypeId: 'hotel', hazardId: 'power_outage', riskLevel: 'high', frequency: 'likely', impact: 'major' },
      { businessTypeId: 'hotel', hazardId: 'supply_disruption', riskLevel: 'medium', frequency: 'possible', impact: 'moderate' },
      
      // Construction Company mappings
      { businessTypeId: 'construction_company', hazardId: 'hurricane', riskLevel: 'medium', frequency: 'likely', impact: 'moderate' },
      { businessTypeId: 'construction_company', hazardId: 'flood', riskLevel: 'medium', frequency: 'possible', impact: 'moderate' },
      { businessTypeId: 'construction_company', hazardId: 'power_outage', riskLevel: 'low', frequency: 'likely', impact: 'minor' }
    ]

    for (const bth of businessTypeHazards) {
      await prisma.adminBusinessTypeHazard.create({ data: bth })
    }
    console.log('✅ Created business type hazard mappings')

    // Create Location Hazard Mappings
    const locationHazards = [
      // Kingston (coastal, urban)
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Kingston' } })).id, hazardId: 'hurricane', riskLevel: 'high' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Kingston' } })).id, hazardId: 'flood', riskLevel: 'medium' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Kingston' } })).id, hazardId: 'power_outage', riskLevel: 'high' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Kingston' } })).id, hazardId: 'earthquake', riskLevel: 'low' },
      
      // Montego Bay (coastal, urban)
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Montego Bay' } })).id, hazardId: 'hurricane', riskLevel: 'very_high' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Montego Bay' } })).id, hazardId: 'flood', riskLevel: 'high' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Montego Bay' } })).id, hazardId: 'power_outage', riskLevel: 'medium' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Montego Bay' } })).id, hazardId: 'earthquake', riskLevel: 'low' },
      
      // Ocho Rios (coastal, rural)
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Ocho Rios' } })).id, hazardId: 'hurricane', riskLevel: 'high' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Ocho Rios' } })).id, hazardId: 'flood', riskLevel: 'medium' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Ocho Rios' } })).id, hazardId: 'power_outage', riskLevel: 'medium' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Ocho Rios' } })).id, hazardId: 'earthquake', riskLevel: 'low' },
      
      // Negril (coastal, rural)
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Negril' } })).id, hazardId: 'hurricane', riskLevel: 'high' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Negril' } })).id, hazardId: 'flood', riskLevel: 'low' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Negril' } })).id, hazardId: 'power_outage', riskLevel: 'medium' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Negril' } })).id, hazardId: 'earthquake', riskLevel: 'low' },
      
      // Bridgetown, Barbados (coastal, urban)
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Bridgetown' } })).id, hazardId: 'hurricane', riskLevel: 'medium' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Bridgetown' } })).id, hazardId: 'flood', riskLevel: 'medium' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Bridgetown' } })).id, hazardId: 'power_outage', riskLevel: 'medium' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Bridgetown' } })).id, hazardId: 'earthquake', riskLevel: 'low' },
      
      // Port of Spain, Trinidad and Tobago (coastal, urban)
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Port of Spain' } })).id, hazardId: 'hurricane', riskLevel: 'low' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Port of Spain' } })).id, hazardId: 'flood', riskLevel: 'medium' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Port of Spain' } })).id, hazardId: 'power_outage', riskLevel: 'medium' },
      { locationId: (await prisma.adminLocation.findFirst({ where: { parish: 'Port of Spain' } })).id, hazardId: 'earthquake', riskLevel: 'medium' }
    ]

    for (const lh of locationHazards) {
      await prisma.adminLocationHazard.create({ data: lh })
    }
    console.log('✅ Created location hazard mappings')

    // Create Strategies
    const strategies = [
      {
        strategyId: 'backup_generator',
        title: 'Backup Generator Installation',
        description: 'Install and maintain backup power generation system',
        category: 'prevention',
        reasoning: 'Provides power during outages to maintain critical operations',
        icon: '⚡'
      },
      {
        strategyId: 'elevated_storage',
        title: 'Elevated Storage Systems',
        description: 'Store critical equipment and supplies above flood level',
        category: 'prevention',
        reasoning: 'Protects assets from flood damage',
        icon: '📦'
      },
      {
        strategyId: 'supplier_diversification',
        title: 'Supplier Diversification',
        description: 'Establish multiple suppliers for critical materials',
        category: 'prevention',
        reasoning: 'Reduces dependency on single supplier',
        icon: '🔄'
      },
      {
        strategyId: 'emergency_evacuation',
        title: 'Emergency Evacuation Plan',
        description: 'Develop and practice evacuation procedures',
        category: 'response',
        reasoning: 'Ensures staff safety during emergencies',
        icon: '🚨'
      },
      {
        strategyId: 'insurance_coverage',
        title: 'Comprehensive Insurance Coverage',
        description: 'Obtain insurance for property, business interruption, and liability',
        category: 'recovery',
        reasoning: 'Provides financial protection against losses',
        icon: '🛡️'
      },
      {
        strategyId: 'staff_training',
        title: 'Emergency Response Training',
        description: 'Train staff on emergency procedures and first aid',
        category: 'prevention',
        reasoning: 'Improves response capability and reduces injuries',
        icon: '👥'
      }
    ]

    for (const strategy of strategies) {
      await prisma.adminStrategy.create({ data: strategy })
    }
    console.log('✅ Created strategies')

    // Create Hazard Strategy Mappings
    const hazardStrategies = [
      { hazardId: 'hurricane', strategyId: 'backup_generator', priority: 'high', isRecommended: true },
      { hazardId: 'hurricane', strategyId: 'elevated_storage', priority: 'high', isRecommended: true },
      { hazardId: 'hurricane', strategyId: 'emergency_evacuation', priority: 'high', isRecommended: true },
      { hazardId: 'flood', strategyId: 'elevated_storage', priority: 'high', isRecommended: true },
      { hazardId: 'power_outage', strategyId: 'backup_generator', priority: 'very_high', isRecommended: true },
      { hazardId: 'supply_disruption', strategyId: 'supplier_diversification', priority: 'high', isRecommended: true },
      { hazardId: 'fire', strategyId: 'emergency_evacuation', priority: 'high', isRecommended: true },
      { hazardId: 'fire', strategyId: 'staff_training', priority: 'medium', isRecommended: true }
    ]

    for (const hs of hazardStrategies) {
      await prisma.adminHazardStrategy.create({ data: hs })
    }
    console.log('✅ Created hazard strategy mappings')

    // Create Action Plans
    const actionPlans = [
      {
        hazardId: 'hurricane',
        resourcesNeeded: '["generator", "fuel", "emergency_supplies", "communication_equipment"]',
        immediateActions: '["secure_equipment", "evacuate_if_necessary", "activate_backup_systems"]',
        shortTermActions: '["assess_damage", "contact_insurance", "notify_staff"]',
        mediumTermActions: '["repair_damage", "restore_operations", "update_plans"]',
        longTermReduction: '["improve_building_structure", "enhance_backup_systems", "update_insurance"]'
      },
      {
        hazardId: 'power_outage',
        resourcesNeeded: '["generator", "batteries", "flashlights", "coolers"]',
        immediateActions: '["activate_backup_power", "secure_perishables", "notify_staff"]',
        shortTermActions: '["monitor_power_status", "implement_manual_procedures", "contact_utility"]',
        mediumTermActions: '["restore_normal_operations", "update_emergency_plans"]',
        longTermReduction: '["install_redundant_power", "upgrade_electrical_systems"]'
      }
    ]

    for (const ap of actionPlans) {
      await prisma.adminActionPlan.create({ data: ap })
    }
    console.log('✅ Created action plans')

    console.log('🎉 Database populated successfully!')
    console.log('\n📊 Summary:')
    console.log(`- ${businessTypes.length} Business Types`)
    console.log(`- ${hazardTypes.length} Hazard Types`)
    console.log(`- ${locations.length} Locations`)
         console.log(`- ${businessTypeHazards.length} Business-Hazard Mappings`)
     console.log(`- ${locationHazards.length} Location-Hazard Mappings (${locationHazards.length / locations.length} per location)`)
    console.log(`- ${strategies.length} Strategies`)
    console.log(`- ${hazardStrategies.length} Hazard-Strategy Mappings`)
    console.log(`- ${actionPlans.length} Action Plans`)

  } catch (error) {
    console.error('❌ Error populating database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateAdminData() 