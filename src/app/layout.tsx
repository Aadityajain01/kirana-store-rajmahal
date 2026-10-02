import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kirana Khata Pro | Rural Kirana Store Accounts Management',
  description: 'Production-ready accounts and khata ledger management software for rural kirana stores.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
