# Pharmacy Management System - RBAC Upgrade Guide

## 🎯 Overview

This document outlines the comprehensive upgrade to a Role-Based Access Control (RBAC) system with 5 distinct roles, each with specialized dashboards and workflows.

## 🔐 New Role Structure

### 1. **Admin**

- **Full system access and management**
- **Permissions:**
  - User management (CRUD)
  - Role assignment
  - System reports (all activities)
  - Backup and restore system data
  - Medicine management
  - Supplier management
  - Audit log access
  - System configuration

### 2. **Data Clerk**

- **Patient registration and record management**
- **Permissions:**
  - Register patients (CRUD)
  - Update patient information
  - View patient records
  - Generate patient reports
  - Process billing and invoices

### 3. **Physician**

- **Patient diagnosis and prescription creation**
- **Permissions:**
  - View patients
  - Create and view diagnoses
  - Create prescriptions
  - View patient history
  - Send prescriptions to pharmacist

### 4. **Pharmacist**

- **Medicine dispensing and inventory management**
- **Permissions:**
  - View and search medicines
  - Dispense medicines
  - Update stock automatically after dispensing
  - Receive supplied medicines
  - Inventory management
  - View stock reports

### 5. **Drug Supplier**

- **Purchase order management and delivery tracking**
- **Permissions:**
  - View purchase orders
  - Confirm availability
  - Update order status
  - View supplier reports

## 🏗️ System Architecture

### Backend Structure

```
api/
├── controllers/
│   ├── authController.js          # Authentication & login
│   ├── userController.js          # User management (Admin)
│   ├── patientController.js       # Patient management (Data Clerk)
│   ├── diagnosisController.js     # Diagnosis management (Physician)
│   ├── prescriptionController.js  # Prescription management (Physician/Pharmacist)
│   ├── inventoryController.js     # Inventory management (Pharmacist)
│   ├── reportController.js        # Report generation (All roles)
│   └── backupController.js        # System backup (Admin)
├── middleware/
│   └── auth.js                    # Enhanced RBAC middleware
├── routes/
│   ├── patients.js                # Patient endpoints
│   ├── prescriptions.js           # Prescription endpoints
│   ├── diagnoses.js               # Diagnosis endpoints
│   ├── inventory.js               # Inventory endpoints
│   ├── reports.js                 # Report endpoints
│   └── backup.js                  # Backup endpoints
└── migrations/
    └── update_roles_rbac.sql      # Database migration
```

### Frontend Structure

```
frontend/src/
├── pages/
│   ├── Admin/
│   │   └── AdminDashboard.jsx     # Admin dashboard
│   ├── DataClerk/
│   │   └── DataClerkDashboard.jsx # Data Clerk dashboard
│   ├── Physician/
│   │   └── PhysicianDashboard.jsx # Physician dashboard
│   ├── Pharmacist/
│   │   └── PharmacistDashboard.jsx # Pharmacist dashboard
│   └── Supplier/
│       └── SupplierDashboard.jsx  # Supplier dashboard
├── context/
│   └── AuthContext.jsx            # Enhanced auth context
└── components/
    └── Common/
        └── ProtectedRoute.jsx     # Role-based route protection
```

## 🚀 Installation & Setup

### 1. Database Migration

```bash
# Run the RBAC migration
node setup-rbac.js
```

### 2. Start Backend

```bash
cd api
npm install
npm start
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Default Login

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin (full access)

## 📋 Key Features Implemented

### 🔐 Authentication & Authorization

- JWT-based authentication
- Permission-based authorization
- Role-based route protection
- Automatic role-based redirection after login

### 👥 User Management (Admin)

- Create, read, update, delete users
- Assign multiple roles to users
- Role-based permission matrix
- User activity tracking

### 🏥 Patient Management (Data Clerk)

- Patient registration with unique ID generation
- Patient record management (CRUD)
- Patient history tracking
- Patient search and filtering

### 🩺 Diagnosis Management (Physician)

- Create patient diagnoses
- Record vital signs (JSON format)
- Link diagnoses to prescriptions
- View patient medical history

### 💊 Prescription Management (Physician → Pharmacist)

- Create prescriptions with multiple medicines
- Prescription status tracking (Pending → Dispensed)
- Automatic stock deduction on dispensing
- Prescription search and filtering

### 📦 Inventory Management (Pharmacist)

- Real-time stock tracking
- Automatic stock updates on dispensing
- Low stock alerts and reorder levels
- Stock receiving from suppliers
- Expiry date tracking
- Stock adjustment capabilities

### 📊 Reporting System (Role-based)

- Dashboard statistics for each role
- Patient reports (Data Clerk, Admin)
- Stock reports (Pharmacist, Admin)
- Prescription reports (Physician, Pharmacist, Admin)
- Supplier reports (Admin, Supplier)
- System activity reports (Admin only)

### 💾 Backup & Restore (Admin)

- Database backup creation
- Backup management (view, download, delete)
- System restore functionality
- Backup scheduling support

## 🔄 Workflows Implemented

### 1. **Login Flow**

```
User Login → Role Verification → Dashboard Redirection
├── Admin → Admin Dashboard
├── Data Clerk → Data Clerk Dashboard
├── Physician → Physician Dashboard
├── Pharmacist → Pharmacist Dashboard
└── Drug Supplier → Supplier Dashboard
```

### 2. **Patient Registration Flow**

```
Data Clerk → Register Patient → Generate Patient ID → Store Record → Update Statistics
```

### 3. **Prescription Flow**

```
Physician → Create Diagnosis → Create Prescription → Send to Pharmacist → Pharmacist Dispenses → Update Stock
```

### 4. **Drug Dispensing Flow**

```
Pharmacist → View Pending Prescriptions → Select Prescription → Verify Stock → Dispense → Update Inventory → Generate Invoice
```

### 5. **Drug Supply Flow**

```
Admin/Pharmacist → Create Purchase Order → Supplier Confirms → Supplier Delivers → Pharmacist Receives → Update Stock
```

### 6. **Report Generation Flow**

```
User → Select Report Type → Apply Filters → Generate Report → Export/View Results
```

## 🛡️ Security Features

### Input Validation

- Express-validator for all API endpoints
- SQL injection prevention (parameterized queries)
- XSS protection with helmet.js
- CORS configuration

### Authentication Security

- Password hashing with bcryptjs (10 salt rounds)
- JWT token expiration (24 hours)
- Token refresh mechanism
- Session management

### Authorization Security

- Permission-based access control
- Resource ownership validation
- Role hierarchy enforcement
- Audit trail logging

## 📱 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### User Management (Admin)

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Patient Management (Data Clerk)

- `GET /api/patients` - List patients
- `POST /api/patients` - Register patient
- `GET /api/patients/:id` - Get patient
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/:id/history` - Patient history

### Prescription Management

- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription (Physician)
- `POST /api/prescriptions/:id/dispense` - Dispense prescription (Pharmacist)
- `GET /api/prescriptions/status/pending` - Pending prescriptions

### Inventory Management (Pharmacist)

- `GET /api/inventory/stock` - Current stock levels
- `POST /api/inventory/receive` - Receive stock
- `GET /api/inventory/movements` - Stock movements
- `GET /api/inventory/expiring` - Expiring medicines
- `POST /api/inventory/adjust` - Stock adjustment

### Reports

- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/patients` - Patient reports
- `GET /api/reports/stock` - Stock reports
- `GET /api/reports/prescriptions` - Prescription reports
- `GET /api/reports/suppliers` - Supplier reports

### Backup (Admin)

- `GET /api/backup` - List backups
- `POST /api/backup` - Create backup
- `POST /api/backup/:id/restore` - Restore backup
- `GET /api/backup/:id/download` - Download backup

## 🎨 Frontend Features

### Role-Based Dashboards

- **Admin Dashboard:** System overview, user management, reports, backup
- **Data Clerk Dashboard:** Patient registration, billing, patient reports
- **Physician Dashboard:** Patient diagnosis, prescription creation, patient history
- **Pharmacist Dashboard:** Medicine dispensing, inventory management, stock reports
- **Supplier Dashboard:** Purchase orders, availability confirmation, delivery tracking

### UI Components

- Responsive design with Tailwind CSS
- Role-based navigation menus
- Permission-based component rendering
- Real-time statistics and alerts
- Interactive data tables with search and pagination

### User Experience

- Automatic role-based redirection after login
- Contextual dashboards for each role
- Quick action buttons for common tasks
- Real-time notifications and alerts
- Intuitive workflow guidance

## 🔧 Configuration

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=haramaya_pharmacy

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development
```

### Database Configuration

- MySQL 8.0+ required
- UTF8MB4 character set
- InnoDB storage engine
- Foreign key constraints enabled

## 📈 Performance Optimizations

### Database

- Proper indexing on frequently queried columns
- Optimized queries with JOINs
- Connection pooling
- Query result caching

### API

- Pagination for large datasets
- Response compression
- Request rate limiting
- Error handling middleware

### Frontend

- Code splitting by routes
- Lazy loading of components
- Optimized bundle size
- Efficient state management

## 🧪 Testing

### Backend Testing

```bash
cd api
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

### Integration Testing

- API endpoint testing
- Database transaction testing
- Role-based access testing
- Workflow testing

## 🚀 Deployment

### Production Setup

1. Set up MySQL database
2. Configure environment variables
3. Run database migrations
4. Build frontend assets
5. Deploy to production server

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📞 Support & Maintenance

### Monitoring

- Application logs
- Database performance monitoring
- User activity tracking
- Error reporting

### Backup Strategy

- Automated daily backups
- Backup retention policy
- Disaster recovery procedures
- Data integrity checks

## 🎉 Conclusion

The upgraded Pharmacy Management System now provides:

- ✅ Comprehensive RBAC with 5 specialized roles
- ✅ Role-specific dashboards and workflows
- ✅ Secure authentication and authorization
- ✅ Complete patient-to-prescription-to-dispensing workflow
- ✅ Real-time inventory management
- ✅ Comprehensive reporting system
- ✅ System backup and restore capabilities
- ✅ Modern, responsive user interface

The system is now production-ready with enterprise-level security, scalability, and user experience.
