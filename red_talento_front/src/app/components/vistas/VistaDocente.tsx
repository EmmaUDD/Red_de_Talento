import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  BookOpen, Award, MapPin, ArrowLeft, Loader2,
  ShieldCheck, Mail, Clock, GraduationCap,
} from "lucide-react";
import { perfilApi, feedApi } from "@/api/api";
import type { DocenteResult, FeedPost } from "@/app/types";
import { PostList } from "./PostList";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const FONT_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const nivelLabel: Record<string, string> = {
  junior: "Junior",
  intermedio: "Intermedio",
  senior: "Senior",
  experto: "Experto",
};

export function VistaDocente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<DocenteResult | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"publicaciones" | "perfil" | "info">("publicaciones");

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    perfilApi.getDocente(Number(id))
      .then((p) => {
        setPerfil(p);
        if (p.usuario_id) {
          feedApi.getPostsDeUsuario(p.usuario_id).then(setPosts).catch(() => {});
        }
      })
      .catch(() => setPerfil(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: "#D4AF37" }} />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "#8C7B6B" }}>Perfil no encontrado.</p>
        <button
          onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "#A8998A", background: "none", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Volver
        </button>
      </div>
    );
  }

  const foto = perfil.foto_url ?? perfil.foto_perfil;
  const fotoSrc = foto ? (foto.startsWith("http") ? foto : `${BASE_URL}${foto}`) : null;

  const tabs: { id: "publicaciones" | "perfil" | "info"; label: string }[] = [
    { id: "publicaciones", label: "Publicaciones" },
    { id: "perfil", label: "Perfil" },
    { id: "info", label: "Información" },
  ];

  const kpis = [
    { label: "Nivel", value: perfil.nivel ? (nivelLabel[perfil.nivel] ?? perfil.nivel) : "—" },
    { label: "Institución", value: "Liceo Caro" },
    { label: "Comuna", value: "Lo Espejo" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

<div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DC" }}>

        {/* Cover — full width, no maxWidth */}
        <div style={{
            height: 160,
            backgroundColor: "#0d1b35",
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            position: "relative",
          }}>
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              style={{
                position: "absolute",
                top: 14,
                left: 16,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.75)",
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: "5px 12px",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <ArrowLeft style={{ width: 13, height: 13 }} /> Volver
            </button>

            {/* Verified badge */}
            <div style={{
              position: "absolute",
              top: 14,
              right: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              backgroundColor: "rgba(212,175,55,0.15)",
              border: "1px solid rgba(212,175,55,0.4)",
              borderRadius: 20,
              padding: "4px 12px",
            }}>
              <ShieldCheck style={{ width: 13, height: 13, color: "#D4AF37" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#D4AF37" }}>Docente Verificado</span>
            </div>
          </div>

        {/* Identity + tabs — maxWidth centered container */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

          {/* Avatar + identity — overlaps cover */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: -44 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 96, height: 96, borderRadius: 18,
                border: "4px solid #FFFFFF", overflow: "hidden",
                backgroundColor: "#0d1b35",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {fotoSrc ? (
                  <img src={fotoSrc} alt={perfil.nombre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2.2rem", fontWeight: 700, color: "#D4AF37" }}>
                    {perfil.nombre.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{
                position: "absolute", bottom: -4, right: -4,
                width: 26, height: 26, borderRadius: 8,
                backgroundColor: "#D4AF37", border: "3px solid #FFFFFF",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
              }}>
                <Award style={{ width: 14, height: 14, color: "#FFFFFF" }} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingBottom: 12, paddingTop: 48 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.5rem", fontWeight: 700, color: "#0d1b35",
                margin: 0, lineHeight: 1.2,
              }}>
                Prof. {perfil.nombre}
              </h1>
              {perfil.departamento && (
                <p style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.92rem", color: "#6B5D52", fontWeight: 600, margin: "3px 0 0" }}>
                  <BookOpen style={{ width: 13, height: 13 }} />
                  {perfil.departamento}
                </p>
              )}
              <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem", color: "#A8998A", margin: "2px 0 0" }}>
                <MapPin style={{ width: 12, height: 12 }} />
                Liceo Cardenal Caro · Lo Espejo
              </p>
            </div>
          </div>

          {/* KPI row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            margin: "16px 0 0",
            backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 12,
          }}>
            {kpis.map((k, i) => (
              <div key={k.label} style={{
                textAlign: "center", padding: "12px 8px",
                borderRight: i < 2 ? "1px solid #E8E4DC" : "none",
              }}>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.92rem", fontWeight: 700, color: "#0d1b35", margin: 0, lineHeight: 1.2 }}>
                  {k.value}
                </p>
                <p style={{ fontSize: "0.72rem", color: "#8C7B6B", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {k.label}
                </p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #E8E4DC", marginTop: 16 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, padding: "10px 4px",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: 600,
                  color: tab === t.id ? "#0d1b35" : "#94a3b8",
                  borderBottom: tab === t.id ? "2px solid #D4AF37" : "2px solid transparent",
                  marginBottom: -2,
                  transition: "color 0.15s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 768, margin: "0 auto", padding: "20px 16px" }}>

        {/* Publicaciones */}
        {tab === "publicaciones" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PostList posts={posts} nombre={`Prof. ${perfil.nombre}`} fotoSrc={fotoSrc} />
          </motion.div>
        )}

        {/* Perfil */}
        {tab === "perfil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 20 }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Sobre el docente
              </p>
              <p style={{ fontSize: "0.92rem", color: "#4A3F35", lineHeight: 1.7, margin: 0 }}>
                {perfil.bio || "Docente con amplia experiencia en formación técnico-profesional. Comprometido con la empleabilidad real de los estudiantes del Liceo Cardenal Caro."}
              </p>
            </div>

            {perfil.departamento && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: 20,
                  backgroundColor: "#F0EDE8",
                  border: "1px solid #E8E4DC",
                  color: "#4A3F35",
                }}>
                  {perfil.departamento}
                </span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: 20,
                  backgroundColor: "#FFFBF0",
                  border: "1px solid #D4AF37",
                  color: "#B8962E",
                }}>
                  ✓ Docente Verificado
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Información */}
        {tab === "info" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 20 }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                Información institucional
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {perfil.departamento && (
                  <InfoRow icon={GraduationCap} text={perfil.departamento} />
                )}
                <InfoRow icon={MapPin} text="Liceo Cardenal Caro, Lo Espejo, RM" />
                <InfoRow icon={Clock} text="Disponible: Lun–Vie · 08:00–18:00 hrs" />
                {perfil.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Mail style={{ width: 14, height: 14, color: "#8C7B6B" }} />
                    </div>
                    <a href={`mailto:${perfil.email}`} style={{ fontSize: "0.9rem", color: "#0d1b35", fontWeight: 600, textDecoration: "none" }}>
                      {perfil.email}
                    </a>
                  </div>
                )}
                {perfil.nivel && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor: "#FFFBF0",
                      border: "1px solid #F5E6C0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <ShieldCheck style={{ width: 14, height: 14, color: "#D4AF37" }} />
                    </div>
                    <span style={{ fontSize: "0.9rem", color: "#4A3F35" }}>
                      Nivel:{" "}
                      <span style={{ fontWeight: 700, color: "#0d1b35" }}>
                        {nivelLabel[perfil.nivel] ?? perfil.nivel}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon style={{ width: 14, height: 14, color: "#8C7B6B" }} />
      </div>
      <span style={{ fontSize: "0.9rem", color: "#4A3F35" }}>{text}</span>
    </div>
  );
}
