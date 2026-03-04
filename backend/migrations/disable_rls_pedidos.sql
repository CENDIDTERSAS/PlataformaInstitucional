-- SCRIPT PARA DESACTIVAR RLS EN PEDIDOS_PROVEEDOR
-- Esto permite que el backend (usando anon_key) pueda insertar registros sin fallar por políticas de seguridad.

-- 1. Desactivar RLS
ALTER TABLE pedidos_proveedor DISABLE ROW LEVEL SECURITY;

-- 2. Asegurar que la columna proveedor_id existe (necesaria para la vinculación)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'pedidos_proveedor' AND column_name = 'proveedor_id') THEN
        ALTER TABLE pedidos_proveedor ADD COLUMN proveedor_id UUID REFERENCES proveedores(id);
    END IF;
END $$;

COMMENT ON TABLE pedidos_proveedor IS 'Tabla para gestión de solicitudes de papelería con RLS desactivado para facilitar persistencia desde backend';
