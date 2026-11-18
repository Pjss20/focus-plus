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

  // schema.sql is at <repo-root>/database/schema.sql
  // When running in Railway /app = backend root, so go up one level
  const candidates = [
    path.join(__dirname, '../../../database/schema.sql'), // local dev (backend/src/utils -> root)
    path.join(__dirname, '../../database/schema.sql'),    // Railway (app/src/utils -> app)
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
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

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
