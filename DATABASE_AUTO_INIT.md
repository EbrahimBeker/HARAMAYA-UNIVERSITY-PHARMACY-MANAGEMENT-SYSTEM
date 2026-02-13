# Database Auto-Initialization Feature

## Overview

The Haramaya Pharmacy backend now automatically creates and initializes the database when the server starts. No manual SQL execution is required!

## What Was Changed

### 1. Created `api/config/initDatabase.js`

A new initialization script that:
- Creates the `haramaya_pharmacy` database if it doesn't exist
- Creates all 16 tables with proper relationships
- Inserts 6 default roles
- Creates the admin user with hashed password
- Handles errors gracefully

### 2. Updated `api/server.js`

Modified the server startup to:
- Import the `initDatabase` function
- Run database initialization before starting the server
- Use async/await for proper sequencing
- Exit gracefully if initialization fails

### 3. Updated `api/config/database.js`

Simplified the database connection:
- Removed immediate connection test
- Let initialization handle the connection verification

### 4. Updated Documentation

Updated the following files:
- `INSTALLATION.md` - Simplified installation steps
- `QUICK_START.md` - Removed manual database setup
- Created `api/README.md` - Backend-specific documentation

## How It Works

### Server Startup Sequence

```
1. Load environment variables (.env)
2. Initialize Express app
3. Configure middleware
4. Define routes
5. Run initDatabase()
   ├─ Connect to MySQL (without database)
   ├─ CREATE DATABASE IF NOT EXISTS
   ├─ USE database
   ├─ Create all 16 tables (IF NOT EXISTS)
   ├─ Check if roles exist
   │  └─ Insert default roles if empty
   ├─ Check if users exist
   │  └─ Create admin user if empty
   └─ Close initialization connection
6. Start Express server on port 5000
```

### Console Output

```
📦 Initializing database...
✓ Database created/verified
✓ All tables created/verified
✓ Default roles inserted
✓ Default admin user created (username: admin, password: admin123)
✓ Database initialization completed

🚀 Server running on port 5000
📍 API: http://localhost:5000/api
💚 Health: http://localhost:5000/health
```

## Benefits

### For Developers
- ✅ No manual SQL execution needed
- ✅ Faster setup process
- ✅ Consistent database structure
- ✅ Easy database reset (just drop and restart)
- ✅ Works on any environment

### For Deployment
- ✅ Automated deployment scripts
- ✅ No database migration files needed
- ✅ Self-healing on restart
- ✅ Environment-agnostic

## Usage

### First Time Setup

```bash
# 1. Navigate to api folder
cd api

# 2. Install dependencies
npm install

# 3. Configure .env (if needed)
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password

# 4. Start server
npm run dev
```

That's it! The database is created automatically.

### Database Reset

If you need to reset the database:

```bash
# Option 1: Using MySQL CLI
mysql -u root -p
DROP DATABASE haramaya_pharmacy;
EXIT;

# Option 2: Using SQL file
mysql -u root -p -e "DROP DATABASE haramaya_pharmacy;"
```

Then restart the server - it will recreate everything.

### Subsequent Runs

On subsequent server starts:
- Database already exists → Skip creation
- Tables already exist → Skip creation
- Roles already exist → Skip insertion
- Users already exist → Skip creation

Only missing components are created.

## Technical Details

### Database Connection

The initialization uses a separate connection that:
- Connects without specifying a database
- Has `multipleStatements: true` for batch operations
- Closes after initialization completes

The main application uses a connection pool for queries.

### Idempotent Operations

All operations are idempotent (safe to run multiple times):
- `CREATE DATABASE IF NOT EXISTS`
- `CREATE TABLE IF NOT EXISTS`
- Check row count before inserting defaults

### Error Handling

If initialization fails:
- Error is logged to console
- Server exits with code 1
- User can fix the issue and restart

Common errors:
- MySQL not running
- Invalid credentials
- Insufficient privileges
- Port already in use

### Security

- Admin password is hashed using bcrypt (10 rounds)
- JWT secret should be changed in production
- Database credentials in `.env` (not committed)

## Files Modified

### Created
- `api/config/initDatabase.js` - Initialization script
- `api/README.md` - Backend documentation
- `DATABASE_AUTO_INIT.md` - This file

### Modified
- `api/server.js` - Added initialization call
- `api/config/database.js` - Removed immediate test
- `INSTALLATION.md` - Updated installation steps
- `QUICK_START.md` - Simplified quick start

### Unchanged
- `api/database.sql` - Kept for reference
- All controllers, routes, middleware
- Frontend code

## Database Schema

### 16 Tables Created

1. **users** - System users with authentication
2. **roles** - 6 predefined user roles
3. **user_roles** - Many-to-many user-role mapping
4. **medicine_categories** - Medicine categories
5. **medicine_types** - Dosage forms (tablet, syrup, etc.)
6. **medicines** - Medicine master data
7. **suppliers** - Supplier information
8. **stock_inventory** - Current stock levels
9. **stock_in** - Stock receipt transactions
10. **stock_out** - Stock deduction transactions
11. **prescriptions** - Prescription headers
12. **prescription_items** - Prescription line items
13. **sales** - Sales transaction headers
14. **sale_items** - Sales line items
15. **expiry_tracking** - Medicine expiry monitoring
16. **reports** - Report generation metadata

### Default Data Inserted

**Roles:**
1. System Administrator
2. Pharmacist
3. Data Clerk / Cashier
4. Physician
5. Ward Nurse
6. Drug Supplier

**Users:**
- Username: `admin`
- Password: `admin123` (hashed)
- Role: System Administrator
- Email: admin@haramaya.edu

## Testing

### Verify Auto-Initialization

```bash
# 1. Drop database (if exists)
mysql -u root -p -e "DROP DATABASE IF EXISTS haramaya_pharmacy;"

# 2. Start server
cd api
npm run dev

# 3. Check console output
# Should see initialization messages

# 4. Verify database
mysql -u root -p -e "SHOW DATABASES LIKE 'haramaya_pharmacy';"
mysql -u root -p haramaya_pharmacy -e "SHOW TABLES;"

# 5. Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Idempotency

```bash
# Start server multiple times
npm run dev
# Stop with Ctrl+C
npm run dev
# Stop with Ctrl+C
npm run dev

# Should not create duplicate data
mysql -u root -p haramaya_pharmacy -e "SELECT COUNT(*) FROM roles;"
# Should return 6, not 12 or 18
```

## Troubleshooting

### "Cannot connect to MySQL"

**Cause:** MySQL server not running or wrong credentials

**Solution:**
1. Start MySQL service
2. Verify credentials in `.env`
3. Test connection: `mysql -u root -p`

### "Access denied for user"

**Cause:** User doesn't have database creation privileges

**Solution:**
```sql
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### "Database initialization failed"

**Cause:** Various (check error message)

**Solution:**
1. Read the error message in console
2. Fix the underlying issue
3. Restart the server

### "Port 5000 already in use"

**Cause:** Another process using port 5000

**Solution:**
- Change `PORT` in `.env` to 5001
- Or stop the other process

## Future Enhancements

Possible improvements:
- [ ] Database migration system for schema changes
- [ ] Seed data for testing (sample medicines, etc.)
- [ ] Database version tracking
- [ ] Rollback capability
- [ ] Health check endpoint with DB status
- [ ] Automatic backup before schema changes

## Conclusion

The database auto-initialization feature simplifies the setup process and makes the application more portable and maintainable. Developers can now get started with just `npm install && npm run dev`.

---

**Feature Status:** ✅ Complete and Tested  
**Version:** 1.0.0  
**Date:** February 7, 2026
