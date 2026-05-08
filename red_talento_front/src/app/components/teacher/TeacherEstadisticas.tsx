import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, Building2, Award, Briefcase, ArrowUp, Zap } from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { docenteApi } from "@/api/api";
import type { EstadisticasGenerales } from "@/app/types";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const CHART_COLORS = ["#0d1b35", "#D4AF37", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];

const S = {
  label: {
    fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: 0,
  } as React.CSSProperties,
  card: {
    backgroundColor: "white", border: "1px solid #E8E4DC",
    borderRadius: 16, padding: "20px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  } as React.CSSProperties,
};

function Spinner({ size = 18 }: { size?: number }) {
  return (
    <div
      className="animate-spin"
      style={{ width: size, height: size, borderRadius: "50%", border: "2.5px solid #E8E4DC", borderTopColor: "#D4AF37", flexShrink: 0 }}
    />
  );
}

function CardHeading({ icon: Icon, title, right, gold }: {
  icon: React.ElementType; title: string; right?: React.ReactNode; gold?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          backgroundColor: gold ? "#FFFBF0" : "#F6F5F0",
          border: gold ? "1px solid #F5E6C0" : "1px solid #E8E4DC",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon style={{ width: 12, height: 12, color: gold ? "#D4AF37" : "#8C7B6B" }} />
        </div>
        <p style={{ ...S.label }}>{title}</p>
      </div>
      {right}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 140 }}>
      <p style={{ margin: 0, color: "#C4BDB5", fontSize: "0.8rem" }}>{text}</p>
    </div>
  );
}

export function TeacherEstadisticas() {
  const [stats, setStats] = useState<EstadisticasGenerales | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.href = FONT_URL; link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    docenteApi.getEstadisticas()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const specialtyDist = stats?.por_especialidad?.map((s, i) => ({
    name: s.especialidad,
    value: s.cantidad,
    color: CHART_COLORS[i % CHART_COLORS.length],
  })) ?? [];

  const employmentTrend = stats?.contratados_por_mes ?? [];

  const kpis = [
    { label: "Alumnos activos",       value: stats?.total_estudiantes,      icon: Users,     gold: false },
    { label: "Habilidades aprobadas", value: stats?.total_habilidades,      icon: Award,     gold: true  },
    { label: "Postulaciones",         value: stats?.postulaciones_este_mes, icon: Briefcase, gold: false },
    { label: "Empresas aliadas",      value: stats?.total_empresas,         icon: Building2, gold: false },
  ];

  const impacto = [
    { label: "Habilidades aprobadas",     value: stats?.total_habilidades       ?? 0 },
    { label: "Ofertas laborales activas", value: stats?.total_ofertas_activas   ?? 0 },
    { label: "Postulaciones totales",     value: stats?.postulaciones_este_mes  ?? 0 },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div style={{
        backgroundColor: "#0d1b35",
        backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.15) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
        borderBottom: "3px solid #D4AF37",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Zap style={{ width: 15, height: 15, color: "white" }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: "1.1rem", color: "white", lineHeight: 1.2 }}>
                Estadísticas de la Plataforma
              </h1>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", marginTop: 2 }}>
                Liceo Cardenal Caro · Año escolar 2025
              </p>
            </div>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
            borderRadius: "12px 12px 0 0", overflow: "hidden",
            borderBottom: "none",
          }}>
            {kpis.map((k, i) => {
              const Icon = k.icon;
              return (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    textAlign: "center", padding: "14px 8px",
                    borderRight: i < 3 ? "1px solid #E8E4DC" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: k.gold ? "#FFFBF0" : "white", border: k.gold ? "1px solid #F5E6C0" : "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon style={{ width: 11, height: 11, color: k.gold ? "#D4AF37" : "#94a3b8" }} />
                    </div>
                  </div>
                  {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
                      <Spinner size={16} />
                    </div>
                  ) : (
                    <p style={{
                      margin: 0, lineHeight: 1,
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontWeight: 800, fontSize: "1.6rem",
                      color: k.gold ? "#D4AF37" : "#0d1b35",
                    }}>
                      {k.value?.toString() ?? "—"}
                    </p>
                  )}
                  <p style={{ ...S.label, marginTop: 4 }}>{k.label}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginTop: 5, color: "#10b981", fontSize: "0.6rem", fontWeight: 700 }}>
                    <ArrowUp style={{ width: 9, height: 9 }} />
                    este mes
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            style={{ ...S.card, display: "flex", flexDirection: "column" }}
          >
            <CardHeading icon={Award} title="Habilidades validadas" gold />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "16px 0" }}>
              {loading ? (
                <Spinner size={28} />
              ) : (
                <p style={{ margin: 0, lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: "4.5rem", color: "#D4AF37" }}>
                  {stats?.total_habilidades ?? 0}
                </p>
              )}
              <p style={{ margin: 0, color: "#8C7B6B", fontSize: "0.78rem" }}>habilidades aprobadas en total</p>
              <p style={{ margin: 0, color: "#C4BDB5", fontSize: "0.7rem" }}>Certificadas por docentes del Liceo</p>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: "linear-gradient(90deg, #D4AF37 0%, rgba(212,175,55,0.1) 100%)" }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
            style={{ ...S.card }}
          >
            <CardHeading icon={Users} title="Distribución por especialidad" />
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 140 }}>
                <Spinner size={22} />
              </div>
            ) : specialtyDist.length === 0 ? (
              <EmptyState text="Sin datos de especialidades" />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ResponsiveContainer width="44%" height={148}>
                  <PieChart>
                    <Pie data={specialtyDist} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" strokeWidth={0}>
                      {specialtyDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {specialtyDist.map((s) => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, backgroundColor: s.color }} />
                      <span style={{ color: "#6B5D52", fontSize: "0.7rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.name}
                      </span>
                      <span style={{ color: "#0d1b35", fontSize: "0.72rem", fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          style={{ ...S.card }}
        >
          <CardHeading
            icon={() => (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            )}
            title="Tasa de inserción laboral"
            right={
              <span style={{ color: "#10b981", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                % mensual
              </span>
            }
          />
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}>
              <Spinner size={22} />
            </div>
          ) : employmentTrend.length === 0 ? (
            <EmptyState text="Sin contrataciones registradas aún" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={employmentTrend}>
                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EDE5" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "'Plus Jakarta Sans', sans-serif" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "'Plus Jakarta Sans', sans-serif" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #E8E4DC", fontSize: "12px", backgroundColor: "white", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  formatter={(v) => [`${v}%`, "Tasa inserción"]}
                />
                <Area type="monotone" dataKey="tasa" stroke="#10b981" strokeWidth={2.5} fill="url(#emeraldGrad)"
                  dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: "#10b981", r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          style={{ ...S.card }}
        >
          <CardHeading
            icon={() => (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}
            title="Resumen de impacto"
            gold
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {impacto.map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 10,
                  backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  backgroundColor: i === 0 ? "#FFFBF0" : "white",
                  border: i === 0 ? "1.5px solid #D4AF37" : "1px solid #E8E4DC",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: i === 0 ? "#D4AF37" : "#94a3b8", fontSize: "0.65rem", fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif" }}>
                    #{i + 1}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  {loading ? (
                    <Spinner size={16} />
                  ) : (
                    <p style={{ margin: 0, lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: "1.4rem", color: i === 0 ? "#D4AF37" : "#0d1b35" }}>
                      {item.value}
                    </p>
                  )}
                  <p style={{ ...S.label, marginTop: 3 }}>{item.label}</p>
                </div>
                <div style={{ width: 56, height: 4, borderRadius: 2, backgroundColor: "#E8E4DC", overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ height: "100%", borderRadius: 2, backgroundColor: i === 0 ? "#D4AF37" : "#CBD5E1", width: item.value > 0 ? "100%" : "0%", transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
          style={{
            backgroundColor: "#0d1b35",
            backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.1) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
            borderRadius: 16, padding: "18px 20px",
            display: "flex", alignItems: "flex-start", gap: 14,
            border: "1px solid #1a2d50",
          }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, backgroundColor: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ width: 16, height: 16, color: "white" }} />
          </div>
          <div>
            <p style={{ margin: "0 0 5px", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: "0.9rem", color: "white" }}>
              Recomendación institucional
            </p>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", lineHeight: 1.65 }}>
              Continúa ampliando las alianzas con empresas locales de Lo Espejo y comunas aledañas para maximizar la inserción laboral de los egresados.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
