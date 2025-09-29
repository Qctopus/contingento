const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAdminSystem() {
  console.log('🧪 Testing admin system components...')

  try {
    // Test 1: Check if data exists
    const businessTypes = await prisma.adminBusinessType.findMany()
    const hazards = await prisma.adminHazardType.findMany()
    const locations = await prisma.adminLocation.findMany()
    const strategies = await prisma.adminStrategy.findMany()

    console.log('✅ Data verification:')
    console.log(`- Business Types: ${businessTypes.length}`)
    console.log(`- Hazards: ${hazards.length}`)
    console.log(`- Locations: ${locations.length}`)
    console.log(`- Strategies: ${strategies.length}`)

    // Test 2: Check business type hazard mappings
    const mappings = await prisma.adminBusinessTypeHazard.findMany({
      include: {
        businessType: true,
        hazard: true
      }
    })
    console.log(`- Business-Hazard Mappings: ${mappings.length}`)

    // Test 3: Check location hazard mappings
    const locationMappings = await prisma.adminLocationHazard.findMany({
      include: {
        location: true,
        hazard: true
      }
    })
    console.log(`- Location-Hazard Mappings: ${locationMappings.length}`)

    // Test 4: Check strategies
    const hazardStrategies = await prisma.adminHazardStrategy.findMany({
      include: {
        hazard: true,
        strategy: true
      }
    })
    console.log(`- Hazard-Strategy Mappings: ${hazardStrategies.length}`)

    // Test 5: Check action plans
    const actionPlans = await prisma.adminActionPlan.findMany()
    console.log(`- Action Plans: ${actionPlans.length}`)

    // Test 6: Sample data verification
    const restaurant = businessTypes.find(bt => bt.businessTypeId === 'restaurant')
    const hurricane = hazards.find(h => h.hazardId === 'hurricane')
    const kingston = locations.find(l => l.parish === 'Kingston')

    console.log('\n📋 Sample Data Verification:')
    console.log(`- Restaurant: ${restaurant ? '✅ Found' : '❌ Missing'}`)
    console.log(`- Hurricane: ${hurricane ? '✅ Found' : '❌ Missing'}`)
    console.log(`- Kingston: ${kingston ? '✅ Found' : '❌ Missing'}`)

    if (restaurant && hurricane && kingston) {
      console.log('\n🎯 Ready for risk calculation testing!')
      console.log('You can now test the admin interface at: http://localhost:3000/admin')
      console.log('Try selecting Restaurant + Kingston in the Risk Calculator tab')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminSystem() 