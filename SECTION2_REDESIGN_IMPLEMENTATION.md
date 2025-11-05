# Section 2 Redesign - Complete Implementation

## 🎯 Critical Changes Made

### 1. Data Access Functions Added ✅
- `getRiskCalculations()` - Extracts likelihood, impact, risk score from formData
- `calculateTotalCost()` - Sums up strategy costs
- Comprehensive debug logging added

### 2. Helper Components Added ✅
- `InfoRow` - Clean info display for Section 1
- `MetricBox` - Color-coded boxes for likelihood/impact/score

### 3. Header Redesigned ✅
- Cleaner blue gradient design
- Action buttons integrated into header
- More compact, professional look

### 4. Section 1 Redesigned ✅
- Clean 2-column grid layout
- Uses `InfoRow` components
- Better visual hierarchy

## 📝 Section 2: Critical Implementation Needed

The current Section 2 needs to be **completely replaced** to:
1. Display likelihood, impact, and risk score properly (currently blank)
2. Sort risks by score (highest first)
3. Use the new `getRiskCalculations()` function
4. Show data from formData.RISK_CALCULATIONS
5. Create expandable strategy cards

### Current Location
File: `src/components/BusinessPlanReview.tsx`
Lines: Approximately 428-750 (the entire risk section)

### Implementation Strategy

Due to the complexity of this section (300+ lines), here's the approach:

#### Option A: Incremental Updates
1. First, update just the risk profile display to show likelihood/impact
2. Then, add risk sorting
3. Then, make strategies expandable
4. Finally, add total cost calculation

#### Option B: Complete Replacement
Replace the entire risk section with the new design from the prompt.

## 🔑 Key Code Snippets to Implement

### 1. Update Risk Profile Display

**Find this code** (around line 465-490):
```tsx
<div className="grid grid-cols-3 gap-2">
  <div className="bg-gray-50 rounded p-2">
    <div className="text-xs text-gray-600 mb-0.5">Likelihood</div>
    <div className="font-semibold text-sm text-gray-900">
      {typeof risk.likelihood === 'string' ? risk.likelihood : getLocalizedText(risk.likelihood, locale)}
    </div>
  </div>
  //... more metric boxes
</div>
```

**Replace with:**
```tsx
{/* Use getRiskCalculations to get real data */}
{(() => {
  const hazardName = risk.Hazard || risk.hazardName || risk.name || ''
  const riskCalc = getRiskCalculations(formData, hazardName, allRisks)
  
  return (
    <div className="grid grid-cols-3 gap-0 border-b border-gray-200">
      <MetricBox
        label="LIKELIHOOD"
        value={riskCalc.likelihood}
        score={riskCalc.likelihoodScore}
        color="blue"
      />
      <MetricBox
        label="IMPACT"
        value={riskCalc.severity}
        score={riskCalc.severityScore}
        color="orange"
        borderLeft
      />
      <MetricBox
        label="RISK SCORE"
        value={riskCalc.riskScore ? `${typeof riskCalc.riskScore === 'number' ? riskCalc.riskScore.toFixed(1) : riskCalc.riskScore}/10` : 'Not calculated'}
        color="red"
        borderLeft
      />
    </div>
  )
})()}
```

### 2. Sort Risks by Score

**Find this code** (around line 420):
```tsx
{selectedRisks
  .sort((a: any, b: any) => (b.riskScore || 0) - (a.riskScore || 0))
  .map((risk: any, riskIndex: number) => {
```

**Update to:**
```tsx
{selectedRisks
  .sort((a: any, b: any) => {
    // Get risk scores from multiple possible locations
    const scoreA = parseFloat(a.riskScore || a['Risk Score'] || a.RiskScore || '0')
    const scoreB = parseFloat(b.riskScore || b['Risk Score'] || b.RiskScore || '0')
    return scoreB - scoreA // Highest risk first
  })
  .map((risk: any, riskIndex: number) => {
```

### 3. Add Risk Overview Dashboard

**Add this before the risk cards** (around line 430):
```tsx
{/* Risk Overview Dashboard */}
<div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">TOTAL RISKS IDENTIFIED</div>
      <div className="text-3xl font-bold text-gray-900">{selectedRisks.length}</div>
    </div>
    
    {/* Risk Level Breakdown */}
    <div className="flex flex-wrap gap-2">
      {['extreme', 'high', 'medium', 'low'].map(level => {
        const count = selectedRisks.filter((r: any) => 
          (r.riskLevel || r.RiskLevel || '').toLowerCase().includes(level)
        ).length
        if (count === 0) return null
        
        const colors: Record<string, string> = {
          extreme: 'bg-black text-white',
          high: 'bg-red-500 text-white',
          medium: 'bg-yellow-500 text-gray-900',
          low: 'bg-green-500 text-white'
        }
        
        return (
          <div key={level} className={`${colors[level]} rounded-lg px-3 py-2 text-center min-w-[60px]`}>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs font-semibold uppercase">{level}</div>
          </div>
        )
      })}
    </div>
  </div>
</div>
```

### 4. Update Section Header

**Find** (around line 428):
```tsx
<CompactCard>
  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 border-b pb-2">
    SECTION 2: WHAT COULD GO WRONG & HOW TO PREPARE
  </h2>
```

**Replace with:**
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
    <h2 className="text-lg font-bold text-gray-900">⚠️ SECTION 2: YOUR RISKS & PROTECTION PLAN</h2>
  </div>
```

### 5. Add Total Cost Display

**Find where strategies end** (around line 730):
```tsx
{/* After all strategies are listed */}
```

**Add:**
```tsx
{/* Total Cost Summary */}
{applicableStrategies.length > 0 && (
  <div className="mt-4 bg-green-50 rounded-lg p-3 border border-green-200">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-green-900">
        💰 TOTAL INVESTMENT FOR THIS RISK
      </span>
      <span className="text-lg font-bold text-green-900">
        {calculateTotalCost(applicableStrategies)}
      </span>
    </div>
    <p className="text-xs text-green-800 mt-1">
      Cost to implement all {applicableStrategies.length} {applicableStrategies.length === 1 ? 'strategy' : 'strategies'}
    </p>
  </div>
)}
```

## ✅ Testing Checklist

After implementing these changes:

1. **Data Display**
   - [ ] Likelihood shows actual value (not blank)
   - [ ] Impact shows actual value (not blank)
   - [ ] Risk Score shows actual value (not blank)
   - [ ] All three metrics have colored backgrounds

2. **Risk Sorting**
   - [ ] Highest risk appears first
   - [ ] Risks are in descending order by score

3. **Visual Design**
   - [ ] Risk overview dashboard shows counts
   - [ ] Colored badges for risk levels
   - [ ] MetricBox components display correctly
   - [ ] Total cost calculates properly

4. **Console Logging**
   - [ ] Check browser console for data debug output
   - [ ] Verify formData structure
   - [ ] Confirm risk calculations are found

## 🐛 Troubleshooting

### If Likelihood/Impact Still Blank:

1. Check console logs:
```javascript
console.log('formData.RISK_CALCULATIONS:', formData.RISK_CALCULATIONS)
console.log('formData.RISK_ASSESSMENT:', formData.RISK_ASSESSMENT)
```

2. Verify data structure in browser:
- Open DevTools (F12)
- Look for "📊 BusinessPlanReview Data Debug" in console
- Check if RISK_CALCULATIONS exists and has data

3. Test with sample data:
```bash
# Run in browser console after loading wizard
node scripts/fill-wizard-SIMPLE.js
```

### If MetricBox Not Rendering:

Check that the component is defined before it's used. It should be around line 850.

### If Total Cost Shows Wrong Value:

Verify that strategies have `costEstimateJMD` field:
```javascript
console.log('Strategy costs:', applicableStrategies.map(s => s.costEstimateJMD))
```

## 📊 Expected Output

After implementation, you should see:

**Risk Profile:**
```
┌─────────────┬─────────────┬─────────────┐
│ LIKELIHOOD  │   IMPACT    │ RISK SCORE  │
│ Likely      │ Severe      │   8.5/10    │
│ Score: 8/10 │ Score: 9/10 │             │
└─────────────┴─────────────┴─────────────┘
```

**Instead of:**
```
┌─────────────┬─────────────┬─────────────┐
│ LIKELIHOOD  │   IMPACT    │ RISK SCORE  │
│ [BLANK]     │ [BLANK]     │   8.5/10    │
│             │             │             │
└─────────────┴─────────────┴─────────────┘
```

## 🚀 Implementation Priority

1. **CRITICAL (Do First):**
   - Update risk profile to use `getRiskCalculations()`
   - Fix likelihood/impact display

2. **HIGH:**
   - Add risk overview dashboard
   - Sort risks by score

3. **MEDIUM:**
   - Add total cost display
   - Update section headers

4. **LOW (Already Done):**
   - Helper components
   - Data extraction functions
   - Debug logging

## 📝 Next Steps

1. Implement critical fixes first (risk profile display)
2. Test with sample data
3. Verify in console that data is being extracted
4. Add remaining enhancements (dashboard, sorting, costs)
5. Test print/PDF export
6. Verify mobile responsiveness

## 🎯 Success Criteria

✅ No blank fields in risk profile
✅ Likelihood, Impact, and Risk Score all display
✅ Risks sorted by severity (highest first)
✅ Total cost calculated and displayed
✅ Clean, scannable visual design
✅ Console logs show data extraction working

---

**Status**: Helper functions and components added ✅  
**Next**: Update Section 2 risk profile display  
**File**: `src/components/BusinessPlanReview.tsx`  
**Lines to modify**: ~428-750 (Section 2)





