# Sample Data Tools for Testing

This directory contains tools for filling the Business Continuity Planning wizard with realistic sample data for testing and development purposes.

## 🎯 Purpose

These tools help you:
- **Test the review document** without manually filling out the entire wizard
- **Preview the final output** to refine styling and layout
- **Demonstrate the system** to stakeholders
- **Debug issues** with realistic, complete data

## 🚀 Quick Start

### Method 1: Dev Button (Recommended)

When running in development mode, you'll see two buttons in the bottom-left corner:

1. **"Fill with Sample Data"** (Purple button) - Loads complete sample data and refreshes the page
2. **"Clear Data"** (Red button) - Clears all wizard data and refreshes

Simply click "Fill with Sample Data" and the wizard will be populated with a complete Caribbean Resort & Spa business continuity plan.

### Method 2: Browser Console Script

1. Open your browser to the wizard page
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Copy the entire contents of `fill-wizard-with-sample-data.js`
5. Paste into the console and press Enter
6. Refresh the page

## 📊 Sample Data Overview

The sample data includes a complete business continuity plan for:

**Company:** Caribbean Resort & Spa Ltd.  
**Industry:** Hospitality & Tourism  
**Location:** Christ Church, Barbados  
**Type:** Luxury coastal resort with 150 rooms

### Included Sections

✅ **Plan Information** (12 fields)
- Company details, version info, plan managers

✅ **Business Overview** (4 detailed sections)
- Business purpose, products/services, target markets, competitive advantages

✅ **Essential Functions** (6 categories)
- Guest Services, Food & Beverage, Facilities, IT, Finance, Staff Management

✅ **Function Priorities** (5 prioritized functions)
- Critical functions with downtime assessments

✅ **Risk Assessment** (6 major risks)
- Hurricane, Power Outage, Water Contamination, Cyber Attack, Staff Unavailability, Supply Chain
- Each with likelihood, severity, risk scores, and planning measures

✅ **Strategies** (3 phases + long-term)
- 10 Prevention strategies
- 9 Response strategies  
- 8 Recovery strategies
- Long-term risk reduction plan

✅ **Contacts & Information**
- 5 Staff contacts
- 4 Key suppliers
- 3 Important customers
- 5 Emergency services

✅ **Vital Records** (8 record types)
- Insurance, databases, employee records, financial documents, etc.

✅ **Testing & Maintenance**
- 5 Testing schedules
- 4 Training programs
- 4 Performance metrics
- 3 Improvement tracking items
- Annual review process
- Trigger events for updates

## 🎨 Viewing the Review Document

After loading sample data:

1. Navigate through the wizard (all steps will be pre-filled)
2. Go to the last question in the last step
3. Click **"Complete Plan"** or **"Next"**
4. You'll see the complete Business Plan Review document

### Navigation Options

Once on the review page:
- **Back to Wizard** - Return to editing mode
- **Print** - Print the document directly
- **Download PDF** - Export as PDF (if configured)

## 🔧 Customizing Sample Data

To modify the sample data:

1. Open `fill-wizard-with-sample-data.js`
2. Edit the `sampleData` object
3. Save and reload in browser console

Or for the dev button:

1. Open `src/components/DevDataFiller.tsx`
2. Edit the `sampleData` object in the `fillWithSampleData` function
3. Restart your dev server

## 📝 Data Structure

The data follows the wizard's exact structure:

```javascript
{
  PLAN_INFORMATION: { /* fields */ },
  BUSINESS_OVERVIEW: { /* fields */ },
  ESSENTIAL_FUNCTIONS: { /* categories */ },
  FUNCTION_PRIORITIES: { /* assessment table */ },
  RISK_ASSESSMENT: { /* risk matrix */ },
  STRATEGIES: { /* prevention, response, recovery */ },
  CONTACTS_AND_INFORMATION: { /* contact lists */ },
  VITAL_RECORDS: { /* records inventory */ },
  TESTING_AND_MAINTENANCE: { /* schedules and metrics */ }
}
```

## 🎯 Use Cases

### 1. Testing Review Document Layout
```
1. Load sample data
2. Navigate to review page
3. Test print layout
4. Refine CSS/styling
5. Clear data and repeat
```

### 2. Demonstrating to Stakeholders
```
1. Load sample data before meeting
2. Walk through completed plan
3. Show professional output
4. Discuss customization options
```

### 3. Development Testing
```
1. Load sample data
2. Test new features
3. Verify data flows correctly
4. Check edge cases
```

### 4. Creating Screenshots/Documentation
```
1. Load sample data
2. Navigate to desired section
3. Capture professional-looking screenshots
4. Use in documentation/marketing
```

## ⚠️ Important Notes

- **Development Only**: The dev button only appears in development mode
- **LocalStorage**: Data is stored in browser's localStorage
- **No Backend**: Sample data doesn't save to database
- **Browser-Specific**: Each browser stores data separately
- **Easy Reset**: Use "Clear Data" button to start fresh

## 🐛 Troubleshooting

**Q: Dev buttons don't appear**  
A: Ensure you're running in development mode (`npm run dev`)

**Q: Data doesn't load**  
A: Check browser console for errors. Try clearing localStorage first.

**Q: Page doesn't refresh automatically**  
A: Manually refresh the page after running the console script

**Q: Review page looks broken**  
A: Ensure all wizard steps were properly saved. Try clearing and reloading.

## 📚 Related Files

- `scripts/fill-wizard-with-sample-data.js` - Console script version
- `src/components/DevDataFiller.tsx` - React component with buttons
- `src/components/BusinessPlanReview.tsx` - Review document component
- `src/components/BusinessContinuityForm.tsx` - Main wizard form

## 🎨 Sample Company Profile

The sample data represents:

**Caribbean Resort & Spa Ltd.**
- 150 luxury rooms on beachfront property
- Three restaurants + spa facilities
- Water sports and event services
- International tourism focus
- Located in hurricane-prone region
- Strong emphasis on business continuity

This profile was chosen to showcase:
- Complex operations with multiple departments
- Multiple risk types (natural disasters, cyber, operational)
- Comprehensive contact networks
- Realistic Caribbean business challenges
- Professional documentation standards

---

**Happy Testing! 🚀**

For questions or issues, check the main project README or open an issue.





