const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function populateAllCaribbeanBusinessTypes() {
  console.log('🏝️ Populating Comprehensive Caribbean Business Types...')

  try {
    // Clear existing data
    await prisma.businessRiskVulnerability.deleteMany()
    await prisma.businessTypeStrategy.deleteMany()
    await prisma.businessType.deleteMany()
    console.log('✅ Cleared existing business type data')

    const businessTypes = [
      // FOOD & BEVERAGE
      {
        businessTypeId: 'restaurant',
        name: 'Restaurant',
        category: 'hospitality',
        subcategory: 'Food Service',
        description: 'Local restaurants serving Caribbean and international cuisine',
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
        businessTypeId: 'food_processing',
        name: 'Food Processing Facility',
        category: 'manufacturing',
        subcategory: 'Food Production',
        description: 'Facilities processing local agricultural products into packaged goods',
        typicalRevenue: 'JMD 15M-80M annually',
        typicalEmployees: '15-50 employees',
        operatingHours: '6:00 AM - 6:00 PM',
        seasonalityFactor: 1.2,
        touristDependency: 2,
        supplyChainComplexity: 8,
        digitalDependency: 6,
        cashFlowPattern: 'stable',
        physicalAssetIntensity: 9,
        customerConcentration: 5,
        regulatoryBurden: 8,
        riskVulnerabilities: [
          { riskType: 'powerOutage', vulnerabilityLevel: 10, impactSeverity: 10, reasoning: 'Processing equipment and refrigeration absolutely critical' },
          { riskType: 'hurricane', vulnerabilityLevel: 8, impactSeverity: 9, reasoning: 'Supply disruption and equipment damage' },
          { riskType: 'flood', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Contamination risk and equipment damage' },
          { riskType: 'earthquake', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Equipment displacement and safety concerns' },
          { riskType: 'drought', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Water critical for processing and cleaning' },
          { riskType: 'landslide', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Supply and distribution disruption' }
        ]
      },
      {
        businessTypeId: 'beachfront_restaurant',
        name: 'Beachfront Restaurant',
        category: 'hospitality',
        subcategory: 'Food Service',
        description: 'Restaurant located directly on the beach with outdoor seating',
        typicalRevenue: 'JMD 8M-40M annually',
        typicalEmployees: '10-30 employees',
        operatingHours: '10:00 AM - 12:00 AM',
        seasonalityFactor: 1.8,
        touristDependency: 9,
        supplyChainComplexity: 6,
        digitalDependency: 5,
        cashFlowPattern: 'seasonal',
        physicalAssetIntensity: 7,
        customerConcentration: 6,
        regulatoryBurden: 6,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 10, impactSeverity: 10, reasoning: 'Extreme coastal exposure and outdoor operations' },
          { riskType: 'powerOutage', vulnerabilityLevel: 8, impactSeverity: 8, reasoning: 'Refrigeration and cooking equipment' },
          { riskType: 'flood', vulnerabilityLevel: 9, impactSeverity: 9, reasoning: 'Coastal flooding and storm surge vulnerability' },
          { riskType: 'earthquake', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Structural concerns and outdoor seating' },
          { riskType: 'drought', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Water needed for operations' },
          { riskType: 'landslide', vulnerabilityLevel: 3, impactSeverity: 4, reasoning: 'Coastal roads may be affected' }
        ]
      },

      // HOSPITALITY & TOURISM
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
        businessTypeId: 'tour_operator',
        name: 'Tour Operator',
        category: 'hospitality',
        subcategory: 'Tourism Services',
        description: 'Companies offering guided tours and tourism experiences',
        typicalRevenue: 'JMD 5M-30M annually',
        typicalEmployees: '5-20 employees',
        operatingHours: '8:00 AM - 6:00 PM',
        seasonalityFactor: 2.0,
        touristDependency: 10,
        supplyChainComplexity: 4,
        digitalDependency: 7,
        cashFlowPattern: 'seasonal',
        physicalAssetIntensity: 5,
        customerConcentration: 7,
        regulatoryBurden: 6,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 10, impactSeverity: 10, reasoning: 'Complete tourism shutdown during hurricane season' },
          { riskType: 'powerOutage', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Affects booking systems and communication' },
          { riskType: 'flood', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Road access and outdoor activities affected' },
          { riskType: 'earthquake', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Tourist confidence and activity locations' },
          { riskType: 'drought', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Some nature-based tours affected' },
          { riskType: 'landslide', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Road access to tourist sites blocked' }
        ]
      },
      {
        businessTypeId: 'eco_tourism_lodge',
        name: 'Eco-Tourism Lodge',
        category: 'hospitality',
        subcategory: 'Eco-Tourism',
        description: 'Sustainable tourism accommodation in natural settings',
        typicalRevenue: 'JMD 6M-25M annually',
        typicalEmployees: '8-20 employees',
        operatingHours: '24/7',
        seasonalityFactor: 1.6,
        touristDependency: 9,
        supplyChainComplexity: 4,
        digitalDependency: 5,
        cashFlowPattern: 'seasonal',
        physicalAssetIntensity: 6,
        customerConcentration: 7,
        regulatoryBurden: 5,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 8, impactSeverity: 9, reasoning: 'Exposed natural locations and cancellations' },
          { riskType: 'powerOutage', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Limited infrastructure and guest comfort' },
          { riskType: 'flood', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Natural locations prone to flooding' },
          { riskType: 'earthquake', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Remote locations and evacuation challenges' },
          { riskType: 'drought', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Water supply in remote locations' },
          { riskType: 'landslide', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Mountainous locations and access roads' }
        ]
      },

      // SERVICES
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
        businessTypeId: 'accounting_office',
        name: 'Accounting Office',
        category: 'services',
        subcategory: 'Professional Services',
        description: 'Accounting, bookkeeping, and financial advisory services',
        typicalRevenue: 'JMD 4M-20M annually',
        typicalEmployees: '3-15 employees',
        operatingHours: '9:00 AM - 5:00 PM',
        seasonalityFactor: 1.3,
        touristDependency: 1,
        supplyChainComplexity: 2,
        digitalDependency: 9,
        cashFlowPattern: 'seasonal',
        physicalAssetIntensity: 3,
        customerConcentration: 4,
        regulatoryBurden: 8,
        riskVulnerabilities: [
          { riskType: 'powerOutage', vulnerabilityLevel: 8, impactSeverity: 8, reasoning: 'Computer systems and data access critical' },
          { riskType: 'hurricane', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Office closure and client delays' },
          { riskType: 'flood', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Document and equipment damage' },
          { riskType: 'earthquake', vulnerabilityLevel: 3, impactSeverity: 4, reasoning: 'Office equipment and safety' },
          { riskType: 'drought', vulnerabilityLevel: 2, impactSeverity: 2, reasoning: 'Minimal impact on operations' },
          { riskType: 'landslide', vulnerabilityLevel: 2, impactSeverity: 3, reasoning: 'Client access may be affected' }
        ]
      },
      {
        businessTypeId: 'taxi_service',
        name: 'Taxi Service',
        category: 'transportation',
        subcategory: 'Passenger Transport',
        description: 'Private taxi and transportation services',
        typicalRevenue: 'JMD 2M-10M annually',
        typicalEmployees: '2-8 employees',
        operatingHours: '24/7',
        seasonalityFactor: 1.4,
        touristDependency: 6,
        supplyChainComplexity: 3,
        digitalDependency: 6,
        cashFlowPattern: 'seasonal',
        physicalAssetIntensity: 9,
        customerConcentration: 2,
        regulatoryBurden: 5,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 9, impactSeverity: 9, reasoning: 'Road closures and tourist absence' },
          { riskType: 'powerOutage', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Affects booking systems and payment' },
          { riskType: 'flood', vulnerabilityLevel: 8, impactSeverity: 9, reasoning: 'Road impassability and vehicle damage' },
          { riskType: 'earthquake', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Road damage and vehicle safety' },
          { riskType: 'drought', vulnerabilityLevel: 2, impactSeverity: 2, reasoning: 'Minimal direct impact' },
          { riskType: 'landslide', vulnerabilityLevel: 8, impactSeverity: 9, reasoning: 'Road blockages prevent operations' }
        ]
      },

      // HEALTH & PHARMACY
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
      },
      {
        businessTypeId: 'daycare_center',
        name: 'Daycare Center',
        category: 'education',
        subcategory: 'Childcare',
        description: 'Childcare and early education facilities',
        typicalRevenue: 'JMD 3M-12M annually',
        typicalEmployees: '5-15 employees',
        operatingHours: '7:00 AM - 6:00 PM',
        seasonalityFactor: 1.1,
        touristDependency: 1,
        supplyChainComplexity: 3,
        digitalDependency: 3,
        cashFlowPattern: 'stable',
        physicalAssetIntensity: 5,
        customerConcentration: 6,
        regulatoryBurden: 8,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 8, impactSeverity: 9, reasoning: 'Child safety paramount, parents stay home' },
          { riskType: 'powerOutage', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Climate control and security systems' },
          { riskType: 'flood', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Immediate evacuation and safety concerns' },
          { riskType: 'earthquake', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Building safety and child protection' },
          { riskType: 'drought', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Water needed for sanitation and cooking' },
          { riskType: 'landslide', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Parent access and evacuation routes' }
        ]
      },

      // RETAIL
      {
        businessTypeId: 'hardware_store',
        name: 'Hardware Store',
        category: 'retail',
        subcategory: 'Building Supplies',
        description: 'Building materials and hardware retail',
        typicalRevenue: 'JMD 8M-35M annually',
        typicalEmployees: '6-18 employees',
        operatingHours: '7:00 AM - 6:00 PM',
        seasonalityFactor: 1.2,
        touristDependency: 2,
        supplyChainComplexity: 7,
        digitalDependency: 4,
        cashFlowPattern: 'stable',
        physicalAssetIntensity: 8,
        customerConcentration: 3,
        regulatoryBurden: 4,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 7, impactSeverity: 7, reasoning: 'High demand pre-hurricane, closure during storm' },
          { riskType: 'powerOutage', vulnerabilityLevel: 5, impactSeverity: 5, reasoning: 'POS systems affected, some operations manual' },
          { riskType: 'flood', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Heavy inventory damage from water' },
          { riskType: 'earthquake', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Shelving collapse and inventory damage' },
          { riskType: 'drought', vulnerabilityLevel: 3, impactSeverity: 3, reasoning: 'Minimal operational impact' },
          { riskType: 'landslide', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Supply delivery and customer access' }
        ]
      },
      {
        businessTypeId: 'craft_workshop',
        name: 'Craft Workshop',
        category: 'retail',
        subcategory: 'Artisan Goods',
        description: 'Local craft production and sales',
        typicalRevenue: 'JMD 1M-6M annually',
        typicalEmployees: '2-8 employees',
        operatingHours: '9:00 AM - 5:00 PM',
        seasonalityFactor: 1.6,
        touristDependency: 7,
        supplyChainComplexity: 4,
        digitalDependency: 4,
        cashFlowPattern: 'seasonal',
        physicalAssetIntensity: 5,
        customerConcentration: 6,
        regulatoryBurden: 3,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 8, impactSeverity: 8, reasoning: 'Tourist absence and inventory damage' },
          { riskType: 'powerOutage', vulnerabilityLevel: 5, impactSeverity: 5, reasoning: 'Some tools require electricity' },
          { riskType: 'flood', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Materials and finished goods damage' },
          { riskType: 'earthquake', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Equipment and inventory displacement' },
          { riskType: 'drought', vulnerabilityLevel: 3, impactSeverity: 3, reasoning: 'Some processes need water' },
          { riskType: 'landslide', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Access to tourist markets affected' }
        ]
      },
      {
        businessTypeId: 'local_market_vendor',
        name: 'Local Market Vendor',
        category: 'retail',
        subcategory: 'Street Vending',
        description: 'Small-scale vendor selling goods at local markets or street locations',
        typicalRevenue: 'JMD 500K-3M annually',
        typicalEmployees: '1-4 employees',
        operatingHours: '6:00 AM - 6:00 PM',
        seasonalityFactor: 1.3,
        touristDependency: 3,
        supplyChainComplexity: 5,
        digitalDependency: 1,
        cashFlowPattern: 'stable',
        physicalAssetIntensity: 2,
        customerConcentration: 1,
        regulatoryBurden: 2,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 9, impactSeverity: 9, reasoning: 'Outdoor operations completely shut down' },
          { riskType: 'powerOutage', vulnerabilityLevel: 2, impactSeverity: 3, reasoning: 'Minimal power dependency' },
          { riskType: 'flood', vulnerabilityLevel: 8, impactSeverity: 8, reasoning: 'Inventory damage and location inaccessibility' },
          { riskType: 'earthquake', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Market structure and customer safety' },
          { riskType: 'drought', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Fresh produce supply and prices affected' },
          { riskType: 'landslide', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Market access and supply routes blocked' }
        ]
      },

      // AGRICULTURE & FISHING
      {
        businessTypeId: 'small_farm',
        name: 'Small Farm',
        category: 'agriculture',
        subcategory: 'Crop Production',
        description: 'Small-scale agricultural operations',
        typicalRevenue: 'JMD 2M-10M annually',
        typicalEmployees: '3-10 employees',
        operatingHours: '6:00 AM - 6:00 PM',
        seasonalityFactor: 1.4,
        touristDependency: 1,
        supplyChainComplexity: 5,
        digitalDependency: 2,
        cashFlowPattern: 'seasonal',
        physicalAssetIntensity: 7,
        customerConcentration: 4,
        regulatoryBurden: 4,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 10, impactSeverity: 10, reasoning: 'Crop destruction and equipment damage' },
          { riskType: 'powerOutage', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Irrigation systems may be affected' },
          { riskType: 'flood', vulnerabilityLevel: 9, impactSeverity: 9, reasoning: 'Crop drowning and soil erosion' },
          { riskType: 'earthquake', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Limited direct impact on crops' },
          { riskType: 'drought', vulnerabilityLevel: 10, impactSeverity: 10, reasoning: 'Crop failure and livestock water shortage' },
          { riskType: 'landslide', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Land loss and access road damage' }
        ]
      },
      {
        businessTypeId: 'fishing_operation',
        name: 'Fishing Operation',
        category: 'agriculture',
        subcategory: 'Fishing',
        description: 'Commercial fishing and seafood operations',
        typicalRevenue: 'JMD 3M-15M annually',
        typicalEmployees: '4-12 employees',
        operatingHours: '4:00 AM - 6:00 PM',
        seasonalityFactor: 1.5,
        touristDependency: 2,
        supplyChainComplexity: 6,
        digitalDependency: 2,
        cashFlowPattern: 'seasonal',
        physicalAssetIntensity: 8,
        customerConcentration: 5,
        regulatoryBurden: 6,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 10, impactSeverity: 10, reasoning: 'Boat damage and complete fishing shutdown' },
          { riskType: 'powerOutage', vulnerabilityLevel: 8, impactSeverity: 9, reasoning: 'Refrigeration for catch preservation' },
          { riskType: 'flood', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Coastal facilities and equipment damage' },
          { riskType: 'earthquake', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Port and dock infrastructure damage' },
          { riskType: 'drought', vulnerabilityLevel: 2, impactSeverity: 2, reasoning: 'Minimal direct impact on marine fishing' },
          { riskType: 'landslide', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Coastal road access to markets' }
        ]
      },
      {
        businessTypeId: 'fishery_processing_plant',
        name: 'Fishery Processing Plant',
        category: 'manufacturing',
        subcategory: 'Seafood Processing',
        description: 'Facility for processing and packaging seafood products',
        typicalRevenue: 'JMD 10M-50M annually',
        typicalEmployees: '15-40 employees',
        operatingHours: '6:00 AM - 6:00 PM',
        seasonalityFactor: 1.3,
        touristDependency: 2,
        supplyChainComplexity: 8,
        digitalDependency: 5,
        cashFlowPattern: 'seasonal',
        physicalAssetIntensity: 9,
        customerConcentration: 6,
        regulatoryBurden: 9,
        riskVulnerabilities: [
          { riskType: 'hurricane', vulnerabilityLevel: 9, impactSeverity: 10, reasoning: 'Coastal location and supply disruption' },
          { riskType: 'powerOutage', vulnerabilityLevel: 10, impactSeverity: 10, reasoning: 'Refrigeration absolutely critical for product' },
          { riskType: 'flood', vulnerabilityLevel: 9, impactSeverity: 9, reasoning: 'Contamination and equipment damage' },
          { riskType: 'earthquake', vulnerabilityLevel: 5, impactSeverity: 6, reasoning: 'Equipment and building structure' },
          { riskType: 'drought', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Water needed for processing and cleaning' },
          { riskType: 'landslide', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Distribution and supply routes' }
        ]
      },

      // SPECIALIZED
      {
        businessTypeId: 'cold_storage_facility',
        name: 'Cold Storage Facility',
        category: 'logistics',
        subcategory: 'Warehousing',
        description: 'Specialized facility for storing perishable goods at controlled temperatures',
        typicalRevenue: 'JMD 12M-60M annually',
        typicalEmployees: '10-30 employees',
        operatingHours: '24/7',
        seasonalityFactor: 1.1,
        touristDependency: 2,
        supplyChainComplexity: 8,
        digitalDependency: 6,
        cashFlowPattern: 'stable',
        physicalAssetIntensity: 10,
        customerConcentration: 6,
        regulatoryBurden: 7,
        riskVulnerabilities: [
          { riskType: 'powerOutage', vulnerabilityLevel: 10, impactSeverity: 10, reasoning: 'Complete facility failure without power' },
          { riskType: 'hurricane', vulnerabilityLevel: 8, impactSeverity: 9, reasoning: 'Power loss and structural damage' },
          { riskType: 'flood', vulnerabilityLevel: 7, impactSeverity: 8, reasoning: 'Equipment damage and access issues' },
          { riskType: 'earthquake', vulnerabilityLevel: 6, impactSeverity: 7, reasoning: 'Structural and refrigeration system damage' },
          { riskType: 'drought', vulnerabilityLevel: 3, impactSeverity: 4, reasoning: 'Cooling systems may use water' },
          { riskType: 'landslide', vulnerabilityLevel: 4, impactSeverity: 5, reasoning: 'Access routes for deliveries' }
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

    console.log('\n🎉 Successfully populated all Caribbean business types!')
    console.log('\n📊 Business Type Summary:')
    console.log(`- Total Business Types: ${businessTypes.length}`)
    
    const categoryCounts = businessTypes.reduce((acc, bt) => {
      acc[bt.category] = (acc[bt.category] || 0) + 1
      return acc
    }, {})
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`- ${category.charAt(0).toUpperCase() + category.slice(1)}: ${count}`)
    })

    // Risk statistics
    const avgTouristDependency = Math.round(businessTypes.reduce((sum, bt) => sum + bt.touristDependency, 0) / businessTypes.length * 10) / 10
    const avgSupplyChainComplexity = Math.round(businessTypes.reduce((sum, bt) => sum + bt.supplyChainComplexity, 0) / businessTypes.length * 10) / 10
    const avgDigitalDependency = Math.round(businessTypes.reduce((sum, bt) => sum + bt.digitalDependency, 0) / businessTypes.length * 10) / 10
    
    console.log(`\n📈 Average Dependencies:`)
    console.log(`- Tourist Dependency: ${avgTouristDependency}/10`)
    console.log(`- Supply Chain Complexity: ${avgSupplyChainComplexity}/10`)
    console.log(`- Digital Dependency: ${avgDigitalDependency}/10`)
    
    console.log(`\n🌊 High-Risk Profiles:`)
    const highHurricane = businessTypes.filter(bt => bt.riskVulnerabilities.some(v => v.riskType === 'hurricane' && v.vulnerabilityLevel >= 9))
    const highPower = businessTypes.filter(bt => bt.riskVulnerabilities.some(v => v.riskType === 'powerOutage' && v.vulnerabilityLevel >= 9))
    console.log(`- High Hurricane Risk: ${highHurricane.length} businesses`)
    console.log(`- High Power Outage Risk: ${highPower.length} businesses`)

  } catch (error) {
    console.error('❌ Error populating business types:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateAllCaribbeanBusinessTypes()

