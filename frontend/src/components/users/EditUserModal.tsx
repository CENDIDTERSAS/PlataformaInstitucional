'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Save, Eye, EyeOff } from 'lucide-react';
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
  max-height: 90vh;
  overflow-y: auto;
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

const PasswordWrapper = styled.div`
  position: relative;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  padding: 0.25rem;
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const PermissionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--gray-50);
  padding: 1.25rem;
  border-radius: 15px;
  border: 1px solid var(--gray-100);
`;

const ModuleRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ModuleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--secondary);
  border-bottom: 1px solid var(--gray-200);
  padding-bottom: 0.25rem;
`;

const ActionList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.5rem;
  padding: 0.25rem 0;
`;

const ActionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #4f566b;
  cursor: pointer;
  
  input {
    width: 14px;
    height: 14px;
  }
`;

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    user: any;
    isAdmin?: boolean;
}

export default function EditUserModal({
    isOpen,
    onClose,
    onSave,
    user,
    isAdmin = false
}: EditUserModalProps) {
    const [formData, setFormData] = useState({
        nombres: user?.nombres || '',
        apellidos: user?.apellidos || '',
        email: user?.email || '',
        identificacion: user?.identificacion || '',
        contacto: user?.contacto || '',
        dependencia: user?.dependencia || '',
        cargo: user?.cargo || '',
        rol: user?.rol || 'Colaborador',
        estado: user?.estado || 'Activo'
    });

    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [changePassword, setChangePassword] = useState(false);

    // Gestión de permisos de módulos
    const [permissions, setPermissions] = useState<{ modulo: string, accion: string }[]>([]);

    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                nombres: user?.nombres || '',
                apellidos: user?.apellidos || '',
                email: user?.email || '',
                identificacion: user?.identificacion || '',
                contacto: user?.contacto || '',
                dependencia: user?.dependencia || '',
                cargo: user?.cargo || '',
                rol: user?.rol || 'Colaborador',
                estado: user?.estado || 'Activo'
            });
            setNewPassword('');
            setChangePassword(false);
            if (!user) setPermissions([]);
        }
    }, [user, isOpen]);

    React.useEffect(() => {
        if (isOpen && isAdmin && user?.id) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/permissions`)
                .then(res => res.json())
                .then(data => setPermissions(data));
        }
    }, [isOpen, isAdmin, user?.id]);

    const handleTogglePermission = (modulo: string, accion: string) => {
        setPermissions(prev => {
            const exists = prev.some(p => p.modulo === modulo && p.accion === accion);
            if (exists) {
                return prev.filter(p => !(p.modulo === modulo && p.accion === accion));
            } else {
                return [...prev, { modulo, accion }];
            }
        });
    };

    const isPermitted = (modulo: string, accion: string) =>
        permissions.some(p => p.modulo === modulo && p.accion === accion);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Si es admin, guardar también los permisos
        if (isAdmin && user?.id) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/permissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permisos: permissions })
            });
        }

        onSave({
            ...formData,
            ...(changePassword && newPassword ? { password: newPassword } : {})
        });
        onClose();
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
                    <h2 style={{ marginBottom: '1.5rem' }}>
                        {user ? (isAdmin ? 'Editar Usuario' : 'Mi Perfil') : 'Nuevo Usuario'}
                    </h2>

                    <Form onSubmit={handleSubmit}>
                        <SectionTitle>Información Personal</SectionTitle>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <FormGroup>
                                <Label>Nombres</Label>
                                <Input
                                    value={formData.nombres || ''}
                                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Apellidos</Label>
                                <Input
                                    value={formData.apellidos || ''}
                                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                    required
                                />
                            </FormGroup>
                        </div>

                        {!user && (
                            <FormGroup>
                                <Label>Correo Electrónico *</Label>
                                <Input
                                    type="email"
                                    value={(formData as any).email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value } as any)}
                                    placeholder="correo@institución.com"
                                    required
                                />
                            </FormGroup>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <FormGroup>
                                <Label>Identificación</Label>
                                <Input
                                    value={formData.identificacion || ''}
                                    onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                                    placeholder="Numero de identificación"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Contacto</Label>
                                <Input
                                    value={formData.contacto || ''}
                                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                                    placeholder="Teléfono o Email"
                                />
                            </FormGroup>
                        </div>

                        <FormGroup>
                            <Label>Dependencia</Label>
                            <Input
                                value={formData.dependencia || ''}
                                onChange={(e) => setFormData({ ...formData, dependencia: e.target.value })}
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Cargo / Puesto</Label>
                            <Input
                                value={formData.cargo || ''}
                                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                                required
                            />
                        </FormGroup>

                        {isAdmin && (
                            <>
                                <FormGroup>
                                    <Label>Rol</Label>
                                    <Select
                                        value={formData.rol}
                                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                    >
                                        <option value="Colaborador">Colaborador</option>
                                        <option value="Supervisor">Supervisor</option>
                                        <option value="Administrador">Administrador</option>
                                    </Select>
                                </FormGroup>

                                <FormGroup>
                                    <Label>Estado</Label>
                                    <Select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </Select>
                                </FormGroup>
                            </>
                        )}

                        <Divider />

                        <SectionTitle>Seguridad</SectionTitle>

                        <FormGroup>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={changePassword}
                                    onChange={(e) => setChangePassword(e.target.checked)}
                                />
                                <span style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>
                                    Cambiar contraseña
                                </span>
                            </label>
                        </FormGroup>

                        {changePassword && (
                            <FormGroup>
                                <Label>Nueva Contraseña</Label>
                                <PasswordWrapper>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        minLength={6}
                                        required={changePassword}
                                    />
                                    <TogglePasswordButton
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </TogglePasswordButton>
                                </PasswordWrapper>
                            </FormGroup>
                        )}

                        <SaveButton type="submit">
                            <Save size={20} />
                            {user ? 'Guardar Cambios' : 'Crear Usuario'}
                        </SaveButton>
                    </Form>
                </ModalContent>
            </Overlay>
        </AnimatePresence >
    );
}
