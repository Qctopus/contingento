// PATCH FOR: /src/app/api/wizard/prepare-prefill-data/route.ts
// This shows the key changes needed to ensure consistent risk IDs

// CHANGE 1: Fix the fallback hazard list (around line 340-360)
// BEFORE:
const fallbackRiskTypes = [
    { hazardId: 'hurricane', name: 'Hurricane/Tropical Storm' },
    { hazardId: 'flood', name: 'Flooding' },  // ❌ WRONG - name says "Flooding" but ID is "flood"
    // ...
]

// AFTER:
const fallbackRiskTypes = [
    { hazardId: 'hurricane', name: 'Hurricane/Tropical Storm' },
    { hazardId: 'flood', name: 'Flood' },  // ✅ FIXED - consistent "flood" everywhere
    { hazardId: 'earthquake', name: 'Earthquake' },
    { hazardId: 'drought', name: 'Drought' },
    { hazardId: 'landslide', name: 'Landslide' },
    { hazardId: 'power_outage', name: 'Power Outage' },  // ✅ Use snake_case
    { hazardId: 'fire', name: 'Fire' },
    { hazardId: 'cyber_attack', name: 'Cyber Attack' },  // ✅ Use snake_case
    { hazardId: 'terrorism', name: 'Security Threats' },
    { hazardId: 'pandemic', name: 'Health Emergencies' },  // ✅ Simplified to "pandemic"
    { hazardId: 'economic_downturn', name: 'Economic Crisis' },  // ✅ Use snake_case
    { hazardId: 'supply_chain_disruption', name: 'Supply Chain Issues' },  // ✅ Use snake_case
    { hazardId: 'civil_unrest', name: 'Civil Unrest' }  // ✅ Use snake_case
]

// CHANGE 2: Ensure risk type normalization uses canonical IDs (around line 500-550)
// Add this canonical mapping function at the top of the file:
const CANONICAL_RISK_IDS: Record<string, string> = {
    'flooding': 'flood',  // Map "flooding" to "flood"
    'powerOutage': 'power_outage',
    'cyberAttack': 'cyber_attack',
    'pandemicDisease': 'pandemic',
    'economicDownturn': 'economic_downturn',
    'supplyChainDisruption': 'supply_chain_disruption',
    'civilUnrest': 'civil_unrest',
    // Add more mappings as needed
}

function getCanonicalRiskId(riskType: string): string {
    // Check explicit mapping first
    if (CANONICAL_RISK_IDS[riskType]) {
        return CANONICAL_RISK_IDS[riskType]
    }

    // Convert camelCase to snake_case
    const snakeCase = riskType.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()

    // Check if snake_case version is in mapping
    if (CANONICAL_RISK_IDS[snakeCase]) {
        return CANONICAL_RISK_IDS[snakeCase]
    }

    return snakeCase
}

// CHANGE 3: When generating risk assessment matrix (around line 600-700)
// Ensure hazardId is always the canonical ID:

// BEFORE:
const hazardId = normalizedRiskType  // Could be inconsistent

// AFTER:
const hazardId = getCanonicalRiskId(riskType)  // Always returns canonical ID

// CHANGE 4: When adding admin unit risks (around line 1000-1100)
// Ensure consistent IDs:

// BEFORE:
hazardId: 'flood',
    hazardName: 'Flooding',  // Inconsistent name

        // AFTER:
        hazardId: 'flood',
            hazardName: 'Flood',  // Consistent with ID

                // CHANGE 5: In the final risk assessment matrix assembly
                // Make sure all hazardIds are canonical:

                riskAssessmentMatrix.push({
                    hazard: riskType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                    hazardId: getCanonicalRiskId(riskType),  // ✅ Always use canonical ID
                    hazardName: translateRiskName(riskType),  // Use proper translation
                    // ... rest of the properties
                })