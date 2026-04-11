"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Scissors, User, ChevronRight } from "lucide-react";

type Role = "cliente" | "barbero";

export default function RegistroPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("cliente");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [slugFinalSent, setSlugFinalSent] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const slugFinal = slug || nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          role,
          telefono,
          ...(role === "barbero" ? { slug: slugFinal } : {}),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Sin confirmación de email — sesión activa de inmediato
    if (signUpData.session && signUpData.user) {
      const userId = signUpData.user.id;

      await supabase.from("profiles").upsert({
        id: userId,
        role,
        nombre,
        telefono,
      });

      if (role === "barbero") {
        await supabase.from("barberos").upsert({
          id: userId,
          slug: slugFinal,
        });
        router.push(`/barbero/${slugFinal}/panel`);
      } else {
        router.push("/");
      }
    } else {
      // Fallback: si por alguna razón no hay sesión
      setError("Ocurrió un error. Intenta iniciar sesión.");
      setLoading(false);
    }
  }

  // ── Pantalla: revisa tu correo ──────────────────────────────────────────────
  if (emailSent) {
    return (
      <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "3rem", textDecoration: "none", justifyContent: "center" }}>
            <Scissors size={18} color="var(--acid)" />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "var(--white)" }}>
              BARBER<span style={{ color: "var(--acid)" }}>.IT</span>
            </span>
          </Link>

          {/* Icono */}
          <div style={{ width: 72, height: 72, borderRadius: "50%", border: "2px solid var(--acid)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
            <span style={{ fontSize: "2rem" }}>✉️</span>
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.03em", color: "var(--white)", margin: "0 0 1rem", lineHeight: 1 }}>
            REVISA TU<br /><span style={{ color: "var(--acid)" }}>CORREO</span>
          </h1>

          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", letterSpacing: "0.05em", color: "var(--gray-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
            Te enviamos un link de confirmación a<br />
            <strong style={{ color: "var(--white)" }}>{email}</strong>
            <br /><br />
            {role === "barbero"
              ? <>Después de confirmar, inicia sesión y tu perfil estará en <strong style={{ color: "var(--acid)" }}>barber.it/barbero/{slugFinalSent}</strong></>
              : "Después de confirmar tu correo, ya puedes iniciar sesión y reservar."
            }
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              href="/auth/login"
              style={{ display: "block", background: "var(--acid)", color: "var(--black)", padding: "1rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.15em", textDecoration: "none", textAlign: "center" }}
            >
              IR A INICIAR SESIÓN
            </Link>
            <button
              onClick={() => setEmailSent(false)}
              style={{ background: "transparent", border: "1px solid var(--gray)", color: "var(--gray-light)", padding: "0.85rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Volver al registro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "3rem", textDecoration: "none" }}>
          <Scissors size={18} color="var(--acid)" />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "var(--white)" }}>
            BARBER<span style={{ color: "var(--acid)" }}>.IT</span>
          </span>
        </Link>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.03em", color: "var(--white)", margin: "0 0 0.25rem" }}>
          CREAR CUENTA
        </h1>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.9rem", letterSpacing: "0.1em", color: "var(--gray-light)", marginBottom: "2.5rem" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" style={{ color: "var(--acid)", textDecoration: "none" }}>
            Inicia sesión
          </Link>
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
          <Field label="CORREO" value={email} onChange={setEmail} type="email" placeholder="jovan@barber.it" required />
          <Field label="TELÉFONO" value={telefono} onChange={setTelefono} type="tel" placeholder="+57 300 000 0000" />
          <Field label="CONTRASEÑA" value={password} onChange={setPassword} type="password" placeholder="••••••••" required />

          {role === "barbero" && (
            <div>
              <Field
                label="URL DE TU PERFIL"
                value={slug}
                onChange={(v) => setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                placeholder="jovan-rivera"
              />
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--gray-light)", marginTop: "0.4rem" }}>
                Tu perfil quedará en: barber.it/barbero/{slug || "tu-nombre"}
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
            {loading ? "CREANDO CUENTA..." : (
              <>
                {role === "barbero" ? "CREAR MI PERFIL DE BARBERO" : "CREAR CUENTA"}
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>
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
