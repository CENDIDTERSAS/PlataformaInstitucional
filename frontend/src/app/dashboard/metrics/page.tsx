'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    Users,
    Package,
    Bell,
    TrendingUp,
    AlertCircle,
    FileText
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const Container = styled.div`
  padding: 2.5rem;
`;

const WelcomeHeader = styled.div`
  margin-bottom: 2.5rem;
`;

const Greeting = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #1a1f36;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #697386;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled(motion.div) <{ $color: string }>`
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid #e3e8ee;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  .icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background-color: ${props => props.$color}15;
    color: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const StatInfo = styled.div`
  .label {
    font-size: 0.9rem;
    color: #697386;
    margin-bottom: 0.2rem;
  }
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1f36;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1f36;
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MetricsPage() {
    // Fetch Proveedores count
    const { data: proveedores = [] } = useQuery({
        queryKey: ['proveedores-count'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/proveedores`);
            return res.json();
        }
    });

    // Fetch Inventory (Total Products)
    const { data: products = [] } = useQuery({
        queryKey: ['products-count'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/inventario`);
            return res.json();
        }
    });

    // Fetch User info
    const { data: profile } = useQuery({
        queryKey: ['my-profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const res = await fetch(`${API_URL}/profile/${user.id}`);
            return res.json();
        }
    });

    const stats = [
        {
            label: 'Proveedores Registrados',
            value: proveedores.length,
            icon: <Users size={28} />,
            color: '#1a73e8'
        },
        {
            label: 'Productos en Catálogo',
            value: products.length,
            icon: <Package size={28} />,
            color: '#34a853'
        },
        {
            label: 'Alertas de Stock',
            value: '2', // Placeholder o lógica real si existe
            icon: <AlertCircle size={28} />,
            color: '#ea4335'
        },
        {
            label: 'Movimientos del Mes',
            value: '14', // Placeholder
            icon: <TrendingUp size={28} />,
            color: '#f4b400'
        }
    ];

    return (
        <Container>
            <WelcomeHeader>
                <Greeting>¡Hola, {profile?.nombres || 'Usuario'}!</Greeting>
                <Subtitle>Aquí tienes un resumen de la gestión institucional hoy.</Subtitle>
            </WelcomeHeader>

            <SectionHeader>
                <SectionTitle>Estadísticas Generales</SectionTitle>
            </SectionHeader>

            <StatsGrid>
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        $color={stat.color}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="icon">
                            {stat.icon}
                        </div>
                        <StatInfo>
                            <div className="label">{stat.label}</div>
                            <div className="value">{stat.value}</div>
                        </StatInfo>
                    </StatCard>
                ))}
            </StatsGrid>

            <SectionHeader>
                <SectionTitle>Actividad Reciente</SectionTitle>
            </SectionHeader>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid #e3e8ee', color: '#697386', textAlign: 'center' }}>
                <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Próximamente: Gráficas de consumo y reportes detallados en tiempo real.</p>
            </div>
        </Container>
    );
}
