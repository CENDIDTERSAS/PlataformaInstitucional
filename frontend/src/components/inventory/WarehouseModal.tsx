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
  max-width: 500px;
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

const Divider = styled.div`
  height: 1px;
  background: var(--gray-100);
  margin: 1rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.5rem;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  background: var(--gray-50);
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--gray-100);
`;

const UserItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: white;
  }

  input {
    width: 18px;
    height: 18px;
  }
`;

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSave: (data: any, assignedUsers: string[]) => void;
  users: any[];
}

export default function WarehouseModal({ isOpen, onClose, initialData, onSave, users }: WarehouseModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    estado: 'Activa',
    creado: 'Admin'
  });

  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        ubicacion: initialData.ubicacion || '',
        estado: initialData.estado || 'Activa',
        creado: initialData.creado || ''
      });
      // Cargar asignaciones actuales
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/bodegas/${initialData.id}/assignments`)
        .then(res => res.json())
        .then(data => setAssignedUsers(data));
    } else if (isOpen) {
      setFormData({
        nombre: '',
        ubicacion: '',
        estado: 'Activa',
        creado: 'Admin'
      });
      setAssignedUsers([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, assignedUsers);
    onClose();
  };

  const handleToggleUser = (userId: string) => {
    setAssignedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
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
          <h2 style={{ marginBottom: '2rem' }}>{initialData ? 'Editar Bodega' : 'Nueva Bodega'}</h2>

          <Form onSubmit={handleSubmit}>
            {initialData?.codigo && (
              <FormGroup>
                <Label>Código de Bodega (Auto-generado)</Label>
                <Input
                  value={initialData.codigo}
                  disabled
                  style={{ backgroundColor: 'var(--gray-50)', fontWeight: 600, color: 'var(--primary)' }}
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label>Nombre de la Bodega</Label>
              <Input
                value={formData.nombre || ''}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Bodega Central, Pasillo A"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Ubicación / Referencia</Label>
              <Input
                value={formData.ubicacion || ''}
                onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                placeholder="Ej. Planta Sur, Secc. 4"
              />
            </FormGroup>

            <FormGroup>
              <Label>Creado Por (Responsable)</Label>
              <Input
                value={formData.creado || ''}
                onChange={e => setFormData({ ...formData, creado: e.target.value })}
                placeholder="Nombre del responsable"
              />
            </FormGroup>

            <FormGroup>
              <Label>Estado</Label>
              <Select
                value={formData.estado || 'Activa'}
                onChange={e => setFormData({ ...formData, estado: e.target.value })}
              >
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </Select>
            </FormGroup>

            <Divider />
            <SectionTitle>Accesos / Administradores de Bodega</SectionTitle>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
              Selecciona los usuarios que podrán ver y gestionar esta bodega.
            </p>
            <UserList>
              {users.map(u => (
                <UserItem key={u.id}>
                  <input
                    type="checkbox"
                    checked={assignedUsers.includes(u.id)}
                    onChange={() => handleToggleUser(u.id)}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{u.nombres} {u.apellidos}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{u.dependencia} - {u.rol}</span>
                  </div>
                </UserItem>
              ))}
            </UserList>

            <SaveButton type="submit">
              <Save size={20} />
              {initialData ? 'Actualizar Bodega' : 'Crear Bodega'}
            </SaveButton>
          </Form>
        </ModalContent>
      </Overlay >
    </AnimatePresence >
  );
}
