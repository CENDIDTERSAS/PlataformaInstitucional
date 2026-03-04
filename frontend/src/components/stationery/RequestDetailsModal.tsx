'use client';

import React from 'react';
import styled from 'styled-components';
import { X, FileText, User, MapPin, Briefcase, Clock, AlertTriangle, Package } from 'lucide-react';
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
  border-radius: 24px;
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--gray-50);
  border-radius: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Value = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const ItemsList = styled.div`
  border: 1px solid var(--gray-100);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid var(--gray-100);
  &:last-child { border-bottom: none; }
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  background-color: ${props => {
        switch (props.$status) {
            case 'Pendiente': return '#ef6c0020';
            case 'Entregada': return '#0f9d5820';
            case 'Rechazada': return '#ea433520';
            default: return '#1a73e820';
        }
    }};
  color: ${props => {
        switch (props.$status) {
            case 'Pendiente': return '#ef6c00';
            case 'Entregada': return '#0f9d58';
            case 'Rechazada': return '#ea4335';
            default: return '#1a73e8';
        }
    }};
`;

const JustificationBox = styled.div`
  padding: 1.25rem;
  background: #fff8e1;
  border-left: 4px solid #ffc107;
  border-radius: 8px;
  color: #5d4037;
  font-style: italic;
  line-height: 1.5;
`;

interface RequestDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: any;
}

export default function RequestDetailsModal({ isOpen, onClose, request }: RequestDetailsModalProps) {
    if (!isOpen || !request) return null;

    const profile = request.perfiles || {};
    const itemsArray = Array.isArray(request.itemsRaw) ? request.itemsRaw : [];

    return (
        <AnimatePresence>
            <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <ModalContent
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <CloseButton onClick={onClose}><X size={24} /></CloseButton>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div>
                            <Label>Solicitud #</Label>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{request.codigo || request.id.substring(0, 8)}</h2>
                        </div>
                        <StatusBadge $status={request.estado}>{request.estado}</StatusBadge>
                    </div>

                    <SectionTitle>
                        <User size={20} color="var(--primary)" />
                        Información del Solicitante
                    </SectionTitle>
                    <InfoGrid>
                        <InfoItem>
                            <Label>Nombre Completo</Label>
                            <Value>{profile.nombres} {profile.apellidos}</Value>
                        </InfoItem>
                        <InfoItem>
                            <Label>Fecha de Solicitud</Label>
                            <Value><Clock size={16} /> {new Date(request.creado_at).toLocaleString()}</Value>
                        </InfoItem>
                        <InfoItem>
                            <Label>Dependencia</Label>
                            <Value><MapPin size={16} /> {profile.dependencia}</Value>
                        </InfoItem>
                        <InfoItem>
                            <Label>Cargo / Puesto</Label>
                            <Value><Briefcase size={16} /> {profile.cargo}</Value>
                        </InfoItem>
                    </InfoGrid>

                    <SectionTitle>
                        <Package size={20} color="var(--primary)" />
                        Artículos Solicitados
                    </SectionTitle>
                    <ItemsList>
                        {itemsArray.length > 0 ? (
                            itemsArray.map((item: any, idx: number) => (
                                <ItemRow key={idx}>
                                    <span style={{ fontWeight: 600 }}>{item.nombre}</span>
                                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>x{item.cantidad}</span>
                                </ItemRow>
                            ))
                        ) : (
                            <ItemRow>{request.items}</ItemRow>
                        )}
                    </ItemsList>

                    <SectionTitle>
                        <AlertTriangle size={20} color="#ffc107" />
                        Justificación y Prioridad
                    </SectionTitle>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <Label style={{ display: 'block', marginBottom: '0.5rem' }}>Prioridad: <span style={{ color: request.prioridad === 'Urgente' ? '#ea4335' : 'inherit' }}>{request.prioridad}</span></Label>
                        <JustificationBox>
                            "{request.motivo || 'No se proporcionó un motivo específico.'}"
                        </JustificationBox>
                    </div>
                </ModalContent>
            </Overlay>
        </AnimatePresence>
    );
}
