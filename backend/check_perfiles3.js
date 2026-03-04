const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPerfiles() {
    const { data: perfiles, error } = await supabaseAdmin.from('perfiles').select('*').limit(1);
    if (perfiles && perfiles.length > 0) {
        console.log("Columns:", Object.keys(perfiles[0]));
    } else {
        console.log("No perfiles found or error:", error);
    }
}
checkPerfiles();
