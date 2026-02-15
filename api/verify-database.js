require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('📊 Database Verification Report\n');
    console.log('='.repeat(50));

    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n✅ Total Tables: ${tables.length}`);
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Check roles
    const [roles] = await connection.query('SELECT * FROM roles');
    console.log(`\n✅ Roles: ${roles.length}`);
    roles.forEach(role => console.log(`  - ${role.name}`));

    // Check users
    const [users] = await connection.query('SELECT id, username, email, first_name, last_name, is_active FROM users');
    console.log(`\n✅ Users: ${users.length}`);
    users.forEach(user => console.log(`  - ${user.username} (${user.email}) - Active: ${user.is_active}`));

    // Check medicines
    const [medicines] = await connection.query('SELECT COUNT(*) as count FROM medicines WHERE deleted_at IS NULL');
    console.log(`\n✅ Medicines: ${medicines[0].count}`);

    // Check categories
    const [categories] = await connection.query('SELECT * FROM medicine_categories WHERE deleted_at IS NULL');
    console.log(`\n✅ Medicine Categories: ${categories.length}`);
    categories.forEach(cat => console.log(`  - ${cat.name}`));

    // Check types
    const [types] = await connection.query('SELECT * FROM medicine_types WHERE deleted_at IS NULL');
    console.log(`\n✅ Medicine Types: ${types.length}`);
    types.forEach(type => console.log(`  - ${type.name}`));

    // Check suppliers
    const [suppliers] = await connection.query('SELECT COUNT(*) as count FROM suppliers WHERE deleted_at IS NULL');
    console.log(`\n✅ Suppliers: ${suppliers[0].count}`);

    // Check prescriptions
    const [prescriptions] = await connection.query('SELECT COUNT(*) as count FROM prescriptions');
    console.log(`\n✅ Prescriptions: ${prescriptions[0].count}`);

    // Check purchase orders
    const [orders] = await connection.query('SELECT COUNT(*) as count FROM purchase_orders');
    console.log(`\n✅ Purchase Orders: ${orders[0].count}`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database is properly connected and initialized!\n');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
