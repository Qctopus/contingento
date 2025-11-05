# How to Test the Wizard with Sample Data

## ✅ The CORRECT Way (New Script)

Use the **CLEAN** sample data script that works exactly like the wizard:

### Steps:

1. **Open the wizard** in your browser: `http://localhost:3000/wizard`

2. **Open browser console**: Press `F12` → Click "Console" tab

3. **Run the clean script**:
   - Copy the ENTIRE contents of `public/fill-wizard-clean.js`
   - Paste into console
   - Press Enter

4. **Page will refresh** and you'll see:
   - ✅ Business info filled in (Caribbean Resort & Spa Ltd.)
   - ✅ Contacts filled in
   - ✅ Industry set to: Hospitality & Tourism
   - ✅ Location set to: Christ Church, Barbados

5. **Navigate through the wizard**:
   - **Risk Assessment step**: Wizard loads risks from DATABASE based on industry/location
   - **Strategies step**: Wizard loads strategies from DATABASE  
   - **Final Plan**: Shows ONLY what you selected in the wizard

## ❌ The OLD Way (Don't Use)

The old scripts (`fill-complete-plan-FIXED.js`, etc.) had **hardcoded risks and strategies** that bypassed the database. These caused issues like:
- Showing risks that don't exist in the database
- Showing strategies with "0 Actions"
- Not reflecting what's actually in the admin panel

**Don't use these anymore!** They're kept for reference only.

---

## What Gets Filled vs What Gets Loaded

### ✅ Filled by Script:
- Business Profile (name, address, contact info)
- Staff Contacts
- Emergency Services contacts
- Supplier Information
- Key Customer Contacts
- Testing Schedule and Improvements

### 🔄 Loaded from Database:
- **All Risks** - Based on:
  - Industry type (Hospitality & Tourism)
  - Location (Christ Church, Barbados, coastal)
  - Business characteristics
- **All Strategies** - Based on:
  - Selected risks
  - Industry type
  - Business size

### 👤 Selected by User (You):
- Which risks to include in the plan
- Which strategies to implement
- Priority levels and customizations

---

## Why This Approach?

This ensures the final Business Continuity Plan document shows ONLY:
1. Risks that are in the admin database
2. Strategies that are in the admin database  
3. Data that the user actually selected in the wizard

**No more phantom risks or empty strategies!** 🎉

---

## Troubleshooting

### "I see weird risks that I didn't select"
- Clear localStorage: `localStorage.clear()`
- Refresh the page
- Run the clean script again

### "Final plan is empty"
- Make sure you went through ALL wizard steps
- Check Risk Assessment: Did you select any risks?
- Check Strategies: Did you select any strategies?
- The plan only shows risks that have strategies selected

### "I want to test different industries/locations"
- Edit `public/fill-wizard-clean.js`
- Change the `industry.id` and `location` fields
- Run the modified script

---

## Quick Test Scenarios

### Scenario 1: Coastal Tourism Business
```javascript
industry: { id: 'hospitality_tourism', businessTypeId: 'hotel_resort' }
location: { country: 'Barbados', parish: 'Christ Church', nearCoast: true }
```
**Expected Risks**: Hurricane, flooding, power outage, supply chain

### Scenario 2: Urban Retail Business
```javascript
industry: { id: 'retail', businessTypeId: 'retail_store' }
location: { country: 'Jamaica', parish: 'Kingston', urbanArea: true, nearCoast: false }
```
**Expected Risks**: Crime, power outage, civil unrest, fire

### Scenario 3: Rural Agriculture
```javascript
industry: { id: 'agriculture', businessTypeId: 'farm' }
location: { country: 'Jamaica', parish: 'St. Elizabeth', nearCoast: false, urbanArea: false }
```
**Expected Risks**: Drought, flooding, pest infestation, market access


