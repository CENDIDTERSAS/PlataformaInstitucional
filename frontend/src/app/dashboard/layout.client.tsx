'use client';

import React from 'react';
import styled from 'styled-components';
import Sidebar from '@/components/layout/Sidebar';

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--background);
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding-left: 280px;

  @media (max-width: 1024px) {
    padding-left: 0;
  }
`;

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LayoutWrapper>
            <Sidebar />
            <MainContent>
                {children}
            </MainContent>
        </LayoutWrapper>
    );
}
