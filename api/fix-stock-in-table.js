const db = require("./config/database");

async function fixStockInTable() {
  const connection = await db.getConnection();
  try {
    console.log("Checking stock_in table...");

    // Check if table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'stock_in'");

    if (tables.length === 0) {
      console.log("Creating stock_in table...");
      await connection.execute(`
        CREATE TABLE stock_in (
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
          INDEX idx_medicine (medicine_id),
          INDEX idx_supplier (supplier_id),
          INDEX idx_received_date (received_date)
        ) ENGINE=InnoDB COMMENT='Stock receiving records';
      `);
      console.log("✓ stock_in table created successfully");
    } else {
      console.log("✓ stock_in table already exists");

      // Check if purchase_order_id column exists
      const [columns] = await connection.execute(
        "SHOW COLUMNS FROM stock_in LIKE 'purchase_order_id'",
      );

      if (columns.length === 0) {
        console.log("Adding purchase_order_id column...");
        await connection.execute(`
          ALTER TABLE stock_in 
          ADD COLUMN purchase_order_id BIGINT UNSIGNED AFTER supplier_id
        `);
        console.log("✓ purchase_order_id column added");
      } else {
        console.log("✓ purchase_order_id column already exists");
      }
    }

    // Check if expiry_tracking table exists
    const [expiryTables] = await connection.execute(
      "SHOW TABLES LIKE 'expiry_tracking'",
    );

    if (expiryTables.length === 0) {
      console.log("Creating expiry_tracking table...");
      await connection.execute(`
        CREATE TABLE expiry_tracking (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          medicine_id BIGINT UNSIGNED NOT NULL,
          batch_number VARCHAR(100) NOT NULL,
          quantity_remaining INT NOT NULL,
          expiry_date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (medicine_id) REFERENCES medicines(id),
          UNIQUE KEY unique_batch (medicine_id, batch_number),
          INDEX idx_expiry_date (expiry_date)
        ) ENGINE=InnoDB COMMENT='Medicine expiry tracking';
      `);
      console.log("✓ expiry_tracking table created successfully");
    } else {
      console.log("✓ expiry_tracking table already exists");
    }

    // Check if stock_out table exists
    const [stockOutTables] = await connection.execute(
      "SHOW TABLES LIKE 'stock_out'",
    );

    if (stockOutTables.length === 0) {
      console.log("Creating stock_out table...");
      await connection.execute(`
        CREATE TABLE stock_out (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          medicine_id BIGINT UNSIGNED NOT NULL,
          batch_number VARCHAR(100),
          quantity INT NOT NULL,
          reason VARCHAR(255) NOT NULL,
          processed_by BIGINT UNSIGNED NOT NULL,
          processed_date DATE NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (medicine_id) REFERENCES medicines(id),
          FOREIGN KEY (processed_by) REFERENCES users(id),
          INDEX idx_medicine (medicine_id),
          INDEX idx_processed_date (processed_date)
        ) ENGINE=InnoDB COMMENT='Stock out/adjustment records';
      `);
      console.log("✓ stock_out table created successfully");
    } else {
      console.log("✓ stock_out table already exists");
    }

    console.log("\n✅ All stock management tables are ready!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    connection.release();
    await db.end();
  }
}

fixStockInTable()
  .then(() => {
    console.log("\n✅ Database fix completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Database fix failed:", error);
    process.exit(1);
  });
