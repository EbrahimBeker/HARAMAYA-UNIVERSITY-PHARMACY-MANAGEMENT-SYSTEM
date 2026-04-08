# Catalog Quantity Increase Fix

## Issue

When suppliers added or uploaded drugs that already existed in their catalog, the system was overriding the existing quantity instead of increasing it. This caused inventory loss.

## Solution

### Changes Made

#### File: `api/controllers/supplierCatalogController.js`

**1. Manual Add/Update (upsert function)**
Changed from:

```javascript
SET unit_price = ?, quantity_available = ?, ...
```

To:

```javascript
SET unit_price = ?, quantity_available = quantity_available + ?, ...
```

**2. Bulk Upload (bulkUpload function)**
Changed from:

```javascript
SET unit_price = ?, quantity_available = ?, ...
```

To:

```javascript
SET unit_price = ?, quantity_available = quantity_available + ?, ...
```

### Behavior

#### Before Fix:

- Adding 50 units to existing 200 units → Result: 50 units (overridden)
- Price updated but quantity lost

#### After Fix:

- Adding 50 units to existing 200 units → Result: 250 units (increased)
- Price updated AND quantity increased

### What Gets Updated:

1. **Quantity**: INCREASED by the new amount (not replaced)
2. **Price**: UPDATED to the new price
3. **Minimum Order Quantity**: UPDATED to new value
4. **Notes**: UPDATED to new notes
5. **Availability**: Set to available

## Testing

### Test 1: Manual Addition

**File**: `api/test-catalog-quantity-increase.js`

Results:

```
Initial: 200 units at 30 ETB
Add 50 units at 25 ETB
Result: 250 units at 25 ETB ✓

Add 30 more units at 30 ETB
Result: 280 units at 30 ETB ✓
```

### Test 2: Bulk Upload

**File**: `api/test-bulk-upload-increase.js`

Results:

```
Initial: 280 units at 30 ETB
Upload CSV with 100 units at 35 ETB
Result: 380 units at 35 ETB ✓
```

## User Impact

### For Suppliers:

1. Can safely re-upload catalog files without losing existing quantities
2. Can add stock incrementally as new shipments arrive
3. Price updates reflect latest costs while preserving inventory

### Example Scenarios:

**Scenario 1: New Shipment**

- Current: 100 units of Medicine A at 20 ETB
- New shipment: 50 units at 22 ETB (price increased)
- After adding: 150 units at 22 ETB ✓

**Scenario 2: Bulk Upload Update**

- Current catalog: Various medicines with quantities
- Upload updated price list with new quantities
- Result: All quantities increased, prices updated ✓

**Scenario 3: Multiple Additions**

- Day 1: Add 100 units
- Day 2: Add 50 units
- Day 3: Add 75 units
- Total: 225 units (cumulative) ✓

## API Response

When updating existing items, the API now returns:

```json
{
  "message": "Catalog item updated successfully. Quantity increased by 50"
}
```

This clearly indicates that quantity was increased, not replaced.

## Database Impact

The SQL query now uses:

```sql
UPDATE supplier_catalog
SET quantity_available = quantity_available + ?
WHERE ...
```

This ensures atomic increment operations at the database level.

## Status: ✅ COMPLETE AND TESTED

Both manual addition and bulk upload now correctly increase quantities while updating prices.
