import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function updateRoleConstraints() {
  const projectId = 'wtxdzsfgiudecqudjcox';
  
  const client = new Client({
    host: `${projectId}.db.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || 'your_password_here', // This would need to be provided
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Update users table constraint
    await client.query(`
      ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));
    `);
    console.log('✓ Updated users table role constraint');

    // Update audit_log table constraint
    await client.query(`
      ALTER TABLE IF EXISTS audit_log DROP CONSTRAINT IF EXISTS audit_log_user_role_check;
      ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_role_check
      CHECK (user_role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));
    `);
    console.log('✓ Updated audit_log table role constraint');

    console.log('\n✅ All constraints updated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nTo fix this manually, execute this SQL in Supabase SQL Editor:');
    console.error(`
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_role_check;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_role_check
CHECK (user_role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));
    `);
  } finally {
    await client.end();
  }
}

updateRoleConstraints();
