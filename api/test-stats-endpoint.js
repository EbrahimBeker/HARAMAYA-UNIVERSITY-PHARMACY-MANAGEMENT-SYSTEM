/**
 * Quick test for the stats endpoint
 */

const axios = require("axios");

const API_URL = "http://localhost:5000/api";

async function test() {
  try {
    // Login as supplier
    console.log("Logging in as supplier...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: "supplier",
      password: "supply123",
    });

    const token = loginRes.data.token;
    console.log("✓ Logged in successfully");

    // Get stats
    console.log("\nFetching catalog stats...");
    const statsRes = await axios.get(`${API_URL}/supplier-catalog/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✓ Stats retrieved successfully:");
    console.log(JSON.stringify(statsRes.data, null, 2));

    // Verify structure
    if (
      statsRes.data.totalItems !== undefined &&
      statsRes.data.availableItems !== undefined &&
      statsRes.data.totalValue !== undefined
    ) {
      console.log("\n✓ Response structure is correct");
      console.log(`  Total Items: ${statsRes.data.totalItems}`);
      console.log(`  Available Items: ${statsRes.data.availableItems}`);
      console.log(`  Total Value: ${statsRes.data.totalValue} ETB`);
    } else {
      console.log("\n✗ Response structure is incorrect");
    }
  } catch (error) {
    console.error("\n✗ Test failed:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Full error:", error.response?.data);
  }
}

test();
