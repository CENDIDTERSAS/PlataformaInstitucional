-- Migración: Campos faltantes para Hoja de Vida CENDIDTER
-- Añade campos técnicos adicionales para completar el formato SIES-FR-03

ALTER TABLE equipos_biomedicos 
ADD COLUMN IF NOT EXISTS frecuencia TEXT,
ADD COLUMN IF NOT EXISTS peso_equipo TEXT,
ADD COLUMN IF NOT EXISTS accesorios_consumibles TEXT;

-- Actualizar comentarios para reflejar todas las opciones del estándar
COMMENT ON COLUMN equipos_biomedicos.clasificacion_biomedica IS 'Flags SI/NO para: Fijo, Transporte, Invasivo, Diagnóstico, Apoyo, Lab, Rehabilitación, Tratamiento, Prevención';
COMMENT ON COLUMN equipos_biomedicos.clase_tecnologia IS 'Flags SI/NO para: Electrónico, Eléctrico, Mecánico, Hidráulico, Neumático, Nanotecnología, Ultrasonido, Óptico, Otro';
COMMENT ON COLUMN equipos_biomedicos.fuente_alimentacion IS 'Flags SI/NO para: Electricidad, Agua, Aire, Hidráulico, Batería, Gas, Vapor, Solar';
