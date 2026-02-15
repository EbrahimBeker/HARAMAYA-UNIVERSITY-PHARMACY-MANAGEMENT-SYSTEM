# Web-Based Pharmacy Management System - Professional Redesign

## Document Overview
Complete professional redesign of the Haramaya University Pharmacy Management System according to software engineering best practices and proper UML modeling principles.

---

## 1. SYSTEM ARCHITECTURE

### Technology Stack
- **Backend**: Node.js with Express.js (MVC Architecture)
- **Database**: MySQL 8.0+
- **Frontend**: React 18+ with Vite
- **Authentication**: JWT (JSON Web Tokens)
- **API Design**: RESTful principles
- **Security**: bcrypt for password hashing, helmet for HTTP headers

### Architecture Pattern
```
Presentation Layer (React Frontend - SPA)
           ↓ HTTP/REST API
Application Layer (Express.js - Node.js)
  Routes → Controllers → Middleware
           ↓ SQL Queries
Data Layer (MySQL Database)
  Normalized Relational Schema
```

---

## 2. SYSTEM ACTORS (CORRECTED)

The system has **8 primary actors** with distinct responsibilities:

### 2.1 Administrator
- Manage all users (CRUD operations)
- Assign and revoke roles
- Manage drug categories and types
- View comprehensive system reports
- Configure system settings
- Backup and restore database

### 2.2 Physician
- Register new patients
- Diagnose patients (record symptoms, vital signs)
- Create prescriptions with multiple medicines
- View patient medical history
- Update diagnosis records

### 2.3 Pharmacist
- View pending prescriptions
- Verify prescription validity
- Dispense drugs to patients
- Check drug availability and stock levels
- Update stock after dispensing
- Generate dispensing reports

### 2.4 Receptionist
- Register new patients
- Update patient information
- Search and retrieve patient records
- Schedule appointments
- Manage patient queue
- Print patient cards

### 2.5 Inventory Manager
- Create purchase orders
- Manage drug inventory (add/update/remove)
- Track drug expiry dates
- Approve supplier orders
- Receive stock deliveries
- Generate inventory reports
- Set reorder levels

### 2.6 Supplier
- Receive purchase orders
- Confirm order availability
- Set delivery dates
- Update order status
- Deliver drugs with batch information
- Submit invoices

### 2.7 Patient
- View own prescriptions
- View billing details
- View medical history
- Update contact information
- Request prescription refills

### 2.8 Cashier
- Generate invoices for prescriptions
- Receive payments (cash/card/insurance)
- Print receipts
- Process refunds
- View sales reports
- Generate daily cash reports

---

## 3. KEY IMPROVEMENTS

### 3.1 Proper Actor Modeling
- ✅ Removed incorrect "Login includes all use cases" pattern
- ✅ Each actor has direct relationships with their use cases
- ✅ Authentication handled as middleware, not as parent use case
- ✅ Clear separation of responsibilities per actor

### 3.2 Database Normalization
- ✅ 3rd Normal Form achieved
- ✅ Proper foreign key relationships
- ✅ Junction tables for many-to-many relationships
- ✅ Timestamps and soft deletes

### 3.3 MVC Architecture
- ✅ Clear separation: Routes → Controllers → Database
- ✅ Middleware for cross-cutting concerns
- ✅ Reusable validation and error handling
- ✅ Modular and scalable structure

### 3.4 Security Enhancements
- ✅ JWT-based authentication
- ✅ Role-based authorization
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ SQL injection prevention

---

## Document Status
- **Version**: 1.0
- **Date**: February 15, 2026
- **Status**: Complete Professional Redesign
