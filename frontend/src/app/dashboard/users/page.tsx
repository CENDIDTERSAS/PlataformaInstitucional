'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Shield,
    Building2,
    Mail,
    CheckCircle,
    XCircle,
    IdCard,
    Phone,
    Briefcase,
    FileSpreadsheet,
    Inbox
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EditUserModal from '@/components/users/EditUserModal';
import ImportUsersModal from '@/components/users/ImportUsersModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Container = styled.div`
  padding: 2rem;
  width: 100%;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModuleHeader = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  border: 1px solid var(--gray-100);
  position: sticky;
  top: 0;
  z-index: 100;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: var(--primary);
    border-radius: 20px 0 0 20px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background-color: ${props => props.$color}15;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px ${props => props.$color}20;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text);
  margin: 0;
`;

const Subtitle = styled.span`
  font-size: 0.875rem;
  color: var(--secondary);
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const PrimaryButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'outline' }>`
  background-color: ${props => props.$variant === 'secondary' ? '#1e293b' : props.$variant === 'outline' ? 'white' : 'var(--primary)'};
  color: ${props => props.$variant === 'outline' ? 'var(--text)' : 'white'};
  border: ${props => props.$variant === 'outline' ? '1.5px solid var(--gray-100)' : 'none'};
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$variant === 'outline' ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.08)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$variant === 'outline' ? '0 4px 8px rgba(0,0,0,0.05)' : '0 8px 16px rgba(0, 0, 0, 0.12)'};
    opacity: 0.95;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 1.25rem;
    color: var(--secondary);
    opacity: 0.5;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.85rem 1.25rem 0.85rem 3.25rem;
  background-color: white;
  border: 1.5px solid var(--gray-100);
  border-radius: 14px;
  outline: none;
  font-size: 0.95rem;
  transition: all 0.2s;
  color: var(--text);

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(18, 161, 82, 0.05);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid var(--gray-100);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1.25rem 1.5rem;
  background: #fcfcfc;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 1px solid var(--gray-100);
`;

const Td = styled.td`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.925rem;
  color: var(--text);
  vertical-align: middle;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

const AvatarContainer = styled.div<{ $color: string }>`
  position: relative;
  padding: 3px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${props => props.$color}, #3b82f6);
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background-color: var(--white);
  color: var(--sidebar-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  border: 2px solid white;
`;

const Badge = styled.span<{ $type: 'role' | 'status' | 'dept' | 'id', $color?: string }>`
  padding: 0.4rem 0.85rem;
  border-radius: 10px;
  font-size: 0.775rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  
  ${props => {
        switch (props.$type) {
            case 'role':
                return `background: #f0fdf4; color: #12A152;`;
            case 'status':
                return props.$color === 'green'
                    ? `background: #ecfdf5; color: #12A152;`
                    : `background: #fff1f2; color: #e11d48;`;
            case 'dept':
                return `background: #f8fafc; color: #475569; border: 1px solid #e2e8f0;`;
            case 'id':
                return `background: #fff7ed; color: #c2410c;`;
        }
    }}
`;

const TableActionButton = styled.button<{ $variant?: 'edit' | 'status' | 'delete' }>`
  background: white;
  border: 1.5px solid var(--gray-100);
  color: var(--secondary);
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 10px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    ${props => props.$variant === 'edit' && `border-color: var(--primary); color: var(--primary); background: #f0fdf4;`}
    ${props => props.$variant === 'status' && `border-color: #f59e0b; color: #f59e0b; background: #fffbeb;`}
    ${props => props.$variant === 'delete' && `border-color: #ef4444; color: #ef4444; background: #fef2f2;`}
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #f8fafc;
  }
`;

export default function UsersManagementPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/users`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        }
    });

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['my-profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const res = await fetch(`${API_URL}/profile/${user.id}`);
            if (!res.ok) return null;
            return res.json();
        }
    });

    const { data: permissions = [] } = useQuery({
        queryKey: ['my-permissions', profile?.id],
        queryFn: async () => {
            if (!profile?.id) return [];
            const res = await fetch(`${API_URL}/users/${profile.id}/permissions`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        enabled: !!profile?.id
    });

    const isPermitted = (modulo: string, accion: string = 'acceso') => {
        if (profile?.rol === 'Administrador') return true;
        return (Array.isArray(permissions) ? permissions : []).some((p: any) => p.modulo === modulo && p.accion === accion);
    };

    useEffect(() => {
        if (!isLoadingProfile && profile) {
            if (profile.rol !== 'Administrador' && !isPermitted('usuarios', 'acceso')) {
                router.push('/dashboard');
            }
        }
    }, [profile, isLoadingProfile, permissions, router]);

    const usersArr = Array.isArray(users) ? users : [];

    const updateUserMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { password, ...profileData } = data;
            const profileRes = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            if (!profileRes.ok) throw new Error('Error al actualizar perfil');

            if (password) {
                const passRes = await fetch(`${API_URL}/users/${id}/change-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                if (!passRes.ok) throw new Error('Error al cambiar contraseña');
            }
            return profileRes.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            queryClient.invalidateQueries({ queryKey: ['my-permissions'] });
            alert('Usuario actualizado correctamente');
        },
        onError: (error: any) => {
            alert(`Error: ${error.message}`);
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar usuario');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            alert('Usuario eliminado correctamente');
        },
        onError: (error: any) => {
            alert(`Error: ${error.message}`);
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
            const res = await fetch(`${API_URL}/users/${id}/toggle-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado })
            });
            if (!res.ok) throw new Error('Error al cambiar estado');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    const createUserMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Error al crear usuario');
            return result;
        },
        onSuccess: (result: any) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsCreateModalOpen(false);
            if (result.password) {
                try {
                    navigator.clipboard.writeText(result.password);
                } catch (e) { }

                alert(`✅ Usuario creado exitosamente.\n\nEmail: ${result.email}\n\nSe ha generado una contraseña temporal. (Intentamos copiarla a tu portapapeles automáticamente). En la siguiente ventana podrás seleccionarla y guardarla.`);
                window.prompt('Copia esta contraseña: (NO se mostrará de nuevo)', result.password);
            } else {
                alert('✅ Usuario creado correctamente.');
            }
        },
        onError: (error: any) => {
            alert(`Error: ${error.message}`);
        }
    });

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = (data: any) => {
        if (selectedUser) {
            updateUserMutation.mutate({ id: selectedUser.id, data });
        }
    };

    const handleCreateUser = (data: any) => {
        createUserMutation.mutate(data);
    };

    const handleDeleteUser = (user: any) => {
        if (user.email === 'ricardosolarte.08@gmail.com') {
            alert('❌ Acción denegada: El administrador principal no puede ser eliminado del sistema.');
            return;
        }
        if (confirm(`¿Estás seguro de eliminar a ${user.nombres} ${user.apellidos}?`)) {
            deleteUserMutation.mutate(user.id);
        }
    };

    const handleToggleStatus = (user: any) => {
        if (user.email === 'ricardosolarte.08@gmail.com') {
            alert('❌ Acción denegada: El estado del administrador principal no puede ser modificado.');
            return;
        }
        const nuevoEstado = user.estado === 'Activo' ? 'Inactivo' : 'Activo';
        toggleStatusMutation.mutate({ id: user.id, estado: nuevoEstado });
    };

    const handleImportUsers = async (usersToImport: any[]) => {
        try {
            const res = await fetch(`${API_URL}/users/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: usersToImport })
            });
            const results = await res.json();
            alert(`✅ Importación completada!
${results.success.length} usuarios creados exitosamente
${results.errors.length} errores

${results.success.length > 0 ? '\\nUsuarios creados (guardar estas contraseñas):\\n' + results.success.map((u: any) => `${u.nombre}: ${u.email} - ${u.password}`).join('\\n') : ''}`);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        } catch (error: any) {
            alert(`Error en la importación: ${error.message}`);
        }
    };

    const filteredUsers = usersArr.filter((user: any) =>
        user.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.identificacion?.includes(searchTerm) ||
        user.dependencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container>
            <ModuleHeader>
                <TitleSection>
                    <IconWrapper $color="#12A152">
                        <Users size={28} />
                    </IconWrapper>
                    <TitleContainer>
                        <Title>Gestión de Usuarios</Title>
                        <Subtitle>{usersArr.length} colaboradores registrados en el sistema</Subtitle>
                    </TitleContainer>
                </TitleSection>
                {(profile?.rol === 'Administrador' || isPermitted('usuarios', 'gestionar')) && (
                    <ActionButtons>
                        <PrimaryButton $variant="outline" onClick={() => setIsImportModalOpen(true)}>
                            <FileSpreadsheet size={18} />
                            Importar Excel
                        </PrimaryButton>
                        <PrimaryButton onClick={() => setIsCreateModalOpen(true)}>
                            <UserPlus size={18} />
                            Nuevo Usuario
                        </PrimaryButton>
                    </ActionButtons>
                )}
            </ModuleHeader>

            <ControlsSection>
                <SearchWrapper>
                    <Search size={20} />
                    <SearchInput
                        placeholder="Buscar por nombre, identificación, cargo o dependencia..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchWrapper>
                <PrimaryButton $variant="outline" style={{ padding: '0.75rem 1rem' }}>
                    <Filter size={18} />
                </PrimaryButton>
            </ControlsSection>

            <TableCard>
                <Table>
                    <thead>
                        <tr>
                            <Th>Colaborador</Th>
                            <Th>Identificación</Th>
                            <Th>Rol de Acceso</Th>
                            <Th>Dependencia</Th>
                            <Th>Estado</Th>
                            {(profile?.rol === 'Administrador' || isPermitted('usuarios', 'gestionar')) && (
                                <Th style={{ textAlign: 'right' }}>Acciones</Th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <Td>
                                    <UserInfo>
                                        <AvatarContainer $color="#12A152">
                                            <Avatar>
                                                {user.nombres?.[0]}{user.apellidos?.[0]}
                                            </Avatar>
                                        </AvatarContainer>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
                                                {user.nombres} {user.apellidos}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Mail size={12} style={{ opacity: 0.6 }} />
                                                {user.email}
                                            </div>
                                        </div>
                                    </UserInfo>
                                </Td>
                                <Td>
                                    <Badge $type="id">{user.identificacion}</Badge>
                                </Td>
                                <Td>
                                    <Badge $type="role">
                                        <Shield size={12} />
                                        {user.rol}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Badge $type="dept">{user.dependencia}</Badge>
                                </Td>
                                <Td>
                                    <Badge
                                        $type="status"
                                        $color={user.estado === 'Activo' ? 'green' : 'red'}
                                    >
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                        {user.estado}
                                    </Badge>
                                </Td>
                                {(profile?.rol === 'Administrador' || isPermitted('usuarios', 'gestionar')) && (
                                    <Td>
                                        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                                            <TableActionButton
                                                $variant="edit"
                                                onClick={(e) => {
                                                    if (user.email === 'ricardosolarte.08@gmail.com') e.preventDefault();
                                                    else handleEditUser(user);
                                                }}
                                                disabled={user.email === 'ricardosolarte.08@gmail.com'}
                                                title={user.email === 'ricardosolarte.08@gmail.com' ? 'Administrador protegido' : "Editar información"}
                                            >
                                                <Edit size={16} />
                                            </TableActionButton>
                                            <TableActionButton
                                                $variant="status"
                                                onClick={(e) => {
                                                    if (user.email === 'ricardosolarte.08@gmail.com') e.preventDefault();
                                                    else handleToggleStatus(user);
                                                }}
                                                disabled={user.email === 'ricardosolarte.08@gmail.com'}
                                                title={user.email === 'ricardosolarte.08@gmail.com' ? 'Administrador protegido' : user.estado === 'Activo' ? 'Desactivar acceso' : 'Activar acceso'}
                                            >
                                                <Shield size={16} />
                                            </TableActionButton>
                                            <TableActionButton
                                                $variant="delete"
                                                onClick={(e) => {
                                                    if (user.email === 'ricardosolarte.08@gmail.com') e.preventDefault();
                                                    else handleDeleteUser(user);
                                                }}
                                                disabled={user.email === 'ricardosolarte.08@gmail.com'}
                                                title={user.email === 'ricardosolarte.08@gmail.com' ? 'Administrador protegido' : "Eliminar permanentemente"}
                                            >
                                                <Trash2 size={16} />
                                            </TableActionButton>
                                        </div>
                                    </Td>
                                )}
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <Td colSpan={6} style={{ textAlign: 'center', padding: '5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.4 }}>
                                        <Inbox size={48} style={{ marginBottom: '1rem' }} />
                                        <p style={{ fontWeight: 600 }}>No se encontraron colaboradores</p>
                                        <p style={{ fontSize: '0.85rem' }}>Intenta con otro término de búsqueda</p>
                                    </div>
                                </Td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </TableCard>

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveUser}
                user={selectedUser}
                isAdmin={true}
            />

            <EditUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreateUser}
                user={null}
                isAdmin={true}
            />

            <ImportUsersModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportUsers}
            />
        </Container>
    );
}
