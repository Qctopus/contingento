# Smart Risk Threshold Logic - Implementation Guide

## Overview

The Smart Risk Threshold system ensures that users only see risks that are **actually meaningful** for their specific business situation. Instead of pre-selecting ANY risk where location data exists, we now calculate the **complete final risk score** (including multipliers) and only pre-select risks that meet a configurable threshold.

## Problem Solved

**Before:** If a location had ANY risk data (e.g., flood level = 2/10), the risk would be pre-selected, overwhelming users with low-relevance risks.

**After:** Only risks with a final calculated score >= 4.0 are pre-selected, while lower risks remain available for manual selection.

## How It Works

### 1. **Risk Score Calculation Flow**

```
Location Risk (0-10) ──┐
                       ├──> Base Score ──> Apply Multipliers ──> Final Score (0-10)
Business Impact (0-10) ┘                                              │
                                                                      ▼
                                                       Compare to Thresholds
                                                                      │
                                                    ┌─────────────────┴─────────────────┐
                                                    │                                   │
                                             Score >= 4.0?                        Score >= 7.0?
                                                    │                                   │
                                                    ▼                                   ▼
                                            PRE-SELECTED                      FORCE PRE-SELECTED
                                                                                  (Critical Risk)
```

### 2. **Threshold Configuration**

Located in: `src/app/api/wizard/prepare-prefill-data/route.ts`

```typescript
const RISK_THRESHOLDS = {
  MIN_PRESELECT_SCORE: 4.0,  // Minimum score to pre-select (medium+)
  FORCE_PRESELECT_SCORE: 7.0  // Always pre-select (critical risks)
}
```

**Recommended Values:**
- **MIN_PRESELECT_SCORE: 4.0** - Captures medium, high, and very high risks
- **FORCE_PRESELECT_SCORE: 7.0** - Ensures critical risks are always shown

### 3. **Pre-Selection Decision Logic**

```typescript
function shouldPreSelectRisk(finalScore, hasLocationData, locationRiskLevel) {
  // Case 1: No location data → Never pre-select
  if (!hasLocationData || locationRiskLevel === null || locationRiskLevel === 0) {
    return false
  }
  
  // Case 2: Critical risk → ALWAYS pre-select
  if (finalScore >= RISK_THRESHOLDS.FORCE_PRESELECT_SCORE) {
    return true
  }
  
  // Case 3: Meets threshold → Pre-select
  if (finalScore >= RISK_THRESHOLDS.MIN_PRESELECT_SCORE) {
    return true
  }
  
  // Case 4: Below threshold → Available only
  return false
}
```

## Example Scenarios

### Scenario 1: High Location Risk + Low Business Impact
**Example:** Flood in Kingston (8/10) for Bar/Lounge (flood impact: 3/10)

```
Base Score = (8 × 0.6) + (3 × 0.4) = 6.0
After Multipliers = ~5.2
Final Score = 5.2 → ABOVE threshold (>= 4.0)
Result: ✅ PRE-SELECTED
```

### Scenario 2: Low Location Risk + High Business Impact
**Example:** Drought in Trelawny (2/10) for Hotel (drought impact: 8/10)

```
Base Score = (2 × 0.6) + (8 × 0.4) = 4.4
After Multipliers = ~3.8
Final Score = 3.8 → BELOW threshold (< 4.0)
Result: 📋 AVAILABLE (not pre-selected)
```

### Scenario 3: High + High = Critical Risk
**Example:** Hurricane in Kingston (9/10) for Hotel (hurricane impact: 9/10)

```
Base Score = (9 × 0.6) + (9 × 0.4) = 9.0
After Multipliers = ~8.5
Final Score = 8.5 → CRITICAL (>= 7.0)
Result: 🔴 FORCE PRE-SELECTED (always shown)
```

### Scenario 4: Low + Low = Not Relevant
**Example:** Earthquake in rural area (1/10) for Office (earthquake impact: 2/10)

```
Base Score = (1 × 0.6) + (2 × 0.4) = 1.4
After Multipliers = ~1.2
Final Score = 1.2 → BELOW threshold (< 4.0)
Result: 📋 AVAILABLE (not pre-selected)
```

## Risk Object Structure

### Pre-Selected Risk (Score >= 4.0)
```json
{
  "hazard": "Hurricane",
  "hazardId": "hurricane",
  "likelihood": 9,
  "severity": 8,
  "riskScore": 8.5,
  "riskLevel": "very_high",
  "isPreSelected": true,
  "isAvailable": true,
  "source": "combined",
  "reasoning": "📍 Location Risk: 9/10...\n✅ PRE-SELECTED: Critical risk (score >= 7.0)"
}
```

### Below-Threshold Risk (Score < 4.0)
```json
{
  "hazard": "Drought",
  "hazardId": "drought",
  "likelihood": 2,
  "severity": 8,
  "riskScore": 3.8,
  "riskLevel": "low",
  "isPreSelected": false,
  "isAvailable": true,
  "source": "below_threshold",
  "reasoning": "📍 Location risk: 2/10 in Trelawny\n🏢 Business impact: 8/10 for Hotel\n⚖️ Final risk score: 3.8/10 - below threshold (4.0) for pre-selection\n💡 This risk exists in your area but has low overall impact..."
}
```

## User Experience

### What Users See

**Pre-Selected Risks (Score >= 4.0):**
- ✅ Automatically checked in the wizard
- 🔴 Critical risks (>= 7.0) highlighted prominently
- Full calculation details and reasoning provided

**Available Risks (Score < 4.0):**
- ⚪ Unchecked but visible in the list
- Clear explanation of why it's not pre-selected
- Users can manually select if they believe it's relevant
- Includes location and business impact data for transparency

## Benefits

### 1. **User-Focused**
Only shows risks that are actually meaningful for their business, reducing cognitive overload.

### 2. **Intelligent**
Considers the complete picture: location × business type × multipliers, not just raw data.

### 3. **Configurable**
Admins can adjust thresholds without code changes (just modify the constants).

### 4. **Transparent**
Clear reasoning shows why risks are/aren't pre-selected, building user trust.

### 5. **Flexible**
Users can still manually add any available risk if they know it's relevant to their situation.

### 6. **Scalable**
Works with unlimited risk types through the dynamic risk system.

## Testing

### Run the Test Suite

```bash
node scripts/test-smart-threshold-logic.js
```

This will test:
- ✅ High location + low business impact
- ✅ Low location + high business impact
- ✅ High location + high business impact (pre-selected)
- ✅ Critical risks (always pre-selected)
- ✅ Threshold validation logic

### Expected Test Results

```
Pre-Selected Risks: 4-6 (only meaningful ones)
Available Risks: 7-9 (below threshold or no data)
Below Threshold: 2-4 (location data exists but score < 4.0)
```

## Configuration Guidelines

### Adjusting Thresholds

**To make MORE risks pre-select (more lenient):**
```typescript
MIN_PRESELECT_SCORE: 3.0  // Include low-medium risks
FORCE_PRESELECT_SCORE: 6.0  // Lower critical threshold
```

**To make FEWER risks pre-select (more strict):**
```typescript
MIN_PRESELECT_SCORE: 5.0  // Only high+ risks
FORCE_PRESELECT_SCORE: 8.0  // Only very high critical risks
```

**Current Recommended (balanced):**
```typescript
MIN_PRESELECT_SCORE: 4.0  // Medium+ risks (balanced)
FORCE_PRESELECT_SCORE: 7.0  // High+ critical risks
```

### Impact Analysis

| Threshold | Pre-Selected Risks (Typical) | User Experience |
|-----------|------------------------------|-----------------|
| 3.0 | 6-8 risks | More comprehensive, might overwhelm some users |
| 4.0 | 4-6 risks | **Balanced - Recommended** |
| 5.0 | 2-4 risks | Focused, might miss some relevant risks |

## Future Enhancements

### Admin UI Configuration (Optional)

Could add to admin panel:

```typescript
// Admin settings interface
{
  riskThresholds: {
    minPreSelectScore: 4.0,  // Slider: 2.0 - 6.0
    forcePreSelectScore: 7.0, // Slider: 6.0 - 9.0
    enableSmartThresholds: true // Toggle on/off
  }
}
```

### Country/Region-Specific Thresholds

Could vary thresholds by location:

```typescript
const REGIONAL_THRESHOLDS = {
  'JM': { MIN_PRESELECT_SCORE: 4.0, FORCE_PRESELECT_SCORE: 7.0 },
  'TT': { MIN_PRESELECT_SCORE: 4.5, FORCE_PRESELECT_SCORE: 7.5 },
  // More hurricane-prone areas might have stricter thresholds
}
```

### Business Type-Specific Thresholds

Could adjust based on business criticality:

```typescript
const BUSINESS_TYPE_MODIFIERS = {
  'hospital': -1.0,  // Pre-select more risks (more critical)
  'hotel': 0.0,      // Standard
  'retail': +0.5     // Pre-select fewer risks (less critical)
}
```

## Technical Implementation

### Key Functions

1. **`calculateFinalRiskScore()`** - Calculates complete risk score with multipliers
2. **`shouldPreSelectRisk()`** - Determines if risk meets threshold
3. **`determineRiskLevel()`** - Converts score to risk level category

### Integration Points

- **Route:** `src/app/api/wizard/prepare-prefill-data/route.ts`
- **Lines:** ~350-510 (main pre-selection logic)
- **Dependencies:** 
  - `applyMultipliers()` from `multiplierService`
  - Parish risk data from database
  - Business type vulnerability data

### Backward Compatibility

✅ Fully backward compatible:
- Existing multiplier system unchanged
- Parish risk data format unchanged
- API response structure enhanced (not breaking)
- Frontend can still read old and new formats

## Monitoring & Analytics

### Log Messages to Watch

```
✅ PRE-SELECTED - meets threshold (final score 6.2/10 >= 4.0)
📋 AVAILABLE (below threshold) - final score 3.2/10 < 4.0
🔴 FORCE PRE-SELECTED - Critical risk (score >= 7.0)
```

### Metrics to Track

- Average number of pre-selected risks per wizard session
- % of users who manually add below-threshold risks
- Distribution of final risk scores
- Threshold effectiveness by business type

## Support & Troubleshooting

### Common Issues

**Issue:** Too many risks pre-selected
**Solution:** Increase `MIN_PRESELECT_SCORE` (try 4.5 or 5.0)

**Issue:** Too few risks pre-selected
**Solution:** Decrease `MIN_PRESELECT_SCORE` (try 3.5 or 3.0)

**Issue:** Critical risks not showing
**Solution:** Check `FORCE_PRESELECT_SCORE` is not too high (should be ~7.0)

### Debug Mode

Enable detailed logging by checking console output:
- Each risk shows: location risk, business impact, final score, threshold comparison
- Clear markers indicate pre-selection decision reasoning

## Conclusion

The Smart Risk Threshold system transforms the wizard from showing "everything that exists" to showing "everything that matters." This intelligent pre-selection improves user experience while maintaining full flexibility and transparency.

**Key Takeaway:** Final score >= 4.0 → Pre-select. Simple, effective, user-focused.

