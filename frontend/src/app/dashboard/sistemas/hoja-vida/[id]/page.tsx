'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Monitor, ArrowLeft, Cpu, HardDrive, Wifi, User, MapPin, Calendar, DollarSign, Settings, Shield, TrendingUp, Edit2, X, Plus, Trash2, Package } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

const Container = styled.div`padding: 2rem; max-width: 1200px; margin: 0 auto; background: #f1f5f9; min-height: 100vh;`;
const BackBtn = styled.button`display:flex;align-items:center;gap:0.5rem;background:none;border:none;color:#64748b;cursor:pointer;margin-bottom:1rem;font-weight:600;&:hover{color:#7c3aed;}`;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const estadoColor: Record<string, { bg: string; color: string }> = {
    'Activo': { bg: '#dcfce7', color: '#166534' },
    'Mantenimiento': { bg: '#ffedd5', color: '#9a3412' },
    'En Seguimiento': { bg: '#fef9c3', color: '#854d0e' },
    'Baja': { bg: '#fee2e2', color: '#991b1b' }
};

const Tab = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1.1rem; border-radius: 10px; border: none; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: all 0.15s;
  ${p => p.$active ? 'background:#7c3aed;color:white;' : 'background:transparent;color:#64748b;&:hover{background:#f1f5f9;}'}
`;

type ActiveTab = 'ficha' | 'software' | 'mantenimientos' | 'licencias' | 'tickets' | 'upgrades';

export default function HojaVidaTIPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<ActiveTab>('ficha');
    const [editEstado, setEditEstado] = useState(false);

    const { data: equipo, isLoading } = useQuery({
        queryKey: ['equipo-ti', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/equipos-ti/${id}`);
            return res.json();
        },
        enabled: !!id
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`${API_URL}/equipos-ti/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipo-ti', id] })
    });

    const { data: software = [] } = useQuery({
        queryKey: ['software-ti', id],
        queryFn: async () => {
            try {
                const res = await fetch(`${API_URL}/software-ti?equipo_ti_id=${id}`);
                if (!res.ok) return [];
                const json = await res.json();
                return Array.isArray(json) ? json : [];
            } catch { return []; }
        },
        enabled: !!id
    });

    const [showSoftForm, setShowSoftForm] = useState(false);
    const [softForm, setSoftForm] = useState({ nombre: '', version: '', tipo_licencia: 'Propietario', numero_licencia: '', fecha_instalacion: '', fecha_vencimiento: '', estado: 'Activo' });

    const saveSoftMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`${API_URL}/software-ti`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, equipo_ti_id: id })
            });
            return res.json();
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['software-ti', id] }); setShowSoftForm(false); setSoftForm({ nombre: '', version: '', tipo_licencia: 'Propietario', numero_licencia: '', fecha_instalacion: '', fecha_vencimiento: '', estado: 'Activo' }); }
    });

    const delSoftMutation = useMutation({
        mutationFn: async (swId: string) => {
            await fetch(`${API_URL}/software-ti/${swId}`, { method: 'DELETE' });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['software-ti', id] })
    });

    // ── Mantenimientos ──
    const [anioMant, setAnioMant] = useState(new Date().getFullYear());
    const [showMantForm, setShowMantForm] = useState<string | null>(null); // id del mant a registrar
    const [mantForm, setMantForm] = useState({ tecnico: '', tipo: 'Preventivo', descripcion: '', fecha_realizado: new Date().toISOString().split('T')[0] });

    const { data: mantenimientos = [] } = useQuery({
        queryKey: ['mantenimientos-ti', id, anioMant],
        queryFn: async () => {
            try {
                const res = await fetch(`${API_URL}/mantenimientos-ti?equipo_ti_id=${id}&anio=${anioMant}`);
                if (!res.ok) return [];
                const json = await res.json();
                return Array.isArray(json) ? json : [];
            } catch { return []; }
        },
        enabled: !!id
    });

    const generarMantMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/mantenimientos-ti/generar`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ equipo_ti_id: id, anio: anioMant })
            });
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mantenimientos-ti', id, anioMant] })
    });

    const realizarMantMutation = useMutation({
        mutationFn: async ({ mantId, data }: { mantId: string; data: any }) => {
            const res = await fetch(`${API_URL}/mantenimientos-ti/${mantId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, estado: 'Realizado' })
            });
            return res.json();
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mantenimientos-ti', id, anioMant] }); setShowMantForm(null); }
    });

    if (isLoading || !equipo) return <Container>Cargando ficha técnica...</Container>;

    const ec = estadoColor[equipo.estado] || { bg: '#f1f5f9', color: '#64748b' };

    const tabs = [
        { id: 'ficha' as ActiveTab, label: 'Ficha Técnica', icon: <Monitor size={15} /> },
        { id: 'software' as ActiveTab, label: 'Software', icon: <Package size={15} /> },
        { id: 'mantenimientos' as ActiveTab, label: 'Mantenimientos', icon: <Settings size={15} /> },
        { id: 'licencias' as ActiveTab, label: 'Licencias', icon: <Shield size={15} /> },
        { id: 'upgrades' as ActiveTab, label: 'Upgrades', icon: <TrendingUp size={15} /> },
    ];

    return (
        <Container>
            <BackBtn onClick={() => router.push('/dashboard/sistemas')}>
                <ArrowLeft size={18} /> Volver a Sistemas
            </BackBtn>

            {/* Encabezado del equipo */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem 2rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: 64, height: 64, borderRadius: '16px', background: '#7c3aed15', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Monitor size={32} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{equipo.nombre}</h1>
                        {!editEstado ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ padding: '0.3rem 0.85rem', background: ec.bg, color: ec.color, borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>{equipo.estado}</span>
                                <button onClick={() => setEditEstado(true)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Edit2 size={14} /></button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                {['Activo', 'Mantenimiento', 'En Seguimiento', 'Baja'].map(est => {
                                    const c = estadoColor[est];
                                    return (
                                        <button key={est} onClick={() => { updateMutation.mutate({ estado: est }); setEditEstado(false); }}
                                            style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', border: `2px solid ${c.color}40`, background: c.bg, color: c.color, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                            {est}
                                        </button>
                                    );
                                })}
                                <button onClick={() => setEditEstado(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={16} /></button>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>📦 {equipo.tipo} &nbsp;|&nbsp; {equipo.marca} {equipo.modelo}</span>
                        {equipo.serial && <span style={{ fontSize: '0.82rem', color: '#64748b' }}>🔢 {equipo.serial}</span>}
                        {equipo.numero_activo && <span style={{ fontSize: '0.82rem', color: '#64748b' }}>🏷️ {equipo.numero_activo}</span>}
                        {equipo.usuario_asignado && <span style={{ fontSize: '0.82rem', color: '#64748b' }}>👤 {equipo.usuario_asignado}</span>}
                    </div>
                </div>
                {equipo.valor_compra > 0 && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>VALOR COMPRA</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>${Number(equipo.valor_compra).toLocaleString()}</div>
                        {equipo.fecha_compra && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(equipo.fecha_compra).toLocaleDateString()}</div>}
                    </div>
                )}
            </div>

            {/* Pestañas */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'white', padding: '0.35rem', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {tabs.map(t => (
                    <Tab key={t.id} $active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>{t.icon} {t.label}</Tab>
                ))}
            </div>

            {/* Ficha técnica */}
            {activeTab === 'ficha' && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    {[
                        {
                            title: '⚙️ Especificaciones Técnicas', items: [
                                { icon: <Cpu size={16} />, label: 'Procesador', value: equipo.procesador },
                                { icon: <Settings size={16} />, label: 'RAM', value: equipo.ram },
                                { icon: <HardDrive size={16} />, label: 'Almacenamiento', value: equipo.almacenamiento },
                                { icon: <Monitor size={16} />, label: 'Sistema Operativo', value: equipo.sistema_operativo },
                                { icon: <Wifi size={16} />, label: 'Hostname', value: equipo.hostname },
                                { icon: <Wifi size={16} />, label: 'Dirección IP', value: equipo.ip_address },
                                { icon: <Wifi size={16} />, label: 'MAC Address', value: equipo.mac_address },
                            ]
                        },
                        {
                            title: '📍 Ubicación & Asignación', items: [
                                { icon: <User size={16} />, label: 'Usuario asignado', value: equipo.usuario_asignado },
                                { icon: <MapPin size={16} />, label: 'Sede', value: equipo.sede },
                                { icon: <MapPin size={16} />, label: 'Oficina', value: equipo.oficina },
                            ]
                        },
                        {
                            title: '💰 Datos de Adquisición', items: [
                                { icon: <DollarSign size={16} />, label: 'Valor de compra', value: equipo.valor_compra ? `$${Number(equipo.valor_compra).toLocaleString()}` : null },
                                { icon: <Calendar size={16} />, label: 'Fecha de compra', value: equipo.fecha_compra ? new Date(equipo.fecha_compra).toLocaleDateString() : null },
                            ]
                        },
                    ].map(section => (
                        <div key={section.title} style={{ marginBottom: '2rem' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>{section.title}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                                {section.items.filter(i => i.value).map(item => (
                                    <div key={item.label} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                                        <div style={{ color: '#7c3aed', marginTop: '2px', flexShrink: 0 }}>{item.icon}</div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>{item.label.toUpperCase()}</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {equipo.observaciones && (
                        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.5rem' }}>OBSERVACIONES</div>
                            <div style={{ fontSize: '0.9rem', color: '#334155' }}>{equipo.observaciones}</div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Pestaña Software Instalado ── */}
            {activeTab === 'software' && (() => {
                const swEstColor: any = { Activo: { bg: '#dcfce7', color: '#166534' }, Vencido: { bg: '#fee2e2', color: '#991b1b' }, Desinstalado: { bg: '#f1f5f9', color: '#64748b' } };
                const today = new Date();
                const isExpiringSoon = (date: string) => {
                    if (!date) return false;
                    const d = new Date(date);
                    return (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30 && d > today;
                };
                return (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                {Object.entries(swEstColor).map(([est, c]: any) => {
                                    const cnt = (software as any[]).filter(s => s.estado === est).length;
                                    return <span key={est} style={{ padding: '0.25rem 0.7rem', background: c.bg, color: c.color, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{est}: {cnt}</span>;
                                })}
                            </div>
                            <button onClick={() => setShowSoftForm(p => !p)}
                                style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#7c3aed', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                <Plus size={16} /> Nuevo Software
                            </button>
                        </div>

                        {/* Mini formulario inline */}
                        {showSoftForm && (
                            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>NUEVO REGISTRO DE SOFTWARE</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.65rem' }}>
                                    <input placeholder="Nombre del software" value={softForm.nombre} onChange={e => setSoftForm(p => ({ ...p, nombre: e.target.value }))}
                                        style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.88rem' }} />
                                    <input placeholder="Versión" value={softForm.version} onChange={e => setSoftForm(p => ({ ...p, version: e.target.value }))}
                                        style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.88rem' }} />
                                    <select value={softForm.tipo_licencia} onChange={e => setSoftForm(p => ({ ...p, tipo_licencia: e.target.value }))}
                                        style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.88rem', background: 'white' }}>
                                        {['Libre', 'Propietario', 'Suscripción', 'OEM', 'Corporativa'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                                    <input placeholder="N° Licencia" value={softForm.numero_licencia} onChange={e => setSoftForm(p => ({ ...p, numero_licencia: e.target.value }))}
                                        style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.88rem' }} />
                                    <div><div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.2rem' }}>INSTALADO</div>
                                        <input type="date" value={softForm.fecha_instalacion} onChange={e => setSoftForm(p => ({ ...p, fecha_instalacion: e.target.value }))}
                                            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box' }} /></div>
                                    <div><div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.2rem' }}>VENCE</div>
                                        <input type="date" value={softForm.fecha_vencimiento} onChange={e => setSoftForm(p => ({ ...p, fecha_vencimiento: e.target.value }))}
                                            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box' }} /></div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setShowSoftForm(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                                    <button onClick={() => softForm.nombre && saveSoftMutation.mutate(softForm)}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#7c3aed', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Guardar</button>
                                </div>
                            </div>
                        )}

                        {/* Tabla de software */}
                        {(software as any[]).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                <Package size={44} style={{ margin: '0 auto', color: '#7c3aed' }} />
                                <p style={{ fontWeight: 600, marginTop: '0.75rem' }}>Sin software registrado. Usa el botón para agregar.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                        {['SOFTWARE', 'VERSIÓN', 'LICENCIA', 'N° LIC.', 'INSTALADO', 'VENCE', 'ESTADO', ''].map(h => (
                                            <th key={h} style={{ padding: '0.6rem 0.75rem', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textAlign: 'left' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(software as any[]).map((sw: any) => {
                                        const ec = swEstColor[sw.estado] || swEstColor['Activo'];
                                        const expiring = isExpiringSoon(sw.fecha_vencimiento);
                                        return (
                                            <tr key={sw.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                <td style={{ padding: '0.75rem', fontWeight: 700, fontSize: '0.88rem' }}>{sw.nombre}</td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.82rem', color: '#64748b' }}>{sw.version || '—'}</td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: sw.tipo_licencia === 'Libre' ? '#166534' : sw.tipo_licencia === 'Suscripción' ? '#1d4ed8' : '#334155' }}>{sw.tipo_licencia}</span>
                                                </td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace' }}>{sw.numero_licencia || '—'}</td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>{sw.fecha_instalacion ? new Date(sw.fecha_instalacion).toLocaleDateString() : '—'}</td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>
                                                    {sw.fecha_vencimiento ? (
                                                        <span style={{ color: expiring ? '#f59e0b' : new Date(sw.fecha_vencimiento) < new Date() ? '#ef4444' : '#64748b', fontWeight: expiring ? 800 : 400 }}>
                                                            {expiring && '⚠️ '}{new Date(sw.fecha_vencimiento).toLocaleDateString()}
                                                        </span>
                                                    ) : <span style={{ color: '#94a3b8' }}>—</span>}
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{ padding: '0.2rem 0.6rem', background: ec.bg, color: ec.color, borderRadius: '20px', fontSize: '0.68rem', fontWeight: 800 }}>{sw.estado}</span>
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <button onClick={() => delSoftMutation.mutate(sw.id)}
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                );
            })()}

            {/* ── Pestaña Mantenimientos ── */}
            {activeTab === 'mantenimientos' && (() => {
                const today = new Date();
                const trimestres = [
                    { num: 1, label: 'Trimestre 1', mes: 'Enero', color: '#3b82f6' },
                    { num: 2, label: 'Trimestre 2', mes: 'Abril', color: '#10b981' },
                    { num: 3, label: 'Trimestre 3', mes: 'Julio', color: '#f59e0b' },
                    { num: 4, label: 'Trimestre 4', mes: 'Octubre', color: '#8b5cf6' },
                ];
                const realizados = (mantenimientos as any[]).filter(m => m.estado === 'Realizado').length;
                const porcentaje = (realizados / 4) * 100;

                return (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        {/* Cabecera con año y acciones */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <button onClick={() => setAnioMant(p => p - 1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '0.35rem 0.65rem', cursor: 'pointer', fontWeight: 800 }}>‹</button>
                                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>{anioMant}</span>
                                <button onClick={() => setAnioMant(p => p + 1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '0.35rem 0.65rem', cursor: 'pointer', fontWeight: 800 }}>›</button>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{realizados}/4 completados</span>
                            </div>
                            {mantenimientos.length === 0 && (
                                <button onClick={() => generarMantMutation.mutate()}
                                    style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', background: '#7c3aed', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <Calendar size={15} /> Generar {anioMant}
                                </button>
                            )}
                        </div>

                        {/* Barra de progreso del año */}
                        <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '8px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                            <div style={{ width: `${porcentaje}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #3b82f6)', borderRadius: '99px', transition: 'width 0.5s' }} />
                        </div>

                        {mantenimientos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                <Calendar size={44} style={{ margin: '0 auto', color: '#7c3aed' }} />
                                <p style={{ fontWeight: 600, marginTop: '0.75rem' }}>
                                    No hay mantenimientos programados para {anioMant}.<br />
                                    Usa el botón <strong>"Generar {anioMant}"</strong> para crear los 4 mantenimientos trimestrales.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                {trimestres.map(tri => {
                                    const mant: any = (mantenimientos as any[]).find(m => m.numero_mantenimiento === tri.num);
                                    if (!mant) return null;

                                    const fechaProg = new Date(mant.fecha_programada);
                                    const diasRestantes = Math.ceil((fechaProg.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    const esProximo = diasRestantes > 0 && diasRestantes <= 30 && mant.estado === 'Pendiente';
                                    const esVencido = diasRestantes < 0 && mant.estado === 'Pendiente';

                                    const cardBg = mant.estado === 'Realizado' ? '#f0fdf4' : esVencido ? '#fff1f2' : esProximo ? '#fffbeb' : '#f8fafc';
                                    const borderColor = mant.estado === 'Realizado' ? '#86efac' : esVencido ? '#fca5a5' : esProximo ? '#fcd34d' : '#e2e8f0';

                                    return (
                                        <div key={tri.num} style={{ border: `2px solid ${borderColor}`, borderRadius: '14px', padding: '1.1rem', background: cardBg, position: 'relative' }}>
                                            {/* Header de la tarjeta */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: tri.color }}>{tri.label.toUpperCase()}</div>
                                                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{tri.mes} {anioMant}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    {mant.estado === 'Realizado' && <span style={{ fontSize: '1.2rem' }}>✅</span>}
                                                    {esProximo && <span style={{ fontSize: '1.2rem' }}>⚠️</span>}
                                                    {esVencido && <span style={{ fontSize: '1.2rem' }}>🔴</span>}
                                                    {!mant.estado || (mant.estado === 'Pendiente' && !esProximo && !esVencido) ? <span style={{ fontSize: '1.2rem' }}>⏳</span> : null}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.6rem' }}>
                                                <div>📅 Programado: <strong>{fechaProg.toLocaleDateString()}</strong></div>
                                                {mant.fecha_realizado && <div>✅ Realizado: <strong>{new Date(mant.fecha_realizado).toLocaleDateString()}</strong></div>}
                                                {mant.tecnico && <div>👷 Técnico: <strong>{mant.tecnico}</strong></div>}
                                                {esProximo && <div style={{ color: '#b45309', fontWeight: 700 }}>⚠️ Faltan {diasRestantes} días</div>}
                                                {esVencido && <div style={{ color: '#dc2626', fontWeight: 700 }}>🔴 Venció hace {Math.abs(diasRestantes)} días</div>}
                                            </div>

                                            {/* Chip estado */}
                                            <span style={{
                                                padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 800,
                                                background: mant.estado === 'Realizado' ? '#dcfce7' : esVencido ? '#fee2e2' : '#fef9c3',
                                                color: mant.estado === 'Realizado' ? '#166534' : esVencido ? '#991b1b' : '#854d0e'
                                            }}>{mant.estado === 'Pendiente' && esVencido ? 'Vencido' : mant.estado}</span>

                                            {/* Botón registrar */}
                                            {mant.estado === 'Pendiente' && (
                                                <div style={{ marginTop: '0.75rem' }}>
                                                    <button onClick={() => setShowMantForm(mant.id)}
                                                        style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', background: tri.color, color: 'white', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                                                        ✓ Registrar Mantenimiento
                                                    </button>
                                                </div>
                                            )}

                                            {/* Formulario inline */}
                                            {showMantForm === mant.id && (
                                                <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <input placeholder="Técnico responsable" value={mantForm.tecnico}
                                                        onChange={e => setMantForm(p => ({ ...p, tecnico: e.target.value }))}
                                                        style={{ padding: '0.5rem 0.75rem', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.82rem' }} />
                                                    <select value={mantForm.tipo} onChange={e => setMantForm(p => ({ ...p, tipo: e.target.value }))}
                                                        style={{ padding: '0.5rem 0.75rem', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.82rem', background: 'white' }}>
                                                        {['Preventivo', 'Correctivo', 'Emergencia'].map(t => <option key={t}>{t}</option>)}
                                                    </select>
                                                    <input type="date" value={mantForm.fecha_realizado}
                                                        onChange={e => setMantForm(p => ({ ...p, fecha_realizado: e.target.value }))}
                                                        style={{ padding: '0.5rem 0.75rem', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.82rem' }} />
                                                    <textarea placeholder="Descripción del mantenimiento..." value={mantForm.descripcion}
                                                        onChange={e => setMantForm(p => ({ ...p, descripcion: e.target.value }))}
                                                        rows={2} style={{ padding: '0.5rem 0.75rem', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.82rem', resize: 'none' }} />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => setShowMantForm(null)}
                                                            style={{ flex: 1, padding: '0.45rem', border: '1px solid #e2e8f0', background: 'white', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}>
                                                            Cancelar
                                                        </button>
                                                        <button onClick={() => realizarMantMutation.mutate({ mantId: mant.id, data: mantForm })}
                                                            style={{ flex: 1, padding: '0.45rem', background: tri.color, color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                                                            Guardar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Pestañas próximamente */}
            {activeTab !== 'ficha' && activeTab !== 'software' && activeTab !== 'mantenimientos' && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8', background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <Settings size={52} style={{ margin: '0 auto', color: '#7c3aed' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: '0.75rem 0 0.25rem' }}>Sección en construcción</h3>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Esta pestaña estará disponible en la próxima versión del módulo Sistemas.</p>
                </div>
            )}
        </Container>
    );
}
