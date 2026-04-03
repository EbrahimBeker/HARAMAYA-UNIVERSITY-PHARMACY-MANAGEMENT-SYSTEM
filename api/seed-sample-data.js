require('dotenv').config();
const mysql = require('mysql2/promise');

async function seedData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('🌱 Seeding sample data...\n');

    // Check if data already exists
    const [existingCategories] = await connection.query('SELECT COUNT(*) as count FROM medicine_categories');
    if (existingCategories[0].count > 0) {
      console.log('⚠️  Sample data already exists. Skipping...');
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
      ('Vitamins & Supplements')
    `);
    console.log('✅ Medicine categories added');

    // Insert Medicine Types
    await connection.query(`
      INSERT INTO medicine_types (name) VALUES
      ('Tablet'),
      ('Capsule'),
      ('Syrup'),
      ('Injection'),
      ('Cream'),
      ('Drops'),
      ('Inhaler')
    `);
    console.log('✅ Medicine types added');

    // Insert Suppliers
    await connection.query(`
      INSERT INTO suppliers (name, contact_person, email, phone, address, is_active) VALUES
      ('MediSupply Ethiopia', 'Abebe Kebede', 'contact@medisupply.et', '+251911234567', 'Addis Ababa, Ethiopia', 1),
      ('PharmaDistributors Ltd', 'Tigist Alemu', 'info@pharmadist.et', '+251922345678', 'Dire Dawa, Ethiopia', 1),
      ('HealthCare Suppliers', 'Dawit Tesfaye', 'sales@healthcare.et', '+251933456789', 'Harar, Ethiopia', 1)
    `);
    console.log('✅ Suppliers added');

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
      ('Metformin', 'Metformin HCl', 5, 1, '500mg', 'tablet', 50, 20.00, 1)
    `);
    console.log('✅ Sample medicines added');

    // Initialize stock inventory for medicines
    await connection.query(`
      INSERT INTO stock_inventory (medicine_id, quantity_available)
      SELECT id, FLOOR(RAND() * 100) + 20 FROM medicines
    `);
    console.log('✅ Stock inventory initialized');

    console.log('\n✅ Sample data seeded successfully!\n');

    await connection.end();
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    await connection.end();
    process.exit(1);
  }
}

seedData();
