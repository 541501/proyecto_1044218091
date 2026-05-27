-- Migration 0006: Permitir reutilización de emails de usuarios inactivos
-- Cambia el constraint UNIQUE global de email a un índice único parcial
-- que solo aplica a usuarios activos (is_active = true)

-- Primero, eliminar la constraint UNIQUE existente si existe
BEGIN;

-- Intenta eliminar la constraint (ignorar si no existe)
DO $$ 
BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Eliminar índices viejos si existen
DROP INDEX IF EXISTS users_email_key;

-- Crear índice único parcial que solo incluya usuarios activos
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_active 
  ON users(email) 
  WHERE is_active = true;

-- Crear índice regular para búsquedas rápidas de todos los emails
CREATE INDEX IF NOT EXISTS idx_users_email_all ON users(email);

COMMIT;


