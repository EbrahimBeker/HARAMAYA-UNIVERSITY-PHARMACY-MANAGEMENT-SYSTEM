oduction** environment

---

## Document Status
- **Version**: 1.0
- **Date**: February 15, 2026
- **Status**: Complete Professional Redesign
- **Suitable For**: University Final Year Project
 Quality
- ✅ Consistent naming conventions
- ✅ Error handling throughout
- ✅ Logging for debugging
- ✅ API versioning ready
- ✅ Environment-based configuration

---

## 7. NEXT STEPS FOR IMPLEMENTATION

1. **Review this document** with your team/advisor
2. **Implement database schema** (see DATABASE_SCHEMA.sql)
3. **Create API endpoints** (see API_ENDPOINTS.md)
4. **Implement authentication** (see AUTH_IMPLEMENTATION.md)
5. **Build frontend pages** per actor role
6. **Test each module** thoroughly
7. **Deploy to pr Indexed columns for performance

### 6.3 MVC Architecture
- ✅ Clear separation: Routes → Controllers → Database
- ✅ Middleware for cross-cutting concerns
- ✅ Reusable validation and error handling
- ✅ Modular and scalable structure

### 6.4 Security Enhancements
- ✅ JWT-based authentication
- ✅ Role-based authorization
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Helmet for HTTP security headers

### 6.5 Codeot package.json
```

---

## 6. KEY IMPROVEMENTS IMPLEMENTED

### 6.1 Proper Actor Modeling
- ✅ Removed incorrect "Login includes all use cases" pattern
- ✅ Each actor has direct relationships with their use cases
- ✅ Authentication handled as middleware, not as parent use case
- ✅ Clear separation of responsibilities per actor

### 6.2 Database Normalization
- ✅ 3rd Normal Form achieved
- ✅ Proper foreign key relationships
- ✅ Junction tables for many-to-many relationships
- ✅ Timestamps and soft deletes
- ✅seed.sql                           # Sample data
│   └── migrations/                        # Migration scripts
│
├── docs/                                  # Documentation
│   ├── API_DOCUMENTATION.md               # API endpoints
│   ├── USER_MANUAL.md                     # User guide
│   └── DEPLOYMENT.md                      # Deployment guide
│
├── .gitignore                             # Git ignore
├── README.md                              # Project overview
└── package.json                           # Ro   │   │
│   │   ├── App.jsx                        # Root component
│   │   ├── main.jsx                       # Entry point
│   │   └── index.css                      # Global styles
│   │
│   ├── .env                               # Environment variables
│   ├── package.json                       # Dependencies
│   └── vite.config.js                     # Vite configuration
│
├── database/                              # Database scripts
│   ├── schema.sql                         # Complete schema
│   ├──                # React Context
│   │   │   └── AuthContext.jsx            # Authentication context
│   │   │
│   │   ├── hooks/                         # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   └── useFetch.js
│   │   │
│   │   ├── services/                      # API services
│   │   │   └── api.js                     # Axios configuration
│   │   │
│   │   ├── utils/                         # Utility functions
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│  │   │   │   └── DeliveryTracking.jsx
│   │   │   │
│   │   │   ├── Patient/                   # Patient portal pages
│   │   │   │   ├── MyPrescriptions.jsx
│   │   │   │   └── MyBilling.jsx
│   │   │   │
│   │   │   ├── Cashier/                   # Cashier pages
│   │   │   │   ├── Billing.jsx
│   │   │   │   ├── PaymentProcessing.jsx
│   │   │   │   └── SalesReports.jsx
│   │   │   │
│   │   │   └── Login/                     # Authentication
│   │   │       └── Login.jsx
│   │   │
│   │   ├── context/         │   │
│   │   │   ├── Receptionist/              # Receptionist pages
│   │   │   │   ├── PatientRegistration.jsx
│   │   │   │   └── PatientSearch.jsx
│   │   │   │
│   │   │   ├── Inventory/                 # Inventory Manager pages
│   │   │   │   ├── InventoryDashboard.jsx
│   │   │   │   ├── PurchaseOrders.jsx
│   │   │   │   ├── ExpiryTracking.jsx
│   │   │   │   └── InventoryReports.jsx
│   │   │   │
│   │   │   ├── Supplier/                  # Supplier pages
│   │   │   │   ├── OrderManagement.jsx
│ strator pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   └── SystemReports.jsx
│   │   │   │
│   │   │   ├── Physician/                 # Physician pages
│   │   │   │   ├── PatientRegistration.jsx
│   │   │   │   ├── Diagnosis.jsx
│   │   │   │   └── CreatePrescription.jsx
│   │   │   │
│   │   │   ├── Pharmacist/                # Pharmacist pages
│   │   │   │   ├── ViewPrescriptions.jsx
│   │   │   │   ├── DispenseDrug.jsx
│   │   │   │   └── StockCheck.jsx
│   │    │   │   │   └── Loading.jsx
│   │   │   │
│   │   │   ├── Layout/                    # Layout components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   │
│   │   │   └── Forms/                     # Form components
│   │   │       ├── PatientForm.jsx
│   │   │       ├── PrescriptionForm.jsx
│   │   │       └── MedicineForm.jsx
│   │   │
│   │   ├── pages/                         # Page components
│   │   │   ├── Admin/                     # Admini                  # Dependencies
│   └── server.js                          # Entry point
│
├── frontend/                              # Frontend (React)
│   ├── public/                            # Static assets
│   │   └── index.html                     # HTML template
│   │
│   ├── src/
│   │   ├── components/                    # Reusable components
│   │   │   ├── Common/                    # Common components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│ js                    # /api/payments/*
│   │   └── reports.js                     # /api/reports/*
│   │
│   ├── utils/                             # Utility functions
│   │   ├── validation.js                  # Validation helpers
│   │   ├── dateHelper.js                  # Date utilities
│   │   └── reportGenerator.js             # Report utilities
│   │
│   ├── .env                               # Environment variables
│   ├── .gitignore                         # Git ignore file
│   ├── package.json     ├── inventory.js                   # /api/inventory/*
│   │   ├── suppliers.js                   # /api/suppliers/*
│   │   ├── cashiers.js                    # /api/cashiers/*
│   │   ├── medicines.js                   # /api/medicines/*
│   │   ├── prescriptions.js               # /api/prescriptions/*
│   │   ├── diagnoses.js                   # /api/diagnoses/*
│   │   ├── purchaseOrders.js              # /api/purchase-orders/*
│   │   ├── invoices.js                    # /api/invoices/*
│   │   ├── payments.cription model
│   │   └── ...                            # Other models
│   │
│   ├── routes/                            # API routes
│   │   ├── auth.js                        # /api/auth/*
│   │   ├── users.js                       # /api/users/*
│   │   ├── patients.js                    # /api/patients/*
│   │   ├── physicians.js                  # /api/physicians/*
│   │   ├── pharmacists.js                 # /api/pharmacists/*
│   │   ├── receptionists.js               # /api/receptionists/*
│   │   ased authorization
│   │   ├── validator.js                   # Input validation
│   │   ├── errorHandler.js                # Global error handler
│   │   └── logger.js                      # Request logging
│   │
│   ├── models/                            # Data access layer (optional)
│   │   ├── User.js                        # User model
│   │   ├── Patient.js                     # Patient model
│   │   ├── Medicine.js                    # Medicine model
│   │   ├── Prescription.js                # Presmanagement
│   │   ├── diagnosisController.js         # Diagnosis records
│   │   ├── purchaseOrderController.js     # Purchase orders
│   │   ├── invoiceController.js           # Invoice generation
│   │   ├── paymentController.js           # Payment processing
│   │   └── reportController.js            # Report generation
│   │
│   ├── middleware/                        # Middleware functions
│   │   ├── auth.js                        # JWT authentication
│   │   ├── authorize.js                   # Role-b   │   ├── physicianController.js         # Physician operations
│   │   ├── pharmacistController.js        # Pharmacist operations
│   │   ├── receptionistController.js      # Receptionist operations
│   │   ├── inventoryController.js         # Inventory management
│   │   ├── supplierController.js          # Supplier operations
│   │   ├── cashierController.js           # Cashier operations
│   │   ├── medicineController.js          # Medicine CRUD
│   │   ├── prescriptionController.js      # Prescription /                            # Configuration files
│   │   ├── database.js                    # MySQL connection pool
│   │   ├── initDatabase.js                # Database initialization
│   │   └── jwt.js                         # JWT configuration
│   │
│   ├── controllers/                       # Business logic layer
│   │   ├── authController.js              # Authentication logic
│   │   ├── userController.js              # User management
│   │   ├── patientController.js           # Patient management
│
┌─────────────┐         ┌─────────────┐
│ STOCK_IN    │         │PURCHASE_    │
│ STOCK_OUT   │         │ORDER_ITEMS  │
└─────────────┘         └─────────────┘
```

### 4.2 Normalization Level
- **3rd Normal Form (3NF)** achieved
- No transitive dependencies
- All non-key attributes depend only on primary key
- Junction tables for many-to-many relationships

---

## 5. MVC FOLDER STRUCTURE

```
pharmacy-management-system/
│
├── api/                                    # Backend (Node.js + Express)
│   ├── config │
└─────────────┘         │   _ITEMS    │         └─────────────┘
      │                 └─────────────┘               │
      │                                               ▼
      ▼                                         ┌─────────────┐
┌─────────────┐         ┌─────────────┐        │  PAYMENTS   │
│STOCK_       │         │PURCHASE_    │        └─────────────┘
│INVENTORY    │         │ORDERS       │
└─────────────┘         └─────────────┘
      │                       │
      ▼                       ▼                        
      ▼                                                 
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  PATIENTS   │────────▶│ DIAGNOSES   │────────▶│PRESCRIPTIONS│
└─────────────┘         └─────────────┘         └─────────────┘
                                                        │
                                                        ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  MEDICINES  │◀────────│PRESCRIPTION │         │   INVOICES    2. System generates sales report
     3. Cashier reviews transactions
     4. Cashier exports report
   - **Postcondition**: Sales report viewed

---

## 4. DATABASE DESIGN (NORMALIZED)

### 4.1 Entity-Relationship Diagram Structure

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    USERS    │────────▶│ USER_ROLES  │◀────────│    ROLES    │
└─────────────┘         └─────────────┘         └─────────────┘
      │                                                 
      │                         . System validates payment
     4. System records transaction
   - **Postcondition**: Payment received

3. **Print Receipt**
   - **Actor**: Cashier
   - **Precondition**: Payment is received
   - **Main Flow**:
     1. System generates receipt
     2. Cashier prints receipt
     3. Cashier gives receipt to patient
   - **Postcondition**: Receipt printed

4. **View Sales Report**
   - **Actor**: Cashier
   - **Precondition**: Cashier is authenticated
   - **Main Flow**:
     1. Cashier selects date range
   CASES
1. **Generate Invoice**
   - **Actor**: Cashier
   - **Precondition**: Prescription is dispensed
   - **Main Flow**:
     1. Cashier selects prescription
     2. System calculates total cost
     3. System generates invoice
     4. Cashier presents invoice to patient
   - **Postcondition**: Invoice generated

2. **Receive Payment**
   - **Actor**: Cashier
   - **Precondition**: Invoice is generated
   - **Main Flow**:
     1. Cashier selects payment method
     2. Cashier enters payment amount
     3: Patient is authenticated
   - **Main Flow**:
     1. Patient logs into portal
     2. System displays patient's prescriptions
     3. Patient views prescription details
   - **Postcondition**: Prescription viewed

2. **View Billing Details**
   - **Actor**: Patient
   - **Precondition**: Patient is authenticated
   - **Main Flow**:
     1. Patient accesses billing section
     2. System displays invoices
     3. Patient views payment history
   - **Postcondition**: Billing information viewed

#### CASHIER USE System notifies Inventory Manager
   - **Postcondition**: Order confirmed

3. **Deliver Drugs**
   - **Actor**: Supplier
   - **Precondition**: Order is approved
   - **Main Flow**:
     1. Supplier prepares delivery
     2. Supplier enters batch numbers
     3. Supplier enters expiry dates
     4. Supplier marks as delivered
     5. System updates inventory
   - **Postcondition**: Drugs delivered, inventory updated

#### PATIENT USE CASES
1. **View Prescription**
   - **Actor**: Patient
   - **Precondition****: Supplier
   - **Precondition**: Supplier is authenticated
   - **Main Flow**:
     1. System notifies supplier of new order
     2. Supplier views order details
     3. Supplier reviews requested items
   - **Postcondition**: Order received

2. **Confirm Order**
   - **Actor**: Supplier
   - **Precondition**: Purchase order received
   - **Main Flow**:
     1. Supplier checks availability
     2. Supplier confirms quantities
     3. Supplier sets delivery date
     4. Supplier submits confirmation
     5.oves/rejects order
     4. System notifies supplier
   - **Postcondition**: Order approved/rejected

5. **Generate Inventory Report**
   - **Actor**: Inventory Manager
   - **Precondition**: Inventory Manager is authenticated
   - **Main Flow**:
     1. Inventory Manager selects report type
     2. Inventory Manager sets parameters
     3. System generates report
     4. Inventory Manager exports report
   - **Postcondition**: Report generated

#### SUPPLIER USE CASES
1. **Receive Purchase Order**
   - **Actor is authenticated
   - **Main Flow**:
     1. System displays drugs near expiry
     2. Inventory Manager reviews list
     3. Inventory Manager marks expired drugs
     4. System removes from available stock
   - **Postcondition**: Expired drugs tracked

4. **Approve Supplier Orders**
   - **Actor**: Inventory Manager
   - **Precondition**: Supplier has confirmed order
   - **Main Flow**:
     1. Inventory Manager reviews order details
     2. Inventory Manager verifies pricing
     3. Inventory Manager apprstem sends order to supplier
   - **Postcondition**: Purchase order created

2. **Manage Inventory**
   - **Actor**: Inventory Manager
   - **Precondition**: Inventory Manager is authenticated
   - **Main Flow**:
     1. Inventory Manager views inventory
     2. Inventory Manager can add/update/remove items
     3. System validates changes
     4. System updates inventory
   - **Postcondition**: Inventory updated

3. **Track Drug Expiry**
   - **Actor**: Inventory Manager
   - **Precondition**: Inventory Manager. System searches database
     3. System displays matching patients
     4. Receptionist selects patient
   - **Postcondition**: Patient record retrieved

#### INVENTORY MANAGER USE CASES
1. **Create Purchase Order**
   - **Actor**: Inventory Manager
   - **Precondition**: Inventory Manager is authenticated
   - **Main Flow**:
     1. Inventory Manager selects supplier
     2. Inventory Manager adds medicines to order
     3. Inventory Manager specifies quantities
     4. System calculates total
     5. Sytient registered

2. **Update Patient Information**
   - **Actor**: Receptionist
   - **Precondition**: Patient exists
   - **Main Flow**:
     1. Receptionist searches patient
     2. Receptionist updates information
     3. System validates changes
     4. System saves updates
   - **Postcondition**: Patient information updated

3. **Search Patient Records**
   - **Actor**: Receptionist
   - **Precondition**: Receptionist is authenticated
   - **Main Flow**:
     1. Receptionist enters search criteria
     2stem calculates new stock level
     2. System updates inventory
     3. System logs transaction
   - **Postcondition**: Stock updated

#### RECEPTIONIST USE CASES
1. **Register Patient**
   - **Actor**: Receptionist
   - **Precondition**: Receptionist is authenticated
   - **Main Flow**:
     1. Receptionist collects patient information
     2. Receptionist enters data into system
     3. System validates information
     4. System generates patient ID
     5. System prints patient card
   - **Postcondition**: Pandition**: Drug dispensed, stock updated
   - **Includes**: Check Drug Availability, Update Drug Stock

3. **Check Drug Availability**
   - **Actor**: Pharmacist
   - **Precondition**: Pharmacist is authenticated
   - **Main Flow**:
     1. Pharmacist searches drug
     2. System displays stock quantity
     3. System shows expiry information
   - **Postcondition**: Availability checked

4. **Update Drug Stock**
   - **Actor**: Pharmacist
   - **Precondition**: Stock transaction occurs
   - **Main Flow**:
     1. SyMain Flow**:
     1. Pharmacist searches prescription
     2. System displays prescription details
     3. Pharmacist verifies prescription validity
   - **Postcondition**: Prescription viewed

2. **Dispense Drug**
   - **Actor**: Pharmacist
   - **Precondition**: Prescription is valid
   - **Main Flow**:
     1. Pharmacist selects prescription
     2. System checks drug availability
     3. Pharmacist confirms dispensing
     4. System updates stock
     5. System marks prescription as dispensed
   - **Postcoescription
   - **Postcondition**: Prescription created
   - **Includes**: Check Drug Availability

4. **View Patient History**
   - **Actor**: Physician
   - **Precondition**: Patient exists
   - **Main Flow**:
     1. Physician searches patient
     2. System displays medical history
     3. Physician reviews diagnoses and prescriptions
   - **Postcondition**: History viewed

#### PHARMACIST USE CASES
1. **View Prescription**
   - **Actor**: Pharmacist
   - **Precondition**: Pharmacist is authenticated
   - **Main Flow**:
     1. Physician searches for patient
     2. Physician records symptoms and vital signs
     3. Physician enters diagnosis
     4. System saves diagnosis record
   - **Postcondition**: Diagnosis recorded

3. **Create Prescription**
   - **Actor**: Physician
   - **Precondition**: Patient is diagnosed
   - **Main Flow**:
     1. Physician selects medicines
     2. Physician specifies dosage and duration
     3. Physician adds instructions
     4. System validates prescription
     5. System saves pr confirms backup success
   - **Postcondition**: Database backed up

#### PHYSICIAN USE CASES
1. **Register Patient**
   - **Actor**: Physician
   - **Precondition**: Physician is authenticated
   - **Main Flow**:
     1. Physician enters patient details
     2. System validates information
     3. System generates patient ID
     4. System saves patient record
   - **Postcondition**: New patient registered

2. **Diagnose Patient**
   - **Actor**: Physician
   - **Precondition**: Patient is registered
   - **ion**: Administrator is authenticated
   - **Main Flow**:
     1. Administrator selects report type
     2. Administrator sets date range and filters
     3. System generates report
     4. Administrator can export report
   - **Postcondition**: Report generated

5. **Backup Database**
   - **Actor**: Administrator
   - **Precondition**: Administrator is authenticated
   - **Main Flow**:
     1. Administrator initiates backup
     2. System creates database backup
     3. System stores backup file
     4. System System updates user permissions
   - **Postcondition**: User role assignments updated

3. **Manage Drug Categories**
   - **Actor**: Administrator
   - **Precondition**: Administrator is authenticated
   - **Main Flow**:
     1. Administrator accesses category management
     2. System displays categories
     3. Administrator adds/edits/deletes categories
     4. System validates and saves
   - **Postcondition**: Categories updated

4. **View System Reports**
   - **Actor**: Administrator
   - **Preconditdministrator is authenticated
   - **Main Flow**:
     1. Administrator selects user management
     2. System displays user list
     3. Administrator can add/edit/delete/deactivate users
     4. System validates and saves changes
   - **Postcondition**: User data is updated

2. **Assign Roles**
   - **Actor**: Administrator
   - **Precondition**: User exists in system
   - **Main Flow**:
     1. Administrator selects user
     2. System displays available roles
     3. Administrator assigns/revokes roles
     4. Diagram Principles Applied
- **NO improper includes**: Login is NOT a parent use case
- **Direct actor-to-use-case relationships**: Each actor directly connects to their use cases
- **Proper <<include>> usage**: Only for mandatory sub-functionality
- **Proper <<extend>> usage**: Only for optional extensions
- **Authentication**: Handled as a cross-cutting concern via middleware

### 3.2 Use Cases by Actor

#### ADMINISTRATOR USE CASES
1. **Manage Users**
   - **Actor**: Administrator
   - **Precondition**: A
**Responsibilities**: View personal medical information
- View own prescriptions
- View billing details
- View medical history
- Update contact information
- Request prescription refills

### 2.8 Cashier
**Responsibilities**: Financial transactions and billing
- Generate invoices for prescriptions
- Receive payments (cash/card/insurance)
- Print receipts
- Process refunds
- View sales reports
- Generate daily cash reports
- Reconcile cash drawer

---

## 3. CORRECTED UML USE CASE DESCRIPTIONS

### 3.1 Use Case
- Create purchase orders
- Manage drug inventory (add/update/remove)
- Track drug expiry dates
- Approve supplier orders
- Receive stock deliveries
- Conduct stock audits
- Generate inventory reports
- Set reorder levels
- Monitor low stock alerts

### 2.6 Supplier
**Responsibilities**: Order fulfillment and drug delivery
- Receive purchase orders
- Confirm order availability
- Set delivery dates
- Update order status
- Deliver drugs with batch information
- View order history
- Submit invoices

### 2.7 Patientugs to patients
- Check drug availability and stock levels
- Update stock after dispensing
- Record drug interactions/warnings
- Generate dispensing reports

### 2.4 Receptionist
**Responsibilities**: Patient registration and front desk operations
- Register new patients
- Update patient information
- Search and retrieve patient records
- Schedule appointments
- Manage patient queue
- Print patient cards
- Handle patient inquiries

### 2.5 Inventory Manager
**Responsibilities**: Stock and inventory managementkup and restore database
- Monitor system activity logs

### 2.2 Physician
**Responsibilities**: Patient diagnosis and prescription
- Login to system
- Register new patients
- Diagnose patients (record symptoms, vital signs)
- Create prescriptions with multiple medicines
- View patient medical history
- Update diagnosis records
- Search patient records

### 2.3 Pharmacist
**Responsibilities**: Prescription fulfillment and drug dispensing
- View pending prescriptions
- Verify prescription validity
- Dispense dr                         │
│              Normalized Relational Schema                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. SYSTEM ACTORS (CORRECTED)

The system has **8 primary actors** with distinct responsibilities:

### 2.1 Administrator
**Responsibilities**: System-wide management and configuration
- Manage all users (CRUD operations)
- Assign and revoke roles
- Manage drug categories and types
- View comprehensive system reports
- Configure system settings
- Bac┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │→ │ Controllers  │→ │  Middleware  │      │
│  │  (Routing)   │  │  (Business)  │  │ (Auth/Valid) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
┌──────────────────────▼──────────────────────────────────────┐
│                       DATA LAYER                             │
│                    (MySQL Database) React Frontend - SPA)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
┌──────────────────────▼──────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│                  (Express.js - Node.js)                      │
│  L 8.0+
- **Frontend**: React 18+ with Vite
- **Authentication**: JWT (JSON Web Tokens)
- **API Design**: RESTful principles
- **Security**: bcrypt for password hashing, helmet for HTTP headers

### Architecture Pattern
```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│                    (
This document provides a complete professional redesign of the Haramaya University Pharmacy Management System according to software engineering best practices and proper UML modeling principles.

---

## 1. SYSTEM ARCHITECTURE

### Technology Stack
- **Backend**: Node.js with Express.js (MVC Architecture)
- **Database**: MySQ - Professional Redesign

## Document Overview Pharmacy Management System# Web-Based