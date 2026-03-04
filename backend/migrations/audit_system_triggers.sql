-- AMPLIAR TABLA DE AUDITORÍA
ALTER TABLE auditoria ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id);
ALTER TABLE auditoria ADD COLUMN IF NOT EXISTS responsable_nombre TEXT;

-- FUNCIÓN GENÉRICA DE AUDITORÍA
CREATE OR REPLACE FUNCTION public.fn_auditoria_cambios()
RETURNS trigger AS $$
DECLARE
    v_usuario_id UUID;
    v_responsable TEXT;
BEGIN
    -- Intentar obtener el ID del usuario desde la sesión de Supabase
    v_usuario_id := auth.uid();
    
    -- Intentar obtener el nombre del responsable si está disponible en el perfil
    IF v_usuario_id IS NOT NULL THEN
        SELECT (nombres || ' ' || apellidos) INTO v_responsable 
        FROM public.perfiles 
        WHERE id = v_usuario_id;
    END IF;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO auditoria (tabla, registro_id, accion, valor_nuevo, usuario_id, responsable_nombre)
        VALUES (TG_TABLE_NAME, (row_to_json(NEW)->>'id')::UUID, 'CREACIÓN', row_to_json(NEW)::JSONB, v_usuario_id, v_responsable);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria (tabla, registro_id, accion, valor_anterior, valor_nuevo, usuario_id, responsable_nombre)
        VALUES (TG_TABLE_NAME, (row_to_json(NEW)->>'id')::UUID, 'EDICIÓN', row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, v_usuario_id, v_responsable);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria (tabla, registro_id, accion, valor_anterior, usuario_id, responsable_nombre)
        VALUES (TG_TABLE_NAME, (row_to_json(OLD)->>'id')::UUID, 'ELIMINACIÓN', row_to_json(OLD)::JSONB, v_usuario_id, v_responsable);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- APLICAR TRIGGERS A TABLAS CLAVE
DO $$
BEGIN
    -- Trigger para Inventario
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_auditoria_inventario') THEN
        CREATE TRIGGER tr_auditoria_inventario
        AFTER INSERT OR UPDATE OR DELETE ON inventario
        FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_cambios();
    END IF;

    -- Trigger para Bodegas
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_auditoria_bodegas') THEN
        CREATE TRIGGER tr_auditoria_bodegas
        AFTER INSERT OR UPDATE OR DELETE ON bodegas
        FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_cambios();
    END IF;

    -- Trigger para Movimientos
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_auditoria_movimientos') THEN
        CREATE TRIGGER tr_auditoria_movimientos
        AFTER INSERT OR UPDATE OR DELETE ON movimientos
        FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_cambios();
    END IF;
END $$;
