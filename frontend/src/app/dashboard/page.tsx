'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Users, FileText, Bell, Settings, Package, HeartPulse, Monitor } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DashboardContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--text);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const Card = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid var(--gray-100);

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background-color: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
`;

const CardDescription = styled.p`
  color: var(--secondary);
  font-size: 0.9rem;
`;

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const modulesList = [
  {
    id: 'biomedicos',
    title: 'Equipos Biomédicos',
    description: 'Gestión técnica, mantenimiento y hojas de vida de equipos médicos.',
    icon: <HeartPulse size={24} />,
    color: '#12A152',
    path: '/dashboard/biomedicos'
  },
  {
    id: 'inventarios',
    title: 'Inventarios',
    description: 'Control de productos, bodegas y movimientos institucionales.',
    icon: <Package size={24} />,
    color: '#12A152',
    path: '/dashboard/inventory'
  },
  {
    id: 'papeleria',
    title: 'Papelería',
    description: 'Solicitud de insumos de office y suministros digitales.',
    icon: <FileText size={24} />,
    color: '#34a853',
    path: '/dashboard/papeleria'
  },
  {
    id: 'proveedores',
    title: 'Proveedores',
    description: 'Gestión de proveedores, contratos y seguimiento de servicios.',
    icon: <Users size={24} />,
    color: '#f4b400',
    path: '/dashboard/proveedores'
  },
  {
    id: 'sistemas',
    title: 'Sistemas',
    description: 'Gestión de equipos de cómputo, licencias, soporte técnico y activos TI.',
    icon: <Monitor size={24} />,
    color: '#7c3aed',
    path: '/dashboard/sistemas'
  }
];

export default function DashboardPage() {
  const router = useRouter();

  // Obtener usuario actual y su perfil
  const { data: profile } = useQuery({
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

  // Asegurar que permissions sea un arreglo
  const permissionsArr = Array.isArray(permissions) ? permissions : [];

  const isPermitted = (modulo: string) => {
    if (profile?.rol === 'Administrador') return true;
    return permissionsArr.some((p: any) => p.modulo === modulo && p.accion === 'acceso');
  };

  const filteredModules = modulesList
    .filter(m => isPermitted(m.id))
    .sort((a, b) => a.title.localeCompare(b.title, 'es'));

  return (
    <DashboardContainer>
      <Header>
        <Title>Módulos</Title>
      </Header>

      <Grid>
        {filteredModules.map((module, index) => (
          <Card
            key={index}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => module.path !== '#' && router.push(module.path)}
          >
            <IconWrapper $color={module.color}>
              {module.icon}
            </IconWrapper>
            <div>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </div>
          </Card>
        ))}
        {filteredModules.length === 0 && !profile && (
          <div style={{ color: 'var(--secondary)' }}>Cargando módulos...</div>
        )}
        {filteredModules.length === 0 && profile && (
          <div style={{ color: 'var(--secondary)' }}>No tienes acceso a ningún módulo. Contacta al administrador.</div>
        )}
      </Grid>
    </DashboardContainer>
  );
}
