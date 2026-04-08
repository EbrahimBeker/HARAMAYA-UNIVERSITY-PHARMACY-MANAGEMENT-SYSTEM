# Quick Start Guide - Supplier Catalog Upload

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Backend (Already Running ✅)

The backend server is already running on port 5000.

### Step 2: Start the Frontend

```bash
cd frontend
npm run dev
```

### Step 3: Login as Supplier

1. Open browser: http://localhost:5173
2. Login credentials:
   - Username: `supplier`
   - Password: `supply123`

### Step 4: Upload Test File

1. Click "Drug Catalog" in sidebar
2. Click "Upload Excel/CSV" button
3. Select file: `test_catalog_upload.csv` (in project root)
4. Wait for success message
5. See 6 medicines added to catalog

### Step 5: Verify Upload

- Check catalog table shows 6 items
- Check statistics show:
  - Total Items: 6
  - Available Items: 6
  - Total Value: 35,187.50 ETB

---

## 📝 Create Your Own Catalog

### Option 1: Download Template

1. Click "Template" button
2. Open in Excel or text editor
3. Fill in your medicines
4. Save and upload

### Option 2: Use Sample Format

Create a CSV file with this format:

```csv
medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
Paracetamol,5.50,1000,10,Pain reliever
Amoxicillin,12.00,500,5,Antibiotic
Ibuprofen,8.75,750,10,Anti-inflammatory
```

---

## 🧪 Test the System

### Automated Test

```bash
cd api
node test-catalog-upload.js
```

Expected output:

```
✓ Login successful
✓ Supplier ID: 15
✓ Upload completed: 6 items added
✓ All tests passed!
```

---

## 📚 Need More Help?

- **User Guide**: See `SUPPLIER_CATALOG_GUIDE.md`
- **Format Reference**: See `CSV_UPLOAD_REFERENCE.md`
- **Technical Docs**: See `SUPPLIER_SYSTEM_COMPLETE.md`
- **Full Status**: See `STATUS_REPORT.md`

---

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Logged in as supplier
- [ ] Uploaded test file
- [ ] Saw 6 items in catalog
- [ ] Statistics updated correctly

---

## 🎯 What You Can Do Now

1. **Upload Your Drugs**: Add your complete drug inventory
2. **Manage Catalog**: Edit prices, quantities, availability
3. **View Orders**: See purchase orders from pharmacists
4. **Confirm Orders**: Confirm orders you can fulfill
5. **Mark Delivered**: Update order status after shipping

---

## 🔑 Important Info

### Supplier Account

- User ID: 12
- Supplier ID: 15
- Company: Ethiopian Pharmaceuticals Manufacturing

### File Requirements

- Format: CSV, XLSX, or XLS
- Max Size: 5 MB
- Required: medicine_name, unit_price
- Optional: quantity_available, minimum_order_quantity, notes

### Medicine Names

- Must match existing medicines in system
- Partial matches work (e.g., "Paracetamol" matches "Paracetamol 500mg")
- Case-insensitive

---

**Ready to go!** 🚀

Start with the test file, then upload your own catalog.
