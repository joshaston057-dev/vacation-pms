import type { Metadata, Viewport } from 'next';
import HeaderNav from './components/HeaderNav';
import Footer from './components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'La Estancia Vacation Homes',
  description: 'Luxury Staycation Homes Made Effortless',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen flex flex-col antialiased">
        <HeaderNav />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}