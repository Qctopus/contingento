const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRiskCalculation() {
  console.log('🧪 Testing risk calculation API...')

  try {
    // Get sample data
    const restaurant = await prisma.adminBusinessType.findFirst({
      where: { businessTypeId: 'restaurant' }
    })
    
    const kingston = await prisma.adminLocation.findFirst({
      where: { parish: 'Kingston' }
    })

    if (!restaurant || !kingston) {
      console.error('❌ Sample data not found')
      return
    }

    console.log('✅ Found sample data:')
    console.log(`- Business Type: ${restaurant.name} (${restaurant.businessTypeId})`)
    console.log(`- Location: ${kingston.country} - ${kingston.parish}`)

    // Test risk calculation API
    const response = await fetch('http://localhost:3000/api/admin/risk-calculation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessTypeId: restaurant.businessTypeId,
        locationId: kingston.id
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', response.status, errorText)
      return
    }

    const data = await response.json()
    
    console.log('✅ Risk calculation successful!')
    console.log(`- Risk Score: ${data.riskScore}/100`)
    console.log(`- Calculated Risks: ${data.calculatedRisks.length}`)
    console.log(`- Recommended Strategies: ${data.recommendedStrategies.length}`)
    
    console.log('\n📊 Sample Risk Results:')
    data.calculatedRisks.slice(0, 3).forEach((risk, index) => {
      console.log(`${index + 1}. ${risk.hazardId}: ${risk.riskLevel} (${risk.reasoning})`)
    })

    console.log('\n🎯 Sample Strategy Recommendations:')
    data.recommendedStrategies.slice(0, 3).forEach((strategy, index) => {
      console.log(`${index + 1}. ${strategy.strategyId}: ${strategy.priority} (ROI: ${strategy.roi.toFixed(2)})`)
    })

    console.log('\n🎉 Risk calculation system is working correctly!')
    console.log('You can now test the full interface at: http://localhost:3000/admin')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testRiskCalculation() 