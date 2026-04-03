#!/usr/bin/env node

require("dotenv").config();
const mysql = require("mysql2/promise");
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

async function runMigration() {
  let connection;

  try {
    console.log("🚀 Starting RBAC Migration...");

    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to MySQL database");

    // Read migration file
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "update_roles_rbac.sql",
    );
    const migrationSQL = await fs.readFile(migrationPath, "utf8");
    console.log("📄 Migration file loaded");

    // Execute migration
    await connection.execute(migrationSQL);
    console.log("✅ Migration executed successfully");

    // Verify roles
    const [roles] = await connection.execute("SELECT * FROM roles ORDER BY id");
    console.log("📋 Current roles in database:");
    roles.forEach((role) => {
      console.log(`   - ${role.id}: ${role.name}`);
    });

    // Verify permissions
    const [permissions] = await connection.execute(`
      SELECT r.name as role_name, rp.permission 
      FROM roles r 
      LEFT JOIN role_permissions rp ON r.id = rp.role_id 
      ORDER BY r.id, rp.permission
    `);

    console.log("\n🔐 Role permissions:");
    let currentRole = "";
    permissions.forEach((perm) => {
      if (perm.role_name !== currentRole) {
        currentRole = perm.role_name;
        console.log(`\n   ${currentRole}:`);
      }
      if (perm.permission) {
        console.log(`     - ${perm.permission}`);
      }
    });

    console.log("\n🎉 RBAC Migration completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("   1. Start the API server: cd api && npm start");
    console.log("   2. Start the frontend: cd frontend && npm run dev");
    console.log("   3. Login with: admin / admin123");
    console.log("   4. Test role-based access control");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration
runMigration();
