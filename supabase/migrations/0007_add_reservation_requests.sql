-- Migration 0007: Add reservation request workflow
-- Fase: Requests — Permite profesores solicitar reservas que deben ser aprobadas por admin

-- Add new status 'pendiente' and approval tracking columns to reservations table
ALTER TABLE reservations
  DROP CONSTRAINT reservations_status_check,
  ADD CONSTRAINT reservations_status_check
    CHECK (status IN ('pendiente', 'confirmada', 'rechazada', 'cancelada')),
  ADD COLUMN reason TEXT,  -- Reason for reservation request
  ADD COLUMN approved_by UUID REFERENCES users(id),  -- Admin who approved
  ADD COLUMN approved_at TIMESTAMPTZ;  -- When it was approved

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
