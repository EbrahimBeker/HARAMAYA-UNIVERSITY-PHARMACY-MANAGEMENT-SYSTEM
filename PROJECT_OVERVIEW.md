# Haramaya University Pharmacy Management System

## 📋 Project Overview

Complete backend API system for managing pharmacy operations at Haramaya University Health Center, built with Node.js, Express.js, and MySQL.

## 🏗️ Architecture

**Backend Framework:** Node.js + Express.js  
**Database:** MySQL 8.0+  
**Authentication:** JWT (JSON Web Tokens)  
**Architecture Pattern:** MVC (Model-View-Controller)

## 📁 Project Structure

```
haramaya-pharmacy-backend/
├── api/                         # Main backend folder
│   ├── config/                  # Configuration files
│   │   ├── database.js          # MySQL connection pool
│   │   └── jwt.js               # JWT token utilities
│   ├── controllers/             # Business logic
│   │   ├── authController.js    # Authentication (login, logout)
│   │   ├── userController.js    # User CRUD operations
│   │   ├── medicineController.js # Medicine management
│   │   ├── categoryController.js # Category management
│   │   ├── typeController.js    # Medicine type management
│   │   └── supplierController.js # Supplier management
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js              # JWT authentication & RBAC
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validator.js         # Request validation
│   ├── routes/                  # API routes
│   │   ├── auth.js              # /api/auth/*
│   │   ├── users.js             # /api/users/*
│   │   ├── medicines.js         # /api/medicines/*
│   │   ├── categories.js        # /api/medicine-categories/*
│   │   ├── types.js             # /api/medicine-types/*
│   │   └── suppliers.js         # /api/suppliers/*
│   ├── .env                     # Environment variables
│   ├── .gitignore               # Git ignore rules
│   ├── database.sql             # Database schema & seed data
│   ├── package.json             # API dependencies
│   └── server.js                # Express app entry point
├── README.md                    # Main documentation
├── QUICK_START.md               # Quick start guide
├── PROJECT_OVERVIEW.md          # This file
└── package.json                 # Root package.json (convenience scripts)
```

## 🚀 Quick Start

### Option 1: Using Root Scripts

```bash
# Install API dependencies
npm run install-api

# Start development server
npm run dev

# Start production server
npm start
```

### Option 2: Direct API Folder

```bash
# Navigate to api folder
cd api

# Install dependencies
npm install

# Setup database
mysql -u root -p < database.sql

# Start server
npm run dev
```

## 🔑 Key Features

### ✅ Implemented Features

1. **User Management**
   - Create, read, update, delete users
   - Role-based access control (RBAC)
   - 6 predefined roles

2. **Authentication & Authorization**
   - JWT token-based authentication
   - Secure password hashing (bcrypt)
   - Role-based route protection

3. **Medicine Management**
   - Complete CRUD operations
   - Search functionality
   - Category and type classification
   - Stock level tracking

4. **Supplier Management**
   - Supplier registration
   - Contact information management
   - Active/inactive status

5. **Security**
   - Helmet.js security headers
   - CORS configuration
   - Input validation
   - SQL injection protection

## 👥 User Roles

1. **System Administrator**
   - Full system access
   - User management
   - System configuration

2. **Pharmacist**
   - Medicine management
   - Stock control
   - Prescription dispensing

3. **Data Clerk / Cashier**
   - Sales processing
   - Transaction handling

4. **Physician**
   - Prescription creation
   - Patient management

5. **Ward Nurse**
   - View prescriptions
   - Medicine information access

6. **Drug Supplier**
   - Limited access
   - Supply coordination

## 🗄️ Database Schema

**16 Tables:**
- `users` - System users
- `roles` - User roles
- `user_roles` - User-role mapping
- `medicines` - Medicine master data
- `medicine_categories` - Medicine categories
- `medicine_types` - Medicine forms (tablet, syrup, etc.)
- `suppliers` - Supplier information
- `stock_inventory` - Current stock levels
- `stock_in` - Stock receipt records
- `stock_out` - Stock deduction records
- `prescriptions` - Prescription headers
- `prescription_items` - Prescription line items
- `sales` - Sales transactions
- `sale_items` - Sale line items
- `expiry_tracking` - Expiry monitoring
- `reports` - Report metadata

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login       # Login
POST   /api/auth/logout      # Logout
GET    /api/auth/me          # Get current user
```

### Users (Admin Only)
```
GET    /api/users            # List users
POST   /api/users            # Create user
GET    /api/users/:id        # Get user
PUT    /api/users/:id        # Update user
DELETE /api/users/:id        # Delete user
```

### Medicines
```
GET    /api/medicines        # List medicines
POST   /api/medicines        # Create medicine
GET    /api/medicines/search # Search medicines
GET    /api/medicines/:id    # Get medicine
PUT    /api/medicines/:id    # Update medicine
DELETE /api/medicines/:id    # Delete medicine
```

### Categories
```
GET    /api/medicine-categories     # List
POST   /api/medicine-categories     # Create
PUT    /api/medicine-categories/:id # Update
DELETE /api/medicine-categories/:id # Delete
```

### Types
```
GET    /api/medicine-types     # List
POST   /api/medicine-types     # Create
PUT    /api/medicine-types/:id # Update
DELETE /api/medicine-types/:id # Delete
```

### Suppliers
```
GET    /api/suppliers         # List
POST   /api/suppliers         # Create
GET    /api/suppliers/:id     # Get
PUT    /api/suppliers/:id     # Update
DELETE /api/suppliers/:id     # Delete
```

## 🔐 Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Change the password after first login!

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger

### Development
- **nodemon** - Auto-reload during development
- **dotenv** - Environment variable management

## 📊 Database Configuration

**Default Settings:**
```
Host: localhost
Port: 3306
Database: haramaya_pharmacy
User: root
Password: (empty)
```

Update in `api/.env` if different.

## 🧪 Testing

### Manual Testing

1. **Health Check:**
```bash
curl http://localhost:5000/health
```

2. **Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

3. **Get Users (with token):**
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman/Insomnia

1. Import API endpoints
2. Login to get JWT token
3. Add token to Authorization header
4. Test all endpoints

## 📝 Environment Variables

Located in `api/.env`:

```env
NODE_ENV=development          # Environment (development/production)
PORT=5000                     # Server port

DB_HOST=localhost             # Database host
DB_PORT=3306                  # Database port
DB_NAME=haramaya_pharmacy     # Database name
DB_USER=root                  # Database user
DB_PASSWORD=                  # Database password

JWT_SECRET=your-secret-key    # JWT secret key
JWT_EXPIRES_IN=24h            # Token expiration
```

## 🚨 Common Issues & Solutions

### Issue: Database Connection Failed
**Solution:** 
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### Issue: Port Already in Use
**Solution:**
- Change `PORT` in `.env`
- Or stop process using port 5000

### Issue: Module Not Found
**Solution:**
```bash
cd api
rm -rf node_modules
npm install
```

## 📚 Documentation Files

- **README.md** - Main documentation
- **QUICK_START.md** - Quick start guide
- **PROJECT_OVERVIEW.md** - This file
- **api/database.sql** - Database schema

## 🔄 Development Workflow

1. Make changes to code
2. Server auto-reloads (if using `npm run dev`)
3. Test endpoints
4. Commit changes

## 🎯 Next Steps

### Phase 1: Current (Completed)
- ✅ User management
- ✅ Authentication
- ✅ Medicine management
- ✅ Supplier management

### Phase 2: To Implement
- ⏳ Stock in/out operations
- ⏳ Prescription management
- ⏳ Sales processing
- ⏳ Expiry tracking
- ⏳ Reporting system

### Phase 3: Future Enhancements
- 📱 Mobile app integration
- 📊 Advanced analytics
- 🔔 Real-time notifications
- 📧 Email notifications
- 📄 PDF report generation

## 👨‍💻 Development Team

**Haramaya University Health Center**

## 📞 Support

For technical support:
- Email: support@haramaya.edu
- Documentation: See README.md files

## 📄 License

Proprietary - Haramaya University Health Center

---

**Version:** 1.0.0  
**Last Updated:** February 2024  
**Status:** ✅ Production Ready
