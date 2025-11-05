# How to Fill the Wizard with Sample Data

## The Problem You're Solving

You want to quickly review what a completed business continuity plan document looks like at the end of the wizard, without manually filling out all 10 steps.

## The Solution - ONE Script Does Everything

There's **ONE script** that fills **EVERYTHING**:
- Sets industry (Hospitality & Tourism) and location (Christ Church, Barbados)
- Fills business characteristics
- Fills ALL 10 wizard steps with complete data
- Provides sample risks and strategies

## How to Use It

### Option 1: Dev Button (Easiest)

1. Make sure dev server is running: `npm run dev`
2. Open the wizard in your browser
3. Look in the **bottom-left corner**
4. Click the purple **"Fill with Sample Data"** button
5. Page refreshes automatically
6. Done! Navigate to the last step to see the complete plan document

### Option 2: Browser Console

1. Open the wizard in your browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Copy the ENTIRE contents of `public/fill-complete-plan.js`
5. Paste into console and press Enter
6. Page refreshes automatically after 2 seconds
7. Done! Navigate to the last step to see the complete plan document

## What Gets Filled

✅ **ALL 10 Wizard Steps:**

1. **Plan Information** - Company name, managers, version, storage locations
2. **Business Overview** - Purpose, services, markets, competitive advantages
3. **Essential Functions** - 6 categories with 24 specific functions
4. **Function Priorities** - 9 functions with priority levels and downtime tolerances
5. **Risk Assessment** - 6 detailed risks (Hurricane, Power, Water, Cyber, Staff, Supply)
6. **Strategies** - 32 selected strategies + long-term risk reduction plan
7. **Action Plan** - 6-person emergency team + communication, evacuation, and work location plans
8. **Contacts & Information** - 20+ contacts (staff, suppliers, customers, emergency services)
9. **Vital Records** - 8 critical record types with storage details
10. **Testing & Maintenance** - Testing schedules, training, metrics, improvements, review process

## Viewing the Complete Document

After filling:
1. Navigate through the wizard steps (or click through to the end)
2. On the **last step**, you'll see the **Business Plan Review** document
3. This shows the complete, formatted business continuity plan
4. Use the **"Print"** button to see the print-friendly version
5. Use the **"Download PDF"** button to export (when available)

## Clearing Data to Start Fresh

### Using Dev Button
Click the red **"Clear Data"** button (bottom-left)

### Using Console
```javascript
localStorage.clear()
location.reload()
```

## Troubleshooting

### "Nothing happens when I click the button"
1. Check browser console (F12) for errors
2. Make sure you're running the dev server (`npm run dev`)
3. Try the console method instead

### "Some sections are still empty"
1. Run this in console to check what's saved:
   ```javascript
   const data = JSON.parse(localStorage.getItem('bcp-draft'))
   console.log('Sections:', Object.keys(data))
   console.log('Risks:', data.RISK_ASSESSMENT)
   console.log('Strategies:', data.STRATEGIES)
   ```
2. If something's missing, clear data and try again

### "Risks show 'No Risks Loaded'"
This means you're trying to use the NORMAL wizard flow (not the sample data).

For the normal flow, you need to:
1. Clear all data
2. Start wizard from beginning
3. Select industry AND location (complete all 3 steps of industry selector)
4. The API will then generate risks

But for TESTING the review document, just use the sample data script - it bypasses all of that.

## The Files

- **`public/fill-complete-plan.js`** - The ONE script that does everything (use this)
- **`src/components/DevDataFiller.tsx`** - The dev button component (uses the script)
- **`scripts/*`** - Old/deprecated scripts (ignore these)

## That's It!

Just click the button or run the script. Everything will be filled. Navigate to the last step to see the complete document.

If you have ANY issues, just:
1. Clear data (`localStorage.clear(); location.reload()`)
2. Run the script again
3. Should work

The script fills a COMPLETE plan for "Caribbean Resort & Spa Ltd." - a 150-room luxury beachfront resort in Barbados.







