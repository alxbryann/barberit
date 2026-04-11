"use client";

const steps = [
  {
    num: "01",
    title: "Elige tu barbero",
    desc: "Cada uno con su estilo, su sello y su flow propio. Tú decides quién te pone a punto.",
  },
  {
    num: "02",
    title: "Agenda tu turno",
    desc: "Sin filas, sin esperas. Reserva online en menos de un minuto y llega en tu hora.",
  },
  {
    num: "03",
    title: "Lleva el corte",
    desc: "Sal de la silla con identidad. Un corte que habla por ti antes de que abras la boca.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="servicios"
      style={{
        background: "var(--dark)",
        padding: "7rem 2.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative big number background */}
      <div
        style={{
          position: "absolute",
          right: "-2%",
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "30vw",
          color: "rgba(205,255,0,0.02)",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        ?
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            alignItems: "end",
            marginBottom: "5rem",
          }}
          className="how-header"
        >
          <div>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.75rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--acid)",
                display: "block",
                marginBottom: "1rem",
              }}
            >
              El proceso
            </span>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(3rem, 6vw, 5.5rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
                color: "var(--white)",
                margin: 0,
              }}
            >
              ¿CÓMO ES
              <br />
              <span style={{ color: "var(--acid)" }}>LA VUELTA?</span>
            </h2>
          </div>
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "var(--gray-light)",
              maxWidth: "360px",
              margin: 0,
            }}
          >
            Simple, directo, sin complicaciones. Así como debe ser un buen
            corte: rápido en el proceso, eterno en el resultado.
          </p>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0",
            borderTop: "1px solid var(--gray)",
          }}
          className="steps-grid"
        >
          {steps.map((s, i) => (
            <div
              key={s.num}
              style={{
                padding: "3rem 2.5rem",
                borderRight: i < 2 ? "1px solid var(--gray)" : "none",
                position: "relative",
                transition: "background 0.3s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(205,255,0,0.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "4.5rem",
                  color: "rgba(205,255,0,0.12)",
                  display: "block",
                  lineHeight: 1,
                  marginBottom: "1.5rem",
                  transition: "color 0.3s",
                }}
                className="step-num"
              >
                {s.num}
              </span>
              <h3
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--white)",
                  marginBottom: "1rem",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.95rem",
                  lineHeight: 1.7,
                  color: "var(--gray-light)",
                  margin: 0,
                }}
              >
                {s.desc}
              </p>

              {/* Bottom acid line on hover */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "var(--acid)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.4s ease",
                }}
                className="step-line"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .how-header {
          grid-template-columns: 1fr 1fr;
        }
        .steps-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        div:hover > .step-line { transform: scaleX(1) !important; }
        div:hover .step-num { color: rgba(205,255,0,0.3) !important; }

        @media (max-width: 768px) {
          .how-header { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
