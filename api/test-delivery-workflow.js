/**
 * Test script for Purchase Order Delivery and Inventory Update
 *
 * This script tests the complete workflow:
 * 1. Create a purchase order as pharmacist
 * 2. Confirm the order as supplier
 * 3. Mark as delivered with batch/expiry info
 * 4. Verify inventory was updated
 */

const axios = require("axios");

const API_URL = "http://localhost:5000/api";

// Test credentials
const PHARMACIST = { username: "pharmacist", password: "pharma123" };
const SUPPLIER = { username: "supplier", password: "supply123" };

let pharmacistToken = "";
let supplierToken = "";
let orderId = null;
let orderNumber = "";

// Helper function to login
async function login(credentials) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data.token;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
}

// Helper function to get medicine ID
async function getMedicineId(token, medicineName) {
  try {
    const response = await axios.get(`${API_URL}/medicines`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const medicine = response.data.data.find((m) =>
      m.name.includes(medicineName),
    );
    return medicine ? medicine.id : null;
  } catch (error) {
    console.error(
      "Failed to get medicines:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Helper function to get supplier catalog item
async function getCatalogItem(token, supplierId) {
  try {
    const response = await axios.get(
      `${API_URL}/supplier-catalog?supplier_id=${supplierId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.data[0]; // Return first item
  } catch (error) {
    console.error(
      "Failed to get catalog:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Step 1: Create purchase order as pharmacist
async function createPurchaseOrder() {
  console.log("\n=== STEP 1: Creating Purchase Order as Pharmacist ===");

  try {
    // Get a catalog item from supplier (ID: 15)
    const catalogItem = await getCatalogItem(pharmacistToken, 15);

    if (!catalogItem) {
      console.error("No catalog items found for supplier");
      return false;
    }

    console.log(
      `Using medicine: ${catalogItem.medicine_name} (ID: ${catalogItem.medicine_id})`,
    );
    console.log(
      `Price: ${catalogItem.unit_price} ETB, Available: ${catalogItem.quantity_available}`,
    );

    const orderData = {
      supplier_id: 15, // Ethiopian Pharmaceuticals Manufacturing
      order_date: new Date().toISOString().split("T")[0],
      expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      items: [
        {
          medicine_id: catalogItem.medicine_id,
          quantity: Math.min(10, catalogItem.quantity_available), // Order 10 or available quantity
          unit_price: catalogItem.unit_price,
        },
      ],
      notes: "Test order for delivery workflow",
    };

    const response = await axios.post(`${API_URL}/purchase-orders`, orderData, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });

    orderId = response.data.order.id;
    orderNumber = response.data.order.order_number;

    console.log("✓ Purchase order created successfully");
    console.log(`  Order ID: ${orderId}`);
    console.log(`  Order Number: ${orderNumber}`);
    console.log(`  Total Amount: ${response.data.order.total_amount} ETB`);

    return true;
  } catch (error) {
    console.error(
      "✗ Failed to create purchase order:",
      error.response?.data || error.message,
    );
    return false;
  }
}

// Step 2: Confirm order as supplier
async function confirmOrder() {
  console.log("\n=== STEP 2: Confirming Order as Supplier ===");

  try {
    const response = await axios.put(
      `${API_URL}/purchase-orders/${orderId}/status`,
      { status: "confirmed" },
      { headers: { Authorization: `Bearer ${supplierToken}` } },
    );

    console.log("✓ Order confirmed successfully");
    return true;
  } catch (error) {
    console.error(
      "✗ Failed to confirm order:",
      error.response?.data || error.message,
    );
    return false;
  }
}

// Step 3: Get inventory before delivery
async function getInventoryBefore(medicineId) {
  console.log("\n=== STEP 3: Checking Inventory Before Delivery ===");

  try {
    const response = await axios.get(`${API_URL}/inventory/stock`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });

    const inventoryItem = response.data.data.find(
      (item) => item.id === medicineId,
    );

    if (inventoryItem) {
      console.log(`Current inventory for medicine ID ${medicineId}:`);
      console.log(`  Available: ${inventoryItem.quantity_available}`);
      return inventoryItem.quantity_available;
    } else {
      console.log(`No inventory record found for medicine ID ${medicineId}`);
      return 0;
    }
  } catch (error) {
    console.error(
      "✗ Failed to get inventory:",
      error.response?.data || error.message,
    );
    return 0;
  }
}

// Step 4: Mark as delivered with batch/expiry info
async function markDelivered(medicineId, quantity) {
  console.log("\n=== STEP 4: Marking Order as Delivered ===");

  try {
    // Get order items first
    const orderResponse = await axios.get(
      `${API_URL}/purchase-orders/${orderId}`,
      {
        headers: { Authorization: `Bearer ${supplierToken}` },
      },
    );

    const deliveryData = {
      actual_delivery_date: new Date().toISOString().split("T")[0],
      items: orderResponse.data.items.map((item) => ({
        id: item.id,
        quantity_received: item.quantity_ordered,
        batch_number: `BATCH-TEST-${Date.now()}`,
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 1 year from now
      })),
    };

    console.log("Delivery data:", JSON.stringify(deliveryData, null, 2));

    const response = await axios.post(
      `${API_URL}/purchase-orders/${orderId}/deliver`,
      deliveryData,
      { headers: { Authorization: `Bearer ${supplierToken}` } },
    );

    console.log("✓ Order marked as delivered");
    console.log(`  Message: ${response.data.message}`);
    return true;
  } catch (error) {
    console.error(
      "✗ Failed to mark as delivered:",
      error.response?.data || error.message,
    );
    console.error("Error details:", error.response?.data);
    return false;
  }
}

// Step 5: Verify inventory was updated
async function verifyInventoryUpdate(
  medicineId,
  quantityBefore,
  quantityOrdered,
) {
  console.log("\n=== STEP 5: Verifying Inventory Update ===");

  try {
    const response = await axios.get(`${API_URL}/inventory/stock`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });

    const inventoryItem = response.data.data.find(
      (item) => item.id === medicineId,
    );

    if (inventoryItem) {
      const quantityAfter = inventoryItem.quantity_available;
      const expectedQuantity = quantityBefore + quantityOrdered;

      console.log(`Inventory for medicine ID ${medicineId}:`);
      console.log(`  Before: ${quantityBefore}`);
      console.log(`  Ordered: ${quantityOrdered}`);
      console.log(`  Expected: ${expectedQuantity}`);
      console.log(`  Actual: ${quantityAfter}`);

      if (quantityAfter >= expectedQuantity) {
        console.log("✓ Inventory updated correctly!");
        console.log(`  Increase: ${quantityAfter - quantityBefore} units`);
        return true;
      } else {
        console.log("✗ Inventory mismatch!");
        return false;
      }
    } else {
      console.log("✗ No inventory record found after delivery");
      return false;
    }
  } catch (error) {
    console.error(
      "✗ Failed to verify inventory:",
      error.response?.data || error.message,
    );
    return false;
  }
}

// Step 6: Verify stock_in record was created
async function verifyStockInRecord() {
  console.log("\n=== STEP 6: Verifying Stock-In Record ===");

  try {
    const response = await axios.get(`${API_URL}/inventory/movements?type=in`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });

    const stockInRecord = response.data.data.find(
      (record) => record.purchase_order_id === orderId,
    );

    if (stockInRecord) {
      console.log("✓ Stock-in record created:");
      console.log(`  Medicine: ${stockInRecord.medicine_name}`);
      console.log(`  Quantity: ${stockInRecord.quantity}`);
      console.log(`  Batch: ${stockInRecord.batch_number}`);
      console.log(`  Expiry: ${stockInRecord.expiry_date || "Not set"}`);
      console.log(`  PO Reference: ${stockInRecord.purchase_order_id}`);
      return true;
    } else {
      console.log("✗ No stock-in record found for this order");
      return false;
    }
  } catch (error) {
    console.error(
      "✗ Failed to verify stock-in record:",
      error.response?.data || error.message,
    );
    return false;
  }
}

// Main test function
async function runTest() {
  console.log("========================================");
  console.log("Purchase Order Delivery Workflow Test");
  console.log("========================================");

  try {
    // Login
    console.log("\n=== Logging in ===");
    pharmacistToken = await login(PHARMACIST);
    console.log("✓ Pharmacist logged in");

    supplierToken = await login(SUPPLIER);
    console.log("✓ Supplier logged in");

    // Run workflow
    const orderCreated = await createPurchaseOrder();
    if (!orderCreated) {
      console.log("\n✗ Test failed: Could not create order");
      return;
    }

    // Get order details to find medicine ID
    const orderResponse = await axios.get(
      `${API_URL}/purchase-orders/${orderId}`,
      {
        headers: { Authorization: `Bearer ${pharmacistToken}` },
      },
    );
    const medicineId = orderResponse.data.items[0].medicine_id;
    const quantityOrdered = orderResponse.data.items[0].quantity_ordered;

    const inventoryBefore = await getInventoryBefore(medicineId);

    const orderConfirmed = await confirmOrder();
    if (!orderConfirmed) {
      console.log("\n✗ Test failed: Could not confirm order");
      return;
    }

    const orderDelivered = await markDelivered(medicineId, quantityOrdered);
    if (!orderDelivered) {
      console.log("\n✗ Test failed: Could not mark as delivered");
      return;
    }

    // Wait a moment for database to update
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const inventoryVerified = await verifyInventoryUpdate(
      medicineId,
      inventoryBefore,
      quantityOrdered,
    );
    const stockInVerified = await verifyStockInRecord();

    // Summary
    console.log("\n========================================");
    console.log("TEST SUMMARY");
    console.log("========================================");
    console.log(`Order Creation: ${orderCreated ? "✓ PASS" : "✗ FAIL"}`);
    console.log(`Order Confirmation: ${orderConfirmed ? "✓ PASS" : "✗ FAIL"}`);
    console.log(`Order Delivery: ${orderDelivered ? "✓ PASS" : "✗ FAIL"}`);
    console.log(`Inventory Update: ${inventoryVerified ? "✓ PASS" : "✗ FAIL"}`);
    console.log(`Stock-In Record: ${stockInVerified ? "✓ PASS" : "✗ FAIL"}`);
    console.log("========================================");

    if (
      orderCreated &&
      orderConfirmed &&
      orderDelivered &&
      inventoryVerified &&
      stockInVerified
    ) {
      console.log("\n✓ ALL TESTS PASSED!");
    } else {
      console.log("\n✗ SOME TESTS FAILED");
    }
  } catch (error) {
    console.error("\n✗ Test failed with error:", error.message);
  }
}

// Run the test
runTest();
