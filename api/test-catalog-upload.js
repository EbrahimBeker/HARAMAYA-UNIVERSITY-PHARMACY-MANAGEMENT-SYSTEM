const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

async function testCatalogUpload() {
  try {
    // First, login as supplier
    console.log("1. Logging in as supplier...");
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      username: "supplier",
      password: "supply123",
    });

    const token = loginRes.data.token;
    console.log("✓ Login successful");
    console.log("User:", loginRes.data.user);

    // Get supplier ID
    console.log("\n2. Getting supplier catalog...");
    const catalogRes = await axios.get(
      "http://localhost:5000/api/supplier-catalog",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const supplierId = catalogRes.data.supplier_id;
    console.log("✓ Supplier ID:", supplierId);
    console.log("Current catalog items:", catalogRes.data.data.length);

    if (!supplierId) {
      console.error(
        "✗ No supplier ID found. User may not be linked to a supplier.",
      );
      return;
    }

    // Upload test file
    console.log("\n3. Uploading test catalog file...");
    const formData = new FormData();
    const filePath = path.join(__dirname, "..", "test_catalog_upload.csv");

    if (!fs.existsSync(filePath)) {
      console.error("✗ Test file not found:", filePath);
      return;
    }

    formData.append("file", fs.createReadStream(filePath));
    formData.append("supplier_id", supplierId);

    const uploadRes = await axios.post(
      "http://localhost:5000/api/supplier-catalog/bulk-upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      },
    );

    console.log("✓ Upload completed!");
    console.log("Success count:", uploadRes.data.successCount);
    console.log("Error count:", uploadRes.data.errorCount);
    if (uploadRes.data.errors && uploadRes.data.errors.length > 0) {
      console.log("Errors:", uploadRes.data.errors);
    }

    // Get updated catalog
    console.log("\n4. Getting updated catalog...");
    const updatedCatalog = await axios.get(
      "http://localhost:5000/api/supplier-catalog",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log("✓ Updated catalog items:", updatedCatalog.data.data.length);
    console.log("\nCatalog items:");
    updatedCatalog.data.data.forEach((item) => {
      console.log(
        `  - ${item.medicine_name}: ${item.unit_price} ETB (${item.quantity_available} available)`,
      );
    });

    // Get stats
    console.log("\n5. Getting catalog statistics...");
    const statsRes = await axios.get(
      "http://localhost:5000/api/supplier-catalog/stats",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log("✓ Statistics:");
    console.log("  Total Items:", statsRes.data.totalItems);
    console.log("  Available Items:", statsRes.data.availableItems);
    console.log("  Total Value:", statsRes.data.totalValue, "ETB");

    console.log("\n✓ All tests passed!");
  } catch (error) {
    console.error("\n✗ Test failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testCatalogUpload();
