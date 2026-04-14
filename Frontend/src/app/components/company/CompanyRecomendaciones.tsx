import { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles, Star, CheckCircle, MapPin, Clock, Award,
  Eye, Send, Heart, TrendingUp, Filter, RefreshCw, Zap,
} from "lucide-react";

const recommendations = [
  {
    id: 1,
    name: "Felipe M. R.",
    specialty: "Técnico en Electricidad",
    grade: "4° Medio TP",
    commune: "Lo Espejo",
    availability: "Part-time",
    avatar: "https://images.unsplash.com/photo-1520229534044-62d7cd4e9b0f?w=80&h=80&fit=crop&auto=format",
    validated: true,
    matchScore: 97,
    matchReasons: [
      "Especialidad exacta: Electricidad",
      "Disponibilidad Part-time coincide",
      "Sello de validación institucional",
      "Lo Espejo · Misma zona que la empresa",
    ],
    topSkills: ["Instalaciones Eléctricas", "Lectura de Planos", "Seg. Industrial"],
    soft: ["Responsabilidad 95%", "Puntualidad 92%"],
  },
  {
    id: 2,
    name: "Rodrigo P. M.",
    specialty: "Electricidad / Construcción",
    grade: "4° Medio TP",
    commune: "Pedro Aguirre Cerda",
    availability: "Fines de semana",
    avatar: "https://images.unsplash.com/photo-1630599073777-2fc89fd57921?w=80&h=80&fit=crop&auto=format",
    validated: false,
    matchScore: 78,
    matchReasons: [
      "Especialidad compatible: Construcción",
      "Conocimientos básicos de electricidad",
      "Cercano a Lo Espejo",
    ],
    topSkills: ["Albañilería", "Lectura de Planos", "Carpintería"],
    soft: ["Puntualidad 88%", "Responsabilidad 85%"],
  },
  {
    id: 3,
    name: "Matías C. V.",
    specialty: "Mecánica Automotriz",
    grade: "Egresado 2023",
    commune: "Lo Espejo",
    availability: "Full-time",
    avatar: "https://images.unsplash.com/photo-1690129070358-355e4d9c2fc7?w=80&h=80&fit=crop&auto=format",
    validated: true,
    matchScore: 72,
    matchReasons: [
      "Perfil validado institucionalmente",
      "Egresado con experiencia práctica",
      "Lo Espejo · Misma zona que la empresa",
    ],
    topSkills: ["Diagnóstico Electrónico", "Mantención Motor"],
    soft: ["Responsabilidad 90%", "Trabajo Equipo 82%"],
  },
];

const needs = ["Electricidad", "Part-time", "Lo Espejo", "Validados"];

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
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const toggle = (id: number) => setSaved((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Page header */}
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
        {/* Criteria */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-slate-500 text-xs mb-2" style={{ fontWeight: 600 }}>Criterios de recomendación</p>
          <div className="flex flex-wrap gap-2">
            {needs.map((n) => (
              <span key={n} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full border border-slate-200">
                <Zap className="w-3 h-3 text-slate-400" /> {n}
              </span>
            ))}
            <button className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
              <Filter className="w-3 h-3" /> Ajustar
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4">
          <TrendingUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <p className="text-slate-600 text-sm">
            <span className="text-slate-900" style={{ fontWeight: 600 }}>{recommendations.length} candidatos</span> recomendados ·{" "}
            <span className="text-slate-900" style={{ fontWeight: 600 }}>{recommendations.filter((r) => r.validated).length}</span> con sello institucional ·
            Mejor coincidencia: <span style={{ fontWeight: 600, color: "#B8962E" }}>97%</span>
          </p>
        </div>

        {/* Candidates */}
        {recommendations.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
            {/* Match bar */}
            <div className="h-1 rounded-t-xl" style={{
              width: `${r.matchScore}%`,
              backgroundColor: r.matchScore >= 90 ? "#10b981" : r.matchScore >= 75 ? "#D4AF37" : "#94a3b8",
            }} />

            <div className="p-5">
              <div className="flex items-start gap-4">
                <MatchCircle score={r.matchScore} />

                <div className="relative flex-shrink-0">
                  <img src={r.avatar} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                  {r.validated && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white" style={{ backgroundColor: "#D4AF37" }}>
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>{r.name}</p>
                      <p className="text-slate-600 text-sm" style={{ fontWeight: 500 }}>{r.specialty}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-slate-900 text-xs" style={{ fontWeight: 700 }}>{r.matchScore}%</span>
                      </div>
                      {r.validated && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFFBF0", color: "#B8962E", fontWeight: 600, border: "1px solid #D4AF37" }}>
                          ✓ Validado
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.commune}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.availability}</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {r.grade}</span>
                  </div>
                </div>
              </div>

              {/* Why */}
              <div className="mt-4 bg-slate-50 rounded-xl p-3">
                <p className="text-slate-600 text-xs mb-2" style={{ fontWeight: 600 }}>¿Por qué te recomendamos este perfil?</p>
                <ul className="space-y-1">
                  {r.matchReasons.map((reason) => (
                    <li key={reason} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.topSkills.map((s) => (
                  <span key={s} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">{s}</span>
                ))}
                {r.soft.map((s) => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">{s}</span>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-xs flex items-center justify-center gap-1.5 transition-colors" style={{ fontWeight: 600 }}>
                  <Eye className="w-3.5 h-3.5" /> Ver Pasaporte
                </button>
                <button className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors" style={{ fontWeight: 600 }}>
                  <Send className="w-3.5 h-3.5" /> Contactar
                </button>
                <button onClick={() => toggle(r.id)}
                  className={`p-2 rounded-lg border transition-all ${saved.includes(r.id) ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400"}`}>
                  <Heart className="w-4 h-4" fill={saved.includes(r.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}