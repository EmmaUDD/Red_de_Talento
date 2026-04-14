import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle, Clock, Award, Star, Users, Building2,
  AlertCircle, Search, X, Wrench, Shield,
  ThumbsUp, ThumbsDown, Eye, MessageSquare,
  ClipboardCheck, Ban, Flag, BookOpen, Link2,
  UserCheck, ChevronDown, ChevronUp,
} from "lucide-react";

type SkillLevel = "Bajo" | "Medio" | "Alto" | null;

// ── DATA ──
const studentsForApproval = [
  { id: 101, name: "Camila Torres Reyes", specialty: "Computación e Informática", grade: "4° Medio TP", email: "c.torres@alumno.lcc.cl", requestDate: "24 Mar 2025", status: "pendiente" as const },
  { id: 102, name: "Rodrigo Pizarro", specialty: "Construcción", grade: "3° Medio TP", email: "r.pizarro@alumno.lcc.cl", requestDate: "25 Mar 2025", status: "pendiente" as const },
  { id: 103, name: "Javiera Cárdenas", specialty: "Mecánica Automotriz", grade: "4° Medio TP", email: "j.cardenas@alumno.lcc.cl", requestDate: "22 Mar 2025", status: "aprobado" as const },
];

const studentsForValidation = [
  {
    id: 1, name: "Felipe Muñoz Rojas", specialty: "Electricidad", grade: "4° Medio TP",
    avatar: "https://images.unsplash.com/photo-1520229534044-62d7cd4e9b0f?w=80&h=80&fit=crop&auto=format",
    status: "pendiente", daysWaiting: 3,
    skills: [
      { name: "Instalaciones Eléctricas", level: null as SkillLevel },
      { name: "Lectura de Planos", level: null as SkillLevel },
      { name: "Tableros Eléctricos", level: null as SkillLevel },
    ],
    soft: [
      { name: "Responsabilidad", level: null as SkillLevel },
      { name: "Trabajo en Equipo", level: null as SkillLevel },
    ],
    requests: [{ field: "Automatización Básica", requestedLevel: "Medio" as const, note: "Completé un curso de Arduino" }],
  },
  {
    id: 2, name: "Valentina Soto Leal", specialty: "Computación e Informática", grade: "EPJA",
    avatar: "https://images.unsplash.com/photo-1650600538903-ec09f670c391?w=80&h=80&fit=crop&auto=format",
    status: "pendiente", daysWaiting: 1,
    skills: [{ name: "Programación Web Básica", level: null as SkillLevel }, { name: "Redes Computacionales", level: null as SkillLevel }],
    soft: [{ name: "Comunicación", level: null as SkillLevel }, { name: "Proactividad", level: null as SkillLevel }],
    requests: [],
  },
  {
    id: 3, name: "Matías Contreras Vega", specialty: "Mecánica Automotriz", grade: "Egresado 2023",
    avatar: "https://images.unsplash.com/photo-1690129070358-355e4d9c2fc7?w=80&h=80&fit=crop&auto=format",
    status: "validado", daysWaiting: 0,
    skills: [{ name: "Diagnóstico Electrónico", level: "Alto" as SkillLevel }, { name: "Mantención Motor", level: "Alto" as SkillLevel }],
    soft: [{ name: "Responsabilidad", level: "Alto" as SkillLevel }],
    requests: [],
  },
];

const companies = [
  { id: 1, name: "Eléctrica Cordillera SpA", industry: "Electricidad Industrial", logo: "https://images.unsplash.com/photo-1601119463467-ad343113e3c5?w=60&h=60&fit=crop&auto=format", status: "activo", posts: 2 },
  { id: 2, name: "TechSur Ltda.", industry: "Tecnología", logo: "https://images.unsplash.com/photo-1657558665549-bd7d82afed8c?w=60&h=60&fit=crop&auto=format", status: "pendiente", posts: 0 },
  { id: 3, name: "Constructora Del Maule", industry: "Construcción", logo: "https://images.unsplash.com/photo-1630599073777-2fc89fd57921?w=60&h=60&fit=crop&auto=format", status: "activo", posts: 1 },
];

const reports = [
  { id: 1, target: "Constructora Rápida SpA", targetType: "empresa", reporter: "Felipe Muñoz", motivo: "Oferta laboral fraudulenta", desc: "La empresa ofreció trabajo pero luego cobró por el proceso de selección.", date: "23 Mar 2025", status: "pendiente" as const },
  { id: 2, target: "Juan Pérez (usuario)", targetType: "usuario", reporter: "Valentina Soto", motivo: "Información falsa en perfil", desc: "Afirma ser egresado del Liceo pero no aparece en nuestros registros.", date: "21 Mar 2025", status: "en_revision" as const },
  { id: 3, target: "AutoRápido Norte Ltda.", targetType: "empresa", reporter: "Matías Contreras", motivo: "Condiciones laborales abusivas", desc: "Horarios de 12 horas sin pago de horas extra.", date: "19 Mar 2025", status: "resuelto" as const },
];

const pendingRequests = [
  { id: 1, student: "Felipe Muñoz", skill: "Automatización Básica", requestedLevel: "Medio", note: "Completé un curso de Arduino y lo apliqué en el taller.", date: "hace 2 días" },
  { id: 2, student: "Valentina Soto", skill: "Desarrollo Web", requestedLevel: "Alto", note: "Terminé el bootcamp de React. Puedo mostrar mi portafolio.", date: "hace 4 días" },
];

// ── Level Button ──
function LevelBtn({ l, sel, onClick }: { l: string; sel: boolean; onClick: () => void }) {
  const styles: Record<string, string> = {
    Bajo: sel ? "bg-red-500 text-white border-red-500" : "border-slate-200 text-slate-600 hover:bg-slate-50",
    Medio: sel ? "bg-amber-500 text-white border-amber-500" : "border-slate-200 text-slate-600 hover:bg-slate-50",
    Alto: sel ? "bg-green-600 text-white border-green-600" : "border-slate-200 text-slate-600 hover:bg-slate-50",
  };
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${styles[l]}`} style={{ fontWeight: 600 }}>
      {l}
    </button>
  );
}

// ── Eval Modal ──
function StudentEvalModal({ student, onClose, onSeal }: {
  student: typeof studentsForValidation[0]; onClose: () => void; onSeal: () => void;
}) {
  const [skills, setSkills] = useState(student.skills);
  const [soft, setSoft] = useState(student.soft);
  const [sealed, setSealed] = useState(false);
  const allFilled = skills.every((s) => s.level) && soft.every((s) => s.level);

  const handleSeal = () => {
    setSealed(true);
    setTimeout(() => { onSeal(); onClose(); }, 1800);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src={student.avatar} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
            <div>
              <h2 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>{student.name}</h2>
              <p className="text-slate-500 text-xs">{student.specialty} · {student.grade}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {student.requests.length > 0 && (
            <div className="border rounded-xl p-3" style={{ backgroundColor: "#FFFBF0", borderColor: "#D4AF37" }}>
              <p className="text-xs" style={{ color: "#B8962E", fontWeight: 600 }}>
                📋 Solicita: {student.requests[0].field} → Nivel {student.requests[0].requestedLevel}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#8A7035" }}>"{student.requests[0].note}"</p>
            </div>
          )}

          {/* Tech */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-slate-400" />
              <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Competencias Técnicas</h3>
            </div>
            <div className="space-y-3">
              {skills.map((skill, i) => (
                <div key={skill.name} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-700 text-sm mb-2" style={{ fontWeight: 500 }}>{skill.name}</p>
                  <div className="flex gap-2">
                    {["Bajo", "Medio", "Alto"].map((l) => (
                      <LevelBtn key={l} l={l} sel={skill.level === l}
                        onClick={() => setSkills((p) => p.map((s, idx) => idx === i ? { ...s, level: l as SkillLevel } : s))} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Soft */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-400" />
              <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Habilidades Blandas</h3>
            </div>
            <div className="space-y-3">
              {soft.map((skill, i) => (
                <div key={skill.name} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-700 text-sm mb-2" style={{ fontWeight: 500 }}>{skill.name}</p>
                  <div className="flex gap-2">
                    {["Bajo", "Medio", "Alto"].map((l) => (
                      <LevelBtn key={l} l={l} sel={skill.level === l}
                        onClick={() => setSoft((p) => p.map((s, idx) => idx === i ? { ...s, level: l as SkillLevel } : s))} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!sealed ? (
            <button onClick={handleSeal} disabled={!allFilled}
              className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm ${
                allFilled
                  ? "text-white hover:opacity-90"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
              style={allFilled ? { backgroundColor: "#D4AF37", fontWeight: 700 } : { fontWeight: 600 }}>
              <Award className="w-4 h-4" />
              {allFilled ? "Aplicar Sello Institucional" : `${skills.filter((s) => !s.level).length + soft.filter((s) => !s.level).length} sin evaluar`}
            </button>
          ) : (
            <div className="w-full py-3.5 rounded-xl bg-green-500 text-white flex items-center justify-center gap-2 text-sm" style={{ fontWeight: 700 }}>
              <CheckCircle className="w-4 h-4" /> ¡Sello aplicado!
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ──
export function TeacherValidacion() {
  const [tab, setTab] = useState<"aprobacion" | "validacion" | "empresas" | "denuncias" | "cursos" | "solicitudes">("aprobacion");
  const [search, setSearch] = useState("");
  const [evalStudent, setEvalStudent] = useState<typeof studentsForValidation[0] | null>(null);
  const [studentList, setStudentList] = useState(studentsForValidation);
  const [companyList, setCompanyList] = useState(companies);
  const [reportList, setReportList] = useState(reports);
  const [approvalList, setApprovalList] = useState(studentsForApproval);
  const [expandedReport, setExpandedReport] = useState<number | null>(null);

  // Courses form
  const [courseForm, setCourseForm] = useState({ title: "", link: "", specialty: "", desc: "" });
  const [coursePublished, setCoursePublished] = useState(false);

  const stats = {
    pendingApproval: approvalList.filter((s) => s.status === "pendiente").length,
    pendingValidation: studentList.filter((s) => s.status === "pendiente").length,
    pendingCompanies: companyList.filter((c) => c.status === "pendiente").length,
    pendingReports: reportList.filter((r) => r.status === "pendiente").length,
    pendingRequests: pendingRequests.length,
  };

  const tabList = [
    { id: "aprobacion", label: "Aprobación", icon: UserCheck, badge: stats.pendingApproval },
    { id: "validacion", label: "Validación", icon: Star, badge: stats.pendingValidation },
    { id: "empresas", label: "Empresas", icon: Building2, badge: stats.pendingCompanies },
    { id: "denuncias", label: "Denuncias", icon: Flag, badge: stats.pendingReports },
    { id: "cursos", label: "Cursos", icon: BookOpen, badge: 0 },
    { id: "solicitudes", label: "Solicitudes", icon: ClipboardCheck, badge: stats.pendingRequests },
  ] as const;

  const reportStatusBadge = (status: string) => {
    if (status === "pendiente") return "bg-red-50 text-red-600 border-red-200";
    if (status === "en_revision") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-green-50 text-green-700 border-green-200";
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Panel de Administración</h1>
          <p className="text-slate-500 text-sm mt-0.5">Prof. Ana García Vidal · Liceo Cardenal Caro</p>

          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
            {[
              { label: "Por aprobar", value: stats.pendingApproval, accent: true },
              { label: "Por validar", value: stats.pendingValidation, accent: true },
              { label: "Solicitudes", value: stats.pendingRequests, accent: true },
              { label: "Denuncias", value: stats.pendingReports, accent: stats.pendingReports > 0 },
              { label: "Emp. revisión", value: stats.pendingCompanies, accent: false },
              { label: "Total alumnos", value: studentList.length, accent: false },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-3 text-center ${s.accent && s.value > 0 ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
                <p className={`text-xl ${s.accent && s.value > 0 ? "text-red-600" : "text-slate-900"}`} style={{ fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
                <p className={`text-xs mt-0.5 ${s.accent && s.value > 0 ? "text-red-500" : "text-slate-500"}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5">
        {/* Tabs - horizontal scroll */}
        <div className="flex bg-white rounded-xl border border-slate-200 p-1 mb-5 overflow-x-auto">
          {tabList.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${active ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                style={{ fontWeight: active ? 600 : 500 }}>
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {t.badge > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white text-slate-900" : "bg-red-500 text-white"}`} style={{ fontWeight: 700 }}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        {["aprobacion", "validacion", "empresas", "solicitudes"].includes(tab) && (
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
        )}

        {/* ── APROBACIÓN DE ESTUDIANTES ── */}
        {tab === "aprobacion" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700 text-xs leading-relaxed">
                Los estudiantes que se registran en la plataforma requieren aprobación manual antes de activar su cuenta. Verifica que pertenezcan al Liceo Cardenal Caro.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs text-slate-500" style={{ fontWeight: 600 }}>Alumno</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500 hidden md:table-cell" style={{ fontWeight: 600 }}>Especialidad</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500 hidden md:table-cell" style={{ fontWeight: 600 }}>Solicitud</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500" style={{ fontWeight: 600 }}>Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {approvalList.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase())).map((s, i) => (
                    <tr key={s.id} className={`border-b border-slate-50 last:border-0 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                      <td className="px-4 py-3">
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{s.name}</p>
                        <p className="text-slate-500 text-xs">{s.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-slate-600 text-xs">{s.specialty}</p>
                        <p className="text-slate-400 text-xs">{s.grade}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{s.requestDate}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          s.status === "aprobado"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`} style={{ fontWeight: 600 }}>
                          {s.status === "aprobado" ? "✓ Aprobado" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.status === "pendiente" ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setApprovalList((p) => p.map((a) => a.id === s.id ? { ...a, status: "aprobado" as const } : a))}
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="Aprobar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Rechazar">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Eye className="w-4 h-4 text-slate-300" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── VALIDACIÓN ── */}
        {tab === "validacion" && (
          <div className="space-y-3">
            {studentList.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.specialty.toLowerCase().includes(search.toLowerCase())).map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img src={s.avatar} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                    {s.status === "validado" && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white" style={{ backgroundColor: "#D4AF37" }}>
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{s.name}</p>
                        <p className="text-slate-500 text-xs">{s.specialty} · {s.grade}</p>
                        {s.status === "pendiente" && s.daysWaiting > 0 && (
                          <p className="text-amber-600 text-xs mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Esperando {s.daysWaiting} día{s.daysWaiting > 1 ? "s" : ""}
                          </p>
                        )}
                        {s.requests.length > 0 && (
                          <p className="text-blue-600 text-xs mt-0.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {s.requests.length} solicitud pendiente
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 border ${
                        s.status === "validado"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`} style={{ fontWeight: 600 }}>
                        {s.status === "validado" ? <><CheckCircle className="w-3 h-3" /> Validado</> : <><Clock className="w-3 h-3" /> Pendiente</>}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setEvalStudent(s)}
                        className={`flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors ${
                          s.status === "pendiente"
                            ? "bg-slate-900 text-white hover:bg-slate-700"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                        style={{ fontWeight: 600 }}>
                        <Star className="w-3.5 h-3.5" />
                        {s.status === "pendiente" ? "Evaluar y Sellar" : "Ver evaluación"}
                      </button>
                      <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── EMPRESAS ── */}
        {tab === "empresas" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
              <Shield className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-600 text-xs leading-relaxed">
                Las empresas se registran directamente. Como docente puedes suspender aquellas que incumplan las normas de la plataforma o hayan recibido denuncias.
              </p>
            </div>
            {companyList.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img src={c.logo} className="w-12 h-12 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{c.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${c.status === "activo" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`} style={{ fontWeight: 600 }}>
                        {c.status === "activo" ? "✓ Activa" : "Pendiente"}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">{c.industry} · {c.posts} publicaciones</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5" style={{ fontWeight: 500 }}>
                    <Eye className="w-3.5 h-3.5" /> Ver publicaciones
                  </button>
                  {c.status === "activo" && (
                    <button className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── DENUNCIAS ── */}
        {tab === "denuncias" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 border rounded-xl p-3 mb-4" style={{ backgroundColor: "#FFF5F5", borderColor: "#FCA5A5" }}>
              <Flag className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-xs leading-relaxed">
                Centro de seguridad. Gestiona los reportes de la comunidad. Puedes cambiar el estado de cada denuncia y tomar acciones sobre los usuarios o empresas reportados.
              </p>
            </div>
            {reportList.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Flag className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{r.target}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${reportStatusBadge(r.status)}`} style={{ fontWeight: 600 }}>
                          {r.status === "pendiente" ? "Pendiente" : r.status === "en_revision" ? "En revisión" : "Resuelto"}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Reportado por <span style={{ fontWeight: 600 }}>{r.reporter}</span> · {r.date}
                      </p>
                      <p className="text-slate-600 text-xs mt-1">
                        <span style={{ fontWeight: 600 }}>Motivo:</span> {r.motivo}
                      </p>
                    </div>
                    <button onClick={() => setExpandedReport(expandedReport === r.id ? null : r.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0">
                      {expandedReport === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {expandedReport === r.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <div className="bg-slate-50 rounded-lg p-3 mb-3 mt-2">
                          <p className="text-slate-600 text-xs italic">"{r.desc}"</p>
                        </div>
                        {r.status !== "resuelto" && (
                          <div className="flex gap-2">
                            {r.status === "pendiente" && (
                              <button onClick={() => setReportList((p) => p.map((x) => x.id === r.id ? { ...x, status: "en_revision" as const } : x))}
                                className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-xs hover:bg-amber-600 transition-colors" style={{ fontWeight: 600 }}>
                                Marcar en revisión
                              </button>
                            )}
                            <button onClick={() => setReportList((p) => p.map((x) => x.id === r.id ? { ...x, status: "resuelto" as const } : x))}
                              className="flex-1 py-2 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 transition-colors" style={{ fontWeight: 600 }}>
                              Marcar como resuelto
                            </button>
                            <button className="py-2 px-3 rounded-lg border border-red-200 text-red-500 text-xs hover:bg-red-50 transition-colors" style={{ fontWeight: 600 }}>
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── CURSOS ── */}
        {tab === "cursos" && (
          <div className="max-w-lg">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen className="w-5 h-5 text-slate-600" />
                <h3 className="text-slate-900" style={{ fontSize: "0.95rem", fontWeight: 700 }}>Publicar curso o recurso</h3>
              </div>
              {coursePublished ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>¡Curso publicado con éxito!</p>
                  <p className="text-slate-500 text-xs mt-1">Los alumnos lo verán en su sección de Crecimiento.</p>
                  <button onClick={() => { setCoursePublished(false); setCourseForm({ title: "", link: "", specialty: "", desc: "" }); }}
                    className="mt-4 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-colors" style={{ fontWeight: 500 }}>
                    Publicar otro
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (courseForm.title && courseForm.link && courseForm.specialty) setCoursePublished(true); }}>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Título del curso <span className="text-red-500">*</span></label>
                    <input value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="ej. Electricidad Residencial para Técnicos"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Enlace del recurso <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={courseForm.link} onChange={(e) => setCourseForm((p) => ({ ...p, link: e.target.value }))}
                        placeholder="https://youtube.com/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Especialidad <span className="text-red-500">*</span></label>
                    <select value={courseForm.specialty} onChange={(e) => setCourseForm((p) => ({ ...p, specialty: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                      <option value="">Selecciona una especialidad...</option>
                      <option>Electricidad</option>
                      <option>Computación e Informática</option>
                      <option>Construcción</option>
                      <option>Mecánica Automotriz</option>
                      <option>Todas las especialidades</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Descripción corta</label>
                    <textarea value={courseForm.desc} onChange={(e) => setCourseForm((p) => ({ ...p, desc: e.target.value }))}
                      rows={3} placeholder="Describe brevemente el contenido del curso y a quién va dirigido..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200" />
                  </div>
                  <button type="submit"
                    disabled={!courseForm.title || !courseForm.link || !courseForm.specialty}
                    className={`w-full py-3 rounded-xl text-sm transition-colors ${courseForm.title && courseForm.link && courseForm.specialty ? "bg-slate-900 hover:bg-slate-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                    style={{ fontWeight: 600 }}>
                    Publicar curso
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── SOLICITUDES ── */}
        {tab === "solicitudes" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-600 text-xs">
                Los alumnos pueden solicitar actualizar sus niveles de competencia. Revisa y aprueba o rechaza cada solicitud.
              </p>
            </div>
            {pendingRequests.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{r.student}</p>
                    <p className="text-slate-500 text-xs">
                      Solicita: <span className="text-slate-900" style={{ fontWeight: 600 }}>{r.skill}</span> → Nivel <span className="text-green-700" style={{ fontWeight: 600 }}>{r.requestedLevel}</span>
                    </p>
                  </div>
                  <span className="text-slate-400 text-xs flex-shrink-0">{r.date}</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="text-slate-600 text-xs italic">"{r.note}"</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs flex items-center justify-center gap-1.5 transition-colors" style={{ fontWeight: 600 }}>
                    <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                  </button>
                  <button className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors" style={{ fontWeight: 600 }}>
                    <X className="w-3.5 h-3.5" /> Rechazar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Eval Modal */}
      <AnimatePresence>
        {evalStudent && (
          <StudentEvalModal
            student={evalStudent}
            onClose={() => setEvalStudent(null)}
            onSeal={() => setStudentList((p) => p.map((s) => s.id === evalStudent.id ? { ...s, status: "validado" } : s))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
