# Purchase Order Price Policy

## Overview

Unit prices in purchase orders are set by suppliers and cannot be modified by pharmacists. This ensures pricing integrity and prevents unauthorized price changes.

## Policy

### Price Control

- ✅ **Suppliers set prices** in their catalog
- ✅ **Prices are read-only** for pharmacists
- ✅ **Quantities are editable** by pharmacists
- ❌ **Pharmacists cannot change prices** when ordering

## Implementation

### Price Field

```jsx
<input
  type="number"
  value={item.unit_price}
  readOnly // Cannot be edited
  className="bg-gray-50 cursor-not-allowed" // Visual indication
/>
```

### Visual Indicators

- Gray background (`bg-gray-50`)
- Not-allowed cursor (`cursor-not-allowed`)
- No focus ring (not interactive)
- Disabled appearance

## User Interface

### Order Items Section

```
Order Items *                    [+ Add Item]
Prices are set by supplier. You can adjust quantities.

Medicine          Quantity    Unit Price (ETB)
[Medicine ▼]      [100]       [12.50]          [×]
                  ↑ Editable  ↑ Read-only
```

## Rationale

### Why Prices Are Read-Only

1. **Supplier Authority**: Suppliers set their own prices
2. **Price Integrity**: Prevents unauthorized price changes
3. **Business Agreement**: Prices are part of supplier-pharmacy agreement
4. **Audit Trail**: Clear record of agreed prices
5. **Prevent Errors**: Eliminates accidental price modifications

### Why Quantities Are Editable

1. **Business Need**: Pharmacies need flexibility in order quantities
2. **Demand Variation**: Order amounts vary based on needs
3. **Bulk Orders**: Can order more than minimum quantity
4. **Stock Planning**: Can order for future needs

## Workflow

### Creating Purchase Order

1. **Select Supplier**
   - Supplier's catalog loads
   - Shows available medicines with prices

2. **Add Items from Catalog**
   - Click "Add" on desired medicine
   - Item added with supplier's price
   - Price is locked (read-only)

3. **Adjust Quantities**
   - Modify quantity as needed
   - Price remains fixed
   - Total updates automatically

4. **Submit Order**
   - Order sent with supplier's prices
   - Supplier sees agreed prices
   - No price disputes

## Price Negotiation

### If Different Price Needed

If a pharmacist needs a different price:

1. **Contact Supplier**: Negotiate price directly
2. **Supplier Updates Catalog**: Supplier changes price in their catalog
3. **Create New Order**: Pharmacist creates order with new price

**Important**: Price changes happen at the supplier level, not during order creation.

## Examples

### Example 1: Standard Order

```
Supplier Catalog: Paracetamol - 5.50 ETB
Pharmacist adds to order
Price field shows: 5.50 ETB (read-only)
Pharmacist can change quantity: 10 → 100
Total updates: 550.00 ETB
✅ Order submitted with supplier's price
```

### Example 2: Attempted Price Change

```
Supplier Catalog: Amoxicillin - 12.00 ETB
Pharmacist adds to order
Price field shows: 12.00 ETB (read-only)
Pharmacist tries to click price field
❌ Field is disabled (gray, not-allowed cursor)
✅ Price remains 12.00 ETB
```

### Example 3: Bulk Discount Scenario

```
Supplier Catalog: Ibuprofen - 8.75 ETB
Pharmacist wants bulk discount
❌ Cannot change price in order form
✅ Contacts supplier for negotiation
✅ Supplier updates catalog: 7.50 ETB
✅ Pharmacist creates new order with updated price
```

## Benefits

### For Suppliers

1. ✅ **Price Control**: Maintain pricing authority
2. ✅ **No Disputes**: Clear agreed prices
3. ✅ **Revenue Protection**: Prevents unauthorized discounts
4. ✅ **Catalog Integrity**: Single source of truth

### For Pharmacists

1. ✅ **Clear Pricing**: Know exact costs upfront
2. ✅ **No Confusion**: Prices are what supplier set
3. ✅ **Audit Trail**: Clear record of prices paid
4. ✅ **Quantity Flexibility**: Can order needed amounts

### For System

1. ✅ **Data Integrity**: Prices match supplier catalog
2. ✅ **Audit Compliance**: Clear price history
3. ✅ **Dispute Prevention**: No price mismatches
4. ✅ **Business Logic**: Enforces proper workflow

## Technical Details

### Field Properties

#### Read-Only Price Field

```jsx
<input
  type="number"
  value={item.unit_price}
  readOnly // HTML read-only attribute
  className="
    w-32 
    px-3 py-2 
    border border-gray-300 
    rounded-lg 
    bg-gray-50              // Gray background
    text-gray-700           // Darker text
    cursor-not-allowed      // Not-allowed cursor
  "
/>
```

#### Editable Quantity Field

```jsx
<input
  type="number"
  value={item.quantity}
  onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
  min="1"
  required
  className="
    w-24 
    px-3 py-2 
    border border-gray-300 
    rounded-lg 
    focus:outline-none 
    focus:ring-2 
    focus:ring-blue-500    // Blue focus ring
  "
/>
```

### Price Source

Prices come from:

1. **Supplier Catalog**: When adding from catalog
2. **Medicine Master**: When adding manually (fallback)

```javascript
// From catalog
const addItemFromCatalog = (catalogItem) => {
  setOrderItems([
    ...orderItems,
    {
      medicine_id: catalogItem.medicine_id,
      quantity: catalogItem.minimum_order_quantity,
      unit_price: parseFloat(catalogItem.unit_price), // Supplier's price
    },
  ]);
};

// From medicine master (manual add)
const updateItem = (index, field, value) => {
  if (field === "medicine_id") {
    const medicine = medicines.find((m) => m.id === parseInt(value));
    if (medicine) {
      updated[index].unit_price = medicine.unit_price || 0; // Default price
    }
  }
};
```

## Validation

### Backend Validation (Recommended)

Add validation in backend to ensure prices match catalog:

```javascript
// In purchase order controller
const validatePrices = async (items, supplierId) => {
  for (const item of items) {
    const catalogItem = await getCatalogItem(supplierId, item.medicine_id);
    if (catalogItem && item.unit_price !== catalogItem.unit_price) {
      throw new Error(`Price mismatch for ${item.medicine_name}`);
    }
  }
};
```

## Edge Cases

### Case 1: Supplier Updates Price After Adding to Cart

```
1. Pharmacist adds item (Price: 10.00 ETB)
2. Supplier updates catalog (Price: 12.00 ETB)
3. Pharmacist submits order (Price: 10.00 ETB)

Solution: Order uses price at time of adding
Supplier can accept or reject order
```

### Case 2: Medicine Not in Catalog

```
1. Pharmacist adds medicine manually
2. Price comes from medicine master data
3. Price is still read-only

Solution: Pharmacist should contact supplier to add to catalog
```

### Case 3: Bulk Discount Needed

```
1. Pharmacist needs lower price for bulk order
2. Cannot change price in order form

Solution:
- Contact supplier
- Negotiate bulk discount
- Supplier updates catalog or creates special price
- Pharmacist creates order with new price
```

## Future Enhancements

### Potential Features

1. **Price History**: Show price changes over time
2. **Price Alerts**: Notify if price changed since last order
3. **Bulk Pricing**: Automatic discounts for large quantities
4. **Special Pricing**: Supplier can offer custom prices
5. **Price Comparison**: Compare prices across suppliers
6. **Contract Pricing**: Pre-negotiated prices for specific pharmacies

### Example: Price Alert

```
⚠️ Price Changed
   Previous: 10.00 ETB
   Current: 12.00 ETB
   [Continue] [Cancel]
```

## Testing Checklist

- [ ] Price field is read-only
- [ ] Price field has gray background
- [ ] Cursor shows not-allowed on hover
- [ ] Cannot type in price field
- [ ] Cannot select price field text
- [ ] Quantity field is editable
- [ ] Total updates when quantity changes
- [ ] Price from catalog is correct
- [ ] Help text shows correct message
- [ ] Visual distinction between editable/read-only

## Conclusion

Making prices read-only:

- ✅ Protects supplier pricing authority
- ✅ Prevents unauthorized price changes
- ✅ Ensures data integrity
- ✅ Reduces disputes
- ✅ Maintains audit trail
- ✅ Enforces proper business workflow

Pharmacists retain full control over quantities while respecting supplier pricing.

---

**Policy**: Prices set by suppliers only
**Implementation**: Read-only price fields
**Status**: ✅ Enforced
**Last Updated**: April 8, 2026
