'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
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
  width: 95%;
  max-width: 750px; /* Incrementado para evitar scroll vertical */
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  position: relative;

  /* Estilo para scrollbar más fino */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--gray-200);
    border-radius: 10px;
  }
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

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 1rem;
  align-items: end;
  background: var(--gray-50);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.5rem;
`;

const AddItemButton = styled.button`
  background: none;
  border: 1px dashed var(--gray-200);
  padding: 0.75rem;
  border-radius: 12px;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  &:hover {
    background: var(--gray-50);
    border-color: var(--primary);
  }
`;

const StockWarning = styled.div`
  background: #fff3e0;
  border-left: 4px solid #ef6c00;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #e65100;
  font-size: 0.85rem;
  font-weight: 500;
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

interface RequestStationeryItem {
  nombre: string;
  stock: number;
}

interface UserProfile {
  nombre: string;
  dependencia: string;
  cargo: string;
}

interface RequestStationeryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  availableItems: RequestStationeryItem[];
  userProfile: UserProfile;
}

export default function RequestStationeryModal({
  isOpen,
  onClose,
  onSave,
  availableItems,
  userProfile
}: RequestStationeryModalProps) {
  const [items, setItems] = useState([{ nombre: '', cantidad: 1 }]);
  const [justification, setJustification] = useState('');
  const [priority, setPriority] = useState('Normal');

  const addItem = () => setItems([...items, { nombre: '', cantidad: 1 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ items, justification, priority });
    onClose();
    // Reset form
    setItems([{ nombre: '', cantidad: 1 }]);
    setJustification('');
    setPriority('Normal');
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
        <ModalContent
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={onClose}><X size={24} /></CloseButton>
          <h2 style={{ marginBottom: '1.5rem' }}>Nueva Solicitud de Papelería</h2>

          <Form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--gray-50)', padding: '1.25rem', borderRadius: '12px' }}>
              <FormGroup style={{ gridColumn: 'span 2' }}>
                <Label>Nombre Completo del Solicitante</Label>
                <Input value={userProfile.nombre} readOnly style={{ background: 'white' }} />
              </FormGroup>
              <FormGroup>
                <Label>Dependencia</Label>
                <Input value={userProfile.dependencia} readOnly style={{ background: 'white' }} />
              </FormGroup>
              <FormGroup>
                <Label>Cargo / Puesto</Label>
                <Input value={userProfile.cargo} readOnly style={{ background: 'white' }} />
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Artículos Solicitados</Label>
              {items.map((item, index) => (
                <ItemRow key={index}>
                  <FormGroup>
                    <Label style={{ fontSize: '0.75rem' }}>Artículo</Label>
                    <Select
                      value={item.nombre}
                      onChange={(e) => updateItem(index, 'nombre', e.target.value)}
                      required
                    >
                      <option value="">Seleccione...</option>
                      {availableItems.map(i => (
                        <option key={i.nombre} value={i.nombre}>
                          {i.nombre} (Stock: {i.stock})
                        </option>
                      ))}
                    </Select>
                    {item.nombre && (() => {
                      const selected = availableItems.find(i => i.nombre === item.nombre);
                      if (selected && selected.stock <= 0) {
                        return (
                          <StockWarning>
                            <AlertCircle size={16} />
                            Este producto no tiene existencias. Se notificará al administrador.
                          </StockWarning>
                        );
                      }
                      return null;
                    })()}
                  </FormGroup>
                  <FormGroup>
                    <Label style={{ fontSize: '0.75rem' }}>Cant.</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => updateItem(index, 'cantidad', parseInt(e.target.value))}
                      required
                    />
                  </FormGroup>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    style={{ background: 'none', border: 'none', color: '#ea4335', cursor: 'pointer', padding: '0.5rem' }}
                    disabled={items.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </ItemRow>
              ))}
              <AddItemButton type="button" onClick={addItem}>
                <Plus size={18} />
                Añadir otro artículo
              </AddItemButton>
            </FormGroup>

            <FormGroup>
              <Label>Prioridad</Label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Baja">Baja</option>
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Justificación / Motivo</Label>
              <Input
                as="textarea"
                placeholder="Explique brevemente por qué necesita estos artículos..."
                value={justification}
                onChange={(e: any) => setJustification(e.target.value)}
                required
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </FormGroup>

            <SaveButton type="submit">
              <Save size={20} />
              Enviar Solicitud
            </SaveButton>
          </Form>
        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
}
