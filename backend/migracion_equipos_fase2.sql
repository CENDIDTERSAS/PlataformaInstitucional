-- Extensión y nuevas tablas para Equipos Biomédicos (Fase 2)

-- 1. Extender equipos_biomedicos con campos técnicos
ALTER TABLE equipos_biomedicos 
ADD COLUMN IF NOT EXISTS voltaje TEXT,
ADD COLUMN IF NOT EXISTS frecuencia TEXT,
ADD COLUMN IF NOT EXISTS potencia TEXT,
ADD COLUMN IF NOT EXISTS peso TEXT,
ADD COLUMN IF NOT EXISTS dimensiones TEXT,
ADD COLUMN IF NOT EXISTS fecha_vencimiento_garantia DATE,
ADD COLUMN IF NOT EXISTS manual_url TEXT;

-- 2. Crear tabla de contratos_biomedicos
CREATE TABLE IF NOT EXISTS contratos_biomedicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor_id UUID REFERENCES proveedores(id),
    numero_contrato TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    valor_total NUMERIC DEFAULT 0,
    fecha_inicio DATE,
    fecha_fin DATE,
    incremento_anual NUMERIC DEFAULT 0, -- Porcentaje
    estado TEXT DEFAULT 'Activo', -- 'Activo', 'Vencido', 'Suspendido'
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear tabla de mantenimientos_equipos
CREATE TABLE IF NOT EXISTS mantenimientos_equipos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipo_id UUID REFERENCES equipos_biomedicos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'Preventivo', 'Correctivo', 'Calibración', 'Otro'
    fecha_programada DATE,
    fecha_ejecucion DATE,
    tecnico_responsable TEXT,
    descripcion_trabajo TEXT,
    observaciones TEXT,
    costo NUMERIC DEFAULT 0,
    contrato_id UUID REFERENCES contratos_biomedicos(id) ON DELETE SET NULL,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Crear tabla de repuestos_equipos
CREATE TABLE IF NOT EXISTS repuestos_equipos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipo_id UUID REFERENCES equipos_biomedicos(id) ON DELETE CASCADE,
    mantenimiento_id UUID REFERENCES mantenimientos_equipos(id) ON DELETE SET NULL,
    nombre_repuesto TEXT NOT NULL,
    cantidad INTEGER DEFAULT 1,
    costo_unitario NUMERIC DEFAULT 0,
    fecha_instalacion DATE DEFAULT CURRENT_DATE,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de RLS para las nuevas tablas
ALTER TABLE contratos_biomedicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mantenimientos_equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE repuestos_equipos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Contratos" ON contratos_biomedicos FOR SELECT USING (true);
CREATE POLICY "Auth Manage Contratos" ON contratos_biomedicos FOR ALL USING (true);

CREATE POLICY "Public Read Mantenimientos" ON mantenimientos_equipos FOR SELECT USING (true);
CREATE POLICY "Auth Manage Mantenimientos" ON mantenimientos_equipos FOR ALL USING (true);

CREATE POLICY "Public Read Repuestos" ON repuestos_equipos FOR SELECT USING (true);
CREATE POLICY "Auth Manage Repuestos" ON repuestos_equipos FOR ALL USING (true);
