'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { X, Save, FileText, DollarSign, Calendar, Briefcase, Settings, ClipboardCheck, ChevronDown, ChevronUp, Upload, Check, Loader2, Eye } from 'lucide-react';

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
  max-width: 600px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #020617 0%, #1e293b 100%);
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
  &:focus { border-color: #2563eb; outline: none; }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 1rem;
  background: white;
  &:focus { border-color: #2563eb; outline: none; }
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
    background: #2563eb;
    color: white;
    border: none;
    &:hover { background: #1d4ed8; }
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
  proveedores: any[];
  equipos?: any[];
}

export default function ContratoModal({ isOpen, onClose, onSave, proveedores, equipos = [] }: Props) {
  const [formData, setFormData] = useState({
    numero_contrato: '',
    proveedor_id: '',
    descripcion: '',
    valor_total: 0,
    fecha_inicio: '',
    fecha_fin: '',
    visitas_pactadas: 0,
    equipo_ids: [] as string[],
    estado: 'Activo',
    documento_url: ''
  });

  const [showEquipos, setShowEquipos] = useState(false);
  const [uploading, setUploading] = useState(false);

  const toggleEquipo = (id: string) => {
    setFormData(prev => ({
      ...prev,
      equipo_ids: prev.equipo_ids.includes(id)
        ? prev.equipo_ids.filter(eid => eid !== id)
        : [...prev.equipo_ids, id]
    }));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `contratos/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('documentos-biomedicos')
        .upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('documentos-biomedicos')
        .getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, documento_url: publicUrl }));
    } catch (err) {
      console.error('Error uploading:', err);
    } finally {
      setUploading(false);
    }
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
              <Briefcase size={24} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Nuevo Contrato de Mantenimiento</h2>
            </div>
            <X size={24} style={{ cursor: 'pointer' }} onClick={onClose} />
          </Header>
          <form onSubmit={handleSubmit}>
            <Content>
              <FormGroup>
                <Label><FileText size={16} /> Número de Contrato</Label>
                <Input required value={formData.numero_contrato} onChange={e => setFormData({ ...formData, numero_contrato: e.target.value })} />
              </FormGroup>

              <FormGroup>
                <Label><Briefcase size={16} /> Proveedor</Label>
                <Select required value={formData.proveedor_id} onChange={e => setFormData({ ...formData, proveedor_id: e.target.value })}>
                  <option value="">Seleccione proveedor...</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label><DollarSign size={16} /> Valor Total</Label>
                <Input type="number" required value={formData.valor_total} onChange={e => setFormData({ ...formData, valor_total: Number(e.target.value) })} />
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label><Calendar size={16} /> Fecha Inicio</Label>
                  <Input type="date" required value={formData.fecha_inicio} onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })} />
                </FormGroup>
                <FormGroup>
                  <Label><Calendar size={16} /> Fecha Fin</Label>
                  <Input type="date" required value={formData.fecha_fin} onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })} />
                </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label><ClipboardCheck size={16} /> Visitas Pactadas</Label>
                  <Input type="number" required value={formData.visitas_pactadas} onChange={e => setFormData({ ...formData, visitas_pactadas: Number(e.target.value) })} />
                </FormGroup>
                <div />
              </div>

              <FormGroup>
                <Label
                  onClick={() => setShowEquipos(!showEquipos)}
                  style={{ cursor: 'pointer', justifyContent: 'space-between', width: '100%', background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={16} />
                    {formData.equipo_ids.length === 0
                      ? 'Cubrir todos los equipos o general'
                      : `${formData.equipo_ids.length} equipos seleccionados`}
                  </div>
                  {showEquipos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Label>

                {showEquipos && (
                  <div style={{
                    marginTop: '0.5rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {equipos.map(eq => (
                      <label key={eq.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.equipo_ids.includes(eq.id)}
                          onChange={() => toggleEquipo(eq.id)}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>{eq.nombre} <small style={{ color: '#64748b' }}>({eq.codigo_inventario})</small></span>
                      </label>
                    ))}
                  </div>
                )}
              </FormGroup>
              {/* PDF del Contrato */}
              <FormGroup>
                <Label><FileText size={16} /> Documento del Contrato (PDF)</Label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }}
                    />
                    <div style={{
                      padding: '0.75rem 1rem',
                      border: '2px dashed #e2e8f0',
                      borderRadius: '12px',
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      {uploading ? (
                        <><Loader2 size={18} className="animate-spin" /> Subiendo...</>
                      ) : formData.documento_url ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}><Check size={18} /> PDF Cargado</span>
                      ) : (
                        <><Upload size={18} /> Seleccionar PDF</>
                      )}
                    </div>
                  </div>
                  {formData.documento_url && (
                    <a
                      href={formData.documento_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: '0.75rem', background: '#eff6ff', color: '#2563eb', borderRadius: '12px', display: 'flex', alignItems: 'center' }}
                      title="Ver contrato"
                    >
                      <Eye size={20} />
                    </a>
                  )}
                </div>
              </FormGroup>
            </Content>
            <Footer>
              <Button type="button" onClick={onClose}>Cancelar</Button>
              <Button type="submit" $variant="primary"><Save size={20} /> Guardar Contrato</Button>
            </Footer>
          </form>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
}
