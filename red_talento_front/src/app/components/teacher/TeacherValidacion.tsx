import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle, Clock, Award, Star, Users, Building2,
  AlertCircle, Search, X, Wrench, Shield,
  Eye, MessageSquare, ClipboardCheck, Flag, BookOpen, Link2,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { usePerfil } from "@/app/context/PerfilContext";
import {
  docenteApi, habilidadesApi, cursosApi, perfilApi, reportesApi, adminApi,
} from "@/api/api";
import type {
  SolicitudAlumno, EstudiantePerfil, SkillLevel, Reporte, EstadoReporte, PublicacionData,
} from "@/app/types";

function LevelBtn({ l, sel, onClick }: { l: string; sel: boolean; onClick: () => void }) {
  const styles: Record<string, string> = {
    Bajo: sel ? "bg-red-500 text-white border-red-500" : "border-slate-200 text-slate-600 hover:bg-slate-50",
    Medio: sel ? "bg-amber-500 text-white border-amber-500" : "border-slate-200 text-slate-600 hover:bg-slate-50",
    Alto: sel ? "bg-green-600 text-white border-green-600" : "border-slate-200 text-slate-600 hover:bg-slate-50",
  };
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${styles[l]}`}>
      {l}
    </button>
  );
}

function StudentEvalModal({
  student,
  onClose,
  onSealed,
  onRejected,
}: {
  student: EstudiantePerfil;
  onClose: () => void;
  onSealed: () => void;
  onRejected: () => void;
}) {
  const pendingSkills = student.habilidades_pendientes ?? [];
  const baseSkills = pendingSkills.length > 0 ? pendingSkills : (student.habilidades ?? []);
  const techSkills = baseSkills.filter((h) => h.tipo === "tecnica");
  const softSkills = baseSkills.filter((h) => h.tipo === "blanda");

  const [techLevels, setTechLevels] = useState<Record<number, SkillLevel>>(
    Object.fromEntries(techSkills.map((s) => [s.id, s.nivel]))
  );
  const [softLevels, setSoftLevels] = useState<Record<number, SkillLevel>>(
    Object.fromEntries(softSkills.map((s) => [s.id, s.nivel]))
  );
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejected, setRejected] = useState(false);

  const allFilled =
    techSkills.every((s) => techLevels[s.id]) &&
    softSkills.every((s) => softLevels[s.id]);

  const handleSeal = async () => {
    setSealing(true);
    try {
      await Promise.all([
        ...techSkills.map((s) => habilidadesApi.validar(s.id, techLevels[s.id]!)),
        ...softSkills.map((s) => habilidadesApi.validar(s.id, softLevels[s.id]!)),
      ]);
      setSealed(true);
      setTimeout(() => { onSealed(); onClose(); }, 1800);
    } catch {
      setSealing(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await Promise.all([
        ...techSkills.map((s) => habilidadesApi.rechazar(s.id)),
        ...softSkills.map((s) => habilidadesApi.rechazar(s.id)),
      ]);
      setRejected(true);
      setTimeout(() => { onRejected(); onClose(); }, 1800);
    } catch {
      setRejecting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {student.foto_perfil ? (
              <img src={student.foto_perfil} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <span className="text-slate-500 font-bold">{student.nombre?.charAt(0)}</span>
              </div>
            )}
            <div>
              <h2 className="text-slate-900 text-sm font-bold">{student.nombre}</h2>
              <p className="text-slate-500 text-xs">{student.especialidad} · {student.curso}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {pendingSkills.length > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-xs">Habilidades que el alumno solicita validar. Asigna el nivel correspondiente.</p>
            </div>
          )}
          {techSkills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="w-4 h-4 text-slate-400" />
                <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.875rem" }}>Competencias Técnicas</h3>
              </div>
              <div className="space-y-3">
                {techSkills.map((skill) => (
                  <div key={skill.id} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-700 text-sm font-medium mb-2">{skill.nombre}</p>
                    <div className="flex gap-2">
                      {(["Bajo", "Medio", "Alto"] as SkillLevel[]).map((l) => (
                        <LevelBtn key={l} l={l} sel={techLevels[skill.id] === l}
                          onClick={() => setTechLevels((p) => ({ ...p, [skill.id]: l }))} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {softSkills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-slate-400" />
                <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.875rem" }}>Habilidades Blandas</h3>
              </div>
              <div className="space-y-3">
                {softSkills.map((skill) => (
                  <div key={skill.id} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-700 text-sm font-medium mb-2">{skill.nombre}</p>
                    <div className="flex gap-2">
                      {(["Bajo", "Medio", "Alto"] as SkillLevel[]).map((l) => (
                        <LevelBtn key={l} l={l} sel={softLevels[skill.id] === l}
                          onClick={() => setSoftLevels((p) => ({ ...p, [skill.id]: l }))} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {techSkills.length === 0 && softSkills.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">Este alumno no tiene habilidades registradas aún.</p>
          )}

          {rejected ? (
            <div className="w-full py-3.5 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center gap-2 text-sm">
              <X className="w-4 h-4" /> Validación rechazada
            </div>
          ) : sealed ? (
            <div className="w-full py-3.5 rounded-xl bg-green-500 text-white font-bold flex items-center justify-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" /> ¡Sello aplicado!
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button onClick={handleSeal} disabled={!allFilled || sealing || rejecting}
                className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm ${
                  allFilled && !sealing && !rejecting
                    ? "text-white font-bold hover:opacity-90"
                    : "bg-slate-100 text-slate-400 font-semibold cursor-not-allowed"
                }`}
                style={allFilled && !sealing && !rejecting ? { backgroundColor: "#D4AF37" } : {}}>
                <Award className="w-4 h-4" />
                {sealing ? "Aplicando sello…" : allFilled ? "Aplicar Sello Institucional" : "Evalúa todas las habilidades para aprobar"}
              </button>
              <button onClick={handleReject} disabled={sealing || rejecting}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <X className="w-4 h-4" />
                {rejecting ? "Rechazando…" : "Rechazar validación"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function TeacherValidacion() {
  const { user } = useAuth();
  const { openPerfil } = usePerfil();
  const esAdmin = user?.es_admin === true;
  const [tab, setTab] = useState<"aprobacion" | "validacion" | "empresas" | "denuncias" | "cursos" | "solicitudes">(esAdmin ? "aprobacion" : "validacion");
  const [search, setSearch] = useState("");

  const [solicitudes, setSolicitudes] = useState<SolicitudAlumno[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudiantePerfil[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [evalStudent, setEvalStudent] = useState<EstudiantePerfil | null>(null);
  const [updatingReporte, setUpdatingReporte] = useState<number | null>(null);
  const [verContenido, setVerContenido] = useState<{ reporte: Reporte } | null>(null);
  const [accionUsuario, setAccionUsuario] = useState<{ reporteId: number; usuarioId: number; nombre: string } | null>(null);
  const [diasSuspension, setDiasSuspension] = useState<number>(7);
  const [ejecutandoAccion, setEjecutandoAccion] = useState(false);
  const [mensajeAccion, setMensajeAccion] = useState<string | null>(null);
  const [mostrarResueltos, setMostrarResueltos] = useState(false);

  const [courseForm, setCourseForm] = useState({ title: "", link: "", specialty: "", nivel: "basico", plataforma: "otro", desc: "" });
  const [coursePublished, setCoursePublished] = useState(false);
  const [publishingCourse, setPublishingCourse] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cursosParaValidar, setCursosParaValidar] = useState<any[]>([]);
  const [validandoCurso, setValidandoCurso] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [sols, ests, reps, cursosPend] = await Promise.all([
        docenteApi.getSolicitudes(),
        perfilApi.getEstudiantes(),
        reportesApi.getAll().catch(() => [] as Reporte[]),
        cursosApi.getPendientesValidacion().catch(() => []),
      ]);
      setSolicitudes(sols);
      setEstudiantes(ests.results ?? []);
      setReportes(reps);
      setCursosParaValidar(cursosPend);
    } catch {
      // silently fail
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const pendientes = solicitudes.filter((s) => s.estado === "pendiente");
  const aprobados = solicitudes.filter((s) => s.estado === "aprobado");

  const handleAprobar = async (id: number) => {
    try {
      await docenteApi.aprobarSolicitud(id);
      await loadData();
    } catch {
      // silently fail
    }
  };

  const handleRechazar = async (id: number) => {
    try {
      await docenteApi.rechazarSolicitud(id);
      await loadData();
    } catch {
      // silently fail
    }
  };

  const handleCambiarEstadoReporte = async (id: number, estado: EstadoReporte) => {
    setUpdatingReporte(id);
    try {
      const actualizado = await reportesApi.updateEstado(id, estado);
      setReportes((prev) => prev.map((r) => r.id === id ? actualizado : r));
    } catch {
      // silently fail
    } finally {
      setUpdatingReporte(null);
    }
  };

  const handleAccionUsuario = async (tipo: "suspender" | "bloquear") => {
    if (!accionUsuario) return;
    setEjecutandoAccion(true);
    try {
      const res = tipo === "suspender"
        ? await adminApi.suspenderUsuario(accionUsuario.usuarioId, diasSuspension)
        : await adminApi.bloquearUsuario(accionUsuario.usuarioId);
      setMensajeAccion(res.mensaje);
      const r = reportes.find((x) => x.id === accionUsuario.reporteId);
      if (r && r.estado === "pendiente") {
        await reportesApi.updateEstado(accionUsuario.reporteId, "en_revision");
        setReportes((prev) => prev.map((x) => x.id === accionUsuario.reporteId ? { ...x, estado: "en_revision" as const } : x));
      }
      setTimeout(() => { setMensajeAccion(null); setAccionUsuario(null); }, 2500);
    } catch {
      setMensajeAccion("Error al ejecutar la acción.");
      setTimeout(() => setMensajeAccion(null), 2500);
    } finally {
      setEjecutandoAccion(false);
    }
  };

  const handleValidarCurso = async (id: number, estado: "aprobado" | "rechazado") => {
    setValidandoCurso(id);
    try {
      await cursosApi.validar(id, estado);
      setCursosParaValidar((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // silently fail
    } finally {
      setValidandoCurso(null);
    }
  };

  const handlePublishCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.link || !courseForm.specialty) return;
    setPublishingCourse(true);
    try {
      await cursosApi.crear({
        titulo: courseForm.title,
        url: courseForm.link,
        plataforma: courseForm.plataforma,
        especialidad: courseForm.specialty,
        nivel: courseForm.nivel,
        descripcion: courseForm.desc,
      });
      setCoursePublished(true);
    } catch {
      setCoursePublished(true);
    } finally {
      setPublishingCourse(false);
    }
  };

  const nombre = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "—";

  const tabList = [
    ...(esAdmin ? [{ id: "aprobacion" as const, label: "Aprobación", icon: UserCheck, badge: pendientes.length }] : []),
    { id: "validacion" as const, label: "Validación", icon: Star, badge: estudiantes.filter((e) => (e.habilidades_pendientes?.length ?? 0) > 0).length },
    { id: "empresas" as const, label: "Empresas", icon: Building2, badge: 0 },
    { id: "denuncias" as const, label: "Denuncias", icon: Flag, badge: reportes.filter((r) => r.estado === "pendiente").length },
    { id: "cursos" as const, label: "Cursos", icon: BookOpen, badge: cursosParaValidar.length },
    { id: "solicitudes" as const, label: "Solicitudes", icon: ClipboardCheck, badge: 0 },
  ];

  const filteredSolicitudes = solicitudes
    .filter((s) => s.estado === "pendiente")
    .filter((s) => !search || s.nombre.toLowerCase().includes(search.toLowerCase()));
  const filteredEstudiantes = estudiantes
    .filter((s) => (s.habilidades_pendientes?.length ?? 0) > 0)
    .filter((s) => !search || s.nombre.toLowerCase().includes(search.toLowerCase()) || s.especialidad.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-slate-900 font-bold" style={{ fontSize: "1.25rem" }}>Panel de Administración</h1>
          <p className="text-slate-500 text-sm mt-0.5">Prof. {nombre} · Liceo Cardenal Caro</p>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
            {[
              ...(esAdmin ? [{ label: "Por aprobar", value: pendientes.length, accent: pendientes.length > 0 }] : []),
              { label: "Por validar", value: estudiantes.filter((e) => (e.habilidades_pendientes?.length ?? 0) > 0).length, accent: true },
              ...(esAdmin ? [{ label: "Aprobados", value: aprobados.length, accent: false }] : []),
              { label: "Denuncias", value: reportes.filter((r) => r.estado === "pendiente").length, accent: reportes.filter((r) => r.estado === "pendiente").length > 0 },
              { label: "Emp. revisión", value: 0, accent: false },
              { label: "Total alumnos", value: estudiantes.length, accent: false },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-3 text-center ${s.accent && s.value > 0 ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
                <p className={`text-xl font-extrabold ${s.accent && s.value > 0 ? "text-red-600" : "text-slate-900"}`} style={{ lineHeight: 1 }}>{s.value}</p>
                <p className={`text-xs mt-0.5 ${s.accent && s.value > 0 ? "text-red-500" : "text-slate-500"}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5">
        <div className="flex bg-white rounded-xl border border-slate-200 p-1 mb-5 overflow-x-auto">
          {tabList.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
                  active
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {t.badge > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white text-slate-900" : "bg-red-500 text-white"}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {["aprobacion", "validacion"].includes(tab) && (
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
        )}

        {loadingData && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          </div>
        )}

        {!loadingData && tab === "aprobacion" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700 text-xs leading-relaxed">
                Los estudiantes que se registran requieren aprobación manual. Verifica que pertenezcan al Liceo Cardenal Caro.
              </p>
            </div>
            {filteredSolicitudes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No hay solicitudes de aprobación pendientes.</div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Alumno</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Especialidad</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Solicitud</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Estado</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSolicitudes.map((s, i) => (
                      <tr key={s.id} className={`border-b border-slate-50 last:border-0 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                        <td className="px-4 py-3">
                          <p className="text-slate-900 text-sm font-semibold">{s.nombre}</p>
                          <p className="text-slate-500 text-xs">{s.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-slate-600 text-xs">{s.especialidad}</p>
                          <p className="text-slate-400 text-xs">{s.curso}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                          {new Date(s.fecha_solicitud).toLocaleDateString("es-CL")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            s.estado === "aprobado" ? "bg-green-50 text-green-700 border-green-200" :
                            s.estado === "rechazado" ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {s.estado === "aprobado" ? "✓ Aprobado" : s.estado === "rechazado" ? "Rechazado" : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.estado === "pendiente" && (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleAprobar(s.id)}
                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Aprobar">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleRechazar(s.id)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Rechazar">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          {s.estado !== "pendiente" && <Eye className="w-4 h-4 text-slate-300" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loadingData && tab === "validacion" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <Star className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-xs leading-relaxed">
                Estos alumnos han solicitado que certifiques sus habilidades. Revisa cada una, asigna el nivel correspondiente y aplica el sello institucional para que aparezca validado en su perfil, o recházala si no cumple los requisitos.
              </p>
            </div>
            {filteredEstudiantes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No hay solicitudes de validación pendientes.</div>
            ) : (
              filteredEstudiantes.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {s.foto_perfil ? (
                        <img src={s.foto_perfil} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-500 font-bold">{s.nombre?.charAt(0)}</span>
                        </div>
                      )}
                      {s.validado && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white" style={{ backgroundColor: "#D4AF37" }}>
                          <Award className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-slate-900 text-sm font-semibold">{s.nombre}</p>
                          <p className="text-slate-500 text-xs">{s.especialidad} · {s.curso}</p>
                          <p className="text-amber-600 text-xs font-medium mt-0.5">
                            {s.habilidades_pendientes?.length ?? 0} habilidad{(s.habilidades_pendientes?.length ?? 0) !== 1 ? "es" : ""} por validar
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-amber-200 bg-amber-50 text-amber-700">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setEvalStudent(s)}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                            !s.validado ? "bg-slate-900 text-white hover:bg-slate-700" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}>
                          <Star className="w-3.5 h-3.5" />
                          {!s.validado ? "Evaluar y Sellar" : "Ver evaluación"}
                        </button>
                        <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {!loadingData && tab === "empresas" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
              <Shield className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-600 text-xs leading-relaxed">
                Las empresas se registran directamente. Puedes suspender aquellas que incumplan las normas de la plataforma.
              </p>
            </div>
            <div className="text-center py-12 text-slate-400 text-sm">
              <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              Gestión de empresas próximamente.
            </div>
          </div>
        )}

        {!loadingData && tab === "denuncias" && (
          <div className="space-y-3">
            {(() => {
              const reportesFiltrados = mostrarResueltos
                ? reportes
                : reportes.filter((r) => r.estado !== "resuelto");
              const resueltos = reportes.filter((r) => r.estado === "resuelto").length;
              return (
                <>
                  <div className="flex items-center justify-between gap-3 border rounded-xl p-3 mb-4" style={{ backgroundColor: "#FFF5F5", borderColor: "#FCA5A5" }}>
                    <div className="flex items-start gap-2 flex-1">
                      <Flag className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-xs leading-relaxed">
                        Centro de seguridad. Gestiona los reportes de la comunidad.
                      </p>
                    </div>
                    {resueltos > 0 && (
                      <button
                        onClick={() => setMostrarResueltos((v) => !v)}
                        className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                        {mostrarResueltos ? "Ocultar resueltos" : `Ver resueltos (${resueltos})`}
                      </button>
                    )}
                  </div>

                  {reportesFiltrados.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      <Flag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      {reportes.length === 0 ? "No hay denuncias registradas." : "No hay denuncias activas. ¡Todo en orden!"}
                    </div>
                  ) : (
                    reportesFiltrados.map((r, i) => {
                const estadoConfig = {
                  pendiente: { label: "Pendiente", cls: "bg-red-50 text-red-700 border-red-200" },
                  en_revision: { label: "En revisión", cls: "bg-amber-50 text-amber-700 border-amber-200" },
                  resuelto: { label: "Resuelto", cls: "bg-green-50 text-green-700 border-green-200" },
                }[r.estado];

                return (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${estadoConfig.cls}`}>
                            {estadoConfig.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(r.fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <p className="text-slate-900 text-sm font-semibold">{r.motivo}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Reportado por: <span className="text-slate-700 font-medium">{r.reportado_por_nombre || `Usuario #${r.reportado_por}`}</span>
                          {" · "}
                          Denunciado: <span className="text-slate-700 font-medium">{r.usuario_reportado_nombre || `Usuario #${r.usuario_reportado}`}</span>
                        </p>
                        {r.descripcion && (
                          <p className="text-slate-500 text-xs mt-2 leading-relaxed border-l-2 border-slate-200 pl-3">
                            {r.descripcion}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      {r.estado !== "resuelto" && (
                        <div className="flex gap-2">
                          {r.estado === "pendiente" && (
                            <button
                              onClick={() => handleCambiarEstadoReporte(r.id, "en_revision")}
                              disabled={updatingReporte === r.id}
                              className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50">
                              {updatingReporte === r.id ? "Actualizando…" : "En revisión"}
                            </button>
                          )}
                          <button
                            onClick={() => handleCambiarEstadoReporte(r.id, "resuelto")}
                            disabled={updatingReporte === r.id}
                            className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50">
                            {updatingReporte === r.id ? "Actualizando…" : "Marcar resuelto"}
                          </button>
                        </div>
                      )}
                      {r.estado === "resuelto" && (
                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Denuncia resuelta
                        </div>
                      )}
                      <button
                        onClick={() => setVerContenido({ reporte: r })}
                        className="w-full py-1.5 rounded-lg text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Ver {r.publicacion_data ? "publicación reportada" : "perfil del denunciado"}
                      </button>
                      <button
                        onClick={() => setAccionUsuario({ reporteId: r.id, usuarioId: r.usuario_reportado, nombre: r.usuario_reportado_nombre || `Usuario #${r.usuario_reportado}` })}
                        className="w-full py-1.5 rounded-lg text-xs font-semibold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Gestionar cuenta de {r.usuario_reportado_nombre || `Usuario #${r.usuario_reportado}`}
                      </button>
                    </div>
                  </motion.div>
                );
                    })
                  )}
                </>
              );
            })()}
          </div>
        )}

        {!loadingData && tab === "cursos" && (
          <div className="space-y-5 max-w-lg">
            {cursosParaValidar.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-slate-900 font-bold" style={{ fontSize: "0.95rem" }}>Inscripciones por validar</h3>
                  <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{cursosParaValidar.length}</span>
                </div>
                <div className="space-y-3">
                  {cursosParaValidar.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 text-sm font-semibold truncate">{c.curso_titulo}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{c.estudiante_nombre}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleValidarCurso(c.id, "aprobado")}
                          disabled={validandoCurso === c.id}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleValidarCurso(c.id, "rechazado")}
                          disabled={validandoCurso === c.id}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cursosParaValidar.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <CheckCircle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No hay inscripciones pendientes de validar.</p>
                <p className="text-slate-400 text-xs mt-1">Para publicar nuevos cursos, ve a tu <strong>Perfil → Cursos</strong>.</p>
              </div>
            )}
            {/* Formulario movido a TeacherProfile — esta es solo la sección de admin */}
            {false && <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen className="w-5 h-5 text-slate-600" />
                <h3 className="text-slate-900 font-bold" style={{ fontSize: "0.95rem" }}>Publicar curso o recurso</h3>
              </div>
              {coursePublished ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <p className="text-slate-900 text-sm font-semibold">¡Curso publicado con éxito!</p>
                  <p className="text-slate-500 text-xs mt-1">Los alumnos lo verán en su sección de Crecimiento.</p>
                  <button onClick={() => { setCoursePublished(false); setCourseForm({ title: "", link: "", specialty: "", nivel: "basico", plataforma: "otro", desc: "" }); }}
                    className="mt-4 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                    Publicar otro
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handlePublishCourse}>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">
                      Título del curso <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={courseForm.title}
                      onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="ej. Electricidad Residencial para Técnicos"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">
                      Enlace del curso <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={courseForm.link}
                        onChange={(e) => setCourseForm((p) => ({ ...p, link: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5">Plataforma</label>
                      <select value={courseForm.plataforma} onChange={(e) => setCourseForm((p) => ({ ...p, plataforma: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                        <option value="youtube">YouTube</option>
                        <option value="udemy">Udemy</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5">Nivel</label>
                      <select value={courseForm.nivel} onChange={(e) => setCourseForm((p) => ({ ...p, nivel: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                        <option value="basico">Básico</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">
                      Área / Especialidad <span className="text-red-500">*</span>
                    </label>
                    <select value={courseForm.specialty} onChange={(e) => setCourseForm((p) => ({ ...p, specialty: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" required>
                      <option value="">Selecciona una especialidad...</option>
                      <option>Electricidad</option>
                      <option>Computación e Informática</option>
                      <option>Construcción</option>
                      <option>Mecánica Automotriz</option>
                      <option>Mecánica Industrial</option>
                      <option>Todas las especialidades</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea value={courseForm.desc} onChange={(e) => setCourseForm((p) => ({ ...p, desc: e.target.value }))}
                      rows={3} placeholder="¿Qué aprenderán los estudiantes? ¿A quién va dirigido?"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200" required />
                  </div>
                  <button type="submit"
                    disabled={!courseForm.title || !courseForm.link || !courseForm.specialty || !courseForm.desc || publishingCourse}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                      courseForm.title && courseForm.link && courseForm.specialty && courseForm.desc && !publishingCourse
                        ? "bg-slate-900 hover:bg-slate-700 text-white"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}>
                    {publishingCourse ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publicando...</> : "Publicar curso"}
                  </button>
                </form>
              )}
            </div>}
          </div>
        )}

        {!loadingData && tab === "solicitudes" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-600 text-xs">
                Los alumnos pueden solicitar actualizar sus niveles de competencia. Revisa y aprueba o rechaza cada solicitud.
              </p>
            </div>
            <div className="text-center py-12 text-slate-400 text-sm">
              <ClipboardCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              No hay solicitudes de cambio de nivel pendientes.
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {verContenido && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setVerContenido(null)}>
            <motion.div initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}>

              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <p className="text-slate-900 text-sm font-bold">Contenido reportado</p>
                  <p className="text-slate-400 text-xs mt-0.5">Motivo: <span className="text-slate-600 font-medium">{verContenido.reporte.motivo}</span></p>
                </div>
                <button onClick={() => setVerContenido(null)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {verContenido.reporte.publicacion_data ? (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Publicación</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                      {verContenido.reporte.publicacion_data.imagen_url && (
                        <img
                          src={verContenido.reporte.publicacion_data.imagen_url}
                          alt="imagen publicación"
                          className="w-full max-h-64 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-slate-600 text-xs font-bold">
                              {verContenido.reporte.publicacion_data.autor_nombre.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-slate-900 text-xs font-semibold">{verContenido.reporte.publicacion_data.autor_nombre}</p>
                            {verContenido.reporte.publicacion_data.fecha && (
                              <p className="text-slate-400 text-xs">
                                {new Date(verContenido.reporte.publicacion_data.fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">{verContenido.reporte.publicacion_data.contenido}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center mx-auto">
                      <span className="text-slate-600 text-lg font-bold">
                        {(verContenido.reporte.usuario_reportado_nombre || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-900 text-sm font-semibold">{verContenido.reporte.usuario_reportado_nombre}</p>
                      <p className="text-slate-500 text-xs mt-0.5">Este reporte es sobre el perfil del usuario</p>
                    </div>
                    <button
                      onClick={() => {
                        openPerfil(verContenido.reporte.usuario_reportado, "estudiante");
                        setVerContenido(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold transition-colors hover:bg-slate-700">
                      <Eye className="w-3.5 h-3.5" /> Ver perfil completo
                    </button>
                  </div>
                )}

                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-600 mb-1">Descripción del denunciante</p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {verContenido.reporte.descripcion || <span className="text-slate-400 italic">Sin descripción adicional.</span>}
                  </p>
                  <p className="text-slate-400 text-xs mt-2">
                    Reportado por: <span className="text-slate-600 font-medium">{verContenido.reporte.reportado_por_nombre}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAccionUsuario({ reporteId: verContenido.reporte.id, usuarioId: verContenido.reporte.usuario_reportado, nombre: verContenido.reporte.usuario_reportado_nombre });
                      setVerContenido(null);
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Gestionar cuenta
                  </button>
                  {verContenido.reporte.estado !== "resuelto" && (
                    <button
                      onClick={async () => {
                        await handleCambiarEstadoReporte(verContenido.reporte.id, "resuelto");
                        setVerContenido(null);
                      }}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Marcar resuelto
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {accionUsuario && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-bold">Gestionar cuenta</p>
                    <p className="text-slate-500 text-xs">{accionUsuario.nombre}</p>
                  </div>
                </div>
                <button onClick={() => setAccionUsuario(null)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {mensajeAccion ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p className="text-slate-900 text-sm font-semibold">{mensajeAccion}</p>
                  </div>
                ) : (
                  <>
                    <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/50">
                      <p className="text-slate-900 text-sm font-semibold mb-2">Suspensión temporal</p>
                      <p className="text-slate-500 text-xs mb-3">El usuario no podrá iniciar sesión durante el período seleccionado.</p>
                      <div className="flex gap-2 mb-3">
                        {[7, 14, 30, 90].map((d) => (
                          <button key={d} onClick={() => setDiasSuspension(d)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${diasSuspension === d ? "bg-amber-500 text-white border-amber-500" : "border-amber-200 text-amber-700 hover:bg-amber-100"}`}>
                            {d}d
                          </button>
                        ))}
                      </div>
                      <button onClick={() => handleAccionUsuario("suspender")} disabled={ejecutandoAccion}
                        className="w-full py-2 rounded-lg text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50">
                        {ejecutandoAccion ? "Aplicando…" : `Suspender ${diasSuspension} días`}
                      </button>
                    </div>

                    <div className="border border-red-200 rounded-xl p-4 bg-red-50/50">
                      <p className="text-slate-900 text-sm font-semibold mb-1">Bloqueo permanente</p>
                      <p className="text-slate-500 text-xs mb-3">La cuenta queda desactivada indefinidamente. Se puede reactivar más tarde.</p>
                      <button onClick={() => handleAccionUsuario("bloquear")} disabled={ejecutandoAccion}
                        className="w-full py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                        {ejecutandoAccion ? "Aplicando…" : "Bloquear cuenta permanentemente"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {evalStudent && (
          <StudentEvalModal
            student={evalStudent}
            onClose={() => setEvalStudent(null)}
            onSealed={() => {
              setEvalStudent(null);
              loadData();
            }}
            onRejected={() => {
              setEvalStudent(null);
              loadData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
