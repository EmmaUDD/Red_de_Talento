import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  CheckCircle, Award, Wrench, Zap, Clock, ArrowLeft,
  MapPin, Shield, Image as ImageIcon, Loader2, Play, ExternalLink, Mail,
} from "lucide-react";
import { perfilApi, feedApi } from "@/api/api";
import type { EstudiantePerfil, Habilidad, FeedPost } from "@/app/types";
import { PostList } from "./PostList";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const FONT_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const disponibilidadLabel: Record<string, string> = {
  part_time: "Part-time", full_time: "Full-time",
  fines_de_semana: "Fines de semana", practicas: "Práctica laboral",
};

function nivelPct(nivel: string) {
  if (nivel === "Alto") return 88;
  if (nivel === "Medio") return 60;
  return 35;
}

function nivelBar(nivel: string) {
  if (nivel === "Alto") return "#10b981";
  if (nivel === "Medio") return "#f59e0b";
  return "#ef4444";
}

const nivelStyle: Record<string, React.CSSProperties> = {
  Alto: { backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 20, fontSize: 11, padding: "2px 8px", fontWeight: 700 },
  Medio: { backgroundColor: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", borderRadius: 20, fontSize: 11, padding: "2px 8px", fontWeight: 700 },
  Bajo: { backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 20, fontSize: 11, padding: "2px 8px", fontWeight: 700 },
};

function HabilidadRow({ h, delay }: { h: Habilidad; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#0d1b35" }}>
          {h.nombre}
        </span>
        <span style={nivelStyle[h.nivel ?? "Bajo"] ?? nivelStyle.Bajo}>{h.nivel}</span>
      </div>
      <div style={{ width: "100%", height: 5, backgroundColor: "#F0EDE8", borderRadius: 4, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${nivelPct(h.nivel ?? "")}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: delay + 0.1 }}
          style={{ height: "100%", borderRadius: 4, backgroundColor: nivelBar(h.nivel ?? "") }}
        />
      </div>
    </motion.div>
  );
}

export function VistaEstudiante() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<EstudiantePerfil | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"publicaciones" | "perfil" | "competencias" | "evidencias">("publicaciones");

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
    perfilApi.getEstudiante(Number(id))
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

  const foto = perfil.foto_perfil ?? perfil.foto;
  const fotoSrc = foto ? (foto.startsWith("http") ? foto : `${BASE_URL}${foto}`) : null;
  const techSkills = perfil.habilidades.filter((h) => h.tipo === "tecnica");
  const softSkills = perfil.habilidades.filter((h) => h.tipo === "blanda");

  const tabs = [
    { id: "publicaciones" as const, label: "Publicaciones" },
    { id: "perfil" as const, label: "Perfil" },
    { id: "competencias" as const, label: "Competencias" },
    { id: "evidencias" as const, label: "Evidencias" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DC" }}>

        {/* Cover — full width, no maxWidth wrapper */}
        <div style={{
          height: 160,
          backgroundColor: "#0d1b35",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          position: "relative",
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: 14,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.75)",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "5px 12px",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <ArrowLeft style={{ width: 13, height: 13 }} /> Volver
          </button>

          {perfil.validado && (
            <div style={{
              position: "absolute",
              top: 14,
              right: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              backgroundColor: "rgba(212,175,55,0.15)",
              border: "1px solid rgba(212,175,55,0.4)",
              borderRadius: 20,
              padding: "4px 12px",
            }}>
              <CheckCircle style={{ width: 13, height: 13, color: "#D4AF37" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#D4AF37" }}>Validado</span>
            </div>
          )}
        </div>

        {/* Identity + tabs — maxWidth centered container */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

          {/* Avatar + name row — overlaps cover */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: -44 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {fotoSrc ? (
                <img
                  src={fotoSrc}
                  alt={perfil.nombre}
                  style={{ width: 96, height: 96, borderRadius: 18, objectFit: "cover", border: "4px solid #FFFFFF", display: "block" }}
                />
              ) : (
                <div style={{
                  width: 96, height: 96, borderRadius: 18,
                  backgroundColor: "#0d1b35", border: "4px solid #FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2.2rem", fontWeight: 700, color: "#D4AF37" }}>
                    {perfil.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {perfil.validado && (
                <div style={{
                  position: "absolute", bottom: -4, right: -4,
                  width: 24, height: 24, borderRadius: "50%",
                  backgroundColor: "#D4AF37", border: "3px solid #FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
                }}>
                  <CheckCircle style={{ width: 13, height: 13, color: "#FFFFFF" }} />
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingBottom: 12, paddingTop: 48 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.5rem", fontWeight: 700, color: "#0d1b35",
                margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {perfil.nombre}
              </h1>
              <p style={{ fontSize: "0.95rem", color: "#6B5D52", margin: "3px 0 0", fontWeight: 600 }}>
                {perfil.especialidad}
              </p>
              {perfil.curso && (
                <p style={{ fontSize: "0.82rem", color: "#8C7B6B", margin: "2px 0 0" }}>
                  {perfil.curso} · Liceo Cardenal Caro · Lo Espejo
                </p>
              )}
            </div>
          </div>

          {/* Availability + insignias */}
          <div style={{ padding: "12px 0 0" }}>
            {perfil.disponibilidad && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                backgroundColor: "#F0EDE8", borderRadius: 20, padding: "4px 12px",
                fontSize: "0.82rem", color: "#6B5D52", fontWeight: 600, marginBottom: 10,
              }}>
                <Clock style={{ width: 12, height: 12 }} />
                {disponibilidadLabel[perfil.disponibilidad] ?? perfil.disponibilidad}
              </span>
            )}
            {perfil.insignias.length > 0 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" } as React.CSSProperties}>
                {perfil.insignias.map((b) => (
                  <span key={b.id} style={{
                    flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "4px 12px",
                    borderRadius: 20, backgroundColor: "#FFFBF0", border: "1px solid #D4AF37",
                    color: "#B8962E", whiteSpace: "nowrap",
                  }}>
                    {b.icono} {b.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tab nav */}
          <div style={{ display: "flex", borderBottom: "2px solid #E8E4DC", marginTop: 4 }}>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <PostList posts={posts} nombre={perfil.nombre} fotoSrc={fotoSrc} />
          </motion.div>
        )}

        {/* Perfil */}
        {tab === "perfil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 20 }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Sobre mí
              </p>
              <p style={{ fontSize: "0.92rem", color: "#4A3F35", lineHeight: 1.7 }}>
                {perfil.bio
                  ? perfil.bio
                  : <span style={{ color: "#A8998A", fontStyle: "italic" }}>No ha agregado una descripción.</span>
                }
              </p>
            </div>

            {/* Video pitch */}
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 20px 12px" }}>
                <Play style={{ width: 14, height: 14, color: "#94a3b8" }} />
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#0d1b35" }}>
                  Video Pitch
                </p>
              </div>
              {perfil.video_pitch ? (
                <div style={{ padding: "0 20px 20px" }}>
                  {(() => {
                    const ytMatch = perfil.video_pitch.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                    const videoId = ytMatch?.[1];
                    return videoId ? (
                      <a
                        href={perfil.video_pitch}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "block", borderRadius: 12, overflow: "hidden", border: "1px solid #E8E4DC", position: "relative" }}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt="miniatura video"
                          style={{ width: "100%", objectFit: "cover", aspectRatio: "16/9", display: "block" }}
                        />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
                          <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Play style={{ width: 20, height: 20, color: "#0d1b35", marginLeft: 3 }} />
                          </div>
                        </div>
                      </a>
                    ) : (
                      <a
                        href={perfil.video_pitch}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E4DC", color: "#0d1b35", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", backgroundColor: "#FAFAF9" }}
                      >
                        <Play style={{ width: 13, height: 13, color: "#94a3b8", flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{perfil.video_pitch}</span>
                        <ExternalLink style={{ width: 12, height: 12, color: "#94a3b8", flexShrink: 0 }} />
                      </a>
                    );
                  })()}
                </div>
              ) : (
                <div style={{ margin: "0 20px 20px", borderRadius: 10, backgroundColor: "#FAFAF9", border: "2px dashed #E8E4DC", aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Play style={{ width: 28, height: 28, color: "#D4D0C8" }} />
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.75rem", textAlign: "center" }}>
                    Este estudiante no ha subido su video pitch aún.
                  </p>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 20 }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                Información
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <InfoRow icon={Award} text={perfil.especialidad} />
                {perfil.curso && <InfoRow icon={Zap} text={perfil.curso} />}
                {perfil.comuna && <InfoRow icon={MapPin} text={perfil.comuna} />}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: perfil.validado ? "#FFFBF0" : "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Shield style={{ width: 14, height: 14, color: perfil.validado ? "#D4AF37" : "#A8998A" }} />
                  </div>
                  <span style={{ fontSize: "0.9rem", fontWeight: perfil.validado ? 700 : 400, color: perfil.validado ? "#B8962E" : "#A8998A" }}>
                    {perfil.validado ? "Validado institucionalmente" : "Pendiente de validación"}
                  </span>
                </div>
              </div>
            </div>

            {perfil.email && (
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 20 }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                  Contacto
                </p>
                <a
                  href={`mailto:${perfil.email}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 10,
                    border: "1px solid #E8E4DC", backgroundColor: "#F6F5F0",
                    color: "#0d1b35", fontSize: "0.88rem", fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Mail style={{ width: 14, height: 14, color: "#D4AF37" }} />
                  </div>
                  {perfil.email}
                </a>
              </div>
            )}
          </motion.div>
        )}

        {/* Competencias */}
        {tab === "competencias" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {techSkills.length > 0 && (
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Wrench style={{ width: 15, height: 15, color: "#D4AF37" }} />
                  </div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>
                    Habilidades técnicas
                  </p>
                  <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, backgroundColor: "#F0EDE8", color: "#6B5D52" }}>
                    {techSkills.length}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {techSkills.map((h, i) => <HabilidadRow key={h.id} h={h} delay={i * 0.07} />)}
                </div>
              </div>
            )}

            {softSkills.length > 0 && (
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap style={{ width: 15, height: 15, color: "#FFFFFF" }} />
                  </div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>
                    Habilidades blandas
                  </p>
                  <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, backgroundColor: "#F0EDE8", color: "#6B5D52" }}>
                    {softSkills.length}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {softSkills.map((h, i) => <HabilidadRow key={h.id} h={h} delay={i * 0.07} />)}
                </div>
              </div>
            )}

            {techSkills.length === 0 && softSkills.length === 0 && (
              <EmptyCard text="No hay competencias registradas." />
            )}
          </motion.div>
        )}

        {/* Evidencias */}
        {tab === "evidencias" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {perfil.evidencias && perfil.evidencias.length > 0 ? (
              perfil.evidencias.map((ev) => (
                <div key={ev.id} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, overflow: "hidden" }}>
                  {ev.imagen && (
                    <img src={ev.imagen} alt={ev.titulo} style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }} />
                  )}
                  <div style={{ padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <ImageIcon style={{ width: 15, height: 15, color: "#A8998A" }} />
                      <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>
                        {ev.titulo}
                      </p>
                    </div>
                    {ev.descripcion && (
                      <p style={{ fontSize: "0.88rem", color: "#6B5D52", lineHeight: 1.6, margin: 0 }}>{ev.descripcion}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyCard text="No hay evidencias registradas." />
            )}
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

function EmptyCard({ text }: { text: string }) {
  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 40, textAlign: "center" }}>
      <p style={{ fontSize: "0.88rem", color: "#A8998A", margin: 0 }}>{text}</p>
    </div>
  );
}
