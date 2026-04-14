import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, MapPin, Clock, Award, Star, CheckCircle,
  Users, Send, Eye, Filter, Flag, Heart,
} from "lucide-react";
import { ReportModal } from "../shared/ReportModal";
import { apiRequest } from "../../../api/client";
 
interface Estudiante {
  id: number;
  usuario: { id: number; first_name: string; last_name: string; is_active: boolean };
  especialidad: string;
  grado: string;
  disponibilidad?: { id: number; disponibilidad: string }[];
  habilidades_set?: { nombre: string; nivel: string; estado: string }[];
}
 
const specialties = ["Electricidad", "Computación", "Construcción", "Mecánica Automotriz"];
const availabilities = ["part_time", "full_time", "fines_de_semana", "practicas"];
const availabilityLabels: Record<string, string> = {
  part_time: "Part-time",
  full_time: "Full-time",
  fines_de_semana: "Fines de semana",
  practicas: "Prácticas",
};
 
export function CompanyBuscar() {
  const [query, setQuery] = useState("");
  const [selSpec, setSelSpec] = useState<string[]>([]);
  const [selAvail, setSelAvail] = useState<string[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
 
  const toggle = <T,>(arr: T[], val: T) => arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
 
  const loadEstudiantes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selSpec.length === 1) params.set("especialidad", selSpec[0]);
      if (selAvail.length === 1) params.set("disponibilidad", selAvail[0]);
      const res = await apiRequest(`/api/estudiantes/?${params.toString()}`);
      if (res.ok) setEstudiantes(await res.json());
    } catch {}
    setLoading(false);
  };
 
  useEffect(() => { loadEstudiantes(); }, [selSpec, selAvail]);
 
  const filtered = estudiantes.filter((e) => {
    const fullName = `${e.usuario.first_name} ${e.usuario.last_name}`.toLowerCase();
    const q = query.toLowerCase();
    const matchQ = !q || fullName.includes(q) || e.especialidad.toLowerCase().includes(q);
    const matchSpec = selSpec.length === 0 || selSpec.some((s) => e.especialidad.toLowerCase().includes(s.toLowerCase()));
    const matchAvail = selAvail.length === 0 || (e.disponibilidad ?? []).some((d) => selAvail.includes(d.disponibilidad));
    return matchQ && matchSpec && matchAvail;
  });
 
  const hasFilters = selSpec.length + selAvail.length > 0;
 
  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Buscar Talento</h1>
            <p className="text-slate-500 text-sm mt-0.5">Candidatos validados por el Liceo Cardenal Caro</p>
            <div className="flex gap-3 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o especialidad..."
                  className="w-full bg-slate-100 border border-transparent rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-slate-300 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all ${showFilters || hasFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                style={{ fontWeight: 600 }}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasFilters && (
                  <span className="bg-white text-slate-900 text-xs px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>
                    {selSpec.length + selAvail.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
 
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5">
          <div className="flex flex-col md:flex-row gap-5">
            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.aside initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  className="w-full md:w-56 flex-shrink-0 space-y-3">
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <h3 className="text-slate-900 text-xs mb-3" style={{ fontWeight: 600 }}>Especialidad</h3>
                    <div className="space-y-2">
                      {specialties.map((item) => {
                        const checked = selSpec.includes(item);
                        return (
                          <label key={item} className="flex items-center gap-2.5 cursor-pointer">
                            <div onClick={() => setSelSpec((p) => toggle(p, item))}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${checked ? "bg-slate-900 border-slate-900" : "border-slate-300 hover:border-slate-500"}`}>
                              {checked && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="text-slate-600 text-sm">{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <h3 className="text-slate-900 text-xs mb-3" style={{ fontWeight: 600 }}>Disponibilidad</h3>
                    <div className="space-y-2">
                      {availabilities.map((item) => {
                        const checked = selAvail.includes(item);
                        return (
                          <label key={item} className="flex items-center gap-2.5 cursor-pointer">
                            <div onClick={() => setSelAvail((p) => toggle(p, item))}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${checked ? "bg-slate-900 border-slate-900" : "border-slate-300 hover:border-slate-500"}`}>
                              {checked && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="text-slate-600 text-sm">{availabilityLabels[item]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  {hasFilters && (
                    <button onClick={() => { setSelSpec([]); setSelAvail([]); }}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors" style={{ fontWeight: 500 }}>
                      Limpiar filtros
                    </button>
                  )}
                </motion.aside>
              )}
            </AnimatePresence>
 
            {/* Results */}
            <div className="flex-1 space-y-3">
              <p className="text-slate-500 text-sm">
                <span className="text-slate-900" style={{ fontWeight: 600 }}>{filtered.length}</span> candidatos
              </p>
 
              {loading ? (
                <div className="text-center py-10 text-slate-400 text-sm">Cargando candidatos...</div>
              ) : filtered.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-slate-400" />
                      </div>
                      {e.usuario.is_active && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white" style={{ backgroundColor: "#D4AF37" }}>
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
 
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>
                            {e.usuario.first_name} {e.usuario.last_name}
                          </p>
                          <p className="text-slate-600 text-sm" style={{ fontWeight: 500 }}>{e.especialidad}</p>
                        </div>
                        {e.usuario.is_active && (
                          <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#FFFBF0", color: "#B8962E", fontWeight: 600, border: "1px solid #D4AF37" }}>
                            ✓ Activo
                          </span>
                        )}
                      </div>
 
                      <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {e.grado}</span>
                        {(e.disponibilidad ?? []).map((d) => (
                          <span key={d.id} className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {availabilityLabels[d.disponibilidad] ?? d.disponibilidad}
                          </span>
                        ))}
                      </div>
 
                      {(e.habilidades_set ?? []).filter((h) => h.estado === "Aprobado").length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(e.habilidades_set ?? []).filter((h) => h.estado === "Aprobado").slice(0, 3).map((h) => (
                            <span key={h.nombre} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                              {h.nombre} · {h.nivel}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
 
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-xs flex items-center justify-center gap-1.5 transition-colors" style={{ fontWeight: 600 }}>
                      <Eye className="w-3.5 h-3.5" /> Ver perfil
                    </button>
                    <button
                      onClick={() => setSaved((p) => toggle(p, e.id))}
                      className={`p-2 rounded-lg border transition-all ${saved.includes(e.id) ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400"}`}>
                      <Heart className="w-4 h-4" fill={saved.includes(e.id) ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => setReportTarget(`${e.usuario.first_name} ${e.usuario.last_name}`)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all" title="Reportar">
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
 
              {!loading && filtered.length === 0 && (
                <div className="text-center py-16">
                  <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm" style={{ fontWeight: 600 }}>Sin resultados</p>
                  <p className="text-slate-400 text-xs mt-1">Ajusta los filtros de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
 
      {reportTarget && (
        <ReportModal targetName={reportTarget} targetType="usuario" onClose={() => setReportTarget(null)} />
      )}
    </>
  );
}