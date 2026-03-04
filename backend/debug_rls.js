const { supabase } = require('./db');

async function debugRLS() {
    const courseId = '3d72e69d-22e5-4dd9-8498-4f81d26fe308';

    // We can't easily get the user's JWT from here unless we sign in
    // But we can check the table structure and current policies again
    console.log('--- System Check ---');
    const { data: policies, error: pError } = await supabase.rpc('get_policies_for_table', { table_name: 'preguntas_test' });
    if (pError) {
        console.log('RPC get_policies_for_table not found, or access denied.');
    }

    // Let's try to see if we can at least find the lesson IDs that DO exist
    const { data: allLecciones, error: allLError } = await supabase.from('lecciones').select('id, titulo, curso_id');
    console.log(`Lessons visible to anon: ${allLecciones?.length || 0}`);
}

debugRLS();
