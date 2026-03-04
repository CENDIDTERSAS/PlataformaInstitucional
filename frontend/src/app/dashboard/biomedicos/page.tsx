'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    HeartPulse, Plus, Search, Filter, Edit, Trash2,
    Settings, Activity, Calendar, MoreVertical, Download,
    Wrench, FileText, ShoppingCart, Briefcase, Eye, CheckSquare, Square
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import EquipoModal from '@/components/biomedicos/EquipoModal';
import MantenimientoModal from '@/components/biomedicos/MantenimientoModal';
import ContratoModal from '@/components/biomedicos/ContratoModal';
import RepuestoModal from '@/components/biomedicos/RepuestoModal';

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
  h1 { 
    font-size: 2rem; 
    font-weight: 800; 
    color: var(--text); 
    margin: 0; 
  }
  p { 
    color: var(--secondary); 
    margin-top: 0.4rem;
    font-size: 0.95rem; 
  }
`;

const TabContainer = styled.ul`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding: 0;
  list-style: none;
  border-bottom: 1.5px solid var(--gray-100);
`;

const Tab = styled.li<{ $active: boolean }>`
  padding: 1rem 1.75rem;
  font-weight: 700;
  color: ${props => props.$active ? 'var(--primary)' : 'var(--secondary)'};
  position: relative;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.95rem;
  letter-spacing: 0.01em;

  &:after {
    content: '';
    position: absolute;
    bottom: -1.5px; 
    left: 0; 
    right: 0;
    height: 3px; 
    background: var(--primary);
    display: ${props => props.$active ? 'block' : 'none'};
    border-radius: 3px 3px 0 0;
    box-shadow: 0 -2px 10px rgba(18, 161, 82, 0.3);
  }

  &:hover {
    color: var(--primary);
    background: rgba(18, 161, 82, 0.03);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  border: 1px solid var(--gray-100);

  th { 
    text-align: left; 
    padding: 1.25rem 1.5rem; 
    background: #fcfcfc; 
    color: var(--secondary); 
    font-size: 0.75rem; 
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border-bottom: 1px solid var(--gray-100); 
  }
  
  td { 
    padding: 1.25rem 1.5rem; 
    border-bottom: 1px solid #f8fafc; 
    color: var(--text); 
    font-weight: 500; 
    font-size: 0.9rem;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const EquipmentCard = styled(motion.div) <{ $selected?: boolean }>`
  background: white;
  border-radius: 20px;
  border: 1.5px solid ${props => props.$selected ? 'var(--primary)' : 'var(--gray-100)'};
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$selected ? '0 8px 25px rgba(18, 161, 82, 0.08)' : '0 2px 8px rgba(0,0,0,0.02)'};
  
  &:hover { 
    border-color: var(--primary);
    transform: translateX(6px);
    box-shadow: 0 10px 25px rgba(18, 161, 82, 0.06);
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'outline' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
  
  ${props => {
        switch (props.$variant) {
            case 'primary':
                return `background: var(--primary); color: white; border: none; box-shadow: 0 4px 12px rgba(18, 161, 82, 0.2);`;
            case 'secondary':
                return `background: var(--sidebar-dark); color: white; border: none;`;
            case 'outline':
                return `background: white; color: var(--secondary); border: 1.5px solid var(--gray-100);`;
            default:
                return `background: white; color: var(--secondary); border: 1.5px solid var(--gray-100);`;
        }
    }}
  
  &:hover { 
    transform: translateY(-2px);
    ${props => props.$variant === 'primary' ? 'box-shadow: 0 8px 20px rgba(18, 161, 82, 0.3); opacity: 0.95;' : 'border-color: var(--primary); color: var(--primary);'}
  }
  
  &:active { transform: translateY(0); }
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BiomedicosPage() {
    const [activeTab, setActiveTab] = useState('equipos');
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const queryClient = useQueryClient();

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleMassivePrint = () => {
        if (selectedIds.length === 0) return;
        window.open(`/dashboard/biomedicos/impresion-masiva?ids=${selectedIds.join(',')}`, '_blank');
    };

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

    // Data fetching
    const { data: equipos = [], isLoading: loadingEquipos } = useQuery({
        queryKey: ['equipos-biomedicos'],
        queryFn: async () => { const res = await fetch(`${API_URL}/equipos`); return res.json(); }
    });

    const { data: contratos = [] } = useQuery({
        queryKey: ['contratos-biomedicos'],
        queryFn: async () => { const res = await fetch(`${API_URL}/contratos-biomedicos`); return res.json(); }
    });

    const { data: mantenimientos = [] } = useQuery({
        queryKey: ['mantenimientos-global'],
        queryFn: async () => { const res = await fetch(`${API_URL}/mantenimientos`); return res.json(); }
    });

    const { data: repuestos = [] } = useQuery({
        queryKey: ['repuestos-global'],
        queryFn: async () => { const res = await fetch(`${API_URL}/repuestos-equipos`); return res.json(); }
    });

    const { data: proveedores = [] } = useQuery({
        queryKey: ['proveedores'],
        queryFn: async () => { const res = await fetch(`${API_URL}/proveedores`); return res.json(); }
    });

    const { data: warehouses = [] } = useQuery({
        queryKey: ['warehouses'],
        queryFn: async () => { const res = await fetch(`${API_URL}/bodegas`); return res.json(); }
    });

    // Mutations
    const saveMutation = useMutation({
        mutationFn: async ({ type, data }: any) => {
            const url = `${API_URL}/${type === 'equipo' ? 'equipos' : type === 'mantenimiento' ? 'mantenimientos' : type === 'contrato' ? 'contratos-biomedicos' : 'repuestos-equipos'}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipos-biomedicos'] });
            queryClient.invalidateQueries({ queryKey: ['contratos-biomedicos'] });
            queryClient.invalidateQueries({ queryKey: ['mantenimientos-global'] });
            queryClient.invalidateQueries({ queryKey: ['repuestos-global'] });
            setModal(null);
        }
    });

    const renderTabContent = () => {
        const safeEquipos = Array.isArray(equipos) ? equipos : [];
        const safeContratos = Array.isArray(contratos) ? contratos : [];
        const safeMantenimientos = Array.isArray(mantenimientos) ? mantenimientos : [];
        const safeRepuestos = Array.isArray(repuestos) ? repuestos : [];

        switch (activeTab) {
            case 'equipos':
                return (
                    <Grid>
                        {safeEquipos.filter((e: any) => e.nombre?.toLowerCase().includes(searchTerm.toLowerCase())).map((eq: any) => (
                            <EquipmentCard
                                key={eq.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                $selected={selectedIds.includes(eq.id)}
                            >
                                <div onClick={() => toggleSelect(eq.id)} style={{ cursor: 'pointer', color: selectedIds.includes(eq.id) ? 'var(--primary)' : 'var(--gray-300)' }}>
                                    {selectedIds.includes(eq.id) ? <CheckSquare size={24} /> : <Square size={24} />}
                                </div>

                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <div style={{ minWidth: '100px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', display: 'block' }}>ID</span>
                                        <span style={{ fontWeight: 700 }}>{eq.codigo_inventario}</span>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{eq.nombre}</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>{eq.marca} - {eq.modelo}</p>
                                    </div>

                                    <div style={{ minWidth: '150px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', display: 'block' }}>UBICACIÓN</span>
                                        <span style={{ fontSize: '0.85rem' }}>{eq.bodegas?.nombre || 'General'}</span>
                                    </div>

                                    <div style={{ minWidth: '120px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', display: 'block' }}>ESTADO</span>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            color: eq.estado === 'Funcional' ? 'var(--primary)' :
                                                eq.estado === 'Mantenimiento' ? '#f97316' :
                                                    eq.estado === 'En Seguimiento' ? '#eab308' : '#ef4444',
                                            fontWeight: 700
                                        }}>
                                            {eq.estado}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {isPermitted('biomedicos', 'descargar_pdf') && (
                                        <ActionButton onClick={() => window.open(`/dashboard/biomedicos/hoja-vida/${eq.id}`, '_blank')} $variant="outline" style={{ padding: '0.5rem' }} title="Descargar Hoja de Vida">
                                            <Download size={18} />
                                        </ActionButton>
                                    )}
                                    <ActionButton onClick={() => window.open(`/dashboard/biomedicos/hoja-vida/${eq.id}`, '_self')} $variant="outline" style={{ padding: '0.5rem' }}>
                                        <Eye size={18} /> Ver Detalle
                                    </ActionButton>
                                    {isPermitted('biomedicos', 'gestionar') && (
                                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--secondary)' }}><Edit size={18} /></button>
                                    )}
                                </div>
                            </EquipmentCard>
                        ))}
                    </Grid>
                );
            case 'contratos':
                const sortedContratos = [...safeContratos].sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime());

                return (
                    <Table>
                        <thead>
                            <tr>
                                <th>N° CONTRATO</th>
                                <th>PROVEEDOR</th>
                                <th>VALOR ACTUAL</th>
                                <th>AUMENTO ($)</th>
                                <th>INC. (%)</th>
                                <th>VIGENCIA</th>
                                <th>VISITAS</th>
                                <th>EJECUCIÓN</th>
                                <th>ESTADO</th>
                                <th>DOC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedContratos.map((c: any) => {
                                // Buscar el contrato inmediatamente anterior para este proveedor y equipo
                                const prevC = sortedContratos
                                    .filter((pc: any) =>
                                        pc.id !== c.id &&
                                        pc.proveedor_id === c.proveedor_id &&
                                        new Date(pc.fecha_inicio) < new Date(c.fecha_inicio)
                                    )
                                    .sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime())[0];

                                const numEquipos = c.contrato_vinculos_equipos?.[0]?.count || 1;
                                const metaTotal = numEquipos * (c.visitas_pactadas || 0);

                                const aumento = prevC ? Number(c.valor_total) - Number(prevC.valor_total) : 0;
                                const pctAumento = prevC ? (aumento / Number(prevC.valor_total)) * 100 : 0;

                                const realizadas = mantenimientos.filter((m: any) => m.contrato_id === c.id).length;
                                const porcentajeEjec = metaTotal > 0 ? Math.min(Math.round((realizadas / metaTotal) * 100), 100) : 0;

                                return (
                                    <tr key={c.id} style={{ borderLeft: prevC ? '4px solid var(--gray-100)' : '4px solid var(--primary)' }}>
                                        <td><strong>{c.numero_contrato}</strong></td>
                                        <td>{c.proveedores?.nombre}</td>
                                        <td>
                                            <div style={{ fontWeight: 800 }}>${Number(c.valor_total).toLocaleString()}</div>
                                            {prevC && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Anterior: ${Number(prevC.valor_total).toLocaleString()}</div>}
                                        </td>
                                        <td style={{ color: aumento > 0 ? '#ef4444' : aumento < 0 ? '#10b981' : '#cbd5e1', fontWeight: 700 }}>
                                            {aumento > 0 ? `+$${aumento.toLocaleString()}` : aumento < 0 ? `-$${Math.abs(aumento).toLocaleString()}` : 'Sin cambio'}
                                        </td>
                                        <td style={{ color: pctAumento > 0 ? '#ef4444' : pctAumento < 0 ? '#10b981' : '#cbd5e1', fontWeight: 800 }}>
                                            {pctAumento > 0 ? `+${pctAumento.toFixed(1)}%` : pctAumento < 0 ? `${pctAumento.toFixed(1)}%` : '0%'}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>{new Date(c.fecha_inicio).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>al {new Date(c.fecha_fin).toLocaleDateString()}</div>
                                        </td>
                                        <td><span style={{ fontWeight: 700 }}>{realizadas} / {c.visitas_pactadas}</span></td>
                                        <td>
                                            <div style={{ width: '80px', background: 'var(--gray-100)', borderRadius: '10px', height: '6px', overflow: 'hidden', marginTop: '4px' }}>
                                                <div style={{ width: `${porcentajeEjec}%`, background: porcentajeEjec === 100 ? 'var(--primary)' : 'var(--primary)', height: '100%', opacity: porcentajeEjec === 100 ? 1 : 0.6 }} />
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{porcentajeEjec}%</span>
                                        </td>
                                        <td><span style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: c.estado === 'Activo' ? 'rgba(18, 161, 82, 0.1)' : 'var(--gray-100)', color: c.estado === 'Activo' ? 'var(--primary)' : 'var(--secondary)', border: '1px solid transparent', borderRadius: '8px', fontWeight: 700 }}>{c.estado}</span></td>
                                        <td>
                                            {c.documento_url ? (
                                                <a
                                                    href={c.documento_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', background: 'rgba(18, 161, 82, 0.1)', color: 'var(--primary)', borderRadius: '8px', transition: 'all 0.2s' }}
                                                    title="Ver contrato PDF"
                                                >
                                                    <Eye size={16} />
                                                </a>
                                            ) : (
                                                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                );
            case 'mantenimientos':
                return (
                    <Table>
                        <thead>
                            <tr>
                                <th>FECHA</th>
                                <th>EQUIPO</th>
                                <th>TIPO</th>
                                <th>TÉCNICO</th>
                                <th>COSTO</th>
                                <th>TRABAJO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {safeMantenimientos.map((m: any) => (
                                <tr key={m.id}>
                                    <td>{new Date(m.fecha_ejecucion || m.fecha_programada).toLocaleDateString()}</td>
                                    <td>{m.equipos_biomedicos?.nombre}</td>
                                    <td>{m.tipo}</td>
                                    <td>{m.tecnico_responsable}</td>
                                    <td>${Number(m.costo).toLocaleString()}</td>
                                    <td>{m.descripcion_trabajo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'repuestos':
                return (
                    <Table>
                        <thead>
                            <tr>
                                <th>FECHA</th>
                                <th>EQUIPO</th>
                                <th>REPUESTO</th>
                                <th>CANT.</th>
                                <th>VALOR UNIT.</th>
                                <th>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {safeRepuestos.map((r: any) => (
                                <tr key={r.id}>
                                    <td>{new Date(r.fecha_instalacion).toLocaleDateString()}</td>
                                    <td>{r.equipos_biomedicos?.nombre || 'General'}</td>
                                    <td>{r.nombre_repuesto}</td>
                                    <td>{r.cantidad}</td>
                                    <td>${Number(r.costo_unitario).toLocaleString()}</td>
                                    <td><strong>${(r.cantidad * r.costo_unitario).toLocaleString()}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
        }
    };

    const getPrimaryAction = () => {
        switch (activeTab) {
            case 'equipos': return { text: 'Nuevo Equipo', icon: <Plus size={20} />, action: () => setModal('equipo') };
            case 'contratos': return { text: 'Nuevo Contrato', icon: <Briefcase size={20} />, action: () => setModal('contrato') };
            case 'mantenimientos': return { text: 'Registrar Mantenimiento', icon: <Wrench size={20} />, action: () => setModal('mantenimiento') };
            case 'repuestos': return { text: 'Registrar Repuesto', icon: <ShoppingCart size={20} />, action: () => setModal('repuesto') };
            default: return null;
        }
    };

    const primaryAction = getPrimaryAction();

    return (
        <Container>
            <ModuleHeader>
                <TitleSection>
                    <h1>Gestión Biomédica</h1>
                    <p>Mantenimientos, Contratos y Hojas de Vida Institucional</p>
                </TitleSection>
                {primaryAction && isPermitted('biomedicos', 'gestionar') && (
                    <ActionButton $variant="primary" onClick={primaryAction.action}>
                        {primaryAction.icon}
                        {primaryAction.text}
                    </ActionButton>
                )}
            </ModuleHeader>

            <TabContainer>
                <Tab $active={activeTab === 'equipos'} onClick={() => setActiveTab('equipos')}>Equipos</Tab>
                <Tab $active={activeTab === 'contratos'} onClick={() => setActiveTab('contratos')}>Contratos</Tab>
                <Tab $active={activeTab === 'mantenimientos'} onClick={() => setActiveTab('mantenimientos')}>Mantenimientos</Tab>
                <Tab $active={activeTab === 'repuestos'} onClick={() => setActiveTab('repuestos')}>Repuestos</Tab>
            </TabContainer>

            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                    <input
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}
                        placeholder="Buscar en este módulo..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {selectedIds.length > 0 && isPermitted('biomedicos', 'descargar_pdf') && (
                    <ActionButton $variant="primary" style={{ background: '#00A651' }} onClick={handleMassivePrint}>
                        <Download size={20} /> Descarga Masiva ({selectedIds.length})
                    </ActionButton>
                )}
                <ActionButton $variant="secondary" onClick={() => setSelectedIds(equipos.map((e: any) => e.id))}>
                    <CheckSquare size={20} /> Seleccionar Todos
                </ActionButton>
                <ActionButton $variant="secondary"><Filter size={20} /> Filtros</ActionButton>
            </div>

            {renderTabContent()}

            {modal === 'equipo' && <EquipoModal isOpen={!!modal} onClose={() => setModal(null)} onSave={d => saveMutation.mutate({ type: 'equipo', data: d })} warehouses={warehouses} />}
            {modal === 'contrato' && <ContratoModal isOpen={!!modal} onClose={() => setModal(null)} onSave={d => saveMutation.mutate({ type: 'contrato', data: d })} proveedores={proveedores} equipos={equipos} />}
            {modal === 'mantenimiento' && <MantenimientoModal isOpen={!!modal} onClose={() => setModal(null)} onSave={d => saveMutation.mutate({ type: 'mantenimiento', data: d })} equipos={equipos} contratos={contratos} mantenimientos={mantenimientos} />}
            {modal === 'repuesto' && <RepuestoModal isOpen={!!modal} onClose={() => setModal(null)} onSave={d => saveMutation.mutate({ type: 'repuesto', data: d })} equipos={equipos} />}
        </Container>
    );
}
