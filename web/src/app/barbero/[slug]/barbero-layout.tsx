"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Scissors, LayoutDashboard, UserPen, ExternalLink, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BarberLayoutProps {
  slug: string;
  children: React.ReactNode;
}

const NAV = [
  {
    key: "panel",
    label: "MI AGENDA",
    sub: "Citas del día",
    icon: LayoutDashboard,
    href: (slug: string) => `/barbero/${slug}/panel`,
  },
  {
    key: "editar",
    label: "MI PERFIL",
    sub: "Editar información",
    icon: UserPen,
    href: (slug: string) => `/barbero/${slug}/editar`,
  },
];

export default function BarberLayout({ slug, children }: BarberLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [nombreBarbero, setNombreBarbero] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function fetchNombre() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("barberos")
        .select("nombre_barberia, profiles(nombre)")
        .eq("id", user.id)
        .maybeSingle();
      const b = data as { nombre_barberia: string | null; profiles: { nombre: string } | null } | null;
      if (b) setNombreBarbero(b.nombre_barberia?.trim() || b.profiles?.nombre?.trim() || slug);
    }
    fetchNombre();
  }, [slug]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const activeKey = pathname.includes("/editar") ? "editar" : "panel";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--black)", color: "var(--white)" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside
        className={`barber-sidebar${mobileOpen ? " sidebar-open" : ""}`}
        style={{
          width: 240,
          minHeight: "100vh",
          background: "#0a0a0a",
          borderRight: "1px solid var(--gray)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 200,
          transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "1.5rem 1.25rem 1.25rem", borderBottom: "1px solid var(--gray)" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <Scissors size={16} color="var(--acid)" />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.1em", color: "var(--white)" }}>
              BARBER<span style={{ color: "var(--acid)" }}>.IT</span>
            </span>
          </Link>
          <div style={{ marginTop: "0.9rem", paddingTop: "0.9rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.8rem", letterSpacing: "0.15em", color: "var(--acid)", marginBottom: "0.15rem" }}>
              BARBERO
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", fontWeight: 600, color: "var(--white)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {nombreBarbero || slug}
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: "1rem 0", flex: 1 }}>
          {NAV.map(({ key, label, sub, icon: Icon, href }) => {
            const active = activeKey === key;
            return (
              <Link
                key={key}
                href={href(slug)}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  padding: "0.85rem 1.25rem",
                  textDecoration: "none",
                  position: "relative",
                  background: active ? "rgba(205,255,0,0.07)" : "transparent",
                  borderLeft: `3px solid ${active ? "var(--acid)" : "transparent"}`,
                  transition: "all 0.15s",
                  marginBottom: "0.1rem",
                }}
              >
                <Icon
                  size={18}
                  color={active ? "var(--acid)" : "var(--gray-mid)"}
                  strokeWidth={active ? 2 : 1.5}
                />
                <div>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "0.95rem",
                    letterSpacing: "0.1em",
                    color: active ? "var(--acid)" : "var(--white)",
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    color: "var(--gray-mid)",
                    marginTop: "0.05rem",
                  }}>
                    {sub}
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Ver perfil público */}
          <a
            href={`/barbero/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
              padding: "0.85rem 1.25rem",
              textDecoration: "none",
              borderLeft: "3px solid transparent",
              marginTop: "0.5rem",
            }}
          >
            <ExternalLink size={16} color="var(--gray-mid)" strokeWidth={1.5} />
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", letterSpacing: "0.1em", color: "var(--gray-light)" }}>
                VER PERFIL
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", color: "var(--gray-mid)" }}>
                Vista del cliente
              </div>
            </div>
          </a>
        </nav>

        {/* Logout */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--gray)" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "none",
              border: "1px solid var(--gray)",
              color: "var(--gray-light)",
              padding: "0.6rem 1rem",
              width: "100%",
              cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#ff6b6b";
              (e.currentTarget as HTMLElement).style.color = "#ff6b6b";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--gray)";
              (e.currentTarget as HTMLElement).style.color = "var(--gray-light)";
            }}
          >
            <LogOut size={13} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 190 }}
        />
      )}

      {/* ── MOBILE TOPBAR ───────────────────────────────────────── */}
      <div className="barber-topbar" style={{
        display: "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        background: "#0a0a0a",
        borderBottom: "1px solid var(--gray)",
        padding: "0.85rem 1.25rem",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Scissors size={14} color="var(--acid)" />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em" }}>
            BARBER<span style={{ color: "var(--acid)" }}>.IT</span>
          </span>
          <span style={{ color: "var(--gray)", margin: "0 0.25rem" }}>·</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.85rem", color: "var(--gray-light)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {activeKey === "panel" ? "MI AGENDA" : "MI PERFIL"}
          </span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          style={{ background: "none", border: "none", color: "var(--white)", cursor: "pointer", padding: "0.25rem", display: "flex" }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <main style={{ flex: 1, marginLeft: 240, minHeight: "100vh" }} className="barber-main">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .barber-sidebar {
            transform: translateX(-100%);
          }
          .barber-sidebar.sidebar-open {
            transform: translateX(0);
          }
          .barber-topbar {
            display: flex !important;
          }
          .barber-main {
            margin-left: 0 !important;
            padding-top: 56px;
          }
        }
      `}</style>
    </div>
  );
}
