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

      // Verificar si ya tiene perfil
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (existingProfile) {
        // Ya completó el perfil antes — redirigir según rol
        if (existingProfile.role === "barbero") {
          const { data: barbero } = await supabase
            .from("barberos")
            .select("slug")
            .eq("id", userId)
            .maybeSingle();
          router.push(`/barbero/${barbero?.slug ?? userId}/panel`);
        } else {
          router.push("/");
        }
        return;
      }

      // Usuario nuevo via OAuth — completar perfil
      const nombreGoogle = meta.full_name ?? meta.name ?? "";
      const params = new URLSearchParams({ nombre: nombreGoogle });
      router.push(`/auth/completar-perfil?${params.toString()}`);
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
