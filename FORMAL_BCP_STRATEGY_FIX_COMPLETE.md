# Formal BCP Strategy & Action Step Data Fix - COMPLETE ✅

## Summary

Fixed the Formal BCP PDF export to pull **complete strategy data from the database** based on user's high-priority risks, instead of using hardcoded/simplified content.

---

## Changes Made

### ✅ FILE 1: `src/app/api/export-formal-bcp/route.ts`

**What Changed:**
- **Before:** Filtered strategies by user-selected strategy IDs (from wizard form data)
- **After:** Queries strategies by matching `applicableRisks` array with user's high-priority risks

**Key Improvements:**
1. ✅ **Extract user's HIGH/EXTREME risks** from Risk Assessment Matrix (risk score >= 6.0)
2. ✅ **Map country to country code** for currency conversion (e.g., Barbados → BB)
3. ✅ **Query strategies where `applicableRisks` overlaps with user's risks** using array filtering
4. ✅ **Calculate costs using `costCalculationService`** in user's local currency
5. ✅ **Include ALL action steps** with full details (no limits)
6. ✅ **Sort strategies** by priority (essential > high > medium > low) then by effectiveness

**Added Import:**
```typescript
import { costCalculationService } from '../../../services/costCalculationService'
```

**New Data Structure:**
```typescript
strategy.calculatedCostUSD = costCalc.totalUSD
strategy.calculatedCostLocal = costCalc.localCurrency.amount
strategy.currencyCode = costCalc.localCurrency.code
strategy.currencySymbol = costCalc.localCurrency.symbol
```

---

### ✅ FILE 2: `src/utils/formalBCPTransformer.ts`

**What Changed:**
- **Before:** Used `getStrategiesForRisk()` helper that filtered by user-selected strategies
- **After:** Directly filters strategies array by `applicableRisks` to get ALL matching strategies

**Key Improvements:**
1. ✅ **Removed `getCriticalActions()` call** that limited action steps to 3
2. ✅ **Show ALL action steps** sorted by `sortOrder`
3. ✅ **Use calculated costs** from route (`calculatedCostLocal`, `currencySymbol`, `currencyCode`)
4. ✅ **Include timeframe and estimated minutes** for each action step
5. ✅ **Use `timeToImplement`** field for strategy timeline
6. ✅ **Filter out risks with zero strategies** using `.filter(group => group.strategyCount > 0)`

**Added Helper Function:**
```typescript
function parseCostString(costStr: string): number
```
- Parses cost strings like "JMD 50,000-100,000" or "BBD 10,000"
- Fallback for categorical costs (low/medium/high/very_high)

---

### ✅ FILE 3: `src/components/previews/FormalBCPPreview.tsx`

**What Changed:**
- **Before:** Limited action steps to first 3 using `.slice(0, 3)`
- **After:** Shows ALL action steps with timeframes

**Key Improvements:**
1. ✅ **Display ALL action steps** (removed `.slice(0, 3)`)
2. ✅ **Use `calculatedCostLocal` and `currencySymbol`** from database
3. ✅ **Show timeframe for each action** in parentheses (e.g., "2 hours")
4. ✅ **Use `smeTitle` and `smeSummary`** fields for strategy titles/descriptions
5. ✅ **Display effectiveness rating** properly (e.g., "8/10")
6. ✅ **Extract timeline from `timeToImplement`** field

**Updated Display Logic:**
```typescript
const costDisplay = strategy.currencySymbol && costAmount > 0
  ? `${strategy.currencySymbol}${Math.round(costAmount).toLocaleString()} ${strategy.currencyCode}`
  : costAmount > 0 
  ? formatCurrency(costAmount, currencyInfo)
  : 'Cost TBD'
```

---

### ✅ FILE 4: `src/lib/pdf/formalBCPGenerator.ts`

**What Changed:**
- **Before:** Limited action steps to first 3 using `.slice(0, 3)` on line 568
- **After:** Shows ALL action steps with timeframes in PDF

**Key Improvements:**
1. ✅ **Removed `.slice(0, 3)` limit** on action steps
2. ✅ **Show timeframe for each action** if available
3. ✅ **Changed label** from "Key Actions Taken" to "Key Actions"
4. ✅ **Changed bullet** from "✓" to "→" for consistency with preview

---

## Expected Results

### ❌ Before Fix:
```
Protection Against: Hurricane/Tropical Storm
Strategies: 2 | Total Investment: Cost TBD

1. Hurricane Preparedness & Property Protection
   Investment: Cost TBD
   Timeline: TBD
   Effectiveness: N/A
   
   Key Actions:
   → Get metal shutters
   → Stock water and supplies
   → Tie down outdoor items
```

### ✅ After Fix:
```
Protection Against: Hurricane/Tropical Storm  
Strategies: 7 | Total Investment: Bds$ 15,450

1. Hurricane Preparedness & Property Protection
   Protect your building and assets before hurricane season
   
   Investment: Bds$ 4,500
   Timeline: 1-2 weeks
   Effectiveness: 8/10
   
   Key Actions:
   → Purchase and install hurricane shutters for all windows and glass doors (3-4 hours)
   → Create emergency supply kit with 3 days worth of water, non-perishable food, batteries, flashlights (2 hours)
   → Secure or bring inside all outdoor furniture, signage, and loose equipment (1 hour)
   → Document all business assets with photos and serial numbers for insurance purposes (2 hours)
   → Test emergency communication systems and backup contact methods (30 minutes)
   → Identify and photograph vulnerable areas of building for monitoring (1 hour)

2. Backup Power & Energy Independence
   Ensure critical operations continue during extended power outages
   
   Investment: Bds$ 6,750
   Timeline: 2-3 weeks
   Effectiveness: 9/10
   
   Key Actions:
   → Research and purchase backup generator appropriate for your business needs (Research: 2 hours, Purchase: 4 hours)
   → Install generator with proper ventilation and safety measures (Professional: 4-6 hours, DIY: 8-12 hours)
   → Stock sufficient fuel for minimum 72 hours of generator operation (30 minutes monthly)
   → Train all staff on safe generator operation, fueling, and maintenance (1 hour initial, 30 min quarterly refresher)
   → Schedule and complete monthly maintenance checks (15 minutes/month)
   → Test generator under load monthly (30 minutes/month)

[... and 5 more strategies]
```

---

## Technical Details

### Risk Matching Logic
```typescript
// Extract user's high-priority risks
const highPriorityRisks = riskMatrix
  .filter((r: any) => {
    const isSelected = r.isSelected !== false
    const riskScore = parseFloat(r.riskScore || r['Risk Score'] || 0)
    const isHighPriority = riskScore >= 6.0
    return isSelected && isHighPriority
  })

// Get risk IDs (e.g., ["hurricane", "power_outage", "flooding"])
const userRiskIds = highPriorityRisks.map((r: any) => 
  r.hazardId || r.id || r.Hazard?.toLowerCase().replace(/\s+/g, '_')
)

// Filter strategies where applicableRisks overlaps with userRiskIds
const applicableStrategies = dbStrategies.filter((s: any) => {
  const strategyRisks = parseJsonField(s.applicableRisks)
  return strategyRisks.some((risk: string) => userRiskIds.includes(risk))
})
```

### Cost Calculation
```typescript
// Calculate strategy cost in user's currency
const costCalc = await costCalculationService.calculateStrategyCost(
  actionSteps,
  countryCode // e.g., 'BB' for Barbados
)

strategy.calculatedCostUSD = costCalc.totalUSD
strategy.calculatedCostLocal = costCalc.localCurrency.amount // in Bds$ for Barbados
strategy.currencyCode = costCalc.localCurrency.code // 'BBD'
strategy.currencySymbol = costCalc.localCurrency.symbol // 'Bds$'
```

### Country Code Mapping
```typescript
const countryCodeMap: Record<string, string> = {
  'Jamaica': 'JM',
  'Barbados': 'BB',
  'Trinidad': 'TT',
  'Trinidad and Tobago': 'TT',
  'Bahamas': 'BS',
  'Haiti': 'HT',
  'Dominican Republic': 'DO',
  'Grenada': 'GD',
  'Saint Lucia': 'LC',
  'Antigua': 'AG',
  'Antigua and Barbuda': 'AG',
  'Saint Vincent': 'VC',
  'Saint Vincent and the Grenadines': 'VC',
  'Dominica': 'DM',
  'Saint Kitts': 'KN',
  'Saint Kitts and Nevis': 'KN',
}
```

---

## Testing Checklist

To verify the fix works correctly:

- [ ] Clear sample data and start fresh wizard
- [ ] Select a location (e.g., Christ Church, Barbados)
- [ ] Complete wizard and select HIGH/EXTREME risks
- [ ] Go to Export tab and click "Preview Formal BCP"
- [ ] **Verify Section 2 (Risks):** Shows correct impact levels (not "Not assessed")
- [ ] **Verify Section 3.1:** Shows calculated total investment in correct currency
- [ ] **Verify Section 3.2:** 
  - [ ] Shows ALL applicable strategies for each high-priority risk
  - [ ] Each strategy has calculated cost in correct currency (Bds$ for Barbados)
  - [ ] Each strategy has actual timeline (not "TBD")
  - [ ] Each strategy has effectiveness rating (e.g., "8/10")
  - [ ] All action steps are shown (not just first 3)
  - [ ] Action steps have detailed text from database
  - [ ] Action steps show timeframes (e.g., "2 hours")
- [ ] Download PDF and verify same data appears in PDF

---

## What This Fixes

| Issue | Before | After |
|-------|--------|-------|
| **Strategy Filtering** | User-selected strategies only | ALL strategies matching user's risks |
| **Strategy Count** | 2-3 per risk | 5-10+ per risk (all applicable) |
| **Cost Display** | "Cost TBD" | "Bds$ 4,500" (calculated in local currency) |
| **Timeline** | "TBD" | "1-2 weeks" (from database) |
| **Effectiveness** | "N/A" | "8/10" (from database) |
| **Action Steps** | First 3 only | ALL action steps |
| **Action Step Detail** | Generic text | Full `smeAction` text from database |
| **Timeframes** | Missing | Shown per action (e.g., "2 hours") |
| **Currency** | Generic JMD | User's country currency (BBD, TTD, etc.) |

---

## Data Flow

```
1. User selects location (e.g., Barbados)
   ↓
2. User completes Risk Assessment (selects HIGH risks like hurricane)
   ↓
3. User clicks "Export Formal BCP"
   ↓
4. API extracts HIGH/EXTREME risks with risk score >= 6.0
   ↓
5. API queries strategies where applicableRisks includes user's risks
   ↓
6. API calculates costs using costCalculationService (Barbados → BBD)
   ↓
7. Transformer formats data with ALL action steps
   ↓
8. Preview/PDF displays complete strategy data
```

---

## Summary of Benefits

✅ **More Comprehensive:** Shows ALL relevant strategies (not just 2-3)  
✅ **Accurate Costs:** Calculated in user's currency using real cost items  
✅ **Complete Actions:** Shows ALL action steps with timeframes  
✅ **Database-Driven:** Pulls from rich database content, not hardcoded text  
✅ **Risk-Matched:** Only shows strategies relevant to user's specific risks  
✅ **Professional:** Full details make document suitable for bank/insurance review  

---

## Files Modified

1. `src/app/api/export-formal-bcp/route.ts` - Query logic and cost calculation
2. `src/utils/formalBCPTransformer.ts` - Data transformation (removed limits)
3. `src/components/previews/FormalBCPPreview.tsx` - Preview display (show all steps)
4. `src/lib/pdf/formalBCPGenerator.ts` - PDF generation (show all steps)

---

## No Breaking Changes

- All existing wizard functionality remains unchanged
- Only affects Formal BCP export (not other exports)
- Backward compatible with existing plan data
- Gracefully handles missing data (falls back to "Cost TBD", "TBD", etc.)

---

## Date Completed
November 5, 2025

## Status
✅ **COMPLETE** - Ready for testing

