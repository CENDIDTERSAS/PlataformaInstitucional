import type { Metadata, Viewport } from 'next';
import StyledComponentsRegistry from '@/lib/registry';
import { GlobalStyle } from '@/styles/GlobalStyle';
import QueryProvider from '@/lib/QueryProvider';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: {
        default: 'Plataforma Institucional | Gestión Digital',
        template: '%s | Plataforma Institucional'
    },
    description: 'Sistema integral de gestión institucional: proveedores, inventario, solicitudes de papelería y notificaciones en tiempo real.',
    keywords: ['gestión institucional', 'inventario digital', 'solicitudes de papelería', 'administración pública', 'plataforma educativa'],
    authors: [{ name: 'Departamento de TI' }],
    robots: 'index, follow',
    openGraph: {
        type: 'website',
        locale: 'es_CO',
        url: 'https://tu-dominio.com',
        title: 'Plataforma Institucional | Gestión Digital',
        description: 'Eficiencia y transparencia en la gestión de recursos institucionales.',
        siteName: 'Proyecto Institucional',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <QueryProvider>
                    <StyledComponentsRegistry>
                        <GlobalStyle />
                        {children}
                    </StyledComponentsRegistry>
                </QueryProvider>
            </body>
        </html>
    );
}
