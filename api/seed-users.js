#!/usr/bin/env node

require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

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

async function seedUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "haramaya_pharmacy",
  });

  try {
    console.log("👥 Seeding default users...\n");

    // Check if users already exist
    const [existingUsers] = await connection.query(
      "SELECT COUNT(*) as count FROM users",
    );
    if (existingUsers[0].count > 0) {
      console.log("⚠️  Users already exist. Showing existing credentials...\n");

      // Show existing users
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

      console.log("📋 Existing Users:");
      console.log("================");
      users.forEach((user) => {
        console.log(`👤 ${user.first_name} ${user.last_name}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.roles || "No role assigned"}`);
        console.log("");
      });

      await connection.end();
      return;
    }

    // Get role IDs
    const [roles] = await connection.query("SELECT id, name FROM roles");
    const roleMap = {};
    roles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    console.log("🔐 Creating default users with hashed passwords...\n");

    // Create users
    for (const userData of defaultUsers) {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Insert user
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

      // Assign role
      if (roleId) {
        await connection.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
          [userId, roleId],
        );
      }

      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    console.log("\n🎉 Default users created successfully!\n");

    // Display credentials
    console.log("🔑 DEFAULT LOGIN CREDENTIALS");
    console.log("============================\n");

    defaultUsers.forEach((user) => {
      console.log(`👤 ${user.role}:`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Email: ${user.email}`);
      console.log("");
    });

    console.log("📝 NOTES:");
    console.log("- Change these passwords after first login");
    console.log("- Admin has full system access");
    console.log("- Each role has specific dashboard and permissions");
    console.log("- Login at: http://localhost:5173\n");

    await connection.end();
  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
    await connection.end();
    process.exit(1);
  }
}

seedUsers();
