require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    console.log('✓ Connection successful!');
    await connection.end();
  } catch (error) {
    console.error('✗ Connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
