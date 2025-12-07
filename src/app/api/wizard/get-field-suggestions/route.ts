import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fieldName, businessTypeId, step, countryCode, parish, locale = 'en' } = body

    if (!fieldName || !businessTypeId) {
      return NextResponse.json(
        { error: 'fieldName and businessTypeId are required' },
        { status: 400 }
      )
    }

    // Get business type with all relevant data from the BusinessType table
    const businessTypeRaw = await (prisma as any).businessType.findUnique({
      where: { businessTypeId },
      include: {
        BusinessRiskVulnerability: {
          where: { isActive: true }
        },
        BusinessTypeTranslation: {
          where: { locale }
        }
      }
    })

    if (!businessTypeRaw) {
      return NextResponse.json(
        { error: 'Business type not found' },
        { status: 404 }
      )
    }

    // Merge translation data if available
    const translation = businessTypeRaw.BusinessTypeTranslation?.[0] || {}
    const businessType = {
      ...businessTypeRaw,
      name: translation.name || businessTypeRaw.name,
      description: translation.description || businessTypeRaw.description,
      exampleBusinessPurposes: translation.exampleBusinessPurposes || businessTypeRaw.exampleBusinessPurposes,
      exampleProducts: translation.exampleProducts || businessTypeRaw.exampleProducts,
      exampleKeyPersonnel: translation.exampleKeyPersonnel || businessTypeRaw.exampleKeyPersonnel,
      exampleCustomerBase: translation.exampleCustomerBase || businessTypeRaw.exampleCustomerBase,
      minimumEquipment: translation.minimumEquipment || businessTypeRaw.minimumEquipment
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

    // Parse JSON fields safely - handles both plain arrays and multilingual objects
    const parseJsonField = (field: string | null): any => {
      if (!field) return []
      try {
        return JSON.parse(field)
      } catch (e) {
        return []
      }
    }

    // Extract localized text from multilingual field
    const getLocalized = (field: any, locale: string = 'en'): string => {
      if (!field) return ''
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field)
          return parsed[locale] || parsed.en || field
        } catch {
          return field
        }
      }
      if (typeof field === 'object' && field[locale]) {
        return field[locale]
      }
      return field.en || field
    }

    // Extract localized array from multilingual array field
    const getLocalizedArray = (field: string | null, locale: string = 'en'): string[] => {
      if (!field) return []
      try {
        const parsed = JSON.parse(field)
        if (Array.isArray(parsed)) {
          // Handle array of multilingual objects: [{en: "...", es: "...", fr: "..."}, ...]
          return parsed.map((item: any) => {
            if (typeof item === 'string') return item
            return item[locale] || item.en || ''
          }).filter(Boolean)
        }
        return []
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
    console.log('[DEBUG] Step:', step, 'Field:', fieldName, 'Locale:', locale)
    console.log('[DEBUG] BusinessType:', businessType.businessTypeId, 'Has purposes:', !!businessType.exampleBusinessPurposes)

    switch (step) {
      case 'BUSINESS_OVERVIEW':
        const suggestions_raw = getBusinessOverviewSuggestions(normalizeLabel(fieldName), businessType, normalizeLocation(location), getLocalizedArray, locale)
        console.log('[DEBUG] Raw suggestions:', suggestions_raw)
        suggestions.examples = dedupe(suggestions_raw)
        console.log('[DEBUG] Deduped suggestions:', suggestions.examples)
        suggestions.preFillValue = getBusinessOverviewPreFill(normalizeLabel(fieldName), businessType, getLocalizedArray, locale)
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
          getResourcesSuggestions(normalizeLabel(fieldName), businessType, getLocalizedArray, locale)
        )
        suggestions.preFillValue = getResourcesPreFill(normalizeLabel(fieldName), businessType, getLocalizedArray, locale)
        break

      default:
        // Fallback to general business type examples
        suggestions.examples = dedupe(getGeneralSuggestions(normalizeLabel(fieldName), businessType, getLocalized, locale))
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
function getBusinessOverviewSuggestions(fieldName: string, businessType: any, location: any, getLocalizedArray: Function, locale: string): string[] {
  const examples: string[] = []

  switch (fieldName) {
    case 'Business Purpose':
      const purposes = getLocalizedArray(businessType.exampleBusinessPurposes, locale)
      examples.push(...purposes.slice(0, 3))
      break

    case 'Products and Services':
    case 'Products/Services':
      const products = getLocalizedArray(businessType.exampleProducts, locale)
      examples.push(...products.slice(0, 3))
      break

    case 'Key Personnel Involved':
    case 'Key Personnel':
      const personnel = getLocalizedArray(businessType.exampleKeyPersonnel, locale)
      examples.push(...personnel.slice(0, 3))
      break

    case 'Customer Base':
      const customers = getLocalizedArray(businessType.exampleCustomerBase, locale)
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
      if (businessType.operatingHours) {
        examples.push(businessType.operatingHours)
      }
      // Add regional variations
      if (location) {
        examples.push(`Typical ${location.countryCode} business hours: 8:00 AM - 6:00 PM`)
        examples.push(`Extended hours for tourist areas: 7:00 AM - 9:00 PM`)
      }
      break

    case 'Minimum Resource Requirements':
    case 'Minimum Resources':
      const equipment = getLocalizedArray(businessType.minimumEquipment, locale)
      examples.push(...equipment.slice(0, 3))
      break
  }

  return examples.filter(Boolean)
}

function getBusinessOverviewPreFill(fieldName: string, businessType: any, getLocalizedArray: Function, locale: string): string | null {
  switch (fieldName) {
    case 'Business Purpose':
      const purposes = getLocalizedArray(businessType.exampleBusinessPurposes, locale)
      return purposes.length > 0 ? purposes[0] : null

    case 'Products and Services':
    case 'Products/Services':
      const products = getLocalizedArray(businessType.exampleProducts, locale)
      return products.length > 0 ? products[0] : null

    case 'Operating Hours':
      return businessType.operatingHours || null

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
    const vulnerabilities = businessType.BusinessRiskVulnerability || []
    vulnerabilities.forEach((rv: any) => {
      if (rv.vulnerabilityLevel >= 7) {
        const riskName = rv.riskType.replace(/([A-Z])/g, ' $1').trim().toLowerCase()
        suggestions.push(`Develop ${riskName} response procedures`)
        suggestions.push(`Monitor alerts and forecasts for ${riskName}`)
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
  const vulnerabilities = businessType.BusinessRiskVulnerability || []
  vulnerabilities.forEach((rv: any) => {
    if (rv.vulnerabilityLevel >= 7) {
      const riskName = rv.riskType.replace(/([A-Z])/g, ' $1').trim().toLowerCase()
      suggestions.push(`Implement preventive measures for ${riskName}`)
      suggestions.push(`Create response plan for ${riskName} incidents`)
    }
  })

  return suggestions.slice(0, 3)
}

function getResourcesSuggestions(fieldName: string, businessType: any, getLocalizedArray: Function, locale: string): string[] {
  const minimumEquipment = getLocalizedArray(businessType.minimumEquipment, locale)

  switch (fieldName) {
    case 'Equipment':
    case 'Minimum Resource Requirements':
    case 'Minimum Resources':
      return minimumEquipment.slice(0, 3)
    case 'Utilities':
      return []
    case 'Staff':
      return businessType.typicalEmployees ? [businessType.typicalEmployees] : []
    case 'Space':
      return []
    default:
      return []
  }
}

function getResourcesPreFill(fieldName: string, businessType: any, getLocalizedArray: Function, locale: string): any {
  switch (fieldName) {
    case 'Minimum Equipment':
    case 'Minimum Resource Requirements':
    case 'Minimum Resources':
      return getLocalizedArray(businessType.minimumEquipment, locale)
    case 'Staff':
      return businessType.typicalEmployees || null
    default:
      return null
  }
}

function getGeneralSuggestions(fieldName: string, businessType: any, getLocalized: Function, locale: string): string[] {
  // Fallback general suggestions based on business type
  const name = getLocalized(businessType.name, locale)
  return [
    `${name} specific example for ${fieldName}`,
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
}   
 
 
