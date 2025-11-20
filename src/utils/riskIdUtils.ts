// NEW FILE: /src/utils/riskIdUtils.ts
// Replace the riskIdMapping.ts with this simpler, cleaner approach

/**
 * Canonical risk IDs used throughout the system
 * ALL IDs should be in snake_case format
 */
export const CANONICAL_RISK_IDS = [
    // Natural Hazards
    'hurricane',
    'flood',
    'earthquake',
    'drought',
    'landslide',

    // Technical Hazards
    'power_outage',
    'fire',
    'equipment_failure',

    // Human/Social Hazards
    'cyber_attack',
    'terrorism',
    'pandemic',
    'economic_downturn',
    'supply_chain_disruption',
    'civil_unrest',
    'theft',
    'crime'
] as const

export type CanonicalRiskId = typeof CANONICAL_RISK_IDS[number]

/**
 * Normalize any risk ID variant to snake_case
 * This should only be needed during data migration/import
 * Once the database is cleaned up, this shouldn't be necessary
 */
export function normalizeRiskId(riskId: string): string {
    if (!riskId || typeof riskId !== 'string') return ''

    // Special case: "flooding" should map to "flood"
    if (riskId.toLowerCase() === 'flooding') return 'flood'
    if (riskId === 'pandemicDisease') return 'pandemic'

    // Convert to snake_case
    return riskId
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
}

/**
 * Check if two risk IDs refer to the same risk
 * After database cleanup, this should just be a simple equality check
 */
export function riskIdsMatch(id1: string, id2: string): boolean {
    return normalizeRiskId(id1) === normalizeRiskId(id2)
}

/**
 * Validate if a risk ID is canonical
 */
export function isCanonicalRiskId(riskId: string): boolean {
    return CANONICAL_RISK_IDS.includes(riskId as CanonicalRiskId)
}

/**
 * Get display name for a risk ID
 */
export function getRiskDisplayName(riskId: string): string {
    const displayNames: Record<string, string> = {
        'hurricane': 'Hurricane',
        'flood': 'Flood',
        'earthquake': 'Earthquake',
        'drought': 'Drought',
        'landslide': 'Landslide',
        'power_outage': 'Power Outage',
        'fire': 'Fire',
        'equipment_failure': 'Equipment Failure',
        'cyber_attack': 'Cyber Attack',
        'terrorism': 'Security Threats',
        'pandemic': 'Pandemic',
        'economic_downturn': 'Economic Downturn',
        'supply_chain_disruption': 'Supply Chain Disruption',
        'civil_unrest': 'Civil Unrest',
        'theft': 'Theft',
        'crime': 'Crime'
    }

    const normalized = normalizeRiskId(riskId)
    return displayNames[normalized] || riskId
}
