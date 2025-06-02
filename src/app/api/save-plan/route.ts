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

    // Create a new plan in the database with all sections
    const plan = await prisma.businessContinuityPlan.create({
      data: {
        // Plan Information
        planInformation: {
          create: {
            companyName: safeString(planData.PLAN_INFORMATION?.['Company Name']),
            planManager: safeString(planData.PLAN_INFORMATION?.['Plan Manager']),
            alternateManager: safeString(planData.PLAN_INFORMATION?.['Alternate Manager']),
            planLocation: safeString(planData.PLAN_INFORMATION?.['Plan Location']),
          },
        },

        // Business Overview
        businessProfile: {
          create: {
            businessLicenseNumber: safeString(planData.BUSINESS_OVERVIEW?.['Business License Number']),
            businessPurpose: safeString(planData.BUSINESS_OVERVIEW?.['Business Purpose']),
            productsAndServices: safeString(planData.BUSINESS_OVERVIEW?.['Products and Services']),
            serviceDeliveryMethods: safeString(planData.BUSINESS_OVERVIEW?.['Service Delivery Methods']),
            operatingHours: safeString(planData.BUSINESS_OVERVIEW?.['Operating Hours']),
            keyPersonnelInvolved: safeString(planData.BUSINESS_OVERVIEW?.['Key Personnel Involved']),
            minimumResourceRequirements: safeString(planData.BUSINESS_OVERVIEW?.['Minimum Resource Requirements']),
            customerBase: safeString(planData.BUSINESS_OVERVIEW?.['Customer Base']),
            serviceProviderBCPStatus: safeString(planData.BUSINESS_OVERVIEW?.['Service Provider BCP Status']),
          },
        },

        // Essential Functions
        businessFunctions: {
          create: {
            supplyChainManagement: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Supply Chain Management Functions']),
            staffManagement: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Staff Management Functions']),
            technology: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Technology Functions']),
            productServiceDelivery: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Product and Service Delivery']),
            salesMarketing: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Sales and Marketing Functions']),
            administration: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Administrative Functions']),
            infrastructureFacilities: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Infrastructure and Facilities']),
            functionPriorityAssessment: safeStringify(planData.ESSENTIAL_FUNCTIONS?.['Function Priority Assessment']),
          },
        },

        // Risk Assessment
        riskAssessments: {
          create: {
            potentialHazards: safeStringify(planData.RISK_ASSESSMENT?.['Potential Hazards']),
            riskAssessmentMatrix: safeStringify(planData.RISK_ASSESSMENT?.['Risk Assessment Matrix']),
          },
        },

        // Strategies
        strategies: {
          create: {
            preventionStrategies: safeStringify(planData.STRATEGIES?.['Prevention Strategies (Before Emergencies)']),
            responseStrategies: safeStringify(planData.STRATEGIES?.['Response Strategies (During Emergencies)']),
            recoveryStrategies: safeStringify(planData.STRATEGIES?.['Recovery Strategies (After Emergencies)']),
            longTermRiskReduction: safeString(planData.STRATEGIES?.['Long-term Risk Reduction Measures']),
          },
        },

        // Action Plans
        actionPlans: {
          create: {
            actionPlanByRisk: safeStringify(planData.ACTION_PLAN?.['Action Plan by Risk Level']),
            implementationTimeline: safeString(planData.ACTION_PLAN?.['Implementation Timeline']),
            resourceRequirements: safeString(planData.ACTION_PLAN?.['Resource Requirements']),
            responsiblePartiesRoles: safeString(planData.ACTION_PLAN?.['Responsible Parties and Roles']),
            reviewUpdateSchedule: safeString(planData.ACTION_PLAN?.['Review and Update Schedule']),
            testingAssessmentPlan: safeStringify(planData.ACTION_PLAN?.['Testing and Assessment Plan']),
          },
        },

        // Contacts and Information
        contactsInformation: {
          create: {
            staffContactInfo: safeStringify(planData.CONTACTS_AND_INFORMATION?.['Staff Contact Information']),
            keyCustomerContacts: safeStringify(planData.CONTACTS_AND_INFORMATION?.['Key Customer Contacts']),
            supplierInformation: safeStringify(planData.CONTACTS_AND_INFORMATION?.['Supplier Information']),
            emergencyServicesUtilities: safeStringify(planData.CONTACTS_AND_INFORMATION?.['Emergency Services and Utilities']),
            criticalBusinessInfo: safeString(planData.CONTACTS_AND_INFORMATION?.['Critical Business Information']),
            planDistributionList: safeStringify(planData.CONTACTS_AND_INFORMATION?.['Plan Distribution List']),
          },
        },

        // Testing and Maintenance
        testingMaintenance: {
          create: {
            planTestingSchedule: safeStringify(planData.TESTING_AND_MAINTENANCE?.['Plan Testing Schedule']),
            planRevisionHistory: safeStringify(planData.TESTING_AND_MAINTENANCE?.['Plan Revision History']),
            improvementTracking: safeStringify(planData.TESTING_AND_MAINTENANCE?.['Improvement Tracking']),
            annualReviewProcess: safeString(planData.TESTING_AND_MAINTENANCE?.['Annual Review Process']),
            triggerEventsForUpdates: safeString(planData.TESTING_AND_MAINTENANCE?.['Trigger Events for Plan Updates']),
          },
        },
      },
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