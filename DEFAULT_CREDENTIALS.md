# 🔐 Default Login Credentials

## Pharmacy Management System - RBAC

### 🎯 Default User Accounts

After running the setup migration (`node setup-rbac.js`), the following default users are created:

---

## 👑 **ADMIN**

- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@pharmacy.com`
- **Role:** Admin
- **Access:** Full system access, user management, reports, backup/restore

---

## 📋 **DATA CLERK**

- **Username:** `clerk`
- **Password:** `clerk123`
- **Email:** `clerk@pharmacy.com`
- **Role:** Data Clerk
- **Access:** Patient registration, billing, patient reports

---

## 🩺 **PHYSICIAN**

- **Username:** `doctor`
- **Password:** `doctor123`
- **Email:** `doctor@pharmacy.com`
- **Role:** Physician
- **Access:** Patient diagnosis, prescription creation, patient history

---

## 💊 **PHARMACIST**

- **Username:** `pharmacist`
- **Password:** `pharma123`
- **Email:** `pharmacist@pharmacy.com`
- **Role:** Pharmacist
- **Access:** Medicine dispensing, inventory management, stock reports

---

## 🚚 **DRUG SUPPLIER**

- **Username:** `supplier`
- **Password:** `supply123`
- **Email:** `supplier@pharmacy.com`
- **Role:** Drug Supplier
- **Access:** Purchase orders, availability confirmation, delivery tracking

---

## 🚀 **Quick Start**

1. **Start the system:**

   ```bash
   # Backend
   cd api && npm start

   # Frontend
   cd frontend && npm run dev
   ```

2. **Access the application:**
   - URL: `http://localhost:5173`
   - Choose any of the credentials above

3. **Role-based redirection:**
   - Each role automatically redirects to their specific dashboard
   - Admin → Admin Dashboard
   - Data Clerk → Data Clerk Dashboard
   - Physician → Physician Dashboard
   - Pharmacist → Pharmacist Dashboard
   - Drug Supplier → Supplier Dashboard

---

## 🔒 **Security Notes**

### ⚠️ **IMPORTANT: Change Default Passwords**

- These are default credentials for development/testing
- **Change all passwords immediately in production**
- Use strong, unique passwords for each account

### 🛡️ **Password Requirements**

- Minimum 8 characters
- Use bcrypt hashing (10 salt rounds)
- JWT tokens expire in 24 hours

### 🔐 **Production Security**

- Update JWT_SECRET in `.env`
- Use HTTPS in production
- Implement password complexity rules
- Enable account lockout after failed attempts
- Regular security audits

---

## 📊 **Role Permissions Matrix**

| Permission           | Admin | Data Clerk | Physician | Pharmacist | Supplier |
| -------------------- | ----- | ---------- | --------- | ---------- | -------- |
| Manage Users         | ✅    | ❌         | ❌        | ❌         | ❌       |
| Register Patients    | ✅    | ✅         | ❌        | ❌         | ❌       |
| Create Diagnosis     | ✅    | ❌         | ✅        | ❌         | ❌       |
| Create Prescription  | ✅    | ❌         | ✅        | ❌         | ❌       |
| Dispense Medicine    | ✅    | ❌         | ❌        | ✅         | ❌       |
| Manage Inventory     | ✅    | ❌         | ❌        | ✅         | ❌       |
| View Purchase Orders | ✅    | ❌         | ❌        | ✅         | ✅       |
| System Backup        | ✅    | ❌         | ❌        | ❌         | ❌       |
| View All Reports     | ✅    | ❌         | ❌        | ❌         | ❌       |

---

## 🔄 **Creating Additional Users**

### Via Admin Dashboard:

1. Login as admin
2. Navigate to User Management
3. Click "Add New User"
4. Fill user details and assign roles
5. User receives login credentials

### Via Database:

```sql
-- Example: Create new pharmacist
INSERT INTO users (username, email, password, first_name, last_name, is_active)
VALUES ('newuser', 'user@email.com', '$2a$10$hashedpassword', 'First', 'Last', 1);

-- Assign role (4 = Pharmacist)
INSERT INTO user_roles (user_id, role_id)
VALUES (LAST_INSERT_ID(), 4);
```

---

## 🧪 **Testing Different Roles**

### Test Workflow:

1. **Login as Data Clerk** → Register a patient
2. **Login as Physician** → Create diagnosis and prescription
3. **Login as Pharmacist** → Dispense prescription
4. **Login as Admin** → View all reports and activities
5. **Login as Supplier** → Check purchase orders

### Sample Test Data:

- Run `node api/seed-users.js` for users
- Run `node api/seed-complete-data.js` for sample data
- Includes patients, medicines, suppliers, and purchase orders

---

## 📞 **Support**

If you encounter login issues:

1. Verify database connection
2. Check if migration ran successfully
3. Confirm user exists: `SELECT * FROM users;`
4. Check role assignment: `SELECT * FROM user_roles;`
5. Clear browser localStorage and try again

---

## 🎉 **Ready to Use!**

Your Pharmacy Management System is now ready with:

- ✅ 5 role-based user accounts
- ✅ Secure authentication system
- ✅ Role-specific dashboards
- ✅ Permission-based access control
- ✅ Complete workflow from patient registration to medicine dispensing

**Happy coding! 🚀**
