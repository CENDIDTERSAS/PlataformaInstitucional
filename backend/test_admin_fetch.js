const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFetch() {
    try {
        const { data, error } = await supabaseAdmin
            .from('inscripciones')
            .select(`
                id,
                perfil_id,
                curso_id,
                estado,
                progreso,
                calificacion_pre,
                calificacion_post,
                aciertos_pre,
                total_pre,
                aciertos_post,
                total_post,
                fecha_inscripcion,
                fecha_finalizacion,
                perfil:perfil_id (
                    nombres,
                    apellidos,
                    identificacion
                )
            `)
            .limit(5);

        console.log("Inscripciones (ADMIN):", JSON.stringify(data, null, 2));
        if (error) console.error("Error:", error);
    } catch (e) {
        console.error(e);
    }
}
testFetch();
