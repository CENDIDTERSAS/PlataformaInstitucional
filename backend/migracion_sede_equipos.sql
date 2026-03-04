-- Migración para añadir el campo SEDE a equipos biomédicos
ALTER TABLE equipos_biomedicos 
ADD COLUMN IF NOT EXISTS sede TEXT;

-- Comentario para documentar las opciones sugeridas:
-- Sede 1, Sede 2, Sede 3, Sede Armenia, Quimbaya
