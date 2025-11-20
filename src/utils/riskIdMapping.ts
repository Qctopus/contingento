// Canonical risk ID mappings (all in snake_case)
export const RISK_ID_MAPPINGS: Record<string, string> = {
    // Standard mappings
    'hurricane': 'hurricane',
    'Hurricane': 'hurricane',
    'flood': 'flood',
    'Flood': 'flood',
    'flooding': 'flood',
    'Flooding': 'flood',
    'powerOutage': 'power_outage',
    'PowerOutage': 'power_outage',
    'power_outage': 'power_outage',
    'cyberAttack': 'cyber_attack',
    'CyberAttack': 'cyber_attack',
    'cyber_attack': 'cyber_attack',
    'supplyChainDisruption': 'supply_chain_disruption',
    'SupplyChainDisruption': 'supply_chain_disruption',
    'supply_chain_disruption': 'supply_chain_disruption',
    'economicDownturn': 'economic_downturn',
    'EconomicDownturn': 'economic_downturn',
    'economic_downturn': 'economic_downturn',
    'pandemic': 'pandemic',
    'pandemicDisease': 'pandemic',
    'PandemicDisease': 'pandemic',
    'civilUnrest': 'civil_unrest',
    'CivilUnrest': 'civil_unrest',
    'civil_unrest': 'civil_unrest',
    'fire': 'fire',
    'Fire': 'fire',
    'earthquake': 'earthquake',
    'Earthquake': 'earthquake',
    'drought': 'drought',
    'Drought': 'drought',
    'theft': 'theft',
    'crime': 'crime',
    'Crime': 'crime',
    'landslide': 'landslide',
    'Landslide': 'landslide',
    'equipmentFailure': 'equipment_failure',
    'EquipmentFailure': 'equipment_failure',
    'equipment_failure': 'equipment_failure'
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
