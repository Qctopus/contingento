# Wizard → Admin2 Data Mapping

## ✅ Fields That SHOULD Use Business Type Examples from Admin2

These are business-type-specific suggestions that make sense to configure per business type:

### 1. **Business Purpose** (BUSINESS_OVERVIEW step)
- **Admin2 Field**: `exampleBusinessPurposes`
- **Wizard Question**: "What is the main purpose of your business?"
- **Why Admin2**: Different business types have fundamentally different purposes
- **Example for Restaurant**: "Serve authentic Caribbean cuisine to locals and tourists"
- **Example for Grocery**: "Provide essential groceries to the local community"
- **✅ Currently using Admin2 data**: YES (via `get-field-suggestions` API)

### 2. **Products and Services** (BUSINESS_OVERVIEW step)
- **Admin2 Field**: `exampleProducts`
- **Wizard Question**: "What products and services do you provide?"
- **Why Admin2**: Product/service offerings are business-type-specific
- **Example for Restaurant**: "Full-service Caribbean meals, beverages, catering"
- **Example for Hotel**: "Room accommodations, breakfast service, tour arrangements"
- **✅ Currently using Admin2 data**: YES (via `get-field-suggestions` API)

### 3. **Key Personnel** (BUSINESS_OVERVIEW step)
- **Admin2 Field**: `exampleKeyPersonnel`
- **Wizard Question**: "Who are the key people involved in running your business?"
- **Why Admin2**: Key roles differ by business type
- **Example for Restaurant**: "Head Chef, Restaurant Manager, Servers, Kitchen Staff"
- **Example for Tour Operator**: "Tour Guides, Operations Manager, Drivers"
- **✅ Currently using Admin2 data**: YES (via `get-field-suggestions` API)

### 4. **Customer Base** (BUSINESS_OVERVIEW step)
- **Admin2 Field**: `exampleCustomerBase`
- **Wizard Question**: Implied by business description and used for targeting
- **Why Admin2**: Different business types serve different customer segments
- **Example for Hotel**: "International tourists, Business travelers, Family groups"
- **Example for Clothing Store**: "Local shoppers, Tourists seeking Caribbean fashion"
- **✅ Currently using Admin2 data**: YES (via `get-field-suggestions` API)

### 5. **Minimum Equipment** (RESOURCES step)
- **Admin2 Field**: `minimumEquipment`
- **Wizard Question**: "Minimum Resource Requirements" / "Equipment"
- **Why Admin2**: Essential equipment varies significantly by business type
- **Example for Restaurant**: "Commercial kitchen equipment, Refrigeration, POS system"
- **Example for Grocery**: "Refrigeration units, Shelving, Cash register"
- **✅ Currently using Admin2 data**: YES (via `get-field-suggestions` API)

---

## ❌ Fields That Should NOT Be in Admin2 (User-Specific)

These should be removed from the BusinessType model as they are user inputs, not business-type templates:

### 1. **Operating Hours** ❌ REMOVE
- **Current**: `operatingHours` field in BusinessType
- **Why Remove**: Every restaurant has different hours based on owner's choice
- **User enters**: "Monday-Saturday 8AM-6PM, extended during Carnival"
- **Action**: Remove from schema, use hardcoded examples in wizard step definition

### 2. **Typical Revenue** ❌ REMOVE
- **Current**: `typicalRevenue` field in BusinessType
- **Why Remove**: This is reference information, not a wizard prefill
- **Not used**: Wizard doesn't ask for revenue
- **Action**: Remove from schema (not used anywhere)

### 3. **Typical Employees** ❌ REMOVE
- **Current**: `typicalEmployees` field in BusinessType
- **Why Remove**: This is reference information, user enters actual count
- **Not used**: Wizard asks for "Key Personnel" names/roles, not count
- **Action**: Remove from schema (not used anywhere)

---

## 🎯 Summary of Changes Needed

### Database Schema Changes
```prisma
model BusinessType {
  // ❌ REMOVE these fields:
  // typicalRevenue          String?
  // typicalEmployees        String?
  // operatingHours          String?
  
  // ✅ KEEP these fields (they're good!):
  exampleBusinessPurposes String?  // Used by wizard
  exampleProducts         String?  // Used by wizard
  exampleKeyPersonnel     String?  // Used by wizard
  exampleCustomerBase     String?  // Used by wizard
  minimumEquipment        String?  // Used by wizard
}
```

### Admin2 UI Changes
- Remove `operatingHours`, `typicalRevenue`, `typicalEmployees` from BusinessTypeEditor
- Keep only the 5 multilingual example fields that wizard actually uses
- Update labels to clarify these are "example suggestions" for users

### Wizard Changes
- Operating hours examples should be hardcoded in `steps.ts` (already are!)
- Ensure all 5 business-type-specific fields use Admin2 data (already do!)
- No changes needed to wizard logic

---

## ✅ Verification Checklist

- [x] Wizard uses `exampleBusinessPurposes` from Admin2
- [x] Wizard uses `exampleProducts` from Admin2
- [x] Wizard uses `exampleKeyPersonnel` from Admin2
- [x] Wizard uses `exampleCustomerBase` from Admin2
- [x] Wizard uses `minimumEquipment` from Admin2
- [ ] Remove `operatingHours` from schema (not business-type-specific)
- [ ] Remove `typicalRevenue` from schema (not used by wizard)
- [ ] Remove `typicalEmployees` from schema (not used by wizard)
- [ ] Update Admin2 BusinessTypeEditor to remove unused fields



