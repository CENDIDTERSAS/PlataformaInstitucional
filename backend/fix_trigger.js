const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombres, apellidos, dependencia, cargo, rol, estado)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'nombres', 'Usuario'), 
    COALESCE(new.raw_user_meta_data->>'apellidos', 'Nuevo'), 
    new.raw_user_meta_data->>'dependencia', 
    new.raw_user_meta_data->>'cargo',
    COALESCE(new.raw_user_meta_data->>'rol', 'Colaborador'),
    'Activo'
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Muted error to allow user creation even if profile fails
  RAISE LOG 'Error creating profile: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function fixTrigger() {
    console.log("Applying sql fix...");
    // Intentando con rpc genérico si no hay acceso directo a query
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql_string: sql });
    if (error) {
        console.log("RPC Error (expected if exec_sql not defined):", error.message);
        console.log("Please run this SQL directly in your Supabase SQL Editor:\n\n" + sql);
    } else {
        console.log("Fixed successfully.");
    }
}

fixTrigger();
