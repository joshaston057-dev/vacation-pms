import type { Metadata, Viewport } from 'next';
import HeaderNav from './components/HeaderNav'; // Adjust path if it's in ../components/HeaderNav
import './globals.css';

export const metadata: Metadata = {
  title: 'La Estancia Vacation Homes',
  description: 'Luxury Staycation Homes Made Effortless',
};

// This forces mobile browsers to render the full 1280px desktop layout
export const viewport: Viewport = {
  width: '1280',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen flex flex-col">
        <HeaderNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}