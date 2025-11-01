# CSV Import/Export Guide for Multilingual Strategies

## Overview

This system allows you to:
- ✅ Export all strategies and action steps to CSV
- ✅ Edit translations in Excel/Google Sheets (or via AI tools)
- ✅ Import updated data back to database
- ✅ Maintain all three languages (EN/ES/FR) easily

## Quick Start

### 1. Export Current Data

```bash
node scripts/export-strategies-to-csv.js
```

This creates two files in the `data/` folder:
- `strategies-export.csv` - All strategies with multilingual fields
- `action-steps-export.csv` - All action steps with multilingual fields

### 2. Edit in Excel/Google Sheets

Open the CSV files and you'll see columns like:
- `smeTitle_EN`, `smeTitle_ES`, `smeTitle_FR`
- `smeSummary_EN`, `smeSummary_ES`, `smeSummary_FR`
- etc.

**For text fields:**
- Just type the translation directly

**For array fields (benefitsBullets, helpfulTips, etc.):**
- Separate items with ` | ` (space-pipe-space)
- Example: `"Benefit 1 | Benefit 2 | Benefit 3"`

### 3. Import Updated Data

```bash
node scripts/import-strategies-from-csv.js
```

This reads the CSV files and updates the database.

## File Structure

### strategies-export.csv

| Column | Type | Description |
|--------|------|-------------|
| strategyId | ID | Unique identifier (don't change) |
| name | Text | Admin-facing name |
| category | Enum | prevention/preparation/response/recovery |
| smeTitle_EN/ES/FR | Text | User-facing title in each language |
| smeSummary_EN/ES/FR | Text | Summary description in each language |
| realWorldExample_EN/ES/FR | Text | Success story in each language |
| lowBudgetAlternative_EN/ES/FR | Text | Budget option in each language |
| diyApproach_EN/ES/FR | Text | DIY instructions in each language |
| benefitsBullets_EN/ES/FR | Array | Benefits list (items separated by \|) |
| helpfulTips_EN/ES/FR | Array | Tips list (items separated by \|) |
| commonMistakes_EN/ES/FR | Array | Mistakes list (items separated by \|) |
| successMetrics_EN/ES/FR | Array | Success metrics (items separated by \|) |

### action-steps-export.csv

| Column | Type | Description |
|--------|------|-------------|
| stepId | ID | Unique identifier (don't change) |
| strategyId | ID | Parent strategy (don't change) |
| phase | Enum | immediate/short_term/medium_term/long_term |
| sortOrder | Number | Display order |
| title_EN/ES/FR | Text | Step title in each language |
| description_EN/ES/FR | Text | Step description in each language |
| whyThisStepMatters_EN/ES/FR | Text | Importance explanation |
| whatHappensIfSkipped_EN/ES/FR | Text | Consequences if skipped |
| howToKnowItsDone_EN/ES/FR | Text | Completion criteria |
| exampleOutput_EN/ES/FR | Text | Example of completion |
| freeAlternative_EN/ES/FR | Text | Free/low-cost option |
| lowTechOption_EN/ES/FR | Text | Non-digital alternative |
| commonMistakesForStep_EN/ES/FR | Array | Step-specific mistakes (separated by \|) |

## Usage Workflows

### Workflow 1: Add Spanish Translations

1. **Export:**
   ```bash
   node scripts/export-strategies-to-csv.js
   ```

2. **Edit in Excel:**
   - Open `data/strategies-export.csv`
   - Filter to show only rows where `smeTitle_ES` is empty
   - Fill in Spanish translations for all `*_ES` columns
   - Save file

3. **Import:**
   ```bash
   node scripts/import-strategies-from-csv.js
   ```

4. **Verify:**
   - Open admin panel
   - Check strategies show Spanish translations
   - Test wizard in Spanish

### Workflow 2: Bulk Update with AI

1. **Export:**
   ```bash
   node scripts/export-strategies-to-csv.js
   ```

2. **Use AI (ChatGPT/Claude):**
   - Upload CSV to AI tool
   - Prompt: "Translate all _EN columns to Spanish in _ES columns and French in _FR columns"
   - Download updated CSV

3. **Import:**
   ```bash
   node scripts/import-strategies-from-csv.js
   ```

### Workflow 3: Add New Strategy

1. **Export** to get template

2. **Add row:**
   - Set unique `strategyId` (e.g., `new_strategy_2024`)
   - Fill all _EN, _ES, _FR columns
   - Set category, costs, etc.

3. **Import** 
   - Script will create new strategy if strategyId doesn't exist

4. **Add Action Steps:**
   - Export action steps
   - Add rows with same `strategyId`
   - Unique `stepId` for each step
   - Import

### Workflow 4: Fix Incomplete Translations

1. **Export:**
   ```bash
   node scripts/export-strategies-to-csv.js
   ```

2. **Identify gaps:**
   - Open in Excel
   - Filter for empty cells in _ES or _FR columns
   - These are your missing translations

3. **Fill gaps:**
   - Add translations manually
   - Or use AI to fill empty cells

4. **Import:**
   ```bash
   node scripts/import-strategies-from-csv.js
   ```

## Array Field Format

For fields like `benefitsBullets`, `helpfulTips`, `commonMistakes`:

**In CSV (use pipe separator):**
```
"Benefit one | Benefit two | Benefit three"
```

**In database (stored as JSON):**
```json
{
  "en": ["Benefit one", "Benefit two", "Benefit three"],
  "es": ["Beneficio uno", "Beneficio dos", "Beneficio tres"],
  "fr": ["Avantage un", "Avantage deux", "Avantage trois"]
}
```

**Rules:**
- Separate items with ` | ` (space-pipe-space)
- Can have different number of items per language (but try to match)
- Empty arrays are fine

## CSV Best Practices

### 1. Don't Change IDs
- `strategyId` and `stepId` are keys - changing them breaks links
- To rename, change the `name` field instead

### 2. Handle Special Characters
- Commas, quotes, newlines in text are OK
- Script handles CSV escaping automatically

### 3. Keep Parallel Structure
- If English has 4 benefits, Spanish and French should too
- Helps maintain quality and consistency

### 4. Test After Import
- Always check admin panel after import
- Verify no data lost
- Test wizard in all 3 languages

### 5. Backup Before Import
- Export creates snapshot of current data
- Keep dated copies before major changes

## Example: Translating One Strategy

**Before (strategies-export.csv):**
```csv
strategyId,smeTitle_EN,smeTitle_ES,smeTitle_FR,smeSummary_EN,smeSummary_ES,smeSummary_FR
cybersecurity_protection,"Protect from Hackers","","","Cyber criminals target...","",""
```

**After editing:**
```csv
strategyId,smeTitle_EN,smeTitle_ES,smeTitle_FR,smeSummary_EN,smeSummary_ES,smeSummary_FR
cybersecurity_protection,"Protect from Hackers","Protege de Hackers","Protégez des Hackers","Cyber criminals target...","Ciberdelincuentes atacan...","Cybercriminels ciblent..."
```

**Import and verify:**
```bash
node scripts/import-strategies-from-csv.js
```

Admin panel now shows all 3 translations!

## Troubleshooting

### Problem: Import says "Strategy not found"

**Solution:** The `strategyId` in CSV doesn't match database. Check spelling or run export again to get current IDs.

### Problem: Array items not importing correctly

**Solution:** Ensure items separated by ` | ` (space-pipe-space), not just `|` or `,`

### Problem: Special characters corrupted

**Solution:** Save CSV as UTF-8 encoding in Excel (Save As → Tools → Web Options → Encoding → UTF-8)

### Problem: Changes not showing in wizard

**Solution:**
1. Check if import completed successfully
2. Verify data in admin panel
3. Clear browser cache
4. Hard refresh (Ctrl+F5)

## Advanced: AI-Assisted Translation

### Using ChatGPT/Claude

**Prompt:**
```
I have a CSV with strategy translations. Please:
1. Translate all *_EN columns to Spanish in *_ES columns
2. Translate all *_EN columns to French in *_FR columns
3. Maintain CSV structure exactly
4. Keep pipe separators (|) in array fields
5. Use Caribbean Spanish dialect
6. Use formal French for business context

Here's the CSV:
[paste CSV content]
```

### Using Google Translate Sheets Function

In Google Sheets:
```
=GOOGLETRANSLATE(A2, "en", "es")
```

Apply to all _ES columns (change "es" to "fr" for French)

### Professional Translation Service

1. Export CSV
2. Send to translator with clear instructions about `|` separators
3. Import translated CSV
4. Review in admin panel

## Maintenance

### Regular Tasks

**Weekly:**
- Export CSV to backup current state
- Check for empty translations

**Monthly:**
- Review and update translations based on user feedback
- Add new strategies via CSV

**Quarterly:**
- Full translation audit
- Update based on seasonal needs (hurricane season, etc.)

## Integration with Development

### Version Control

```bash
# Commit CSV snapshots
git add data/strategies-export-2024-10-13.csv
git commit -m "Snapshot: Spanish translations complete"
```

### Automated Backups

```bash
# In package.json scripts:
"export-data": "node scripts/export-strategies-to-csv.js",
"import-data": "node scripts/import-strategies-from-csv.js",
"backup-data": "node scripts/export-strategies-to-csv.js && cp data/strategies-export.csv data/backup-$(date +%Y%m%d).csv"
```

## Summary

**Export → Edit → Import** workflow makes multilingual management easy:

✅ Work in familiar spreadsheet tools
✅ Use AI for bulk translation
✅ Easy collaboration with translators
✅ Version control friendly
✅ No SQL knowledge needed
✅ Safe and reversible

Happy translating! 🌐









