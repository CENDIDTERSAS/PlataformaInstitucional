'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Save, Image as ImageIcon, Calendar, Percent } from 'lucide-react';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 { font-size: 1.25rem; font-weight: 700; color: var(--text); }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--gray-100);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f9fafb;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--secondary);
    margin-bottom: 0.5rem;
  }
  
  input, textarea, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--gray-100);
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(18, 161, 82, 0.1);
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--secondary);
  &:hover { color: var(--text); }
`;

const PrimaryButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const SecondaryButton = styled.button`
  background: white;
  color: var(--text);
  border: 1px solid var(--gray-100);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover { background: #f9fafb; }
`;

export default function CourseModal({ isOpen, onClose, onSave, profileId, initialData }: any) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        area_responsable: '',
        duracion_estimada: '',
        imagen_url: '',
        fecha_inicio: '',
        fecha_fin: '',
        puntaje_minimo_aprobacion: 60,
        docente_id: profileId,
        estado: 'Publicado'
    });

    // Sincronizar initialData o profileId si cambian
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                descripcion: initialData.descripcion || '',
                categoria: initialData.categoria || '',
                area_responsable: initialData.area_responsable || '',
                duracion_estimada: initialData.duracion_estimada || '',
                imagen_url: initialData.imagen_url || '',
                fecha_inicio: initialData.fecha_inicio ? initialData.fecha_inicio.split('T')[0] : '',
                fecha_fin: initialData.fecha_fin ? initialData.fecha_fin.split('T')[0] : '',
                puntaje_minimo_aprobacion: initialData.puntaje_minimo_aprobacion ?? 60,
                docente_id: initialData.docente_id || profileId,
                estado: initialData.estado || 'Publicado'
            });
        } else if (profileId) {
            setFormData(prev => ({ ...prev, docente_id: profileId }));
        }
    }, [profileId, initialData, isOpen]);


    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2><Save size={20} style={{ color: 'var(--primary)' }} /> Crear Nuevo Curso</h2>
                    <IconButton onClick={onClose}><X size={20} /></IconButton>
                </ModalHeader>

                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <FormGroup>
                            <label>Nombre del Curso</label>
                            <input
                                required
                                placeholder="Ej. Inducción de Seguridad y Salud"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </FormGroup>

                        <FormGroup>
                            <label>Estado de la Capacitación (Visibilidad)</label>
                            <select
                                value={formData.estado}
                                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                style={{
                                    fontWeight: 600,
                                    border: `1px solid ${formData.estado === 'Publicado' ? '#1e8e3e' : '#d93025'}`,
                                    background: formData.estado === 'Publicado' ? '#e6f4ea' : '#fce8e6',
                                    color: formData.estado === 'Publicado' ? '#1e8e3e' : '#d93025'
                                }}
                            >
                                <option value="Publicado">Publicado (Visible y Activo)</option>
                                <option value="Borrador">Borrador (Solo tú puedes verlo)</option>
                                <option value="Cerrado">Cerrado (Finalizado pero inactivo)</option>
                            </select>
                        </FormGroup>

                        <FormGroup>
                            <label>Descripción</label>
                            <textarea
                                rows={3}
                                placeholder="Describe brevemente de qué trata el curso..."
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </FormGroup>

                        <Grid>
                            <FormGroup>
                                <label>Categoría</label>
                                <select
                                    value={formData.categoria}
                                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Seguridad">Seguridad</option>
                                    <option value="TI">Tecnología</option>
                                    <option value="Administración">Administración</option>
                                    <option value="Salud">Salud</option>
                                </select>
                            </FormGroup>
                            <FormGroup>
                                <label><Percent size={14} /> Min. Aprobación (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.puntaje_minimo_aprobacion}
                                    onChange={e => setFormData({ ...formData, puntaje_minimo_aprobacion: parseInt(e.target.value) })}
                                />
                            </FormGroup>
                        </Grid>

                        <Grid>
                            <FormGroup>
                                <label>Área Responsable</label>
                                <input
                                    placeholder="Ej. Recursos Humanos, SST..."
                                    value={formData.area_responsable}
                                    onChange={e => setFormData({ ...formData, area_responsable: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <label>Duración Estimada</label>
                                <input
                                    placeholder="Ej. 2 Horas, 45 Minutos..."
                                    value={formData.duracion_estimada}
                                    onChange={e => setFormData({ ...formData, duracion_estimada: e.target.value })}
                                />
                            </FormGroup>
                        </Grid>

                        <FormGroup>
                            <label><ImageIcon size={14} /> URL de Imagen de Portada</label>
                            <input
                                placeholder="https://images.unsplash.com/..."
                                value={formData.imagen_url}
                                onChange={e => setFormData({ ...formData, imagen_url: e.target.value })}
                            />
                        </FormGroup>

                        <Grid>
                            <FormGroup>
                                <label><Calendar size={14} /> Fecha de Inicio</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.fecha_inicio}
                                    onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <label><Calendar size={14} /> Fecha de Fin</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.fecha_fin}
                                    onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
                                />
                            </FormGroup>
                        </Grid>
                    </ModalBody>

                    <ModalFooter>
                        <SecondaryButton type="button" onClick={onClose}>Cancelar</SecondaryButton>
                        <PrimaryButton type="submit">Guardar Curso</PrimaryButton>
                    </ModalFooter>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
}
