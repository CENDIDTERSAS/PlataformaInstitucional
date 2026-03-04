-- ============================================================
-- SCRIPT DE MIGRACIÓN UNIFICADA - ProyectoWebInstitucional
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Asegurar que las columnas financieras y de destinatarios existan en 'movimientos'
ALTER TABLE public.movimientos 
ADD COLUMN IF NOT EXISTS proveedor_id UUID REFERENCES public.proveedores(id),
ADD COLUMN IF NOT EXISTS pedido_id UUID REFERENCES public.pedidos_proveedor(id),
ADD COLUMN IF NOT EXISTS destinatario_id UUID REFERENCES public.perfiles(id),
ADD COLUMN IF NOT EXISTS valor_unitario DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS iva_porcentaje DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_total DECIMAL(12, 2) DEFAULT 0;

-- 2. Asegurar que la tabla 'inventario' tenga la columna stock (necesaria para el trigger original)
ALTER TABLE public.inventario 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- 3. Deshabilitar RLS para el backend (Acceso Directo)
ALTER TABLE public.bodegas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_papeleria DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos_proveedor DISABLE ROW LEVEL SECURITY;

-- 4. TRIGGER UNIFICADO: Entrega de papelería con destinatario automático
-- Este trigger se encarga de:
-- a) Buscar el producto en la bodega 'Papelería'.
-- b) Descontar el stock de la tabla 'inventario'.
-- c) Registrar el movimiento de 'Salida' con el destinatario correcto.

CREATE OR REPLACE FUNCTION public.procesar_entrega_papeleria()
RETURNS trigger AS $$
DECLARE
  item_record RECORD;
  inventario_id UUID;
  v_bodega_id UUID;
BEGIN
  -- Solo actuar cuando el estado cambia a 'Entregada'
  IF (NEW.estado = 'Entregada' AND (OLD.estado IS NULL OR OLD.estado != 'Entregada')) THEN
    
    -- Obtener el ID de la bodega de Papelería una sola vez
    SELECT id INTO v_bodega_id FROM public.bodegas WHERE nombre = 'Papelería' LIMIT 1;

    IF v_bodega_id IS NULL THEN
      RAISE EXCEPTION 'Bodega "Papelería" no encontrada.';
    END IF;

    -- Recorrer los items en el JSONB
    IF jsonb_typeof(NEW.items) = 'array' THEN
      FOR item_record IN SELECT * FROM jsonb_to_recordset(NEW.items) AS x(nombre TEXT, cantidad INTEGER)
      LOOP
        -- Buscar el item en inventario por nombre y bodega Papelería
        SELECT id INTO inventario_id 
        FROM public.inventario 
        WHERE nombre = item_record.nombre 
        AND bodega_id = v_bodega_id;

        IF inventario_id IS NOT NULL THEN
          -- 1. Descontar del inventario (si la tabla tiene stock)
          UPDATE public.inventario 
          SET stock = stock - item_record.cantidad,
              actualizado_at = now()
          WHERE id = inventario_id;

          -- 2. Registrar el movimiento de salida
          INSERT INTO public.movimientos (
            item_id, 
            bodega_id, 
            tipo, 
            cantidad, 
            responsable, 
            notas, 
            destinatario_id,
            valor_unitario,
            subtotal,
            iva_porcentaje,
            valor_total
          )
          VALUES (
            inventario_id, 
            v_bodega_id,
            'Salida',
            item_record.cantidad,
            'Sistema AUTO (Ref: ' || COALESCE(NEW.id::text, 'N/A') || ')',
            'Despacho automático por entrega de papelería - Solicitud #' || COALESCE(NEW.id::text, ''),
            NEW.usuario_id,
            0, 0, 0, 0
          );
        ELSE
          RAISE NOTICE 'Producto "%" no encontrado en la bodega de Papelería.', item_record.nombre;
        END IF;
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar triggers antiguos para evitar duplicidad
DROP TRIGGER IF EXISTS tr_procesar_entrega_papeleria ON public.solicitudes_papeleria;
DROP TRIGGER IF EXISTS on_papeleria_entregada ON public.solicitudes_papeleria;

-- Crear el nuevo trigger unificado
CREATE TRIGGER tr_procesar_entrega_papeleria_unificado
  AFTER UPDATE ON public.solicitudes_papeleria
  FOR EACH ROW
  EXECUTE FUNCTION public.procesar_entrega_papeleria();
