import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'D&I Kozijnen ERP',
  description: 'Premium ERP voor klanten, productie, montage en voorraad'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
