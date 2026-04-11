"use client";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const navLinks: { label: string; href: string }[] = [
  { label: "Servicios", href: "/#servicios" },
  { label: "Barberos", href: "/barberos" },
  { label: "Galería", href: "#galería" },
  { label: "Contacto", href: "#contacto" },
];

type SessionUser = { nombre: string; role: string; barberoSlug?: string };

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSessionUser(null); setAuthReady(true); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre, role")
        .eq("id", user.id)
        .single();
      if (!profile) { setSessionUser(null); setAuthReady(true); return; }
      let barberoSlug: string | undefined;
      if (profile.role === "barbero") {
        const { data: b } = await supabase.from("barberos").select("slug").eq("id", user.id).single();
        barberoSlug = b?.slug;
      }
      setSessionUser({ nombre: profile.nombre, role: profile.role, barberoSlug });
      setAuthReady(true);
    }
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => loadUser());
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSessionUser(null);
    setOpen(false);
  }

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "0 2rem",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(8,8,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(205,255,0,0.08)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Logo */}
      <a href="#" style={{ textDecoration: "none" }}>
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.6rem",
            color: "var(--white)",
            letterSpacing: "0.06em",
          }}
        >
          BARBER<span style={{ color: "var(--acid)" }}>.IT</span>
        </span>
      </a>

      {/* Desktop links */}
      <ul
        style={{
          display: "flex",
          gap: "2.5rem",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
        className="hidden-mobile"
      >
        {navLinks.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.85rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--gray-light)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--acid)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--gray-light)")
              }
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Auth + CTA */}
      <div className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 180, justifyContent: "flex-end" }}>
        {!authReady ? null : sessionUser ? (
          <>
            {sessionUser.role === "barbero" && sessionUser.barberoSlug ? (
              <Link
                href={`/barbero/${sessionUser.barberoSlug}/panel`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gray-light)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <User size={14} color="var(--acid)" />
                {sessionUser.nombre.toUpperCase()}
              </Link>
            ) : (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gray-light)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <User size={14} color="var(--acid)" />
                {sessionUser.nombre.toUpperCase()}
              </span>
            )}
            <button
              onClick={handleLogout}
              style={{ background: "transparent", border: "1px solid var(--gray)", color: "var(--gray-light)", padding: "0.4rem 0.85rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem", transition: "all 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--acid)"; (e.currentTarget as HTMLElement).style.color = "var(--acid)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gray)"; (e.currentTarget as HTMLElement).style.color = "var(--gray-light)"; }}
            >
              <LogOut size={12} /> Salir
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gray-light)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--white)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--gray-light)")}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/registro"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--black)", background: "var(--acid)", padding: "0.5rem 1.4rem", textDecoration: "none", transition: "opacity 0.2s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "0.85")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "1")}
            >
              Registrarse
            </Link>
          </>
        )}
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          color: "var(--acid)",
          cursor: "pointer",
          display: "none",
        }}
        className="show-mobile"
        aria-label="Menu"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--black)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2.5rem",
            overflowY: "auto",
            zIndex: 999,
          }}
        >
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "3rem",
                color: "var(--white)",
                textDecoration: "none",
                letterSpacing: "0.05em",
              }}
            >
              {label}
            </Link>
          ))}
          {!authReady ? null : sessionUser ? (
            <>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "var(--acid)", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <User size={24} /> {sessionUser.nombre.toUpperCase()}
              </span>
              {sessionUser.role === "barbero" && sessionUser.barberoSlug && (
                <Link href={`/barbero/${sessionUser.barberoSlug}/panel`} onClick={() => setOpen(false)} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", color: "var(--white)", textDecoration: "none", letterSpacing: "0.05em" }}>
                  MI PANEL
                </Link>
              )}
              <button onClick={handleLogout} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--black)", background: "var(--acid)", padding: "0.8rem 2.5rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <LogOut size={16} /> CERRAR SESIÓN
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", color: "var(--gray-light)", textDecoration: "none", letterSpacing: "0.05em" }}>
                Iniciar sesión
              </Link>
              <Link href="/auth/registro" onClick={() => setOpen(false)} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--black)", background: "var(--acid)", padding: "0.8rem 2.5rem", textDecoration: "none" }}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
