"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Star, Scissors, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

// ─── Data ───────────────────────────────────────────────────────────────────

const SERVICES = [
  { id: "corte", label: "CORTE CLÁSICO", price: 40000, duration: "45 min", icon: "✦" },
  { id: "barba", label: "BARBA", price: 30000, duration: "30 min", icon: "◈" },
  { id: "combo", label: "COMBO FULL", price: 65000, duration: "75 min", icon: "◉" },
];

const DAYS = [
  { label: "12", day: "MAR", month: "DIC" },
  { label: "13", day: "JUE", month: "DIC" },
  { label: "14", day: "VIE", month: "DIC" },
  { label: "15", day: "SÁB", month: "DIC" },
  { label: "16", day: "DOM", month: "DIC" },
  { label: "17", day: "LUN", month: "DIC" },
  { label: "18", day: "MAR", month: "DIC" },
];

const TIMES_MORNING = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
const TIMES_AFTERNOON = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
const TIMES_EVENING = ["17:00", "17:30", "18:00", "18:30", "19:00"];

const BLOCKED = ["09:30", "10:30", "13:30", "17:00", "17:30"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function JovanProfile() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => {
      v.play().catch(() => {});
    };
    tryPlay();
    v.addEventListener("loadeddata", tryPlay);
    return () => v.removeEventListener("loadeddata", tryPlay);
  }, []);

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const service = SERVICES.find((s) => s.id === selectedService);
  const day = selectedDay !== null ? DAYS[selectedDay] : null;

  function fmt(price: number) {
    return price.toLocaleString("es-CO");
  }

  if (confirmed) {
    return <ConfirmScreen service={service} day={day} time={selectedTime} onReset={() => setConfirmed(false)} />;
  }

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", color: "var(--white)" }}>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", height: "70vh", minHeight: 480, overflow: "hidden" }}>
        {/* Back button */}
        <Link
          href="/"
          style={{
            position: "absolute",
            top: "1.5rem",
            left: "1.5rem",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 600,
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--white)",
            textDecoration: "none",
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "0.45rem 1rem 0.45rem 0.75rem",
            backdropFilter: "blur(8px)",
          }}
        >
          <ChevronLeft size={14} />
          Volver
        </Link>

        {/* Video background */}
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        >
          <source src="/barbershop-hero.mp4" type="video/mp4" />
        </video>

        {/* Acid bottom stripe accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "var(--acid)",
            zIndex: 6,
          }}
        />

        {/* Scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* Hero content */}
        <div
          style={{
            position: "absolute",
            bottom: "2.5rem",
            right: "2rem",
            zIndex: 10,
            textAlign: "right",
          }}
        >
          {/* Tag */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", justifyContent: "flex-end" }}>
            <span style={{ width: 28, height: 2, background: "var(--acid)", display: "inline-block" }} />
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--acid)",
              }}
            >
              Barbero · Bogo
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(3.5rem, 9vw, 8rem)",
              lineHeight: 0.88,
              letterSpacing: "-0.01em",
              color: "var(--white)",
              margin: 0,
            }}
          >
            JOVAN
            <br />
            <span style={{ color: "var(--acid)" }}>BARBER</span>
          </h1>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              marginTop: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Cortes", value: "4.200+" },
              { label: "Rating", value: "4.9", icon: <Star size={12} fill="#CDFF00" color="#CDFF00" /> },
              { label: "Desde", value: "2017" },
            ].map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.6rem",
                    color: "var(--white)",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  {s.icon}
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--gray-light)",
                    marginTop: "0.1rem",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specialty badge */}
        <div
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 20,
            background: "var(--black)",
            border: "1px solid var(--acid)",
            padding: "0.4rem 0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <Scissors size={12} color="var(--acid)" />
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--acid)",
            }}
          >
            Fade · Diseños · Barba
          </span>
        </div>
      </section>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 1.5rem 6rem" }}>

        {/* ── STEP 1: Elegir servicio ───────────────────────────────────── */}
        <Step number="01" label="ELIGE EL SERVICIO" />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "3rem" }}>
          {SERVICES.map((s) => {
            const active = selectedService === s.id;
            return (
              <button
                key={s.id}
                onClick={() => { setSelectedService(s.id); setSelectedTime(null); }}
                style={{
                  width: "100%",
                  background: active ? "var(--acid)" : "var(--dark2)",
                  border: active ? "none" : "1px solid var(--gray)",
                  padding: "1.1rem 1.4rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "1.4rem",
                      color: active ? "var(--black)" : "var(--acid)",
                      lineHeight: 1,
                    }}
                  >
                    {s.icon}
                  </span>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "1.15rem",
                        letterSpacing: "0.05em",
                        color: active ? "var(--black)" : "var(--white)",
                        lineHeight: 1,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "0.7rem",
                        letterSpacing: "0.15em",
                        color: active ? "rgba(0,0,0,0.55)" : "var(--gray-light)",
                        marginTop: "0.2rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <Clock size={10} />
                      {s.duration}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.4rem",
                    letterSpacing: "0.02em",
                    color: active ? "var(--black)" : "var(--white)",
                  }}
                >
                  ${fmt(s.price)}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── STEP 2: Día y hora ────────────────────────────────────────── */}
        <Step number="02" label="DÍA Y HORA" />

        {/* Day picker */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0.5rem",
            marginBottom: "1.75rem",
          }}
          className="day-grid"
        >
          {DAYS.map((d, i) => {
            const active = selectedDay === i;
            return (
              <button
                key={i}
                onClick={() => { setSelectedDay(i); setSelectedTime(null); }}
                style={{
                  background: active ? "var(--acid)" : "var(--dark2)",
                  border: active ? "none" : "1px solid var(--gray)",
                  padding: "0.75rem 0.25rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.2rem",
                  transition: "all 0.18s",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.5rem",
                    lineHeight: 1,
                    color: active ? "var(--black)" : "var(--white)",
                  }}
                >
                  {d.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: active ? "rgba(0,0,0,0.55)" : "var(--gray-light)",
                  }}
                >
                  {d.day}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time picker */}
        {[
          { label: "Mañana", times: TIMES_MORNING },
          { label: "Tarde", times: TIMES_AFTERNOON },
          { label: "Noche", times: TIMES_EVENING },
        ].map((group) => (
          <div key={group.label} style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--gray-light)",
                marginBottom: "0.6rem",
              }}
            >
              {group.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {group.times.map((t) => {
                const blocked = BLOCKED.includes(t);
                const active = selectedTime === t;
                return (
                  <button
                    key={t}
                    disabled={blocked}
                    onClick={() => !blocked && setSelectedTime(t)}
                    style={{
                      background: blocked
                        ? "transparent"
                        : active
                        ? "var(--acid)"
                        : "var(--dark2)",
                      border: blocked
                        ? "1px solid var(--gray)"
                        : active
                        ? "none"
                        : "1px solid var(--gray)",
                      padding: "0.5rem 1rem",
                      cursor: blocked ? "not-allowed" : "pointer",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      letterSpacing: "0.1em",
                      color: blocked
                        ? "var(--gray)"
                        : active
                        ? "var(--black)"
                        : "var(--white)",
                      textDecoration: blocked ? "line-through" : "none",
                      transition: "all 0.15s",
                      opacity: blocked ? 0.4 : 1,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── STEP 3: Resumen ───────────────────────────────────────────── */}
        <Step number="03" label="TU RESUMEN" />

        <div
          style={{
            background: "var(--dark2)",
            border: "1px solid var(--gray)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Barbero row */}
          <SummaryRow
            label="Número barbero"
            value="JOVAN RIVERA"
          />
          <div style={{ height: "1px", background: "var(--gray)", margin: "0.9rem 0" }} />

          {/* Fecha */}
          <SummaryRow
            label="Fecha y hora"
            value={
              day && selectedTime
                ? `${day.day} ${day.label}, ${day.month} · ${selectedTime} AM`
                : "—"
            }
            dimmed={!day || !selectedTime}
          />
          <div style={{ height: "1px", background: "var(--gray)", margin: "0.9rem 0" }} />

          {/* Servicio */}
          <SummaryRow
            label="Servicio"
            value={service ? service.label : "—"}
            dimmed={!service}
          />
          <div style={{ height: "1px", background: "var(--gray)", margin: "0.9rem 0" }} />

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--gray-light)",
              }}
            >
              Total
            </span>
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "2rem",
                color: service ? "var(--acid)" : "var(--gray-mid)",
                letterSpacing: "0.02em",
              }}
            >
              {service ? `$${fmt(service.price)}` : "—"}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          disabled={!selectedService || !selectedDay || !selectedTime}
          onClick={() => setConfirmed(true)}
          style={{
            width: "100%",
            background:
              selectedService && selectedDay !== null && selectedTime
                ? "var(--acid)"
                : "var(--gray)",
            color:
              selectedService && selectedDay !== null && selectedTime
                ? "var(--black)"
                : "var(--gray-mid)",
            border: "none",
            padding: "1.15rem",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.2rem",
            letterSpacing: "0.15em",
            cursor:
              selectedService && selectedDay !== null && selectedTime
                ? "pointer"
                : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {selectedService && selectedDay !== null && selectedTime
            ? "CONFIRMAR RESERVA"
            : "COMPLETA LOS PASOS"}
        </button>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .day-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Step({ number, label }: { number: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        margin: "2.5rem 0 1.25rem",
      }}
    >
      <span
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "0.85rem",
          letterSpacing: "0.2em",
          color: "var(--acid)",
          opacity: 0.7,
        }}
      >
        {number}
      </span>
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          letterSpacing: "0.04em",
          color: "var(--white)",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {label}
      </h2>
      <div style={{ flex: 1, height: "1px", background: "var(--gray)" }} />
    </div>
  );
}

function SummaryRow({
  label,
  value,
  dimmed = false,
}: {
  label: string;
  value: string;
  dimmed?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--gray-light)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 600,
          fontSize: "0.95rem",
          letterSpacing: "0.05em",
          color: dimmed ? "var(--gray-mid)" : "var(--white)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Confirm screen ──────────────────────────────────────────────────────────

function ConfirmScreen({
  service,
  day,
  time,
  onReset,
}: {
  service: (typeof SERVICES)[0] | undefined;
  day: (typeof DAYS)[0] | undefined | null;
  time: string | null;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--black)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        gap: "1.5rem",
        animation: "fadeInUp 0.5s ease forwards",
      }}
    >
      <CheckCircle2 size={56} color="var(--acid)" strokeWidth={1.5} />
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(2.5rem, 7vw, 5rem)",
          letterSpacing: "0.03em",
          color: "var(--white)",
          margin: 0,
          lineHeight: 0.9,
        }}
      >
        RESERVA
        <br />
        <span style={{ color: "var(--acid)" }}>CONFIRMADA</span>
      </h2>
      <p
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "1rem",
          letterSpacing: "0.1em",
          color: "var(--gray-light)",
          maxWidth: 320,
          lineHeight: 1.6,
        }}
      >
        {service?.label} con <strong style={{ color: "var(--white)" }}>Jovan Rivera</strong>
        <br />
        {day && `${day.day} ${day.month}`} · {time}
        <br />
        <strong style={{ color: "var(--acid)" }}>
          ${service ? service.price.toLocaleString("es-CO") : "—"}
        </strong>
      </p>
      <button
        onClick={onReset}
        style={{
          background: "transparent",
          border: "1px solid var(--gray)",
          color: "var(--gray-light)",
          padding: "0.75rem 2rem",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 600,
          fontSize: "0.8rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: "pointer",
          marginTop: "1rem",
        }}
      >
        Nueva reserva
      </button>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
