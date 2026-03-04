-- Crear tabla de bodegas (Optimizado según tabla original)
CREATE TABLE IF NOT EXISTS bodegas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    ubicacion TEXT,
    estado TEXT DEFAULT 'Activa', -- 'Activa', 'Inactiva', 'Mantenimiento'
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de inventario (Optimizado con descripción y relación a bodega)
CREATE TABLE IF NOT EXISTS inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE, -- PROD-0001
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT DEFAULT 'General',
    bodega_id UUID REFERENCES bodegas(id),
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
 pocket

-- Crear tabla de movimientos
CREATE TABLE IF NOT EXISTS movimientos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES inventario(id),
    bodega_id UUID REFERENCES bodegas(id),
    tipo TEXT NOT NULL, -- 'Entrada', 'Salida', 'Transferencia'
    cantidad INTEGER NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    responsable TEXT,
    notas TEXT
);

-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tabla TEXT NOT NULL,
    registro_id UUID NOT NULL,
    accion TEXT NOT NULL,
    valor_anterior JSONB,
    valor_nuevo JSONB,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en todas las tablas
ALTER TABLE bodegas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Public Read Bodegas" ON bodegas FOR SELECT USING (true);
CREATE POLICY "Public Read Inventario" ON inventario FOR SELECT USING (true);
CREATE POLICY "Public Read Movimientos" ON movimientos FOR SELECT USING (true);
CREATE POLICY "Public Read Auditoria" ON auditoria FOR SELECT USING (true);

-- Políticas de actualización (requiere autenticación)
CREATE POLICY "Auth Write All" ON inventario FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Bodegas" ON bodegas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Movimientos" ON movimientos FOR ALL USING (auth.role() = 'authenticated');

-- Tabla para Solicitudes de Papelería
CREATE TABLE IF NOT EXISTS solicitudes_papeleria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id),
    items JSONB NOT NULL, -- [{nombre: 'Esfero', cantidad: 5}, ...]
    estado TEXT DEFAULT 'Pendiente', -- 'Pendiente', 'Aprobada', 'Entregada', 'Rechazada'
    motivo TEXT,
    prioridad TEXT DEFAULT 'Normal', -- 'Normal', 'Alta', 'Urgente'
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE solicitudes_papeleria ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view own requests" ON solicitudes_papeleria FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can insert own requests" ON solicitudes_papeleria FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Admins can view all requests" ON solicitudes_papeleria FOR SELECT USING (true); -- Placeholder for admin role

-- Tabla para Perfiles de Usuario
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    codigo VARCHAR(20) UNIQUE,
    nombres TEXT,
    apellidos TEXT,
    identificacion TEXT, -- Cédula, DNI, Pasaporte, etc.
    contacto TEXT, -- Teléfono o email de contacto
    dependencia TEXT, -- 'Ventas', 'IT', 'Administrativo', 'Operaciones', etc.
    cargo TEXT, -- 'Gerente', 'Analista', 'Asistente', etc.
    rol TEXT DEFAULT 'Colaborador', -- 'Administrador', 'Supervisor', 'Colaborador'
    estado TEXT DEFAULT 'Activo', -- 'Activo', 'Inactivo'
    foto_url TEXT, -- URL de la foto de perfil almacenada en Supabase Storage
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en perfiles
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Public profiles are viewable by authenticated users" ON perfiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can edit own profile" ON perfiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON perfiles FOR ALL USING (true); -- Placeholder for admin role

-- Función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombres, apellidos, dependencia, cargo, rol)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'nombres', 
    new.raw_user_meta_data->>'apellidos', 
    new.raw_user_meta_data->>'dependencia', 
    new.raw_user_meta_data->>'cargo',
    'Colaborador'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil al registrarse
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para descontar stock y registrar movimiento automáticamente
CREATE OR REPLACE FUNCTION public.procesar_entrega_papeleria()
RETURNS trigger AS $$
DECLARE
  item_record RECORD;
  inventario_id UUID;
BEGIN
  -- Solo actuar cuando el estado cambia a 'Entregada'
  IF (NEW.estado = 'Entregada' AND OLD.estado != 'Entregada') THEN
    -- Recorrer los items en el JSONB
    FOR item_record IN SELECT * FROM jsonb_to_recordset(NEW.items) AS x(nombre TEXT, cantidad INTEGER)
    LOOP
      -- Buscar el item en inventario por nombre y bodega Papelería
      SELECT id INTO inventario_id 
      FROM inventario 
      WHERE nombre = item_record.nombre 
      AND bodega_id = (SELECT id FROM bodegas WHERE nombre = 'Papelería' LIMIT 1);

      IF inventario_id IS NOT NULL THEN
        -- Descontar del inventario
        UPDATE inventario 
        SET stock = stock - item_record.cantidad,
            actualizado_at = now()
        WHERE id = inventario_id;

        -- Registrar el movimiento de salida
        INSERT INTO movimientos (item_id, bodega_id, tipo, cantidad, responsable, notas)
        VALUES (
          inventario_id, 
          (SELECT id FROM bodegas WHERE nombre = 'Papelería' LIMIT 1),
          'Salida',
          item_record.cantidad,
          'Sistema - Entrega Solicitud ' || NEW.id,
          'Descuento automático por entrega de papelería'
        );
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para procesar entrega
DROP TRIGGER IF EXISTS tr_procesar_entrega_papeleria ON solicitudes_papeleria;
CREATE TRIGGER tr_procesar_entrega_papeleria
  AFTER UPDATE ON solicitudes_papeleria
  FOR EACH ROW
  EXECUTE FUNCTION public.procesar_entrega_papeleria();

-- Insertar bodega obligatoria de Papelería
INSERT INTO bodegas (nombre, ubicacion, estado)
VALUES ('Papelería', 'Oficina Central - Nivel 1', 'Activa')
ON CONFLICT DO NOTHING;

-- Seed Data: Productos iniciales de Papelería
DO $$
DECLARE
    bodega_pap_id UUID;
BEGIN
    SELECT id INTO bodega_pap_id FROM bodegas WHERE nombre = 'Papelería' LIMIT 1;

    INSERT INTO inventario (nombre, descripcion, sku, categoria, stock, precio, estado, bodega_id)
    VALUES 
    ('Resma Papel Carta', 'Papel bond blanco 75g', 'PAP-001', 'Papelería', 50, 15000, 'In Stock', bodega_pap_id),
    ('Esfero Azul Kilométrico', 'Bolígrafo tinta seca azul', 'ESF-001', 'Papelería', 100, 800, 'In Stock', bodega_pap_id),
    ('Toner Impresora HP', 'Cartucho de toner negro compatible', 'TNR-001', 'Suministros', 5, 120000, 'In Stock', bodega_pap_id),
    ('Clips (Caja)', 'Caja de clips metálicos estándar', 'CLP-001', 'Papelería', 20, 2500, 'In Stock', bodega_pap_id)
    ON CONFLICT (sku) DO NOTHING;
END $$;
