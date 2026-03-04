-- Script para agregar columnas identificacion y contacto a la tabla perfiles
-- Ejecutar este script en el SQL Editor de Supabase

ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS identificacion TEXT;
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS contacto TEXT;

COMMENT ON COLUMN perfiles.identificacion IS 'Número de identificación (Cédula, DNI, Pasaporte, etc.)';
COMMENT ON COLUMN perfiles.contacto IS 'Teléfono o email de contacto del usuario';
