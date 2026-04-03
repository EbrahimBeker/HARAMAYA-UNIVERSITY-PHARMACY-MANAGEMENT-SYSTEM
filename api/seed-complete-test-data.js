#!/usr/bin/env node

require("dotenv").config();
const mysql = require("mysql2/promise");

async function seedCompleteTestData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "haramaya_pharmacy",
  });

  try {
    console.log("🌱 Seeding complete test data following workflow order...\n");

    // Check if test data already exists
    const [existingPatients] = await connection.query(
      "SELECT COUNT(*) as count FROM patients",
    );
    if (existingPatients[0].count > 0) {
      console.log("⚠️  Test data already exists. Clearing and reseeding...");

      // Clear existing test data (keep users and basic setup)
      await connection.query("SET FOREIGN_KEY_CHECKS = 0");
      await connection.query("DELETE FROM payments");
      await connection.query("DELETE FROM invoice_items");
      await connection.query("DELETE FROM invoices");
      await connection.query("DELETE FROM stock_out");
      await connection.query("DELETE FROM stock_in");
      await connection.query("DELETE FROM purchase_order_items");
      await connection.query("DELETE FROM purchase_orders");
      await connection.query("DELETE FROM prescription_items");
      await connection.query("DELETE FROM prescriptions");
      await connection.query("DELETE FROM diagnoses");
      await connection.query("DELETE FROM patients");
      await connection.query("DELETE FROM stock_inventory");
      await connection.query("DELETE FROM medicines");
      await connection.query("DELETE FROM suppliers");
      await connection.query("DELETE FROM medicine_categories");
      await connection.query("DELETE FROM medicine_types");
      await connection.query("SET FOREIGN_KEY_CHECKS = 1");
      console.log("✅ Existing test data cleared");
    }

    // 1. FOUNDATION DATA - Categories and Types
    console.log("📋 1. Setting up foundation data...");

    await connection.query(`
      INSERT INTO medicine_categories (name) VALUES
      ('Antibiotics'),
      ('Analgesics & Antipyretics'),
      ('Cardiovascular'),
      ('Gastrointestinal'),
      ('Respiratory'),
      ('Antihistamines'),
      ('Vitamins & Supplements'),
      ('Diabetes Management'),
      ('Antihypertensives'),
      ('Antimalarials')
    `);

    await connection.query(`
      INSERT INTO medicine_types (name) VALUES
      ('Tablet'),
      ('Capsule'),
      ('Syrup'),
      ('Injection'),
      ('Cream/Ointment'),
      ('Drops'),
      ('Inhaler'),
      ('Suppository')
    `);
    console.log("✅ Medicine categories and types added");

    // 2. SUPPLIER DATA
    console.log("🏢 2. Adding suppliers...");
    await connection.query(`
      INSERT INTO suppliers (name, contact_person, email, phone, address, is_active) VALUES
      ('Ethiopian Pharmaceuticals Manufacturing', 'Dr. Alemayehu Tadesse', 'contact@epharm.et', '+251911234567', 'Addis Ababa, Kirkos Sub City', 1),
      ('Cadila Pharmaceuticals Ethiopia', 'Ms. Hanan Mohammed', 'ethiopia@cadila.com', '+251922345678', 'Addis Ababa, Bole Sub City', 1),
      ('FMHACA Approved Distributors', 'Mr. Dawit Bekele', 'info@fmhaca-dist.et', '+251933456789', 'Dire Dawa, Ethiopia', 1),
      ('International Medical Supplies', 'Dr. Sarah Johnson', 'orders@imsupplies.com', '+251944567890', 'Harar, Ethiopia', 1),
      ('Local Pharmacy Distributors', 'Ato Girma Wolde', 'sales@localpharma.et', '+251955678901', 'Haramaya, Oromia', 1)
    `);
    console.log("✅ Suppliers added");
    // 3. MEDICINE DATA
    console.log("💊 3. Adding medicines...");

    // Get current category and type IDs
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

    await connection.query(`
      INSERT INTO medicines (name, generic_name, category_id, type_id, strength, unit, reorder_level, unit_price, requires_prescription) VALUES
      -- Antibiotics
      ('Amoxicillin', 'Amoxicillin', ${categoryMap["Antibiotics"]}, ${typeMap["Capsule"]}, '500mg', 'capsule', 50, 15.50, 1),
      ('Ciprofloxacin', 'Ciprofloxacin HCl', ${categoryMap["Antibiotics"]}, ${typeMap["Tablet"]}, '500mg', 'tablet', 30, 25.00, 1),
      ('Azithromycin', 'Azithromycin', ${categoryMap["Antibiotics"]}, ${typeMap["Tablet"]}, '250mg', 'tablet', 40, 35.00, 1),
      ('Cephalexin', 'Cephalexin', ${categoryMap["Antibiotics"]}, ${typeMap["Capsule"]}, '250mg', 'capsule', 35, 20.00, 1),
      
      -- Analgesics & Antipyretics
      ('Paracetamol', 'Acetaminophen', ${categoryMap["Analgesics & Antipyretics"]}, ${typeMap["Tablet"]}, '500mg', 'tablet', 100, 5.00, 0),
      ('Ibuprofen', 'Ibuprofen', ${categoryMap["Analgesics & Antipyretics"]}, ${typeMap["Tablet"]}, '400mg', 'tablet', 80, 8.50, 0),
      ('Aspirin', 'Acetylsalicylic Acid', ${categoryMap["Analgesics & Antipyretics"]}, ${typeMap["Tablet"]}, '300mg', 'tablet', 60, 6.00, 0),
      ('Diclofenac', 'Diclofenac Sodium', ${categoryMap["Analgesics & Antipyretics"]}, ${typeMap["Tablet"]}, '50mg', 'tablet', 45, 12.00, 1),
      
      -- Cardiovascular
      ('Amlodipine', 'Amlodipine Besylate', ${categoryMap["Cardiovascular"]}, ${typeMap["Tablet"]}, '5mg', 'tablet', 40, 18.00, 1),
      ('Atenolol', 'Atenolol', ${categoryMap["Cardiovascular"]}, ${typeMap["Tablet"]}, '50mg', 'tablet', 35, 15.00, 1),
      ('Lisinopril', 'Lisinopril', ${categoryMap["Cardiovascular"]}, ${typeMap["Tablet"]}, '10mg', 'tablet', 30, 22.00, 1),
      
      -- Gastrointestinal
      ('Omeprazole', 'Omeprazole', ${categoryMap["Gastrointestinal"]}, ${typeMap["Capsule"]}, '20mg', 'capsule', 40, 18.00, 1),
      ('Ranitidine', 'Ranitidine HCl', ${categoryMap["Gastrointestinal"]}, ${typeMap["Tablet"]}, '150mg', 'tablet', 50, 10.00, 0),
      ('Loperamide', 'Loperamide HCl', ${categoryMap["Gastrointestinal"]}, ${typeMap["Capsule"]}, '2mg', 'capsule', 25, 14.00, 0),
      
      -- Respiratory
      ('Salbutamol Inhaler', 'Salbutamol', ${categoryMap["Respiratory"]}, ${typeMap["Inhaler"]}, '100mcg', 'dose', 20, 45.00, 1),
      ('Prednisolone', 'Prednisolone', ${categoryMap["Respiratory"]}, ${typeMap["Tablet"]}, '5mg', 'tablet', 30, 16.00, 1),
      
      -- Antihistamines
      ('Cetirizine', 'Cetirizine HCl', ${categoryMap["Antihistamines"]}, ${typeMap["Tablet"]}, '10mg', 'tablet', 60, 12.00, 0),
      ('Loratadine', 'Loratadine', ${categoryMap["Antihistamines"]}, ${typeMap["Tablet"]}, '10mg', 'tablet', 50, 15.00, 0),
      
      -- Vitamins & Supplements
      ('Vitamin C', 'Ascorbic Acid', ${categoryMap["Vitamins & Supplements"]}, ${typeMap["Tablet"]}, '1000mg', 'tablet', 100, 10.00, 0),
      ('Multivitamin', 'Multivitamin Complex', ${categoryMap["Vitamins & Supplements"]}, ${typeMap["Tablet"]}, '', 'tablet', 80, 25.00, 0),
      ('Iron Tablets', 'Ferrous Sulfate', ${categoryMap["Vitamins & Supplements"]}, ${typeMap["Tablet"]}, '200mg', 'tablet', 70, 8.00, 0),
      
      -- Diabetes Management
      ('Metformin', 'Metformin HCl', ${categoryMap["Diabetes Management"]}, ${typeMap["Tablet"]}, '500mg', 'tablet', 50, 20.00, 1),
      ('Glibenclamide', 'Glibenclamide', ${categoryMap["Diabetes Management"]}, ${typeMap["Tablet"]}, '5mg', 'tablet', 40, 18.00, 1),
      
      -- Antimalarials
      ('Artemether-Lumefantrine', 'Artemether/Lumefantrine', ${categoryMap["Antimalarials"]}, ${typeMap["Tablet"]}, '20/120mg', 'tablet', 60, 30.00, 1),
      ('Chloroquine', 'Chloroquine Phosphate', ${categoryMap["Antimalarials"]}, ${typeMap["Tablet"]}, '250mg', 'tablet', 40, 12.00, 1)
    `);
    console.log("✅ Medicines added");

    // 4. INITIALIZE STOCK INVENTORY
    console.log("📦 4. Initializing stock inventory...");
    await connection.query(`
      INSERT INTO stock_inventory (medicine_id, quantity_available)
      SELECT id, 
        CASE 
          WHEN reorder_level >= 50 THEN FLOOR(RAND() * 200) + 100
          WHEN reorder_level >= 30 THEN FLOOR(RAND() * 150) + 80
          ELSE FLOOR(RAND() * 100) + 50
        END
      FROM medicines
    `);
    console.log("✅ Stock inventory initialized");

    // 5. PATIENT DATA
    console.log("👥 5. Adding patients...");
    await connection.query(`
      INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_group, allergies, registered_by) VALUES
      ('PAT001', 'Abebe', 'Kebede', '1985-03-15', 'Male', '+251911111111', 'abebe.kebede@email.com', 'Haramaya University Campus, Block A', 'Almaz Kebede', '+251922222222', 'O+', 'None known', 2),
      ('PAT002', 'Tigist', 'Alemu', '1990-07-22', 'Female', '+251933333333', 'tigist.alemu@email.com', 'Harar City, Ras Tafari Area', 'Dawit Alemu', '+251944444444', 'A+', 'Penicillin allergy', 2),
      ('PAT003', 'Mohammed', 'Hassan', '1978-12-10', 'Male', '+251955555555', 'mohammed.hassan@email.com', 'Dire Dawa, Sabian Area', 'Fatima Hassan', '+251966666666', 'B+', 'None known', 2),
      ('PAT004', 'Hanan', 'Ahmed', '1995-05-18', 'Female', '+251977777777', 'hanan.ahmed@email.com', 'Haramaya Town Center', 'Omar Ahmed', '+251988888888', 'AB+', 'Aspirin sensitivity', 2),
      ('PAT005', 'Girma', 'Wolde', '1982-09-30', 'Male', '+251999999999', 'girma.wolde@email.com', 'Kombolcha Campus', 'Meron Wolde', '+251900000000', 'O-', 'Sulfa drugs', 2),
      ('PAT006', 'Selamawit', 'Tesfaye', '1988-01-25', 'Female', '+251911122233', 'selam.tesfaye@email.com', 'Haramaya University Staff Quarters', 'Bekele Tesfaye', '+251922233344', 'A-', 'None known', 2),
      ('PAT007', 'Yohannes', 'Berhe', '1975-11-08', 'Male', '+251933344455', 'yohannes.berhe@email.com', 'Harar Old City', 'Helen Berhe', '+251944455566', 'B-', 'Iodine allergy', 2),
      ('PAT008', 'Rahel', 'Getachew', '1992-04-12', 'Female', '+251955566677', 'rahel.getachew@email.com', 'Alemaya Campus', 'Tadesse Getachew', '+251966677788', 'AB-', 'None known', 2),
      ('PAT009', 'Dawit', 'Mekonen', '1980-08-20', 'Male', '+251977788899', 'dawit.mekonen@email.com', 'Haramaya Hospital Area', 'Birtukan Mekonen', '+251988899900', 'O+', 'Latex allergy', 2),
      ('PAT010', 'Marta', 'Sisay', '1987-06-14', 'Female', '+251999900011', 'marta.sisay@email.com', 'Chiro Town', 'Alemayehu Sisay', '+251900011122', 'A+', 'None known', 2)
    `);
    console.log("✅ Patients added");
    // 6. DIAGNOSES DATA
    console.log("🩺 6. Adding patient diagnoses...");
    await connection.query(`
      INSERT INTO diagnoses (patient_id, physician_id, diagnosis_date, symptoms, vital_signs, diagnosis, notes) VALUES
      (1, 4, '2024-04-01', 'Fever, headache, body aches', '{"temperature": "38.5°C", "bp": "120/80", "pulse": "85", "weight": "70kg"}', 'Upper Respiratory Tract Infection', 'Prescribed antibiotics and rest'),
      (2, 4, '2024-04-01', 'Severe headache, nausea', '{"temperature": "37.2°C", "bp": "140/90", "pulse": "92", "weight": "65kg"}', 'Migraine with hypertension', 'Blood pressure monitoring required'),
      (3, 4, '2024-04-02', 'Chest pain, shortness of breath', '{"temperature": "36.8°C", "bp": "150/95", "pulse": "98", "weight": "80kg"}', 'Hypertension with chest discomfort', 'Cardiovascular evaluation needed'),
      (4, 4, '2024-04-02', 'Stomach pain, indigestion', '{"temperature": "36.9°C", "bp": "110/70", "pulse": "78", "weight": "58kg"}', 'Gastritis', 'Dietary modifications recommended'),
      (5, 4, '2024-04-03', 'Persistent cough, wheezing', '{"temperature": "37.1°C", "bp": "125/82", "pulse": "88", "weight": "75kg"}', 'Asthma exacerbation', 'Inhaler therapy initiated'),
      (6, 4, '2024-04-03', 'Joint pain, morning stiffness', '{"temperature": "36.7°C", "bp": "118/78", "pulse": "82", "weight": "62kg"}', 'Rheumatoid arthritis flare', 'Anti-inflammatory treatment'),
      (7, 4, '2024-04-04', 'Frequent urination, excessive thirst', '{"temperature": "36.6°C", "bp": "135/85", "pulse": "90", "weight": "85kg"}', 'Type 2 Diabetes Mellitus', 'Blood sugar management plan'),
      (8, 4, '2024-04-04', 'Skin rash, itching', '{"temperature": "36.8°C", "bp": "115/75", "pulse": "80", "weight": "55kg"}', 'Allergic dermatitis', 'Antihistamine therapy'),
      (9, 4, '2024-04-05', 'Fever, chills, body weakness', '{"temperature": "39.2°C", "bp": "110/70", "pulse": "95", "weight": "78kg"}', 'Malaria (P. falciparum)', 'Antimalarial treatment started'),
      (10, 4, '2024-04-05', 'Fatigue, pale skin, weakness', '{"temperature": "36.5°C", "bp": "105/65", "pulse": "95", "weight": "60kg"}', 'Iron deficiency anemia', 'Iron supplementation needed')
    `);
    console.log("✅ Diagnoses added");

    // 7. PRESCRIPTIONS DATA
    console.log("📋 7. Adding prescriptions...");
    await connection.query(`
      INSERT INTO prescriptions (prescription_number, patient_id, diagnosis_id, physician_id, prescription_date, status, notes) VALUES
      ('RX001', 1, 1, 4, '2024-04-01', 'Dispensed', 'Complete course of antibiotics'),
      ('RX002', 2, 2, 4, '2024-04-01', 'Dispensed', 'Monitor blood pressure daily'),
      ('RX003', 3, 3, 4, '2024-04-02', 'Dispensed', 'Follow up in 2 weeks'),
      ('RX004', 4, 4, 4, '2024-04-02', 'Dispensed', 'Take with food'),
      ('RX005', 5, 5, 4, '2024-04-03', 'Dispensed', 'Use inhaler as needed'),
      ('RX006', 6, 6, 4, '2024-04-03', 'Dispensed', 'Take with meals'),
      ('RX007', 7, 7, 4, '2024-04-04', 'Dispensed', 'Check blood sugar regularly'),
      ('RX008', 8, 8, 4, '2024-04-04', 'Dispensed', 'Avoid known allergens'),
      ('RX009', 9, 9, 4, '2024-04-05', 'Pending', 'Complete full course'),
      ('RX010', 10, 10, 4, '2024-04-05', 'Pending', 'Take with vitamin C')
    `);
    console.log("✅ Prescriptions added");

    // 8. PRESCRIPTION ITEMS DATA
    console.log("💊 8. Adding prescription items...");
    await connection.query(`
      INSERT INTO prescription_items (prescription_id, medicine_id, quantity, dosage, frequency, duration, instructions) VALUES
      -- RX001 - Upper Respiratory Tract Infection
      (1, 1, 21, '500mg', 'Three times daily', '7 days', 'Take with food, complete full course'),
      (1, 5, 20, '500mg', 'Four times daily', '5 days', 'For fever and pain relief'),
      
      -- RX002 - Migraine with hypertension
      (2, 9, 30, '5mg', 'Once daily', '30 days', 'Take in the morning'),
      (2, 6, 20, '400mg', 'As needed', 'PRN', 'For headache, max 3 times daily'),
      
      -- RX003 - Hypertension with chest discomfort
      (3, 10, 30, '50mg', 'Once daily', '30 days', 'Take with breakfast'),
      (3, 11, 30, '10mg', 'Once daily', '30 days', 'Monitor blood pressure'),
      
      -- RX004 - Gastritis
      (4, 12, 14, '20mg', 'Once daily', '14 days', 'Take before breakfast'),
      (4, 13, 30, '150mg', 'Twice daily', '15 days', 'Take with meals'),
      
      -- RX005 - Asthma exacerbation
      (5, 15, 1, '100mcg', 'As needed', '30 days', 'Use when breathing difficulty occurs'),
      (5, 16, 10, '5mg', 'Once daily', '10 days', 'Take in the morning'),
      
      -- RX006 - Rheumatoid arthritis flare
      (6, 8, 21, '50mg', 'Twice daily', '21 days', 'Take with food to avoid stomach upset'),
      (6, 5, 30, '500mg', 'Three times daily', '10 days', 'For pain relief'),
      
      -- RX007 - Type 2 Diabetes Mellitus
      (7, 22, 60, '500mg', 'Twice daily', '30 days', 'Take with meals'),
      (7, 23, 30, '5mg', 'Once daily', '30 days', 'Take before breakfast'),
      
      -- RX008 - Allergic dermatitis
      (8, 17, 14, '10mg', 'Once daily', '14 days', 'Take at bedtime'),
      (8, 18, 14, '10mg', 'Once daily', '14 days', 'Alternative if drowsiness occurs'),
      
      -- RX009 - Malaria (P. falciparum)
      (9, 24, 24, '20/120mg', 'Four tablets twice daily', '3 days', 'Take with food, complete full course'),
      (9, 5, 12, '500mg', 'Four times daily', '3 days', 'For fever management'),
      
      -- RX010 - Iron deficiency anemia
      (10, 21, 60, '200mg', 'Once daily', '60 days', 'Take on empty stomach if tolerated'),
      (10, 19, 60, '1000mg', 'Once daily', '60 days', 'Enhances iron absorption')
    `);
    console.log("✅ Prescription items added");
    // 9. PURCHASE ORDERS DATA
    console.log("📦 9. Adding purchase orders...");
    await connection.query(`
      INSERT INTO purchase_orders (order_number, supplier_id, order_date, status, total_amount, expected_delivery_date, created_by, notes) VALUES
      ('PO001', 1, '2024-03-25', 'Delivered', 15750.00, '2024-04-01', 5, 'Regular monthly stock replenishment'),
      ('PO002', 2, '2024-03-28', 'Delivered', 8920.00, '2024-04-03', 5, 'Emergency antibiotics order'),
      ('PO003', 3, '2024-04-01', 'Confirmed', 12450.00, '2024-04-08', 5, 'Cardiovascular medicines'),
      ('PO004', 4, '2024-04-03', 'Pending', 6780.00, '2024-04-10', 5, 'Vitamins and supplements'),
      ('PO005', 5, '2024-04-05', 'Pending', 9340.00, '2024-04-12', 5, 'Diabetes management drugs')
    `);
    console.log("✅ Purchase orders added");

    // 10. PURCHASE ORDER ITEMS DATA
    console.log("📋 10. Adding purchase order items...");
    await connection.query(`
      INSERT INTO purchase_order_items (purchase_order_id, medicine_id, quantity_ordered, unit_cost) VALUES
      -- PO001 - Regular monthly stock replenishment
      (1, 1, 100, 14.00), (1, 2, 50, 22.50), (1, 5, 200, 4.50), (1, 6, 150, 7.50),
      (1, 17, 100, 10.80), (1, 19, 150, 9.00), (1, 20, 100, 22.50),
      
      -- PO002 - Emergency antibiotics order
      (2, 1, 80, 14.00), (2, 2, 60, 22.50), (2, 3, 40, 31.50), (2, 4, 50, 18.00),
      
      -- PO003 - Cardiovascular medicines
      (3, 9, 60, 16.20), (3, 10, 50, 13.50), (3, 11, 40, 19.80),
      
      -- PO004 - Vitamins and supplements
      (4, 19, 120, 9.00), (4, 20, 80, 22.50), (4, 21, 100, 7.20),
      
      -- PO005 - Diabetes management drugs
      (5, 22, 80, 18.00), (5, 23, 60, 16.20)
    `);
    console.log("✅ Purchase order items added");

    // 11. STOCK IN DATA (Receiving)
    console.log("📥 11. Adding stock receiving records...");
    await connection.query(`
      INSERT INTO stock_in (medicine_id, supplier_id, purchase_order_id, batch_number, quantity, unit_cost, manufacture_date, expiry_date, received_by, received_date, notes) VALUES
      -- From PO001
      (1, 1, 1, 'AMX240401', 100, 14.00, '2024-02-15', '2026-02-15', 5, '2024-04-01', 'Good condition'),
      (2, 1, 1, 'CIP240401', 50, 22.50, '2024-01-20', '2026-01-20', 5, '2024-04-01', 'Good condition'),
      (5, 1, 1, 'PAR240401', 200, 4.50, '2024-03-10', '2026-03-10', 5, '2024-04-01', 'Good condition'),
      (6, 1, 1, 'IBU240401', 150, 7.50, '2024-02-25', '2026-02-25', 5, '2024-04-01', 'Good condition'),
      
      -- From PO002
      (1, 2, 2, 'AMX240403', 80, 14.00, '2024-02-20', '2026-02-20', 5, '2024-04-03', 'Emergency delivery'),
      (2, 2, 2, 'CIP240403', 60, 22.50, '2024-01-25', '2026-01-25', 5, '2024-04-03', 'Emergency delivery'),
      (3, 2, 2, 'AZI240403', 40, 31.50, '2024-02-01', '2026-02-01', 5, '2024-04-03', 'Emergency delivery'),
      
      -- Additional stock for other medicines
      (17, 3, NULL, 'CET240315', 80, 10.80, '2024-03-01', '2026-03-01', 5, '2024-03-15', 'Regular stock'),
      (19, 4, NULL, 'VTC240320', 100, 9.00, '2024-03-05', '2026-03-05', 5, '2024-03-20', 'Regular stock'),
      (22, 5, NULL, 'MET240325', 60, 18.00, '2024-03-10', '2026-03-10', 5, '2024-03-25', 'Regular stock')
    `);
    console.log("✅ Stock receiving records added");

    // 12. INVOICES DATA
    console.log("💰 12. Adding invoices...");
    await connection.query(`
      INSERT INTO invoices (invoice_number, patient_id, prescription_id, invoice_date, subtotal, discount, tax, total_amount, status, generated_by) VALUES
      ('INV001', 1, 1, '2024-04-01', 425.00, 0.00, 21.25, 446.25, 'Paid', 2),
      ('INV002', 2, 2, '2024-04-01', 710.00, 35.50, 33.73, 708.23, 'Paid', 2),
      ('INV003', 3, 3, '2024-04-02', 1200.00, 0.00, 60.00, 1260.00, 'Paid', 2),
      ('INV004', 4, 4, '2024-04-02', 632.00, 31.60, 30.02, 630.42, 'Paid', 2),
      ('INV005', 5, 5, '2024-04-03', 205.00, 0.00, 10.25, 215.25, 'Paid', 2),
      ('INV006', 6, 6, '2024-04-03', 1200.00, 0.00, 60.00, 1260.00, 'Paid', 2),
      ('INV007', 7, 7, '2024-04-04', 1740.00, 0.00, 87.00, 1827.00, 'Paid', 2),
      ('INV008', 8, 8, '2024-04-04', 378.00, 0.00, 18.90, 396.90, 'Paid', 2),
      ('INV009', 9, 9, '2024-04-05', 780.00, 0.00, 39.00, 819.00, 'Pending', 2),
      ('INV010', 10, 10, '2024-04-05', 1680.00, 0.00, 84.00, 1764.00, 'Pending', 2)
    `);
    console.log("✅ Invoices added");

    // 13. INVOICE ITEMS DATA
    console.log("📄 13. Adding invoice items...");
    await connection.query(`
      INSERT INTO invoice_items (invoice_id, medicine_id, quantity, unit_price) VALUES
      -- INV001 - Upper Respiratory Tract Infection
      (1, 1, 21, 15.50), (1, 5, 20, 5.00),
      
      -- INV002 - Migraine with hypertension
      (2, 9, 30, 18.00), (2, 6, 20, 8.50),
      
      -- INV003 - Hypertension with chest discomfort
      (3, 10, 30, 15.00), (3, 11, 30, 22.00),
      
      -- INV004 - Gastritis
      (4, 12, 14, 18.00), (4, 13, 30, 10.00),
      
      -- INV005 - Asthma exacerbation
      (5, 15, 1, 45.00), (5, 16, 10, 16.00),
      
      -- INV006 - Rheumatoid arthritis flare
      (6, 8, 21, 12.00), (6, 5, 30, 5.00),
      
      -- INV007 - Type 2 Diabetes Mellitus
      (7, 22, 60, 20.00), (7, 23, 30, 18.00),
      
      -- INV008 - Allergic dermatitis
      (8, 17, 14, 12.00), (8, 18, 14, 15.00),
      
      -- INV009 - Malaria (P. falciparum)
      (9, 24, 24, 30.00), (9, 5, 12, 5.00),
      
      -- INV010 - Iron deficiency anemia
      (10, 21, 60, 8.00), (10, 19, 60, 10.00)
    `);
    console.log("✅ Invoice items added");
    // 14. PAYMENTS DATA
    console.log("💳 14. Adding payments...");
    await connection.query(`
      INSERT INTO payments (payment_number, invoice_id, payment_date, payment_method, amount_paid, change_given, received_by, notes) VALUES
      ('PAY001', 1, '2024-04-01', 'Cash', 450.00, 3.75, 2, 'Cash payment'),
      ('PAY002', 2, '2024-04-01', 'Card', 708.23, 0.00, 2, 'Debit card payment'),
      ('PAY003', 3, '2024-04-02', 'Insurance', 1260.00, 0.00, 2, 'Insurance coverage - Policy #12345'),
      ('PAY004', 4, '2024-04-02', 'Cash', 650.00, 19.58, 2, 'Cash payment'),
      ('PAY005', 5, '2024-04-03', 'Mobile Money', 215.25, 0.00, 2, 'M-Pesa payment'),
      ('PAY006', 6, '2024-04-03', 'Card', 1260.00, 0.00, 2, 'Credit card payment'),
      ('PAY007', 7, '2024-04-04', 'Insurance', 1827.00, 0.00, 2, 'Insurance coverage - Policy #67890'),
      ('PAY008', 8, '2024-04-04', 'Cash', 400.00, 3.10, 2, 'Cash payment')
    `);
    console.log("✅ Payments added");

    // 15. STOCK OUT DATA (Dispensing)
    console.log("📤 15. Adding stock dispensing records...");
    await connection.query(`
      INSERT INTO stock_out (medicine_id, batch_number, quantity, reason, reference_id, processed_by, processed_date, notes) VALUES
      -- Dispensed medicines from prescriptions
      (1, 'AMX240401', 21, 'Dispensed', 1, 5, '2024-04-01', 'Prescription RX001'),
      (5, 'PAR240401', 20, 'Dispensed', 1, 5, '2024-04-01', 'Prescription RX001'),
      (9, 'AML240315', 30, 'Dispensed', 2, 5, '2024-04-01', 'Prescription RX002'),
      (6, 'IBU240401', 20, 'Dispensed', 2, 5, '2024-04-01', 'Prescription RX002'),
      (10, 'ATE240320', 30, 'Dispensed', 3, 5, '2024-04-02', 'Prescription RX003'),
      (11, 'LIS240325', 30, 'Dispensed', 3, 5, '2024-04-02', 'Prescription RX003'),
      (12, 'OME240330', 14, 'Dispensed', 4, 5, '2024-04-02', 'Prescription RX004'),
      (13, 'RAN240401', 30, 'Dispensed', 4, 5, '2024-04-02', 'Prescription RX004'),
      (15, 'SAL240315', 1, 'Dispensed', 5, 5, '2024-04-03', 'Prescription RX005'),
      (16, 'PRE240320', 10, 'Dispensed', 5, 5, '2024-04-03', 'Prescription RX005'),
      (8, 'DIC240325', 21, 'Dispensed', 6, 5, '2024-04-03', 'Prescription RX006'),
      (5, 'PAR240401', 30, 'Dispensed', 6, 5, '2024-04-03', 'Prescription RX006'),
      (22, 'MET240325', 60, 'Dispensed', 7, 5, '2024-04-04', 'Prescription RX007'),
      (23, 'GLI240330', 30, 'Dispensed', 7, 5, '2024-04-04', 'Prescription RX007'),
      (17, 'CET240315', 14, 'Dispensed', 8, 5, '2024-04-04', 'Prescription RX008'),
      (18, 'LOR240320', 14, 'Dispensed', 8, 5, '2024-04-04', 'Prescription RX008'),
      
      -- Some expired/damaged stock
      (7, 'ASP240101', 15, 'Expired', NULL, 5, '2024-04-01', 'Expired batch removed'),
      (14, 'LOP240201', 8, 'Damaged', NULL, 5, '2024-04-02', 'Damaged packaging')
    `);
    console.log("✅ Stock dispensing records added");

    // 16. UPDATE STOCK INVENTORY (Reflect dispensed quantities)
    console.log("🔄 16. Updating stock inventory...");
    await connection.query(`
      UPDATE stock_inventory si
      JOIN (
        SELECT medicine_id, SUM(quantity) as total_out
        FROM stock_out
        GROUP BY medicine_id
      ) so ON si.medicine_id = so.medicine_id
      SET si.quantity_available = si.quantity_available - so.total_out
    `);
    console.log("✅ Stock inventory updated");

    // 17. EXPIRY TRACKING DATA
    console.log("⏰ 17. Adding expiry tracking...");
    await connection.query(`
      INSERT INTO expiry_tracking (medicine_id, batch_number, quantity_remaining, expiry_date, alert_status) VALUES
      (1, 'AMX240401', 79, '2026-02-15', 'Safe'),
      (2, 'CIP240401', 50, '2026-01-20', 'Safe'),
      (3, 'AZI240403', 40, '2026-02-01', 'Safe'),
      (5, 'PAR240401', 150, '2026-03-10', 'Safe'),
      (6, 'IBU240401', 130, '2026-02-25', 'Safe'),
      (7, 'ASP240315', 45, '2024-06-15', 'Warning'),
      (8, 'DIC240325', 24, '2025-12-25', 'Safe'),
      (9, 'AML240315', 40, '2025-11-15', 'Safe'),
      (10, 'ATE240320', 20, '2025-10-20', 'Safe'),
      (11, 'LIS240325', 10, '2025-09-25', 'Safe'),
      (12, 'OME240330', 26, '2025-08-30', 'Safe'),
      (13, 'RAN240401', 20, '2025-12-01', 'Safe'),
      (14, 'LOP240201', 17, '2024-05-01', 'Critical'),
      (15, 'SAL240315', 19, '2025-07-15', 'Safe'),
      (16, 'PRE240320', 20, '2025-06-20', 'Safe'),
      (17, 'CET240315', 66, '2026-03-01', 'Safe'),
      (18, 'LOR240320', 36, '2025-12-20', 'Safe'),
      (19, 'VTC240320', 40, '2026-03-05', 'Safe'),
      (20, 'MUL240325', 80, '2025-11-25', 'Safe'),
      (21, 'IRO240330', 60, '2025-10-30', 'Safe'),
      (22, 'MET240325', 20, '2026-03-10', 'Safe'),
      (23, 'GLI240330', 30, '2025-09-30', 'Safe'),
      (24, 'ART240401', 60, '2025-08-01', 'Safe'),
      (25, 'CHL240405', 40, '2025-07-05', 'Safe')
    `);
    console.log("✅ Expiry tracking added");

    // 18. REPORTS DATA
    console.log("📊 18. Adding report generation logs...");
    await connection.query(`
      INSERT INTO reports (report_type, report_name, parameters, generated_by) VALUES
      ('inventory', 'Monthly Inventory Report - March 2024', '{"month": "2024-03", "include_expired": true}', 1),
      ('sales', 'Daily Sales Report - April 1, 2024', '{"date": "2024-04-01", "payment_methods": ["Cash", "Card"]}', 2),
      ('prescription', 'Physician Prescription Summary - Dr. Smith', '{"physician_id": 4, "date_range": "2024-04-01 to 2024-04-05"}', 4),
      ('stock', 'Low Stock Alert Report', '{"threshold": "reorder_level", "critical_only": false}', 5),
      ('expiry', 'Expiring Medicines Report - Next 6 Months', '{"months_ahead": 6, "alert_levels": ["Warning", "Critical"]}', 5)
    `);
    console.log("✅ Report logs added");

    console.log("\n🎉 Complete test data seeded successfully!\n");

    // Display summary
    const [summary] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM patients) as patients,
        (SELECT COUNT(*) FROM medicines) as medicines,
        (SELECT COUNT(*) FROM suppliers) as suppliers,
        (SELECT COUNT(*) FROM prescriptions) as prescriptions,
        (SELECT COUNT(*) FROM invoices) as invoices,
        (SELECT COUNT(*) FROM payments) as payments,
        (SELECT COUNT(*) FROM purchase_orders) as purchase_orders,
        (SELECT COUNT(*) FROM stock_in) as stock_received,
        (SELECT COUNT(*) FROM stock_out) as stock_dispensed
    `);

    console.log("📈 DATA SUMMARY");
    console.log("===============");
    console.log(`👥 Patients: ${summary[0].patients}`);
    console.log(`💊 Medicines: ${summary[0].medicines}`);
    console.log(`🏢 Suppliers: ${summary[0].suppliers}`);
    console.log(`📋 Prescriptions: ${summary[0].prescriptions}`);
    console.log(`💰 Invoices: ${summary[0].invoices}`);
    console.log(`💳 Payments: ${summary[0].payments}`);
    console.log(`📦 Purchase Orders: ${summary[0].purchase_orders}`);
    console.log(`📥 Stock Received: ${summary[0].stock_received}`);
    console.log(`📤 Stock Dispensed: ${summary[0].stock_dispensed}`);

    console.log("\n🔄 WORKFLOW DEMONSTRATION");
    console.log("=========================");
    console.log("1. ✅ Suppliers added");
    console.log("2. ✅ Medicines catalogued");
    console.log("3. ✅ Stock inventory initialized");
    console.log("4. ✅ Patients registered");
    console.log("5. ✅ Diagnoses recorded");
    console.log("6. ✅ Prescriptions created");
    console.log("7. ✅ Purchase orders placed");
    console.log("8. ✅ Stock received and recorded");
    console.log("9. ✅ Medicines dispensed");
    console.log("10. ✅ Invoices generated");
    console.log("11. ✅ Payments processed");
    console.log("12. ✅ Stock levels updated");
    console.log("13. ✅ Expiry tracking active");

    console.log("\n🎯 TEST SCENARIOS READY");
    console.log("=======================");
    console.log("• Patient registration and diagnosis workflow");
    console.log("• Prescription creation and dispensing");
    console.log("• Inventory management and stock tracking");
    console.log("• Purchase order and supplier management");
    console.log("• Billing and payment processing");
    console.log("• Stock expiry monitoring");
    console.log("• Role-based access control testing");
    console.log("• Report generation and analytics");

    await connection.end();
  } catch (error) {
    console.error("❌ Error seeding test data:", error.message);
    await connection.end();
    process.exit(1);
  }
}

seedCompleteTestData();
