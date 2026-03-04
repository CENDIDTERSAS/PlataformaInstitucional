const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFetch() {
    try {
        const { data: inscDb, error: errDb } = await supabaseAdmin
            .from('inscripciones')
            .select('*, perfiles!perfil_id(nombres, apellidos, email, identificacion)')
            .limit(2);

        console.log("Inscripciones con join a perfiles:");
        console.log(JSON.stringify(inscDb, null, 2));
        if (errDb) console.error("Error join perfiles:", errDb);

    } catch (e) {
        console.error(e);
    }
}
testFetch();
