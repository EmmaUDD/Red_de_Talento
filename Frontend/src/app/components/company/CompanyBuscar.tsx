import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, MapPin, Clock, Award, Star, CheckCircle,
  Users, Send, Eye, X, Filter, Flag, Heart, ChevronDown,
} from "lucide-react";
import { ReportModal } from "../shared/ReportModal";

const specialties = ["Electricidad", "Mecánica / Metalurgia", "Computación", "Construcción"];
const communes = ["Lo Espejo", "Santiago Centro", "Pedro Aguirre Cerda", "La Cisterna"];
const availabilities = ["Part-time", "Full-time", "Fines de semana", "Práctica"];

const candidates = [
  {
    id: 1, name: "Felipe M. R.", specialty: "Técnico en Electricidad", grade: "4° Medio TP",
    commune: "Lo Espejo", availability: "Part-time",
    badges: ["⚡ Instalador Cert.", "🛡️ Seg. Industrial", "🌟 Equipo Estrella"],
    soft: ["Responsabilidad 95%", "Puntualidad 92%", "Trabajo Equipo 88%"],
    validated: true,
    avatar: "https://images.unsplash.com/photo-1520229534044-62d7cd4e9b0f?w=80&h=80&fit=crop&auto=format",
    score: 92,
  },
  {
    id: 2, name: "Valentina S. L.", specialty: "Computación e Informática", grade: "EPJA",
    commune: "Lo Espejo", availability: "Full-time",
    badges: ["💻 Dev. Web Básico", "🌟 Liderazgo"],
    soft: ["Comunicación 90%", "Creatividad 85%"],
    validated: true,
    avatar: "https://images.unsplash.com/photo-1650600538903-ec09f670c391?w=80&h=80&fit=crop&auto=format",
    score: 88,
  },
  {
    id: 3, name: "Matías C. V.", specialty: "Mecánica Automotriz", grade: "Egresado 2023",
    commune: "Lo Espejo", availability: "Full-time",
    badges: ["🔧 Diagnóstico Elect.", "⚙️ Mantención Motor"],
    soft: ["Responsabilidad 90%", "Trabajo Equipo 82%"],
    validated: true,
    avatar: "https://images.unsplash.com/photo-1690129070358-355e4d9c2fc7?w=80&h=80&fit=crop&auto=format",
    score: 85,
  },
  {
    id: 4, name: "Rodrigo P. M.", specialty: "Construcción", grade: "4° Medio TP",
    commune: "Pedro Aguirre Cerda", availability: "Fines de semana",
    badges: ["🏗️ Albañilería Cert.", "📐 Lectura de Planos"],
    soft: ["Puntualidad 88%", "Responsabilidad 85%"],
    validated: false,
    avatar: "https://images.unsplash.com/photo-1630599073777-2fc89fd57921?w=80&h=80&fit=crop&auto=format",
    score: 78,
  },
];

export function CompanyBuscar() {
  const [query, setQuery] = useState("");
  const [selSpec, setSelSpec] = useState<string[]>([]);
  const [selComm, setSelComm] = useState<string[]>([]);
  const [selAvail, setSelAvail] = useState<string[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);

  const toggle = <T,>(arr: T[], val: T) => arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const filtered = candidates.filter((c) => {
    const q = query.toLowerCase();
    const mQ = !q || c.name.toLowerCase().includes(q) || c.specialty.toLowerCase().includes(q) || c.commune.toLowerCase().includes(q);
    const mS = selSpec.length === 0 || selSpec.some((s) => c.specialty.toLowerCase().includes(s.toLowerCase()));
    const mC = selComm.length === 0 || selComm.includes(c.commune);
    const mA = selAvail.length === 0 || selAvail.includes(c.availability);
    return mQ && mS && mC && mA;
  });

  const hasFilters = selSpec.length + selComm.length + selAvail.length > 0;

  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB]">
        {/* Page header */}
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
                  placeholder="Buscar por nombre, especialidad o comuna..."
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
                    {selSpec.length + selComm.length + selAvail.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5">
          <div className="flex flex-col md:flex-row gap-5">
            {/* Filters sidebar */}
            <AnimatePresence>
              {showFilters && (
                <motion.aside
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="w-full md:w-56 flex-shrink-0 space-y-3"
                >
                  {[
                    { title: "Especialidad", items: specialties, selected: selSpec, set: setSelSpec },
                    { title: "Comuna", items: communes, selected: selComm, set: setSelComm },
                    { title: "Disponibilidad", items: availabilities, selected: selAvail, set: setSelAvail },
                  ].map((group) => (
                    <div key={group.title} className="bg-white rounded-xl border border-slate-200 p-4">
                      <h3 className="text-slate-900 text-xs mb-3" style={{ fontWeight: 600 }}>{group.title}</h3>
                      <div className="space-y-2">
                        {group.items.map((item) => {
                          const checked = group.selected.includes(item);
                          return (
                            <label key={item} className="flex items-center gap-2.5 cursor-pointer">
                              <div
                                onClick={() => group.set((p: string[]) => toggle(p, item))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${checked ? "bg-slate-900 border-slate-900" : "border-slate-300 hover:border-slate-500"}`}
                              >
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
                    <button
                      onClick={() => { setSelSpec([]); setSelComm([]); setSelAvail([]); }}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      Limpiar filtros
                    </button>
                  )}
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Results */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm">
                  <span className="text-slate-900" style={{ fontWeight: 600 }}>{filtered.length}</span> candidatos
                </p>
                <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none text-slate-700">
                  <option>Mayor puntuación</option>
                  <option>Validados primero</option>
                </select>
              </div>

              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <img src={c.avatar} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                      {c.validated && (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                          style={{ backgroundColor: "#D4AF37" }}
                        >
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>{c.name}</p>
                          <p className="text-slate-600 text-sm" style={{ fontWeight: 500 }}>{c.specialty}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-slate-900 text-xs" style={{ fontWeight: 700 }}>{c.score}</span>
                          </div>
                          {c.validated && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "#FFFBF0", color: "#B8962E", fontWeight: 600, border: "1px solid #D4AF37" }}
                            >
                              ✓ Validado
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.commune}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.availability}</span>
                        <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {c.grade}</span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {c.badges.map((b) => (
                          <span key={b} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">{b}</span>
                        ))}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {c.soft.map((s) => (
                          <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-xs flex items-center justify-center gap-1.5 transition-colors" style={{ fontWeight: 600 }}>
                      <Eye className="w-3.5 h-3.5" /> Ver Pasaporte
                    </button>
                    <button className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors" style={{ fontWeight: 600 }}>
                      <Send className="w-3.5 h-3.5" /> Contactar
                    </button>
                    <button
                      onClick={() => setSaved((p) => toggle(p, c.id))}
                      className={`p-2 rounded-lg border transition-all ${saved.includes(c.id) ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400"}`}
                    >
                      <Heart className="w-4 h-4" fill={saved.includes(c.id) ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => setReportTarget(c.name)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                      title="Reportar usuario"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {filtered.length === 0 && (
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
        <ReportModal
          targetName={reportTarget}
          targetType="usuario"
          onClose={() => setReportTarget(null)}
        />
      )}
    </>
  );
}
