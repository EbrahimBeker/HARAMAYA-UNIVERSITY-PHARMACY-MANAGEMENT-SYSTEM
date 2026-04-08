# Payment Receipt System - Quick Testing Guide

## 🚀 Quick Start

### 1. Start the Servers

```bash
# Terminal 1 - Backend
cd api
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Backend: http://localhost:5000
Frontend: http://localhost:5173

---

## 📝 Test Scenario: Complete Payment Flow

### Step 1: Create Order (Pharmacist)

1. **Login as Pharmacist**
   - URL: http://localhost:5173/login
   - Username: `pharmacist`
   - Password: `pharma123`

2. **Create Purchase Order**
   - Navigate to "Purchase Orders" page
   - Click "New Order" button
   - Select a supplier from dropdown
   - Add items to order
   - Click "Create Order"
   - ✅ **Verify**: Order appears with status "Pending" and payment "Unpaid" (Red badge)

### Step 2: Confirm Order (Supplier)

1. **Logout and Login as Supplier**
   - Username: `supplier`
   - Password: `supply123`

2. **Confirm the Order**
   - Navigate to "Purchase Orders" page
   - Find the order you just created
   - Click "View" button
   - Click "Confirm Order" button
   - ✅ **Verify**: Order status changes to "Confirmed"
   - ✅ **Verify**: Payment status still "Unpaid" (Red badge)
   - ✅ **Verify**: "Confirm Payment & Deliver" button is DISABLED (grayed out)
   - ✅ **Verify**: Message shows "Waiting for payment receipt from pharmacist"

### Step 3: Upload Payment Receipt (Pharmacist)

1. **Logout and Login as Pharmacist Again**

2. **Upload Payment Receipt**
   - Navigate to "Purchase Orders" page
   - Click "View" on the confirmed order
   - ✅ **Verify**: "Upload Payment Receipt" button is visible
   - Click "Upload Payment Receipt" button
   - Select an image file (any JPEG, PNG, or PDF)
   - Optionally add payment date
   - Optionally add payment notes (e.g., "Paid via bank transfer")
   - Click "Upload Receipt"
   - ✅ **Verify**: Success message appears
   - ✅ **Verify**: Payment status changes to "Pending Verification" (Yellow badge)
   - ✅ **Verify**: Receipt thumbnail appears in order details
   - ✅ **Verify**: Click thumbnail opens full-size image in new tab

### Step 4: View Receipt and Deliver (Supplier)

1. **Logout and Login as Supplier Again**

2. **View Payment Receipt**
   - Navigate to "Purchase Orders" page
   - ✅ **Verify**: Order shows payment status "Pending Verification" (Yellow badge)
   - Click "View" on the order
   - ✅ **Verify**: Payment receipt image is displayed
   - ✅ **Verify**: Payment date and notes are shown (if provided)
   - ✅ **Verify**: Click image opens full-size in new tab
   - ✅ **Verify**: "Confirm Payment & Deliver" button is now ENABLED (green)

3. **Confirm Payment and Deliver**
   - Click "Confirm Payment & Deliver" button
   - Enter batch numbers for all items (required)
   - Optionally enter expiry dates
   - Click "Confirm Delivery & Update Inventory"
   - ✅ **Verify**: Success message appears
   - ✅ **Verify**: Order status changes to "Delivered" (Green badge)
   - ✅ **Verify**: Payment status changes to "Paid" (Green badge)

### Step 5: Verify Inventory Updated (Pharmacist)

1. **Logout and Login as Pharmacist Again**

2. **Check Inventory**
   - Navigate to inventory/stock page
   - ✅ **Verify**: Medicine quantities have increased
   - ✅ **Verify**: Stock-in records created with batch numbers

---

## 🎯 What to Test

### Payment Status Badges

- [ ] Unpaid shows RED badge
- [ ] Pending Verification shows YELLOW badge
- [ ] Paid shows GREEN badge
- [ ] Badges appear in both orders list and order details

### Upload Functionality

- [ ] Upload button only shows for confirmed orders
- [ ] File validation works (only JPEG, PNG, PDF)
- [ ] File size validation works (max 5MB)
- [ ] Success message appears after upload
- [ ] Receipt thumbnail displays correctly
- [ ] Click thumbnail opens full-size image

### Supplier View

- [ ] Receipt image displays in order details
- [ ] Payment date and notes display (if provided)
- [ ] Click image opens in new tab
- [ ] "Deliver" button disabled without receipt
- [ ] "Deliver" button enabled with receipt
- [ ] Button text changes to "Confirm Payment & Deliver"

### Delivery Flow

- [ ] Cannot deliver without payment receipt
- [ ] Batch numbers required for all items
- [ ] Delivery updates order status to "Delivered"
- [ ] Delivery updates payment status to "Paid"
- [ ] Inventory automatically updated
- [ ] Stock-in records created

### Error Handling

- [ ] Error if uploading wrong file type
- [ ] Error if file too large (>5MB)
- [ ] Error if trying to deliver without receipt
- [ ] Error if batch numbers missing
- [ ] Appropriate error messages displayed

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot deliver order without payment receipt"

**Solution**: Pharmacist must upload payment receipt first

### Issue: Upload button not showing

**Solution**: Order must be in "Confirmed" status first

### Issue: Image not displaying

**Solution**: Check that backend server is running and serving static files

### Issue: File upload fails

**Solution**: Check file type (JPEG/PNG/PDF only) and size (<5MB)

### Issue: Inventory not updating

**Solution**: Check that batch numbers are provided for all items

---

## 📸 Test Images

You can use any image file for testing. Here are some options:

1. **Screenshot**: Take a screenshot of anything and save as JPEG
2. **Sample Receipt**: Create a simple text document, take screenshot
3. **Test Image**: Use any photo from your computer
4. **PDF**: Any PDF file under 5MB

---

## ✅ Success Criteria

The system is working correctly if:

1. ✅ Pharmacist can upload payment receipt for confirmed orders
2. ✅ Payment status updates to "Pending Verification" after upload
3. ✅ Supplier can view the uploaded receipt image
4. ✅ Supplier cannot deliver without payment receipt
5. ✅ Supplier can deliver after receipt is uploaded
6. ✅ Payment status updates to "Paid" after delivery
7. ✅ Inventory automatically updates with correct quantities
8. ✅ All status badges display correct colors
9. ✅ Receipt image can be viewed full-size
10. ✅ Error messages display for invalid operations

---

## 🎉 Expected Results

After completing all steps:

- Order Status: **Delivered** (Green)
- Payment Status: **Paid** (Green)
- Receipt: **Visible to both pharmacist and supplier**
- Inventory: **Updated with received quantities**
- Stock-in Records: **Created with batch numbers**
- Payment Verification: **Recorded with timestamp and user**

---

## 📞 Need Help?

If something doesn't work:

1. Check browser console for errors (F12)
2. Check backend terminal for errors
3. Verify database migration ran successfully
4. Ensure `uploads/payment-receipts/` directory exists
5. Check file permissions on uploads directory
6. Verify both servers are running

---

## 🔄 Reset Test Data

To test again with fresh data:

```sql
-- Reset order status
UPDATE purchase_orders
SET status = 'pending',
    payment_status = 'unpaid',
    payment_receipt_image = NULL,
    payment_date = NULL,
    payment_notes = NULL
WHERE id = YOUR_ORDER_ID;
```

---

Happy Testing! 🎊
