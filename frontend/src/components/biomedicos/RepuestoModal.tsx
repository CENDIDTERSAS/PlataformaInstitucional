'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ShoppingCart, DollarSign, Calendar, Settings, FileText, Truck, Plus, Trash2 } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background: white;
  width: 100%;
  max-width: 780px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  max-height: 94vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.25rem 2rem;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const Content = styled.div`
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
  flex: 1;
`;

const Footer = styled.div`
  padding: 1rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  flex-shrink: 0;
`;

const Input = styled.input`
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  font-size: 0.9rem;
  width: 100%;
  &:focus { border-color: #ef4444; outline: none; }
`;

const Select = styled.select`
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  font-size: 0.9rem;
  background: white;
  width: 100%;
  &:focus { border-color: #ef4444; outline: none; }
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.25rem;
`;

const Btn = styled.button<{ $v?: string }>`
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  ${p => p.$v === 'primary' ? 'background:#ef4444;color:white;' :
    p.$v === 'ghost' ? 'background:transparent;color:#ef4444;border:2px dashed #fca5a5;' :
      'background:white;color:#64748b;border:1px solid #e2e8f0;'}
  &:hover { opacity: 0.85; }
`;

interface LineItem {
  nombre_repuesto: string;
  cantidad: number;
  costo_unitario: number;
  iva_porcentaje: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  equipoId?: string;
  equipos?: any[];
}

const emptyItem = (): LineItem => ({ nombre_repuesto: '', cantidad: 1, costo_unitario: 0, iva_porcentaje: 0 });

export default function RepuestoModal({ isOpen, onClose, onSave, equipoId, equipos = [] }: Props) {
  const [cabecera, setCabecera] = useState({
    equipo_id: equipoId || '',
    proveedor: '',
    numero_cotizacion: '',
    fecha_cotizacion: new Date().toISOString().split('T')[0],
    observaciones: '',
    estado: 'Cotizado'
  });

  const [items, setItems] = useState<LineItem[]>([emptyItem()]);

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: any) => {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  };

  const subtotalGlobal = items.reduce((sum, it) => sum + (it.costo_unitario * it.cantidad), 0);
  const ivaGlobal = items.reduce((sum, it) => sum + (it.costo_unitario * it.cantidad * (it.iva_porcentaje / 100)), 0);
  const totalGlobal = subtotalGlobal + ivaGlobal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Guardar un registro por cada ítem, compartiendo los datos de la cabecera
    const registros = items
      .filter(it => it.nombre_repuesto.trim())
      .map(it => ({ ...cabecera, ...it }));
    registros.forEach(r => onSave(r));
  };

  if (!isOpen) return null;

  const estadoColor: any = {
    Cotizado: { bg: '#fef9c3', color: '#854d0e' },
    Autorizado: { bg: '#dcfce7', color: '#166534' },
    Instalado: { bg: '#eff6ff', color: '#1d4ed8' }
  };

  return (
    <AnimatePresence>
      <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <ModalContainer initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()}>

          <Header>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShoppingCart size={22} />
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Nueva Cotización de Repuestos</h2>
                <p style={{ fontSize: '0.72rem', opacity: 0.8, margin: 0 }}>Registra múltiples ítems de una sola cotización</p>
              </div>
            </div>
            <X size={22} style={{ cursor: 'pointer' }} onClick={onClose} />
          </Header>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <Content>

              {/* ── Encabezado de la cotización ── */}
              <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em' }}>📋 ENCABEZADO DE COTIZACIÓN</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <Label><Truck size={13} /> Proveedor</Label>
                    <Input placeholder="Nombre proveedor" value={cabecera.proveedor} onChange={e => setCabecera(p => ({ ...p, proveedor: e.target.value }))} />
                  </div>
                  <div>
                    <Label><FileText size={13} /> N° Cotización</Label>
                    <Input placeholder="COT-2025-001" value={cabecera.numero_cotizacion} onChange={e => setCabecera(p => ({ ...p, numero_cotizacion: e.target.value }))} />
                  </div>
                  <div>
                    <Label><Calendar size={13} /> Fecha</Label>
                    <Input type="date" value={cabecera.fecha_cotizacion} onChange={e => setCabecera(p => ({ ...p, fecha_cotizacion: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: equipoId ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                  {!equipoId && (
                    <div>
                      <Label><Settings size={13} /> Equipo</Label>
                      <Select required value={cabecera.equipo_id} onChange={e => setCabecera(p => ({ ...p, equipo_id: e.target.value }))}>
                        <option value="">Seleccione equipo...</option>
                        {equipos.map((eq: any) => (
                          <option key={eq.id} value={eq.id}>{eq.nombre} — {eq.codigo_inventario}</option>
                        ))}
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label>Estado Inicial</Label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {(['Cotizado', 'Autorizado', 'Instalado'] as const).map(est => (
                        <button key={est} type="button"
                          onClick={() => setCabecera(p => ({ ...p, estado: est }))}
                          style={{
                            flex: 1, padding: '0.5rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                            border: cabecera.estado === est ? '2px solid #ef4444' : '2px solid #e2e8f0',
                            background: cabecera.estado === est ? estadoColor[est].bg : 'white',
                            color: cabecera.estado === est ? estadoColor[est].color : '#94a3b8'
                          }}
                        >{est}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Ítems de la cotización ── */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em' }}>🔩 ÍTEMS DE LA COTIZACIÓN</div>
                  <Btn type="button" $v="ghost" onClick={addItem} style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>
                    <Plus size={14} /> Añadir ítem
                  </Btn>
                </div>

                {/* Encabezado tabla */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 0.8fr 1fr auto', gap: '0.5rem', padding: '0.5rem 0.5rem', background: '#f1f5f9', borderRadius: '8px 8px 0 0' }}>
                  {['REPUESTO / PIEZA', 'CANT.', 'COSTO UNIT.', 'IVA', 'TOTAL', ''].map((h, i) => (
                    <div key={i} style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>{h}</div>
                  ))}
                </div>

                {/* Filas de ítems */}
                <div style={{ border: '1px solid #f1f5f9', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
                  {items.map((item, i) => {
                    const subtotalFila = item.costo_unitario * item.cantidad;
                    const ivaFila = subtotalFila * (item.iva_porcentaje / 100);
                    const totalFila = subtotalFila + ivaFila;
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 0.8fr 1fr auto', gap: '0.5rem', padding: '0.5rem', borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
                        <Input
                          required
                          placeholder="Ej: Sensor de flujo NF-100"
                          value={item.nombre_repuesto}
                          onChange={e => updateItem(i, 'nombre_repuesto', e.target.value)}
                        />
                        <Input
                          type="number" min={1}
                          value={item.cantidad}
                          onChange={e => updateItem(i, 'cantidad', Number(e.target.value))}
                          style={{ textAlign: 'center' }}
                        />
                        <Input
                          type="number" min={0}
                          value={item.costo_unitario}
                          onChange={e => updateItem(i, 'costo_unitario', Number(e.target.value))}
                        />
                        {/* Selector IVA */}
                        <select
                          value={item.iva_porcentaje}
                          onChange={e => updateItem(i, 'iva_porcentaje', Number(e.target.value))}
                          style={{ padding: '0.45rem 0.4rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.8rem', background: item.iva_porcentaje > 0 ? '#eff6ff' : 'white', color: item.iva_porcentaje > 0 ? '#1d4ed8' : '#64748b', fontWeight: 700 }}
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={19}>19%</option>
                        </select>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', textAlign: 'right', paddingRight: '0.25rem', lineHeight: 1.4 }}>
                          ${totalFila.toLocaleString()}
                          {item.iva_porcentaje > 0 && <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 400 }}>IVA: ${ivaFila.toLocaleString()}</div>}
                        </div>
                        <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1}
                          style={{ background: 'none', border: 'none', cursor: items.length === 1 ? 'not-allowed' : 'pointer', color: '#ef4444', opacity: items.length === 1 ? 0.3 : 1, padding: '0.25rem' }}
                        ><Trash2 size={16} /></button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <Label>Observaciones / Justificación técnica</Label>
                <textarea
                  placeholder="Descripción técnica, garantía, plazo de entrega..."
                  value={cabecera.observaciones}
                  onChange={e => setCabecera(p => ({ ...p, observaciones: e.target.value }))}
                  style={{ width: '100%', minHeight: '70px', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

            </Content>

            <Footer>
              <div style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.8 }}>
                <div style={{ color: '#64748b' }}>Subtotal: <strong>${subtotalGlobal.toLocaleString()}</strong></div>
                {ivaGlobal > 0 && (
                  <div style={{ color: '#2563eb' }}>IVA: <strong>${Math.round(ivaGlobal).toLocaleString()}</strong></div>
                )}
                <div style={{ fontSize: '1rem', fontWeight: 800, color: ivaGlobal > 0 ? '#059669' : '#1e293b' }}>
                  TOTAL: ${Math.round(totalGlobal).toLocaleString()}
                  <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#94a3b8', marginLeft: '0.5rem' }}>
                    ({items.filter(i => i.nombre_repuesto).length} ítem{items.filter(i => i.nombre_repuesto).length !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Btn type="button" onClick={onClose}>Cancelar</Btn>
                <Btn type="submit" $v="primary"><Save size={18} /> Guardar Cotización</Btn>
              </div>
            </Footer>
          </form>

        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
}
