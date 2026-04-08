# Payment Workflow Design - Pharmacist to Supplier

## Current System Analysis

### Existing Purchase Order Flow

1. **Pharmacist** creates purchase order → Status: `pending`
2. **Supplier** confirms order → Status: `confirmed`
3. **Supplier** marks as delivered (with batch numbers & expiry dates) → Status: `delivered`
4. Inventory automatically updated in pharmacist's stock

### Missing Component

**Payment tracking and confirmation** - Currently there's no way to:

- Track if pharmacist has paid the supplier
- Record payment method and details
- Confirm payment receipt by supplier
- Handle partial payments
- Generate payment receipts

---

## Proposed Payment Workflow

### Option 1: Simple Payment Status (Recommended for MVP)

#### Database Changes Needed

**Add to `purchase_orders` table:**

```sql
ALTER TABLE purchase_orders
ADD COLUMN payment_status ENUM('unpaid', 'paid', 'partial', 'refunded') DEFAULT 'unpaid' AFTER status,
ADD COLUMN payment_method VARCHAR(50) NULL AFTER payment_status,
ADD COLUMN payment_date DATE NULL AFTER payment_method,
ADD COLUMN payment_reference VARCHAR(100) NULL AFTER payment_date,
ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0.00 AFTER payment_reference,
ADD COLUMN payment_notes TEXT NULL AFTER amount_paid;
```

#### Workflow Steps

**Step 1: Order Creation (Pharmacist)**

- Create purchase order
- Status: `pending`
- Payment Status: `unpaid`

**Step 2: Order Confirmation (Supplier)**

- Supplier confirms order
- Status: `confirmed`
- Payment Status: remains `unpaid`

**Step 3: Payment (Pharmacist)**

- Pharmacist marks order as paid
- Provides:
  - Payment method (Cash, Bank Transfer, Check, Mobile Money)
  - Payment date
  - Payment reference/transaction ID
  - Amount paid
  - Optional notes
- Payment Status: `paid` (or `partial` if amount < total)
- Status: remains `confirmed`

**Step 4: Payment Confirmation (Supplier)**

- Supplier reviews payment details
- Confirms payment received
- Can add notes (e.g., "Payment verified via bank")
- Payment Status: remains `paid` (but marked as verified)

**Step 5: Delivery (Supplier)**

- Supplier marks as delivered
- Status: `delivered`
- Inventory automatically updated

#### UI Components Needed

**Pharmacist Side:**

1. **Payment Button** on order details page
   - Shows when order is `confirmed` and payment is `unpaid` or `partial`
   - Opens payment modal with form:
     - Payment method dropdown
     - Payment date picker
     - Payment reference input
     - Amount input (pre-filled with remaining balance)
     - Notes textarea
   - Submit updates payment status

2. **Payment Status Badge** on orders list
   - Color-coded: Red (unpaid), Yellow (partial), Green (paid)

3. **Payment Details Section** on order details
   - Shows payment information if paid
   - Shows payment history if partial payments

**Supplier Side:**

1. **Payment Verification Section** on order details
   - Shows payment details submitted by pharmacist
   - "Confirm Payment Received" button
   - Can add verification notes
   - Shows verification status and date

2. **Payment Filter** on orders list
   - Filter by payment status
   - Highlight orders with unverified payments

---

### Option 2: Advanced Payment System (Future Enhancement)

#### Additional Features

- **Multiple Payments**: Track partial payments with history
- **Payment Receipts**: Auto-generate PDF receipts
- **Payment Reminders**: Notify pharmacist of unpaid orders
- **Credit Terms**: Allow payment after delivery (30/60/90 days)
- **Payment Gateway Integration**: Online payment processing
- **Accounting Integration**: Export to accounting software

#### Additional Database Tables

**`payment_transactions` table:**

```sql
CREATE TABLE payment_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  purchase_order_id BIGINT UNSIGNED NOT NULL,
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_date DATE NOT NULL,
  reference_number VARCHAR(100),
  paid_by BIGINT UNSIGNED NOT NULL, -- pharmacist user_id
  verified_by BIGINT UNSIGNED NULL, -- supplier user_id
  verified_at TIMESTAMP NULL,
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (paid_by) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);
```

**`payment_receipts` table:**

```sql
CREATE TABLE payment_receipts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_transaction_id BIGINT UNSIGNED NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  receipt_url VARCHAR(255),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id)
);
```

---

## Implementation Recommendation

### Phase 1: Simple Payment Status (Implement Now)

**Effort**: 4-6 hours
**Complexity**: Low
**Value**: High

**Tasks:**

1. Database migration to add payment fields
2. Backend API endpoints:
   - `POST /api/purchase-orders/:id/payment` - Record payment
   - `POST /api/purchase-orders/:id/verify-payment` - Verify payment
   - `GET /api/purchase-orders/:id/payment-details` - Get payment info
3. Frontend components:
   - Payment modal for pharmacist
   - Payment verification section for supplier
   - Payment status badges
4. Update order details pages for both roles

### Phase 2: Advanced Features (Future)

**Effort**: 2-3 weeks
**Complexity**: High
**Value**: Medium

**Tasks:**

1. Multiple payment transactions
2. PDF receipt generation
3. Payment reminders
4. Credit terms management
5. Reporting and analytics

---

## Detailed Implementation Steps (Phase 1)

### 1. Database Migration

Create file: `api/migrations/add_payment_tracking.sql`

```sql
-- Add payment fields to purchase_orders table
ALTER TABLE purchase_orders
ADD COLUMN payment_status ENUM('unpaid', 'paid', 'partial', 'refunded') DEFAULT 'unpaid' AFTER status,
ADD COLUMN payment_method VARCHAR(50) NULL AFTER payment_status,
ADD COLUMN payment_date DATE NULL AFTER payment_method,
ADD COLUMN payment_reference VARCHAR(100) NULL AFTER payment_date,
ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0.00 AFTER payment_reference,
ADD COLUMN payment_notes TEXT NULL AFTER amount_paid,
ADD COLUMN payment_verified_by BIGINT UNSIGNED NULL AFTER payment_notes,
ADD COLUMN payment_verified_at TIMESTAMP NULL AFTER payment_verified_by,
ADD COLUMN payment_verification_notes TEXT NULL AFTER payment_verified_at,
ADD FOREIGN KEY (payment_verified_by) REFERENCES users(id);
```

### 2. Backend Controller Updates

**Add to `purchaseOrderController.js`:**

```javascript
// Pharmacist: Record payment
exports.recordPayment = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      payment_method,
      payment_date,
      payment_reference,
      amount_paid,
      payment_notes,
    } = req.body;

    // Get order details
    const [orders] = await connection.execute(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [id],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const order = orders[0];
    const totalAmount = parseFloat(order.total_amount);
    const amountPaid = parseFloat(amount_paid);
    const previouslyPaid = parseFloat(order.amount_paid || 0);
    const totalPaid = previouslyPaid + amountPaid;

    // Determine payment status
    let paymentStatus = "unpaid";
    if (totalPaid >= totalAmount) {
      paymentStatus = "paid";
    } else if (totalPaid > 0) {
      paymentStatus = "partial";
    }

    // Update order with payment details
    await connection.execute(
      `UPDATE purchase_orders 
       SET payment_status = ?, payment_method = ?, payment_date = ?,
           payment_reference = ?, amount_paid = ?, payment_notes = ?
       WHERE id = ?`,
      [
        paymentStatus,
        payment_method,
        payment_date,
        payment_reference,
        totalPaid,
        payment_notes,
        id,
      ],
    );

    await connection.commit();

    res.json({
      message: "Payment recorded successfully",
      payment_status: paymentStatus,
      amount_paid: totalPaid,
      remaining_balance: totalAmount - totalPaid,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Supplier: Verify payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verification_notes } = req.body;

    await db.execute(
      `UPDATE purchase_orders 
       SET payment_verified_by = ?, payment_verified_at = NOW(),
           payment_verification_notes = ?
       WHERE id = ?`,
      [req.user.id, verification_notes || null, id],
    );

    res.json({ message: "Payment verified successfully" });
  } catch (error) {
    next(error);
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const [result] = await db.execute(
      `SELECT po.payment_status, po.payment_method, po.payment_date,
              po.payment_reference, po.amount_paid, po.payment_notes,
              po.total_amount, po.payment_verified_at,
              CONCAT(u.first_name, ' ', u.last_name) as verified_by_name,
              po.payment_verification_notes
       FROM purchase_orders po
       LEFT JOIN users u ON po.payment_verified_by = u.id
       WHERE po.id = ?`,
      [req.params.id],
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    res.json(result[0]);
  } catch (error) {
    next(error);
  }
};
```

### 3. Backend Routes

**Add to `api/routes/purchaseOrders.js`:**

```javascript
router.post(
  "/:id/payment",
  authorize("Pharmacist"),
  purchaseOrderController.recordPayment,
);
router.post(
  "/:id/verify-payment",
  authorize("Drug Supplier"),
  purchaseOrderController.verifyPayment,
);
router.get("/:id/payment-details", purchaseOrderController.getPaymentDetails);
```

### 4. Frontend Components

**Pharmacist Payment Modal:**

- Location: `frontend/src/components/Pharmacist/PaymentModal.jsx`
- Features:
  - Payment method dropdown (Cash, Bank Transfer, Check, Mobile Money)
  - Date picker for payment date
  - Input for payment reference/transaction ID
  - Amount input (with validation)
  - Notes textarea
  - Submit button

**Supplier Payment Verification:**

- Location: `frontend/src/components/Supplier/PaymentVerification.jsx`
- Features:
  - Display payment details
  - Verification notes textarea
  - "Confirm Payment Received" button
  - Show verification status

### 5. Update Existing Pages

**Pharmacist Orders Page:**

- Add payment status badge to order cards
- Add "Record Payment" button for confirmed orders
- Show payment details in order details modal

**Supplier Orders Page:**

- Add payment status filter
- Show payment details in order details
- Add payment verification section
- Highlight unverified payments

---

## Payment Methods

### Supported Payment Methods

1. **Cash** - Direct cash payment
2. **Bank Transfer** - Electronic bank transfer
3. **Check** - Bank check payment
4. **Mobile Money** - M-Pesa, Telebirr, etc.
5. **Credit** - Payment on credit terms (future)

---

## Business Rules

1. **Payment can only be recorded after order is confirmed**
2. **Partial payments are allowed**
3. **Payment verification is optional but recommended**
4. **Delivery can happen before or after payment** (configurable)
5. **Payment status doesn't block delivery** (business decision)
6. **Refunds require admin approval** (future feature)

---

## Security Considerations

1. **Authorization**: Only pharmacist can record payment for their orders
2. **Verification**: Only supplier can verify payment for their orders
3. **Audit Trail**: All payment actions are timestamped and user-tracked
4. **Validation**: Amount paid cannot exceed total amount (unless refund)
5. **Data Integrity**: Use database transactions for all payment operations

---

## Testing Checklist

- [ ] Pharmacist can record payment for confirmed order
- [ ] Payment status updates correctly (unpaid → partial → paid)
- [ ] Supplier can verify payment
- [ ] Payment details display correctly
- [ ] Partial payments accumulate correctly
- [ ] Cannot record payment for cancelled orders
- [ ] Payment status filters work
- [ ] Payment badges display correct colors
- [ ] Payment reference is stored and displayed
- [ ] Payment notes are saved

---

## Future Enhancements

1. **Payment Receipts**: Auto-generate PDF receipts
2. **Payment Reminders**: Email/SMS reminders for unpaid orders
3. **Credit Terms**: 30/60/90 day payment terms
4. **Payment Gateway**: Online payment integration
5. **Payment Reports**: Financial reports and analytics
6. **Multi-Currency**: Support for different currencies
7. **Payment Disputes**: Dispute resolution workflow
8. **Automatic Reconciliation**: Match bank statements with payments

---

## Estimated Timeline

**Phase 1 (Simple Payment Status):**

- Database migration: 30 minutes
- Backend API: 2 hours
- Frontend components: 3 hours
- Testing: 1 hour
- **Total: 6-7 hours**

**Phase 2 (Advanced Features):**

- Multiple payments: 1 week
- Receipt generation: 3 days
- Reminders: 2 days
- Credit terms: 3 days
- **Total: 2-3 weeks**

---

## Recommendation

**Start with Phase 1** - Simple payment status tracking. This provides immediate value with minimal complexity. The system will track:

- Who paid
- When they paid
- How much they paid
- Payment method and reference
- Supplier verification

This covers 90% of the business needs and can be implemented quickly. Phase 2 features can be added later based on actual usage and feedback.
