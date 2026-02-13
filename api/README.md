# Haramaya Pharmacy Backend API

Node.js/Express backend for the Haramaya University Pharmacy Management System.

## Quick Start

```bash
# Install dependencies
npm install

# Start server (database auto-initializes)
npm run dev
```

## Auto Database Initialization

The database is **automatically created** when you start the server. No manual SQL execution needed!

### What Happens on Server Start:

1. Creates `haramaya_pharmacy` database (if not exists)
2. Creates all 16 tables with relationships
3. Inserts 6 default roles
4. Creates admin user (username: `admin`, password: `admin123`)

### Console Output:

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

## Prerequisites

- Node.js 18+
- MySQL 8.0+ (running on localhost:3306)
- MySQL user with database creation privileges

## Environment Variables

Configure in `.env` file:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=haramaya_pharmacy
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=haramaya-pharmacy-secret-key-2024
JWT_EXPIRES_IN=24h
```

## Default Login

- **Username:** `admin`
- **Password:** `admin123`

⚠️ Change this password after first login!

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Medicines
- `GET /api/medicines` - List all medicines
- `GET /api/medicines/:id` - Get medicine by ID
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine
- `GET /api/medicines/search` - Search medicines

### Categories
- `GET /api/medicine-categories` - List categories
- `POST /api/medicine-categories` - Create category
- `PUT /api/medicine-categories/:id` - Update category
- `DELETE /api/medicine-categories/:id` - Delete category

### Types
- `GET /api/medicine-types` - List types
- `POST /api/medicine-types` - Create type
- `PUT /api/medicine-types/:id` - Update type
- `DELETE /api/medicine-types/:id` - Delete type

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

## Project Structure

```
api/
├── config/
│   ├── database.js          # Database connection pool
│   ├── initDatabase.js      # Auto-initialization script
│   └── jwt.js               # JWT configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── medicineController.js
│   ├── categoryController.js
│   ├── typeController.js
│   └── supplierController.js
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── errorHandler.js      # Error handling
│   └── validator.js         # Input validation
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── medicines.js
│   ├── categories.js
│   ├── types.js
│   └── suppliers.js
├── .env                     # Environment variables
├── database.sql             # SQL schema (for reference)
├── package.json
└── server.js                # Entry point
```

## Database Schema

16 tables with 3NF normalization:

1. **users** - System users
2. **roles** - User roles (6 types)
3. **user_roles** - User-role mapping
4. **medicines** - Medicine master data
5. **medicine_categories** - Categories
6. **medicine_types** - Dosage forms
7. **suppliers** - Supplier information
8. **stock_inventory** - Current stock
9. **stock_in** - Stock receipts
10. **stock_out** - Stock deductions
11. **prescriptions** - Prescription headers
12. **prescription_items** - Prescription details
13. **sales** - Sales transactions
14. **sale_items** - Sale details
15. **expiry_tracking** - Expiry monitoring
16. **reports** - Report metadata

## User Roles

1. **System Administrator** - Full access
2. **Pharmacist** - Medicine & stock management
3. **Data Clerk / Cashier** - Sales processing
4. **Physician** - Prescription management
5. **Ward Nurse** - View prescriptions
6. **Drug Supplier** - Limited supply access

## Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ Input validation
- ✅ SQL injection protection
- ✅ CORS enabled
- ✅ Helmet security headers
- ✅ Request logging (morgan)

## Development

```bash
# Start with auto-reload
npm run dev

# Start production mode
npm start
```

## Testing

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get users (requires token)
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Reset

To reset the database:

```sql
DROP DATABASE haramaya_pharmacy;
```

Then restart the server - it will recreate everything automatically.

## Troubleshooting

### "Cannot connect to MySQL"
- Check if MySQL is running
- Verify credentials in `.env`
- Ensure MySQL user has database creation privileges

### "Port 5000 already in use"
- Change `PORT` in `.env`
- Or stop the process using port 5000

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

## Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL2** - Database client
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - CORS middleware
- **morgan** - HTTP logger
- **dotenv** - Environment variables

## License

Proprietary - Haramaya University

---

**Version:** 1.0.0  
**Last Updated:** February 2026
