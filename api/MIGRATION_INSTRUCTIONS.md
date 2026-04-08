# Database Migration Instructions for Windows

## Problem

PowerShell doesn't support the `<` redirection operator like bash does.

## Solutions (Choose ONE)

### ✅ Option 1: Using MySQL Workbench (Easiest)

1. Open MySQL Workbench
2. Connect to your database
3. Open the file: `api/migrations/add_workflow_features.sql`
4. Click "Execute" (lightning bolt icon) or press Ctrl+Shift+Enter
5. Done!

### ✅ Option 2: Using Command Prompt (CMD)

PowerShell has issues with `<`, but CMD works fine:

1. Open **Command Prompt** (not PowerShell)
2. Navigate to the api folder:
   ```cmd
   cd D:\Web App\HARAMAYA-UNIVERSITY-PHARMACY-MANAGEMENT-SYSTEM\api
   ```
3. Run:
   ```cmd
   mysql -u root -p haramaya_pharmacy < migrations\add_workflow_features.sql
   ```
4. Enter your password when prompted

### ✅ Option 3: Using Batch File

1. Double-click: `api/run-migration.bat`
2. Enter your MySQL username (default: root)
3. Enter your MySQL password
4. Done!

### ✅ Option 4: Using PowerShell with Get-Content

```powershell
cd api
Get-Content migrations\add_workflow_features.sql | mysql -u root -p haramaya_pharmacy
```

Then enter your password when prompted.

### ✅ Option 5: Manual Copy-Paste

1. Open `api/migrations/add_workflow_features.sql`
2. Copy all the SQL content
3. Open MySQL command line or Workbench
4. Paste and execute

## Verify Migration Success

After running the migration, verify it worked:

```sql
-- Check if new columns exist
DESCRIBE prescriptions;
DESCRIBE prescription_items;

-- Check if emergency_dispensing table exists
SHOW TABLES LIKE 'emergency_dispensing';

-- Check emergency_dispensing structure
DESCRIBE emergency_dispensing;
```

You should see:

- `prescriptions` table has: `refills_allowed`, `refills_remaining`, `original_prescription_id`, `is_partial_dispensed`
- `prescription_items` table has: `quantity_remaining`, `is_partial`
- `emergency_dispensing` table exists with all columns

## Troubleshooting

### Error: "Column already exists"

This is OK! It means the column was already added. The migration is designed to skip existing columns.

### Error: "Access denied"

Check your MySQL username and password.

### Error: "Unknown database"

Make sure the database `haramaya_pharmacy` exists:

```sql
SHOW DATABASES;
```

### Error: "Table doesn't exist"

Make sure you've run the initial database setup first.

## Next Steps

After successful migration:

1. Restart your API server: `npm start` in the api folder
2. Test the new endpoints
3. Proceed with frontend implementation
