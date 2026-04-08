require("dotenv").config();
const db = require("./config/database");

async function testPrescriptions() {
  try {
    console.log("Testing prescriptions query...\n");

    // Test 1: Count total prescriptions
    const [countResult] = await db.execute(
      "SELECT COUNT(*) as count FROM prescriptions",
    );
    console.log("Total prescriptions:", countResult[0].count);

    // Test 2: Get all prescriptions with details
    const [prescriptions] = await db.execute(`
      SELECT p.*, 
             p.patient_name,
             CONCAT(u.first_name, ' ', u.last_name) as physician_name
      FROM prescriptions p
      LEFT JOIN users u ON p.physician_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    console.log("\nRecent prescriptions:");
    console.log(JSON.stringify(prescriptions, null, 2));

    // Test 3: Check if there are any prescriptions at all
    if (prescriptions.length === 0) {
      console.log("\n⚠️  No prescriptions found in database!");
    } else {
      console.log(`\n✅ Found ${prescriptions.length} prescriptions`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testPrescriptions();
