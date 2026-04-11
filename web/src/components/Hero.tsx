"use client";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
        background: "var(--black)",
      }}
    >
      {/* Background: gradient blocks mimicking the screenshot */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(135deg,
              #0a0a0a 0%,
              #111 40%,
              #181818 60%,
              #0a0a0a 100%
            )
          `,
        }}
      />

      {/* Acid accent block top-right */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "42%",
          height: "100%",
          background: "var(--acid)",
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)",
          zIndex: 1,
        }}
      />

      {/* Barber silhouette placeholder (dark photo overlay) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "48%",
          height: "100%",
          background: "linear-gradient(to bottom, #1a1a1a 0%, #0a0a0a 100%)",
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Decorative pattern */}
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: `repeating-linear-gradient(
              45deg,
              rgba(205,255,0,0.03) 0px,
              rgba(205,255,0,0.03) 1px,
              transparent 1px,
              transparent 60px
            )`,
          }}
        />
        {/* Big BOGO text watermark */}
        <span
          style={{
            position: "absolute",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(6rem, 14vw, 14rem)",
            color: "rgba(205,255,0,0.06)",
            letterSpacing: "0.02em",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          BOGO
        </span>
      </div>

      {/* LA text - top right accent */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          right: "3%",
          zIndex: 4,
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(4rem, 8vw, 8rem)",
          color: "rgba(8,8,8,0.35)",
          letterSpacing: "-0.02em",
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        LA
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          padding: "0 2.5rem 5rem",
          maxWidth: "1200px",
          width: "100%",
        }}
      >
        {/* Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            opacity: 0,
            animation: "fadeInUp 0.7s ease 0.1s forwards",
          }}
        >
          <span
            style={{
              width: "32px",
              height: "2px",
              background: "var(--acid)",
              display: "inline-block",
            }}
          />
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
            Bogotá · Colombia
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(4.5rem, 12vw, 11rem)",
            lineHeight: 0.9,
            letterSpacing: "-0.01em",
            color: "var(--white)",
            margin: 0,
            opacity: 0,
            animation: "fadeInUp 0.8s ease 0.2s forwards",
          }}
        >
          CORTES
          <br />
          <span
            className="glitch"
            data-text="CON CALLE."
            style={{ color: "var(--acid)", display: "inline-block" }}
          >
            CON CALLE.
          </span>
        </h1>

        {/* Sub */}
        <p
          style={{
            marginTop: "2rem",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            letterSpacing: "0.05em",
            color: "var(--gray-light)",
            maxWidth: "380px",
            lineHeight: 1.5,
            opacity: 0,
            animation: "fadeInUp 0.8s ease 0.35s forwards",
          }}
        >
          La barbería que entiende la calle. Tu imagen, tu identidad, tu sello.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "2.5rem",
            flexWrap: "wrap",
            opacity: 0,
            animation: "fadeInUp 0.8s ease 0.5s forwards",
          }}
        >
          <a
            href="#reservar"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--black)",
              background: "var(--acid)",
              padding: "0.9rem 2.5rem",
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-2px)";
              el.style.boxShadow = "0 8px 30px rgba(205,255,0,0.35)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
            }}
          >
            Reservar turno
          </a>
          <a
            href="#servicios"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: "0.9rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--white)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "0.9rem 2.5rem",
              textDecoration: "none",
              transition: "border-color 0.2s, color 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--acid)";
              el.style.color = "var(--acid)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(255,255,255,0.15)";
              el.style.color = "var(--white)";
            }}
          >
            ¿Cómo funciona?
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          right: "2.5rem",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          opacity: 0,
          animation: "fadeInUp 1s ease 0.8s forwards",
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--gray-light)",
            writingMode: "vertical-rl",
          }}
        >
          Scroll
        </span>
        <ArrowDown
          size={16}
          style={{ color: "var(--acid)", animation: "bounce 2s infinite" }}
        />
      </div>

      {/* Scanline effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          pointerEvents: "none",
        }}
      />

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </section>
  );
}
