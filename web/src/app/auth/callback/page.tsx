"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Scissors } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase maneja el token del URL automáticamente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const userId = session.user.id;
      const meta = session.user.user_metadata;

      // Asegurar que el perfil existe (por si el trigger no disparó)
      await supabase.from("profiles").upsert({
        id: userId,
        role: meta.role ?? "cliente",
        nombre: meta.nombre ?? session.user.email,
        telefono: meta.telefono ?? null,
      });

      if (meta.role === "barbero") {
        const slugFinal = meta.slug ?? userId;
        await supabase.from("barberos").upsert({
          id: userId,
          slug: slugFinal,
        });
        router.push(`/barbero/${slugFinal}/panel`);
      } else {
        router.push("/");
      }
    });
  }, [router]);

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Scissors size={18} color="var(--acid)" />
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "var(--white)" }}>
          BARBER<span style={{ color: "var(--acid)" }}>.IT</span>
        </span>
      </div>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.9rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gray-light)" }}>
        Verificando cuenta...
      </p>
    </div>
  );
}
