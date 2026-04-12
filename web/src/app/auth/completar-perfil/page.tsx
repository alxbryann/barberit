"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Scissors, User, ChevronRight } from "lucide-react";

type Role = "cliente" | "barbero";

function CompletarPerfilForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<Role>("cliente");
  const [nombre, setNombre] = useState(searchParams.get("nombre") ?? "");
  const [telefono, setTelefono] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si no hay sesión activa, redirigir al login
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/auth/login");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const userId = session.user.id;
    const slugFinal = slug || nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { error: profileErr } = await supabase.from("profiles").upsert({
      id: userId,
      role,
      nombre,
      telefono: telefono || null,
    });

    if (profileErr) {
      setError(profileErr.message);
      setLoading(false);
      return;
    }

    if (role === "barbero") {
      const { error: barberErr } = await supabase.from("barberos").upsert({
        id: userId,
        slug: slugFinal,
      });
      if (barberErr) {
        setError(barberErr.message);
        setLoading(false);
        return;
      }
      router.push(`/barbero/${slugFinal}/panel`);
    } else {
      router.push("/");
    }
  }

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "3rem", textDecoration: "none" }}>
          <Scissors size={18} color="var(--acid)" />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "var(--white)" }}>
            BARBER<span style={{ color: "var(--acid)" }}>.IT</span>
          </span>
        </Link>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.03em", color: "var(--white)", margin: "0 0 0.25rem" }}>
          UN PASO MÁS
        </h1>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.9rem", letterSpacing: "0.1em", color: "var(--gray-light)", marginBottom: "2.5rem" }}>
          Completa tu perfil para continuar
        </p>

        {/* Role selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
          {(["cliente", "barbero"] as Role[]).map((r) => {
            const active = role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  background: active ? "var(--acid)" : "var(--dark2)",
                  border: active ? "none" : "1px solid var(--gray)",
                  padding: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s",
                }}
              >
                {r === "barbero" ? (
                  <Scissors size={22} color={active ? "var(--black)" : "var(--acid)"} />
                ) : (
                  <User size={22} color={active ? "var(--black)" : "var(--acid)"} />
                )}
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", color: active ? "var(--black)" : "var(--white)" }}>
                  {r === "barbero" ? "SOY BARBERO" : "SOY CLIENTE"}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: active ? "rgba(0,0,0,0.55)" : "var(--gray-light)", textAlign: "center" }}>
                  {r === "barbero" ? "Aliado de la plataforma" : "Quiero reservar"}
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Field label="NOMBRE COMPLETO" value={nombre} onChange={setNombre} placeholder="Jovan Rivera" required />
          <Field label="TELÉFONO" value={telefono} onChange={setTelefono} type="tel" placeholder="+57 300 000 0000" />

          {role === "barbero" && (
            <div>
              <Field
                label="URL DE TU PERFIL"
                value={slug}
                onChange={(v) => setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                placeholder="jovan-rivera"
              />
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--gray-light)", marginTop: "0.4rem" }}>
                Tu perfil quedará en: barber.it/barbero/{slug || nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "tu-nombre"}
              </p>
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", padding: "0.75rem 1rem" }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.85rem", color: "#ff6b6b", margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "var(--gray)" : "var(--acid)",
              color: loading ? "var(--gray-mid)" : "var(--black)",
              border: "none",
              padding: "1.1rem",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.15rem",
              letterSpacing: "0.15em",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "0.5rem",
              transition: "all 0.2s",
            }}
          >
            {loading ? "GUARDANDO..." : (
              <>
                CONTINUAR
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CompletarPerfilPage() {
  return (
    <Suspense>
      <CompletarPerfilForm />
    </Suspense>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gray-light)", marginBottom: "0.4rem" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          background: "var(--dark2)",
          border: "1px solid var(--gray)",
          padding: "0.85rem 1rem",
          color: "var(--white)",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "1rem",
          letterSpacing: "0.05em",
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--acid)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--gray)")}
      />
    </div>
  );
}
