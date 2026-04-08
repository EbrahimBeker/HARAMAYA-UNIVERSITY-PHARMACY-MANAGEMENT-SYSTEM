# Database Schema Verification - Complete

## Date: April 8, 2026

## Overview

This document verifies that all database schema files are up-to-date with the current production database structure.

## Schema Files Status

### ✅ Main Schema Files

1. **DATABASE_SCHEMA.sql** - Complete and up-to-date
2. **api/init-complete-database.sql** - Complete and up-to-date
3. **api/database.sql** - Legacy file (not updated)

## Recent Changes Applied

### 1. Suppliers Table Updates

**Migration**: `api/migrations/add_supplier_bank_accounts.sql`

Added fields:

- `bank_name` - ENUM('CBE', 'Dashen Bank', 'Awash Bank')
- `account_number` - VARCHAR(50)
- `account_holder_name` - VARCHAR(100)
- `created_by` - BIGINT UNSIGNED (tracks who created the supplier)

**Status**: ✅ Applied to all schema files

### 2. Purchase Orders Table Updates

**Migration**: `api/migrations/add_payment_receipt.sql`

Added fields:

- `payment_status` - ENUM('unpaid', 'pending_verification', 'paid')
- `payment_receipt_image` - VARCHAR(255)
- `payment_date` - DATE
- `payment_notes` - TEXT
- `payment_uploaded_at` - TIMESTAMP
- `payment_verified_at` - TIMESTAMP
- `payment_verified_by` - BIGINT UNSIGNED

**Status**: ✅ Applied to all schema files

## Current Database Structure

### Suppliers Table

```sql
CREATE TABLE suppliers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    created_by BIGINT UNSIGNED,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    bank_name ENUM('CBE', 'Dashen Bank', 'Awash Bank') DEFAULT NULL,
    account_number VARCHAR(50) DEFAULT NULL,
    account_holder_name VARCHAR(100) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_user_id (user_id),
    INDEX idx_created_by (created_by),
    INDEX idx_active (is_active),
    INDEX idx_bank_name (bank_name)
) ENGINE=InnoDB;
```

**Total Fields**: 15
**Foreign Keys**: 2 (user_id, created_by)
**Indexes**: 5

### Purchase Orders Table

```sql
CREATE TABLE purchase_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id BIGINT UNSIGNED NOT NULL,
    pharmacist_id BIGINT UNSIGNED NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status ENUM('pending', 'confirmed', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'pending_verification', 'paid') DEFAULT 'unpaid',
    payment_receipt_image VARCHAR(255),
    payment_date DATE,
    payment_notes TEXT,
    payment_uploaded_at TIMESTAMP NULL,
    payment_verified_at TIMESTAMP NULL,
    payment_verified_by BIGINT UNSIGNED,
    total_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (pharmacist_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (payment_verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_number (order_number),
    INDEX idx_supplier (supplier_id),
    INDEX idx_pharmacist (pharmacist_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_date (order_date)
) ENGINE=InnoDB;
```

**Total Fields**: 19
**Foreign Keys**: 3 (supplier_id, pharmacist_id, payment_verified_by)
**Indexes**: 6

## Migration Files Applied

### Applied Migrations (in order)

1. ✅ `create_purchase_orders.sql` - Initial purchase orders structure
2. ✅ `create_sales_tables.sql` - Sales system
3. ✅ `create_supplier_catalog.sql` - Supplier catalog
4. ✅ `add_created_by_to_suppliers.sql` - Track supplier creator
5. ✅ `add_payment_receipt.sql` - Payment receipt system
6. ✅ `add_supplier_bank_accounts.sql` - Bank account information

### Migration Status

All migrations have been applied to:

- ✅ Production database (`haramaya_pharmacy`)
- ✅ `DATABASE_SCHEMA.sql`
- ✅ `api/init-complete-database.sql`

## Verification Commands

### Check Suppliers Table Structure

```bash
mysql -u root -e "USE haramaya_pharmacy; SHOW COLUMNS FROM suppliers;"
```

**Expected Output**: 15 columns including bank_name, account_number, account_holder_name, created_by

### Check Purchase Orders Table Structure

```bash
mysql -u root -e "USE haramaya_pharmacy; SHOW COLUMNS FROM purchase_orders;"
```

**Expected Output**: 19 columns including payment_status, payment_receipt_image, payment_date, etc.

### Verify Foreign Keys

```bash
mysql -u root -e "USE haramaya_pharmacy;
SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'haramaya_pharmacy'
AND TABLE_NAME IN ('suppliers', 'purchase_orders')
AND REFERENCED_TABLE_NAME IS NOT NULL;"
```

## Schema File Comparison

### DATABASE_SCHEMA.sql vs Production

- ✅ Suppliers table: MATCH
- ✅ Purchase orders table: MATCH
- ✅ All foreign keys: MATCH
- ✅ All indexes: MATCH

### api/init-complete-database.sql vs Production

- ✅ Suppliers table: MATCH
- ✅ Purchase orders table: MATCH
- ✅ All foreign keys: MATCH
- ✅ All indexes: MATCH

## New Installation Process

### For Fresh Database Setup

1. Run `api/init-complete-database.sql`
2. All tables created with latest structure
3. No migrations needed
4. Ready to use immediately

### For Existing Database Update

1. Run migrations in order from `api/migrations/`
2. Each migration is idempotent (safe to run multiple times)
3. Check migration status before running

## Testing Checklist

### Schema Verification

- [x] Suppliers table has 15 columns
- [x] Bank account fields exist (bank_name, account_number, account_holder_name)
- [x] created_by field exists in suppliers
- [x] Purchase orders has 19 columns
- [x] Payment fields exist (payment_status, payment_receipt_image, etc.)
- [x] All foreign keys are defined
- [x] All indexes are created

### Functional Testing

- [x] Supplier can set bank account
- [x] Pharmacist can view bank account
- [x] Pharmacist can upload payment receipt
- [x] Supplier can view payment receipt
- [x] Supplier can confirm payment and deliver
- [x] Inventory updates automatically on delivery

## Database Statistics

### Current Database Size

```sql
SELECT
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'haramaya_pharmacy'
ORDER BY (data_length + index_length) DESC;
```

### Table Row Counts

```sql
SELECT
    table_name AS 'Table',
    table_rows AS 'Rows'
FROM information_schema.TABLES
WHERE table_schema = 'haramaya_pharmacy'
ORDER BY table_rows DESC;
```

## Backup Recommendations

### Before Major Changes

1. Backup current database:

   ```bash
   mysqldump -u root haramaya_pharmacy > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. Test migrations on backup:

   ```bash
   mysql -u root test_pharmacy < backup_20260408_120000.sql
   mysql -u root test_pharmacy < migration.sql
   ```

3. Verify changes:

   ```bash
   mysql -u root -e "USE test_pharmacy; SHOW TABLES;"
   ```

4. Apply to production if successful

## Schema Documentation

### Entity Relationships

```
users (1) ----< (N) suppliers [created_by]
users (1) ----< (N) suppliers [user_id]
suppliers (1) ----< (N) purchase_orders
users (1) ----< (N) purchase_orders [pharmacist_id]
users (1) ----< (N) purchase_orders [payment_verified_by]
```

### Key Constraints

- Suppliers can be created by Admin or Pharmacist
- Suppliers can be linked to a user account (for supplier login)
- Purchase orders require both supplier and pharmacist
- Payment verification tracks who verified the payment
- Soft deletes used (deleted_at field)

## Future Schema Changes

### Planned Enhancements

1. Multiple bank accounts per supplier
2. Payment history table
3. Supplier rating system
4. Order tracking with status history
5. Automated inventory alerts

### Migration Strategy

1. Create migration file in `api/migrations/`
2. Test on development database
3. Update `DATABASE_SCHEMA.sql`
4. Update `api/init-complete-database.sql`
5. Document in this file
6. Apply to production

## Conclusion

✅ **All database schema files are up-to-date and synchronized**

The database structure is consistent across:

- Production database
- Main schema file (DATABASE_SCHEMA.sql)
- Init schema file (api/init-complete-database.sql)
- All migration files

New installations will have the complete structure, and existing installations can be updated using the migration files.

## Contact

For schema-related questions or issues:

- Check migration files in `api/migrations/`
- Review this verification document
- Test changes on development database first

---

**Last Verified**: April 8, 2026
**Database Version**: haramaya_pharmacy v2.0
**Schema Status**: ✅ SYNCHRONIZED
