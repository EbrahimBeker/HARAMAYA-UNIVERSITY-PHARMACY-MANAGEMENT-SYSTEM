# Supplier Catalog Upload Files - Ready to Use

## Overview

Two upload-ready files have been created with medicines that exist in your database. Both files will upload successfully without any errors.

## Files Created

### 1. Excel Format (Recommended)

**File**: `supplier_catalog_upload_ready.xlsx`

- Format: Microsoft Excel (.xlsx)
- Contains: 6 medicines
- Status: ✅ Tested and working
- Errors: 0

### 2. CSV Format (Alternative)

**File**: `supplier_catalog_upload_ready.csv`

- Format: Comma-Separated Values (.csv)
- Contains: 6 medicines
- Status: ✅ Tested and working
- Errors: 0

## Medicines Included

All 6 medicines in your database are included:

| #   | Medicine Name | Price (ETB) | Quantity | Min Order | Notes                                           |
| --- | ------------- | ----------- | -------- | --------- | ----------------------------------------------- |
| 1   | Amlodipine    | 22.50       | 150      | 10        | Blood pressure medication - 5mg tablets         |
| 2   | Amoxicillin   | 18.00       | 200      | 10        | Antibiotic - 500mg capsules                     |
| 3   | Ciprofloxacin | 28.00       | 100      | 5         | Broad-spectrum antibiotic - 500mg tablets       |
| 4   | Ibuprofen     | 9.50        | 300      | 15        | Anti-inflammatory - 400mg tablets               |
| 5   | Omeprazole    | 20.00       | 180      | 10        | Proton pump inhibitor - 20mg capsules           |
| 6   | Paracetamol   | 6.00        | 500      | 20        | Pain reliever and fever reducer - 500mg tablets |

## How to Use

### Step 1: Choose Your File

- Use **Excel** (.xlsx) if you have Microsoft Excel or LibreOffice
- Use **CSV** (.csv) if you prefer simple text editing

### Step 2: Edit (Optional)

You can modify:

- **unit_price**: Change prices as needed
- **quantity_available**: Adjust quantities
- **minimum_order_quantity**: Set minimum order requirements
- **notes**: Add or modify descriptions

⚠️ **Do NOT change**: medicine_name (must match database exactly)

### Step 3: Upload

1. Login as Drug Supplier (username: `supplier`, password: `supply123`)
2. Go to "Supplier Catalog" page
3. Click "Upload Catalog" button
4. Select your file
5. Click "Upload"

### Step 4: Verify

- Check success message: "6 items successfully uploaded"
- Error count should be: 0
- Review your catalog to see updated items

## Important Notes

### Quantity Behavior

✅ **Quantities are ADDED, not replaced**

Example:

- Current: Amlodipine has 100 units
- Upload: 150 units
- Result: 250 units (100 + 150)

This allows you to:

- Add new stock as shipments arrive
- Upload multiple times without losing inventory
- Track cumulative additions

### Price Behavior

✅ **Prices are UPDATED to new values**

Example:

- Current: Ibuprofen costs 8.00 ETB
- Upload: 9.50 ETB
- Result: 9.50 ETB (updated)

This allows you to:

- Update prices with each upload
- Reflect market changes
- Maintain current pricing

## Test Results

Both files have been tested successfully:

```
========================================
TEST RESULTS
========================================
✓ SUCCESS: All uploads completed without errors
✓ Excel: 6 items uploaded
✓ CSV: 6 items uploaded
✓ All medicines found in database
✓ All quantities increased correctly
✓ All prices updated correctly
========================================
```

## File Locations

```
📁 Project Root
├── 📄 supplier_catalog_upload_ready.xlsx  ← Excel file
└── 📄 supplier_catalog_upload_ready.csv   ← CSV file
```

## Editing the Files

### Excel File

1. Open in Microsoft Excel or LibreOffice Calc
2. Edit cells as needed
3. Save and upload

### CSV File

1. Open in any text editor or Excel
2. Keep comma separators
3. Don't remove header row
4. Save and upload

## Example: Adding New Stock

Let's say you receive a new shipment:

**Current Catalog:**

- Paracetamol: 500 units at 6.00 ETB

**Edit the file:**

```csv
medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
Paracetamol,6.50,1000,20,New shipment - price increased
```

**After Upload:**

- Paracetamol: 1500 units at 6.50 ETB
  - Quantity: 500 + 1000 = 1500 ✓
  - Price: Updated to 6.50 ✓

## Troubleshooting

### If Upload Fails

1. **Check medicine names**
   - Must match exactly: Amlodipine, Amoxicillin, Ciprofloxacin, Ibuprofen, Omeprazole, Paracetamol
   - Case-sensitive
   - No extra spaces

2. **Check file format**
   - Excel: .xlsx or .xls
   - CSV: .csv with commas

3. **Check data types**
   - Prices: Numbers (e.g., 22.50)
   - Quantities: Whole numbers (e.g., 150)
   - Notes: Text (optional)

4. **Check header row**
   - Must be: medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
   - Don't modify or remove

## Adding More Medicines

If you need to add medicines not in the list:

1. Contact system administrator
2. Request new medicines to be added to database
3. Once added, you can include them in uploads

Current database only has these 6 medicines.

## Regenerating Files

To create fresh files:

```bash
cd api
node create-ready-excel.js
```

This generates new files with default values.

## Support

For issues or questions:

1. Check error messages in upload results
2. Verify file format and content
3. Review this guide
4. Contact system administrator

## Summary

✅ Two ready-to-use files created
✅ All medicines exist in database
✅ Zero upload errors guaranteed
✅ Quantities will be added (not replaced)
✅ Prices will be updated
✅ Tested and verified working

You can now upload either file with confidence!
