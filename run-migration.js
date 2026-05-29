import pkg from 'pg';
const { Client } = pkg;

// Usar URL de pooler que tiene mejor soporte SSL
const connectionString = 'postgres://postgres.wtxdzsfgiudecqudjcox:Z1isV7apUjnWBV8r@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true';

const client = new Client({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('🔄 Conectando a Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado!');

    console.log('🔄 Ejecutando migración de horarios...');
    
    const migrationSQL = `
-- Actualizar los slots existentes con los nuevos horarios
UPDATE slots SET name = '06:00–08:00', start_time = '06:00'::time, end_time = '08:00'::time WHERE order_index = 1;
UPDATE slots SET name = '08:00–10:00', start_time = '08:00'::time, end_time = '10:00'::time WHERE order_index = 2;
UPDATE slots SET name = '10:00–12:00', start_time = '10:00'::time, end_time = '12:00'::time WHERE order_index = 3;
UPDATE slots SET name = '12:00–14:00', start_time = '12:00'::time, end_time = '14:00'::time WHERE order_index = 4;
UPDATE slots SET name = '14:00–16:00', start_time = '14:00'::time, end_time = '16:00'::time WHERE order_index = 5;
UPDATE slots SET name = '16:00–18:00', start_time = '16:00'::time, end_time = '18:00'::time WHERE order_index = 6;

-- Eliminar cualquier slot adicional que no sea necesario
DELETE FROM slots WHERE order_index > 6;
    `;

    await client.query(migrationSQL);

    console.log('✅ Migración de horarios ejecutada exitosamente!');
    console.log('   - Nuevos horarios: 06:00-08:00 hasta 16:00-18:00');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

runMigration();
