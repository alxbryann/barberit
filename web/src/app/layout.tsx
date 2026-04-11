import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barber.it — Cortes Con Calle",
  description: "La barbería más dura de Bogotá. Cortes con identidad, estilo y calle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
