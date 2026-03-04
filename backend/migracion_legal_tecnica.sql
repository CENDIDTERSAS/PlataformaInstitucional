-- Migración para Documentación Legal y Campos Técnicos Completos
-- Ejecutar en el Editor SQL de Supabase

ALTER TABLE public.equipos_biomedicos
ADD COLUMN IF NOT EXISTS factura_compra TEXT,
ADD COLUMN IF NOT EXISTS registro_importacion TEXT,
ADD COLUMN IF NOT EXISTS registro_invima TEXT,
ADD COLUMN IF NOT EXISTS licencia_practica TEXT,
ADD COLUMN IF NOT EXISTS voltaje_min TEXT,
ADD COLUMN IF NOT EXISTS voltaje_max TEXT,
ADD COLUMN IF NOT EXISTS corriente_min TEXT,
ADD COLUMN IF NOT EXISTS courant_max TEXT, -- Corregido a corriente_max
ADD COLUMN IF NOT EXISTS potencia_consumida TEXT,
ADD COLUMN IF NOT EXISTS humedad_rango TEXT,
ADD COLUMN IF NOT EXISTS presion_rango TEXT,
ADD COLUMN IF NOT EXISTS temperatura_rango TEXT,
ADD COLUMN IF NOT EXISTS tubo_marca TEXT,
ADD COLUMN IF NOT EXISTS tubo_modelo TEXT,
ADD COLUMN IF NOT EXISTS tubo_serie TEXT,
ADD COLUMN IF NOT EXISTS tubo_anio_fab TEXT,
ADD COLUMN IF NOT EXISTS clasificacion_biomedica JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS clase_tecnologia JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS fuente_alimentacion JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS manuales_disponibles JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS periodo_mantenimiento TEXT,
ADD COLUMN IF NOT EXISTS mantenimientos_por_anio INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS protocolo_mantenimiento TEXT,
ADD COLUMN IF NOT EXISTS recomendaciones_uso TEXT,
ADD COLUMN IF NOT EXISTS accesorios_consumibles TEXT;

-- Corregir nombre de columna si hubo error de dedo previo
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipos_biomedicos' AND column_name = 'courant_max') THEN
        ALTER TABLE public.equipos_biomedicos RENAME COLUMN courant_max TO corriente_max;
    END IF;
END $$;
