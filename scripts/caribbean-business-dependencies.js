const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const caribbeanBusinessDependencies = [
  // Food & Beverage
  {
    businessTypeId: 'grocery_store',
    dependencies: {
      powerCritical: 5,
      waterIntensive: 3,
      touristDependent: 1,
      supplyChainReliant: 4,
      perishableGoods: 5,
      outdoorOperations: 1,
      coastalExposure: 1,
      refrigerationDependent: 5,
      internetCritical: 2,
      transportationDependent: 3
    }
  },
  {
    businessTypeId: 'restaurant',
    dependencies: {
      powerCritical: 4,
      waterIntensive: 4,
      touristDependent: 3,
      supplyChainReliant: 4,
      perishableGoods: 4,
      outdoorOperations: 2,
      coastalExposure: 2,
      refrigerationDependent: 4,
      internetCritical: 2,
      transportationDependent: 3
    }
  },
  {
    businessTypeId: 'food_processing',
    dependencies: {
      powerCritical: 5,
      waterIntensive: 4,
      touristDependent: 1,
      supplyChainReliant: 4,
      perishableGoods: 5,
      outdoorOperations: 1,
      coastalExposure: 1,
      refrigerationDependent: 5,
      internetCritical: 3,
      transportationDependent: 4
    }
  },

  // Hospitality & Tourism
  {
    businessTypeId: 'hotel_guesthouse',
    dependencies: {
      powerCritical: 4,
      waterIntensive: 5,
      touristDependent: 5,
      supplyChainReliant: 3,
      perishableGoods: 2,
      outdoorOperations: 2,
      coastalExposure: 3,
      refrigerationDependent: 3,
      internetCritical: 4,
      transportationDependent: 3
    }
  },
  {
    businessTypeId: 'tour_operator',
    dependencies: {
      powerCritical: 2,
      waterIntensive: 1,
      touristDependent: 5,
      supplyChainReliant: 2,
      perishableGoods: 1,
      outdoorOperations: 4,
      coastalExposure: 3,
      refrigerationDependent: 1,
      internetCritical: 4,
      transportationDependent: 5
    }
  },

  // Services
  {
    businessTypeId: 'beauty_salon',
    dependencies: {
      powerCritical: 3,
      waterIntensive: 4,
      touristDependent: 2,
      supplyChainReliant: 2,
      perishableGoods: 1,
      outdoorOperations: 1,
      coastalExposure: 1,
      refrigerationDependent: 1,
      internetCritical: 2,
      transportationDependent: 2
    }
  },
  {
    businessTypeId: 'pharmacy',
    dependencies: {
      powerCritical: 4,
      waterIntensive: 2,
      touristDependent: 2,
      supplyChainReliant: 4,
      perishableGoods: 3,
      outdoorOperations: 1,
      coastalExposure: 1,
      refrigerationDependent: 4,
      internetCritical: 3,
      transportationDependent: 3
    }
  },
  {
    businessTypeId: 'accounting_office',
    dependencies: {
      powerCritical: 4,
      waterIntensive: 1,
      touristDependent: 1,
      supplyChainReliant: 1,
      perishableGoods: 1,
      outdoorOperations: 1,
      coastalExposure: 1,
      refrigerationDependent: 1,
      internetCritical: 5,
      transportationDependent: 2
    }
  },

  // Transportation
  {
    businessTypeId: 'taxi_service',
    dependencies: {
      powerCritical: 2,
      waterIntensive: 1,
      touristDependent: 3,
      supplyChainReliant: 2,
      perishableGoods: 1,
      outdoorOperations: 4,
      coastalExposure: 2,
      refrigerationDependent: 1,
      internetCritical: 3,
      transportationDependent: 5
    }
  },

  // Retail & Manufacturing
  {
    businessTypeId: 'hardware_store',
    dependencies: {
      powerCritical: 3,
      waterIntensive: 2,
      touristDependent: 2,
      supplyChainReliant: 4,
      perishableGoods: 1,
      outdoorOperations: 2,
      coastalExposure: 1,
      refrigerationDependent: 1,
      internetCritical: 2,
      transportationDependent: 4
    }
  },
  {
    businessTypeId: 'craft_workshop',
    dependencies: {
      powerCritical: 3,
      waterIntensive: 2,
      touristDependent: 3,
      supplyChainReliant: 3,
      perishableGoods: 1,
      outdoorOperations: 2,
      coastalExposure: 1,
      refrigerationDependent: 1,
      internetCritical: 2,
      transportationDependent: 3
    }
  },
  {
    businessTypeId: 'auto_repair',
    dependencies: {
      powerCritical: 3,
      waterIntensive: 2,
      touristDependent: 2,
      supplyChainReliant: 3,
      perishableGoods: 1,
      outdoorOperations: 3,
      coastalExposure: 1,
      refrigerationDependent: 1,
      internetCritical: 2,
      transportationDependent: 3
    }
  },

  // Agriculture & Fishing
  {
    businessTypeId: 'small_farm',
    dependencies: {
      powerCritical: 2,
      waterIntensive: 5,
      touristDependent: 1,
      supplyChainReliant: 3,
      perishableGoods: 4,
      outdoorOperations: 5,
      coastalExposure: 2,
      refrigerationDependent: 2,
      internetCritical: 1,
      transportationDependent: 3
    }
  },
  {
    businessTypeId: 'fishing_operation',
    dependencies: {
      powerCritical: 2,
      waterIntensive: 1,
      touristDependent: 1,
      supplyChainReliant: 3,
      perishableGoods: 5,
      outdoorOperations: 5,
      coastalExposure: 5,
      refrigerationDependent: 4,
      internetCritical: 1,
      transportationDependent: 4
    }
  },

  // Education & Care
  {
    businessTypeId: 'daycare_center',
    dependencies: {
      powerCritical: 3,
      waterIntensive: 3,
      touristDependent: 1,
      supplyChainReliant: 2,
      perishableGoods: 2,
      outdoorOperations: 2,
      coastalExposure: 1,
      refrigerationDependent: 2,
      internetCritical: 2,
      transportationDependent: 3
    }
  }
]

// Hybrid business types for complex Caribbean scenarios
const hybridBusinessTypes = [
  {
    businessTypeId: 'beachfront_restaurant',
    name: 'Beachfront Restaurant',
    localName: 'Beachfront Restaurant/Bar',
    category: 'hospitality',
    description: 'Restaurant located directly on the beach with outdoor seating',
    dependencies: {
      powerCritical: 4,
      waterIntensive: 4,
      touristDependent: 5,
      supplyChainReliant: 4,
      perishableGoods: 4,
      outdoorOperations: 5,
      coastalExposure: 5,
      refrigerationDependent: 4,
      internetCritical: 3,
      transportationDependent: 3
    }
  },
  {
    businessTypeId: 'cold_storage_facility',
    name: 'Cold Storage Facility',
    localName: 'Cold Storage/Warehouse',
    category: 'logistics',
    description: 'Specialized facility for storing perishable goods at controlled temperatures',
    dependencies: {
      powerCritical: 5,
      waterIntensive: 2,
      touristDependent: 1,
      supplyChainReliant: 4,
      perishableGoods: 5,
      outdoorOperations: 1,
      coastalExposure: 2,
      refrigerationDependent: 5,
      internetCritical: 3,
      transportationDependent: 4
    }
  },
  {
    businessTypeId: 'local_market_vendor',
    name: 'Local Market Vendor',
    localName: 'Market Vendor/Street Vendor',
    category: 'retail',
    description: 'Small-scale vendor selling goods at local markets or street locations',
    dependencies: {
      powerCritical: 1,
      waterIntensive: 2,
      touristDependent: 2,
      supplyChainReliant: 3,
      perishableGoods: 3,
      outdoorOperations: 4,
      coastalExposure: 1,
      refrigerationDependent: 1,
      internetCritical: 1,
      transportationDependent: 3
    }
  },
  {
    businessTypeId: 'eco_tourism_lodge',
    name: 'Eco-Tourism Lodge',
    localName: 'Eco-Lodge/Nature Resort',
    category: 'hospitality',
    description: 'Sustainable tourism accommodation in natural settings',
    dependencies: {
      powerCritical: 3,
      waterIntensive: 4,
      touristDependent: 5,
      supplyChainReliant: 2,
      perishableGoods: 2,
      outdoorOperations: 5,
      coastalExposure: 3,
      refrigerationDependent: 2,
      internetCritical: 3,
      transportationDependent: 4
    }
  },
  {
    businessTypeId: 'fishery_processing_plant',
    name: 'Fishery Processing Plant',
    localName: 'Fish Processing Plant',
    category: 'manufacturing',
    description: 'Facility for processing and packaging seafood products',
    dependencies: {
      powerCritical: 5,
      waterIntensive: 4,
      touristDependent: 1,
      supplyChainReliant: 4,
      perishableGoods: 5,
      outdoorOperations: 2,
      coastalExposure: 4,
      refrigerationDependent: 5,
      internetCritical: 3,
      transportationDependent: 4
    }
  }
]

async function updateCaribbeanBusinessDependencies() {
  try {
    console.log('🏢 Updating Caribbean business dependencies...')
    
    // Update existing business types with dependencies
    for (const businessData of caribbeanBusinessDependencies) {
      const dependencies = JSON.stringify(businessData.dependencies)
      
      await prisma.adminBusinessType.update({
        where: { businessTypeId: businessData.businessTypeId },
        data: {
          dependencies,
          isActive: true
        }
      })
      
      console.log(`✅ Updated: ${businessData.businessTypeId}`)
    }
    
    // Create new hybrid business types
    for (const hybridBusiness of hybridBusinessTypes) {
      const dependencies = JSON.stringify(hybridBusiness.dependencies)
      
      await prisma.adminBusinessType.upsert({
        where: { businessTypeId: hybridBusiness.businessTypeId },
        update: {
          name: hybridBusiness.name,
          localName: hybridBusiness.localName,
          category: hybridBusiness.category,
          description: hybridBusiness.description,
          dependencies,
          isActive: true
        },
        create: {
          businessTypeId: hybridBusiness.businessTypeId,
          name: hybridBusiness.name,
          localName: hybridBusiness.localName,
          category: hybridBusiness.category,
          description: hybridBusiness.description,
          dependencies,
          isActive: true
        }
      })
      
      console.log(`✅ Created/Updated hybrid: ${hybridBusiness.name}`)
    }
    
    console.log('\n🎯 Caribbean business dependencies successfully updated!')
    console.log(`📊 Total business types updated: ${caribbeanBusinessDependencies.length}`)
    console.log(`🔄 Hybrid business types created: ${hybridBusinessTypes.length}`)
    
    // Display summary by category
    const allBusinesses = [...caribbeanBusinessDependencies, ...hybridBusinessTypes]
    const categoryCounts = allBusinesses.reduce((acc, business) => {
      acc[business.category] = (acc[business.category] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📈 Business Type Distribution:')
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} businesses`)
    })
    
    // Show dependency patterns
    console.log('\n🔍 Key Dependency Patterns:')
    console.log('  • High Power Critical: Cold storage, food processing, grocery stores')
    console.log('  • High Tourist Dependent: Hotels, tour operators, beachfront restaurants')
    console.log('  • High Coastal Exposure: Fishing operations, beachfront businesses')
    console.log('  • High Outdoor Operations: Farms, fishing, eco-tourism')
    console.log('  • High Perishable Goods: Food processing, fisheries, grocery stores')
    
  } catch (error) {
    console.error('❌ Error updating Caribbean business dependencies:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCaribbeanBusinessDependencies() 