'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  &:hover {
    background: var(--gray-100);
  }
`;

const Form = styled.form`
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
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--secondary);
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--gray-100);
  outline: none;
  font-size: 1rem;
  &:focus {
    border-color: var(--primary);
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--gray-100);
  outline: none;
  font-size: 1rem;
  &:focus {
    border-color: var(--primary);
  }
`;

const SaveButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    onSave: (data: any) => void;
}

export default function ItemModal({ isOpen, onClose, initialData, onSave }: ItemModalProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: 'General',
        bodega_id: ''
    });
    const [warehouses, setWarehouses] = useState<any[]>([]);

    // Fetch warehouses
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${API_URL}/bodegas`);
                const data = await res.json();
                setWarehouses(data);

                // Set default warehouse if available
                if (data.length > 0 && !formData.bodega_id) {
                    setFormData(prev => ({ ...prev, bodega_id: data[0].id }));
                }
            } catch (error) {
                console.error('Error fetching warehouses:', error);
            }
        };

        if (isOpen) {
            fetchWarehouses();
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                descripcion: initialData.descripcion || '',
                categoria: initialData.categoria || 'General',
                bodega_id: initialData.bodega_id || (warehouses[0]?.id || '')
            });
        } else {
            setFormData({
                nombre: '',
                descripcion: '',
                categoria: 'General',
                bodega_id: warehouses[0]?.id || ''
            });
        }
    }, [initialData, isOpen, warehouses]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Formulario enviado:', formData);
        onSave(formData);
    };

    return (
        <AnimatePresence>
            <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <ModalContent
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <CloseButton onClick={onClose}><X size={24} /></CloseButton>
                    <h2 style={{ marginBottom: '2rem' }}>{initialData ? 'Editar Producto' : 'Nuevo Producto'}</h2>

                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label>Nombre del Producto *</Label>
                            <Input
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej. Laptop Dell XPS 15"
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Descripción</Label>
                            <Input
                                as="textarea"
                                value={formData.descripcion ?? ''}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                placeholder="Descripción detallada del producto..."
                                style={{ minHeight: '80px', resize: 'vertical' }}
                            />
                        </FormGroup>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <FormGroup>
                                <Label>Categoría *</Label>
                                <Select
                                    value={formData.categoria}
                                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                                    required
                                >
                                    <option value="General">General</option>
                                    <option value="Electrónica">Electrónica</option>
                                    <option value="Muebles">Muebles</option>
                                    <option value="Papelería">Papelería</option>
                                    <option value="Limpieza">Limpieza</option>
                                    <option value="Herramientas">Herramientas</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>Bodega Asignada *</Label>
                                <Select
                                    value={formData.bodega_id}
                                    onChange={e => setFormData({ ...formData, bodega_id: e.target.value })}
                                    required
                                >
                                    {warehouses.length === 0 && <option value="">Cargando bodegas...</option>}
                                    {warehouses.map((bodega) => (
                                        <option key={bodega.id} value={bodega.id}>
                                            {bodega.nombre}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup>
                        </div>

                        <SaveButton type="submit">
                            <Save size={20} />
                            {initialData ? 'Guardar Cambios' : 'Registrar Producto'}
                        </SaveButton>
                    </Form>
                </ModalContent>
            </Overlay>
        </AnimatePresence>
    );
}
