const { supabase } = require('./db');

async function checkQuestions() {
    console.log('--- Checking all lessons ---');
    const { data: lecciones, error: lError } = await supabase.from('lecciones').select('id, titulo, tipo').eq('tipo', 'pre-test');
    if (lError) {
        console.error('Error fetching lessons:', lError);
        return;
    }
    console.log(`Found ${lecciones.length} pre-tests:`);
    console.table(lecciones);

    console.log('\n--- Checking all questions ---');
    const { data: preguntas, error: pError } = await supabase.from('preguntas_test').select('*');
    if (pError) {
        console.error('Error fetching questions:', pError);
        return;
    }
    console.log(`Found ${preguntas.length} questions in total:`);
    console.table(preguntas);
}

checkQuestions();
