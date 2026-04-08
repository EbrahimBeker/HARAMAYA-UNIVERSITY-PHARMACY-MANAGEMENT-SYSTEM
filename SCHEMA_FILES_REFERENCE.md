# Database Schema Files Reference

## Quick Reference Guide

### Schema Files Location

```
HARAMAYA-UNIVERSITY-PHARMACY-MANAGEMENT-SYSTEM/
├── DATABASE_SCHEMA.sql                    # Main schema (root level)
├── api/
│   ├── init-complete-database.sql         # Complete init script
│   ├── database.sql                       # Legacy (not maintained)
│   └── migrations/                        # Migration files
│       ├── add_supplier_bank_accounts.sql
│       ├── add_payment_receipt.sql
│       ├── add_created_by_to_suppliers.sql
│       └── ... (other migrations)
```

## File Purposes

### 1. DATABASE_SCHEMA.sql (Root Level)

**Purpose**: Main reference schema for documentation
**Status**: ✅ Up-to-date
**Use Case**:

- Documentation reference
- Understanding database structure
- Schema comparison

**DO NOT USE FOR**: Initial database setup (use init-complete-database.sql instead)

### 2. api/init-complete-database.sql

**Purpose**: Complete database initialization
**Status**: ✅ Up-to-date
**Use Case**:

- Fresh database installation
- Development environment setup
- Testing environment setup

**How to Use**:

```bash
mysql -u root < api/init-complete-database.sql
```

### 3. api/migrations/\*.sql

**Purpose**: Incremental database updates
**Status**: ✅ All applied
**Use Case**:

- Updating existing databases
- Tracking schema changes over time
- Rollback capability

**How to Use**:

```bash
mysql -u root haramaya_pharmacy < api/migrations/add_supplier_bank_accounts.sql
```

## Current Schema Status

### ✅ Synchronized Tables

All schema files include these tables with identical structure:

1. **users** - System users
2. **roles** - User roles (Admin, Pharmacist, etc.)
3. **user_roles** - User-role assignments
4. **patients** - Patient records
5. **diagnoses** - Patient diagnoses
6. **medicines** - Medicine master data
7. **medicine_categories** - Medicine categories
8. **medicine_types** - Medicine types
9. **prescriptions** - Prescription headers
10. **prescription_items** - Prescription line items
11. **emergency_dispensing** - Emergency dispensing records
12. **stock_inventory** - Current stock levels
13. **suppliers** - Drug suppliers (with bank accounts)
14. **supplier_catalog** - Supplier drug catalog
15. **purchase_orders** - Purchase orders (with payment tracking)
16. **purchase_order_items** - Purchase order line items
17. **stock_in** - Stock receiving records
18. **stock_out** - Stock dispensing records
19. **expiry_tracking** - Drug expiry monitoring
20. **invoices** - Patient invoices
21. **invoice_items** - Invoice line items
22. **payments** - Payment transactions
23. **sales** - Sales transactions
24. **sale_items** - Sale line items
25. **reports** - Report generation log
26. **audit_log** - System audit trail

**Total Tables**: 26

## Key Differences Between Files

### DATABASE_SCHEMA.sql

- Includes detailed comments
- Has views defined
- Includes sample data inserts
- More readable format
- Used for documentation

### api/init-complete-database.sql

- Optimized for execution
- Minimal comments
- No sample data (except roles, categories, types)
- Used for actual database creation

### api/migrations/\*.sql

- Single-purpose changes
- Includes rollback instructions (in comments)
- Idempotent (safe to run multiple times)
- Used for incremental updates

## Recent Updates (April 2026)

### Suppliers Table

Added:

- `created_by` - Track who created the supplier
- `bank_name` - Bank name (CBE, Dashen Bank, Awash Bank)
- `account_number` - Bank account number
- `account_holder_name` - Account holder name

### Purchase Orders Table

Added:

- `payment_status` - Payment status tracking
- `payment_receipt_image` - Receipt image path
- `payment_date` - Payment date
- `payment_notes` - Payment notes
- `payment_uploaded_at` - Receipt upload timestamp
- `payment_verified_at` - Payment verification timestamp
- `payment_verified_by` - Who verified the payment

## Usage Scenarios

### Scenario 1: New Installation

```bash
# Create fresh database
mysql -u root < api/init-complete-database.sql

# Verify
mysql -u root -e "USE haramaya_pharmacy; SHOW TABLES;"
```

### Scenario 2: Update Existing Database

```bash
# Apply specific migration
mysql -u root haramaya_pharmacy < api/migrations/add_supplier_bank_accounts.sql

# Verify
mysql -u root -e "USE haramaya_pharmacy; SHOW COLUMNS FROM suppliers;"
```

### Scenario 3: Schema Documentation

```bash
# View main schema file
cat DATABASE_SCHEMA.sql

# Or open in editor for detailed review
```

### Scenario 4: Backup Before Changes

```bash
# Backup current database
mysqldump -u root haramaya_pharmacy > backup_$(date +%Y%m%d).sql

# Apply changes
mysql -u root haramaya_pharmacy < api/migrations/new_migration.sql

# Restore if needed
mysql -u root haramaya_pharmacy < backup_20260408.sql
```

## Maintenance Guidelines

### When Adding New Features

1. **Create Migration File**

   ```sql
   -- api/migrations/add_new_feature.sql
   USE haramaya_pharmacy;

   ALTER TABLE table_name
   ADD COLUMN new_field VARCHAR(100);
   ```

2. **Update Main Schema**
   - Edit `DATABASE_SCHEMA.sql`
   - Add new field to table definition
   - Update comments

3. **Update Init Script**
   - Edit `api/init-complete-database.sql`
   - Add new field to table definition

4. **Test**

   ```bash
   # Test on fresh database
   mysql -u root test_db < api/init-complete-database.sql

   # Test migration on existing database
   mysql -u root haramaya_pharmacy < api/migrations/add_new_feature.sql
   ```

5. **Document**
   - Update this reference file
   - Update DATABASE_SCHEMA_VERIFICATION.md
   - Add comments in migration file

### Schema Validation Checklist

- [ ] All tables have PRIMARY KEY
- [ ] Foreign keys are defined with proper ON DELETE actions
- [ ] Indexes are created for frequently queried columns
- [ ] ENUM values are appropriate and complete
- [ ] Timestamps use DEFAULT CURRENT_TIMESTAMP
- [ ] Soft deletes use deleted_at TIMESTAMP NULL
- [ ] Comments explain table purpose
- [ ] Field names are consistent across tables

## Common Issues & Solutions

### Issue 1: Migration Already Applied

**Error**: "Duplicate column name"
**Solution**: Migration is idempotent, error can be ignored

### Issue 2: Foreign Key Constraint Fails

**Error**: "Cannot add foreign key constraint"
**Solution**: Ensure referenced table exists and has data

### Issue 3: Schema Files Out of Sync

**Error**: Different structures in different files
**Solution**:

1. Check production database structure
2. Update all schema files to match
3. Run verification script

## Verification Script

```bash
#!/bin/bash
# verify_schema.sh

echo "Checking Suppliers Table..."
mysql -u root -e "USE haramaya_pharmacy; SHOW COLUMNS FROM suppliers;" | grep -E "bank_name|account_number|created_by"

echo "Checking Purchase Orders Table..."
mysql -u root -e "USE haramaya_pharmacy; SHOW COLUMNS FROM purchase_orders;" | grep -E "payment_status|payment_receipt"

echo "Schema verification complete!"
```

## Quick Commands

### View All Tables

```bash
mysql -u root -e "USE haramaya_pharmacy; SHOW TABLES;"
```

### View Table Structure

```bash
mysql -u root -e "USE haramaya_pharmacy; DESCRIBE suppliers;"
```

### View Foreign Keys

```bash
mysql -u root -e "USE haramaya_pharmacy;
SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'haramaya_pharmacy'
AND REFERENCED_TABLE_NAME IS NOT NULL;"
```

### View Indexes

```bash
mysql -u root -e "USE haramaya_pharmacy; SHOW INDEX FROM suppliers;"
```

## Summary

✅ **All schema files are synchronized and up-to-date**

- `DATABASE_SCHEMA.sql` - Documentation reference
- `api/init-complete-database.sql` - Fresh installation
- `api/migrations/*.sql` - Incremental updates

Use the appropriate file for your use case, and always test changes on a development database first!

---

**Last Updated**: April 8, 2026
**Schema Version**: 2.0
**Status**: ✅ VERIFIED
