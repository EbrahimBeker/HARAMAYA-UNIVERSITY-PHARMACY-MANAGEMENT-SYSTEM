const axios = require("axios");

const API_URL = "http://localhost:5000/api";

// Test credentials
const adminCredentials = {
  username: "admin",
  password: "admin123",
};

async function testMedicineCreation() {
  try {
    console.log("=== Testing Medicine Creation ===\n");

    // Step 1: Login as admin
    console.log("1. Logging in as admin...");
    const loginRes = await axios.post(
      `${API_URL}/auth/login`,
      adminCredentials,
    );
    const token = loginRes.data.token;
    console.log("✓ Login successful\n");

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    // Step 2: Get categories and types
    console.log("2. Fetching categories and types...");
    const [categoriesRes, typesRes] = await Promise.all([
      axios.get(`${API_URL}/medicine-categories`, config),
      axios.get(`${API_URL}/medicine-types`, config),
    ]);

    const categories = categoriesRes.data;
    const types = typesRes.data;

    console.log(`✓ Found ${categories.length} categories`);
    console.log(`✓ Found ${types.length} types\n`);

    if (categories.length === 0 || types.length === 0) {
      console.log("❌ No categories or types found. Cannot create medicine.");
      return;
    }

    // Step 3: Create a test medicine
    console.log("3. Creating test medicine...");
    const newMedicine = {
      name: "Test Medicine " + Date.now(),
      generic_name: "Test Generic Name",
      category_id: categories[0].id,
      type_id: types[0].id,
      strength: "100mg",
      unit: "tablet",
      reorder_level: 20,
      unit_price: 15.5,
      requires_prescription: true,
    };

    console.log("Medicine data:", JSON.stringify(newMedicine, null, 2));

    const createRes = await axios.post(
      `${API_URL}/medicines`,
      newMedicine,
      config,
    );
    console.log("✓ Medicine created successfully!");
    console.log(
      "Created medicine:",
      JSON.stringify(createRes.data.medicine, null, 2),
    );

    // Step 4: Verify the medicine was created
    console.log("\n4. Verifying medicine creation...");
    const medicineId = createRes.data.medicine.id;
    const getRes = await axios.get(
      `${API_URL}/medicines/${medicineId}`,
      config,
    );
    console.log("✓ Medicine retrieved successfully");
    console.log("Retrieved medicine:", JSON.stringify(getRes.data, null, 2));

    // Step 5: Clean up - delete the test medicine
    console.log("\n5. Cleaning up - deleting test medicine...");
    await axios.delete(`${API_URL}/medicines/${medicineId}`, config);
    console.log("✓ Test medicine deleted\n");

    console.log("=== All Tests Passed! ===");
  } catch (error) {
    console.error("\n❌ Test failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

testMedicineCreation();
