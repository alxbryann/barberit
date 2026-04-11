import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de barberos — Barber.it",
  description: "Elige tu barbero y reserva con flow.",
};

export default function BarberosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
