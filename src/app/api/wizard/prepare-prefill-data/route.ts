import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDynamicPreFillData } from '@/services/dynamicPreFillService'
import { getLocalizedText } from '@/utils/localizationUtils'
import { applyMultipliers, convertSimplifiedInputs, convertLegacyCharacteristics } from '@/services/multiplierService'
import type { Locale } from '@/i18n/config'

// Import translation files
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import frMessages from '@/messages/fr.json'

// Helper to get translations
const getTranslation = (key: string, locale: Locale): string => {
  const messages = locale === 'es' ? esMessages : locale === 'fr' ? frMessages : enMessages
  const keys = key.split('.')
  let value: any = messages
  for (const k of keys) {
    value = value?.[k]
  }
  return typeof value === 'string' ? value : key
}

// ============================================================================
// SMART RISK PRE-SELECTION THRESHOLDS
// ============================================================================
// These thresholds determine which risks are automatically pre-selected for users
// vs. which are only made available for manual selection
const RISK_THRESHOLDS = {
  // 3-TIER RISK CATEGORIZATION SYSTEM
  // Tier 1: HIGHLY RECOMMENDED (Critical - Always pre-select)
  HIGHLY_RECOMMENDED: 7.0, // Score >= 7.0 - Severe risks that require immediate attention
  
  // Tier 2: RECOMMENDED (Important - Pre-select)
  RECOMMENDED: 5.0, // Score >= 5.0 and < 7.0 - Significant risks to prepare for
  
  // Tier 3: AVAILABLE (Optional - Available but not pre-selected)
  // Score < 5.0 - Lower priority risks, user can add if relevant
  
  // For backwards compatibility
  MIN_PRESELECT_SCORE: 5.0, // Updated: Only pre-select if final score > 5.0
  FORCE_PRESELECT_SCORE: 7.0, // Always show if >= 7.0 (high+)
}

// ============================================================================
// HELPER FUNCTIONS FOR SMART RISK PRE-SELECTION
// ============================================================================

/**
 * Determines the risk level category based on final calculated score
 * @param finalScore - The final risk score (0-10 scale)
 * @returns Risk level string (very_high, high, medium, low, very_low)
 */
function determineRiskLevel(finalScore: number): string {
  if (finalScore >= 8) return 'very_high'
  if (finalScore >= 6) return 'high'
  if (finalScore >= 4) return 'medium'
  if (finalScore >= 2) return 'low'
  return 'very_low'
}

/**
 * Calculates the final risk score including base calculation and multipliers
 * @param locationRiskLevel - Location-specific risk level (0-10)
 * @param vulnerability - Business type vulnerability data
 * @param riskType - The type of risk being calculated
 * @param userChars - User business characteristics for multiplier application
 * @returns Promise<number> - Final calculated risk score (0-10 scale)
 */
async function calculateFinalRiskScore(
  locationRiskLevel: number,
  vulnerability: any,
  riskType: string,
  userChars: any
): Promise<number> {
  // Base Score = (Location Risk × 0.6) + (Business Vulnerability × 0.4)
  const businessVulnerability = vulnerability.vulnerabilityLevel || 5
  const baseScore = (locationRiskLevel * 0.6) + (businessVulnerability * 0.4)
  
  // Apply multipliers from database
  const multiplierResult = await applyMultipliers(baseScore, riskType, userChars)
  
  // Cap at 10 to keep on standard scale
  return Math.min(10, multiplierResult.finalScore)
}

/**
 * Determines risk tier and pre-selection status based on final score
 * @param finalScore - The final calculated risk score
 * @param hasLocationData - Whether location data exists for this risk
 * @param locationRiskLevel - The raw location risk level
 * @returns Object with tier, category, and preSelect status
 */
function categorizeRisk(
  finalScore: number,
  hasLocationData: boolean,
  locationRiskLevel: number | null
): { tier: number, category: string, preSelect: boolean, userLabel: string } {
  // CASE 1: No location data - always available tier
  if (!hasLocationData || locationRiskLevel === null || locationRiskLevel === 0) {
    return {
      tier: 3,
      category: 'available',
      preSelect: false,
      userLabel: 'Other Risks - Add if Relevant to Your Business'
    }
  }
  
  // CASE 2: Highly Recommended (Critical) - Score >= 7.0
  if (finalScore >= RISK_THRESHOLDS.HIGHLY_RECOMMENDED) {
    return {
      tier: 1,
      category: 'highly_recommended',
      preSelect: true,
      userLabel: 'Highly Recommended - Critical Risks for Your Business'
    }
  }
  
  // CASE 3: Recommended (Important) - Score >= 5.0 and < 7.0
  if (finalScore >= RISK_THRESHOLDS.RECOMMENDED) {
    return {
      tier: 2,
      category: 'recommended',
      preSelect: true,
      userLabel: 'Recommended - Important Risks to Prepare For'
    }
  }
  
  // CASE 4: Available (Optional) - Score < 5.0
  return {
    tier: 3,
    category: 'available',
    preSelect: false,
    userLabel: 'Other Risks - Add if Relevant to Your Business'
  }
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use categorizeRisk instead
 */
function shouldPreSelectRisk(
  finalScore: number,
  hasLocationData: boolean,
  locationRiskLevel: number | null
): boolean {
  const result = categorizeRisk(finalScore, hasLocationData, locationRiskLevel)
  return result.preSelect
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessTypeId, location, businessCharacteristics, locale = 'en' } = body

    if (!businessTypeId || !location) {
      return NextResponse.json(
        { error: 'businessTypeId and location are required' },
        { status: 400 }
      )
    }
    
    // Check if we have multiplier-based inputs (numeric/boolean from RiskMultiplier wizard questions)
    // Multiplier questions return values in the correct format: numbers (95, 50, 10) and booleans (true, false)
    const hasMultiplierInputs = businessCharacteristics && (
      typeof businessCharacteristics.power_dependency === 'number' ||
      typeof businessCharacteristics.digital_dependency === 'number' ||
      typeof businessCharacteristics.tourism_share === 'number' ||
      typeof businessCharacteristics.physical_asset_intensive === 'boolean' ||
      typeof businessCharacteristics.perishable_goods === 'boolean'
    )
    
    let userChars
    
    if (hasMultiplierInputs) {
      // NEW MULTIPLIER-BASED INPUTS: Use directly (already in correct format from RiskMultiplier wizard questions)
      console.log('✅ Using multiplier-based inputs (direct from wizard questions)')
      userChars = {
        // Location characteristics (from location selection)
        location_coastal: businessCharacteristics.location_coastal || location.nearCoast || false,
        location_urban: businessCharacteristics.location_urban || location.urbanArea || false,
        location_flood_prone: businessCharacteristics.location_flood_prone || false,
        
        // Direct numeric/boolean values from multiplier wizard questions
        power_dependency: businessCharacteristics.power_dependency,
        digital_dependency: businessCharacteristics.digital_dependency,
        tourism_share: businessCharacteristics.tourism_share,
        physical_asset_intensive: businessCharacteristics.physical_asset_intensive,
        perishable_goods: businessCharacteristics.perishable_goods,
        just_in_time_inventory: businessCharacteristics.just_in_time_inventory,
        seasonal_business: businessCharacteristics.seasonal_business,
        supply_chain_complex: businessCharacteristics.supply_chain_complex,
        own_building: businessCharacteristics.own_building,
        
        // Additional fields (set defaults if not provided)
        local_customer_share: businessCharacteristics.local_customer_share || 50,
        export_share: businessCharacteristics.export_share || 5,
        water_dependency: businessCharacteristics.water_dependency || 30,
        significant_inventory: businessCharacteristics.significant_inventory !== undefined 
          ? businessCharacteristics.significant_inventory 
          : !businessCharacteristics.just_in_time_inventory
      }
    } else {
      // LEGACY: Old slider-based or simplified inputs
      const hasSimplifiedInputs = businessCharacteristics?.customerBase !== undefined
      
      if (hasSimplifiedInputs) {
        console.log('📝 Using simplified question-based inputs (legacy)')
        userChars = convertSimplifiedInputs({
          customerBase: businessCharacteristics.customerBase,
          powerDependency: businessCharacteristics.powerDependency,
          digitalDependency: businessCharacteristics.digitalDependency,
          importsFromOverseas: businessCharacteristics.importsFromOverseas,
          sellsPerishable: businessCharacteristics.sellsPerishable,
          minimalInventory: businessCharacteristics.minimalInventory,
          expensiveEquipment: businessCharacteristics.expensiveEquipment,
          isCoastal: location.nearCoast,
          isUrban: location.urbanArea
        })
      } else {
        console.log('📊 Using legacy slider-based inputs (backwards compatibility)')
        const legacyChars = {
          tourismDependency: businessCharacteristics?.tourismDependency || 5,
          digitalDependency: businessCharacteristics?.digitalDependency || 5,
          physicalAssetIntensity: businessCharacteristics?.physicalAssetIntensity || 5,
          supplyChainComplexity: businessCharacteristics?.supplyChainComplexity || 5,
          seasonalityFactor: businessCharacteristics?.seasonalityFactor || 5,
          isCoastal: businessCharacteristics?.isCoastal !== undefined ? businessCharacteristics.isCoastal : location.nearCoast,
          isUrban: businessCharacteristics?.isUrban !== undefined ? businessCharacteristics.isUrban : location.urbanArea
        }
        userChars = convertLegacyCharacteristics(legacyChars)
      }
    }
    
    console.log('🎯 Final business characteristics for multipliers:', userChars)

    // Get business type with all related data
    const businessType = await (prisma as any).businessType.findUnique({
      where: { businessTypeId },
      include: {
        riskVulnerabilities: true
      }
    })

    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type not found' },
        { status: 404 }
      )
    }
    
    console.log('📊 Business Type Characteristics:', {
      name: businessType.name,
      touristDependency: businessType.touristDependency,
      digitalDependency: businessType.digitalDependency,
      physicalAssetIntensity: businessType.physicalAssetIntensity,
      seasonalityFactor: businessType.seasonalityFactor,
      supplyChainComplexity: businessType.supplyChainComplexity
    })

    // Get location data from AdminUnit table (new system)
    let locationData = null
    let parishName = '' // Initialize as empty string
    
    if (location.parish || location.adminUnitId) {
      console.log('🔍 prepare-prefill-data: Looking up admin unit:', { name: location.parish, id: location.adminUnitId })
      
      // First try to find by adminUnitId if provided (most reliable)
      if (location.adminUnitId) {
        locationData = await (prisma as any).adminUnit.findFirst({
          where: {
            id: location.adminUnitId
          },
          include: {
            adminUnitRisk: true
          }
        })
        
        if (locationData) {
          parishName = locationData.name
          console.log('✅ prepare-prefill-data: Found admin unit by ID:', parishName)
        }
      }
      
      // If not found by ID, try to find by name
      if (!locationData && location.parish) {
        locationData = await (prisma as any).adminUnit.findFirst({
          where: {
            name: location.parish
          },
          include: {
            adminUnitRisk: true
          }
        })
        
        if (locationData) {
          parishName = locationData.name
          console.log('✅ prepare-prefill-data: Found admin unit by name:', parishName)
        } else {
          console.log('❌ prepare-prefill-data: Admin unit not found in database')
          parishName = location.parish // Use the provided value as fallback
        }
      }
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

    // Build comprehensive pre-fill data package
    const localizedName = getLocalizedText(businessType.name, locale as Locale)
    const localizedDescription = getLocalizedText(businessType.description, locale as Locale)
    
    const preFillData: any = {
      industry: {
        id: businessType.businessTypeId,
        name: localizedName,
        localName: localizedName,
        category: businessType.category,
        description: localizedDescription
      },
      location: {
        country: location.country,
        countryCode: location.countryCode,
        parish: parishName, // Use the resolved parish name instead of ID
        region: location.region,
        nearCoast: location.nearCoast || false,
        urbanArea: location.urbanArea || false
      },
      businessProfile: {
        dependencies: {}, // BusinessType has different dependency structure
        vulnerabilityMatrix: businessType.riskVulnerabilities?.map((rv: any) => ({
          riskType: rv.riskType,
          vulnerabilityLevel: rv.vulnerabilityLevel,
          impactSeverity: rv.impactSeverity
        })) || [],
        operationalThresholds: {},
        typicalOperatingHours: businessType.operatingHours || '',
        minimumStaff: businessType.typicalEmployees || '',
        minimumSpace: '' // Not available in BusinessType model
      },
      preFilledFields: {
        BUSINESS_OVERVIEW: {
          'Business Purpose': `Professional ${localizedName.toLowerCase()} business providing quality services`,
          'Products and Services': `${localizedName} services`,
          'Operating Hours': businessType.operatingHours || '9:00 AM - 5:00 PM',
          'Key Personnel Involved': `${localizedName} Manager, Staff`,
          'Customer Base': 'Local customers and community members'
        },
        ESSENTIAL_FUNCTIONS: {
          'Core Business Operations': ['Customer service', 'Service delivery', 'Quality control'],
          'Staff Management': ['Employee scheduling', 'Training', 'Performance management'],
          'Financial Management': ['Revenue tracking', 'Expense management', 'Cash flow'],
          'Customer Relations': ['Customer service', 'Feedback handling', 'Marketing'],
          'Operational Support': ['Inventory management', 'Equipment maintenance', 'Facility management']
        },
        // RISK_ASSESSMENT and STRATEGIES will be appended below via dynamic analysis
      },
      contextualExamples: {
        BUSINESS_OVERVIEW: {
          'Business Purpose': [`Professional ${localizedName.toLowerCase()} business providing quality services`],
          'Products and Services': [`${localizedName} services`],
          'Key Personnel Involved': [`${localizedName} Manager`, 'Staff'],
          'Customer Base': ['Local customers', 'Community members', 'Regular clients']
        },
        ESSENTIAL_FUNCTIONS: {}
      },
      hazards: businessType.riskVulnerabilities?.map((rv: any) => ({
        hazardId: rv.riskType,
        hazardName: rv.riskType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        riskLevel: rv.vulnerabilityLevel > 3 ? 'high' : rv.vulnerabilityLevel > 2 ? 'medium' : 'low',
        frequency: 'possible',
        impact: rv.impactSeverity > 3 ? 'major' : 'moderate',
        seasonalPattern: 'year-round',
        warningTime: 'hours',
        geographicScope: 'localized'
      })) || [],
      locationRisks: locationData?.adminUnitRisk ? [
        // Only include risks that have been explicitly set (> 0)
        ...(locationData.adminUnitRisk.hurricaneLevel > 0 ? [{
          hazardId: 'hurricane',
          hazardName: 'Hurricane',
          locationRiskLevel: locationData.adminUnitRisk.hurricaneLevel > 3 ? 'high' : 'medium',
          notes: locationData.adminUnitRisk.hurricaneNotes || ''
        }] : []),
        ...(locationData.adminUnitRisk.floodLevel > 0 ? [{
          hazardId: 'flood',
          hazardName: 'Flooding',
          locationRiskLevel: locationData.adminUnitRisk.floodLevel > 3 ? 'high' : 'medium',
          notes: locationData.adminUnitRisk.floodNotes || ''
        }] : []),
        ...(locationData.adminUnitRisk.earthquakeLevel > 0 ? [{
          hazardId: 'earthquake',
          hazardName: 'Earthquake',
          locationRiskLevel: locationData.adminUnitRisk.earthquakeLevel > 3 ? 'high' : 'medium',
          notes: locationData.adminUnitRisk.earthquakeNotes || ''
        }] : []),
        ...(locationData.adminUnitRisk.droughtLevel > 0 ? [{
          hazardId: 'drought',
          hazardName: 'Drought',
          locationRiskLevel: locationData.adminUnitRisk.droughtLevel > 3 ? 'high' : 'medium',
          notes: locationData.adminUnitRisk.droughtNotes || ''
        }] : []),
        ...(locationData.adminUnitRisk.landslideLevel > 0 ? [{
          hazardId: 'landslide',
          hazardName: 'Landslide',
          locationRiskLevel: locationData.adminUnitRisk.landslideLevel > 3 ? 'high' : 'medium',
          notes: locationData.adminUnitRisk.landslideNotes || ''
        }] : []),
        ...(locationData.adminUnitRisk.powerOutageLevel > 0 ? [{
          hazardId: 'power_outage',
          hazardName: 'Power Outage',
          locationRiskLevel: locationData.adminUnitRisk.powerOutageLevel > 3 ? 'high' : 'medium',
          notes: locationData.adminUnitRisk.powerOutageNotes || ''
        }] : [])
      ] : [],
      riskPreview: {
        highRiskHazards: businessType.riskVulnerabilities?.filter((rv: any) => rv.vulnerabilityLevel > 3)
          .map((rv: any) => rv.riskType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())) || [],
        totalRisks: businessType.riskVulnerabilities?.length || 0,
        locationModifiers: locationData?.adminUnitRisk ? 2 : 0
      },
      locationWarnings: generateLocationWarnings(location, locationData),
      metadata: {
        businessTypeName: localizedName,
        locationFound: !!locationData,
        dataQuality: calculateDataQuality(businessType, locationData),
        generatedAt: new Date().toISOString()
      }
    }

    // Generate comprehensive risk assessment using business vulnerabilities + parish risks
    // IMPORTANT: Likelihood = Location Risk (how often it happens), Impact = Business Type (how bad it affects this business)
    // 
    // CRITICAL FIX: We ONLY show risks where admin has explicitly set parish risk data (value > 0)
    // - If parish risk level is 0 or null, we skip that risk entirely
    // - Previously used a default of 5, which incorrectly showed medium risk for all unset parishes
    // - Now: Only Clarendon (or other parishes with data) will show risks; Trelawny (all 0s) shows nothing
    const riskAssessmentMatrix = []
    const identifiedRiskTypes = new Set<string>()
    
    console.log('🎯 Generating risk assessment matrix...')
    
    // Process business type risk vulnerabilities
    if (businessType.riskVulnerabilities) {
      for (const vulnerability of businessType.riskVulnerabilities) {
        const riskType = vulnerability.riskType
        
        // CRITICAL: Normalize risk type to snake_case for consistency
        const normalizedRiskType = riskType.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
        const camelCaseRiskType = riskType.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        
        // Track that we're processing this risk type in ALL formats
        identifiedRiskTypes.add(riskType)
        identifiedRiskTypes.add(normalizedRiskType)
        identifiedRiskTypes.add(camelCaseRiskType)
        
        // STEP 1: Determine LIKELIHOOD from LOCATION risk (how often this hazard occurs in this location)
        let locationRiskLevel = null // null means no data set by admin
        let hasLocationData = false
        
        if (locationData?.adminUnitRisk) {
          const adminRisk = locationData.adminUnitRisk
          
          // Get the location-specific risk level for this hazard type
          // NOTE: We check !== null to differentiate between 0 (explicitly set as no risk) and unset
          // FIRST: Try hardcoded fields for backward compatibility
          switch (riskType) {
            case 'hurricane':
              if (adminRisk.hurricaneLevel !== null && adminRisk.hurricaneLevel !== undefined) {
                locationRiskLevel = adminRisk.hurricaneLevel
                hasLocationData = true
                console.log(`  DEBUG ${riskType}: Found admin unit data, level = ${locationRiskLevel}`)
              }
              break
            case 'flood':
              if (adminRisk.floodLevel !== null && adminRisk.floodLevel !== undefined) {
                locationRiskLevel = adminRisk.floodLevel
                hasLocationData = true
              }
              break
            case 'earthquake':
              if (adminRisk.earthquakeLevel !== null && adminRisk.earthquakeLevel !== undefined) {
                locationRiskLevel = adminRisk.earthquakeLevel
                hasLocationData = true
              }
              break
            case 'drought':
              if (adminRisk.droughtLevel !== null && adminRisk.droughtLevel !== undefined) {
                locationRiskLevel = adminRisk.droughtLevel
                hasLocationData = true
              }
              break
            case 'landslide':
              if (adminRisk.landslideLevel !== null && adminRisk.landslideLevel !== undefined) {
                locationRiskLevel = adminRisk.landslideLevel
                hasLocationData = true
              }
              break
            case 'powerOutage':
            case 'power_outage':
              if (adminRisk.powerOutageLevel !== null && adminRisk.powerOutageLevel !== undefined) {
                locationRiskLevel = adminRisk.powerOutageLevel
                hasLocationData = true
              }
              break
          }
          
          // SECOND: Try dynamic risks from riskProfileJson (cyber_attack, pandemic, etc.)
          if (!hasLocationData && adminRisk.riskProfileJson) {
            try {
              const dynamicRisks = typeof adminRisk.riskProfileJson === 'string' 
                ? JSON.parse(adminRisk.riskProfileJson) 
                : adminRisk.riskProfileJson
              
              // Try both snake_case and camelCase formats (cyber_attack vs cyberAttack)
              const camelCaseKey = riskType.replace(/_([a-z])/g, (g: string) => g[1].toUpperCase())
              const riskData = dynamicRisks[riskType] || dynamicRisks[camelCaseKey]
              
              if (riskData && riskData.level !== null && riskData.level !== undefined) {
                locationRiskLevel = riskData.level
                hasLocationData = true
                console.log(`  DEBUG ${riskType}: Found dynamic parish data from riskProfileJson (${riskData === dynamicRisks[riskType] ? 'snake_case' : 'camelCase'}), level = ${locationRiskLevel}`)
              }
            } catch (error) {
              console.error(`  ⚠️ Failed to parse riskProfileJson for ${riskType}:`, error)
            }
          }
          
          // Only apply modifiers if we have actual location data (not just defaults)
          if (hasLocationData && locationRiskLevel !== null && locationRiskLevel > 0) {
            // Apply coastal/urban environmental modifiers to location risk
            if (riskType === 'hurricane' && location.nearCoast) locationRiskLevel = Math.min(10, locationRiskLevel * 1.2)
            if (riskType === 'flood' && location.nearCoast) locationRiskLevel = Math.min(10, locationRiskLevel * 1.15)
            if ((riskType === 'powerOutage' || riskType === 'power_outage') && location.urbanArea) locationRiskLevel = Math.min(10, locationRiskLevel * 1.1)
          }
        }
        
        // SMART PRE-SELECTION: Calculate final risk score FIRST, then decide if it meets threshold
        // This ensures we only pre-select risks that are actually meaningful for the user
        
        // First check if we have any location data to work with
        if (!hasLocationData || locationRiskLevel === null || locationRiskLevel === 0) {
          // No location data - add as available but not pre-selected
          console.log(`  📋 ${riskType}: AVAILABLE (no location data) - parish level is ${locationRiskLevel || 'not set'}`)
          
            riskAssessmentMatrix.push({
              hazard: riskType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              hazardId: riskType,
              likelihood: 0, // Not applicable for this location
              severity: Math.round(vulnerability.impactSeverity || 5),
              riskScore: 0,
              riskLevel: 'not_applicable',
              isPreSelected: false,
              isAvailable: true,
              source: 'available',
              initialTier: 3, // Always tier 3 for not applicable
              initialRiskScore: 0,
              reasoning: `This risk is not significant in ${parishName || 'this location'} (parish risk level: ${locationRiskLevel || 0}/10). You can manually add it if you believe it applies to your specific situation.`,
              dataSource: {
                locationRisk: `Parish Data: ${locationRiskLevel || 0}/10 (not significant)`,
                businessImpact: `Business Type: ${businessType.name}`,
                status: 'Available for manual selection'
              }
            })
          continue
        }
        
        // Calculate the FINAL risk score (with multipliers) to determine if it meets threshold
        const finalScore = await calculateFinalRiskScore(
          locationRiskLevel,
          vulnerability,
          riskType,
          userChars
        )
        
        // Use smart categorization logic to determine tier and pre-selection
        const riskCategory = categorizeRisk(finalScore, hasLocationData, locationRiskLevel)
        const isPreSelected = riskCategory.preSelect
        
        console.log(`  ⚙️  ${riskType}: locationRisk=${locationRiskLevel}/10, finalScore=${finalScore.toFixed(1)}/10, tier=${riskCategory.tier} (${riskCategory.category}), preSelected=${isPreSelected}`)
        
        if (!isPreSelected) {
          // Risk exists but below threshold - add as available with detailed reasoning
          console.log(`  📋 ${riskType}: AVAILABLE (Tier ${riskCategory.tier}) - final score ${finalScore.toFixed(1)}/10 < ${RISK_THRESHOLDS.RECOMMENDED}`)
          
          riskAssessmentMatrix.push({
            hazard: riskType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            hazardId: riskType,
            likelihood: Math.round(locationRiskLevel),
            severity: Math.round(vulnerability.impactSeverity || 5),
            riskScore: Math.round(finalScore * 10) / 10,
            riskLevel: determineRiskLevel(finalScore),
            isPreSelected: false,
            isAvailable: true,
            source: 'below_threshold',
            riskTier: riskCategory.tier,
            riskCategory: riskCategory.category,
            userLabel: riskCategory.userLabel,
            initialTier: riskCategory.tier, // Store initial tier
            initialRiskScore: Math.round(finalScore * 10) / 10, // Store initial score
            reasoning: `📍 Location risk: ${locationRiskLevel}/10 in ${parishName}\n🏢 Business impact: ${vulnerability.impactSeverity || 5}/10 for ${businessType.name}\n⚖️ Final risk score: ${finalScore.toFixed(1)}/10 - below threshold (${RISK_THRESHOLDS.RECOMMENDED}) for pre-selection\n💡 This risk exists in your area but has lower overall impact on your business type. You can manually select it if you believe it's relevant to your specific situation.`,
            dataSource: {
              locationRisk: `${parishName}: ${locationRiskLevel}/10`,
              businessImpact: `${businessType.name}: ${vulnerability.impactSeverity || 5}/10`,
              finalScore: `${finalScore.toFixed(1)}/10`,
              status: 'Available for manual selection',
              tier: `Tier ${riskCategory.tier}: ${riskCategory.category}`
            }
          })
          continue
        }
        
        // Determine tier label based on score
        let tierLabel = ''
        let tierEmoji = ''
        if (riskCategory.tier === 1) {
          tierLabel = getTranslation('common.highlyRecommended', locale as Locale)
          tierEmoji = '🔴'
        } else if (riskCategory.tier === 2) {
          tierLabel = getTranslation('common.recommendedRisk', locale as Locale)
          tierEmoji = '🟡'
        }
        
        console.log(`  ✅ ${riskType}: ${tierLabel} (Tier ${riskCategory.tier}) - final score ${finalScore.toFixed(1)}/10`)
        
        // STEP 1 OUTPUT: Likelihood = Location Risk (1-10 scale, directly from location data)
        const likelihood = Math.round(locationRiskLevel) // Keep as 1-10 integer
        console.log(`  ${riskType}: Location risk (Likelihood) = ${likelihood}/10`)
        
        // STEP 2: Determine IMPACT/SEVERITY from BUSINESS TYPE (1-10 scale, how badly this affects this business)
        const severity = Math.round(vulnerability.impactSeverity || 5) // 1-10 scale
        console.log(`  ${riskType}: Business impact (Severity) = ${severity}/10`)
        
        // STEP 3 & 4: Calculate base score and multipliers (for detailed reporting)
        // Note: finalScore was already calculated above for threshold check
        const businessVulnerability = vulnerability.vulnerabilityLevel || 5
        const baseScore = (locationRiskLevel * 0.6) + (businessVulnerability * 0.4)
        const multiplierResult = await applyMultipliers(baseScore, riskType, userChars)
        const appliedMultipliers = multiplierResult.appliedMultipliers.map(m => `${m.name} ×${m.factor}`)
        
        console.log(`  ${riskType}: Base = ${baseScore.toFixed(2)}, Multipliers = [${appliedMultipliers.join(', ')}], Final = ${finalScore.toFixed(2)}/10`)
        
        // Determine risk level from final score using helper function
        const riskLevel = determineRiskLevel(finalScore)
        
        // Build detailed calculation explanation
        const calculationSteps = []
        const t = (key: string) => getTranslation(key, locale as Locale)
        calculationSteps.push(`${tierEmoji} ${tierLabel}: ${t('common.riskRequiresAttention')}`)
        calculationSteps.push(`📍 ${t('common.locationRiskLabel')}: ${likelihood}/10 (${location.parish || location.country} - ${t('common.fromAdminData')})`)
        calculationSteps.push(`🏢 ${t('common.businessImpactLabel')}: ${severity}/10 (${businessType.name} - ${t('common.fromAdminData')})`)
        calculationSteps.push(`🧮 ${t('common.baseScoreLabel')}: (${likelihood} × 0.6) + (${businessVulnerability} × 0.4) = ${baseScore.toFixed(1)}/10`)
        
        if (appliedMultipliers.length > 0) {
          calculationSteps.push(`⚡ ${t('common.multipliersApplied')}:`)
          multiplierResult.appliedMultipliers.forEach(m => {
            calculationSteps.push(`   • ${m.name} ×${m.factor} - ${m.reasoning}`)
          })
          calculationSteps.push(`📊 ${t('common.finalScoreLabel')}: ${baseScore.toFixed(1)} × multipliers = ${finalScore.toFixed(1)}/10`)
        } else {
          calculationSteps.push(`📊 ${t('common.finalScoreLabel')}: ${finalScore.toFixed(1)}/10 (${t('common.noMultipliersApplied')})`)
        }
        
        // Add tier explanation
        const tierExplanation = riskCategory.tier === 1 ? t('common.criticalPriorityForPlan') : t('common.importantForStrategy')
        calculationSteps.push(`✅ ${tierLabel}: Score ${finalScore.toFixed(1)}/10 - ${tierExplanation}`)
        
        riskAssessmentMatrix.push({
          hazard: riskType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          hazardId: riskType,
          likelihood, // 1-10 scale from admin location data
          severity, // 1-10 scale from admin business type data
          riskScore: Math.round(finalScore * 10) / 10, // Final calculated score 1-10
          riskLevel,
          isPreSelected: true, // Pre-selected based on tier
          isAvailable: true,
          source: 'combined',
          isCalculated: true, // CRITICAL: Indicates this is a calculated risk with multiplier data
          riskTier: riskCategory.tier,
          riskCategory: riskCategory.category,
          userLabel: riskCategory.userLabel,
          initialTier: riskCategory.tier, // CRITICAL: Store initial tier to prevent card jumping
          initialRiskScore: Math.round(finalScore * 10) / 10, // Store initial score for reference
          baseScore: Math.round(baseScore * 10) / 10,
          appliedMultipliers: appliedMultipliers.join(', '),
          reasoning: calculationSteps.join('\n'),
          // Additional transparency fields
          dataSource: {
            locationRisk: `Admin Data (${parishName || location.country})`,
            businessImpact: `Admin Business Type Data (${businessType.name})`,
            multipliers: `Admin Multiplier Rules (${multiplierResult.appliedMultipliers.length} applied)`,
            userInputs: `Coastal: ${location.nearCoast ? 'Yes' : 'No'}, Urban: ${location.urbanArea ? 'Yes' : 'No'}`,
            tier: `Tier ${riskCategory.tier}: ${riskCategory.category}`
          }
        })
      }
    }
    
    // STEP 5: Add admin unit-specific risks that aren't in business type vulnerabilities
    // This allows admin to set risks for an admin unit that apply regardless of business type
    // IMPORTANT: Now supports DYNAMIC risk types from riskProfileJson (cyber_attack, pandemic, etc.)
    if (locationData?.adminUnitRisk) {
      const adminRisk = locationData.adminUnitRisk
      
      // Start with hardcoded fields for backward compatibility
      const allAdminRisks: Array<{ type: string, level: number, notes: string }> = [
        { type: 'hurricane', level: adminRisk.hurricaneLevel, notes: adminRisk.hurricaneNotes },
        { type: 'flood', level: adminRisk.floodLevel, notes: adminRisk.floodNotes },
        { type: 'earthquake', level: adminRisk.earthquakeLevel, notes: adminRisk.earthquakeNotes },
        { type: 'drought', level: adminRisk.droughtLevel, notes: adminRisk.droughtNotes },
        { type: 'landslide', level: adminRisk.landslideLevel, notes: adminRisk.landslideNotes },
        { type: 'powerOutage', level: adminRisk.powerOutageLevel, notes: adminRisk.powerOutageNotes }
      ]
      
      // Add DYNAMIC risks from riskProfileJson (supports unlimited risk types like cyber_attack, pandemic, etc.)
      if (adminRisk.riskProfileJson) {
        try {
          const dynamicRisks = typeof adminRisk.riskProfileJson === 'string' 
            ? JSON.parse(adminRisk.riskProfileJson) 
            : adminRisk.riskProfileJson
          
          if (dynamicRisks && typeof dynamicRisks === 'object') {
            console.log(`  🔍 Found dynamic risks in riskProfileJson:`, Object.keys(dynamicRisks))
            
            Object.entries(dynamicRisks).forEach(([riskKey, riskData]: [string, any]) => {
              // Skip metadata fields
              if (['lastUpdated', 'updatedBy'].includes(riskKey)) return
              
              // Normalize risk key to snake_case for consistency (cyberAttack → cyber_attack)
              const normalizedKey = riskKey.replace(/([A-Z])/g, '_$1').toLowerCase()
              
              // Skip if already in hardcoded list (check both formats)
              const alreadyIncluded = allAdminRisks.some(r => 
                r.type === riskKey || r.type === normalizedKey
              )
              if (alreadyIncluded) return
              
              // Add dynamic risk (use normalized snake_case key)
              if (riskData && typeof riskData === 'object' && riskData.level !== undefined) {
                allAdminRisks.push({
                  type: normalizedKey,
                  level: riskData.level || 0,
                  notes: riskData.notes || ''
                })
                console.log(`  ✅ Added dynamic admin unit risk: ${riskKey} → ${normalizedKey} (level ${riskData.level})`)
              }
            })
          }
        } catch (error) {
          console.error('  ⚠️ Failed to parse riskProfileJson:', error)
        }
      }
      
      for (const adminRiskItem of allAdminRisks) {
        // CRITICAL FIX: Normalize to snake_case for consistent duplicate detection
        // Business types use camelCase (economicDownturn), admin uses snake_case (economic_downturn)
        const normalizedType = adminRiskItem.type.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
        const camelCaseType = adminRiskItem.type.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        
        // Check if this risk was already processed in ANY format
        const alreadyProcessed = identifiedRiskTypes.has(adminRiskItem.type) || 
                                 identifiedRiskTypes.has(normalizedType) ||
                                 identifiedRiskTypes.has(camelCaseType)
        
        if (!alreadyProcessed && adminRiskItem.level > 0) {
          console.log(`  🆕 ${adminRiskItem.type}: Admin unit-only risk (not in business type) - level ${adminRiskItem.level}/10`)
          
          // Mark this risk type as identified in ALL formats to prevent future duplicates
          identifiedRiskTypes.add(adminRiskItem.type)
          identifiedRiskTypes.add(normalizedType)
          identifiedRiskTypes.add(camelCaseType)
          
          // Convert admin unit level to likelihood
          let adminLikelihoodScore = 3
          if (adminRiskItem.level >= 9) adminLikelihoodScore = 5
          else if (adminRiskItem.level >= 7) adminLikelihoodScore = 4
          else if (adminRiskItem.level >= 5) adminLikelihoodScore = 3
          else if (adminRiskItem.level >= 3) adminLikelihoodScore = 2
          else adminLikelihoodScore = 1
          
          const likelihood = adminRiskItem.level
          const severity = 5 // Default moderate severity when no business type data
          const riskScore = (likelihood * 0.6) + (severity * 0.4)
          
          // Use categorizeRisk to determine tier and pre-selection
          const riskCategory = categorizeRisk(riskScore, true, likelihood)
          
          let riskLevel = 'low'
          if (riskScore >= 8) riskLevel = 'very_high'
          else if (riskScore >= 6) riskLevel = 'high'
          else if (riskScore >= 4) riskLevel = 'medium'
          else if (riskScore >= 2) riskLevel = 'low'
          
          // Use NORMALIZED snake_case for consistency with ALL_RISK_TYPES
          const consistentHazardId = normalizedType
          
          riskAssessmentMatrix.push({
            hazard: adminRiskItem.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            hazardId: consistentHazardId, // CRITICAL: Use normalized ID to prevent UI duplicates
            likelihood,
            severity,
            riskScore: Math.round(riskScore * 10) / 10,
            riskLevel,
            isPreSelected: riskCategory.preSelect,
            isAvailable: true,
            source: 'admin_unit_only',
            riskTier: riskCategory.tier,
            riskCategory: riskCategory.category,
            userLabel: riskCategory.userLabel,
            initialTier: riskCategory.tier, // Store initial tier
            initialRiskScore: Math.round(riskScore * 10) / 10, // Store initial score
            reasoning: `📍 This risk is significant in ${parishName} (risk level: ${adminRiskItem.level}/10).\n🏢 No specific business type vulnerability data available - using moderate impact assumption.\n💡 ${adminRiskItem.notes || 'Consider how this risk might affect your specific operations.'}`,
            dataSource: {
              locationRisk: `Admin Unit Data: ${adminRiskItem.level}/10`,
              businessImpact: 'General business impact (no specific data)',
              status: 'Location-specific risk',
              tier: `Tier ${riskCategory.tier}: ${riskCategory.category}`
            }
          })
        }
      }
    }
    
    // CRITICAL: Ensure ALL 13 risk types are included in the matrix
    // Even if they're not in business type vulnerabilities or parish data
    const ALL_RISK_TYPES = [
      'hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage',
      'fire', 'cyberAttack', 'terrorism', 'pandemicDisease', 'economicDownturn', 
      'supplyChainDisruption', 'civilUnrest'
    ]
    
    const existingRiskIds = new Set(riskAssessmentMatrix.map((r: any) => r.hazardId))
    
    for (const riskType of ALL_RISK_TYPES) {
      // Check both camelCase and snake_case variants
      const snakeCaseVariant = riskType.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
      const hasRisk = existingRiskIds.has(riskType) || existingRiskIds.has(snakeCaseVariant)
      
      if (!hasRisk) {
        // Add as available (not pre-selected) risk
        console.log(`  ➕ Adding missing risk type to matrix: ${riskType} (available, not pre-selected)`)
        riskAssessmentMatrix.push({
          hazard: riskType.replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, (l: string) => l.toUpperCase()),
          hazardId: riskType,
          likelihood: 0,
          severity: 5, // Default moderate severity if user selects it
          riskScore: 0,
          riskLevel: 'not_applicable',
          confidence: 'low',
          reasoning: `This risk is available for selection but not pre-selected based on your location or business type.`,
          isPreSelected: false,
          isAvailable: true,
          initialTier: 3, // Always tier 3 for missing risks
          initialRiskScore: 0,
          calculationSteps: []
        })
      }
    }
    
    console.log(`✅ Final risk matrix has ${riskAssessmentMatrix.length} total risks (should be 13)`)
    
    preFillData.preFilledFields.RISK_ASSESSMENT = {
      'Risk Assessment Matrix': riskAssessmentMatrix
    }
    
    // CRITICAL: Update hazards array to include ALL risks from the assessment matrix
    // This ensures the wizard receives all risks (pre-selected + available)
    preFillData.hazards = riskAssessmentMatrix.map((risk: any) => ({
      hazardId: risk.hazardId,
      hazardName: risk.hazard,
      riskLevel: risk.riskLevel,
      frequency: 'possible',
      impact: risk.severity > 5 ? 'major' : 'moderate',
      // Pass through backend calculation data for wizard initialization
      likelihood: risk.likelihood,
      severity: risk.severity,
      riskScore: risk.riskScore,
      isPreSelected: risk.isPreSelected,
      isAvailable: risk.isAvailable,
      reasoning: risk.reasoning,
      // CRITICAL: Pass through multiplier data for transparency
      isCalculated: risk.isCalculated, // Flag to show detailed calculation with multipliers
      baseScore: risk.baseScore,
      appliedMultipliers: risk.appliedMultipliers,
      initialTier: risk.initialTier,
      initialRiskScore: risk.initialRiskScore,
      riskTier: risk.riskTier,
      riskCategory: risk.riskCategory
    }))
    
    console.log(`📋 Prepared ${preFillData.hazards.length} hazards for wizard (${riskAssessmentMatrix.filter((r: any) => r.isPreSelected).length} pre-selected, ${riskAssessmentMatrix.filter((r: any) => !r.isPreSelected).length} available)`)
    
    // ENHANCED STRATEGY RECOMMENDATION LOGIC
    // Build risk-aware strategy recommendations for Caribbean SMEs
    // Based on: risk severity, impact potential, and SME feasibility
    
    // Get high-priority risks for focused strategy recommendations
    const highPriorityRisks = riskAssessmentMatrix
      .filter((r: any) => r.riskScore >= 4 && r.isPreSelected) // Include medium+ risks
      .map((r: any) => ({
        type: r.hazardId,
        score: r.riskScore,
        level: r.riskLevel
      }))
      .sort((a: any, b: any) => b.score - a.score)
    
    console.log(`🎯 High-priority risks for strategy recommendations:`, highPriorityRisks.map(r => `${r.type}:${r.score.toFixed(1)}`).join(', '))
    
    // Get all relevant risk types (including medium priority)
    const allRelevantRisks = Array.from(identifiedRiskTypes)
    
    // Get strategies from database matching identified risks and business type
    const strategiesFromDB = await (prisma as any).riskMitigationStrategy.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: allRelevantRisks.map(riskType => ({
              applicableRisks: {
                contains: riskType
              }
            }))
          },
          {
            OR: [
              { applicableBusinessTypes: { contains: businessTypeId } },
              { applicableBusinessTypes: { contains: businessType.category } },
              { applicableBusinessTypes: { contains: 'all' } },
              { applicableBusinessTypes: null },
              { applicableBusinessTypes: '' }
            ]
          }
        ]
      },
      include: {
        actionSteps: {
          orderBy: { sortOrder: 'asc' },
          include: {
            itemCosts: {
              include: {
                item: true
              }
            }
          }
        }
      }
    })
    
    console.log(`📚 Found ${strategiesFromDB.length} strategies matching business type and risks`)
    
    // Determine SME resource constraints from business type
    const hasBudget = businessType.typicalRevenue ? 
      (businessType.typicalRevenue > 50000 ? 'high' : 
       businessType.typicalRevenue > 20000 ? 'medium' : 'low') : 'low'
    
    const hasStaff = (businessType.typicalEmployees || 0) > 3
    
    console.log(`📊 SME Resources: Budget=${hasBudget}, Staff=${hasStaff}`)
    
    // Create interfaces for scoring
    interface ScoredStrategy {
      strategy: any
      relevanceScore: number      // 0-100: How well it matches their risks
      impactScore: number          // 0-100: How much it reduces risk
      feasibilityScore: number     // 0-100: How doable for small SME
      priorityTier: 'essential' | 'recommended' | 'optional'
      totalScore: number
      reasoning: string            // Why we recommend this
    }
    
    // Score each strategy
    const scoredStrategies: ScoredStrategy[] = strategiesFromDB
      .map((strategy: any) => {
        const applicableRisks = JSON.parse(strategy.applicableRisks || '[]')
        
        // Get matching risks from user's selected risks
        const matchingRisks = highPriorityRisks.filter((risk: any) => 
          applicableRisks.includes(risk.type)
        )
        
        // Skip if strategy doesn't match any selected risks
        if (matchingRisks.length === 0) return null
        
        // 1. RELEVANCE SCORE (40% weight) - Does it address SELECTED risks?
        let relevanceScore = 0
        matchingRisks.forEach((risk: any) => {
          // Weight by risk severity:
          // Critical (≥8): 40 points per risk
          // High (6-7.9): 25 points per risk
          // Medium (4-5.9): 15 points per risk
          // Low (<4): 5 points per risk
          const points = risk.score >= 8 ? 40 : 
                         risk.score >= 6 ? 25 : 
                         risk.score >= 4 ? 15 : 5
          relevanceScore += points
        })
        const normalizedRelevance = Math.min(relevanceScore, 100)
        
        // 2. IMPACT SCORE (35% weight) - How much risk reduction?
        const risksAddressed = matchingRisks.length
        const multiRiskBonus = risksAddressed > 1 ? 15 : 0
        const impactScore = (
          (strategy.effectiveness / 10) * 50 +  // Base effectiveness (0-50)
          (risksAddressed / highPriorityRisks.length) * 35 + // Coverage (0-35)
          multiRiskBonus // Bonus for multi-risk coverage
        )
        
        // 3. FEASIBILITY SCORE (25% weight) - Can this SME do this?
        let feasibilityScore = 100
        
        // Cost penalty for SMEs
        const costPenalty = {
          'low': 0,
          'medium': -15,
          'high': -35,
          'very_high': -50
        }[strategy.implementationCost] || 0
        
        // Time penalty
        const timePenalty = {
          'hours': 0,
          'days': -10,
          'weeks': -25,
          'months': -40
        }[strategy.implementationTime] || 0
        
        // Extra penalty if expensive strategy + low budget SME
        if (hasBudget === 'low' && 
            (strategy.implementationCost === 'high' || 
             strategy.implementationCost === 'very_high')) {
          feasibilityScore -= 30
        }
        
        // Penalty for complex strategies without staff
        if (!hasStaff && (strategy.actionSteps?.length || 0) > 8) {
          feasibilityScore -= 20
        }
        
        // NEW: Consider complexityLevel field from database
        if (strategy.complexityLevel === 'simple') {
          feasibilityScore += 10 // Bonus for simple strategies
        } else if (strategy.complexityLevel === 'advanced' && !hasStaff) {
          feasibilityScore -= 15 // Extra penalty for advanced without staff
        }
        
        // NEW: Consider estimatedTotalHours - penalize time-intensive strategies for small SMEs
        if (strategy.estimatedTotalHours) {
          if (strategy.estimatedTotalHours > 20 && !hasStaff) {
            feasibilityScore -= 10 // Too time-intensive for solo operators
          }
        }
        
        feasibilityScore = Math.max(feasibilityScore + costPenalty + timePenalty, 0)
        
        // 4. CALCULATE TOTAL WEIGHTED SCORE
        let totalScore = (
          normalizedRelevance * 0.40 +
          impactScore * 0.35 +
          feasibilityScore * 0.25
        )
        
        // NEW: Quick Win Bonus - strategies that are fast + high impact get boost
        if (strategy.quickWinIndicator) {
          totalScore += 5 // Bonus for quick wins
          console.log(`  ⚡ Quick Win bonus applied to ${strategy.name}`)
        }
        
        // 5. DETERMINE PRIORITY TIER
        let priorityTier: 'essential' | 'recommended' | 'optional'
        
        // NEW: Check if strategy has requiredForRisks that match user's selected risks
        const requiredForRisks = strategy.requiredForRisks ? JSON.parse(strategy.requiredForRisks) : []
        const isRequiredForUserRisks = requiredForRisks.some((riskId: string) => 
          matchingRisks.some((r: any) => r.type === riskId)
        )
        
        // NEW: Use database selectionTier if explicitly set
        if (strategy.selectionTier) {
          priorityTier = strategy.selectionTier as 'essential' | 'recommended' | 'optional'
          console.log(`  📋 Using DB selectionTier: ${priorityTier} for ${strategy.name}`)
        }
        // Force essential if strategy is required for user's risks
        else if (isRequiredForUserRisks) {
          priorityTier = 'essential'
          console.log(`  ⚠️  Forced essential due to requiredForRisks match: ${strategy.name}`)
        }
        // ESSENTIAL: High relevance + addresses critical/high risks
        else if (normalizedRelevance >= 60 && 
            matchingRisks.some((r: any) => r.score >= 6)) {
          priorityTier = 'essential'
        }
        // RECOMMENDED: Good score + addresses important risks
        else if (totalScore >= 60 && normalizedRelevance >= 40) {
          priorityTier = 'recommended'
        }
        // OPTIONAL: Lower score but still valuable
        else {
          priorityTier = 'optional'
        }
        
        // 6. GENERATE SME-FRIENDLY REASONING
        let reasoning = ''
        const criticalRisks = matchingRisks.filter((r: any) => r.score >= 8)
        const highRisks = matchingRisks.filter((r: any) => r.score >= 6 && r.score < 8)
        
        const formatRiskName = (riskId: string) => 
          riskId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        
        if (priorityTier === 'essential' && criticalRisks.length > 0) {
          reasoning = `This is essential because you have critical ${criticalRisks.map((r: any) => formatRiskName(r.type)).join(' and ')} risk. This strategy directly reduces that danger.`
        } else if (priorityTier === 'essential' && matchingRisks.length > 1) {
          reasoning = `This protects you against ${matchingRisks.length} of your high-priority risks in one go, making it very efficient.`
        } else if (priorityTier === 'recommended') {
          reasoning = `We recommend this because it addresses your ${matchingRisks.map((r: any) => formatRiskName(r.type)).join(' and ')} risk${matchingRisks.length > 1 ? 's' : ''} with proven effectiveness.`
        } else if (feasibilityScore < 50) {
          reasoning = `This would help, but may be challenging due to cost or time requirements. Consider it if you have the resources.`
        } else {
          reasoning = `This adds extra protection for your ${matchingRisks.map((r: any) => formatRiskName(r.type)).join(' and ')} risk${matchingRisks.length > 1 ? 's' : ''}.`
        }
        
        return {
          strategy,
          relevanceScore: normalizedRelevance,
          impactScore,
          feasibilityScore,
          priorityTier,
          totalScore,
          reasoning
        }
      })
      .filter((s): s is ScoredStrategy => s !== null) // Remove null entries
    
    // SMART SELECTION: Don't just take top N, select for coverage and need
    const essential = scoredStrategies.filter(s => s.priorityTier === 'essential')
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5) // Max 5 essential
    
    const recommended = scoredStrategies.filter(s => s.priorityTier === 'recommended')
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5) // Max 5 recommended
    
    const optional = scoredStrategies.filter(s => s.priorityTier === 'optional')
      .filter(s => s.totalScore >= 65) // Only high-scoring optional
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 3) // Max 3 optional
    
    const selectedStrategies = [...essential, ...recommended, ...optional]
    
    console.log(`✅ Selected ${selectedStrategies.length} strategies:`)
    console.log(`   Essential: ${essential.length}, Recommended: ${recommended.length}, Optional: ${optional.length}`)
    
    // Helper function to safely parse JSON fields with fallback
    const parseJSONField = (field: string | null | undefined, fallback: any = null): any => {
      if (!field) return fallback
      try {
        return JSON.parse(field)
      } catch (error) {
        console.warn('Failed to parse JSON field:', field?.substring(0, 50))
        return fallback
      }
    }
    
    // Transform for frontend with COMPLETE new structure including all SME fields
    const detailedStrategies = selectedStrategies.map(({ strategy, priorityTier, reasoning }: ScoredStrategy) => ({
      id: strategy.strategyId,
      strategyId: strategy.strategyId,
      
      // Basic Info
      name: getLocalizedText(strategy.name, locale as Locale) || strategy.name,
      category: strategy.category,
      description: getLocalizedText(strategy.description, locale as Locale) || strategy.description,
      
      // SME-Focused Content (benefit-driven, plain language)
      smeTitle: getLocalizedText(strategy.smeTitle, locale as Locale) || strategy.smeTitle,
      smeSummary: getLocalizedText(strategy.smeSummary, locale as Locale) || strategy.smeSummary,
      smeDescription: getLocalizedText(strategy.smeDescription, locale as Locale) || strategy.smeDescription, // backwards compat
      whyImportant: getLocalizedText(strategy.whyImportant, locale as Locale) || strategy.whyImportant, // backwards compat
      benefitsBullets: parseJSONField(strategy.benefitsBullets, []),
      realWorldExample: getLocalizedText(strategy.realWorldExample, locale as Locale) || strategy.realWorldExample,
      
      // Implementation Details (enhanced)
      implementationCost: strategy.implementationCost,
      costEstimateJMD: strategy.costEstimateJMD,
      timeToImplement: strategy.timeToImplement,
      implementationTime: strategy.implementationTime,
      estimatedTotalHours: strategy.estimatedTotalHours,
      complexityLevel: strategy.complexityLevel || 'moderate',
      effectiveness: strategy.effectiveness,
      roi: strategy.roi,
      priority: strategy.priority,
      quickWinIndicator: strategy.quickWinIndicator || false,
      
      // Wizard Integration (how strategy appears in wizard)
      defaultSelected: strategy.defaultSelected || false,
      selectionTier: strategy.selectionTier || priorityTier, // Use DB value or calculated
      priorityTier, // Alias for backwards compatibility
      requiredForRisks: parseJSONField(strategy.requiredForRisks, []),
      reasoning, // Generated by scoring algorithm
      
      // Guidance (consolidated)
      helpfulTips: parseJSONField(strategy.helpfulTips, []),
      commonMistakes: parseJSONField(strategy.commonMistakes, []),
      successMetrics: parseJSONField(strategy.successMetrics, []),
      
      // Resource-Limited SME Support
      lowBudgetAlternative: getLocalizedText(strategy.lowBudgetAlternative, locale as Locale) || strategy.lowBudgetAlternative,
      diyApproach: getLocalizedText(strategy.diyApproach, locale as Locale) || strategy.diyApproach,
      estimatedDIYSavings: strategy.estimatedDIYSavings,
      
      // BCP Document Integration
      bcpSectionMapping: strategy.bcpSectionMapping,
      bcpTemplateText: getLocalizedText(strategy.bcpTemplateText, locale as Locale) || strategy.bcpTemplateText,
      
      // Personalization (industry and size variants)
      industryVariants: parseJSONField(strategy.industryVariants, {}),
      businessSizeGuidance: parseJSONField(strategy.businessSizeGuidance, {}),
      
      // Keep existing fields
      applicableRisks: parseJSONField(strategy.applicableRisks, []),
      applicableBusinessTypes: parseJSONField(strategy.applicableBusinessTypes, []),
      prerequisites: parseJSONField(strategy.prerequisites, []),
      maintenanceRequirement: strategy.maintenanceRequirement,
      
      // Action Steps with COMPLETE new structure
      actionSteps: strategy.actionSteps.map((step: any) => ({
        id: step.stepId,
        stepId: step.stepId,
        strategyId: step.strategyId,
        
        // Basic Info
        title: getLocalizedText(step.title, locale as Locale) || step.title,
        description: getLocalizedText(step.description, locale as Locale) || step.description,
        smeAction: getLocalizedText(step.smeAction, locale as Locale) || step.smeAction,
        phase: step.phase,
        sortOrder: step.sortOrder,
        
        // SME Context (why this matters)
        whyThisStepMatters: getLocalizedText(step.whyThisStepMatters, locale as Locale) || step.whyThisStepMatters,
        whatHappensIfSkipped: getLocalizedText(step.whatHappensIfSkipped, locale as Locale) || step.whatHappensIfSkipped,
        
        // Timing & Difficulty
        timeframe: step.timeframe,
        estimatedMinutes: step.estimatedMinutes,
        difficultyLevel: step.difficultyLevel || 'medium',
        
        // Resources & Costs
        responsibility: step.responsibility,
        cost: step.estimatedCost,
        estimatedCostJMD: step.estimatedCostJMD,
        resources: parseJSONField(step.resources, []),
        checklist: parseJSONField(step.checklist, []),
        
        // Cost Items (structured costing)
        costItems: step.itemCosts?.map((ic: any) => ({
          id: ic.id,
          itemId: ic.item?.itemId || ic.itemId,
          quantity: ic.quantity,
          notes: ic.customNotes,
          // Include full cost item details for calculation
          costItem: ic.item ? {
            itemId: ic.item.itemId,
            name: ic.item.name,
            description: ic.item.description,
            category: ic.item.category,
            baseUSD: ic.item.baseUSD,
            baseUSDMin: ic.item.baseUSDMin,
            baseUSDMax: ic.item.baseUSDMax,
            unit: ic.item.unit,
            complexity: ic.item.complexity
          } : null
        })) || [],
        
        // Validation & Completion
        howToKnowItsDone: getLocalizedText(step.howToKnowItsDone, locale as Locale) || step.howToKnowItsDone,
        exampleOutput: getLocalizedText(step.exampleOutput, locale as Locale) || step.exampleOutput,
        
        // Dependencies
        dependsOnSteps: parseJSONField(step.dependsOnSteps, []),
        isOptional: step.isOptional || false,
        skipConditions: getLocalizedText(step.skipConditions, locale as Locale) || step.skipConditions,
        
        // Alternatives for resource-limited SMEs
        freeAlternative: getLocalizedText(step.freeAlternative, locale as Locale) || step.freeAlternative,
        lowTechOption: getLocalizedText(step.lowTechOption, locale as Locale) || step.lowTechOption,
        
        // Help Resources
        commonMistakesForStep: parseJSONField(step.commonMistakesForStep, []),
        videoTutorialUrl: step.videoTutorialUrl,
        externalResourceUrl: step.externalResourceUrl
      })).sort((a: any, b: any) => a.sortOrder - b.sortOrder),
      
      // Keep existing recommendationReason for backwards compatibility
      recommendationReason: highPriorityRisks
        .filter((r: any) => parseJSONField(strategy.applicableRisks, []).includes(r.type))
        .map((r: any) => `${r.type.replace(/_/g, ' ')} (${r.level})`)
        .join(', ') || 'General business continuity'
    }))
    
    console.log(`📦 Transformed ${detailedStrategies.length} strategies with complete SME field structure`)
    
    preFillData.preFilledFields.STRATEGIES = {
      'Business Continuity Strategies': detailedStrategies
    }

    return NextResponse.json(preFillData)

  } catch (error) {
    console.error('Error preparing pre-fill data:', error)
    return NextResponse.json(
      { error: 'Failed to prepare pre-fill data' },
      { status: 500 }
    )
  }
}

// Helper function to generate location-specific warnings
function generateLocationWarnings(location: any, locationData: any): string[] {
  const warnings = []

  if (location.nearCoast) {
    warnings.push('⚠️ Coastal location: Increased risk for hurricanes, flooding, and storm surge')
  }

  if (location.urbanArea) {
    warnings.push('🏙️ Urban area: Consider traffic disruption, crime, and supply chain issues')
  }

  if (locationData?.locationHazards?.length > 0) {
    warnings.push(`📍 Location-specific risks identified: ${locationData.locationHazards.length} additional hazards`)
  }

  if (location.countryCode === 'JM' && (location.parish === 'Kingston' || location.parish === 'St. Andrew')) {
    warnings.push('🌪️ Hurricane season (June-November): Enhanced preparation recommended')
  }

  if (!locationData) {
    warnings.push('ℹ️ Limited location data: Using general Caribbean risk profiles')
  }

  return warnings
}

// Helper function to calculate data quality score
function calculateDataQuality(businessType: any, locationData: any): string {
  let score = 0
  let maxScore = 0

  // Business type data quality
  maxScore += 10
  if (businessType.description) score += 2
  if (businessType.category) score += 1
  if (businessType.operatingHours) score += 1
  if (businessType.typicalEmployees) score += 1
  if (businessType.riskVulnerabilities?.length > 0) score += 3
  if (businessType.touristDependency !== undefined) score += 1
  if (businessType.supplyChainComplexity !== undefined) score += 1

  // Location data quality
  maxScore += 5
  if (locationData) score += 2
  if (locationData?.adminUnitRisk) score += 3

  const percentage = (score / maxScore) * 100

  if (percentage >= 80) return 'excellent'
  if (percentage >= 60) return 'good'
  if (percentage >= 40) return 'fair'
  return 'limited'
} 