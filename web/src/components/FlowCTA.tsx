"use client";

import Link from "next/link";

export default function FlowCTA() {
  return (
    <section
      id="reservar"
      style={{
        background: "var(--acid)",
        position: "relative",
        overflow: "hidden",
        padding: "8rem 2.5rem",
      }}
    >
      {/* Big bg text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(10rem, 28vw, 28rem)",
            color: "rgba(0,0,0,0.06)",
            lineHeight: 0.85,
            whiteSpace: "nowrap",
          }}
        >
          FLOW
        </span>
      </div>

      {/* Diagonal stripe decoration */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "35%",
          height: "100%",
          background: "rgba(0,0,0,0.08)",
          clipPath: "polygon(0 0, 75% 0, 55% 100%, 0 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "25%",
          height: "100%",
          background: "rgba(0,0,0,0.06)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: "3rem",
        }}
        className="flow-grid"
      >
        {/* Text */}
        <div>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.45)",
              display: "block",
              marginBottom: "1rem",
            }}
          >
            #BOGOTA
          </span>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(4rem, 10vw, 9rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.01em",
              color: "var(--black)",
              margin: "0 0 1.5rem",
            }}
          >
            LLEVA
            <br />
            EL FLOW.
          </h2>
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 400,
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: "rgba(0,0,0,0.6)",
              maxWidth: "400px",
              margin: 0,
            }}
          >
            No se trata solo de un corte. Se trata de cómo salís de la silla.
            Con actitud, con identidad, con flow.
          </p>
        </div>

        {/* Action panel */}
        <div
          style={{
            background: "var(--black)",
            padding: "2.5rem",
            minWidth: "280px",
          }}
        >
          <h3
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--acid)",
              margin: "0 0 1.5rem",
            }}
          >
            Reserva tu turno
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              href="/barberos"
              style={{
                display: "block",
                textAlign: "center",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--acid)",
                background: "transparent",
                border: "1px solid var(--acid)",
                padding: "0.85rem 1rem",
                textDecoration: "none",
                width: "100%",
                boxSizing: "border-box",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "var(--acid)";
                el.style.color = "var(--black)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "transparent";
                el.style.color = "var(--acid)";
              }}
            >
              Catálogo de barberos
            </Link>
            <button
              style={{
                background: "var(--acid)",
                border: "none",
                color: "var(--black)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                padding: "1rem",
                cursor: "pointer",
                width: "100%",
                transition: "opacity 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.opacity = "0.9";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
              }}
            >
              Confirmar turno
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .flow-grid {
          grid-template-columns: 1fr auto;
        }
        @media (max-width: 900px) {
          .flow-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
