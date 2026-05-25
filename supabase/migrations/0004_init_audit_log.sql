-- ClassSport — Audit Log
-- Reemplaza la auditoría en Vercel Blob por una tabla en Postgres.
-- Solo se registran operaciones DML del dominio: INSERT, UPDATE, DELETE.

CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  user_id     UUID         NOT NULL,
  user_email  VARCHAR(255) NOT NULL,
  user_role   VARCHAR(15)  NOT NULL CHECK (user_role IN ('profesor', 'coordinador', 'admin')),
  operation   VARCHAR(10)  NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  entity      VARCHAR(20)  NOT NULL CHECK (entity IN ('reservation', 'room', 'user')),
  entity_id   UUID,
  summary     TEXT         NOT NULL,
  metadata    JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user      ON audit_log (user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity    ON audit_log (entity, entity_id);
