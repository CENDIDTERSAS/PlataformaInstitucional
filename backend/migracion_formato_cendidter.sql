-- Migración: Estandarización de Hoja de Vida CENDIDTER
-- Añade campos técnicos detallados según formato SIES-FR-03

ALTER TABLE equipos_biomedicos 
ADD COLUMN IF NOT EXISTS clase_riesgo TEXT,
ADD COLUMN IF NOT EXISTS registro_invima TEXT,
ADD COLUMN IF NOT EXISTS tipo_adquisicion TEXT, -- Compra, Donación, Préstamo
ADD COLUMN IF NOT EXISTS fecha_ingreso DATE,
ADD COLUMN IF NOT EXISTS registro_importacion TEXT,

-- Información del Tubo RX (Solo para equipos de rayos X)
ADD COLUMN IF NOT EXISTS tubo_marca TEXT,
ADD COLUMN IF NOT EXISTS tubo_modelo TEXT,
ADD COLUMN IF NOT EXISTS tubo_serie TEXT,
ADD COLUMN IF NOT EXISTS tubo_anio_fab INTEGER,

-- Requerimientos Físicos de Instalación
ADD COLUMN IF NOT EXISTS voltaje_max TEXT,
ADD COLUMN IF NOT EXISTS voltaje_min TEXT,
ADD COLUMN IF NOT EXISTS corriente_max TEXT,
ADD COLUMN IF NOT EXISTS corriente_min TEXT,
ADD COLUMN IF NOT EXISTS potencia_consumida TEXT,
ADD COLUMN IF NOT EXISTS humedad_rango TEXT,
ADD COLUMN IF NOT EXISTS presion_rango TEXT,
ADD COLUMN IF NOT EXISTS temperatura_rango TEXT,

-- Clasificaciones (Usando JSONB para flexibilidad)
ADD COLUMN IF NOT EXISTS clasificacion_biomedica JSONB DEFAULT '{}', -- {fijo: true, invasivo: false, ...}
ADD COLUMN IF NOT EXISTS clase_tecnologia JSONB DEFAULT '{}',     -- {electronico: true, mecanico: true, ...}
ADD COLUMN IF NOT EXISTS fuente_alimentacion JSONB DEFAULT '{}',   -- {agua: false, electricidad: true, ...}
ADD COLUMN IF NOT EXISTS manuales_disponibles JSONB DEFAULT '{}',  -- {servicio: true, usuario: true, ...}

-- Datos de Mantenimiento y Garantía
ADD COLUMN IF NOT EXISTS periodo_mantenimiento TEXT, -- Mensual, Trimestral, Semestral, Anual
ADD COLUMN IF NOT EXISTS mantenimientos_por_anio INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS protocolo_mantenimiento TEXT,
ADD COLUMN IF NOT EXISTS recomendaciones_uso TEXT;

-- Comentarios
COMMENT ON COLUMN equipos_biomedicos.clasificacion_biomedica IS 'Flags SI/NO para: Fijo, Transporte, Invasivo, Diagnóstico, Apoyo, Lab, Rehabilitación, Tratamiento';
COMMENT ON COLUMN equipos_biomedicos.clase_tecnologia IS 'Flags SI/NO para: Electrónico, Eléctrico, Mecánico, Hidráulico, Neumático, Nanotecnología, Ultrasonido, Otro';
