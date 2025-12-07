/**
 * Canonical risk ID mappings
 * Maps various input formats to the 13 canonical hazard IDs in AdminHazardType
 * 
 * CANONICAL IDs: hurricane, flooding, drought, earthquake, landslide,
 *                power_outage, fire, cybersecurity_incident,
 *                civil_unrest, break_in_theft, health_emergency,
 *                supply_disruption, economic_downturn
 */
export const RISK_ID_MAPPINGS: Record<string, string> = {
    // Hurricane
    'hurricane': 'hurricane',
    'Hurricane': 'hurricane',
    
    // Flooding (not "flood")
    'flood': 'flooding',
    'Flood': 'flooding',
    'flooding': 'flooding',
    'Flooding': 'flooding',
    
    // Drought
    'drought': 'drought',
    'Drought': 'drought',
    
    // Earthquake
    'earthquake': 'earthquake',
    'Earthquake': 'earthquake',
    
    // Landslide
    'landslide': 'landslide',
    'Landslide': 'landslide',
    
    // Power Outage
    'powerOutage': 'power_outage',
    'PowerOutage': 'power_outage',
    'power_outage': 'power_outage',
    
    // Fire
    'fire': 'fire',
    'Fire': 'fire',
    
    // Cybersecurity Incident (not "cyber_attack")
    'cyberAttack': 'cybersecurity_incident',
    'CyberAttack': 'cybersecurity_incident',
    'cyber_attack': 'cybersecurity_incident',
    'cybersecurity_incident': 'cybersecurity_incident',
    
    // Civil Unrest
    'civilUnrest': 'civil_unrest',
    'CivilUnrest': 'civil_unrest',
    'civil_unrest': 'civil_unrest',
    
    // Break-in/Theft (not "theft" or "crime")
    'theft': 'break_in_theft',
    'crime': 'break_in_theft',
    'Crime': 'break_in_theft',
    'break_in_theft': 'break_in_theft',
    'theft_vandalism': 'break_in_theft',
    
    // Health Emergency (not "pandemic")
    'pandemic': 'health_emergency',
    'pandemicDisease': 'health_emergency',
    'PandemicDisease': 'health_emergency',
    'health_emergency': 'health_emergency',
    
    // Supply Disruption (not "supply_chain_disruption")
    'supplyChainDisruption': 'supply_disruption',
    'SupplyChainDisruption': 'supply_disruption',
    'supply_chain_disruption': 'supply_disruption',
    'supply_disruption': 'supply_disruption',
    
    // Economic Downturn
    'economicDownturn': 'economic_downturn',
    'EconomicDownturn': 'economic_downturn',
    'economic_downturn': 'economic_downturn'
}

export function getCanonicalRiskId(riskId: string): string {
    if (!riskId) return ''

    // Check mapping first
    if (RISK_ID_MAPPINGS[riskId]) {
        return RISK_ID_MAPPINGS[riskId]
    }

    // Fallback to normalization
    return riskId
        .replace(/([a-z])([A-Z])/g, '$1_$2') // camelCase to snake_case
        .toLowerCase()
        .replace(/[\s-]+/g, '_') // spaces and hyphens to underscores
        .replace(/[^a-z0-9_]/g, '') // remove special chars
        .replace(/_+/g, '_') // collapse multiple underscores
        .replace(/^_|_$/g, '') // trim underscores
}

export function normalizeRiskId(id: string): string {
    return getCanonicalRiskId(id)
}
