# Database Schema Update Summary

## Issues Found and Fixed

### 1. Missing Tables in `api/database.sql`

The following critical tables were missing from your main database schema file:

#### ✅ ADDED: Patients Table

```sql
CREATE TABLE patients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    blood_group VARCHAR(5),
    allergies TEXT,
    registered_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (registered_by) REFERENCES users(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_name (last_name, first_name),
    INDEX idx_phone (phone)
) ENGINE=InnoDB;
```

**Purpose**: Stores patient registration data for the Data Clerk module

#### ✅ ADDED: Diagnoses Table

```sql
CREATE TABLE diagnoses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    physician_id BIGINT UNSIGNED NOT NULL,
    diagnosis_date DATE NOT NULL,
    symptoms TEXT NOT NULL,
    vital_signs JSON,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (physician_id) REFERENCES users(id),
    INDEX idx_patient (patient_id),
    INDEX idx_physician (physician_id),
    INDEX idx_date (diagnosis_date)
) ENGINE=InnoDB;
```

**Purpose**: Stores patient diagnosis records created by physicians

### 2. Missing Column in Medicines Table

#### ✅ ADDED: `form` Column

```sql
form VARCHAR(50)
```

**Purpose**: Stores the medicine form (e.g., Tablet, Capsule, Syrup, Injection)
**Used in**: CreatePrescription page when displaying medicine options

### 3. Schema Mismatch: Prescription Items

#### Issue Found

The `prescription_items` table has:

- ✅ `dosage_instructions` (TEXT) - single field

But the application was trying to insert:

- ❌ `dosage`, `frequency`, `duration`, `instructions` - separate fields

#### ✅ FIXED

Updated `prescriptionController.js` to combine all dosage information into the single `dosage_instructions` field:

```javascript
const dosageInstructions = [
  `Dosage: ${item.dosage}`,
  `Frequency: ${item.frequency}`,
  `Duration: ${item.duration}`,
  item.instructions ? `Instructions: ${item.instructions}` : null,
]
  .filter(Boolean)
  .join(" | ");
```

## Current Database Schema Status

### ✅ Complete Tables

1. users
2. roles
3. user_roles
4. medicine_categories
5. medicine_types
6. suppliers
7. medicines (with `form` column added)
8. stock_inventory
9. patients (newly added)
10. diagnoses (newly added)
11. stock_in
12. prescriptions
13. prescription_items
14. sales
15. sale_items
16. stock_out
17. expiry_tracking
18. reports

### ⚠️ Tables in DATABASE_SCHEMA.sql but NOT in database.sql

These tables exist in `DATABASE_SCHEMA.sql` but are not in your main `database.sql`:

1. **purchase_orders** - For managing purchase orders to suppliers
2. **purchase_order_items** - Items in purchase orders
3. **invoices** - For billing/invoicing
4. **invoice_items** - Items in invoices
5. **payments** - Payment tracking
6. **audit_log** - System audit trail

**Note**: These tables are not currently used by the application, so they're not critical for current functionality.

## Recommendations

### 1. If Starting Fresh

Run the updated `api/database.sql` file which now includes:

- All core tables needed for current functionality
- Patients table
- Diagnoses table
- Medicines table with `form` column

### 2. If Database Already Exists

Run these ALTER statements to add missing components:

```sql
-- Add patients table if not exists
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    blood_group VARCHAR(5),
    allergies TEXT,
    registered_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (registered_by) REFERENCES users(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_name (last_name, first_name),
    INDEX idx_phone (phone)
) ENGINE=InnoDB;

-- Add diagnoses table if not exists
CREATE TABLE IF NOT EXISTS diagnoses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    physician_id BIGINT UNSIGNED NOT NULL,
    diagnosis_date DATE NOT NULL,
    symptoms TEXT NOT NULL,
    vital_signs JSON,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (physician_id) REFERENCES users(id),
    INDEX idx_patient (patient_id),
    INDEX idx_physician (physician_id),
    INDEX idx_date (diagnosis_date)
) ENGINE=InnoDB;

-- Add form column to medicines if not exists
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS form VARCHAR(50) AFTER type_id;
```

### 3. Verify Your Database

Run this query to check which tables exist:

```sql
SHOW TABLES;
```

Then check the medicines table structure:

```sql
DESCRIBE medicines;
```

## Files Updated

1. ✅ `api/database.sql` - Added patients, diagnoses tables and form column
2. ✅ `api/controllers/prescriptionController.js` - Fixed to use dosage_instructions field
3. ✅ Created this summary document

## Next Steps

1. Review the updated `api/database.sql` file
2. If needed, run the ALTER statements above on your existing database
3. Test patient registration and prescription creation
4. Verify all features work correctly
