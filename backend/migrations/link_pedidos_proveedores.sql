-- Vincular pedidos con proveedores
ALTER TABLE pedidos_proveedor 
ADD COLUMN IF NOT EXISTS proveedor_id UUID REFERENCES proveedores(id);

-- Comentario descriptivo
COMMENT ON COLUMN pedidos_proveedor.proveedor_id IS 'ID del proveedor al que va dirigido el pedido';
