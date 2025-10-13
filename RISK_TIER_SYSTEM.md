# 3-Tier Risk Categorization System

## Overview
Implemented a sophisticated 3-tier risk categorization system to provide users with clearer guidance on which risks to prioritize in their business continuity plans. This replaces the previous binary "pre-selected vs available" system with more nuanced categorization.

## System Design

### Tier Definitions

#### Tier 1: 🔴 Highly Recommended (Critical Risks)
- **Threshold**: Final risk score >= 7.0/10
- **Status**: Pre-selected ✅
- **User Guidance**: "These risks require immediate attention in your continuity plan"
- **Visual**: Red gradient header with 🔴 emoji
- **Priority**: Critical - Must prepare for these

#### Tier 2: 🟡 Recommended (Important Risks)
- **Threshold**: Final risk score >= 5.0/10 and < 7.0/10
- **Status**: Pre-selected ✅
- **User Guidance**: "These risks are significant and should be included in your preparedness strategy"
- **Visual**: Orange gradient header with 🟡 emoji
- **Priority**: Important - Should prepare for these

#### Tier 3: ⚪ Available (Optional Risks)
- **Threshold**: Final risk score < 5.0/10 OR no location data
- **Status**: NOT pre-selected ❌
- **User Guidance**: "Lower priority for your location/business type, but available if you believe they apply"
- **Visual**: Collapsible gray section with ⚪ emoji
- **Priority**: Optional - Add if relevant to specific situation

## Key Changes

### 1. Updated Threshold Logic (`prepare-prefill-data/route.ts`)

**Before**:
```typescript
MIN_PRESELECT_SCORE: 4.0  // Pre-select if >= 4.0
```

**After**:
```typescript
HIGHLY_RECOMMENDED: 7.0   // Tier 1: Score >= 7.0
RECOMMENDED: 5.0          // Tier 2: Score >= 5.0 and < 7.0
                         // Tier 3: Score < 5.0
```

### 2. New Categorization Function

Added `categorizeRisk()` function that returns:
- `tier`: 1, 2, or 3
- `category`: 'highly_recommended', 'recommended', or 'available'
- `preSelect`: boolean (true for tiers 1 & 2, false for tier 3)
- `userLabel`: User-friendly description for UI

### 3. Enhanced Risk Metadata

Each risk now includes:
```typescript
{
  riskTier: 1 | 2 | 3,
  riskCategory: string,
  userLabel: string,
  // ... existing fields
}
```

### 4. Updated UI (`SimplifiedRiskAssessment.tsx`)

**Three Distinct Sections**:

1. **Highly Recommended Section** (Tier 1)
   - Red gradient header
   - Always visible
   - Shows critical risks requiring immediate attention

2. **Recommended Section** (Tier 2)
   - Orange gradient header
   - Always visible
   - Shows important risks to prepare for

3. **Other Risks Section** (Tier 3)
   - Gray collapsible section
   - Hidden by default
   - User can expand to see optional risks

## Testing Results

### Test Case: Clarendon + Clothing Store

**Location Risk Data** (Clarendon):
- Hurricane: 6/10
- Flood: 6/10
- Earthquake: 3/10
- Drought: 3/10

**Categorization Results**:
```
🟡 HURRICANE - Tier 2 (RECOMMENDED)
   Final Score: 6.4/10 → Pre-selected ✅

🟡 FLOOD - Tier 2 (RECOMMENDED)
   Final Score: 5.6/10 → Pre-selected ✅

⚪ EARTHQUAKE - Tier 3 (AVAILABLE)
   Final Score: 3.8/10 → NOT pre-selected ❌

⚪ DROUGHT - Tier 3 (AVAILABLE)
   Final Score: 3.8/10 → NOT pre-selected ❌
```

**Result**: ✅ System correctly categorizes and pre-selects only significant risks (score >= 5.0)

## Benefits

### For Users
1. **Clearer Guidance**: Immediately see which risks are critical vs important vs optional
2. **Better Prioritization**: Focus effort on highly recommended risks first
3. **Reduced Overwhelm**: Don't pre-select low-priority risks
4. **Visual Hierarchy**: Color-coded sections make priorities obvious

### For the System
1. **More Precise**: Score threshold raised from 4.0 to 5.0 reduces over-selection
2. **Better UX**: Three tiers provide nuanced guidance instead of binary choice
3. **Scalable**: Easy to adjust thresholds based on user feedback
4. **Transparent**: Each tier has clear explanation of why risks are categorized

## Files Modified

1. **`src/app/api/wizard/prepare-prefill-data/route.ts`**
   - Updated `RISK_THRESHOLDS` constant
   - Added `categorizeRisk()` function
   - Updated risk objects to include tier metadata
   - Enhanced logging with tier information

2. **`src/components/SimplifiedRiskAssessment.tsx`**
   - Added `riskTier`, `riskCategory`, `userLabel` to `RiskItem` interface
   - Implemented risk filtering by tier (3 separate arrays)
   - Redesigned UI with 3 distinct sections
   - Updated instructions to reflect tier system

## Implementation Details

### Calculation Flow
```
1. Calculate base score: (locationRisk × 0.6) + (businessImpact × 0.4)
2. Apply multipliers from user inputs
3. Get final risk score (0-10 scale)
4. Categorize:
   - If score >= 7.0 → Tier 1 (Highly Recommended)
   - If score >= 5.0 and < 7.0 → Tier 2 (Recommended)
   - If score < 5.0 → Tier 3 (Available)
5. Pre-select only Tier 1 and Tier 2 risks
```

### UI Presentation
```
📋 Wizard Risk Selection Screen

┌─────────────────────────────────────────────────────────┐
│ 🔴 Highly Recommended - Critical Risks                  │ Always visible
│ (Based on your business location and profile...)        │
├─────────────────────────────────────────────────────────┤
│ [✓] Hurricane (Score: 7.8)                             │
│ [✓] Cyber Attack (Score: 7.2)                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🟡 Recommended - Important Risks to Prepare For        │ Always visible
│ (These risks are significant for your business...)      │
├─────────────────────────────────────────────────────────┤
│ [✓] Flood (Score: 5.6)                                 │
│ [✓] Power Outage (Score: 5.2)                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ⚪ Other Risks - Add if Relevant to Your Business [▼]   │ Collapsible
│ (Lower priority but available if you believe...)        │
├─────────────────────────────────────────────────────────┤
│ [ ] Earthquake (Score: 3.8)                            │ Hidden by default
│ [ ] Drought (Score: 3.8)                               │
│ [ ] Landslide (Score: 2.1)                             │
└─────────────────────────────────────────────────────────┘
```

## Future Enhancements

Potential improvements:
1. **Localization**: Translate tier labels and descriptions into Spanish/French
2. **Admin Configuration**: Allow admins to adjust tier thresholds per country
3. **Analytics**: Track which tier users most commonly modify
4. **Smart Suggestions**: "Based on similar businesses, 85% also prepare for X"
5. **Tier Badges**: Show tier badges throughout the workflow for consistency

## Backwards Compatibility

- Legacy `shouldPreSelectRisk()` function maintained for compatibility
- Existing risk data structures still supported
- Old threshold constants kept with updated values
- Pre-selected risks array still available for summary displays

## Conclusion

The 3-tier risk categorization system provides users with clearer, more actionable guidance on which risks to prioritize. By raising the pre-selection threshold from 4.0 to 5.0 and introducing visual/semantic tiers, we reduce cognitive load while ensuring critical risks are always highlighted.

Testing with Clarendon data confirms the system works as intended, properly categorizing risks based on their final calculated scores.


