import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, Star, CheckCircle, MapPin, Clock, Award,
  Eye, Heart, TrendingUp, Filter, RefreshCw, Zap, X,
} from "lucide-react";
import { recomendacionesApi } from "@/api/api";
import { usePerfil } from "@/app/context/PerfilContext";
import type { EstudiantePerfil } from "@/app/types";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const S = {
  label: {
    fontSize: "0.68rem", fontWeight: 700 as const,
    color: "#94a3b8", textTransform: "uppercase" as const,
    letterSpacing: "0.08em", margin: 0,
  } as React.CSSProperties,
};

function scoreColor(score: number): string {
  if (score >= 90) return "#10b981";
  if (score >= 75) return "#D4AF37";
  return "#94a3b8";
}

function scoreBg(score: number): string {
  if (score >= 90) return "#F0FDF4";
  if (score >= 75) return "#FFFBF0";
  return "#F6F5F0";
}

function scoreBorder(score: number): string {
  if (score >= 90) return "#bbf7d0";
  if (score >= 75) return "#fde68a";
  return "#E8E4DC";
}

function MatchCircle({ score }: { score: number }) {
  const color  = scoreColor(score);
  const radius = 20;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
      <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#F1EDE5" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={radius} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontWeight: 800, fontSize: "0.72rem",
          color,
          fontFamily: "'Playfair Display', Georgia, serif",
        }}>
          {score}%
        </span>
      </div>
    </div>
  );
}

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

export function CompanyRecomendaciones() {
  const { openPerfil } = usePerfil();
  const [candidates, setCandidates] = useState<EstudiantePerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterValidado, setFilterValidado] = useState(false);
  const [filterEspecialidad, setFilterEspecialidad] = useState("");

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.href = FONT_URL; link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const loadRecomendaciones = async () => {
    try {
      const data = await recomendacionesApi.getParaEmpresa();
      setCandidates(data);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadRecomendaciones(); }, []);

  const handleRefresh = () => { setRefreshing(true); loadRecomendaciones(); };
  const toggle = (id: number) => setSaved((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const especialidades = useMemo(() => {
    const set = new Set(candidates.map((c) => c.especialidad).filter(Boolean));
    return Array.from(set).sort();
  }, [candidates]);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (filterValidado && !c.validado) return false;
      if (filterEspecialidad && c.especialidad !== filterEspecialidad) return false;
      return true;
    });
  }, [candidates, filterValidado, filterEspecialidad]);

  const activeFilters = (filterValidado ? 1 : 0) + (filterEspecialidad ? 1 : 0);
  const validados  = candidates.filter((c) => c.validado).length;
  const topScore   = candidates.reduce((max, c) => Math.max(max, c.score ?? 0), 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div style={{ backgroundColor: "white", borderBottom: "1px solid #E8E4DC" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 20px 18px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  backgroundColor: "#FFFBF0", border: "1px solid #fde68a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Sparkles style={{ width: 13, height: 13, color: "#D4AF37" }} />
                </div>
                <h1 style={{
                  margin: 0, color: "#0d1b35",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700, fontSize: "1.3rem", lineHeight: 1.2,
                }}>
                  Talento Recomendado
                </h1>
              </div>
              <p style={{ margin: 0, color: "#8C7B6B", fontSize: "0.8rem" }}>
                Basado en tus publicaciones y preferencias
              </p>
            </div>

            <button
              onClick={handleRefresh}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 14px", borderRadius: 10,
                border: "1px solid #E8E4DC", backgroundColor: "white",
                color: "#0d1b35", fontSize: "0.8rem", fontWeight: 600,
                cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                opacity: refreshing ? 0.65 : 1, transition: "opacity 0.15s",
                flexShrink: 0,
              }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} className={refreshing ? "animate-spin" : ""} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        <div style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid #E8E4DC", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ ...S.label }}>Criterios de recomendación</p>
            <button
              onClick={() => setShowFilters((v) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: "0.74rem", padding: "5px 12px", borderRadius: 20,
                border: showFilters || activeFilters > 0 ? "1.5px solid #0d1b35" : "1px solid #E8E4DC",
                backgroundColor: showFilters || activeFilters > 0 ? "#0d1b35" : "white",
                color: showFilters || activeFilters > 0 ? "white" : "#64748b",
                cursor: "pointer", fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              <Filter style={{ width: 11, height: 11 }} />
              Filtros
              {activeFilters > 0 && (
                <span style={{
                  width: 16, height: 16, borderRadius: "50%",
                  backgroundColor: "white", color: "#0d1b35",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", fontWeight: 800,
                }}>
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Especialidad compatible", "Perfil validado", "Disponibilidad", "Zona geográfica"].map((n) => (
              <span key={n} style={{
                display: "flex", alignItems: "center", gap: 5,
                backgroundColor: "#F6F5F0", color: "#64748b",
                fontSize: "0.74rem", padding: "5px 12px", borderRadius: 20,
                border: "1px solid #E8E4DC", fontWeight: 500,
              }}>
                <Zap style={{ width: 11, height: 11, color: "#94a3b8" }} />
                {n}
              </span>
            ))}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{
                  marginTop: 12, paddingTop: 12,
                  borderTop: "1px solid #F1EDE5",
                  display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center",
                }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={filterValidado}
                      onChange={(e) => setFilterValidado(e.target.checked)}
                      style={{ width: 15, height: 15, accentColor: "#0d1b35", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 500 }}>Solo validados</span>
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...S.label }}>Especialidad:</span>
                    <select
                      value={filterEspecialidad}
                      onChange={(e) => setFilterEspecialidad(e.target.value)}
                      style={{
                        fontSize: "0.78rem", border: "1px solid #E8E4DC",
                        borderRadius: 8, padding: "5px 10px",
                        color: "#475569", backgroundColor: "#F6F5F0",
                        outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                      onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; }}
                      onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; }}
                    >
                      <option value="">Todas</option>
                      {especialidades.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  {activeFilters > 0 && (
                    <button
                      onClick={() => { setFilterValidado(false); setFilterEspecialidad(""); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: "0.74rem", color: "#94a3b8",
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      <X style={{ width: 12, height: 12 }} /> Limpiar filtros
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!loading && candidates.length > 0 && (
          <div style={{
            backgroundColor: "white", borderRadius: 14, border: "1px solid #E8E4DC",
            padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <TrendingUp style={{ width: 13, height: 13, color: "#8C7B6B" }} />
            </div>
            <p style={{ margin: 0, color: "#8C7B6B", fontSize: "0.8rem", lineHeight: 1.5 }}>
              <span style={{ color: "#0d1b35", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{candidates.length}</span> candidatos recomendados
              {" · "}
              <span style={{ color: "#0d1b35", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{validados}</span> con sello institucional
              {topScore > 0 && (
                <>
                  {" · "}Mejor coincidencia:{" "}
                  <span style={{ fontWeight: 700, color: "#D4AF37", fontFamily: "'Playfair Display', serif" }}>{topScore}%</span>
                </>
              )}
            </p>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "52px 0" }}>
            <Spinner />
          </div>
        ) : candidates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: "white", borderRadius: 14, border: "1px solid #E8E4DC" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Sparkles style={{ width: 22, height: 22, color: "#C9B99A" }} />
            </div>
            <p style={{ color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 4px" }}>
              Sin recomendaciones disponibles
            </p>
            <p style={{ color: "#8C7B6B", fontSize: "0.8rem", margin: 0 }}>
              Publica una oferta laboral para recibir candidatos recomendados
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "52px 20px", backgroundColor: "white", borderRadius: 14, border: "1px solid #E8E4DC" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Filter style={{ width: 22, height: 22, color: "#C9B99A" }} />
            </div>
            <p style={{ color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 8px" }}>
              Ningún candidato coincide con los filtros
            </p>
            <button
              onClick={() => { setFilterValidado(false); setFilterEspecialidad(""); }}
              style={{ color: "#0d1b35", fontSize: "0.78rem", fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          filtered.map((r, i) => {
            const score    = r.score ?? 70;
            const isSaved  = saved.includes(r.id);
            const accent   = scoreColor(score);
            const bScoreBg = scoreBg(score);
            const bBorder  = scoreBorder(score);

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  backgroundColor: "white",
                  borderRadius: 14,
                  border: "1px solid #E8E4DC",
                  overflow: "hidden",
                }}
                whileHover={{ boxShadow: "0 4px 18px rgba(13,27,53,0.07)" }}
              >
                <div style={{ height: 3, backgroundColor: "#F1EDE5" }}>
                  <div style={{
                    height: "100%",
                    width: `${score}%`,
                    backgroundColor: accent,
                    transition: "width 0.6s ease",
                  }} />
                </div>

                <div style={{ padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <MatchCircle score={score} />

                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {r.foto_perfil ? (
                        <img src={r.foto_perfil} style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", border: "1px solid #E8E4DC", display: "block" }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: "1.2rem", fontFamily: "'Playfair Display', serif" }}>
                            {r.nombre.charAt(0)}
                          </span>
                        </div>
                      )}
                      {r.validado && (
                        <div style={{ position: "absolute", bottom: -4, right: -4, width: 18, height: 18, borderRadius: "50%", backgroundColor: "#D4AF37", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CheckCircle style={{ width: 10, height: 10, color: "white" }} />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div>
                          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.875rem", fontWeight: 700 }}>{r.nombre}</p>
                          <p style={{ margin: "2px 0 0", color: "#8C7B6B", fontSize: "0.8rem", fontWeight: 500 }}>{r.especialidad}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 4,
                            backgroundColor: bScoreBg, border: `1px solid ${bBorder}`,
                            borderRadius: 8, padding: "4px 9px",
                          }}>
                            <Star style={{ width: 11, height: 11, color: accent, fill: accent }} />
                            <span style={{ color: accent, fontSize: "0.74rem", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{score}%</span>
                          </div>
                          {r.validado && (
                            <span style={{
                              fontSize: "0.67rem", padding: "3px 9px", borderRadius: 20, fontWeight: 700,
                              backgroundColor: "#FFFBF0", color: "#b45309", border: "1px solid #fde68a",
                            }}>
                              ✓ Sello
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 7 }}>
                        {r.comuna && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#8C7B6B", fontSize: "0.74rem" }}>
                            <MapPin style={{ width: 11, height: 11 }} />{r.comuna}
                          </span>
                        )}
                        {r.disponibilidad && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#8C7B6B", fontSize: "0.74rem" }}>
                            <Clock style={{ width: 11, height: 11 }} />{r.disponibilidad}
                          </span>
                        )}
                        {r.curso && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#8C7B6B", fontSize: "0.74rem" }}>
                            <Award style={{ width: 11, height: 11 }} />{r.curso}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: 14,
                    backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
                    borderRadius: 10, padding: "11px 14px",
                  }}>
                    <p style={{ ...S.label, marginBottom: 8 }}>¿Por qué te recomendamos este perfil?</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {r.validado && (
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#FFFBF0", border: "1.5px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <CheckCircle style={{ width: 9, height: 9, color: "#D4AF37" }} />
                          </div>
                          <span style={{ color: "#475569", fontSize: "0.78rem" }}>
                            Perfil validado institucionalmente por el Liceo
                          </span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#F0FDF4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <CheckCircle style={{ width: 9, height: 9, color: "#15803d" }} />
                        </div>
                        <span style={{ color: "#475569", fontSize: "0.78rem" }}>
                          Especialidad: {r.especialidad}
                        </span>
                      </div>
                      {r.disponibilidad && (
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#F0FDF4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <CheckCircle style={{ width: 9, height: 9, color: "#15803d" }} />
                          </div>
                          <span style={{ color: "#475569", fontSize: "0.78rem" }}>
                            Disponibilidad: {r.disponibilidad}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {r.habilidades?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                      {r.habilidades.slice(0, 4).map((h) => (
                        <span key={h.id} style={{
                          fontSize: "0.74rem", backgroundColor: "#F6F5F0",
                          color: "#64748b", padding: "4px 10px",
                          borderRadius: 20, border: "1px solid #E8E4DC",
                          fontWeight: 500,
                        }}>
                          {h.nombre}
                        </span>
                      ))}
                      {r.habilidades.length > 4 && (
                        <span style={{
                          fontSize: "0.74rem", color: "#94a3b8",
                          padding: "4px 10px", borderRadius: 20,
                          border: "1px dashed #E8E4DC", fontWeight: 500,
                        }}>
                          +{r.habilidades.length - 4} más
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button
                      onClick={() => openPerfil(r.id, "estudiante")}
                      style={{
                        flex: 1, padding: "9px 14px", borderRadius: 10,
                        border: "none", backgroundColor: "#0d1b35", color: "white",
                        fontSize: "0.8rem", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                        transition: "background-color 0.15s",
                      }}
                    >
                      <Eye style={{ width: 14, height: 14 }} />
                      Ver Perfil
                    </button>
                    <button
                      onClick={() => toggle(r.id)}
                      style={{
                        padding: "9px 12px", borderRadius: 10, cursor: "pointer",
                        border: isSaved ? "1.5px solid #fecaca" : "1px solid #E8E4DC",
                        backgroundColor: isSaved ? "#FEF2F2" : "#F6F5F0",
                        color: isSaved ? "#dc2626" : "#94a3b8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      <Heart style={{ width: 16, height: 16 }} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
