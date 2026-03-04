-- Migración: Seguimiento de Ejecución de Contratos
-- Añade campos para rastrear visitas pactadas vs realizadas

-- 1. Actualizar tabla de contratos
ALTER TABLE contratos_biomedicos 
ADD COLUMN IF NOT EXISTS visitas_pactadas INTEGER DEFAULT 0;

-- 2. Actualizar tabla de mantenimientos
ALTER TABLE mantenimientos_equipos
ADD COLUMN IF NOT EXISTS contrato_id UUID REFERENCES contratos_biomedicos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS numero_visita INTEGER;

-- Comentario descriptivo
COMMENT ON COLUMN contratos_biomedicos.visitas_pactadas IS 'Número total de visitas de mantenimiento preventivo/calibración pactadas en el contrato anual';
COMMENT ON COLUMN mantenimientos_equipos.numero_visita IS 'Número correlativo de la visita dentro del contrato ligado';
