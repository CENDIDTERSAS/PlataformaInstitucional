'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Settings, User, FileText, Calendar, DollarSign, Wrench, ClipboardCheck, Briefcase } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.7);
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
  max-width: 650px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Content = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 1rem;
  &:focus { border-color: #f59e0b; outline: none; }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  &:focus { border-color: #f59e0b; outline: none; }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 1rem;
  background: white;
  &:focus { border-color: #f59e0b; outline: none; }
`;

const Footer = styled.div`
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f8fafc;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  ${props => props.$variant === 'primary' ? `
    background: #f59e0b;
    color: white;
    border: none;
    &:hover { background: #d97706; }
  ` : `
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    &:hover { background: #f1f5f9; }
  `}
`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  equipoId?: string;
  equipos?: any[];
  contratos?: any[];
  mantenimientos?: any[];
}

export default function MantenimientoModal({ isOpen, onClose, onSave, equipoId, equipos = [], contratos = [], mantenimientos = [] }: Props) {
  const [formData, setFormData] = useState({
    equipo_id: equipoId || '',
    contrato_id: '',
    tipo: 'Preventivo',
    fecha_programada: '',
    fecha_ejecucion: new Date().toISOString().split('T')[0],
    tecnico_responsable: '',
    descripcion_trabajo: '',
    observaciones: '',
    costo: 0,
    numero_visita: 1
  });

  // Contratos activos relacionados con el equipo seleccionado
  const contratosFiltrados = contratos.filter((c: any) => {
    if (!formData.equipo_id) return true;
    if (c.equipo_id === formData.equipo_id) return true;
    if (c.contrato_vinculos_equipos?.some?.((v: any) => v.equipo_id === formData.equipo_id)) return true;
    return !c.equipo_id; // contratos generales
  });

  // Calcular visitas preventivas ya ejecutadas para el contrato seleccionado
  const preventivosRealizados = formData.contrato_id
    ? mantenimientos.filter((m: any) => m.contrato_id === formData.contrato_id && m.tipo === 'Preventivo').length
    : 0;

  const contratoActivo = contratos.find((c: any) => c.id === formData.contrato_id);
  const visitasPactadas = contratoActivo?.visitas_pactadas || 0;
  const preventivosCompletos = visitasPactadas > 0 && preventivosRealizados >= visitasPactadas;

  // Helper: calcular costo por visita de un contrato
  const calcCostoPorVisita = (contrato: any) => {
    if (!contrato || !contrato.valor_total || !contrato.visitas_pactadas) return 0;
    return Math.round(Number(contrato.valor_total) / Number(contrato.visitas_pactadas));
  };

  // Auto-seleccionar contrato si el equipo solo tiene uno activo
  const handleEquipoChange = (equipoId: string) => {
    const contratosDelEquipo = contratos.filter((c: any) => {
      if (c.equipo_id === equipoId) return true;
      if (c.contrato_vinculos_equipos?.some?.((v: any) => v.equipo_id === equipoId)) return true;
      return false;
    });
    const contratoObj = contratosDelEquipo.length === 1 ? contratosDelEquipo[0] : null;
    const contratoUnico = contratoObj?.id || '';
    const prevRealizados = contratoUnico
      ? mantenimientos.filter((m: any) => m.contrato_id === contratoUnico && m.tipo === 'Preventivo').length
      : 0;
    const costoPorVisita = calcCostoPorVisita(contratoObj);
    setFormData(prev => ({
      ...prev,
      equipo_id: equipoId,
      contrato_id: contratoUnico,
      numero_visita: prevRealizados + 1,
      costo: costoPorVisita
    }));
  };

  // Auto-calcular número de visita y costo cuando cambia el contrato
  const handleContratoChange = (contratoId: string) => {
    const contratoObj = contratos.find((c: any) => c.id === contratoId);
    const prevRealizados = mantenimientos.filter(
      (m: any) => m.contrato_id === contratoId && m.tipo === 'Preventivo'
    ).length;
    const costoPorVisita = calcCostoPorVisita(contratoObj);
    setFormData(prev => ({
      ...prev,
      contrato_id: contratoId,
      numero_visita: prevRealizados + 1,
      costo: costoPorVisita
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <ModalContainer initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()}>
          <Header>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Settings size={24} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Registrar Mantenimiento</h2>
            </div>
            <X size={24} style={{ cursor: 'pointer' }} onClick={onClose} />
          </Header>
          <form onSubmit={handleSubmit}>
            <Content>
              <FormGroup>
                <Label><Settings size={16} /> Tipo de Mantenimiento</Label>
                <Select value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                  <option value="Preventivo" disabled={preventivosCompletos}>
                    Preventivo {preventivosCompletos ? '(Visitas completas)' : ''}
                  </option>
                  <option value="Correctivo">Correctivo</option>
                  <option value="Calibración">Calibración</option>
                </Select>
                {preventivosCompletos && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#fef9c3', borderRadius: '8px', fontSize: '0.8rem', color: '#854d0e', fontWeight: 600 }}>
                    ⚠️ Las {visitasPactadas} visitas preventivas del contrato ya fueron ejecutadas. Solo se permiten correctivos.
                  </div>
                )}
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label><Calendar size={16} /> Fecha Ejecución</Label>
                  <Input type="date" required value={formData.fecha_ejecucion} onChange={e => setFormData({ ...formData, fecha_ejecucion: e.target.value })} />
                </FormGroup>
                <FormGroup>
                  <Label>
                    <DollarSign size={16} /> Costo
                    {formData.contrato_id && formData.tipo === 'Preventivo' && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#059669', marginLeft: '0.25rem' }}>
                        (Auto: ${Number(contratoActivo?.valor_total || 0).toLocaleString()} ÷ {contratoActivo?.visitas_pactadas} visitas)
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={formData.costo}
                    readOnly={formData.tipo === 'Preventivo' && !!formData.contrato_id}
                    onChange={e => setFormData({ ...formData, costo: Number(e.target.value) })}
                    style={{
                      background: formData.tipo === 'Preventivo' && formData.contrato_id ? '#f0fdf4' : 'white',
                      cursor: formData.tipo === 'Preventivo' && formData.contrato_id ? 'not-allowed' : 'text',
                      color: formData.tipo === 'Preventivo' && formData.contrato_id ? '#059669' : 'inherit',
                      fontWeight: formData.tipo === 'Preventivo' && formData.contrato_id ? 700 : 400
                    }}
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <Label><User size={16} /> Técnico Responsable</Label>
                <Input required placeholder="Nombre del técnico o empresa" value={formData.tecnico_responsable} onChange={e => setFormData({ ...formData, tecnico_responsable: e.target.value })} />
              </FormGroup>

              <FormGroup>
                <Label><FileText size={16} /> Descripción del Trabajo</Label>
                <TextArea required placeholder="Detalle las actividades realizadas..." value={formData.descripcion_trabajo} onChange={e => setFormData({ ...formData, descripcion_trabajo: e.target.value })} />
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label><Briefcase size={16} /> Contrato Relacionado</Label>
                  <Select value={formData.contrato_id} onChange={e => handleContratoChange(e.target.value)}>
                    <option value="">Ninguno / Particular</option>
                    {contratosFiltrados.map((c: any) => {
                      const prev = mantenimientos.filter(
                        (m: any) => m.contrato_id === c.id && m.tipo === 'Preventivo'
                      ).length;
                      const completo = c.visitas_pactadas > 0 && prev >= c.visitas_pactadas;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.numero_contrato} ({prev}/{c.visitas_pactadas} prev.){completo ? ' ✓' : ''}
                        </option>
                      );
                    })}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label><ClipboardCheck size={16} /> N° de Visita {formData.tipo === 'Preventivo' ? `(Auto)` : ''}</Label>
                  <Input
                    type="number"
                    value={formData.numero_visita}
                    readOnly={formData.tipo === 'Preventivo' && !!formData.contrato_id}
                    onChange={e => setFormData({ ...formData, numero_visita: Number(e.target.value) })}
                    style={{ background: formData.tipo === 'Preventivo' && formData.contrato_id ? '#f0fdf4' : 'white' }}
                  />
                </FormGroup>
              </div>

              {!equipoId && (
                <FormGroup>
                  <Label><Settings size={16} /> Seleccionar Equipo</Label>
                  <Select required value={formData.equipo_id} onChange={e => handleEquipoChange(e.target.value)}>
                    <option value="">Seleccione un equipo...</option>
                    {equipos.map((eq: any) => (
                      <option key={eq.id} value={eq.id}>{eq.nombre} - {eq.codigo_inventario}</option>
                    ))}
                  </Select>
                </FormGroup>
              )}

              <FormGroup>
                <Label><Wrench size={16} /> Observaciones</Label>
                <Input placeholder="Notas adicionales..." value={formData.observaciones} onChange={e => setFormData({ ...formData, observaciones: e.target.value })} />
              </FormGroup>
            </Content>
            <Footer>
              <Button type="button" onClick={onClose}>Cancelar</Button>
              <Button type="submit" $variant="primary"><Save size={20} /> Guardar Registro</Button>
            </Footer>
          </form>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
}
