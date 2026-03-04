-- Agregar columna firma_url a la tabla perfiles
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS firma_url TEXT;

-- Comentario descriptivo
COMMENT ON COLUMN perfiles.firma_url IS 'URL de la imagen de la firma digital del usuario alojada en Supabase Storage';
