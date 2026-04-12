"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Star, Scissors, Clock, CheckCircle2, LogIn, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ─── Servicios por defecto para barberos nuevos ───────────────────────────────
const DEFAULT_SERVICES = [
  { id: "corte", label: "CORTE CLÁSICO", price: 40000, duration: "45 min", icon: "✦" },
  { id: "barba", label: "BARBA", price: 30000, duration: "30 min", icon: "◈" },
  { id: "combo", label: "COMBO FULL", price: 65000, duration: "75 min", icon: "◉" },
];

const TIMES_MORNING = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
const TIMES_AFTERNOON = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
const TIMES_EVENING = ["17:00", "17:30", "18:00", "18:30", "19:00"];

function getTodayBogota() {
  // Fuerza la fecha actual en zona horaria de Bogotá (UTC-5)
  const now = new Date();
  const bogota = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  bogota.setHours(12, 0, 0, 0);
  return bogota;
}

function getDays() {
  const days = [];
  const dayNames = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const today = getTodayBogota();
  for (let i = 0; i <= 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      label: String(d.getDate()).padStart(2, "0"),
      day: dayNames[d.getDay()],
      month: monthNames[d.getMonth()],
      fullDate: d,
    });
  }
  return days;
}

const DAYS = getDays();

/**
 * Misma composición del título del hero aunque el nombre venga sin espacio
 * (p. ej. "JovanBarber"), con guiones, o solo el slug — evita "JOVANBARBER" en una línea
 * para visitantes y "JOVAN" / "BARBER" para el dueño con perfil distinto.
 */
function heroNameLines(raw: string): { primary: string; secondary: string } {
  const s = raw.trim().replace(/-/g, " ");
  if (!s) return { primary: "", secondary: "BARBER" };
  const upper = s.toUpperCase();
  const parts = upper.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return { primary: parts[0], secondary: parts.slice(1).join(" ") };
  }
  const one = parts[0];
  if (one.length > 6 && one.endsWith("BARBER")) {
    return { primary: one.slice(0, -6), secondary: "BARBER" };
  }
  return { primary: one, secondary: "BARBER" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BarberProfile() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [barbero, setBarbero] = useState<{
    id: string;
    slug: string;
    nombre: string;
    nombre_barberia: string | null;
    especialidades: string[];
    rating: number;
    total_cortes: number;
    desde_año: number;
    bio?: string;
    video_url?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [galeria, setGaleria] = useState<{ id: string; imagen_url: string; tipo?: string }[]>([]);

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [reservaLoading, setReservaLoading] = useState(false);

  // Rating modal
  const [pendingReseña, setPendingReseña] = useState<{ reservaId: string } | null>(null);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSelected, setRatingSelected] = useState(0);
  const [ratingComentario, setRatingComentario] = useState("");
  const [ratingSending, setRatingSending] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => { v.play().catch(() => {}); };
    tryPlay();
    v.addEventListener("loadeddata", tryPlay);
    return () => v.removeEventListener("loadeddata", tryPlay);
  }, [barbero]);

  useEffect(() => {
    if (!slug) return;

    async function fetchBarbero() {
      let { data, error } = await supabase
        .from("barberos")
        .select("id, slug, especialidades, rating, total_cortes, bio, video_url, nombre_barberia, profiles(nombre)")
        .eq("slug", slug)
        .maybeSingle();

      if (error) console.error("[barbero fetch error]", error);

      // Retry una vez ante fallo de red o resultado vacío inesperado
      if (!data) {
        await new Promise((r) => setTimeout(r, 600));
        const { data: retry, error: retryError } = await supabase
          .from("barberos")
          .select("id, slug, especialidades, rating, total_cortes, bio, video_url, nombre_barberia, profiles(nombre)")
          .eq("slug", slug)
          .maybeSingle();
        if (retryError) console.error("[barbero fetch retry error]", retryError);
        data = retry;
      }

      if (!data) { setLoading(false); return; }

      const d = data as unknown as {
        id: string; slug: string; especialidades: string[]; rating: number;
        total_cortes: number; bio: string; video_url: string;
        nombre_barberia: string | null;
        profiles: { nombre: string } | null;
      };

      // Cargar servicios reales
      supabase.from("servicios").select("*").eq("barbero_id", d.id).eq("activo", true).then(({ data: svcs }) => {
        if (svcs && svcs.length > 0) {
          setServices(svcs.map((s) => ({ id: s.id, label: s.nombre, price: s.precio, duration: `${s.duracion_min} min`, icon: s.icono })));
        }
      });

      setBarbero({
        id: d.id,
        slug: d.slug,
        nombre: d.profiles?.nombre ?? slug,
        nombre_barberia: d.nombre_barberia ?? null,
        especialidades: d.especialidades ?? [],
        rating: d.rating ?? 5.0,
        total_cortes: d.total_cortes ?? 0,
        desde_año: new Date().getFullYear(),
        bio: d.bio,
        video_url: d.video_url,
      });

      // Cargar galería
      supabase
        .from("galeria_cortes")
        .select("id, imagen_url, tipo")
        .eq("barbero_id", d.id)
        .order("created_at", { ascending: false })
        .then(({ data: gal }) => { if (gal) setGaleria(gal); });

      setLoading(false);
    }

    fetchBarbero();
  }, [slug]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) setUser({ id: session.user.id, email: session.user.email ?? "" });
      else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Detectar reserva completada sin reseña para mostrar modal
  const barberoId = barbero?.id ?? null;
  useEffect(() => {
    if (!user || !barberoId) return;

    async function checkPendingReseña() {
      const { data: reservasComp } = await supabase
        .from("reservas")
        .select("id")
        .eq("cliente_id", user!.id)
        .eq("barbero_id", barberoId)
        .eq("estado", "completada");
      if (!reservasComp || reservasComp.length === 0) return;
      const ids = reservasComp.map((r: { id: string }) => r.id);
      const { data: reseñasExist } = await supabase
        .from("reseñas")
        .select("reserva_id")
        .in("reserva_id", ids);
      const reseñadas = new Set((reseñasExist ?? []).map((r: { reserva_id: string }) => r.reserva_id));
      const sinReseña = ids.find((id: string) => !reseñadas.has(id));
      if (sinReseña) setPendingReseña({ reservaId: sinReseña });
    }

    checkPendingReseña();

    // Re-chequear cuando el usuario vuelve a la pestaña
    const onFocus = () => checkPendingReseña();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, barberoId]);

  async function handleEnviarReseña() {
    if (!user || !barbero || !pendingReseña || ratingSelected === 0) return;
    setRatingSending(true);
    await supabase.from("reseñas").insert({
      reserva_id: pendingReseña.reservaId,
      cliente_id: user.id,
      barbero_id: barbero.id,
      estrellas: ratingSelected,
      comentario: ratingComentario.trim() || null,
    });
    // Actualizar rating local
    const { data: updated } = await supabase
      .from("barberos")
      .select("rating, total_cortes")
      .eq("id", barbero.id)
      .single();
    if (updated) {
      setBarbero((prev) => prev ? { ...prev, rating: updated.rating, total_cortes: updated.total_cortes } : prev);
    }
    setRatingSending(false);
    setRatingDone(true);
    setTimeout(() => {
      setPendingReseña(null);
      setRatingDone(false);
      setRatingSelected(0);
      setRatingComentario("");
    }, 2000);
  }

  const service = services.find((s) => s.id === selectedService);
  const day = selectedDay !== null ? DAYS[selectedDay] : null;

  function fmt(price: number) {
    return price.toLocaleString("es-CO");
  }

  async function handleConfirmar() {
    if (!selectedService || selectedDay === null || !selectedTime || !barbero) return;
    if (!user) { router.push("/auth/login"); return; }

    setReservaLoading(true);
    const d = DAYS[selectedDay];
    const fecha = d.fullDate.toISOString().split("T")[0];

    const { error: insertError } = await supabase.from("reservas").insert({
      cliente_id: user.id,
      barbero_id: barbero.id,
      servicio_id: service?.id ?? null,
      fecha,
      hora: selectedTime,
      precio: service?.price ?? null,
      estado: "pendiente",
    });

    if (insertError) {
      console.error("[reserva insert error]", insertError);
      setReservaLoading(false);
      return;
    }

    setReservaLoading(false);
    setConfirmed(true);
  }

  if (loading) {
    return (
      <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.2em", color: "var(--acid)" }}>CARGANDO...</span>
      </div>
    );
  }

  if (!barbero) {
    return (
      <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "4rem", color: "var(--white)", margin: 0 }}>
          BARBERO <span style={{ color: "var(--acid)" }}>404</span>
        </h1>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "var(--gray-light)", fontSize: "1rem", letterSpacing: "0.1em" }}>
          No encontramos este perfil
        </p>
        <Link href="/" style={{ color: "var(--acid)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", fontSize: "0.85rem", textTransform: "uppercase" }}>
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  const nombreBarberiaTrim = barbero.nombre_barberia?.trim() ?? "";
  const heroTitleSource = nombreBarberiaTrim || barbero.nombre;
  const { primary: heroPrimary, secondary: heroSecondary } = heroNameLines(heroTitleSource);

  if (confirmed) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center", gap: "1.5rem" }}>
        <CheckCircle2 size={56} color="var(--acid)" strokeWidth={1.5} />
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 7vw, 5rem)", letterSpacing: "0.03em", color: "var(--white)", margin: 0, lineHeight: 0.9 }}>
          RESERVA<br /><span style={{ color: "var(--acid)" }}>CONFIRMADA</span>
        </h2>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", color: "var(--gray-light)", maxWidth: 320, lineHeight: 1.6 }}>
          {service?.label} con <strong style={{ color: "var(--white)" }}>{barbero.nombre}</strong>
          <br />
          {day && `${day.day} ${day.label} ${day.month}`} · {selectedTime}
          <br />
          <strong style={{ color: "var(--acid)" }}>${service ? fmt(service.price) : "—"}</strong>
        </p>
        <button
          onClick={() => setConfirmed(false)}
          style={{ background: "transparent", border: "1px solid var(--gray)", color: "var(--gray-light)", padding: "0.75rem 2rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Nueva reserva
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", color: "var(--white)" }}>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", height: "70vh", minHeight: 480, overflow: "hidden" }}>
        <Link
          href="/"
          style={{ position: "absolute", top: "1.5rem", left: "1.5rem", zIndex: 20, display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--white)", textDecoration: "none", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.45rem 1rem 0.45rem 0.75rem", backdropFilter: "blur(8px)" }}
        >
          <ChevronLeft size={14} />
          Volver
        </Link>

        {barbero.video_url ? (
          <video ref={videoRef} muted loop playsInline autoPlay preload="auto" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
            <source src={barbero.video_url} type="video/mp4" />
          </video>
        ) : (
          <video ref={videoRef} muted loop playsInline autoPlay preload="auto" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
            <source src="/barbershop-hero.mp4" type="video/mp4" />
          </video>
        )}

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "var(--acid)", zIndex: 6 }} />
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)", pointerEvents: "none", zIndex: 2 }} />

        <div style={{ position: "absolute", bottom: "2.5rem", right: "2rem", zIndex: 10, textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", justifyContent: "flex-end" }}>
            <span style={{ width: 28, height: 2, background: "var(--acid)", display: "inline-block" }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--acid)" }}>
              Barbero · Bogo
            </span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3.5rem, 9vw, 8rem)", lineHeight: 0.88, letterSpacing: "-0.01em", color: "var(--white)", margin: 0 }}>
            {heroPrimary}
            <br />
            <span style={{ color: "var(--acid)" }}>{heroSecondary}</span>
          </h1>
          {nombreBarberiaTrim ? (
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(0.95rem, 2vw, 1.15rem)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray-light)", margin: "0.6rem 0 0", maxWidth: "min(100%, 420px)", marginLeft: "auto" }}>
              {barbero.nombre}
            </p>
          ) : null}
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
            {[
              { label: "Cortes", value: barbero.total_cortes > 0 ? `${barbero.total_cortes}+` : "Nuevo" },
              { label: "Rating", value: String(barbero.rating), icon: <Star size={12} fill="#CDFF00" color="#CDFF00" /> },
              { label: "Desde", value: String(barbero.desde_año) },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "var(--white)", lineHeight: 1, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  {s.icon}{s.value}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gray-light)", marginTop: "0.1rem" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón editar si es el dueño */}
        {user && barbero && user.id === barbero.id && (
          <div
            style={{
              position: "absolute",
              top: "1.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <Link
              href={`/barbero/${slug}/panel`}
              style={{
                background: "var(--dark2)",
                border: "1px solid var(--acid)",
                color: "var(--acid)",
                padding: "0.4rem 1rem",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "0.85rem",
                letterSpacing: "0.15em",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              PANEL
            </Link>
            <Link
              href={`/barbero/${slug}/editar`}
              style={{
                background: "var(--acid)",
                color: "var(--black)",
                padding: "0.4rem 1.1rem",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "0.85rem",
                letterSpacing: "0.15em",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              ✏ EDITAR PERFIL
            </Link>
          </div>
        )}

        <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", zIndex: 20, background: "var(--black)", border: "1px solid var(--acid)", padding: "0.4rem 0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Scissors size={12} color="var(--acid)" />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--acid)" }}>
            {barbero.especialidades.length > 0 ? barbero.especialidades.join(" · ") : "Fade · Diseños · Barba"}
          </span>
        </div>
      </section>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 1.5rem 6rem" }}>

        {galeria.length > 0 && (
          <div style={{ margin: "2.5rem 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.2em", color: "var(--acid)", opacity: 0.7 }}>◈</span>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", letterSpacing: "0.04em", color: "var(--white)", margin: 0, lineHeight: 1 }}>TRABAJOS</h2>
              <div style={{ flex: 1, height: "1px", background: "var(--gray)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
              {galeria.map((foto) => (
                <div key={foto.id} style={{ aspectRatio: "1", overflow: "hidden" }}>
                  {foto.tipo === "video" ? (
                    <video
                      src={foto.imagen_url}
                      muted loop autoPlay playsInline
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={foto.imagen_url}
                      alt="corte"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Step number="01" label="ELIGE EL SERVICIO" />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "3rem" }}>
          {services.map((s) => {
            const active = selectedService === s.id;
            return (
              <button key={s.id} onClick={() => { setSelectedService(s.id); setSelectedTime(null); }}
                style={{ width: "100%", background: active ? "var(--acid)" : "var(--dark2)", border: active ? "none" : "1px solid var(--gray)", padding: "1.1rem 1.4rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: active ? "var(--black)" : "var(--acid)", lineHeight: 1 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.15rem", letterSpacing: "0.05em", color: active ? "var(--black)" : "var(--white)", lineHeight: 1 }}>{s.label}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", letterSpacing: "0.15em", color: active ? "rgba(0,0,0,0.55)" : "var(--gray-light)", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Clock size={10} />{s.duration}
                    </div>
                  </div>
                </div>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.02em", color: active ? "var(--black)" : "var(--white)" }}>${fmt(s.price)}</span>
              </button>
            );
          })}
        </div>

        <Step number="02" label="DÍA Y HORA" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", marginBottom: "1.75rem" }} className="day-grid">
          {DAYS.map((d, i) => {
            const active = selectedDay === i;
            return (
              <button key={i} onClick={() => { setSelectedDay(i); setSelectedTime(null); }}
                style={{ background: active ? "var(--acid)" : "var(--dark2)", border: active ? "none" : "1px solid var(--gray)", padding: "0.75rem 0.25rem", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", transition: "all 0.18s" }}
              >
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", lineHeight: 1, color: active ? "var(--black)" : "var(--white)" }}>{d.label}</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: active ? "rgba(0,0,0,0.55)" : "var(--gray-light)" }}>{d.day}</span>
              </button>
            );
          })}
        </div>

        {[
          { label: "Mañana", times: TIMES_MORNING },
          { label: "Tarde", times: TIMES_AFTERNOON },
          { label: "Noche", times: TIMES_EVENING },
        ].map((group) => {
          const nowBogota = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
          const isToday = selectedDay === 0;
          const availableTimes = isToday
            ? group.times.filter((t) => {
                const [h, m] = t.split(":").map(Number);
                return h * 60 + m > nowBogota.getHours() * 60 + nowBogota.getMinutes();
              })
            : group.times;
          if (availableTimes.length === 0) return null;
          return (
            <div key={group.label} style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gray-light)", marginBottom: "0.6rem" }}>{group.label}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {availableTimes.map((t) => {
                  const active = selectedTime === t;
                  return (
                    <button key={t} onClick={() => setSelectedTime(t)}
                      style={{ background: active ? "var(--acid)" : "var(--dark2)", border: active ? "none" : "1px solid var(--gray)", padding: "0.5rem 1rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.1em", color: active ? "var(--black)" : "var(--white)", transition: "all 0.15s" }}
                    >{t}</button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <Step number="03" label="TU RESUMEN" />
        <div style={{ background: "var(--dark2)", border: "1px solid var(--gray)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <SummaryRow label="Barbero" value={barbero.nombre.toUpperCase()} />
          <div style={{ height: "1px", background: "var(--gray)", margin: "0.9rem 0" }} />
          <SummaryRow label="Fecha y hora" value={day && selectedTime ? `${day.day} ${day.label} ${day.month} · ${selectedTime}` : "—"} dimmed={!day || !selectedTime} />
          <div style={{ height: "1px", background: "var(--gray)", margin: "0.9rem 0" }} />
          <SummaryRow label="Servicio" value={service ? service.label : "—"} dimmed={!service} />
          <div style={{ height: "1px", background: "var(--gray)", margin: "0.9rem 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gray-light)" }}>Total</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: service ? "var(--acid)" : "var(--gray-mid)", letterSpacing: "0.02em" }}>
              {service ? `$${fmt(service.price)}` : "—"}
            </span>
          </div>
        </div>

        {!user && selectedService && selectedDay !== null && selectedTime && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--dark2)", border: "1px solid var(--gray)", padding: "0.9rem 1rem", marginBottom: "0.75rem" }}>
            <LogIn size={14} color="var(--acid)" />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.85rem", letterSpacing: "0.05em", color: "var(--gray-light)" }}>
              Debes{" "}
              <Link href="/auth/login" style={{ color: "var(--acid)", textDecoration: "none" }}>iniciar sesión</Link>
              {" "}o{" "}
              <Link href="/auth/registro" style={{ color: "var(--acid)", textDecoration: "none" }}>registrarte</Link>
              {" "}para confirmar
            </span>
          </div>
        )}

        <button
          disabled={!selectedService || selectedDay === null || !selectedTime || reservaLoading}
          onClick={handleConfirmar}
          style={{
            width: "100%",
            background: selectedService && selectedDay !== null && selectedTime ? "var(--acid)" : "var(--gray)",
            color: selectedService && selectedDay !== null && selectedTime ? "var(--black)" : "var(--gray-mid)",
            border: "none",
            padding: "1.15rem",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.2rem",
            letterSpacing: "0.15em",
            cursor: selectedService && selectedDay !== null && selectedTime && !reservaLoading ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {reservaLoading ? "RESERVANDO..." : selectedService && selectedDay !== null && selectedTime ? (user ? "CONFIRMAR RESERVA" : "INICIA SESIÓN PARA RESERVAR") : "COMPLETA LOS PASOS"}
        </button>
      </div>

      <style>{`
        @media (max-width: 560px) { .day-grid { grid-template-columns: repeat(4, 1fr) !important; } }
      `}</style>

      {/* ── MODAL RATING ─────────────────────────────────────────────────── */}
      {pendingReseña && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ background: "var(--dark2)", border: "1px solid var(--gray)", maxWidth: 400, width: "100%", padding: "2rem", position: "relative" }}>
            <button
              onClick={() => setPendingReseña(null)}
              style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "transparent", border: "none", color: "var(--gray-light)", cursor: "pointer", display: "flex" }}
            >
              <X size={18} />
            </button>

            {ratingDone ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <CheckCircle2 size={48} color="var(--acid)" strokeWidth={1.5} style={{ margin: "0 auto 1rem" }} />
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.05em", color: "var(--white)", margin: 0 }}>
                  GRACIAS POR TU RESEÑA
                </p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "1.25rem" }}>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.7rem", letterSpacing: "0.3em", color: "var(--acid)", margin: "0 0 0.35rem" }}>
                    ¿QUÉ TAL EL CORTE?
                  </p>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem, 5vw, 2.5rem)", letterSpacing: "0.03em", color: "var(--white)", margin: 0, lineHeight: 0.95 }}>
                    CALIFICA A<br /><span style={{ color: "var(--acid)" }}>{barbero.nombre.toUpperCase()}</span>
                  </h3>
                </div>

                {/* Estrellas */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRatingSelected(n)}
                      onMouseEnter={() => setRatingHover(n)}
                      onMouseLeave={() => setRatingHover(0)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.25rem", transition: "transform 0.1s", transform: ratingHover >= n || ratingSelected >= n ? "scale(1.15)" : "scale(1)" }}
                    >
                      <Star
                        size={36}
                        fill={ratingHover >= n || ratingSelected >= n ? "#CDFF00" : "none"}
                        color={ratingHover >= n || ratingSelected >= n ? "#CDFF00" : "var(--gray)"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>

                {/* Comentario opcional */}
                <textarea
                  value={ratingComentario}
                  onChange={(e) => setRatingComentario(e.target.value)}
                  placeholder="Comentario (opcional)..."
                  rows={3}
                  style={{ width: "100%", background: "var(--black)", border: "1px solid var(--gray)", color: "var(--white)", padding: "0.75rem", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.95rem", letterSpacing: "0.03em", outline: "none", resize: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--acid)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--gray)")}
                />

                <button
                  onClick={handleEnviarReseña}
                  disabled={ratingSelected === 0 || ratingSending}
                  style={{ marginTop: "1rem", width: "100%", background: ratingSelected > 0 ? "var(--acid)" : "var(--gray)", color: ratingSelected > 0 ? "var(--black)" : "var(--gray-mid)", border: "none", padding: "1rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.15em", cursor: ratingSelected > 0 && !ratingSending ? "pointer" : "not-allowed", transition: "all 0.2s" }}
                >
                  {ratingSending ? "ENVIANDO..." : "ENVIAR RESEÑA"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Step({ number, label }: { number: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2.5rem 0 1.25rem" }}>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.2em", color: "var(--acid)", opacity: 0.7 }}>{number}</span>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", letterSpacing: "0.04em", color: "var(--white)", margin: 0, lineHeight: 1 }}>{label}</h2>
      <div style={{ flex: 1, height: "1px", background: "var(--gray)" }} />
    </div>
  );
}

function SummaryRow({ label, value, dimmed = false }: { label: string; value: string; dimmed?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gray-light)" }}>{label}</span>
      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "0.05em", color: dimmed ? "var(--gray-mid)" : "var(--white)" }}>{value}</span>
    </div>
  );
}
