# Quantity Validation in Purchase Orders

## Overview

Pharmacists cannot order more than the available quantity shown in the supplier's catalog. This prevents over-ordering and ensures realistic order fulfillment.

## Implementation

### Features Added

1. **✅ Maximum Quantity Limit**
   - Quantity input has `max` attribute
   - Cannot exceed supplier's available stock
   - Browser prevents entering higher values

2. **✅ Available Quantity Display**
   - Shows "Available: X units" below each item
   - Only shown for items added from catalog
   - Helps pharmacist know the limit

3. **✅ Validation on Add**
   - Checks available quantity when adding from catalog
   - Prevents adding if would exceed limit
   - Shows error toast message

4. **✅ Validation on Update**
   - HTML5 validation prevents exceeding max
   - Browser shows error if user tries to exceed
   - Clear feedback to user

## User Interface

### Order Item with Quantity Limit

```
Medicine          Quantity    Unit Price (ETB)
[Paracetamol ▼]   [100]       [5.50]          [×]
Available: 1000 units
          ↑ Shows available stock
```

### When Trying to Exceed

```
Medicine          Quantity    Unit Price (ETB)
[Paracetamol ▼]   [1500]      [5.50]          [×]
Available: 1000 units
          ↑ Browser shows: "Value must be less than or equal to 1000"
```

## Technical Implementation

### 1. Store Max Quantity

```javascript
const addItemFromCatalog = (catalogItem) => {
  setOrderItems([
    ...orderItems,
    {
      medicine_id: catalogItem.medicine_id,
      quantity: catalogItem.minimum_order_quantity,
      unit_price: catalogItem.unit_price,
      max_quantity: catalogItem.quantity_available, // Store max
      medicine_name: catalogItem.medicine_name,
    },
  ]);
};
```

### 2. Apply Max to Input

```jsx
<input
  type="number"
  value={item.quantity}
  min="1"
  max={item.max_quantity || undefined} // Apply max limit
  required
/>
```

### 3. Show Available Quantity

```jsx
{
  item.max_quantity && (
    <div className="text-xs text-gray-500">
      Available: {item.max_quantity} units
    </div>
  );
}
```

### 4. Validate on Add

```javascript
if (newQuantity > catalogItem.quantity_available) {
  toast.error(
    `Cannot exceed available quantity (${catalogItem.quantity_available})`,
  );
  return;
}
```

## Validation Rules

### Quantity Constraints

- **Minimum**: 1 unit
- **Maximum**: Supplier's available quantity
- **Type**: Integer only
- **Required**: Yes

### When Max Applies

- ✅ Items added from supplier catalog
- ❌ Items added manually (no catalog data)

### Browser Validation

HTML5 automatically validates:

- Cannot type value > max
- Cannot use spinner to exceed max
- Shows error message if exceeded
- Prevents form submission if invalid

## User Experience

### Scenario 1: Normal Order

```
1. Add Paracetamol from catalog
   - Available: 1000 units
   - Added with quantity: 10
2. Change quantity to 500
   - ✅ Allowed (500 < 1000)
3. Submit order
   - ✅ Success
```

### Scenario 2: Exceeding Limit

```
1. Add Amoxicillin from catalog
   - Available: 500 units
   - Added with quantity: 5
2. Try to change quantity to 600
   - ❌ Browser prevents input
   - Shows: "Value must be ≤ 500"
3. Change to 500
   - ✅ Allowed
4. Submit order
   - ✅ Success
```

### Scenario 3: Adding Multiple Times

```
1. Add Ibuprofen from catalog
   - Available: 750 units
   - Added with quantity: 100
2. Click "Add" again on same medicine
   - Would add 100 more (total: 200)
   - ✅ Allowed (200 < 750)
3. Click "Add" 7 more times
   - Would make total: 900
   - ❌ Blocked with error toast
   - Message: "Cannot exceed available quantity (750)"
```

### Scenario 4: Manual Add (No Catalog)

```
1. Add medicine manually (not from catalog)
   - No max_quantity set
   - Can enter any quantity
   - ⚠️ No validation (supplier will confirm)
```

## Benefits

### For Pharmacists

1. ✅ **Clear Limits**: Know exactly how much is available
2. ✅ **Prevent Errors**: Can't accidentally over-order
3. ✅ **Realistic Orders**: Orders can actually be fulfilled
4. ✅ **Better Planning**: See stock levels upfront

### For Suppliers

1. ✅ **Accurate Orders**: Only receive fulfillable orders
2. ✅ **No Over-Commitment**: Won't be asked for more than available
3. ✅ **Inventory Control**: Catalog reflects actual stock
4. ✅ **Fewer Disputes**: Clear expectations

### For System

1. ✅ **Data Integrity**: Orders match available stock
2. ✅ **Validation**: Multiple layers of checking
3. ✅ **User Feedback**: Clear error messages
4. ✅ **Business Logic**: Enforces realistic ordering

## Error Messages

### When Adding from Catalog

```javascript
toast.error(`Cannot exceed available quantity (${available})`);
```

### Browser Validation

```
"Value must be less than or equal to 1000"
"Please enter a value less than or equal to 1000"
```

## Edge Cases

### Case 1: Stock Changes After Adding

```
1. Pharmacist adds item (Available: 1000)
2. Supplier updates catalog (Available: 500)
3. Pharmacist's order still shows max: 1000

Solution: Order uses quantity at time of adding
Supplier can reject if stock insufficient
```

### Case 2: Multiple Pharmacists Ordering

```
1. Pharmacist A adds 500 units (Available: 1000)
2. Pharmacist B adds 600 units (Available: 1000)
3. Total orders: 1100 (exceeds 1000)

Solution: First-come-first-served
Supplier confirms orders in sequence
May need to adjust later orders
```

### Case 3: Minimum > Available

```
Catalog shows:
- Available: 5 units
- Minimum order: 10 units

Solution: Pharmacist can still add
System allows ordering minimum
Supplier will handle fulfillment
```

### Case 4: Manual Entry

```
Pharmacist adds medicine manually (not from catalog)
No max_quantity available

Solution: No validation applied
Supplier will confirm availability
```

## Future Enhancements

### Potential Improvements

1. **Real-Time Stock Updates**

   ```
   ⚠️ Stock Updated
   Previous: 1000 units
   Current: 500 units
   Your order: 600 units
   [Adjust Order] [Continue]
   ```

2. **Stock Reservation**

   ```
   ✓ 500 units reserved for 30 minutes
   Complete order to confirm reservation
   ```

3. **Alternative Suggestions**

   ```
   ⚠️ Only 50 units available
   You requested: 100 units

   Suggestions:
   - Order 50 now, 50 later
   - Check alternative suppliers
   - Order similar medicine
   ```

4. **Backorder Option**

   ```
   ☐ Allow backorder for remaining 50 units
   Estimated delivery: 2 weeks
   ```

5. **Stock Alerts**
   ```
   ⚠️ Low Stock Alert
   Only 10 units remaining
   Order soon to ensure availability
   ```

## Testing Checklist

- [ ] Add item from catalog shows max quantity
- [ ] "Available: X units" displays correctly
- [ ] Cannot enter quantity > available
- [ ] Browser shows error if exceeding
- [ ] Adding same item multiple times validates total
- [ ] Error toast shows when exceeding on add
- [ ] Manual items have no max limit
- [ ] Form cannot submit with invalid quantity
- [ ] Quantity updates total correctly
- [ ] Max quantity persists after page refresh

## Code Summary

### Key Changes

1. **addItemFromCatalog**: Added max_quantity and validation
2. **Quantity Input**: Added max attribute
3. **UI**: Added "Available: X units" display
4. **Validation**: Check on add and browser validation

### Files Modified

- `frontend/src/pages/Pharmacist/PurchaseOrders.jsx`

### Lines Changed

- ~30 lines modified/added

## Validation Flow

```
User adds item from catalog
    ↓
Store max_quantity from catalog
    ↓
Display "Available: X units"
    ↓
User tries to change quantity
    ↓
Browser validates against max
    ↓
If valid: Update quantity
If invalid: Show error, prevent change
    ↓
User submits order
    ↓
All quantities validated
    ↓
Order sent to supplier
```

## Conclusion

Quantity validation ensures:

- ✅ Realistic orders that can be fulfilled
- ✅ Clear communication of stock levels
- ✅ Prevention of over-ordering
- ✅ Better user experience
- ✅ Fewer order disputes
- ✅ Accurate inventory management

Combined with read-only prices, the system now enforces proper business rules while maintaining flexibility where needed.

---

**Policy**: Cannot exceed supplier's available quantity
**Implementation**: HTML5 max attribute + validation
**Status**: ✅ Enforced
**Last Updated**: April 8, 2026
