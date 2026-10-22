import type { Metadata, Viewport } from 'next';
import HeaderNav from './components/HeaderNav'; // or '../components/HeaderNav' based on location
import './globals.css';

export const metadata: Metadata = {
  title: 'La Estancia Vacation Homes',
  description: 'Luxury Staycation Homes & Short-Stay Property Management',
};

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
      <body className="bg-slate-950 text-white min-h-screen flex flex-col min-w-[1280px]">
        <HeaderNav />
        <main className="flex-1 min-w-[1280px]">{children}</main>
      </body>
    </html>
  );
}