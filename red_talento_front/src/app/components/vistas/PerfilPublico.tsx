import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Shield, Wrench, Zap, LogIn, GraduationCap, Play, ExternalLink, Image as ImageIcon } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const nivelStyle: Record<string, React.CSSProperties> = {
  Alto:  { backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
  Medio: { backgroundColor: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" },
  Bajo:  { backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" },
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

type Habilidad = { id: number; nombre: string; nivel: string; tipo: string };
type Evidencia = { id: number; titulo: string; descripcion: string | null; imagen: string | null };
type Insignia = { nombre: string; descripcion: string; icono?: string };

type PerfilData = {
  id: number;
  usuario: { first_name: string; last_name: string; email: string; is_active: boolean };
  especialidad: string;
  grado: string;
  bio: string | null;
  video_pitch: string | null;
  foto_url: string | null;
  foto_perfil: string | null;
  habilidades_aprobadas: Habilidad[];
  insignias_perfil: Insignia[];
  evidencias_perfil: Evidencia[];
};

export function PerfilPublico() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"tecnicas" | "blandas">("tecnicas");

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
    fetch(`${BASE_URL}/api/perfil/estudiante/${id}/`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setPerfil)
      .catch(() => setPerfil(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #E8E4DC", borderTopColor: "#D4AF37", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <GraduationCap style={{ width: 48, height: 48, color: "#C8B89A" }} />
        <p style={{ color: "#8C7B6B", fontSize: "0.9rem" }}>Perfil no encontrado.</p>
        <button onClick={() => navigate("/login")} style={{ padding: "8px 20px", backgroundColor: "#0d1b35", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
          Ir al inicio
        </button>
      </div>
    );
  }

  const nombre = `${perfil.usuario.first_name} ${perfil.usuario.last_name}`.trim();
  const foto = perfil.foto_url ?? perfil.foto_perfil;
  const fotoSrc = foto ? (foto.startsWith("http") ? foto : `${BASE_URL}${foto}`) : null;
  const tecnicas = perfil.habilidades_aprobadas.filter((h) => h.tipo === "tecnica");
  const blandas  = perfil.habilidades_aprobadas.filter((h) => h.tipo === "blanda");
  const validado = perfil.usuario.is_active;

  const ytMatch = perfil.video_pitch?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  const ytId = ytMatch?.[1];

  const evidencias = perfil.evidencias_perfil ?? [];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header institucional */}
      <div style={{ backgroundColor: "#0d1b35", borderBottom: "2px solid #D4AF37", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, backgroundColor: "#D4AF37", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap style={{ width: 16, height: 16, color: "#0d1b35" }} />
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: "0.95rem" }}>
            Red Talento <span style={{ color: "#D4AF37" }}>Caro</span>
          </span>
        </div>
        <button
          onClick={() => navigate("/login")}
          style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
        >
          <LogIn style={{ width: 13, height: 13 }} /> Iniciar sesión
        </button>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 48px" }}>

        {/* Tarjeta principal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ backgroundColor: "white", borderRadius: 18, border: "1px solid #E8E4DC", overflow: "hidden", marginBottom: 16 }}
        >
          {/* Cover */}
          <div style={{ height: 100, backgroundColor: "#0d1b35", backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px", position: "relative" }}>
            <div style={{ position: "absolute", bottom: -36, left: 20 }}>
              {fotoSrc ? (
                <img src={fotoSrc} alt={nombre} style={{ width: 72, height: 72, borderRadius: "50%", border: "3px solid white", objectFit: "cover" }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: "50%", border: "3px solid white", backgroundColor: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#0d1b35", fontWeight: 800, fontSize: "1.5rem" }}>{nombre.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: "44px 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0d1b35", fontFamily: "'Playfair Display', serif" }}>{nombre}</h1>
                <p style={{ margin: "3px 0 0", fontSize: "0.82rem", color: "#64748b" }}>{perfil.especialidad} · Liceo Cardenal Caro</p>
              </div>
              {validado && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "4px 12px", flexShrink: 0 }}>
                  <CheckCircle style={{ width: 13, height: 13, color: "#15803d" }} />
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#15803d" }}>Validado institucionalmente</span>
                </div>
              )}
            </div>

            {perfil.bio && (
              <p style={{ margin: "12px 0 0", fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>{perfil.bio}</p>
            )}

            {/* Insignias */}
            {perfil.insignias_perfil.length > 0 && (
              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {perfil.insignias_perfil.map((ins, i) => (
                  <span key={i} style={{ backgroundColor: "#FBF7EE", border: "1px solid #E8D9A0", borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 700, color: "#92710E" }}>
                    {ins.icono ?? "🏆"} {ins.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Video Pitch */}
        {perfil.video_pitch && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            style={{ backgroundColor: "white", borderRadius: 18, border: "1px solid #E8E4DC", overflow: "hidden", marginBottom: 16 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 20px 14px" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Play style={{ width: 13, height: 13, color: "#D4AF37", marginLeft: 2 }} />
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0d1b35" }}>Video Pitch</span>
            </div>

            <div style={{ padding: "0 20px 20px" }}>
              {ytId ? (
                <a
                  href={perfil.video_pitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", borderRadius: 12, overflow: "hidden", border: "1px solid #E8E4DC", position: "relative", textDecoration: "none" }}
                >
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                    alt="miniatura video"
                    style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                  />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
                      <Play style={{ width: 22, height: 22, color: "#0d1b35", marginLeft: 3 }} />
                    </div>
                  </div>
                  <div style={{ position: "absolute", bottom: 10, right: 12, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "3px 8px", display: "flex", alignItems: "center", gap: 5 }}>
                    <ExternalLink style={{ width: 11, height: 11, color: "white" }} />
                    <span style={{ fontSize: "0.7rem", color: "white", fontWeight: 600 }}>Ver en YouTube</span>
                  </div>
                </a>
              ) : (
                <a
                  href={perfil.video_pitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E4DC", color: "#0d1b35", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none", backgroundColor: "#F6F5F0" }}
                >
                  <Play style={{ width: 13, height: 13, color: "#94a3b8", flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{perfil.video_pitch}</span>
                  <ExternalLink style={{ width: 12, height: 12, color: "#94a3b8", flexShrink: 0 }} />
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* Habilidades validadas */}
        {perfil.habilidades_aprobadas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            style={{ backgroundColor: "white", borderRadius: 18, border: "1px solid #E8E4DC", overflow: "hidden", marginBottom: 16 }}
          >
            <div style={{ padding: "16px 20px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Shield style={{ width: 16, height: 16, color: "#D4AF37" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0d1b35" }}>Conocimientos validados</span>
                <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#94a3b8", backgroundColor: "#F1EDE5", borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>
                  {perfil.habilidades_aprobadas.length} validados
                </span>
              </div>

              <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                {(["tecnicas", "blandas"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "5px 12px", borderRadius: 8, cursor: "pointer",
                      fontSize: "0.75rem", fontWeight: 600, border: "none",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      backgroundColor: tab === t ? "#0d1b35" : "#F6F5F0",
                      color: tab === t ? "white" : "#64748b",
                      transition: "background 0.15s",
                    }}
                  >
                    {t === "tecnicas" ? <Wrench style={{ width: 11, height: 11 }} /> : <Zap style={{ width: 11, height: 11 }} />}
                    {t === "tecnicas" ? `Técnicas (${tecnicas.length})` : `Blandas (${blandas.length})`}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}
              >
                {(tab === "tecnicas" ? tecnicas : blandas).map((h, i) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0d1b35" }}>{h.nombre}</span>
                      <span style={{ ...nivelStyle[h.nivel] ?? nivelStyle.Bajo, borderRadius: 20, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 700 }}>
                        {h.nivel}
                      </span>
                    </div>
                    <div style={{ width: "100%", height: 5, backgroundColor: "#F0EDE8", borderRadius: 4, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nivelPct(h.nivel)}%` }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.06 + 0.1 }}
                        style={{ height: "100%", borderRadius: 4, backgroundColor: nivelBar(h.nivel) }}
                      />
                    </div>
                  </motion.div>
                ))}
                {(tab === "tecnicas" ? tecnicas : blandas).length === 0 && (
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>
                    Sin habilidades {tab} validadas.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Proyectos / Evidencias */}
        {evidencias.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 10px" }}>
              <ImageIcon style={{ width: 15, height: 15, color: "#8C7B6B" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0d1b35" }}>Proyectos y evidencias</span>
              <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#94a3b8", backgroundColor: "#F1EDE5", borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>
                {evidencias.length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {evidencias.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 + 0.2 }}
                  style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid #E8E4DC", overflow: "hidden" }}
                >
                  {ev.imagen && (
                    <img
                      src={ev.imagen.startsWith("http") ? ev.imagen : `${BASE_URL}${ev.imagen}`}
                      alt={ev.titulo}
                      style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }}
                    />
                  )}
                  <div style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: ev.descripcion ? 6 : 0 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <ImageIcon style={{ width: 13, height: 13, color: "#8C7B6B" }} />
                      </div>
                      <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#0d1b35" }}>{ev.titulo}</p>
                    </div>
                    {ev.descripcion && (
                      <p style={{ margin: "0 0 0 34px", fontSize: "0.82rem", color: "#6B5D52", lineHeight: 1.55 }}>{ev.descripcion}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ backgroundColor: "#0d1b35", borderRadius: 14, padding: "20px", textAlign: "center" }}
        >
          <p style={{ margin: "0 0 12px", color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>
            ¿Eres una empresa o reclutador? Accede para ver el perfil completo y contactar directamente al estudiante.
          </p>
          <button
            onClick={() => navigate("/login")}
            style={{ backgroundColor: "#D4AF37", color: "#0d1b35", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Ingresar a Red Talento Caro
          </button>
        </motion.div>
      </div>
    </div>
  );
}
