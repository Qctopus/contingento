import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDynamicPreFillData } from '@/services/dynamicPreFillService'
import { getLocalizedText } from '@/utils/localizationUtils'
import { applyMultipliers, convertSimplifiedInputs, convertLegacyCharacteristics } from '@/services/multiplierService'
import type { Locale } from '@/i18n/config'

// ============================================================================
// SMART RISK PRE-SELECTION THRESHOLDS
// ============================================================================
// These thresholds determine which risks are automatically pre-selected for users
// vs. which are only made available for manual selection
const RISK_THRESHOLDS = {
  // Minimum final risk score (0-10 scale) to pre-select a risk
  // Risks below this threshold are available but not pre-selected
  MIN_PRESELECT_SCORE: 4.0, // Only pre-select if final score >= 4.0 (medium+)
  
  // Force pre-select very high risks regardless of other factors
  // These critical risks should always be highlighted to users
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
 * Determines if a risk should be pre-selected based on final score and thresholds
 * @param finalScore - The final calculated risk score
 * @param hasLocationData - Whether location data exists for this risk
 * @param locationRiskLevel - The raw location risk level
 * @returns boolean - True if risk should be pre-selected
 */
function shouldPreSelectRisk(
  finalScore: number,
  hasLocationData: boolean,
  locationRiskLevel: number | null
): boolean {
  // CASE 1: No location data - never pre-select
  if (!hasLocationData || locationRiskLevel === null || locationRiskLevel === 0) {
    return false
  }
  
  // CASE 2: Very high risk - ALWAYS pre-select (critical risks)
  if (finalScore >= RISK_THRESHOLDS.FORCE_PRESELECT_SCORE) {
    return true
  }
  
  // CASE 3: Meaningful risk level - pre-select if meets threshold
  if (finalScore >= RISK_THRESHOLDS.MIN_PRESELECT_SCORE) {
    return true
  }
  
  // CASE 4: Below threshold - make available but don't pre-select
  return false
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
    
    // Check if we have simplified inputs (new) or legacy slider inputs (old)
    const hasSimplifiedInputs = businessCharacteristics?.customerBase !== undefined
    
    let userChars
    
    if (hasSimplifiedInputs) {
      // New simplified question-based inputs
      console.log('📝 Using simplified question-based inputs')
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
      // Legacy slider-based inputs (backwards compatibility)
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

    // Get location data from Parish table (since that's what's working)
    let locationData = null
    let parishName = '' // Initialize as empty string
    
    if (location.parish) {
      console.log('🔍 prepare-prefill-data: Looking up parish:', location.parish)
      
      // First try to find by ID (most common case from IndustrySelector)
      locationData = await (prisma as any).parish.findFirst({
        where: {
          id: location.parish
        },
        include: {
          parishRisk: true
        }
      })
      
      if (locationData) {
        parishName = locationData.name
        console.log('✅ prepare-prefill-data: Found parish by ID:', parishName)
      } else {
        // If not found by ID, try to find by name (fallback)
        locationData = await (prisma as any).parish.findFirst({
          where: {
            name: location.parish
          },
          include: {
            parishRisk: true
          }
        })
        
        if (locationData) {
          parishName = locationData.name
          console.log('✅ prepare-prefill-data: Found parish by name:', parishName)
        } else {
          console.log('⚠️ prepare-prefill-data: Parish not found, using provided value')
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
      locationRisks: locationData?.parishRisk ? [
        // Only include risks that have been explicitly set (> 0)
        ...(locationData.parishRisk.hurricaneLevel > 0 ? [{
          hazardId: 'hurricane',
          hazardName: 'Hurricane',
          locationRiskLevel: locationData.parishRisk.hurricaneLevel > 3 ? 'high' : 'medium',
          notes: locationData.parishRisk.hurricaneNotes || ''
        }] : []),
        ...(locationData.parishRisk.floodLevel > 0 ? [{
          hazardId: 'flood',
          hazardName: 'Flooding',
          locationRiskLevel: locationData.parishRisk.floodLevel > 3 ? 'high' : 'medium',
          notes: locationData.parishRisk.floodNotes || ''
        }] : []),
        ...(locationData.parishRisk.earthquakeLevel > 0 ? [{
          hazardId: 'earthquake',
          hazardName: 'Earthquake',
          locationRiskLevel: locationData.parishRisk.earthquakeLevel > 3 ? 'high' : 'medium',
          notes: locationData.parishRisk.earthquakeNotes || ''
        }] : []),
        ...(locationData.parishRisk.droughtLevel > 0 ? [{
          hazardId: 'drought',
          hazardName: 'Drought',
          locationRiskLevel: locationData.parishRisk.droughtLevel > 3 ? 'high' : 'medium',
          notes: locationData.parishRisk.droughtNotes || ''
        }] : []),
        ...(locationData.parishRisk.landslideLevel > 0 ? [{
          hazardId: 'landslide',
          hazardName: 'Landslide',
          locationRiskLevel: locationData.parishRisk.landslideLevel > 3 ? 'high' : 'medium',
          notes: locationData.parishRisk.landslideNotes || ''
        }] : []),
        ...(locationData.parishRisk.powerOutageLevel > 0 ? [{
          hazardId: 'power_outage',
          hazardName: 'Power Outage',
          locationRiskLevel: locationData.parishRisk.powerOutageLevel > 3 ? 'high' : 'medium',
          notes: locationData.parishRisk.powerOutageNotes || ''
        }] : [])
      ] : [],
      riskPreview: {
        highRiskHazards: businessType.riskVulnerabilities?.filter((rv: any) => rv.vulnerabilityLevel > 3)
          .map((rv: any) => rv.riskType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())) || [],
        totalRisks: businessType.riskVulnerabilities?.length || 0,
        locationModifiers: locationData?.parishRisk ? 2 : 0
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
        identifiedRiskTypes.add(riskType)
        
        // STEP 1: Determine LIKELIHOOD from LOCATION risk (how often this hazard occurs in this location)
        let locationRiskLevel = null // null means no data set by admin
        let hasLocationData = false
        
        if (locationData?.parishRisk) {
          const parishRisk = locationData.parishRisk
          
          // Get the location-specific risk level for this hazard type
          // NOTE: We check !== null to differentiate between 0 (explicitly set as no risk) and unset
          // FIRST: Try hardcoded fields for backward compatibility
          switch (riskType) {
            case 'hurricane':
              if (parishRisk.hurricaneLevel !== null && parishRisk.hurricaneLevel !== undefined) {
                locationRiskLevel = parishRisk.hurricaneLevel
                hasLocationData = true
                console.log(`  DEBUG ${riskType}: Found parish data, level = ${locationRiskLevel}`)
              }
              break
            case 'flood':
              if (parishRisk.floodLevel !== null && parishRisk.floodLevel !== undefined) {
                locationRiskLevel = parishRisk.floodLevel
                hasLocationData = true
              }
              break
            case 'earthquake':
              if (parishRisk.earthquakeLevel !== null && parishRisk.earthquakeLevel !== undefined) {
                locationRiskLevel = parishRisk.earthquakeLevel
                hasLocationData = true
              }
              break
            case 'drought':
              if (parishRisk.droughtLevel !== null && parishRisk.droughtLevel !== undefined) {
                locationRiskLevel = parishRisk.droughtLevel
                hasLocationData = true
              }
              break
            case 'landslide':
              if (parishRisk.landslideLevel !== null && parishRisk.landslideLevel !== undefined) {
                locationRiskLevel = parishRisk.landslideLevel
                hasLocationData = true
              }
              break
            case 'powerOutage':
            case 'power_outage':
              if (parishRisk.powerOutageLevel !== null && parishRisk.powerOutageLevel !== undefined) {
                locationRiskLevel = parishRisk.powerOutageLevel
                hasLocationData = true
              }
              break
          }
          
          // SECOND: Try dynamic risks from riskProfileJson (cyber_attack, pandemic, etc.)
          if (!hasLocationData && parishRisk.riskProfileJson) {
            try {
              const dynamicRisks = typeof parishRisk.riskProfileJson === 'string' 
                ? JSON.parse(parishRisk.riskProfileJson) 
                : parishRisk.riskProfileJson
              
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
        
        // Use smart threshold logic to determine pre-selection
        const isPreSelected = shouldPreSelectRisk(finalScore, hasLocationData, locationRiskLevel)
        
        console.log(`  ⚙️  ${riskType}: locationRisk=${locationRiskLevel}/10, finalScore=${finalScore.toFixed(1)}/10, threshold=${RISK_THRESHOLDS.MIN_PRESELECT_SCORE}, preSelected=${isPreSelected}`)
        
        if (!isPreSelected) {
          // Risk exists but below threshold - add as available with detailed reasoning
          console.log(`  📋 ${riskType}: AVAILABLE (below threshold) - final score ${finalScore.toFixed(1)}/10 < ${RISK_THRESHOLDS.MIN_PRESELECT_SCORE}`)
          
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
            reasoning: `📍 Location risk: ${locationRiskLevel}/10 in ${parishName}\n🏢 Business impact: ${vulnerability.impactSeverity || 5}/10 for ${businessType.name}\n⚖️ Final risk score: ${finalScore.toFixed(1)}/10 - below threshold (${RISK_THRESHOLDS.MIN_PRESELECT_SCORE}) for pre-selection\n💡 This risk exists in your area but has low overall impact on your business type. You can manually select it if you believe it's relevant to your specific situation.`,
            dataSource: {
              locationRisk: `${parishName}: ${locationRiskLevel}/10`,
              businessImpact: `${businessType.name}: ${vulnerability.impactSeverity || 5}/10`,
              finalScore: `${finalScore.toFixed(1)}/10`,
              status: 'Available for manual selection'
            }
          })
          continue
        }
        
        console.log(`  ✅ ${riskType}: PRE-SELECTED - meets threshold (final score ${finalScore.toFixed(1)}/10 >= ${RISK_THRESHOLDS.MIN_PRESELECT_SCORE})`)
        
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
        calculationSteps.push(`📍 Location Risk: ${likelihood}/10 (${location.parish || location.country} - from admin Parish data)`)
        calculationSteps.push(`🏢 Business Impact: ${severity}/10 (${businessType.name} - from admin Business Type data)`)
        calculationSteps.push(`🧮 Base Score: (${likelihood} × 0.6) + (${businessVulnerability} × 0.4) = ${baseScore.toFixed(1)}/10`)
        
        if (appliedMultipliers.length > 0) {
          calculationSteps.push(`⚡ Multipliers Applied (from admin Multiplier rules):`)
          multiplierResult.appliedMultipliers.forEach(m => {
            calculationSteps.push(`   • ${m.name} ×${m.factor} - ${m.reasoning}`)
          })
          calculationSteps.push(`📊 Final Score: ${baseScore.toFixed(1)} × multipliers = ${finalScore.toFixed(1)}/10`)
        } else {
          calculationSteps.push(`📊 Final Score: ${finalScore.toFixed(1)}/10 (no multipliers applied)`)
        }
        
        // Add threshold explanation
        if (finalScore >= RISK_THRESHOLDS.FORCE_PRESELECT_SCORE) {
          calculationSteps.push(`✅ PRE-SELECTED: Critical risk (score >= ${RISK_THRESHOLDS.FORCE_PRESELECT_SCORE}) - always shown`)
        } else {
          calculationSteps.push(`✅ PRE-SELECTED: Meets threshold (score >= ${RISK_THRESHOLDS.MIN_PRESELECT_SCORE})`)
        }
        
        riskAssessmentMatrix.push({
          hazard: riskType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          hazardId: riskType,
          likelihood, // 1-10 scale from admin location data
          severity, // 1-10 scale from admin business type data
          riskScore: Math.round(finalScore * 10) / 10, // Final calculated score 1-10
          riskLevel,
          isPreSelected: true, // Pre-selected because parish has significant risk data
          isAvailable: true,
          source: 'combined',
          baseScore: Math.round(baseScore * 10) / 10,
          appliedMultipliers: appliedMultipliers.join(', '),
          reasoning: calculationSteps.join('\n'),
          // Additional transparency fields
          dataSource: {
            locationRisk: `Admin Parish Data (${parishName || location.country})`,
            businessImpact: `Admin Business Type Data (${businessType.name})`,
            multipliers: `Admin Multiplier Rules (${multiplierResult.appliedMultipliers.length} applied)`,
            userInputs: `Coastal: ${location.nearCoast ? 'Yes' : 'No'}, Urban: ${location.urbanArea ? 'Yes' : 'No'}`
          }
        })
      }
    }
    
    // STEP 5: Add parish-specific risks that aren't in business type vulnerabilities
    // This allows admin to set risks for a parish that apply regardless of business type
    // IMPORTANT: Now supports DYNAMIC risk types from riskProfileJson (cyber_attack, pandemic, etc.)
    if (locationData?.parishRisk) {
      const parishRisk = locationData.parishRisk
      
      // Start with hardcoded fields for backward compatibility
      const allParishRisks: Array<{ type: string, level: number, notes: string }> = [
        { type: 'hurricane', level: parishRisk.hurricaneLevel, notes: parishRisk.hurricaneNotes },
        { type: 'flood', level: parishRisk.floodLevel, notes: parishRisk.floodNotes },
        { type: 'earthquake', level: parishRisk.earthquakeLevel, notes: parishRisk.earthquakeNotes },
        { type: 'drought', level: parishRisk.droughtLevel, notes: parishRisk.droughtNotes },
        { type: 'landslide', level: parishRisk.landslideLevel, notes: parishRisk.landslideNotes },
        { type: 'powerOutage', level: parishRisk.powerOutageLevel, notes: parishRisk.powerOutageNotes }
      ]
      
      // Add DYNAMIC risks from riskProfileJson (supports unlimited risk types like cyber_attack, pandemic, etc.)
      if (parishRisk.riskProfileJson) {
        try {
          const dynamicRisks = typeof parishRisk.riskProfileJson === 'string' 
            ? JSON.parse(parishRisk.riskProfileJson) 
            : parishRisk.riskProfileJson
          
          if (dynamicRisks && typeof dynamicRisks === 'object') {
            console.log(`  🔍 Found dynamic risks in riskProfileJson:`, Object.keys(dynamicRisks))
            
            Object.entries(dynamicRisks).forEach(([riskKey, riskData]: [string, any]) => {
              // Skip metadata fields
              if (['lastUpdated', 'updatedBy'].includes(riskKey)) return
              
              // Normalize risk key to snake_case for consistency (cyberAttack → cyber_attack)
              const normalizedKey = riskKey.replace(/([A-Z])/g, '_$1').toLowerCase()
              
              // Skip if already in hardcoded list (check both formats)
              const alreadyIncluded = allParishRisks.some(r => 
                r.type === riskKey || r.type === normalizedKey
              )
              if (alreadyIncluded) return
              
              // Add dynamic risk (use normalized snake_case key)
              if (riskData && typeof riskData === 'object' && riskData.level !== undefined) {
                allParishRisks.push({
                  type: normalizedKey,
                  level: riskData.level || 0,
                  notes: riskData.notes || ''
                })
                console.log(`  ✅ Added dynamic parish risk: ${riskKey} → ${normalizedKey} (level ${riskData.level})`)
              }
            })
          }
        } catch (error) {
          console.error('  ⚠️ Failed to parse riskProfileJson:', error)
        }
      }
      
      for (const parishRiskItem of allParishRisks) {
        // Check if this risk was already processed
        const alreadyProcessed = identifiedRiskTypes.has(parishRiskItem.type) || 
                                 identifiedRiskTypes.has(parishRiskItem.type.replace(/([A-Z])/g, '_$1').toLowerCase())
        
        if (!alreadyProcessed && parishRiskItem.level > 0) {
          console.log(`  🆕 ${parishRiskItem.type}: Parish-only risk (not in business type) - level ${parishRiskItem.level}/10`)
          
          // Convert parish level to likelihood
          let parishLikelihoodScore = 3
          if (parishRiskItem.level >= 9) parishLikelihoodScore = 5
          else if (parishRiskItem.level >= 7) parishLikelihoodScore = 4
          else if (parishRiskItem.level >= 5) parishLikelihoodScore = 3
          else if (parishRiskItem.level >= 3) parishLikelihoodScore = 2
          else parishLikelihoodScore = 1
          
          const likelihood = parishRiskItem.level
          const severity = 5 // Default moderate severity when no business type data
          const riskScore = (likelihood * 0.6) + (severity * 0.4)
          
          let riskLevel = 'low'
          if (riskScore >= 8) riskLevel = 'very_high'
          else if (riskScore >= 6) riskLevel = 'high'
          else if (riskScore >= 4) riskLevel = 'medium'
          else if (riskScore >= 2) riskLevel = 'low'
          
          riskAssessmentMatrix.push({
            hazard: parishRiskItem.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            hazardId: parishRiskItem.type,
            likelihood,
            severity,
            riskScore: Math.round(riskScore * 10) / 10,
            riskLevel,
            isPreSelected: true,
            isAvailable: true,
            source: 'parish_only',
            reasoning: `📍 This risk is significant in ${parishName} (parish risk level: ${parishRiskItem.level}/10).\n🏢 No specific business type vulnerability data available - using moderate impact assumption.\n💡 ${parishRiskItem.notes || 'Consider how this risk might affect your specific operations.'}`,
            dataSource: {
              locationRisk: `Parish Data: ${parishRiskItem.level}/10`,
              businessImpact: 'General business impact (no specific data)',
              status: 'Parish-specific risk'
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
      reasoning: risk.reasoning
    }))
    
    console.log(`📋 Prepared ${preFillData.hazards.length} hazards for wizard (${riskAssessmentMatrix.filter((r: any) => r.isPreSelected).length} pre-selected, ${riskAssessmentMatrix.filter((r: any) => !r.isPreSelected).length} available)`)
    
    // ENHANCED STRATEGY RECOMMENDATION LOGIC
    // Build risk-aware strategy recommendations based on:
    // 1. Identified high-priority risks (score >= 6)
    // 2. Business type vulnerabilities
    // 3. Applied multipliers and actual risk scores
    
    // Get high-priority risks for focused strategy recommendations
    const highPriorityRisks = riskAssessmentMatrix
      .filter((r: any) => r.riskScore >= 6 && r.isPreSelected)
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
          orderBy: { sortOrder: 'asc' }
        }
      }
    })
    
    console.log(`📚 Found ${strategiesFromDB.length} strategies matching business type and risks`)
    
    // SMART STRATEGY PRIORITIZATION
    // Score each strategy based on:
    // - Relevance to high-priority risks (weight: 50%)
    // - Effectiveness rating (weight: 30%)
    // - Business type match specificity (weight: 20%)
    const scoredStrategies = strategiesFromDB.map((strategy: any) => {
      const applicableRisks = JSON.parse(strategy.applicableRisks || '[]')
      
      // Calculate relevance score based on risk priorities
      let relevanceScore = 0
      highPriorityRisks.forEach((risk: any) => {
        if (applicableRisks.includes(risk.type)) {
          // Higher weight for higher risk scores
          relevanceScore += risk.score / 10 * 50 // Max 50 points per high-priority risk
        }
      })
      
      // Add effectiveness score (0-30 points)
      const effectivenessScore = (strategy.effectiveness || 5) * 3
      
      // Add business type specificity score (0-20 points)
      const businessTypeMatch = strategy.applicableBusinessTypes || ''
      let specificityScore = 0
      if (businessTypeMatch.includes(businessTypeId)) specificityScore = 20 // Exact match
      else if (businessTypeMatch.includes(businessType.category)) specificityScore = 15 // Category match
      else if (businessTypeMatch.includes('all')) specificityScore = 5 // Universal
      
      const totalScore = relevanceScore + effectivenessScore + specificityScore
      
      return {
        strategy,
        score: totalScore,
        relevanceScore,
        effectivenessScore,
        specificityScore,
        applicableRisks
      }
    })
    
    // Sort by total score and take top recommendations
    const topStrategies = scoredStrategies
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 12) // Get top 12 strategies
    
    console.log(`✨ Top recommended strategies:`, topStrategies.map((s: any) => ({
      name: s.strategy.name,
      score: s.score.toFixed(1),
      breakdown: `R:${s.relevanceScore.toFixed(0)} + E:${s.effectivenessScore.toFixed(0)} + S:${s.specificityScore.toFixed(0)}`
    })))
    
    // Transform strategies for frontend with proper localization
    const detailedStrategies = topStrategies.map(({ strategy }: any) => ({
      id: strategy.strategyId,
      name: getLocalizedText(strategy.name, locale as Locale) || strategy.name,
      description: getLocalizedText(strategy.description, locale as Locale) || strategy.description,
      category: strategy.category,
      implementationCost: strategy.implementationCost,
      timeToImplement: strategy.timeToImplement,
      effectiveness: strategy.effectiveness,
      applicableRisks: JSON.parse(strategy.applicableRisks || '[]'),
      actionSteps: strategy.actionSteps.map((step: any) => ({
        id: step.stepId,
        title: getLocalizedText(step.title, locale as Locale) || step.title,
        description: getLocalizedText(step.description, locale as Locale) || step.description,
        timeframe: step.timeframe,
        responsibility: step.responsibility,
        cost: step.estimatedCost,
        sortOrder: step.sortOrder
      })).sort((a: any, b: any) => a.sortOrder - b.sortOrder),
      // Add metadata for frontend to show WHY this strategy is recommended
      recommendationReason: highPriorityRisks
        .filter((r: any) => JSON.parse(strategy.applicableRisks || '[]').includes(r.type))
        .map((r: any) => `${r.type.replace(/_/g, ' ')} (${r.level})`)
        .join(', ') || 'General business continuity'
    }))
    
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
  if (locationData?.parishRisk) score += 3

  const percentage = (score / maxScore) * 100

  if (percentage >= 80) return 'excellent'
  if (percentage >= 60) return 'good'
  if (percentage >= 40) return 'fair'
  return 'limited'
} 