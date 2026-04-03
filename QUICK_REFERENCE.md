# Quick Reference Guide

## 📋 Document Index

### Core Documentation
1. **REDESIGN_COMPLETE.md** - Start here! Complete summary of the redesign
2. **REDESIGN_OVERVIEW.md** - High-level system overview
3. **IMPLEMENTATION_ROADMAP.md** - 14-week implementation plan

### Technical Specifications
4. **UML_USE_CASES.md** - All 40+ use cases with proper UML modeling
5. **ER_DIAGRAM_STRUCTURE.md** - Complete database ER diagram
6. **DATABASE_SCHEMA.sql** - Executable SQL schema (25+ tables)
7. **API_ENDPOINTS.md** - 80+ RESTful API endpoints

### Implementation Guides
8. **AUTH_IMPLEMENTATION.md** - JWT authentication & RBAC
9. **MVC_IMPLEMENTATION_GUIDE.md** - Complete MVC code examples

---

## 🎯 System Actors Quick Reference

| Actor | Primary Functions | Key Endpoints |
|-------|------------------|---------------|
| **Administrator** | User management, roles, system config | `/api/users`, `/api/roles` |
| **Physician** | Patient registration, diagnosis, prescriptions | `/api/patients`, `/api/diagnoses`, `/api/prescriptions` |
| **Pharmacist** | View prescriptions, dispense drugs | `/api/prescriptions`, `/api/inventory` |
| **Receptionist** | Patient registration, search | `/api/patients` |
| **Inventory Manager** | Stock management, purchase orders | `/api/inventory`, `/api/purchase-orders` |
| **Supplier** | Receive orders, confirm, deliver | `/api/purchase-orders` |
| **Patient** | View prescriptions, billing | `/api/prescriptions`, `/api/invoices` |
| **Cashier** | Generate invoices, process payments | `/api/invoices`, `/api/payments` |

---

## 🗄️ Database Tables Quick Reference

### User Management (3 tables)
- `users` - System users
- `roles` - User roles
- `user_roles` - User-role assignments

### Patient Management (2 tables)
- `patients` - Patient records
- `diagnoses` - Diagnosis records

### Medicine Management (3 tables)
- `medicines` - Medicine master data
- `medicine_categories` - Categories
- `medicine_types` - Types (tablet, syrup, etc.)

### Prescription Management (2 tables)
- `prescriptions` - Prescription headers
- `prescription_items` - Prescription line items

### Inventory Management (4 tables)
- `stock_inventory` - Current stock levels
- `stock_in` - Stock receiving
- `stock_out` - Stock dispensing/wastage
- `expiry_tracking` - Expiry monitoring

### Purchase Management (3 tables)
- `suppliers` - Supplier information
- `purchase_orders` - Purchase order headers
- `purchase_order_items` - Purchase order line items

### Billing Management (4 tables)
- `invoices` - Invoice headers
- `invoice_items` - Invoice line items
- `payments` - Payment transactions

### Reporting (2 tables)
- `reports` - Report generation log
- `audit_log` - System audit trail

---

## 🔐 Authentication Flow

```
1. User submits credentials → POST /api/auth/login
2. Server validates credentials
3. Server generates JWT token
4. Client stores token in localStorage
5. Client includes token in Authorization header
6. Server validates token on each request
7. Server checks user roles for authorization
```

---

## 🚀 Quick Start Commands

### Database Setup
```bash
mysql -u root -p
CREATE DATABASE haramaya_pharmacy;
USE haramaya_pharmacy;
SOURCE DATABASE_SCHEMA.sql;
```

### Backend Setup
```bash
cd api
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL
npm run dev
```

---

## 📊 Common SQL Queries

### Get all pending prescriptions
```sql
SELECT p.*, CONCAT(pat.first_name, ' ', pat.last_name) AS patient_name
FROM prescriptions p
JOIN patients pat ON p.patient_id = pat.id
WHERE p.status = 'Pending';
```

### Get low stock medicines
```sql
SELECT m.name, si.quantity_available, m.reorder_level
FROM medicines m
LEFT JOIN stock_inventory si ON m.id = si.medicine_id
WHERE si.quantity_available <= m.reorder_level;
```

### Get expiring medicines (next 90 days)
```sql
SELECT m.name, et.batch_number, et.expiry_date, et.quantity_remaining
FROM expiry_tracking et
JOIN medicines m ON et.medicine_id = m.id
WHERE et.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
ORDER BY et.expiry_date;
```

---

## 🔧 Common API Calls

### Login
```javascript
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

### Create Patient
```javascript
POST /api/patients
Headers: { Authorization: "Bearer <token>" }
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "gender": "Male",
  "phone": "0912345678"
}
```

### Create Prescription
```javascript
POST /api/prescriptions
Headers: { Authorization: "Bearer <token>" }
{
  "patient_id": 1,
  "prescription_date": "2026-02-15",
  "items": [
    {
      "medicine_id": 1,
      "quantity": 30,
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days"
    }
  ]
}
```

### Dispense Prescription
```javascript
POST /api/prescriptions/:id/dispense
Headers: { Authorization: "Bearer <token>" }
{
  "notes": "Dispensed to patient"
}
```

---

## 🎨 Frontend Route Structure

```
/login                          - Login page
/dashboard                      - Dashboard (all roles)
/patients                       - Patient list
/patients/new                   - Register patient
/patients/:id                   - Patient details
/diagnoses/new                  - Create diagnosis
/prescriptions                  - Prescription list
/prescriptions/new              - Create prescription
/prescriptions/:id/dispense     - Dispense prescription
/medicines                      - Medicine list
/inventory                      - Inventory dashboard
/purchase-orders                - Purchase order list
/suppliers                      - Supplier list
/invoices                       - Invoice list
/payments                       - Payment list
/reports                        - Reports dashboard
/users                          - User management (Admin only)
```

---

## 🛡️ Role-Based Access Control

### Route Protection Example
```javascript
// Require authentication
router.use(authenticate);

// Administrator only
router.get('/users', authorize('Administrator'), userController.getAll);

// Multiple roles allowed
router.post('/patients', 
  authorize('Physician', 'Receptionist'), 
  patientController.create
);

// Permission-based
router.post('/medicines', 
  checkPermission('manage_medicines'), 
  medicineController.create
);
```

---

## 📈 Implementation Phases

| Phase | Duration | Focus | Deliverable |
|-------|----------|-------|-------------|
| 1 | Week 1 | Database | Schema created |
| 2 | Week 2-3 | Backend Core | Auth & Users |
| 3 | Week 4 | Patient Module | Patient CRUD |
| 4 | Week 5 | Prescription | Prescription workflow |
| 5 | Week 6 | Inventory | Stock management |
| 6 | Week 7 | Billing | Invoice & Payment |
| 7 | Week 8 | Reporting | All reports |
| 8 | Week 9-12 | Frontend | All UI pages |
| 9 | Week 13 | Testing | Integration tests |
| 10 | Week 14 | Deployment | Production ready |

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**: Check `.env` file has correct credentials
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=haramaya_pharmacy
```

### Issue: "Token expired"
**Solution**: Login again to get new token

### Issue: "Access denied"
**Solution**: Check user has required role for the endpoint

### Issue: "Foreign key constraint fails"
**Solution**: Ensure referenced record exists before creating

---

## 📞 Support Resources

### Documentation Files
- Read `REDESIGN_COMPLETE.md` for overview
- Check `API_ENDPOINTS.md` for endpoint details
- Review `AUTH_IMPLEMENTATION.md` for security
- Follow `IMPLEMENTATION_ROADMAP.md` for steps

### Code Examples
- See `MVC_IMPLEMENTATION_GUIDE.md` for complete examples
- Check existing controllers for patterns
- Review middleware for authentication/authorization

---

## ✅ Pre-Deployment Checklist

### Backend
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] JWT secret changed from default
- [ ] CORS configured for production domain
- [ ] Error logging enabled
- [ ] API endpoints tested

### Frontend
- [ ] API URL points to production
- [ ] Build created (`npm run build`)
- [ ] Assets optimized
- [ ] Environment variables set

### Database
- [ ] Backup strategy in place
- [ ] Indexes created
- [ ] User permissions set correctly
- [ ] Sample data removed (if needed)

### Security
- [ ] HTTPS enabled
- [ ] Strong passwords enforced
- [ ] Rate limiting configured
- [ ] Input validation active
- [ ] SQL injection prevention verified

---

## 🎓 Learning Resources

### Node.js & Express
- Express.js documentation: https://expressjs.com
- Node.js best practices

### React
- React documentation: https://react.dev
- React Router documentation

### MySQL
- MySQL documentation: https://dev.mysql.com/doc
- SQL optimization techniques

### JWT Authentication
- JWT.io: https://jwt.io
- OAuth 2.0 and OpenID Connect

---

## Document Status
- **Version**: 1.0
- **Date**: February 15, 2026
- **Purpose**: Quick reference for developers
