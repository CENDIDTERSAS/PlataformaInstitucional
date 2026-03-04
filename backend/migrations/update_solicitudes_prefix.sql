-- AJUSTAR PREFIJO DE CÓDIGOS PARA SOLICITUDES DE PAPELERÍA
-- Ejecutar en el SQL Editor de Supabase

-- 1. Actualizar la función generadora con el nuevo prefijo 'SOL-PAPE-'
CREATE OR REPLACE FUNCTION generar_codigo_papeleria()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NULL THEN
    NEW.codigo := 'SOL-PAPE-' || LPAD(nextval('seq_solicitudes_papeleria')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Actualizar registros existentes con el nuevo prefijo
UPDATE solicitudes_papeleria 
SET codigo = REPLACE(codigo, 'SOL-PAP-', 'SOL-PAPE-')
WHERE codigo LIKE 'SOL-PAP-%';

-- 3. Si hay registros sin código (UUIDs), generarles uno
DO $$
DECLARE
  rec RECORD;
  contador INT;
BEGIN
  -- Obtener el valor actual de la secuencia para continuar desde ahí
  SELECT last_value INTO contador FROM seq_solicitudes_papeleria;
  
  FOR rec IN SELECT id FROM solicitudes_papeleria WHERE codigo IS NULL OR codigo NOT LIKE 'SOL-PAPE-%' ORDER BY creado_at
  LOOP
    IF rec.id IS NOT NULL THEN
      UPDATE solicitudes_papeleria 
      SET codigo = 'SOL-PAPE-' || LPAD(contador::TEXT, 4, '0')
      WHERE id = rec.id;
      contador := contador + 1;
    END IF;
  END LOOP;
  
  -- Ajustar la secuencia al nuevo valor
  PERFORM setval('seq_solicitudes_papeleria', contador);
END $$;
