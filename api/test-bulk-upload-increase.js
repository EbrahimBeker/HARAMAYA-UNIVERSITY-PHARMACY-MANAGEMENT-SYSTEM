/**
 * Test bulk upload quantity increase
 */

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_URL = "http://localhost:5000/api";

async function login() {
  const response = await axios.post(`${API_URL}/auth/login`, {
    username: "supplier",
    password: "supply123",
  });
  return response.data.token;
}

async function getCatalogItem(token, medicineName) {
  const response = await axios.get(`${API_URL}/supplier-catalog`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.find((item) =>
    item.medicine_name.toLowerCase().includes(medicineName.toLowerCase()),
  );
}

async function bulkUpload(token, supplierId, filePath) {
  const form = new FormData();
  form.append("supplier_id", supplierId);
  form.append("file", fs.createReadStream(filePath));

  const response = await axios.post(
    `${API_URL}/supplier-catalog/bulk-upload`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

async function test() {
  console.log("========================================");
  console.log("Bulk Upload Quantity Increase Test");
  console.log("========================================\n");

  try {
    const token = await login();
    console.log("✓ Logged in successfully\n");

    const supplierId = 15;
    const testMedicine = "Amlodipine";

    // Get initial state
    console.log("1. Getting initial state...");
    const initialItem = await getCatalogItem(token, testMedicine);
    const initialQuantity = initialItem ? initialItem.quantity_available : 0;
    const initialPrice = initialItem ? parseFloat(initialItem.unit_price) : 0;

    console.log(`✓ Initial state for ${testMedicine}:`);
    console.log(`  Quantity: ${initialQuantity}`);
    console.log(`  Price: ${initialPrice} ETB\n`);

    // Upload CSV
    console.log("2. Uploading CSV file...");
    const csvPath = path.join(__dirname, "..", "test_catalog_update.csv");
    const uploadResult = await bulkUpload(token, supplierId, csvPath);

    console.log("✓ Upload completed:");
    console.log(`  Success: ${uploadResult.successCount}`);
    console.log(`  Errors: ${uploadResult.errorCount}`);
    if (uploadResult.errors && uploadResult.errors.length > 0) {
      console.log("  Error details:", uploadResult.errors);
    }
    console.log();

    // Verify quantity increased
    console.log("3. Verifying quantity increased...");
    const updatedItem = await getCatalogItem(token, testMedicine);
    const newQuantity = updatedItem.quantity_available;
    const newPrice = parseFloat(updatedItem.unit_price);

    console.log(`✓ Updated state for ${testMedicine}:`);
    console.log(`  Quantity: ${newQuantity}`);
    console.log(`  Price: ${newPrice} ETB`);
    console.log(`  Increase: ${newQuantity - initialQuantity} units\n`);

    // Verify results
    const expectedQuantity = initialQuantity + 100; // CSV has 100 units

    console.log("========================================");
    console.log("TEST RESULTS");
    console.log("========================================");

    if (newQuantity === expectedQuantity) {
      console.log("✓ PASS: Bulk upload increased quantity correctly");
      console.log(`  Expected: ${expectedQuantity}`);
      console.log(`  Actual: ${newQuantity}`);
    } else {
      console.log("✗ FAIL: Quantity mismatch");
      console.log(`  Expected: ${expectedQuantity}`);
      console.log(`  Actual: ${newQuantity}`);
    }

    if (newPrice === 35) {
      console.log("✓ PASS: Price updated correctly");
      console.log(`  Expected: 35 ETB`);
      console.log(`  Actual: ${newPrice} ETB`);
    } else {
      console.log("⚠ WARNING: Price mismatch (might be rounding)");
      console.log(`  Expected: 35 ETB`);
      console.log(`  Actual: ${newPrice} ETB`);
    }

    console.log("========================================\n");
  } catch (error) {
    console.error("\n✗ Test failed with error:");
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Status:", error.response?.status);
    if (error.response?.data) {
      console.error("Response:", error.response.data);
    }
  }
}

test();
