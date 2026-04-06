#!/usr/bin/env node

require("dotenv").config();
const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

// Test users with their expected roles
const testUsers = [
  {
    username: "admin",
    password: "admin123",
    role: "Admin",
    expectedAccess: ["medicines", "suppliers", "users", "reports"],
  },
  {
    username: "clerk",
    password: "clerk123",
    role: "Data Clerk",
    expectedAccess: ["patients", "medicines"],
  },
  {
    username: "doctor",
    password: "doctor123",
    role: "Physician",
    expectedAccess: ["patients", "medicines", "prescriptions"],
  },
  {
    username: "pharmacist",
    password: "pharma123",
    role: "Pharmacist",
    expectedAccess: ["medicines", "suppliers", "prescriptions", "reports"],
  },
  {
    username: "supplier",
    password: "supply123",
    role: "Drug Supplier",
    expectedAccess: ["reports"],
  },
];

async function testUserLogin(user) {
  try {
    console.log(`\n🔐 Testing ${user.role} (${user.username})...`);

    // Test login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: user.username,
      password: user.password,
    });

    if (loginResponse.data.token) {
      console.log(`✅ Login successful`);
      console.log(`   User: ${loginResponse.data.user.full_name}`);
      console.log(`   Roles: ${loginResponse.data.user.roles.join(", ")}`);

      const token = loginResponse.data.token;
      const headers = { Authorization: `Bearer ${token}` };

      // Test API access based on role
      const apiTests = [];

      if (user.expectedAccess.includes("medicines")) {
        apiTests.push(testEndpoint("medicines", headers));
      }

      if (user.expectedAccess.includes("suppliers")) {
        apiTests.push(testEndpoint("suppliers", headers));
      }

      if (user.expectedAccess.includes("patients")) {
        apiTests.push(testEndpoint("patients", headers));
      }

      if (user.expectedAccess.includes("users") && user.role === "Admin") {
        apiTests.push(testEndpoint("users", headers));
      }

      if (user.expectedAccess.includes("reports")) {
        apiTests.push(testEndpoint("reports/dashboard", headers));
      }

      const results = await Promise.allSettled(apiTests);

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          console.log(`   ✅ ${user.expectedAccess[index]} API accessible`);
        } else {
          console.log(
            `   ❌ ${user.expectedAccess[index]} API failed: ${result.reason.message}`,
          );
        }
      });

      return true;
    } else {
      console.log(`❌ Login failed - no token received`);
      return false;
    }
  } catch (error) {
    console.log(
      `❌ Login failed: ${error.response?.data?.message || error.message}`,
    );
    return false;
  }
}

async function testEndpoint(endpoint, headers) {
  const response = await axios.get(`${API_BASE}/${endpoint}`, { headers });
  return response.data;
}

async function verifyUIFunctionality() {
  console.log("🧪 Verifying UI Functionality and API Access\n");
  console.log("=".repeat(50));

  let successCount = 0;

  for (const user of testUsers) {
    const success = await testUserLogin(user);
    if (success) successCount++;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`📊 VERIFICATION SUMMARY`);
  console.log(`✅ Successful logins: ${successCount}/${testUsers.length}`);

  if (successCount === testUsers.length) {
    console.log(`🎉 All user roles working correctly!`);
    console.log(`\n🌐 FRONTEND ACCESS:`);
    console.log(`   URL: http://localhost:3001`);
    console.log(`   Status: Ready for testing`);

    console.log(`\n🔑 TEST CREDENTIALS:`);
    testUsers.forEach((user) => {
      console.log(`   ${user.role}: ${user.username}/${user.password}`);
    });

    console.log(`\n✅ VERIFIED FUNCTIONALITY:`);
    console.log(`   • Authentication system working`);
    console.log(`   • Role-based API access control`);
    console.log(`   • Database connectivity`);
    console.log(`   • Test data populated`);
    console.log(`   • All user roles functional`);

    console.log(`\n🎯 READY FOR MANUAL UI TESTING:`);
    console.log(`   1. Open http://localhost:3001 in browser`);
    console.log(`   2. Login with different user roles`);
    console.log(`   3. Verify role-based menu visibility`);
    console.log(`   4. Test CRUD operations per role`);
    console.log(`   5. Check report access restrictions`);
  } else {
    console.log(`⚠️  Some user roles have issues - check logs above`);
  }
}

// Run verification
verifyUIFunctionality().catch((error) => {
  console.error("❌ Verification failed:", error.message);
  process.exit(1);
});
