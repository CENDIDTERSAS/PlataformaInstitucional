-- Migración: Tabla de Equipos TI para el módulo Sistemas
CREATE TABLE IF NOT EXISTS public.equipos_ti (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    hostname TEXT,
    tipo TEXT DEFAULT 'Desktop' CHECK (tipo IN ('Desktop', 'Laptop', 'Servidor', 'Impresora', 'Switch', 'Router', 'Tablet', 'Otro')),
    marca TEXT,
    modelo TEXT,
    serial TEXT,
    numero_activo TEXT,
    procesador TEXT,
    ram TEXT,
    almacenamiento TEXT,
    sistema_operativo TEXT,
    ip_address TEXT,
    mac_address TEXT,
    usuario_asignado TEXT,
    sede TEXT,
    oficina TEXT,
    fecha_compra DATE,
    valor_compra NUMERIC,
    estado TEXT DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Mantenimiento', 'En Seguimiento', 'Baja')),
    foto_url TEXT,
    observaciones TEXT,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.equipos_ti ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.equipos_ti FOR ALL USING (true);
