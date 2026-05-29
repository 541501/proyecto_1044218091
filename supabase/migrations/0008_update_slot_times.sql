-- Migration 0008: Update slot times to new schedule
-- Cambiar horarios de las franjas:
-- Antes: 07:00-09:00, 09:00-11:00, 11:00-13:00, 13:00-15:00, 15:00-17:00, 16:00-18:00, 18:00-20:00
-- Después: 06:00-08:00, 08:00-10:00, 10:00-12:00, 12:00-14:00, 14:00-16:00, 16:00-18:00

-- Actualizar los slots existentes con los nuevos horarios
UPDATE slots SET name = '06:00–08:00', start_time = '06:00'::time, end_time = '08:00'::time WHERE order_index = 1;
UPDATE slots SET name = '08:00–10:00', start_time = '08:00'::time, end_time = '10:00'::time WHERE order_index = 2;
UPDATE slots SET name = '10:00–12:00', start_time = '10:00'::time, end_time = '12:00'::time WHERE order_index = 3;
UPDATE slots SET name = '12:00–14:00', start_time = '12:00'::time, end_time = '14:00'::time WHERE order_index = 4;
UPDATE slots SET name = '14:00–16:00', start_time = '14:00'::time, end_time = '16:00'::time WHERE order_index = 5;
UPDATE slots SET name = '16:00–18:00', start_time = '16:00'::time, end_time = '18:00'::time WHERE order_index = 6;

-- Eliminar cualquier slot adicional que no sea necesario
DELETE FROM slots WHERE order_index > 6;

