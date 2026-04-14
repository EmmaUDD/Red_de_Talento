import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle, Clock, Award, Star, Users, Building2,
  AlertCircle, Search, X, Wrench, Shield,
  Flag, BookOpen, Link2, UserCheck, ChevronDown, ChevronUp, Ban,
  Eye, MessageSquare, ClipboardCheck,
} from "lucide-react";
import { apiRequest } from "../../../api/client";
 
type SkillLevel = "Bajo" | "Medio" | "Alto" | null;
 
interface Estudiante {
  id: number;
  usuario: { id: number; username: string; first_name: string; last_name: string; email: string; is_active: boolean };
  especialidad: string;
  grado: string;
}
 
interface Habilidad {
  id: number;
  nombre: string;
  nivel: string;
  estado: string;
  estudiante: number;
}
 
interface Reporte {
  id: number;
  reportado_por: number;
  usuario_reportado: number;
  motivo: string;
  descripcion: string;
  fecha: string;
  estado: string;
}
 
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
 
export function TeacherValidacion() {
  const [tab, setTab] = useState<"aprobacion" | "validacion" | "denuncias" | "habilidades" | "cursos">("aprobacion");
  const [search, setSearch] = useState("");
 
  // Data del backend
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState<number | null>(null);
 
  // Cursos form (sin endpoint en backend, solo UI)
  const [courseForm, setCourseForm] = useState({ title: "", link: "", specialty: "", desc: "" });
  const [coursePublished, setCoursePublished] = useState(false);
 
  const loadData = async () => {
    setLoading(true);
    try {
      const [estRes, habRes, repRes] = await Promise.all([
        apiRequest("/api/estudiantes/"),
        apiRequest("/api/habilidades/").catch(() => null),
        apiRequest("/api/reporte/"),
      ]);
      if (estRes.ok) setEstudiantes(await estRes.json());
      if (habRes?.ok) setHabilidades(await habRes.json());
      if (repRes.ok) setReportes(await repRes.json());
    } catch {}
    setLoading(false);
  };
 
  useEffect(() => { loadData(); }, []);
 
  const activarEstudiante = async (id: number) => {
    try {
      const res = await apiRequest(`/api/estudiantes/${id}/activar/`, { method: "PATCH" });
      if (res.ok) {
        setEstudiantes((p) => p.map((e) => e.id === id ? { ...e, usuario: { ...e.usuario, is_active: true } } : e));
      }
    } catch {}
  };
 
  const validarHabilidad = async (id: number, nivel: string, estado: string) => {
    try {
      const res = await apiRequest(`/api/habilidades/${id}/validar/`, {
        method: "PATCH",
        body: JSON.stringify({ nivel, estado }),
      });
      if (res.ok) {
        setHabilidades((p) => p.map((h) => h.id === id ? { ...h, nivel, estado } : h));
      }
    } catch {}
  };
 
  const actualizarReporte = async (id: number, estado: string) => {
    try {
      const res = await apiRequest(`/api/reporte/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ estado }),
      });
      if (res.ok) {
        setReportes((p) => p.map((r) => r.id === id ? { ...r, estado } : r));
      }
    } catch {}
  };
 
  const pendingApproval = estudiantes.filter((e) => !e.usuario.is_active).length;
  const pendingHabilidades = habilidades.filter((h) => h.estado === "Pendiente").length;
  const pendingReportes = reportes.filter((r) => r.estado === "pendiente").length;
 
  const tabList = [
    { id: "aprobacion", label: "Aprobación", icon: UserCheck, badge: pendingApproval },
    { id: "validacion", label: "Estudiantes", icon: Star, badge: 0 },
    { id: "habilidades", label: "Habilidades", icon: Award, badge: pendingHabilidades },
    { id: "denuncias", label: "Denuncias", icon: Flag, badge: pendingReportes },
    { id: "cursos", label: "Cursos", icon: BookOpen, badge: 0 },
  ] as const;
 
  const reportStatusBadge = (status: string) => {
    if (status === "pendiente") return "bg-red-50 text-red-600 border-red-200";
    if (status === "en_revision") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-green-50 text-green-700 border-green-200";
  };
 
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Panel de Administración</h1>
          <p className="text-slate-500 text-sm mt-0.5">Liceo Cardenal Caro</p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
            {[
              { label: "Por aprobar", value: pendingApproval, accent: true },
              { label: "Total estudiantes", value: estudiantes.length, accent: false },
              { label: "Hab. pendientes", value: pendingHabilidades, accent: pendingHabilidades > 0 },
              { label: "Denuncias", value: pendingReportes, accent: pendingReportes > 0 },
              { label: "Total reportes", value: reportes.length, accent: false },
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
        {/* Tabs */}
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
        {["aprobacion", "validacion"].includes(tab) && (
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar por nombre..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
        )}
 
        {/* ── APROBACIÓN ── */}
        {tab === "aprobacion" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700 text-xs leading-relaxed">
                Los estudiantes que se registran requieren aprobación manual antes de activar su cuenta.
              </p>
            </div>
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Cargando...</div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs text-slate-500" style={{ fontWeight: 600 }}>Alumno</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-500 hidden md:table-cell" style={{ fontWeight: 600 }}>Especialidad</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-500" style={{ fontWeight: 600 }}>Estado</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantes
                      .filter((e) => !search || `${e.usuario.first_name} ${e.usuario.last_name}`.toLowerCase().includes(search.toLowerCase()))
                      .map((e, i) => (
                        <tr key={e.id} className={`border-b border-slate-50 last:border-0 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                          <td className="px-4 py-3">
                            <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{e.usuario.first_name} {e.usuario.last_name}</p>
                            <p className="text-slate-500 text-xs">{e.usuario.email}</p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <p className="text-slate-600 text-xs">{e.especialidad}</p>
                            <p className="text-slate-400 text-xs">{e.grado}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${e.usuario.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`} style={{ fontWeight: 600 }}>
                              {e.usuario.is_active ? "✓ Activo" : "Pendiente"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {!e.usuario.is_active && (
                              <button
                                onClick={() => activarEstudiante(e.id)}
                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                title="Activar"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    {estudiantes.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-sm">No hay estudiantes registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
 
        {/* ── ESTUDIANTES ── */}
        {tab === "validacion" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Cargando...</div>
            ) : estudiantes
              .filter((e) => !search || `${e.usuario.first_name} ${e.usuario.last_name}`.toLowerCase().includes(search.toLowerCase()))
              .map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{e.usuario.first_name} {e.usuario.last_name}</p>
                          <p className="text-slate-500 text-xs">{e.especialidad} · {e.grado}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-lg border ${e.usuario.is_active ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"}`} style={{ fontWeight: 600 }}>
                          {e.usuario.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{e.usuario.email}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            {!loading && estudiantes.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">No hay estudiantes registrados.</div>
            )}
          </div>
        )}
 
        {/* ── HABILIDADES ── */}
        {tab === "habilidades" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-600 text-xs">Valida o rechaza las habilidades que los estudiantes han registrado. Asigna el nivel correspondiente.</p>
            </div>
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Cargando...</div>
            ) : habilidades.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No hay habilidades registradas.</div>
            ) : habilidades.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{h.nombre}</p>
                    <p className="text-slate-500 text-xs">Estudiante #{h.estudiante} · Nivel actual: {h.nivel}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg border ${h.estado === "Aprobado" ? "bg-green-50 text-green-700 border-green-200" : h.estado === "Rechazado" ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`} style={{ fontWeight: 600 }}>
                    {h.estado}
                  </span>
                </div>
                {h.estado === "Pendiente" && (
                  <div className="space-y-2">
                    <p className="text-slate-600 text-xs" style={{ fontWeight: 500 }}>Asignar nivel:</p>
                    <div className="flex gap-2 flex-wrap">
                      {["Bajo", "Medio", "Alto"].map((l) => (
                        <LevelBtn key={l} l={l} sel={h.nivel === l}
                          onClick={() => validarHabilidad(h.id, l, "Aprobado")} />
                      ))}
                      <button onClick={() => validarHabilidad(h.id, h.nivel, "Rechazado")}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs hover:bg-red-50 transition-all" style={{ fontWeight: 600 }}>
                        Rechazar
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
 
        {/* ── DENUNCIAS ── */}
        {tab === "denuncias" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 border rounded-xl p-3 mb-4" style={{ backgroundColor: "#FFF5F5", borderColor: "#FCA5A5" }}>
              <Flag className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-xs leading-relaxed">Gestiona los reportes de la comunidad.</p>
            </div>
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Cargando...</div>
            ) : reportes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No hay reportes.</div>
            ) : reportes.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Flag className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Usuario #{r.usuario_reportado}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${reportStatusBadge(r.estado)}`} style={{ fontWeight: 600 }}>
                          {r.estado === "pendiente" ? "Pendiente" : r.estado === "en_revision" ? "En revisión" : "Resuelto"}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">Reportado por usuario #{r.reportado_por}</p>
                      <p className="text-slate-600 text-xs mt-1"><span style={{ fontWeight: 600 }}>Motivo:</span> {r.motivo}</p>
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
                          <p className="text-slate-600 text-xs italic">"{r.descripcion}"</p>
                        </div>
                        {r.estado !== "resuelto" && (
                          <div className="flex gap-2">
                            {r.estado === "pendiente" && (
                              <button onClick={() => actualizarReporte(r.id, "en_revision")}
                                className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-xs hover:bg-amber-600 transition-colors" style={{ fontWeight: 600 }}>
                                Marcar en revisión
                              </button>
                            )}
                            <button onClick={() => actualizarReporte(r.id, "resuelto")}
                              className="flex-1 py-2 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 transition-colors" style={{ fontWeight: 600 }}>
                              Marcar como resuelto
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
 
        {/* ── CURSOS (solo UI, sin endpoint backend) ── */}
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
                  <button onClick={() => { setCoursePublished(false); setCourseForm({ title: "", link: "", specialty: "", desc: "" }); }}
                    className="mt-4 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-colors" style={{ fontWeight: 500 }}>
                    Publicar otro
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (courseForm.title && courseForm.link && courseForm.specialty) setCoursePublished(true); }}>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Título *</label>
                    <input value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="ej. Electricidad Residencial para Técnicos"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Enlace *</label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={courseForm.link} onChange={(e) => setCourseForm((p) => ({ ...p, link: e.target.value }))}
                        placeholder="https://youtube.com/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Especialidad *</label>
                    <select value={courseForm.specialty} onChange={(e) => setCourseForm((p) => ({ ...p, specialty: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                      <option value="">Selecciona...</option>
                      <option>Electricidad</option>
                      <option>Computación e Informática</option>
                      <option>Construcción</option>
                      <option>Mecánica Automotriz</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Descripción</label>
                    <textarea value={courseForm.desc} onChange={(e) => setCourseForm((p) => ({ ...p, desc: e.target.value }))}
                      rows={3} placeholder="Describe el contenido..."
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
      </div>
    </div>
  );
}