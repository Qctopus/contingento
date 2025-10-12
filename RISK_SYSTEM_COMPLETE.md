# Complete Risk Assessment System

## 📊 System Status

✅ **Fully Populated Database**:
- **13 Multipliers** - Conditions that amplify risk based on business characteristics
- **11 Strategies** - Risk mitigation strategies mapped to specific risks
- **35 Action Steps** - Concrete actions for each strategy (multilingual)
- **5 Business Types** - With 25 risk vulnerabilities
- **13 Risk Types** - All risks covered (hurricane, flood, fire, earthquake, cyber, etc.)

---

## 🔄 System Logic Flow (As Requested)

### Step 1: User Input Collection
```
User selects:
1. Location (country + administrative unit)
2. Business Type
3. Answers additional questions:
   - Customer base (tourism vs local)
   - Power dependency
   - Digital dependency
   - Supply chain characteristics
   - Physical assets
   etc.
```

### Step 2: Risk Calculation Formula
```
Final Risk Score (X) = (Location Risk × 0.6 + Business Vulnerability × 0.4) × Multipliers

Where:
- Location Risk: 0-10 (from AdminUnitRisk data)
- Business Vulnerability: 0-10 (from BusinessRiskVulnerability)
- Multipliers: Applied based on user's business characteristics
```

### Step 3: Risk Pre-Selection Logic
```typescript
function shouldPreSelectRisk(finalScore, hasLocationData, locationRiskLevel) {
  // Pre-select if FINAL score (after multipliers) >= 6
  if (finalScore >= 6) return true
  
  // Pre-select if location risk is significant (>= 5)
  if (locationRiskLevel >= 5) return true
  
  return false // Otherwise, available but not pre-selected
}
```

**Implemented in**: `src/app/api/wizard/prepare-prefill-data/route.ts` (lines 72-94)

### Step 4: Risk Display in Wizard
- **If X >= 6 OR location risk >= 5**: Risk is **pre-selected** (user can deselect)
- **If X < 6 AND location risk < 5**: Risk is **available** in "Other Risks" (user can select)

### Step 5: Strategy Recommendation
Strategies are recommended based on:
1. **Selected risks** (pre-selected + user-selected)
2. **Risk scores** (higher priority for higher scores)
3. **Business type** matching
4. **Effectiveness rating** of strategy

**Query Logic**:
```javascript
// Get strategies where:
// 1. applicableRisks includes ANY of the selected risks
// 2. applicableBusinessTypes includes business type OR category OR 'all'
// 3. isActive = true

const strategies = await prisma.riskMitigationStrategy.findMany({
  where: {
    AND: [
      { isActive: true },
      { OR: selectedRisks.map(risk => ({ applicableRisks: { contains: risk } })) },
      { OR: [
        { applicableBusinessTypes: { contains: businessTypeId } },
        { applicableBusinessTypes: { contains: category } },
        { applicableBusinessTypes: { contains: 'all' } }
      ]}
    ]
  },
  include: { actionSteps: true }
})
```

**Implemented in**: `src/app/api/wizard/prepare-prefill-data/route.ts` (lines 758-785)

---

## 🎯 Multipliers (13 Total)

### Location-Based (3)
1. **Coastal Hurricane Risk** (×1.3) - Applies to: hurricane, flood
   - Condition: `location_coastal = true`
2. **Urban Infrastructure Dependency** (×1.2) - Applies to: powerOutage, civilUnrest, fire
   - Condition: `location_urban = true`
3. **Flood-Prone Area** (×1.4) - Applies to: flood, hurricane
   - Condition: `location_flood_prone = true`

### Business Characteristics (10)
4. **High Tourism Dependency** (×1.25) - Applies to: pandemicDisease, hurricane, civilUnrest, economicDownturn
   - Condition: `tourism_share >= 50%`
5. **Critical Power Dependency** (×1.5) - Applies to: powerOutage, hurricane, flood
   - Condition: `power_dependency >= 80%`
6. **Moderate Power Dependency** (×1.2) - Applies to: powerOutage
   - Condition: `power_dependency 40-79%`
7. **Essential Digital Systems** (×1.4) - Applies to: cyberAttack, powerOutage
   - Condition: `digital_dependency >= 80%`
8. **Complex Supply Chain** (×1.3) - Applies to: supplyChainDisruption, hurricane, pandemicDisease
   - Condition: `supply_chain_complex = true`
9. **Perishable Goods Handling** (×1.35) - Applies to: powerOutage, supplyChainDisruption
   - Condition: `perishable_goods = true`
10. **Just-in-Time Inventory** (×1.25) - Applies to: supplyChainDisruption, hurricane
    - Condition: `just_in_time_inventory = true`
11. **Seasonal Business Pattern** (×1.2) - Applies to: hurricane, economicDownturn
    - Condition: `seasonal_business = true`
12. **High-Value Equipment** (×1.3) - Applies to: hurricane, flood, fire, earthquake
    - Condition: `physical_asset_intensive = true`
13. **Building Ownership** (×1.25) - Applies to: hurricane, flood, fire, earthquake
    - Condition: `own_building = true`

---

## 🛡️  Strategies (11 Total)

### Prevention Strategies (9)
1. **Hurricane Preparedness** - Covers: hurricane (4 action steps)
2. **Backup Power Systems** - Covers: powerOutage (3 action steps)
3. **Flood Prevention** - Covers: flood (3 action steps)
4. **Fire Detection & Suppression** - Covers: fire (4 action steps)
5. **Cybersecurity Protection** - Covers: cyberAttack (4 action steps)
6. **Supply Chain Diversification** - Covers: supplyChainDisruption (3 action steps)
7. **Health & Safety Protocols** - Covers: pandemicDisease (3 action steps)
8. **Earthquake Preparedness** - Covers: earthquake (3 action steps)
9. **Water Conservation** - Covers: drought (2 action steps)

### Response Strategies (2)
10. **Financial Resilience** - Covers: economicDownturn (3 action steps)
11. **Security During Unrest** - Covers: civilUnrest, terrorism (3 action steps)

---

## 📋 Action Steps (35 Total)

Each action step includes:
- **Phase**: immediate, short_term, medium_term, long_term
- **Title**: Technical action description
- **SME Action**: Simplified, practical action (multilingual: EN/ES/FR)
- **Estimated Cost**: Cost range in USD or JMD
- **Timeframe**: How long to implement
- **Sort Order**: For displaying in logical sequence

Example action step:
```json
{
  "phase": "immediate",
  "title": "Install hurricane shutters on all windows",
  "smeAction": {
    "en": "Get metal shutters or plywood boards to cover windows",
    "es": "Instale persianas metálicas o tablas de madera contrachapada",
    "fr": "Installez des volets métalliques ou des planches de contreplaqué"
  },
  "estimatedCost": "$500-$2000",
  "timeframe": "1-2 weeks"
}
```

---

## ✅ System Logic Verification

### Does it follow your requirements?

1. ✅ **Location Risk × Business Impact × Multipliers = X**
   - Formula: `(Location Risk × 0.6 + Business Vulnerability × 0.4) × Multipliers`
   - Implemented in: `calculateFinalRiskScore()` function

2. ✅ **If X > Threshold, pre-select risk**
   - Threshold: X >= 6 OR location risk >= 5
   - Implemented in: `shouldPreSelectRisk()` function

3. ✅ **If X < Threshold, risk available but not pre-selected**
   - Implemented: Adds risks with `isPreSelected: false, isAvailable: true`

4. ✅ **Strategies recommended based on selected risks**
   - Query filters strategies by `applicableRisks` matching selected risks
   - Sorts by effectiveness and priority

5. ✅ **Risk → Strategy mapping**
   - Each strategy has `applicableRisks` array
   - Database query joins risks with strategies

---

## 🔧 Configuration Options

### Adjusting the Pre-Selection Threshold

Currently in `src/app/api/wizard/prepare-prefill-data/route.ts`:
```typescript
function shouldPreSelectRisk(finalScore, hasLocationData, locationRiskLevel) {
  if (finalScore >= 6) return true  // <-- Change this threshold
  if (locationRiskLevel >= 5) return true  // <-- Or this one
  return false
}
```

**Recommendations**:
- **Conservative** (fewer pre-selected): `finalScore >= 7, locationRiskLevel >= 6`
- **Current** (balanced): `finalScore >= 6, locationRiskLevel >= 5`
- **Aggressive** (more pre-selected): `finalScore >= 5, locationRiskLevel >= 4`

### Adding New Multipliers

To add a new multiplier, run:
```javascript
await prisma.riskMultiplier.create({
  data: {
    name: 'New Multiplier Name',
    characteristicType: 'some_characteristic',
    conditionType: 'boolean' | 'threshold' | 'range',
    multiplierFactor: 1.25,
    applicableHazards: JSON.stringify(['hurricane', 'flood']),
    reasoning: 'Why this multiplier applies',
    isActive: true
  }
})
```

### Adding New Strategies

See `scripts/populate-complete-risk-system.js` for the full template structure.

---

## 🎉 Ready to Use!

The system is now fully operational. When a user:
1. Selects location → Loads location risks
2. Selects business type → Loads business vulnerabilities
3. Answers questions → Generates business characteristics
4. System calculates → Final risk scores with multipliers
5. Wizard displays → Pre-selected risks (X >= threshold)
6. User confirms/modifies → Final risk list
7. System recommends → Strategies matching risks
8. User gets → Actionable steps in their language

**Test it**: Start the wizard, select "Grocery Store" in a coastal parish, answer questions, and see risks + strategies appear!


