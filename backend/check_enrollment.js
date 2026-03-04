const { supabaseAdmin } = require('./db.js');

async function checkEnrollment() {
  const { data: inscripciones, error: err1 } = await supabaseAdmin.from('inscripciones').select('id, perfil_id, curso_id, estado, progreso');
  const { data: perfiles, error: err2 } = await supabaseAdmin.from('perfiles').select('id, email, nombres');
  const { data: cursos, error: err3 } = await supabaseAdmin.from('cursos').select('id, titulo, nombre');
  
  console.log('Inscripciones:', inscripciones?.length);
  console.log(inscripciones);
  console.log('\nPerfiles:', perfiles?.length);
  console.log(perfiles?.filter(p => p.email && p.email.includes('prueba')));
}
checkEnrollment();
