"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Scissors, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Buscar perfil para redirigir correctamente
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "barbero") {
      const { data: barbero } = await supabase
        .from("barberos")
        .select("slug")
        .eq("id", data.user.id)
        .single();
      router.push(`/barbero/${barbero?.slug || data.user.id}/panel`);
    } else {
      router.push("/");
    }
  }

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "3rem", textDecoration: "none" }}>
          <Scissors size={18} color="var(--acid)" />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "var(--white)" }}>
            BARBER<span style={{ color: "var(--acid)" }}>.IT</span>
          </span>
        </Link>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.03em", color: "var(--white)", margin: "0 0 0.25rem" }}>
          BIENVENIDO
        </h1>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.9rem", letterSpacing: "0.1em", color: "var(--gray-light)", marginBottom: "2.5rem" }}>
          ¿No tienes cuenta?{" "}
          <Link href="/auth/registro" style={{ color: "var(--acid)", textDecoration: "none" }}>
            Regístrate
          </Link>
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Field label="CORREO" value={email} onChange={setEmail} type="email" placeholder="jovan@barber.it" required />
          <Field label="CONTRASEÑA" value={password} onChange={setPassword} type="password" placeholder="••••••••" required />

          {error && (
            <div style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", padding: "0.75rem 1rem" }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.85rem", color: "#ff6b6b", margin: 0 }}>
                {error === "Invalid login credentials" ? "Correo o contraseña incorrectos" : error}
              </p>
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
            {loading ? "ENTRANDO..." : (
              <>
                ENTRAR
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--gray)" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--gray-mid)" }}>O</span>
          <div style={{ flex: 1, height: "1px", background: "var(--gray)" }} />
        </div>

        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", letterSpacing: "0.1em", color: "var(--gray-mid)", textAlign: "center" }}>
          ¿Eres barbero aliado?{" "}
          <Link href="/auth/registro" style={{ color: "var(--acid)", textDecoration: "none" }}>
            Únete a la plataforma →
          </Link>
        </p>
      </div>
    </div>
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
