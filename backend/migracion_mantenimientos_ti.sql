-- Tabla de mantenimientos programados para equipos TI
CREATE TABLE IF NOT EXISTS public.mantenimientos_ti (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    equipo_ti_id UUID REFERENCES public.equipos_ti(id) ON DELETE CASCADE,
    numero_mantenimiento INT CHECK (numero_mantenimiento BETWEEN 1 AND 4),
    anio INT NOT NULL,
    fecha_programada DATE NOT NULL,
    fecha_realizado DATE,
    tecnico TEXT,
    tipo TEXT DEFAULT 'Preventivo' CHECK (tipo IN ('Preventivo','Correctivo','Emergencia')),
    descripcion TEXT,
    estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente','Realizado','Omitido')),
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mantenimientos_ti ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.mantenimientos_ti FOR ALL USING (true);
