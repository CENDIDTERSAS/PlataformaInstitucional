'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    GraduationCap,
    Search,
    Plus,
    BookOpen,
    Clock,
    CheckCircle2,
    Award,
    ChevronRight,
    Calendar,
    User,
    Settings,
    Users,
    Download,
    Briefcase,
    AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import CourseModal from '@/components/lms/CourseModal';
import { pdf } from '@react-pdf/renderer';
import { CertificatePDF } from '@/components/lms/CertificatePDF';
import MonitoringModal from '@/components/lms/MonitoringModal';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TitleSection = styled.div`
  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  p {
    color: var(--secondary);
    margin-top: 0.5rem;
  }
`;

const ActionButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #0d8a45;
    transform: translateY(-2px);
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 2rem;
  border-bottom: 1px solid var(--gray-100);
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 1rem 0.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.$active ? 'var(--primary)' : 'var(--secondary)'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--primary);
  }
`;

const CourseGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid var(--gray-100);
  transition: all 0.3s;
  display: flex;
  flex-direction: row;
  min-height: 180px;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CourseImage = styled.div<{ $src?: string }>`
  width: 280px;
  min-width: 280px;
  background-image: url(${props => props.$src || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'});
  background-size: cover;
  background-position: center;
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
    height: 160px;
  }
`;

const CourseBadge = styled.span<{ $status: string }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
        if (props.$status === 'Finalizado') return '#e6f4ea';
        if (props.$status === 'En curso') return 'rgba(18, 161, 82, 0.1)';
        return '#fef7e0';
    }};
  color: ${props => {
        if (props.$status === 'Finalizado') return '#1e8e3e';
        if (props.$status === 'En curso') return '#12A152';
        return '#b06000';
    }};
`;

const CourseContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CourseCategory = styled.span`
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const CourseTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text);
`;

const CourseMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--secondary);
  margin-bottom: 1.5rem;

  div {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

const ProgressBar = styled.div`
  height: 6px;
  background: var(--gray-100);
  border-radius: 3px;
  margin-bottom: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${props => props.$percent}%;
  background: var(--primary);
  transition: width 0.3s;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--secondary);
  font-weight: 500;
`;

const CourseFooter = styled.div`
  padding: 1.5rem;
  border-left: 1px solid var(--gray-100);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  min-width: 180px;

  @media (max-width: 768px) {
    border-left: none;
    border-top: 1px solid var(--gray-100);
    flex-direction: row;
  }
`;

const GradesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid var(--gray-100);

  th, td {
    padding: 1rem 1.5rem;
    text-align: left;
    border-bottom: 1px solid var(--gray-100);
  }

  th {
    background: #f8f9fa;
    color: var(--secondary);
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const Badge = styled.span<{ $type: 'success' | 'warning' | 'danger' | 'info' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  
  background: ${props => {
        if (props.$type === 'success') return '#e6f4ea';
        if (props.$type === 'danger') return 'rgba(18, 161, 82, 0.1)';
        if (props.$type === 'warning') return '#fef7e0';
        return 'rgba(18, 161, 82, 0.1)';
    }};
  
  color: ${props => {
        if (props.$type === 'success') return '#1e8e3e';
        if (props.$type === 'danger') return '#12A152';
        if (props.$type === 'warning') return '#b06000';
        return '#12A152';
    }};
`;

const ViewButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function VirtualClassroom() {
    const [activeTab, setActiveTab] = useState<'catalog' | 'my-courses' | 'my-trainings' | 'grades'>('catalog');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMonitorCourse, setSelectedMonitorCourse] = useState<{ id: string, nombre: string } | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const downloadCertificate = async (insc: any) => {
        try {
            setGeneratingId(insc.id);
            const doc = (
                <CertificatePDF
                    studentName={`${profile?.nombres || 'Estudiante'} ${profile?.apellidos || ''}`}
                    courseName={insc.curso?.nombre || 'Curso'}
                    date={insc.fecha_finalizacion ? new Date(insc.fecha_finalizacion).toLocaleDateString() : new Date().toLocaleDateString()}
                    verificationCode={(insc.id || 'TEST').split('-')[0].toUpperCase()}
                />
            );

            // Generar el blob con tipo forzado para descargar
            const pdfBlob = await pdf(doc).toBlob();
            const blob = new Blob([pdfBlob], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);

            const safeName = (insc.curso?.nombre || 'Certificado').replace(/[^a-z0-9]/gi, '_');
            const fileName = `Certificado_${safeName}.pdf`;

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.visibility = 'hidden';
            link.style.position = 'absolute';

            document.body.appendChild(link);

            // Intento de descarga automática
            link.click();

            // Limpieza
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                setGeneratingId(null);
            }, 500);

        } catch (error) {
            console.error('Error al generar certificado:', error);
            alert('No se pudo generar el certificado. Por favor, intenta de nuevo.');
            setGeneratingId(null);
        }
    };

    // Obtener perfil del usuario
    const { data: profile } = useQuery({
        queryKey: ['my-profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const res = await fetch(`${API_URL}/profile/${user.id}`);
            if (!res.ok) return null;
            return res.json();
        }
    });

    // Obtener permisos del usuario
    const { data: permissions = [] } = useQuery({
        queryKey: ['my-permissions', profile?.id],
        queryFn: async () => {
            if (!profile?.id) return [];
            const res = await fetch(`${API_URL}/users/${profile.id}/permissions`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        enabled: !!profile?.id
    });

    const isPermitted = (modulo: string, accion: string = 'acceso') => {
        if (profile?.rol === 'Administrador') return true;
        return (Array.isArray(permissions) ? permissions : []).some((p: any) => p.modulo === modulo && p.accion === accion);
    };

    // Obtener catálogo de cursos
    const { data: cursos = [], isLoading: loadingCursos } = useQuery({
        queryKey: ['lms-cursos'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/cursos`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            return res.json();
        }
    });

    // Obtener mis inscripciones
    const { data: inscripciones = [], isLoading: loadingInsc } = useQuery({
        queryKey: ['lms-mis-cursos', profile?.id],
        queryFn: async () => {
            if (!profile?.id) return [];
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/mis-cursos/${profile.id}`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            return res.json();
        },
        enabled: !!profile?.id
    });

    // Mutación para crear curso
    const createCourseMutation = useMutation({
        mutationFn: async (newCourse: any) => {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/cursos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(newCourse)
            });
            if (!res.ok) throw new Error('Error al crear el curso');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-cursos'] });
            setIsModalOpen(false);
            alert('¡Curso creado con éxito! Ahora puedes añadir lecciones.');
        }
    });

    // Cursos creados por el usuario
    const myCreatedCourses = cursos.filter((c: any) => c.docente_id === profile?.id);

    const renderContent = () => {
        if (activeTab === 'catalog') {
            return (
                <CourseGrid>
                    {cursos.map((curso: any) => (
                        <CourseCard key={curso.id}>
                            <CourseImage $src={curso.imagen_url}>
                                <CourseBadge $status={curso.estado}>{curso.estado}</CourseBadge>
                            </CourseImage>
                            <CourseContent>
                                <CourseCategory>{curso.categoria || 'General'}</CourseCategory>
                                <CourseTitle>{curso.nombre}</CourseTitle>
                                <CourseMeta>
                                    {curso.area_responsable && <div><Briefcase size={14} /> {curso.area_responsable}</div>}
                                    {curso.duracion_estimada && <div><Clock size={14} /> {curso.duracion_estimada}</div>}
                                    <div><User size={14} /> {curso.docente?.nombres} {curso.docente?.apellidos}</div>
                                    <div><Calendar size={14} /> Inicia: {new Date(curso.fecha_inicio).toLocaleDateString()}</div>
                                </CourseMeta>
                            </CourseContent>
                            <CourseFooter>
                                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                                    {curso.lecciones?.length || 0} Lecciones
                                </div>
                                <ViewButton onClick={() => window.location.href = `/dashboard/virtual-classroom/course/${curso.id}`}>
                                    Ver detalles <ChevronRight size={16} />
                                </ViewButton>
                            </CourseFooter>
                        </CourseCard>
                    ))}
                    {cursos.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>
                            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>No hay cursos disponibles en el catálogo.</p>
                        </div>
                    )}
                </CourseGrid>
            );
        }

        if (activeTab === 'my-courses') {
            return (
                <CourseGrid>
                    {inscripciones.map((insc: any) => (
                        <CourseCard key={insc.id}>
                            <CourseImage $src={insc.curso?.imagen_url}>
                                <CourseBadge $status={insc.estado}>{insc.estado}</CourseBadge>
                            </CourseImage>
                            <CourseContent>
                                <CourseCategory>{insc.curso?.categoria || 'General'}</CourseCategory>
                                <CourseTitle>{insc.curso?.nombre}</CourseTitle>
                                <ProgressBar style={{ marginTop: 'auto' }}>
                                    <ProgressFill $percent={insc.progreso} />
                                </ProgressBar>
                                <ProgressText>
                                    <span>Progreso</span>
                                    <span>{insc.progreso}%</span>
                                </ProgressText>
                            </CourseContent>
                            <CourseFooter>
                                {insc.estado === 'Finalizado' ? (
                                    <ActionButton
                                        disabled={generatingId === insc.id}
                                        onClick={() => downloadCertificate(insc)}
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            backgroundColor: '#12A152',
                                            marginBottom: '0.5rem'
                                        }}
                                    >
                                        <Download size={18} />
                                        {generatingId === insc.id ? 'Generando...' : 'Descargar Certificado'}
                                    </ActionButton>
                                ) : (
                                    <ActionButton
                                        onClick={() => {
                                            if (insc.curso?.estado !== 'Publicado') {
                                                alert('Este curso no se encuentra habilitado actualmente.');
                                                return;
                                            }
                                            window.location.href = `/dashboard/virtual-classroom/course/${insc.curso?.id}`;
                                        }}
                                        style={{ width: '100%', justifyContent: 'center', opacity: insc.curso?.estado !== 'Publicado' ? 0.6 : 1 }}
                                    >
                                        Continuar <ChevronRight size={18} />
                                    </ActionButton>
                                )}

                                {insc.estado === 'Finalizado' && (
                                    <ViewButton
                                        onClick={() => {
                                            if (insc.curso?.estado !== 'Publicado') {
                                                alert('Este curso no se encuentra habilitado actualmente.');
                                                return;
                                            }
                                            window.location.href = `/dashboard/virtual-classroom/course/${insc.curso?.id}`;
                                        }}
                                        style={{ fontSize: '0.85rem', opacity: insc.curso?.estado !== 'Publicado' ? 0.5 : 1 }}
                                    >
                                        Repasar contenido
                                    </ViewButton>
                                )}

                                {insc.curso?.estado !== 'Publicado' && (
                                    <span style={{ fontSize: '0.7rem', color: '#d93025', fontWeight: 600 }}>
                                        <AlertCircle size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                                        Curso deshabilitado
                                    </span>
                                )}
                            </CourseFooter>
                        </CourseCard>
                    ))}
                    {inscripciones.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>
                            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Aún no te has inscrito en ningún curso.</p>
                            <ActionButton onClick={() => setActiveTab('catalog')} style={{ marginTop: '1rem', background: 'none', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                                Explorar Catálogo
                            </ActionButton>
                        </div>
                    )}
                </CourseGrid>
            );
        }

        if (activeTab === 'grades') {
            return (
                <GradesTable>
                    <thead>
                        <tr>
                            <th>Curso</th>
                            <th>Pre-Test</th>
                            <th>Post-Test</th>
                            <th>Progreso</th>
                            <th>Estado Final</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inscripciones.map((insc: any) => (
                            <tr key={insc.id}>
                                <td style={{ fontWeight: 600, color: 'var(--text)' }}>{insc.curso?.nombre}</td>
                                <td>
                                    <Badge $type={insc.calificacion_pre >= 60 ? 'success' : 'info'}>
                                        {insc.calificacion_pre !== null && insc.calificacion_pre !== undefined
                                            ? `${insc.aciertos_pre ?? 0}/${insc.total_pre ?? 0} (${insc.calificacion_pre}%)`
                                            : 'N/A'}
                                    </Badge>
                                </td>
                                <td>
                                    <Badge $type={insc.calificacion_post >= 60 ? 'success' : 'danger'}>
                                        {insc.calificacion_post !== null && insc.calificacion_post !== undefined
                                            ? `${insc.aciertos_post ?? 0}/${insc.total_post ?? 0} (${insc.calificacion_post}%)`
                                            : 'Pendiente'}
                                    </Badge>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ flex: 1, minWidth: '100px', height: 6, background: '#f1f3f4', borderRadius: 3 }}>
                                            <div style={{ height: '100%', width: `${insc.progreso}%`, background: 'var(--primary)', borderRadius: 3 }} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{insc.progreso}%</span>
                                    </div>
                                </td>
                                <td>
                                    <Badge $type={insc.estado === 'Finalizado' ? 'success' : 'warning'}>
                                        {insc.estado}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                        {inscripciones.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>
                                    No hay calificaciones registradas aún.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </GradesTable>
            );
        }

        // Tab de Mis Capacitaciones (Docentes/Admin)
        return (
            <CourseGrid>
                {myCreatedCourses.map((curso: any) => (
                    <CourseCard key={curso.id}>
                        <CourseImage $src={curso.imagen_url}>
                            <CourseBadge $status={curso.estado}>{curso.estado}</CourseBadge>
                        </CourseImage>
                        <CourseContent>
                            <CourseCategory>{curso.categoria || 'General'}</CourseCategory>
                            <CourseTitle>{curso.nombre}</CourseTitle>
                            <CourseMeta>
                                {curso.area_responsable && <div><Briefcase size={14} /> {curso.area_responsable}</div>}
                                {curso.duracion_estimada && <div><Clock size={14} /> {curso.duracion_estimada}</div>}
                                <div><Users size={14} /> {curso.inscripciones_count || 0} inscritos</div>
                                <div><Calendar size={14} /> Fin: {new Date(curso.fecha_fin).toLocaleDateString()}</div>
                            </CourseMeta>
                        </CourseContent>
                        <CourseFooter>
                            <ViewButton onClick={() => window.location.href = `/dashboard/virtual-classroom/edit/${curso.id}`}>
                                <Settings size={16} /> Contenido
                            </ViewButton>
                            <ViewButton
                                onClick={() => setSelectedMonitorCourse({ id: curso.id, nombre: curso.nombre })}
                                style={{ color: 'var(--primary)' }}
                            >
                                <Users size={16} /> Seguimiento
                            </ViewButton>
                        </CourseFooter>
                    </CourseCard>
                ))}
                {myCreatedCourses.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>
                        <Plus size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>Aún no has creado ningún curso.</p>
                        {isPermitted('virtual-classroom', 'crear_cursos') && (
                            <ActionButton onClick={() => setIsModalOpen(true)} style={{ marginTop: '1rem' }}>
                                Crear mi primer curso
                            </ActionButton>
                        )}
                    </div>
                )}
            </CourseGrid>
        );
    };

    return (
        <PageContainer>
            <Header>
                <TitleSection>
                    <h1><GraduationCap size={32} /> Aula Virtual</h1>
                    <p>Potencia tus habilidades y gestiona tu crecimiento profesional.</p>
                </TitleSection>
                {isPermitted('virtual-classroom', 'crear_cursos') && activeTab === 'my-trainings' && (
                    <ActionButton onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> Crear Curso
                    </ActionButton>
                )}
            </Header>

            <TabsContainer>
                <Tab $active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')}>
                    Explorar Cursos
                </Tab>
                <Tab $active={activeTab === 'my-courses'} onClick={() => setActiveTab('my-courses')}>
                    Mis Cursos
                </Tab>
                <Tab $active={activeTab === 'grades'} onClick={() => setActiveTab('grades')}>
                    Calificaciones
                </Tab>
                {(isPermitted('virtual-classroom', 'gestionar_cursos') || profile?.rol === 'Docente') && (
                    <Tab $active={activeTab === 'my-trainings'} onClick={() => setActiveTab('my-trainings')}>
                        Mis Capacitaciones (Docente)
                    </Tab>
                )}
            </TabsContainer>

            {loadingCursos || loadingInsc ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>Cargando cursos...</div>
            ) : renderContent()}

            <CourseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(data: any) => createCourseMutation.mutate(data)}
                profileId={profile?.id}
            />

            <MonitoringModal
                isOpen={!!selectedMonitorCourse}
                onClose={() => setSelectedMonitorCourse(null)}
                cursoId={selectedMonitorCourse?.id}
                cursoNombre={selectedMonitorCourse?.nombre}
            />
        </PageContainer>
    );
}
