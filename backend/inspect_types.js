const { supabase } = require('./db');

async function inspectData() {
    const leccionId = '52f85bba-e6a6-4313-a505-6382a2740457'; // La lección de prueba del usuario
    console.log(`--- Inspecting Data for Lesson: ${leccionId} ---`);

    const { data: preguntas, error } = await supabase
        .from('preguntas_test')
        .select('*')
        .eq('leccion_id', leccionId);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (preguntas.length === 0) {
        console.log('No questions found for this lesson.');
        // Intentar buscar la última lección creada
        const { data: lastL } = await supabase.from('lecciones').select('id, titulo').order('creado_at', { ascending: false }).limit(5);
        console.log('Last 5 lessons:', lastL);
        return;
    }

    preguntas.forEach((p, i) => {
        console.log(`\n[Q${i}] ID: ${p.id}`);
        console.log(`Type: ${p.tipo_pregunta}`);
        console.log(`Respuesta Correcta: ${JSON.stringify(p.respuesta_correcta)} (Type: ${typeof p.respuesta_correcta})`);
        console.log(`Datos Extra: ${JSON.stringify(p.datos_extra)}`);
    });
}

inspectData();
