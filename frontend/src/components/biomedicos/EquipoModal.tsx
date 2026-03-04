'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Save, HeartPulse, HardDrive, Tag, MapPin,
    Activity, Calendar, Settings, Info, FileText
} from 'lucide-react';

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
  max-width: 800px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const Header = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Content = styled.div`
  padding: 2rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
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
  transition: all 0.2s;
  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
    outline: none;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 1rem;
  background: white;
  &:focus {
    border-color: #2563eb;
    outline: none;
  }
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
  transition: all 0.2s;
  
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
    initialData?: any;
    warehouses: any[];
}

export default function EquipoModal({ isOpen, onClose, onSave, initialData, warehouses }: Props) {
    const [formData, setFormData] = useState(initialData || {
        nombre: '',
        codigo_inventario: '',
        marca: '',
        modelo: '',
        serie: '',
        clase_riesgo: '',
        ubicacion_id: '',
        sede: '',
        estado: 'Funcional',

        // Tubo RX
        tubo_marca: '',
        tubo_modelo: '',
        tubo_serie: '',
        tubo_anio_fab: '',

        // Requerimientos Técnicos
        voltaje_max: '',
        voltaje_min: '',
        corriente_max: '',
        corriente_min: '',
        potencia_consumida: '',
        frecuencia: '',
        peso_equipo: '',
        humedad_rango: '',
        presion_rango: '',
        temperatura_rango: '',
        registro_importacion: '',

        // Flags (JSONB)
        clasificacion_biomedica: {},
        clase_tecnologia: {},
        fuente_alimentacion: {},
        manuales_disponibles: {},

        // Mantenimiento
        periodo_mantenimiento: '',
        mantenimientos_por_anio: 2,
        protocolo_mantenimiento: '',
        recomendaciones_uso: '',
        accesorios_consumibles: ''
    });

    const [activeTab, setActiveTab] = useState('basico');

    const updateFlag = (category: string, key: string, value: boolean) => {
        setFormData((prev: any) => ({
            ...prev,
            [category]: { ...prev[category], [key]: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <ModalContainer
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <Header>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <HeartPulse size={32} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                                {initialData ? 'Editar Equipo' : 'Nuevo Equipo Biomédico'}
                            </h2>
                        </div>
                        <X size={24} style={{ cursor: 'pointer' }} onClick={onClose} />
                    </Header>

                    <div style={{ display: 'flex', background: '#f8fafc', padding: '0.5rem 2rem', gap: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                        {[
                            { id: 'basico', label: 'Datos Básicos' },
                            { id: 'tecnico', label: 'Espec. Técnicas' },
                            { id: 'clasificacion', label: 'Clasificación' },
                            { id: 'mantenimiento', label: 'Mantenimiento' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '0.75rem 0',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
                                    color: activeTab === tab.id ? '#2563eb' : '#64748b',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit}>
                        <Content>
                            {activeTab === 'basico' && (
                                <>
                                    <FormGroup>
                                        <Label><Tag size={16} /> Nombre del Equipo</Label>
                                        <Input required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><Info size={16} /> Código Inventario</Label>
                                        <Input value={formData.codigo_inventario} onChange={e => setFormData({ ...formData, codigo_inventario: e.target.value })} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><HardDrive size={16} /> Marca / Modelo</Label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Input style={{ flex: 1 }} placeholder="Marca" value={formData.marca} onChange={e => setFormData({ ...formData, marca: e.target.value })} />
                                            <Input style={{ flex: 1 }} placeholder="Modelo" value={formData.modelo} onChange={e => setFormData({ ...formData, modelo: e.target.value })} />
                                        </div>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><Info size={16} /> Serie / Riesgo</Label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Input style={{ flex: 1 }} placeholder="Serie" value={formData.serie} onChange={e => setFormData({ ...formData, serie: e.target.value })} />
                                            <Select style={{ flex: 1 }} value={formData.clase_riesgo} onChange={e => setFormData({ ...formData, clase_riesgo: e.target.value })}>
                                                <option value="">Riesgo...</option>
                                                <option value="I">clase I (Bajo)</option>
                                                <option value="IIA">clase IIA (Moderado)</option>
                                                <option value="IIB">clase IIB (Alto)</option>
                                                <option value="III">clase III (Muy Alto)</option>
                                            </Select>
                                        </div>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><MapPin size={16} /> Ubicación</Label>
                                        <Select value={formData.ubicacion_id} onChange={e => setFormData({ ...formData, ubicacion_id: e.target.value })}>
                                            <option value="">Seleccione ubicación...</option>
                                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.nombre}</option>)}
                                        </Select>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><MapPin size={16} /> Sede</Label>
                                        <Select value={formData.sede} onChange={e => setFormData({ ...formData, sede: e.target.value })}>
                                            <option value="">Seleccione sede...</option>
                                            <option value="Sede 1">Sede 1</option>
                                            <option value="Sede 2">Sede 2</option>
                                            <option value="Sede 3">Sede 3</option>
                                            <option value="Sede Armenia">Sede Armenia</option>
                                            <option value="Quimbaya">Quimbaya</option>
                                        </Select>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label><Calendar size={16} /> Fecha Adquisición / Ingreso</Label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Input type="date" style={{ flex: 1 }} value={formData.fecha_adquisicion} onChange={e => setFormData({ ...formData, fecha_adquisicion: e.target.value })} />
                                            <Input type="date" style={{ flex: 1 }} value={formData.fecha_ingreso} onChange={e => setFormData({ ...formData, fecha_ingreso: e.target.value })} />
                                        </div>
                                    </FormGroup>
                                </>
                            )}

                            {activeTab === 'tecnico' && (
                                <>
                                    <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>REQUERIMIENTOS ELÉCTRICOS</div>
                                    <FormGroup>
                                        <Label>Voltaje (Min - Max)</Label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Input style={{ flex: 1 }} placeholder="Min (V)" value={formData.voltaje_min} onChange={e => setFormData({ ...formData, voltaje_min: e.target.value })} />
                                            <Input style={{ flex: 1 }} placeholder="Max (V)" value={formData.voltaje_max} onChange={e => setFormData({ ...formData, voltaje_max: e.target.value })} />
                                        </div>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Corriente (Min - Max)</Label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Input style={{ flex: 1 }} placeholder="Min (A)" value={formData.corriente_min} onChange={e => setFormData({ ...formData, corriente_min: e.target.value })} />
                                            <Input style={{ flex: 1 }} placeholder="Max (A)" value={formData.corriente_max} onChange={e => setFormData({ ...formData, corriente_max: e.target.value })} />
                                        </div>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Potencia / Frecuencia</Label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Input style={{ flex: 1 }} placeholder="Potencia (W)" value={formData.potencia_consumida} onChange={e => setFormData({ ...formData, potencia_consumida: e.target.value })} />
                                            <Input style={{ flex: 1 }} placeholder="Frecuencia (Hz)" value={formData.frecuencia} onChange={e => setFormData({ ...formData, frecuencia: e.target.value })} />
                                        </div>
                                    </FormGroup>

                                    <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>AMBIENTALES Y OTROS</div>
                                    <FormGroup>
                                        <Label>Humedad % / Presión</Label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Input style={{ flex: 1 }} placeholder="Humedad" value={formData.humedad_rango} onChange={e => setFormData({ ...formData, humedad_rango: e.target.value })} />
                                            <Input style={{ flex: 1 }} placeholder="Presión" value={formData.presion_rango} onChange={e => setFormData({ ...formData, presion_rango: e.target.value })} />
                                        </div>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Temperatura Rango</Label>
                                        <Input placeholder="Ej: 15-30 °C" value={formData.temperatura_rango} onChange={e => setFormData({ ...formData, temperatura_rango: e.target.value })} />
                                    </FormGroup>

                                    <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>INFORMACIÓN TUBO RX</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <Input placeholder="Marca Tubo" value={formData.tubo_marca} onChange={e => setFormData({ ...formData, tubo_marca: e.target.value })} />
                                            <Input placeholder="Modelo Tubo" value={formData.tubo_modelo} onChange={e => setFormData({ ...formData, tubo_modelo: e.target.value })} />
                                            <Input placeholder="Serie Tubo" value={formData.tubo_serie} onChange={e => setFormData({ ...formData, tubo_serie: e.target.value })} />
                                            <Input type="number" placeholder="Año Fab." value={formData.tubo_anio_fab} onChange={e => setFormData({ ...formData, tubo_anio_fab: e.target.value })} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'clasificacion' && (
                                <>
                                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                                        <Label>CLASIFICACIÓN BIOMÉDICA</Label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                            {['Fijo', 'Transporte', 'Invasivo', 'Diagnóstico', 'Apoyo', 'Tratamiento', 'Rehabilitación', 'Prevención', 'Lab'].map(tag => (
                                                <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                    <input type="checkbox" checked={!!formData.clasificacion_biomedica?.[tag.toLowerCase()]} onChange={e => updateFlag('clasificacion_biomedica', tag.toLowerCase(), e.target.checked)} /> {tag}
                                                </label>
                                            ))}
                                        </div>
                                    </FormGroup>
                                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                                        <Label>CLASE DE TECNOLOGÍA</Label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                            {['Electrónico', 'Eléctrico', 'Mecánico', 'Hidráulico', 'Neumático', 'Nanotecnología', 'Ultrasonido', 'Óptico'].map(f => (
                                                <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                    <input type="checkbox" checked={!!formData.clase_tecnologia?.[f.toLowerCase()]} onChange={e => updateFlag('clase_tecnologia', f.toLowerCase(), e.target.checked)} /> {f}
                                                </label>
                                            ))}
                                        </div>
                                    </FormGroup>
                                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                                        <Label>FUENTE DE ALIMENTACIÓN</Label>
                                        <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', flexWrap: 'wrap' }}>
                                            {['Electricidad', 'Agua', 'Aire', 'Hidráulico', 'Batería', 'Gas', 'Vapor', 'Solar'].map(f => (
                                                <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                    <input type="checkbox" checked={!!formData.fuente_alimentacion?.[f.toLowerCase()]} onChange={e => updateFlag('fuente_alimentacion', f.toLowerCase(), e.target.checked)} /> {f}
                                                </label>
                                            ))}
                                        </div>
                                    </FormGroup>
                                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                                        <Label>MANUALES DISPONIBLES</Label>
                                        <div style={{ display: 'flex', gap: '2rem' }}>
                                            {['Usuario', 'Servicio', 'Instalación'].map(m => (
                                                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                                                    <input type="checkbox" checked={!!formData.manuales_disponibles?.[m.toLowerCase()]} onChange={e => updateFlag('manuales_disponibles', m.toLowerCase(), e.target.checked)} /> {m}
                                                </label>
                                            ))}
                                        </div>
                                    </FormGroup>
                                </>
                            )}

                            {activeTab === 'mantenimiento' && (
                                <>
                                    <FormGroup>
                                        <Label>Periodicidad de Mantenimiento</Label>
                                        <Select value={formData.periodo_mantenimiento} onChange={e => setFormData({ ...formData, periodo_mantenimiento: e.target.value })}>
                                            <option value="">Seleccione...</option>
                                            <option value="Mensual">Mensual</option>
                                            <option value="Trimestral">Trimestral</option>
                                            <option value="Cuatrimestral">Cuatrimestral</option>
                                            <option value="Semestral">Semestral</option>
                                            <option value="Anual">Anual</option>
                                        </Select>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Mantenimientos por Año</Label>
                                        <Input type="number" value={formData.mantenimientos_por_anio} onChange={e => setFormData({ ...formData, mantenimientos_por_anio: Number(e.target.value) })} />
                                    </FormGroup>
                                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                                        <Label>Protocolo de Mantenimiento</Label>
                                        <textarea
                                            style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontFamily: 'inherit' }}
                                            placeholder="Describa el protocolo estándar para este equipo..."
                                            value={formData.protocolo_mantenimiento}
                                            onChange={e => setFormData({ ...formData, protocolo_mantenimiento: e.target.value })}
                                        />
                                    </FormGroup>
                                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                                        <Label>Recomendaciones de Uso</Label>
                                        <textarea
                                            style={{ width: '100%', minHeight: '60px', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontFamily: 'inherit' }}
                                            placeholder="Recomendaciones para el personal asistencial..."
                                            value={formData.recomendaciones_uso}
                                            onChange={e => setFormData({ ...formData, recomendaciones_uso: e.target.value })}
                                        />
                                    </FormGroup>
                                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                                        <Label>Accesorios y Consumibles</Label>
                                        <textarea
                                            style={{ width: '100%', minHeight: '60px', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontFamily: 'inherit' }}
                                            placeholder="Liste los accesorios y consumibles asociados..."
                                            value={formData.accesorios_consumibles}
                                            onChange={e => setFormData({ ...formData, accesorios_consumibles: e.target.value })}
                                        />
                                    </FormGroup>
                                </>
                            )}
                        </Content>

                        <Footer>
                            <Button type="button" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" $variant="primary">
                                <Save size={20} />
                                Guardar Equipo
                            </Button>
                        </Footer>
                    </form>
                </ModalContainer>
            </Overlay >
        </AnimatePresence >
    );
}
