'use client';

import React from 'react';
import styled from 'styled-components';
import { X, User, CheckCircle2, AlertCircle, Download, Search, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  &:hover {
    background: var(--gray-100);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--gray-100);
  }

  th {
    background: #f8f9fa;
    color: var(--secondary);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
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
        if (props.$type === 'danger') return '#fce8e6';
        if (props.$type === 'warning') return '#fef7e0';
        return '#e8f0fe';
    }};
  
  color: ${props => {
        if (props.$type === 'success') return '#1e8e3e';
        if (props.$type === 'danger') return '#d93025';
        if (props.$type === 'warning') return '#b06000';
        return '#1967d2';
    }};
`;

const ProgressBarContainer = styled.div`
  width: 100px;
  height: 6px;
  background: #f1f3f4;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${props => props.$percent}%;
  background: var(--primary);
  border-radius: 3px;
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    cursoId?: string;
    cursoNombre?: string;
}

export default function MonitoringModal({ isOpen, onClose, cursoId, cursoNombre }: Props) {
    const { data: inscripciones = [], isLoading } = useQuery({
        queryKey: ['lms-monitoring', cursoId],
        queryFn: async () => {
            if (!cursoId) return [];
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/cursos/${cursoId}/inscripciones`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            if (!res.ok) throw new Error('Error al cargar inscripciones');
            return res.json();
        },
        enabled: isOpen && !!cursoId
    });

    const { data: encuestaData } = useQuery({
        queryKey: ['lms-encuesta-promedio', cursoId],
        queryFn: async () => {
            if (!cursoId) return null;
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/lms/cursos/${cursoId}/encuesta-promedio`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            if (!res.ok) return null;
            return res.json();
        },
        enabled: isOpen && !!cursoId
    });

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2><Search size={24} /> Seguimiento: {cursoNombre}</h2>
                    <CloseButton onClick={onClose}><X size={20} /></CloseButton>
                </ModalHeader>
                <ModalBody>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando datos de seguimiento...</div>
                    ) : inscripciones.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
                            Aún no hay estudiantes inscritos en este curso.
                        </div>
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>Estudiante</th>
                                    <th>Documento</th>
                                    <th>Progreso</th>
                                    <th>Pre-Test</th>
                                    <th>Post-Test</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inscripciones.map((insc: any) => (
                                    <tr key={insc.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                                                {insc.perfil?.nombres} {insc.perfil?.apellidos}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                                                {insc.perfil?.email}
                                            </div>
                                        </td>
                                        <td>{insc.perfil?.identificacion || 'N/A'}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <ProgressBarContainer>
                                                    <ProgressFill $percent={insc.progreso} />
                                                </ProgressBarContainer>
                                                <span style={{ fontWeight: 600 }}>{insc.progreso}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge $type={insc.calificacion_pre >= 60 ? 'success' : 'info'}>
                                                {insc.calificacion_pre !== null ? `${insc.calificacion_pre}%` : 'N/A'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge $type={insc.calificacion_post >= 60 ? 'success' : 'danger'}>
                                                {insc.calificacion_post !== null ? `${insc.calificacion_post}%` : 'Pendiente'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge $type={insc.estado === 'Finalizado' ? 'success' : 'warning'}>
                                                {insc.estado}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </ModalBody>

                {/* ── PANEL DE SATISFACCIÓN ──────────────── */}
                {encuestaData && (encuestaData.promedio !== null || encuestaData.total > 0) && (
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderTop: '1px solid #e8e8e8',
                        background: '#fffef6'
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#80868b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                            ⭐ Satisfacción del Curso
                        </div>
                        {encuestaData.promedio !== null ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.2rem' }}>
                                    {[1, 2, 3, 4, 5].map(v => (
                                        <Star key={v} size={22}
                                            fill={v <= Math.round(encuestaData.promedio) ? '#FFD700' : 'none'}
                                            color={v <= Math.round(encuestaData.promedio) ? '#FFD700' : '#ccc'}
                                            strokeWidth={1.5}
                                        />
                                    ))}
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#3c4043' }}>{encuestaData.promedio.toFixed(1)}</span>
                                <span style={{ fontSize: '0.8rem', color: '#80868b' }}>de 5 &bull; {encuestaData.total} respuesta{encuestaData.total !== 1 ? 's' : ''}</span>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.85rem', color: '#80868b', marginBottom: '0.75rem' }}>Sin calificación de estrellas aún.</div>
                        )}
                        {encuestaData.respuestas?.filter((r: any) => r.observacion)?.length > 0 && (
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#80868b', marginBottom: '0.5rem' }}>Observaciones:</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 160, overflowY: 'auto' }}>
                                    {encuestaData.respuestas.filter((r: any) => r.observacion).map((r: any, i: number) => (
                                        <div key={i} style={{ background: 'white', borderRadius: 8, border: '1px solid #f0f0f0', padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: '#3c4043' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--primary)', marginRight: '0.5rem' }}>
                                                {r.perfil ? `${r.perfil.nombres} ${r.perfil.apellidos}:` : 'Anónimo:'}
                                            </span>
                                            {r.observacion}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ModalContent>
        </ModalOverlay>
    );
}
