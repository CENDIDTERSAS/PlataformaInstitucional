-- Crear tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    nit TEXT UNIQUE,
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
-- Todos los usuarios autenticados pueden ver proveedores
CREATE POLICY "Usuarios autenticados pueden ver proveedores" 
ON proveedores FOR SELECT 
TO authenticated 
USING (true);

-- Solo administradores pueden insertar/actualizar/eliminar
CREATE POLICY "Solo administradores pueden gestionar proveedores" 
ON proveedores FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM perfiles 
        WHERE perfiles.id = auth.uid() 
        AND perfiles.rol = 'Administrador'
    )
);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proveedores_updated_at
    BEFORE UPDATE ON proveedores
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Insertar un proveedor por defecto (opcional, para mantener compatibilidad inicial)
INSERT INTO proveedores (nombre, nit, direccion)
VALUES ('PAPELERIA LA UNICA', 'N/A', 'Mocoa, Putumayo')
ON CONFLICT (nit) DO NOTHING;
