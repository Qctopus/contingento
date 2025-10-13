# ✅ Wizard Dynamic Questions Fix - Complete!

## 🎯 Problem
The "Tell Us About Your Business" section in the wizard only showed 5 hardcoded questions, but it should dynamically load questions from the `RiskMultiplier` table based on active multipliers.

## 🔧 Solution Implemented

### 1. **Updated IndustrySelector Component**
   - Added state for loading multipliers from database
   - Added `useEffect` to fetch active multipliers with wizard questions
   - Replaced hardcoded questions (lines 340-573) with dynamic rendering
   - Questions now automatically adapt based on:
     - Active multipliers in database
     - User's selected language (EN/ES/FR)
     - Multiplier condition types (boolean, threshold, range)

### 2. **Key Changes**

#### Fetching Multipliers
```typescript
useEffect(() => {
  const loadMultipliers = async () => {
    const response = await fetch('/api/admin2/multipliers?activeOnly=true')
    const result = await response.json()
    const multipliersWithQuestions = result.multipliers.filter(m => m.wizardQuestion)
    setMultipliers(multipliersWithQuestions)
  }
  loadMultipliers()
}, [])
```

#### Dynamic Question Rendering
- Parses multilingual JSON for questions and help text
- Supports multiple answer option formats
- Filters out location-based questions (already handled by checkboxes)
- Maps answers to `businessCharacteristics` by `characteristicType`

### 3. **Current Question Count**
   - **10 total multipliers** with wizard questions in database (unique characteristic types)
   - **3 location-based** (coastal, urban, flood-prone) - shown as checkboxes
   - **7 dynamic questions** rendered from multipliers:
     1. Perishable goods
     2. Digital system dependency
     3. Power dependency
     4. Just-in-time inventory
     5. High-value equipment
     6. Tourism dependency
     7. Seasonal business pattern

## 📊 Multipliers with Wizard Questions

All questions are multilingual (EN/ES/FR):

1. **Perishable Goods Handling** (`perishable_goods`)
2. **Essential Digital Systems** (`digital_dependency`)
3. **Critical Power Dependency** (`power_dependency`)
4. **Just-in-Time Inventory** (`just_in_time_inventory`)
5. **High-Value Equipment** (`physical_asset_intensive`)
6. **High Tourism Dependency** (`tourism_share`)
7. **Seasonal Business Pattern** (`seasonal_business`)
8. **Coastal Hurricane Risk** (`location_coastal`) - filtered, shown as checkbox
9. **Urban Infrastructure** (`location_urban`) - filtered, shown as checkbox
10. **Flood-Prone Area** (`location_flood_prone`) - filtered, shown as checkbox

## 🎨 Features

### Multilingual Support
- Questions automatically display in user's selected language
- Fallback to English if translation missing
- Answer options also localized

### Dynamic Question Types
- **Boolean questions**: Yes/No or custom options
- **Threshold questions**: Numeric input with min/max
- **Range questions**: Numeric slider

### Admin Control
- Admins can add/remove questions in Admin2 panel
- No code changes needed to modify wizard questions
- Simply activate/deactivate multipliers with wizard questions

## 📝 How to Add New Questions

1. Go to **Admin2 Panel** → **Risk Multipliers**
2. Click **+ Add Multiplier** or edit existing one
3. Fill in:
   - Name, description, characteristic type
   - Multiplier factor and applicable hazards
   - **Wizard Question** (in EN/ES/FR)
   - **Answer Options** (optional, with labels in all languages)
   - **Help Text** (optional, in EN/ES/FR)
4. Set **Active** = true
5. Save
6. Question automatically appears in wizard! ✨

## 🔄 Testing

To verify the fix works:

1. Start development server: `npm run dev`
2. Go to wizard at `/` or `/en`
3. Select a business type
4. Select location
5. Check "Tell Us About Your Business" section
6. Verify:
   - Location checkboxes appear (coast, urban)
   - Dynamic questions appear below (8+ questions)
   - Questions are in correct language
   - All questions have proper answer options

## ✅ Issues Fixed

- ~~Duplicate `power_dependency` multipliers~~ - **FIXED**: Deactivated lower-priority duplicate
- All characteristic types are now unique
- Questions will not conflict or duplicate

## 🎯 Result

**Before**: 5 hardcoded questions
**After**: 7 dynamic questions that:
- Load from database
- Support multiple languages
- Can be managed by admins
- Automatically update when multipliers change

No more hardcoded questions! The wizard is now fully dynamic. 🎉

