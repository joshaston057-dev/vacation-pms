import type { Metadata, Viewport } from 'next';
import './globals.css';

// Force desktop width on all devices
export const viewport: Viewport = {
  width: 1280, // Sets fixed desktop resolution width for mobile screens
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'La Estancia Vacation Homes - PMS',
  description: 'Property Management System for La Estancia Vacation Homes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-w-[1280px]">
        {children}
      </body>
    </html>
  );
}