#!/usr/bin/env node

require("dotenv").config();
const mysql = require("mysql2/promise");

async function checkTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "haramaya_pharmacy",
  });

  try {
    console.log("📋 Checking existing database tables...\n");

    const [tables] = await connection.query("SHOW TABLES");

    console.log("Existing tables:");
    console.log("================");
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });

    console.log(`\nTotal tables: ${tables.length}`);

    await connection.end();
  } catch (error) {
    console.error("❌ Error checking tables:", error.message);
    await connection.end();
    process.exit(1);
  }
}

checkTables();
