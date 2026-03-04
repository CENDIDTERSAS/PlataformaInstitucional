'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    Search,
    Edit,
    Trash2,
    Mail,
    Phone,
    MapPin,
    Hash
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProveedorModal from '@/components/proveedores/ProveedorModal';
import { supabase } from '@/lib/supabase';

const Container = styled.div`
  padding: 2rem;
  width: 100%;
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
    background: var(--primary);
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const HeaderIconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(18, 161, 82, 0.1);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(18, 161, 82, 0.1);
`;

const Title = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text);
    margin: 0;
    letter-spacing: -0.02em;
  }
  p {
    font-size: 0.95rem;
    color: var(--secondary);
    margin: 0.2rem 0 0;
  }
`;

const PrimaryButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.8rem 1.6rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(18, 161, 82, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(18, 161, 82, 0.3);
    opacity: 0.95;
  }
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1.2rem;
  border-radius: 16px;
  border: 1px solid var(--gray-100);
  align-items: center;
  position: sticky;
  top: 90px;
  z-index: 90;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  background-color: var(--gray-50);
  border: 1px solid var(--gray-100);
  border-radius: 12px;
  outline: none;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:focus {
    border-color: var(--primary);
    background-color: white;
    box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.1);
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary);
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid var(--gray-100);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1.2rem 1.5rem;
  background: var(--gray-50);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Td = styled.td`
  padding: 1.2rem 1.5rem;
  border-top: 1px solid var(--gray-100);
  font-size: 0.95rem;
  color: #4f566b;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--gray-100);
    color: var(--primary);
  }
`;

const Badge = styled.span`
  padding: 0.35rem 0.75rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(18, 161, 82, 0.1);
  color: var(--primary);
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProveedoresPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProveedor, setSelectedProveedor] = useState<any>(null);

    const { data: proveedores = [], isLoading } = useQuery({
        queryKey: ['proveedores'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/proveedores`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        }
    });

    // Asegurar que proveedores sea un arreglo
    const proveedoresArr = Array.isArray(proveedores) ? proveedores : [];

    // Perfil del usuario actual
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

    const isPermitted = (modulo: string, accion: string = 'acceso') => {
        if (profile?.rol === 'Administrador') return true;
        return (Array.isArray(permissions) ? permissions : []).some((p: any) => p.modulo === modulo && p.accion === accion);
    };

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const method = selectedProveedor ? 'PUT' : 'POST';
            const url = selectedProveedor ? `${API_URL}/proveedores/${selectedProveedor.id}` : `${API_URL}/proveedores`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Error al guardar proveedor');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
            setIsModalOpen(false);
            setSelectedProveedor(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`${API_URL}/proveedores/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar proveedor');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
        }
    });

    const handleAdd = () => {
        setSelectedProveedor(null);
        setIsModalOpen(true);
    };

    const handleEdit = (prov: any) => {
        setSelectedProveedor(prov);
        setIsModalOpen(true);
    };

    const handleDelete = (prov: any) => {
        if (confirm(`¿Estás seguro de eliminar al proveedor ${prov.nombre}?`)) {
            deleteMutation.mutate(prov.id);
        }
    };

    const filteredProveedores = proveedoresArr.filter((p: any) =>
        p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nit?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container>
            <ModuleHeader>
                <TitleSection>
                    <HeaderIconWrapper>
                        <Users size={28} />
                    </HeaderIconWrapper>
                    <Title>
                        <h1>Gestión de Proveedores</h1>
                        <p>Catálogo Institucional de Proveedores y Servicios</p>
                    </Title>
                </TitleSection>
                {isPermitted('proveedores', 'gestionar') && (
                    <PrimaryButton onClick={handleAdd}>
                        <UserPlus size={20} />
                        Nuevo Proveedor
                    </PrimaryButton>
                )}
            </ModuleHeader>

            <ControlsSection>
                <SearchWrapper>
                    <SearchIconWrapper>
                        <Search size={20} />
                    </SearchIconWrapper>
                    <SearchInput
                        placeholder="Buscar por nombre, NIT o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchWrapper>
            </ControlsSection>

            <TableWrapper>
                <Table>
                    <thead>
                        <tr>
                            <Th>Proveedor / NIT</Th>
                            <Th>Email</Th>
                            <Th>Teléfono</Th>
                            <Th>Ubicación</Th>
                            <Th>Dirección</Th>
                            <Th>Acciones</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><Td colSpan={6} style={{ textAlign: 'center' }}>Cargando proveedores...</Td></tr>
                        ) : filteredProveedores.map((prov: any) => (
                            <tr key={prov.id}>
                                <Td>
                                    <div style={{ fontWeight: 600, color: '#1a1f36' }}>{prov.nombre}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#697386' }}>NIT: {prov.nit || 'N/A'}</div>
                                </Td>
                                <Td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Mail size={14} />
                                        {prov.email || 'Sin email'}
                                    </div>
                                </Td>
                                <Td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Phone size={14} />
                                        {prov.telefono || 'N/A'}
                                    </div>
                                </Td>
                                <Td>
                                    <div style={{ fontWeight: 600 }}>{prov.ciudad || 'N/A'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#697386' }}>{prov.departamento || 'N/A'}</div>
                                </Td>
                                <Td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <MapPin size={14} />
                                        {prov.direccion || 'Sin dirección'}
                                    </div>
                                </Td>
                                <Td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {isPermitted('proveedores', 'gestionar') && (
                                            <>
                                                <ActionButton onClick={() => handleEdit(prov)}>
                                                    <Edit size={18} />
                                                </ActionButton>
                                                <ActionButton onClick={() => handleDelete(prov)}>
                                                    <Trash2 size={18} />
                                                </ActionButton>
                                            </>
                                        )}
                                        {!isPermitted('proveedores', 'gestionar') && (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Solo lectura</span>
                                        )}
                                    </div>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableWrapper>

            <ProveedorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(data) => mutation.mutate(data)}
                proveedor={selectedProveedor}
            />
        </Container>
    );
}
