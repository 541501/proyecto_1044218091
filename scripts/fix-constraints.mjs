import { Client } from 'pg';

async function fixRoleConstraints() {
  const client = new Client({
    host: 'aws-1-us-east-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.wtxdzsfgiudecqudjcox',
    password: 'Z1isV7apUjnWBV8r',
    ssl: {
      rejectUnauthorized: false
    },
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Drop and recreate users role check
    await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    `);
    console.log('✓ Dropped old users constraint');

    await client.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));
    `);
    console.log('✓ Created new users constraint');

    // Drop and recreate audit_log role check
    await client.query(`
      ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_role_check;
    `);
    console.log('✓ Dropped old audit_log constraint');

    await client.query(`
      ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_role_check
      CHECK (user_role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));
    `);
    console.log('✓ Created new audit_log constraint');

    console.log('\n✅ All role constraints fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixRoleConstraints();
