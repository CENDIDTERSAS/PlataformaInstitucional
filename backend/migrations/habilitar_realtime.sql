-- HABILITAR REALTIME PARA LAS TABLAS DE INVENTARIO
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Asegurar que las tablas estén en la publicación de realtime
BEGIN;
  -- Eliminar si ya existen para evitar duplicados
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS inventario, bodegas, movimientos;
  
  -- Agregar las tablas a la publicación
  ALTER PUBLICATION supabase_realtime ADD TABLE inventario;
  ALTER PUBLICATION supabase_realtime ADD TABLE bodegas;
  ALTER PUBLICATION supabase_realtime ADD TABLE movimientos;
COMMIT;
