const { supabase } = require('./db');

async function testInsert() {
    console.log('--- Testing string insert into preguntas_test ---');
    // Intentamos insertar una pregunta de prueba con respuesta de texto
    const testQuestion = {
        leccion_id: '52f85bba-e6a6-4313-a505-6382a2740457', // ID de la lección que fallaba
        pregunta: 'Prueba de tipo de columna',
        opciones: ['A', 'B'],
        respuesta_correcta: 'TEXT_TEST_ANSWER',
        tipo_pregunta: 'drag-drop'
    };

    const { data, error } = await supabase
        .from('preguntas_test')
        .insert([testQuestion])
        .select();

    if (error) {
        console.error('❌ Insert failed:', error.message);
        console.error('Error Code:', error.code);
        if (error.code === '22P02') {
            console.log('💡 DIAGNÓSTICO: La columna SIGUE siendo INTEGER. El script SQL no se aplicó correctamente.');
        }
    } else {
        console.log('✅ Insert successful! The column is now TEXT.');
        console.log('Inserted Data:', data);
        // Limpiamos la prueba
        await supabase.from('preguntas_test').delete().eq('id', data[0].id);
    }
}

testInsert();
