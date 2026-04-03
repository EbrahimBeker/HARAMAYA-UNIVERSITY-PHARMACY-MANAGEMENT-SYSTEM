#!/usr/bin/env node

require("dotenv").config();
const mysql = require("mysql2/promise");

async function addMissingTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "haramaya_pharmacy",
  });

  try {
    console.log("🔧 Adding missing tables for complete test data...\n");

    // Add invoice_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
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
      ) ENGINE=InnoDB COMMENT='Invoice line items'
    `);
    console.log("✅ invoice_items table added");

    // Add payments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
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
      ) ENGINE=InnoDB COMMENT='Payment transactions'
    `);
    console.log("✅ payments table added");

    // Add purchase_order_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
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
      ) ENGINE=InnoDB COMMENT='Purchase order line items'
    `);
    console.log("✅ purchase_order_items table added");

    // Update invoices table to add missing columns if needed
    await connection.query(`
      ALTER TABLE invoices 
      ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER invoice_date,
      ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0 AFTER subtotal,
      ADD COLUMN IF NOT EXISTS tax DECIMAL(10,2) DEFAULT 0 AFTER discount,
      ADD COLUMN IF NOT EXISTS status ENUM('Pending', 'Paid', 'Cancelled') DEFAULT 'Pending' AFTER total_amount
    `);
    console.log("✅ invoices table updated");

    // Update purchase_orders table to add missing columns if needed
    await connection.query(`
      ALTER TABLE purchase_orders 
      ADD COLUMN IF NOT EXISTS status ENUM('Pending', 'Confirmed', 'Delivered', 'Cancelled') DEFAULT 'Pending' AFTER order_date,
      ADD COLUMN IF NOT EXISTS expected_delivery_date DATE AFTER status,
      ADD COLUMN IF NOT EXISTS actual_delivery_date DATE AFTER expected_delivery_date,
      ADD COLUMN IF NOT EXISTS approved_by BIGINT UNSIGNED AFTER created_by,
      ADD COLUMN IF NOT EXISTS notes TEXT AFTER approved_by
    `);
    console.log("✅ purchase_orders table updated");

    console.log("\n🎉 Missing tables added successfully!");

    await connection.end();
  } catch (error) {
    console.error("❌ Error adding missing tables:", error.message);
    await connection.end();
    process.exit(1);
  }
}

addMissingTables();
