"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Scissors, ChevronRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") ?? "/";
  const redirectTo = rawRedirect.startsWith("http") ? new URL(rawRedirect).pathname : rawRedirect;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setError("");
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

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
        .maybeSingle();
      if (!barbero?.slug) {
        setError(
          "Tu cuenta no tiene perfil de barbero guardado. Confirma el correo si aplica y vuelve a intentar; si sigue igual, revisa en Supabase que exista la fila en barberos y que las políticas permitan leerla."
        );
        setLoading(false);
        return;
      }
      router.push(`/barbero/${barbero.slug}/panel`);
    } else {
      router.push(redirectTo);
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
          <Link href={`/auth/registro${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} style={{ color: "var(--acid)", textDecoration: "none" }}>
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

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            background: "transparent",
            color: "var(--white)",
            border: "1px solid var(--gray)",
            padding: "1rem",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "1rem",
            letterSpacing: "0.12em",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            transition: "border-color 0.2s",
            marginBottom: "1.5rem",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--acid)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--gray)")}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          CONTINUAR CON GOOGLE
        </button>

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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
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
