-- SCRIPT DE CREACIÓN PARA TABLA PROVEEDORES
-- Este script crea la tabla desde cero con todos los campos requeridos y desactiva RLS.

-- 1. Crear tabla proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    nit TEXT,
    email TEXT,
    telefono TEXT,
    departamento TEXT,
    ciudad TEXT,
    direccion TEXT,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Desactivar RLS para acceso total (según requerimiento del usuario)
ALTER TABLE proveedores DISABLE ROW LEVEL SECURITY;

-- 3. Vincular con tabla de pedidos (si existe pedidos_proveedor)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pedidos_proveedor') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'pedidos_proveedor' AND column_name = 'proveedor_id') THEN
            ALTER TABLE pedidos_proveedor ADD COLUMN proveedor_id UUID REFERENCES proveedores(id);
        END IF;
    END IF;
END $$;

COMMENT ON TABLE proveedores IS 'Tabla para gestión de proveedores institucionales y vinculación con pedidos de inventario';
