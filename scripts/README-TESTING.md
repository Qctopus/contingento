# Testing the Wizard with Sample Data

## Quick Start

There are **3 ways** to fill the wizard with sample data for testing:

### Option 1: Dev Button (EASIEST - Recommended)
1. Start the dev server: `npm run dev`
2. Open the wizard in your browser
3. Look for the purple **"Fill with Sample Data"** button in the bottom-left corner
4. Click it and the page will refresh with all data filled

### Option 2: Browser Console Script
1. Open the wizard in your browser
2. Press F12 to open Developer Tools
3. Go to the Console tab
4. Copy and paste the contents of `scripts/fill-wizard-SIMPLE.js`
5. Press Enter
6. Page will auto-refresh with data filled

### Option 3: Debug First (If Having Issues)
1. Open browser console (F12)
2. Copy and paste `scripts/debug-wizard-data.js`
3. This will show you the current state of the wizard data
4. Then use Option 1 or 2 to fill data

## What Gets Filled

The sample data creates a **complete business continuity plan** for "Caribbean Resort & Spa Ltd." including:

### ✅ All 10 Wizard Steps:
1. **Plan Information** - Company name, managers, storage locations, version
2. **Business Overview** - Purpose, products/services, target markets, advantages
3. **Essential Functions** - 6 categories with multiple functions each
4. **Function Priorities** - 9 functions prioritized with downtime tolerances
5. **Risk Assessment** - 6 detailed risks (Hurricane, Power, Water, Cyber, Staff, Supply)
6. **Strategies** - 32 selected strategies across Prevention/Response/Recovery + Long-term plan
7. **Action Plan** - Emergency team (6 members), communication, evacuation, work locations
8. **Contacts & Information** - Staff, suppliers, customers, emergency services
9. **Vital Records** - 8 critical record types with storage locations
10. **Testing & Maintenance** - Schedules, training, metrics, improvements, review process

## Viewing the Review Document

After filling the sample data:
1. Navigate through the wizard steps (or skip to the end)
2. On the final step, you'll see the **Business Plan Review** document
3. This is the formatted output that shows how the final document will look
4. Use the "Print" button to see the print-friendly version

## Clearing Data

To start fresh:
- **Using Dev Button**: Click "Clear Data" button (bottom-left)
- **Using Console**: Type `localStorage.clear(); location.reload()`

## Troubleshooting

### Data not showing after refresh?
1. Run `scripts/debug-wizard-data.js` in console to see what's actually saved
2. Check browser console for any errors
3. Try clearing all data and filling again

### Some sections empty?
1. Check that you're using the SIMPLE script (`fill-wizard-SIMPLE.js`)
2. The old scripts may have incorrect data formats
3. Make sure you refreshed the page after running the script

### Review document looks incomplete?
1. Verify all 10 sections show data in the debug script output
2. Check that table-based entries (risks, contacts, etc.) are showing as arrays
3. Look for console errors that might indicate data format issues

## Files

- `fill-wizard-SIMPLE.js` - Main script to fill complete sample data (USE THIS ONE)
- `debug-wizard-data.js` - Diagnostic script to see current wizard state
- `fill-wizard-with-sample-data.js` - Old version (deprecated, use SIMPLE instead)











