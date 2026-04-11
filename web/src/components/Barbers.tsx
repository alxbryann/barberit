"use client";
import { useState } from "react";
import { Share2 } from "lucide-react";

const barbers = [
  {
    id: 1,
    name: "MATEO VILLA",
    alias: "El Fino",
    specialty: "Fade · Diseños · Beard Sculpt",
    since: "2018",
    cuts: 3200,
    bg: "#1a1a1a",
    accent: "#CDFF00",
    initials: "MV",
  },
  {
    id: 2,
    name: "CARLOS REY",
    alias: "El Duque",
    specialty: "Skin Fade · Textures · Classic",
    since: "2019",
    cuts: 2800,
    bg: "#141414",
    accent: "#CDFF00",
    initials: "CR",
  },
  {
    id: 3,
    name: "ANDRÉS PAZ",
    alias: "El Calvo",
    specialty: "Afro · Twist · Creative Color",
    since: "2020",
    cuts: 2100,
    bg: "#161616",
    accent: "#CDFF00",
    initials: "AP",
  },
  {
    id: 4,
    name: "JUAN MORA",
    alias: "El Mago",
    specialty: "Mid Fade · Curls · Lineup",
    since: "2021",
    cuts: 1750,
    bg: "#131313",
    accent: "#CDFF00",
    initials: "JM",
  },
];

export default function Barbers() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id="barberos"
      style={{
        background: "var(--black)",
        padding: "7rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Marquee header */}
      <div
        style={{
          overflow: "hidden",
          borderTop: "1px solid var(--gray)",
          borderBottom: "1px solid var(--gray)",
          padding: "1rem 0",
          marginBottom: "5rem",
          background: "var(--dark2)",
        }}
      >
        <div
          className="marquee-track"
          style={{
            display: "flex",
            gap: "3rem",
            whiteSpace: "nowrap",
            width: "max-content",
          }}
        >
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                letterSpacing: "0.05em",
                color: i % 2 === 0 ? "var(--white)" : "var(--acid)",
              }}
            >
              LOS MÁS DUROS &nbsp;—&nbsp; BOGO &nbsp;★&nbsp;{" "}
            </span>
          ))}
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: "0 2.5rem", maxWidth: "1200px", margin: "0 auto 3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--acid)",
            }}
          >
            Nuestros barberos
          </span>
          <span
            style={{
              flex: 1,
              height: "1px",
              background: "var(--gray)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              color: "var(--gray-mid)",
            }}
          >
            {barbers.length} disponibles
          </span>
        </div>
      </div>

      {/* Barbers grid */}
      <div
        style={{
          padding: "0 2.5rem",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.5px",
          background: "var(--gray)",
        }}
        className="barbers-grid"
      >
        {barbers.map((b) => (
          <div
            key={b.id}
            onMouseEnter={() => setHovered(b.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === b.id ? "#1c1c1c" : "var(--black)",
              transition: "background 0.3s",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Photo placeholder */}
            <div
              style={{
                aspectRatio: "3/4",
                background: b.bg,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Initials big */}
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "8rem",
                  color: "rgba(255,255,255,0.04)",
                  userSelect: "none",
                  transition: "color 0.3s",
                }}
              >
                {b.initials}
              </span>

              {/* Grid pattern */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `linear-gradient(rgba(205,255,0,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(205,255,0,0.03) 1px, transparent 1px)`,
                  backgroundSize: "30px 30px",
                }}
              />

              {/* Hover overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(205,255,0,0.08)",
                  opacity: hovered === b.id ? 1 : 0,
                  transition: "opacity 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <a
                  href="#"
                  style={{
                    color: "var(--acid)",
                    opacity: hovered === b.id ? 1 : 0,
                    transition: "opacity 0.3s 0.1s, transform 0.3s",
                    transform: hovered === b.id ? "scale(1)" : "scale(0.8)",
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  <Share2 size={28} />
                </a>
              </div>

              {/* Cuts badge */}
              <div
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "var(--acid)",
                  padding: "0.2rem 0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    color: "var(--black)",
                  }}
                >
                  {b.cuts.toLocaleString()} cortes
                </span>
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: "1.25rem 1.25rem 1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.4rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.3rem",
                    letterSpacing: "0.04em",
                    color: "var(--white)",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {b.name}
                </h3>
              </div>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                  color: "var(--acid)",
                  display: "block",
                  marginBottom: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                &ldquo;{b.alias}&rdquo;
              </span>
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.78rem",
                  color: "var(--gray-light)",
                  margin: "0 0 1rem",
                  lineHeight: 1.4,
                }}
              >
                {b.specialty}
              </p>
              <a
                href="#reservar"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: hovered === b.id ? "var(--black)" : "var(--acid)",
                  background: hovered === b.id ? "var(--acid)" : "transparent",
                  border: "1px solid var(--acid)",
                  padding: "0.6rem",
                  textDecoration: "none",
                  transition: "background 0.25s, color 0.25s",
                }}
              >
                Reservar
              </a>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .barbers-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .barbers-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
