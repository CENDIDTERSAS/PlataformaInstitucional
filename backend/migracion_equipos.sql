-- Migración para el módulo de Equipos Biomédicos

CREATE TABLE IF NOT EXISTS equipos_biomedicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_inventario TEXT UNIQUE,
    nombre TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    serie TEXT UNIQUE,
    ubicacion_id UUID REFERENCES bodegas(id),
    estado TEXT DEFAULT 'Funcional', -- 'Funcional', 'En Mantenimiento', 'Fuera de Servicio', 'Baja'
    fecha_adquisicion DATE,
    ultimo_mantenimiento DATE,
    proximo_mantenimiento DATE,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de RLS
ALTER TABLE equipos_biomedicos ENABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS para el backend (siguiendo el patrón anterior de la migración unificada)
ALTER TABLE equipos_biomedicos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Equipos" ON equipos_biomedicos;
CREATE POLICY "Public Read Equipos" ON equipos_biomedicos FOR SELECT USING (true);

-- Permitir todo al rol autenticado (o manejarlo sin RLS si el backend usa service_role/anon sin restricciones)
-- Dado que el backend parece estar operando con políticas abiertas para inserción según migraciones previas:
DROP POLICY IF EXISTS "Auth Manage Equipos" ON equipos_biomedicos;
CREATE POLICY "Auth Manage Equipos" ON equipos_biomedicos FOR ALL USING (true);

-- Insertar algunos equipos de prueba
INSERT INTO equipos_biomedicos (codigo_inventario, nombre, marca, modelo, serie, estado)
VALUES 
('EB-001', 'Monitor de Signos Vitales', 'Mindray', 'uMEC12', 'SN12345678', 'Funcional'),
('EB-002', 'Desfibrilador', 'Zoll', 'Series R', 'SN87654321', 'En Mantenimiento')
ON CONFLICT DO NOTHING;
