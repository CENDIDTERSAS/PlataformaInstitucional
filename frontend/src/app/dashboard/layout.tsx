import type { Metadata } from 'next';
import DashboardLayoutClient from './layout.client';

// Fuerza renderizado dinámico en todas las páginas del dashboard
// para evitar errores de pre-rendering en Vercel (Supabase requiere variables de entorno en runtime)
export const dynamic = 'force-dynamic';

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
