/**
 * Database migration runner.
 * Run: node src/utils/migrate.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function migrate() {
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('Schema file not found:', schemaPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');
  // Split on semicolons, filter empty
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    const upper = stmt.toUpperCase().trim();
    // Skip CREATE DATABASE / USE so it works seamlessly on both local and managed cloud DBs (Railway, Aiven, TiDB)
    if (upper.startsWith('CREATE DATABASE') || upper.startsWith('USE ')) {
      continue;
    }
    try {
      await pool.query(stmt);
    } catch (err) {
      console.error('Migration warning on statement:', stmt.slice(0, 80));
      console.error(err.message);
    }
  }

  console.log('✅ Migration complete');
  process.exit(0);
}

migrate();
