#!/usr/bin/env node

require("dotenv").config();
const { execSync } = require("child_process");

console.log("🚀 Setting up complete test environment...\n");

try {
  // 1. Initialize database structure
  console.log("1️⃣ Initializing database structure...");
  execSync("node setup-simple.js", { stdio: "inherit" });

  // 2. Seed users
  console.log("\n2️⃣ Creating default users...");
  execSync("node seed-users.js", { stdio: "inherit" });

  // 3. Seed complete test data
  console.log("\n3️⃣ Seeding complete test data...");
  execSync("node seed-complete-test-data.js", { stdio: "inherit" });

  console.log("\n🎉 Test environment setup complete!");
  console.log("\n🔗 Next Steps:");
  console.log("1. Start the API server: npm start");
  console.log("2. Start the frontend: cd ../frontend && npm run dev");
  console.log("3. Login with test credentials (see DEFAULT_CREDENTIALS.md)");
  console.log("4. Test the complete pharmacy workflow");
} catch (error) {
  console.error("❌ Setup failed:", error.message);
  process.exit(1);
}
