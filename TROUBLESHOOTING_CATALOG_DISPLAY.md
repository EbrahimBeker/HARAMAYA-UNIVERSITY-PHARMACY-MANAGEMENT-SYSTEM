# Troubleshooting: Supplier Catalog Not Showing

## Issue

The supplier catalog is not appearing when creating a new purchase order.

## Steps to Fix

### 1. Hard Refresh Browser

The most common issue is that the browser hasn't loaded the updated JavaScript.

**Windows/Linux:**

- Press `Ctrl + Shift + R` or `Ctrl + F5`

**Mac:**

- Press `Cmd + Shift + R`

**Or:**

- Open DevTools (F12)
- Right-click refresh button
- Select "Empty Cache and Hard Reload"

### 2. Check Console for Errors

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "New Order" button
4. Select a supplier from dropdown
5. Look for these console messages:
   ```
   Supplier changed to: 15
   Loading catalog for supplier: 15
   Catalog loaded: [array of items]
   ```

### 3. Verify Supplier Has Catalog

The catalog only shows if:

- Supplier is selected
- Supplier has uploaded items to their catalog
- Items are marked as "available"

**To check:**

1. Login as supplier (username: supplier, password: supply123)
2. Go to "Drug Catalog"
3. Verify there are items listed
4. Check items are marked as "Available"

### 4. Test with Known Supplier

Use the test supplier that has catalog:

- **Supplier ID**: 15
- **Name**: Ethiopian Pharmaceuticals Manufacturing
- **Has Catalog**: Yes (6 items uploaded)

### 5. Check API Response

1. Open DevTools → Network tab
2. Select a supplier
3. Look for request to: `/api/supplier-catalog?supplier_id=15&is_available=true`
4. Check response has data

**Expected Response:**

```json
{
  "data": [
    {
      "id": 1,
      "medicine_name": "Paracetamol",
      "unit_price": "5.50",
      "quantity_available": 1000,
      ...
    }
  ],
  "supplier_id": 15
}
```

### 6. Restart Frontend Dev Server

If hard refresh doesn't work:

```bash
# Stop the frontend server (Ctrl+C)
cd frontend
npm run dev
```

### 7. Clear Browser Cache

If still not working:

1. Open browser settings
2. Clear browsing data
3. Select "Cached images and files"
4. Clear data
5. Restart browser

## What Should Happen

### Step-by-Step Expected Behavior

1. **Click "New Order"**
   - Modal opens
   - Supplier dropdown is empty

2. **Select Supplier**
   - Console shows: "Supplier changed to: 15"
   - Console shows: "Loading catalog for supplier: 15"
   - API call made to `/api/supplier-catalog`

3. **Catalog Appears**
   - Blue box appears below supplier field
   - Shows "Available from Supplier (X items)"
   - Lists medicines with details
   - Search box visible

4. **If No Catalog**
   - Yellow box appears
   - Shows "No catalog available from this supplier"
   - Message: "You can still add items manually below"

## Visual Reference

### With Catalog:

```
┌─────────────────────────────────────────────┐
│ Supplier: [Ethiopian Pharmaceuticals ▼]    │
├─────────────────────────────────────────────┤
│ 📦 Available from Supplier (6 items) [🔍]  │
│ ┌─────────────────────────────────────────┐ │
│ │ Paracetamol                      [Add]  │ │
│ │ Acetaminophen - 500mg                   │ │
│ │ Price: 5.50 ETB | Available: 1000      │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Amoxicillin                      [Add]  │ │
│ │ ...                                     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Without Catalog:

```
┌─────────────────────────────────────────────┐
│ Supplier: [Local Supplier ▼]               │
├─────────────────────────────────────────────┤
│              📦                              │
│   No catalog available from this supplier   │
│   You can still add items manually below    │
└─────────────────────────────────────────────┘
```

## Common Issues

### Issue 1: Catalog Shows 0 Items

**Cause**: Supplier hasn't uploaded catalog
**Solution**:

1. Login as supplier
2. Upload catalog using template
3. Try again

### Issue 2: API Returns Empty Array

**Cause**: No items marked as available
**Solution**:

1. Login as supplier
2. Edit catalog items
3. Check "Available for Order"
4. Save changes

### Issue 3: Console Shows 403 Error

**Cause**: Permission issue
**Solution**:

1. Check user is logged in as Pharmacist
2. Verify token is valid
3. Try logging out and back in

### Issue 4: Console Shows 500 Error

**Cause**: Backend error
**Solution**:

1. Check backend server is running
2. Check backend console for errors
3. Restart backend server

## Testing Checklist

- [ ] Browser hard refreshed
- [ ] Console shows no errors
- [ ] Supplier selected from dropdown
- [ ] Console shows "Supplier changed to: X"
- [ ] Console shows "Loading catalog for supplier: X"
- [ ] Console shows "Catalog loaded: [...]"
- [ ] Blue box appears with catalog
- [ ] Medicines are listed
- [ ] Search box is visible
- [ ] "Add" buttons are clickable

## Still Not Working?

### Check File Changes

Verify the file was actually updated:

```bash
# Check if changes are in the file
cd frontend/src/pages/Pharmacist
grep "supplierCatalog" PurchaseOrders.jsx
```

Should show multiple matches including:

- `const [supplierCatalog, setSupplierCatalog]`
- `loadSupplierCatalog`
- `Available from Supplier`

### Manual Verification

1. Open `frontend/src/pages/Pharmacist/PurchaseOrders.jsx`
2. Search for "supplierCatalog"
3. Verify these exist:
   - State variable declaration
   - loadSupplierCatalog function
   - handleSupplierChange function
   - Catalog display section in modal

### Backend Verification

Test the API directly:

```bash
# Login first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"pharmacist","password":"pharma123"}'

# Get catalog (use token from login)
curl http://localhost:5000/api/supplier-catalog?supplier_id=15&is_available=true \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should return array of medicines.

## Quick Fix Script

If nothing else works, try this:

```bash
# Stop all servers
# Kill node processes
taskkill /F /IM node.exe

# Clear npm cache
cd frontend
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install

# Restart
npm run dev
```

## Contact Support

If issue persists after all steps:

1. Take screenshot of console errors
2. Copy console logs
3. Note which supplier you're testing with
4. Check if supplier has catalog items
5. Provide browser and version

---

**Last Updated**: April 8, 2026
**Common Solution**: Hard refresh browser (Ctrl+Shift+R)
