# Risk Multiplier System - Complete Guide

## 📊 System Overview

The Risk Multiplier System allows admins to configure how business characteristics amplify specific risk scores. The system connects **wizard questions** → **business characteristics** → **risk multipliers** → **final risk scores**.

## 🔄 How It Works: Complete Flow

### **Step 1: User Answers Wizard Questions**

Users answer simple, practical questions about their business:

| Wizard Question | User Answer | Characteristic Generated |
|----------------|-------------|-------------------------|
| **Location: Is your business within 5km of the coast?** | Yes/No | `location_coastal = true/false` |
| **Location: Is your business in an urban/city area?** | Yes/No | `location_urban = true/false` |
| **Customer Base: What is your customer mix?** | Mainly tourists / Mix / Mainly locals | `tourism_share = 80/40/10` |
| **Operations: Can you operate without electricity?** | Cannot / Partially / Can | `power_dependency = 95/50/10` |
| **Operations: Digital systems dependency?** | Essential / Helpful / Not used | `digital_dependency = 95/50/10` |
| **Products: Do you sell perishable goods?** | Yes/No | `perishable_goods = true/false` |
| **Supply Chain: Check all that apply** | Overseas / JIT / Perishable | `supply_chain_complex = true` (if any) |
| **Assets: Do you have expensive equipment?** | Yes/No | `physical_asset_intensive = true/false` |
| **Inventory: Do you keep minimal inventory?** | Yes/No | `just_in_time_inventory = true/false` |

### **Step 2: System Converts Answers to Characteristics**

The `convertSimplifiedInputs()` function transforms user-friendly answers into precise numerical/boolean characteristics:

```typescript
// Example conversion:
User answer: "Mainly tourists" 
→ Characteristics: {
    tourism_share: 80,        // 80% revenue from tourists
    local_customer_share: 15  // 15% from locals
}

User answer: "Cannot operate without power"
→ Characteristics: {
    power_dependency: 95      // 95% dependent on electricity
}
```

### **Step 3: Admin-Configured Multipliers Are Applied**

Based on the user's characteristics, the system automatically applies matching multipliers:

**Example Multiplier Configuration:**

| Multiplier Name | Characteristic | Condition | Factor | Applies To |
|----------------|----------------|-----------|--------|------------|
| **Coastal Hurricane Impact** | `location_coastal` | = true | ×1.2 | Hurricane, Flood |
| **High Tourism Dependency** | `tourism_share` | ≥ 70 | ×1.1 | Hurricane |
| **Critical Power Dependency** | `power_dependency` | ≥ 80 | ×1.15 | Power Outage |
| **Complex Supply Chain** | `supply_chain_complex` | = true | ×1.08 | Hurricane, Flood |

### **Step 4: Risk Score Calculation**

```
Base Score = (Location Risk × 0.6) + (Business Vulnerability × 0.4)
Final Score = Base Score × Multiplier₁ × Multiplier₂ × ... (capped at 10)
```

**Example:**
- Business: Coastal restaurant
- Risk: Hurricane
- Location risk: 8/10
- Business vulnerability: 7/10
- Base score: (8 × 0.6) + (7 × 0.4) = 7.6
- User has: Coastal location (×1.2) + High tourism (×1.1)
- **Final score: 7.6 × 1.2 × 1.1 = 10.0** (capped)

## 🎯 Admin Multiplier Configuration

### **What Admins Can Set:**

1. **Multiplier Value** (e.g., 1.2 = 20% increase)
   - Range: 0.01 to 5.0
   - Typical values: 1.05-1.3

2. **Business Characteristic** (What wizard question triggers it)
   - Select from 16 available characteristics
   - Each mapped to specific wizard questions

3. **Condition Type:**
   - **Boolean**: Must be true (Yes/No questions)
   - **Threshold**: Value ≥ threshold (e.g., tourism ≥ 70%)
   - **Range**: Value between min-max

4. **Applicable Risks** (Which risks get multiplied)
   - Select multiple risks
   - Supports all 13 risk types

5. **Priority** (Order of application)
   - Lower number = applied first
   - Affects final calculation

6. **Active Status**
   - Enable/disable without deleting

### **Admin Interface Features:**

✅ **Wizard Question Mapping Display**
- Shows which wizard question triggers each multiplier
- Displays possible user answers and their values
- Makes it clear how user input → multiplier activation works

✅ **Visual Configuration**
- Dropdown selection of characteristics with help text
- Conditional fields based on characteristic type
- Real-time preview of multiplier effect

✅ **Comprehensive List View**
- Shows all multipliers with their wizard questions
- Displays which risks each multiplier affects
- Active/inactive status clearly marked

## 📋 Complete Characteristic → Wizard Question Mapping

### **Location Characteristics**
| Characteristic | Wizard Question | User Answers |
|---------------|----------------|--------------|
| `location_coastal` | "Is your business within 5km of the coast?" | Yes/No (from parish data) |
| `location_urban` | "Is your business in an urban/city area?" | Yes/No (from parish data) |
| `location_flood_prone` | "Is your business in a flood-prone area?" | Yes/No (flood risk > 7) |

### **Customer/Revenue Characteristics**
| Characteristic | Wizard Question | User Answers |
|---------------|----------------|--------------|
| `tourism_share` | "What is your customer mix?" | Mainly tourists (80%) / Mix (40%) / Mainly locals (10%) |
| `local_customer_share` | "What is your customer mix?" | Mainly tourists (15%) / Mix (50%) / Mainly locals (85%) |
| `export_share` | "Do you export or sell internationally?" | Currently fixed at 5% |

### **Operations Characteristics**
| Characteristic | Wizard Question | User Answers |
|---------------|----------------|--------------|
| `digital_dependency` | "How dependent on digital systems?" | Essential (95%) / Helpful (50%) / Not used (10%) |
| `power_dependency` | "Can you operate without electricity?" | Cannot (95%) / Partially (50%) / Can (10%) |
| `water_dependency` | "Do you sell perishable goods?" | Yes (90%) / No (30%) |

### **Supply Chain Characteristics**
| Characteristic | Wizard Question | User Answers |
|---------------|----------------|--------------|
| `supply_chain_complex` | "Check all that apply" | True if: Overseas imports OR JIT OR Perishable |
| `perishable_goods` | "Do you sell perishable goods?" | Yes/No |
| `just_in_time_inventory` | "Do you keep minimal inventory?" | Yes/No |
| `significant_inventory` | "Do you maintain significant inventory?" | Yes if NOT minimal |

### **Asset Characteristics**
| Characteristic | Wizard Question | User Answers |
|---------------|----------------|--------------|
| `physical_asset_intensive` | "Do you have expensive equipment?" | Yes/No |
| `own_building` | "Do you own your business premises?" | Yes/No |
| `seasonal_business` | "Is your revenue seasonal?" | Yes/No (from business type) |

## 🔧 Technical Implementation

### **Key Files:**

1. **`src/types/multipliers.ts`**
   - Defines all characteristic types with wizard question mappings
   - Contains `CHARACTERISTIC_TYPES` constant with full documentation
   - Defines `HAZARD_TYPES` for applicable risks

2. **`src/services/multiplierService.ts`**
   - `applyMultipliers()`: Main multiplier application logic
   - `checkMultiplierCondition()`: Evaluates if multiplier should apply
   - `convertSimplifiedInputs()`: Wizard answers → characteristics

3. **`src/components/admin2/RiskMultipliersTab.tsx`**
   - Admin UI for managing multipliers
   - Shows wizard question mapping
   - CRUD operations for multipliers

4. **`src/app/api/wizard/prepare-prefill-data/route.ts`**
   - Converts user wizard answers to characteristics
   - Applies multipliers during risk calculation
   - Generates final risk scores for wizard

### **Database Schema:**

```sql
model RiskMultiplier {
  id                  String   @id @default(cuid())
  name                String   
  description         String   
  characteristicType  String   -- Maps to wizard question
  conditionType       String   -- "boolean", "threshold", "range"
  thresholdValue      Float?   
  minValue            Float?   
  maxValue            Float?   
  multiplierFactor    Float    -- e.g., 1.2
  applicableHazards   String   -- JSON: ["hurricane", "flood"]
  isActive            Boolean  
  priority            Int      
  reasoning           String?  
}
```

## 📈 Example Multiplier Scenarios

### **Scenario 1: Coastal Restaurant**
**User Answers:**
- Location: Coastal = Yes
- Customer mix: Mainly tourists
- Power dependency: Cannot operate

**Multipliers Applied:**
1. Coastal location (×1.2) → Hurricane, Flood
2. High tourism (×1.1) → Hurricane
3. Power dependency (×1.15) → Power Outage

**Result:**
- Hurricane: Base 7.0 → ×1.2 ×1.1 = **9.24/10 (Very High)**
- Flood: Base 6.0 → ×1.2 = **7.2/10 (High)**
- Power Outage: Base 5.0 → ×1.15 = **5.75/10 (Medium)**

### **Scenario 2: Urban Pharmacy**
**User Answers:**
- Location: Urban = Yes, Not coastal
- Digital systems: Essential
- Perishable goods: Yes (medicines)

**Multipliers Applied:**
1. Urban location (×1.03) → Power Outage
2. Digital dependency (×1.15) → Power Outage
3. Perishable goods (×1.1) → Power Outage

**Result:**
- Power Outage: Base 6.0 → ×1.03 ×1.15 ×1.1 = **7.83/10 (High)**
- Hurricane: Base 4.0 → No multipliers = **4.0/10 (Medium)**

## 🎯 Best Practices for Admins

1. **Start with Location-Based Multipliers**
   - Coastal (hurricane/flood): 1.15-1.25
   - Urban (power/flood): 1.02-1.05
   - Flood-prone (flood): 1.2-1.3

2. **Add Industry-Specific Multipliers**
   - Tourism dependency (hurricane): 1.1-1.15
   - Perishable goods (power/water): 1.1-1.2
   - Digital systems (power/cyber): 1.15-1.25

3. **Set Appropriate Thresholds**
   - High dependency: ≥80%
   - Medium dependency: ≥50%
   - Seasonal: ≥60%

4. **Use Priority Wisely**
   - Location factors: Priority 1-3
   - Business characteristics: Priority 4-6
   - Operational factors: Priority 7-10

5. **Test with Risk Calculator**
   - Use Admin2 → Risk Calculator tab
   - Select different parishes and business types
   - Verify multipliers apply correctly
   - Check final risk scores make sense

## 🚀 How to Use (Admin Workflow)

1. **Go to Admin2 → Multipliers Tab**

2. **Click "Add New Multiplier"**

3. **Configure:**
   - Name: "Coastal Hurricane Impact"
   - Description: "Increases hurricane risk for coastal businesses"
   - Multiplier Factor: 1.2
   - Characteristic: Select "Coastal Location"
     - *(Wizard question info appears automatically)*
   - Condition: Boolean (Yes/No)
   - Applicable Hazards: Select "Hurricane", "Flood"
   - Priority: 1
   - Active: Yes

4. **Save**

5. **Test in Risk Calculator:**
   - Select a coastal parish (e.g., Montego Bay)
   - Select a business type (e.g., Restaurant)
   - Verify hurricane risk shows ×1.2 multiplier

6. **Verify in Wizard:**
   - User selects Montego Bay + Restaurant
   - System applies multiplier automatically
   - Risk score increased by 20%

## ✅ Summary

The multiplier system creates a dynamic, intelligent risk assessment that adapts to each business's unique situation. By mapping wizard questions to business characteristics and applying admin-configured multipliers, the system provides accurate, personalized risk scores that drive relevant strategy recommendations.

**Key Benefits:**
- ✅ User-friendly wizard questions
- ✅ Automatic characteristic conversion
- ✅ Admin-configurable multipliers
- ✅ Transparent calculation process
- ✅ Clear wizard question → multiplier mapping
- ✅ Flexible and extensible system

