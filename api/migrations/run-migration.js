// Node.js script to run database migration
// Usage: node run-migration.js

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function runMigration() {
  console.log("\n========================================");
  console.log("  Database Migration Script");
  console.log("  Adding Workflow Features");
  console.log("========================================\n");

  try {
    // Read migration file
    const migrationFile = path.join(__dirname, "add_workflow_features.sql");
    const sql = fs.readFileSync(migrationFile, "utf8");

    // Get database config from .env or prompt
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "haramaya_pharmacy",
      multipleStatements: true,
    };

    console.log(
      `Connecting to database: ${dbConfig.database}@${dbConfig.host}`,
    );
    console.log(`User: ${dbConfig.user}\n`);

    // If no password in .env, prompt for it
    if (!dbConfig.password) {
      dbConfig.password = await question("Enter MySQL password: ");
    }

    // Create connection
    const connection = await mysql.createConnection(dbConfig);
    console.log("✓ Connected to database\n");

    console.log("Running migration...\n");

    // Split SQL into individual statements and execute
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement) {
        try {
          await connection.query(statement);
          console.log("✓ Executed:", statement.substring(0, 60) + "...");
        } catch (error) {
          // Ignore "already exists" errors
          if (
            error.code === "ER_DUP_FIELDNAME" ||
            error.code === "ER_DUP_KEYNAME" ||
            error.message.includes("Duplicate column name") ||
            error.message.includes("already exists")
          ) {
            console.log(
              "⚠ Skipped (already exists):",
              statement.substring(0, 60) + "...",
            );
          } else {
            throw error;
          }
        }
      }
    }

    await connection.end();

    console.log("\n========================================");
    console.log("✓ Migration completed successfully!");
    console.log("========================================\n");
    console.log("Changes applied:");
    console.log("  - Added refill columns to prescriptions table");
    console.log("  - Added partial dispensing columns");
    console.log("  - Created emergency_dispensing table");
    console.log("  - Updated prescription status enum\n");
  } catch (error) {
    console.error("\n✗ Migration failed!");
    console.error("Error:", error.message);
    console.error("\nDetails:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

runMigration();
