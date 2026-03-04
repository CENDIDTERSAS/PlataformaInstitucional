-- AGREGAR COLUMNA DE PROVEEDOR A MOVIMIENTOS
ALTER TABLE movimientos ADD COLUMN IF NOT EXISTS proveedor_id UUID REFERENCES proveedores(id);

-- Comentario informativo
COMMENT ON COLUMN movimientos.proveedor_id IS 'ID del proveedor asociado a la entrada de mercancía';
