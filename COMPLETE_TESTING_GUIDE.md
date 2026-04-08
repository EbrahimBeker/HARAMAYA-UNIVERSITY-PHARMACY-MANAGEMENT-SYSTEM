# Haramaya University Pharmacy Management System

## Complete Testing Guide for All User Roles

---

## 🚀 Getting Started

### Prerequisites

- Backend API running on `http://localhost:3000`
- Frontend running on `http://localhost:5173`
- Database seeded with default users

### Start the Application

```bash
# Terminal 1 - Start Backend
cd api
npm start

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

### Access the Application

Open browser: `http://localhost:5173`

---

## 👥 Test User Credentials

| Role              | Username     | Password       | Email                   |
| ----------------- | ------------ | -------------- | ----------------------- |
| **Data Clerk**    | `clerk`      | `clerk123`     | clerk@pharmacy.com      |
| **Pharmacist**    | `pharmacist` | `pharma123`    | pharmacist@pharmacy.com |
| **Physician**     | `physician`  | `physician123` | physician@pharmacy.com  |
| **Admin**         | `admin`      | `admin123`     | admin@pharmacy.com      |
| **Drug Supplier** | `supplier`   | `supply123`    | supplier@pharmacy.com   |

---

## 📋 ROLE 1: DATA CLERK

### Login

```
Username: clerk
Password: clerk123
```

### Dashboard Overview

**Expected Elements:**

- ✅ Glassmorphism sidebar on the left
- ✅ Header: "Data Clerk Dashboard"
- ✅ 4 inline stat boxes:
  - Total Patients (blue)
  - Today's Registrations (green)
  - Monthly Revenue in ETB (purple)
  - Pending Invoices (orange)
- ✅ Recent Patients table (full width)
- ✅ System Online indicator

### Sidebar Navigation

**Should Display:**

- 🏠 Dashboard
- ➕ Patient Registration
- 📋 Patient Records
- 📊 Reports

**Should NOT Display:**

- ❌ Billing (removed)
- ❌ Any other role-specific items

### Test Cases

#### TC1: Patient Registration

1. Click "Patient Registration" in sidebar
2. **Verify:**
   - ✅ Only "Patient Registration" is highlighted (blue gradient)
   - ✅ NO "Back to Dashboard" button
   - ✅ Page title: "Patient Registration"
   - ✅ Form sections visible:
     - Personal Information (First Name, Last Name, DOB, Gender)
     - Contact Information (Phone, Email, Address)
     - Emergency Contact (Name, Phone)
     - Medical Information (Blood Group, Allergies)
     - Registration Fee Payment (100 ETB)

3. **Fill Form:**

   ```
   First Name: John
   Last Name: Doe
   Date of Birth: 1990-01-01
   Gender: Male
   Phone: +251911234567
   Email: john.doe@example.com
   Address: Harar, Ethiopia
   Emergency Contact Name: Jane Doe
   Emergency Contact Phone: +251922345678
   Blood Group: O+
   Allergies: None
   ```

4. **Test Payment Section:**
   - Select "Cash" → Enter amount ≥ 100 ETB → Verify change calculation
   - Select "Card" → Verify auto-processed message
   - Select "Mobile Money" → Verify auto-processed
   - Select "Bank Transfer" → Verify auto-processed

5. **Submit:**
   - Click "Register Patient"
   - Verify success message
   - Verify receipt modal appears
   - Verify currency shows "ETB" not "$"

#### TC2: Patient Records

1. Click "Patient Records" in sidebar
2. **Verify:**
   - ✅ Only "Patient Records" is highlighted
   - ✅ "Patient Registration" is NOT highlighted
   - ✅ NO "Back to Dashboard" button
   - ✅ Page layout:
     - Title and "New Patient" button on same line
     - Search bar below title
     - Full-width patient table

3. **Test Search:**
   - Enter patient name in search box
   - Click "Search"
   - Verify filtered results

4. **Test Table:**
   - Verify columns: Patient Info, Contact, Age/Gender, Registration Date, Actions
   - Click "View" button → Verify patient details page
   - Click "Edit" button → Verify edit form

5. **Test Pagination:**
   - If multiple pages exist, test Previous/Next buttons
   - Verify page numbers display correctly

#### TC3: Sidebar Behavior

1. **Test Collapse/Expand:**
   - Click collapse button (left arrow)
   - Verify sidebar shrinks to icon-only view
   - Hover over icons → Verify tooltips appear
   - Click expand button → Verify sidebar expands

2. **Test Navigation Highlighting:**
   - Click Dashboard → Verify only Dashboard highlighted
   - Click Patient Registration → Verify only it is highlighted
   - Click Patient Records → Verify only it is highlighted
   - Verify NO double highlighting

3. **Test User Info:**
   - Verify user name displays: "Data Clerk"
   - Verify role displays: "Data Clerk"
   - When collapsed, verify only avatar shows

#### TC4: Responsive Design

1. Resize browser to 1366px width → Verify layout adapts
2. Resize to 768px (tablet) → Verify sidebar remains functional
3. Verify tables scroll horizontally on small screens
4. Verify no content overlaps with sidebar

#### TC5: Logout

1. Click "Logout" button at bottom of sidebar
2. Verify redirected to login page
3. Verify cannot access protected routes without login

---

## 💊 ROLE 2: PHARMACIST

### Login

```
Username: pharmacist
Password: pharma123
```

### Dashboard Overview

**Expected Elements:**

- ✅ Glassmorphism sidebar
- ✅ Header: "Pharmacist Dashboard"
- ✅ 4 inline stat boxes:
  - Total Medicines (blue)
  - Pending Prescriptions (amber)
  - Low Stock Medicines (red)
  - Dispensed Today (green)
- ✅ 3-column layout:
  - Left: Quick Actions cards
  - Right: Pending Prescriptions & Low Stock Alerts tables

### Sidebar Navigation

**Should Display:**

- 🏠 Dashboard
- 🛒 Drug Dispensing
- 📦 Stock In
- 💊 Inventory
- 🚚 Suppliers
- 📊 Reports

### Test Cases

#### TC1: Drug Dispensing

1. Click "Drug Dispensing" in sidebar
2. **Verify:**
   - ✅ Medicine search functionality
   - ✅ Shopping cart for selected medicines
   - ✅ Quantity and dosage inputs
   - ✅ Total amount calculation in ETB
   - ✅ Payment processing section
   - ✅ NO Pending Prescriptions section (removed)
   - ✅ NO Quick Stats section (removed)

3. **Test Dispensing Flow:**
   - Search for a medicine
   - Add to cart
   - Adjust quantity
   - Verify total updates
   - Select payment method
   - Complete dispensing
   - Verify receipt shows ETB currency

#### TC2: Stock In

1. Click "Stock In" in sidebar
2. **Verify:**
   - ✅ Medicine selection dropdown
   - ✅ Quantity input
   - ✅ Unit cost in ETB
   - ✅ Supplier selection
   - ✅ Batch number and expiry date
   - ✅ Total cost calculation

3. **Test Stock Entry:**
   - Select medicine
   - Enter quantity and unit cost
   - Select supplier
   - Enter batch details
   - Submit
   - Verify success message
   - Verify currency shows ETB

#### TC3: Inventory Management

1. Click "Inventory" in sidebar
2. **Verify:**
   - ✅ Full medicine list with stock levels
   - ✅ Search and filter functionality
   - ✅ Low stock indicators
   - ✅ Edit/Update options
   - ✅ Prices in ETB

#### TC4: Reports

1. Click "Reports" in sidebar
2. **Verify:**
   - ✅ Pharmacy-specific reports
   - ✅ Revenue charts in ETB
   - ✅ Dispensing statistics
   - ✅ Stock movement reports

---

## 🩺 ROLE 3: PHYSICIAN

### Login

```
Username: physician
Password: physician123
```

### Dashboard Overview

**Expected Elements:**

- ✅ Glassmorphism sidebar
- ✅ Header: "Physician Dashboard"
- ✅ Patient management overview
- ✅ Prescription statistics

### Sidebar Navigation

**Should Display:**

- 🏠 Dashboard
- 👥 Patients
- 💊 Medicines
- 🩺 Diagnoses
- 📊 Reports

### Test Cases

#### TC1: Patient Management

1. Click "Patients" in sidebar
2. **Verify:**
   - ✅ Patient list with medical history
   - ✅ Search functionality
   - ✅ View patient details
   - ✅ Access to medical records

#### TC2: Prescriptions

1. Select a patient
2. **Verify:**
   - ✅ Create new prescription
   - ✅ Select medicines
   - ✅ Add dosage instructions
   - ✅ Save prescription

#### TC3: Diagnoses

1. Click "Diagnoses" in sidebar
2. **Verify:**
   - ✅ Diagnosis management
   - ✅ ICD code support
   - ✅ Link to prescriptions

---

## 👨‍💼 ROLE 4: ADMIN

### Login

```
Username: admin
Password: admin123
```

### Dashboard Overview

**Expected Elements:**

- ✅ Glassmorphism sidebar
- ✅ Header: "Admin Dashboard"
- ✅ System-wide statistics
- ✅ User management overview

### Sidebar Navigation

**Should Display:**

- 🏠 Dashboard
- 👥 Users
- 💊 Medicines
- 📦 Suppliers
- 📊 Reports
- ⚙️ Settings

### Test Cases

#### TC1: User Management

1. Click "Users" in sidebar
2. **Verify:**
   - ✅ List all users
   - ✅ Create new user
   - ✅ Assign roles
   - ✅ Activate/Deactivate users
   - ✅ Edit user details

#### TC2: System Settings

1. Click "Settings" in sidebar
2. **Verify:**
   - ✅ System configuration options
   - ✅ Role permissions management
   - ✅ Backup/Restore options

#### TC3: Reports

1. Click "Reports" in sidebar
2. **Verify:**
   - ✅ System-wide reports
   - ✅ All financial data in ETB
   - ✅ User activity logs
   - ✅ Export functionality

---

## 🚚 ROLE 5: DRUG SUPPLIER

### Login

```
Username: supplier
Password: supply123
```

### Dashboard Overview

**Expected Elements:**

- ✅ Glassmorphism sidebar
- ✅ Header: "Supplier Dashboard"
- ✅ Supply orders overview
- ✅ Delivery statistics

### Sidebar Navigation

**Should Display:**

- 🏠 Dashboard
- 📦 Suppliers
- 💊 Medicines
- 📊 Reports

### Test Cases

#### TC1: Supplier Management

1. Click "Suppliers" in sidebar
2. **Verify:**
   - ✅ Supplier list
   - ✅ Contact information
   - ✅ Supply history

#### TC2: Medicine Catalog

1. Click "Medicines" in sidebar
2. **Verify:**
   - ✅ Available medicines
   - ✅ Pricing in ETB
   - ✅ Stock availability

---

## ✅ General Testing Checklist (All Roles)

### Visual Design

- [ ] Glassmorphism sidebar with frosted glass effect
- [ ] Sidebar collapse/expand works smoothly
- [ ] Active menu items show blue gradient highlight
- [ ] Only one menu item highlighted at a time
- [ ] User avatar and info display correctly
- [ ] System Online indicator shows green pulse
- [ ] All cards use rounded-xl and shadow-sm
- [ ] Consistent spacing and padding

### Currency

- [ ] All monetary values show "ETB" not "$"
- [ ] Prices formatted correctly (e.g., 100.00 ETB)
- [ ] Payment sections use ETB
- [ ] Reports show ETB currency

### Navigation

- [ ] All sidebar links work correctly
- [ ] Active state highlighting is accurate
- [ ] No "Back to Dashboard" buttons on pages
- [ ] Logout redirects to login page
- [ ] Protected routes require authentication

### Responsive Design

- [ ] Works on desktop (1920px)
- [ ] Works on laptop (1366px)
- [ ] Works on tablet (768px)
- [ ] Sidebar remains fixed on scroll
- [ ] Tables scroll horizontally when needed
- [ ] No content overlap with sidebar

### Performance

- [ ] Pages load quickly
- [ ] No console errors
- [ ] No JSX syntax errors
- [ ] Smooth transitions and animations
- [ ] API calls complete successfully

### Data Integrity

- [ ] Forms validate input correctly
- [ ] Success messages appear after actions
- [ ] Error messages display when needed
- [ ] Data persists after page refresh
- [ ] Search and filter work correctly

---

## 🐛 Common Issues & Solutions

### Issue 1: Sidebar not showing

**Solution:** Check if Layout component wraps the page

### Issue 2: Multiple menu items highlighted

**Solution:** Verify isActive function in Sidebar.jsx

### Issue 3: Currency shows "$" instead of "ETB"

**Solution:** Check all price display components

### Issue 4: "Back to Dashboard" button visible

**Solution:** Verify button removed from page components

### Issue 5: Console errors

**Solution:** Check browser console for specific error messages

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________
Role Tested: ___________

✅ PASSED:
-

❌ FAILED:
-

🐛 BUGS FOUND:
-

💡 SUGGESTIONS:
-

Overall Status: [ ] PASS  [ ] FAIL
```

---

## 🎯 Success Criteria

### All Tests Pass When:

1. ✅ All 5 roles can login successfully
2. ✅ Each role sees correct sidebar navigation
3. ✅ No "Back to Dashboard" buttons visible
4. ✅ Billing removed from Data Clerk sidebar
5. ✅ Currency displays as "ETB" throughout
6. ✅ Sidebar highlighting works correctly (no double highlights)
7. ✅ All pages load without errors
8. ✅ Responsive design works on all screen sizes
9. ✅ Forms submit successfully
10. ✅ Data displays correctly in tables

---

## 📞 Support

For issues or questions:

- Check browser console for errors
- Verify backend API is running
- Ensure database is properly seeded
- Review recent code changes

**Happy Testing! 🚀**
