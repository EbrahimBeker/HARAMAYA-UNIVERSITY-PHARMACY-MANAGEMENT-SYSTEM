#!/usr/bin/env node

require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "haramaya_pharmacy",
};

// Default user credentials
const defaultUsers = [
  {
    username: "admin",
    email: "admin@pharmacy.com",
    password: "admin123",
    first_name: "System",
    last_name: "Administrator",
    role: "Admin",
  },
  {
    username: "clerk",
    email: "clerk@pharmacy.com",
    password: "clerk123",
    first_name: "Data",
    last_name: "Clerk",
    role: "Data Clerk",
  },
  {
    username: "doctor",
    email: "doctor@pharmacy.com",
    password: "doctor123",
    first_name: "Dr. John",
    last_name: "Smith",
    role: "Physician",
  },
  {
    username: "pharmacist",
    email: "pharmacist@pharmacy.com",
    password: "pharma123",
    first_name: "Sarah",
    last_name: "Johnson",
    role: "Pharmacist",
  },
  {
    username: "supplier",
    email: "supplier@pharmacy.com",
    password: "supply123",
    first_name: "Mike",
    last_name: "Wilson",
    role: "Drug Supplier",
  },
];

async function setupSystem() {
  let connection;

  try {
    console.log("🚀 Starting Pharmacy System Setup...\n");

    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to MySQL/MariaDB database");

    // Step 1: Create tables
    console.log("\n📋 Step 1: Creating database tables...");

    // Create roles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB COMMENT='System roles for RBAC'
    `);

    // Create users table
    await connection.execute(`
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
      ) ENGINE=InnoDB COMMENT='System users'
    `);

    // Create user_roles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        role_id BIGINT UNSIGNED NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by BIGINT UNSIGNED,
        UNIQUE KEY unique_user_role (user_id, role_id),
        INDEX idx_user (user_id),
        INDEX idx_role (role_id)
      ) ENGINE=InnoDB COMMENT='User role assignments'
    `);

    // Create role_permissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        role_id BIGINT UNSIGNED NOT NULL,
        permission VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_role_permission (role_id, permission),
        INDEX idx_role (role_id),
        INDEX idx_permission (permission)
      ) ENGINE=InnoDB COMMENT='Role-based permissions'
    `);

    console.log("✅ Database tables created");

    // Step 2: Clear and insert roles
    console.log("\n🔐 Step 2: Setting up roles and permissions...");

    // Clear existing data
    await connection.execute("DELETE FROM user_roles");
    await connection.execute("DELETE FROM role_permissions");
    await connection.execute("DELETE FROM users");
    await connection.execute("DELETE FROM roles");

    // Insert roles
    await connection.execute(`
      INSERT INTO roles (id, name) VALUES
      (1, 'Admin'),
      (2, 'Data Clerk'),
      (3, 'Physician'),
      (4, 'Pharmacist'),
      (5, 'Drug Supplier')
    `);

    // Insert permissions
    const permissions = [
      // Admin permissions
      [1, "manage_users"],
      [1, "manage_roles"],
      [1, "view_all_reports"],
      [1, "backup_system"],
      [1, "restore_system"],
      [1, "manage_medicines"],
      [1, "manage_suppliers"],
      [1, "manage_patients"],
      [1, "view_audit_logs"],
      [1, "system_configuration"],

      // Data Clerk permissions
      [2, "register_patients"],
      [2, "update_patients"],
      [2, "view_patients"],
      [2, "generate_patient_reports"],
      [2, "process_billing"],
      [2, "view_invoices"],

      // Physician permissions
      [3, "view_patients"],
      [3, "create_diagnosis"],
      [3, "view_diagnosis"],
      [3, "create_prescription"],
      [3, "view_prescriptions"],
      [3, "view_patient_history"],

      // Pharmacist permissions
      [4, "view_medicines"],
      [4, "search_medicines"],
      [4, "dispense_medicines"],
      [4, "update_stock"],
      [4, "view_prescriptions"],
      [4, "receive_stock"],
      [4, "manage_inventory"],
      [4, "view_stock_reports"],

      // Drug Supplier permissions
      [5, "view_purchase_orders"],
      [5, "confirm_availability"],
      [5, "update_order_status"],
      [5, "view_supplier_reports"],
    ];

    for (const [roleId, permission] of permissions) {
      await connection.execute(
        "INSERT INTO role_permissions (role_id, permission) VALUES (?, ?)",
        [roleId, permission],
      );
    }

    console.log("✅ Roles and permissions configured");

    // Step 3: Create users
    console.log("\n👥 Step 3: Creating user accounts...");

    // Get role IDs
    const [roles] = await connection.query("SELECT id, name FROM roles");
    const roleMap = {};
    roles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    // Create users
    for (const userData of defaultUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const [result] = await connection.query(
        `INSERT INTO users (username, email, password, first_name, last_name, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [
          userData.username,
          userData.email,
          hashedPassword,
          userData.first_name,
          userData.last_name,
        ],
      );

      const userId = result.insertId;
      const roleId = roleMap[userData.role];

      if (roleId) {
        await connection.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
          [userId, roleId],
        );
      }

      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    // Step 4: Create basic tables for the system
    console.log("\n🏗️ Step 4: Creating system tables...");

    // Medicine categories
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS medicine_categories (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_name (name)
      ) ENGINE=InnoDB COMMENT='Medicine categories'
    `);

    // Medicine types
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS medicine_types (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_name (name)
      ) ENGINE=InnoDB COMMENT='Medicine types'
    `);

    // Medicines
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS medicines (
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
        INDEX idx_name (name),
        INDEX idx_generic_name (generic_name),
        INDEX idx_category (category_id),
        INDEX idx_type (type_id)
      ) ENGINE=InnoDB COMMENT='Medicine master data'
    `);

    // Stock inventory
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stock_inventory (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        medicine_id BIGINT UNSIGNED UNIQUE NOT NULL,
        quantity_available INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_quantity (quantity_available)
      ) ENGINE=InnoDB COMMENT='Current stock levels'
    `);

    // Suppliers
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS suppliers (
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
      ) ENGINE=InnoDB COMMENT='Drug suppliers'
    `);

    console.log("✅ System tables created");

    // Display results
    console.log("\n🎉 Setup completed successfully!\n");

    console.log("🔑 LOGIN CREDENTIALS:");
    console.log("====================\n");

    defaultUsers.forEach((user) => {
      console.log(`👤 ${user.role}:`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Email: ${user.email}\n`);
    });

    console.log("🚀 NEXT STEPS:");
    console.log("==============");
    console.log("1. Start API server: npm start");
    console.log("2. Start frontend: cd ../frontend && npm run dev");
    console.log("3. Visit: http://localhost:5173");
    console.log("4. Login with any credentials above\n");

    await connection.end();
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

setupSystem();
