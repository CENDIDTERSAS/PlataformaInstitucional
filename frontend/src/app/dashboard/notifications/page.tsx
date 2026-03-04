'use client';

import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Package,
    FileText,
    Move,
    LogIn,
    AlertCircle,
    Inbox
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const Container = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--gray-100);
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: var(--primary);
    transform: translateX(5px);
  }
`;

const NotifContent = styled.div`
  flex: 1;
`;

const NotifHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const NotifTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
`;

const NotifTime = styled.span`
  font-size: 0.85rem;
  color: var(--secondary);
`;

const NotifMessage = styled.p`
  color: var(--secondary);
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  position: relative;
`;

export default function NotificationsPage() {
    const [selectedNotif, setSelectedNotif] = React.useState<any>(null);
    const queryClient = useQueryClient();

    // 1. Obtener perfil para el filtrado
    const { data: profile } = useQuery({
        queryKey: ['my-profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const res = await fetch(`${API_URL}/profile/${user.id}`);
            return res.json();
        }
    });

    // Mutación para marcar como leídas
    const markAsReadMutation = useMutation({
        mutationFn: async (userId: string) => {
            await fetch(`${API_URL}/profile/${userId}/read-notifications`, {
                method: 'PATCH'
            });
        },
        onSuccess: () => {
            // Invalidar perfil para que el sidebar sepa que ya se vio
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
        }
    });

    // Marcar como leídas al entrar
    React.useEffect(() => {
        if (profile?.id) {
            markAsReadMutation.mutate(profile.id);
        }
    }, [profile?.id]);

    // 2. Obtener notificaciones
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications', profile?.rol, profile?.dependencia],
        queryFn: async () => {
            if (!profile) return [];
            const res = await fetch(`${API_URL}/notifications?rol=${profile.rol}&dependencia=${profile.dependencia}`);
            return res.json();
        },
        enabled: !!profile
    });

    // 3. Realtime suscripción
    React.useEffect(() => {
        const channel = supabase
            .channel('notificaciones-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notificaciones' },
                () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'S_PAPELERIA': return { icon: <FileText size={20} />, color: '#ef6c00' };
            case 'C_PRODUCTO': return { icon: <Package size={20} />, color: '#12A152' };
            case 'M_INVENTARIO': return { icon: <Move size={20} />, color: '#0f9d58' };
            case 'LOGIN': return { icon: <LogIn size={20} />, color: '#673ab7' };
            case 'Alerta': return { icon: <AlertCircle size={20} />, color: '#12A152' };
            default: return { icon: <Bell size={20} />, color: '#607d8b' };
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('es-CO', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) return <Container>Cargando notificaciones...</Container>;

    return (
        <Container>
            <Header>
                <IconWrapper $color="var(--primary)">
                    <Bell size={24} />
                </IconWrapper>
                <Title>Notificaciones</Title>
            </Header>

            <NotificationList>
                <AnimatePresence>
                    {notifications.length > 0 ? (
                        notifications.map((notif: any) => {
                            const { icon, color } = getIcon(notif.tipo);
                            return (
                                <NotificationCard
                                    key={notif.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onClick={() => setSelectedNotif(notif)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <IconWrapper $color={color}>
                                        {icon}
                                    </IconWrapper>
                                    <NotifContent>
                                        <NotifHeader>
                                            <NotifTitle>{notif.titulo}</NotifTitle>
                                            <NotifTime>{formatTime(notif.creado_at)}</NotifTime>
                                        </NotifHeader>
                                        <NotifMessage>{notif.mensaje}</NotifMessage>
                                    </NotifContent>
                                </NotificationCard>
                            );
                        })
                    ) : (
                        <EmptyState>
                            <Inbox size={48} strokeWidth={1} />
                            <p>No tienes notificaciones pendientes.</p>
                        </EmptyState>
                    )}
                </AnimatePresence>
            </NotificationList>
            <AnimatePresence>
                {selectedNotif && (
                    <Overlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedNotif(null)}
                    >
                        <Modal
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <IconWrapper $color={getIcon(selectedNotif.tipo).color}>
                                    {getIcon(selectedNotif.tipo).icon}
                                </IconWrapper>
                                <h2 style={{ fontSize: '1.25rem' }}>{selectedNotif.titulo}</h2>
                            </div>
                            <p style={{ color: 'var(--secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                                {selectedNotif.mensaje}
                            </p>
                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)', borderTop: '1px solid var(--gray-100)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                                Fecha: {new Date(selectedNotif.creado_at).toLocaleString('es-CO')}
                            </div>
                            <button
                                onClick={() => setSelectedNotif(null)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cerrar
                            </button>
                        </Modal>
                    </Overlay>
                )}
            </AnimatePresence>
        </Container>
    );
}
