-- CORREGIR RELACIÓN ENTRE SOLICITUDES Y PERFILES
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar si ya existe una restricción con el mismo nombre (limpieza)
ALTER TABLE solicitudes_papeleria DROP CONSTRAINT IF EXISTS fk_solicitudes_perfiles;

-- 2. Añadir la clave foránea explícita hacia la tabla perfiles
-- Esto es necesario para que PostgREST pueda hacer el JOIN automático
ALTER TABLE solicitudes_papeleria 
ADD CONSTRAINT fk_solicitudes_perfiles 
FOREIGN KEY (usuario_id) 
REFERENCES perfiles(id)
ON DELETE CASCADE;

-- 3. Recargar el esquema si es necesario (PostgREST lo hace automáticamente al detectar DDL)
NOTIFY pgrst, 'reload schema';
