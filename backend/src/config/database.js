const mysql = require('mysql2/promise');
require('dotenv').config();

const poolConfig = {
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  timezone: '+00:00',
  charset: 'utf8mb4',
};

// Support both DATABASE_URL / MYSQL_URL and separate credentials
const dbUri = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (dbUri) {
  poolConfig.uri = dbUri;
} else {
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.port = parseInt(process.env.DB_PORT) || 3306;
  poolConfig.user = process.env.DB_USER || 'root';
  poolConfig.password = process.env.DB_PASSWORD || '';
  poolConfig.database = process.env.DB_NAME || 'focus_plus_db';
}

// Enable SSL if explicitly requested or when in production connecting to remote host
const isRemote = poolConfig.host && !['localhost', '127.0.0.1'].includes(poolConfig.host);
if (process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && isRemote)) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = dbUri ? mysql.createPool(dbUri) : mysql.createPool(poolConfig);

/**
 * Execute a parameterized query against the pool.
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<[Array, Array]>}
 */
async function query(sql, params = []) {
  return pool.query(sql, params);
}

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err.message);
  });

module.exports = { pool, query };
