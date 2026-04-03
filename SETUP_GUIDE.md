# 🚀 Pharmacy Management System - Setup Guide

## 📋 Prerequisites

Before setting up the system, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn** package manager
- **Git** (for version control)

## 🔧 Environment Setup

### 1. Database Setup

First, create the MySQL database:

```sql
CREATE DATABASE haramaya_pharmacy
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Environment Configuration

The backend `.env` file has been created with default values. Update the database credentials:

```bash
cd api
```

Edit the `.env` file and update these values:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=haramaya_pharmacy

# JWT Configuration (Change this to a secure random string)
JWT_SECRET=your_very_secure_jwt_secret_key_here
```

### 3. Frontend Environment Configuration

The frontend `.env` file is already configured with default values. You can modify:

```bash
cd frontend
```

The `.env` file contains:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=30000

# Application Configuration
VITE_APP_NAME=Haramaya Pharmacy Management System
```

## 📦 Installation Steps

### Step 1: Install Backend Dependencies

```bash
cd api
npm install
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 3: Run Database Migration

From the root directory, run the RBAC migration:

```bash
node setup-rbac.js
```

This will:

- Create all necessary database tables
- Set up the 5-role RBAC system
- Insert default roles and permissions
- Create a default admin user

### Step 4: Start the Backend Server

```bash
cd api
npm start
```

The API server will start on `http://localhost:5000`

### Step 5: Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔐 Default Login Credentials

After running the migration, you can log in with:

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin (full system access)

## 🎯 System Verification

### 1. Check API Health

Visit: `http://localhost:5000/health`

You should see:

```json
{
  "status": "OK",
  "message": "Haramaya Pharmacy API is running"
}
```

### 2. Check Database Connection

The setup script will verify:

- Database connection
- Table creation
- Role setup
- Permission assignment

### 3. Test Login

1. Open `http://localhost:5173`
2. Login with admin credentials
3. Verify role-based dashboard redirection

## 📁 Project Structure

```
pharmacy-management-system/
├── api/                          # Backend (Node.js + Express)
│   ├── .env                      # Backend environment variables
│   ├── .env.example              # Backend environment template
│   ├── config/                   # Database and JWT configuration
│   ├── controllers/              # API controllers
│   ├── middleware/               # Authentication & validation
│   ├── routes/                   # API routes
│   ├── migrations/               # Database migrations
│   └── server.js                 # Main server file
├── frontend/                     # Frontend (React + Vite)
│   ├── .env                      # Frontend environment variables
│   ├── .env.example              # Frontend environment template
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── context/              # React context (Auth)
│   │   ├── hooks/                # Custom hooks
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   └── App.jsx               # Main app component
│   └── package.json
├── setup-rbac.js                 # Database migration script
├── RBAC_UPGRADE_GUIDE.md         # Comprehensive system guide
└── SETUP_GUIDE.md               # This setup guide
```

## 🔄 Development Workflow

### Backend Development

```bash
cd api
npm run dev    # Start with nodemon for auto-restart
```

### Frontend Development

```bash
cd frontend
npm run dev    # Start Vite dev server with hot reload
```

### Database Management

```bash
# Create new migration
node setup-rbac.js

# Reset database (if needed)
mysql -u root -p haramaya_pharmacy < api/migrations/update_roles_rbac.sql
```

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

## 🚀 Production Deployment

### 1. Build Frontend

```bash
cd frontend
npm run build
```

### 2. Environment Configuration

Update production environment variables:

**Backend (.env):**

```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_very_secure_production_jwt_secret
```

**Frontend (.env.production):**

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_NODE_ENV=production
```

### 3. Start Production Server

```bash
cd api
npm start
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in backend `.env`
   - Kill existing processes: `lsof -ti:5000 | xargs kill -9`

3. **CORS Issues**
   - Verify CORS_ORIGIN in backend `.env`
   - Check frontend URL matches CORS settings

4. **JWT Token Issues**
   - Clear browser localStorage
   - Verify JWT_SECRET is set
   - Check token expiration

### Logs and Debugging

**Backend Logs:**

```bash
cd api
tail -f logs/app.log
```

**Database Logs:**

```bash
mysql -u root -p -e "SHOW PROCESSLIST;"
```

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the comprehensive `RBAC_UPGRADE_GUIDE.md`
3. Check application logs for error details
4. Verify environment configuration

## 🎉 Success!

If everything is set up correctly, you should have:

- ✅ Backend API running on port 5000
- ✅ Frontend app running on port 5173
- ✅ Database with RBAC system configured
- ✅ 5 roles with specific permissions
- ✅ Role-based dashboards working
- ✅ Admin user created and functional

You can now start using the Pharmacy Management System with full RBAC capabilities!
