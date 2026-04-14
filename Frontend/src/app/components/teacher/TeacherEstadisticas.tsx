import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Users, Building2, Award, Briefcase,
  TrendingUp, Activity,
} from "lucide-react";
import { apiRequest } from "../../../api/client";

interface Stats {
  estudiantes_reg: number;
  empresas_reg: number;
  habilidades_all: number;
  postulaciones_all: number;
}

export function TeacherEstadisticas() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/estadisticas/")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Estudiantes registrados", value: stats.estudiantes_reg, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Empresas registradas", value: stats.empresas_reg, icon: Building2, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Habilidades aprobadas", value: stats.habilidades_all, icon: Award, color: "text-green-600", bg: "bg-green-50" },
        { label: "Postulaciones totales", value: stats.postulaciones_all, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Estadísticas de la Plataforma</h1>
          <p className="text-slate-500 text-sm mt-0.5">Liceo Cardenal Caro · Datos en tiempo real</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Cargando estadísticas...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-xl border border-slate-200 p-5"
                  >
                    <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <p className="text-slate-900" style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1 }}>
                      {card.value}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">{card.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Info adicional */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-slate-500" />
                <h3 className="text-slate-900" style={{ fontWeight: 600 }}>Resumen</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Tasa de postulaciones por estudiante</span>
                  <span className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>
                    {stats && stats.estudiantes_reg > 0
                      ? (stats.postulaciones_all / stats.estudiantes_reg).toFixed(1)
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Habilidades aprobadas por estudiante</span>
                  <span className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>
                    {stats && stats.estudiantes_reg > 0
                      ? (stats.habilidades_all / stats.estudiantes_reg).toFixed(1)
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600 text-sm">Empresas por cada 10 estudiantes</span>
                  <span className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>
                    {stats && stats.estudiantes_reg > 0
                      ? ((stats.empresas_reg / stats.estudiantes_reg) * 10).toFixed(1)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <h3 className="text-slate-900" style={{ fontWeight: 600 }}>Nota</h3>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Las estadísticas muestran datos reales de la base de datos. Los gráficos históricos
                estarán disponibles a medida que se acumulen más datos en la plataforma.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}