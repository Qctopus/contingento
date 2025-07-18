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

    // Helper function to safely convert array/object data to JSON string
    const safeStringify = (data: any): string => {
      if (data === undefined || data === null) return '[]'
      if (typeof data === 'string') return data
      if (Array.isArray(data)) return JSON.stringify(data)
      if (typeof data === 'object') return JSON.stringify(data)
      return String(data)
    }

    // Helper function to safely get string value
    const safeString = (data: any): string => {
      if (data === undefined || data === null) return ''
      if (typeof data === 'string') return data
      if (typeof data === 'object') return JSON.stringify(data)
      return String(data)
    }

    // Create a new plan in the database - only including models that exist in schema
    const plan = await prisma.businessContinuityPlan.create({
      data: {
        // Plan Information
        planInformation: {
          create: {
            companyName: safeString(planData.PLAN_INFORMATION?.['Company Name']),
            planManager: safeString(planData.PLAN_INFORMATION?.['Plan Manager']),
            alternateManager: safeString(planData.PLAN_INFORMATION?.['Alternate Manager']),
            physicalPlanLocation: safeString(planData.PLAN_INFORMATION?.['Physical Plan Location']),
            digitalPlanLocation: safeString(planData.PLAN_INFORMATION?.['Digital Plan Location']),
          },
        },

        // Business Overview
        businessOverview: {
          create: {
            businessLicenseNumber: safeString(planData.BUSINESS_OVERVIEW?.['Business License Number']),
            businessPurpose: safeString(planData.BUSINESS_OVERVIEW?.['Business Purpose']),
            productsAndServices: safeString(planData.BUSINESS_OVERVIEW?.['Products and Services']),
            serviceDeliveryMethods: safeString(planData.BUSINESS_OVERVIEW?.['Service Delivery Methods']),
            operatingHours: safeString(planData.BUSINESS_OVERVIEW?.['Operating Hours']),
            keyPersonnel: safeString(planData.BUSINESS_OVERVIEW?.['Key Personnel Involved']),
            minimumResources: safeString(planData.BUSINESS_OVERVIEW?.['Minimum Resource Requirements']),
            customerBase: safeString(planData.BUSINESS_OVERVIEW?.['Customer Base']),
            serviceProviderBCP: safeString(planData.BUSINESS_OVERVIEW?.['Service Provider BCP Status']),
          },
        },

        // Essential Functions
        essentialFunction: {
          create: {
            supplyChainManagement: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Supply Chain Management Functions']),
            staffManagement: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Staff Management Functions']),
            technology: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Technology Functions']),
            productsServices: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Product and Service Delivery']),
            infrastructureFacilities: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Infrastructure and Facilities']),
            sales: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Sales and Marketing Functions']),
            administration: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Administrative Functions']),
          },
        },

        // Risk Assessment
        riskAssessment: {
          create: {
            potentialHazards: safeStringify(planData.RISK_ASSESSMENT?.['Potential Hazards']),
            hazards: safeStringify(planData.RISK_ASSESSMENT?.['Risk Assessment Matrix']),
          },
        },

        // Strategies
        strategy: {
          create: {
            preventionStrategies: safeStringify(planData.STRATEGIES?.['Prevention Strategies (Before Emergencies)']),
            responseStrategies: safeStringify(planData.STRATEGIES?.['Response Strategies (During Emergencies)']),
            recoveryStrategies: safeStringify(planData.STRATEGIES?.['Recovery Strategies (After Emergencies)']),
            longTermRiskReduction: safeString(planData.STRATEGIES?.['Long-term Risk Reduction Measures']),
          },
        },

        // Action Plans
        actionPlan: {
          create: {
            actionPlanByRisk: safeStringify(planData.ACTION_PLAN?.['Action Plan by Risk Level']),
            implementationTimeline: safeString(planData.ACTION_PLAN?.['Implementation Timeline']),
            resourceRequirements: safeString(planData.ACTION_PLAN?.['Resource Requirements']),
            responsibleParties: safeString(planData.ACTION_PLAN?.['Responsible Parties and Roles']),
            reviewUpdateSchedule: safeString(planData.ACTION_PLAN?.['Review and Update Schedule']),
            testingAssessmentPlan: safeStringify(planData.ACTION_PLAN?.['Testing and Assessment Plan']),
          },
        },
      },
    })

    // Log warning about missing models
    console.warn('Warning: ContactsInformation and TestingMaintenance data not saved - models not in current schema')
    console.warn('To save this data, add the missing models to your Prisma schema')

    return NextResponse.json({ success: true, planId: plan.id })
  } catch (error) {
    console.error('Error saving plan:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return NextResponse.json(
      { 
        error: 'Failed to save plan', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}