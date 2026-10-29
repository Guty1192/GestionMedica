import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ClinicProvider } from '@/lib/supabase/clinicContext';
import { SecurityProvider } from '@/lib/security/securityContext';
import { ModalCentroSeguridad } from '@/components/security/ModalCentroSeguridad';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'C&C SALUD • Centro Médico Especializado | Callao',
  description:
    'Sistema Integral de Gestión Clínica de C&C Salud (Callao). Consulta General, Ginecología, Ecografía con informes en PDF y Ozonoterapia. Dr. Henry Castañeda Aponte.',
  icons: {
    icon: '/brand/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#f4f7fb] text-slate-800 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
        <SecurityProvider>
          <ClinicProvider>
            <div className="flex min-h-screen bg-[#f4f7fb]">
              {/* Left Nav */}
              <Sidebar />

              {/* Main Area */}
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-3.5 sm:p-4.5 overflow-y-auto bg-[#f4f7fb] text-slate-800 transition-colors">
                  {children}
                </main>
              </div>
            </div>

            {/* Modal de Centro de Ciberseguridad y Agentes */}
            <ModalCentroSeguridad />
          </ClinicProvider>
        </SecurityProvider>
      </body>
    </html>
  );
}
