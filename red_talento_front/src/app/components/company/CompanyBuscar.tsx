import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, MapPin, Clock, Award, Star, CheckCircle,
  Users, Send, Eye, Filter, Flag, Heart, X, Wrench,
} from "lucide-react";
import { perfilApi } from "@/api/api";
import { ReportModal } from "@/app/components/shared/ReportModal";
import type { EstudiantePerfil } from "@/app/types";

const ESPECIALIDADES = ["Electricidad", "Mecánica Automotriz", "Computación e Informática", "Construcción"];
const DISPONIBILIDADES = ["Part-time", "Full-time", "Fines de semana", "Práctica laboral"];

const FONT_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap";

const S: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E4DC",
    borderRadius: 14,
  },
};

const nivelStyle: Record<string, React.CSSProperties> = {
  Alto: { backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 20, fontSize: 11, padding: "2px 8px", fontWeight: 600 },
  Medio: { backgroundColor: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", borderRadius: 20, fontSize: 11, padding: "2px 8px", fontWeight: 600 },
  Bajo: { backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 20, fontSize: 11, padding: "2px 8px", fontWeight: 600 },
};

const toggle = <T,>(arr: T[], val: T): T[] =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

export function CompanyBuscar() {
  const [query, setQuery] = useState("");
  const [selSpec, setSelSpec] = useState<string[]>([]);
  const [selAvail, setSelAvail] = useState<string[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ name: string; id?: number } | null>(null);
  const [pasaporteTarget, setPasaporteTarget] = useState<EstudiantePerfil | null>(null);
  const [candidates, setCandidates] = useState<EstudiantePerfil[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (query) params.nombre = query;
      if (selSpec.length === 1) params.especialidad = selSpec[0];
      if (selAvail.length === 1) params.disponibilidad = selAvail[0];
      const res = await perfilApi.getEstudiantes(params);
      setCandidates(res.results ?? []);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [query, selSpec, selAvail]);

  useEffect(() => {
    const t = setTimeout(loadCandidates, 400);
    return () => clearTimeout(t);
  }, [loadCandidates]);

  const hasFilters = selSpec.length + selAvail.length > 0;

  const filtered = candidates.filter((c) => {
    const q = query.toLowerCase();
    const mQ = !q || c.nombre.toLowerCase().includes(q) || c.especialidad.toLowerCase().includes(q) || (c.comuna ?? "").toLowerCase().includes(q);
    const mS = selSpec.length === 0 || selSpec.some((s) => c.especialidad.toLowerCase().includes(s.toLowerCase()));
    const mA = selAvail.length === 0 || selAvail.some((a) => (c.disponibilidad ?? "").toLowerCase().includes(a.toLowerCase()));
    return mQ && mS && mA;
  });

  return (
    <>
      <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Crimson Text', Georgia, serif" }}>
<div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DC", padding: "20px 24px 16px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
              <div style={{ width: 32, height: 3, backgroundColor: "#D4AF37", borderRadius: 2 }} />
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.35rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>
                Buscar Talento
              </h1>
            </div>
            <p style={{ color: "#8C7B6B", fontSize: "0.9rem", marginTop: 4, marginBottom: 16 }}>
              Candidatos validados por el Liceo Cardenal Caro
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#A8998A" }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre, especialidad o comuna..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#F6F5F0",
                    border: "1.5px solid #E8E4DC",
                    borderRadius: 10,
                    paddingLeft: 40,
                    paddingRight: 16,
                    paddingTop: 10,
                    paddingBottom: 10,
                    fontSize: "0.9rem",
                    color: "#0d1b35",
                    outline: "none",
                    fontFamily: "'Crimson Text', Georgia, serif",
                  }}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: showFilters || hasFilters ? "1.5px solid #0d1b35" : "1.5px solid #E8E4DC",
                  backgroundColor: showFilters || hasFilters ? "#0d1b35" : "#FFFFFF",
                  color: showFilters || hasFilters ? "#FFFFFF" : "#4A3F35",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Crimson Text', Georgia, serif",
                }}
              >
                <Filter style={{ width: 15, height: 15 }} />
                Filtros
                {hasFilters && (
                  <span style={{
                    backgroundColor: "#D4AF37",
                    color: "#FFFFFF",
                    fontSize: 11,
                    padding: "1px 7px",
                    borderRadius: 20,
                    fontWeight: 700,
                  }}>
                    {selSpec.length + selAvail.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
          <div className="flex flex-col md:flex-row gap-5">

            {/* Sidebar filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.aside
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  className="w-full md:w-56 flex-shrink-0"
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {[
                    { title: "Especialidad", items: ESPECIALIDADES, selected: selSpec, set: setSelSpec },
                    { title: "Disponibilidad", items: DISPONIBILIDADES, selected: selAvail, set: setSelAvail },
                  ].map((group) => (
                    <div key={group.title} style={{ ...S.card, padding: 16 }}>
                      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.8rem", fontWeight: 700, color: "#0d1b35", marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        {group.title}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {group.items.map((item) => {
                          const checked = group.selected.includes(item);
                          return (
                            <label key={item} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                              onClick={() => group.set((p: string[]) => toggle(p, item))}>
                              <div style={{
                                width: 17,
                                height: 17,
                                borderRadius: 5,
                                border: checked ? "2px solid #D4AF37" : "2px solid #D0C9C0",
                                backgroundColor: checked ? "#D4AF37" : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                transition: "all 0.15s",
                              }}>
                                {checked && <CheckCircle style={{ width: 11, height: 11, color: "#FFFFFF" }} />}
                              </div>
                              <span style={{ fontSize: "0.88rem", color: checked ? "#0d1b35" : "#6B5D52", fontWeight: checked ? 600 : 400 }}>{item}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {hasFilters && (
                    <button
                      onClick={() => { setSelSpec([]); setSelAvail([]); }}
                      style={{
                        width: "100%",
                        padding: "10px 0",
                        borderRadius: 10,
                        border: "1.5px solid #E8E4DC",
                        backgroundColor: "#FFFFFF",
                        color: "#6B5D52",
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Crimson Text', Georgia, serif",
                      }}
                    >
                      Limpiar filtros
                    </button>
                  )}
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Results */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: "0.88rem", color: "#8C7B6B" }}>
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: "#0d1b35", fontSize: "0.95rem" }}>
                    {filtered.length}
                  </span>{" "}
                  candidatos encontrados
                </p>
              </div>

              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                  <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: "#E8E4DC", borderTopColor: "#D4AF37" }} />
                </div>
              ) : (
                <>
                  {filtered.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{ ...S.card, padding: 16 }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        {/* Avatar */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          {c.foto_perfil ? (
                            <img src={c.foto_perfil} style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", border: "1px solid #E8E4DC" }} />
                          ) : (
                            <div style={{
                              width: 52,
                              height: 52,
                              borderRadius: 12,
                              backgroundColor: "#0d1b35",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}>
                              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "#D4AF37" }}>
                                {c.nombre.charAt(0)}
                              </span>
                            </div>
                          )}
                          {c.validado && (
                            <div style={{
                              position: "absolute",
                              bottom: -5,
                              right: -5,
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              backgroundColor: "#D4AF37",
                              border: "2px solid #FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}>
                              <CheckCircle style={{ width: 11, height: 11, color: "#FFFFFF" }} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                            <div>
                              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>
                                {c.nombre}
                              </p>
                              <p style={{ fontSize: "0.9rem", color: "#6B5D52", margin: "1px 0 0" }}>{c.especialidad}</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                              {c.score !== undefined && (
                                <div style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  backgroundColor: "#FFFBF0",
                                  border: "1px solid #F5E6C0",
                                  borderRadius: 8,
                                  padding: "4px 10px",
                                }}>
                                  <Star style={{ width: 13, height: 13, fill: "#D4AF37", color: "#D4AF37" }} />
                                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.85rem", fontWeight: 700, color: "#0d1b35" }}>
                                    {c.score}
                                  </span>
                                </div>
                              )}
                              {c.validado && (
                                <span style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "3px 10px",
                                  borderRadius: 20,
                                  backgroundColor: "#FFFBF0",
                                  color: "#B8962E",
                                  border: "1px solid #D4AF37",
                                }}>
                                  ✓ Validado
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8, fontSize: "0.82rem", color: "#8C7B6B" }}>
                            {c.comuna && (
                              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <MapPin style={{ width: 12, height: 12 }} /> {c.comuna}
                              </span>
                            )}
                            {c.disponibilidad && (
                              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <Clock style={{ width: 12, height: 12 }} /> {c.disponibilidad}
                              </span>
                            )}
                            {c.curso && (
                              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <Award style={{ width: 12, height: 12 }} /> {c.curso}
                              </span>
                            )}
                          </div>

                          {c.insignias?.length > 0 && (
                            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {c.insignias.map((b) => (
                                <span key={b.id} style={{
                                  fontSize: 11,
                                  padding: "3px 9px",
                                  borderRadius: 20,
                                  backgroundColor: "#F6F5F0",
                                  border: "1px solid #E8E4DC",
                                  color: "#6B5D52",
                                  fontWeight: 600,
                                }}>
                                  {b.icono} {b.nombre}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setPasaporteTarget(c)}
                          style={{
                            flex: 1,
                            padding: "9px 0",
                            borderRadius: 9,
                            backgroundColor: "#0d1b35",
                            border: "none",
                            color: "#FFFFFF",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            fontFamily: "'Crimson Text', Georgia, serif",
                          }}
                        >
                          <Eye style={{ width: 14, height: 14 }} /> Ver Pasaporte
                        </button>
                        <button
                          style={{
                            flex: 1,
                            padding: "9px 0",
                            borderRadius: 9,
                            backgroundColor: "#FFFFFF",
                            border: "1.5px solid #E8E4DC",
                            color: "#4A3F35",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            fontFamily: "'Crimson Text', Georgia, serif",
                          }}
                        >
                          <Send style={{ width: 14, height: 14 }} /> Contactar
                        </button>
                        <button
                          onClick={() => setSaved((p) => toggle(p, c.id))}
                          style={{
                            padding: "9px 12px",
                            borderRadius: 9,
                            border: saved.includes(c.id) ? "1.5px solid #fecaca" : "1.5px solid #E8E4DC",
                            backgroundColor: saved.includes(c.id) ? "#fff5f5" : "#FFFFFF",
                            color: saved.includes(c.id) ? "#ef4444" : "#A8998A",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Heart style={{ width: 16, height: 16 }} fill={saved.includes(c.id) ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => setReportTarget({ name: c.nombre, id: c.usuario_id })}
                          title="Reportar usuario"
                          style={{
                            padding: "9px 12px",
                            borderRadius: 9,
                            border: "1.5px solid #E8E4DC",
                            backgroundColor: "#FFFFFF",
                            color: "#A8998A",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Flag style={{ width: 16, height: 16 }} />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {filtered.length === 0 && (
                    <div style={{ textAlign: "center", padding: "64px 0" }}>
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        backgroundColor: "#F0EDE8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 14px",
                      }}>
                        <Users style={{ width: 26, height: 26, color: "#C0B09A" }} />
                      </div>
                      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>
                        Sin resultados
                      </p>
                      <p style={{ fontSize: "0.88rem", color: "#8C7B6B", marginTop: 4 }}>
                        Ajusta los filtros de búsqueda
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {reportTarget && (
        <ReportModal
          targetName={reportTarget.name}
          targetType="usuario"
          targetId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}

      {/* Pasaporte modal */}
      <AnimatePresence>
        {pasaporteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              backgroundColor: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
            onClick={(e) => e.target === e.currentTarget && setPasaporteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
                width: "100%",
                maxWidth: 400,
                overflow: "hidden",
              }}
            >
              {/* Modal header — navy with dot grid */}
              <div style={{
                backgroundColor: "#0d1b35",
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
                borderBottom: "3px solid #D4AF37",
                padding: "20px 20px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                    Pasaporte de Oficio
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                    Certificado institucional
                  </p>
                </div>
                <button
                  onClick={() => setPasaporteTarget(null)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Modal body */}
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Student identity card */}
                <div style={{
                  backgroundColor: "#F6F5F0",
                  border: "1px solid #E8E4DC",
                  borderRadius: 12,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}>
                  {pasaporteTarget.foto_perfil ? (
                    <img src={pasaporteTarget.foto_perfil} style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      backgroundColor: "#0d1b35",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.35rem", fontWeight: 700, color: "#D4AF37" }}>
                        {pasaporteTarget.nombre.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>
                      {pasaporteTarget.nombre}
                    </p>
                    <p style={{ fontSize: "0.88rem", color: "#6B5D52", margin: "1px 0 0" }}>{pasaporteTarget.especialidad}</p>
                    {pasaporteTarget.validado && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                        <CheckCircle style={{ width: 13, height: 13, color: "#D4AF37" }} />
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#B8962E" }}>Validado institucionalmente</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Habilidades */}
                {pasaporteTarget.habilidades?.length > 0 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <Wrench style={{ width: 13, height: 13, color: "#8C7B6B" }} />
                      <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#4A3F35", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                        Habilidades certificadas
                      </p>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {pasaporteTarget.habilidades.map((h) => (
                        <span key={h.id} style={nivelStyle[h.nivel] ?? nivelStyle.Bajo}>
                          {h.nombre} · {h.nivel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insignias */}
                {pasaporteTarget.insignias?.length > 0 && (
                  <div>
                    <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#4A3F35", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                      Insignias
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {pasaporteTarget.insignias.map((b) => (
                        <span key={b.id} style={{
                          fontSize: 11,
                          padding: "3px 10px",
                          borderRadius: 20,
                          backgroundColor: "#FFFBF0",
                          border: "1px solid #D4AF37",
                          color: "#B8962E",
                          fontWeight: 700,
                        }}>
                          {b.icono} {b.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div style={{ height: 1, backgroundColor: "#F1EDE5" }} />

                <button
                  onClick={() => setPasaporteTarget(null)}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    borderRadius: 10,
                    backgroundColor: "#0d1b35",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: "'Crimson Text', Georgia, serif",
                  }}
                >
                  <Send style={{ width: 16, height: 16 }} /> Contactar candidato
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
