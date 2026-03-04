-- Migración: Añadir estados y vinculación a mantenimientos en repuestos_equipos
ALTER TABLE public.repuestos_equipos
ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Cotizado' CHECK (estado IN ('Cotizado', 'Autorizado', 'Instalado')),
ADD COLUMN IF NOT EXISTS mantenimiento_id UUID REFERENCES public.mantenimientos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS proveedor TEXT,
ADD COLUMN IF NOT EXISTS numero_cotizacion TEXT,
ADD COLUMN IF NOT EXISTS fecha_cotizacion DATE,
ADD COLUMN IF NOT EXISTS fecha_autorizacion DATE,
ADD COLUMN IF NOT EXISTS autorizado_por TEXT,
ADD COLUMN IF NOT EXISTS observaciones TEXT;
