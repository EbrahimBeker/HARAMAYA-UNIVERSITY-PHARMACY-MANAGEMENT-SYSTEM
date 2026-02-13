# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ installed and running

## Step 1: Install Dependencies

### Backend
```bash
cd api
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Configure Database

1. Make sure MySQL is running
2. Edit `api/.env` if needed (default uses root with no password)
3. The database will be created automatically when you start the backend!

## Step 3: Start the Servers

### Terminal 1 - Backend
```bash
cd api
npm run dev
```

Wait for: `✓ Database initialization completed` and `🚀 Server running on port 5000`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## Step 4: Access the Application

1. Open browser: http://localhost:5173 (or the port shown in terminal)
2. Login with:
   - Username: `admin`
   - Password: `admin123`

## ✅ That's it!

The system is now running with:
- ✅ Database automatically created
- ✅ Tables automatically created
- ✅ Admin user automatically created
- ✅ Default roles automatically created

## 📝 Next Steps

1. Change admin password
2. Add medicine categories (e.g., Antibiotics, Painkillers)
3. Add medicine types (e.g., Tablet, Syrup, Injection)
4. Add medicines

## 🔧 Troubleshooting

**MySQL Connection Error?**
- Check if MySQL is running
- Verify credentials in `api/.env`

**Port Already in Use?**
- Backend: Change PORT in `api/.env`
- Frontend: Vite will auto-select next available port

**Need Help?**
See `FULL_SETUP_GUIDE.md` for detailed documentation.
