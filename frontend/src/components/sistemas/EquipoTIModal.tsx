'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Monitor, Cpu, HardDrive, Wifi, User, MapPin, DollarSign, Calendar, Tag, Hash } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
`;

const Modal = styled(motion.div)`
  background: white; width: 100%; max-width: 680px;
  border-radius: 24px; overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);
  max-height: 94vh; display: flex; flex-direction: column;
`;

const Header = styled.div`
  padding: 1.25rem 2rem;
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
  color: white; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
`;

const Content = styled.div`
  padding: 1.5rem 2rem; display: flex; flex-direction: column;
  gap: 1.25rem; overflow-y: auto; flex: 1;
`;

const Footer = styled.div`
  padding: 1rem 2rem; border-top: 1px solid #e2e8f0;
  display: flex; justify-content: flex-end; gap: 1rem; background: #f8fafc; flex-shrink: 0;
`;

const G = styled.div<{ cols?: number }>`
  display: grid;
  grid-template-columns: ${p => `repeat(${p.cols || 2}, 1fr)`};
  gap: 1rem;
`;

const FG = styled.div`display: flex; flex-direction: column; gap: 0.4rem;`;

const Label = styled.label`
  font-size: 0.75rem; font-weight: 700; color: #64748b;
  display: flex; align-items: center; gap: 0.4rem;
`;

const Input = styled.input`
  padding: 0.65rem 0.9rem; border-radius: 10px;
  border: 2px solid #e2e8f0; font-size: 0.9rem;
  &:focus { border-color: #7c3aed; outline: none; }
`;

const Select = styled.select`
  padding: 0.65rem 0.9rem; border-radius: 10px;
  border: 2px solid #e2e8f0; font-size: 0.9rem; background: white;
  &:focus { border-color: #7c3aed; outline: none; }
`;

const STitle = styled.div`
  font-size: 0.65rem; font-weight: 800; color: #94a3b8;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding-bottom: 0.25rem; border-bottom: 1px solid #f1f5f9;
`;

const Btn = styled.button<{ $v?: string }>`
  padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700;
  font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
  ${p => p.$v === 'primary'
        ? 'background:#7c3aed;color:white;border:none;&:hover{background:#6d28d9;}'
        : 'background:white;color:#64748b;border:1px solid #e2e8f0;&:hover{background:#f1f5f9;}'}
`;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

const estadoOpts = ['Activo', 'Mantenimiento', 'En Seguimiento', 'Baja'];
const tipoOpts = ['Desktop', 'Laptop', 'Servidor', 'Impresora', 'Switch', 'Router', 'Tablet', 'Otro'];
const osOpts = ['Windows 11 Pro', 'Windows 11 Home', 'Windows 10 Pro', 'Windows 10 Home', 'macOS', 'Ubuntu', 'Linux', 'Otro'];

const estadoColor: Record<string, { bg: string; color: string }> = {
    'Activo': { bg: '#dcfce7', color: '#166534' },
    'Mantenimiento': { bg: '#ffedd5', color: '#9a3412' },
    'En Seguimiento': { bg: '#fef9c3', color: '#854d0e' },
    'Baja': { bg: '#fee2e2', color: '#991b1b' }
};

interface RamSlot { tipo: string; capacidad: string; }
interface HddSlot { tipo: string; capacidad: string; unidad: string; }

const emptyRam = (): RamSlot => ({ tipo: 'DDR4', capacidad: '' });
const emptyHdd = (): HddSlot => ({ tipo: 'SSD', capacidad: '', unidad: 'GB' });

export default function EquipoTIModal({ isOpen, onClose, onSave }: Props) {
    const [form, setForm] = useState({
        nombre: '', hostname: '', tipo: 'Desktop',
        marca: '', modelo: '', serial: '', numero_activo: '',
        procesador: '', sistema_operativo: 'Windows 11 Pro',
        ip_address: '', mac_address: '',
        usuario_asignado: '', sede: '', oficina: '',
        fecha_compra: '', valor_compra: 0,
        estado: 'Activo', observaciones: ''
    });
    const [ramSlots, setRamSlots] = useState<RamSlot[]>([emptyRam()]);
    const [hddSlots, setHddSlots] = useState<HddSlot[]>([emptyHdd()]);

    const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

    const updateRam = (i: number, k: keyof RamSlot, v: string) =>
        setRamSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [k]: v } : s));
    const updateHdd = (i: number, k: keyof HddSlot, v: string) =>
        setHddSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [k]: v } : s));

    // Serializar arrays a strings legibles
    const serializeRam = (slots: RamSlot[]) => {
        const valid = slots.filter(s => s.capacidad);
        if (!valid.length) return '';
        const totalGB = valid.reduce((s, sl) => s + parseFloat(sl.capacidad || '0'), 0);
        const desc = valid.map(s => `${s.capacidad}GB ${s.tipo}`).join(' + ');
        return `${desc} (Total: ${totalGB}GB)`;
    };
    const serializeHdd = (slots: HddSlot[]) =>
        slots.filter(s => s.capacidad).map(s => `${s.capacidad}${s.unidad} ${s.tipo}`).join(' + ');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...form, ram: serializeRam(ramSlots), almacenamiento: serializeHdd(hddSlots) });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
                <Modal initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()}>
                    <Header>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Monitor size={22} />
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Nuevo Equipo TI</h2>
                                <p style={{ fontSize: '0.72rem', opacity: 0.8, margin: 0 }}>Registro de activo tecnológico</p>
                            </div>
                        </div>
                        <X size={22} style={{ cursor: 'pointer' }} onClick={onClose} />
                    </Header>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                        <Content>

                            {/* Estado visual */}
                            <FG>
                                <Label>Estado</Label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {estadoOpts.map(est => {
                                        const ec = estadoColor[est];
                                        return (
                                            <button key={est} type="button" onClick={() => set('estado', est)}
                                                style={{
                                                    flex: 1, padding: '0.45rem 0.25rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                                                    border: form.estado === est ? '2px solid #7c3aed' : '2px solid #e2e8f0',
                                                    background: form.estado === est ? ec.bg : 'white',
                                                    color: form.estado === est ? ec.color : '#94a3b8'
                                                }}>{est}</button>
                                        );
                                    })}
                                </div>
                            </FG>

                            <STitle>📋 Identificación</STitle>
                            <G cols={3}>
                                <FG>
                                    <Label><Tag size={13} /> Tipo</Label>
                                    <Select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                                        {tipoOpts.map(t => <option key={t} value={t}>{t}</option>)}
                                    </Select>
                                </FG>
                                <FG>
                                    <Label><Hash size={13} /> N° Activo</Label>
                                    <Input placeholder="ACT-TI-001" value={form.numero_activo} onChange={e => set('numero_activo', e.target.value)} />
                                </FG>
                                <FG>
                                    <Label><Hash size={13} /> Serial</Label>
                                    <Input placeholder="5CG1234XYZ" value={form.serial} onChange={e => set('serial', e.target.value)} />
                                </FG>
                            </G>

                            <G>
                                <FG>
                                    <Label><Monitor size={13} /> Nombre / Etiqueta</Label>
                                    <Input required placeholder="PC-CONTABILIDAD-01" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
                                </FG>
                                <FG>
                                    <Label><Wifi size={13} /> Hostname</Label>
                                    <Input placeholder="HOSTNAME-PC01" value={form.hostname} onChange={e => set('hostname', e.target.value)} />
                                </FG>
                            </G>

                            <G>
                                <FG>
                                    <Label>Marca</Label>
                                    <Input placeholder="Dell, HP, Lenovo..." value={form.marca} onChange={e => set('marca', e.target.value)} />
                                </FG>
                                <FG>
                                    <Label>Modelo</Label>
                                    <Input placeholder="OptiPlex 7090" value={form.modelo} onChange={e => set('modelo', e.target.value)} />
                                </FG>
                            </G>

                            <STitle>⚙️ Especificaciones Técnicas</STitle>
                            <G>
                                <FG>
                                    <Label><Cpu size={13} /> Procesador</Label>
                                    <Input placeholder="Intel Core i7-11700" value={form.procesador} onChange={e => set('procesador', e.target.value)} />
                                </FG>
                                <FG>
                                    <Label>Sistema Operativo</Label>
                                    <Select value={form.sistema_operativo} onChange={e => set('sistema_operativo', e.target.value)}>
                                        {osOpts.map(o => <option key={o} value={o}>{o}</option>)}
                                    </Select>
                                </FG>
                            </G>

                            {/* ── RAM ── */}
                            <FG>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Label>🧠 Módulos de RAM</Label>
                                    <button type="button" onClick={() => setRamSlots(p => [...p, emptyRam()])}
                                        style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', background: 'none', border: '1.5px dashed #c4b5fd', borderRadius: '6px', padding: '0.2rem 0.6rem', cursor: 'pointer' }}>
                                        + Añadir módulo
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {ramSlots.map((slot, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '0.5rem', alignItems: 'center' }}>
                                            <select value={slot.tipo} onChange={e => updateRam(i, 'tipo', e.target.value)}
                                                style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.85rem', background: 'white' }}>
                                                {['DDR3', 'DDR4', 'DDR5'].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                                <Input type="number" min={0} placeholder="8" value={slot.capacidad} onChange={e => updateRam(i, 'capacidad', e.target.value)}
                                                    style={{ width: '100%' }} />
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>GB</span>
                                            </div>
                                            <button type="button" onClick={() => setRamSlots(p => p.filter((_, idx) => idx !== i))} disabled={ramSlots.length === 1}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: ramSlots.length === 1 ? 'not-allowed' : 'pointer', opacity: ramSlots.length === 1 ? 0.3 : 1 }}>
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {ramSlots.filter(s => s.capacidad).length > 0 && (
                                        <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700, paddingLeft: '0.25rem' }}>
                                            Total: {ramSlots.filter(s => s.capacidad).reduce((sum, s) => sum + parseFloat(s.capacidad || '0'), 0)} GB
                                            &nbsp;—&nbsp; {ramSlots.filter(s => s.capacidad).map(s => `${s.capacidad}GB ${s.tipo}`).join(' + ')}
                                        </div>
                                    )}
                                </div>
                            </FG>

                            {/* ── Almacenamiento ── */}
                            <FG>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Label><HardDrive size={13} /> Unidades de Almacenamiento</Label>
                                    <button type="button" onClick={() => setHddSlots(p => [...p, emptyHdd()])}
                                        style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', background: 'none', border: '1.5px dashed #c4b5fd', borderRadius: '6px', padding: '0.2rem 0.6rem', cursor: 'pointer' }}>
                                        + Añadir unidad
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {hddSlots.map((slot, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.6fr auto', gap: '0.5rem', alignItems: 'center' }}>
                                            <select value={slot.tipo} onChange={e => updateHdd(i, 'tipo', e.target.value)}
                                                style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.85rem', background: slot.tipo === 'SSD' || slot.tipo === 'M.2 NVMe' ? '#eff6ff' : 'white', fontWeight: 600 }}>
                                                {['SSD', 'HDD', 'M.2 NVMe', 'eMMC', 'Otro'].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <Input type="number" min={0} placeholder="512" value={slot.capacidad} onChange={e => updateHdd(i, 'capacidad', e.target.value)} />
                                            <select value={slot.unidad} onChange={e => updateHdd(i, 'unidad', e.target.value)}
                                                style={{ padding: '0.55rem 0.5rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.85rem', background: 'white', fontWeight: 700 }}>
                                                {['GB', 'TB'].map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                            <button type="button" onClick={() => setHddSlots(p => p.filter((_, idx) => idx !== i))} disabled={hddSlots.length === 1}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: hddSlots.length === 1 ? 'not-allowed' : 'pointer', opacity: hddSlots.length === 1 ? 0.3 : 1 }}>
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {hddSlots.filter(s => s.capacidad).length > 0 && (
                                        <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700, paddingLeft: '0.25rem' }}>
                                            {hddSlots.filter(s => s.capacidad).map(s => `${s.capacidad}${s.unidad} ${s.tipo}`).join(' + ')}
                                        </div>
                                    )}
                                </div>
                            </FG>
                            <G>
                                <FG>
                                    <Label><Wifi size={13} /> Dirección IP</Label>
                                    <Input placeholder="192.168.1.50" value={form.ip_address} onChange={e => set('ip_address', e.target.value)} />
                                </FG>
                                <FG>
                                    <Label>Dirección MAC</Label>
                                    <Input placeholder="AA:BB:CC:DD:EE:FF" value={form.mac_address} onChange={e => set('mac_address', e.target.value)} />
                                </FG>
                            </G>

                            <STitle>👤 Asignación & Ubicación</STitle>
                            <G cols={3}>
                                <FG>
                                    <Label><User size={13} /> Usuario Asignado</Label>
                                    <Input placeholder="Nombre del empleado" value={form.usuario_asignado} onChange={e => set('usuario_asignado', e.target.value)} />
                                </FG>
                                <FG>
                                    <Label><MapPin size={13} /> Sede</Label>
                                    <Input placeholder="Sede Principal" value={form.sede} onChange={e => set('sede', e.target.value)} />
                                </FG>
                                <FG>
                                    <Label><MapPin size={13} /> Oficina</Label>
                                    <Input placeholder="Piso 2 - Contabilidad" value={form.oficina} onChange={e => set('oficina', e.target.value)} />
                                </FG>
                            </G>

                            <STitle>💰 Datos de Compra</STitle>
                            <G>
                                <FG>
                                    <Label><Calendar size={13} /> Fecha de Compra</Label>
                                    <Input type="date" value={form.fecha_compra} onChange={e => set('fecha_compra', e.target.value)} />
                                </FG>
                                <FG>
                                    <Label><DollarSign size={13} /> Valor de Compra</Label>
                                    <Input type="number" placeholder="0" value={form.valor_compra} onChange={e => set('valor_compra', Number(e.target.value))} />
                                </FG>
                            </G>

                        </Content>

                        <Footer>
                            <Btn type="button" onClick={onClose}>Cancelar</Btn>
                            <Btn type="submit" $v="primary"><Save size={18} /> Guardar Equipo</Btn>
                        </Footer>
                    </form>
                </Modal>
            </Overlay>
        </AnimatePresence>
    );
}
