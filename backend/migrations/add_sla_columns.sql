-- MIGRACIÓN PARA MANEJO DE SLA EN SOLICITUDES DE PAPELERÍA
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar columnas para medir el tiempo de respuesta
ALTER TABLE solicitudes_papeleria 
ADD COLUMN IF NOT EXISTS fecha_entrega TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sla_horas NUMERIC;

-- 2. Comentario para documentación
COMMENT ON COLUMN solicitudes_papeleria.fecha_entrega IS 'Fecha y hora exacta en la que se entregó el pedido';
COMMENT ON COLUMN solicitudes_papeleria.sla_horas IS 'Horas transcurridas desde la creación hasta la entrega';
