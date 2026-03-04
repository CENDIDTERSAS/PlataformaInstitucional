'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Inbox
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import RequestStationeryModal from '@/components/stationery/RequestStationeryModal';
import RequestDetailsModal from '@/components/stationery/RequestDetailsModal';
import { supabase } from '@/lib/supabase';

const Container = styled.div`
  padding: 2.5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const ModuleHeader = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--gray-100);
  position: relative;
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

    span {
      font-size: 0.8rem;
      color: var(--secondary);
      background: var(--gray-100);
      padding: 0.2rem 0.6rem;
      border-radius: 8px;
      font-weight: 700;
      margin-left: 0.75rem;
      vertical-align: middle;
    }
  }
  p {
    font-size: 0.95rem;
    color: var(--secondary);
    margin: 0.2rem 0 0;
  }
`;

const PrimaryButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  color: var(--secondary);
`;

const RequestsTable = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid var(--gray-100);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1.25rem 1.5rem;
  background: var(--gray-50);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--secondary);
`;

const Td = styled.td`
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--gray-100);
  font-size: 0.95rem;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  background-color: ${props => {
    switch (props.$status) {
      case 'Pendiente': return '#fff3e0';
      case 'Aprobada': return 'rgba(18, 161, 82, 0.1)';
      case 'Entregada': return 'rgba(18, 161, 82, 0.2)';
      case 'Rechazada': return '#ffebee';
      default: return 'var(--gray-100)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'Pendiente': return '#ef6c00';
      case 'Aprobada': return 'var(--primary)';
      case 'Entregada': return '#0d7a3e';
      case 'Rechazada': return '#c62828';
      default: return 'var(--secondary)';
    }
  }};
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--gray-100);
  padding-bottom: 0.5rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${props => props.$active ? 'var(--primary)' : 'var(--secondary)'};
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &:after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--primary);
    transform: scaleX(${props => props.$active ? 1 : 0});
    transition: transform 0.2s;
  }

  &:hover {
    color: var(--primary);
  }
`;

// Imports consolidamos arriba

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function StationeryPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Pendiente');

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
    return permissionsArr.some((p: any) => p.modulo === modulo && p.accion === accion);
  };

  const currentUser = {
    nombre: profile ? `${profile.nombres} ${profile.apellidos}` : 'Cargando...',
    dependencia: profile?.dependencia || '...',
    cargo: profile?.cargo || '...'
  };

  // Fetch Inventory
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/inventario`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      // Filtrar solo items de papelería
      return data.filter((item: any) => item.categoria === 'Papelería' || item.bodegas?.nombre === 'Papelería');
    }
  });

  // Fetch Movements to calculate real stock
  const { data: movements = [] } = useQuery({
    queryKey: ['movements'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/movimientos?t=${Date.now()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Fetch Requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      console.log('Refetching requests...');
      const res = await fetch(`${API_URL}/solicitudes?t=${Date.now()}`);
      if (!res.ok) return [];
      const data = await res.json();
      console.log('Requests received:', Array.isArray(data) ? data.length : 0);
      return Array.isArray(data) ? data : [];
    }
  });

  // Asegurar que todas las variables de datos sean arreglos
  const inventoryArr = Array.isArray(inventory) ? inventory : [];
  const movementsArr = Array.isArray(movements) ? movements : [];
  const requestsArr = Array.isArray(requests) ? requests : [];
  const permissionsArr = Array.isArray(permissions) ? permissions : [];

  useEffect(() => {
    console.log('Estado actual de requests:', requests.map(r => ({ id: r.codigo, estado: r.estado })));
  }, [requests]);

  // Calculate dynamic stock
  const calculateStock = (itemId: string) => {
    return movementsArr
      .filter((m: any) => m.item_id === itemId)
      .reduce((acc: number, m: any) => {
        return m.tipo === 'Entrada' ? acc + m.cantidad : acc - m.cantidad;
      }, 0);
  };

  // Prepare available items with real stock
  const availableItemsWithStock = inventoryArr.map((item: any) => ({
    ...item,
    stock: calculateStock(item.id)
  }));

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: async (newData: any) => {
      const itemsSummary = newData.items.map((i: any) => `${i.nombre} (${i.cantidad})`).join(', ');

      const payload = {
        usuario_id: profile?.id, // ID del usuario logueado
        items: itemsSummary,
        itemsRaw: newData.items,
        prioridad: newData.priority,
        motivo: newData.justification
      };

      const res = await fetch(`${API_URL}/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar solicitud');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      setIsModalOpen(false);
    }
  });

  // Mutation for delivering
  const deliverMutation = useMutation({
    mutationFn: async (req: any) => {
      // Validación previa de stock (opcional aquí, ya que el backend lo hace con el trigger pero mejor avisar)
      // En un sistema real, se debería validar contra el stock actual del fetch de inventory

      const res = await fetch(`${API_URL}/solicitudes/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'Entregada',
          responsable_entrega: profile ? `${profile.nombres} ${profile.apellidos}`.trim() : 'Sistema'
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al procesar entrega');
      }
      return res.json();
    },
    onSuccess: () => {
      console.log('Entrega procesada, invalidando queries...');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      alert('¡Entrega procesada con éxito! La solicitud se ha movido a la pestaña de "Entregadas".');
    },
    onError: (error: any) => {
      alert(`Error al procesar: ${error.message}`);
    }
  });

  // Mutation for updating status (Approve/Reject)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string, estado: string }) => {
      const res = await fetch(`${API_URL}/solicitudes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });

  const handleSaveRequest = (data: any) => {
    saveMutation.mutate(data);
  };

  const handleDeliver = (req: any) => {
    // Si no hay itemsRaw, es una solicitud antigua
    if (!req.itemsRaw || !Array.isArray(req.itemsRaw)) {
      alert('Esta solicitud es antigua y no puede procesarse con el nuevo control estricto de inventario.');
      return;
    }

    // Validación local ESTRICTA
    const outOfStockItems = req.itemsRaw.filter((i: any) => {
      const invItem = inventory.find((si: any) => si.nombre === i.nombre);
      const stockActual = invItem ? calculateStock(invItem.id) : 0;
      return i.cantidad > stockActual;
    });

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map((i: any) => i.nombre).join(', ');
      alert(`ENTREGA BLOQUEADA: Existencias insuficientes para: ${itemNames}. Debe reabastecer el inventario antes de entregar.`);
      return;
    }

    deliverMutation.mutate(req);
  };

  return (
    <Container>
      <ModuleHeader>
        <TitleSection>
          <HeaderIconWrapper>
            <FileText size={24} />
          </HeaderIconWrapper>
          <Title>
            <h1>Solicitud de Papelería <span>v2.0</span></h1>
            <p>Gestión Institucional de Materiales y Suministros</p>
          </Title>
        </TitleSection>
        {isPermitted('papeleria', 'solicitar') && (
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Nueva Solicitud
          </PrimaryButton>
        )}
      </ModuleHeader>

      <StatsGrid>
        <StatCard>
          <HeaderIconWrapper style={{ background: '#fff3e0', color: '#ef6c00', width: 44, height: 44, borderRadius: 12 }}><Clock size={20} /></HeaderIconWrapper>
          <StatInfo>
            <StatValue>{requestsArr.filter(r => r.estado === 'Pendiente').length}</StatValue>
            <StatLabel>Pendientes</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <HeaderIconWrapper style={{ background: 'rgba(18, 161, 82, 0.1)', color: 'var(--primary)', width: 44, height: 44, borderRadius: 12 }}><CheckCircle size={20} /></HeaderIconWrapper>
          <StatInfo>
            <StatValue>{requestsArr.filter(r => r.estado === 'Aprobada').length}</StatValue>
            <StatLabel>Aprobadas</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <HeaderIconWrapper style={{ background: 'rgba(18, 161, 82, 0.2)', color: '#0d7a3e', width: 44, height: 44, borderRadius: 12 }}><AlertCircle size={20} /></HeaderIconWrapper>
          <StatInfo>
            <StatValue>{requestsArr.filter(r => r.estado === 'Entregada').length}</StatValue>
            <StatLabel>Entregadas</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <HeaderIconWrapper style={{ background: '#ffebee', color: '#c62828', width: 44, height: 44, borderRadius: 12 }}><XCircle size={20} /></HeaderIconWrapper>
          <StatInfo>
            <StatValue>{requestsArr.filter(r => r.estado === 'Rechazada').length}</StatValue>
            <StatLabel>Rechazadas</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <Tabs>
        {['Pendiente', 'Aprobada', 'Entregada', 'Rechazada', 'Todas'].map((tab) => (
          <Tab
            key={tab}
            $active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Tab>
        ))}
      </Tabs>

      <RequestsTable>
        <Table>
          <thead>
            <tr>
              <Th>ID Solicitud</Th>
              <Th>Artículos</Th>
              <Th>Prioridad</Th>
              <Th>Fecha</Th>
              <Th>SLA (Hrs)</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {requestsArr
              .filter((req: any) => activeTab === 'Todas' || req.estado === activeTab)
              .map((req: any) => (
                <tr key={req.id}>
                  <Td style={{ fontWeight: 600 }}>{req.codigo || req.id.substring(0, 8)}</Td>
                  <Td>
                    {typeof req.items === 'string'
                      ? req.items
                      : (Array.isArray(req.items)
                        ? req.items.map((i: any) => `${i.nombre} (${i.cantidad})`).join(', ')
                        : '---')}
                  </Td>
                  <Td>{req.prioridad}</Td>
                  <Td>{new Date(req.creado_at).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Td>
                  <Td style={{ fontWeight: 600, color: req.sla_horas > 24 ? '#c62828' : '#2e7d32' }}>
                    {req.sla_horas ? `${req.sla_horas}h` : '---'}
                  </Td>
                  <Td><StatusBadge $status={req.estado}>{req.estado}</StatusBadge></Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {req.estado === 'Pendiente' && isPermitted('papeleria', 'gestionar') && (
                        <>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: req.id, estado: 'Aprobada' })}
                            style={{
                              background: '#2e7d3220',
                              border: 'none',
                              color: '#2e7d32',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: req.id, estado: 'Rechazada' })}
                            style={{
                              background: '#c6282820',
                              border: 'none',
                              color: '#c62828',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Rechazar
                          </button>
                        </>
                      )}

                      {req.estado === 'Aprobada' && isPermitted('papeleria', 'gestionar') && (
                        <button
                          onClick={() => handleDeliver(req)}
                          style={{
                            background: '#0f9d5815',
                            border: 'none',
                            color: '#0f9d58',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <CheckCircle size={16} />
                          Entregar
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsDetailsModalOpen(true);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Detalles
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            {requestsArr.filter((req: any) => activeTab === 'Todas' || req.estado === activeTab).length === 0 && (
              <tr>
                <Td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)' }}>
                  <Inbox size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                  <p>No se encontraron solicitudes en "{activeTab}"</p>
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </RequestsTable>

      <RequestStationeryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRequest}
        availableItems={availableItemsWithStock}
        userProfile={currentUser}
      />
      <RequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        request={selectedRequest}
      />
    </Container >
  );
}
