# 🚀 Wizard Questions - Quick Reference

## ✅ What's Active Now

### Location Section (Checkboxes)
1. Near coast (Within 5km)
2. Urban area (City/densely populated)

### Business Characteristics (7 Questions)

| # | Question | Type | Options | Multiplier |
|---|----------|------|---------|------------|
| 1 | **Power Dependency** | Multi-choice | Critical / Moderate / Low | 1.5x |
| 2 | **Perishable Goods** | Yes/No | Sell food, flowers, etc.? | 1.35x |
| 3 | **Digital Dependency** | Multi-choice | Critical / Moderate / Low | 1.4x |
| 4 | **Customer Mix** | Multi-choice | Tourists / Mixed / Locals | 1.25x |
| 5 | **High-Value Equipment** | Yes/No | Expensive machinery? | 1.3x |
| 6 | **Inventory Strategy** | Yes/No | Minimal vs. significant stock | 1.25x |
| 7 | **Seasonal Revenue** | Yes/No | Concentrated in certain months? | 1.2x |

---

## 🎨 UI Features

### Question Layout
- Numbered circle badge (1-7)
- Large, clear question text
- Info box with help text (blue accent)
- Card-style answer options

### Answer Cards
- Radio button + label + description
- Hover: Border color change + shadow
- Selected: Blue background + border + checkmark icon
- Smooth transitions

---

## 🌍 Languages

All content (questions, options, help text) available in:
- 🇬🇧 English
- 🇪🇸 Español
- 🇫🇷 Français

---

## 📊 Database Status

| Status | Count | Notes |
|--------|-------|-------|
| **Active with questions** | 7 | Production-ready |
| **Deactivated (location)** | 3 | Handled by checkboxes |
| **Total multipliers** | 13 | Some without wizard questions |

---

## 🔧 For Admins

### To Add New Question:
1. Admin2 → Risk Multipliers → Add New
2. Fill: Name, characteristic type, factor, hazards
3. Add wizard question (EN/ES/FR)
4. Add answer options with labels
5. Add help text
6. Set Active = true
7. Save

### To Remove Question:
1. Admin2 → Risk Multipliers → Edit
2. Set Active = false
3. Save

**No code changes needed!**

---

## 🧪 Test URL

**http://localhost:3001**

Path: Home → Select Business → Select Location → **Tell Us About Your Business**

---

## 📝 Notes

- Questions appear in priority order (1-3 highest impact)
- All questions required before continuing
- Answers drive multiplier calculations
- Location checkboxes also set characteristics
- Total time: ~2 minutes

---

## ✨ Key Benefits

✅ Dynamic (database-driven)  
✅ Multilingual (EN/ES/FR)  
✅ Beautiful UI (modern cards)  
✅ Clear guidance (help text)  
✅ BCP-focused (7 essential questions)  
✅ No duplicates  
✅ Admin-controlled  

**Production-ready!** 🎉


