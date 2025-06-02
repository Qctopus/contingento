import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { planData } = await req.json()

    if (!planData) {
      return NextResponse.json(
        { error: 'No plan data provided' },
        { status: 400 }
      )
    }

    // Log the incoming data for debugging
    console.log('Received plan data:', JSON.stringify(planData, null, 2))

    // Validate and transform the data
    const transformedData = {
      businessProfile: {
        create: {
          companyName: String(planData.BUSINESS_OVERVIEW?.['Company Name'] || ''),
          businessLicenseNumber: String(planData.BUSINESS_OVERVIEW?.['Business License Number'] || ''),
          businessPurpose: String(planData.BUSINESS_OVERVIEW?.['Business Purpose'] || ''),
          productsAndServices: String(planData.BUSINESS_OVERVIEW?.['Products and Services'] || ''),
          serviceDelivery: String(planData.BUSINESS_OVERVIEW?.['Service Delivery'] || ''),
          operatingHours: String(planData.BUSINESS_OVERVIEW?.['Operating Hours'] || ''),
          serviceProviderBCP: String(planData.BUSINESS_OVERVIEW?.['Service Provider BCP'] || ''),
        },
      },
      businessFunctions: {
        create: {
          supplyChainManagement: JSON.stringify(Array.isArray(planData.ESSENTIAL_FUNCTIONS?.['Supply Chain Management']) 
            ? planData.ESSENTIAL_FUNCTIONS['Supply Chain Management'] 
            : []),
          staff: JSON.stringify(Array.isArray(planData.ESSENTIAL_FUNCTIONS?.['Staff'])
            ? planData.ESSENTIAL_FUNCTIONS['Staff']
            : []),
          technology: JSON.stringify(Array.isArray(planData.ESSENTIAL_FUNCTIONS?.['Technology'])
            ? planData.ESSENTIAL_FUNCTIONS['Technology']
            : []),
          productsServices: JSON.stringify(Array.isArray(planData.ESSENTIAL_FUNCTIONS?.['Products/Services'])
            ? planData.ESSENTIAL_FUNCTIONS['Products/Services']
            : []),
          infrastructureFacilities: JSON.stringify(Array.isArray(planData.ESSENTIAL_FUNCTIONS?.['Infrastructure/Facilities'])
            ? planData.ESSENTIAL_FUNCTIONS['Infrastructure/Facilities']
            : []),
          sales: JSON.stringify(Array.isArray(planData.ESSENTIAL_FUNCTIONS?.['Sales'])
            ? planData.ESSENTIAL_FUNCTIONS['Sales']
            : []),
          administration: JSON.stringify(Array.isArray(planData.ESSENTIAL_FUNCTIONS?.['Administration'])
            ? planData.ESSENTIAL_FUNCTIONS['Administration']
            : []),
        },
      },
      riskAssessments: {
        create: {
          hazards: JSON.stringify(Array.isArray(planData.RISK_ASSESSMENT?.['Hazards'])
            ? planData.RISK_ASSESSMENT['Hazards']
            : []),
        },
      },
      strategies: {
        create: {
          preventionStrategies: JSON.stringify(Array.isArray(planData.STRATEGIES?.['Prevention Strategies'])
            ? planData.STRATEGIES['Prevention Strategies']
            : []),
          responseStrategies: JSON.stringify(Array.isArray(planData.STRATEGIES?.['Response Strategies'])
            ? planData.STRATEGIES['Response Strategies']
            : []),
          recoveryStrategies: JSON.stringify(Array.isArray(planData.STRATEGIES?.['Recovery Strategies'])
            ? planData.STRATEGIES['Recovery Strategies']
            : []),
        },
      },
      actionPlans: {
        create: {
          implementationTimeline: String(planData.ACTION_PLAN?.['Implementation Timeline'] || ''),
          resourceRequirements: String(planData.ACTION_PLAN?.['Resource Requirements'] || ''),
          responsibleParties: String(planData.ACTION_PLAN?.['Responsible Parties'] || ''),
          reviewUpdateSchedule: String(planData.ACTION_PLAN?.['Review and Update Schedule'] || ''),
        },
      },
    }

    // Log the transformed data for debugging
    console.log('Transformed data:', JSON.stringify(transformedData, null, 2))

    // Create a new plan in the database
    const plan = await prisma.businessContinuityPlan.create({
      data: transformedData,
    })

    return NextResponse.json({ success: true, planId: plan.id })
  } catch (error) {
    console.error('Error saving plan:', error)
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { 
        error: 'Failed to save plan', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 