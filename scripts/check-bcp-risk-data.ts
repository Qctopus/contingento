import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBCPRiskData() {
  console.log('📋 Checking BCP Risk Data...\n')

  // Check anonymous sessions for BCP data
  const sessions = await prisma.anonymousSession.findMany({
    select: {
      businessName: true,
      planData: true
    },
    take: 5 // Just check a few samples
  })

  console.log(`Found ${sessions.length} anonymous sessions`)

  const allRisks = new Set<string>()

  sessions.forEach((session, index) => {
    if (session.planData) {
      try {
        const planData = JSON.parse(session.planData as string)

        // Extract risk data from different possible locations
        const riskAssessment = planData.riskAssessment || planData.businessProfile?.riskAssessment
        if (riskAssessment) {
          const potentialHazards = riskAssessment.potentialHazards || riskAssessment.hazards

          if (potentialHazards) {
            let hazards: string[] = []

            if (typeof potentialHazards === 'string') {
              try {
                hazards = JSON.parse(potentialHazards)
              } catch {
                hazards = [potentialHazards]
              }
            } else if (Array.isArray(potentialHazards)) {
              hazards = potentialHazards
            }

            console.log(`\n📄 Session ${index + 1} (${session.businessName}):`)
            console.log(`   Hazards: ${hazards.join(', ') || 'None'}`)

            hazards.forEach(hazard => allRisks.add(hazard))
          }
        }
      } catch (error) {
        console.log(`   ❌ Error parsing session ${index + 1}: ${error}`)
      }
    }
  })

  console.log('\n🔍 All unique risk types found in BCP data:')
  console.log('─'.repeat(50))

  const sortedRisks = Array.from(allRisks).sort()
  sortedRisks.forEach(risk => {
    console.log(`  • ${risk}`)
  })

  console.log(`\n📊 Summary: ${allRisks.size} unique risk types found`)

  // Now check if these risks match our strategies
  console.log('\n🔗 Risk-Strategy Matching Check:')
  console.log('═'.repeat(50))

  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      applicableRisks: true
    }
  })

  const unmatchedRisks: string[] = []

  sortedRisks.forEach(risk => {
    let hasMatch = false

    strategies.forEach(strategy => {
      try {
        const applicableRisks = JSON.parse(strategy.applicableRisks as string) || []
        if (applicableRisks.includes(risk)) {
          hasMatch = true
        }
      } catch {
        // Ignore parsing errors
      }
    })

    if (!hasMatch) {
      unmatchedRisks.push(risk)
      console.log(`❌ ${risk} - NO MATCHING STRATEGY`)
    } else {
      console.log(`✅ ${risk} - Has strategy coverage`)
    }
  })

  if (unmatchedRisks.length > 0) {
    console.log(`\n🚨 ${unmatchedRisks.length} risks have NO strategy coverage:`)
    unmatchedRisks.forEach(risk => console.log(`   ✗ ${risk}`))
  } else {
    console.log('\n✅ All BCP risks have strategy coverage!')
  }
}

async function main() {
  try {
    await checkBCPRiskData()
  } catch (error) {
    console.error('❌ Error checking BCP risk data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}


