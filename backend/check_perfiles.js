const { supabaseAdmin } = require('./db.js');

async function checkPerfiles() {
  const { data: perfiles, error } = await supabaseAdmin.from('perfiles').select('*').limit(1);
  console.log(perfiles);
}
checkPerfiles();
