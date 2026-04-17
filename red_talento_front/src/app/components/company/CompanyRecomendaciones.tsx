import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, Star, CheckCircle, MapPin, Clock, Award,
  Eye, Heart, TrendingUp, Filter, RefreshCw, Zap, X,
} from "lucide-react";
import { recomendacionesApi } from "@/api/api";
import { usePerfil } from "@/app/context/PerfilContext";
import type { EstudiantePerfil } from "@/app/types";

function MatchCircle({ score }: { score: number }) {
  const color = score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : "#94a3b8";
  const stroke = score >= 90 ? "text-green-500" : score >= 75 ? "text-amber-500" : "text-slate-400";
  const radius = 20;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <circle cx="24" cy="24" r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs ${stroke}`} style={{ fontWeight: 800 }}>{score}%</span>
      </div>
    </div>
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

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecomendaciones();
  };

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

  const validados = candidates.filter((c) => c.validado).length;
  const topScore = candidates.reduce((max, c) => Math.max(max, c.score ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-slate-500" />
              <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Talento Recomendado</h1>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">Basado en tus publicaciones y preferencias</p>
          </div>
          <button onClick={handleRefresh}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-all ${refreshing ? "opacity-70" : ""}`}
            style={{ fontWeight: 500 }}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-5 space-y-4">
        {/* Criterios + Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-xs" style={{ fontWeight: 600 }}>Criterios de recomendación</p>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${showFilters || activeFilters > 0 ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            >
              <Filter className="w-3 h-3" />
              Filtros
              {activeFilters > 0 && <span className="w-4 h-4 rounded-full bg-white text-slate-900 flex items-center justify-center text-xs" style={{ fontWeight: 700, fontSize: "0.6rem" }}>{activeFilters}</span>}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Especialidad compatible", "Perfil validado", "Disponibilidad", "Zona geográfica"].map((n) => (
              <span key={n} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full border border-slate-200">
                <Zap className="w-3 h-3 text-slate-400" /> {n}
              </span>
            ))}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterValidado}
                      onChange={(e) => setFilterValidado(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 accent-slate-900"
                    />
                    <span className="text-xs text-slate-700" style={{ fontWeight: 500 }}>Solo validados</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500" style={{ fontWeight: 500 }}>Especialidad:</span>
                    <select
                      value={filterEspecialidad}
                      onChange={(e) => setFilterEspecialidad(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Todas</option>
                      {especialidades.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  {activeFilters > 0 && (
                    <button
                      onClick={() => { setFilterValidado(false); setFilterEspecialidad(""); }}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <X className="w-3 h-3" /> Limpiar
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary */}
        {!loading && candidates.length > 0 && (
          <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4">
            <TrendingUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <p className="text-slate-600 text-sm">
              <span className="text-slate-900" style={{ fontWeight: 600 }}>{candidates.length} candidatos</span> recomendados ·{" "}
              <span className="text-slate-900" style={{ fontWeight: 600 }}>{validados}</span> con sello institucional ·
              Mejor coincidencia: <span style={{ fontWeight: 600, color: "#B8962E" }}>{topScore}%</span>
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Sparkles className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm" style={{ fontWeight: 600 }}>No hay recomendaciones disponibles</p>
            <p className="text-slate-400 text-xs mt-1">Publica una oferta laboral para recibir candidatos recomendados</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Filter className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-500 text-sm" style={{ fontWeight: 600 }}>Ningún candidato coincide con los filtros</p>
            <button onClick={() => { setFilterValidado(false); setFilterEspecialidad(""); }} className="mt-2 text-xs text-slate-400 underline">Limpiar filtros</button>
          </div>
        ) : (
          filtered.map((r, i) => {
            const score = r.score ?? 70;
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
                {/* Match bar */}
                <div className="h-1 rounded-t-xl" style={{
                  width: `${score}%`,
                  backgroundColor: score >= 90 ? "#10b981" : score >= 75 ? "#D4AF37" : "#94a3b8",
                }} />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <MatchCircle score={score} />

                    <div className="relative flex-shrink-0">
                      {r.foto_perfil ? (
                        <img src={r.foto_perfil} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-500 font-bold">{r.nombre.charAt(0)}</span>
                        </div>
                      )}
                      {r.validado && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white" style={{ backgroundColor: "#D4AF37" }}>
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>{r.nombre}</p>
                          <p className="text-slate-600 text-sm" style={{ fontWeight: 500 }}>{r.especialidad}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-slate-900 text-xs" style={{ fontWeight: 700 }}>{score}%</span>
                          </div>
                          {r.validado && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFFBF0", color: "#B8962E", fontWeight: 600, border: "1px solid #D4AF37" }}>
                              ✓ Validado
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500">
                        {r.comuna && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.comuna}</span>}
                        {r.disponibilidad && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.disponibilidad}</span>}
                        {r.curso && <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {r.curso}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Por qué */}
                  <div className="mt-4 bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-600 text-xs mb-2" style={{ fontWeight: 600 }}>¿Por qué te recomendamos este perfil?</p>
                    <ul className="space-y-1">
                      {r.validado && (
                        <li className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          Perfil validado institucionalmente por el Liceo
                        </li>
                      )}
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        Especialidad: {r.especialidad}
                      </li>
                      {r.disponibilidad && (
                        <li className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          Disponibilidad: {r.disponibilidad}
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Habilidades */}
                  {r.habilidades?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {r.habilidades.slice(0, 4).map((h) => (
                        <span key={h.id} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                          {h.nombre}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => openPerfil(r.id, "estudiante")}
                      className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-xs flex items-center justify-center gap-1.5 transition-colors" style={{ fontWeight: 600 }}>
                      <Eye className="w-3.5 h-3.5" /> Ver Perfil
                    </button>
                    <button onClick={() => toggle(r.id)}
                      className={`p-2 rounded-lg border transition-all ${saved.includes(r.id) ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400"}`}>
                      <Heart className="w-4 h-4" fill={saved.includes(r.id) ? "currentColor" : "none"} />
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
