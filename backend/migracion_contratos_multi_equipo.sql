-- Migración: Relación Muchos-a-Muchos entre Contratos y Equipos
-- Permite que un contrato cubra N equipos específicos

-- 1. Crear tabla intermedia de vínculos
CREATE TABLE IF NOT EXISTS contrato_vinculos_equipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contrato_id UUID REFERENCES contratos_biomedicos(id) ON DELETE CASCADE,
    equipo_id UUID REFERENCES equipos_biomedicos(id) ON DELETE CASCADE,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(contrato_id, equipo_id)
);

-- 2. Comentario descriptivo
COMMENT ON TABLE contrato_vinculos_equipos IS 'Tabla de unión para contratos que cubren múltiples equipos biomédicos';

-- 3. (Opcional) Nota: El campo equipo_id en contratos_biomedicos puede quedar para contratos de un solo equipo 
-- o para asignaciones rápidas, pero la tabla intermedia será la fuente de verdad para múltiples equipos.
