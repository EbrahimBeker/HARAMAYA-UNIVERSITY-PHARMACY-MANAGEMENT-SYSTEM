# Supplier: How to Add Drugs to Your Catalog

## Quick Answer

❌ **You CANNOT register new drugs**
✅ **You CAN add existing drugs to your catalog**

---

## Method 1: Add One Drug Manually

### Step-by-Step Instructions

1. **Login**
   - Go to login page
   - Username: `supplier`
   - Password: `supply123`

2. **Navigate to Catalog**
   - Click "Supplier Catalog" in the sidebar menu

3. **Click "Add Item"**
   - Look for the blue "Add Item" button at the top right
   - Click it to open the form

4. **Fill in the Form**

   **Medicine** (Required)
   - Click the dropdown
   - Select from available medicines:
     - Amlodipine
     - Amoxicillin
     - Ciprofloxacin
     - Ibuprofen
     - Omeprazole
     - Paracetamol

   **Unit Price** (Required)
   - Enter your selling price in ETB
   - Example: `25.50`

   **Quantity Available** (Required)
   - Enter how many units you have
   - Example: `500`

   **Minimum Order Quantity** (Required)
   - Set the minimum order amount
   - Example: `10`

   **Available** (Checkbox)
   - Check if currently in stock
   - Uncheck if temporarily unavailable

   **Notes** (Optional)
   - Add any additional information
   - Example: "500mg tablets, refrigerate"

5. **Click "Save"**
   - Item will be added to your catalog
   - You'll see a success message

### Important Notes

⚠️ **If drug already exists in your catalog:**

- Quantity will be ADDED (not replaced)
- Price will be UPDATED to new value
- Example: Have 100, add 50 → Result: 150 units

✅ **This is useful for:**

- Adding new stock shipments
- Updating prices
- Increasing inventory

---

## Method 2: Bulk Upload (Multiple Drugs)

### Step-by-Step Instructions

1. **Prepare Your File**

   **Option A: Use Ready Template**
   - File: `supplier_catalog_upload_ready.xlsx`
   - Contains all 6 existing medicines
   - Ready to upload as-is

   **Option B: Edit Template**
   - Open the Excel or CSV file
   - Modify prices and quantities
   - Don't change medicine names!
   - Save the file

2. **Login**
   - Username: `supplier`
   - Password: `supply123`

3. **Navigate to Catalog**
   - Click "Supplier Catalog" in sidebar

4. **Click "Upload Catalog"**
   - Look for the upload button
   - Click it to open file selector

5. **Select Your File**
   - Choose Excel (.xlsx) or CSV (.csv)
   - Click "Open"

6. **Review Results**
   - System shows success count
   - System shows error count
   - Review any error messages

### File Format

Your file must have these columns:

```csv
medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
Paracetamol,5.50,500,10,Pain reliever
Ibuprofen,8.75,300,10,Anti-inflammatory
```

### Upload Results

✅ **Success Example:**

```
Upload completed successfully!
Success: 6 items
Errors: 0
```

❌ **Error Example:**

```
Upload completed with errors
Success: 4 items
Errors: 2
- Row 5: Medicine "Aspirin" not found
- Row 6: Missing price
```

---

## What If Drug Doesn't Exist?

### Scenario: You want to add "Metformin" but it's not in the dropdown

**Problem:** Metformin is not registered in the system

**Solution:**

1. **Contact Administrator**
   - Email or call system admin
   - Request: "Please add Metformin to the system"
   - Provide details:
     - Full name: Metformin
     - Generic name: Metformin Hydrochloride
     - Form: Tablet
     - Strength: 500mg
     - Category: Diabetes

2. **Wait for Admin to Register**
   - Admin will add drug to system
   - Usually takes 1-2 business days

3. **Add to Your Catalog**
   - Once registered, drug appears in dropdown
   - Follow Method 1 or 2 above
   - Add with your price and quantity

---

## Available Medicines (Current)

Only these 6 medicines are currently in the system:

| #   | Medicine      | Category          | Form    |
| --- | ------------- | ----------------- | ------- |
| 1   | Amlodipine    | Blood Pressure    | Tablet  |
| 2   | Amoxicillin   | Antibiotic        | Capsule |
| 3   | Ciprofloxacin | Antibiotic        | Tablet  |
| 4   | Ibuprofen     | Anti-inflammatory | Tablet  |
| 5   | Omeprazole    | Gastric           | Capsule |
| 6   | Paracetamol   | Pain Relief       | Tablet  |

---

## Common Questions

**Q: Can I add a drug not in the list?**
A: No. Contact admin to register it first.

**Q: What happens if I add the same drug twice?**
A: Quantities are added together, price is updated.

**Q: Can I change the medicine name?**
A: No. Medicine names are fixed by admin.

**Q: How do I remove a drug from my catalog?**
A: Click the "Delete" button next to the drug in your catalog table.

**Q: Can I set different prices for different customers?**
A: No. One price per drug in your catalog.

**Q: What if I run out of stock?**
A: Uncheck "Available" or set quantity to 0.

---

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│         ADD DRUG TO CATALOG             │
├─────────────────────────────────────────┤
│                                         │
│  1. Login as supplier                   │
│  2. Go to Supplier Catalog              │
│  3. Click "Add Item"                    │
│  4. Select medicine from dropdown       │
│  5. Enter price and quantity            │
│  6. Click "Save"                        │
│                                         │
│  ✓ Done!                                │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         BULK UPLOAD                     │
├─────────────────────────────────────────┤
│                                         │
│  1. Use template file                   │
│  2. Click "Upload Catalog"              │
│  3. Select file                         │
│  4. Review results                      │
│                                         │
│  ✓ Done!                                │
│                                         │
└─────────────────────────────────────────┘
```

---

## Need Help?

**For technical issues:**

- Check error messages
- Verify medicine names match exactly
- Ensure file format is correct

**To add new medicines:**

- Contact system administrator
- Provide complete drug information
- Wait for registration

**For questions:**

- Review this guide
- Check UPLOAD_FILES_READY.md
- Contact support

---

## Summary

✅ **You CAN:**

- Add existing drugs to your catalog
- Set your own prices
- Manage your quantities
- Bulk upload multiple drugs
- Update prices and quantities

❌ **You CANNOT:**

- Register new drugs in system
- Modify drug information (name, category, etc.)
- Add drugs that don't exist in system

**Remember:** Only administrators can register new drugs. Once registered, you can add them to your catalog.
