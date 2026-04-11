"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import BarberLayout from "../barbero-layout";

const SLOT_START = 9 * 60;
const SLOT_END = 20 * 60;
const STEP = 30;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

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

  const [day, setDay] = useState(() => {
    const t = new Date();
    t.setHours(12, 0, 0, 0);
    return t;
  });

  const dateStr = useMemo(() => toISODate(day), [day]);
  const [reservas, setReservas] = useState<ReservaRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileMini>>({});
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [completando, setCompletando] = useState<string | null>(null);

  async function handleCompletar(reservaId: string) {
    setCompletando(reservaId);
    await supabase.from("reservas").update({ estado: "completada" }).eq("id", reservaId);
    setReservas((prev) =>
      prev.map((r) => (r.id === reservaId ? { ...r, estado: "completada" } : r))
    );
    setCompletando(null);
  }

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

    if (error) { setLoadErr(error.message); setReservas([]); return; }

    const rows = (data ?? []) as ReservaRow[];
    setReservas(rows);

    const ids = [...new Set(rows.map((r) => r.cliente_id))];
    if (ids.length === 0) { setProfiles({}); return; }

    const { data: profs, error: pErr } = await supabase
      .from("profiles")
      .select("id, nombre, telefono")
      .in("id", ids);

    if (pErr) { setLoadErr(pErr.message); return; }

    const map: Record<string, ProfileMini> = {};
    for (const p of profs ?? []) map[p.id] = p as ProfileMini;
    setProfiles(map);
  }, [barberoId, dateStr]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: barbero, error } = await supabase
        .from("barberos")
        .select("id, slug, nombre_barberia, profiles(nombre)")
        .eq("id", user.id)
        .maybeSingle();

      const b = barbero as unknown as {
        id: string; slug: string; nombre_barberia: string | null; profiles: { nombre: string } | null;
      } | null;

      if (error || !b) { setAuthError(true); setLoading(false); return; }
      if (b.slug !== slug) { router.replace(`/barbero/${b.slug}/panel`); return; }

      setBarberoId(b.id);
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
    [reservas]
  );

  const isToday = useMemo(() => toISODate(new Date()) === dateStr, [dateStr]);

  const labelDay = useMemo(() => {
    const raw = day.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [day]);

  if (loading) {
    return (
      <BarberLayout slug={slug}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.2em", color: "var(--acid)" }}>
            CARGANDO...
          </span>
        </div>
      </BarberLayout>
    );
  }

  if (authError) {
    return (
      <BarberLayout slug={slug}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "var(--gray-light)" }}>
            No tienes acceso a este panel.
          </p>
        </div>
      </BarberLayout>
    );
  }

  return (
    <BarberLayout slug={slug}>
      <div style={{ padding: "2rem 1.75rem 4rem", maxWidth: 960, margin: "0 auto" }}>

        {/* ── ENCABEZADO DÍA ─────────────────────────────────── */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "2.5rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid var(--gray)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Calendar size={20} color="var(--acid)" />
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
              letterSpacing: "0.04em",
              margin: 0,
            }}>
              {labelDay}
            </h1>
            {isToday && (
              <span style={{
                background: "var(--acid)",
                color: "var(--black)",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                padding: "0.2rem 0.5rem",
              }}>
                HOY
              </span>
            )}
          </div>

          {/* Controles de día */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              style={navBtnStyle}
              aria-label="Día anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goToday}
              disabled={isToday}
              style={{
                ...navBtnStyle,
                color: isToday ? "var(--gray-mid)" : "var(--acid)",
                cursor: isToday ? "not-allowed" : "pointer",
                padding: "0.45rem 0.9rem",
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
              style={navBtnStyle}
              aria-label="Día siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {loadErr && (
          <p style={{ color: "#ff6b6b", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "1rem" }}>
            {loadErr}
          </p>
        )}

        {/* ── GRID: CITAS + FRANJAS ───────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="panel-grid">

          {/* CITAS */}
          <section>
            <h2 style={sectionHeadStyle}>
              <User size={15} />
              CITAS DEL DÍA
              <span style={{
                marginLeft: "auto",
                background: sorted.length > 0 ? "var(--acid)" : "var(--gray)",
                color: sorted.length > 0 ? "var(--black)" : "var(--gray-mid)",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "0.85rem",
                padding: "0.1rem 0.5rem",
                letterSpacing: "0.08em",
              }}>
                {sorted.length}
              </span>
            </h2>

            {sorted.length === 0 ? (
              <div style={{
                border: "1px dashed var(--gray)",
                padding: "2.5rem 2rem",
                textAlign: "center",
                fontFamily: "'Barlow Condensed', sans-serif",
                color: "var(--gray-mid)",
                letterSpacing: "0.04em",
                lineHeight: 1.6,
              }}>
                Sin citas para este día.<br />
                <span style={{ fontSize: "0.8rem", color: "#555" }}>Cuando un cliente reserve aparecerá aquí.</span>
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {sorted.map((r) => {
                  const p = profiles[r.cliente_id];
                  const name = p?.nombre?.trim() || "Cliente";
                  const tel = p?.telefono;
                  const completada = r.estado === "completada";
                  const cancelada = r.estado === "cancelada";
                  return (
                    <li
                      key={r.id}
                      style={{
                        background: completada ? "rgba(205,255,0,0.04)" : "var(--dark2)",
                        border: `1px solid ${completada ? "rgba(205,255,0,0.25)" : "var(--gray)"}`,
                        padding: "1rem 1.1rem",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        opacity: cancelada ? 0.45 : 1,
                        transition: "all 0.2s",
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "0.05em" }}>
                          {name}
                        </div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", color: "var(--gray-light)", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <Clock size={11} color="var(--acid)" />
                            {normalizeHora(r.hora)}
                          </span>
                          {tel && <span>· {tel}</span>}
                          {r.precio != null && (
                            <span style={{ color: "var(--acid)", fontWeight: 700 }}>
                              ${r.precio.toLocaleString("es-CO")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: "0.65rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          border: `1px solid ${completada ? "var(--acid)" : "var(--gray)"}`,
                          padding: "0.2rem 0.5rem",
                          color: completada ? "var(--acid)" : "var(--gray-light)",
                        }}>
                          {r.estado ?? "pendiente"}
                        </span>
                        {!completada && !cancelada && (
                          <button
                            type="button"
                            onClick={() => handleCompletar(r.id)}
                            disabled={completando === r.id}
                            style={{
                              background: completando === r.id ? "var(--gray)" : "var(--acid)",
                              color: "var(--black)",
                              border: "none",
                              padding: "0.3rem 0.75rem",
                              fontFamily: "'Bebas Neue', sans-serif",
                              fontSize: "0.78rem",
                              letterSpacing: "0.1em",
                              cursor: completando === r.id ? "not-allowed" : "pointer",
                              whiteSpace: "nowrap",
                              transition: "background 0.15s",
                            }}
                          >
                            {completando === r.id ? "..." : "COMPLETAR"}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* FRANJAS DEL DÍA */}
          <section>
            <h2 style={sectionHeadStyle}>
              <Clock size={15} />
              VISTA HORARIA
              <span style={{ marginLeft: "auto", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", color: "var(--gray-mid)", letterSpacing: "0.1em", fontWeight: 400 }}>
                09:00 – 20:00
              </span>
            </h2>
            <div style={{ border: "1px solid var(--gray)", background: "var(--dark2)", maxHeight: 420, overflowY: "auto" }}>
              {DAY_SLOTS.map((slot) => {
                const booked = byTime.get(slot) ?? [];
                const has = booked.length > 0;
                return (
                  <div
                    key={slot}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "68px 1fr",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      minHeight: 40,
                      alignItems: "stretch",
                    }}
                  >
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "0.72rem",
                      letterSpacing: "0.08em",
                      color: has ? "var(--acid)" : "var(--gray-mid)",
                      padding: "0 0.65rem",
                      borderRight: "1px solid rgba(255,255,255,0.07)",
                      display: "flex",
                      alignItems: "center",
                      background: "var(--black)",
                      fontWeight: has ? 700 : 400,
                    }}>
                      {slot}
                    </div>
                    <div style={{
                      padding: "0.35rem 0.65rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: "0.2rem",
                      background: has ? "rgba(205,255,0,0.05)" : "transparent",
                    }}>
                      {has ? (
                        booked.map((r) => {
                          const p = profiles[r.cliente_id];
                          const name = p?.nombre?.trim() || "Cliente";
                          return (
                            <span key={r.id} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--white)" }}>
                              {name}
                              {r.precio != null && (
                                <span style={{ color: "var(--acid)", marginLeft: "0.4rem", fontSize: "0.78rem" }}>
                                  ${r.precio.toLocaleString("es-CO")}
                                </span>
                              )}
                            </span>
                          );
                        })
                      ) : (
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.68rem", color: "#333", letterSpacing: "0.06em" }}>
                          libre
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @media (min-width: 860px) {
          .panel-grid {
            grid-template-columns: 1fr 1fr !important;
            align-items: start;
          }
        }
      `}</style>
    </BarberLayout>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "var(--dark2)",
  border: "1px solid var(--gray)",
  color: "var(--white)",
  padding: "0.45rem 0.5rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const sectionHeadStyle: React.CSSProperties = {
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: "0.95rem",
  letterSpacing: "0.15em",
  color: "var(--acid)",
  margin: "0 0 0.85rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};
