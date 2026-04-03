#!/usr/bin/env node

require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const fs = require("fs").promises;
const path = require("path");

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "haramaya_pharmacy",
  multipleStatements: true,
};

// Default user credentials for each role
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

async function setupComplete() {
  let connection;

  try {
    console.log("🚀 Starting Complete Pharmacy System Setup...\n");

    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to MySQL database");

    // Step 1: Run RBAC Migration
    console.log("\n📋 Step 1: Running RBAC Migration...");
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "update_roles_rbac.sql",
    );
    const migrationSQL = await fs.readFile(migrationPath, "utf8");
    await connection.execute(migrationSQL);
    console.log("✅ RBAC Migration completed");

    // Step 2: Create additional users
    console.log("\n👥 Step 2: Creating additional users...");

    // Get role IDs
    const [roles] = await connection.query("SELECT id, name FROM roles");
    const roleMap = {};
    roles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    // Check if additional users exist
    const [existingUsers] = await connection.query(
      'SELECT COUNT(*) as count FROM users WHERE username != "admin"',
    );

    if (existingUsers[0].count === 0) {
      // Create additional users (skip admin as it's created in migration)
      for (const userData of defaultUsers.slice(1)) {
        // Skip admin
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
    } else {
      console.log(
        "⚠️  Additional users already exist. Skipping user creation...",
      );
    }

    // Step 3: Seed sample data
    console.log("\n🌱 Step 3: Seeding sample data...");

    // Check if sample data exists
    const [existingCategories] = await connection.query(
      "SELECT COUNT(*) as count FROM medicine_categories",
    );

    if (existingCategories[0].count === 0) {
      // Insert Medicine Categories
      await connection.query(`
        INSERT INTO medicine_categories (name) VALUES
        ('Antibiotics'), ('Analgesics'), ('Antipyretics'), ('Antihistamines'),
        ('Cardiovascular'), ('Gastrointestinal'), ('Vitamins & Supplements'),
        ('Respiratory'), ('Dermatological'), ('Neurological')
      `);

      // Insert Medicine Types
      await connection.query(`
        INSERT INTO medicine_types (name) VALUES
        ('Tablet'), ('Capsule'), ('Syrup'), ('Injection'), ('Cream'),
        ('Drops'), ('Inhaler'), ('Ointment'), ('Suspension'), ('Powder')
      `);

      // Insert Suppliers
      await connection.query(`
        INSERT INTO suppliers (name, contact_person, email, phone, address, is_active) VALUES
        ('MediSupply Ethiopia', 'Abebe Kebede', 'contact@medisupply.et', '+251911234567', 'Addis Ababa, Ethiopia', 1),
        ('PharmaDistributors Ltd', 'Tigist Alemu', 'info@pharmadist.et', '+251922345678', 'Dire Dawa, Ethiopia', 1),
        ('HealthCare Suppliers', 'Dawit Tesfaye', 'sales@healthcare.et', '+251933456789', 'Harar, Ethiopia', 1)
      `);

      // Insert Sample Medicines
      await connection.query(`
        INSERT INTO medicines (name, generic_name, category_id, type_id, strength, unit, reorder_level, unit_price, requires_prescription) VALUES
        ('Amoxicillin', 'Amoxicillin', 1, 2, '500mg', 'capsule', 50, 15.50, 1),
        ('Paracetamol', 'Acetaminophen', 2, 1, '500mg', 'tablet', 100, 5.00, 0),
        ('Ibuprofen', 'Ibuprofen', 2, 1, '400mg', 'tablet', 80, 8.50, 0),
        ('Cetirizine', 'Cetirizine HCl', 4, 1, '10mg', 'tablet', 60, 12.00, 0),
        ('Omeprazole', 'Omeprazole', 6, 2, '20mg', 'capsule', 40, 18.00, 1),
        ('Vitamin C', 'Ascorbic Acid', 7, 1, '1000mg', 'tablet', 100, 10.00, 0),
        ('Ciprofloxacin', 'Ciprofloxacin', 1, 1, '500mg', 'tablet', 30, 25.00, 1),
        ('Metformin', 'Metformin HCl', 5, 1, '500mg', 'tablet', 50, 20.00, 1)
      `);

      // Initialize stock inventory
      await connection.query(`
        INSERT INTO stock_inventory (medicine_id, quantity_available)
        SELECT id, FLOOR(RAND() * 200) + 50 FROM medicines
      `);

      console.log("✅ Sample data seeded successfully");
    } else {
      console.log("⚠️  Sample data already exists. Skipping...");
    }

    // Display results
    console.log("\n🎉 Setup completed successfully!\n");

    // Show created users
    const [users] = await connection.query(`
      SELECT u.username, u.email, u.first_name, u.last_name, 
             GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.deleted_at IS NULL
      GROUP BY u.id
      ORDER BY u.id
    `);

    console.log("🔑 LOGIN CREDENTIALS:");
    console.log("====================\n");

    defaultUsers.forEach((user) => {
      console.log(`👤 ${user.role}:`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Email: ${user.email}\n`);
    });

    console.log("📊 SYSTEM SUMMARY:");
    console.log("==================");
    console.log(`✅ Users created: ${users.length}`);
    console.log(`✅ Roles configured: 5`);
    console.log(`✅ Sample medicines: 8`);
    console.log(`✅ Medicine categories: 10`);
    console.log(`✅ Suppliers: 3\n`);

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

setupComplete();
