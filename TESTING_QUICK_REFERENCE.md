# Quick Testing Reference - Formal BCP Fixes

## 🚀 Quick Test (5 minutes)

### Test 1: Currency Display ✅
1. Open wizard, select **Barbados (BB)** as country
2. Complete wizard, select **9 strategies**
3. Go to Review → Click **"Formal BCP (Loan Submission)"**
4. **Check**: All costs show **Bds$ BBD** (not J$ JMD)

**Expected Console Output**:
```
[FormalBCPPreview] Detected currency: { countryCode: 'BB', currencySymbol: 'Bds$' }
[FormalBCPPreview] Strategy cost summary: { withCurrencyData: 9 }
```

---

### Test 2: Strategy Count ✅
1. In same session as Test 1
2. Count strategies in wizard review: Should show **"9 strategies selected"**
3. Switch to Formal BCP preview
4. **Check**: Scroll through Section 3, count all strategy cards
5. **Expected**: All 9 strategies displayed

**Expected Console Output**:
```
[FormalBCPPreview] Received props: { strategiesCount: 9 }
[FormalBCPPreview] Risk matching results: { risksWithStrategies: 6 }
[FormalBCPPreview] Total strategies that will display: 9
```

---

### Test 3: PDF Export ✅
1. In Formal BCP preview, click **"📄 Export PDF"**
2. **Check**: PDF shows same currency and strategy count as browser

**Expected**: Bds$ throughout PDF, all 9 strategies present

---

## 🌍 Multi-Country Test

| Country | Code | Expected Currency |
|---------|------|-------------------|
| Barbados | BB | Bds$ BBD |
| Jamaica | JM | J$ JMD |
| Trinidad | TT | TT$ TTD |
| Bahamas | BS | B$ BSD |
| Grenada | GD | EC$ XCD |

**Test each**: Complete wizard → Check preview shows correct currency

---

## 🐛 Debug Console Checks

### ✅ Good Output:
```
[FormalBCPPreview] ========================================
[FormalBCPPreview] Received props: { strategiesCount: 9, risksCount: 6 }
[FormalBCPPreview] Detected currency: { countryCode: 'BB', currencySymbol: 'Bds$' }
[FormalBCPPreview] Strategy cost summary: {
  withCalculatedCost: 9,
  withCurrencyData: 9
}
[FormalBCPPreview] Risk matching results: {
  highPriorityRisks: 4,
  risksWithStrategies: 6
}
[FormalBCP] Strategy "Hurricane Preparedness": cost=2383, currency=Bds$BBD, fromStrategy=YES
```

### ❌ Bad Output (report if you see):
```
[FormalBCPPreview] Detected currency: { countryCode: 'BB', currencySymbol: 'Bds$' }
[FormalBCP] Strategy "X": cost=2383, currency=J$JMD, fromStrategy=NO  ← WRONG CURRENCY
```

---

## 📋 Visual Checklist

When viewing Formal BCP Preview, verify:

- [ ] Header shows correct business name
- [ ] Section 3.1 total investment: **"Bds$35,261 BBD"** (example)
- [ ] Section 3.1 breakdown: **"Prevention: Bds$18,000 (51%)"**
- [ ] Section 3.2 each strategy card: **"Investment: Bds$2,383 BBD"**
- [ ] NO strategy shows "JMD" if country is not Jamaica
- [ ] Count strategy cards = 9 total

---

## 🆘 Troubleshooting

### Issue: Wrong currency shows
**Fix**: Check `localStorage.getItem('bcp-prefill-data')` contains correct `countryCode`

### Issue: Only 3 strategies show
**Fix**: Check console for risk matching logs - verify `applicableRisks` arrays are populated

### Issue: Strategies missing currency data
**Fix**: Verify BusinessPlanReview enrichment is running - check for `calculatedCostLocal` in logs

---

## ✅ Success Indicators

1. **Console shows**: `strategiesCount: 9`, `withCurrencyData: 9`
2. **Preview displays**: All costs in Bds$ (for Barbados)
3. **PDF matches**: Browser preview exactly
4. **Cross-country**: Works for JM, TT, BS, BB, GD

---

## 📞 Report Format (if issues found)

```
Country: Barbados (BB)
Strategies selected: 9
Issue: Only 3 strategies showing

Console output:
[paste relevant logs]

Screenshot: [attach]
```

---

**Files Changed**:
- ✅ `src/components/previews/FormalBCPPreview.tsx` (currency fix + debug logs)
- ✅ `src/utils/formalBCPTransformer.ts` (currency fix for PDF + debug logs)

**No changes needed in**: wizard, cost calculation service, or API routes (already correct)




