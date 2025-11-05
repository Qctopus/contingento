# 📋 Multiplier Setup - Simple Guide

## The Correct Setup (No Confusion!)

### Section 1: Admin Info (For You)
This is just for organizing multipliers in your admin panel:
- **Name**: "Coastal Hurricane Risk" (just a label for you)
- **Description**: "Increased hurricane vulnerability..." (notes for you)
- **Multiplier Factor**: 1.3 (the actual math multiplier)

### Section 2: Business Logic (Technical)
This tells the system HOW to check if the multiplier applies:
- **Business Characteristic**: Select what to check (e.g., "location_coastal")
  - This is just a technical identifier
  - It maps to business data collected in the wizard
- **Condition Type**: Boolean/Threshold/Range
- **Applicable Hazards**: Which risks does this amplify?

### Section 3: Wizard Question (What Users See!)
This is the ONLY thing users actually see:
- **Question** (EN/ES/FR): "Is your business within 5km of the coast?"
- **Help Text** (EN/ES/FR): "Coastal businesses may face hurricane risks..."

---

## How It Works

### Step 1: Admin Creates Multiplier
```
Admin Panel:
├─ Name: "Coastal Hurricane Risk"               ← Admin sees
├─ Characteristic: location_coastal              ← System checks
└─ Wizard Question: "Is your business..."       ← User sees
```

### Step 2: User Takes Wizard
```
Wizard shows:
"Is your business within 5km of the coast?"     ← From database
[ Yes ] [ No ]                                   ← User clicks

If Yes → location_coastal = true                ← System sets
```

### Step 3: System Applies Multiplier
```
IF location_coastal = true
AND hazard = hurricane
THEN risk_score = risk_score × 1.3              ← Multiplier applied!
```

---

## Key Points

1. **Business Characteristic** dropdown = Internal identifier
   - Example: "location_coastal", "tourism_share", "power_dependency"
   - This is NOT shown to users
   - It's just a key for the system to check

2. **Wizard Question** fields = What users actually see
   - You write the question in EN/ES/FR
   - Users see it in their language
   - This is the ONLY thing shown to users

3. **No Redundancy!**
   - The dropdown is for YOU to select what to check
   - The question section is for USERS to answer
   - They work together but serve different purposes

---

## Example Workflow

### Creating "Power Dependency" Multiplier:

**Section 1 (Admin Info):**
```
Name: Critical Power Dependency
Description: Business cannot operate without electricity
Factor: 1.4
```

**Section 2 (Business Logic):**
```
Characteristic: power_dependency  ← Selects what data to check
Condition: >= 95%                 ← When to apply multiplier
Hazards: [PowerOutage, Storm]     ← Which risks to amplify
```

**Section 3 (User-Facing):**
```
EN: "Can your business operate without electricity?"
ES: "¿Puede su negocio operar sin electricidad?"
FR: "Votre entreprise peut-elle fonctionner sans électricité?"

Help:
EN: "Power outages are common during storms"
ES: "Los cortes de energía son comunes durante tormentas"
FR: "Les pannes de courant sont fréquentes pendant les tempêtes"
```

**Result:**
- Admin sees: "Critical Power Dependency"
- User sees: "Can your business operate without electricity?" (in their language)
- System checks: `power_dependency >= 95%`
- If true: Applies 1.4× multiplier to power outage risks

---

## Quick Reference

| Field | Purpose | Who Sees It |
|-------|---------|-------------|
| Name | Admin label | Admins only |
| Description | Admin notes | Admins only |
| Characteristic | What to check | System only |
| Wizard Question | The actual question | Users (EN/ES/FR) |
| Wizard Help | Extra guidance | Users (EN/ES/FR) |

**Bottom Line**: 
- Dropdown = Select WHAT to check
- Question fields = Write what users SEE

No duplication, no confusion! ✅















