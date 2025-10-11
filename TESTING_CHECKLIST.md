# End-to-End Testing Checklist

## 🎯 Complete System Test - Country & AdminUnit Implementation

### Pre-Test Setup
- [x] Database migrated successfully (14 Jamaican parishes → AdminUnits)
- [x] All code committed to Git (commit: 7cd6473)
- [ ] Application running locally or deployed to Vercel

---

## Test 1: Admin2 - Country Management

### 1.1 View Countries
- [ ] Navigate to Admin2 → Location Risks → Countries tab
- [ ] Verify Jamaica appears in the list
- [ ] Verify it shows "14 Admin Units"
- [ ] Verify no errors in console

### 1.2 Create New Country
- [ ] Click "+ Add Country" button
- [ ] Fill in:
  - Name: "Trinidad and Tobago"
  - Code: "TT"
  - Region: "Caribbean"
- [ ] Click Save
- [ ] Verify country appears in the list
- [ ] Verify success message/indication

### 1.3 Edit Country
- [ ] Click "Edit" on Trinidad and Tobago
- [ ] Change region to "Eastern Caribbean"
- [ ] Click Save
- [ ] Verify changes are reflected

### 1.4 Delete Country (Optional)
- [ ] Create a test country (e.g., "Test Country", "TC")
- [ ] Click "Delete" on test country
- [ ] Confirm deletion
- [ ] Verify it's removed from list

---

## Test 2: Admin2 - Administrative Units

### 2.1 View Admin Units for Jamaica
- [ ] Navigate to Admin2 → Location Risks → Administrative Units tab
- [ ] Select "Jamaica" from country dropdown
- [ ] Verify 14 admin units load
- [ ] Verify showing: Kingston, St. Andrew, St. Catherine, etc.
- [ ] Check loading state works properly

### 2.2 Create New Admin Unit (Trinidad)
- [ ] Select "Trinidad and Tobago" from dropdown
- [ ] Verify it shows "No administrative units found" (if empty)
- [ ] Click "+ Add Admin Unit"
- [ ] Fill in:
  - Name: "Port of Spain"
  - Type: "District"
  - Region: "Western"
  - Population: 37000
- [ ] Click Save
- [ ] Verify it appears in the list

### 2.3 Create Multiple Admin Units for Trinidad
- [ ] Add "San Fernando" (District, Southern, pop: 48000)
- [ ] Add "Arima" (District, Eastern, pop: 33000)
- [ ] Verify all 3 appear in the list

### 2.4 Edit Admin Unit
- [ ] Click "Edit" on Port of Spain
- [ ] Change population to 40000
- [ ] Click Save
- [ ] Verify changes are saved

### 2.5 Delete Admin Unit
- [ ] Create a test admin unit
- [ ] Delete it
- [ ] Verify it's removed

---

## Test 3: Admin2 - Parishes (Legacy)

### 3.1 View Parishes
- [ ] Navigate to Admin2 → Location Risks → Parishes (Legacy) tab
- [ ] Verify 14 Jamaican parishes show
- [ ] Verify no isCoastal/isUrban badges appear
- [ ] Switch to Matrix view
- [ ] Verify matrix displays correctly

### 3.2 Edit Parish Risk Data
- [ ] Click on a parish (e.g., Kingston)
- [ ] Edit button should NOT appear (we removed it)
- [ ] Verify this is working as expected

---

## Test 4: User Wizard - Country/Admin Unit Selection

### 4.1 Start New Wizard Flow
- [ ] Navigate to main wizard/home page
- [ ] Start a new business continuity plan

### 4.2 Select Business Type
- [ ] Choose a business type (e.g., "Restaurant")
- [ ] Click Continue

### 4.3 Select Country
- [ ] Verify country dropdown appears
- [ ] Verify Jamaica is auto-selected (or select it)
- [ ] Verify it shows "Jamaica" in the dropdown

### 4.4 Select Administrative Unit
- [ ] Verify admin units load for Jamaica
- [ ] Verify loading indicator shows briefly
- [ ] Verify 14 parishes appear in dropdown
- [ ] Select "Kingston"
- [ ] Click Continue

### 4.5 Answer Business Characteristics
- [ ] Answer the coastal/urban questions
  - "Is your business in a coastal area?" 
  - "Is your business in an urban area?"
- [ ] Verify these are now asked in the wizard (not stored in DB)
- [ ] Complete the wizard flow

### 4.6 Test with Trinidad (if created)
- [ ] Start new wizard flow
- [ ] Select business type
- [ ] Select "Trinidad and Tobago" from country dropdown
- [ ] Verify Trinidad admin units load (Port of Spain, San Fernando, Arima)
- [ ] Select one and complete flow

---

## Test 5: API Endpoints

### 5.1 Countries API
```bash
# GET all countries
curl http://localhost:3000/api/admin2/countries

# Expected: Jamaica and Trinidad (if created)
```

### 5.2 Admin Units API
```bash
# GET admin units for Jamaica
curl "http://localhost:3000/api/admin2/admin-units?countryId=JAMAICA_ID"

# Expected: 14 admin units
```

### 5.3 Admin Unit Risks API
```bash
# Update risk data
curl -X PUT http://localhost:3000/api/admin2/admin-unit-risks \
  -H "Content-Type: application/json" \
  -d '{"adminUnitId":"UNIT_ID","riskProfile":{...}}'
```

---

## Test 6: Data Integrity

### 6.1 Verify Migration
- [ ] Check database directly (Prisma Studio or SQL client)
- [ ] Verify Country table has 1+ entries
- [ ] Verify AdminUnit table has 14+ entries for Jamaica
- [ ] Verify AdminUnitRisk table has corresponding risk data
- [ ] Verify Parish table still exists (backward compatibility)

### 6.2 Verify Relationships
- [ ] Check AdminUnit → Country relationship works
- [ ] Check AdminUnit → AdminUnitRisk relationship works
- [ ] Verify cascade delete works (delete test country should delete its admin units)

---

## Test 7: Edge Cases

### 7.1 Empty States
- [ ] Create a country with no admin units
- [ ] Verify wizard handles it gracefully
- [ ] Verify admin UI shows "No administrative units found"

### 7.2 Network Errors
- [ ] Temporarily disable network (DevTools offline mode)
- [ ] Try loading countries
- [ ] Verify error handling works

### 7.3 Validation
- [ ] Try creating country without name → should fail
- [ ] Try creating country without code → should fail
- [ ] Try creating admin unit without name → should fail
- [ ] Try creating admin unit without country → should fail

---

## Test 8: UI/UX

### 8.1 Loading States
- [ ] Verify loading indicators show when fetching data
- [ ] Verify smooth transitions between states

### 8.2 Responsive Design
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1920px)
- [ ] Verify all forms are usable on small screens

### 8.3 User Feedback
- [ ] Verify success messages after create/update/delete
- [ ] Verify error messages for failed operations
- [ ] Verify confirmation dialogs for destructive actions

---

## Test 9: Backward Compatibility

### 9.1 Existing Wizard Flows
- [ ] Verify old wizard flows still work with Parish system
- [ ] Verify risk calculations still work
- [ ] Verify PDF generation still works

### 9.2 Legacy Admin Features
- [ ] Verify parish bulk upload still works
- [ ] Verify parish export still works
- [ ] Verify risk matrix still works

---

## Test 10: Performance

### 10.1 Load Times
- [ ] Measure time to load countries (<200ms expected)
- [ ] Measure time to load admin units (<300ms expected)
- [ ] Verify no unnecessary re-renders

### 10.2 Database Queries
- [ ] Check Network tab for API calls
- [ ] Verify no N+1 query problems
- [ ] Verify proper use of includes/relations

---

## 🐛 Bug Tracking

| Test # | Issue Found | Severity | Status |
|--------|-------------|----------|--------|
|        |             |          |        |

---

## ✅ Test Results Summary

**Date:** _______________
**Tester:** _______________
**Environment:** [ ] Local  [ ] Vercel Staging  [ ] Production

**Overall Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

**Pass Rate:** ____ / ____ tests passed

### Critical Issues Found:
- 

### Minor Issues Found:
- 

### Notes:
- 

---

## 🚀 Deployment Readiness

- [ ] All critical tests passing
- [ ] No blocking bugs found
- [ ] Performance acceptable
- [ ] User experience tested
- [ ] Edge cases handled
- [ ] Error handling works
- [ ] Data integrity verified
- [ ] Documentation complete

**Ready for Deployment:** [ ] YES  [ ] NO

**Sign-off:** _______________

