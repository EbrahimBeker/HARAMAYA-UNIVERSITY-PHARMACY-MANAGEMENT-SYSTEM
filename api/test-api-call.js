require("dotenv").config();
const axios = require("axios");

async function testAPI() {
  try {
    console.log("Testing API authentication and permissions...\n");

    // Step 1: Login
    console.log("1. Logging in as doctor...");
    const loginResponse = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        username: "doctor",
        password: "doctor123",
      },
    );

    const token = loginResponse.data.token;
    console.log("✅ Login successful");
    console.log("Token:", token.substring(0, 20) + "...");
    console.log("User:", loginResponse.data.user);

    // Step 2: Test /me endpoint
    console.log("\n2. Testing /me endpoint...");
    const meResponse = await axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ /me endpoint works");
    console.log("User data:", meResponse.data.user);

    // Step 3: Test prescriptions endpoint
    console.log("\n3. Testing /prescriptions endpoint...");
    const prescriptionsResponse = await axios.get(
      "http://localhost:5000/api/prescriptions?limit=5",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log("✅ Prescriptions endpoint works!");
    console.log("Prescriptions count:", prescriptionsResponse.data.data.length);
    console.log("First prescription:", prescriptionsResponse.data.data[0]);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.response?.data || error.message);
    console.error("Status:", error.response?.status);
    process.exit(1);
  }
}

testAPI();
