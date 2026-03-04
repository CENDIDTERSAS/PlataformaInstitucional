const { supabase } = require('./db');

async function checkLessonData() {
    const leccionId = '52f85bba-e6a6-4313-a505-6382a2740457';
    console.log(`--- Checking Lesson: ${leccionId} ---`);

    const { data: leccion, error: lError } = await supabase.from('lecciones').select('*').eq('id', leccionId).single();
    if (lError) console.error('Error leccion:', lError.message);
    else console.log('Leccion Type:', leccion.tipo);

    const { data: preguntas, error: pError } = await supabase.from('preguntas_test').select('*').eq('leccion_id', leccionId);
    if (pError) console.error('Error preguntas:', pError.message);
    else {
        console.log(`Found ${preguntas.length} preguntas.`);
        console.table(preguntas.map(p => ({ id: p.id, pregunta: p.pregunta, tipo: p.tipo_pregunta, resp: p.respuesta_correcta })));
    }
}

checkLessonData();
