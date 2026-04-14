import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { apiRequest } from "../../../api/client";
import {
  Search, MapPin, Clock, Briefcase, CheckCircle, Bookmark,
  Send, X, Star, Building2,
} from "lucide-react";

interface Oferta {
  id: number;
  titulo: string;
  descripcion: string;
  especialidad_requerida: string;
  remuneracion: string | null;
  ubicacion: string | null;
  modalidad: string;
  disponibilidad_requerida: string | null;
  fecha_publicacion: string;
  activa: boolean;
  empresa: number;
  empresa_nombre?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "hace 1 día";
  return `hace ${days} días`;
}

function JobDetailModal({ job, onClose }: { job: Oferta; onClose: () => void }) {
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleApply = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/api/postulaciones/", {
        method: "POST",
        body: JSON.stringify({ oferta: job.id, mensaje_estudiante: msg }),
      });
      if (res.ok) {
        setApplied(true);
      } else {
        const data = await res.json();
        alert(Object.values(data)[0] as string);
      }
    } catch {
      alert("Error al postular. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="bg-gradient-to-r from-[#0f2557] to-[#1a3a7c] rounded-t-3xl p-5 text-white">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white" style={{ fontWeight: 700 }}>{job.titulo}</h2>
                <p className="text-blue-300 text-sm">{job.empresa_nombre ?? `Empresa #${job.empresa}`}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1">
              <Briefcase className="w-3 h-3" /> {job.modalidad}
            </span>
            {job.remuneracion && (
              <span className="flex items-center gap-1 text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1">
                💰 {job.remuneracion}
              </span>
            )}
            {job.ubicacion && (
              <span className="flex items-center gap-1 text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1">
                <MapPin className="w-3 h-3" /> {job.ubicacion}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-slate-800 mb-2" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Descripción</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{job.descripcion}</p>
          </div>
          <div>
            <h4 className="text-slate-800 mb-1" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Especialidad requerida</h4>
            <p className="text-slate-600 text-sm">{job.especialidad_requerida}</p>
          </div>
          {job.disponibilidad_requerida && (
            <div>
              <h4 className="text-slate-800 mb-1" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Disponibilidad requerida</h4>
              <p className="text-slate-600 text-sm">{job.disponibilidad_requerida}</p>
            </div>
          )}

          {!applied && (
            <div>
              <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>
                Mensaje (opcional)
              </label>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={3}
                placeholder="Preséntate brevemente al empleador..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          )}

          <div className="flex gap-3">
            {applied ? (
              <div className="flex-1 bg-green-100 text-green-700 py-3.5 rounded-2xl text-sm text-center" style={{ fontWeight: 600 }}>
                ✓ Postulación enviada
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={loading}
                className="flex-1 bg-[#0f2557] hover:bg-[#1a3a7c] disabled:opacity-50 text-white py-3.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
                style={{ fontWeight: 600 }}
              >
                <Send className="w-4 h-4" />
                {loading ? "Enviando..." : "Postular"}
              </button>
            )}
          </div>
          <p className="text-center text-slate-400 text-xs">
            Al postular, el empleador verá tu perfil validado por el Liceo
          </p>
        </div>
      </motion.div>
    </div>
  );
}

const tipos = ["Todos", "online", "presencial", "semi_presencial"];

export function StudentEmpleos() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const [saved, setSaved] = useState<number[]>([]);
  const [activeJob, setActiveJob] = useState<Oferta | null>(null);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/ofertas/")
      .then((r) => r.json())
      .then((data) => setOfertas(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = ofertas.filter((j) => {
    const q = query.toLowerCase();
    const matchQ = !q || j.titulo.toLowerCase().includes(q) || j.especialidad_requerida.toLowerCase().includes(q) || (j.ubicacion ?? "").toLowerCase().includes(q);
    const matchType = selectedType === "Todos" || j.modalidad === selectedType;
    return matchQ && matchType;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Empleos disponibles</h1>
          <p className="text-slate-500 text-sm mt-0.5">Ofertas laborales activas en la plataforma</p>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cargo, especialidad o lugar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-100 border border-transparent rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-slate-300 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tipos.map((t) => (
            <button key={t} onClick={() => setSelectedType(t)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs transition-all ${selectedType === t ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
              style={{ fontWeight: selectedType === t ? 600 : 500 }}>
              {t === "Todos" ? "Todos" : t === "online" ? "Online" : t === "presencial" ? "Presencial" : "Semi-presencial"}
            </button>
          ))}
        </div>

        <p className="text-slate-500 text-sm">
          <span className="text-slate-900" style={{ fontWeight: 600 }}>{filtered.length}</span> ofertas disponibles
        </p>

        {loading ? (
          <div className="text-center py-10 text-slate-400 text-sm">Cargando ofertas...</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => setActiveJob(job)}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-100 flex-shrink-0">
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-slate-900" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{job.titulo}</h3>
                        <p className="text-slate-500 text-sm">{job.empresa_nombre ?? `Empresa #${job.empresa}`}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setSaved((p) => p.includes(job.id) ? p.filter((x) => x !== job.id) : [...p, job.id]); }}
                        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${saved.includes(job.id) ? "text-slate-900" : "text-slate-300 hover:text-slate-500"}`}>
                        <Bookmark className="w-4 h-4" fill={saved.includes(job.id) ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200" style={{ fontWeight: 600 }}>
                        <Briefcase className="w-3 h-3" /> {job.modalidad}
                      </span>
                      {job.ubicacion && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" /> {job.ubicacion}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        <Clock className="w-3 h-3 inline mr-0.5" /> {timeAgo(job.fecha_publicacion)}
                      </span>
                    </div>

                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">{job.descripcion}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {job.especialidad_requerida}
                  </div>
                  <span className="text-xs text-slate-600" style={{ fontWeight: 600 }}>Ver oferta →</span>
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="text-center py-16">
                <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm" style={{ fontWeight: 600 }}>Sin ofertas disponibles</p>
                <p className="text-slate-400 text-xs mt-1">Intenta con otros filtros</p>
              </div>
            )}
          </div>
        )}
      </div>

      {activeJob && (
        <JobDetailModal job={activeJob} onClose={() => setActiveJob(null)} />
      )}
    </div>
  );
}