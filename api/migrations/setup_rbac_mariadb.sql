-- ============================================================================
-- RBAC MIGRATION: MariaDB Compatible Setup
-- Pharmacy Management System
-- ============================================================================

-- Use the database
USE haramaya_pharmacy;

-- 1. Create roles table first (if not exists)
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB COMMENT='System roles for RBAC';

-- 2. Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
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

-- 3. Create user_roles junction table (if not exists)
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT UNSIGNED,
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_user (user_id),
    INDEX idx_role (role_id)
) ENGINE=InnoDB COMMENT='User role assignments';

-- 4. Create role_permissions table (if not exists)
CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    permission VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_role_permission (role_id, permission),
    INDEX idx_role (role_id),
    INDEX idx_permission (permission)
) ENGINE=InnoDB COMMENT='Role-based permissions';

-- 5. Add foreign key constraints (only if they don't exist)
-- Note: MariaDB will ignore if constraint already exists
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_NAME = 'user_roles' AND CONSTRAINT_NAME = 'user_roles_ibfk_1') = 0,
    'ALTER TABLE user_roles ADD CONSTRAINT user_roles_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key user_roles_ibfk_1 already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_NAME = 'user_roles' AND CONSTRAINT_NAME = 'user_roles_ibfk_2') = 0,
    'ALTER TABLE user_roles ADD CONSTRAINT user_roles_ibfk_2 FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE',
    'SELECT "Foreign key user_roles_ibfk_2 already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_NAME = 'role_permissions' AND CONSTRAINT_NAME = 'role_permissions_ibfk_1') = 0,
    'ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_ibfk_1 FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE',
    'SELECT "Foreign key role_permissions_ibfk_1 already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Clear existing data and insert new roles
DELETE FROM user_roles;
DELETE FROM role_permissions;
DELETE FROM roles;

-- 7. Insert new roles
INSERT INTO roles (id, name) VALUES
(1, 'Admin'),
(2, 'Data Clerk'),
(3, 'Physician'),
(4, 'Pharmacist'),
(5, 'Drug Supplier');

-- 8. Insert role permissions
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

-- 9. Create default admin user (password: admin123)
-- Hash for 'admin123': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (username, email, password, first_name, last_name, is_active) VALUES
('admin', 'admin@pharmacy.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 1);

-- 10. Assign admin role to default user
INSERT INTO user_roles (user_id, role_id) VALUES
(LAST_INSERT_ID(), 1);