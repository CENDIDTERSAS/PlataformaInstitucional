-- Migración para metadatos de documentos y vigencia
-- Ejecutar en el Editor SQL de Supabase

ALTER TABLE public.equipos_biomedicos
ADD COLUMN IF NOT EXISTS licencia_vigencia DATE,
ADD COLUMN IF NOT EXISTS factura_numero TEXT,
ADD COLUMN IF NOT EXISTS factura_fecha DATE;
