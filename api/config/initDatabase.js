const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const initDatabase = async () => {
  let connection;
  
  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('📦 Initializing database...');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE ${process.env.DB_NAME}`);
    
    console.log('✓ Database created/verified');

    // Create tables
    await createTables(connection);
    
    // Insert default data
    await insertDefaultData(connection);
    
    console.log('✓ Database initialization completed\n');
    
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const createTables = async (connection) => {
  // Users Table
  await connection.query(`
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
      INDEX idx_email (email)
    ) ENGINE=InnoDB
  `);

  // Roles Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // User Roles
  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      role_id BIGINT UNSIGNED NOT NULL,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_role (user_id, role_id)
    ) ENGINE=InnoDB
  `);

  // Medicine Categories
  await connection.query(`
    CREATE TABLE IF NOT EXISTS medicine_categories (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL
    ) ENGINE=InnoDB
  `);

  // Medicine Types
  await connection.query(`
    CREATE TABLE IF NOT EXISTS medicine_types (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL
    ) ENGINE=InnoDB
  `);

  // Suppliers
  await connection.query(`
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
      deleted_at TIMESTAMP NULL
    ) ENGINE=InnoDB
  `);

  // Medicines
  await connection.query(`
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
      FOREIGN KEY (category_id) REFERENCES medicine_categories(id),
      FOREIGN KEY (type_id) REFERENCES medicine_types(id),
      INDEX idx_name (name),
      INDEX idx_generic_name (generic_name)
    ) ENGINE=InnoDB
  `);

  // Stock Inventory
  await connection.query(`
    CREATE TABLE IF NOT EXISTS stock_inventory (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      medicine_id BIGINT UNSIGNED UNIQUE NOT NULL,
      quantity_available INT DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // Stock In
  await connection.query(`
    CREATE TABLE IF NOT EXISTS stock_in (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      medicine_id BIGINT UNSIGNED NOT NULL,
      supplier_id BIGINT UNSIGNED NOT NULL,
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
      FOREIGN KEY (received_by) REFERENCES users(id),
      INDEX idx_batch_number (batch_number),
      INDEX idx_expiry_date (expiry_date)
    ) ENGINE=InnoDB
  `);

  // Stock Out
  await connection.query(`
    CREATE TABLE IF NOT EXISTS stock_out (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      medicine_id BIGINT UNSIGNED NOT NULL,
      batch_number VARCHAR(100) NOT NULL,
      quantity INT NOT NULL,
      reason ENUM('sale', 'expired', 'damaged', 'lost') NOT NULL,
      reference_id BIGINT UNSIGNED,
      processed_by BIGINT UNSIGNED NOT NULL,
      processed_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id),
      FOREIGN KEY (processed_by) REFERENCES users(id)
    ) ENGINE=InnoDB
  `);

  // Expiry Tracking
  await connection.query(`
    CREATE TABLE IF NOT EXISTS expiry_tracking (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      medicine_id BIGINT UNSIGNED NOT NULL,
      batch_number VARCHAR(100) NOT NULL,
      quantity_remaining INT NOT NULL,
      expiry_date DATE NOT NULL,
      alert_status ENUM('safe', 'warning', 'critical', 'expired') DEFAULT 'safe',
      last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id),
      INDEX idx_expiry_date (expiry_date),
      INDEX idx_alert_status (alert_status)
    ) ENGINE=InnoDB
  `);

  // Reports
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      report_type VARCHAR(50) NOT NULL,
      generated_by BIGINT UNSIGNED NOT NULL,
      parameters JSON,
      generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (generated_by) REFERENCES users(id)
    ) ENGINE=InnoDB
  `);

  console.log('✓ All tables created/verified');
  
  // Migrate: Remove description columns if they exist
  await migrateRemoveDescriptions(connection);
};

const migrateRemoveDescriptions = async (connection) => {
  try {
    console.log('🔄 Checking for description columns to remove...');
    
    const tablesToMigrate = [
      'roles',
      'medicine_categories',
      'medicine_types',
      'medicines'
    ];
    
    for (const table of tablesToMigrate) {
      try {
        // Check if description column exists
        const [columns] = await connection.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'description'`,
          [process.env.DB_NAME, table]
        );
        
        if (columns.length > 0) {
          await connection.query(`ALTER TABLE ${table} DROP COLUMN description`);
          console.log(`  ✓ Removed description column from ${table}`);
        }
      } catch (error) {
        // Column might not exist, continue
        console.log(`  ℹ No description column in ${table}`);
      }
    }
    
    console.log('✓ Migration completed');
  } catch (error) {
    console.log('⚠ Migration warning:', error.message);
  }
};

const insertDefaultData = async (connection) => {
  try {
    // Check if roles exist
    const [roles] = await connection.query('SELECT COUNT(*) as count FROM roles');
    
    if (roles[0].count === 0) {
      // Insert default roles
      await connection.query(`
        INSERT INTO roles (name) VALUES
        ('System Administrator'),
        ('Pharmacist'),
        ('Data Clerk / Cashier'),
        ('Physician'),
        ('Ward Nurse'),
        ('Drug Supplier')
      `);
      console.log('✓ Default roles inserted');
    } else {
      console.log('✓ Roles already exist');
    }

    // Check if admin user exists
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    
    if (users[0].count === 0) {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Insert default admin user
      await connection.query(`
        INSERT INTO users (username, email, password, first_name, last_name, is_active) 
        VALUES ('admin', 'admin@haramaya.edu', ?, 'System', 'Administrator', 1)
      `, [hashedPassword]);
      
      // Assign admin role
      await connection.query(`
        INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)
      `);
      
      console.log('✓ Default admin user created (username: admin, password: admin123)');
    } else {
      console.log('✓ Users already exist');
    }
  } catch (error) {
    console.log('⚠ Default data insertion skipped:', error.message);
  }
};

module.exports = initDatabase;
