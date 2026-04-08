# CSV Upload Quick Reference

## File Format

### Required Columns

| Column Name            | Type    | Required | Description                                 | Example       |
| ---------------------- | ------- | -------- | ------------------------------------------- | ------------- |
| medicine_name          | Text    | Yes      | Name of the medicine (must exist in system) | Paracetamol   |
| unit_price             | Decimal | Yes      | Price per unit in ETB                       | 5.50          |
| quantity_available     | Integer | No       | Stock quantity (default: 0)                 | 1000          |
| minimum_order_quantity | Integer | No       | Minimum order qty (default: 1)              | 10            |
| notes                  | Text    | No       | Additional notes                            | Pain reliever |

### Alternative Column Names

The system accepts these variations:

**Medicine Name:**

- `medicine_name`
- `Medicine`
- `medicine`

**Price:**

- `unit_price`
- `price`
- `Price`

**Quantity:**

- `quantity_available`
- `quantity`
- `Quantity`

**Minimum Order:**

- `minimum_order_quantity`
- `min_quantity`

**Notes:**

- `notes`
- `Notes`

## Sample CSV File

```csv
medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
Paracetamol,5.50,1000,10,Pain reliever and fever reducer
Amoxicillin,12.00,500,5,Antibiotic for bacterial infections
Ibuprofen,8.75,750,10,Anti-inflammatory and pain reliever
Omeprazole,15.00,300,5,Proton pump inhibitor for acid reflux
Amlodipine,20.00,400,5,Calcium channel blocker for hypertension
Ciprofloxacin,18.50,250,5,Fluoroquinolone antibiotic
Metformin,10.00,600,10,Diabetes medication
Atorvastatin,25.00,350,5,Cholesterol medication
Losartan,22.00,450,5,Blood pressure medication
Aspirin,3.50,2000,20,Blood thinner and pain reliever
```

## Excel Format

You can also use Excel (.xlsx or .xls) files with the same structure:

| medicine_name | unit_price | quantity_available | minimum_order_quantity | notes         |
| ------------- | ---------- | ------------------ | ---------------------- | ------------- |
| Paracetamol   | 5.50       | 1000               | 10                     | Pain reliever |
| Amoxicillin   | 12.00      | 500                | 5                      | Antibiotic    |

## Validation Rules

### Medicine Name

- ✅ Must match an existing medicine in the system
- ✅ Partial matches are supported (e.g., "Paracetamol" matches "Paracetamol 500mg")
- ✅ Case-insensitive search
- ❌ Empty or missing name will cause error

### Unit Price

- ✅ Must be a positive number
- ✅ Decimal values allowed (e.g., 5.50)
- ✅ Up to 2 decimal places
- ❌ Negative or zero values not allowed
- ❌ Non-numeric values will cause error

### Quantity Available

- ✅ Must be a whole number
- ✅ Zero is allowed
- ✅ Default: 0 if not provided
- ❌ Negative values not allowed

### Minimum Order Quantity

- ✅ Must be a positive whole number
- ✅ Default: 1 if not provided
- ❌ Zero or negative values not allowed

### Notes

- ✅ Optional field
- ✅ Any text allowed
- ✅ Can be empty

## Upload Process

1. **Prepare File**
   - Use CSV or Excel format
   - Include header row with column names
   - Fill in data rows

2. **Upload**
   - Click "Upload Excel/CSV" button
   - Select your file
   - Wait for processing

3. **Review Results**
   - Success count: Items added/updated
   - Error count: Items that failed
   - Error details: Check console for specifics

4. **Handle Errors**
   - Review error messages
   - Fix issues in your file
   - Re-upload corrected file

## Common Errors

### "Medicine not found"

**Cause**: Medicine name doesn't match any medicine in the system
**Solution**:

- Check spelling
- Try shorter name (e.g., "Paracetamol" instead of "Paracetamol 500mg Tablets")
- Contact admin to add new medicine

### "Missing medicine name or invalid price"

**Cause**: Required field is empty or price is not a number
**Solution**:

- Ensure medicine_name column has value
- Ensure unit_price is a valid number

### "Row X: [error message]"

**Cause**: Specific row has an issue
**Solution**:

- Check the indicated row number (Excel row = CSV row + 1)
- Fix the issue
- Re-upload

## Tips for Success

1. **Start Small**: Test with 5-10 items first
2. **Use Template**: Download the template from the system
3. **Check Names**: Verify medicine names exist in system
4. **Consistent Format**: Use same format for all rows
5. **No Special Characters**: Avoid special characters in medicine names
6. **Save as CSV**: If using Excel, save as CSV for best compatibility
7. **UTF-8 Encoding**: Use UTF-8 encoding for special characters
8. **No Empty Rows**: Remove empty rows from file
9. **Header Required**: First row must be column headers
10. **Backup First**: Keep a backup of your original file

## File Size Limits

- Maximum file size: 5 MB
- Recommended: Under 1000 rows per file
- For larger catalogs: Split into multiple files

## Supported File Types

- ✅ .csv (Comma-Separated Values)
- ✅ .xlsx (Excel 2007+)
- ✅ .xls (Excel 97-2003)
- ❌ .txt (Plain text)
- ❌ .pdf (PDF documents)
- ❌ .doc/.docx (Word documents)

## Example: Complete Workflow

1. **Download Template**

   ```
   Click "Template" button → Save file
   ```

2. **Open in Excel**

   ```
   Open template.csv in Excel or Google Sheets
   ```

3. **Fill Data**

   ```
   Add your medicines with prices and quantities
   ```

4. **Save File**

   ```
   File → Save As → CSV (Comma delimited)
   ```

5. **Upload**

   ```
   Click "Upload Excel/CSV" → Select file → Wait
   ```

6. **Verify**
   ```
   Check success message
   Review catalog table
   Verify statistics updated
   ```

## Need Help?

- Check medicine names in the system first
- Use the template as a guide
- Start with a small test file
- Contact admin if medicines are missing
- Review error messages carefully
- Check browser console for detailed errors

---

**Quick Download Template**: Click "Template" button in Drug Catalog page

**Test File Available**: `test_catalog_upload.csv` in project root
