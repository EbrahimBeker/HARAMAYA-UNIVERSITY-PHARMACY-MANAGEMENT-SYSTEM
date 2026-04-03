#!/usr/bin/env node

require("dotenv").config();
const mysql = require("mysql2/promise");

async function seedTestWorkflow() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "haramaya_pharmacy",
  });

  try {
    console.log("🌱 Seeding test workflow data...\n");

    // Clear existing test data but keep foundation data
    console.log("🧹 Clearing existing test data...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    await connection.query("DELETE FROM payments WHERE id > 0");
    await connection.query("DELETE FROM invoice_items WHERE id > 0");
    await connection.query("DELETE FROM invoices WHERE id > 0");
    await connection.query("DELETE FROM stock_out WHERE id > 0");
    await connection.query("DELETE FROM stock_in WHERE id > 0");
    await connection.query("DELETE FROM purchase_order_items WHERE id > 0");
    await connection.query("DELETE FROM purchase_orders WHERE id > 0");
    await connection.query("DELETE FROM prescription_items WHERE id > 0");
    await connection.query("DELETE FROM prescriptions WHERE id > 0");
    await connection.query("DELETE FROM diagnoses WHERE id > 0");
    await connection.query("DELETE FROM patients WHERE id > 0");
    await connection.query("DELETE FROM stock_inventory WHERE id > 0");
    await connection.query("DELETE FROM medicines WHERE id > 0");
    await connection.query("DELETE FROM suppliers WHERE id > 0");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("✅ Test data cleared");

    // Get existing category and type IDs
    const [categories] = await connection.query(
      "SELECT id, name FROM medicine_categories ORDER BY id",
    );
    const [types] = await connection.query(
      "SELECT id, name FROM medicine_types ORDER BY id",
    );

    const categoryMap = {};
    const typeMap = {};

    categories.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    types.forEach((type) => {
      typeMap[type.name] = type.id;
    });

    console.log("📋 Available categories:", Object.keys(categoryMap));
    console.log("📋 Available types:", Object.keys(typeMap));

    // 1. Add suppliers
    console.log("\n🏢 1. Adding suppliers...");
    await connection.query(`
      INSERT INTO suppliers (name, contact_person, email, phone, address, is_active) VALUES
      ('Ethiopian Pharmaceuticals Manufacturing', 'Dr. Alemayehu Tadesse', 'contact@epharm.et', '+251911234567', 'Addis Ababa, Kirkos Sub City', 1),
      ('Cadila Pharmaceuticals Ethiopia', 'Ms. Hanan Mohammed', 'ethiopia@cadila.com', '+251922345678', 'Addis Ababa, Bole Sub City', 1),
      ('FMHACA Approved Distributors', 'Mr. Dawit Bekele', 'info@fmhaca-dist.et', '+251933456789', 'Dire Dawa, Ethiopia', 1)
    `);
    console.log("✅ Suppliers added");

    // 2. Add medicines using existing category/type IDs
    console.log("\n💊 2. Adding medicines...");
    const antibioticsId = categoryMap["Antibiotics"] || categories[0]?.id;
    const analgesicsId =
      categoryMap["Analgesics"] ||
      categoryMap["Analgesics & Antipyretics"] ||
      categories[1]?.id;
    const tabletId = typeMap["Tablet"] || types[0]?.id;
    const capsuleId = typeMap["Capsule"] || types[1]?.id;

    await connection.query(`
      INSERT INTO medicines (name, generic_name, category_id, type_id, strength, unit, reorder_level, unit_price, requires_prescription) VALUES
      ('Amoxicillin', 'Amoxicillin', ${antibioticsId}, ${capsuleId}, '500mg', 'capsule', 50, 15.50, 1),
      ('Paracetamol', 'Acetaminophen', ${analgesicsId}, ${tabletId}, '500mg', 'tablet', 100, 5.00, 0),
      ('Ibuprofen', 'Ibuprofen', ${analgesicsId}, ${tabletId}, '400mg', 'tablet', 80, 8.50, 0),
      ('Ciprofloxacin', 'Ciprofloxacin HCl', ${antibioticsId}, ${tabletId}, '500mg', 'tablet', 30, 25.00, 1),
      ('Omeprazole', 'Omeprazole', ${analgesicsId}, ${capsuleId}, '20mg', 'capsule', 40, 18.00, 1)
    `);
    console.log("✅ Medicines added");

    // 3. Initialize stock
    console.log("\n📦 3. Initializing stock...");
    await connection.query(`
      INSERT INTO stock_inventory (medicine_id, quantity_available)
      SELECT id, FLOOR(RAND() * 200) + 100 FROM medicines
    `);
    console.log("✅ Stock initialized");

    // 4. Add patients
    console.log("\n👥 4. Adding patients...");
    await connection.query(`
      INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_group, allergies, registered_by) VALUES
      ('PAT001', 'Abebe', 'Kebede', '1985-03-15', 'Male', '+251911111111', 'abebe.kebede@email.com', 'Haramaya University Campus', 'Almaz Kebede', '+251922222222', 'O+', 'None known', 9),
      ('PAT002', 'Tigist', 'Alemu', '1990-07-22', 'Female', '+251933333333', 'tigist.alemu@email.com', 'Harar City', 'Dawit Alemu', '+251944444444', 'A+', 'Penicillin allergy', 9),
      ('PAT003', 'Mohammed', 'Hassan', '1978-12-10', 'Male', '+251955555555', 'mohammed.hassan@email.com', 'Dire Dawa', 'Fatima Hassan', '+251966666666', 'B+', 'None known', 9)
    `);
    console.log("✅ Patients added");

    // 5. Add diagnoses
    console.log("\n🩺 5. Adding diagnoses...");
    await connection.query(`
      INSERT INTO diagnoses (patient_id, physician_id, diagnosis_date, symptoms, vital_signs, diagnosis, notes) VALUES
      (1, 10, '2024-04-01', 'Fever, headache, body aches', '{"temperature": "38.5°C", "bp": "120/80", "pulse": "85"}', 'Upper Respiratory Tract Infection', 'Prescribed antibiotics and rest'),
      (2, 10, '2024-04-01', 'Severe headache, nausea', '{"temperature": "37.2°C", "bp": "140/90", "pulse": "92"}', 'Migraine with hypertension', 'Blood pressure monitoring required'),
      (3, 10, '2024-04-02', 'Stomach pain, indigestion', '{"temperature": "36.9°C", "bp": "110/70", "pulse": "78"}', 'Gastritis', 'Dietary modifications recommended')
    `);
    console.log("✅ Diagnoses added");

    // 6. Add prescriptions
    console.log("\n📋 6. Adding prescriptions...");
    await connection.query(`
      INSERT INTO prescriptions (prescription_number, patient_id, diagnosis_id, physician_id, prescription_date, status, notes) VALUES
      ('RX001', 1, 1, 10, '2024-04-01', 'Dispensed', 'Complete course of antibiotics'),
      ('RX002', 2, 2, 10, '2024-04-01', 'Dispensed', 'Monitor blood pressure daily'),
      ('RX003', 3, 3, 10, '2024-04-02', 'Pending', 'Take with food')
    `);
    console.log("✅ Prescriptions added");

    // 7. Add prescription items
    console.log("\n💊 7. Adding prescription items...");
    await connection.query(`
      INSERT INTO prescription_items (prescription_id, medicine_id, quantity, dosage, frequency, duration, instructions) VALUES
      (1, 1, 21, '500mg', 'Three times daily', '7 days', 'Take with food, complete full course'),
      (1, 2, 20, '500mg', 'Four times daily', '5 days', 'For fever and pain relief'),
      (2, 3, 20, '400mg', 'As needed', 'PRN', 'For headache, max 3 times daily'),
      (3, 5, 14, '20mg', 'Once daily', '14 days', 'Take before breakfast')
    `);
    console.log("✅ Prescription items added");

    // 8. Add invoices
    console.log("\n💰 8. Adding invoices...");
    await connection.query(`
      INSERT INTO invoices (invoice_number, patient_id, prescription_id, invoice_date, subtotal, discount, tax, total_amount, status, generated_by) VALUES
      ('INV001', 1, 1, '2024-04-01', 425.00, 0.00, 21.25, 446.25, 'Paid', 9),
      ('INV002', 2, 2, '2024-04-01', 170.00, 0.00, 8.50, 178.50, 'Paid', 9),
      ('INV003', 3, 3, '2024-04-02', 252.00, 0.00, 12.60, 264.60, 'Pending', 9)
    `);
    console.log("✅ Invoices added");

    // 9. Add invoice items
    console.log("\n📄 9. Adding invoice items...");
    await connection.query(`
      INSERT INTO invoice_items (invoice_id, medicine_id, quantity, unit_price) VALUES
      (1, 1, 21, 15.50),
      (1, 2, 20, 5.00),
      (2, 3, 20, 8.50),
      (3, 5, 14, 18.00)
    `);
    console.log("✅ Invoice items added");

    // 10. Add payments
    console.log("\n💳 10. Adding payments...");
    await connection.query(`
      INSERT INTO payments (payment_number, invoice_id, payment_date, payment_method, amount_paid, change_given, received_by, notes) VALUES
      ('PAY001', 1, '2024-04-01', 'Cash', 450.00, 3.75, 9, 'Cash payment'),
      ('PAY002', 2, '2024-04-01', 'Card', 178.50, 0.00, 9, 'Debit card payment')
    `);
    console.log("✅ Payments added");

    console.log("\n🎉 Test workflow data seeded successfully!\n");

    // Display summary
    const [summary] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM patients) as patients,
        (SELECT COUNT(*) FROM medicines) as medicines,
        (SELECT COUNT(*) FROM suppliers) as suppliers,
        (SELECT COUNT(*) FROM prescriptions) as prescriptions,
        (SELECT COUNT(*) FROM invoices) as invoices,
        (SELECT COUNT(*) FROM payments) as payments
    `);

    console.log("📈 WORKFLOW DATA SUMMARY");
    console.log("========================");
    console.log(`👥 Patients: ${summary[0].patients}`);
    console.log(`💊 Medicines: ${summary[0].medicines}`);
    console.log(`🏢 Suppliers: ${summary[0].suppliers}`);
    console.log(`📋 Prescriptions: ${summary[0].prescriptions}`);
    console.log(`💰 Invoices: ${summary[0].invoices}`);
    console.log(`💳 Payments: ${summary[0].payments}`);

    console.log("\n🎯 TEST WORKFLOW READY");
    console.log("======================");
    console.log(
      "✅ Patient registration → Diagnosis → Prescription → Dispensing → Billing → Payment",
    );
    console.log("✅ Role-based access control testing");
    console.log("✅ Inventory management workflow");
    console.log("✅ Report generation testing");

    console.log("\n🔑 LOGIN AND TEST");
    console.log("==================");
    console.log("1. Start API: npm start");
    console.log("2. Start Frontend: cd ../frontend && npm run dev");
    console.log("3. Login with different roles:");
    console.log("   - Admin: admin/admin123");
    console.log("   - Data Clerk: clerk/clerk123");
    console.log("   - Physician: physician/physician123");
    console.log("   - Pharmacist: pharmacist/pharma123");
    console.log("   - Supplier: supplier/supply123");

    await connection.end();
  } catch (error) {
    console.error("❌ Error seeding test workflow:", error.message);
    await connection.end();
    process.exit(1);
  }
}

seedTestWorkflow();
