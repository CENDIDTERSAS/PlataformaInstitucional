'use client';

import React, { useEffect, Suspense, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HojaVidaReport from '@/components/biomedicos/HojaVidaReport';

const PageContainer = styled.div`
  background: #f1f5f9;
  min-height: 100vh;
  
  @media print {
    background: white;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding: 2rem 0;
  gap: 2rem;
  
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  @media print {
    display: block;
    overflow: visible;
    padding: 0;
    gap: 0;
  }
`;

const Slide = styled.div`
  flex: 0 0 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  scroll-snap-align: center;
  padding: 0 1rem;

  @media print {
    width: 100%;
    display: block;
    scroll-snap-align: none;
    padding: 0;
  }
`;

const NavButton = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  color: #1e293b;

  &:hover:not(:disabled) {
    background: #f8fafc;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const Counter = styled.div`
  background: #1e293b;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function MassivePrintContent() {
    const searchParams = useSearchParams();
    const ids = searchParams.get('ids')?.split(',') || [];
    const sliderRef = useRef<HTMLDivElement>(null);
    const [currentIdx, setCurrentIdx] = useState(0);

    // Fetch ONLY selected equipments
    const { data: selectedEquipos = [], isLoading: loadingEquipos } = useQuery({
        queryKey: ['equipos-biomedicos-batch', ids.join(',')],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/equipos?ids=${ids.join(',')}`);
            return res.json();
        },
        enabled: ids.length > 0
    });

    // Fetch ONLY maintenances for selected equipments
    const { data: batchMantenimientos = [], isLoading: loadingMantos } = useQuery({
        queryKey: ['mantenimientos-batch', ids.join(',')],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/mantenimientos?equipo_ids=${ids.join(',')}`);
            return res.json();
        },
        enabled: ids.length > 0
    });

    // Fetch ONLY contracts for selected equipments
    const { data: batchContratos = [], isLoading: loadingContratos } = useQuery({
        queryKey: ['contratos-biomedicos-batch', ids.join(',')],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/contratos-biomedicos?equipo_ids=${ids.join(',')}`);
            return res.json();
        },
        enabled: ids.length > 0
    });

    const isLoading = loadingEquipos || loadingMantos || loadingContratos;

    const handleScroll = () => {
        if (sliderRef.current) {
            const scrollLeft = sliderRef.current.scrollLeft;
            const width = sliderRef.current.offsetWidth;
            const newIdx = Math.round(scrollLeft / width);
            if (newIdx !== currentIdx) setCurrentIdx(newIdx);
        }
    };

    const goTo = (index: number) => {
        if (sliderRef.current) {
            const width = sliderRef.current.offsetWidth;
            sliderRef.current.scrollTo({
                left: index * width,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (!isLoading && ids.length > 0) {
            // Give a small timeout for images and styles to settle
            const timer = setTimeout(() => {
                window.print();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isLoading, ids.length]);

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Optimización: Descargando solo datos necesarios...</div>;
    if (ids.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No se han seleccionado equipos para imprimir.</div>;

    return (
        <PageContainer>
            <div className="no-print" style={{ textAlign: 'center', background: '#fff', padding: '1rem', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                    <NavButton onClick={() => goTo(currentIdx - 1)} disabled={currentIdx <= 0}>
                        <ChevronLeft size={24} />
                    </NavButton>

                    <Counter>Hoja {currentIdx + 1} de {selectedEquipos.length}</Counter>

                    <NavButton onClick={() => goTo(currentIdx + 1)} disabled={currentIdx >= selectedEquipos.length - 1}>
                        <ChevronRight size={24} />
                    </NavButton>
                </div>
            </div>

            <SliderContainer ref={sliderRef} onScroll={handleScroll}>
                {selectedEquipos.map((equipo: any) => {
                    const eqMantos = batchMantenimientos.filter((m: any) => m.equipo_id === equipo.id);
                    const eqContrato = batchContratos.find((c: any) => (c.equipo_id === equipo.id || !c.equipo_id) && c.estado === 'Activo');

                    return (
                        <Slide key={equipo.id}>
                            <HojaVidaReport
                                equipo={equipo}
                                mantenimientos={eqMantos}
                                contrato={eqContrato}
                            />
                        </Slide>
                    );
                })}
            </SliderContainer>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .si-es-fr-03-report {
                        margin: 0 !important;
                        page-break-after: always;
                    }
                }
            `}</style>
        </PageContainer>
    );
}

export default function MassivePrintPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <MassivePrintContent />
        </Suspense>
    );
}
