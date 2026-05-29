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

    console.log('🔄 Ejecutando migración de reservaciones...');
    
    const migrationSQL = `
-- Migration 0007: Add reservation request workflow
-- Fase: Requests — Permite profesores solicitar reservas que deben ser aprobadas por admin

-- Add new status 'pendiente' and approval tracking columns to reservations table
ALTER TABLE reservations
  DROP CONSTRAINT reservations_status_check,
  ADD CONSTRAINT reservations_status_check
    CHECK (status IN ('pendiente', 'confirmada', 'rechazada', 'cancelada')),
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Update unique index to only apply to 'confirmada' and 'rechazada' statuses
DROP INDEX IF EXISTS idx_unique_active_reservation;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_reservation
  ON reservations(room_id, slot_id, reservation_date)
  WHERE status IN ('confirmada', 'rechazada');

-- Index to quickly find pending requests
CREATE INDEX IF NOT EXISTS idx_reservations_pending
  ON reservations(status, created_at DESC)
  WHERE status = 'pendiente';

-- Index to find requests by approver
CREATE INDEX IF NOT EXISTS idx_reservations_approved_by
  ON reservations(approved_by)
  WHERE approved_by IS NOT NULL;
    `;

    await client.query(migrationSQL);

    console.log('✅ Migración ejecutada exitosamente!');
    console.log('   - Tabla reservations actualizada');
    console.log('   - Nuevos estados: pendiente, rechazada');
    console.log('   - Nuevas columnas: reason, approved_by, approved_at');
    console.log('   - Índices creados para optimizar búsquedas');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

runMigration();
