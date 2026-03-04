const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkRLSData() {
    console.log('--- RLS DIAGNOSTIC ---');

    // 1. Ver inscripciones
    const { data: inscs, error: iErr } = await supabase
        .from('inscripciones')
        .select('*');

    if (iErr) {
        console.error('Error fetching inscripciones:', iErr);
    } else {
        console.log(`Found ${inscs.length} inscriptions.`);
        inscs.forEach(i => {
            console.log(`- ID: ${i.id}, Curso: ${i.curso_id}, Perfil: ${i.perfil_id}, Score: ${i.calificacion_pre}`);
        });
    }

    // 2. Ver perfiles
    const { data: perfiles, error: pErr } = await supabase
        .from('perfiles')
        .select('id, email, nombres');

    if (pErr) console.error('Error fetching perfiles:', pErr);
    else {
        console.log(`Found ${perfiles.length} perfiles.`);
        perfiles.forEach(p => {
            console.log(`- ID: ${p.id}, email: ${p.email}`);
        });
    }
}

checkRLSData();
