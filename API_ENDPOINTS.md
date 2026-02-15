# API Endpoints Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except login) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### POST /api/auth/login
Login to system
- **Access**: Public
- **Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response**:
```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@haramaya.edu",
    "first_name": "System",
    "last_name": "Administrator",
    "roles": ["Administrator"]
  }
}
```

### POST /api/auth/logout
Logout from system
- **Access**: Authenticated users
- **Response**: `{ "message": "Logged out successfully" }`

### GET /api/auth/me
Get current user info
- **Access**: Authenticated users
- **Response**: User object with roles

---

## 2. USER MANAGEMENT ENDPOINTS

### GET /api/users
Get all users
- **Access**: Administrator
- **Query Params**: `page`, `limit`, `search`, `role`
- **Response**: Paginated user list

### POST /api/users
Create new user
- **Access**: Administrator
- **Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "roles": [1, 2]
}
```

### GET /api/users/:id
Get user by ID
- **Access**: Administrator
- **Response**: User object

### PUT /api/users/:id
Update user
- **Access**: Administrator
- **Request Body**: Same as create (password optional)

### DELETE /api/users/:id
Delete user (soft delete)
- **Access**: Administrator
- **Response**: `{ "message": "User deleted" }`

### POST /api/users/:id/roles
Assign roles to user
- **Access**: Administrator
- **Request Body**: `{ "roles": [1, 2, 3] }`

---

## 3. PATIENT MANAGEMENT ENDPOINTS

### GET /api/patients
Get all patients
- **Access**: Physician, Receptionist, Pharmacist
- **Query Params**: `page`, `limit`, `search`
- **Response**: Paginated patient list

### POST /api/patients
Register new patient
- **Access**: Physician, Receptionist
- **Request Body**:
```json
{
  "first_name": "string",
  "last_name": "string",
  "date_of_birth": "YYYY-MM-DD",
  "gender": "Male|Female|Other",
  "phone": "string",
  "email": "string",
  "address": "string",
  "emergency_contact_name": "string",
  "emergency_contact_phone": "string",
  "blood_group": "string",
  "allergies": "string"
}
```

### GET /api/patients/:id
Get patient by ID
- **Access**: Physician, Receptionist, Pharmacist
- **Response**: Patient object with medical history

### PUT /api/patients/:id
Update patient information
- **Access**: Physician, Receptionist
- **Request Body**: Same as create

### GET /api/patients/search
Search patients
- **Access**: Physician, Receptionist, Pharmacist
- **Query Params**: `query` (searches name, patient_id, phone)
- **Response**: Matching patients

---

## 4. DIAGNOSIS ENDPOINTS

### GET /api/diagnoses
Get all diagnoses
- **Access**: Physician
- **Query Params**: `patient_id`, `physician_id`, `date_from`, `date_to`
- **Response**: Diagnosis list

### POST /api/diagnoses
Create diagnosis
- **Access**: Physician
- **Request Body**:
```json
{
  "patient_id": 1,
  "diagnosis_date": "YYYY-MM-DD",
  "symptoms": "string",
  "vital_signs": {
    "blood_pressure": "120/80",
    "temperature": "37.5",
    "pulse": "72",
    "weight": "70"
  },
  "diagnosis": "string",
  "notes": "string"
}
```

### GET /api/diagnoses/:id
Get diagnosis by ID
- **Access**: Physician
- **Response**: Diagnosis object

### GET /api/patients/:id/diagnoses
Get patient diagnosis history
- **Access**: Physician
- **Response**: List of diagnoses for patient

---

## 5. PRESCRIPTION ENDPOINTS

### GET /api/prescriptions
Get all prescriptions
- **Access**: Physician, Pharmacist
- **Query Params**: `status`, `patient_id`, `physician_id`, `date_from`, `date_to`
- **Response**: Prescription list

### POST /api/prescriptions
Create prescription
- **Access**: Physician
- **Request Body**:
```json
{
  "patient_id": 1,
  "diagnosis_id": 1,
  "prescription_date": "YYYY-MM-DD",
  "notes": "string",
  "items": [
    {
      "medicine_id": 1,
      "quantity": 30,
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "instructions": "Take after meals"
    }
  ]
}
```

### GET /api/prescriptions/:id
Get prescription by ID
- **Access**: Physician, Pharmacist
- **Response**: Prescription with items

### POST /api/prescriptions/:id/dispense
Dispense prescription
- **Access**: Pharmacist
- **Request Body**: `{ "notes": "string" }`
- **Response**: Updated prescription with stock changes

### GET /api/prescriptions/pending
Get pending prescriptions
- **Access**: Pharmacist
- **Response**: List of pending prescriptions

---

## 6. MEDICINE MANAGEMENT ENDPOINTS

### GET /api/medicines
Get all medicines
- **Access**: All authenticated users
- **Query Params**: `page`, `limit`, `search`, `category_id`, `type_id`
- **Response**: Paginated medicine list

### POST /api/medicines
Create medicine
- **Access**: Administrator, Inventory Manager
- **Request Body**:
```json
{
  "name": "string",
  "generic_name": "string",
  "category_id": 1,
  "type_id": 1,
  "strength": "500mg",
  "unit": "Tablet",
  "reorder_level": 10,
  "unit_price": 25.50,
  "requires_prescription": true
}
```

### GET /api/medicines/:id
Get medicine by ID
- **Access**: All authenticated users
- **Response**: Medicine object with stock info

### PUT /api/medicines/:id
Update medicine
- **Access**: Administrator, Inventory Manager
- **Request Body**: Same as create

### DELETE /api/medicines/:id
Delete medicine
- **Access**: Administrator
- **Response**: `{ "message": "Medicine deleted" }`

### GET /api/medicines/search
Search medicines
- **Access**: All authenticated users
- **Query Params**: `query`
- **Response**: Matching medicines

### GET /api/medicines/low-stock
Get low stock medicines
- **Access**: Pharmacist, Inventory Manager
- **Response**: Medicines below reorder level

---

## 7. INVENTORY MANAGEMENT ENDPOINTS

### GET /api/inventory
Get current inventory
- **Access**: Pharmacist, Inventory Manager
- **Query Params**: `page`, `limit`, `low_stock`
- **Response**: Stock inventory with medicine details

### GET /api/inventory/:medicine_id
Get stock for specific medicine
- **Access**: Pharmacist, Inventory Manager
- **Response**: Stock details with batch info

### POST /api/inventory/stock-in
Record stock receipt
- **Access**: Inventory Manager
- **Request Body**:
```json
{
  "medicine_id": 1,
  "supplier_id": 1,
  "purchase_order_id": 1,
  "batch_number": "BATCH001",
  "quantity": 100,
  "unit_cost": 20.00,
  "manufacture_date": "YYYY-MM-DD",
  "expiry_date": "YYYY-MM-DD",
  "received_date": "YYYY-MM-DD",
  "notes": "string"
}
```

### GET /api/inventory/expiring
Get expiring medicines
- **Access**: Inventory Manager, Pharmacist
- **Query Params**: `days` (default 90)
- **Response**: Medicines expiring within specified days

### GET /api/inventory/expired
Get expired medicines
- **Access**: Inventory Manager
- **Response**: Expired medicine batches

---

## 8. PURCHASE ORDER ENDPOINTS

### GET /api/purchase-orders
Get all purchase orders
- **Access**: Inventory Manager, Supplier
- **Query Params**: `status`, `supplier_id`, `date_from`, `date_to`
- **Response**: Purchase order list

### POST /api/purchase-orders
Create purchase order
- **Access**: Inventory Manager
- **Request Body**:
```json
{
  "supplier_id": 1,
  "order_date": "YYYY-MM-DD",
  "expected_delivery_date": "YYYY-MM-DD",
  "notes": "string",
  "items": [
    {
      "medicine_id": 1,
      "quantity_ordered": 100,
      "unit_cost": 20.00
    }
  ]
}
```

### GET /api/purchase-orders/:id
Get purchase order by ID
- **Access**: Inventory Manager, Supplier
- **Response**: Purchase order with items

### PUT /api/purchase-orders/:id/confirm
Confirm purchase order (Supplier)
- **Access**: Supplier
- **Request Body**:
```json
{
  "expected_delivery_date": "YYYY-MM-DD",
  "items": [
    {
      "id": 1,
      "unit_cost": 20.00
    }
  ]
}
```

### PUT /api/purchase-orders/:id/approve
Approve purchase order
- **Access**: Inventory Manager
- **Response**: Updated purchase order

### PUT /api/purchase-orders/:id/deliver
Mark as delivered
- **Access**: Supplier
- **Request Body**:
```json
{
  "actual_delivery_date": "YYYY-MM-DD",
  "items": [
    {
      "id": 1,
      "batch_number": "BATCH001",
      "manufacture_date": "YYYY-MM-DD",
      "expiry_date": "YYYY-MM-DD"
    }
  ]
}
```

---

## 9. SUPPLIER ENDPOINTS

### GET /api/suppliers
Get all suppliers
- **Access**: Inventory Manager
- **Query Params**: `page`, `limit`, `search`, `is_active`
- **Response**: Supplier list

### POST /api/suppliers
Create supplier
- **Access**: Administrator, Inventory Manager
- **Request Body**:
```json
{
  "name": "string",
  "contact_person": "string",
  "email": "string",
  "phone": "string",
  "address": "string"
}
```

### GET /api/suppliers/:id
Get supplier by ID
- **Access**: Inventory Manager
- **Response**: Supplier object

### PUT /api/suppliers/:id
Update supplier
- **Access**: Administrator, Inventory Manager
- **Request Body**: Same as create

### DELETE /api/suppliers/:id
Delete supplier
- **Access**: Administrator
- **Response**: `{ "message": "Supplier deleted" }`

---

## 10. BILLING AND PAYMENT ENDPOINTS

### GET /api/invoices
Get all invoices
- **Access**: Cashier, Administrator
- **Query Params**: `status`, `patient_id`, `date_from`, `date_to`
- **Response**: Invoice list

### POST /api/invoices
Generate invoice
- **Access**: Cashier
- **Request Body**:
```json
{
  "patient_id": 1,
  "prescription_id": 1,
  "invoice_date": "YYYY-MM-DD",
  "discount": 0,
  "tax": 0,
  "items": [
    {
      "medicine_id": 1,
      "quantity": 30,
      "unit_price": 25.50
    }
  ]
}
```

### GET /api/invoices/:id
Get invoice by ID
- **Access**: Cashier, Patient (own invoices)
- **Response**: Invoice with items

### POST /api/payments
Record payment
- **Access**: Cashier
- **Request Body**:
```json
{
  "invoice_id": 1,
  "payment_date": "YYYY-MM-DD",
  "payment_method": "Cash|Card|Insurance|Mobile Money",
  "amount_paid": 100.00,
  "notes": "string"
}
```

### GET /api/payments/:id
Get payment by ID
- **Access**: Cashier, Administrator
- **Response**: Payment object

---

## 11. REPORT ENDPOINTS

### GET /api/reports/sales
Generate sales report
- **Access**: Cashier, Administrator
- **Query Params**: `date_from`, `date_to`, `format` (json|pdf|excel)
- **Response**: Sales report data

### GET /api/reports/inventory
Generate inventory report
- **Access**: Inventory Manager, Administrator
- **Query Params**: `category_id`, `low_stock`, `format`
- **Response**: Inventory report data

### GET /api/reports/prescriptions
Generate prescription report
- **Access**: Physician, Administrator
- **Query Params**: `physician_id`, `date_from`, `date_to`, `format`
- **Response**: Prescription report data

### GET /api/reports/expiry
Generate expiry report
- **Access**: Inventory Manager, Pharmacist
- **Query Params**: `days`, `format`
- **Response**: Expiring medicines report

### GET /api/reports/financial
Generate financial report
- **Access**: Administrator
- **Query Params**: `date_from`, `date_to`, `format`
- **Response**: Financial summary report

---

## 12. CATEGORY AND TYPE ENDPOINTS

### GET /api/medicine-categories
Get all categories
- **Access**: All authenticated users
- **Response**: Category list

### POST /api/medicine-categories
Create category
- **Access**: Administrator
- **Request Body**: `{ "name": "string" }`

### PUT /api/medicine-categories/:id
Update category
- **Access**: Administrator
- **Request Body**: `{ "name": "string" }`

### DELETE /api/medicine-categories/:id
Delete category
- **Access**: Administrator

### GET /api/medicine-types
Get all types
- **Access**: All authenticated users
- **Response**: Type list

### POST /api/medicine-types
Create type
- **Access**: Administrator
- **Request Body**: `{ "name": "string" }`

### PUT /api/medicine-types/:id
Update type
- **Access**: Administrator

### DELETE /api/medicine-types/:id
Delete type
- **Access**: Administrator

---

## 13. ROLE ENDPOINTS

### GET /api/roles
Get all roles
- **Access**: Administrator
- **Response**: Role list

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

---

## Document Status
- **Version**: 1.0
- **Date**: February 15, 2026
