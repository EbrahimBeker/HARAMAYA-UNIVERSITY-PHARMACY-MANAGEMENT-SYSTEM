# Entity-Relationship Diagram Structure

## Overview
This document describes the complete ER diagram structure for the Pharmacy Management System database.

---

## 1. ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER MANAGEMENT                                  │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │    ROLES     │         │  USER_ROLES  │         │    USERS     │
    │──────────────│         │──────────────│         │──────────────│
    │ PK id        │◄───────┤│ PK id        │├───────►│ PK id        │
    │    name      │         │ FK user_id   │         │    username  │
    │    created_at│         │ FK role_id   │         │    email     │
    │    updated_at│         │    assigned_at│         │    password  │
    └──────────────┘         │ FK assigned_by│         │    first_name│
                             └──────────────┘         │    last_name │
                                                      │    phone     │
                                                      │    is_active │
                                                      │    created_at│
                                                      │    updated_at│
                                                      │    deleted_at│
                                                      └──────────────┘
                                                            │
                                                            │ registered_by
                                                            ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                      PATIENT MANAGEMENT                                  │
└─────────────────────────────────────────────────────────────────────────┘

                                                      ┌──────────────┐
                                                      │   PATIENTS   │
                                                      │──────────────│
                                                      │ PK id        │
                                                      │    patient_id│
                                                      │    first_name│
                                                      │    last_name │
                                                      │    dob       │
                                                      │    gender    │
                                                      │    phone     │
                                                      │    email     │
                                                      │    address   │
                                                      │    emergency │
                                                      │    blood_grp │
                                                      │    allergies │
                                                      │ FK registered│
                                                      │    created_at│
                                                      │    updated_at│
                                                      │    deleted_at│
                                                      └──────────────┘
                                                            │
                                                            │ patient_id
                                                            ▼
                                                      ┌──────────────┐
                                                      │  DIAGNOSES   │
                                                      │──────────────│
                                                      │ PK id        │
                                                      │ FK patient_id│
                                                      │ FK physician │
                                                      │    diag_date │
                                                      │    symptoms  │
                                                      │    vital_sign│
                                                      │    diagnosis │
                                                      │    notes     │
                                                      │    created_at│
                                                      │    updated_at│
                                                      └──────────────┘
                                                            │
                                                            │ diagnosis_id
                                                            ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                    PRESCRIPTION MANAGEMENT                               │
└─────────────────────────────────────────────────────────────────────────┘

                                                      ┌──────────────┐
                                                      │PRESCRIPTIONS │
                                                      │──────────────│
                                                      │ PK id        │
                                                      │    presc_num │
                                                      │ FK patient_id│
                                                      │ FK diagnosis │
                                                      │ FK physician │
                                                      │    presc_date│
                                                      │    status    │
                                                      │    notes     │
                                                      │ FK dispensed │
                                                      │    disp_at   │
                                                      │    created_at│
                                                      │    updated_at│
                                                      └──────────────┘
                                                            │
                                                            │ prescription_id
                                                            ▼
                                                      ┌──────────────┐
                                                      │PRESCRIPTION_ │
                                                      │    ITEMS     │
                                                      │──────────────│
                                                      │ PK id        │
                                                      │ FK presc_id  │
                                                      │ FK medicine  │
                                                      │    quantity  │
                                                      │    dosage    │
                                                      │    frequency │
                                                      │    duration  │
                                                      │    instruct  │
                                                      │    created_at│
                                                      └──────────────┘
                                                            │
                                                            │ medicine_id
                                                            ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                      MEDICINE MANAGEMENT                                 │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │  MEDICINE_   │         │  MEDICINES   │         │  MEDICINE_   │
    │  CATEGORIES  │         │──────────────│         │    TYPES     │
    │──────────────│         │ PK id        │         │──────────────│
    │ PK id        │◄───────┤│    name      │├───────►│ PK id        │
    │    name      │         │    generic   │         │    name      │
    │    created_at│         │ FK category  │         │    created_at│
    │    updated_at│         │ FK type      │         │    updated_at│
    │    deleted_at│         │    strength  │         │    deleted_at│
    └──────────────┘         │    unit      │         └──────────────┘
                             │    reorder   │
                             │    unit_price│
                             │    req_presc │
                             │    created_at│
                             │    updated_at│
                             │    deleted_at│
                             └──────────────┘
                                    │
                                    │ medicine_id
                                    ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                     INVENTORY MANAGEMENT                                 │
└─────────────────────────────────────────────────────────────────────────┘

                             ┌──────────────┐
                             │   STOCK_     │
                             │  INVENTORY   │
                             │──────────────│
                             │ PK id        │
                             │ FK medicine  │
                             │    qty_avail │
                             │    last_upd  │
                             └──────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │   STOCK_IN   │ │  STOCK_OUT   │ │   EXPIRY_    │
            │──────────────│ │──────────────│ │  TRACKING    │
            │ PK id        │ │ PK id        │ │──────────────│
            │ FK medicine  │ │ FK medicine  │ │ PK id        │
            │ FK supplier  │ │    batch_num │ │ FK medicine  │
            │ FK purchase  │ │    quantity  │ │    batch_num │
            │    batch_num │ │    reason    │ │    qty_remain│
            │    quantity  │ │    reference │ │    expiry_dt │
            │    unit_cost │ │ FK processed │ │    alert_stat│
            │    mfg_date  │ │    proc_date │ │    last_check│
            │    exp_date  │ │    notes     │ └──────────────┘
            │ FK received  │ │    created_at│
            │    recv_date │ └──────────────┘
            │    notes     │
            │    created_at│
            │    updated_at│
            └──────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    PURCHASE ORDER MANAGEMENT                             │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │  SUPPLIERS   │         │  PURCHASE_   │         │  PURCHASE_   │
    │──────────────│         │   ORDERS     │         │  ORDER_ITEMS │
    │ PK id        │◄───────┤│──────────────│├───────►│──────────────│
    │    name      │         │ PK id        │         │ PK id        │
    │    contact   │         │    order_num │         │ FK po_id     │
    │    email     │         │ FK supplier  │         │ FK medicine  │
    │    phone     │         │    order_date│         │    qty_order │
    │    address   │         │    status    │         │    unit_cost │
    │    is_active │         │    total_amt │         │    total_cost│
    │    created_at│         │    exp_deliv │         │    created_at│
    │    updated_at│         │    act_deliv │         └──────────────┘
    │    deleted_at│         │ FK created_by│
    └──────────────┘         │ FK approved  │
                             │    notes     │
                             │    created_at│
                             │    updated_at│
                             └──────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    BILLING & PAYMENT MANAGEMENT                          │
└─────────────────────────────────────────────────────────────────────────┘

                             ┌──────────────┐
                             │   INVOICES   │
                             │──────────────│
                             │ PK id        │
                             │    inv_num   │
                             │ FK patient   │
                             │ FK presc     │
                             │    inv_date  │
                             │    subtotal  │
                             │    discount  │
                             │    tax       │
                             │    total_amt │
                             │    status    │
                             │ FK generated │
                             │    created_at│
                             │    updated_at│
                             └──────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐
            │   INVOICE_   │ │   PAYMENTS   │
            │    ITEMS     │ │──────────────│
            │──────────────│ │ PK id        │
            │ PK id        │ │    pay_num   │
            │ FK invoice   │ │ FK invoice   │
            │ FK medicine  │ │    pay_date  │
            │    quantity  │ │    pay_method│
            │    unit_price│ │    amt_paid  │
            │    total_prc │ │    change    │
            │    created_at│ │ FK received  │
            └──────────────┘ │    notes     │
                             │    created_at│
                             └──────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    REPORTING & AUDIT                                     │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐                              ┌──────────────┐
    │   REPORTS    │                              │  AUDIT_LOG   │
    │──────────────│                              │──────────────│
    │ PK id        │                              │ PK id        │
    │    rep_type  │                              │ FK user_id   │
    │    rep_name  │                              │    action    │
    │    params    │                              │    table_name│
    │ FK generated │                              │    record_id │
    │    gen_at    │                              │    old_values│
    └──────────────┘                              │    new_values│
                                                  │    ip_address│
                                                  │    user_agent│
                                                  │    created_at│
                                                  └──────────────┘
```

---

## 2. RELATIONSHIP TYPES

### One-to-Many (1:N)
- Users → Patients (one user registers many patients)
- Patients → Diagnoses (one patient has many diagnoses)
- Patients → Prescriptions (one patient has many prescriptions)
- Prescriptions → Prescription Items (one prescription has many items)
- Medicines → Prescription Items (one medicine in many prescriptions)
- Suppliers → Purchase Orders (one supplier receives many orders)
- Purchase Orders → Purchase Order Items (one order has many items)
- Invoices → Invoice Items (one invoice has many items)
- Invoices → Payments (one invoice can have multiple payments)

### Many-to-Many (M:N)
- Users ↔ Roles (via user_roles junction table)
  - One user can have multiple roles
  - One role can be assigned to multiple users

### One-to-One (1:1)
- Medicines ↔ Stock Inventory (one medicine has one stock record)

---

## 3. KEY RELATIONSHIPS EXPLAINED

### User Management
```
USERS ──┬── registered_by ──→ PATIENTS
        ├── physician_id ───→ DIAGNOSES
        ├── physician_id ───→ PRESCRIPTIONS
        ├── dispensed_by ───→ PRESCRIPTIONS
        ├── created_by ─────→ PURCHASE_ORDERS
        ├── approved_by ────→ PURCHASE_ORDERS
        ├── received_by ────→ STOCK_IN
        ├── processed_by ───→ STOCK_OUT
        ├── generated_by ───→ INVOICES
        ├── received_by ────→ PAYMENTS
        └── generated_by ───→ REPORTS

ROLES ──── user_roles ──── USERS
```

### Patient Flow
```
PATIENTS ──→ DIAGNOSES ──→ PRESCRIPTIONS ──→ PRESCRIPTION_ITEMS
                                │
                                ├──→ INVOICES ──→ INVOICE_ITEMS
                                │                      │
                                │                      └──→ PAYMENTS
                                │
                                └──→ STOCK_OUT (when dispensed)
```

### Inventory Flow
```
SUPPLIERS ──→ PURCHASE_ORDERS ──→ PURCHASE_ORDER_ITEMS
                    │                       │
                    │                       ▼
                    └──────────────→ STOCK_IN ──→ STOCK_INVENTORY
                                                        │
                                                        ├──→ EXPIRY_TRACKING
                                                        └──→ STOCK_OUT
```

### Medicine Hierarchy
```
MEDICINE_CATEGORIES ──┐
                      ├──→ MEDICINES ──→ STOCK_INVENTORY
MEDICINE_TYPES ───────┘                      │
                                             ├──→ PRESCRIPTION_ITEMS
                                             ├──→ PURCHASE_ORDER_ITEMS
                                             ├──→ INVOICE_ITEMS
                                             ├──→ STOCK_IN
                                             ├──→ STOCK_OUT
                                             └──→ EXPIRY_TRACKING
```

---

## 4. CARDINALITY NOTATION

```
│  = One (mandatory)
├  = One (optional)
┤  = Many
◄  = Foreign Key reference
```

### Examples:
- `USERS ──│ registered_by ──→ PATIENTS` = One user registers many patients (mandatory)
- `PRESCRIPTIONS ──├ diagnosis_id ──→ DIAGNOSES` = One prescription may reference one diagnosis (optional)
- `MEDICINES ◄──┤ medicine_id ──── PRESCRIPTION_ITEMS` = Many prescription items reference one medicine

---

## 5. NORMALIZATION VERIFICATION

### First Normal Form (1NF)
✅ All attributes contain atomic values
✅ No repeating groups
✅ Each column has unique name

### Second Normal Form (2NF)
✅ Meets 1NF requirements
✅ No partial dependencies
✅ All non-key attributes depend on entire primary key

### Third Normal Form (3NF)
✅ Meets 2NF requirements
✅ No transitive dependencies
✅ All non-key attributes depend only on primary key

### Example of Normalization:

**Before (Denormalized)**:
```
PRESCRIPTION: id, patient_name, patient_phone, medicine_name, medicine_price, ...
```

**After (Normalized)**:
```
PATIENTS: id, name, phone, ...
MEDICINES: id, name, price, ...
PRESCRIPTIONS: id, patient_id (FK), ...
PRESCRIPTION_ITEMS: id, prescription_id (FK), medicine_id (FK), ...
```

---

## 6. REFERENTIAL INTEGRITY

### ON DELETE Actions:
- **CASCADE**: When parent deleted, delete children
  - Example: Delete user → Delete user_roles
- **SET NULL**: When parent deleted, set FK to NULL
  - Example: Delete diagnosis → Set prescription.diagnosis_id to NULL
- **RESTRICT**: Prevent deletion if children exist
  - Example: Cannot delete medicine if in prescriptions

### ON UPDATE Actions:
- **CASCADE**: When parent PK updated, update children FK
  - Applied to all foreign keys

---

## 7. INDEXES FOR PERFORMANCE

### Primary Keys (Automatic Index)
All `id` columns are indexed automatically

### Foreign Keys (Recommended Index)
All FK columns should be indexed:
- user_id, role_id, patient_id, medicine_id, etc.

### Search Columns (Explicit Index)
- patients.patient_id
- patients.phone
- prescriptions.prescription_number
- medicines.name
- medicines.generic_name
- invoices.invoice_number
- payments.payment_number

### Date Columns (For Range Queries)
- diagnoses.diagnosis_date
- prescriptions.prescription_date
- purchase_orders.order_date
- invoices.invoice_date
- payments.payment_date
- expiry_tracking.expiry_date

---

## 8. DATA INTEGRITY CONSTRAINTS

### NOT NULL Constraints
- All primary keys
- Essential fields (name, date, status, etc.)

### UNIQUE Constraints
- username, email (users)
- patient_id (patients)
- prescription_number (prescriptions)
- order_number (purchase_orders)
- invoice_number (invoices)
- payment_number (payments)

### CHECK Constraints (via ENUM)
- gender: 'Male', 'Female', 'Other'
- status fields: 'Pending', 'Confirmed', 'Delivered', etc.
- payment_method: 'Cash', 'Card', 'Insurance', 'Mobile Money'

### DEFAULT Values
- is_active: TRUE
- status: 'Pending'
- created_at: CURRENT_TIMESTAMP
- quantity_available: 0

---

## Document Status
- **Version**: 1.0
- **Date**: February 15, 2026
- **Normalization Level**: 3NF
- **Total Tables**: 25+
- **Total Relationships**: 40+
