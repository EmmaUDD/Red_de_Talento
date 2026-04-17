import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Search, MapPin, Clock, Briefcase, CheckCircle, Bookmark,
  Send, X, Star, Building2, ListChecks, Loader2,
} from "lucide-react";
import { ofertasApi, postulacionesApi } from "@/api/api";
import { useAuth } from "@/app/context/AuthContext";
import type { OfertaLaboral, Postulacion } from "@/app/types";

const TIPOS = ["Todos", "Part-time", "Full-time", "Práctica"];
const ESPECIALIDADES = ["Todas", "Electricidad", "Construcción", "Computación e Informática", "Mecánica Automotriz"];

const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente",
  revisado: "En revisión",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
};
const estadoColors: Record<string, string> = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  revisado: "bg-blue-50 text-blue-700 border-blue-200",
  aceptado: "bg-green-50 text-green-700 border-green-200",
  rechazado: "bg-red-50 text-red-600 border-red-200",
};

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

  const handlePostular = async () => {
    setApplying(true);
    try {
      await onPostular(mensaje);
      setApplied(true);
    } catch {
      // silently fail
    } finally {
      setApplying(false);
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
              <div className="w-12 h-12 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-bold">{job.titulo}</h2>
                  {job.empresa_verificada && <CheckCircle className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-blue-300 text-sm">{job.empresa}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1">
              <Briefcase className="w-3 h-3" /> {job.tipo}
            </span>
            {job.salario && (
              <span className="flex items-center gap-1 text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1">
                💰 {Number(job.salario).toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1">
              <MapPin className="w-3 h-3" /> {job.ubicacion}
            </span>
            <span className="flex items-center gap-1 text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1">
              🖥 {job.modalidad}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-slate-800 font-semibold mb-2" style={{ fontSize: "0.9rem" }}>Descripción</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{job.descripcion}</p>
          </div>

          {job.requisitos?.length > 0 && (
            <div>
              <h4 className="text-slate-800 font-semibold mb-2" style={{ fontSize: "0.9rem" }}>Requisitos</h4>
              <ul className="space-y-1.5">
                {job.requisitos.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!applied && (
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">
                Mensaje al empleador <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={3}
                placeholder="Cuéntale brevemente por qué eres el candidato ideal..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          )}

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <Star className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-amber-700 text-xs">
              Al postular, la empresa verá tu perfil con habilidades validadas por el Liceo.
            </p>
          </div>

          <div className="flex gap-3">
            {applied ? (
              <div className="flex-1 bg-green-100 text-green-700 font-semibold py-3.5 rounded-2xl text-sm text-center">
                ✓ Postulación enviada
              </div>
            ) : (
              <button
                onClick={handlePostular}
                disabled={applying}
                className="flex-1 bg-[#0f2557] hover:bg-[#1a3a7c] text-white py-3.5 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {applying ? "Enviando…" : "Postular con mi Pasaporte"}
              </button>
            )}
            <button className="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-blue-300 text-slate-400 hover:text-blue-600 transition-all">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-slate-400 text-xs">
            Al postular, el empleador verá tu Pasaporte de Oficio validado por el Liceo
          </p>
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
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-slate-900 font-bold" style={{ fontSize: "1.25rem" }}>Empleos para ti</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {user?.especialidad ? `Basado en tu especialidad: ${user.especialidad}` : "Ofertas laborales disponibles"}
          </p>

          <div className="flex gap-1 mt-4 bg-slate-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setMainTab("ofertas")}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                mainTab === "ofertas"
                  ? "bg-white shadow-sm text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-700 font-medium"
              }`}
            >
              Ofertas
            </button>
            <button
              onClick={() => setMainTab("postulaciones")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm transition-all ${
                mainTab === "postulaciones"
                  ? "bg-white shadow-sm text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-700 font-medium"
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              Mis postulaciones
            </button>
          </div>

          {mainTab === "ofertas" && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cargo, empresa o lugar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-100 border border-transparent rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-slate-300 transition-all"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {mainTab === "ofertas" && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TIPOS.map((t) => (
                <button key={t} onClick={() => setSelectedType(t)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    selectedType === t
                      ? "bg-slate-900 text-white border-slate-900 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 font-medium"
                  }`}>
                  {t}
                </button>
              ))}
              <div className="w-px bg-slate-200 flex-shrink-0" />
              {ESPECIALIDADES.map((s) => (
                <button key={s} onClick={() => setSelectedSpec(s)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    selectedSpec === s ? "font-semibold" : "font-normal"
                  }`}
                  style={{
                    backgroundColor: selectedSpec === s ? "#FFFBF0" : "white",
                    color: selectedSpec === s ? "#B8962E" : "#64748b",
                    borderColor: selectedSpec === s ? "#D4AF37" : "#e2e8f0",
                  }}>
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-sm">
                <span className="text-slate-900 font-semibold">{filtered.length}</span> ofertas disponibles
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((job, i) => (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => setActiveJob(job)}>
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.9rem" }}>{job.titulo}</h3>
                              {job.empresa_verificada && <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                            </div>
                            <p className="text-slate-500 text-sm">{job.empresa}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setSaved((p) => p.includes(job.id) ? p.filter((x) => x !== job.id) : [...p, job.id]); }}
                            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${saved.includes(job.id) ? "text-slate-900" : "text-slate-300 hover:text-slate-500"}`}>
                            <Bookmark className="w-4 h-4" fill={saved.includes(job.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                            <Briefcase className="w-3 h-3" /> {job.tipo}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" /> {job.ubicacion}
                          </span>
                          <span className="text-xs text-slate-400">
                            <Clock className="w-3 h-3 inline mr-0.5" />
                            {new Date(job.fecha_publicacion).toLocaleDateString("es-CL")}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">{job.descripcion}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {job.modalidad}
                      </div>
                      <span className="text-xs font-semibold text-slate-600">Ver oferta →</span>
                    </div>
                  </motion.div>
                ))}

                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-semibold">Sin ofertas disponibles</p>
                    <p className="text-slate-400 text-xs mt-1">Intenta con otros filtros</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {mainTab === "postulaciones" && (
          <>
            {loadingPostulaciones ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : misPostulaciones.length === 0 ? (
              <div className="text-center py-16">
                <ListChecks className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">Sin postulaciones aún</p>
                <p className="text-slate-400 text-xs mt-1">Postula a ofertas desde la pestaña Ofertas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {misPostulaciones.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-900 text-sm font-semibold">
                            {p.oferta_titulo ?? `Oferta #${p.oferta}`}
                          </p>
                          <p className="text-slate-500 text-xs">{p.oferta_empresa_nombre ?? "—"}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${estadoColors[p.estado] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                        {estadoLabel[p.estado] ?? p.estado}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(p.fecha_postulacion).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    {p.mensaje_estudiante && (
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2 line-clamp-2">
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
