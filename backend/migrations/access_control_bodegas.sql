-- TABLA DE ASIGNACIÓN PERFIL-BODEGA
CREATE TABLE IF NOT EXISTS public.perfiles_bodegas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    perfil_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    bodega_id UUID REFERENCES public.bodegas(id) ON DELETE CASCADE,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(perfil_id, bodega_id)
);

-- HABILITAR RLS
ALTER TABLE public.perfiles_bodegas ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE RLS
-- Los administradores pueden hacer todo
CREATE POLICY "Admin full access perfiles_bodegas" ON public.perfiles_bodegas
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'Administrador'));

-- Los usuarios pueden ver sus propias asignaciones
CREATE POLICY "Users can view own assignments" ON public.perfiles_bodegas
    FOR SELECT TO authenticated
    USING (perfil_id = auth.uid());
