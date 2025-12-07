/**
 * Canonical Risk ID Utility
 * 
 * IMPORTANT: These IDs MUST match exactly what is in the AdminHazardType database table.
 * This is the SINGLE SOURCE OF TRUTH for risk IDs throughout the app.
 * 
 * NO MAPPING OR NORMALIZATION - all code must use these exact IDs.
 */

/**
 * Canonical risk IDs - matches AdminHazardType database table exactly
 * ALL code throughout the app MUST use these exact IDs
 */
export const CANONICAL_RISK_IDS = [
    // Natural Hazards
    'hurricane',
    'flooding',
    'drought',
    'earthquake',
    'landslide',

    // Technological Hazards
    'power_outage',
    'fire',
    'cybersecurity_incident',

    // Human/Social Hazards
    'civil_unrest',
    'break_in_theft',
    'health_emergency',

    // Economic Hazards
    'supply_disruption',
    'economic_downturn'
] as const

export type CanonicalRiskId = typeof CANONICAL_RISK_IDS[number]

/**
 * Convert to snake_case - NO MAPPING
 * This only converts format (camelCase to snake_case), it does NOT change the ID itself
 */
export function normalizeRiskId(riskId: string): string {
    if (!riskId || typeof riskId !== 'string') return ''

    // Just convert to snake_case - no ID remapping
    return riskId
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
}

/**
 * Check if two risk IDs are exactly the same
 * With canonical IDs, this is just a simple equality check
 */
export function riskIdsMatch(id1: string, id2: string): boolean {
    return id1 === id2
}

/**
 * Validate if a risk ID is canonical
 */
export function isCanonicalRiskId(riskId: string): boolean {
    return CANONICAL_RISK_IDS.includes(riskId as CanonicalRiskId)
}

/**
 * Get display name for a risk ID
 * These names match AdminHazardType database table
 */
export function getRiskDisplayName(riskId: string): string {
    const displayNames: Record<string, string> = {
        // Natural Hazards
        'hurricane': 'Hurricane / Tropical Storm',
        'flooding': 'Flooding',
        'drought': 'Drought',
        'earthquake': 'Earthquake',
        'landslide': 'Landslide / Mudslide',
        
        // Technological Hazards
        'power_outage': 'Power Outage',
        'fire': 'Fire',
        'cybersecurity_incident': 'Cybersecurity Incident / Data Breach',
        
        // Human/Social Hazards
        'civil_unrest': 'Civil Unrest / Protests',
        'break_in_theft': 'Break-ins & Theft',
        'health_emergency': 'Health Emergency / Pandemic',
        
        // Economic Hazards
        'supply_disruption': 'Supply Chain Disruption',
        'economic_downturn': 'Economic Downturn / Tourism Decline'
    }

    return displayNames[riskId] || riskId
}
