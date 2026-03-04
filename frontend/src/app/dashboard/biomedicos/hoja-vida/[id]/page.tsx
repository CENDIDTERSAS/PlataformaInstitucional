'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { HeartPulse, FileText, Wrench, ArrowLeft, CheckSquare, Activity, Eye, Download, FolderArchive, Upload, Check, Loader2, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import HojaVidaReport from '@/components/biomedicos/HojaVidaReport';
import { supabase } from '@/lib/supabase';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #f1f5f9;
  min-height: 100vh;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center; gap: 0.5rem;
  background: none; border: none; color: #64748b;
  cursor: pointer; margin-bottom: 1rem; font-weight: 600;
  &:hover { color: #2563eb; }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.6rem 1.2rem; border-radius: 12px; font-weight: 700;
  display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem;
  ${props => props.$variant === 'primary' ? `background: #00A651; color: white; border: none; &:hover { background: #008c44; }` : `background: white; color: #475569; border: 2px solid #e2e8f0; &:hover { background: #f8fafc; }`}
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HojaVidaPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'documentacion' | 'hoja-vida' | 'mantenimientos' | 'contratos' | 'repuestos'>('documentacion');
    const [uploading, setUploading] = useState<string | null>(null);

    const updateEquipoMutation = useMutation({
        mutationFn: async (newData: any) => {
            const res = await fetch(`${API_URL}/equipos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            if (!res.ok) throw new Error('Error al actualizar equipo');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipo-detalle', id] });
        }
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(field);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${field}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documentos-biomedicos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('documentos-biomedicos')
                .getPublicUrl(filePath);

            await updateEquipoMutation.mutateAsync({ [field]: publicUrl });
        } catch (error: any) {
            alert('Error al subir archivo: ' + error.message);
        } finally {
            setUploading(null);
        }
    };

    const handleMetadataChange = (field: string, value: any) => {
        updateEquipoMutation.mutate({ [field]: value });
    };

    const { data: equipo, isLoading } = useQuery({
        queryKey: ['equipo-detalle', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/equipos`);
            const all = await res.json();
            return all.find((e: any) => e.id === id);
        }
    });

    const { data: mantenimientos = [] } = useQuery({
        queryKey: ['mantenimientos-equipo', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/mantenimientos?equipo_id=${id}`);
            return res.json();
        },
        enabled: !!id
    });

    const { data: contratos = [] } = useQuery({
        queryKey: ['contratos-biomedicos', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/contratos-biomedicos?equipo_id=${id}`);
            return res.json();
        },
        enabled: !!id
    });

    const { data: repuestos = [] } = useQuery({
        queryKey: ['repuestos-equipo', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/repuestos-equipos?equipo_id=${id}`);
            return res.json();
        },
        enabled: !!id
    });

    const activeContrato = contratos.find((c: any) => c.estado === 'Activo');

    if (isLoading || !equipo) return <Container>Cargando Hoja de Vida...</Container>;

    // Sorting activities by date descending (latest first)
    const sortedMantenimientos = Array.isArray(mantenimientos)
        ? [...mantenimientos].sort((a: any, b: any) =>
            new Date(b.fecha_ejecucion).getTime() - new Date(a.fecha_ejecucion).getTime()
        )
        : [];

    return (
        <Container>
            <div className="no-print" style={{ maxWidth: '1024px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', marginBottom: '1rem' }}>
                <BackButton onClick={() => router.back()}><ArrowLeft size={20} /> Volver</BackButton>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {activeTab === 'hoja-vida' && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.4rem 0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>ESTADO:</span>
                                <select
                                    value={equipo.estado}
                                    onChange={(e) => handleMetadataChange('estado', e.target.value)}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: equipo.estado === 'Funcional' ? '#dcfce7' :
                                            equipo.estado === 'Mantenimiento' ? '#ffedd5' :
                                                equipo.estado === 'En Seguimiento' ? '#fef9c3' : '#fee2e2',
                                        color: equipo.estado === 'Funcional' ? '#166534' :
                                            equipo.estado === 'Mantenimiento' ? '#9a3412' :
                                                equipo.estado === 'En Seguimiento' ? '#854d0e' : '#991b1b',
                                        fontWeight: 800,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        textAlign: 'center'
                                    }}
                                >
                                    <option value="Funcional" style={{ background: 'white', color: '#1e293b' }}>FUNCIONAL</option>
                                    <option value="Mantenimiento" style={{ background: 'white', color: '#1e293b' }}>MANTENIMIENTO</option>
                                    <option value="En Seguimiento" style={{ background: 'white', color: '#1e293b' }}>EN SEGUIMIENTO</option>
                                    <option value="Baja" style={{ background: 'white', color: '#1e293b' }}>BAJA</option>
                                </select>
                            </div>
                            <ActionButton $variant="secondary" onClick={() => window.print()}>
                                <FileText size={18} /> Imprimir PDF
                            </ActionButton>
                        </>
                    )}
                </div>
            </div>

            {/* TABS NAVIGATION */}
            <div className="no-print" style={{ maxWidth: '1024px', margin: '0 auto', display: 'flex', gap: '1rem', padding: '0 1rem', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0' }}>
                {[
                    { id: 'documentacion', label: 'Documentación Legal', icon: <FileText size={18} /> },
                    { id: 'hoja-vida', label: 'Hoja de Vida (SIES-FR-03)', icon: <FileText size={18} /> },
                    { id: 'mantenimientos', label: 'Historial Mtto', icon: <Wrench size={18} /> },
                    { id: 'contratos', label: 'Contratos / Garantías', icon: <FileText size={18} /> },
                    { id: 'repuestos', label: 'Repuestos / Consumibles', icon: <HeartPulse size={18} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem 0.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '3px solid #00A651' : '3px solid transparent',
                            color: activeTab === tab.id ? '#00A651' : '#64748b',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'documentacion' && (
                <div className="no-print" style={{ maxWidth: '1024px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <FileText size={24} color="#00A651" /> Soporte de Documentación Legal
                        </h2>
                        <button
                            onClick={() => {
                                const docs = [equipo.factura_compra, equipo.registro_importacion, equipo.registro_invima, equipo.licencia_practica].filter(Boolean);
                                docs.forEach((url, i) => {
                                    setTimeout(() => {
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = `documento_${i + 1}.pdf`;
                                        link.target = '_blank';
                                        link.click();
                                    }, i * 500);
                                });
                            }}
                            style={{ padding: '0.75rem 1.5rem', background: '#00A651', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <FolderArchive size={20} /> Descargar Todos
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            {
                                id: 'factura_compra',
                                label: 'Factura de Compra',
                                value: equipo.factura_compra,
                                icon: <FileText color="#2563eb" />,
                                extra: (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PROVEEDOR</label>
                                            <input
                                                type="text"
                                                value={equipo.factura_proveedor || ''}
                                                onChange={(e) => handleMetadataChange('factura_proveedor', e.target.value)}
                                                placeholder="Nombre del Proveedor"
                                                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>NÚMERO</label>
                                            <input
                                                type="text"
                                                value={equipo.factura_numero || ''}
                                                onChange={(e) => handleMetadataChange('factura_numero', e.target.value)}
                                                placeholder="N/A"
                                                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>FECHA DE COMPRA</label>
                                            <input
                                                type="date"
                                                value={equipo.factura_fecha || ''}
                                                onChange={(e) => handleMetadataChange('factura_fecha', e.target.value)}
                                                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>VALOR ($)</label>
                                            <input
                                                type="number"
                                                value={equipo.factura_valor || ''}
                                                onChange={(e) => handleMetadataChange('factura_valor', e.target.value)}
                                                placeholder="0.00"
                                                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>
                                )
                            },
                            {
                                id: 'registro_importacion',
                                label: 'Registro de Importación',
                                value: equipo.registro_importacion,
                                icon: <Activity color="#0891b2" />
                            },
                            {
                                id: 'registro_invima',
                                label: 'Registro INVIMA',
                                value: equipo.registro_invima,
                                icon: <HeartPulse color="#e11d48" />,
                                extra: (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>NÚMERO INVIMA</label>
                                            <input
                                                type="text"
                                                value={equipo.registro_invima_numero || ''}
                                                onChange={(e) => handleMetadataChange('registro_invima_numero', e.target.value)}
                                                placeholder="Alfanumérico"
                                                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>VIGENCIA</label>
                                            <input
                                                type="date"
                                                value={equipo.registro_invima_vigencia || ''}
                                                onChange={(e) => handleMetadataChange('registro_invima_vigencia', e.target.value)}
                                                style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>
                                )
                            },
                            {
                                id: 'licencia_practica',
                                label: 'Licencia de Práctica Médica',
                                value: equipo.licencia_practica,
                                icon: <CheckSquare color="#059669" />,
                                extra: (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>VIGENCIA INICIO</label>
                                                <input
                                                    type="date"
                                                    value={equipo.licencia_vigencia_inicio || ''}
                                                    onChange={(e) => handleMetadataChange('licencia_vigencia_inicio', e.target.value)}
                                                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>VIGENCIA HASTA</label>
                                                <input
                                                    type="date"
                                                    value={equipo.licencia_vigencia || ''}
                                                    onChange={(e) => handleMetadataChange('licencia_vigencia', e.target.value)}
                                                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                                />
                                            </div>
                                        </div>
                                        {equipo.licencia_vigencia && (
                                            <div style={{
                                                marginTop: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                color: new Date(equipo.licencia_vigencia) < new Date() ? '#e11d48' :
                                                    new Date(equipo.licencia_vigencia).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 30 ? '#d97706' : '#059669'
                                            }}>
                                                <AlertCircle size={14} />
                                                {new Date(equipo.licencia_vigencia) < new Date() ? 'Licencia Vencida' :
                                                    new Date(equipo.licencia_vigencia).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 30 ? 'Vencimiento Próximo' : 'Licencia Vigente'}
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                        ].map((doc, i) => (
                            <div key={i} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {doc.icon}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>{doc.label}</span>
                                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                                                {doc.value ? 'Documento Vinculado' : 'Pendiente de Carga'}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => handleFileUpload(e, doc.id)}
                                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                                />
                                                <button style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    {uploading === doc.id ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                    {doc.value ? 'Actualizar PDF' : 'Subir PDF'}
                                                </button>
                                            </div>
                                            {doc.value && (
                                                <>
                                                    <a href={doc.value} target="_blank" style={{ padding: '0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#2563eb' }}><Eye size={20} /></a>
                                                    <a href={doc.value} download style={{ padding: '0.5rem', background: '#2563eb', border: 'none', borderRadius: '8px', color: 'white' }}><Download size={20} /></a>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {doc.extra}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* HOJA DE VIDA (SIES-FR-03) - ALWAYS IN DOM FOR PRINT */}
            {/* HOJA DE VIDA (SIES-FR-03) - ALWAYS IN DOM FOR PRINT */}
            <div className={activeTab === 'hoja-vida' ? 'show-screen' : 'hide-screen-show-print'}>
                <HojaVidaReport
                    equipo={equipo}
                    mantenimientos={mantenimientos}
                    contrato={activeContrato}
                />
            </div>

            {activeTab === 'mantenimientos' && (
                <div className="no-print" style={{ maxWidth: '1024px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Wrench size={24} color="#00A651" /> Historial de Mantenimientos
                    </h2>
                    {mantenimientos.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748b' }}>FECHA</th>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748b' }}>TIPO</th>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748b' }}>RESPONSABLE</th>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748b' }}>COSTO</th>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748b' }}>OBSERVACIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedMantenimientos.map((m: any) => (
                                        <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(m.fecha_ejecucion).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: m.tipo === 'Preventivo' ? '#e8f5e9' : '#fee2e2', color: m.tipo === 'Preventivo' ? '#166534' : '#991b1b' }}>
                                                    {m.tipo}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{m.tecnico_responsable}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>${Number(m.costo || 0).toLocaleString()}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>{m.observaciones || 'Sin observaciones'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontWeight: 600 }}>No hay mantenimientos registrados aún.</p>
                    )}
                </div>
            )}

            {activeTab === 'contratos' && (
                <div className="no-print" style={{ maxWidth: '1024px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={24} color="#00A651" /> Contratos y Garantías
                    </h2>
                    {contratos.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {contratos.map((c: any) => (
                                <div key={c.id} style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#2563eb' }}>{c.numero_contrato}</span>
                                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, background: c.estado === 'Activo' ? '#dcfce7' : '#f1f5f9', color: c.estado === 'Activo' ? '#166534' : '#64748b' }}>
                                            {c.estado}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{c.proveedores?.nombre}</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>Objeto: {c.objeto}</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.75rem' }}>
                                        <div><span style={{ color: '#94a3b8' }}>INICIO:</span> <br /> <b>{new Date(c.fecha_inicio).toLocaleDateString()}</b></div>
                                        <div><span style={{ color: '#94a3b8' }}>FIN:</span> <br /> <b>{new Date(c.fecha_fin).toLocaleDateString()}</b></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontWeight: 600 }}>No hay contratos asociados a este equipo.</p>
                    )}
                </div>
            )}

            {activeTab === 'repuestos' && (
                <div className="no-print" style={{ maxWidth: '1024px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <HeartPulse size={24} color="#00A651" /> Repuestos / Consumibles
                        </h2>
                        {/* Resumen rápido */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {['Cotizado', 'Autorizado', 'Instalado'].map(est => {
                                const colores: any = { Cotizado: { bg: '#fef9c3', color: '#854d0e' }, Autorizado: { bg: '#dcfce7', color: '#166534' }, Instalado: { bg: '#eff6ff', color: '#1d4ed8' } };
                                const count = (repuestos as any[]).filter(r => r.estado === est).length;
                                return <span key={est} style={{ padding: '0.3rem 0.75rem', background: colores[est].bg, color: colores[est].color, borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{est}: {count}</span>;
                            })}
                        </div>
                    </div>

                    {repuestos.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>REPUESTO</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PROVEEDOR / COT.</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CANT.</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TOTAL</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ESTADO</th>
                                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ACCIÓN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(repuestos as any[]).map((r: any) => {
                                    const colores: any = { Cotizado: { bg: '#fef9c3', color: '#854d0e' }, Autorizado: { bg: '#dcfce7', color: '#166534' }, Instalado: { bg: '#eff6ff', color: '#1d4ed8' } };
                                    const ec = colores[r.estado] || colores['Cotizado'];
                                    const siguiente = r.estado === 'Cotizado' ? 'Autorizado' : r.estado === 'Autorizado' ? 'Instalado' : null;
                                    const btnLabel = r.estado === 'Cotizado' ? '✓ Autorizar' : r.estado === 'Autorizado' ? '🔧 Marcar Instalado' : null;
                                    const btnColor = r.estado === 'Cotizado' ? '#059669' : '#2563eb';
                                    return (
                                        <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.nombre_repuesto}</div>
                                                {r.fecha_cotizacion && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cotizado: {new Date(r.fecha_cotizacion).toLocaleDateString()}</div>}
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem' }}>
                                                <div style={{ fontWeight: 600 }}>{r.proveedor || '—'}</div>
                                                <div style={{ color: '#94a3b8' }}>{r.numero_cotizacion || ''}</div>
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>{r.cantidad}</td>
                                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', fontWeight: 700 }}>
                                                ${Number((r.costo_unitario || 0) * (r.cantidad || 1)).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <span style={{ padding: '0.25rem 0.65rem', background: ec.bg, color: ec.color, borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                    {r.estado || 'Cotizado'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                {siguiente && (
                                                    <button
                                                        onClick={async () => {
                                                            const API_URL = process.env.NEXT_PUBLIC_API_URL;
                                                            await fetch(`${API_URL}/repuestos-equipos/${r.id}`, {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ estado: siguiente, ...(siguiente === 'Autorizado' ? { fecha_autorizacion: new Date().toISOString().split('T')[0] } : {}) })
                                                            });
                                                            window.location.reload();
                                                        }}
                                                        style={{ padding: '0.35rem 0.75rem', background: btnColor, color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                    >{btnLabel}</button>
                                                )}
                                                {!siguiente && <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>✓ Completado</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* ── Pie con totales por estado ── */}
                            <tfoot>
                                <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                                    <td colSpan={6} style={{ padding: '1rem' }}>
                                        {(() => {
                                            const calcTotal = (est: string) =>
                                                (repuestos as any[])
                                                    .filter(r => r.estado === est)
                                                    .reduce((s, r) => {
                                                        const sub = (r.costo_unitario || 0) * (r.cantidad || 1);
                                                        const iva = sub * ((r.iva_porcentaje || 0) / 100);
                                                        return s + sub + iva;
                                                    }, 0);
                                            const totCot = calcTotal('Cotizado');
                                            const totAut = calcTotal('Autorizado');
                                            const totIns = calcTotal('Instalado');
                                            const totAll = totCot + totAut + totIns;
                                            return (
                                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <div style={{ flex: 1, minWidth: '150px', background: '#fef9c3', borderRadius: '10px', padding: '0.6rem 1rem' }}>
                                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#854d0e' }}>COTIZADO</div>
                                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#92400e' }}>${totCot.toLocaleString()}</div>
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: '150px', background: '#dcfce7', borderRadius: '10px', padding: '0.6rem 1rem' }}>
                                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#166534' }}>AUTORIZADO</div>
                                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#14532d' }}>${totAut.toLocaleString()}</div>
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: '150px', background: '#eff6ff', borderRadius: '10px', padding: '0.6rem 1rem' }}>
                                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1d4ed8' }}>INSTALADO (REAL)</div>
                                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a' }}>${totIns.toLocaleString()}</div>
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: '150px', background: '#1e293b', borderRadius: '10px', padding: '0.6rem 1rem' }}>
                                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>TOTAL ACUMULADO</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>${totAll.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontWeight: 600 }}>No se han registrado repuestos para este equipo aún.</p>
                    )}
                </div>
            )}
            <style jsx global>{`
                .show-screen { display: block; }
                .hide-screen-show-print { display: none; }

                @media print {
                    @page { 
                        margin: 0.5cm; 
                        size: auto;
                    }
                    .no-print, aside, nav, header, .sidebar, .navbar, .topbar { display: none !important; }
                    .show-screen { display: block !important; }
                    .hide-screen-show-print { display: block !important; }
                    
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    #si-es-fr-03 { 
                        margin: 0 auto !important; 
                        border: 1px solid #000 !important; 
                        box-shadow: none !important; 
                        width: 100% !important; 
                        max-width: 100% !important;
                        height: auto !important;
                        page-break-after: avoid;
                    }
                    div[class*="Container"], main { 
                        padding: 0 !important; 
                        margin: 0 !important; 
                        max-width: none !important;
                        background: white !important;
                        display: block !important;
                    }
                    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </Container>
    );
}
