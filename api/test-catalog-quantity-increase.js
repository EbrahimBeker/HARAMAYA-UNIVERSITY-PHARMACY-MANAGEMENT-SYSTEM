/**
 * Test script to verify that adding existing drugs increases quantity
 * instead of overriding it
 */

const axios = require("axios");

const API_URL = "http://localhost:5000/api";

async function login() {
  const response = await axios.post(`${API_URL}/auth/login`, {
    username: "supplier",
    password: "supply123",
  });
  return response.data.token;
}

async function getCatalogItem(token, medicineId) {
  const response = await axios.get(`${API_URL}/supplier-catalog`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.find((item) => item.medicine_id === medicineId);
}

async function addCatalogItem(token, supplierId, medicineId, quantity, price) {
  const response = await axios.post(
    `${API_URL}/supplier-catalog`,
    {
      supplier_id: supplierId,
      medicine_id: medicineId,
      unit_price: price,
      quantity_available: quantity,
      minimum_order_quantity: 1,
      is_available: true,
      notes: "Test item",
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}

async function test() {
  console.log("========================================");
  console.log("Catalog Quantity Increase Test");
  console.log("========================================\n");

  try {
    // Login
    console.log("1. Logging in as supplier...");
    const token = await login();
    console.log("✓ Logged in successfully\n");

    const supplierId = 15;
    const medicineId = 49; // Amlodipine

    // Get initial quantity
    console.log("2. Getting initial catalog state...");
    const initialItem = await getCatalogItem(token, medicineId);
    const initialQuantity = initialItem ? initialItem.quantity_available : 0;
    const initialPrice = initialItem ? initialItem.unit_price : 0;
    console.log(`✓ Initial state:`);
    console.log(`  Medicine ID: ${medicineId}`);
    console.log(`  Quantity: ${initialQuantity}`);
    console.log(`  Price: ${initialPrice} ETB\n`);

    // Add quantity
    console.log("3. Adding 50 units at 25 ETB...");
    const addResult = await addCatalogItem(
      token,
      supplierId,
      medicineId,
      50,
      25,
    );
    console.log(`✓ ${addResult.message}\n`);

    // Verify quantity increased
    console.log("4. Verifying quantity increased...");
    const updatedItem = await getCatalogItem(token, medicineId);
    const newQuantity = updatedItem.quantity_available;
    const newPrice = updatedItem.unit_price;

    console.log(`✓ Updated state:`);
    console.log(`  Quantity: ${newQuantity}`);
    console.log(`  Price: ${newPrice} ETB`);
    console.log(`  Increase: ${newQuantity - initialQuantity} units\n`);

    // Verify results
    const expectedQuantity = initialQuantity + 50;

    console.log("========================================");
    console.log("TEST RESULTS");
    console.log("========================================");

    if (newQuantity === expectedQuantity) {
      console.log("✓ PASS: Quantity increased correctly");
      console.log(`  Expected: ${expectedQuantity}`);
      console.log(`  Actual: ${newQuantity}`);
    } else {
      console.log("✗ FAIL: Quantity mismatch");
      console.log(`  Expected: ${expectedQuantity}`);
      console.log(`  Actual: ${newQuantity}`);
    }

    if (newPrice === 25) {
      console.log("✓ PASS: Price updated correctly");
      console.log(`  Expected: 25 ETB`);
      console.log(`  Actual: ${newPrice} ETB`);
    } else {
      console.log("✗ FAIL: Price not updated");
      console.log(`  Expected: 25 ETB`);
      console.log(`  Actual: ${newPrice} ETB`);
    }

    console.log("========================================\n");

    // Add more quantity to test again
    console.log("5. Adding another 30 units at 30 ETB...");
    const addResult2 = await addCatalogItem(
      token,
      supplierId,
      medicineId,
      30,
      30,
    );
    console.log(`✓ ${addResult2.message}\n`);

    console.log("6. Verifying second increase...");
    const finalItem = await getCatalogItem(token, medicineId);
    const finalQuantity = finalItem.quantity_available;
    const finalPrice = finalItem.unit_price;

    console.log(`✓ Final state:`);
    console.log(`  Quantity: ${finalQuantity}`);
    console.log(`  Price: ${finalPrice} ETB`);
    console.log(`  Total increase: ${finalQuantity - initialQuantity} units\n`);

    const expectedFinalQuantity = expectedQuantity + 30;

    console.log("========================================");
    console.log("FINAL TEST RESULTS");
    console.log("========================================");

    if (finalQuantity === expectedFinalQuantity) {
      console.log("✓ PASS: Multiple additions work correctly");
      console.log(`  Expected: ${expectedFinalQuantity}`);
      console.log(`  Actual: ${finalQuantity}`);
    } else {
      console.log("✗ FAIL: Multiple additions failed");
      console.log(`  Expected: ${expectedFinalQuantity}`);
      console.log(`  Actual: ${finalQuantity}`);
    }

    if (finalPrice === 30) {
      console.log("✓ PASS: Price updated on second addition");
      console.log(`  Expected: 30 ETB`);
      console.log(`  Actual: ${finalPrice} ETB`);
    } else {
      console.log("✗ FAIL: Price not updated on second addition");
      console.log(`  Expected: 30 ETB`);
      console.log(`  Actual: ${finalPrice} ETB`);
    }

    console.log("========================================\n");
  } catch (error) {
    console.error("\n✗ Test failed with error:");
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Status:", error.response?.status);
  }
}

test();
