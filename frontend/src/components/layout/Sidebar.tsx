'use client';

import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight,
  User,
  Package,
  FileText,
  Grid,
  Users,
  ChevronDown,
  ChevronUp,
  Bell,
  HeartPulse,
  GraduationCap,
  Monitor
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

const SidebarContainer = styled.aside`
  width: 270px;
  height: 100vh;
  background: var(--sidebar-dark);
  background: linear-gradient(180deg, var(--sidebar-dark) 0%, #020617 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 200;
  overflow-y: auto;
  color: var(--sidebar-text);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
`;

const LogoSection = styled.div`
  padding: 2rem 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 1.5rem;
    right: 1.5rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  }
`;

const Logo = styled.img`
  height: 64px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.1));
`;

const ProfileSection = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const AvatarContainer = styled.div`
  position: relative;
  padding: 3px;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--primary), #3b82f6);
  box-shadow: 0 4px 12px rgba(18, 161, 82, 0.2);
`;

const Avatar = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--sidebar-dark);
  display: block;
`;

const ProfileInfo = styled.div`
  text-align: center;
`;

const Name = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.15rem;
`;

const Role = styled.div`
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
`;

const MenuSection = styled.nav`
  flex: 1;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MenuItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border: none;
  background: ${props => props.$active ? 'var(--sidebar-item-active)' : 'transparent'};
  border-radius: 10px;
  color: ${props => props.$active ? 'var(--primary)' : 'var(--sidebar-text)'};
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  font-size: 0.925rem;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    color: var(--sidebar-text-hover);
    transform: translateX(4px);

    svg {
      color: var(--primary);
      transform: scale(1.1);
    }
  }

  svg {
    transition: all 0.2s ease;
    flex-shrink: 0;
    color: ${props => props.$active ? 'var(--primary)' : 'inherit'};
  }

  ${props => props.$active && css`
    &::before {
      content: '';
      position: absolute;
      left: -1rem;
      top: 20%;
      bottom: 20%;
      width: 4px;
      background: var(--primary);
      border-radius: 0 4px 4px 0;
      box-shadow: 0 0 10px var(--primary);
    }
  `}
`;

const SubMenu = styled.div`
  margin: 0.25rem 0 0.75rem 1.25rem;
  padding-left: 1.25rem;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const SubMenuItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  text-align: left;
  padding: 0.6rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${props => props.$active ? 'var(--white)' : 'var(--sidebar-text)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    color: var(--white);
    padding-left: 1.25rem;
  }

  svg {
    opacity: 0.7;
    font-size: 14px;
  }
`;

const FooterSection = styled.div`
  padding: 1.25rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const vibrate = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(8deg); }
  50% { transform: rotate(-8deg); }
  75% { transform: rotate(-8deg); }
  100% { transform: rotate(0deg); }
`;

const BellWrapper = styled.div<{ $hasNew: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$hasNew ? '#ea4335' : 'inherit'};
  
  svg {
    animation: ${props => props.$hasNew ? css`${vibrate} 0.5s linear infinite` : 'none'};
    transition: all 0.3s ease;
  }
`;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);

  // Obtener usuario actual y su perfil
  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const res = await fetch(`${API_URL}/profile/${user.id}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  // Obtener permisos del usuario
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

  // Consultar notificaciones para ver si hay nuevas
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', profile?.rol, profile?.dependencia],
    queryFn: async () => {
      if (!profile) return [];
      const res = await fetch(`${API_URL}/notifications?rol=${profile.rol}&dependencia=${profile.dependencia}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!profile,
    refetchInterval: 30000
  });

  // Suscribirse a cambios en tiempo real para la campana
  React.useEffect(() => {
    const channel = supabase
      .channel('sidebar-notifs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones' },
        () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const hasNewNotifications = Array.isArray(notifications) && notifications.some((n: any) =>
    !profile?.ultimo_visto_notif || new Date(n.creado_at) > new Date(profile.ultimo_visto_notif)
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard/metrics', show: isPermitted('dashboard', 'acceso') },
    {
      name: 'Notificaciones',
      icon: (
        <BellWrapper $hasNew={hasNewNotifications}>
          <Bell size={20} />
          {hasNewNotifications && (
            <div style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              backgroundColor: '#ea4335',
              borderRadius: '50%',
              border: '2px solid var(--sidebar-dark)'
            }} />
          )}
        </BellWrapper>
      ),
      path: '/dashboard/notifications',
      show: true
    },
    {
      name: 'Módulos',
      icon: <Grid size={20} />,
      path: '/dashboard',
      show: profile?.rol === 'Administrador' || (Array.isArray(permissions) ? permissions : []).some((p: any) => p.accion === 'acceso')
    },
    {
      name: 'Aula Virtual',
      icon: <GraduationCap size={20} />,
      path: '/dashboard/virtual-classroom',
      show: isPermitted('virtual-classroom', 'acceso')
    },
    {
      name: 'Reportes y Auditoría',
      icon: <FileText size={20} />,
      path: '/dashboard/inventory?tab=audit',
      show: profile?.rol === 'Administrador' || isPermitted('inventarios', 'auditoria')
    },
  ];

  return (
    <SidebarContainer>
      <LogoSection>
        <Logo
          src="https://www.cendidter.com/wp-content/uploads/2021/11/logo-cendidter-01-150x150.png"
          alt="Cendidter Logo"
        />
      </LogoSection>

      <ProfileSection>
        {isLoading ? (
          <div style={{ padding: '1rem', color: 'var(--sidebar-text)', fontSize: '0.8rem' }}>Cargando...</div>
        ) : (
          <>
            <AvatarContainer>
              <Avatar
                src={
                  (profile?.foto_url ? `${profile.foto_url}${profile.foto_url.includes('?') ? '&' : '?'}t=${Date.now()}` : null) ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent((profile?.nombres || '') + ' ' + (profile?.apellidos || ''))}&background=1e293b&color=fff&bold=true`
                }
                alt="User"
              />
            </AvatarContainer>
            <ProfileInfo>
              <Name>{profile?.nombres} {profile?.apellidos}</Name>
              <Role>{profile?.rol || 'Institucional'}</Role>
            </ProfileInfo>
          </>
        )}
      </ProfileSection>

      <MenuSection>
        {menuItems.filter(i => i.show).map((item, index) => (
          <MenuItem
            key={index}
            $active={pathname === item.path}
            onClick={() => item.path !== '#' && router.push(item.path)}
          >
            {item.icon}
            <span style={{ flex: 1, textAlign: 'left' }}>{item.name}</span>
            {item.path === '#' && <ChevronRight size={16} />}
          </MenuItem>
        ))}
      </MenuSection>

      <FooterSection>
        <MenuItem onClick={() => setIsConfigOpen(!isConfigOpen)} $active={isConfigOpen}>
          <Settings size={20} />
          <span style={{ flex: 1, textAlign: 'left' }}>Configuración</span>
          {isConfigOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </MenuItem>

        {isConfigOpen && (
          <SubMenu>
            <SubMenuItem onClick={() => router.push('/dashboard/profile')} $active={pathname === '/dashboard/profile'}>
              <User size={14} />
              Mi Perfil
            </SubMenuItem>
            {(profile?.rol === 'Administrador' || isPermitted('usuarios', 'acceso')) && (
              <SubMenuItem onClick={() => router.push('/dashboard/users')} $active={pathname === '/dashboard/users'}>
                <Users size={14} />
                Gestión de Usuarios
              </SubMenuItem>
            )}
            {(profile?.rol === 'Administrador' || isPermitted('usuarios', 'gestionar_permisos')) && (
              <SubMenuItem onClick={() => router.push('/dashboard/permissions')} $active={pathname === '/dashboard/permissions'}>
                <Grid size={14} />
                Permisos de Módulos
              </SubMenuItem>
            )}
            {profile?.rol === 'Administrador' && (
              <SubMenuItem onClick={() => router.push('#')}>
                <Settings size={14} />
                Ajustes del Sistema
              </SubMenuItem>
            )}
          </SubMenu>
        )}

        <MenuItem onClick={handleLogout} style={{ color: '#f87171', marginTop: '0.5rem' }}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </MenuItem>
      </FooterSection>
    </SidebarContainer>
  );
}
