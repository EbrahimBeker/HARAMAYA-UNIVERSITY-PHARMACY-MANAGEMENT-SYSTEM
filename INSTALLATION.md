# Installation Guide - Haramaya Pharmacy Backend

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **Node.js** (version 18 or higher)
- ✅ **npm** (comes with Node.js)
- ✅ **MySQL** (version 8.0 or higher)
- ✅ **Git** (optional, for cloning)

## 🚀 Installation Methods

### Method 1: Quick Install (Recommended) ⚡

```bash
# 1. Navigate to api folder
cd api

# 2. Install dependencies
npm install

# 3. Start the server (database auto-initializes!)
npm run dev
```

**That's it!** The database, tables, and default data are created automatically on first run.

### Method 2: Manual Install

```bash
# 1. Navigate to api folder
cd api

# 2. Install dependencies
npm install

# 3. Configure environment (already done)
# Edit .env if needed

# 4. Start the server
npm run dev
```

## 🗄️ Database Auto-Initialization

**No manual SQL execution needed!** When you start the server, it automatically:

1. ✅ Creates the `haramaya_pharmacy` database (if not exists)
2. ✅ Creates all 16 tables with proper relationships
3. ✅ Inserts 6 default roles
4. ✅ Creates admin user (username: `admin`, password: `admin123`)

**Console Output:**
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

### Manual Database Reset (if needed)

```bash
mysql -u root -p
```

```sql
DROP DATABASE haramaya_pharmacy;
EXIT;
```

Then restart the server - it will recreate everything automatically.

## ⚙️ Configuration

### Database Configuration

Edit `api/.env` if your MySQL settings are different:

```env
DB_HOST=localhost        # Change if MySQL is on another host
DB_PORT=3306            # Change if using different port
DB_NAME=haramaya_pharmacy
DB_USER=root            # Change to your MySQL username
DB_PASSWORD=            # Add your MySQL password here
```

### Server Configuration

```env
NODE_ENV=development    # Use 'production' for production
PORT=5000              # Change if port 5000 is in use
```

### Security Configuration

```env
JWT_SECRET=haramaya-pharmacy-secret-key-2024
# ⚠️ IMPORTANT: Change this in production!
JWT_EXPIRES_IN=24h     # Token expiration time
```

## ✅ Verify Installation

### 1. Check Server is Running

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Haramaya Pharmacy API is running"
}
```

### 2. Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@haramaya.edu",
    "full_name": "System Administrator",
    "roles": ["System Administrator"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

### 3. Test Protected Endpoint

```bash
# Replace YOUR_TOKEN with the token from login response
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Troubleshooting

### Problem: "Cannot connect to MySQL"

**Solution:**
1. Check if MySQL is running:
   ```bash
   # Windows
   net start MySQL80
   
   # Linux/Mac
   sudo systemctl status mysql
   ```

2. Verify credentials in `api/.env`

3. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```

### Problem: "Port 5000 already in use"

**Solution:**
1. Change port in `api/.env`:
   ```env
   PORT=5001
   ```

2. Or find and stop the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -i :5000
   kill -9 <PID>
   ```

### Problem: "Module not found"

**Solution:**
```bash
cd api
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Database 'haramaya_pharmacy' doesn't exist"

**Solution:**
The database is created automatically on server start. If you see this error:
1. Make sure MySQL is running
2. Verify MySQL credentials in `api/.env`
3. Restart the server - it will create the database automatically

### Problem: "Access denied for user 'root'@'localhost'"

**Solution:**
1. Reset MySQL password or use correct password
2. Update `DB_PASSWORD` in `api/.env`

## 📦 Dependencies

The following packages will be installed:

### Production Dependencies
- **express** - Web framework
- **mysql2** - MySQL client
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **express-validator** - Input validation
- **morgan** - HTTP logger

### Development Dependencies
- **nodemon** - Auto-reload during development

## 🎯 Post-Installation Steps

### 1. Change Default Password

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Update password (use the token from login)
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"your-new-secure-password"}'
```

### 2. Create Additional Users

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "pharmacist1",
    "email": "pharmacist@haramaya.edu",
    "password": "secure-password",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+251911234567",
    "role_ids": [2]
  }'
```

### 3. Add Medicine Categories

```bash
curl -X POST http://localhost:5000/api/medicine-categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Antibiotics",
    "description": "Medicines used to treat bacterial infections"
  }'
```

### 4. Add Medicine Types

```bash
curl -X POST http://localhost:5000/api/medicine-types \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tablet",
    "description": "Solid dosage form"
  }'
```

## 🔄 Running the Application

### Development Mode (with auto-reload)

```bash
# From root directory
npm run dev

# Or from api directory
cd api
npm run dev
```

### Production Mode

```bash
# From root directory
npm start

# Or from api directory
cd api
npm start
```

## 📊 Database Schema

The installation creates 16 tables:

1. **users** - System users
2. **roles** - User roles (6 predefined)
3. **user_roles** - User-role mapping
4. **medicines** - Medicine master data
5. **medicine_categories** - Medicine categories
6. **medicine_types** - Medicine forms
7. **suppliers** - Supplier information
8. **stock_inventory** - Current stock levels
9. **stock_in** - Stock receipts
10. **stock_out** - Stock deductions
11. **prescriptions** - Prescription headers
12. **prescription_items** - Prescription details
13. **sales** - Sales transactions
14. **sale_items** - Sale details
15. **expiry_tracking** - Expiry monitoring
16. **reports** - Report metadata

## 🔐 Default Accounts

After installation, the following account is available:

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: System Administrator

⚠️ **Security Warning:** Change this password immediately after first login!

## 📚 Next Steps

1. ✅ Read the [README.md](README.md) for API documentation
2. ✅ Check [QUICK_START.md](QUICK_START.md) for quick reference
3. ✅ Review [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for architecture details
4. ✅ Test all API endpoints
5. ✅ Create additional user accounts
6. ✅ Start adding medicines and suppliers

## 💡 Tips

- Use **Postman** or **Insomnia** for easier API testing
- Keep the `.env` file secure and never commit it to version control
- Use `npm run dev` during development for auto-reload
- Check logs in the console for debugging
- Use `morgan` logs to monitor HTTP requests

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the error logs in the console
3. Verify all prerequisites are installed
4. Contact: support@haramaya.edu

---

**Installation Complete! 🎉**

Your Haramaya Pharmacy Backend is now ready to use.

**API Base URL:** http://localhost:5000/api  
**Health Check:** http://localhost:5000/health
