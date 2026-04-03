-- ============================================================================
-- RBAC MIGRATION: Update to 5-Role System
-- Pharmacy Management System
-- ============================================================================

USE haramaya_pharmacy;

-- 1. Create new roles table structure with permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    permission VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission),
    INDEX idx_role (role_id),
    INDEX idx_permission (permission)
) ENGINE=InnoDB COMMENT='Role-based permissions';

-- 2. Clear existing roles and insert new 5-role structure
DELETE FROM user_roles;
DELETE FROM roles;

-- 3. Insert new roles
INSERT INTO roles (id, name) VALUES
(1, 'Admin'),
(2, 'Data Clerk'),
(3, 'Physician'),
(4, 'Pharmacist'),
(5, 'Drug Supplier');

-- 4. Insert role permissions
INSERT INTO role_permissions (role_id, permission) VALUES
-- Admin permissions (full access)
(1, 'manage_users'),
(1, 'manage_roles'),
(1, 'view_all_reports'),
(1, 'backup_system'),
(1, 'restore_system'),
(1, 'manage_medicines'),
(1, 'manage_suppliers'),
(1, 'manage_patients'),
(1, 'view_audit_logs'),
(1, 'system_configuration'),

-- Data Clerk permissions
(2, 'register_patients'),
(2, 'update_patients'),
(2, 'view_patients'),
(2, 'generate_patient_reports'),
(2, 'process_billing'),
(2, 'view_invoices'),

-- Physician permissions
(3, 'view_patients'),
(3, 'create_diagnosis'),
(3, 'view_diagnosis'),
(3, 'create_prescription'),
(3, 'view_prescriptions'),
(3, 'view_patient_history'),

-- Pharmacist permissions
(4, 'view_medicines'),
(4, 'search_medicines'),
(4, 'dispense_medicines'),
(4, 'update_stock'),
(4, 'view_prescriptions'),
(4, 'receive_stock'),
(4, 'manage_inventory'),
(4, 'view_stock_reports'),

-- Drug Supplier permissions
(5, 'view_purchase_orders'),
(5, 'confirm_availability'),
(5, 'update_order_status'),
(5, 'view_supplier_reports');

-- 5. Create default admin user (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, is_active) VALUES
('admin', 'admin@pharmacy.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 1);

-- 6. Assign admin role to default user
INSERT INTO user_roles (user_id, role_id) VALUES
(LAST_INSERT_ID(), 1);

-- 7. Create patients table if not exists (for Data Clerk module)
CREATE TABLE IF NOT EXISTS patients (
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

-- 8. Create system_backups table for Admin module
CREATE TABLE IF NOT EXISTS system_backups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    backup_name VARCHAR(200) NOT NULL,
    backup_path VARCHAR(500) NOT NULL,
    backup_size BIGINT,
    backup_type ENUM('Full', 'Incremental', 'Differential') DEFAULT 'Full',
    status ENUM('In Progress', 'Completed', 'Failed') DEFAULT 'In Progress',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB COMMENT='System backup records';

-- 9. Update audit_log to track role-based actions
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS role_name VARCHAR(50) AFTER user_id;

COMMIT;