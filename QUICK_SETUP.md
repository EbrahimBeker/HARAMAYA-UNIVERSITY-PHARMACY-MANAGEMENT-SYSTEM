# 🚀 Quick Setup Guide

## Pharmacy Management System - RBAC

### ⚡ **One-Command Setup**

From the `api` directory, run:

```bash
cd api
npm run setup
```

This single command will:

- ✅ Run RBAC migration
- ✅ Create all 5 role-based users
- ✅ Seed sample data (medicines, suppliers, etc.)
- ✅ Display all login credentials

---

## 🔐 **Default Login Credentials**

After setup, use these credentials:

| Role              | Username     | Password    |
| ----------------- | ------------ | ----------- |
| **Admin**         | `admin`      | `admin123`  |
| **Data Clerk**    | `clerk`      | `clerk123`  |
| **Physician**     | `doctor`     | `doctor123` |
| **Pharmacist**    | `pharmacist` | `pharma123` |
| **Drug Supplier** | `supplier`   | `supply123` |

---

## 🏃‍♂️ **Start the System**

### 1. Start Backend (from api directory):

```bash
npm start
```

### 2. Start Frontend (from frontend directory):

```bash
cd ../frontend
npm run dev
```

### 3. Access the Application:

- **URL:** `http://localhost:5173`
- **Login:** Use any credentials above
- **Auto-redirect:** Each role goes to their specific dashboard

---

## 🛠️ **Individual Setup Commands**

If you prefer step-by-step setup:

```bash
cd api

# 1. RBAC Migration only
npm run setup:rbac

# 2. Create users only
npm run seed:users

# 3. Add sample data only
npm run seed:data
```

---

## ❌ **Troubleshooting**

### **"Cannot find module" Error:**

- Make sure you're in the `api` directory
- Run `npm install` first
- Check that `.env` file exists with database credentials

### **Database Connection Error:**

- Verify MySQL is running
- Check database credentials in `api/.env`
- Create database: `CREATE DATABASE haramaya_pharmacy;`

### **"Users already exist" Message:**

- This is normal if you've run setup before
- The script will show existing credentials
- To reset: drop and recreate the database

---

## 🎯 **What Gets Created**

### **Database Tables:**

- Users with roles and permissions
- Medicine categories and types
- Sample medicines with stock
- Suppliers and purchase orders
- Patient records structure

### **User Accounts:**

- 5 role-based users with hashed passwords
- Proper role assignments and permissions
- Ready-to-use login credentials

### **Sample Data:**

- 8 sample medicines with stock levels
- 10 medicine categories
- 10 medicine types
- 3 suppliers with contact info

---

## 🎉 **Success!**

When setup completes successfully, you'll see:

- ✅ All login credentials displayed
- ✅ System summary with counts
- ✅ Next steps to start the servers

**Ready to test the complete RBAC system!** 🚀
