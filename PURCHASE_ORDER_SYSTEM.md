# Purchase Order System Implementation

## Overview

Complete purchase order workflow between Pharmacists and Suppliers has been implemented.

## Database Tables Created

1. **purchase_orders** - Main order table
2. **purchase_order_items** - Order line items

## Backend API Endpoints

### Pharmacist Endpoints

- `POST /api/purchase-orders` - Create new purchase order
- `GET /api/purchase-orders` - Get all orders
- `GET /api/purchase-orders/:id` - Get order details
- `POST /api/purchase-orders/:id/receive` - Receive delivered stock
- `POST /api/purchase-orders/:id/cancel` - Cancel order

### Supplier Endpoints

- `GET /api/purchase-orders` - View orders (filtered by supplier)
- `POST /api/purchase-orders/:id/confirm` - Confirm order and availability
- `POST /api/purchase-orders/:id/deliver` - Mark as delivered

## Frontend Pages Created

### Pharmacist

- **PurchaseOrders.jsx** - Create and manage purchase orders
  - Location: `frontend/src/pages/Pharmacist/PurchaseOrders.jsx`
  - Features:
    - Create new purchase order
    - Select supplier
    - Add multiple medicines
    - View order history
    - Track order status

### Supplier (To be completed)

- **SupplierOrders.jsx** - View and manage received orders
  - Needs to be created at: `frontend/src/pages/Supplier/SupplierOrders.jsx`
  - Features needed:
    - View pending orders
    - Confirm availability
    - Update quantities
    - Mark as delivered

## Workflow

### 1. Pharmacist Creates Order

```
Pharmacist Dashboard → Purchase Orders → New Order
- Select Supplier
- Add Medicines (quantity, price)
- Set expected delivery date
- Submit Order
Status: "pending"
```

### 2. Supplier Confirms Order

```
Supplier Dashboard → Orders → View Order
- Review items
- Confirm available quantities
- Set delivery date
- Confirm Order
Status: "pending" → "confirmed"
```

### 3. Supplier Delivers

```
Supplier Dashboard → Orders → Mark Delivered
- Update delivered quantities
- Set actual delivery date
- Mark as Delivered
Status: "confirmed" → "delivered"
```

### 4. Pharmacist Receives Stock

```
Pharmacist Dashboard → Purchase Orders → Receive Stock
- Verify quantities
- Enter batch numbers
- Enter expiry dates
- Receive Stock
- Stock automatically added to inventory
```

## Routes to Add

### App.jsx

```javascript
// Pharmacist Routes
<Route
  path="pharmacist/purchase-orders"
  element={
    <ProtectedRoute roles={["Pharmacist"]}>
      <PurchaseOrders />
    </ProtectedRoute>
  }
/>

// Supplier Routes
<Route
  path="supplier/orders"
  element={
    <ProtectedRoute roles={["Drug Supplier"]}>
      <SupplierOrders />
    </ProtectedRoute>
  }
/>
```

### Sidebar.jsx

Add to Pharmacist navigation:

```javascript
{
  label: "Purchase Orders",
  icon: Package,
  path: "/pharmacist/purchase-orders",
}
```

Add to Supplier navigation:

```javascript
{
  label: "Orders",
  icon: Package,
  path: "/supplier/orders",
}
```

## Next Steps

1. **Add route to App.jsx** for Purchase Orders page
2. **Update Sidebar.jsx** to show Purchase Orders link for Pharmacist
3. **Create SupplierOrders.jsx** page for suppliers to manage orders
4. **Update Supplier Dashboard** to show pending orders count
5. **Test complete workflow** from order creation to stock receipt

## Status Values

- `pending` - Order created, waiting for supplier confirmation
- `confirmed` - Supplier confirmed availability
- `delivered` - Supplier marked as delivered
- `cancelled` - Order cancelled

## Permissions Required

- Pharmacist: `manage_inventory`, `view_inventory`
- Supplier: `manage_inventory`, `view_inventory`
