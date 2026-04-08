# Supplier Catalog Upload Guide

## Overview

This guide explains how to use the bulk upload feature to add or update multiple drugs in your supplier catalog at once.

## Template Files

Two template files are provided:

1. **supplier_catalog_template.xlsx** - Excel format (recommended)
2. **supplier_catalog_template.csv** - CSV format (for simple editing)

Both files contain 20 sample drugs with realistic data.

## File Format

### Required Columns

| Column Name            | Type   | Description                                 | Example       |
| ---------------------- | ------ | ------------------------------------------- | ------------- |
| medicine_name          | Text   | Name of the medicine (must exist in system) | Paracetamol   |
| unit_price             | Number | Price per unit in ETB                       | 5.50          |
| quantity_available     | Number | Available quantity to add                   | 500           |
| minimum_order_quantity | Number | Minimum order quantity                      | 10            |
| notes                  | Text   | Additional information (optional)           | Pain reliever |

### Column Aliases

The system accepts alternative column names:

- **medicine_name**: Medicine, medicine
- **unit_price**: price, Price
- **quantity_available**: quantity, Quantity
- **minimum_order_quantity**: min_quantity

## Important Notes

### 1. Medicine Names

- Medicine must already exist in the system
- System searches by name or generic name
- Partial matches are supported (e.g., "Paracet" will match "Paracetamol")
- If medicine not found, that row will be skipped with an error message

### 2. Quantity Behavior

⚠️ **IMPORTANT**: When uploading existing drugs:

- Quantities are **ADDED** to existing stock (not replaced)
- Example: If you have 100 units and upload 50, you'll have 150 units
- This allows incremental stock additions

### 3. Price Updates

- Unit price is **UPDATED** to the new value
- This allows you to update prices with each upload

### 4. File Formats Supported

- Excel (.xlsx, .xls)
- CSV (.csv)

## How to Upload

### Step 1: Prepare Your File

1. Download one of the template files
2. Edit the data:
   - Keep the header row unchanged
   - Add/modify drug entries
   - Ensure medicine names match system records
3. Save the file

### Step 2: Upload via Web Interface

1. Login as Drug Supplier
2. Navigate to "Supplier Catalog" page
3. Click "Upload Catalog" button
4. Select your file
5. Click "Upload"

### Step 3: Review Results

The system will show:

- Number of items successfully added/updated
- Number of errors
- Detailed error messages for failed rows

## Example Scenarios

### Scenario 1: Initial Catalog Setup

```csv
medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
Paracetamol,5.50,500,10,500mg tablets
Ibuprofen,8.75,300,10,400mg tablets
```

Result: 2 new items added to catalog

### Scenario 2: Stock Replenishment

Current state: Paracetamol has 100 units

Upload:

```csv
medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
Paracetamol,5.50,200,10,New shipment arrived
```

Result: Paracetamol now has 300 units (100 + 200)

### Scenario 3: Price Update

Current state: Ibuprofen costs 8.75 ETB

Upload:

```csv
medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
Ibuprofen,10.00,100,10,Price increased
```

Result:

- Ibuprofen price updated to 10.00 ETB
- Quantity increased by 100 units

### Scenario 4: Bulk Update

Upload file with 50 medicines:

- Existing medicines: quantities increased, prices updated
- New medicines: added to catalog
- Invalid medicines: skipped with error messages

## Error Handling

### Common Errors

1. **"Medicine not found"**
   - Medicine doesn't exist in system
   - Check spelling
   - Contact admin to add medicine first

2. **"Missing medicine name or invalid price"**
   - Required field is empty
   - Price is not a valid number
   - Check data format

3. **"File is empty or invalid format"**
   - File has no data rows
   - Header row is missing
   - File is corrupted

### Tips for Success

✓ Use the provided templates as starting point
✓ Keep header row exactly as shown
✓ Ensure medicine names match system records
✓ Use numeric values for prices and quantities
✓ Test with a small file first (2-3 items)
✓ Review error messages and fix issues

## Sample Data in Templates

The templates include 20 common medicines:

| Medicine      | Price (ETB) | Quantity | Category          |
| ------------- | ----------- | -------- | ----------------- |
| Paracetamol   | 5.50        | 500      | Pain Relief       |
| Ibuprofen     | 8.75        | 300      | Anti-inflammatory |
| Amoxicillin   | 15.00       | 200      | Antibiotic        |
| Ciprofloxacin | 25.00       | 150      | Antibiotic        |
| Metformin     | 12.50       | 400      | Diabetes          |
| Amlodipine    | 20.00       | 250      | Blood Pressure    |
| Omeprazole    | 18.00       | 300      | Gastric           |
| Atorvastatin  | 30.00       | 200      | Cholesterol       |
| Losartan      | 22.00       | 180      | Blood Pressure    |
| Aspirin       | 3.50        | 600      | Pain Relief       |

| ... and 10 more

## Testing the Upload

A test script is available to verify the upload functionality:

```bash
cd api
node test-catalog-upload.js
```

This will:

1. Login as supplier
2. Upload the test file
3. Verify items were added
4. Show success/error counts

## Generating New Templates

To create a fresh template file:

```bash
cd api
node create-test-excel.js
```

This generates a new `supplier_catalog_template.xlsx` with sample data.

## Support

If you encounter issues:

1. Check error messages in upload results
2. Verify medicine names exist in system
3. Ensure file format is correct
4. Contact system administrator for help

## Best Practices

1. **Regular Updates**: Upload new stock as shipments arrive
2. **Price Management**: Update prices regularly to reflect market changes
3. **Backup**: Keep copies of your upload files
4. **Validation**: Review upload results before confirming
5. **Incremental**: Start with small uploads to test

## API Endpoint

For developers integrating with the API:

```
POST /api/supplier-catalog/bulk-upload
Content-Type: multipart/form-data

Fields:
- supplier_id: Your supplier ID
- file: Excel or CSV file

Response:
{
  "message": "Bulk upload completed",
  "successCount": 18,
  "errorCount": 2,
  "errors": ["Row 5: Medicine not found", ...]
}
```

## Conclusion

The bulk upload feature makes it easy to manage large catalogs efficiently. Use the templates provided, follow the guidelines, and you'll be able to maintain your catalog with minimal effort.
