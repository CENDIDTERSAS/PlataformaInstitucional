require('dotenv').config();
const { supabase } = require('./db.js');

async function testInsert() {
    const { data: curso } = await supabase.from('cursos').select('id').limit(1);
    if (!curso || curso.length === 0) {
        console.log('No cursos found');
        return;
    }
    const cid = curso[0].id;

    const { data, error } = await supabase.from('lecciones').insert([{
        curso_id: cid,
        titulo: 'Test Lesson',
        tipo: 'video',
        recurso_url: 'https://youtube.com',
        archivo_url: '',
        orden: 1,
        config: {}
    }]).select();

    console.log("Insert Result:", data);
    if (error) {
        console.log("INSERT ERROR:", error);
    }
    process.exit(0);
}

testInsert();
