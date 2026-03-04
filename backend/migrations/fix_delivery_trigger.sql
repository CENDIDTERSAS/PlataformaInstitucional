-- CORRECCIÓN DEL TRIGGER DE ENTREGA DE PAPELERÍA
-- Agrega robustez para manejar items que no sean arreglos (solicitudes antiguas)

CREATE OR REPLACE FUNCTION public.procesar_entrega_papeleria()
RETURNS trigger AS $$
DECLARE
  item_record RECORD;
  inventario_id UUID;
BEGIN
  -- Solo actuar cuando el estado cambia a 'Entregada'
  IF (NEW.estado = 'Entregada' AND (OLD.estado IS NULL OR OLD.estado != 'Entregada')) THEN
    
    -- VALIDACIÓN: Verificar si 'items' es realmente un arreglo JSON
    -- jsonb_typeof retorna 'array', 'object', 'string', etc.
    IF jsonb_typeof(NEW.items) = 'array' THEN
      
      -- Recorrer los items en el JSONB
      FOR item_record IN SELECT * FROM jsonb_to_recordset(NEW.items) AS x(nombre TEXT, cantidad INTEGER)
      LOOP
        -- Buscar el item en inventario por nombre y bodega Papelería
        SELECT id INTO inventario_id 
        FROM inventario 
        WHERE nombre = item_record.nombre 
        AND bodega_id = (SELECT id FROM bodegas WHERE nombre = 'Papelería' LIMIT 1);

        IF inventario_id IS NOT NULL THEN
          -- El stock ahora se maneja vía movimientos y cálculo dinámico en el front, 
          -- pero mantenemos el registro del movimiento aquí para consistencia
          
          -- Registrar el movimiento de salida
          INSERT INTO movimientos (item_id, bodega_id, tipo, cantidad, responsable, notas)
          VALUES (
            inventario_id, 
            (SELECT id FROM bodegas WHERE nombre = 'Papelería' LIMIT 1),
            'Salida',
            item_record.cantidad,
            'Sistema - Entrega Auto ' || (NEW.codigo),
            'Descuento automático por entrega (Trigger)'
          );
        END IF;
      END LOOP;
    ELSE
      -- Si no es un arreglo, es una solicitud antigua o con formato de texto.
      RAISE NOTICE 'La solicitud % no tiene un formato de items procesable para descuento automático.', NEW.id;
    END IF;
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
