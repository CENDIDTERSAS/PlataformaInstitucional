-- TABLA PARA RASTREO DE OFICIOS / PEDIDOS A PROVEEDOR
CREATE TABLE IF NOT EXISTS pedidos_proveedor (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    items JSONB NOT NULL,
    usuario_id UUID REFERENCES auth.users(id),
    estado TEXT DEFAULT 'Generado', -- 'Generado', 'Recibido Parcial', 'Recibido Total'
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en pedidos_proveedor
ALTER TABLE pedidos_proveedor ENABLE ROW LEVEL SECURITY;

-- Políticas para pedidos_proveedor
CREATE POLICY "Public Read Pedidos" ON pedidos_proveedor FOR SELECT USING (true);
CREATE POLICY "Auth Write Pedidos" ON pedidos_proveedor FOR ALL USING (auth.role() = 'authenticated');

-- AGREGAR COLUMNAS DE COSTOS A MOVIMIENTOS
ALTER TABLE movimientos ADD COLUMN IF NOT EXISTS pedido_id UUID REFERENCES pedidos_proveedor(id);
ALTER TABLE movimientos ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE movimientos ADD COLUMN IF NOT EXISTS iva_porcentaje DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE movimientos ADD COLUMN IF NOT EXISTS valor_total DECIMAL(12, 2) DEFAULT 0;
