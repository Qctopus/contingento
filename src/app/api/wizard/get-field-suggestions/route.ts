import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fieldName, businessTypeId, step, countryCode, parish } = body

    if (!fieldName || !businessTypeId) {
      return NextResponse.json(
        { error: 'fieldName and businessTypeId are required' },
        { status: 400 }
      )
    }

    // Get business type with all relevant data
    const businessType = await (prisma as any).adminBusinessType.findUnique({
      where: { businessTypeId },
      include: {
        businessTypeHazards: {
          include: {
            hazard: true
          },
          where: { isActive: true }
        }
      }
    })

    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type not found' },
        { status: 404 }
      )
    }

    // Get location data if provided
    let location = null
    if (countryCode) {
      location = await (prisma as any).adminLocation.findFirst({
        where: {
          countryCode,
          parish: parish || null
        }
      })
    }

    // Parse JSON fields safely
    const parseJsonField = (field: string | null): any => {
      if (!field) return []
      try {
        return JSON.parse(field)
      } catch (e) {
        return []
      }
    }

    const suggestions: any = {
      examples: [],
      preFillValue: null,
      contextualInfo: null,
      isSmartSuggestion: true
    }

    // Handle different field types and steps
    switch (step) {
      case 'BUSINESS_OVERVIEW':
        suggestions.examples = dedupe(
          getBusinessOverviewSuggestions(normalizeLabel(fieldName), businessType, normalizeLocation(location), parseJsonField)
        )
        suggestions.preFillValue = getBusinessOverviewPreFill(normalizeLabel(fieldName), businessType, parseJsonField)
        break

      case 'ESSENTIAL_FUNCTIONS':
        suggestions.examples = dedupe(
          getEssentialFunctionsSuggestions(normalizeLabel(fieldName), businessType, parseJsonField)
        )
        suggestions.preFillValue = getEssentialFunctionsPreFill(normalizeLabel(fieldName), businessType, parseJsonField)
        break

      case 'RISK_ASSESSMENT':
        suggestions.examples = dedupe(
          getRiskAssessmentSuggestions(normalizeLabel(fieldName), businessType, normalizeLocation(location))
        )
        suggestions.preFillValue = getRiskAssessmentPreFill(normalizeLabel(fieldName), businessType)
        break

      case 'STRATEGIES':
        suggestions.examples = getStrategiesSuggestions(fieldName, businessType, location)
        break

      case 'RESOURCES':
        suggestions.examples = dedupe(
          getResourcesSuggestions(normalizeLabel(fieldName), businessType, parseJsonField)
        )
        suggestions.preFillValue = getResourcesPreFill(normalizeLabel(fieldName), businessType, parseJsonField)
        break

      default:
        // Fallback to general business type examples
        suggestions.examples = dedupe(getGeneralSuggestions(normalizeLabel(fieldName), businessType, parseJsonField))
    }

    // Add contextual information based on location
    if (location) {
      suggestions.contextualInfo = getLocationContext(normalizeLabel(fieldName), normalizeLocation(location), businessType)
    }

    return NextResponse.json(suggestions)

  } catch (error) {
    console.error('Error generating field suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}

// Helper functions for different field types
function normalizeLabel(fieldName: string): string {
  // Map localized or variant labels to canonical keys used by services
  const map: Record<string, string> = {
    'Products/Services': 'Products and Services',
    'Key Personnel': 'Key Personnel Involved',
    'Minimum Resource Requirements': 'Minimum Resource Requirements',
  }
  return map[fieldName] || fieldName
}

function normalizeLocation(location: any) {
  if (!location) return null
  return {
    ...location,
    isCoastal: location.nearCoast ?? location.isCoastal ?? false,
    isUrban: location.urbanArea ?? location.isUrban ?? false,
  }
}

function dedupe(arr: string[] = []): string[] {
  return Array.from(new Set(arr.filter(Boolean)))
}
function getBusinessOverviewSuggestions(fieldName: string, businessType: any, location: any, parseJsonField: Function): string[] {
  const examples: string[] = []
  
  switch (fieldName) {
    case 'Business Purpose':
      const purposes = parseJsonField(businessType.exampleBusinessPurposes)
      examples.push(...purposes.slice(0, 3))
      break
      
    case 'Products/Services':
      const products = parseJsonField(businessType.exampleProducts)
      examples.push(...products.slice(0, 3))
      break
      
    case 'Key Personnel':
      const personnel = parseJsonField(businessType.exampleKeyPersonnel)
      examples.push(...personnel.slice(0, 3))
      break
      
    case 'Customer Base':
      const customers = parseJsonField(businessType.exampleCustomerBase)
      examples.push(...customers.slice(0, 3))
      
      // Add location-specific variations
      if (location) {
        if (location.isCoastal) {
          examples.push(`Coastal tourists and visitors to ${location.parish || location.countryCode}`)
        }
        if (location.isUrban) {
          examples.push(`Urban residents and professionals in ${location.parish || location.countryCode}`)
        }
      }
      break
      
    case 'Operating Hours':
      if (businessType.typicalOperatingHours) {
        examples.push(businessType.typicalOperatingHours)
      }
      // Add regional variations
      if (location) {
        examples.push(`Typical ${location.countryCode} business hours: 8:00 AM - 6:00 PM`)
        examples.push(`Extended hours for tourist areas: 7:00 AM - 9:00 PM`)
      }
      break
  }
  
  return examples.filter(Boolean)
}

function getBusinessOverviewPreFill(fieldName: string, businessType: any, parseJsonField: Function): string | null {
  switch (fieldName) {
    case 'Business Purpose':
      const purposes = parseJsonField(businessType.exampleBusinessPurposes)
      return purposes.length > 0 ? purposes[0] : null
      
    case 'Products/Services':
      const products = parseJsonField(businessType.exampleProducts)
      return products.length > 0 ? products[0] : null
      
    case 'Operating Hours':
      return businessType.typicalOperatingHours || null
      
    default:
      return null
  }
}

function getEssentialFunctionsSuggestions(fieldName: string, businessType: any, parseJsonField: Function): string[] {
  const essentialFunctions = parseJsonField(businessType.essentialFunctions)
  
  if (fieldName === 'Core Functions') {
    return essentialFunctions.core || []
  } else if (fieldName === 'Support Functions') {
    return essentialFunctions.support || []
  } else if (fieldName === 'Administrative Functions') {
    return essentialFunctions.administrative || []
  }
  
  return []
}

function getEssentialFunctionsPreFill(fieldName: string, businessType: any, parseJsonField: Function): any {
  const essentialFunctions = parseJsonField(businessType.essentialFunctions)
  
  if (fieldName === 'Essential Functions' && essentialFunctions) {
    return {
      core: essentialFunctions.core || [],
      support: essentialFunctions.support || [],
      administrative: essentialFunctions.administrative || []
    }
  }
  
  return null
}

function getRiskAssessmentSuggestions(fieldName: string, businessType: any, location: any): string[] {
  const suggestions: string[] = []
  
  if (fieldName === 'Planning Measures') {
    // Get common planning measures for this business type
    const hazards = businessType.businessTypeHazards || []
    hazards.forEach((bth: any) => {
      const hazard = bth.hazard
      if (hazard) {
        suggestions.push(`Develop ${hazard.name.toLowerCase()} response procedures`)
        if (hazard.warningTime === 'days') {
          suggestions.push(`Monitor weather alerts and forecasts for ${hazard.name.toLowerCase()}`)
        }
      }
    })
  }
  
  return suggestions.slice(0, 3)
}

function getRiskAssessmentPreFill(fieldName: string, businessType: any): any {
  // Risk assessment pre-fill would typically come from the smart recommendations API
  // This is more for structural pre-filling rather than risk calculation
  return null
}

function getStrategiesSuggestions(fieldName: string, businessType: any, location: any): string[] {
  const suggestions: string[] = []
  
  // Get strategies based on business type vulnerabilities
  const hazards = businessType.businessTypeHazards || []
  hazards.forEach((bth: any) => {
    const hazard = bth.hazard
    if (hazard && bth.riskLevel === 'high') {
      suggestions.push(`Implement preventive measures for ${hazard.name.toLowerCase()}`)
      suggestions.push(`Create response plan for ${hazard.name.toLowerCase()} incidents`)
    }
  })
  
  return suggestions.slice(0, 3)
}

function getResourcesSuggestions(fieldName: string, businessType: any, parseJsonField: Function): string[] {
  const minimumEquipment = parseJsonField(businessType.minimumEquipment)
  const minimumUtilities = parseJsonField(businessType.minimumUtilities)
  
  switch (fieldName) {
    case 'Equipment':
      return minimumEquipment.slice(0, 3)
    case 'Utilities':
      return minimumUtilities.slice(0, 3)
    case 'Staff':
      return businessType.minimumStaff ? [businessType.minimumStaff] : []
    case 'Space':
      return businessType.minimumSpace ? [businessType.minimumSpace] : []
    default:
      return []
  }
}

function getResourcesPreFill(fieldName: string, businessType: any, parseJsonField: Function): any {
  switch (fieldName) {
    case 'Minimum Equipment':
      return parseJsonField(businessType.minimumEquipment)
    case 'Minimum Utilities':
      return parseJsonField(businessType.minimumUtilities)
    case 'Minimum Staff':
      return businessType.minimumStaff || null
    case 'Minimum Space':
      return businessType.minimumSpace || null
    default:
      return null
  }
}

function getGeneralSuggestions(fieldName: string, businessType: any, parseJsonField: Function): string[] {
  // Fallback general suggestions based on business type
  return [
    `${businessType.name} specific example for ${fieldName}`,
    `Industry standard practice for ${businessType.category}`,
    `Common approach in Caribbean ${businessType.category} businesses`
  ]
}

function getLocationContext(fieldName: string, location: any, businessType: any): string | null {
  const context: string[] = []
  
  if (location.isCoastal) {
    context.push('coastal area considerations')
  }
  
  if (location.isUrban) {
    context.push('urban business environment')
  }
  
  if (location.parish) {
    context.push(`${location.parish} specific factors`)
  }
  
  return context.length > 0 
    ? `Consider ${context.join(', ')} for ${businessType.name} operations`
    : null
} 