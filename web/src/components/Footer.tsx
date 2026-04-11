"use client";
import { Share2, MapPin, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--dark2)",
        borderTop: "1px solid var(--gray)",
        padding: "4rem 2.5rem 2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "3rem",
          marginBottom: "3rem",
        }}
        className="footer-grid"
      >
        {/* Brand */}
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "2.5rem",
              letterSpacing: "0.05em",
              color: "var(--white)",
              marginBottom: "1rem",
              lineHeight: 1,
            }}
          >
            BARBER<span style={{ color: "var(--acid)" }}>.IT</span>
          </div>
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: "0.9rem",
              lineHeight: 1.7,
              color: "var(--gray-light)",
              maxWidth: "280px",
              margin: "0 0 1.5rem",
            }}
          >
            La barbería que entiende la calle. Bogotá de corazón, cortes con
            identidad.
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <a
              href="#"
              style={{
                width: "36px",
                height: "36px",
                border: "1px solid var(--gray)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--gray-light)",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--acid)";
                el.style.color = "var(--acid)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--gray)";
                el.style.color = "var(--gray-light)";
              }}
            >
              <Share2 size={16} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--acid)",
              marginBottom: "1.5rem",
            }}
          >
            Links
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {["Servicios", "Barberos", "Galería", "Reservar"].map((l) => (
              <li key={l}>
                <a
                  href={`#${l.toLowerCase()}`}
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "0.9rem",
                    color: "var(--gray-light)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = "var(--white)")
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
        </div>

        {/* Info */}
        <div>
          <h4
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--acid)",
              marginBottom: "1.5rem",
            }}
          >
            Dónde
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <MapPin size={14} style={{ color: "var(--acid)", marginTop: "3px", flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.85rem",
                  color: "var(--gray-light)",
                  lineHeight: 1.5,
                }}
              >
                Cra 15 #93-75<br />Bogotá, Colombia
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <Clock size={14} style={{ color: "var(--acid)", marginTop: "3px", flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.85rem",
                  color: "var(--gray-light)",
                  lineHeight: 1.5,
                }}
              >
                Lun–Sáb: 9am – 8pm<br />Dom: 10am – 5pm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div
        style={{
          borderTop: "1px solid var(--gray)",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.75rem",
            color: "var(--gray-mid)",
          }}
        >
          © 2025 Barber.it — Todos los derechos reservados.
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            color: "var(--gray-mid)",
          }}
        >
          Hecho en{" "}
          <span style={{ color: "var(--acid)" }}>Bogotá 🇨🇴</span>
        </span>
      </div>

      <style>{`
        .footer-grid {
          grid-template-columns: 2fr 1fr 1fr;
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
