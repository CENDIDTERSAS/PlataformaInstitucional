'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Video, FileText, ClipboardCheck, Shuffle, Eye, Star, Plus, Trash2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QuizEditor, { QuizQuestion } from './QuizEditor';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 { font-size: 1.25rem; font-weight: 700; }
`;

const Body = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const Footer = styled.div`
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--gray-100);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  label { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; }
  input, textarea, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--gray-100);
    border-radius: 8px;
  }
`;

const QuestionCard = styled.div`
  background: #f9fafb;
  border: 1px solid var(--gray-100);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
`;

const OptionRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
  
  input[type="radio"] { width: auto; }
  input[type="text"] { flex: 1; }
`;

const PrimaryButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

const GhostButton = styled.button`
  background: none;
  border: 1px solid var(--gray-100);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  
  &:hover { background: #f9fafb; }
`;

const ConfigPanel = styled.div`
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
`;

const ConfigRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
  cursor: pointer;
  border-bottom: 1px solid #ebebeb;
  &:last-child { border-bottom: none; }
`;

const ConfigLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.875rem;
  color: #3c4043;
  font-weight: 500;
`;

const Toggle = styled.input.attrs({ type: 'checkbox' })`
  width: 36px; height: 20px;
  appearance: none;
  background: #ccc;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
  &:checked { background: var(--primary, #12A152); }
  &::after {
    content: '';
    position: absolute;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: white;
    top: 2px; left: 2px;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  }
  &:checked::after { transform: translateX(16px); }
`;

export default function LessonModal({ isOpen, onClose, onSave, cursoId, orden, lesson }: any) {
    const getInitialFormState = React.useCallback(() => ({
        tipo: lesson?.tipo || 'video',
        titulo: lesson?.titulo || '',
        contenido: lesson?.contenido || '',
        recursoUrl: lesson?.recurso_url || '',
        archivoUrl: lesson?.archivo_url || ''
    }), [lesson?.tipo, lesson?.titulo, lesson?.contenido, lesson?.recurso_url, lesson?.archivo_url]);

    const [tipo, setTipo] = useState(getInitialFormState().tipo);
    const [titulo, setTitulo] = useState(getInitialFormState().titulo);
    const [contenido, setContenido] = useState(getInitialFormState().contenido);
    const [recursoUrl, setRecursoUrl] = useState(getInitialFormState().recursoUrl);
    const [archivoUrl, setArchivoUrl] = useState(getInitialFormState().archivoUrl);
    const [preguntas, setPreguntas] = useState<any[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [tipoActividad, setTipoActividad] = useState<'embed' | 'sopa_letras'>('sopa_letras');
    const [sopaPalabras, setSopaPalabras] = useState('');
    const [config, setConfig] = useState({
        orden_aleatorio: false,
        mostrar_calificacion: true,
        mostrar_respuestas: false,
        marcadores: [] as { tiempo: number; pregunta: string; respuesta_correcta: boolean }[]
    });

    const setConf = (key: string, val: any) => setConfig(prev => ({ ...prev, [key]: val }));

    // Marker editor state
    const [markerMinSec, setMarkerMinSec] = useState('0:30');
    const [markerQuestion, setMarkerQuestion] = useState('');
    const [markerAnswer, setMarkerAnswer] = useState(true);

    const addMarker = () => {
        if (!markerQuestion.trim()) return;
        const [min, sec] = markerMinSec.split(':').map(Number);
        const tiempo = (min || 0) * 60 + (sec || 0);
        const newMarker = { tiempo, pregunta: markerQuestion.trim(), respuesta_correcta: markerAnswer };
        setConf('marcadores', [...(config.marcadores || []), newMarker].sort((a, b) => a.tiempo - b.tiempo));
        setMarkerQuestion('');
    };

    const removeMarker = (idx: number) => {
        setConf('marcadores', (config.marcadores || []).filter((_: any, i: number) => i !== idx));
    };

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const normalizeYoutubeUrl = (raw: string) => {
        const value = String(raw || '').trim();
        if (!value) return '';
        try {
            const parsed = new URL(value);
            const host = parsed.hostname.replace(/^www\./, '');
            let id = '';
            if (host === 'youtu.be') id = parsed.pathname.slice(1).split('/')[0];
            if (host.includes('youtube.com')) {
                if (parsed.pathname === '/watch') id = parsed.searchParams.get('v') || '';
                if (parsed.pathname.startsWith('/embed/')) id = parsed.pathname.split('/embed/')[1]?.split('/')[0] || '';
                if (parsed.pathname.startsWith('/shorts/')) id = parsed.pathname.split('/shorts/')[1]?.split('/')[0] || '';
                if (parsed.pathname.startsWith('/live/')) id = parsed.pathname.split('/live/')[1]?.split('/')[0] || '';
            }
            return id && id.length >= 11 ? `https://www.youtube.com/watch?v=${id.slice(0, 11)}` : value;
        } catch {
            return value;
        }
    };

    React.useEffect(() => {
        const fetchDetail = async () => {
            if (!isOpen) return;

            if (lesson?.id) {
                console.log(`[Frontend] Fetching detail for lesson ${lesson.id}`);
                const initial = getInitialFormState();
                setTitulo(initial.titulo);
                setTipo(initial.tipo);
                setRecursoUrl(initial.recursoUrl);
                setArchivoUrl(initial.archivoUrl);
                setContenido(initial.contenido);
                setLoadingDetail(true);
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lms/lecciones/${lesson.id}`, {
                        headers: { 'Authorization': `Bearer ${session?.access_token}` }
                    });

                    if (!res.ok) throw new Error('Error al obtener detalles');

                    const detail = await res.json();
                    setTitulo(detail.titulo || '');
                    setTipo(detail.tipo || 'video');
                    setRecursoUrl(detail.recurso_url || '');
                    setArchivoUrl(detail.archivo_url || '');
                    setContenido(detail.contenido || '');
                    setPreguntas(detail.preguntas || []);
                    if (detail.config) {
                        setConfig(prev => ({ ...prev, ...detail.config }));
                        if (detail.config.tipo_actividad) setTipoActividad(detail.config.tipo_actividad);
                        if (detail.config.sopa_palabras) setSopaPalabras(detail.config.sopa_palabras);
                    }
                } catch (err) {
                    console.error("Error fetching lesson detail:", err);
                } finally {
                    setLoadingDetail(false);
                }
            } else {
                resetForm();
            }
        };

        fetchDetail();
    }, [lesson?.id, isOpen, getInitialFormState]);

    const resetForm = () => {
        setTitulo('');
        setTipo('video');
        setRecursoUrl('');
        setArchivoUrl('');
        setContenido('');
        setPreguntas([]);
        setConfig({ orden_aleatorio: false, mostrar_calificacion: true, mostrar_respuestas: false, marcadores: [] });
        setTipoActividad('sopa_letras');
        setSopaPalabras('');
        setMarkerQuestion('');
        setMarkerMinSec('0:30');
        setMarkerAnswer(true);
    };

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!titulo.trim()) {
            alert('El título de la lección es obligatorio.');
            return;
        }

        const normalizedVideoUrl = tipo === 'video' ? normalizeYoutubeUrl(recursoUrl) : recursoUrl;
        if (tipo === 'video' && !normalizedVideoUrl.trim()) {
            alert('Para una lección de video debes ingresar la URL del video.');
            return;
        }

        let finalConfig = config;
        if (tipo === 'actividad') {
            finalConfig = { ...config, tipo_actividad: tipoActividad, sopa_palabras: sopaPalabras } as any;
        }

        onSave({
            id: lesson?.id,
            curso_id: cursoId,
            titulo,
            tipo,
            recurso_url: normalizedVideoUrl,
            archivo_url: archivoUrl,
            contenido,
            orden,
            config: (tipo === 'pre-test' || tipo === 'post-test' || tipo === 'video' || tipo === 'actividad') ? finalConfig : {},
            preguntas: (tipo === 'pre-test' || tipo === 'post-test' || tipo === 'encuesta') ? preguntas : []
        });
        onClose();
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <Header>
                    <h2>{lesson?.id ? 'Editar Lección' : 'Nueva Lección / Recurso'}</h2>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}><X size={20} /></button>
                </Header>
                <Body>
                    {loadingDetail ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>Cargando...</div>
                    ) : (
                        <>
                            <FormGroup>
                                <label>Título de la Lección</label>
                                <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej. Conceptos Básicos de Riesgos" />
                            </FormGroup>

                            <FormGroup>
                                <label>Tipo de Contenido</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                                    <GhostButton type="button" onClick={() => setTipo('video')} style={{ borderColor: tipo === 'video' ? 'var(--primary)' : 'var(--gray-100)', background: tipo === 'video' ? '#f1f8f4' : 'white' }}>
                                        <Video size={16} /> Video
                                    </GhostButton>
                                    <GhostButton type="button" onClick={() => setTipo('pdf')} style={{ borderColor: tipo === 'pdf' ? 'var(--primary)' : 'var(--gray-100)', background: tipo === 'pdf' ? '#f1f8f4' : 'white' }}>
                                        <FileText size={16} /> Documento
                                    </GhostButton>
                                    <GhostButton type="button" onClick={() => setTipo('actividad')} style={{ borderColor: tipo === 'actividad' ? 'var(--primary)' : 'var(--gray-100)', background: tipo === 'actividad' ? '#f1f8f4' : 'white' }}>
                                        <Shuffle size={16} /> Actividad (Juego)
                                    </GhostButton>
                                    <GhostButton type="button" onClick={() => setTipo('foro')} style={{ borderColor: tipo === 'foro' ? 'var(--primary)' : 'var(--gray-100)', background: tipo === 'foro' ? '#f1f8f4' : 'white' }}>
                                        <Star size={16} /> Foro / Casos
                                    </GhostButton>
                                    <GhostButton type="button" onClick={() => setTipo('pre-test')} style={{ borderColor: tipo === 'pre-test' ? 'var(--primary)' : 'var(--gray-100)', background: tipo === 'pre-test' ? '#f1f8f4' : 'white' }}>
                                        <ClipboardCheck size={16} /> Pre-test
                                    </GhostButton>
                                    <GhostButton type="button" onClick={() => setTipo('post-test')} style={{ borderColor: tipo === 'post-test' ? 'var(--primary)' : 'var(--gray-100)', background: tipo === 'post-test' ? '#f1f8f4' : 'white' }}>
                                        <ClipboardCheck size={16} /> Post-test
                                    </GhostButton>
                                    <GhostButton type="button" onClick={() => setTipo('encuesta')} style={{ borderColor: tipo === 'encuesta' ? 'var(--primary)' : 'var(--gray-100)', background: tipo === 'encuesta' ? '#f1f8f4' : 'white' }}>
                                        <Eye size={16} /> Encuesta
                                    </GhostButton>
                                </div>
                            </FormGroup>


                            {tipo === 'video' && (
                                <FormGroup>
                                    <label>URL del Recurso (YouTube)</label>
                                    <input value={recursoUrl} onChange={e => setRecursoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />

                                    {/* Marker Editor */}
                                    {recursoUrl && (
                                        <div style={{ marginTop: '1.25rem', background: '#f8f9fa', borderRadius: 10, padding: '1rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#5f6368', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                                                Preguntas en el video (Verdadero / Falso)
                                            </div>

                                            {/* Existing markers */}
                                            {(config.marcadores || []).map((m: any, i: number) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid #ebebeb' }}>
                                                    <span style={{ background: '#12A152', color: 'white', borderRadius: 6, padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                                                        <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />{formatTime(m.tiempo)}
                                                    </span>
                                                    <span style={{ flex: 1, fontSize: '0.88rem' }}>{m.pregunta}</span>
                                                    <span style={{ fontSize: '0.78rem', color: m.respuesta_correcta ? '#12A152' : '#ea4335', fontWeight: 600 }}>
                                                        {m.respuesta_correcta ? 'V' : 'F'}
                                                    </span>
                                                    <button onClick={() => removeMarker(i)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', padding: 0 }}><Trash2 size={14} /></button>
                                                </div>
                                            ))}

                                            {/* Add new marker */}
                                            <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <Clock size={14} color="#5f6368" />
                                                        <input
                                                            value={markerMinSec}
                                                            onChange={e => setMarkerMinSec(e.target.value)}
                                                            placeholder="1:30"
                                                            style={{ width: 60, border: '1px solid #ddd', borderRadius: 6, padding: '0.35rem 0.5rem', fontFamily: 'monospace', fontSize: '0.88rem' }}
                                                        />
                                                    </div>
                                                    <input
                                                        value={markerQuestion}
                                                        onChange={e => setMarkerQuestion(e.target.value)}
                                                        placeholder="Escribe la pregunta..."
                                                        style={{ border: '1px solid #ddd', borderRadius: 6, padding: '0.35rem 0.6rem', fontSize: '0.88rem', fontFamily: 'inherit' }}
                                                    />
                                                    <select
                                                        value={markerAnswer ? 'true' : 'false'}
                                                        onChange={e => setMarkerAnswer(e.target.value === 'true')}
                                                        style={{ border: '1px solid #ddd', borderRadius: 6, padding: '0.35rem 0.5rem', fontSize: '0.88rem', fontFamily: 'inherit' }}
                                                    >
                                                        <option value="true">✓ Verdadero</option>
                                                        <option value="false">✗ Falso</option>
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={addMarker}
                                                    disabled={!markerQuestion.trim()}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#12A152', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit', opacity: markerQuestion.trim() ? 1 : 0.5 }}
                                                >
                                                    <Plus size={15} /> Añadir pregunta en este momento
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </FormGroup>
                            )}

                            {tipo === 'pdf' && (
                                <FormGroup>
                                    <label>URL del Recurso (Archivo PDF)</label>
                                    <input value={recursoUrl} onChange={e => setRecursoUrl(e.target.value)} placeholder="https://..." />
                                </FormGroup>
                            )}

                            {/* MATERIAL DESCARGABLE (Común para todos) */}
                            <FormGroup style={{ border: '1px solid #e1f5fe', background: '#f1faff', padding: '1rem', borderRadius: 8 }}>
                                <label style={{ color: '#01579b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Star size={14} /> Material Descargable (Opcional)
                                </label>
                                <input
                                    value={archivoUrl}
                                    onChange={e => setArchivoUrl(e.target.value)}
                                    placeholder="Enlace a PDF, ZIP o Guía de estudio..."
                                    style={{ background: 'white' }}
                                />
                                <div style={{ fontSize: '0.75rem', color: '#0277bd', marginTop: '0.4rem' }}>
                                    El alumno verá un botón destacado para descargar este material.
                                </div>
                            </FormGroup>

                            {tipo === 'actividad' && (
                                <FormGroup>
                                    <label>Tipo de Actividad</label>
                                    <select value={tipoActividad} onChange={e => setTipoActividad(e.target.value as 'embed' | 'sopa_letras')} style={{ marginBottom: '1rem' }}>
                                        <option value="sopa_letras">Sopa de Letras (Nativo)</option>
                                        <option value="embed">Incrustar Enlace Externo (Educaplay, Wordwall, etc.)</option>
                                    </select>

                                    {tipoActividad === 'embed' ? (
                                        <>
                                            <label>URL de la Actividad Interactiva</label>
                                            <input value={recursoUrl} onChange={e => setRecursoUrl(e.target.value)} placeholder="https://..." />
                                            <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.4rem' }}>La plataforma intentará incrustar el juego automáticamente usando este enlace público.</div>
                                        </>
                                    ) : (
                                        <>
                                            <label>Palabras a Buscar (Separadas por comas)</label>
                                            <textarea
                                                rows={3}
                                                value={sopaPalabras}
                                                onChange={e => setSopaPalabras(e.target.value)}
                                                placeholder="LIDERAZGO, TRABAJO EN EQUIPO, COMPROMISO, SEGURIDAD..."
                                            />
                                            <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.4rem' }}>Escribe las palabras a buscar separadas por coma. Máximo sugerido: 10 a 15 palabras. Las palabras muy largas (más de 12 letras) se cortarán o pueden fallar.</div>
                                        </>
                                    )}
                                </FormGroup>
                            )}

                            {(tipo === 'pre-test' || tipo === 'post-test' || tipo === 'encuesta') && (
                                <>
                                    {/* Quiz Config */}
                                    {tipo !== 'encuesta' && (
                                        <ConfigPanel>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#80868b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configuración del Cuestionario</div>
                                            <ConfigRow>
                                                <ConfigLeft>
                                                    <Shuffle size={16} color="#5f6368" />
                                                    Orden aleatorio de preguntas
                                                </ConfigLeft>
                                                <Toggle checked={config.orden_aleatorio} onChange={e => setConf('orden_aleatorio', e.target.checked)} />
                                            </ConfigRow>
                                            <ConfigRow>
                                                <ConfigLeft>
                                                    <Star size={16} color="#5f6368" />
                                                    Mostrar calificación al finalizar
                                                </ConfigLeft>
                                                <Toggle checked={config.mostrar_calificacion} onChange={e => setConf('mostrar_calificacion', e.target.checked)} />
                                            </ConfigRow>
                                            <ConfigRow>
                                                <ConfigLeft>
                                                    <Eye size={16} color="#5f6368" />
                                                    Mostrar cuáles fueron correctas e incorrectas
                                                </ConfigLeft>
                                                <Toggle checked={config.mostrar_respuestas} onChange={e => setConf('mostrar_respuestas', e.target.checked)} />
                                            </ConfigRow>
                                        </ConfigPanel>
                                    )}

                                    {/* Questions */}
                                    <FormGroup>
                                        <label style={{ marginBottom: '1rem', display: 'block' }}>{tipo === 'encuesta' ? 'Preguntas de la Encuesta' : 'Preguntas del Cuestionario'}</label>
                                        <QuizEditor
                                            preguntas={preguntas as QuizQuestion[]}
                                            onChange={(newQ) => setPreguntas(newQ)}
                                            isSurvey={tipo === 'encuesta'}
                                        />
                                    </FormGroup>
                                </>
                            )}

                            <FormGroup>
                                <label>Contenido Adicional (Texto/Instrucciones)</label>
                                <textarea rows={3} value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Información que aparecerá debajo del recurso..." />
                            </FormGroup>
                        </>
                    )}
                </Body>
                <Footer>
                    <GhostButton onClick={onClose}>Cancelar</GhostButton>
                    <PrimaryButton onClick={handleSubmit}>Guardar Lección</PrimaryButton>
                </Footer>
            </ModalContent>
        </ModalOverlay>
    );
}
