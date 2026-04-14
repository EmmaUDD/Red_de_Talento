import { useState } from "react";
import { motion } from "motion/react";
import {
  Building2, MapPin, Phone, Mail, Globe, Users, Briefcase,
  Star, CheckCircle, MessageSquare, Heart, Share2, Flag,
  CalendarDays, Clock, Zap, ChevronRight, ExternalLink,
  Award, TrendingUp, Shield, Eye, BarChart2, PenSquare,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { ReportModal } from "../shared/ReportModal";

// ── Data ──
const companyPosts = [
  {
    id: 1, type: "job" as const,
    content: "🔌 ¡Buscamos técnico electricista! Ofrecemos contrato part-time con posibilidad de jornada completa. Excelente ambiente de trabajo y oportunidad de crecimiento.",
    time: "hace 2 horas", likes: 12, comments: 4,
    job: { title: "Técnico Electricista Junior", type: "Part-time", salary: "$450.000/mes", location: "Lo Espejo" },
  },
  {
    id: 5, type: "post" as const,
    content: "¡Felicitamos a nuestro nuevo equipo! Este mes sumamos dos egresados del Liceo Cardenal Caro. El talento técnico local es insuperable. 💪 Seguimos creciendo juntos.",
    time: "hace 5 días", likes: 41, comments: 9,
    image: "https://images.unsplash.com/photo-1565010640914-8d817b58d808?w=700&h=400&fit=crop&auto=format",
  },
];

const pastEvents = [
  {
    id: 1, title: "Charla: La Electricidad Industrial hoy",
    date: "12 Mar 2025", location: "Liceo Cardenal Caro",
    attendees: 48, image: "https://images.unsplash.com/photo-1520229534044-62d7cd4e9b0f?w=200&h=120&fit=crop&auto=format",
  },
  {
    id: 2, title: "Visita a Planta Industrial Los Espejo",
    date: "20 Feb 2025", location: "Planta Cordillera, Lo Espejo",
    attendees: 22, image: "https://images.unsplash.com/photo-1601119463467-ad343113e3c5?w=200&h=120&fit=crop&auto=format",
  },
];

const talentCriteria = [
  { label: "Especialidad requerida", value: "Electricidad · Mecánica Industrial", icon: Zap },
  { label: "Disponibilidad", value: "Part-time o Full-time", icon: Clock },
  { label: "Nivel de competencia", value: "Certificado por el Liceo (nivel Medio o Alto)", icon: Award },
  { label: "Habilidades blandas", value: "Responsabilidad, Puntualidad, Trabajo en equipo", icon: Users },
  { label: "Experiencia mínima", value: "Práctica de taller válida", icon: Briefcase },
  { label: "Preferencia geográfica", value: "Lo Espejo y comunas aledañas", icon: MapPin },
];

const activeJobs = [
  { id: 1, title: "Técnico Electricista Junior", type: "Part-time", salary: "$450.000/mes", posted: "hace 2 horas", applicants: 4 },
  { id: 2, title: "Instalador Redes BT", type: "Full-time", salary: "$580.000/mes", posted: "hace 3 días", applicants: 7 },
];

export function CompanyProfile() {
  const { user } = useUser();
  const isOwn = user?.role === "company";
  const [tab, setTab] = useState<"perfil" | "empleos" | "publicaciones">("perfil");
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({ 1: 12, 5: 41 });
  const [showReport, setShowReport] = useState(false);

  const toggleLike = (id: number) => {
    const liked = likedPosts.includes(id);
    setLikedPosts((p) => liked ? p.filter((x) => x !== id) : [...p, id]);
    setLikeCounts((p) => ({ ...p, [id]: liked ? p[id] - 1 : p[id] + 1 }));
  };

  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB]">
        {/* ── Cover + Header ── */}
        <div className="bg-white border-b border-slate-200">
          {/* Cover */}
          <div className="relative h-36 md:h-44 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1565010640914-8d817b58d808?w=1200&h=300&fit=crop&auto=format"
              className="w-full h-full object-cover"
              alt="cover empresa"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/55" />

            {/* Verification badge */}
            <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-slate-900 text-xs" style={{ fontWeight: 600 }}>Empresa Verificada</span>
            </div>

            {/* Report button (only for non-company users) */}
            {!isOwn && (
              <button
                onClick={() => setShowReport(true)}
                className="absolute top-3 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-red-500 hover:bg-red-50 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="text-xs" style={{ fontWeight: 600 }}>Reportar</span>
              </button>
            )}
          </div>

          <div className="max-w-3xl mx-auto px-4 pb-0">
            {/* Logo + info */}
            <div className="flex items-end gap-4 -mt-10 mb-4 relative z-10">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1601119463467-ad343113e3c5?w=120&h=120&fit=crop&auto=format"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white shadow bg-blue-500">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div className="flex-1 pb-1">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.2 }}>
                      Eléctrica Cordillera SpA
                    </h1>
                    <p className="text-slate-600 text-sm mt-0.5" style={{ fontWeight: 500 }}>
                      Electricidad Industrial y Residencial
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Lo Espejo, Región Metropolitana
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!isOwn ? (
                      <>
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm transition-colors" style={{ fontWeight: 600 }}>
                          <MessageSquare className="w-4 h-4" />
                          Contactar
                        </button>
                      </>
                    ) : (
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm transition-colors" style={{ fontWeight: 600 }}>
                        <PenSquare className="w-4 h-4" />
                        Editar perfil
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: "Empleados", value: "34" },
                { label: "Contratados Liceo", value: "8", gold: true },
                { label: "Eventos", value: "2" },
                { label: "Ofertas activas", value: "2" },
              ].map((k) => (
                <div key={k.label} className="text-center py-2">
                  <p
                    className="text-slate-900"
                    style={{ fontWeight: 800, fontSize: "1.25rem", lineHeight: 1, color: k.gold ? "#D4AF37" : undefined }}
                  >
                    {k.value}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-tight">{k.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 -mx-4 px-4">
              {(["perfil", "empleos", "publicaciones"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm border-b-2 -mb-px transition-all ${tab === t ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                  style={{ fontWeight: tab === t ? 700 : 500 }}
                >
                  {t === "perfil" ? "Perfil" : t === "empleos" ? `Empleos (${activeJobs.length})` : `Posts (${companyPosts.length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-3xl mx-auto px-4 py-5">

          {/* ── PERFIL TAB ── */}
          {tab === "perfil" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* About */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-slate-900 mb-3" style={{ fontSize: "0.875rem", fontWeight: 700 }}>Sobre la empresa</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Eléctrica Cordillera SpA es una empresa con más de 15 años de experiencia en instalaciones eléctricas
                  residenciales e industriales en la Región Metropolitana. Nos especializamos en proyectos de baja tensión,
                  instalación de tableros, automatización básica y mantención preventiva.
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mt-2">
                  Creemos profundamente en el talento técnico de Lo Espejo. Somos empresa aliada del Liceo Cardenal Caro
                  desde 2019, y hemos incorporado a <strong>8 egresados</strong> como parte permanente de nuestro equipo.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["Electricidad BT", "Instalaciones Residenciales", "Tableros Industriales", "Automatización", "Mantención Preventiva"].map((t) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">{t}</span>
                  ))}
                </div>
              </div>

              {/* Contact info */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-slate-900 mb-4" style={{ fontSize: "0.875rem", fontWeight: 700 }}>Información de contacto</h3>
                <div className="space-y-3">
                  {[
                    { icon: Globe, label: "www.electrica-cordillera.cl" },
                    { icon: Mail, label: "contacto@electrica-cordillera.cl" },
                    { icon: Phone, label: "+56 2 2555 4321" },
                    { icon: MapPin, label: "Av. Lo Espejo 1420, Lo Espejo, RM" },
                    { icon: Clock, label: "Lun–Vie · 08:30–18:00 hrs" },
                  ].map((c) => {
                    const Icon = c.icon;
                    return (
                      <div key={c.label} className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span>{c.label}</span>
                      </div>
                    );
                  })}
                </div>
                {!isOwn && (
                  <button className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm flex items-center justify-center gap-2 transition-colors" style={{ fontWeight: 600 }}>
                    <MessageSquare className="w-4 h-4" />
                    Enviar mensaje
                  </button>
                )}
              </div>

              {/* Talent criteria */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFFBF0" }}>
                    <Star className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  </div>
                  <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 700 }}>¿Qué buscamos en un candidato?</h3>
                </div>
                <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                  Estas son las características que priorizamos al evaluar perfiles de la plataforma.
                </p>
                <div className="space-y-3">
                  {talentCriteria.map((c) => {
                    const Icon = c.icon;
                    return (
                      <div key={c.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs" style={{ fontWeight: 600 }}>{c.label}</p>
                          <p className="text-slate-900 text-xs mt-0.5">{c.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Past events */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 700 }}>Últimos eventos realizados</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {pastEvents.map((e) => (
                    <div key={e.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={e.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 600, lineHeight: 1.35 }}>{e.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> {e.date}
                        </p>
                        <p className="text-slate-400 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {e.location}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-900 text-xs" style={{ fontWeight: 700 }}>{e.attendees}</p>
                        <p className="text-slate-400 text-xs">asistentes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alliance seal */}
              <div
                className="rounded-xl p-5 flex items-center gap-4"
                style={{ backgroundColor: "#FFFBF0", border: "2px solid #D4AF37" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#D4AF37" }}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.9rem" }}>Empresa Aliada del Liceo Cardenal Caro</p>
                  <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                    Comprometida con la inserción laboral técnica de Lo Espejo desde 2019.
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#B8962E", fontWeight: 600 }}>8 egresados contratados · 2 ofertas activas</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── EMPLEOS TAB ── */}
          {tab === "empleos" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <p className="text-slate-500 text-sm">
                <span className="text-slate-900" style={{ fontWeight: 600 }}>{activeJobs.length}</span> ofertas activas
              </p>
              {activeJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{job.title}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200" style={{ fontWeight: 600 }}>
                            {job.type}
                          </span>
                          <span className="text-xs text-slate-500">💰 {job.salary}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-slate-900 text-xs" style={{ fontWeight: 700 }}>{job.applicants}</p>
                      <p className="text-slate-400 text-xs">postulantes</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Publicado {job.posted}
                    </p>
                    {!isOwn && (
                      <button className="flex items-center gap-1.5 text-sm bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors" style={{ fontWeight: 600 }}>
                        Postular <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isOwn && (
                      <button className="flex items-center gap-1.5 text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors" style={{ fontWeight: 600 }}>
                        <Eye className="w-3.5 h-3.5" /> Ver postulantes
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── PUBLICACIONES TAB ── */}
          {tab === "publicaciones" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {companyPosts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                  {/* Author */}
                  <div className="flex items-center gap-3 p-4 pb-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1601119463467-ad343113e3c5?w=80&h=80&fit=crop&auto=format" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Eléctrica Cordillera SpA</p>
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <p className="text-slate-400 text-xs">{p.time}</p>
                    </div>
                  </div>

                  <div className="px-4 pb-3">
                    <p className="text-slate-700 text-sm leading-relaxed">{p.content}</p>
                  </div>

                  {/* Image */}
                  {p.image && (
                    <div className="mx-4 mb-3 rounded-lg overflow-hidden border border-slate-100">
                      <img src={p.image} className="w-full h-44 object-cover" />
                    </div>
                  )}

                  {/* Job card */}
                  {p.type === "job" && p.job && (
                    <div className="mx-4 mb-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <p className="text-slate-900 text-sm mb-2" style={{ fontWeight: 600 }}>{p.job.title}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>
                          <Briefcase className="w-3 h-3" /> {p.job.type}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>
                          💰 {p.job.salary}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full">
                          <MapPin className="w-3 h-3" /> {p.job.location}
                        </span>
                      </div>
                      {!isOwn && (
                        <button className="w-full mt-3 bg-slate-900 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                          Ver oferta <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(p.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${likedPosts.includes(p.id) ? "text-red-500" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      <Heart className="w-4 h-4" fill={likedPosts.includes(p.id) ? "currentColor" : "none"} />
                      <span className="text-xs">{likeCounts[p.id]}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">{p.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <ReportModal
          targetName="Eléctrica Cordillera SpA"
          targetType="empresa"
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
