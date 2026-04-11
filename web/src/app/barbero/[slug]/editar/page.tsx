"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Scissors, Plus, Trash2, Upload, Eye, Save, Clock, ChevronLeft } from "lucide-react";

interface Servicio {
  id?: string;
  nombre: string;
  precio: number;
  duracion_min: number;
  icono: string;
  activo: boolean;
  isNew?: boolean;
}

const ICONOS = ["✦", "◈", "◉", "✂", "◆", "●", "★", "▲"];

export default function EditarBarbero() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [barberoId, setBarberoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [bio, setBio] = useState("");
  const [especialidades, setEspecialidades] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      // Verificar que este slug le pertenece al usuario
      const { data: barbero } = await supabase
        .from("barberos")
        .select("id, slug, bio, especialidades, video_url, profiles(nombre)")
        .eq("slug", slug)
        .single();

      const b = barbero as unknown as { id: string; slug: string; bio: string; especialidades: string[]; video_url: string; profiles: { nombre: string } | null };

      if (!b || b.id !== user.id) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      setBarberoId(b.id);
      setNombre(b.profiles?.nombre ?? "");
      setBio(b.bio ?? "");
      setEspecialidades((b.especialidades ?? []).join(", "));
      setVideoUrl(b.video_url ?? "");

      // Cargar servicios
      const { data: svcs } = await supabase
        .from("servicios")
        .select("*")
        .eq("barbero_id", b.id)
        .eq("activo", true);

      if (svcs && svcs.length > 0) {
        setServicios(svcs);
      } else {
        // Servicios por defecto
        setServicios([
          { nombre: "CORTE CLÁSICO", precio: 40000, duracion_min: 45, icono: "✦", activo: true, isNew: true },
          { nombre: "BARBA", precio: 30000, duracion_min: 30, icono: "◈", activo: true, isNew: true },
          { nombre: "COMBO FULL", precio: 65000, duracion_min: 75, icono: "◉", activo: true, isNew: true },
        ]);
      }

      setLoading(false);
    }
    load();
  }, [slug, router]);

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !barberoId) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${barberoId}/hero.${ext}`;

    const { error } = await supabase.storage
      .from("barberos-media")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from("barberos-media").getPublicUrl(path);
      setVideoUrl(data.publicUrl);
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!barberoId) return;
    setSaving(true);

    const espArray = especialidades
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await supabase.from("barberos").update({
      bio,
      especialidades: espArray,
      video_url: videoUrl || null,
    }).eq("id", barberoId);

    await supabase.from("profiles").update({ nombre }).eq("id", barberoId);

    // Guardar servicios
    for (const svc of servicios) {
      if (svc.isNew || !svc.id) {
        await supabase.from("servicios").insert({
          barbero_id: barberoId,
          nombre: svc.nombre,
          precio: svc.precio,
          duracion_min: svc.duracion_min,
          icono: svc.icono,
          activo: true,
        });
      } else {
        await supabase.from("servicios").update({
          nombre: svc.nombre,
          precio: svc.precio,
          duracion_min: svc.duracion_min,
          icono: svc.icono,
        }).eq("id", svc.id);
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function addServicio() {
    setServicios((prev) => [
      ...prev,
      { nombre: "NUEVO SERVICIO", precio: 30000, duracion_min: 30, icono: "✦", activo: true, isNew: true },
    ]);
  }

  function removeServicio(idx: number) {
    setServicios((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateServicio(idx: number, key: keyof Servicio, value: string | number | boolean) {
    setServicios((prev) => prev.map((s, i) => i === idx ? { ...s, [key]: value } : s));
  }

  if (loading) return (
    <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.2em", color: "var(--acid)" }}>CARGANDO...</span>
    </div>
  );

  if (authError) return (
    <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", color: "var(--white)" }}>SIN ACCESO</h1>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "var(--gray-light)" }}>Este perfil no te pertenece.</p>
      <Link href="/" style={{ color: "var(--acid)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em" }}>← Inicio</Link>
    </div>
  );

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", color: "var(--white)" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--gray)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href={`/barbero/${slug}/panel`} style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--gray-light)", textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            <ChevronLeft size={14} /> Panel
          </Link>
          <div style={{ width: 1, height: 20, background: "var(--gray)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Scissors size={14} color="var(--acid)" />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em" }}>
              BARBER<span style={{ color: "var(--acid)" }}>.IT</span>
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            href={`/barbero/${slug}`}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "transparent", border: "1px solid var(--gray)", color: "var(--gray-light)", padding: "0.5rem 1rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}
          >
            <Eye size={12} /> Ver perfil
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: saved ? "var(--acid)" : "var(--acid)", color: "var(--black)", border: "none", padding: "0.5rem 1.25rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", letterSpacing: "0.1em", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "all 0.2s" }}
          >
            <Save size={13} />
            {saving ? "GUARDANDO..." : saved ? "GUARDADO ✓" : "GUARDAR"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.5rem 6rem" }}>

        {/* Banner bienvenida si es nuevo */}
        {!videoUrl && (
          <div style={{ background: "rgba(205,255,0,0.06)", border: "1px solid rgba(205,255,0,0.2)", padding: "1.25rem 1.5rem", marginBottom: "2.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.2rem" }}>👋</span>
            <div>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em", color: "var(--acid)", margin: "0 0 0.25rem" }}>COMPLETA TU PERFIL</p>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.85rem", color: "var(--gray-light)", margin: 0, lineHeight: 1.5 }}>
                Sube tu video hero, define tus servicios y personaliza tu perfil para que los clientes te encuentren.
              </p>
            </div>
          </div>
        )}

        {/* ── INFO BÁSICA ────────────────────────────────────────────── */}
        <Section number="01" label="INFO BÁSICA" />

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
          <Field label="NOMBRE COMPLETO" value={nombre} onChange={setNombre} placeholder="Jovan Rivera" />
          <Field label="BIO (opcional)" value={bio} onChange={setBio} placeholder="Especialista en fades y diseños desde 2017..." multiline />
          <Field
            label="ESPECIALIDADES (separadas por coma)"
            value={especialidades}
            onChange={setEspecialidades}
            placeholder="Fade, Diseños, Barba"
          />
        </div>

        {/* ── VIDEO HERO ─────────────────────────────────────────────── */}
        <Section number="02" label="VIDEO HERO" />

        <div style={{ marginBottom: "3rem" }}>
          {videoUrl ? (
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              <video
                src={videoUrl}
                muted loop autoPlay playsInline
                style={{ width: "100%", height: 220, objectFit: "cover", display: "block", border: "1px solid var(--gray)" }}
              />
              <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem" }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: "rgba(0,0,0,0.7)", border: "1px solid var(--acid)", color: "var(--acid)", padding: "0.4rem 0.8rem", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <Upload size={10} /> Cambiar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ width: "100%", height: 180, background: "var(--dark2)", border: "2px dashed var(--gray)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--acid)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--gray)")}
            >
              <Upload size={28} color="var(--acid)" />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", color: "var(--white)" }}>
                {uploading ? "SUBIENDO..." : "SUBIR VIDEO HERO"}
              </span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--gray-light)" }}>
                MP4 · Máx 50MB · Aparece como fondo de tu perfil
              </span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleVideoUpload}
            style={{ display: "none" }}
          />
        </div>

        {/* ── SERVICIOS ──────────────────────────────────────────────── */}
        <Section number="03" label="MIS SERVICIOS" />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {servicios.map((svc, idx) => (
            <div key={idx} style={{ background: "var(--dark2)", border: "1px solid var(--gray)", padding: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr auto", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem" }}>
                {/* Icono picker */}
                <select
                  value={svc.icono}
                  onChange={(e) => updateServicio(idx, "icono", e.target.value)}
                  style={{ background: "var(--black)", border: "1px solid var(--gray)", color: "var(--acid)", padding: "0.5rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", cursor: "pointer", width: 52 }}
                >
                  {ICONOS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>

                {/* Nombre */}
                <input
                  value={svc.nombre}
                  onChange={(e) => updateServicio(idx, "nombre", e.target.value.toUpperCase())}
                  style={{ background: "var(--black)", border: "1px solid var(--gray)", color: "var(--white)", padding: "0.5rem 0.75rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.05em", outline: "none", width: "100%" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--acid)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--gray)")}
                />

                {/* Precio */}
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-light)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.85rem" }}>$</span>
                  <input
                    type="number"
                    value={svc.precio}
                    onChange={(e) => updateServicio(idx, "precio", Number(e.target.value))}
                    style={{ background: "var(--black)", border: "1px solid var(--gray)", color: "var(--white)", padding: "0.5rem 0.75rem 0.5rem 1.4rem", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.95rem", outline: "none", width: "100%" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--acid)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--gray)")}
                  />
                </div>

                {/* Borrar */}
                <button
                  onClick={() => removeServicio(idx)}
                  style={{ background: "transparent", border: "1px solid var(--gray)", color: "var(--gray-mid)", padding: "0.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#ff6b6b"; (e.currentTarget as HTMLElement).style.color = "#ff6b6b"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gray)"; (e.currentTarget as HTMLElement).style.color = "var(--gray-mid)"; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Duración */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={11} color="var(--gray-light)" />
                <input
                  type="number"
                  value={svc.duracion_min}
                  onChange={(e) => updateServicio(idx, "duracion_min", Number(e.target.value))}
                  style={{ background: "var(--black)", border: "1px solid var(--gray)", color: "var(--gray-light)", padding: "0.3rem 0.5rem", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", outline: "none", width: 60, textAlign: "center" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--acid)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--gray)")}
                />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em", color: "var(--gray-light)" }}>minutos</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addServicio}
          style={{ width: "100%", background: "transparent", border: "1px dashed var(--gray)", color: "var(--gray-light)", padding: "0.9rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--acid)"; (e.currentTarget as HTMLElement).style.color = "var(--acid)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gray)"; (e.currentTarget as HTMLElement).style.color = "var(--gray-light)"; }}
        >
          <Plus size={14} /> Agregar servicio
        </button>

        {/* Guardar flotante móvil */}
        <div style={{ position: "fixed", bottom: "2rem", right: "1.5rem", zIndex: 200 }} className="show-mobile-save">
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: "var(--acid)", color: "var(--black)", border: "none", padding: "0.9rem 1.75rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", cursor: "pointer", boxShadow: "0 4px 24px rgba(205,255,0,0.3)" }}
          >
            {saving ? "GUARDANDO..." : saved ? "GUARDADO ✓" : "GUARDAR CAMBIOS"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ number, label }: { number: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "0 0 1.5rem" }}>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.2em", color: "var(--acid)", opacity: 0.7 }}>{number}</span>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "0.04em", color: "var(--white)", margin: 0 }}>{label}</h2>
      <div style={{ flex: 1, height: "1px", background: "var(--gray)" }} />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  const style = { width: "100%", background: "var(--dark2)", border: "1px solid var(--gray)", padding: "0.85rem 1rem", color: "var(--white)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", letterSpacing: "0.05em", outline: "none", resize: "vertical" as const };
  return (
    <div>
      <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gray-light)", marginBottom: "0.4rem" }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={style} onFocus={(e) => (e.target.style.borderColor = "var(--acid)")} onBlur={(e) => (e.target.style.borderColor = "var(--gray)")} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={style} onFocus={(e) => (e.target.style.borderColor = "var(--acid)")} onBlur={(e) => (e.target.style.borderColor = "var(--gray)")} />
      }
    </div>
  );
}
