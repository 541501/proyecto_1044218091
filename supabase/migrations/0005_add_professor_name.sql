-- Migration 0005: Add professor_name to reservations
-- Permite registrar el nombre del docente que dará la clase

ALTER TABLE reservations 
ADD COLUMN professor_name VARCHAR(100);

-- Comentario para documentar el propósito del campo
COMMENT ON COLUMN reservations.professor_name IS 
'Nombre del docente que dará la clase (puede diferir del profesor que hizo la reserva)';

-- Crear índice para búsquedas por nombre del docente
CREATE INDEX IF NOT EXISTS idx_reservations_professor_name 
ON reservations(professor_name) 
WHERE status = 'confirmada';
