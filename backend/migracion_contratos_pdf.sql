-- Migración: Añadir campo de PDF al contrato biomédico
ALTER TABLE public.contratos_biomedicos
ADD COLUMN IF NOT EXISTS documento_url TEXT;
