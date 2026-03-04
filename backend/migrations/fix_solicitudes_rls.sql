-- DESACTIVAR RLS PARA PERMITIR REGISTRAR SOLICITUDES DESDE EL BACKEND
ALTER TABLE solicitudes_papeleria DISABLE ROW LEVEL SECURITY;

-- Asegurar que la tabla sea accesible para todos los roles si es necesario
-- GRANT ALL ON TABLE solicitudes_papeleria TO service_role;
-- GRANT ALL ON TABLE solicitudes_papeleria TO authenticated;
-- GRANT ALL ON TABLE solicitudes_papeleria TO anon;
