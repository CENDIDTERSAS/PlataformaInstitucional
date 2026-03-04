import type { Metadata } from 'next';
import DashboardLayoutClient from './layout.client';

export const metadata: Metadata = {
    title: 'Dashboard | Panel de Control',
    description: 'Accede a la gestión de inventario, proveedores y solicitudes de papelería en tiempo real.',
    robots: 'noindex, nofollow', // El dashboard no debería indexarse
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
