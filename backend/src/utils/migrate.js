/**
 * Database migration runner.
 * Can be run standalone: node src/utils/migrate.js
 * Or imported as a function: const { runMigrations } = require('./migrate');
 */
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  // Dynamically require pool so dotenv is already loaded by caller
  const { pool } = require('../config/database');

  // schema.sql search order:
  // 1. backend/database/schema.sql (Railway: /app/database/schema.sql — backend is root dir)
  // 2. database/schema.sql relative to repo root (local dev)
  // 3. CWD-based fallbacks
  const candidates = [
    path.join(__dirname, '../../database/schema.sql'),    // Railway: /app/src/utils -> /app/database
    path.join(__dirname, '../../../database/schema.sql'), // local dev: backend/src/utils -> root/database
    path.join(process.cwd(), 'database/schema.sql'),      // CWD fallback
    path.join(process.cwd(), '../database/schema.sql'),   // CWD parent fallback
  ];

  let schemaPath = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      schemaPath = candidate;
      break;
    }
  }

  if (!schemaPath) {
    console.error('❌ Schema file not found. Searched:', candidates);
    throw new Error('Schema file not found');
  }

  console.log('📂 Running migrations from:', schemaPath);

  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Remove full-line comments (-- ...) and strip carriage returns
  // then split on semicolons to get individual statements
  const cleaned = sql
    .replace(/\r\n/g, '\n')          // normalize Windows line endings
    .replace(/^--.*$/gm, '')         // remove full-line SQL comments
    .replace(/\n{3,}/g, '\n\n');     // collapse excess blank lines

  const statements = cleaned
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let ok = 0;
  let skipped = 0;
  let warnings = 0;

  for (const stmt of statements) {
    const upper = stmt.toUpperCase().trim();
    // Skip CREATE DATABASE / USE — not allowed on managed cloud DBs
    if (upper.startsWith('CREATE DATABASE') || upper.startsWith('USE ')) {
      skipped++;
      continue;
    }
    try {
      await pool.query(stmt);
      ok++;
    } catch (err) {
      // IF NOT EXISTS errors are non-fatal warnings
      if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_DUP_FIELDNAME') {
        skipped++;
      } else {
        console.warn('⚠️  Migration warning:', stmt.slice(0, 100));
        console.warn('   Error:', err.message);
        warnings++;
      }
    }
  }

  console.log(`✅ Migration complete — ${ok} executed, ${skipped} skipped, ${warnings} warnings`);
}

// Allow running standalone
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
  runMigrations()
    .then(() => process.exit(0))
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runMigrations };
