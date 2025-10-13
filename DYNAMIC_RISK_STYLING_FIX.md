# Dynamic Risk Styling Without Card Jumping

## Problem Statement

**User Feedback**: "Our current UI/UX is problematic when we change the level of risk manually because it will then jump between risk categories (highly recommended etc.)"

### The Issue
When users adjusted the **Likelihood** or **Severity** sliders for a risk:
- The calculated risk score would change
- This could move the risk between tiers (e.g., 5.8 → 7.2 = Tier 2 → Tier 1)
- The risk card would physically **jump** from one section to another
- This was **jarring** and **confusing** for users

### Example of the Problem
```
User adjusts Hurricane severity from 7 to 9:
Score changes from 6.4 to 7.2

Before adjustment:
🟡 Recommended Section
  [✓] Hurricane (6.4/10)

After adjustment: ❌ CARD JUMPS TO NEW SECTION
🔴 Highly Recommended Section  
  [✓] Hurricane (7.2/10)  ← Card jumped here!
🟡 Recommended Section
  [empty space where Hurricane was]
```

## Solution Implemented

**Keep risks in their original section, but update visual styling dynamically.**

### Key Changes

1. **Section Placement**: Use `initialTier` (from pre-fill) to determine which section a risk appears in
2. **Visual Styling**: Use `currentTier` (from current calculated score) to update colors, badges, borders
3. **Smooth Transitions**: Add CSS transitions so color changes are animated
4. **Dynamic Badges**: Badge text updates based on current tier (Critical Priority, Important, Lower Priority)

### New Behavior
```
User adjusts Hurricane severity from 7 to 9:
Score changes from 6.4 to 7.2

🟡 Recommended Section (card stays here)
  [✓] Hurricane [🔴 Critical Priority] (7.2/10)
      └─ Card STAYS in place
      └─ Colors change from orange → red
      └─ Badge updates from "Important" → "Critical Priority"
      └─ Border changes from orange → red
```

## Implementation Details

### 1. Data Model Updates

Added two new fields to `RiskItem` interface:

```typescript
interface RiskItem {
  // ... existing fields ...
  riskTier?: number // Current tier (updates as user adjusts)
  initialTier?: number // Tier at pre-fill (determines section placement)
  initialRiskScore?: number // Original score (for reference)
}
```

### 2. API Changes (`prepare-prefill-data/route.ts`)

**All risk objects now include initial values**:

```typescript
// For pre-selected risks
riskAssessmentMatrix.push({
  // ... other fields ...
  riskTier: riskCategory.tier,
  initialTier: riskCategory.tier, // ← NEW: Store initial tier
  initialRiskScore: Math.round(finalScore * 10) / 10, // ← NEW: Store initial score
})

// For below-threshold risks
riskAssessmentMatrix.push({
  // ... other fields ...
  initialTier: riskCategory.tier, // ← Always 3 for low-priority
  initialRiskScore: Math.round(finalScore * 10) / 10,
})

// For not-applicable risks
riskAssessmentMatrix.push({
  // ... other fields ...
  initialTier: 3, // ← Always 3 for not applicable
  initialRiskScore: 0,
})
```

### 3. Frontend Changes (`SimplifiedRiskAssessment.tsx`)

#### A. Section Filtering (Uses Initial Tier)

```typescript
// Separate risks by INITIAL tier for display
// This ensures risks stay in their original section

// Tier 1: Highly Recommended - Use initialTier to determine section
const highlyRecommendedRisks = riskItems.filter(item => {
  const tier = item.initialTier || item.riskTier || 
    (item.initialRiskScore >= 7.0 ? 1 : item.initialRiskScore >= 5.0 ? 2 : 3)
  return tier === 1
})

// Tier 2: Recommended
const recommendedRisks = riskItems.filter(item => {
  const tier = item.initialTier || item.riskTier || 
    (item.initialRiskScore >= 7.0 ? 1 : item.initialRiskScore >= 5.0 ? 2 : 3)
  return tier === 2
})

// Tier 3: Available
const availableRisks = riskItems.filter(item => {
  const tier = item.initialTier || item.riskTier || 
    (item.initialRiskScore >= 7.0 ? 1 : item.initialRiskScore >= 5.0 ? 2 : 3)
  return tier === 3 || item.riskLevel === 'not_applicable'
})
```

#### B. Card Rendering (Uses Current Tier)

```typescript
const renderRiskCard = (risk: any, actualIndex: number) => {
  // CRITICAL: Use CURRENT risk score to determine visual styling
  // This allows the card appearance to update as user adjusts sliders
  // But the card stays in its original section (determined by initialTier)
  const currentScore = risk.riskScore || 0
  const currentTier = currentScore >= 7.0 ? 1 : currentScore >= 5.0 ? 2 : 3
  
  // Determine tier badge based on CURRENT calculated score
  let tierBadge = null
  if (currentTier === 1) {
    tierBadge = <span className="...bg-red-100 text-red-700...">
      🔴 Critical Priority
    </span>
  } else if (currentTier === 2) {
    tierBadge = <span className="...bg-orange-100 text-orange-700...">
      🟡 Important
    </span>
  } else if (!isAvailable) {
    tierBadge = <span className="...bg-gray-100 text-gray-700...">
      ⚪ Lower Priority
    </span>
  }
  
  // Card styling based on currentTier (not initialTier!)
  return (
    <div className={`
      border-2 rounded-lg transition-all duration-300
      ${currentTier === 1 ? 'border-red-400 shadow-lg ring-2 ring-red-200' : ''}
      ${currentTier === 2 ? 'border-orange-400 shadow-lg ring-2 ring-orange-200' : ''}
    `}>
      {/* Card content */}
    </div>
  )
}
```

#### C. Smooth Transitions

Added `transition-all duration-300` to elements that change:

```typescript
// Card border/shadow
className="... transition-all duration-300"

// Background color
className="... transition-colors duration-300"

// Checkbox color
className="... transition-all duration-300"

// Risk score text color
className={`font-bold transition-colors duration-300 ${
  currentTier === 1 ? 'text-red-700' :
  currentTier === 2 ? 'text-orange-700' :
  'text-gray-700'
}`}
```

## Visual Examples

### Example 1: Hurricane (Initial Tier 2, Adjusted to Tier 1)

**Before Adjustment** (Score: 6.4, Tier 2):
```
🟡 Recommended - Important Risks to Prepare For
┌────────────────────────────────────────────────────┐
│ [✓] Hurricane          [🟡 Important]             │
│     Risk Score: 6.4/10 (Likelihood: 6, Impact: 7) │
│     🟡 Orange border, orange checkbox              │
└────────────────────────────────────────────────────┘
```

**User adjusts Impact slider: 7 → 9**

**After Adjustment** (Score: 7.2, Tier 1):
```
🟡 Recommended - Important Risks to Prepare For
┌────────────────────────────────────────────────────┐
│ [✓] Hurricane          [🔴 Critical Priority]     │
│     Risk Score: 7.2/10 (Likelihood: 6, Impact: 9) │
│     🔴 Red border, red checkbox, red score         │
│     ↑ Card stayed in same section!                 │
│     ↑ Colors smoothly transitioned (300ms)         │
└────────────────────────────────────────────────────┘
```

### Example 2: Flood (Initial Tier 2, Adjusted to Tier 3)

**Before Adjustment** (Score: 5.6, Tier 2):
```
🟡 Recommended - Important Risks to Prepare For
┌────────────────────────────────────────────────────┐
│ [✓] Flood              [🟡 Important]             │
│     Risk Score: 5.6/10 (Likelihood: 6, Impact: 5) │
│     🟡 Orange styling                              │
└────────────────────────────────────────────────────┘
```

**User adjusts Likelihood slider: 6 → 3**

**After Adjustment** (Score: 3.8, Tier 3):
```
🟡 Recommended - Important Risks to Prepare For
┌────────────────────────────────────────────────────┐
│ [✓] Flood              [⚪ Lower Priority]        │
│     Risk Score: 3.8/10 (Likelihood: 3, Impact: 5) │
│     ⚪ Gray styling (no special emphasis)          │
│     ↑ Card stayed in Recommended section           │
└────────────────────────────────────────────────────┘
```

## Benefits

### For Users
✅ **No jarring card movements** - Risks stay where users expect them
✅ **Clear visual feedback** - Colors and badges update to show new priority
✅ **Smooth transitions** - Changes feel polished, not abrupt
✅ **Predictable behavior** - Section structure remains stable
✅ **Easy to experiment** - Users can adjust sliders without losing track of risks

### For System
✅ **Better UX** - Maintains spatial consistency
✅ **Reduced cognitive load** - Users don't have to relocate cards
✅ **Flexible** - Visual styling is reactive to score changes
✅ **Maintainable** - Clear separation between placement logic and styling logic

## Technical Details

### Transition Timing
- **Duration**: 300ms (fast enough to feel responsive, slow enough to see the change)
- **Properties**: All properties with `transition-all` or specific `transition-colors`
- **Easing**: Default CSS easing (ease)

### Fallback Logic
If `initialTier` is not provided (backward compatibility):
```typescript
const tier = item.initialTier || item.riskTier || 
  (item.initialRiskScore >= 7.0 ? 1 : item.initialRiskScore >= 5.0 ? 2 : 3)
```

### Color Scheme

| Tier | Badge | Border | Checkbox | Score Text | Background (selected) |
|------|-------|--------|----------|------------|----------------------|
| 1 (Critical) | 🔴 Red | `border-red-400` | `text-red-600` | `text-red-700` | `bg-red-50` |
| 2 (Important) | 🟡 Orange | `border-orange-400` | `text-orange-600` | `text-orange-700` | `bg-orange-50` |
| 3 (Lower) | ⚪ Gray | `border-gray-200` | `text-blue-600` | `text-gray-700` | `bg-gray-50` |

## Files Modified

### 1. **`src/components/SimplifiedRiskAssessment.tsx`**
- Added `initialTier` and `initialRiskScore` to `RiskItem` interface
- Updated section filtering to use `initialTier` for placement
- Updated card rendering to use `currentTier` for styling
- Added smooth CSS transitions
- Added dynamic tier badges with current priority

### 2. **`src/app/api/wizard/prepare-prefill-data/route.ts`**
- Added `initialTier` and `initialRiskScore` to all risk objects
- Ensures initial values are set for all risk types:
  - Pre-selected risks
  - Below-threshold risks
  - Admin unit-only risks
  - Not-applicable risks
  - Missing risk types

## Testing Scenarios

### Scenario 1: Adjust Upward (Tier 2 → Tier 1)
1. Start with Hurricane in "Recommended" section (score 6.4)
2. Increase Impact from 7 to 9
3. **Expected**: Card stays in "Recommended" section, colors change to red, badge changes to "Critical Priority"
4. **Result**: ✅ Card stays in place, smooth color transition

### Scenario 2: Adjust Downward (Tier 2 → Tier 3)
1. Start with Flood in "Recommended" section (score 5.6)
2. Decrease Likelihood from 6 to 3
3. **Expected**: Card stays in "Recommended" section, colors change to gray, badge changes to "Lower Priority"
4. **Result**: ✅ Card stays in place, smooth color transition

### Scenario 3: Multiple Adjustments
1. Start with risk at any tier
2. Adjust sliders multiple times in both directions
3. **Expected**: Card always stays in original section, colors update smoothly each time
4. **Result**: ✅ No jumps, smooth transitions throughout

## Comparison: Before vs After

### Before (Problem)
❌ Cards jump between sections when score changes
❌ Jarring user experience
❌ Hard to track risks after adjustments
❌ Confusing spatial layout changes
❌ Users lose their place

### After (Solution)
✅ Cards stay in original sections
✅ Smooth, predictable experience
✅ Easy to track risks
✅ Stable spatial layout
✅ Users always know where risks are
✅ Visual feedback through color changes
✅ Animated transitions feel polished

## Future Enhancements

Potential improvements:
1. **Undo/Reset**: Button to reset risk to original values
2. **Comparison View**: Show original vs current score side-by-side
3. **Visual History**: Indicator showing how much user has adjusted from original
4. **Smart Suggestions**: "Based on similar businesses, most set Hurricane to 8/10"
5. **Tooltips**: Hover over badge to see exact score thresholds

## Conclusion

Successfully resolved the card jumping issue by separating **placement logic** (based on initial tier) from **styling logic** (based on current tier). Users can now adjust risk assessments freely without the disruptive experience of cards moving between sections. The smooth color transitions provide clear visual feedback while maintaining spatial consistency.

This is a significant UX improvement that makes the risk assessment process more intuitive and user-friendly.


