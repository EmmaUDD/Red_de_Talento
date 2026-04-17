import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BarChart2, TrendingUp, Users, Building2, Award,
  Briefcase, Star, ArrowUp, Zap, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { docenteApi } from "@/api/api";
import type { EstadisticasGenerales } from "@/app/types";

const COLORS = ["#0f2557", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];

const monthlyValidations = [
  { mes: "Ago", validados: 4 }, { mes: "Sep", validados: 8 },
  { mes: "Oct", validados: 5 }, { mes: "Nov", validados: 11 },
  { mes: "Dic", validados: 7 }, { mes: "Ene", validados: 9 },
  { mes: "Feb", validados: 13 }, { mes: "Mar", validados: 10 },
];

const employmentTrend = [
  { mes: "Sep", tasa: 68 }, { mes: "Oct", tasa: 72 },
  { mes: "Nov", tasa: 75 }, { mes: "Dic", tasa: 71 },
  { mes: "Ene", tasa: 80 }, { mes: "Feb", tasa: 85 },
  { mes: "Mar", tasa: 92 },
];

const recentActivity = [
  { action: "Sistema de validación activo", time: "hoy", icon: "⚡" },
  { action: "Alumnos en proceso de evaluación", time: "esta semana", icon: "📋" },
  { action: "Empresas aliadas conectadas", time: "este mes", icon: "🏢" },
  { action: "Cursos publicados disponibles", time: "este mes", icon: "📚" },
];

export function TeacherEstadisticas() {
  const [stats, setStats] = useState<EstadisticasGenerales | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    docenteApi.getEstadisticas()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Distribución por especialidad desde el backend
  const specialtyDist = stats?.por_especialidad?.map((s, i) => ({
    name: s.especialidad,
    value: s.cantidad,
    color: COLORS[i % COLORS.length],
  })) ?? [];

  // KPIs
  const kpis = [
    { label: "Alumnos activos", value: stats?.total_estudiantes?.toString() ?? "—", icon: Users },
    { label: "Perfiles validados", value: stats?.estudiantes_validados?.toString() ?? "—", icon: Award },
    { label: "Postulaciones mes", value: stats?.postulaciones_este_mes?.toString() ?? "—", icon: Briefcase },
    { label: "Empresas aliadas", value: stats?.total_empresas?.toString() ?? "—", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Estadísticas de la Plataforma</h1>
          <p className="text-slate-500 text-sm mt-0.5">Liceo Cardenal Caro · Año escolar 2025</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {kpis.map((k) => {
              const Icon = k.icon;
              return (
                <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <div className="flex items-center gap-1 text-green-600 text-xs" style={{ fontWeight: 600 }}>
                      <ArrowUp className="w-3 h-3" />
                      +este mes
                    </div>
                  </div>
                  <p className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.75rem", lineHeight: 1 }}>
                    {loading ? "…" : k.value}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">{k.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Validaciones por mes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Validaciones por mes</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyValidations} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  formatter={(v) => [`${v} alumnos`, "Validados"]} />
                <Bar dataKey="validados" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Por especialidad */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-slate-400" />
              <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Por especialidad</h3>
            </div>
            {specialtyDist.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                {loading ? "Cargando…" : "Sin datos de especialidades"}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={specialtyDist} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value">
                      {specialtyDist.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {specialtyDist.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-slate-600 text-xs flex-1 truncate">{s.name}</span>
                      <span className="text-slate-900 text-xs" style={{ fontWeight: 600 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tasa de inserción */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Tasa de inserción laboral (%)</h3>
            </div>
            <span className="text-green-600 text-xs flex items-center gap-1" style={{ fontWeight: 600 }}>
              <ArrowUp className="w-3 h-3" /> +24% este año
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={employmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                formatter={(v) => [`${v}%`, "Inserción"]} />
              <Line type="monotone" dataKey="tasa" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-slate-400" />
              <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Actividad reciente</h3>
            </div>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-1 border-b border-slate-50 last:border-0">
                  <span className="text-base flex-shrink-0">{a.icon}</span>
                  <div className="flex-1">
                    <p className="text-slate-700 text-sm">{a.action}</p>
                    <p className="text-slate-400 text-xs">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-slate-400" />
              <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Resumen de impacto</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Alumnos validados este año", value: stats?.estudiantes_validados ?? 0, gold: true },
                { label: "Ofertas laborales activas", value: stats?.total_ofertas_activas ?? 0, gold: false },
                { label: "Postulaciones este mes", value: stats?.postulaciones_este_mes ?? 0, gold: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${i === 0 ? "text-white" : "bg-slate-200 text-slate-700"}`}
                    style={i === 0 ? { backgroundColor: "#D4AF37" } : {}}>
                    <span className="text-xs" style={{ fontWeight: 700 }}>#{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>
                      {loading ? "…" : s.value}
                    </p>
                    <p className="text-slate-500 text-xs">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Institutional note */}
        <div className="bg-slate-900 rounded-xl p-5 text-white flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#D4AF37" }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white mb-1 text-sm" style={{ fontWeight: 700 }}>Recomendación institucional</h3>
            <p className="text-white/60 text-xs leading-relaxed">
              Continúa ampliando las alianzas con empresas locales de Lo Espejo y comunas aledañas para maximizar la inserción laboral de los egresados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
