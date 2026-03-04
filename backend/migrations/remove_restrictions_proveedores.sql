-- Desactivar Row Level Security (RLS) para permitir acceso total a la tabla proveedores
-- Nota: Esto hace que la tabla sea accesible según los permisos del rol, sin filtros adicionales de fila.

ALTER TABLE proveedores DISABLE ROW LEVEL SECURITY;

-- En caso de que prefieras mantener RLS pero otorgar todos los permisos a usuarios autenticados,
-- puedes usar este bloque alternativo (descomentar si es necesario):
/*
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo a usuarios autenticados" 
ON proveedores 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
*/

COMMENT ON TABLE proveedores IS 'Tabla de proveedores con restricciones de RLS desactivadas por solicitud del usuario';
