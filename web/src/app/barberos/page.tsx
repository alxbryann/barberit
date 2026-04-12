"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

type BarberRow = {
  id: string;
  slug: string;
  especialidades: string[];
  total_cortes: number;
  nombre_barberia: string | null;
  profiles: { nombre: string } | null;
};

const CARD_BGS = ["#1a1a1a", "#141414", "#161616", "#131313"];

function initialsFromNombre(nombre: string, slug: string) {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return slug.slice(0, 2).toUpperCase();
}

export default function CatalogoBarberosPage() {
  const [barbers, setBarbers] = useState<BarberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      setFetchError("Tiempo de espera agotado. Recarga la página.");
    }, 8000);
    async function fetchBarbers() {
      try {
        const { data, error } = await supabase
          .from("barberos")
          .select("id, slug, especialidades, total_cortes, nombre_barberia, profiles(nombre)");
        clearTimeout(timeout);
        if (error) {
          console.error("[barberos fetch error]", error);
          setFetchError(error.message);
        } else if (data) {
          setBarbers(data as unknown as BarberRow[]);
        }
      } catch (err) {
        clearTimeout(timeout);
        console.error("[barberos fetch exception]", err);
        setFetchError(String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchBarbers();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <Navbar />
      <main
        id="barberos"
        style={{
          background: "var(--black)",
          minHeight: "100vh",
          paddingTop: "64px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2.5rem 2.5rem 1rem",
          }}
        >
          <Link
            href="/#reservar"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.8rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--gray-mid)",
              textDecoration: "none",
              marginBottom: "2rem",
            }}
          >
            <ArrowLeft size={16} />
            Volver a reservar
          </Link>

          <div style={{ marginBottom: "2.5rem" }}>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.75rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--acid)",
                display: "block",
                marginBottom: "0.75rem",
              }}
            >
              Barber.it · Bogotá
            </span>
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                letterSpacing: "0.02em",
                color: "var(--white)",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Catálogo de barberos
            </h1>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "1rem",
                color: "var(--gray-light)",
                margin: "1rem 0 0",
                maxWidth: "480px",
                lineHeight: 1.5,
              }}
            >
              Elige tu barbero y entra a su perfil para ver servicios y reservar
              turno.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "0 2.5rem 5rem",
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5px",
            background: "var(--gray)",
          }}
          className="catalogo-grid"
        >
          {loading && (
            <div
              style={{
                gridColumn: "1 / -1",
                background: "var(--black)",
                padding: "3rem",
                textAlign: "center",
                fontFamily: "'Barlow', sans-serif",
                color: "var(--gray-mid)",
              }}
            >
              Cargando barberos…
            </div>
          )}
          {!loading &&
            barbers.map((b, index) => {
              const nombrePersona =
                b.profiles?.nombre?.trim() || b.slug.replace(/-/g, " ");
              const nombre =
                b.nombre_barberia?.trim() || nombrePersona;
              const nombreDisplay = nombre.toUpperCase();
              const specialty =
                b.especialidades?.length > 0
                  ? b.especialidades.join(" · ")
                  : "Fade · Diseños · Barba";
              const bg = CARD_BGS[index % CARD_BGS.length];
              const ini = initialsFromNombre(nombrePersona, b.slug);

              return (
                <div
                  key={b.id}
                  onMouseEnter={() => setHovered(b.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background:
                      hovered === b.id ? "#1c1c1c" : "var(--black)",
                    transition: "background 0.3s",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Link
                    href={`/barbero/${b.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        aspectRatio: "3/4",
                        background: bg,
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: "8rem",
                          color: "rgba(255,255,255,0.04)",
                          userSelect: "none",
                        }}
                      >
                        {ini}
                      </span>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundImage: `linear-gradient(rgba(205,255,0,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(205,255,0,0.03) 1px, transparent 1px)`,
                          backgroundSize: "30px 30px",
                        }}
                      />
                      {b.total_cortes > 0 && (
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
                            {b.total_cortes.toLocaleString()} cortes
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: "1.25rem 1.25rem 1.5rem" }}>
                      <h2
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: "1.3rem",
                          letterSpacing: "0.04em",
                          color: "var(--white)",
                          margin: "0 0 0.75rem",
                          lineHeight: 1,
                        }}
                      >
                        {nombreDisplay}
                      </h2>
                      <p
                        style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontSize: "0.78rem",
                          color: "var(--gray-light)",
                          margin: "0 0 1rem",
                          lineHeight: 1.4,
                        }}
                      >
                        {specialty}
                      </p>
                      <span
                        style={{
                          display: "block",
                          textAlign: "center",
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color:
                            hovered === b.id ? "var(--black)" : "var(--acid)",
                          background:
                            hovered === b.id ? "var(--acid)" : "transparent",
                          border: "1px solid var(--acid)",
                          padding: "0.6rem",
                          transition: "background 0.25s, color 0.25s",
                        }}
                      >
                        Ver perfil
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}

          {!loading && fetchError && (
            <div
              style={{
                gridColumn: "1 / -1",
                background: "var(--black)",
                padding: "3rem",
                textAlign: "center",
                fontFamily: "'Barlow', sans-serif",
                color: "#ff4444",
              }}
            >
              Error: {fetchError}
            </div>
          )}
          {!loading && !fetchError && barbers.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                background: "var(--black)",
                padding: "3rem",
                textAlign: "center",
                fontFamily: "'Barlow', sans-serif",
                color: "var(--gray-mid)",
              }}
            >
              Aún no hay barberos en la plataforma.{" "}
              <Link
                href="/auth/registro"
                style={{ color: "var(--acid)", textDecoration: "none" }}
              >
                Registrate como barbero
              </Link>
              .
            </div>
          )}
        </div>

        <style>{`
          @media (max-width: 768px) {
            .catalogo-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .catalogo-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
