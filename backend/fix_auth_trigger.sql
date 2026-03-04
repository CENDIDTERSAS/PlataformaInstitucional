-- Esta función reemplazará la existente y capturará de forma segura cualquier error de inserción, permitiendo que el usuario pueda crearse sin fallar.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombres, apellidos, dependencia, cargo, rol, estado)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'nombres', 'Usuario'), 
    COALESCE(new.raw_user_meta_data->>'apellidos', 'Prueba'), 
    new.raw_user_meta_data->>'dependencia', 
    new.raw_user_meta_data->>'cargo',
    COALESCE(new.raw_user_meta_data->>'rol', 'Colaborador'),
    'Activo'
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Imprime el error silenciosamente permitiendo continuar la creación en Auth
  RAISE LOG 'Error creating profile: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
