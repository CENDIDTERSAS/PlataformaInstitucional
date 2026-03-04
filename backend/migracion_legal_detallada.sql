-- Migración para metadatos legales detallados
-- Ejecutar en el Editor SQL de Supabase

ALTER TABLE public.equipos_biomedicos
ADD COLUMN IF NOT EXISTS factura_proveedor TEXT,
ADD COLUMN IF NOT EXISTS factura_valor NUMERIC,
ADD COLUMN IF NOT EXISTS registro_invima_numero TEXT,
ADD COLUMN IF NOT EXISTS registro_invima_vigencia DATE,
ADD COLUMN IF NOT EXISTS licencia_vigencia_inicio DATE;

-- Nota: licencia_vigencia (ya existente) se usará como fecha de fin/vencimiento (Hasta)
