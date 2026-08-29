import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIS IA Client Intelligence Dashboard",
  description: "Panel de inteligencia de negocio VIS IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
