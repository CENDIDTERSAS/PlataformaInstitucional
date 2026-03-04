const express = require('express');
const router = express.Router();
const fs = require('fs');
const { supabase, supabaseAdmin, getSupabaseClient } = require('../db');

// Configuración de logs diagnósticos
const logPath = 'c:/Users/DAZA ROJAS/Downloads/ProyectoWebInstitucional/backend/tmp/lms_debug.log';
const logDir = 'c:/Users/DAZA ROJAS/Downloads/ProyectoWebInstitucional/backend/tmp';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// --- CURSOS ---

// Listar todos los cursos (con conteo de lecciones sin bloqueo de RLS)
router.get('/cursos', async (req, res) => {
    try {
        const supabaseClient = getSupabaseClient(req.headers.authorization);

        // 1. Obtener cursos con info del docente
        const { data: cursosData, error: cError } = await supabaseClient
            .from('cursos')
            .select('*, docente:perfiles!docente_id(nombres, apellidos)')
            .order('creado_at', { ascending: false });

        if (cError) throw cError;

        // 2. Contar lecciones usando cliente admin (sin RLS) para el catálogo público
        const { data: leccionesData, error: lError } = await supabase
            .from('lecciones')
            .select('curso_id');

        // Construir mapa de conteos
        const countMap = {};
        if (!lError && leccionesData) {
            leccionesData.forEach(l => {
                countMap[l.curso_id] = (countMap[l.curso_id] || 0) + 1;
            });
        }

        // 2b. Contar inscripciones
        const { data: inscData, error: inError } = await supabaseAdmin
            .from('inscripciones')
            .select('curso_id');

        const inscCountMap = {};
        if (!inError && inscData) {
            inscData.forEach(i => {
                inscCountMap[i.curso_id] = (inscCountMap[i.curso_id] || 0) + 1;
            });
        }

        // 3. Mezclar datos
        const result = cursosData.map(c => ({
            ...c,
            lecciones: Array.from({ length: countMap[c.id] || 0 }),
            inscripciones_count: inscCountMap[c.id] || 0
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener detalle de un curso
router.get('/cursos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const supabaseClient = getSupabaseClient(req.headers.authorization);
        const { data, error } = await supabaseClient
            .from('cursos')
            .select(`
                *,
                lecciones(*),
                docente:perfiles!docente_id(nombres, apellidos)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Guardar progreso de lección
router.post('/inscripciones/:id/progreso', async (req, res) => {
    try {
        const { id: inscripcion_id } = req.params;
        const { leccion_id } = req.body;
        const supabaseClient = getSupabaseClient(req.headers.authorization);

        console.log(`[LMS] Registrando progreso: Inscripcion ${inscripcion_id}, Leccion ${leccion_id}`);

        // 1. Guardar en tabla de progreso (evitar duplicados con upsert si lo permitiera, pero insertamos si no existe)
        const { data: existing } = await supabaseClient
            .from('lecciones_progreso')
            .select('*')
            .eq('inscripcion_id', inscripcion_id)
            .eq('leccion_id', leccion_id)
            .single();

        if (!existing) {
            const { error: insError } = await supabaseClient
                .from('lecciones_progreso')
                .insert([{ inscripcion_id, leccion_id }]);
            if (insError) throw insError;
        }

        // 2. Recalcular porcentaje de progreso en la inscripción
        // Obtener curso_id
        const { data: insc } = await supabaseClient
            .from('inscripciones')
            .select('curso_id')
            .eq('id', inscripcion_id)
            .single();

        // Contar lecciones totales vs completadas
        const [{ count: total }, { count: completas }] = await Promise.all([
            supabaseClient.from('lecciones').select('*', { count: 'exact', head: true }).eq('curso_id', insc.curso_id),
            supabaseClient.from('lecciones_progreso').select('*', { count: 'exact', head: true }).eq('inscripcion_id', inscripcion_id)
        ]);

        const porcentaje = Math.min(100, Math.round((completas / (total || 1)) * 100));

        await supabaseClient
            .from('inscripciones')
            .update({ progreso: porcentaje })
            .eq('id', inscripcion_id);

        res.json({ success: true, progreso: porcentaje });
    } catch (error) {
        console.error('[LMS] POST /progreso Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Crear un curso
router.post('/cursos', async (req, res) => {
    try {
        const supabaseClient = getSupabaseClient(req.headers.authorization);
        const { nombre, descripcion, imagen_url, categoria, docente_id, fecha_inicio, fecha_fin, puntaje_minimo_aprobacion, area_responsable, duracion_estimada, estado } = req.body;
        const { data, error } = await supabaseClient
            .from('cursos')
            .insert([{
                nombre,
                descripcion,
                imagen_url,
                categoria,
                docente_id,
                fecha_inicio,
                fecha_fin,
                area_responsable,
                duracion_estimada,
                estado: estado || 'Borrador',
                puntaje_minimo_aprobacion: puntaje_minimo_aprobacion || 60
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Editar un curso
router.put('/cursos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const supabaseClient = getSupabaseClient(req.headers.authorization);
        const { nombre, descripcion, imagen_url, categoria, fecha_inicio, fecha_fin, puntaje_minimo_aprobacion, area_responsable, duracion_estimada, estado } = req.body;

        const { data, error } = await supabaseClient
            .from('cursos')
            .update({
                nombre,
                descripcion,
                imagen_url,
                categoria,
                fecha_inicio,
                fecha_fin,
                area_responsable,
                duracion_estimada,
                estado,
                puntaje_minimo_aprobacion: puntaje_minimo_aprobacion || 60
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- INSCRIPCIONES ---

// Obtener todas las inscripciones de un curso (Vista Docente/Administrador)
router.get('/cursos/:id/inscripciones', async (req, res) => {
    try {
        const { id } = req.params;
        const { supabaseAdmin } = require('../db');
        console.log(`[LMS] Solicitando inscripciones para curso_id=${id}`);

        const { data, error } = await supabaseAdmin
            .from('inscripciones')
            .select(`
                id,
                perfil_id,
                curso_id,
                estado,
                progreso,
                calificacion_pre,
                calificacion_post,
                aciertos_pre,
                total_pre,
                aciertos_post,
                total_post,
                fecha_inscripcion,
                fecha_finalizacion,
                perfil:perfil_id (
                    nombres,
                    apellidos,
                    identificacion
                )
            `)
            .eq('curso_id', id);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('[LMS] GET /cursos/:id/inscripciones Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener inscripciones de un usuario
router.get('/mis-cursos/:perfil_id', async (req, res) => {
    try {
        const { perfil_id } = req.params;
        const supabaseClient = getSupabaseClient(req.headers.authorization);
        const { data: inscripciones, error: iError } = await supabaseClient
            .from('inscripciones')
            .select(`
                *,
                curso:cursos(*)
            `)
            .eq('perfil_id', perfil_id);

        if (iError) throw iError;

        // 2. Para cada inscripción, obtener las lecciones completadas
        const { data: progreso, error: pError } = await supabaseClient
            .from('lecciones_progreso')
            .select('inscripcion_id, leccion_id')
            .in('inscripcion_id', inscripciones.map(i => i.id));

        if (pError) {
            console.error('[LMS] Error al cargar progreso:', pError);
            // Si falla el progreso, al menos devolvemos las inscripciones con array vacío
            return res.json(inscripciones.map(i => ({ ...i, completiones: [] })));
        }

        const result = await Promise.all(inscripciones.map(async (i) => {
            const completiones = progreso
                .filter(p => p.inscripcion_id === i.id)
                .map(p => p.leccion_id);

            // Reparación automática: Si está al 100% pero no finalizado en DB, finalizamos aquí mismo
            if (i.progreso >= 100 && i.estado !== 'Finalizado') {
                console.log(`[LMS] Auto-finalizing inscription ${i.id} (found at 100% progress)`);
                const now = new Date().toISOString();
                await supabaseClient
                    .from('inscripciones')
                    .update({ estado: 'Finalizado', fecha_finalizacion: now })
                    .eq('id', i.id);

                return { ...i, estado: 'Finalizado', fecha_finalizacion: now, completiones };
            }

            return { ...i, completiones };
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inscribirse en un curso
router.post('/enrol', async (req, res) => {
    try {
        const { curso_id, perfil_id } = req.body;
        const supabaseClient = getSupabaseClient(req.headers.authorization);
        const { data, error } = await supabaseClient
            .from('inscripciones')
            .insert([{ curso_id, perfil_id }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar progreso de una inscripción (marcar lección como completada)
router.post('/inscripciones/:id/progreso', async (req, res) => {
    try {
        const { id } = req.params; // inscripcion_id
        const { leccion_id } = req.body;
        const supabaseClient = getSupabaseClient(req.headers.authorization);

        console.log(`[LMS] Marking lesson ${leccion_id} as completed for inscripcion ${id}`);

        // 1. Obtener la inscripción y las lecciones del curso
        const { data: insc, error: iError } = await supabaseClient
            .from('inscripciones').select('*').eq('id', id).single();
        if (iError) throw iError;

        // 2. Si ya está en las completiones, no hacer nada (opcional, pero ayuda a la idempotencia)
        const completionesPrevias = insc.completiones || [];
        if (leccion_id && completionesPrevias.includes(leccion_id)) {
            return res.json(insc);
        }

        // 3. Agregar a la lista de completiones (usando array_append de Postgres si es posible o manual)
        // Lo haremos manual para más control en esta capa
        const nuevasCompletiones = leccion_id ? [...completionesPrevias, leccion_id] : completionesPrevias;

        // 4. Calcular progreso basado en completiones vs total contenido
        const { data: todasLecciones } = await supabase
            .from('lecciones').select('id, tipo').eq('curso_id', insc.curso_id);

        const contenidoLecciones = todasLecciones?.filter(l => l.tipo !== 'pre-test' && l.tipo !== 'post-test') || [];
        const totalContenido = contenidoLecciones.length;

        // Contar cuántas de contenidoLecciones están en nuevasCompletiones
        const completadasContenido = contenidoLecciones.filter(l => nuevasCompletiones.includes(l.id)).length;
        const nuevoProgreso = totalContenido > 0 ? Math.round((completadasContenido / totalContenido) * 100) : 0;

        const updateData = {
            completiones: nuevasCompletiones,
            progreso: Math.min(nuevoProgreso, 100)
        };

        // Si llegó al 100%, verificar si debe marcarse como Finalizado
        // Si no hay post-test, se finaliza automáticamente al terminar el contenido
        const holdsPostTest = todasLecciones?.some(l => l.tipo === 'post-test');
        if (nuevoProgreso >= 100 && !holdsPostTest) {
            updateData.estado = 'Finalizado';
            updateData.fecha_finalizacion = new Date().toISOString();
        }

        const { data, error } = await supabaseClient
            .from('inscripciones')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        console.error(`[LMS] Error updating progress:`, error);
        res.status(500).json({ error: error.message });
    }
});

// --- LECCIONES Y TESTS ---

// Crear una lección
router.post('/lecciones', async (req, res) => {
    try {
        const { curso_id, titulo, contenido, tipo, recurso_url, archivo_url, orden, config } = req.body;
        const supabaseClient = getSupabaseClient(req.headers.authorization);
        const { data, error } = await supabaseClient
            .from('lecciones')
            .insert([{ curso_id, titulo, contenido, tipo, recurso_url, archivo_url, orden, config: config || {} }])
            .select();

        if (error) {
            console.error('[LMS] Error creating leccion:', error);
            throw error;
        }
        if (!data || data.length === 0) {
            console.warn('[LMS] Leccion created but no data returned (RLS?). Attempting admin rescue...');
            const { data: rescue } = await supabase
                .from('lecciones')
                .select('id')
                .eq('curso_id', curso_id)
                .eq('titulo', titulo)
                .order('creado_at', { ascending: false })
                .limit(1);

            const realId = rescue?.[0]?.id || 'unknown';
            console.log('[LMS] Rescue result:', realId);
            return res.status(201).json({ id: realId, ...req.body });
        }
        console.log('[LMS] Leccion created successfully:', data[0].id);
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reordenar lecciones
router.put('/cursos/:id/lecciones/orden', async (req, res) => {
    try {
        const { id } = req.params; // ID del curso
        const { lecciones } = req.body; // Array de { id, orden }

        console.log(`[LMS] Reordering lessons for course ${id}:`, lecciones);

        if (!Array.isArray(lecciones)) {
            return res.status(400).json({ error: 'Lecciones debe ser un array válido' });
        }

        const supabaseClient = getSupabaseClient(req.headers.authorization);

        // Supabase no tiene soporte nativo simple para bulk update con un array de objetos con distintos valores.
        // Lo resolvemos iterando (son pocas lecciones usualmente)
        const updatePromises = lecciones.map(l =>
            supabaseClient
                .from('lecciones')
                .update({ orden: l.orden })
                .eq('id', l.id)
                .eq('curso_id', id)
        );

        await Promise.all(updatePromises);

        res.json({ message: 'Orden actualizado correctamente' });
    } catch (error) {
        console.error(`[LMS] PUT /cursos/:id/lecciones/orden Error:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una lección
router.put('/lecciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, tipo, recurso_url, archivo_url, orden, config } = req.body;
        console.log(`[LMS] Updating leccion ${id}. Config provided:`, !!config, JSON.stringify(config));
        const supabaseClient = getSupabaseClient(req.headers.authorization);
        const { data, error } = await supabaseClient
            .from('lecciones')
            .update({ titulo, contenido, tipo, recurso_url, archivo_url, orden, ...(config !== undefined && { config }) })
            .eq('id', id)
            .select();

        if (error) {
            console.error('[LMS] Error updating leccion:', error);
            throw error;
        }
        if (!data || data.length === 0) {
            console.warn(`[LMS] Leccion ${id} updated but no data returned (RLS?). returning ID fallback.`);
            return res.json({ id, ...req.body });
        }
        console.log('[LMS] Leccion updated successfully:', data[0].id);
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una lección
router.delete('/lecciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const supabaseClient = getSupabaseClient(req.headers.authorization);
        const { error } = await supabaseClient
            .from('lecciones')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar preguntas a un test
router.post('/preguntas', async (req, res) => {
    try {
        const { leccion_id, preguntas } = req.body;
        console.log(`[LMS] Saving ${preguntas?.length || 0} preguntas for leccion: ${leccion_id}`);
        const authHeader = req.headers.authorization;

        const supabaseClient = getSupabaseClient(authHeader);

        // Eliminar preguntas previas para evitar duplicados en actualizaciones
        console.log(`[LMS] Deleting old preguntas...`);
        const { error: delError } = await supabaseClient.from('preguntas_test').delete().eq('leccion_id', leccion_id);
        if (delError) {
            console.error(`[LMS] Error deleting old preguntas:`, delError);
            throw delError;
        }

        if (!preguntas || preguntas.length === 0) {
            console.log(`[LMS] No questions to insert.`);
            return res.json({ message: 'No hay preguntas para insertar' });
        }

        const dataInsert = preguntas.map(p => {
            const tipo = p.tipo_pregunta || 'single';
            const base = { leccion_id, pregunta: p.pregunta, tipo_pregunta: tipo };

            if (tipo === 'single') {
                const corr = !isNaN(p.respuesta_correcta) && p.respuesta_correcta !== '' ? Number(p.respuesta_correcta) : (p.respuesta_correcta ?? 0);
                return {
                    ...base,
                    opciones: p.opciones || [],
                    respuesta_correcta: corr,
                    datos_extra: {}
                };
            } else if (tipo === 'multiple') {
                const arr = Array.isArray(p.respuestas_correctas) ? p.respuestas_correctas.map(v => !isNaN(v) ? Number(v) : v) : [];
                return {
                    ...base,
                    opciones: p.opciones || [],
                    respuesta_correcta: arr[0] ?? 0,
                    datos_extra: { respuestas_correctas: arr }
                };
            } else if (tipo === 'matching') {
                return {
                    ...base,
                    opciones: [],
                    respuesta_correcta: 0,
                    datos_extra: { pares: p.pares || [] }
                };
            } else if (tipo === 'ordering') {
                return {
                    ...base,
                    opciones: p.items || [],
                    respuesta_correcta: 0,
                    datos_extra: { items: p.items || [] }
                };
            } else if (tipo === 'drag-drop') {
                return {
                    ...base,
                    opciones: p.opciones || [],
                    respuesta_correcta: String(p.respuesta_correcta || ''),
                    datos_extra: { frase: p.pregunta || '', opciones: p.opciones || [] }
                };
            } else if (tipo === 'rating') {
                return {
                    ...base,
                    opciones: [],
                    respuesta_correcta: '0',
                    datos_extra: {}
                };
            }
            const defaultCorr = !isNaN(p.respuesta_correcta) ? Number(p.respuesta_correcta) : (p.respuesta_correcta ?? 0);
            return { ...base, opciones: p.opciones || [], respuesta_correcta: defaultCorr, datos_extra: {} };
        });

        console.log(`[LMS] Inserting ${dataInsert.length} preguntas...`);
        const { data, error } = await supabaseClient
            .from('preguntas_test')
            .insert(dataInsert)
            .select();

        if (error) {
            console.error(`[LMS] Error inserting preguntas:`, error);
            throw error;
        }

        console.log(`[LMS] Successfully saved questions`);
        res.status(201).json(data);
    } catch (error) {
        console.error(`[LMS] POST /preguntas Error:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener lección y sus preguntas (si es test)
router.get('/lecciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[LMS] Fetching leccion detail for ID: ${id}`);
        const authHeader = req.headers.authorization;
        console.log(`[LMS] Auth header present: ${!!authHeader}`);

        const supabaseClient = getSupabaseClient(authHeader);
        const { data: leccion, error: lError } = await supabaseClient
            .from('lecciones')
            .select('*')
            .eq('id', id)
            .single();

        if (lError) {
            console.error(`[LMS] Error fetching leccion:`, lError);
            throw lError;
        }

        console.log(`[LMS] Leccion type: ${leccion.tipo}`);

        if (leccion.tipo === 'pre-test' || leccion.tipo === 'post-test' || leccion.tipo === 'encuesta') {
            const { data: preguntas, error: pError } = await supabaseClient
                .from('preguntas_test')
                .select('*')
                .eq('leccion_id', id);

            if (pError) {
                console.error(`[LMS] Error fetching preguntas:`, pError);
                throw pError;
            }

            const mappedPreguntas = (preguntas || []).map(p => {
                const tipo = p.tipo_pregunta || 'single';
                const base = {
                    id: p.id,
                    leccion_id: p.leccion_id,
                    pregunta: p.pregunta,
                    tipo_pregunta: tipo,
                    opciones: p.opciones || []
                };

                if (tipo === 'single') {
                    const idx = p.respuesta_correcta;
                    return {
                        ...base,
                        respuesta_correcta: (idx !== null && idx !== undefined && idx !== '' && !isNaN(idx)) ? Number(idx) : idx
                    };
                } else if (tipo === 'multiple') {
                    // Normalizar a array de números
                    const rawArr = p.datos_extra?.respuestas_correctas || p.respuestas_correctas || [];
                    const normalized = Array.isArray(rawArr) ? rawArr.map(v => !isNaN(v) ? Number(v) : v) : [];
                    return {
                        ...base,
                        respuestas_correctas: normalized
                    };
                } else if (tipo === 'matching') {
                    return {
                        ...base,
                        pares: p.datos_extra?.pares || []
                    };
                } else if (tipo === 'ordering') {
                    return {
                        ...base,
                        items: p.datos_extra?.items || []
                    };
                }
                // drag-drop, rating, etc.
                return {
                    ...base,
                    respuesta_correcta: p.respuesta_correcta
                };
            });
            console.log(`[LMS] Found and mapped ${mappedPreguntas.length} preguntas`);
            return res.json({ ...leccion, preguntas: mappedPreguntas });
        }

        res.json(leccion);
    } catch (error) {
        console.error(`[LMS] GET /lecciones/:id Error:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Guardar respuestas y calificar test (soporta múltiples tipos de pregunta)
router.post('/calificar-test', async (req, res) => {
    try {
        const { inscripcion_id, leccion_id, respuestas, tipo_test } = req.body;
        const supabaseClient = getSupabaseClient(req.headers.authorization);

        // Obtener preguntas con todos los datos necesarios para scoring
        const { data: preguntas, error: pError } = await supabaseClient
            .from('preguntas_test')
            .select('id, tipo_pregunta, respuesta_correcta, opciones, datos_extra')
            .eq('leccion_id', leccion_id);

        if (pError) throw pError;

        let aciertos = 0;
        const totalPreguntas = preguntas.length;
        const registrosRespuestas = [];

        respuestas.forEach(r => {
            const pregunta = preguntas.find(p => p.id === r.pregunta_id);
            if (!pregunta) return;

            const tipo = pregunta.tipo_pregunta || 'single';
            let es_correcta = false;

            if (tipo === 'single') {
                es_correcta = r.respuesta_seleccionada !== undefined &&
                    Number(pregunta.respuesta_correcta) === Number(r.respuesta_seleccionada);
                console.log(`- Single [Q:${r.pregunta_id}]: Correct:${pregunta.respuesta_correcta} vs User:${r.respuesta_seleccionada} -> ${es_correcta}`);
            } else if (tipo === 'multiple') {
                const correctas = pregunta.datos_extra?.respuestas_correctas || pregunta.respuestas_correctas || [];
                const seleccionadas = Array.isArray(r.respuesta_seleccionada) ? r.respuesta_seleccionada : [];
                es_correcta =
                    correctas.length > 0 &&
                    correctas.length === seleccionadas.length &&
                    correctas.sort().join(',') === seleccionadas.sort().join(',');
                console.log(`- Multiple [Q:${r.pregunta_id}]: Correct:${correctas} vs User:${seleccionadas} -> ${es_correcta}`);
            } else if (tipo === 'matching') {
                const pares = pregunta.datos_extra?.pares || pregunta.pares || [];
                const respPares = Array.isArray(r.respuesta_seleccionada) ? r.respuesta_seleccionada : [];
                const totalPares = pares.length;
                const pareados = totalPares > 0 ? respPares.filter(rp => Number(rp.derecha) === Number(rp.correcta)).length : 0;
                es_correcta = (totalPares > 0) && (pareados === totalPares);
                console.log(`- Matching [Q:${r.pregunta_id}]: Matches:${pareados}/${totalPares} -> ${es_correcta}`);
            } else if (tipo === 'ordering') {
                const orden = pregunta.datos_extra?.items || pregunta.items || [];
                const respOrden = Array.isArray(r.respuesta_seleccionada) ? r.respuesta_seleccionada : [];
                es_correcta = orden.length > 0 && orden.length === respOrden.length && orden.join('|') === respOrden.join('|');
                console.log(`- Ordering [Q:${r.pregunta_id}]: Match -> ${es_correcta}`);
            } else if (tipo === 'drag-drop') {
                const correcta = String(pregunta.respuesta_correcta).trim().toLowerCase();
                const respuesta = String(r.respuesta_seleccionada || '').trim().toLowerCase();
                es_correcta = correcta === respuesta;
                console.log(`- DragDrop [Q:${r.pregunta_id}]: Correct:${correcta} vs User:${respuesta} -> ${es_correcta}`);
            }

            if (es_correcta) aciertos++;

            registrosRespuestas.push({
                inscripcion_id,
                pregunta_id: r.pregunta_id,
                respuesta_seleccionada: r.respuesta_seleccionada?.toString() || '',
                es_correcta,
                tipo_test
            });
        });

        const rawScore = totalPreguntas > 0 ? (aciertos / totalPreguntas) * 100 : 0;
        const calificacion = Math.min(100, Math.round(rawScore));

        // Guardar respuestas
        if (registrosRespuestas.length > 0) {
            const { error: rError } = await supabaseClient
                .from('lms_respuestas_usuarios')
                .insert(registrosRespuestas);
            if (rError) console.error('Error guardando respuestas user:', rError);
        }

        // Diagnóstico de Auth y Perfil
        const { data: { user } } = await supabaseClient.auth.getUser();

        const { data: inscripcionData, error: iError } = await supabaseClient
            .from('inscripciones')
            .select('id, perfil_id, curso_id, intentos_post')
            .eq('id', inscripcion_id)
            .single();

        if (iError) {
            console.error('[LMS] Error inicial buscando inscripción:', iError);
            throw iError;
        }

        console.log(`[LMS] Auth Check: User.id=${user?.id}, Inscript.perfil_id=${inscripcionData.perfil_id}, Match=${user?.id === inscripcionData.perfil_id}`);
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Auth Check: User.id=${user?.id}, Inscript.id=${inscripcion_id}, Inscript.perfil_id=${inscripcionData.perfil_id}, Match=${user?.id === inscripcionData.perfil_id}\n`);
        const curso_id = inscripcionData.curso_id;

        // Calcular progreso proporcional
        const { data: lecciones } = await supabaseClient
            .from('lecciones')
            .select('id, tipo')
            .eq('curso_id', curso_id);

        const totalLecciones = lecciones?.length || 1;

        console.log(`Calificando test: ${tipo_test}, Score: ${calificacion}, Total Lecciones: ${totalLecciones}`);

        // Actualizar inscripción (usamos el cliente admin para asegurar el guardado)
        const updateData = {};
        if (tipo_test === 'pre') {
            updateData.calificacion_pre = calificacion;
            updateData.aciertos_pre = aciertos;
            updateData.total_pre = totalPreguntas;
            // Progreso: al menos 1 lección completada (el pre-test mismo)
            const nuevoProgreso = Math.max(1, Math.round((1 / totalLecciones) * 100));
            updateData.progreso = nuevoProgreso;
            console.log(`Actualizando Pre-test: Progreso ${nuevoProgreso}%`);
        } else {
            updateData.calificacion_post = calificacion;
            updateData.aciertos_post = aciertos;
            updateData.total_post = totalPreguntas;
            updateData.intentos_post = (inscripcionData.intentos_post || 0) + 1;
            if (calificacion >= 60) {
                updateData.estado = 'Finalizado';
                updateData.fecha_finalizacion = new Date().toISOString();
                updateData.progreso = 100;
            }
        }

        let { data: finalData, error: uError } = await supabaseClient
            .from('inscripciones')
            .update(updateData)
            .eq('id', inscripcion_id)
            .select();

        // Fallback para overflow (NUMERIC(4,2) no soporta 100.00)
        if (uError && uError.code === '22003') {
            console.warn('[LMS] Overflow detectado (100%). Reintentando con 99.99...');
            if (updateData.calificacion_pre === 100) updateData.calificacion_pre = 99.99;
            if (updateData.calificacion_post === 100) updateData.calificacion_post = 99.99;

            const retry = await supabaseClient
                .from('inscripciones')
                .update(updateData)
                .eq('id', inscripcion_id)
                .select();
            finalData = retry.data;
            uError = retry.error;
        }

        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Update Result: success=${!!finalData?.length}, error=${JSON.stringify(uError)}\n`);

        console.log(`[LMS] Resultado de actualización para inscripcion ${inscripcion_id}:`, {
            success: !!finalData?.length,
            error: uError,
            updateData
        });

        if (uError) {
            console.error('[LMS] Error final actualizando inscripción:', uError);
            return res.status(500).json({ error: uError.message, code: uError.code });
        }

        if (!finalData || finalData.length === 0) {
            console.error('[LMS] No se encontró la inscripción o RLS bloqueó el UPDATE.');
            return res.status(404).json({
                error: 'No se pudo actualizar la inscripción. Verifica que el ID sea correcto y que el token de usuario sea válido.',
                inscripcion_id
            });
        }

        console.log('[LMS] Inscripción guardada con éxito:', finalData[0]);

        res.json({
            calificacion,
            aciertos,
            totalPreguntas,
            aprobado: calificacion >= 60,
            tipo_test,
            inscripcion: finalData[0]
        });


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Guardar progreso de video (maxReached + completed) por lección para una inscripción
router.post('/inscripciones/:id/video-progreso', async (req, res) => {
    try {
        const { id } = req.params; // inscripcion_id
        const { leccion_id, maxReached, completed } = req.body;

        if (!leccion_id) return res.status(400).json({ error: 'leccion_id is required' });

        // Merge into JSONB: read current, add/update this lesson's entry, write back
        const { data: insc, error: rError } = await supabaseAdmin
            .from('inscripciones').select('video_progresos').eq('id', id).single();
        if (rError) throw rError;

        const current = insc.video_progresos || {};
        const updated = { ...current, [leccion_id]: { maxReached: maxReached || 0, completed: !!completed } };

        const { error: uError } = await supabaseAdmin
            .from('inscripciones').update({ video_progresos: updated }).eq('id', id);
        if (uError) throw uError;

        res.json({ success: true, video_progresos: updated });
    } catch (error) {
        console.error('[LMS] POST /inscripciones/:id/video-progreso Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/encuesta-satisfaccion', async (req, res) => {
    try {
        const { inscripcion_id, leccion_id, curso_id, perfil_id, respuestas, observacion } = req.body;
        const supabaseClient = getSupabaseClient(req.headers.authorization);

        // Calcular promedio de las preguntas tipo rating
        const ratings = (respuestas || [])
            .filter((r) => r.tipo === 'rating' && !isNaN(Number(r.respuesta_seleccionada)) && Number(r.respuesta_seleccionada) > 0)
            .map((r) => Number(r.respuesta_seleccionada));

        const promedio_rating = ratings.length > 0
            ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100
            : null;

        const { data, error } = await supabaseClient
            .from('lms_encuestas_satisfaccion')
            .insert([{ inscripcion_id, leccion_id, curso_id, perfil_id, promedio_rating, observacion: observacion || null }])
            .select();

        if (error) throw error;
        console.log('[LMS] Encuesta satisfacción guardada:', data?.[0]?.id);
        res.status(201).json(data?.[0]);
    } catch (error) {
        console.error('[LMS] POST /encuesta-satisfaccion Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener promedio de satisfacción y observaciones de un curso (vista docente)
router.get('/cursos/:id/encuesta-promedio', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('lms_encuestas_satisfaccion')
            .select(`
                promedio_rating,
                observacion,
                creado_at,
                perfil:perfil_id (
                    nombres,
                    apellidos
                )
            `)
            .eq('curso_id', id)
            .order('creado_at', { ascending: false });

        if (error) throw error;

        const validos = (data || []).filter(r => r.promedio_rating !== null);
        const promedioGeneral = validos.length > 0
            ? Math.round((validos.reduce((s, r) => s + Number(r.promedio_rating), 0) / validos.length) * 10) / 10
            : null;

        res.json({ promedio: promedioGeneral, total: data?.length || 0, respuestas: data || [] });
    } catch (error) {
        console.error('[LMS] GET /cursos/:id/encuesta-promedio Error:', error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
