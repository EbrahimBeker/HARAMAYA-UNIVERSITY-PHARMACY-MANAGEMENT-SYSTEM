# Test Scenarios for Pharmacy Management System

## Overview

This document outlines comprehensive test scenarios that demonstrate the complete workflow of the Pharmacy Management System with realistic test data.

## Setup Instructions

### 1. Initialize Test Environment

```bash
cd api
node setup-test-environment.js
```

### 2. Start Services

```bash
# Terminal 1 - API Server
cd api
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Access Application

- Frontend: http://localhost:5173
- API: http://localhost:5000

## Test User Credentials

| Role          | Username   | Password     | Purpose                         |
| ------------- | ---------- | ------------ | ------------------------------- |
| Admin         | admin      | admin123     | Full system access              |
| Data Clerk    | clerk      | clerk123     | Patient registration & billing  |
| Physician     | physician  | physician123 | Diagnosis & prescriptions       |
| Pharmacist    | pharmacist | pharma123    | Medicine dispensing & inventory |
| Drug Supplier | supplier   | supply123    | Purchase orders & deliveries    |

## Test Scenarios

### Scenario 1: Complete Patient Care Workflow

#### 1.1 Patient Registration (Data Clerk)

**Login as:** Data Clerk (clerk/clerk123)

**Test Steps:**

1. Navigate to Patient Registration
2. Register a new patient with complete information
3. Verify patient appears in patient records
4. Test patient search functionality

**Expected Results:**

- Patient successfully registered with unique ID
- Patient data properly stored and retrievable
- Search functionality works correctly

#### 1.2 Patient Diagnosis (Physician)

**Login as:** Physician (physician/physician123)

**Test Steps:**

1. Access patient records
2. Select existing patient (e.g., Abebe Kebede - PAT001)
3. Record diagnosis with symptoms and vital signs
4. Create prescription with multiple medicines
5. Verify prescription is saved

**Expected Results:**

- Diagnosis properly recorded with all details
- Prescription created with correct medicines and dosages
- Prescription appears in pending prescriptions list

#### 1.3 Medicine Dispensing (Pharmacist)

**Login as:** Pharmacist (pharmacist/pharma123)

**Test Steps:**

1. View pending prescriptions
2. Select prescription RX009 (Malaria treatment)
3. Verify medicine availability in stock
4. Dispense medicines and update stock
5. Generate invoice for patient

**Expected Results:**

- Stock levels automatically updated after dispensing
- Invoice generated with correct calculations
- Prescription status changed to "Dispensed"

#### 1.4 Payment Processing (Data Clerk)

**Login as:** Data Clerk (clerk/clerk123)

**Test Steps:**

1. Access billing section
2. Process payment for generated invoice
3. Select payment method (Cash/Card/Insurance)
4. Complete payment transaction
5. Generate receipt

**Expected Results:**

- Payment recorded successfully
- Invoice status updated to "Paid"
- Receipt generated with transaction details

### Scenario 2: Inventory Management Workflow

#### 2.1 Stock Monitoring (Pharmacist)

**Login as:** Pharmacist (pharmacist/pharma123)

**Test Steps:**

1. Check current stock levels
2. Identify low stock items (below reorder level)
3. Review expiring medicines
4. Generate stock reports

**Expected Results:**

- Low stock items clearly identified
- Expiry alerts properly displayed
- Stock reports generated accurately

#### 2.2 Purchase Order Creation (Pharmacist)

**Login as:** Pharmacist (pharmacist/pharma123)

**Test Steps:**

1. Create new purchase order
2. Select supplier from list
3. Add medicines to order based on stock needs
4. Calculate total order value
5. Submit order for approval

**Expected Results:**

- Purchase order created with correct details
- Order total calculated accurately
- Order status set to "Pending"

#### 2.3 Order Confirmation (Drug Supplier)

**Login as:** Drug Supplier (supplier/supply123)

**Test Steps:**

1. View pending purchase orders
2. Confirm availability of requested medicines
3. Update order status to "Confirmed"
4. Set expected delivery date

**Expected Results:**

- Order status updated successfully
- Delivery date recorded
- Notification sent to pharmacy

#### 2.4 Stock Receipt (Pharmacist)

**Login as:** Pharmacist (pharmacist/pharma123)

**Test Steps:**

1. Receive delivered medicines
2. Record batch numbers and expiry dates
3. Update stock inventory
4. Verify stock levels increased

**Expected Results:**

- Stock levels updated correctly
- Batch tracking information recorded
- Expiry dates monitored

### Scenario 3: Reporting and Analytics

#### 3.1 Administrative Reports (Admin)

**Login as:** Admin (admin/admin123)

**Test Steps:**

1. Generate system overview reports
2. View user activity logs
3. Check system performance metrics
4. Export data for analysis

**Expected Results:**

- Comprehensive system reports generated
- User activities properly logged
- Performance metrics accurate

#### 3.2 Clinical Reports (Physician)

**Login as:** Physician (physician/physician123)

**Test Steps:**

1. Generate prescription reports
2. View patient diagnosis trends
3. Check medicine usage patterns
4. Export clinical data

**Expected Results:**

- Clinical reports accurately reflect data
- Trends properly identified
- Data export successful

#### 3.3 Financial Reports (Data Clerk)

**Login as:** Data Clerk (clerk/clerk123)

**Test Steps:**

1. Generate daily sales reports
2. View payment method analysis
3. Check outstanding invoices
4. Calculate revenue metrics

**Expected Results:**

- Financial reports accurate
- Payment analysis correct
- Revenue calculations proper

### Scenario 4: Role-Based Access Control Testing

#### 4.1 Access Restriction Testing

**Test Steps:**

1. Login with each role
2. Attempt to access unauthorized pages
3. Verify proper redirections
4. Test menu item visibility

**Expected Results:**

- Unauthorized access properly blocked
- Users redirected to appropriate pages
- Menu items filtered by role

#### 4.2 Feature Restriction Testing

**Test Steps:**

1. Test edit/delete permissions
2. Verify data visibility restrictions
3. Check report access limitations
4. Test administrative functions

**Expected Results:**

- Edit/delete buttons hidden for unauthorized users
- Data properly filtered by role
- Reports show only authorized information
- Admin functions restricted to admin users

## Test Data Overview

### Patients (10 records)

- Complete patient profiles with medical history
- Various demographics and conditions
- Emergency contacts and allergy information

### Medicines (25 records)

- Comprehensive medicine catalog
- Multiple categories and types
- Realistic pricing and stock levels

### Prescriptions (10 records)

- Various medical conditions
- Multiple medicines per prescription
- Different prescription statuses

### Suppliers (5 records)

- Local and international suppliers
- Complete contact information
- Active supplier relationships

### Financial Transactions

- 10 invoices with various payment methods
- 8 completed payments
- 2 pending payments for testing

### Inventory Tracking

- Stock receiving records
- Dispensing history
- Expiry date monitoring
- Low stock alerts

## Performance Testing

### Load Testing Scenarios

1. **Concurrent User Access**
   - Multiple users accessing different modules
   - Simultaneous prescription processing
   - Concurrent stock updates

2. **Data Volume Testing**
   - Large patient databases
   - Extensive medicine catalogs
   - High-volume transaction processing

3. **Report Generation**
   - Complex report queries
   - Large dataset exports
   - Real-time analytics

## Security Testing

### Authentication Testing

1. **Login Security**
   - Password validation
   - Session management
   - Failed login attempts

2. **Authorization Testing**
   - Role-based access control
   - Permission verification
   - Data access restrictions

### Data Security

1. **Data Validation**
   - Input sanitization
   - SQL injection prevention
   - XSS protection

2. **Data Privacy**
   - Patient information protection
   - Medical record confidentiality
   - Audit trail maintenance

## Integration Testing

### API Integration

1. **Frontend-Backend Communication**
   - API endpoint testing
   - Data synchronization
   - Error handling

2. **Database Integration**
   - Data consistency
   - Transaction integrity
   - Backup and recovery

### Third-Party Integration

1. **Payment Processing**
   - Multiple payment methods
   - Transaction verification
   - Error handling

2. **Reporting Systems**
   - Data export formats
   - External system integration
   - Real-time data feeds

## Troubleshooting Common Issues

### Database Connection Issues

```bash
# Check database status
mysql -u root -p -e "SHOW DATABASES;"

# Verify connection settings
cat api/.env
```

### API Server Issues

```bash
# Check server logs
cd api && npm start

# Verify port availability
netstat -an | grep 5000
```

### Frontend Issues

```bash
# Clear cache and restart
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Success Criteria

### Functional Requirements

- ✅ All user roles can access appropriate features
- ✅ Complete patient care workflow functions properly
- ✅ Inventory management works accurately
- ✅ Financial transactions process correctly
- ✅ Reports generate accurate data

### Performance Requirements

- ✅ Page load times under 3 seconds
- ✅ API response times under 1 second
- ✅ Database queries optimized
- ✅ Concurrent user support

### Security Requirements

- ✅ Role-based access control enforced
- ✅ Data validation implemented
- ✅ Audit trails maintained
- ✅ Patient data protected

## Next Steps

1. **Production Deployment**
   - Environment configuration
   - Security hardening
   - Performance optimization

2. **User Training**
   - Role-specific training materials
   - System documentation
   - Support procedures

3. **Maintenance**
   - Regular backups
   - System monitoring
   - Update procedures
