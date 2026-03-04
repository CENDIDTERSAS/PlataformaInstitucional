'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Settings,
    GripVertical,
    Video,
    FileText,
    ClipboardCheck,
    Edit2,
    Shuffle,
    Star,
    Eye
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import LessonModal from '@/components/lms/LessonModal';
import CourseModal from '@/components/lms/CourseModal';

const Container = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 { font-size: 1.8rem; font-weight: 700; color: var(--text); }
`;

const CourseInfo = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--gray-100);
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const LessonCard = styled.div`
  background: white;
  border: 1px solid var(--gray-100);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;

  &:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
`;

const LessonIcon = styled.div<{ $type: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => {
        if (props.$type === 'video') return '#e8f0fe';
        if (props.$type === 'pdf') return '#fce8e6';
        return '#fef7e0';
    }};
  color: ${props => {
        if (props.$type === 'video') return '#1967d2';
        if (props.$type === 'pdf') return '#d93025';
        return '#b06000';
    }};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LessonMain = styled.div`
  flex: 1;
  h4 { font-weight: 600; font-size: 1rem; }
  span { font-size: 0.8rem; color: var(--secondary); text-transform: uppercase; }
`;

const ActionButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  
  &:hover { background: var(--gray-100); color: #ea4335; }
`;

const Toast = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #12A152;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translateY(${props => props.$visible ? '0' : '1rem'});
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 9999;
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditCourse() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<any>(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    // Drag and Drop state
    const [lessons, setLessons] = useState<any[]>([]);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // 1. Obtener detalles del curso (Move this up so it can be used by useEffect)
    const { data: curso, isLoading } = useQuery({
        queryKey: ['lms-curso-edit', id],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/cursos/${id}`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            return res.json();
        }
    });

    // Update local lessons when fetching finishes
    useEffect(() => {
        if (curso?.lecciones) {
            setLessons([...curso.lecciones].sort((a: any, b: any) => a.orden - b.orden));
        }
    }, [curso]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2500);
    };

    const openModal = (lesson: any = null) => {
        setEditingLesson(lesson);
        setIsModalOpen(true);
    };

    // 2. Mutación para crear lección
    const createLessonMutation = useMutation({
        mutationFn: async (data: any) => {
            const { preguntas, id: lessonId, ...lessonData } = data;
            const { data: { session } } = await supabase.auth.getSession();
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            };

            let leccion;
            if (lessonId) {
                // Update
                const res = await fetch(`${API_URL}/lms/lecciones/${lessonId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(lessonData)
                });
                if (!res.ok) {
                    const body = await res.text();
                    throw new Error(`No se pudo actualizar la lección (${res.status}): ${body}`);
                }
                leccion = await res.json();
            } else {
                // Create
                const res = await fetch(`${API_URL}/lms/lecciones`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(lessonData)
                });
                if (!res.ok) {
                    const body = await res.text();
                    throw new Error(`No se pudo crear la lección (${res.status}): ${body}`);
                }
                leccion = await res.json();
            }

            // Si tiene preguntas, crearlas asociadas a la lección
            if (preguntas && preguntas.length > 0) {
                console.log("[LMS] Saving questions for leccion:", leccion?.id || lessonId);
                const resPreguntas = await fetch(`${API_URL}/lms/preguntas`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ leccion_id: leccion?.id || lessonId, preguntas })
                });
                if (!resPreguntas.ok) {
                    const body = await resPreguntas.text();
                    throw new Error(`La lección se guardó, pero falló guardar preguntas (${resPreguntas.status}): ${body}`);
                }
            }
            return leccion;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-curso-edit', id] });
            setIsModalOpen(false);
            setEditingLesson(null);
            alert('¡Cambios guardados correctamente!');
        },
        onError: (error: any) => {
            alert(`Error al guardar la lección: ${error?.message || 'desconocido'}`);
        }
    });

    // 3. Mutación para eliminar lección
    const deleteLessonMutation = useMutation({
        mutationFn: async (lessonId: string) => {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/lecciones/${lessonId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            if (!res.ok) throw new Error('Error al eliminar la lección');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-curso-edit', id] });
            showToast('¡Lección eliminada correctamente!');
        },
        onError: (error: any) => {
            showToast(`Error: ${error.message}`);
        }
    });


    // 4. Mutación para actualizar detalles del curso
    const updateCourseMutation = useMutation({
        mutationFn: async (updatedCourse: any) => {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/cursos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(updatedCourse)
            });
            if (!res.ok) throw new Error('Error al actualizar el curso');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-curso-edit', id] });
            setIsCourseModalOpen(false);
            showToast('¡Detalles del curso actualizados!');
        }
    });

    // 5. Mutación para guardar el nuevo orden de las lecciones
    const reorderLessonsMutation = useMutation({
        mutationFn: async (orderedLessons: any[]) => {
            const { data: { session } } = await supabase.auth.getSession();
            // Creamos un array con { id, orden }
            const payload = orderedLessons.map((l, index) => ({ id: l.id, orden: index + 1 }));

            const res = await fetch(`${API_URL}/lms/cursos/${id}/lecciones/orden`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ lecciones: payload })
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Error al reordenar: ${res.status} ${errText}`);
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-curso-edit', id] });
            showToast('Nuevo orden de currículo guardado');
        },
        onError: (err: any) => {
            showToast(err.message || 'Error al guardar el nuevo orden. Intenta nuevamente.');
            // Revert local state on error
            if (curso?.lecciones) setLessons([...curso.lecciones].sort((a: any, b: any) => a.orden - b.orden));
        }
    });

    const handleSort = () => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            let _lessons = [...lessons];
            const draggedItemContent = _lessons.splice(dragItem.current, 1)[0];
            _lessons.splice(dragOverItem.current, 0, draggedItemContent);

            setLessons(_lessons);
            // Auto-save the new order when dropped
            reorderLessonsMutation.mutate(_lessons);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    if (isLoading) return <div>Cargando editor...</div>;

    return (
        <Container>
            <div style={{ marginBottom: '1rem' }}>
                <button
                    onClick={() => router.push('/dashboard/virtual-classroom')}
                    style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={16} /> Volver al Aula Virtual
                </button>
            </div>

            <Header>
                <h1><Settings size={28} /> Gestionar Contenido</h1>
                <ActionButton onClick={() => openModal()}>
                    <Plus size={20} /> Añadir Lección
                </ActionButton>
            </Header>

            <CourseInfo>
                <div style={{
                    width: '120px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    <img
                        src={curso.imagen_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80'}
                        alt="Course"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{curso.nombre}</h2>
                        <IconButton onClick={() => setIsCourseModalOpen(true)} title="Editar Detalles del Curso">
                            <Edit2 size={16} />
                        </IconButton>
                    </div>
                    <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>{curso.descripcion?.substring(0, 100)}...</p>
                </div>
            </CourseInfo>

            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Estructura Curricular ({curso.lecciones?.length || 0})
            </h3>

            {lessons.map((lesson: any, idx: number) => (
                <LessonCard
                    key={lesson.id}
                    draggable
                    onDragStart={(e) => {
                        dragItem.current = idx;
                        e.currentTarget.style.opacity = '0.4';
                    }}
                    onDragEnter={(e) => {
                        dragOverItem.current = idx;
                    }}
                    onDragEnd={(e) => {
                        e.currentTarget.style.opacity = '1';
                        handleSort();
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    style={{ cursor: 'grab' }}
                >
                    <GripVertical size={18} color="var(--gray-100)" />
                    <LessonIcon $type={lesson.tipo}>
                        {lesson.tipo === 'video' ? <Video size={20} /> :
                            lesson.tipo === 'pdf' ? <FileText size={20} /> :
                                lesson.tipo === 'actividad' ? <Shuffle size={20} /> :
                                    lesson.tipo === 'foro' ? <Star size={20} /> :
                                        lesson.tipo === 'encuesta' ? <Eye size={20} /> :
                                            <ClipboardCheck size={20} />}
                    </LessonIcon>
                    <LessonMain>
                        <span>Lección {idx + 1} - {lesson.tipo}</span>
                        <h4>{lesson.titulo}</h4>
                    </LessonMain>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {confirmingDeleteId === lesson.id ? (
                            <>
                                <span style={{ fontSize: '0.8rem', color: '#ea4335' }}>¿Eliminar?</span>
                                <IconButton
                                    onClick={() => { deleteLessonMutation.mutate(lesson.id); setConfirmingDeleteId(null); }}
                                    style={{ color: '#ea4335', fontWeight: 700 }}
                                >
                                    Sí
                                </IconButton>
                                <IconButton onClick={() => setConfirmingDeleteId(null)}>No</IconButton>
                            </>
                        ) : (
                            <>
                                <IconButton onClick={() => openModal(lesson)}><Edit2 size={18} /></IconButton>
                                <IconButton
                                    onClick={() => setConfirmingDeleteId(lesson.id)}
                                    style={{ color: '#ea4335' }}
                                >
                                    <Trash2 size={18} />
                                </IconButton>
                            </>
                        )}
                    </div>
                </LessonCard>
            ))}

            {(!curso.lecciones || curso.lecciones.length === 0) && (
                <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: 12, border: '1px dashed var(--gray-100)' }}>
                    <Plus size={32} style={{ color: 'var(--gray-100)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--secondary)' }}>Aún no hay lecciones. Empieza a crear tu currículo.</p>
                </div>
            )}

            <LessonModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingLesson(null); }}
                onSave={(data: any) => createLessonMutation.mutate(data)}
                cursoId={id}
                orden={editingLesson ? editingLesson.orden : (curso.lecciones?.length || 0) + 1}
                lesson={editingLesson}
            />

            {curso && (
                <CourseModal
                    isOpen={isCourseModalOpen}
                    onClose={() => setIsCourseModalOpen(false)}
                    onSave={(data: any) => updateCourseMutation.mutate(data)}
                    profileId={curso.docente_id}
                    initialData={curso}
                />
            )}


            <Toast $visible={toastVisible}>{toastMsg}</Toast>
        </Container>
    );
}

