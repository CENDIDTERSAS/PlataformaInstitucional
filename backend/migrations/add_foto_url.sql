-- Script para agregar columna foto_url a la tabla perfiles existente
-- Ejecutar este script en el SQL Editor de Supabase

ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS foto_url TEXT;

COMMENT ON COLUMN perfiles.foto_url IS 'URL de la foto de perfil almacenada en el bucket FotosPersonal de Supabase Storage';
