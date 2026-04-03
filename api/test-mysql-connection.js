require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing MySQL connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.DB_PORT);
  console.log('User:', process.env.DB_USER);
  console.log('Password:', process.env.DB_PASSWORD ? '***' : '(empty)');
  console.log('Database:', process.env.DB_NAME);
  console.log('');

  try {
    // Try to connect without database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('✅ MySQL connection successful!');
    
    // Check if database exists
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('\nAvailable databases:');
    databases.forEach(db => console.log('  -', db.Database));
    
    // Check if our database exists
    const dbExists = databases.some(db => db.Database === process.env.DB_NAME);
    if (dbExists) {
      console.log(`\n✅ Database '${process.env.DB_NAME}' exists`);
    } else {
      console.log(`\n⚠️  Database '${process.env.DB_NAME}' does not exist yet (will be created)`);
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ MySQL connection failed!');
    console.error('Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Make sure MySQL is running');
    console.error('2. Check your DB_PASSWORD in .env file');
    console.error('3. Verify DB_USER has proper permissions');
    console.error('4. Check if DB_HOST and DB_PORT are correct');
    process.exit(1);
  }
}

testConnection();
