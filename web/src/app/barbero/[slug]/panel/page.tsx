"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pencil,
  Scissors,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const SLOT_START = 9 * 60; // 09:00
const SLOT_END = 20 * 60; // 20:00
const STEP = 30;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** DB suele devolver TIME como "11:30:00"; el calendario usa slots "11:30". */
function normalizeHora(t: string): string {
  const raw = (t ?? "").trim();
  if (!raw) return "";
  const parts = raw.split(":");
  if (parts.length < 2) return raw;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return raw;
  return `${pad2(h)}:${pad2(m)}`;
}

function parseTimeToMin(t: string) {
  const key = normalizeHora(t);
  const [h, m] = key.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function slotsForDay() {
  const out: string[] = [];
  for (let m = SLOT_START; m < SLOT_END; m += STEP) {
    out.push(`${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`);
  }
  return out;
}

const DAY_SLOTS = slotsForDay();

type ReservaRow = {
  id: string;
  fecha: string;
  hora: string;
  precio: number | null;
  estado: string | null;
  cliente_id: string;
};

type ProfileMini = { id: string; nombre: string; telefono: string | null };

export default function BarberoPanelPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [barberoId, setBarberoId] = useState<string | null>(null);
  const [nombreBarbero, setNombreBarbero] = useState("");

  const [day, setDay] = useState(() => {
    const t = new Date();
    t.setHours(12, 0, 0, 0);
    return t;
  });

  const dateStr = useMemo(() => toISODate(day), [day]);

  const [reservas, setReservas] = useState<ReservaRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileMini>>({});
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const shiftDay = (delta: number) => {
    setDay((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() + delta);
      return n;
    });
  };

  const goToday = () => {
    const t = new Date();
    t.setHours(12, 0, 0, 0);
    setDay(t);
  };

  const loadReservas = useCallback(async () => {
    if (!barberoId) return;
    setLoadErr(null);
    const { data, error } = await supabase
      .from("reservas")
      .select("id, fecha, hora, precio, estado, cliente_id")
      .eq("barbero_id", barberoId)
      .eq("fecha", dateStr)
      .order("hora", { ascending: true });

    if (error) {
      setLoadErr(error.message);
      setReservas([]);
      return;
    }

    const rows = (data ?? []) as ReservaRow[];
    setReservas(rows);

    const ids = [...new Set(rows.map((r) => r.cliente_id))];
    if (ids.length === 0) {
      setProfiles({});
      return;
    }

    const { data: profs, error: pErr } = await supabase
      .from("profiles")
      .select("id, nombre, telefono")
      .in("id", ids);

    if (pErr) {
      setLoadErr(pErr.message);
      return;
    }

    const map: Record<string, ProfileMini> = {};
    for (const p of profs ?? []) {
      map[p.id] = p as ProfileMini;
    }
    setProfiles(map);
  }, [barberoId, dateStr]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: barbero } = await supabase
        .from("barberos")
        .select("id, slug, profiles(nombre)")
        .eq("slug", slug)
        .single();

      const b = barbero as unknown as {
        id: string;
        slug: string;
        profiles: { nombre: string } | null;
      } | null;

      if (!b || b.id !== user.id) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      setBarberoId(b.id);
      setNombreBarbero(b.profiles?.nombre ?? slug);
      setLoading(false);
    }
    init();
  }, [slug, router]);

  useEffect(() => {
    if (!barberoId) return;
    loadReservas();
  }, [barberoId, loadReservas]);

  const byTime = useMemo(() => {
    const m = new Map<string, ReservaRow[]>();
    for (const r of reservas) {
      const slot = normalizeHora(r.hora);
      const list = m.get(slot) ?? [];
      list.push(r);
      m.set(slot, list);
    }
    return m;
  }, [reservas]);

  const sorted = useMemo(
    () => [...reservas].sort((a, b) => parseTimeToMin(a.hora) - parseTimeToMin(b.hora)),
    [reservas],
  );

  const isToday = useMemo(() => toISODate(new Date()) === dateStr, [dateStr]);

  const labelDay = useMemo(() => {
    return day.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, [day]);

  if (loading) {
    return (
      <div
        style={{
          background: "var(--black)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.5rem",
            letterSpacing: "0.2em",
            color: "var(--acid)",
          }}
        >
          CARGANDO PANEL...
        </span>
      </div>
    );
  }

  if (authError) {
    return (
      <div
        style={{
          background: "var(--black)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
        }}
      >
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            color: "var(--gray-light)",
            textAlign: "center",
          }}
        >
          No tienes acceso a este panel o el enlace no es válido.
        </p>
        <Link
          href="/auth/login"
          style={{ color: "var(--acid)", fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", color: "var(--white)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--gray)",
          padding: "1rem 1.25rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              color: "var(--gray-light)",
              textDecoration: "none",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            <ChevronLeft size={14} />
            Inicio
          </Link>
          <div style={{ width: 1, height: 24, background: "var(--gray)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Scissors size={16} color="var(--acid)" />
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.25rem",
                letterSpacing: "0.08em",
              }}
            >
              PANEL · {nombreBarbero.toUpperCase()}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
          <Link
            href={`/barbero/${slug}`}
            style={{
              border: "1px solid var(--gray)",
              color: "var(--gray-light)",
              padding: "0.45rem 0.9rem",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Ver perfil público
          </Link>
          <Link
            href={`/barbero/${slug}/editar`}
            style={{
              background: "var(--acid)",
              color: "var(--black)",
              padding: "0.45rem 0.9rem",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "0.85rem",
              letterSpacing: "0.12em",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <Pencil size={14} strokeWidth={2.5} />
            EDITAR PERFIL
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1.25rem 4rem" }}>
        {/* Selector de día */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={18} color="var(--acid)" />
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                letterSpacing: "0.04em",
                margin: 0,
                textTransform: "capitalize",
              }}
            >
              {labelDay}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              style={{
                background: "var(--dark2)",
                border: "1px solid var(--gray)",
                color: "var(--white)",
                padding: "0.5rem",
                cursor: "pointer",
                display: "flex",
              }}
              aria-label="Día anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goToday}
              disabled={isToday}
              style={{
                background: isToday ? "var(--gray)" : "var(--dark2)",
                border: "1px solid var(--gray)",
                color: isToday ? "var(--gray-mid)" : "var(--acid)",
                padding: "0.45rem 0.85rem",
                cursor: isToday ? "not-allowed" : "pointer",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
              }}
            >
              HOY
            </button>
            <button
              type="button"
              onClick={() => shiftDay(1)}
              style={{
                background: "var(--dark2)",
                border: "1px solid var(--gray)",
                color: "var(--white)",
                padding: "0.5rem",
                cursor: "pointer",
                display: "flex",
              }}
              aria-label="Día siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {loadErr && (
          <p
            style={{
              color: "#ff6b6b",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.9rem",
              marginBottom: "1rem",
            }}
          >
            {loadErr}
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem",
          }}
          className="panel-grid"
        >
          {/* Columna: lista de citas */}
          <section>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.1rem",
                letterSpacing: "0.15em",
                color: "var(--acid)",
                margin: "0 0 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <User size={16} />
              CITAS ({sorted.length})
            </h2>
            {sorted.length === 0 ? (
              <div
                style={{
                  border: "1px dashed var(--gray)",
                  padding: "2rem",
                  textAlign: "center",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  color: "var(--gray-mid)",
                  letterSpacing: "0.05em",
                }}
              >
                Nadie agendó este día. Cuando un cliente reserve, aparecerá aquí con nombre y hora.
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {sorted.map((r) => {
                  const p = profiles[r.cliente_id];
                  const name = p?.nombre?.trim() || "Cliente";
                  const tel = p?.telefono;
                  return (
                    <li
                      key={r.id}
                      style={{
                        background: "var(--dark2)",
                        border: "1px solid var(--gray)",
                        padding: "1rem 1.1rem",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: "1.35rem",
                            letterSpacing: "0.06em",
                            color: "var(--white)",
                          }}
                        >
                          {name}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "0.8rem",
                            color: "var(--gray-light)",
                            marginTop: "0.2rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <Clock size={12} color="var(--acid)" />
                            {normalizeHora(r.hora)}
                          </span>
                          {tel && <span>· {tel}</span>}
                          {r.precio != null && (
                            <span style={{ color: "var(--acid)" }}>${r.precio.toLocaleString("es-CO")}</span>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: "0.65rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          border: "1px solid var(--gray)",
                          padding: "0.25rem 0.5rem",
                          color: "var(--gray-light)",
                        }}
                      >
                        {r.estado ?? "pendiente"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Columna: franjas del día */}
          <section>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.1rem",
                letterSpacing: "0.15em",
                color: "var(--acid)",
                margin: "0 0 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Clock size={16} />
              TU DÍA (9:00 – 20:00)
            </h2>
            <div
              style={{
                border: "1px solid var(--gray)",
                background: "var(--dark2)",
                maxHeight: 420,
                overflowY: "auto",
              }}
            >
              {DAY_SLOTS.map((slot) => {
                const booked = byTime.get(slot) ?? [];
                const has = booked.length > 0;
                return (
                  <div
                    key={slot}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "72px 1fr",
                      borderBottom: "1px solid var(--gray)",
                      minHeight: 44,
                      alignItems: "stretch",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        color: "var(--gray-mid)",
                        padding: "0.5rem 0.65rem",
                        borderRight: "1px solid var(--gray)",
                        display: "flex",
                        alignItems: "center",
                        background: "var(--black)",
                      }}
                    >
                      {slot}
                    </div>
                    <div
                      style={{
                        padding: "0.35rem 0.65rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: "0.25rem",
                        background: has ? "rgba(205,255,0,0.06)" : "transparent",
                      }}
                    >
                      {has ? (
                        booked.map((r) => {
                          const p = profiles[r.cliente_id];
                          const name = p?.nombre?.trim() || "Cliente";
                          return (
                            <span
                              key={r.id}
                              style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                letterSpacing: "0.04em",
                                color: "var(--white)",
                              }}
                            >
                              {name}
                              {r.precio != null && (
                                <span style={{ color: "var(--acid)", marginLeft: "0.5rem" }}>
                                  ${r.precio.toLocaleString("es-CO")}
                                </span>
                              )}
                            </span>
                          );
                        })
                      ) : (
                        <span
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "0.7rem",
                            color: "var(--gray-mid)",
                            letterSpacing: "0.08em",
                          }}
                        >
                          Libre
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <style>{`
        @media (min-width: 880px) {
          .panel-grid {
            grid-template-columns: 1fr 1fr !important;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}
