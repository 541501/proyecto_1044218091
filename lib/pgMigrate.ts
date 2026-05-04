import { Pool, QueryResult } from 'pg';
import * as fs from 'fs/promises';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Run all pending migrations from supabase/migrations/ directory.
 * Tracks applied migrations in _migrations table to prevent re-running.
 */
export async function runMigrations(): Promise<string[]> {
  const client = await pool.connect();
  const appliedMigrations: string[] = [];

  try {
    // Ensure _migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL       PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    // Get list of migration files
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter((f) => f.endsWith('.sql')).sort();

    // Check which migrations have been applied
    const appliedResult = await client.query(
      'SELECT filename FROM _migrations WHERE filename = ANY($1)',
      [migrationFiles]
    );
    const appliedSet = new Set(appliedResult.rows.map((r) => r.filename));

    // Run pending migrations
    for (const file of migrationFiles) {
      if (appliedSet.has(file)) {
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        appliedMigrations.push(file);
        console.log(`[pgMigrate] Applied ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[pgMigrate] Failed to apply ${file}:`, err);
        throw err;
      }
    }
  } finally {
    client.release();
  }

  return appliedMigrations;
}

/**
 * Get list of applied migrations.
 */
export async function getAppliedMigrations(): Promise<string[]> {
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT filename FROM _migrations ORDER BY applied_at');
    return result.rows.map((r) => r.filename);
  } catch (err) {
    // Table doesn't exist yet
    return [];
  } finally {
    client.release();
  }
}

/**
 * Get list of pending migrations.
 */
export async function getPendingMigrations(): Promise<string[]> {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = await fs.readdir(migrationsDir);
  const migrationFiles = files.filter((f) => f.endsWith('.sql')).sort();

  const applied = await getAppliedMigrations();
  const appliedSet = new Set(applied);

  return migrationFiles.filter((f) => !appliedSet.has(f));
}

export async function closePool(): Promise<void> {
  await pool.end();
}
