-- Añadir campos de ubicación a la tabla de proveedores
ALTER TABLE proveedores 
ADD COLUMN IF NOT EXISTS departamento TEXT,
ADD COLUMN IF NOT EXISTS ciudad TEXT;

-- Comentarios descriptivos
COMMENT ON COLUMN proveedores.departamento IS 'Departamento de ubicación del proveedor';
COMMENT ON COLUMN proveedores.ciudad IS 'Ciudad de ubicación del proveedor';
