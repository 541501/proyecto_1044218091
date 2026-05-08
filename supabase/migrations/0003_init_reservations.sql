-- Migration 0003: Initialize reservations table
-- Created for Fase 4: Reservas

CREATE TABLE IF NOT EXISTS reservations (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id          UUID         NOT NULL REFERENCES rooms(id),
  slot_id          UUID         NOT NULL REFERENCES slots(id),
  professor_id     UUID         NOT NULL REFERENCES users(id),
  reservation_date DATE         NOT NULL,  -- solo días hábiles
  subject          VARCHAR(150) NOT NULL,  -- materia
  group_name       VARCHAR(50)  NOT NULL,  -- grupo (ej: "2024-1 Grupo A")
  status           VARCHAR(15)  NOT NULL DEFAULT 'confirmada'
                   CHECK (status IN ('confirmada', 'cancelada')),
  cancellation_reason TEXT,                -- solo cuando status='cancelada'
  cancelled_by     UUID         REFERENCES users(id),  -- puede ser distinto del profesor
  cancelled_at     TIMESTAMPTZ,
  created_by       UUID         REFERENCES users(id),  -- siempre igual a professor_id
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- RN-01: La unicidad de reservas activas se hace con índice parcial.
-- Solo una reserva 'confirmada' por combinación (salón, franja, fecha).
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_reservation
  ON reservations(room_id, slot_id, reservation_date)
  WHERE status = 'confirmada';

CREATE INDEX IF NOT EXISTS idx_reservations_professor  ON reservations(professor_id, reservation_date DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_room_date  ON reservations(room_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_date       ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status     ON reservations(status);
