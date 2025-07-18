# Excel Upload Feature Guide

## Overview
The BCP Tool now supports Excel file uploads for table data entry, making it faster and more convenient to input structured information like contact lists, action plans, and testing schedules.

## Supported File Formats
- **.xlsx** (Excel 2007 and later)
- **.xls** (Excel 97-2003)

## File Size Limit
- Maximum file size: **5MB**

## How It Works

### 1. Automatic Column Matching
The system automatically matches Excel column headers to the expected form fields using:
- **Exact matching** (case-insensitive)
- **Partial matching** for similar terms
- **Smart mapping** that handles variations in column names

### 2. Data Validation
- Validates file format and size
- Checks for required column headers
- Skips empty rows automatically
- Handles missing data gracefully

### 3. Preview Before Import
- Shows first 5 rows of parsed data
- Displays total row count
- Allows review and confirmation before importing

## Excel File Preparation Tips

### Column Headers
Make sure your Excel file has clear column headers in the **first row**. Examples:

**Staff Contact Information:**
```
Name | Position | Phone Number | Email Address | Emergency Contact
```

**Supplier Information:**
```
Supplier Name | Goods/Services Supplied | Phone Number | Email Address | Backup Supplier
```

**Action Plan by Risk Level:**
```
Hazard/Risk | Immediate Actions (0-24 hours) | Short-term Actions (1-7 days) | Medium-term Actions (1-4 weeks) | Responsible Person
```

### Data Format Guidelines
- **Text fields**: Regular text entries
- **Phone numbers**: Any format (e.g., "876-555-0123" or "+1 876 555 0123")
- **Email addresses**: Standard email format
- **Dates**: Any recognizable date format

### Common Column Name Variations
The system recognizes these variations:
- "Name" = "Staff Name", "Employee Name", "Person Name"
- "Phone" = "Phone Number", "Telephone", "Contact Number"
- "Email" = "Email Address", "E-mail", "Electronic Mail"
- "Position" = "Job Title", "Role", "Department"

## Step-by-Step Usage

### 1. Prepare Your Excel File
- Open Excel and create a new spreadsheet
- Add column headers in the first row matching the expected fields
- Enter your data in the subsequent rows
- Save as .xlsx or .xls format

### 2. Upload in BCP Tool
- Navigate to any table input section (Staff Contacts, Suppliers, etc.)
- Click "Choose Excel File" in the upload section
- Select your prepared Excel file
- Wait for processing (usually takes a few seconds)

### 3. Review and Import
- Check the preview showing first 5 rows
- Verify the data looks correct
- Click "Import X Rows" to add data to your form
- Continue with manual entry if needed

## Error Handling

### Common Upload Errors
- **File too large**: Reduce file size to under 5MB
- **Invalid format**: Ensure file is .xlsx or .xls
- **No matching columns**: Check that column headers match expected fields
- **Empty file**: Add data rows to your Excel file

### If Columns Don't Match
- Check spelling of column headers
- Try simpler header names (e.g., "Name" instead of "Full Name of Employee")
- Ensure headers are in the first row
- Remove any merged cells in the header row

## Best Practices

### 1. Start Simple
- Use basic column names that match the form fields
- Test with a small file (5-10 rows) first
- Build up to larger datasets once familiar

### 2. Data Quality
- Remove empty rows from your Excel file
- Ensure consistent data formatting
- Use the same format for similar fields (all phone numbers, all emails)

### 3. Backup Strategy
- Keep a backup of your Excel files
- You can always manually edit imported data if needed
- Re-upload if you need to make major changes

## Supported Table Types

The Excel upload feature works with these form sections:
- ✅ Staff Contact Information
- ✅ Key Customer Contacts  
- ✅ Supplier Information
- ✅ Emergency Services and Utilities
- ✅ Plan Distribution List
- ✅ Plan Testing Schedule
- ✅ Plan Revision History
- ✅ Improvement Tracking
- ✅ Action Plan by Risk Level
- ✅ Testing and Assessment Plan
- ✅ Function Priority Assessment

## Technical Notes

### Security
- Files are processed entirely in your browser
- No data is sent to external servers during parsing
- Files are automatically cleared from memory after processing

### Performance
- Processing is typically completed in 1-3 seconds
- Larger files (1000+ rows) may take longer
- Maximum processing time is 30 seconds

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript to be enabled
- No additional plugins or software needed

## Troubleshooting

### Upload Not Working?
1. Check internet connection
2. Ensure JavaScript is enabled
3. Try a smaller file first
4. Clear browser cache and try again

### Data Not Displaying Correctly?
1. Check Excel column headers match expected fields
2. Ensure data is in the correct format
3. Remove any special characters or formatting
4. Try saving Excel file in .xlsx format

### Need Help?
- Review this guide for common solutions
- Check that your Excel file follows the formatting guidelines
- Try the manual data entry option as an alternative

---

**Note**: This feature is designed to speed up data entry, but you can always use manual entry or a combination of both methods to complete your Business Continuity Plan. 