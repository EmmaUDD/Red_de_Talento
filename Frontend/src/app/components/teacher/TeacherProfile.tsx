import { useState } from "react";
import { motion } from "motion/react";
import {
  BookOpen, Users, Award, CheckCircle, MessageSquare,
  Heart, Share2, CalendarDays, Clock, Star, Zap,
  ExternalLink, Briefcase, BarChart2, GraduationCap,
  MapPin, Mail, Phone, ChevronRight, Play, Eye,
  PenSquare, ShieldCheck,
} from "lucide-react";
import { useUser } from "../../context/UserContext";

// ── Data ──
const subjectsTaught = [
  { name: "Instalaciones Eléctricas", grade: "4° Medio TP", hours: "6 hrs/sem", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { name: "Tableros y Circuitos", grade: "4° Medio TP", hours: "4 hrs/sem", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { name: "Seguridad Eléctrica", grade: "3° Medio TP", hours: "3 hrs/sem", color: "bg-green-50 text-green-700 border-green-200" },
  { name: "Lectura de Planos", grade: "3° y 4° Medio TP", hours: "2 hrs/sem", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { name: "Taller de Práctica", grade: "4° Medio TP", hours: "8 hrs/sem", color: "bg-rose-50 text-rose-700 border-rose-200" },
];

const publishedCourses = [
  {
    id: 1, title: "Electricidad Residencial Avanzada", platform: "YouTube",
    specialty: "Electricidad", duration: "8h 30min",
    link: "#", enrolled: 47, date: "Ene 2025",
    thumb: "https://images.unsplash.com/photo-1520229534044-62d7cd4e9b0f?w=400&h=220&fit=crop&auto=format",
  },
  {
    id: 2, title: "Seguridad en Instalaciones de BT", platform: "YouTube",
    specialty: "Electricidad", duration: "5h 20min",
    link: "#", enrolled: 31, date: "Feb 2025",
    thumb: "https://images.unsplash.com/photo-1657558665549-bd7d82afed8c?w=400&h=220&fit=crop&auto=format",
  },
  {
    id: 3, title: "Lectura de Planos Eléctricos", platform: "Material Liceo",
    specialty: "Electricidad", duration: "4h 15min",
    link: "#", enrolled: 62, date: "Mar 2025",
    thumb: "https://images.unsplash.com/photo-1630599073777-2fc89fd57921?w=400&h=220&fit=crop&auto=format",
  },
];

const teacherPosts = [
  {
    id: 4, type: "event" as const,
    content: "📅 Feria de Empleabilidad Técnica en el Liceo. Empresas de Lo Espejo y Santiago estarán presentes buscando talento técnico. ¡Es la oportunidad que esperaban, alumnos!",
    time: "hace 1 día", likes: 67, comments: 23,
    event: { date: "15 Abril 2025", time: "10:00 - 16:00 hrs", location: "Patio central, Liceo Cardenal Caro" },
  },
  {
    id: 2, type: "achievement" as const,
    content: "🏅 ¡Felicitamos a Felipe Muñoz por obtener su Sello de Validación Institucional en Electricidad! Su perfil ya está disponible para empresas aliadas.",
    time: "hace 5 horas", likes: 34, comments: 8,
    achievement: { student: "Felipe Muñoz Rojas", specialty: "Técnico en Electricidad" },
  },
];

const stats = [
  { label: "Alumnos validados", value: "142", icon: ShieldCheck, gold: true },
  { label: "Cursos publicados", value: "3", icon: BookOpen, gold: false },
  { label: "Años de experiencia", value: "12", icon: Star, gold: false },
  { label: "Tasa inserción", value: "92%", icon: BarChart2, gold: false },
];

export function TeacherProfile() {
  const { user } = useUser();
  const isOwn = user?.role === "teacher";
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [likeCounts, setLikeCounts] = useState({ 4: 67, 2: 34 });
  const [tab, setTab] = useState<"perfil" | "cursos" | "publicaciones">("perfil");

  const toggleLike = (id: number, base: number) => {
    const liked = likedPosts.includes(id);
    setLikedPosts((p) => liked ? p.filter((x) => x !== id) : [...p, id]);
    setLikeCounts((p) => ({ ...p, [id]: liked ? p[id as keyof typeof p] - 1 : p[id as keyof typeof p] + 1 }));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ── Cover + Header ── */}
      <div className="bg-white border-b border-slate-200">
        {/* Cover banner */}
        <div className="relative h-36 md:h-44 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1758685734511-4f49ce9a382b?w=1200&h=300&fit=crop&auto=format"
            className="w-full h-full object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900/60" />
          {/* Institution badge */}
          <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            <span className="text-slate-900 text-xs" style={{ fontWeight: 600 }}>
              Docente Verificado · Liceo Cardenal Caro
            </span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-0">
          {/* Avatar row */}
          <div className="flex items-end gap-4 -mt-10 mb-4 relative z-10">
            <div className="relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1650600538903-ec09f670c391?w=200&h=200&fit=crop&auto=format"
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
                alt="Ana García"
              />
              <div
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white shadow"
                style={{ backgroundColor: "#D4AF37" }}
              >
                <Award className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.2 }}>
                    Prof. Ana García Vidal
                  </h1>
                  <p className="text-slate-600 text-sm mt-0.5" style={{ fontWeight: 500 }}>
                    Jefa de Especialidad · Dpto. Electricidad
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Liceo Cardenal Caro · Lo Espejo
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isOwn && (
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm transition-colors" style={{ fontWeight: 600 }}>
                      <MessageSquare className="w-4 h-4" />
                      Contactar
                    </button>
                  )}
                  {isOwn && (
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm transition-colors" style={{ fontWeight: 600 }}>
                      <PenSquare className="w-4 h-4" />
                      Editar perfil
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="text-center py-2">
                  <p className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.25rem", lineHeight: 1, color: s.gold ? "#D4AF37" : undefined }}>
                    {s.value}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-tight">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 -mx-4 px-4">
            {(["perfil", "cursos", "publicaciones"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm capitalize border-b-2 -mb-px transition-all ${tab === t ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                style={{ fontWeight: tab === t ? 700 : 500 }}
              >
                {t === "perfil" ? "Perfil" : t === "cursos" ? `Cursos (${publishedCourses.length})` : `Posts (${teacherPosts.length})`}
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
            {/* Bio */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 mb-3" style={{ fontSize: "0.875rem", fontWeight: 700 }}>Sobre mí</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Docente con 12 años de experiencia en formación técnico-profesional en el área de Electricidad.
                Especialista en instalaciones de baja tensión, automatización industrial y seguridad eléctrica.
                Comprometida con la empleabilidad real de los estudiantes: cada competencia que certifica
                refleja un estándar laboral medible.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {["Electricidad BT", "Seguridad Industrial", "Automatización", "Evaluación por Competencias", "Empleabilidad TP"].map((t) => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 mb-3" style={{ fontSize: "0.875rem", fontWeight: 700 }}>Contacto institucional</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span>a.garcia@liceocaro.cl</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span>Liceo Cardenal Caro, Lo Espejo, RM</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span>Disponible: Lun–Vie · 08:00–18:00 hrs</span>
                </div>
              </div>
              {!isOwn && (
                <button className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm flex items-center justify-center gap-2 transition-colors" style={{ fontWeight: 600 }}>
                  <MessageSquare className="w-4 h-4" />
                  Enviar mensaje
                </button>
              )}
            </div>

            {/* Courses taught at school */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 700 }}>Cursos que dicta en el Liceo</h3>
              </div>
              <div className="space-y-2.5">
                {subjectsTaught.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{s.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${s.color}`} style={{ fontWeight: 600 }}>
                          {s.hours}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">{s.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent validations */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 700 }}>Últimas validaciones</h3>
                </div>
                <span className="text-xs text-slate-500">Este mes</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: "Felipe Muñoz Rojas", specialty: "Electricidad", date: "15 Mar 2025", score: 92 },
                  { name: "Valentina Soto Leal", specialty: "Computación", date: "12 Mar 2025", score: 88 },
                  { name: "Matías Contreras", specialty: "Mecánica Automotriz", date: "8 Mar 2025", score: 85 },
                ].map((v, i) => (
                  <div key={v.name} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: i === 0 ? "#D4AF37" : "#f1f5f9" }}
                    >
                      <Award className="w-3.5 h-3.5" style={{ color: i === 0 ? "white" : "#94a3b8" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 text-xs" style={{ fontWeight: 600 }}>{v.name}</p>
                      <p className="text-slate-400 text-xs">{v.specialty} · {v.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-slate-900 text-xs" style={{ fontWeight: 700 }}>{v.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CURSOS TAB ── */}
        {tab === "cursos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-600 text-xs leading-relaxed">
                Recursos educativos publicados en la plataforma por Prof. García Vidal. Disponibles para todos los alumnos del Liceo.
              </p>
            </div>

            {publishedCourses.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-36 overflow-hidden">
                  <img src={c.thumb} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <div className="flex items-center gap-2">
                      <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow">
                        <Play className="w-5 h-5 text-slate-900 ml-0.5" />
                      </button>
                      <div>
                        <p className="text-white text-sm" style={{ fontWeight: 600 }}>{c.title}</p>
                        <p className="text-white/70 text-xs">{c.duration}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-lg ${c.platform === "YouTube" ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`} style={{ fontWeight: 600 }}>
                    {c.platform}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{c.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.enrolled} inscritos</span>
                        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {c.date}</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {c.specialty}</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors whitespace-nowrap" style={{ fontWeight: 600 }}>
                      Ver <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── PUBLICACIONES TAB ── */}
        {tab === "publicaciones" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {teacherPosts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Author */}
                <div className="flex items-center gap-3 p-4 pb-3">
                  <img
                    src="https://images.unsplash.com/photo-1650600538903-ec09f670c391?w=80&h=80&fit=crop&auto=format"
                    className="w-9 h-9 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Prof. Ana García Vidal</p>
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <p className="text-slate-400 text-xs">{p.time}</p>
                  </div>
                </div>

                <div className="px-4 pb-3">
                  <p className="text-slate-700 text-sm leading-relaxed">{p.content}</p>
                </div>

                {/* Event card */}
                {p.type === "event" && p.event && (
                  <div className="mx-4 mb-3 border border-amber-200 rounded-xl p-4 bg-amber-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="w-4 h-4" style={{ color: "#D4AF37" }} />
                      <span className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Evento</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-600 text-xs flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        {p.event.date} · {p.event.time}
                      </p>
                      <p className="text-slate-600 text-xs flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {p.event.location}
                      </p>
                    </div>
                  </div>
                )}

                {/* Achievement card */}
                {p.type === "achievement" && p.achievement && (
                  <div
                    className="mx-4 mb-3 border rounded-xl p-4 flex items-center gap-4"
                    style={{ borderColor: "#D4AF37", backgroundColor: "#FFFBF0" }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#D4AF37" }}>
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{p.achievement.student}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#B8962E", fontWeight: 500 }}>
                        ✓ Validado · {p.achievement.specialty}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reactions */}
                <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(p.id, p.likes)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${likedPosts.includes(p.id) ? "text-red-500" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <Heart className="w-4 h-4" fill={likedPosts.includes(p.id) ? "currentColor" : "none"} />
                    <span className="text-xs">{likeCounts[p.id as keyof typeof likeCounts]}</span>
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
  );
}
