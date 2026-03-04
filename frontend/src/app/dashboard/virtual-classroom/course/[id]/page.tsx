'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import {
    ArrowLeft,
    PlayCircle,
    FileText,
    ClipboardCheck,
    Lock,
    CheckCircle,
    AlertCircle,
    Download,
    ChevronRight,
    Monitor,
    GraduationCap,
    Clock,
    Award,
    User,
    Settings,
    Users,
    ChevronUp,
    ChevronDown,
    Link2,
    MoveVertical,
    X, CheckCircle2, Play, Pause, RotateCcw, Check, Video,
    Shuffle, Star, Eye
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Dynamic Shielding: Isolate heavy components and their hooks from the main hydration cycle
const InteractiveVideoPlayer = dynamic(() => import('@/components/lms/InteractiveVideoPlayer'), {
    ssr: false,
    loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando reproductor de video...</div>
});

const WordSearch = dynamic(() => import('@/components/lms/WordSearch'), {
    ssr: false,
    loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando actividad...</div>
});

const CertificateDownloader = dynamic(() => import('@/components/lms/CertificateDownloader'), {
    ssr: false,
    loading: () => <span style={{ fontSize: '0.8rem' }}>Preparando generador...</span>
});

const Container = styled.div`
  display: flex;
  height: calc(100vh - 64px);
  background: #f8f9fa;
`;

const Sidebar = styled.div`
  width: 350px;
  background: white;
  border-right: 1px solid var(--gray-100);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-100);
  
  button {
    background: none;
    border: none;
    color: var(--secondary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    
    &:hover { color: var(--primary); }
  }

  h2 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text);
  }
`;

const LessonItem = styled.div<{ $active: boolean; $locked: boolean; $completed?: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    cursor: ${props => props.$locked ? 'not-allowed' : 'pointer'};
    background: ${props => props.$active ? '#f1fdf5' : 'transparent'};
    border-left: 3px solid ${props => props.$active ? '#12A152' : 'transparent'};
    opacity: ${props => props.$locked ? 0.6 : 1};
    transition: all 0.2s;
    position: relative;

    &:hover {
        background: ${props => props.$locked ? 'transparent' : (props.$active ? '#f1fdf5' : '#f9fafb')};
    }
`;

const LessonInfo = styled.div`
  flex: 1;
  div {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text);
  }
  span {
    font-size: 0.75rem;
    color: var(--secondary);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const WelcomeCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);

  h1 { font-size: 2rem; margin-bottom: 1rem; }
  p { color: var(--secondary); margin-bottom: 2rem; }
`;

const ActionButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:disabled {
    background: var(--gray-100);
    color: var(--secondary);
    cursor: not-allowed;
  }
`;

const VideoPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-direction: column;
  gap: 1rem;
`;

const QuizContainer = styled.div`
  background: transparent;
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const QuizFormHeader = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid var(--gray-100);
  overflow: hidden;
  position: relative;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const QuizHeaderTopBar = styled.div`
  height: 10px;
  background: var(--primary); /* El color verde institucional emulando el morado de Google Forms */
  width: 100%;
`;

const QuizHeaderContent = styled.div`
  padding: 2rem 2.5rem;
`;

const QuizTitle = styled.h1`
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text);
  font-family: 'Google Sans', 'Inter', sans-serif;
`;

const QuizDesc = styled.p`
  font-size: 0.95rem;
  color: #5f6368;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const QuizHeaderDivider = styled.hr`
  border: 0;
  border-top: 1px solid var(--gray-200);
  margin: 1.5rem 0;
`;

const QuizMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #5f6368;
  margin-bottom: 0.5rem;

  strong {
    color: var(--text);
    font-weight: 600;
  }
`;

const RequiredText = styled.div`
  color: #ea4335;
  font-size: 0.9rem;
  margin-top: 1rem;
`;

const QuestionCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem 2.5rem;
  border: 1px solid var(--gray-100);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);

  h3 { 
    font-size: 1.1rem; 
    font-weight: 400;
    margin-bottom: 1.5rem; 
    color: var(--text);
    display: flex;
    gap: 0.5rem;

    span.req {
      color: #ea4335;
    }
  }
`;

const Question = styled.div`
  margin-bottom: 2rem;
  h3 { font-size: 1.1rem; margin-bottom: 1rem; }
`;

const Option = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;

  &:hover {
    background: #f8f9fa;
  }

  input.hidden-input { 
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

const CustomRadio = styled.div<{ $selected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.$selected ? 'var(--primary)' : '#bdc1c6'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;

  &::after {
    content: '';
    width: 10px;
    height: 10px;
    background: var(--primary);
    border-radius: 50%;
    transform: scale(${props => props.$selected ? 1 : 0});
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const OptionText = styled.span`
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.5;
`;

const MatchingRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1.2fr;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid var(--gray-100);
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid var(--gray-100);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const OrderButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #80868b;
  cursor: pointer;
  padding: 2px;
  display: flex;
  &:hover { color: var(--primary); }
  &:disabled { color: #eee; cursor: not-allowed; }
`;

const DropZone = styled.div<{ $hasValue: boolean; $isOver: boolean }>`
  display: inline-flex;
  min-width: 120px;
  height: 32px;
  background: ${p => p.$isOver ? '#e8f5e9' : (p.$hasValue ? '#f1f8f4' : '#f5f5f5')};
  border: 2px dashed ${p => p.$isOver ? 'var(--primary)' : (p.$hasValue ? 'var(--primary)' : '#ccc')};
  border-radius: 6px;
  margin: 0 0.5rem;
  vertical-align: middle;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary);
  transition: all 0.2s;
`;

const DragChip = styled.div`
  display: inline-flex;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid var(--gray-100);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  &:active { cursor: grabbing; }
  &:hover { border-color: var(--primary); background: #f1fdf5; }
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CourseViewer() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isClient, setIsClient] = useState(false);
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [loadingLesson, setLoadingLesson] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
    const [quizResult, setQuizResult] = useState<{ calificacion: number; aciertos: number; totalPreguntas: number; aprobado: boolean; tipo_test?: string } | null>(null);
    const [shuffledData, setShuffledData] = useState<Record<string, any>>({});
    const [observacion, setObservacion] = useState('');
    const [videoCompleted, setVideoCompleted] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const wordList = useMemo(() => {
        if (activeLesson?.config?.tipo_actividad === 'sopa_letras') {
            return (activeLesson.config.sopa_palabras || '')
                .split(',')
                .map((w: string) => w.trim())
                .filter(Boolean);
        }
        return [];
    }, [activeLesson?.id, activeLesson?.config?.sopa_palabras]);

    const selectLesson = async (lesson: any) => {
        setLoadingLesson(true);
        setQuizAnswers({});
        setQuizResult(null);
        setShuffledData({});
        setObservacion('');
        // Check if video was already completed for this lesson (from inscription)
        // This will be properly set when we read savedProgress in InteractiveVideoPlayer
        setVideoCompleted(false);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/lecciones/${lesson.id}`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            const detail = await res.json();
            console.log("[LMS] Lesson Detail Fetched:", detail);
            setActiveLesson(detail);

            if (detail.tipo === 'pre-test' || detail.tipo === 'post-test' || detail.tipo === 'encuesta') {
                // Preparar datos mezclados (shuffle) con los datos frescos
                const newShuffled: Record<string, any> = {};
                detail.preguntas?.forEach((q: any) => {
                    if (q.tipo_pregunta === 'ordering') {
                        newShuffled[q.id] = [...(q.opciones || [])].sort(() => Math.random() - 0.5);
                    } else if (q.tipo_pregunta === 'matching') {
                        // Prevenir falla de datos si viene en formato antiguo opciones vs pares
                        let rightSide = [];
                        const validPairs = q.pares || (q.datos_extra && q.datos_extra.pares);
                        if (validPairs) {
                            rightSide = validPairs.map((p: any, i: number) => ({ text: p.derecha, originalIdx: i }));
                        } else if (q.opciones) {
                            rightSide = q.opciones.map((opt: string, i: number) => ({ text: opt, originalIdx: i }));
                        }
                        newShuffled[q.id] = rightSide.sort(() => Math.random() - 0.5);
                    } else if (q.tipo_pregunta === 'drag-drop') {
                        const correct = q.respuesta_correcta || '';
                        const distractors = q.datos_extra?.opciones || q.opciones || [];
                        newShuffled[q.id] = [...distractors, correct].sort(() => Math.random() - 0.5);
                    }
                });
                setShuffledData(newShuffled);
                console.log("[LMS] Shuffled Data Initialized:", newShuffled);
            }

        } catch (e) {
            console.error("[LMS] Error fetching lesson detail:", e);
            setActiveLesson(lesson);
        } finally {
            setLoadingLesson(false);
        }
    };



    // 1. Obtener Perfil
    const { data: profile } = useQuery({
        queryKey: ['my-profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const res = await fetch(`${API_URL}/profile/${user.id}`);
            return res.json();
        }
    });

    // 2. Obtener Curso y Lecciones
    const { data: curso, isLoading: loadingCurso } = useQuery({
        queryKey: ['lms-curso', id],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/cursos/${id}`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            const data = await res.json();
            if (data.error) return null;
            return data;
        }
    });

    // 3. Obtener Inscripción
    const { data: inscripcion, refetch: refetchInsc } = useQuery({
        queryKey: ['lms-inscripcion', id, profile?.id],
        queryFn: async () => {
            if (!profile?.id) return null;
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/mis-cursos/${profile.id}`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            const myInscs = await res.json();
            if (myInscs.error || !Array.isArray(myInscs)) return null;
            // Forzar que sea el de este curso específico
            const found = myInscs.find((i: any) => String(i.curso_id) === String(id)) || null;
            console.log("[LMS] Fecthed Inscription:", found);
            return found;
        },
        enabled: !!profile?.id,
        staleTime: 0 // Forzar datos frescos
    });

    console.log("[LMS] Render State:", {
        inscripcion_calif_pre: inscripcion?.calificacion_pre,
        activeLesson: activeLesson?.id,
        preguntas_count: activeLesson?.preguntas?.length || 0,
        quizResult: !!quizResult
    });

    // 4. Mutación Enrolar
    const enrolMutation = useMutation({
        mutationFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/enrol`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ curso_id: id, perfil_id: profile.id })
            });
            return res.json();
        },
        onSuccess: () => refetchInsc()
    });

    // 5. Mutación Calificar Test
    const scoreMutation = useMutation({
        mutationFn: async (data: any) => {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/calificar-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: (data) => {
            setQuizResult(data);
            // Actualizar caché de inscripción inmediatamente para desbloquear contenido
            if (data.inscripcion) {
                queryClient.setQueryData(['lms-inscripcion', id, profile?.id], data.inscripcion);
            }
            refetchInsc();
            queryClient.invalidateQueries({ queryKey: ['lms-curso', id] });

            // Auto-navigación tras test
            if (curso?.lecciones && activeLesson) {
                const sorted = [...curso.lecciones].sort((a: any, b: any) => {
                    const ordA = a.orden ?? 0;
                    const ordB = b.orden ?? 0;
                    if (ordA !== ordB) return ordA - ordB;
                    return String(a.id).localeCompare(String(b.id));
                });

                const currentIndex = sorted.findIndex(l => l.id === activeLesson.id);
                if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
                    const nextLesson = sorted[currentIndex + 1];
                    setTimeout(() => {
                        selectLesson(nextLesson);
                    }, 500);
                }
            }
        }
    });

    // 6. Mutación Completar Lección de Contenido
    const completarMutation = useMutation({
        mutationFn: async (leccionId?: string) => {
            const lid = leccionId || activeLesson?.id;
            if (!inscripcion?.id || !lid) return;
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/inscripciones/${inscripcion.id}/progreso`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ leccion_id: lid })
            });
            return res.json();
        },
        onSuccess: () => {
            refetchInsc();
            // Buscar la siguiente lección para avanzar automáticamente
            if (curso?.lecciones && activeLesson) {
                const sorted = [...curso.lecciones].sort((a: any, b: any) => {
                    const ordA = a.orden ?? 0;
                    const ordB = b.orden ?? 0;
                    if (ordA !== ordB) return ordA - ordB;
                    return String(a.id).localeCompare(String(b.id));
                });

                const currentIndex = sorted.findIndex(l => l.id === activeLesson.id);
                if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
                    const nextLesson = sorted[currentIndex + 1];
                    // Retrasamos un poco la selección para que el usuario vea el feedback de completado si existe
                    setTimeout(() => {
                        selectLesson(nextLesson);
                    }, 500);
                }
            }
        }
    });

    // Lógica de Bloqueo Estricto: Cascada secuencial según 'orden'
    const isLessonCompleted = (lesson: any) => {
        if (!inscripcion) return false;
        // Tests especiales que guardan calificación directamente en la inscripción
        if (lesson.tipo === 'pre-test') return inscripcion.calificacion_pre !== null && inscripcion.calificacion_pre !== undefined;
        if (lesson.tipo === 'post-test') return inscripcion.calificacion_post !== null && inscripcion.calificacion_post !== undefined;
        // Todas las demás lecciones (videos, pdf, actividades, encuestas, foros)
        return (inscripcion.completiones || []).includes(lesson.id);
    };

    const isLessonLocked = (lesson: any) => {
        if (!inscripcion) return true;
        if (!curso.lecciones || curso.lecciones.length === 0) return false;

        // Sorting estable: si no hay orden, usamos 999 para enviarlos al final o 0 para el inicio?
        // Usaremos 0 por defecto y si hay empate, usamos el ID para que sea determinístico.
        const sortedLecciones = [...curso.lecciones].sort((a, b) => {
            const ordA = a.orden ?? 0;
            const ordB = b.orden ?? 0;
            if (ordA !== ordB) return ordA - ordB;
            return String(a.id).localeCompare(String(b.id));
        });

        const myIndex = sortedLecciones.findIndex(l => l.id === lesson.id);

        if (myIndex <= 0) {
            // La primera lección siempre está desbloqueada
            return false;
        }

        // Si no es la primera, requerimos que la inmediatamente anterior esté completada
        const anterior = sortedLecciones[myIndex - 1];
        return !isLessonCompleted(anterior);
    };

    // ── Save video progress to DB (throttled by InteractiveVideoPlayer) ──
    const handleVideoProgressUpdate = useCallback(async (maxReached: number, completed: boolean) => {
        if (!inscripcion?.id || !activeLesson?.id) return;
        const { data: { session } } = await supabase.auth.getSession();
        fetch(`${API_URL}/lms/inscripciones/${inscripcion.id}/video-progreso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ leccion_id: activeLesson.id, maxReached, completed })
        }).catch(e => console.warn('[LMS] Video progress save failed:', e));
        // If completed, also mark as completed locally so button stays enabled
        if (completed) setVideoCompleted(true);
    }, [inscripcion?.id, activeLesson?.id]);

    if (!isClient) {
        return (
            <div style={{ textAlign: 'center', padding: '10rem' }}>
                <div style={{ color: 'var(--secondary)' }}>Cargando aula virtual...</div>
            </div>
        );
    }

    if (loadingCurso || !curso) return <div style={{ textAlign: 'center', padding: '10rem' }}>Cargando datos del curso...</div>;

    const handleEnrol = () => enrolMutation.mutate();



    const handleSubmitQuiz = async () => {
        if (loadingLesson) {
            alert("Espera a que se carguen las preguntas...");
            return;
        }

        const totalPreguntas = activeLesson?.preguntas?.length || 0;
        const preguntasRespondidas = Object.keys(quizAnswers).length;

        if (totalPreguntas === 0) {
            alert("No hay preguntas en este test.");
            return;
        }

        if (preguntasRespondidas < totalPreguntas) {
            alert(`Por favor responde todas las preguntas (${preguntasRespondidas}/${totalPreguntas}) antes de enviar.`);
            return;
        }

        if (activeLesson.tipo === 'encuesta') {
            // Guardar encuesta de satisfacción con rating + observación
            const ratingEntries = Object.entries(quizAnswers)
                .map(([pid, val]) => ({
                    pregunta_id: pid,
                    tipo: activeLesson.preguntas?.find((p: any) => p.id === pid)?.tipo_pregunta || 'single',
                    respuesta_seleccionada: val
                }));

            const { data: { session } } = await supabase.auth.getSession();
            fetch(`${API_URL}/lms/encuesta-satisfaccion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({
                    inscripcion_id: inscripcion.id,
                    leccion_id: activeLesson.id,
                    curso_id: id,
                    perfil_id: profile?.id,
                    respuestas: ratingEntries,
                    observacion: observacion.trim() || null
                })
            }).catch(e => console.warn('[LMS] Survey save failed (non-blocking):', e));

            completarMutation.mutate(activeLesson.id);
            setQuizResult({ calificacion: 100, aciertos: totalPreguntas, totalPreguntas, aprobado: true, tipo_test: 'encuesta' });
            return;
        }

        const formattedAnswers = Object.entries(quizAnswers).map(([pid, val]) => ({
            pregunta_id: pid,
            respuesta_seleccionada: val
        }));

        scoreMutation.mutate({
            inscripcion_id: inscripcion.id,
            leccion_id: activeLesson.id,
            respuestas: formattedAnswers,
            tipo_test: activeLesson.tipo === 'pre-test' ? 'pre' : 'post'
        });
    };

    // Pantalla de Bienvenida (No Enrolado)
    if (!inscripcion) {
        return (
            <ContentArea>
                <WelcomeCard>
                    <GraduationCap size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <h1>{curso.nombre}</h1>
                    <p>{curso.descripcion}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '1rem', border: '1px solid var(--gray-100)', borderRadius: '8px' }}>
                            <Clock size={20} />
                            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Duración libre</div>
                        </div>
                        <div style={{ padding: '1rem', border: '1px solid var(--gray-100)', borderRadius: '8px' }}>
                            <ClipboardCheck size={20} />
                            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Tests Pre/Post</div>
                        </div>
                        <div style={{ padding: '1rem', border: '1px solid var(--gray-100)', borderRadius: '8px' }}>
                            <Award size={20} />
                            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Certificado</div>
                        </div>
                    </div>
                    <ActionButton onClick={handleEnrol}>
                        Inscribirse en el Curso
                    </ActionButton>
                </WelcomeCard>
            </ContentArea>
        );
    }

    return (
        <Container>
            <Sidebar>
                <SidebarHeader>
                    <button onClick={() => router.push('/dashboard/virtual-classroom')}>
                        <ArrowLeft size={16} /> Regresar al catálogo
                    </button>
                    <h2>Contenido del Curso</h2>
                </SidebarHeader>
                {curso.lecciones?.sort((a: any, b: any) => {
                    const ordA = a.orden ?? 0;
                    const ordB = b.orden ?? 0;
                    if (ordA !== ordB) return ordA - ordB;
                    return String(a.id).localeCompare(String(b.id));
                }).map((lesson: any, idx: number) => {
                    const locked = isLessonLocked(lesson);
                    const completed = isLessonCompleted(lesson);
                    return (
                        <LessonItem
                            key={lesson.id}
                            $active={activeLesson?.id === lesson.id}
                            $locked={locked}
                            $completed={completed}
                            onClick={() => {
                                if (locked) {
                                    alert("Lección bloqueada. Debes completar la lección anterior primero.");
                                    return;
                                }
                                selectLesson(lesson);
                            }}
                        >
                            <div style={{ color: completed ? '#12A152' : (activeLesson?.id === lesson.id ? '#12A152' : '#5f6368') }}>
                                {completed ? <CheckCircle2 size={18} /> : (
                                    lesson.tipo === 'video' ? <Video size={18} /> :
                                        lesson.tipo === 'pdf' ? <FileText size={18} /> :
                                            lesson.tipo === 'actividad' ? <Shuffle size={18} /> :
                                                lesson.tipo === 'foro' ? <Star size={18} /> :
                                                    lesson.tipo === 'encuesta' ? <Eye size={18} /> :
                                                        <ClipboardCheck size={18} />
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: activeLesson?.id === lesson.id ? '#12A152' : '#3c4043' }}>
                                    {lesson.titulo}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#80868b' }}>
                                    {lesson.tipo === 'video' ? 'Video lección' : lesson.tipo === 'pdf' ? 'Material PDF' : lesson.tipo === 'actividad' ? 'Actividad Interactiva' : lesson.tipo === 'foro' ? 'Foro / Casos' : lesson.tipo === 'encuesta' ? 'Encuesta' : 'Evaluación'}
                                </div>
                            </div>
                            {locked && <Lock size={14} color="#80868b" />}
                            {!locked && completed && <Check size={14} color="#12A152" style={{ marginLeft: 'auto' }} />}
                        </LessonItem>
                    );
                })}
            </Sidebar>

            <ContentArea>
                {loadingLesson ? (
                    <div style={{ textAlign: 'center', padding: '10rem' }}>
                        <div style={{ color: 'var(--secondary)' }}>Cargando lección...</div>
                    </div>
                ) : activeLesson ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h1>{activeLesson.titulo}</h1>
                            {inscripcion.estado === 'Finalizado' && (
                                <CertificateDownloader
                                    studentName={`${profile?.nombres} ${profile?.apellidos}`}
                                    courseName={curso.nombre}
                                    date={new Date(inscripcion.fecha_finalizacion).toLocaleDateString()}
                                    verificationCode={inscripcion.id.split('-')[0].toUpperCase()}
                                />
                            )}
                            {activeLesson.archivo_url && (
                                <ActionButton as="a" href={activeLesson.archivo_url} target="_blank" style={{ background: '#0288d1' }}>
                                    <Download size={18} /> Descargar Material
                                </ActionButton>
                            )}
                        </div>

                        {activeLesson.tipo === 'video' && (
                            <div>
                                <InteractiveVideoPlayer
                                    videoUrl={activeLesson.recurso_url || ''}
                                    marcadores={activeLesson.config?.marcadores || []}
                                    savedProgress={inscripcion?.video_progresos?.[activeLesson.id]}
                                    onProgressUpdate={handleVideoProgressUpdate}
                                    onVideoComplete={() => setVideoCompleted(true)}
                                />
                                {activeLesson.contenido && (
                                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: 12, border: '1px solid var(--gray-100)', color: '#3c4043', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                        <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--primary)' }}>Instrucciones de la lección</h4>
                                        {activeLesson.contenido}
                                    </div>
                                )}
                                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                                    {!videoCompleted ? (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#f5f5f5', borderRadius: 8, color: '#80868b', fontSize: '0.88rem', fontWeight: 500 }}>
                                            ⏳ Ver el video completo para continuar
                                        </div>
                                    ) : (
                                        <ActionButton onClick={() => completarMutation.mutate(activeLesson.id)} disabled={completarMutation.isPending}>
                                            {completarMutation.isPending ? 'Guardando...' : 'Finalizar Lección ✓'}
                                        </ActionButton>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeLesson.tipo === 'pdf' && (
                            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px' }}>
                                <FileText size={64} style={{ color: '#ea4335', marginBottom: '1rem' }} />
                                <h3>Recurso Completo</h3>
                                <p style={{ margin: '1rem 0 1rem' }}>Haz clic para descargar o leer el material.</p>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <ActionButton as="a" href={activeLesson.recurso_url} target="_blank">
                                        <Download size={18} /> Descargar PDF
                                    </ActionButton>
                                    <ActionButton onClick={() => completarMutation.mutate(activeLesson.id)} disabled={completarMutation.isPending} style={{ background: '#12A152' }}>
                                        {completarMutation.isPending ? 'Guardando...' : 'Marcar como leído ✓'}
                                    </ActionButton>
                                </div>
                            </div>
                        )}

                        {activeLesson.tipo === 'actividad' && (
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--gray-100)' }}>
                                {activeLesson.config?.tipo_actividad === 'sopa_letras' ? (
                                    <WordSearch
                                        words={wordList}
                                        onComplete={(timeElapsed) => {
                                            console.log(`[LMS] Word Search completed in ${timeElapsed} seconds`);
                                            completarMutation.mutate(activeLesson.id);
                                        }}
                                    />
                                ) : (
                                    <>
                                        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: 8, overflow: 'hidden', background: '#f8f9fa' }}>
                                            <iframe
                                                src={activeLesson.recurso_url}
                                                frameBorder="0"
                                                width="100%"
                                                height="100%"
                                                style={{ position: 'absolute', top: 0, left: 0 }}
                                                allowFullScreen
                                            />
                                        </div>
                                        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                                            <ActionButton onClick={() => completarMutation.mutate(activeLesson.id)} disabled={completarMutation.isPending}>
                                                {completarMutation.isPending ? 'Guardando...' : 'Finalizar Actividad ✓'}
                                            </ActionButton>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeLesson.tipo === 'foro' && (
                            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 12, border: '1px solid var(--gray-100)' }}>
                                <Star size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                <h3>Foro de Casos Prácticos</h3>
                                <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>El sistema avanzado de foros se construirá en la Fase 3.</p>
                                <ActionButton onClick={() => completarMutation.mutate(activeLesson.id)} style={{ margin: '0 auto' }}>
                                    Marcar participación como completada
                                </ActionButton>
                            </div>
                        )}

                        {(activeLesson.tipo === 'pre-test' || activeLesson.tipo === 'post-test' || activeLesson.tipo === 'encuesta') && (
                            <QuizContainer>
                                {loadingLesson ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando preguntas...</div>
                                ) : (activeLesson.tipo === 'pre-test' && (inscripcion?.calificacion_pre !== null && inscripcion?.calificacion_pre !== undefined) && !quizResult) ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                                        <div style={{
                                            width: 110, height: 110,
                                            borderRadius: '50%',
                                            background: '#f1fdf5',
                                            border: '4px solid #12A152',
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 1.5rem'
                                        }}>
                                            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#12A152' }}>
                                                {inscripcion.calificacion_pre}%
                                            </span>
                                        </div>
                                        <h2 style={{ margin: '0 0 0.5rem', color: '#12A152' }}>¡Pre-test ya realizado!</h2>
                                        <p style={{ color: '#5f6368', margin: '0 0 1.5rem' }}>
                                            Ya has completado esta evaluación inicial. Puedes continuar con el resto de las lecciones del curso.
                                        </p>
                                        <ActionButton onClick={() => setActiveLesson(null)} style={{ margin: '0 auto' }}>
                                            Volver al Contenido
                                        </ActionButton>
                                    </div>
                                ) : activeLesson.tipo === 'post-test' && inscripcion.intentos_post >= 2 && inscripcion.calificacion_post < 60 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <AlertCircle size={48} color="#ea4335" style={{ marginBottom: '1rem' }} />
                                        <h3>Límite de intentos alcanzado</h3>
                                        <p style={{ margin: '1rem 0' }}>Has realizado 2 intentos sin alcanzar el 60%. Debes volver a repasar los materiales para habilitar un nuevo intento.</p>
                                        <ActionButton onClick={() => {/* Lógica para resetear o simplemente avisar */ }}>
                                            Entendido, repasaré el material
                                        </ActionButton>
                                    </div>
                                ) : quizResult ? (
                                    // ── Score Result Card ──────────────────────────────
                                    <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                                        <div style={{
                                            width: 110, height: 110,
                                            borderRadius: '50%',
                                            background: (quizResult.tipo_test === 'pre' || quizResult.tipo_test === 'encuesta' || quizResult.aprobado) ? '#f1fdf5' : '#fff5f5',
                                            border: `4px solid ${(quizResult.tipo_test === 'pre' || quizResult.tipo_test === 'encuesta' || quizResult.aprobado) ? '#12A152' : '#ea4335'}`,
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 1.5rem'
                                        }}>
                                            {quizResult.tipo_test === 'encuesta' ? (
                                                <Eye size={48} color="#12A152" />
                                            ) : (
                                                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: (quizResult.tipo_test === 'pre' || quizResult.aprobado) ? '#12A152' : '#ea4335' }}>
                                                    {quizResult.calificacion}%
                                                </span>
                                            )}
                                        </div>
                                        <h2 style={{ margin: '0 0 0.5rem', color: (quizResult.tipo_test === 'pre' || quizResult.tipo_test === 'encuesta' || quizResult.aprobado) ? '#12A152' : '#ea4335' }}>
                                            {quizResult.tipo_test === 'pre' ? '¡Test Completado!' : quizResult.tipo_test === 'encuesta' ? '¡Encuesta Completada!' : (quizResult.aprobado ? '¡Aprobado!' : 'No Aprobado')}
                                        </h2>
                                        <p style={{ color: '#5f6368', margin: '0 0 1.5rem' }}>
                                            {quizResult.tipo_test === 'pre'
                                                ? 'Hemos registrado tu nivel inicial. Puedes continuar con las lecciones.'
                                                : quizResult.tipo_test === 'encuesta'
                                                    ? 'Muchas gracias por tus respuestas. Tu opinión es muy importante para nosotros.'
                                                    : `Respondiste correctamente ${quizResult.aciertos} de ${quizResult.totalPreguntas} preguntas.`}
                                        </p>
                                        <ActionButton onClick={() => {
                                            refetchInsc();
                                            setQuizResult(null);
                                            setActiveLesson(null);
                                        }} style={{ margin: '0 auto' }}>
                                            {quizResult.tipo_test === 'pre' ? 'Comenzar Lecciones' : 'Continuar con el Curso'}
                                        </ActionButton>
                                    </div>
                                ) : (
                                    <>
                                        <QuizFormHeader>
                                            <QuizHeaderTopBar />
                                            <QuizHeaderContent>
                                                <QuizTitle>
                                                    {curso.nombre} - {activeLesson.tipo === 'pre-test' ? 'Evaluación Inicial' : activeLesson.tipo === 'post-test' ? 'Evaluación Final' : 'Encuesta de Satisfacción'}
                                                </QuizTitle>
                                                <QuizDesc>
                                                    {activeLesson.descripcion || `Por favor, responde honestamente a todas las preguntas presentadas a continuación. Tus resultados ${activeLesson.tipo === 'encuesta' ? 'son anónimos y ' : ''}serán utilizados para mejorar la calidad del área encargada.`}
                                                </QuizDesc>
                                                <QuizHeaderDivider />
                                                <QuizMetaRow>
                                                    <strong>Área responsable (Instructor):</strong> {curso.instructor || curso.area_responsable || 'No especificada'}
                                                </QuizMetaRow>
                                                <QuizMetaRow>
                                                    <strong>Duración estimada del curso:</strong> {curso.duracion_estimada || 'No especificada'}
                                                </QuizMetaRow>
                                                <RequiredText>* Obligatorio</RequiredText>
                                            </QuizHeaderContent>
                                        </QuizFormHeader>

                                        {activeLesson.preguntas?.map((q: any, idx: number) => {
                                            const tipo = q.tipo_pregunta || 'single';

                                            return (
                                                <QuestionCard key={q.id}>
                                                    <h3>{idx + 1}. {q.pregunta} <span className="req">*</span></h3>

                                                    {/* ── TIPO: SINGLE CHOICE ───────────────── */}
                                                    {tipo === 'single' && q.opciones?.map((opt: string, i: number) => {
                                                        const isSelected = quizAnswers[q.id] === i;
                                                        return (
                                                            <Option key={i} $selected={isSelected} onClick={(e) => {
                                                                e.preventDefault();
                                                                setQuizAnswers(prev => ({ ...prev, [q.id]: i }));
                                                            }}>
                                                                <input
                                                                    type="radio"
                                                                    className="hidden-input"
                                                                    name={q.id}
                                                                    checked={isSelected}
                                                                    readOnly
                                                                />
                                                                <CustomRadio $selected={isSelected} />
                                                                <OptionText>{opt}</OptionText>
                                                            </Option>
                                                        )
                                                    })}

                                                    {/* ── TIPO: MULTIPLE CHOICE ─────────────── */}
                                                    {tipo === 'multiple' && q.opciones?.map((opt: string, i: number) => {
                                                        const current = (quizAnswers[q.id] || []) as any[];
                                                        const isSelected = Array.isArray(current) && current.includes(i);
                                                        const toggle = (e: React.MouseEvent) => {
                                                            e.preventDefault();
                                                            const next = isSelected ? current.filter((x: any) => x !== i) : [...current, i];
                                                            setQuizAnswers(prev => ({ ...prev, [q.id]: next }));
                                                        };
                                                        return (
                                                            <Option key={i} $selected={isSelected} onClick={toggle}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden-input"
                                                                    checked={isSelected}
                                                                    readOnly
                                                                />
                                                                <div style={{
                                                                    width: 20, height: 20, border: `2px solid ${isSelected ? 'var(--primary)' : '#bdc1c6'}`,
                                                                    borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', flexShrink: 0,
                                                                    background: isSelected ? 'var(--primary)' : 'transparent',
                                                                    pointerEvents: 'none'
                                                                }}>
                                                                    <Check size={14} color="white" style={{ opacity: isSelected ? 1 : 0, transition: '0.2s' }} />
                                                                </div>
                                                                <OptionText>{opt}</OptionText>
                                                            </Option>
                                                        );
                                                    })}

                                                    {/* ── TIPO: MATCHING (ENLAZAR) ──────────── */}
                                                    {tipo === 'matching' && (
                                                        <div>
                                                            {(q.pares || (q.datos_extra && q.datos_extra.pares) || q.opciones || []).map((par: any, pIdx: number) => {
                                                                // Resolver par izquierdo: si es objeto pares { izquierda, derecha } sino, usar el texto plano de la opcion.
                                                                const isObject = typeof par === 'object' && par !== null;
                                                                const izquierdaTexto = isObject ? par.izquierda : par;

                                                                const currentMatches = (quizAnswers[q.id] || []) as any[];
                                                                const currentPair = Array.isArray(currentMatches) ? currentMatches.find((m: any) => m.izquierda === pIdx) : null;
                                                                const handleMatch = (val: number) => {
                                                                    const next = Array.isArray(currentMatches) ? currentMatches.filter((m: any) => m.izquierda !== pIdx) : [];
                                                                    if (val !== -1) next.push({ izquierda: pIdx, derecha: val, correcta: pIdx });
                                                                    setQuizAnswers(prev => ({ ...prev, [q.id]: next }));
                                                                };

                                                                return (
                                                                    <MatchingRow key={pIdx}>
                                                                        <div style={{ fontWeight: 500 }}>{izquierdaTexto}</div>
                                                                        <Link2 size={16} color="#ccc" />
                                                                        <select
                                                                            value={currentPair ? currentPair.derecha : -1}
                                                                            onChange={e => handleMatch(Number(e.target.value))}
                                                                            style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid var(--gray-100)', width: '100%', fontSize: '0.85rem' }}
                                                                        >
                                                                            <option value={-1}>Seleccionar match...</option>
                                                                            {/* Usar opciones mezcladas */}
                                                                            {(shuffledData[q.id] || []).map((matchOpt: any, sIdx: number) => (
                                                                                <option key={sIdx} value={matchOpt.originalIdx}>{matchOpt.text}</option>
                                                                            ))}
                                                                        </select>
                                                                    </MatchingRow>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* ── TIPO: ORDERING (ORDENAR) ──────────── */}
                                                    {tipo === 'ordering' && (
                                                        <OrderList>
                                                            {(() => {
                                                                const currentOrder = quizAnswers[q.id] || shuffledData[q.id] || q.opciones || [];
                                                                const moveItem = (from: number, to: number) => {
                                                                    const next = [...currentOrder];
                                                                    const item = next.splice(from, 1)[0];
                                                                    next.splice(to, 0, item);
                                                                    setQuizAnswers(prev => ({ ...prev, [q.id]: next }));
                                                                };

                                                                return currentOrder.map((item: string, i: number) => (
                                                                    <OrderItem key={i}>
                                                                        <OrderButtons>
                                                                            <IconButton onClick={() => moveItem(i, i - 1)} disabled={i === 0}><ChevronUp size={16} /></IconButton>
                                                                            <IconButton onClick={() => moveItem(i, i + 1)} disabled={i === currentOrder.length - 1}><ChevronDown size={16} /></IconButton>
                                                                        </OrderButtons>
                                                                        <span style={{ background: '#f0f0f0', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>{i + 1}</span>
                                                                        <div style={{ flex: 1, fontSize: '0.9rem' }}>{item}</div>
                                                                        <MoveVertical size={16} color="#ccc" />
                                                                    </OrderItem>
                                                                ));
                                                            })()}
                                                        </OrderList>
                                                    )}

                                                    {/* ── TIPO: DRAG & DROP (COMPLETAR) ───────── */}
                                                    {tipo === 'drag-drop' && (
                                                        <div style={{ padding: '0.5rem 0' }}>
                                                            <div style={{ fontSize: '1.2rem', lineHeight: '2.5', marginBottom: '1.5rem' }}>
                                                                {(() => {
                                                                    const parts = String(q.pregunta).split('[blank]');
                                                                    return parts.map((part, i) => (
                                                                        <React.Fragment key={i}>
                                                                            {part}
                                                                            {i < parts.length - 1 && (
                                                                                <DropZone
                                                                                    $hasValue={!!quizAnswers[q.id]}
                                                                                    $isOver={false} // Simplificado por ahora
                                                                                    onDragOver={(e) => e.preventDefault()}
                                                                                    onDrop={(e) => {
                                                                                        const val = e.dataTransfer.getData('text/plain');
                                                                                        setQuizAnswers(prev => ({ ...prev, [q.id]: val }));
                                                                                    }}
                                                                                >
                                                                                    {quizAnswers[q.id] || '......'}
                                                                                </DropZone>
                                                                            )}
                                                                        </React.Fragment>
                                                                    ));
                                                                })()}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', background: '#f8f9fa', padding: '1rem', borderRadius: 12 }}>
                                                                {(shuffledData[q.id] || []).map((opt: string, i: number) => (
                                                                    <DragChip
                                                                        key={i}
                                                                        draggable
                                                                        onDragStart={(e) => {
                                                                            e.dataTransfer.setData('text/plain', opt);
                                                                        }}
                                                                        onClick={() => { // Fallback para tablets/clic
                                                                            setQuizAnswers(prev => ({ ...prev, [q.id]: opt }));
                                                                        }}
                                                                    >
                                                                        {opt}
                                                                    </DragChip>
                                                                ))}
                                                                <button
                                                                    onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: '' }))}
                                                                    style={{ background: 'none', border: 'none', color: '#80868b', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                                                                >
                                                                    Reiniciar espacio
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* ── TIPO: RATING (ESCALA) ──────────────── */}
                                                    {tipo === 'rating' && (
                                                        <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem 0', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                {[1, 2, 3, 4, 5].map(v => (
                                                                    <button
                                                                        key={v}
                                                                        onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: v }))}
                                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
                                                                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                                                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                                    >
                                                                        <Star
                                                                            size={48}
                                                                            fill={(quizAnswers[q.id] || 0) >= v ? '#FFD700' : 'none'}
                                                                            color={(quizAnswers[q.id] || 0) >= v ? '#FFD700' : '#ccc'}
                                                                            strokeWidth={1.5}
                                                                        />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)', marginTop: '0.5rem' }}>
                                                                {quizAnswers[q.id] ? (
                                                                    quizAnswers[q.id] === 5 ? '¡Excelente! ⭐⭐⭐⭐⭐' :
                                                                        quizAnswers[q.id] === 4 ? 'Muy bueno ⭐⭐⭐⭐' :
                                                                            quizAnswers[q.id] === 3 ? 'Bueno ⭐⭐⭐' :
                                                                                quizAnswers[q.id] === 2 ? 'Regular ⭐⭐' : 'Podría mejorar ⭐'
                                                                ) : 'Selecciona una puntuación'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </QuestionCard>
                                            );
                                        })}
                                        {/* ── OBSERVACIÓN (Solo encuestas) ────── */}
                                        {activeLesson.tipo === 'encuesta' && (
                                            <div style={{ marginBottom: '1.5rem', background: '#f8f9fa', borderRadius: 12, padding: '1.25rem', border: '1px dashed #ccc' }}>
                                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.6rem', color: '#3c4043' }}>
                                                    ✏️ Observaciones o comentarios adicionales <span style={{ fontWeight: 400, color: '#80868b' }}>(Opcional)</span>
                                                </label>
                                                <textarea
                                                    value={observacion}
                                                    onChange={e => setObservacion(e.target.value)}
                                                    placeholder="¿Hay algo que quieras agregar sobre el curso o el contenido?"
                                                    rows={4}
                                                    style={{
                                                        width: '100%', border: '1px solid #e0e0e0', borderRadius: 8,
                                                        padding: '0.75rem', fontFamily: 'inherit', fontSize: '0.9rem',
                                                        resize: 'vertical', background: 'white', boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <ActionButton
                                            onClick={handleSubmitQuiz}
                                            disabled={scoreMutation.isPending}
                                            style={{ width: '100%', justifyContent: 'center' }}
                                        >
                                            {scoreMutation.isPending ? 'Enviando...' : 'Enviar Respuestas'}
                                        </ActionButton>
                                    </>
                                )}
                            </QuizContainer>
                        )}

                        <div style={{ marginTop: '2rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                            {activeLesson.contenido}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '10rem' }}>
                        <GraduationCap size={64} style={{ opacity: 0.1 }} />
                        <h2 style={{ marginTop: '1rem', color: 'var(--secondary)' }}>Selecciona una lección para comenzar</h2>
                    </div>
                )}
            </ContentArea>
        </Container>
    );
}
