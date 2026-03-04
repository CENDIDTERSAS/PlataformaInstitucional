-- SISTEMA DE NOTIFICACIONES Y AUDITORÍA
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo TEXT NOT NULL, -- 'S_PAPELERIA', 'C_PRODUCTO', 'M_INVENTARIO', 'LOGIN', 'S_SISTEMA'
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    dependencia_destino TEXT, -- 'Sistemas' para papelería
    solo_admin BOOLEAN DEFAULT FALSE,
    usuario_id UUID REFERENCES auth.users(id),
    datos JSONB, -- ID del registro relacionado u otra info
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notificaciones;

-- 3. Función para notificar nueva solicitud de papelería
CREATE OR REPLACE FUNCTION public.notificar_solicitud_papeleria()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notificaciones (tipo, titulo, mensaje, dependencia_destino, datos, usuario_id)
  VALUES (
    'S_PAPELERIA',
    'Nueva Solicitud de Papelería',
    'Se ha generado una nueva solicitud. Revisa el inventario para procesar la entrega.',
    'Sistemas',
    jsonb_build_object('solicitud_id', NEW.id),
    NEW.usuario_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_notificar_solicitud_papeleria
  AFTER INSERT ON solicitudes_papeleria
  FOR EACH ROW EXECUTE FUNCTION public.notificar_solicitud_papeleria();

-- 4. Función para notificar creación de producto (solo admin)
CREATE OR REPLACE FUNCTION public.notificar_nuevo_producto()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notificaciones (tipo, titulo, mensaje, solo_admin, datos)
  VALUES (
    'C_PRODUCTO',
    'Nuevo Producto Creado',
    'Se ha agregado el producto: ' || NEW.nombre || ' (Código: ' || NEW.codigo || ')',
    TRUE,
    jsonb_build_object('producto_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_notificar_nuevo_producto
  AFTER INSERT ON inventario
  FOR EACH ROW EXECUTE FUNCTION public.notificar_nuevo_producto();

-- 5. Función para notificar movimiento de inventario (solo admin)
CREATE OR REPLACE FUNCTION public.notificar_movimiento_inventario()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notificaciones (tipo, titulo, mensaje, solo_admin, datos)
  VALUES (
    'M_INVENTARIO',
    'Nuevo Movimiento Registrado',
    'Se registró un(a) ' || NEW.tipo || ' de ' || NEW.cantidad || ' unidades.',
    TRUE,
    jsonb_build_object('movimiento_id', NEW.id, 'item_id', NEW.item_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_notificar_movimiento_inventario
  AFTER INSERT ON movimientos
  FOR EACH ROW EXECUTE FUNCTION public.notificar_movimiento_inventario();
