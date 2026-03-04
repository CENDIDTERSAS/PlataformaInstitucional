'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Plus, Search, Laptop, Wifi, Shield, Settings, AlertCircle, Cpu, Trash2, Eye, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EquipoTIModal from '@/components/sistemas/EquipoTIModal';

const Container = styled.div`
  padding: 2rem;
  width: 100%;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModuleHeader = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--gray-100);
  position: sticky;
  top: 0;
  z-index: 100;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: var(--primary);
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  h1 { 
    font-size: 2rem; 
    font-weight: 800; 
    color: var(--text); 
    margin: 0; 
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

const NavTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.4rem;
  border-radius: 16px;
  border: 1px solid var(--gray-100);
  margin-bottom: 2rem;
  width: fit-content;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  border: none;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${p => p.$active
        ? 'background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(18, 161, 82, 0.2);'
        : 'background: transparent; color: var(--secondary); &:hover { background: white; color: var(--primary); }'}
`;

const Btn = styled.button<{ $v?: string }>`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${p => p.$v === 'primary'
        ? 'background: var(--primary); color: white; border: none; box-shadow: 0 4px 12px rgba(18, 161, 82, 0.2);'
        : 'background: white; color: var(--secondary); border: 1.5px solid var(--gray-100);'}
    
  &:hover {
    transform: translateY(-2px);
    ${p => p.$v === 'primary' ? 'opacity: 0.95; box-shadow: 0 8px 20px rgba(18, 161, 82, 0.3);' : 'border-color: var(--primary); color: var(--primary);'}
  }
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1.5px solid var(--gray-100);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 12px 20px rgba(18, 161, 82, 0.06);
    border-color: var(--primary);
    transform: translateY(-4px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  color: var(--secondary);
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--gray-100);
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type TabId = 'equipos' | 'licencias' | 'soporte' | 'red' | 'seguridad';

const estadoColor: Record<string, { bg: string; color: string }> = {
    'Activo': { bg: 'rgba(18, 161, 82, 0.1)', color: 'var(--primary)' },
    'Mantenimiento': { bg: '#ffedd5', color: '#9a3412' },
    'En Seguimiento': { bg: '#fef9c3', color: '#854d0e' },
    'Baja': { bg: '#fee2e2', color: '#991b1b' }
};

const tipoIcon: Record<string, React.ReactNode> = {
    Desktop: <Monitor size={20} />,
    Laptop: <Laptop size={20} />,
    Servidor: <Cpu size={20} />,
    Impresora: <Settings size={20} />,
    Switch: <Wifi size={20} />,
    Router: <Wifi size={20} />,
    Tablet: <Monitor size={20} />,
    Otro: <Settings size={20} />
};

export default function SistemasPage() {
    const [activeTab, setActiveTab] = useState<TabId>('equipos');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    // Perfil del usuario actual
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

    const { data: equiposTI = [] } = useQuery({
        queryKey: ['equipos-ti'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/equipos-ti`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        }
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`${API_URL}/equipos-ti`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipos-ti'] });
            setShowModal(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`${API_URL}/equipos-ti/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipos-ti'] })
    });

    const tabs = [
        { id: 'equipos' as TabId, label: 'Equipos TI', icon: <Monitor size={15} /> },
        { id: 'licencias' as TabId, label: 'Licencias', icon: <Shield size={15} /> },
        { id: 'soporte' as TabId, label: 'Soporte', icon: <Settings size={15} /> },
        { id: 'red' as TabId, label: 'Red & Internet', icon: <Wifi size={15} /> },
        { id: 'seguridad' as TabId, label: 'Seguridad', icon: <AlertCircle size={15} /> },
    ];

    const safeEquiposTI = Array.isArray(equiposTI) ? equiposTI : [];
    const filtered = safeEquiposTI.filter((e: any) =>
        `${e.nombre} ${e.hostname} ${e.marca} ${e.modelo} ${e.usuario_asignado} ${e.serial} ${e.tipo}`
            .toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Resumen
    const counts = {
        Activo: safeEquiposTI.filter((e: any) => e.estado === 'Activo').length,
        Mantenimiento: safeEquiposTI.filter((e: any) => e.estado === 'Mantenimiento').length,
        Baja: safeEquiposTI.filter((e: any) => e.estado === 'Baja').length,
    };

    return (
        <Container>
            <ModuleHeader>
                <TitleSection>
                    <span style={{ padding: '0.6rem', background: 'rgba(18, 161, 82, 0.1)', borderRadius: '14px', color: 'var(--primary)', display: 'flex' }}>
                        <Monitor size={28} />
                    </span>
                    <h1>Sistemas & TI</h1>
                </TitleSection>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            placeholder="Buscar equipo, serial, usuario..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.25rem', padding: '0.55rem 0.9rem 0.55rem 2.25rem', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', width: '260px' }}
                        />
                    </div>
                    {activeTab === 'equipos' && isPermitted('sistemas', 'gestionar') && (
                        <Btn $v="primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Nuevo Equipo
                        </Btn>
                    )}
                </div>
            </ModuleHeader>

            {/* Pestañas */}
            <NavTabs style={{ marginBottom: '1.5rem' }}>
                {tabs.map(t => (
                    <Tab key={t.id} $active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
                        {t.icon} {t.label}
                        {t.id === 'equipos' && equiposTI.length > 0 && (
                            <span style={{ background: activeTab === 'equipos' ? 'rgba(255,255,255,0.3)' : '#f1f5f9', borderRadius: '20px', padding: '0 0.4rem', fontSize: '0.7rem', fontWeight: 800 }}>
                                {equiposTI.length}
                            </span>
                        )}
                    </Tab>
                ))}
            </NavTabs>

            {/* Pestaña Equipos TI */}
            {activeTab === 'equipos' && (
                <motion.div key="equipos" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Chips resumen */}
                    {equiposTI.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                            {Object.entries(counts).map(([est, cnt]) => {
                                const ec = estadoColor[est] || { bg: '#f1f5f9', color: '#64748b' };
                                return <span key={est} style={{ padding: '0.3rem 0.85rem', background: ec.bg, color: ec.color, borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>{est}: {cnt}</span>;
                            })}
                        </div>
                    )}

                    {filtered.length === 0 ? (
                        <EmptyState>
                            <Monitor size={52} style={{ margin: '0 auto', color: 'var(--primary)' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: '0.75rem 0 0.25rem' }}>
                                {searchTerm ? 'Sin resultados' : 'Sin equipos registrados'}
                            </h3>
                            <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                {searchTerm ? `No hay equipos que coincidan con "${searchTerm}"` : 'Usa el botón "Nuevo Equipo" para comenzar el inventario TI.'}
                            </p>
                        </EmptyState>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {filtered.map((eq: any) => {
                                const ec = estadoColor[eq.estado] || { bg: '#f1f5f9', color: '#64748b' };
                                return (
                                    <Card key={eq.id} whileHover={{ y: -3 }} onClick={() => router.push(`/dashboard/sistemas/hoja-vida/${eq.id}`)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(18, 161, 82, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                                    {tipoIcon[eq.tipo] || <Monitor size={20} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{eq.nombre}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{eq.marca} {eq.modelo}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                <span style={{ padding: '0.2rem 0.6rem', background: ec.bg, color: ec.color, borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800 }}>{eq.estado}</span>
                                                {isPermitted('sistemas', 'gestionar') && (
                                                    <button onClick={e => { e.stopPropagation(); if (confirm('¿Eliminar este equipo?')) deleteMutation.mutate(eq.id); }}
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem', opacity: 0.6 }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                            {[
                                                { label: 'Tipo', value: eq.tipo },
                                                { label: 'Serial', value: eq.serial || '—' },
                                                { label: 'Usuario', value: eq.usuario_asignado || '—' },
                                                { label: 'IP', value: eq.ip_address || '—' },
                                                { label: 'RAM', value: eq.ram || '—' },
                                                { label: 'Sede', value: eq.sede || '—' },
                                            ].map(({ label, value }) => (
                                                <div key={label}>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>{label.toUpperCase()}</div>
                                                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>{value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ marginTop: '0.75rem', padding: '0.4rem 0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.72rem', color: 'var(--secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{eq.sistema_operativo || 'SO no especificado'}</span>
                                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Ver ficha →</span>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Pestañas en construcción */}
            {activeTab !== 'equipos' && (
                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <EmptyState>
                        {activeTab === 'licencias' && <Shield size={52} style={{ margin: '0 auto', color: 'var(--primary)' }} />}
                        {activeTab === 'soporte' && <Settings size={52} style={{ margin: '0 auto', color: 'var(--primary)' }} />}
                        {activeTab === 'red' && <Wifi size={52} style={{ margin: '0 auto', color: 'var(--primary)' }} />}
                        {activeTab === 'seguridad' && <AlertCircle size={52} style={{ margin: '0 auto', color: 'var(--primary)' }} />}
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: '0.75rem 0 0.25rem' }}>Próximamente</h3>
                        <p style={{ fontSize: '0.9rem', margin: 0 }}>Esta sección se habilitará en la siguiente versión del módulo.</p>
                    </EmptyState>
                </motion.div>
            )}

            {showModal && (
                <EquipoTIModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={d => saveMutation.mutate(d)}
                />
            )}
        </Container>
    );
}
