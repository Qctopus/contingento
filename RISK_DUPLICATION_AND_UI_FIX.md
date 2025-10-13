# Risk Duplication and UI/UX Improvements

## Issues Fixed

### 1. **Duplicate Risks (camelCase vs snake_case)**

**Problem**: Risks were appearing multiple times in different sections due to inconsistent naming:
- `economicDownturn` (from business type) vs `economic_downturn` (from admin unit) = DUPLICATE
- `supplyChainDisruption` vs `supply_chain_disruption` = DUPLICATE
- `civilUnrest` vs `civil_unrest` = DUPLICATE
- `pandemicDisease` vs `pandemic_disease` = DUPLICATE

**Root Cause**: 
- Business type vulnerabilities use camelCase (e.g., `economicDownturn`)
- Admin unit risks from riskProfileJson use snake_case (e.g., `economic_downturn`)
- The duplicate detection logic only checked the exact format, not normalized versions

**Solution**: 
Implemented comprehensive duplicate detection in `prepare-prefill-data/route.ts`:

```typescript
// When processing business type vulnerabilities
const normalizedRiskType = riskType.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
const camelCaseRiskType = riskType.replace(/_([a-z])/g, (g) => g[1].toUpperCase())

// Track in ALL formats to prevent future duplicates
identifiedRiskTypes.add(riskType)
identifiedRiskTypes.add(normalizedRiskType)
identifiedRiskTypes.add(camelCaseRiskType)
```

```typescript
// When processing admin unit risks
const normalizedType = adminRiskItem.type.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
const camelCaseType = adminRiskItem.type.replace(/_([a-z])/g, (g) => g[1].toUpperCase())

// Check if risk already processed in ANY format
const alreadyProcessed = identifiedRiskTypes.has(adminRiskItem.type) || 
                         identifiedRiskTypes.has(normalizedType) ||
                         identifiedRiskTypes.has(camelCaseType)

// Use NORMALIZED snake_case for consistent hazardId
const consistentHazardId = normalizedType
```

**Result**: ✅ Each risk now appears exactly once, with a consistent snake_case `hazardId`

---

### 2. **"Water Dependency" Appearing as a Risk**

**Problem**: User reported seeing "water dependency" listed as a risk

**Investigation Results**:
- ✅ Verified that `water_dependency` is correctly defined as a multiplier characteristic, NOT a risk
- ✅ Confirmed no overlap between multiplier characteristic types and risk types
- ✅ Searched codebase and found NO instances of multipliers being rendered as risks
- ✅ The 13 defined risk types are:
  ```
  hurricane, flood, earthquake, drought, landslide, powerOutage,
  fire, cyberAttack, terrorism, pandemicDisease, economicDownturn,
  supplyChainDisruption, civilUnrest
  ```

**Conclusion**: This was likely a misidentification or UI confusion. The code does NOT mix multipliers with risks. The improved UI (see below) now makes the distinction much clearer.

---

### 3. **UI/UX Improvements**

**Problem**: The risk display was not visually clear about priorities and tiers

**Improvements Implemented**:

#### A. **Tier-Based Visual Hierarchy**
Each risk card now shows clear visual indicators based on its tier:

- **Tier 1 (🔴 Critical)**: 
  - Red border and accent colors
  - "🔴 Critical" badge
  - Ring shadow when selected
  - Red-tinted background when checked

- **Tier 2 (🟡 Important)**:
  - Orange border and accent colors
  - "🟡 Important" badge
  - Ring shadow when selected
  - Orange-tinted background when checked

- **Tier 3 (⚪ Available)**:
  - Gray border
  - No special badge
  - Standard styling

#### B. **Enhanced Risk Cards**
```tsx
// Before: Basic checkbox and title
[✓] Hurricane

// After: Rich, informative card
┌──────────────────────────────────────────────────────────┐
│ [✓] Hurricane                    [🔴 Critical]           │
│     Risk Score: 6.4/10 (Likelihood: 6/10, Impact: 7/10) │
│     💡 Why this risk matters: This risk requires...      │
└──────────────────────────────────────────────────────────┘
```

#### C. **Clear Section Headers**
- 🔴 **Highly Recommended - Critical Risks**: Red gradient banner
- 🟡 **Recommended - Important Risks to Prepare For**: Orange gradient banner
- ⚪ **Other Risks - Add if Relevant**: Collapsible gray section

#### D. **Better Visual Feedback**
- Larger checkboxes (6x6 instead of 5x5)
- Color-coded checkboxes matching tier (red for critical, orange for important)
- Thicker borders (border-2 instead of border)
- Ring shadows on selected items for better visual distinction
- Hover effects on unselected items

#### E. **Improved Information Display**
- Risk score prominently displayed
- Likelihood and impact values shown inline
- Auto-calculated badge for system-generated values
- Reasoning preview when selected
- Clear tier badges next to risk names

---

## Files Modified

### 1. **`src/app/api/wizard/prepare-prefill-data/route.ts`**

**Changes**:
- Added comprehensive duplicate detection logic
- Normalize risk types to snake_case for consistency
- Track risk types in all formats (original, normalized, camelCase)
- Use normalized hazardId to prevent UI duplicates
- Apply tier categorization to admin unit-only risks

**Key Code Blocks**:
```typescript
// Lines 421-431: Business type vulnerability processing
const normalizedRiskType = riskType.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
const camelCaseRiskType = riskType.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
identifiedRiskTypes.add(riskType)
identifiedRiskTypes.add(normalizedRiskType)
identifiedRiskTypes.add(camelCaseRiskType)

// Lines 714-730: Admin unit risk processing
const normalizedType = adminRiskItem.type.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
const camelCaseType = adminRiskItem.type.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
const alreadyProcessed = identifiedRiskTypes.has(adminRiskItem.type) || 
                         identifiedRiskTypes.has(normalizedType) ||
                         identifiedRiskTypes.has(camelCaseType)
                         
// Lines 744-754: Tier categorization and consistent ID
const riskCategory = categorizeRisk(riskScore, true, likelihood)
const consistentHazardId = normalizedType
```

### 2. **`src/components/SimplifiedRiskAssessment.tsx`**

**Changes**:
- Enhanced risk card rendering with tier-based styling
- Added tier badges (🔴 Critical, 🟡 Important)
- Implemented color-coded borders, backgrounds, and checkboxes
- Improved visual hierarchy and spacing
- Added risk score display with likelihood/impact breakdown
- Added reasoning preview for selected risks

**Key Code Blocks**:
```typescript
// Lines 515-533: Tier badge determination
const tier = risk.riskTier || (risk.riskScore >= 7.0 ? 1 : risk.riskScore >= 5.0 ? 2 : 3)
let tierBadge = null
if (tier === 1) {
  tierBadge = <span className="...bg-red-100 text-red-700...">🔴 Critical</span>
} else if (tier === 2) {
  tierBadge = <span className="...bg-orange-100 text-orange-700...">🟡 Important</span>
}

// Lines 538-552: Tier-based card styling
className={`border-2 rounded-lg ${
  risk.isSelected 
    ? tier === 1 ? 'border-red-400 shadow-lg ring-2 ring-red-200'
    : tier === 2 ? 'border-orange-400 shadow-lg ring-2 ring-orange-200'
    : 'border-blue-500 shadow-md' 
  : tier === 1 ? 'border-red-200 hover:border-red-300'
  : tier === 2 ? 'border-orange-200 hover:border-orange-300'
  : 'border-gray-200 hover:border-gray-300'
}`}

// Lines 566-570: Color-coded checkboxes
className={`h-6 w-6 border-2 rounded focus:ring-2 ${
  tier === 1 ? 'text-red-600 border-red-300 focus:ring-red-500' :
  tier === 2 ? 'text-orange-600 border-orange-300 focus:ring-orange-500' :
  'text-blue-600 border-gray-300 focus:ring-blue-500'
}`}
```

---

## Testing Verification

### Test Scenario: Clarendon + Clothing Store

**Expected Results**:
- ✅ No duplicate risks (each appears exactly once)
- ✅ Proper tier categorization (Hurricane: Tier 2, Flood: Tier 2, Earthquake: Tier 3, etc.)
- ✅ Only 13 total risk types (not 16 with duplicates)
- ✅ Clear visual distinction between tiers
- ✅ No multipliers appearing as risks

**Risk Types (13 Total)**:
1. hurricane
2. flood
3. earthquake
4. drought
5. landslide
6. power_outage
7. fire
8. cyber_attack
9. terrorism
10. pandemic_disease
11. economic_downturn
12. supply_chain_disruption
13. civil_unrest

---

## Before & After

### Before (Problems)
❌ Risks appeared multiple times (economicDownturn AND economic_downturn)
❌ User confused by seeing same risk in different sections
❌ No clear visual priority system
❌ Generic styling made all risks look equally important
❌ Hard to understand why certain risks were pre-selected

### After (Solutions)
✅ Each risk appears exactly once with consistent ID
✅ Clear 3-tier visual system (🔴 🟡 ⚪)
✅ Prominent tier badges and color-coding
✅ Risk scores prominently displayed
✅ Visual feedback on selection (colored borders, rings, backgrounds)
✅ Clear reasoning preview for each risk
✅ Better information hierarchy

---

## Impact

### For Users
- **Clearer Guidance**: Immediately see which risks are critical (🔴), important (🟡), or optional (⚪)
- **No Confusion**: Each risk appears exactly once
- **Better Prioritization**: Visual hierarchy guides attention to highest-priority risks
- **More Informed**: Risk scores and reasoning are clearly visible

### For System
- **Data Integrity**: Consistent risk IDs prevent duplicates throughout the system
- **Maintainability**: Normalized naming convention makes code more predictable
- **Extensibility**: Tier-based system makes it easy to add new risk categories
- **Performance**: No duplicate processing or rendering

---

## Future Improvements

Potential enhancements:
1. **Localization**: Translate tier labels and badges into Spanish/French
2. **Interactive Tooltips**: Show full reasoning on hover
3. **Risk Comparison**: "Compared to similar businesses, your X risk is Y"
4. **Historical Data**: "In the past 10 years, X has occurred Y times in your area"
5. **Mitigation Previews**: Show strategy preview next to each risk

---

## Conclusion

Fixed critical duplicate risk issue caused by naming inconsistencies and significantly improved UI/UX with a clear 3-tier visual system. Users now get clearer guidance on which risks to prioritize, with no confusion from duplicate entries.


