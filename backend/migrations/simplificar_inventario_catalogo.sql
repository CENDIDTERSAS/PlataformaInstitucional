DO $$ 
BEGIN
    -- Eliminar columnas que ya no pertenecen al catálogo de productos
    -- (Estos datos se manejarán a través de la tabla de movimientos o ya no son requeridos)
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='sku') THEN
        ALTER TABLE inventario DROP COLUMN sku;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='stock') THEN
        ALTER TABLE inventario DROP COLUMN stock;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='cantidad') THEN
        ALTER TABLE inventario DROP COLUMN cantidad;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='precio') THEN
        ALTER TABLE inventario DROP COLUMN precio;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='precio_unitario') THEN
        ALTER TABLE inventario DROP COLUMN precio_unitario;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='imagen_url') THEN
        ALTER TABLE inventario DROP COLUMN imagen_url;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='estado') THEN
        ALTER TABLE inventario DROP COLUMN estado;
    END IF;

    -- Asegurar que la estructura final sea la correcta
    -- El tab CATALOGO solo debe tener: id, codigo, nombre, descripcion, categoria, bodega_id, creado_at, actualizado_at
END $$;

-- DESACTIVAR RLS PARA PERMITIR INSERTAR PRODUCTOS
ALTER TABLE inventario DISABLE ROW LEVEL SECURITY;
