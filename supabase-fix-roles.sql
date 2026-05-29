ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_role_check;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_role_check
CHECK (user_role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));
