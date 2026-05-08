import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Search, MapPin, Clock, Briefcase, CheckCircle, Bookmark,
  Send, X, Star, Building2, ListChecks, Award,
} from "lucide-react";
import { ofertasApi, postulacionesApi } from "@/api/api";
import { useAuth } from "@/app/context/AuthContext";
import type { OfertaLaboral, Postulacion } from "@/app/types";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const TIPOS = ["Todos", "Part-time", "Full-time", "Práctica"];
const ESPECIALIDADES = [
  "Todas",
  "Electricidad",
  "Construcción",
  "Computación e Informática",
  "Mecánica Automotriz",
];

const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente",
  revisado: "En revisión",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
};

const estadoStyle: Record<string, React.CSSProperties> = {
  pendiente: { backgroundColor: "#FFFBF0", color: "#b45309", border: "1px solid #fde68a" },
  revisado:  { backgroundColor: "#EFF6FF", color: "#1d4ed8", border: "1px solid #bfdbfe" },
  aceptado:  { backgroundColor: "#F0FDF4", color: "#15803d", border: "1px solid #bbf7d0" },
  rechazado: { backgroundColor: "#FEF2F2", color: "#dc2626", border: "1px solid #fecaca" },
};

const tipoStyle: Record<string, React.CSSProperties> = {
  "Part-time": { backgroundColor: "#FFFBF0", color: "#b45309", border: "1px solid #fde68a" },
  "Full-time": { backgroundColor: "#F0FDF4", color: "#15803d", border: "1px solid #bbf7d0" },
  "Práctica":  { backgroundColor: "#EFF6FF", color: "#1d4ed8", border: "1px solid #bfdbfe" },
};

const tipoAccent: Record<string, string> = {
  "Part-time": "#f59e0b",
  "Full-time":  "#10b981",
  "Práctica":   "#3b82f6",
};

const S = {
  label: {
    fontSize: "0.68rem", fontWeight: 700 as const,
    color: "#94a3b8", textTransform: "uppercase" as const,
    letterSpacing: "0.08em", margin: 0,
  } as React.CSSProperties,
};

function Spinner() {
  return (
    <div
      className="animate-spin"
      style={{
        width: 22, height: 22, borderRadius: "50%",
        border: "2.5px solid #E8E4DC", borderTopColor: "#D4AF37",
      }}
    />
  );
}

function JobDetailModal({
  job,
  yaPostule,
  onPostular,
  onClose,
}: {
  job: OfertaLaboral;
  yaPostule: boolean;
  onPostular: (mensaje: string) => Promise<void>;
  onClose: () => void;
}) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(yaPostule);
  const [mensaje, setMensaje] = useState("");
  const accent = tipoAccent[job.tipo] ?? "#D4AF37";

  const handlePostular = async () => {
    setApplying(true);
    try {
      await onPostular(mensaje);
      setApplied(true);
    } catch { /* noop */ }
    finally { setApplying(false); }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        backgroundColor: "rgba(13,27,53,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      className="md:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.22)",
        }}
        className="md:rounded-2xl md:max-w-lg md:my-4"
      >
        <div
          style={{
            backgroundColor: "#0d1b35",
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            padding: "22px 20px 18px",
            borderBottom: `3px solid ${accent}`,
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 14,
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8, padding: 6,
              cursor: "pointer", display: "flex",
            }}
          >
            <X style={{ width: 14, height: 14, color: "rgba(255,255,255,0.7)" }} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                backgroundColor: "rgba(255,255,255,0.08)",
                border: `1.5px solid ${accent}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span style={{ color: accent, fontWeight: 800, fontSize: "1.3rem", fontFamily: "'Playfair Display', serif" }}>
                {job.empresa.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <h2 style={{ color: "white", margin: 0, fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.1rem" }}>
                  {job.titulo}
                </h2>
                {job.empresa_verificada && (
                  <CheckCircle style={{ width: 14, height: 14, color: "#D4AF37", flexShrink: 0 }} />
                )}
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", margin: "3px 0 0" }}>
                {job.empresa}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(
              [
                { icon: <Briefcase style={{ width: 11, height: 11 }} />, label: job.tipo },
                job.salario ? { icon: null, label: `$${Number(job.salario).toLocaleString("es-CL")}` } : null,
                { icon: <MapPin style={{ width: 11, height: 11 }} />, label: job.ubicacion },
                { icon: null, label: `🖥 ${job.modalidad}` },
              ] as ({ icon: React.ReactNode; label: string } | null)[]
            ).filter(Boolean).map((chip, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: "0.7rem", fontWeight: 600,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.8)",
                  borderRadius: 20, padding: "4px 10px",
                }}
              >
                {chip!.icon}{chip!.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <p style={{ ...S.label, marginBottom: 7 }}>Descripción</p>
            <p style={{ color: "#334155", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>
              {job.descripcion}
            </p>
          </div>

          {job.requisitos?.length > 0 && (
            <div>
              <p style={{ ...S.label, marginBottom: 9 }}>Requisitos</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                {job.requisitos.map((r, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div
                      style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        backgroundColor: "#FFFBF0", border: "1.5px solid #D4AF37",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <CheckCircle style={{ width: 10, height: 10, color: "#D4AF37" }} />
                    </div>
                    <span style={{ color: "#475569", fontSize: "0.84rem" }}>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!applied && (
            <div>
              <label style={{ display: "block", ...S.label, marginBottom: 6 }}>
                Mensaje al empleador{" "}
                <span style={{ color: "#cbd5e1", textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>
                  (opcional)
                </span>
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={3}
                placeholder="Cuéntale brevemente por qué eres el candidato ideal..."
                style={{
                  width: "100%", boxSizing: "border-box",
                  backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
                  borderRadius: 10, padding: "10px 14px",
                  fontSize: "0.875rem", color: "#0d1b35",
                  resize: "none", outline: "none", lineHeight: 1.55,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "border-color 0.15s",
                }}
                onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; }}
                onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; }}
              />
            </div>
          )}

          <div
            style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              backgroundColor: "#FFFBF0", border: "1px solid #fde68a",
              borderRadius: 12, padding: "11px 14px",
            }}
          >
            <Star style={{ width: 14, height: 14, color: "#D4AF37", flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: "#92400e", fontSize: "0.78rem", lineHeight: 1.5, margin: 0 }}>
              Al postular, la empresa verá tu perfil con habilidades validadas por el Liceo Cardenal Caro.
            </p>
          </div>

          {applied ? (
            <div
              style={{
                backgroundColor: "#F0FDF4", border: "1px solid #bbf7d0",
                borderRadius: 14, padding: "18px 20px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "#15803d", fontWeight: 700, fontSize: "0.9rem", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ✓ Postulación enviada exitosamente
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handlePostular}
                disabled={applying}
                style={{
                  flex: 1, backgroundColor: applying ? "#E8E4DC" : "#0d1b35",
                  color: applying ? "#94a3b8" : "#FFFFFF",
                  border: "none", borderRadius: 14, padding: "13px 20px",
                  fontSize: "0.875rem", fontWeight: 700,
                  cursor: applying ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "background-color 0.15s",
                }}
              >
                {applying ? (
                  <Spinner />
                ) : (
                  <Send style={{ width: 15, height: 15 }} />
                )}
                {applying ? "Enviando…" : "Postular con mi Pasaporte"}
              </button>
              <button
                style={{
                  padding: 13, borderRadius: 14,
                  border: "1px solid #E8E4DC", backgroundColor: "#F6F5F0",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Bookmark style={{ width: 18, height: 18, color: "#94a3b8" }} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function StudentEmpleos() {
  const { user } = useAuth();
  const [mainTab, setMainTab] = useState<"ofertas" | "postulaciones">("ofertas");
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const [selectedSpec, setSelectedSpec] = useState("Todas");
  const [saved, setSaved] = useState<number[]>([]);
  const [postulados, setPostulados] = useState<number[]>([]);
  const [activeJob, setActiveJob] = useState<OfertaLaboral | null>(null);
  const [ofertas, setOfertas] = useState<OfertaLaboral[]>([]);
  const [loading, setLoading] = useState(true);
  const [misPostulaciones, setMisPostulaciones] = useState<Postulacion[]>([]);
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(false);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.href = FONT_URL; link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const loadOfertas = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedType !== "Todos") params.tipo = selectedType;
      if (selectedSpec !== "Todas") params.especialidad = selectedSpec;
      const res = await ofertasApi.getAll(params);
      setOfertas(res.results);
      setPostulados(res.results.filter((o) => o.ya_postule).map((o) => o.id));
    } catch {
      setOfertas([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedSpec]);

  const loadMisPostulaciones = useCallback(async () => {
    setLoadingPostulaciones(true);
    try {
      const data = await postulacionesApi.getMias();
      setMisPostulaciones(data);
    } catch {
      setMisPostulaciones([]);
    } finally {
      setLoadingPostulaciones(false);
    }
  }, []);

  useEffect(() => { loadOfertas(); }, [loadOfertas]);
  useEffect(() => {
    if (mainTab === "postulaciones") loadMisPostulaciones();
  }, [mainTab, loadMisPostulaciones]);

  const filtered = ofertas.filter((j) => {
    if (postulados.includes(j.id)) return false;
    const q = query.toLowerCase();
    return !q || j.titulo.toLowerCase().includes(q) || j.empresa.toLowerCase().includes(q) || j.ubicacion.toLowerCase().includes(q);
  });

  const handlePostular = async (ofertaId: number, mensaje: string) => {
    await postulacionesApi.postular(ofertaId, mensaje);
    setPostulados((p) => [...p, ofertaId]);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div style={{ backgroundColor: "white", borderBottom: "1px solid #E8E4DC" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 0" }}>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
            <div>
              <h1 style={{
                margin: 0, color: "#0d1b35",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700, fontSize: "1.3rem", lineHeight: 1.2,
              }}>
                Empleos para ti
              </h1>
              <p style={{ margin: "4px 0 0", color: "#8C7B6B", fontSize: "0.8rem" }}>
                {user?.especialidad ? `Especialidad: ${user.especialidad}` : "Ofertas laborales disponibles"}
              </p>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
              backgroundColor: "#FFFBF0", border: "1px solid #fde68a",
              borderRadius: 20, padding: "5px 12px",
            }}>
              <Award style={{ width: 12, height: 12, color: "#D4AF37" }} />
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#b45309" }}>
                Pasaporte de Oficio
              </span>
            </div>
          </div>

          <div style={{ display: "flex", borderBottom: "2px solid #E8E4DC" }}>
            {(["ofertas", "postulaciones"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMainTab(t)}
                style={{
                  flex: 1, padding: "10px 4px",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "0.83rem", fontWeight: 600,
                  color: mainTab === t ? "#0d1b35" : "#94a3b8",
                  borderBottom: mainTab === t ? "2px solid #D4AF37" : "2px solid transparent",
                  marginBottom: -2,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "color 0.15s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {t === "postulaciones" && <ListChecks style={{ width: 13, height: 13 }} />}
                {t === "ofertas" ? "Ofertas" : "Mis postulaciones"}
                {t === "postulaciones" && misPostulaciones.length > 0 && (
                  <span style={{
                    fontSize: "0.62rem", fontWeight: 700,
                    backgroundColor: "#0d1b35", color: "white",
                    borderRadius: 20, padding: "1px 6px",
                  }}>
                    {misPostulaciones.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 16px" }}>

        {mainTab === "ofertas" && (
          <>
            <div style={{
              backgroundColor: "white", borderRadius: 14,
              border: "1px solid #E8E4DC",
              padding: 14, marginBottom: 16,
            }}>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <Search style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  width: 14, height: 14, color: "#94a3b8",
                }} />
                <input
                  type="text"
                  placeholder="Buscar por cargo, empresa o lugar..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
                    borderRadius: 10, padding: "9px 14px 9px 36px",
                    fontSize: "0.855rem", color: "#0d1b35", outline: "none",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; }}
                  onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; }}
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <p style={{ ...S.label, marginBottom: 6 }}>Tipo</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {TIPOS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      style={{
                        padding: "5px 12px", borderRadius: 20,
                        border: selectedType === t ? "1.5px solid #0d1b35" : "1px solid #E8E4DC",
                        backgroundColor: selectedType === t ? "#0d1b35" : "white",
                        color: selectedType === t ? "white" : "#64748b",
                        fontSize: "0.74rem", fontWeight: 600, cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Especialidad filter chips */}
              <div>
                <p style={{ ...S.label, marginBottom: 6 }}>Especialidad</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ESPECIALIDADES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSpec(s)}
                      style={{
                        padding: "5px 12px", borderRadius: 20,
                        border: selectedSpec === s ? "1.5px solid #D4AF37" : "1px solid #E8E4DC",
                        backgroundColor: selectedSpec === s ? "#FFFBF0" : "white",
                        color: selectedSpec === s ? "#b45309" : "#64748b",
                        fontSize: "0.74rem", fontWeight: 600, cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results count */}
            {!loading && (
              <p style={{ color: "#8C7B6B", fontSize: "0.78rem", marginBottom: 12 }}>
                <span style={{ color: "#0d1b35", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                  {filtered.length}
                </span>{" "}
                {filtered.length === 1 ? "oferta disponible" : "ofertas disponibles"}
              </p>
            )}

            {/* Cards grid */}
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "52px 0" }}>
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((job, i) => {
                  const accent = tipoAccent[job.tipo] ?? "#D4AF37";
                  const isSaved = saved.includes(job.id);
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      onClick={() => setActiveJob(job)}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 14,
                        border: "1px solid #E8E4DC",
                        borderLeft: `3.5px solid ${accent}`,
                        padding: 16,
                        cursor: "pointer",
                        transition: "box-shadow 0.15s",
                      }}
                      whileHover={{ boxShadow: "0 4px 18px rgba(13,27,53,0.08)" }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        {/* Company avatar */}
                        <div style={{
                          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                          backgroundColor: "#0d1b35",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <span style={{
                            color: accent, fontWeight: 800, fontSize: "1.1rem",
                            fontFamily: "'Playfair Display', serif",
                          }}>
                            {job.empresa.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <h3 style={{
                                  margin: 0, color: "#0d1b35",
                                  fontWeight: 700, fontSize: "0.9rem",
                                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                  {job.titulo}
                                </h3>
                                {job.empresa_verificada && (
                                  <CheckCircle style={{ width: 13, height: 13, color: "#3b82f6", flexShrink: 0 }} />
                                )}
                              </div>
                              <p style={{ margin: "2px 0 0", color: "#8C7B6B", fontSize: "0.78rem" }}>
                                {job.empresa}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSaved((p) =>
                                  p.includes(job.id) ? p.filter((x) => x !== job.id) : [...p, job.id]
                                );
                              }}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                padding: 4, flexShrink: 0,
                                color: isSaved ? "#0d1b35" : "#D0C8C0",
                              }}
                            >
                              <Bookmark style={{ width: 14, height: 14 }} fill={isSaved ? "currentColor" : "none"} />
                            </button>
                          </div>

                          {/* Chips */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                            <span style={{
                              ...(tipoStyle[job.tipo] ?? {}),
                              borderRadius: 20, padding: "3px 9px",
                              fontSize: "0.67rem", fontWeight: 700,
                            }}>
                              {job.tipo}
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#8C7B6B", fontSize: "0.72rem" }}>
                              <MapPin style={{ width: 11, height: 11 }} />
                              {job.ubicacion}
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#94a3b8", fontSize: "0.72rem" }}>
                              <Clock style={{ width: 11, height: 11 }} />
                              {new Date(job.fecha_publicacion).toLocaleDateString("es-CL")}
                            </span>
                          </div>

                          <p style={{
                            margin: "8px 0 0", color: "#64748b", fontSize: "0.78rem", lineHeight: 1.55,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}>
                            {job.descripcion}
                          </p>

                          <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            marginTop: 10, paddingTop: 10,
                            borderTop: "1px solid #F1EDE5",
                          }}>
                            <span style={{ color: "#94a3b8", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4 }}>
                              <Briefcase style={{ width: 11, height: 11 }} />
                              {job.modalidad}
                            </span>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0d1b35", display: "flex", alignItems: "center", gap: 3 }}>
                              Ver oferta <span style={{ fontSize: "0.85rem" }}>→</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="col-span-2" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 14px",
                    }}>
                      <Briefcase style={{ width: 22, height: 22, color: "#C9B99A" }} />
                    </div>
                    <p style={{ color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 4px" }}>
                      Sin ofertas disponibles
                    </p>
                    <p style={{ color: "#8C7B6B", fontSize: "0.8rem", margin: 0 }}>
                      Intenta con otros filtros
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {mainTab === "postulaciones" && (
          <>
            {loadingPostulaciones ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "52px 0" }}>
                <Spinner />
              </div>
            ) : misPostulaciones.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <ListChecks style={{ width: 22, height: 22, color: "#C9B99A" }} />
                </div>
                <p style={{ color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 4px" }}>
                  Sin postulaciones aún
                </p>
                <p style={{ color: "#8C7B6B", fontSize: "0.8rem", margin: 0 }}>
                  Postula a ofertas desde la pestaña Ofertas
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {misPostulaciones.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      backgroundColor: "white",
                      borderRadius: 14, border: "1px solid #E8E4DC",
                      padding: 16,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                          backgroundColor: "#0d1b35",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Building2 style={{ width: 16, height: 16, color: "#D4AF37" }} />
                        </div>
                        <div>
                          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.875rem", fontWeight: 700 }}>
                            {p.oferta_titulo ?? `Oferta #${p.oferta}`}
                          </p>
                          <p style={{ margin: "2px 0 0", color: "#8C7B6B", fontSize: "0.78rem" }}>
                            {p.oferta_empresa_nombre ?? "—"}
                          </p>
                        </div>
                      </div>
                      <span style={{
                        ...(estadoStyle[p.estado] ?? { backgroundColor: "#F6F5F0", color: "#64748b", border: "1px solid #E8E4DC" }),
                        borderRadius: 20, padding: "4px 12px",
                        fontSize: "0.68rem", fontWeight: 700, flexShrink: 0,
                      }}>
                        {estadoLabel[p.estado] ?? p.estado}
                      </span>
                    </div>

                    <div style={{
                      display: "flex", alignItems: "center", gap: 5,
                      marginTop: 12, paddingTop: 12,
                      borderTop: "1px solid #F1EDE5",
                      color: "#94a3b8", fontSize: "0.72rem",
                    }}>
                      <Clock style={{ width: 11, height: 11 }} />
                      {new Date(p.fecha_postulacion).toLocaleDateString("es-CL", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </div>

                    {p.mensaje_estudiante && (
                      <p style={{
                        margin: "8px 0 0", color: "#64748b", fontSize: "0.78rem",
                        lineHeight: 1.55, fontStyle: "italic",
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        "{p.mensaje_estudiante}"
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {activeJob && (
        <JobDetailModal
          job={activeJob}
          yaPostule={postulados.includes(activeJob.id)}
          onPostular={(msg) => handlePostular(activeJob.id, msg)}
          onClose={() => setActiveJob(null)}
        />
      )}
    </div>
  );
}
