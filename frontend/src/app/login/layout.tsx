import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Iniciar Sesión',
    description: 'Accede a la plataforma institucional para gestionar proveedores e inventarios de manera segura.',
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
