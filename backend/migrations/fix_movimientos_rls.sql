-- DESACTIVAR RLS PARA PERMITIR REGISTRAR MOVIMIENTOS DESDE EL BACKEND
ALTER TABLE movimientos DISABLE ROW LEVEL SECURITY;

-- Asegurar que la tabla sea accesible (opcional si ya se desactivó RLS)
-- GRANT ALL ON TABLE movimientos TO service_role;
-- GRANT ALL ON TABLE movimientos TO anon;
-- GRANT ALL ON TABLE movimientos TO authenticated;
