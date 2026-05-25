const mysql = require('mysql2/promise');

let pool = null;

const getConnection = async () => {
  try {
    if (!pool) {
      pool = await mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      console.log('✅ Conectado a MySQL (XAMPP)');
    }
    return pool;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    throw error;
  }
};

module.exports = { getConnection };