# API Documentation - Haramaya Pharmacy Backend

## Base URL

```
http://localhost:5000/api
```

## Authentication

All endpoints except `/auth/login` require authentication using JWT Bearer token.

**Header Format:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Authentication Endpoints

### 1.1 Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
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

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Account deactivated

### 1.2 Logout

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### 1.3 Get Current User

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@haramaya.edu",
    "first_name": "System",
    "last_name": "Administrator",
    "full_name": "System Administrator",
    "roles": ["System Administrator"]
  }
}
```

---

## 2. User Management (Admin Only)

### 2.1 List Users

**Endpoint:** `GET /api/users`

**Authentication:** Required (System Administrator)

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 15)
- `search` (optional) - Search term
- `role` (optional) - Filter by role name

**Example:**
```
GET /api/users?page=1&limit=10&search=john&role=Pharmacist
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 2,
      "username": "pharmacist1",
      "email": "pharmacist@haramaya.edu",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+251911234567",
      "is_active": true,
      "created_at": "2024-02-07T10:00:00.000Z",
      "roles": ["Pharmacist"]
    }
  ]
}
```

### 2.2 Create User

**Endpoint:** `POST /api/users`

**Authentication:** Required (System Administrator)

**Request Body:**
```json
{
  "username": "pharmacist1",
  "email": "pharmacist@haramaya.edu",
  "password": "secure-password",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+251911234567",
  "role_ids": [2]
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "username": "pharmacist1",
    "email": "pharmacist@haramaya.edu",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+251911234567",
    "is_active": true,
    "roles": ["Pharmacist"]
  }
}
```

### 2.3 Get User

**Endpoint:** `GET /api/users/:id`

**Authentication:** Required (System Administrator)

**Response (200 OK):**
```json
{
  "id": 2,
  "username": "pharmacist1",
  "email": "pharmacist@haramaya.edu",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+251911234567",
  "is_active": true,
  "roles": ["Pharmacist"],
  "role_ids": [2]
}
```

### 2.4 Update User

**Endpoint:** `PUT /api/users/:id`

**Authentication:** Required (System Administrator)

**Request Body (all fields optional):**
```json
{
  "username": "pharmacist1_updated",
  "email": "new-email@haramaya.edu",
  "password": "new-password",
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+251911234568",
  "is_active": true,
  "role_ids": [2, 3]
}
```

**Response (200 OK):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 2,
    "username": "pharmacist1_updated",
    "roles": ["Pharmacist", "Data Clerk / Cashier"]
  }
}
```

### 2.5 Delete User

**Endpoint:** `DELETE /api/users/:id`

**Authentication:** Required (System Administrator)

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

**Error:** Cannot delete own account (403 Forbidden)

---

## 3. Medicine Management

### 3.1 List Medicines

**Endpoint:** `GET /api/medicines`

**Authentication:** Required

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page
- `search` (optional) - Search by name or generic name
- `category_id` (optional) - Filter by category
- `type_id` (optional) - Filter by type

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Paracetamol",
      "generic_name": "Acetaminophen",
      "category_id": 1,
      "category_name": "Analgesics",
      "type_id": 1,
      "type_name": "Tablet",
      "strength": "500mg",
      "unit": "tablet",
      "description": "Pain reliever and fever reducer",
      "reorder_level": 100,
      "unit_price": 0.50,
      "requires_prescription": false,
      "quantity_available": 500
    }
  ]
}
```

### 3.2 Create Medicine

**Endpoint:** `POST /api/medicines`

**Authentication:** Required (System Administrator or Pharmacist)

**Request Body:**
```json
{
  "name": "Paracetamol",
  "generic_name": "Acetaminophen",
  "category_id": 1,
  "type_id": 1,
  "strength": "500mg",
  "unit": "tablet",
  "description": "Pain reliever",
  "reorder_level": 100,
  "unit_price": 0.50,
  "requires_prescription": false
}
```

**Response (201 Created):**
```json
{
  "message": "Medicine created successfully",
  "medicine": {
    "id": 1,
    "name": "Paracetamol",
    "quantity_available": 0
  }
}
```

### 3.3 Search Medicines

**Endpoint:** `GET /api/medicines/search`

**Authentication:** Required

**Query Parameters:**
- `query` (required) - Search term (min 2 characters)

**Example:**
```
GET /api/medicines/search?query=para
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Paracetamol",
    "generic_name": "Acetaminophen",
    "category_name": "Analgesics",
    "type_name": "Tablet",
    "quantity_available": 500
  }
]
```

### 3.4 Get Medicine

**Endpoint:** `GET /api/medicines/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Paracetamol",
  "generic_name": "Acetaminophen",
  "category_id": 1,
  "category_name": "Analgesics",
  "type_id": 1,
  "type_name": "Tablet",
  "strength": "500mg",
  "unit": "tablet",
  "unit_price": 0.50,
  "quantity_available": 500
}
```

### 3.5 Update Medicine

**Endpoint:** `PUT /api/medicines/:id`

**Authentication:** Required (System Administrator or Pharmacist)

**Request Body (all fields optional):**
```json
{
  "name": "Paracetamol 500mg",
  "unit_price": 0.60,
  "reorder_level": 150
}
```

**Response (200 OK):**
```json
{
  "message": "Medicine updated successfully",
  "medicine": {
    "id": 1,
    "name": "Paracetamol 500mg"
  }
}
```

### 3.6 Delete Medicine

**Endpoint:** `DELETE /api/medicines/:id`

**Authentication:** Required (System Administrator or Pharmacist)

**Response (200 OK):**
```json
{
  "message": "Medicine deleted successfully"
}
```

**Error:** Cannot delete medicine with existing stock (422)

---

## 4. Medicine Categories

### 4.1 List Categories

**Endpoint:** `GET /api/medicine-categories`

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Analgesics",
    "description": "Pain relievers",
    "medicines_count": 5,
    "created_at": "2024-02-07T10:00:00.000Z"
  }
]
```

### 4.2 Create Category

**Endpoint:** `POST /api/medicine-categories`

**Authentication:** Required (System Administrator or Pharmacist)

**Request Body:**
```json
{
  "name": "Antibiotics",
  "description": "Medicines used to treat bacterial infections"
}
```

**Response (201 Created):**
```json
{
  "message": "Category created successfully",
  "category": {
    "id": 2,
    "name": "Antibiotics",
    "description": "Medicines used to treat bacterial infections"
  }
}
```

### 4.3 Update Category

**Endpoint:** `PUT /api/medicine-categories/:id`

**Authentication:** Required (System Administrator or Pharmacist)

**Request Body:**
```json
{
  "name": "Antibiotics (Updated)",
  "description": "Updated description"
}
```

### 4.4 Delete Category

**Endpoint:** `DELETE /api/medicine-categories/:id`

**Authentication:** Required (System Administrator or Pharmacist)

**Response (200 OK):**
```json
{
  "message": "Category deleted successfully"
}
```

**Error:** Cannot delete category with associated medicines (422)

---

## 5. Medicine Types

### 5.1 List Types

**Endpoint:** `GET /api/medicine-types`

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Tablet",
    "description": "Solid dosage form",
    "medicines_count": 10
  }
]
```

### 5.2 Create Type

**Endpoint:** `POST /api/medicine-types`

**Authentication:** Required (System Administrator or Pharmacist)

**Request Body:**
```json
{
  "name": "Syrup",
  "description": "Liquid dosage form"
}
```

### 5.3 Update Type

**Endpoint:** `PUT /api/medicine-types/:id`

**Authentication:** Required (System Administrator or Pharmacist)

### 5.4 Delete Type

**Endpoint:** `DELETE /api/medicine-types/:id`

**Authentication:** Required (System Administrator or Pharmacist)

---

## 6. Suppliers

### 6.1 List Suppliers

**Endpoint:** `GET /api/suppliers`

**Authentication:** Required

**Query Parameters:**
- `page`, `limit`, `search`, `is_active`

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Ethiopian Pharmaceuticals",
      "contact_person": "Abebe Kebede",
      "email": "contact@epharm.et",
      "phone": "+251116123456",
      "address": "Addis Ababa, Ethiopia",
      "is_active": true
    }
  ]
}
```

### 6.2 Create Supplier

**Endpoint:** `POST /api/suppliers`

**Authentication:** Required (System Administrator or Pharmacist)

**Request Body:**
```json
{
  "name": "Ethiopian Pharmaceuticals",
  "contact_person": "Abebe Kebede",
  "email": "contact@epharm.et",
  "phone": "+251116123456",
  "address": "Addis Ababa, Ethiopia"
}
```

### 6.3 Get Supplier

**Endpoint:** `GET /api/suppliers/:id`

**Authentication:** Required

### 6.4 Update Supplier

**Endpoint:** `PUT /api/suppliers/:id`

**Authentication:** Required (System Administrator or Pharmacist)

### 6.5 Delete Supplier

**Endpoint:** `DELETE /api/suppliers/:id`

**Authentication:** Required (System Administrator or Pharmacist)

---

## Error Responses

### Common Error Codes

**400 Bad Request**
```json
{
  "message": "Invalid request data"
}
```

**401 Unauthorized**
```json
{
  "message": "No token provided"
}
```

**403 Forbidden**
```json
{
  "message": "Access denied. Required role: System Administrator"
}
```

**404 Not Found**
```json
{
  "message": "Resource not found"
}
```

**422 Validation Error**
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Valid email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

**500 Internal Server Error**
```json
{
  "message": "Internal server error"
}
```

---

## Role IDs

Use these IDs when assigning roles:

1. System Administrator
2. Pharmacist
3. Data Clerk / Cashier
4. Physician
5. Ward Nurse
6. Drug Supplier

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Users (with token)
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Medicine
```bash
curl -X POST http://localhost:5000/api/medicines \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Paracetamol",
    "category_id": 1,
    "type_id": 1,
    "unit": "tablet",
    "unit_price": 0.50
  }'
```

---

**API Version:** 1.0.0  
**Last Updated:** February 2024
