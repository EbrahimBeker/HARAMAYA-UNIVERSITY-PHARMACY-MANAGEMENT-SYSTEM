#!/usr/bin/env node

require("dotenv").config();
const mysql = require("mysql2/promise");

async function seedCompleteData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "haramaya_pharmacy",
  });

  try {
    console.log("🌱 Seeding complete sample data...\n");

    // Check if data already exists
    const [existingCategories] = await connection.query(
      "SELECT COUNT(*) as count FROM medicine_categories",
    );
    if (existingCategories[0].count > 0) {
      console.log("⚠️  Sample data already exists. Skipping...");
      await connection.end();
      return;
    }

    // Insert Medicine Categories
    await connection.query(`
      INSERT INTO medicine_categories (name) VALUES
      ('Antibiotics'),
      ('Analgesics'),
      ('Antipyretics'),
      ('Antihistamines'),
      ('Cardiovascular'),
      ('Gastrointestinal'),
      ('Vitamins & Supplements'),
      ('Respiratory'),
      ('Dermatological'),
      ('Neurological')
    `);
    console.log("✅ Medicine categories added");

    // Insert Medicine Types
    await connection.query(`
      INSERT INTO medicine_types (name) VALUES
      ('Tablet'),
      ('Capsule'),
      ('Syrup'),
      ('Injection'),
      ('Cream'),
      ('Drops'),
      ('Inhaler'),
      ('Ointment'),
      ('Suspension'),
      ('Powder')
    `);
    console.log("✅ Medicine types added");

    // Insert Suppliers
    await connection.query(`
      INSERT INTO suppliers (name, contact_person, email, phone, address, is_active) VALUES
      ('MediSupply Ethiopia', 'Abebe Kebede', 'contact@medisupply.et', '+251911234567', 'Addis Ababa, Ethiopia', 1),
      ('PharmaDistributors Ltd', 'Tigist Alemu', 'info@pharmadist.et', '+251922345678', 'Dire Dawa, Ethiopia', 1),
      ('HealthCare Suppliers', 'Dawit Tesfaye', 'sales@healthcare.et', '+251933456789', 'Harar, Ethiopia', 1),
      ('Ethiopian Pharmaceuticals', 'Meron Tadesse', 'orders@ethpharma.et', '+251944567890', 'Bahir Dar, Ethiopia', 1),
      ('Global Medical Supply', 'Ahmed Hassan', 'info@globalmed.et', '+251955678901', 'Mekelle, Ethiopia', 1)
    `);
    console.log("✅ Suppliers added");

    // Insert Sample Medicines
    await connection.query(`
      INSERT INTO medicines (name, generic_name, category_id, type_id, strength, unit, reorder_level, unit_price, requires_prescription) VALUES
      ('Amoxicillin', 'Amoxicillin', 1, 2, '500mg', 'capsule', 50, 15.50, 1),
      ('Paracetamol', 'Acetaminophen', 2, 1, '500mg', 'tablet', 100, 5.00, 0),
      ('Ibuprofen', 'Ibuprofen', 2, 1, '400mg', 'tablet', 80, 8.50, 0),
      ('Cetirizine', 'Cetirizine HCl', 4, 1, '10mg', 'tablet', 60, 12.00, 0),
      ('Omeprazole', 'Omeprazole', 6, 2, '20mg', 'capsule', 40, 18.00, 1),
      ('Vitamin C', 'Ascorbic Acid', 7, 1, '1000mg', 'tablet', 100, 10.00, 0),
      ('Ciprofloxacin', 'Ciprofloxacin', 1, 1, '500mg', 'tablet', 30, 25.00, 1),
      ('Metformin', 'Metformin HCl', 5, 1, '500mg', 'tablet', 50, 20.00, 1),
      ('Aspirin', 'Acetylsalicylic Acid', 2, 1, '100mg', 'tablet', 200, 3.50, 0),
      ('Loratadine', 'Loratadine', 4, 1, '10mg', 'tablet', 75, 14.00, 0),
      ('Salbutamol Inhaler', 'Salbutamol', 8, 7, '100mcg', 'dose', 25, 45.00, 1),
      ('Hydrocortisone Cream', 'Hydrocortisone', 9, 5, '1%', 'tube', 30, 22.00, 0),
      ('Multivitamin', 'Mixed Vitamins', 7, 1, '500mg', 'tablet', 150, 12.50, 0),
      ('Cough Syrup', 'Dextromethorphan', 8, 3, '15mg/5ml', 'bottle', 40, 28.00, 0),
      ('Eye Drops', 'Chloramphenicol', 9, 6, '0.5%', 'bottle', 20, 35.00, 1)
    `);
    console.log("✅ Sample medicines added");

    // Initialize stock inventory for medicines
    await connection.query(`
      INSERT INTO stock_inventory (medicine_id, quantity_available)
      SELECT id, FLOOR(RAND() * 200) + 50 FROM medicines
    `);
    console.log("✅ Stock inventory initialized");

    // Insert Sample Patients (only if users exist)
    const [userCount] = await connection.query(
      "SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL",
    );
    if (userCount[0].count > 0) {
      // Get a user ID for registered_by field
      const [users] = await connection.query(
        "SELECT id FROM users WHERE deleted_at IS NULL LIMIT 1",
      );
      const registeredBy = users[0].id;

      await connection.query(
        `
        INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_group, registered_by) VALUES
        ('PAT000001', 'Almaz', 'Tadesse', '1985-03-15', 'Female', '+251911111111', 'almaz.tadesse@email.com', 'Addis Ababa, Ethiopia', 'Bekele Tadesse', '+251922222222', 'O+', ?),
        ('PAT000002', 'Girma', 'Bekele', '1978-07-22', 'Male', '+251933333333', 'girma.bekele@email.com', 'Dire Dawa, Ethiopia', 'Hanna Bekele', '+251944444444', 'A+', ?),
        ('PAT000003', 'Selamawit', 'Haile', '1992-11-08', 'Female', '+251955555555', 'selamawit.haile@email.com', 'Harar, Ethiopia', 'Tesfaye Haile', '+251966666666', 'B+', ?),
        ('PAT000004', 'Dawit', 'Mekonen', '1980-05-30', 'Male', '+251977777777', 'dawit.mekonen@email.com', 'Bahir Dar, Ethiopia', 'Marta Mekonen', '+251988888888', 'AB+', ?),
        ('PAT000005', 'Rahel', 'Assefa', '1995-09-12', 'Female', '+251999999999', 'rahel.assefa@email.com', 'Mekelle, Ethiopia', 'Solomon Assefa', '+251900000000', 'O-', ?)
      `,
        [registeredBy, registeredBy, registeredBy, registeredBy, registeredBy],
      );
      console.log("✅ Sample patients added");
    }

    // Insert Sample Purchase Orders
    const [supplierCount] = await connection.query(
      "SELECT COUNT(*) as count FROM suppliers",
    );
    if (supplierCount[0].count > 0 && userCount[0].count > 0) {
      const [suppliers] = await connection.query(
        "SELECT id FROM suppliers LIMIT 3",
      );
      const [creator] = await connection.query("SELECT id FROM users LIMIT 1");

      for (let i = 0; i < suppliers.length; i++) {
        const orderNumber = `PO${String(Date.now() + i).slice(-8)}`;
        const [orderResult] = await connection.query(
          `
          INSERT INTO purchase_orders (order_number, supplier_id, order_date, status, total_amount, expected_delivery_date, created_by)
          VALUES (?, ?, CURDATE(), 'Pending', 0, DATE_ADD(CURDATE(), INTERVAL 7 DAY), ?)
        `,
          [orderNumber, suppliers[i].id, creator[0].id],
        );

        // Add some items to the purchase order
        const [medicines] = await connection.query(
          "SELECT id FROM medicines LIMIT 3 OFFSET ?",
          [i * 2],
        );
        let totalAmount = 0;

        for (const medicine of medicines) {
          const quantity = Math.floor(Math.random() * 100) + 20;
          const unitCost = Math.floor(Math.random() * 50) + 10;
          totalAmount += quantity * unitCost;

          await connection.query(
            `
            INSERT INTO purchase_order_items (purchase_order_id, medicine_id, quantity_ordered, unit_cost)
            VALUES (?, ?, ?, ?)
          `,
            [orderResult.insertId, medicine.id, quantity, unitCost],
          );
        }

        // Update total amount
        await connection.query(
          "UPDATE purchase_orders SET total_amount = ? WHERE id = ?",
          [totalAmount, orderResult.insertId],
        );
      }
      console.log("✅ Sample purchase orders added");
    }

    console.log("\n✅ Complete sample data seeded successfully!\n");
    console.log("📊 Summary:");
    console.log("- Medicine categories: 10");
    console.log("- Medicine types: 10");
    console.log("- Suppliers: 5");
    console.log("- Medicines: 15");
    console.log("- Patients: 5 (if users exist)");
    console.log("- Purchase orders: 3 (if suppliers and users exist)");
    console.log("- Stock inventory initialized with random quantities\n");

    await connection.end();
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    await connection.end();
    process.exit(1);
  }
}

seedCompleteData();
