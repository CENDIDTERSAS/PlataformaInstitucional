-- AÑADIR CAMPO PARA RASTREAR LECTURA DE NOTIFICACIONES
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS ultimo_visto_notif TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Opcional: inicializar para usuarios actuales
UPDATE perfiles SET ultimo_visto_notif = now() WHERE ultimo_visto_notif IS NULL;
