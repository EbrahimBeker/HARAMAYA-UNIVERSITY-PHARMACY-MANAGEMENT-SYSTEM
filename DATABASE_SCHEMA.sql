-- ============================================================================
-- HARAMAYA UNIVERSITY PHARMACY MANAGEMENT SYSTEM
-- Complete Database Schema (Normalized to 3NF)
-- MySQL 8.0+
-- ============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS haramaya_pharmacy 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE haramaya_pharmacy;

-- ============================================================================
-- 1. USER MANAGEMENT TABLES
-- ============================================================================

-- Roles Table
CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB COMMENT='System roles for RBAC';

-- Users Table
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
) ENGINE=InnoDB COMMENT='System users';

-- User Roles Junction Table
CREATE TABLE user_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT UNSIGNED,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_user (user_id),
    INDEX idx_role (role_id)
) ENGINE=InnoDB COMMENT='User role assignments';

-- ============================================================================
-- 2. PATIENT MANAGEMENT TABLES
-- ============================================================================

-- Patients Table
CREATE TABLE patients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    blood_group VARCHAR(5),
    allergies TEXT,
    registered_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (registered_by) REFERENCES users(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_name (last_name, first_name),
    INDEX idx_phone (phone)
) ENGINE=InnoDB COMMENT='Patient records';

-- Diagnoses Table
CREATE TABLE diagnoses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    physician_id BIGINT UNSIGNED NOT NULL,
    diagnosis_date DATE NOT NULL,
    symptoms TEXT NOT NULL,
    vital_signs JSON,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (physician_id) REFERENCES users(id),
    INDEX idx_patient (patient_id),
    INDEX idx_physician (physician_id),
    INDEX idx_date (diagnosis_date)
) ENGINE=InnoDB COMMENT='Patient diagnosis records';

-- ============================================================================
-- 3. MEDICINE MANAGEMENT TABLES
-- ============================================================================

-- Medicine Categories
CREATE TABLE medicine_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_name (name)
) ENGINE=InnoDB COMMENT='Medicine categories';

-- Medicine Types
CREATE TABLE medicine_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_name (name)
) ENGINE=InnoDB COMMENT='Medicine types (tablet, syrup, injection, etc.)';

-- Medicines
CREATE TABLE medicines (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    category_id BIGINT UNSIGNED NOT NULL,
    type_id BIGINT UNSIGNED NOT NULL,
    strength VARCHAR(50),
    unit VARCHAR(20) NOT NULL,
    reorder_level INT DEFAULT 10,
    unit_price DECIMAL(10,2) NOT NULL,
    requires_prescription BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES medicine_categories(id),
    FOREIGN KEY (type_id) REFERENCES medicine_types(id),
    INDEX idx_name (name),
    INDEX idx_generic_name (generic_name),
    INDEX idx_category (category_id),
    INDEX idx_type (type_id)
) ENGINE=InnoDB COMMENT='Medicine master data';

-- ============================================================================
-- 4. PRESCRIPTION MANAGEMENT TABLES
-- ============================================================================

-- Prescriptions
CREATE TABLE prescriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    prescription_number VARCHAR(20) UNIQUE NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    diagnosis_id BIGINT UNSIGNED,
    physician_id BIGINT UNSIGNED NOT NULL,
    prescription_date DATE NOT NULL,
    status ENUM('Pending', 'Dispensed', 'Cancelled') DEFAULT 'Pending',
    notes TEXT,
    dispensed_by BIGINT UNSIGNED,
    dispensed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE SET NULL,
    FOREIGN KEY (physician_id) REFERENCES users(id),
    FOREIGN KEY (dispensed_by) REFERENCES users(id),
    INDEX idx_prescription_number (prescription_number),
    INDEX idx_patient (patient_id),
    INDEX idx_physician (physician_id),
    INDEX idx_status (status),
    INDEX idx_date (prescription_date)
) ENGINE=InnoDB COMMENT='Prescription headers';

-- Prescription Items
CREATE TABLE prescription_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    prescription_id BIGINT UNSIGNED NOT NULL,
    medicine_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    INDEX idx_prescription (prescription_id),
    INDEX idx_medicine (medicine_id)
) ENGINE=InnoDB COMMENT='Prescription line items';

-- ============================================================================
-- 5. INVENTORY MANAGEMENT TABLES
-- ============================================================================

-- Stock Inventory
CREATE TABLE stock_inventory (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT UNSIGNED UNIQUE NOT NULL,
    quantity_available INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    INDEX idx_quantity (quantity_available)
) ENGINE=InnoDB COMMENT='Current stock levels';

-- Suppliers
CREATE TABLE suppliers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB COMMENT='Drug suppliers';

-- Purchase Orders
CREATE TABLE purchase_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    supplier_id BIGINT UNSIGNED NOT NULL,
    order_date DATE NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    total_amount DECIMAL(12,2),
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    created_by BIGINT UNSIGNED NOT NULL,
    approved_by BIGINT UNSIGNED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_order_number (order_number),
    INDEX idx_supplier (supplier_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
) ENGINE=InnoDB COMMENT='Purchase orders to suppliers';

-- Purchase Order Items
CREATE TABLE purchase_order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT UNSIGNED NOT NULL,
    medicine_id BIGINT UNSIGNED NOT NULL,
    quantity_ordered INT NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    INDEX idx_purchase_order (purchase_order_id),
    INDEX idx_medicine (medicine_id)
) ENGINE=InnoDB COMMENT='Purchase order line items';

-- Stock In (Receiving)
CREATE TABLE stock_in (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT UNSIGNED NOT NULL,
    supplier_id BIGINT UNSIGNED NOT NULL,
    purchase_order_id BIGINT UNSIGNED,
    batch_number VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    manufacture_date DATE,
    expiry_date DATE NOT NULL,
    received_by BIGINT UNSIGNED NOT NULL,
    received_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (received_by) REFERENCES users(id),
    INDEX idx_medicine (medicine_id),
    INDEX idx_batch_number (batch_number),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_received_date (received_date)
) ENGINE=InnoDB COMMENT='Stock receiving records';

-- Stock Out (Dispensing/Wastage)
CREATE TABLE stock_out (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT UNSIGNED NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    reason ENUM('Dispensed', 'Expired', 'Damaged', 'Lost', 'Returned') NOT NULL,
    reference_id BIGINT UNSIGNED COMMENT 'prescription_id if dispensed',
    processed_by BIGINT UNSIGNED NOT NULL,
    processed_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_medicine (medicine_id),
    INDEX idx_batch_number (batch_number),
    INDEX idx_reason (reason),
    INDEX idx_processed_date (processed_date)
) ENGINE=InnoDB COMMENT='Stock out records';

-- Expiry Tracking
CREATE TABLE expiry_tracking (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT UNSIGNED NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    quantity_remaining INT NOT NULL,
    expiry_date DATE NOT NULL,
    alert_status ENUM('Safe', 'Warning', 'Critical', 'Expired') DEFAULT 'Safe',
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    INDEX idx_medicine (medicine_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_alert_status (alert_status)
) ENGINE=InnoDB COMMENT='Drug expiry monitoring';

-- ============================================================================
-- 6. BILLING AND PAYMENT TABLES
-- ============================================================================

-- Invoices
CREATE TABLE invoices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    prescription_id BIGINT UNSIGNED,
    invoice_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Paid', 'Cancelled') DEFAULT 'Pending',
    generated_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (generated_by) REFERENCES users(id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_patient (patient_id),
    INDEX idx_status (status),
    INDEX idx_date (invoice_date)
) ENGINE=InnoDB COMMENT='Patient invoices';

-- Invoice Items
CREATE TABLE invoice_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT UNSIGNED NOT NULL,
    medicine_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    INDEX idx_invoice (invoice_id),
    INDEX idx_medicine (medicine_id)
) ENGINE=InnoDB COMMENT='Invoice line items';

-- Payments
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_number VARCHAR(20) UNIQUE NOT NULL,
    invoice_id BIGINT UNSIGNED NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('Cash', 'Card', 'Insurance', 'Mobile Money') NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    change_given DECIMAL(10,2) DEFAULT 0,
    received_by BIGINT UNSIGNED NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (received_by) REFERENCES users(id),
    INDEX idx_payment_number (payment_number),
    INDEX idx_invoice (invoice_id),
    INDEX idx_date (payment_date),
    INDEX idx_method (payment_method)
) ENGINE=InnoDB COMMENT='Payment transactions';

-- ============================================================================
-- 7. REPORTING AND AUDIT TABLES
-- ============================================================================

-- Reports
CREATE TABLE reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    report_name VARCHAR(200) NOT NULL,
    parameters JSON,
    generated_by BIGINT UNSIGNED NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id),
    INDEX idx_type (report_type),
    INDEX idx_generated_at (generated_at)
) ENGINE=InnoDB COMMENT='Report generation log';

-- Audit Log
CREATE TABLE audit_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id BIGINT UNSIGNED,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_table (table_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB COMMENT='System audit trail';

-- ============================================================================
-- 8. INSERT DEFAULT DATA
-- ============================================================================

-- Insert Roles
INSERT INTO roles (name) VALUES
('Administrator'),
('Physician'),
('Pharmacist'),
('Receptionist'),
('Inventory Manager'),
('Supplier'),
('Patient'),
('Cashier');

-- Insert Medicine Categories
INSERT INTO medicine_categories (name) VALUES
('Analgesics'),
('Antibiotics'),
('Antivirals'),
('Cardiovascular'),
('Gastrointestinal'),
('Respiratory'),
('Vitamins & Supplements');

-- Insert Medicine Types
INSERT INTO medicine_types (name) VALUES
('Tablet'),
('Capsule'),
('Syrup'),
('Injection'),
('Cream'),
('Drops'),
('Inhaler');

-- ============================================================================
-- 9. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Current Stock with Medicine Details
CREATE OR REPLACE VIEW v_current_stock AS
SELECT 
    m.id,
    m.name,
    m.generic_name,
    mc.name AS category,
    mt.name AS type,
    m.strength,
    m.unit,
    COALESCE(si.quantity_available, 0) AS quantity_available,
    m.reorder_level,
    CASE 
        WHEN COALESCE(si.quantity_available, 0) <= m.reorder_level THEN 'Low Stock'
        ELSE 'In Stock'
    END AS stock_status,
    m.unit_price
FROM medicines m
LEFT JOIN stock_inventory si ON m.id = si.medicine_id
LEFT JOIN medicine_categories mc ON m.category_id = mc.id
LEFT JOIN medicine_types mt ON m.type_id = mt.id
WHERE m.deleted_at IS NULL;

-- View: Pending Prescriptions
CREATE OR REPLACE VIEW v_pending_prescriptions AS
SELECT 
    p.id,
    p.prescription_number,
    p.prescription_date,
    CONCAT(pat.first_name, ' ', pat.last_name) AS patient_name,
    CONCAT(u.first_name, ' ', u.last_name) AS physician_name,
    COUNT(pi.id) AS item_count
FROM prescriptions p
JOIN patients pat ON p.patient_id = pat.id
JOIN users u ON p.physician_id = u.id
LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
WHERE p.status = 'Pending'
GROUP BY p.id;

-- View: Expiring Medicines
CREATE OR REPLACE VIEW v_expiring_medicines AS
SELECT 
    m.name,
    et.batch_number,
    et.quantity_remaining,
    et.expiry_date,
    et.alert_status,
    DATEDIFF(et.expiry_date, CURDATE()) AS days_to_expiry
FROM expiry_tracking et
JOIN medicines m ON et.medicine_id = m.id
WHERE et.alert_status IN ('Warning', 'Critical', 'Expired')
ORDER BY et.expiry_date;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
