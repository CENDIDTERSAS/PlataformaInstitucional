const { supabase } = require('./db');

async function checkOwnership() {
    const courseId = '3d72e69d-22e5-4dd9-8498-4f81d26fe308';
    const userId = 'b79418b0-5e9a-42e9-946d-ef5fe7e384f0';

    console.log(`Checking course ${courseId}...`);
    const { data: course, error: cError } = await supabase.from('cursos').select('*').eq('id', courseId).single();
    if (cError) {
        console.error('Error fetching course:', cError);
    } else {
        console.log('Course found:', course.nombre);
        console.log('Docente ID:', course.docente_id);
        console.log('Match with current user:', course.docente_id === userId);
    }

    console.log('\nChecking lessons for this course...');
    const { data: lecciones, error: lError } = await supabase.from('lecciones').select('*').eq('curso_id', courseId);
    if (lError) {
        console.error('Error fetching lessons:', lError);
    } else {
        console.log(`Found ${lecciones.length} lessons.`);
        for (const l of lecciones) {
            const { data: questions } = await supabase.from('preguntas_test').select('*').eq('leccion_id', l.id);
            console.log(`Lesson: ${l.titulo} (ID: ${l.id}) - Questions count (via anon): ${questions?.length || 0}`);
        }
    }
}

checkOwnership();
