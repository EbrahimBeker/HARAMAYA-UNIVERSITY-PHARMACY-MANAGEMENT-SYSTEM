#!/usr/bin/env node

require("dotenv").config();
const mysql = require("mysql2/promise");

async function seedFinalTestData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "haramaya_pharmacy",
  });

  try {
    console.log("🌱 Seeding final test data with proper workflow...\n");

    // Clear existing test data
    console.log("🧹 Clearing existing test data...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    await connection.query("DELETE FROM payments WHERE id > 0");
    await connection.query("DELETE FROM invoice_items WHERE id > 0");
    await connection.query("DELETE FROM invoices WHERE id > 0");
    await connection.query("DELETE FROM prescription_items WHERE id > 0");
    await connection.query("DELETE FROM prescriptions WHERE id > 0");
    await connection.query("DELETE FROM diagnoses WHERE id > 0");
    await connection.query("DELETE FROM patients WHERE id > 0");
    await connection.query("DELETE FROM stock_inventory WHERE id > 0");
    await connection.query("DELETE FROM medicines WHERE id > 0");
    await connection.query("DELETE FROM suppliers WHERE id > 0");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("✅ Test data cleared");

    // Get user IDs
    const [users] = await connection.query("SELECT id, username FROM users");
    const userMap = {};
    users.forEach((user) => {
      userMap[user.username] = user.id;
    });

    console.log("👥 Available users:", Object.keys(userMap));

    // Get category and type IDs
    const [categories] = await connection.query(
      "SELECT id, name FROM medicine_categories",
    );
    const [types] = await connection.query(
      "SELECT id, name FROM medicine_types",
    );

    const categoryMap = {};
    const typeMap = {};

    categories.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    types.forEach((type) => {
      typeMap[type.name] = type.id;
    });

    // 1. Add suppliers
    console.log("\n🏢 1. Adding suppliers...");
    const [supplierResult] = await connection.query(`
      INSERT INTO suppliers (name, contact_person, email, phone, address, is_active) VALUES
      ('Ethiopian Pharmaceuticals Manufacturing', 'Dr. Alemayehu Tadesse', 'contact@epharm.et', '+251911234567', 'Addis Ababa, Kirkos Sub City', 1),
      ('Cadila Pharmaceuticals Ethiopia', 'Ms. Hanan Mohammed', 'ethiopia@cadila.com', '+251922345678', 'Addis Ababa, Bole Sub City', 1),
      ('FMHACA Approved Distributors', 'Mr. Dawit Bekele', 'info@fmhaca-dist.et', '+251933456789', 'Dire Dawa, Ethiopia', 1)
    `);
    console.log("✅ Suppliers added");

    // 2. Add medicines
    console.log("\n💊 2. Adding medicines...");
    const antibioticsId = categoryMap["Antibiotics"];
    const analgesicsId =
      categoryMap["Analgesics & Antipyretics"] || categoryMap["Analgesics"];
    const cardiovascularId = categoryMap["Cardiovascular"];
    const gastrointestinalId = categoryMap["Gastrointestinal"];
    const tabletId = typeMap["Tablet"];
    const capsuleId = typeMap["Capsule"];

    const [medicineResult] = await connection.query(`
      INSERT INTO medicines (name, generic_name, category_id, type_id, strength, unit, reorder_level, unit_price, requires_prescription) VALUES
      ('Amoxicillin', 'Amoxicillin', ${antibioticsId}, ${capsuleId}, '500mg', 'capsule', 50, 15.50, 1),
      ('Paracetamol', 'Acetaminophen', ${analgesicsId}, ${tabletId}, '500mg', 'tablet', 100, 5.00, 0),
      ('Ibuprofen', 'Ibuprofen', ${analgesicsId}, ${tabletId}, '400mg', 'tablet', 80, 8.50, 0),
      ('Ciprofloxacin', 'Ciprofloxacin HCl', ${antibioticsId}, ${tabletId}, '500mg', 'tablet', 30, 25.00, 1),
      ('Omeprazole', 'Omeprazole', ${gastrointestinalId}, ${capsuleId}, '20mg', 'capsule', 40, 18.00, 1),
      ('Amlodipine', 'Amlodipine Besylate', ${cardiovascularId}, ${tabletId}, '5mg', 'tablet', 40, 20.00, 1)
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
    const clerkId = userMap["clerk"];
    const [patientResult] = await connection.query(`
      INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_group, allergies, registered_by) VALUES
      ('PAT001', 'Abebe', 'Kebede', '1985-03-15', 'Male', '+251911111111', 'abebe.kebede@email.com', 'Haramaya University Campus', 'Almaz Kebede', '+251922222222', 'O+', 'None known', ${clerkId}),
      ('PAT002', 'Tigist', 'Alemu', '1990-07-22', 'Female', '+251933333333', 'tigist.alemu@email.com', 'Harar City', 'Dawit Alemu', '+251944444444', 'A+', 'Penicillin allergy', ${clerkId}),
      ('PAT003', 'Mohammed', 'Hassan', '1978-12-10', 'Male', '+251955555555', 'mohammed.hassan@email.com', 'Dire Dawa', 'Fatima Hassan', '+251966666666', 'B+', 'None known', ${clerkId})
    `);

    // Get the actual patient IDs
    const [patients] = await connection.query(
      "SELECT id, patient_id, first_name, last_name FROM patients ORDER BY id",
    );
    console.log(
      "✅ Patients added:",
      patients.map((p) => `${p.patient_id} - ${p.first_name} ${p.last_name}`),
    );

    // 5. Add diagnoses
    console.log("\n🩺 5. Adding diagnoses...");
    const physicianId = userMap["doctor"] || userMap["physician"];
    const [diagnosisResult] = await connection.query(`
      INSERT INTO diagnoses (patient_id, physician_id, diagnosis_date, symptoms, vital_signs, diagnosis, notes) VALUES
      (${patients[0].id}, ${physicianId}, '2024-04-01', 'Fever, headache, body aches', '{"temperature": "38.5°C", "bp": "120/80", "pulse": "85"}', 'Upper Respiratory Tract Infection', 'Prescribed antibiotics and rest'),
      (${patients[1].id}, ${physicianId}, '2024-04-01', 'Severe headache, nausea', '{"temperature": "37.2°C", "bp": "140/90", "pulse": "92"}', 'Migraine with hypertension', 'Blood pressure monitoring required'),
      (${patients[2].id}, ${physicianId}, '2024-04-02', 'Stomach pain, indigestion', '{"temperature": "36.9°C", "bp": "110/70", "pulse": "78"}', 'Gastritis', 'Dietary modifications recommended')
    `);

    // Get diagnosis IDs
    const [diagnoses] = await connection.query(
      "SELECT id, patient_id, diagnosis FROM diagnoses ORDER BY id",
    );
    console.log(
      "✅ Diagnoses added:",
      diagnoses.map((d) => `Patient ${d.patient_id}: ${d.diagnosis}`),
    );

    // 6. Add prescriptions
    console.log("\n📋 6. Adding prescriptions...");
    const [prescriptionResult] = await connection.query(`
      INSERT INTO prescriptions (prescription_number, patient_id, patient_name, physician_id, diagnosis, prescription_date, status, notes) VALUES
      ('RX001', ${patients[0].id}, '${patients[0].first_name} ${patients[0].last_name}', ${physicianId}, 'Upper Respiratory Tract Infection', '2024-04-01', 'completed', 'Complete course of antibiotics'),
      ('RX002', ${patients[1].id}, '${patients[1].first_name} ${patients[1].last_name}', ${physicianId}, 'Migraine with hypertension', '2024-04-01', 'completed', 'Monitor blood pressure daily'),
      ('RX003', ${patients[2].id}, '${patients[2].first_name} ${patients[2].last_name}', ${physicianId}, 'Gastritis', '2024-04-02', 'pending', 'Take with food')
    `);

    // Get prescription IDs
    const [prescriptions] = await connection.query(
      "SELECT id, prescription_number, patient_id FROM prescriptions ORDER BY id",
    );
    console.log(
      "✅ Prescriptions added:",
      prescriptions.map(
        (p) => `${p.prescription_number} for Patient ${p.patient_id}`,
      ),
    );

    // 7. Add prescription items
    console.log("\n💊 7. Adding prescription items...");
    const [medicines] = await connection.query(
      "SELECT id, name FROM medicines ORDER BY id",
    );

    await connection.query(`
      INSERT INTO prescription_items (prescription_id, medicine_id, quantity, dosage, frequency, duration, instructions) VALUES
      (${prescriptions[0].id}, ${medicines[0].id}, 21, '500mg', 'Three times daily', '7 days', 'Take with food, complete full course'),
      (${prescriptions[0].id}, ${medicines[1].id}, 20, '500mg', 'Four times daily', '5 days', 'For fever and pain relief'),
      (${prescriptions[1].id}, ${medicines[2].id}, 20, '400mg', 'As needed', 'PRN', 'For headache, max 3 times daily'),
      (${prescriptions[1].id}, ${medicines[5].id}, 30, '5mg', 'Once daily', '30 days', 'For blood pressure'),
      (${prescriptions[2].id}, ${medicines[4].id}, 14, '20mg', 'Once daily', '14 days', 'Take before breakfast')
    `);
    console.log("✅ Prescription items added");

    // 8. Add invoices
    console.log("\n💰 8. Adding invoices...");
    const [invoiceResult] = await connection.query(`
      INSERT INTO invoices (invoice_number, patient_id, prescription_id, invoice_date, subtotal, discount, tax, total_amount, status, generated_by) VALUES
      ('INV001', ${patients[0].id}, ${prescriptions[0].id}, '2024-04-01', 425.50, 0.00, 21.28, 446.78, 'Paid', ${clerkId}),
      ('INV002', ${patients[1].id}, ${prescriptions[1].id}, '2024-04-01', 770.00, 0.00, 38.50, 808.50, 'Paid', ${clerkId}),
      ('INV003', ${patients[2].id}, ${prescriptions[2].id}, '2024-04-02', 252.00, 0.00, 12.60, 264.60, 'Pending', ${clerkId})
    `);

    // Get invoice IDs
    const [invoices] = await connection.query(
      "SELECT id, invoice_number, patient_id FROM invoices ORDER BY id",
    );
    console.log(
      "✅ Invoices added:",
      invoices.map((i) => `${i.invoice_number} for Patient ${i.patient_id}`),
    );

    // 9. Add invoice items
    console.log("\n📄 9. Adding invoice items...");
    await connection.query(`
      INSERT INTO invoice_items (invoice_id, medicine_id, quantity, unit_price) VALUES
      (${invoices[0].id}, ${medicines[0].id}, 21, 15.50),
      (${invoices[0].id}, ${medicines[1].id}, 20, 5.00),
      (${invoices[1].id}, ${medicines[2].id}, 20, 8.50),
      (${invoices[1].id}, ${medicines[5].id}, 30, 20.00),
      (${invoices[2].id}, ${medicines[4].id}, 14, 18.00)
    `);
    console.log("✅ Invoice items added");

    // 10. Add payments
    console.log("\n💳 10. Adding payments...");
    await connection.query(`
      INSERT INTO payments (payment_number, invoice_id, payment_date, payment_method, amount_paid, change_given, received_by, notes) VALUES
      ('PAY001', ${invoices[0].id}, '2024-04-01', 'Cash', 450.00, 3.22, ${clerkId}, 'Cash payment'),
      ('PAY002', ${invoices[1].id}, '2024-04-01', 'Card', 808.50, 0.00, ${clerkId}, 'Debit card payment')
    `);
    console.log("✅ Payments added");

    console.log("\n🎉 Final test data seeded successfully!\n");

    // Display comprehensive summary
    const [summary] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM patients) as patients,
        (SELECT COUNT(*) FROM medicines) as medicines,
        (SELECT COUNT(*) FROM suppliers) as suppliers,
        (SELECT COUNT(*) FROM prescriptions) as prescriptions,
        (SELECT COUNT(*) FROM invoices) as invoices,
        (SELECT COUNT(*) FROM payments) as payments,
        (SELECT COUNT(*) FROM prescription_items) as prescription_items,
        (SELECT COUNT(*) FROM invoice_items) as invoice_items
    `);

    console.log("📈 COMPLETE WORKFLOW DATA SUMMARY");
    console.log("=================================");
    console.log(`👥 Patients: ${summary[0].patients}`);
    console.log(`💊 Medicines: ${summary[0].medicines}`);
    console.log(`🏢 Suppliers: ${summary[0].suppliers}`);
    console.log(`📋 Prescriptions: ${summary[0].prescriptions}`);
    console.log(`💊 Prescription Items: ${summary[0].prescription_items}`);
    console.log(`💰 Invoices: ${summary[0].invoices}`);
    console.log(`📄 Invoice Items: ${summary[0].invoice_items}`);
    console.log(`💳 Payments: ${summary[0].payments}`);

    console.log("\n🔄 COMPLETE WORKFLOW READY");
    console.log("===========================");
    console.log("✅ 1. Patient Registration (Data Clerk)");
    console.log("✅ 2. Patient Diagnosis (Physician)");
    console.log("✅ 3. Prescription Creation (Physician)");
    console.log("✅ 4. Medicine Dispensing (Pharmacist)");
    console.log("✅ 5. Invoice Generation (Data Clerk)");
    console.log("✅ 6. Payment Processing (Data Clerk)");
    console.log("✅ 7. Stock Management (Pharmacist)");
    console.log("✅ 8. Supplier Management (Admin/Pharmacist)");

    console.log("\n🎯 TEST SCENARIOS");
    console.log("==================");
    console.log("• Complete patient care workflow");
    console.log("• Role-based access control");
    console.log("• Inventory management");
    console.log("• Financial transactions");
    console.log("• Report generation");
    console.log("• Multi-user collaboration");

    console.log("\n🔑 READY TO TEST");
    console.log("=================");
    console.log("1. Start API: npm start");
    console.log("2. Start Frontend: cd ../frontend && npm run dev");
    console.log("3. Login with test credentials:");
    console.log("   - Admin: admin/admin123 (Full system access)");
    console.log("   - Data Clerk: clerk/clerk123 (Patient & billing)");
    console.log("   - Physician: doctor/doctor123 (Diagnosis & prescriptions)");
    console.log("   - Pharmacist: pharmacist/pharma123 (Medicine & inventory)");
    console.log("   - Supplier: supplier/supply123 (Purchase orders)");

    await connection.end();
  } catch (error) {
    console.error("❌ Error seeding final test data:", error.message);
    console.error(error.stack);
    await connection.end();
    process.exit(1);
  }
}

seedFinalTestData();
