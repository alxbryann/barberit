"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = ["Servicios", "Barberos", "Galería", "Contacto"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

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
        {links.map((l) => (
          <li key={l}>
            <a
              href={`#${l.toLowerCase()}`}
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
              {l}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="#reservar"
        className="hidden-mobile"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "0.8rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--black)",
          background: "var(--acid)",
          padding: "0.5rem 1.4rem",
          textDecoration: "none",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) =>
          ((e.target as HTMLElement).style.opacity = "0.85")
        }
        onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "1")}
      >
        Reservar
      </a>

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
            inset: 0,
            top: "64px",
            background: "var(--black)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2.5rem",
          }}
        >
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "3rem",
                color: "var(--white)",
                textDecoration: "none",
                letterSpacing: "0.05em",
              }}
            >
              {l}
            </a>
          ))}
          <a
            href="#reservar"
            onClick={() => setOpen(false)}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--black)",
              background: "var(--acid)",
              padding: "0.8rem 2.5rem",
              textDecoration: "none",
            }}
          >
            Reservar
          </a>
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
