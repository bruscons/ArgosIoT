// app/layout.tsx
// Layout principal da aplicação Argos

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Argos - Sistema de Controle de Acesso',
  description: 'Sistema de controle de acesso para estações de trem - IoTrain',
  keywords: ['controle de acesso', 'RFID', 'IoT', 'dashboard'],
  authors: [{ name: 'IoTrain' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
