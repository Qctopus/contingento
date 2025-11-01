# Risk Loading Issue - Diagnostic & Fix

## The Issue

You're seeing:
```
No Risks Loaded
Risk assessment should be automatically loaded from your business profile.

✓ PreFill data available: Hospitality & Tourism
✓ Location: Christ Church
But no hazards found in prefill data.
```

This means:
- ✅ PreFill data exists in localStorage
- ✅ Industry and Location are set
- ❌ But the `hazards` array is empty

## Why This Happens

The `/api/wizard/prepare-prefill-data` API should populate `preFillData.hazards` when you select your industry and location. If this array is empty, it means either:

1. The API wasn't called properly
2. The API didn't return hazards (database issue)
3. The IndustrySelector didn't complete all steps
4. There's a bug in how the data is stored

## Diagnostic Steps

### Step 1: Check What's Actually Saved

Open browser console (F12) and run:

```javascript
// Copy and paste scripts/debug-prefill-data.js
// OR just run this:
const data = JSON.parse(localStorage.getItem('bcp-prefill-data'))
console.log('Hazards:', data.hazards)
console.log('Full prefill data:', data)
```

This will show you:
- ✅ If hazards array exists
- ✅ How many hazards are in it
- ✅ The full structure of your prefill data

### Step 2: Check Browser Console for Errors

Look for API errors like:
- `Failed to prepare pre-fill data`
- `Error preparing pre-fill data`
- Network errors (500, 404, etc.)

### Step 3: Verify Industry Selector Completion

Did you complete ALL 3 steps of the industry selector?
1. ✅ Industry selection
2. ✅ Location selection (Country + Parish/Region)
3. ✅ Business characteristics (this step calls the API)

If you skipped step 3, the API won't be called and hazards won't be loaded.

## The Fix

### Quick Fix: Clear and Re-select

1. Open browser console (F12)
2. Run: `localStorage.clear(); location.reload()`
3. Start the wizard again
4. **Complete ALL 3 industry selector steps**
5. Watch the console for any API errors

### Alternative: Manually Check API

You can manually test the API:

```javascript
fetch('/api/wizard/prepare-prefill-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    businessTypeId: 'hospitality_tourism',
    location: {
      country: 'Barbados',
      countryCode: 'BB',
      parish: 'Christ Church',
      nearCoast: true,
      urbanArea: true
    },
    businessCharacteristics: {
      employeeCount: '10-50',
      hasPhysicalLocation: true,
      hasInventory: true,
      hasCustomerData: true
    },
    locale: 'en'
  })
})
.then(r => r.json())
.then(data => {
  console.log('API Response:', data)
  console.log('Hazards:', data.hazards)
  console.log('Number of hazards:', data.hazards?.length)
})
.catch(err => console.error('API Error:', err))
```

If this returns hazards, the API works and the issue is in the wizard flow.
If this returns NO hazards, the issue is in the API/database.

## Expected Result

After proper industry selection, you should have:

```javascript
preFillData.hazards = [
  {
    hazardId: 'hurricane',
    hazardName: 'Hurricane/Tropical Storm',
    likelihood: 7,
    severity: 9,
    riskLevel: 'very_high',
    riskScore: 8.5,
    isPreSelected: true,
    reasoning: '...',
    // ... more fields
  },
  // ... 5-10 more hazards
]
```

## Workaround: Use Sample Data

If you just want to test the review document, use the sample data fill:

### Method 1: Dev Button
1. Click "Fill with Sample Data" (bottom-left, purple button)
2. Page refreshes with EVERYTHING filled including risks

### Method 2: Console Script  
```javascript
// Paste contents of scripts/fill-wizard-SIMPLE.js
```

This bypasses the industry selector entirely and gives you a complete plan.

## If Problem Persists

### Check Database

The API gets hazards from:
1. Business Types table (vulnerability data)
2. Admin Units table (location risk data)
3. Multipliers table (risk adjustment factors)

If any of these tables are empty or missing data for "Hospitality & Tourism" in Barbados, Christ Church, the API will return empty hazards.

### Check API Response

Add logging to `src/app/api/wizard/prepare-prefill-data/route.ts`:

Around line 875, add:
```typescript
console.log('🎯 Hazards being returned:', preFillData.hazards)
console.log('🎯 Number of hazards:', preFillData.hazards.length)
```

Then check server logs (terminal where `npm run dev` is running).

### Check Component Props

Add logging to `src/components/SimplifiedRiskAssessment.tsx`:

Around line 104, add:
```typescript
console.log('🎯 SimplifiedRiskAssessment preFillData:', preFillData)
console.log('🎯 Hazards received:', preFillData?.hazards)
```

Then check browser console to see if the component is receiving the data.

## Debug Scripts

Three scripts available:

1. **`scripts/debug-wizard-data.js`** - Shows ALL wizard data
2. **`scripts/debug-prefill-data.js`** - Shows ONLY prefill data (industry, location, hazards)
3. **`scripts/fill-wizard-SIMPLE.js`** - Fills wizard with complete sample data

All available in browser at:
- `/scripts/debug-wizard-data.js`
- `/scripts/debug-prefill-data.js`
- `/scripts/fill-wizard-SIMPLE.js`

## Next Steps

1. Run `scripts/debug-prefill-data.js` to diagnose
2. Clear data and re-select industry (complete all 3 steps)
3. If still broken, manually test the API
4. If API is broken, check database
5. As workaround, use sample data fill

Let me know what the debug script shows!


