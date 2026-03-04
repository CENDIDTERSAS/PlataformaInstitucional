'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Users,
  Search,
  Check,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Package,
  FileText,
  LayoutDashboard,
  Settings,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const Container = styled.div`
  padding: 2rem;
  width: 100%;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const PageHeader = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  border: 1px solid var(--gray-100);
  position: sticky;
  top: 0;
  z-index: 100;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: #12A152;
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 14px;
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
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text);
  margin: 0;
`;

const Subtitle = styled.span`
  font-size: 0.85rem;
  color: var(--secondary);
  font-weight: 500;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const UserListCard = styled.div`
  background: white;
  border-radius: 22px;
  border: 1px solid var(--gray-100);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
  position: sticky;
  top: 90px; /* Debajo del PageHeader sticky */
`;

const SearchBox = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-50);
  background: #fcfcfc;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 1rem;
    color: var(--secondary);
    opacity: 0.4;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.75rem;
  border-radius: 12px;
  border: 1.5px solid var(--gray-100);
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #12A152;
    box-shadow: 0 0 0 4px rgba(18, 161, 82, 0.05);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const UserItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: none;
  background: ${props => props.$active ? '#f0fdf4' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  border-bottom: 1px solid #f8fafc;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: #12A152;
    opacity: ${props => props.$active ? 1 : 0};
    transition: all 0.2s;
  }

  &:hover {
    background: #f8fafc;
    transform: translateX(4px);
  }
`;

const UserAvatarWrapper = styled.div<{ $active: boolean }>`
  position: relative;
  padding: 2px;
  border-radius: 50%;
  background: ${props => props.$active ? 'linear-gradient(135deg, #12A152, #10b981)' : 'transparent'};
`;

const UserAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gray-200);
  color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  border: 2px solid white;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text);
  margin-bottom: 2px;
`;

const UserRole = styled.div`
  font-size: 0.775rem;
  color: var(--secondary);
  font-weight: 500;
`;

const PermissionsCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 22px;
  border: 1px solid var(--gray-100);
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  min-height: 700px;
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PermissionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  flex: 1;
`;

const ModuleGroup = styled.div`
  border: 1px solid var(--gray-100);
  border-radius: 18px;
  overflow: hidden;
  background: #fcfcfc;
`;

const ModuleHeader = styled.div`
  background: #f8fafc;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-weight: 800;
  font-size: 0.9rem;
  color: #334155;
  border-bottom: 1px solid var(--gray-100);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;

  &:hover {
    background: #f1f5f9;
  }

  .chevron {
    margin-left: auto;
    color: var(--secondary);
    opacity: 0.5;
    transition: transform 0.2s;
  }
`;

const ActionGrid = styled.div`
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
`;

const ActionItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--gray-100);

  &:hover {
    border-color: #12A152;
    background: #f0fdf4;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.02);
  }

  input {
    width: 20px;
    height: 20px;
    margin-top: 2px;
    accent-color: #12A152;
    flex-shrink: 0;
  }
`;

const ActionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ActionName = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
`;

const ActionDesc = styled.span`
  font-size: 0.75rem;
  color: var(--secondary);
  line-height: 1.4;
`;

const SaveBar = styled.div`
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 2px dashed #f1f5f9;
  display: flex;
  justify-content: flex-end;
`;

const SaveButton = styled.button`
  background: #1e293b;
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 14px;
  font-weight: 800;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #0f172a;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PermissionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState<{ modulo: string, accion: string }[]>([]);
  const [collapsedModules, setCollapsedModules] = useState<string[]>([]);

  const toggleModuleCollapse = (moduleId: string) => {
    setCollapsedModules(prev =>
      prev.includes(moduleId) ? prev.filter(m => m !== moduleId) : [...prev, moduleId]
    );
  };

  // Fetch Users
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/users`);
      return res.json();
    }
  });

  // Fetch Permissions for selected user
  const { data: userPermissions, isLoading: isLoadingPerms } = useQuery({
    queryKey: ['permissions', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const res = await fetch(`${API_URL}/users/${selectedUserId}/permissions`);
      return res.json();
    },
    enabled: !!selectedUserId
  });

  // Fetch current user profile to verify access permissions
  const { data: currentUserProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const res = await fetch(`${API_URL}/profile/${user.id}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  const { data: currentUserPermissions = [] } = useQuery({
    queryKey: ['my-permissions', currentUserProfile?.id],
    queryFn: async () => {
      if (!currentUserProfile?.id) return [];
      const res = await fetch(`${API_URL}/users/${currentUserProfile.id}/permissions`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!currentUserProfile?.id
  });

  React.useEffect(() => {
    if (!isProfileLoading && currentUserProfile) {
      const isPermitted = currentUserProfile.rol === 'Administrador' || (Array.isArray(currentUserPermissions) ? currentUserPermissions : []).some((p: any) => p.modulo === 'usuarios' && p.accion === 'gestionar_permisos');
      if (!isPermitted) {
        router.push('/dashboard');
      }
    }
  }, [currentUserProfile, isProfileLoading, currentUserPermissions, router]);

  // Sync internal state with fetched permissions
  React.useEffect(() => {
    if (userPermissions) {
      setPermissions(userPermissions);
    }
  }, [userPermissions]);

  const filteredUsers = users.filter((u: any) =>
    `${u.nombres} ${u.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = users.find((u: any) => u.id === selectedUserId);

  const handleToggle = (modulo: string, accion: string) => {
    setPermissions(prev => {
      const exists = prev.some(p => p.modulo === modulo && p.accion === accion);
      if (exists) {
        return prev.filter(p => !(p.modulo === modulo && p.accion === accion));
      } else {
        return [...prev, { modulo, accion }];
      }
    });
  };

  const isChecked = (modulo: string, accion: string) =>
    permissions.some(p => p.modulo === modulo && p.accion === accion);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId) return;
      const res = await fetch(`${API_URL}/users/${selectedUserId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permisos: permissions })
      });
      return res.json();
    },
    onSuccess: () => {
      alert('Permisos actualizados correctamente');
      queryClient.invalidateQueries({ queryKey: ['permissions', selectedUserId] });
    }
  });

  const modules = [
    {
      id: 'biomedicos',
      name: '🩺 Biomédicos',
      actions: [
        { id: 'acceso', name: 'Acceso General', desc: 'Permite entrar al módulo' },
        { id: 'gestionar', name: 'Gestionar', desc: 'Crear y editar equipos/hojas de vida' },
        { id: 'descargar_pdf', name: 'Descargar PDF', desc: 'Generar reportes técnicos en PDF' }
      ]
    },
    {
      id: 'sistemas',
      name: '💻 Sistemas',
      actions: [
        { id: 'acceso', name: 'Acceso General', desc: 'Permite entrar al módulo' },
        { id: 'gestionar', name: 'Gestionar TI', desc: 'Administrar equipos y licencias' }
      ]
    },
    {
      id: 'proveedores',
      name: '🤝 Proveedores',
      actions: [
        { id: 'acceso', name: 'Acceso General', desc: 'Permite entrar al módulo' },
        { id: 'gestionar', name: 'Gestionar', desc: 'Administrar catálogo de proveedores' }
      ]
    },
    {
      id: 'virtual-classroom',
      name: '🎓 Aula Virtual',
      actions: [
        { id: 'acceso', name: 'Acceso General', desc: 'Ver catálogo de cursos' },
        { id: 'crear_cursos', name: 'Crear Cursos', desc: 'Permite diseñar nuevos contenidos' },
        { id: 'gestionar_cursos', name: 'Gestionar Todo', desc: 'Administrar todos los cursos y registros' }
      ]
    },
    {
      id: 'inventarios',
      name: '📦 Inventarios',
      actions: [
        { id: 'acceso', name: 'Acceso General', desc: 'Permite entrar al módulo' },
        { id: 'ver_bodegas', name: 'Ver Bodegas', desc: 'Ver listado de almacenes' },
        { id: 'ver_stock', name: 'Ver Stock', desc: 'Ver existencias actuales' },
        { id: 'movimientos', name: 'Movimientos', desc: 'Ver histórico de entradas y salidas' },
        { id: 'auditoria', name: 'Auditoría', desc: 'Ver bitácora de cambios' },
        { id: 'descargar_pdf_oficio', name: 'Descargar PDF Oficio', desc: 'Generar documento para proveedores' },
        { id: 'exportar_excel', name: 'Exportar Excel', desc: 'Descargar reportes en formato XLSX' }
      ]
    },
    {
      id: 'papeleria',
      name: '📝 Papelería',
      actions: [
        { id: 'acceso', name: 'Acceso General', desc: 'Permite entrar al módulo' },
        { id: 'solicitar', name: 'Solicitar', desc: 'Crear solicitudes de insumos' },
        { id: 'gestionar', name: 'Gestionar', desc: 'Aprobar y entregar pedidos' },
        { id: 'exportar_excel', name: 'Exportar Excel', desc: 'Descargar reportes en formato XLSX' }
      ]
    },
    {
      id: 'usuarios',
      name: '👥 Usuarios',
      actions: [
        { id: 'acceso', name: 'Acceso General', desc: 'Permite entrar al módulo' },
        { id: 'gestionar', name: 'Gestionar Perfiles', desc: 'Crear, editar y eliminar usuarios' },
        { id: 'gestionar_permisos', name: 'Gestionar Permisos', desc: 'Modificar accesos de otros usuarios' }
      ]
    },
    {
      id: 'dashboard',
      name: '📊 Dashboard',
      actions: [
        { id: 'acceso', name: 'Ver Métricas', desc: 'Visualizar estadísticas generales' }
      ]
    }
  ];

  return (
    <Container>
      <PageHeader>
        <TitleSection>
          <IconWrapper $color="#12A152">
            <Shield size={26} />
          </IconWrapper>
          <TitleContainer>
            <Title>Gestión de Permisos</Title>
            <Subtitle>Administración de niveles de acceso y privilegios del sistema</Subtitle>
          </TitleContainer>
        </TitleSection>
      </PageHeader>

      <ContentGrid>
        <UserListCard>
          <SearchBox>
            <SearchInputWrapper>
              <Search size={18} />
              <SearchInput
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInputWrapper>
          </SearchBox>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredUsers.map((user: any) => (
              <UserItem
                key={user.id}
                $active={selectedUserId === user.id}
                onClick={() => setSelectedUserId(user.id)}
              >
                <UserAvatarWrapper $active={selectedUserId === user.id}>
                  <UserAvatar>{user.nombres[0]}</UserAvatar>
                </UserAvatarWrapper>
                <UserInfo>
                  <UserName>{user.nombres} {user.apellidos}</UserName>
                  <UserRole>{user.rol} • {user.dependencia}</UserRole>
                </UserInfo>
                <ChevronRight size={16} color={selectedUserId === user.id ? "#12A152" : "var(--secondary)"} style={{ opacity: 0.5 }} />
              </UserItem>
            ))}
            {filteredUsers.length === 0 && (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', opacity: 0.4 }}>
                <Users size={32} style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No se encontraron usuarios</p>
              </div>
            )}
          </div>
        </UserListCard>

        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div
              key={selectedUserId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ width: '100%' }}
            >
              <PermissionsCard>
                <SectionTitle>
                  <Grid size={24} style={{ color: '#12A152' }} />
                  Matriz de Permisos: {selectedUser.nombres}
                </SectionTitle>

                <PermissionGrid>
                  {modules.map(mod => (
                    <ModuleGroup key={mod.id}>
                      <ModuleHeader onClick={() => toggleModuleCollapse(mod.id)}>
                        {mod.name}
                        {collapsedModules.includes(mod.id)
                          ? <ChevronDown size={16} className="chevron" />
                          : <ChevronUp size={16} className="chevron" />
                        }
                      </ModuleHeader>
                      {!collapsedModules.includes(mod.id) && (
                        <ActionGrid>
                          {mod.actions.map(action => (
                            <ActionItem key={action.id}>
                              <input
                                type="checkbox"
                                checked={isChecked(mod.id, action.id)}
                                onChange={() => handleToggle(mod.id, action.id)}
                              />
                              <ActionText>
                                <ActionName>{action.name}</ActionName>
                                <ActionDesc>{action.desc}</ActionDesc>
                              </ActionText>
                            </ActionItem>
                          ))}
                        </ActionGrid>
                      )}
                    </ModuleGroup>
                  ))}
                </PermissionGrid>

                <SaveBar>
                  <SaveButton
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                  >
                    <Save size={20} />
                    {saveMutation.isPending ? 'Procesando...' : 'Aplicar Cambios de Seguridad'}
                  </SaveButton>
                </SaveBar>
              </PermissionsCard>
            </motion.div>
          ) : (
            <PermissionsCard style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', opacity: 0.6 }}>
              <div style={{ textAlign: 'center' }}>
                <Shield size={64} style={{ marginBottom: '1.5rem', opacity: 0.15, color: '#3b82f6' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Control de Accesos</h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>Selecciona un colaborador de la lista para gestionar su matriz de responsabilidades y permisos.</p>
              </div>
            </PermissionsCard>
          )}
        </AnimatePresence>
      </ContentGrid>
    </Container>
  );
}
