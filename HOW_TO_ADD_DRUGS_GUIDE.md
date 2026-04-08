# How to Add Drugs - Complete Guide

## Overview

There are two different processes depending on whether the drug exists in the system or not.

---

## Option 1: Add Existing Drug to Your Catalog (Supplier)

### Who Can Do This?

✅ Drug Suppliers

### When to Use?

When the drug already exists in the system database, and you want to add it to your supplier catalog.

### Steps:

#### Method A: Manual Addition (One Drug at a Time)

1. **Login as Supplier**
   - Username: `supplier`
   - Password: `supply123`

2. **Navigate to Supplier Catalog**
   - Click "Supplier Catalog" in the sidebar

3. **Click "Add Item" Button**
   - Located at the top right of the page

4. **Fill in the Form**
   - **Medicine**: Select from dropdown (shows all medicines in system)
   - **Unit Price**: Enter your price in ETB (e.g., 25.50)
   - **Quantity Available**: Enter quantity you have in stock
   - **Minimum Order Quantity**: Set minimum order requirement
   - **Available**: Check if currently available
   - **Notes**: Add any additional information (optional)

5. **Click "Save"**
   - Item will be added to your catalog
   - If drug already exists in your catalog, quantity will be ADDED

#### Method B: Bulk Upload (Multiple Drugs)

1. **Prepare Upload File**
   - Use: `supplier_catalog_upload_ready.xlsx` or `.csv`
   - Contains all 6 existing medicines

2. **Click "Upload Catalog" Button**

3. **Select Your File**
   - Choose Excel (.xlsx) or CSV (.csv) file

4. **Click "Upload"**
   - System will process all items
   - Shows success/error count
   - Quantities are ADDED to existing stock

### Available Medicines in System

Currently, only these 6 medicines exist in the database:

| Medicine Name | Generic Name        |
| ------------- | ------------------- |
| Amlodipine    | Amlodipine Besylate |
| Amoxicillin   | Amoxicillin         |
| Ciprofloxacin | Ciprofloxacin HCl   |
| Ibuprofen     | Ibuprofen           |
| Omeprazole    | Omeprazole          |
| Paracetamol   | Acetaminophen       |

---

## Option 2: Register New Drug in System (Administrator)

### Who Can Do This?

✅ System Administrators only

### When to Use?

When you need to add a completely new drug that doesn't exist in the system.

### Steps:

1. **Login as Administrator**
   - Username: `admin`
   - Password: `admin123`

2. **Navigate to Medicines Management**
   - Click "Medicines" in the admin menu

3. **Click "Add New Medicine" Button**

4. **Fill in Medicine Details**
   - **Name**: Official medicine name (e.g., "Metformin")
   - **Generic Name**: Generic/chemical name (e.g., "Metformin Hydrochloride")
   - **Category**: Select category (e.g., Diabetes, Antibiotics)
   - **Type**: Select type (e.g., Tablet, Capsule, Syrup)
   - **Strength**: Dosage strength (e.g., "500mg", "10mg")
   - **Unit**: Unit of measurement (e.g., "tablet", "capsule", "ml")
   - **Manufacturer**: Company name (optional)
   - **Description**: Additional information (optional)
   - **Reorder Level**: Minimum stock level for alerts
   - **Storage Instructions**: How to store (optional)
   - **Side Effects**: Common side effects (optional)
   - **Contraindications**: When not to use (optional)

5. **Click "Save"**
   - Medicine is now registered in the system
   - All suppliers can now add it to their catalogs

6. **Notify Suppliers**
   - Inform suppliers that new medicine is available
   - Suppliers can now add it to their catalogs

---

## Complete Workflow Example

### Scenario: Adding a New Drug "Metformin"

#### Step 1: Administrator Registers Drug

```
Admin logs in → Medicines → Add New Medicine
Name: Metformin
Generic: Metformin Hydrochloride
Category: Diabetes
Type: Tablet
Strength: 500mg
Unit: tablet
→ Save
```

#### Step 2: Supplier Adds to Catalog

```
Supplier logs in → Supplier Catalog → Add Item
Medicine: Metformin (now appears in dropdown)
Unit Price: 12.50 ETB
Quantity: 500
Min Order: 10
→ Save
```

#### Step 3: Pharmacist Can Order

```
Pharmacist logs in → Purchase Orders → Create New
Supplier: Ethiopian Pharmaceuticals
Medicine: Metformin (now available)
Quantity: 100
→ Submit Order
```

---

## Current System Status

### Existing Medicines (6 total)

✅ Amlodipine
✅ Amoxicillin
✅ Ciprofloxacin
✅ Ibuprofen
✅ Omeprazole
✅ Paracetamol

### To Add More Medicines

❌ Suppliers CANNOT add new medicines
✅ Only Administrators can register new medicines
✅ After admin adds, suppliers can include in their catalog

---

## Frequently Asked Questions

### Q: Can suppliers register new drugs?

**A:** No. Only administrators can register new drugs in the system. Suppliers can only add existing drugs to their catalog.

### Q: What if I need to sell a drug not in the system?

**A:** Contact the system administrator to register the drug first. Once registered, you can add it to your catalog.

### Q: Can I add the same drug twice?

**A:** Yes, but quantities will be ADDED together, not replaced. This is useful for adding new stock.

### Q: How do I update prices?

**A:** Add the drug again with the new price. The price will be updated and quantity will be increased.

### Q: Can I remove a drug from my catalog?

**A:** Yes, use the "Delete" button next to the drug in your catalog table.

### Q: What's the difference between "Medicine" and "Catalog Item"?

**A:**

- **Medicine**: The drug registered in the system (managed by admin)
- **Catalog Item**: Your offering of that medicine with your price and quantity

---

## Quick Reference

### For Suppliers

```
Add Existing Drug:
1. Supplier Catalog → Add Item
2. Select medicine from dropdown
3. Enter price and quantity
4. Save

Bulk Upload:
1. Supplier Catalog → Upload Catalog
2. Select file (Excel/CSV)
3. Upload
```

### For Administrators

```
Register New Drug:
1. Medicines → Add New Medicine
2. Fill in all details
3. Save
4. Notify suppliers
```

---

## Contact Information

### Need a New Drug Added?

Contact your system administrator with:

- Medicine name
- Generic name
- Strength/dosage
- Form (tablet, capsule, etc.)
- Category
- Any special storage requirements

### Technical Support

For issues with:

- Adding items to catalog
- Upload errors
- System access
  Contact: System Administrator

---

## Summary

| Task                         | Who Can Do It      | How                               |
| ---------------------------- | ------------------ | --------------------------------- |
| Register new drug in system  | Administrator only | Medicines → Add New Medicine      |
| Add existing drug to catalog | Supplier           | Supplier Catalog → Add Item       |
| Bulk upload catalog          | Supplier           | Supplier Catalog → Upload Catalog |
| Update prices                | Supplier           | Add item again with new price     |
| Increase quantities          | Supplier           | Add item again with new quantity  |

---

## Files Available

- `supplier_catalog_upload_ready.xlsx` - Excel template with 6 existing medicines
- `supplier_catalog_upload_ready.csv` - CSV template with 6 existing medicines
- Both files ready to upload with zero errors

---

**Remember**: Suppliers manage their catalog of existing medicines. Administrators manage the master list of all medicines in the system.
