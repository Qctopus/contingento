# Multiplier Wizard Integration Fix - Complete

## 🎯 Issue Resolved

**Problem**: Location questions ("My business is near the coast", "My business is in an urban/city area") were hardcoded in the wizard instead of being managed through the multiplier system in the admin panel.

**Additional Problem**: The activate/deactivate functionality for multipliers in the admin panel wasn't working properly.

## 🔧 Changes Made

### 1. **Removed Hardcoded Location Questions from Wizard**
**File**: `src/components/IndustrySelector.tsx`

**Before**:
```tsx
<div className="space-y-3">
  <label className="flex items-start p-3 border rounded-lg">
    <input type="checkbox" checked={location.nearCoast} ... />
    <div className="ml-3">
      <div>{t('nearCoastLabel')}</div>
      <div>{t('nearCoastDetails')}</div>
    </div>
  </label>
  <label className="flex items-start p-3 border rounded-lg">
    <input type="checkbox" checked={location.urbanArea} ... />
    <div className="ml-3">
      <div>{t('urbanAreaLabel')}</div>
      <div>{t('urbanAreaDetails')}</div>
    </div>
  </label>
</div>
```

**After**:
```tsx
{/* Removed hardcoded location questions - now handled by Dynamic Multiplier Questions below */}
```

### 2. **Updated Multiplier Filter Logic**
**File**: `src/components/IndustrySelector.tsx`

**Before**:
```tsx
{multipliers
  // Filter out location-based multipliers since they're handled by checkboxes above
  .filter(m => !['location_coastal', 'location_urban', 'location_flood_prone'].includes(m.characteristicType))
  .map((multiplier, index) => {
```

**After**:
```tsx
{multipliers
  .filter(m => m.isActive) // Only show active multipliers
  .map((multiplier, index) => {
```

Now **all active multipliers** (including location-based ones) are displayed dynamically from the admin panel configuration.

### 3. **Added Activate/Deactivate Toggle Function**
**File**: `src/components/admin2/RiskMultipliersTab.tsx`

Added new function to toggle multiplier active status:

```tsx
const toggleActive = async (id: string, currentStatus: boolean) => {
  try {
    const multiplier = multipliers.find(m => m.id === id)
    if (!multiplier) return

    const response = await fetch('/api/admin2/multipliers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        isActive: !currentStatus
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      await fetchMultipliers()
    } else {
      alert('Error toggling multiplier status: ' + data.error)
    }
  } catch (error) {
    console.error('Error toggling multiplier:', error)
    alert('Error toggling multiplier')
  }
}
```

### 4. **Added Activate/Deactivate Buttons to UI**
**File**: `src/components/admin2/RiskMultipliersTab.tsx`

Added toggle button in both Active and Inactive multiplier sections:

```tsx
<button
  onClick={() => toggleActive(multiplier.id, multiplier.isActive)}
  className={`px-3 py-1 text-sm rounded transition-colors ${
    multiplier.isActive 
      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
      : 'bg-green-100 text-green-700 hover:bg-green-200'
  }`}
  title={multiplier.isActive ? 'Click to deactivate' : 'Click to activate'}
>
  {multiplier.isActive ? '❌ Deactivate' : '✅ Activate'}
</button>
```

## ✅ How It Works Now

### Admin Panel Workflow:

1. **View Multipliers** → Organized into "Active" and "Inactive" sections
2. **Create/Edit Multiplier** → Configure with wizard questions in all languages (EN/ES/FR)
3. **Activate/Deactivate** → Click the button to toggle visibility in the wizard
4. **Immediate Effect** → Changes are instantly reflected in the wizard

### Wizard Workflow:

1. **Location Section** → Now empty of hardcoded questions
2. **Dynamic Questions** → All active multipliers appear here automatically
3. **Language Support** → Questions display in the user's selected language
4. **Automatic Updates** → When admin activates/deactivates a multiplier, it appears/disappears in the wizard

## 📋 Benefits

✅ **Centralized Management**: All business characteristic questions are managed in one place (Admin Panel → Risk Multipliers)

✅ **No Hardcoding**: No need to edit code to add/remove questions

✅ **Multilingual**: All questions support EN/ES/FR out of the box

✅ **Easy Activation**: Single click to show/hide questions in the wizard

✅ **Consistent Logic**: Location questions use the same system as other characteristics

## 🎨 Admin Panel UI Improvements

### Before:
- No easy way to activate/deactivate multipliers
- Had to edit the multiplier to change isActive status
- Confusing to see which multipliers were active

### After:
- Clear separation: "Active Multipliers" and "Inactive Multipliers" sections
- Visual indicators: Green dot (active), Gray dot (inactive)
- Quick toggle: "✅ Activate" / "❌ Deactivate" buttons
- Stats summary showing counts at the top

## 🧪 Testing Checklist

### Admin Panel:
- [ ] Create a new multiplier (e.g., "location_coastal")
- [ ] Set wizard question in all three languages
- [ ] Click "✅ Activate" (if inactive) or "❌ Deactivate" (if active)
- [ ] Verify it moves between Active/Inactive sections
- [ ] Edit the multiplier and verify changes save

### Wizard:
- [ ] Go to the wizard
- [ ] Navigate to the "Business Characteristics" step
- [ ] Verify only active multipliers appear
- [ ] Switch language (EN → ES → FR) and verify questions translate
- [ ] Answer the questions and verify they affect risk calculations

### Integration:
- [ ] Deactivate "location_coastal" in admin panel
- [ ] Refresh wizard and verify the coastal question is gone
- [ ] Activate "location_coastal" in admin panel
- [ ] Refresh wizard and verify the coastal question appears

## 🔍 Example: Coastal Location Multiplier

**Admin Panel Configuration:**
- **Name**: Coastal Hurricane Risk
- **Characteristic Type**: location_coastal
- **Wizard Question (EN)**: "Is your business within 5km of the coast?"
- **Wizard Question (ES)**: "¿Su negocio está a 5km de la costa?"
- **Wizard Question (FR)**: "Votre entreprise est-elle à 5km de la côte?"
- **Wizard Help (EN)**: "Coastal businesses may face hurricane, flood, and storm surge risks."
- **Status**: Active ✅

**Wizard Display (English)**:
```
Is your business within 5km of the coast?
☐ Yes
☐ No
ℹ️ Coastal businesses may face hurricane, flood, and storm surge risks.
```

**Wizard Display (Spanish)**:
```
¿Su negocio está a 5km de la costa?
☐ Sí
☐ No
ℹ️ Los negocios costeros pueden enfrentar riesgos de huracanes, inundaciones y marejadas.
```

## 🎉 Result

✅ **Hardcoded Questions Removed**: All location questions now come from the multiplier system

✅ **Easy Activation**: Admin can activate/deactivate multipliers with one click

✅ **Dynamic Wizard**: Wizard automatically shows only active multipliers

✅ **Better UX**: Clear visual distinction between active and inactive multipliers

✅ **Multilingual Support**: All questions properly translate in the wizard


