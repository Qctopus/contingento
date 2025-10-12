# Admin Configuration vs. User Input - Quick Reference

## 🎯 The Golden Rule

**Admin configures TEMPLATES and EXAMPLES**  
**Users provide THEIR SPECIFIC DATA**

---

## 📊 Data Ownership Matrix

| Data Type | Who Sets It? | Where? | Purpose | Example |
|-----------|--------------|--------|---------|---------|
| **Business Type Name** | Admin | Admin2 Panel | Categorization | "Restaurant (Casual Dining)" |
| **Risk Vulnerabilities** | Admin | Admin2 Panel | Base risk levels | "Power Outage: 9/10 vulnerability" |
| **Example Purposes** | Admin | Admin2 Panel | **Wizard prefill hints** | "Serve authentic Caribbean cuisine" |
| **Example Products** | Admin | Admin2 Panel | **Wizard prefill hints** | "Jerk chicken, seafood, local dishes" |
| **Tourism Dependency** | **User** | **Wizard** | **Multiplier input** | "80% tourists" or "20% tourists" |
| **Seasonality** | **User** | **Wizard** | **Multiplier input** | "Yes, busy Dec-Apr" or "No" |
| **Digital Dependency** | **User** | **Wizard** | **Multiplier input** | "Essential" or "Helpful" or "Not used" |
| **Power Dependency** | **User** | **Wizard** | **Multiplier input** | "Cannot operate" or "Can partially" |
| **Customer Mix** | **User** | **Wizard** | **Multiplier input** | "Mainly locals" or "Mix" or "Mainly tourists" |

---

## 🏢 Admin2 Panel - Business Type Configuration

### ✅ What Admins SHOULD Configure:

#### 1. **Multilingual Names & Descriptions**
```json
{
  "en": "Restaurant (Casual Dining)",
  "es": "Restaurante (Comida Casual)",
  "fr": "Restaurant (Restauration Décontractée)"
}
```

#### 2. **Reference Information**
- `typicalRevenue`: "JMD 10M-40M annually"
- `typicalEmployees`: "10-25 employees"
- `operatingHours`: "11:00 AM - 10:00 PM"

These are **industry averages**, not specific to any one business.

#### 3. **Multilingual Example Content** (for wizard prefill)

**Example Business Purposes:**
```json
{
  "en": [
    "Provide quality Caribbean cuisine in comfortable atmosphere",
    "Serve authentic local dishes to tourists and residents"
  ],
  "es": [
    "Proporcionar cocina caribeña de calidad",
    "Servir platos locales auténticos"
  ],
  "fr": [
    "Fournir cuisine caribéenne de qualité",
    "Servir des plats locaux authentiques"
  ]
}
```

These are **suggestions** shown to users as hints.

**Example Products:**
```json
{
  "en": ["Caribbean meals, catering", "Jerk dishes, seafood, traditional cuisine"],
  "es": ["Comidas caribeñas, catering", "Platos jerk, mariscos, cocina tradicional"],
  "fr": ["Repas caribéens, traiteur", "Plats jerk, fruits de mer, cuisine traditionnelle"]
}
```

**Example Key Personnel:**
```json
{
  "en": ["Head Chef", "Restaurant Manager", "Servers", "Kitchen Staff"],
  "es": ["Chef Principal", "Gerente", "Meseros", "Personal de Cocina"],
  "fr": ["Chef Principal", "Gérant", "Serveurs", "Personnel de Cuisine"]
}
```

**Example Customer Base:**
```json
{
  "en": ["Mix of tourists and locals", "Families for special occasions"],
  "es": ["Mezcla de turistas y locales", "Familias para ocasiones especiales"],
  "fr": ["Mélange de touristes et locaux", "Familles pour occasions spéciales"]
}
```

**Minimum Equipment:**
```json
{
  "en": ["Commercial kitchen equipment", "Refrigeration", "Tables & chairs", "POS system"],
  "es": ["Equipo de cocina comercial", "Refrigeración", "Mesas y sillas", "Sistema POS"],
  "fr": ["Équipement de cuisine", "Réfrigération", "Tables et chaises", "Système POS"]
}
```

#### 4. **Risk Vulnerabilities** (stored in `BusinessRiskVulnerability` table)

```javascript
{
  riskType: 'powerOutage',
  vulnerabilityLevel: 9,  // 1-10 scale: How vulnerable is this business TYPE
  impactSeverity: 10,     // 1-10 scale: How severe would impact be
  reasoning: 'Cannot cook or preserve food without power'
}
```

### ❌ What Admins Should NOT Configure:

- ❌ Specific tourism percentage (user answers in wizard)
- ❌ Specific seasonality patterns (user answers in wizard)
- ❌ Specific digital dependency (user answers in wizard)
- ❌ Specific power dependency (user answers in wizard)
- ❌ Specific customer concentration (user answers in wizard)

---

## 🧙 Wizard Flow - User Input

### Questions Users Answer:

#### Location Characteristics (from Admin Unit data)
- ✅ **Auto-populated from selected location:**
  - Coastal? (within 5km of coast)
  - Urban? (in city area)
  - Flood-prone? (admin unit risk level > 7)

#### Business Characteristics (User must answer)

**1. Customer Mix**
```
Question: "What is your customer mix?"
Options:
  - Mainly tourists (80%)
  - Mix of tourists and locals (50/50)
  - Mainly locals (85%)
```
→ Sets `tourism_share` and `local_customer_share` for multipliers

**2. Digital System Dependency**
```
Question: "How dependent is your business on digital systems?"
Options:
  - Essential - Cannot operate without (95%)
  - Helpful - Can work around (50%)
  - Not used (10%)
```
→ Sets `digital_dependency` for multipliers

**3. Electricity Dependency**
```
Question: "Can your business operate without electricity?"
Options:
  - Cannot operate (95%)
  - Can operate partially (50%)
  - Can operate normally (10%)
```
→ Sets `power_dependency` for multipliers

**4. Seasonality**
```
Question: "Is your revenue seasonal?"
Options:
  - Yes, concentrated in certain months
  - No, stable year-round
```
→ Sets `seasonal_business` for multipliers

**5. Products**
```
Question: "Do you sell perishable goods?"
Options:
  - Yes (food, flowers, etc.)
  - No
```
→ Sets `perishable_goods` for multipliers

**6. Inventory**
```
Question: "What is your inventory approach?"
Options:
  - Keep minimal, order as needed (JIT)
  - Maintain significant stock
```
→ Sets `just_in_time_inventory` and `significant_inventory` for multipliers

---

## 🔢 How Multipliers Work

### Base Risk (from Admin Configuration)
```javascript
// Admin sets for "Restaurant" business type
BusinessRiskVulnerability {
  riskType: 'hurricane',
  vulnerabilityLevel: 7,  // Base vulnerability
  impactSeverity: 8       // Base impact
}
```

### User Answers (from Wizard)
```javascript
{
  tourism_share: 80,          // User: "Mainly tourists"
  location_coastal: true,     // Auto: from admin unit
  seasonal_business: true,    // User: "Yes, Dec-Apr busy"
  perishable_goods: true      // User: "Yes, fresh ingredients"
}
```

### Multipliers Applied
```javascript
// Multiplier: "High Tourism Dependency + Hurricane Risk"
if (tourism_share >= 70 && riskType === 'hurricane') {
  finalScore = baseScore * 1.5  // Tourism collapses during hurricanes
}

// Multiplier: "Coastal Location + Hurricane Risk"
if (location_coastal && riskType === 'hurricane') {
  finalScore = finalScore * 1.3  // Coastal areas more exposed
}

// Multiplier: "Seasonal Business + Hurricane Season"
if (seasonal_business && riskType === 'hurricane') {
  finalScore = finalScore * 1.2  // Peak season overlaps hurricane season
}
```

### Final Risk Score
```
Base: 7 (vulnerability) × 8 (impact) = 56
After multipliers: 56 × 1.5 × 1.3 × 1.2 = 131 (Very High Risk)
```

---

## 💡 Real-World Examples

### Example 1: Two Different Restaurants

**Admin Configures (Same for Both):**
- Business Type: "Restaurant (Casual Dining)"
- Base Power Outage Vulnerability: 9/10
- Examples: "Serve Caribbean cuisine", "Head Chef, Servers"

**User A - Tourist-Focused Beach Restaurant:**
```
Wizard Answers:
  - Customer mix: 85% tourists
  - Location: Coastal (Negril)
  - Seasonality: Yes, Dec-Apr peak
  - Power dependency: Cannot operate (refrigeration, cooking)

→ Final hurricane risk: VERY HIGH (tourist drop + coastal + seasonal)
→ Final power outage risk: CRITICAL (perishables, tourist expectations)
```

**User B - Local Community Restaurant:**
```
Wizard Answers:
  - Customer mix: 90% locals
  - Location: Inland (Spanish Town)
  - Seasonality: No, steady year-round
  - Power dependency: Cannot operate (refrigeration, cooking)

→ Final hurricane risk: MEDIUM (locals return faster, inland safer)
→ Final power outage risk: HIGH (still critical, but locals more patient)
```

### Example 2: Grocery Store

**Admin Configures:**
- Business Type: "Grocery Store / Mini-Mart"
- Base Power Outage Vulnerability: 9/10
- Examples: "Fresh produce, canned goods", "Store Manager, Cashier"

**User Input:**
```
Wizard Answers:
  - Customer mix: 95% locals
  - Location: Urban (Kingston)
  - Perishable goods: Yes
  - Power dependency: Cannot operate
  - Inventory: Significant stock

→ Power outage is CRITICAL (refrigeration)
→ But economic downturn risk is LOWER (essential goods, locals stay)
→ Supply chain risk MEDIUM (has buffer stock)
```

---

## 📋 Admin Checklist

When adding a new business type, configure:

1. ✅ Multilingual name (EN, ES, FR)
2. ✅ Multilingual description (EN, ES, FR)
3. ✅ Reference info (typical revenue, employees, hours)
4. ✅ Example purposes (2-3 examples in each language)
5. ✅ Example products (2-3 examples in each language)
6. ✅ Example personnel (3-5 roles in each language)
7. ✅ Example customer base (2-3 examples in each language)
8. ✅ Minimum equipment (4-6 items in each language)
9. ✅ Risk vulnerabilities (5-8 key risks with base levels)

Do NOT configure:
- ❌ Tourism percentage (user-specific)
- ❌ Seasonality factor (user-specific)
- ❌ Digital dependency level (user-specific)
- ❌ Any other operational characteristics (user-specific)

---

## 🚀 Benefits

1. **Accurate:** Each business gets personalized risk assessment
2. **Helpful:** Examples guide users without forcing choices
3. **Flexible:** Same business type works for very different businesses
4. **Multilingual:** Full support for EN/ES/FR
5. **Maintainable:** Clear separation of concerns
6. **Integrated:** Works seamlessly with multiplier system

---

## 📞 Questions?

- **Q: Should I add average tourism dependency for restaurants?**  
  A: No! Different restaurants have wildly different customer mixes. Let users answer.

- **Q: Can I provide example customer bases?**  
  A: Yes! Examples like "Mix of tourists and locals" help users understand the question.

- **Q: What if a business type is ALWAYS seasonal?**  
  A: Still let users answer. They might have found a way to operate year-round.

- **Q: Should risk vulnerabilities be high for all coastal businesses?**  
  A: Set base levels for the business TYPE. Location multipliers will adjust automatically.

---

## 📚 Related Files

- `BUSINESS_TYPE_CLEANUP_SUMMARY.md` - Full technical documentation
- `scripts/populate-caribbean-business-types-clean.js` - Example data structure
- `src/types/multipliers.ts` - Complete list of wizard questions
- `src/services/preFillService.ts` - How examples are used


