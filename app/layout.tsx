import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Estancia Vacation Homes | Curated Stays in Uganda",
  description: "Explore luxury apartments, standalone houses, mansions, and villas across Uganda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}