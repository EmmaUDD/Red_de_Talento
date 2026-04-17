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

  const toggle = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

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
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-slate-900 font-bold" style={{ fontSize: "1.25rem" }}>Buscar Talento</h1>
            <p className="text-slate-500 text-sm mt-0.5">Candidatos validados por el Liceo Cardenal Caro</p>

            <div className="flex gap-3 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre, especialidad o comuna..."
                  className="w-full bg-slate-100 border border-transparent rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-slate-300 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${showFilters || hasFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                <Filter className="w-4 h-4" />
                Filtros
                {hasFilters && (
                  <span className="bg-white text-slate-900 text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {selSpec.length + selAvail.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5">
          <div className="flex flex-col md:flex-row gap-5">
            <AnimatePresence>
              {showFilters && (
                <motion.aside
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="w-full md:w-56 flex-shrink-0 space-y-3"
                >
                  {[
                    { title: "Especialidad", items: ESPECIALIDADES, selected: selSpec, set: setSelSpec },
                    { title: "Disponibilidad", items: DISPONIBILIDADES, selected: selAvail, set: setSelAvail },
                  ].map((group) => (
                    <div key={group.title} className="bg-white rounded-xl border border-slate-200 p-4">
                      <h3 className="text-slate-900 text-xs font-semibold mb-3">{group.title}</h3>
                      <div className="space-y-2">
                        {group.items.map((item) => {
                          const checked = group.selected.includes(item);
                          return (
                            <label key={item} className="flex items-center gap-2.5 cursor-pointer"
                              onClick={() => group.set((p: string[]) => toggle(p, item))}>
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${checked ? "bg-slate-900 border-slate-900" : "border-slate-300 hover:border-slate-500"}`}>
                                {checked && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <span className="text-slate-600 text-sm">{item}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {hasFilters && (
                    <button onClick={() => { setSelSpec([]); setSelAvail([]); }}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                      Limpiar filtros
                    </button>
                  )}
                </motion.aside>
              )}
            </AnimatePresence>

            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm">
                  <span className="text-slate-900 font-semibold">{filtered.length}</span> candidatos
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {filtered.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          {c.foto_perfil ? (
                            <img src={c.foto_perfil} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                              <span className="text-slate-500 font-bold">{c.nombre.charAt(0)}</span>
                            </div>
                          )}
                          {c.validado && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white" style={{ backgroundColor: "#D4AF37" }}>
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-slate-900 text-sm font-bold">{c.nombre}</p>
                              <p className="text-slate-600 text-sm font-medium">{c.especialidad}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {c.score !== undefined && (
                                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span className="text-slate-900 text-xs font-bold">{c.score}</span>
                                </div>
                              )}
                              {c.validado && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#FFFBF0", color: "#B8962E", border: "1px solid #D4AF37" }}>
                                  ✓ Validado
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500">
                            {c.comuna && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.comuna}</span>}
                            {c.disponibilidad && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.disponibilidad}</span>}
                            {c.curso && <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {c.curso}</span>}
                          </div>

                          {c.insignias?.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {c.insignias.map((b) => (
                                <span key={b.id} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                                  {b.icono} {b.nombre}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setPasaporteTarget(c)}
                          className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> Ver Pasaporte
                        </button>
                        <button className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors">
                          <Send className="w-3.5 h-3.5" /> Contactar
                        </button>
                        <button onClick={() => setSaved((p) => toggle(p, c.id))}
                          className={`p-2 rounded-lg border transition-all ${saved.includes(c.id) ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400"}`}>
                          <Heart className="w-4 h-4" fill={saved.includes(c.id) ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => setReportTarget({ name: c.nombre, id: c.usuario_id })}
                          className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Reportar usuario">
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {filtered.length === 0 && (
                    <div className="text-center py-16">
                      <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm font-semibold">Sin resultados</p>
                      <p className="text-slate-400 text-xs mt-1">Ajusta los filtros de búsqueda</p>
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

      <AnimatePresence>
        {pasaporteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setPasaporteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <p className="text-slate-900 text-sm font-bold">Pasaporte de Oficio</p>
                <button onClick={() => setPasaporteTarget(null)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 pb-5 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {pasaporteTarget.foto_perfil ? (
                    <img src={pasaporteTarget.foto_perfil} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-500 font-bold text-lg">{pasaporteTarget.nombre.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-900 text-sm font-bold">{pasaporteTarget.nombre}</p>
                    <p className="text-slate-600 text-xs">{pasaporteTarget.especialidad}</p>
                    {pasaporteTarget.validado && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        <span className="text-xs font-semibold" style={{ color: "#B8962E" }}>Validado institucionalmente</span>
                      </div>
                    )}
                  </div>
                </div>

                {pasaporteTarget.habilidades?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Wrench className="w-3.5 h-3.5 text-slate-500" />
                      <p className="text-slate-700 text-xs font-semibold">Habilidades certificadas</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pasaporteTarget.habilidades.map((h) => (
                        <span key={h.id} className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${h.nivel === "Alto" ? "bg-green-50 text-green-700 border-green-200" : h.nivel === "Medio" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                          {h.nombre} · {h.nivel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {pasaporteTarget.insignias?.length > 0 && (
                  <div>
                    <p className="text-slate-700 text-xs font-semibold mb-2">Insignias</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pasaporteTarget.insignias.map((b) => (
                        <span key={b.id} className="text-xs px-2 py-0.5 rounded-full border font-semibold" style={{ borderColor: "#D4AF37", color: "#B8962E", backgroundColor: "#FFFBF0" }}>
                          {b.icono} {b.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setPasaporteTarget(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Contactar candidato
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
