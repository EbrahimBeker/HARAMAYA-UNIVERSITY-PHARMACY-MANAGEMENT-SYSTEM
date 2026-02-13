# Complete Setup Guide - Haramaya Pharmacy System

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** 18+ installed
- ✅ **npm** (comes with Node.js)
- ✅ **MySQL** 8.0+ installed and running
- ✅ **Git** (optional)

## 🚀 Complete Installation

### Step 1: Backend Setup

```bash
# Navigate to api folder
cd api

# Install dependencies
npm install

# Configure database
# Edit .env if needed (default settings work for most)

# Create database and tables
mysql -u root -p < database.sql
# Enter your MySQL password when prompted

# Start backend server
npm run dev
```

**Backend will run on:** `http://localhost:5000`

### Step 2: Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

**Frontend will run on:** `http://localhost:3000`

## ✅ Verify Installation

### 1. Check Backend

Open browser: `http://localhost:5000/health`

Should see:
```json
{
  "status": "OK",
  "message": "Haramaya Pharmacy API is running"
}
```

### 2. Check Frontend

Open browser: `http://localhost:3000`

Should see the login page.

### 3. Test Login

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

## 📁 Project Structure

```
haramaya-pharmacy-system/
├── api/                    # Backend (Node.js + Express)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── .env
│   ├── database.sql
│   ├── package.json
│   └── server.js
├── frontend/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
└── Documentation files
```

## 🔧 Configuration

### Backend Configuration (api/.env)

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

### Frontend Configuration (frontend/.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 Features Overview

### ✅ Implemented Features

**Backend:**
- User authentication (JWT)
- User management (CRUD)
- Medicine management (CRUD)
- Category management (CRUD)
- Type management (CRUD)
- Supplier management (CRUD)
- Role-based access control
- API documentation

**Frontend:**
- Login/Logout
- Dashboard
- Medicines management (full CRUD)
- Search functionality
- Role-based UI
- Responsive design
- Toast notifications

### 🔄 Coming Soon

- Stock In/Out management
- Prescription management
- Sales processing
- Expiry tracking
- Reports generation
- User management UI
- Supplier management UI

## 👥 User Roles

1. **System Administrator** - Full access
2. **Pharmacist** - Medicine & stock management
3. **Data Clerk / Cashier** - Sales processing
4. **Physician** - Prescription creation
5. **Ward Nurse** - View access
6. **Drug Supplier** - Limited access

## 🔐 Default Accounts

After installation, one admin account is available:

**Admin:**
- Username: `admin`
- Password: `admin123`
- Role: System Administrator

⚠️ **Important:** Change this password after first login!

## 📊 Database Schema

The system uses 16 tables:

1. users
2. roles
3. user_roles
4. medicines
5. medicine_categories
6. medicine_types
7. suppliers
8. stock_inventory
9. stock_in
10. stock_out
11. prescriptions
12. prescription_items
13. sales
14. sale_items
15. expiry_tracking
16. reports

## 🛠️ Development Workflow

### Running Both Servers

**Terminal 1 (Backend):**
```bash
cd api
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Making Changes

1. **Backend changes:**
   - Edit files in `api/` folder
   - Server auto-restarts (nodemon)

2. **Frontend changes:**
   - Edit files in `frontend/src/` folder
   - Browser auto-refreshes (Vite HMR)

## 🧪 Testing the System

### 1. Login

1. Go to `http://localhost:3000`
2. Login with admin credentials
3. You should see the dashboard

### 2. Add Medicine Category

1. Open browser console
2. Run:
```javascript
fetch('http://localhost:5000/api/medicine-categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    name: 'Antibiotics',
    description: 'Medicines for bacterial infections'
  })
})
```

### 3. Add Medicine Type

Similar to category, add types like:
- Tablet
- Syrup
- Injection
- Capsule

### 4. Add Medicine

Use the UI:
1. Click "Medicines" in navbar
2. Click "Add Medicine" button
3. Fill in the form
4. Click "Create"

## 🚨 Troubleshooting

### Backend Issues

**Problem:** Database connection failed

**Solution:**
1. Check if MySQL is running
2. Verify credentials in `api/.env`
3. Ensure database exists

**Problem:** Port 5000 already in use

**Solution:**
1. Change `PORT` in `api/.env` to 5001
2. Update `VITE_API_URL` in `frontend/.env`

### Frontend Issues

**Problem:** Cannot connect to API

**Solution:**
1. Ensure backend is running
2. Check `VITE_API_URL` in `frontend/.env`
3. Check browser console for errors

**Problem:** Port 3000 already in use

**Solution:**
Vite will automatically use next available port (3001, 3002, etc.)

### Common Errors

**Error:** "Module not found"

**Solution:**
```bash
# In api folder
cd api
rm -rf node_modules package-lock.json
npm install

# In frontend folder
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error:** "CORS error"

**Solution:**
Backend already has CORS enabled. Ensure backend is running.

## 📚 Documentation

- **API_DOCUMENTATION.md** - Complete API reference
- **README.md** - Main documentation
- **INSTALLATION.md** - Detailed installation
- **frontend/README.md** - Frontend documentation

## 🎓 Learning Path

### For Beginners

1. Start backend: `cd api && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login and explore the UI
4. Try adding medicines

### For Developers

1. Review `api/` folder structure
2. Review `frontend/src/` folder structure
3. Study API endpoints in `api/routes/`
4. Study React components in `frontend/src/components/`

## 🔄 Next Steps

1. ✅ Change admin password
2. ✅ Add medicine categories
3. ✅ Add medicine types
4. ✅ Add medicines
5. ✅ Add suppliers
6. ✅ Create additional users

## 📞 Support

For help:
- Check troubleshooting section
- Review documentation files
- Contact: support@haramaya.edu

## 🎉 Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can login with admin credentials
- [ ] Can see dashboard
- [ ] Can add/edit/delete medicines
- [ ] No console errors

---

**Congratulations! Your Haramaya Pharmacy System is ready to use! 🚀**

**Backend:** http://localhost:5000  
**Frontend:** http://localhost:3000  
**API Docs:** See API_DOCUMENTATION.md
