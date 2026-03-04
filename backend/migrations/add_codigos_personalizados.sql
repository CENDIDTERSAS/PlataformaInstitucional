-- Migración: Agregar códigos personalizados a las tablas
-- Fecha: 2026-02-14
-- Descripción: Agregar campos 'codigo' únicos y auto-incrementales a las tablas principales

-- 1. AGREGAR COLUMNAS CODIGO
ALTER TABLE solicitudes_papeleria 
ADD COLUMN IF NOT EXISTS codigo VARCHAR(20) UNIQUE;

ALTER TABLE inventario 
ADD COLUMN IF NOT EXISTS codigo VARCHAR(20) UNIQUE;

ALTER TABLE perfiles 
ADD COLUMN IF NOT EXISTS codigo VARCHAR(20) UNIQUE;

ALTER TABLE bodegas 
ADD COLUMN IF NOT EXISTS codigo VARCHAR(20) UNIQUE;

-- 2. CREAR SECUENCIAS
CREATE SEQUENCE IF NOT EXISTS seq_solicitudes_papeleria START 1;
CREATE SEQUENCE IF NOT EXISTS seq_inventario START 1;
CREATE SEQUENCE IF NOT EXISTS seq_usuarios START 1;
CREATE SEQUENCE IF NOT EXISTS seq_bodegas START 1;

-- 3. FUNCIONES DE GENERACIÓN DE CÓDIGOS

-- Función para Solicitudes de Papelería
CREATE OR REPLACE FUNCTION generar_codigo_papeleria()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NULL THEN
    NEW.codigo := 'SOL-PAP-' || LPAD(nextval('seq_solicitudes_papeleria')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para Inventario
CREATE OR REPLACE FUNCTION generar_codigo_inventario()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NULL THEN
    NEW.codigo := 'PROD-' || LPAD(nextval('seq_inventario')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para Usuarios
CREATE OR REPLACE FUNCTION generar_codigo_usuario()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NULL THEN
    NEW.codigo := 'USR-' || LPAD(nextval('seq_usuarios')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para Bodegas
CREATE OR REPLACE FUNCTION generar_codigo_bodega()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NULL THEN
    NEW.codigo := 'BOD-' || LPAD(nextval('seq_bodegas')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREAR TRIGGERS

-- Trigger para Solicitudes de Papelería
DROP TRIGGER IF EXISTS trigger_generar_codigo_papeleria ON solicitudes_papeleria;
CREATE TRIGGER trigger_generar_codigo_papeleria
  BEFORE INSERT ON solicitudes_papeleria
  FOR EACH ROW
  EXECUTE FUNCTION generar_codigo_papeleria();

-- Trigger para Inventario
DROP TRIGGER IF EXISTS trigger_generar_codigo_inventario ON inventario;
CREATE TRIGGER trigger_generar_codigo_inventario
  BEFORE INSERT ON inventario
  FOR EACH ROW
  EXECUTE FUNCTION generar_codigo_inventario();

-- Trigger para Usuarios (Perfiles)
DROP TRIGGER IF EXISTS trigger_generar_codigo_usuario ON perfiles;
CREATE TRIGGER trigger_generar_codigo_usuario
  BEFORE INSERT ON perfiles
  FOR EACH ROW
  EXECUTE FUNCTION generar_codigo_usuario();

-- Trigger para Bodegas
DROP TRIGGER IF EXISTS trigger_generar_codigo_bodega ON bodegas;
CREATE TRIGGER trigger_generar_codigo_bodega
  BEFORE INSERT ON bodegas
  FOR EACH ROW
  EXECUTE FUNCTION generar_codigo_bodega();

-- 5. GENERAR CÓDIGOS PARA REGISTROS EXISTENTES

-- Solicitudes de Papelería
DO $$
DECLARE
  rec RECORD;
  contador INT := 1;
BEGIN
  FOR rec IN SELECT id FROM solicitudes_papeleria WHERE codigo IS NULL ORDER BY creado_at
  LOOP
    UPDATE solicitudes_papeleria 
    SET codigo = 'SOL-PAP-' || LPAD(contador::TEXT, 4, '0')
    WHERE id = rec.id;
    contador := contador + 1;
  END LOOP;
  -- Ajustar secuencia
  PERFORM setval('seq_solicitudes_papeleria', contador);
END $$;

-- Inventario
DO $$
DECLARE
  rec RECORD;
  contador INT := 1;
BEGIN
  FOR rec IN SELECT id FROM inventario WHERE codigo IS NULL ORDER BY creado_at
  LOOP
    UPDATE inventario 
    SET codigo = 'PROD-' || LPAD(contador::TEXT, 4, '0')
    WHERE id = rec.id;
    contador := contador + 1;
  END LOOP;
  -- Ajustar secuencia
  PERFORM setval('seq_inventario', contador);
END $$;

-- Usuarios (Perfiles)
DO $$
DECLARE
  rec RECORD;
  contador INT := 1;
BEGIN
  FOR rec IN SELECT id FROM perfiles WHERE codigo IS NULL ORDER BY creado_at
  LOOP
    UPDATE perfiles 
    SET codigo = 'USR-' || LPAD(contador::TEXT, 4, '0')
    WHERE id = rec.id;
    contador := contador + 1;
  END LOOP;
  -- Ajustar secuencia
  PERFORM setval('seq_usuarios', contador);
END $$;

-- Bodegas
DO $$
DECLARE
  rec RECORD;
  contador INT := 1;
BEGIN
  FOR rec IN SELECT id FROM bodegas WHERE codigo IS NULL ORDER BY creado_at
  LOOP
    UPDATE bodegas 
    SET codigo = 'BOD-' || LPAD(contador::TEXT, 4, '0')
    WHERE id = rec.id;
    contador := contador + 1;
  END LOOP;
  -- Ajustar secuencia
  PERFORM setval('seq_bodegas', contador);
END $$;

-- VERIFICACIÓN
-- SELECT codigo, nombre FROM solicitudes_papeleria ORDER BY codigo;
-- SELECT codigo, nombre FROM inventario ORDER BY codigo;
-- SELECT codigo, nombres, apellidos FROM perfiles ORDER BY codigo;
-- SELECT codigo, nombre FROM bodegas ORDER BY codigo;
