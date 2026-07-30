const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || 'simpel_root_2024',
  database: process.env.DATABASE_NAME || 'simpel',
  waitForConnections: true,
  connectionLimit: 10
});

async function query(sql) {
  const [rows] = await pool.query(sql);
  return rows;
}

module.exports = { pool, query };
