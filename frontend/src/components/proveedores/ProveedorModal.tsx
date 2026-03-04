'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building2, Hash, Phone, Mail, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContainer = styled(motion.div)`
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  padding: 1.5rem 2rem;
  background: var(--gray-50);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--gray-100);
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1f36;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  &:hover { background: var(--gray-100); }
`;

const Form = styled.form`
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
  font-size: 0.9rem;
  font-weight: 600;
  color: #4f566b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.8rem 1rem;
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.$primary ? `
    background: var(--primary);
    color: white;
    border: none;
    &:hover { transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  ` : `
    background: white;
    color: var(--secondary);
    border: 1px solid var(--gray-200);
    &:hover { background: var(--gray-50); }
  `}
`;

interface ProveedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  proveedor?: any;
}

export default function ProveedorModal({ isOpen, onClose, onSave, proveedor }: ProveedorModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (proveedor) {
      reset(proveedor);
    } else {
      reset({
        nombre: '',
        nit: '',
        direccion: '',
        telefono: '',
        email: ''
      });
    }
  }, [proveedor, reset]);

  const onSubmit = (data: any) => {
    onSave(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContainer
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>
                <Building2 size={24} color="var(--primary)" />
                {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </ModalTitle>
              <CloseButton onClick={onClose}><X size={20} /></CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label><Building2 size={16} /> Nombre del Proveedor</Label>
                <Input {...register('nombre', { required: true })} placeholder="Ej: Papelería La Única" />
              </FormGroup>

              <FormGroup>
                <Label><Hash size={16} /> NIT / Identificación</Label>
                <Input {...register('nit')} placeholder="900..." />
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label><Phone size={16} /> Teléfono</Label>
                  <Input {...register('telefono')} placeholder="320..." />
                </FormGroup>
                <FormGroup>
                  <Label><Mail size={16} /> Email</Label>
                  <Input {...register('email')} placeholder="contacto@..." />
                </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label><MapPin size={16} /> Departamento</Label>
                  <Input {...register('departamento')} placeholder="Ej: Putumayo" />
                </FormGroup>
                <FormGroup>
                  <Label><Building2 size={16} /> Ciudad</Label>
                  <Input {...register('ciudad')} placeholder="Ej: Mocoa" />
                </FormGroup>
              </div>

              <FormGroup>
                <Label><MapPin size={16} /> Dirección</Label>
                <Input {...register('direccion')} placeholder="Calle 14 #..." />
              </FormGroup>

              <ButtonGroup>
                <Button type="button" onClick={onClose}>Cancelar</Button>
                <Button type="submit" $primary>
                  <Save size={18} />
                  {proveedor ? 'Actualizar' : 'Crear'} Proveedor
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
