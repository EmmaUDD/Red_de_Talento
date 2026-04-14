import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Sparkles, Star, CheckCircle, MapPin, Clock, Award,
  Eye, Heart, TrendingUp, Filter, RefreshCw, Zap, Users, Briefcase,
} from "lucide-react";
import { apiRequest } from "../../../api/client";
 
interface Candidato {
  id: number;
  usuario: { id: number; first_name: string; last_name: string; is_active: boolean };
  especialidad: string;
  grado: string;
  disponibilidad?: { id: number; disponibilidad: string }[];
  habilidades_set?: { nombre: string; nivel: string; estado: string }[];
  score?: number;
}
 
interface Oferta {
  id: number;
  titulo: string;
  especialidad_requerida: string;
}
 
const availabilityLabels: Record<string, string> = {
  part_time: "Part-time",
  full_time: "Full-time",
  fines_de_semana: "Fines de semana",
  practicas: "Prácticas",
};
 
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
  const [saved, setSaved] = useState<number[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [selectedOferta, setSelectedOferta] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
 
  const toggle = (id: number) => setSaved((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
 
  useEffect(() => {
    // Cargar las ofertas de esta empresa
    apiRequest("/api/ofertas/")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setOfertas(data);
          if (data.length > 0) setSelectedOferta(data[0].id);
        }
      })
      .catch(() => {});
  }, []);
 
  useEffect(() => {
    if (!selectedOferta) return;
    loadRecomendaciones();
  }, [selectedOferta]);
 
  const loadRecomendaciones = async () => {
    if (!selectedOferta) return;
    setLoading(true);
    try {
      const res = await apiRequest(`/api/empresa/recomendacion/${selectedOferta}/`);
      if (res.ok) {
        const data = await res.json();
        setCandidatos(data);
      }
    } catch {}
    setLoading(false);
  };
 
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecomendaciones();
    setRefreshing(false);
  };
 
  const ofertaActual = ofertas.find((o) => o.id === selectedOferta);
 
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-slate-500" />
              <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Talento Recomendado</h1>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">Candidatos ordenados por coincidencia con tu oferta</p>
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
 
        {/* Selector de oferta */}
        {ofertas.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-slate-500 text-xs mb-2" style={{ fontWeight: 600 }}>Oferta para recomendar</p>
            <select
              value={selectedOferta ?? ""}
              onChange={(e) => setSelectedOferta(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {ofertas.map((o) => (
                <option key={o.id} value={o.id}>{o.titulo} · {o.especialidad_requerida}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm" style={{ fontWeight: 600 }}>No tienes ofertas publicadas</p>
            <p className="text-slate-400 text-xs mt-1">Publica una oferta para ver candidatos recomendados.</p>
          </div>
        )}
 
        {/* Summary */}
        {candidatos.length > 0 && (
          <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4">
            <TrendingUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <p className="text-slate-600 text-sm">
              <span className="text-slate-900" style={{ fontWeight: 600 }}>{candidatos.length} candidatos</span> encontrados ·{" "}
              <span className="text-slate-900" style={{ fontWeight: 600 }}>{candidatos.filter((c) => c.usuario.is_active).length}</span> activos
              {candidatos[0]?.score !== undefined && (
                <> · Mejor coincidencia: <span style={{ fontWeight: 600, color: "#B8962E" }}>{candidatos[0].score}%</span></>
              )}
            </p>
          </div>
        )}
 
        {/* Candidates */}
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-sm">Calculando recomendaciones...</div>
        ) : candidatos.map((c, i) => {
          const score = c.score ?? Math.max(30, 100 - i * 10);
          const habAprobadas = (c.habilidades_set ?? []).filter((h) => h.estado === "Aprobado");
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
              <div className="h-1 rounded-t-xl" style={{
                width: `${score}%`,
                backgroundColor: score >= 90 ? "#10b981" : score >= 75 ? "#D4AF37" : "#94a3b8",
              }} />
 
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <MatchCircle score={score} />
 
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
 
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>
                          {c.usuario.first_name} {c.usuario.last_name}
                        </p>
                        <p className="text-slate-600 text-sm" style={{ fontWeight: 500 }}>{c.especialidad}</p>
                      </div>
                      {c.usuario.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#FFFBF0", color: "#B8962E", fontWeight: 600, border: "1px solid #D4AF37" }}>
                          ✓ Activo
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {c.grado}</span>
                      {(c.disponibilidad ?? []).map((d) => (
                        <span key={d.id} className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {availabilityLabels[d.disponibilidad] ?? d.disponibilidad}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
 
                {/* Razones de coincidencia */}
                <div className="mt-4 bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-600 text-xs mb-2" style={{ fontWeight: 600 }}>¿Por qué te recomendamos este perfil?</p>
                  <ul className="space-y-1">
                    {c.especialidad.toLowerCase().includes((ofertaActual?.especialidad_requerida ?? "").toLowerCase()) && (
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        Especialidad coincide con la oferta
                      </li>
                    )}
                    {c.usuario.is_active && (
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        Perfil activo y validado por el Liceo
                      </li>
                    )}
                    {habAprobadas.length > 0 && (
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {habAprobadas.length} habilidad{habAprobadas.length > 1 ? "es" : ""} aprobada{habAprobadas.length > 1 ? "s" : ""}
                      </li>
                    )}
                  </ul>
                </div>
 
                {/* Habilidades */}
                {habAprobadas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {habAprobadas.slice(0, 4).map((h) => (
                      <span key={h.nombre} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                        {h.nombre} · {h.nivel}
                      </span>
                    ))}
                  </div>
                )}
 
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-xs flex items-center justify-center gap-1.5 transition-colors" style={{ fontWeight: 600 }}>
                    <Eye className="w-3.5 h-3.5" /> Ver perfil
                  </button>
                  <button onClick={() => toggle(c.id)}
                    className={`p-2 rounded-lg border transition-all ${saved.includes(c.id) ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400"}`}>
                    <Heart className="w-4 h-4" fill={saved.includes(c.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
 
        {!loading && selectedOferta && candidatos.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm" style={{ fontWeight: 600 }}>Sin recomendaciones aún</p>
            <p className="text-slate-400 text-xs mt-1">No hay estudiantes activos que coincidan con esta oferta.</p>
          </div>
        )}
      </div>
    </div>
  );
}