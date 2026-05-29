-- Update the users table role check constraint to include new escuela roles
ALTER TABLE users
DROP CONSTRAINT users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));

-- Update the audit_log table role check constraint as well
ALTER TABLE audit_log
DROP CONSTRAINT audit_log_user_role_check;

ALTER TABLE audit_log
ADD CONSTRAINT audit_log_user_role_check
CHECK (user_role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));
