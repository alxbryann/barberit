import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de barberos — Barber.it",
  description: "Elegí a tu barbero y reservá con flow.",
};

export default function BarberosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
