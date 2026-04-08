/**
 * Test the ready-to-upload file
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

async function getCatalog(token) {
  const response = await axios.get(`${API_URL}/supplier-catalog`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

async function test() {
  console.log("========================================");
  console.log("Testing Ready-to-Upload File");
  console.log("========================================\n");

  try {
    const token = await login();
    console.log("✓ Logged in successfully\n");

    const supplierId = 15;

    // Get initial catalog
    console.log("1. Getting initial catalog state...");
    const initialCatalog = await getCatalog(token);
    console.log(`✓ Current catalog has ${initialCatalog.length} items\n`);

    // Upload Excel file
    console.log("2. Uploading supplier_catalog_upload_ready.xlsx...");
    const excelPath = path.join(
      __dirname,
      "..",
      "supplier_catalog_upload_ready.xlsx",
    );
    const excelResult = await bulkUpload(token, supplierId, excelPath);

    console.log("✓ Excel upload completed:");
    console.log(`  Success: ${excelResult.successCount}`);
    console.log(`  Errors: ${excelResult.errorCount}`);

    if (excelResult.errors && excelResult.errors.length > 0) {
      console.log("  Error details:");
      excelResult.errors.forEach((err) => console.log(`    - ${err}`));
    }
    console.log();

    // Upload CSV file
    console.log("3. Uploading supplier_catalog_upload_ready.csv...");
    const csvPath = path.join(
      __dirname,
      "..",
      "supplier_catalog_upload_ready.csv",
    );
    const csvResult = await bulkUpload(token, supplierId, csvPath);

    console.log("✓ CSV upload completed:");
    console.log(`  Success: ${csvResult.successCount}`);
    console.log(`  Errors: ${csvResult.errorCount}`);

    if (csvResult.errors && csvResult.errors.length > 0) {
      console.log("  Error details:");
      csvResult.errors.forEach((err) => console.log(`    - ${err}`));
    }
    console.log();

    // Get final catalog
    console.log("4. Getting final catalog state...");
    const finalCatalog = await getCatalog(token);
    console.log(`✓ Final catalog has ${finalCatalog.length} items\n`);

    // Show catalog details
    console.log("Final Catalog:");
    console.log("─".repeat(80));
    finalCatalog.forEach((item, index) => {
      console.log(`${index + 1}. ${item.medicine_name}`);
      console.log(
        `   Price: ${item.unit_price} ETB | Quantity: ${item.quantity_available} | Min Order: ${item.minimum_order_quantity}`,
      );
      if (item.notes) {
        console.log(`   Notes: ${item.notes}`);
      }
    });
    console.log("─".repeat(80));

    console.log("\n========================================");
    console.log("TEST RESULTS");
    console.log("========================================");

    if (excelResult.errorCount === 0 && csvResult.errorCount === 0) {
      console.log("✓ SUCCESS: All uploads completed without errors");
      console.log(`✓ Excel: ${excelResult.successCount} items`);
      console.log(`✓ CSV: ${csvResult.successCount} items`);
    } else {
      console.log("⚠ WARNING: Some items failed to upload");
      console.log(`  Excel errors: ${excelResult.errorCount}`);
      console.log(`  CSV errors: ${csvResult.errorCount}`);
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
