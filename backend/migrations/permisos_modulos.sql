-- TABLA DE PERMISOS POR MÓDULO
CREATE TABLE IF NOT EXISTS public.permisos_modulos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    perfil_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    modulo TEXT NOT NULL, -- 'inventarios', 'usuarios', 'papeleria', 'configuracion'
    accion TEXT NOT NULL, -- 'acceso', 'ver_stock', 'gestionar_bodegas', 'auditoria', 'crear', 'editar', 'eliminar'
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(perfil_id, modulo, accion)
);

-- HABILITAR RLS
ALTER TABLE public.permisos_modulos ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE RLS
CREATE POLICY "Admin full access permisos_modulos" ON public.permisos_modulos
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'Administrador'));

CREATE POLICY "Users can view own permissions" ON public.permisos_modulos
    FOR SELECT TO authenticated
    USING (perfil_id = auth.uid());

-- PERMISOS POR DEFECTO PARA NUEVOS USUARIOS (Trigger o manual)
-- Por ahora lo manejaremos desde el backend al crear usuario o mediante inserción masiva.

-- Insertar algunos permisos básicos para los usuarios actuales si es necesario
-- (Opcional, los administradores tendrán acceso total mediante lógica de código)
