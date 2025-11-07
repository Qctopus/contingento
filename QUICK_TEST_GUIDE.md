# Quick Test Guide - Formal BCP Preview Data Verification

## 🚀 Quick Start (3 Minutes)

### Step 1: Fill Wizard with Sample Data
Open browser console (F12) and paste this script:

```javascript
// Load the fill script
const script = document.createElement('script');
script.src = '/scripts/fill-wizard-with-sample-data.js';
document.head.appendChild(script);
```

### Step 2: Navigate to Preview
1. Click through wizard steps (data already filled)
2. Go to **Review** step
3. Click **"Formal BCP Preview"** button

### Step 3: Check Console
Look for this in console:

```
🔍 BCP Data Availability Check
  📊 Section 4: Contact Details
    ✓ 4.1 Emergency Leadership: ✅ Present
    ✓ 4.2 Staff Contact Roster: X contacts ✅
    ✓ 4.3 Emergency Services: X services ✅
    ✓ 4.4 Utilities & Essential Services: X utilities ✅
    ✓ 4.5 Supplier Directory (ALL): X suppliers ✅
    ✓ 4.6 Insurance & Banking: X insurance + X banking ✅
```

---

## ✅ What You Should See

### In the Browser Console:

#### 1. Data Availability Check
```
📊 Section 4: Contact Details
  ✓ 4.1 Emergency Leadership: ✅ Present
  ✓ 4.2 Staff Contact Roster: 5 contacts ✅
  ✓ 4.3 Emergency Services: 3 services ✅
  ✓ 4.4 Utilities: 4 utilities ✅
  ✓ 4.5 Suppliers (ALL): 8 suppliers ✅
  ✓ 4.6 Insurance & Banking: 2 insurance + 1 banking ✅

📊 Section 5: Vital Records & Data Protection
  ✓ Vital Records: 5 records ✅

📊 Section 6: Testing & Maintenance
  ✓ 6.1 Testing Schedule: 3 tests ✅
  ✓ 6.2 Training: 2 programs ✅
  ✓ 6.3 Improvements: 1 improvements ✅
```

#### 2. Summary Report
```
📋 SUMMARY REPORT
  Sections with content: 7/7
  Required data: 6/6 ✅ ALL PRESENT
  Optional data: 7/7 present
  
✅ All required data is present!

ℹ️ Optional enhancements present:
  ✅ Vital Records (Section 5)
  ✅ Testing Schedule (6.1)
  ✅ Training Programs (6.2)
  ✅ Improvements (6.3)
  ✅ Target Markets (1.5)
  ✅ Products/Services (1.6)
  ✅ Function Analysis (1.7)
```

### In the Formal BCP Preview:

#### Section 1: Business Overview
- 1.1 Business Information (table)
- 1.2 Business Purpose (paragraph)
- 1.3 Key Strengths (bulleted list)
- 1.4 Essential Operations (cards with descriptions)
- 1.5 Target Markets (list with percentages)
- 1.6 Products & Services (detailed description)
- 1.7 Critical Function Analysis (cards with priority, RTO, RPO)

#### Section 2: Risk Assessment
- 2.1 Risk Identification (summary)
- 2.2 Major Risks Analysis (detailed cards for HIGH risks)
- 2.3 Complete Risk Summary (table with all risks)

#### Section 3: Continuity Strategies
- 3.1 Investment Summary (total cost with breakdown)
- 3.2 Preparation Strategies (cards for ALL strategies with action steps)

#### Section 4: Emergency Response & Contacts
- 4.1 Emergency Leadership (Plan Manager table)
- 4.2 Staff Contact Roster (full table - ALL staff)
- 4.3 Emergency Services (grid of service cards)
- 4.4 Utilities & Essential Services (detailed list)
- 4.5 Supplier Directory (table with ALL suppliers)
- 4.6 Insurance & Banking Partners (colored cards)

#### Section 5: Vital Records (if data entered)
- Complete records inventory with backup locations

#### Section 6: Plan Maintenance & Testing
- Base text (always present)
- 6.1 Testing Schedule (if data entered)
- 6.2 Training Programs (if data entered)
- 6.3 Identified Improvements (if data entered)

#### Section 7: Certification
- Signature lines and UNDP certification

---

## ❌ Troubleshooting

### Problem: Console shows "❌" for some sections

**Solution:**
1. Check if data was entered in wizard
2. Verify step names in console:
   ```javascript
   const formData = JSON.parse(localStorage.getItem('wizardFormData'));
   console.log('Available steps:', Object.keys(formData));
   ```

### Problem: "Missing Required Data" warning

**Example:**
```
⚠️ MISSING REQUIRED DATA:
  ❌ Staff Contacts (4.2)
  ❌ Emergency Services (4.3)
```

**Solution:**
1. Go back to wizard
2. Complete the "Contacts and Critical Information" step
3. Make sure to add:
   - Staff Contact Information (table)
   - Emergency Services and Utilities (table)
   - Supplier Information (table)

### Problem: Suppliers showing as "(optional)"

This is **CORRECT** if no suppliers were entered. Section 4.5 only appears when you've added suppliers in the wizard.

**To add suppliers:**
1. Go to "Contacts and Critical Information" step
2. Fill out "Supplier Information" table
3. Return to review

### Problem: Section 5 not appearing

This is **CORRECT** - Section 5 (Vital Records) is optional and only appears if you entered data in the "Vital Records Inventory" step.

**To add vital records:**
1. Go to "Vital Records Inventory" step
2. Add records to the table
3. Return to review

---

## 🔍 Deep Dive Inspection

### Check Raw Data Structure
```javascript
const formData = JSON.parse(localStorage.getItem('wizardFormData'));

// Check contacts
console.log('CONTACTS_AND_INFORMATION keys:', 
  Object.keys(formData.CONTACTS_AND_INFORMATION || {}));

// Check specific contact types
console.log('Staff contacts:', 
  formData.CONTACTS_AND_INFORMATION?.['Staff Contact Information']);
console.log('Suppliers:', 
  formData.CONTACTS_AND_INFORMATION?.['Supplier Information']);
console.log('Emergency & Utilities:', 
  formData.CONTACTS_AND_INFORMATION?.['Emergency Services and Utilities']);

// Check testing data
console.log('TESTING_AND_MAINTENANCE keys:', 
  Object.keys(formData.TESTING_AND_MAINTENANCE || {}));
console.log('Testing schedule:', 
  formData.TESTING_AND_MAINTENANCE?.['Plan Testing Schedule']);

// Check vital records
console.log('VITAL_RECORDS keys:', 
  Object.keys(formData.VITAL_RECORDS || {}));
console.log('Records inventory:', 
  formData.VITAL_RECORDS?.['Vital Records Inventory']);
```

---

## 📊 Expected Data Counts (with fill-wizard-with-sample-data.js)

| Section | Expected Count |
|---------|----------------|
| Staff Contacts | 5+ |
| Emergency Services | 3+ |
| Utilities | 4+ |
| Suppliers | 5+ |
| Insurance/Banking | 2+ |
| Vital Records | 5+ |
| Testing Schedule | 3+ |
| Training Programs | 2+ |
| Improvements | 1+ |
| Functions with Priorities | 3+ |
| Target Markets | 2+ |

---

## 🎯 Success Checklist

Use this checklist when testing:

### Visual Verification
- [ ] Section 1 has 7 subsections (1.1 through 1.7)
- [ ] Section 2 shows risk assessment with tables
- [ ] Section 3 shows ALL strategies (not just 3)
- [ ] Section 4 has 6-7 subsections (4.1 through 4.6+)
- [ ] Section 4.2 shows FULL staff roster (not truncated)
- [ ] Section 4.5 shows ALL suppliers (not limited to 3)
- [ ] Section 5 appears if vital records were entered
- [ ] Section 6 has base text plus optional subsections
- [ ] Section 7 has certification and signature lines

### Console Verification
- [ ] "🔍 BCP Data Availability Check" appears
- [ ] Each section shows item counts
- [ ] Summary shows "Required data: X/6 ✅ ALL PRESENT"
- [ ] No "⚠️ MISSING REQUIRED DATA" warnings (or they're expected)
- [ ] Optional enhancements list shows what's present

### Data Integrity
- [ ] All staff names appear in roster
- [ ] Phone numbers and emails are complete
- [ ] ALL suppliers listed (check count matches wizard)
- [ ] Emergency services properly separated from utilities
- [ ] Insurance separated from banking contacts
- [ ] Vital records show primary + backup locations
- [ ] Testing schedule has dates and participants
- [ ] Training programs have frequency and topics

---

## 🆘 Quick Fixes

### Reset and Start Over
```javascript
// Clear wizard data
localStorage.removeItem('wizardFormData');
localStorage.removeItem('bcp-prefill-data');
localStorage.removeItem('bcp-industry-selected');

// Reload page
location.reload();
```

### Re-run Fill Script
```javascript
// If you need to refill with sample data
const script = document.createElement('script');
script.src = '/scripts/fill-wizard-with-sample-data.js';
document.head.appendChild(script);
```

---

## 📞 Support

If you see unexpected behavior:

1. **Check console** for detailed logs
2. **Verify data structure** with inspection commands above
3. **Review** `FORMAL_BCP_PREVIEW_VERIFICATION.md` for detailed info
4. **Compare** field names in `src/lib/steps.ts` vs. `FormalBCPPreview.tsx`

---

**Happy Testing! 🎉**

