-- Migración: Software instalado por equipo TI
CREATE TABLE IF NOT EXISTS public.software_ti (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    equipo_ti_id UUID REFERENCES public.equipos_ti(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    version TEXT,
    tipo_licencia TEXT DEFAULT 'Propietario' CHECK (tipo_licencia IN ('Libre','Propietario','Suscripción','OEM','Corporativa')),
    numero_licencia TEXT,
    fecha_instalacion DATE,
    fecha_vencimiento DATE,
    estado TEXT DEFAULT 'Activo' CHECK (estado IN ('Activo','Vencido','Desinstalado')),
    observaciones TEXT,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.software_ti ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.software_ti FOR ALL USING (true);
