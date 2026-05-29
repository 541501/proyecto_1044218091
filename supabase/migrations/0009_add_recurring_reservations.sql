-- Migration 0009: Add recurring reservations support
-- Permite crear reservas que se repiten semanalmente

ALTER TABLE reservations
  ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
  ADD COLUMN recurrence_end_date DATE,
  ADD COLUMN parent_reservation_id UUID REFERENCES reservations(id);

-- Index para buscar instancias de una reserva recurrente
CREATE INDEX IF NOT EXISTS idx_reservations_parent_id
  ON reservations(parent_reservation_id)
  WHERE parent_reservation_id IS NOT NULL;

-- Index para buscar reservas recurrentes activas
CREATE INDEX IF NOT EXISTS idx_reservations_recurring
  ON reservations(is_recurring, recurrence_end_date)
  WHERE is_recurring = TRUE;
