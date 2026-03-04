-- Migración de corrección: Cambiar prefijos de códigos
-- Cambiar INV- a PROD- para productos
-- BOD- ya está correcto para bodegas

-- 1. Actualizar la función de generación de códigos de inventario
CREATE OR REPLACE FUNCTION generar_codigo_inventario()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NULL THEN
    NEW.codigo := 'PROD-' || LPAD(nextval('seq_inventario')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Actualizar códigos existentes en inventario
-- Primero, convertir los códigos INV- a PROD-
UPDATE inventario 
SET codigo = REPLACE(codigo, 'INV-', 'PROD-')
WHERE codigo LIKE 'INV-%';

-- Nota: BOD- ya es correcto para bodegas, no requiere cambios
