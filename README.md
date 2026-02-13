# Haramaya University Pharmacy Management System

Complete full-stack pharmacy management system for Haramaya University Health Center.

## 🎯 Project Overview

A modern, secure, and scalable pharmacy management system with:
- **Backend:** Node.js + Express.js + MySQL
- **Frontend:** React + Vite
- **Authentication:** JWT-based
- **Architecture:** RESTful API + Component-based UI

## 📚 Documentation

**🚀 Start Here:** [FULL_SETUP_GUIDE.md](FULL_SETUP_GUIDE.md)

### Quick Links

- 📖 **[PROJECT_COMPLETE.md](PROJECT_COMPLETE.md)** - Complete project summary
- 🔧 **[INSTALLATION.md](INSTALLATION.md)** - Detailed installation
- ⚡ **[QUICK_START.md](QUICK_START.md)** - Quick reference
- 📡 **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference
- 🏗️ **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Architecture
- 📋 **[INDEX.md](INDEX.md)** - Documentation index

## 🚀 Quick Start

### Backend Setup

```bash
cd api
npm install
mysql -u root -p < database.sql
npm run dev
```

**Backend:** http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend:** http://localhost:3000

## 🔑 Default Login

- **Username:** `admin`
- **Password:** `admin123`

## 📁 Project Structure

```
haramaya-pharmacy-backend/
├── api/
│   ├── config/
│   │   ├── database.js          # Database connection
│   │   └── jwt.js               # JWT utilities
│   ├── controllers/
│   │   ├── authController.js    # Authentication
│   │   ├── userController.js    # User management
│   │   ├── medicineController.js
│   │   ├── categoryController.js
│   │   ├── typeController.js
│   │   └── supplierController.js
│   ├── middleware/
│   │   ├── auth.js              # Authentication & authorization
│   │   ├── errorHandler.js      # Global error handler
│   │   └── validator.js         # Validation middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── medicines.js
│   │   ├── categories.js
│   │   ├── types.js
│   │   └── suppliers.js
│   ├── .env                     # Environment variables
│   ├── .gitignore
│   ├── database.sql             # Database schema
│   ├── package.json
│   └── server.js                # Main application file
├── README.md
└── QUICK_START.md
```

## Installation

### 1. Navigate to API folder

```bash
cd api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env` file (already created):

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=haramaya_pharmacy
DB_USER=root
DB_PASSWORD=

JWT_SECRET=haramaya-pharmacy-secret-key-2024
JWT_EXPIRES_IN=24h
```

### 4. Setup Database

```bash
# Create database and tables
mysql -u root -p < database.sql
```

### 5. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on: **http://localhost:5000**

## API Endpoints

### Authentication

```
POST   /api/auth/login       # Login
POST   /api/auth/logout      # Logout
GET    /api/auth/me          # Get current user
```

### Users (Admin Only)

```
GET    /api/users            # List all users
POST   /api/users            # Create user
GET    /api/users/:id        # Get user
PUT    /api/users/:id        # Update user
DELETE /api/users/:id        # Delete user
```

### Medicines

```
GET    /api/medicines        # List medicines
POST   /api/medicines        # Create medicine (Admin/Pharmacist)
GET    /api/medicines/search?query=  # Search medicines
GET    /api/medicines/:id    # Get medicine
PUT    /api/medicines/:id    # Update medicine (Admin/Pharmacist)
DELETE /api/medicines/:id    # Delete medicine (Admin/Pharmacist)
```

### Medicine Categories

```
GET    /api/medicine-categories     # List categories
POST   /api/medicine-categories     # Create category (Admin/Pharmacist)
PUT    /api/medicine-categories/:id # Update category (Admin/Pharmacist)
DELETE /api/medicine-categories/:id # Delete category (Admin/Pharmacist)
```

### Medicine Types

```
GET    /api/medicine-types     # List types
POST   /api/medicine-types     # Create type (Admin/Pharmacist)
PUT    /api/medicine-types/:id # Update type (Admin/Pharmacist)
DELETE /api/medicine-types/:id # Delete type (Admin/Pharmacist)
```

### Suppliers

```
GET    /api/suppliers         # List suppliers
POST   /api/suppliers         # Create supplier (Admin/Pharmacist)
GET    /api/suppliers/:id     # Get supplier
PUT    /api/suppliers/:id     # Update supplier (Admin/Pharmacist)
DELETE /api/suppliers/:id     # Delete supplier (Admin/Pharmacist)
```

## API Usage Examples

### 1. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**
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

### 2. Create Medicine

```bash
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Paracetamol",
    "generic_name": "Acetaminophen",
    "category_id": 1,
    "type_id": 1,
    "strength": "500mg",
    "unit": "tablet",
    "reorder_level": 100,
    "unit_price": 0.50,
    "requires_prescription": false
  }'
```

### 3. Search Medicines

```bash
curl -X GET "http://localhost:5000/api/medicines/search?query=para" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get All Users (Admin Only)

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## User Roles

1. **System Administrator** - Full system access
2. **Pharmacist** - Medicine & stock management
3. **Data Clerk / Cashier** - Sales processing
4. **Physician** - Prescription creation
5. **Ward Nurse** - View prescriptions
6. **Drug Supplier** - Limited access

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation
- SQL injection protection
- CORS enabled
- Helmet security headers

## Error Handling

All errors return JSON format:

```json
{
  "message": "Error description"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

## Development

```bash
# Navigate to api folder
cd api

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Testing

Use Postman, Insomnia, or curl to test the API endpoints.

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

## Database Schema

The system uses 16 normalized tables:
- users, roles, user_roles
- medicines, medicine_categories, medicine_types
- suppliers
- stock_inventory, stock_in, stock_out
- prescriptions, prescription_items
- sales, sale_items
- expiry_tracking, reports

See `database.sql` for complete schema.

## License

Proprietary - Haramaya University Health Center

## Support

For technical support, contact: support@haramaya.edu

---

**Version**: 1.0.0  
**Last Updated**: February 2024  
**Built with**: Node.js + Express.js + MySQL
