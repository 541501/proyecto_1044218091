import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgres://postgres.wtxdzsfgiudecqudjcox:Z1isV7apUjnWBV8r@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true';

const client = new Client({ 
  connectionString,
  ssl: { rejectUnauthorized: false },
  // Additional SSL config
  database: 'postgres'
});

async function runMigration() {
  try {
    console.log('🔄 Conectando a Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado!');

    console.log('🔄 Ejecutando migración 0009 (recurringReservations)...');
    
    // Add recurring reservations fields
    console.log('  - Agregando columnas a la tabla reservations...');
    await client.query(`
      ALTER TABLE IF EXISTS reservations
        ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
        ADD COLUMN IF NOT EXISTS parent_reservation_id UUID;
    `);
    
    // Create indexes
    console.log('  - Creando índices...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reservations_parent_id
        ON reservations(parent_reservation_id)
        WHERE parent_reservation_id IS NOT NULL;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reservations_recurring
        ON reservations(is_recurring, recurrence_end_date)
        WHERE is_recurring = TRUE;
    `);

    console.log('✅ Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
