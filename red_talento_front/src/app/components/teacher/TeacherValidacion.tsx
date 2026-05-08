import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle, Clock, Award, Star, Users, Building2,
  AlertCircle, Search, X, Wrench, Shield,
  Eye, MessageSquare, ClipboardCheck, Flag, BookOpen,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { usePerfil } from "@/app/context/PerfilContext";
import {
  docenteApi, habilidadesApi, cursosApi, perfilApi, reportesApi, adminApi,
} from "@/api/api";
import type {
  SolicitudAlumno, EstudiantePerfil, SkillLevel, Reporte, EstadoReporte,
} from "@/app/types";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const S = {
  label: {
    fontSize: "0.68rem", fontWeight: 700 as const,
    color: "#94a3b8", textTransform: "uppercase" as const,
    letterSpacing: "0.08em", margin: 0,
  } as React.CSSProperties,
  input: {
    width: "100%", boxSizing: "border-box" as const,
    backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
    borderRadius: 10, padding: "9px 14px",
    fontSize: "0.855rem", color: "#0d1b35", outline: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "border-color 0.15s, background-color 0.15s",
  } as React.CSSProperties,
  card: {
    backgroundColor: "white", borderRadius: 14,
    border: "1px solid #E8E4DC", padding: 16,
    overflow: "hidden" as const,
  } as React.CSSProperties,
};

const statusStyle: Record<string, React.CSSProperties> = {
  pendiente:   { backgroundColor: "#FFFBF0", color: "#b45309",  border: "1px solid #fde68a" },
  aprobado:    { backgroundColor: "#F0FDF4", color: "#15803d",  border: "1px solid #bbf7d0" },
  rechazado:   { backgroundColor: "#FEF2F2", color: "#dc2626",  border: "1px solid #fecaca" },
  en_revision: { backgroundColor: "#EFF6FF", color: "#1d4ed8",  border: "1px solid #bfdbfe" },
  resuelto:    { backgroundColor: "#F0FDF4", color: "#15803d",  border: "1px solid #bbf7d0" },
};

const statusLabel: Record<string, string> = {
  pendiente:   "Pendiente",
  aprobado:    "✓ Aprobado",
  rechazado:   "Rechazado",
  en_revision: "En revisión",
  resuelto:    "Resuelto",
};

const reporteAccent: Record<string, string> = {
  pendiente:   "#ef4444",
  en_revision: "#f59e0b",
  resuelto:    "#10b981",
};

function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="animate-spin"
      style={{
        width: size, height: size, borderRadius: "50%",
        border: "2.5px solid #E8E4DC", borderTopColor: "#D4AF37",
        flexShrink: 0,
      }}
    />
  );
}

function EmptyState({ icon: Icon, text, sub }: { icon: React.ElementType; text: string; sub?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px" }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 14px",
      }}>
        <Icon style={{ width: 22, height: 22, color: "#C9B99A" }} />
      </div>
      <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.875rem", fontWeight: 700 }}>{text}</p>
      {sub && <p style={{ margin: "4px 0 0", color: "#8C7B6B", fontSize: "0.78rem" }}>{sub}</p>}
    </div>
  );
}

function InfoBanner({ icon: Icon, text, color = "neutral" }: { icon: React.ElementType; text: string; color?: "neutral" | "amber" | "blue" | "red" }) {
  const styles = {
    neutral: { bg: "#F6F5F0", border: "#E8E4DC", text: "#475569", icon: "#8C7B6B" },
    amber:   { bg: "#FFFBF0", border: "#fde68a", text: "#92400e", icon: "#b45309" },
    blue:    { bg: "#EFF6FF", border: "#bfdbfe", text: "#1e40af", icon: "#1d4ed8" },
    red:     { bg: "#FEF2F2", border: "#fecaca", text: "#991b1b", icon: "#dc2626" },
  }[color];
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      backgroundColor: styles.bg, border: `1px solid ${styles.border}`,
      borderRadius: 10, padding: 12,
    }}>
      <Icon style={{ width: 14, height: 14, color: styles.icon, flexShrink: 0, marginTop: 1 }} />
      <p style={{ margin: 0, color: styles.text, fontSize: "0.78rem", lineHeight: 1.55 }}>{text}</p>
    </div>
  );
}

function ModalNavStrip() {
  return (
    <div style={{
      height: 5, backgroundColor: "#0d1b35",
      backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.3) 1px, transparent 1px)",
      backgroundSize: "10px 10px",
    }} />
  );
}

function LevelBtn({ l, sel, onClick }: { l: string; sel: boolean; onClick: () => void }) {
  const activeStyle: Record<string, React.CSSProperties> = {
    Bajo:  { backgroundColor: "#dc2626", color: "white", borderColor: "#dc2626" },
    Medio: { backgroundColor: "#f59e0b", color: "white", borderColor: "#f59e0b" },
    Alto:  { backgroundColor: "#16a34a", color: "white", borderColor: "#16a34a" },
  };
  return (
    <button
      onClick={onClick}
      style={
        sel
          ? { padding: "6px 16px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", ...(activeStyle[l] ?? {}) }
          : { padding: "6px 16px", borderRadius: 8, border: "1px solid #E8E4DC", backgroundColor: "white", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }
      }
    >
      {l}
    </button>
  );
}

function StudentEvalModal({
  student, onClose, onSealed, onRejected,
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
    } catch { setSealing(false); }
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
    } catch { setRejecting(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, backgroundColor: "rgba(13,27,53,0.55)", backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }}
        style={{
          backgroundColor: "white", borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          backgroundColor: "#0d1b35",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          borderBottom: "3px solid #D4AF37",
          padding: "18px 20px 16px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            backgroundColor: "rgba(255,255,255,0.08)", border: "1.5px solid #D4AF37",
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {student.foto_perfil ? (
              <img src={student.foto_perfil} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: "1.2rem", fontFamily: "'Playfair Display', serif" }}>
                {student.nombre?.charAt(0)}
              </span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: "white", fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem" }}>
              {student.nombre}
            </h2>
            <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
              {student.especialidad} · {student.curso}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8, padding: 6, cursor: "pointer", display: "flex",
            }}
          >
            <X style={{ width: 14, height: 14, color: "rgba(255,255,255,0.7)" }} />
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
          {pendingSkills.length > 0 && (
            <InfoBanner
              icon={AlertCircle} color="amber"
              text="Habilidades que el alumno solicita validar. Asigna el nivel correspondiente para cada una."
            />
          )}

          {techSkills.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Wrench style={{ width: 12, height: 12, color: "#8C7B6B" }} />
                </div>
                <p style={{ ...S.label }}>Competencias Técnicas</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {techSkills.map((skill) => (
                  <div key={skill.id} style={{ backgroundColor: "#F6F5F0", borderRadius: 10, padding: "10px 14px", border: "1px solid #E8E4DC" }}>
                    <p style={{ margin: "0 0 9px", color: "#0d1b35", fontSize: "0.85rem", fontWeight: 600 }}>{skill.nombre}</p>
                    <div style={{ display: "flex", gap: 8 }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users style={{ width: 12, height: 12, color: "#8C7B6B" }} />
                </div>
                <p style={{ ...S.label }}>Habilidades Blandas</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {softSkills.map((skill) => (
                  <div key={skill.id} style={{ backgroundColor: "#F6F5F0", borderRadius: 10, padding: "10px 14px", border: "1px solid #E8E4DC" }}>
                    <p style={{ margin: "0 0 9px", color: "#0d1b35", fontSize: "0.85rem", fontWeight: 600 }}>{skill.nombre}</p>
                    <div style={{ display: "flex", gap: 8 }}>
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
            <p style={{ color: "#8C7B6B", fontSize: "0.85rem", textAlign: "center", padding: "16px 0", margin: 0 }}>
              Este alumno no tiene habilidades registradas aún.
            </p>
          )}

          {rejected ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px 20px", borderRadius: 12,
              backgroundColor: "#FEF2F2", border: "1.5px solid #fecaca",
              color: "#dc2626", fontWeight: 700, fontSize: "0.875rem",
            }}>
              <X style={{ width: 16, height: 16 }} /> Validación rechazada
            </div>
          ) : sealed ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px 20px", borderRadius: 12,
              backgroundColor: "#FFFBF0", border: "1.5px solid #D4AF37",
              color: "#b45309", fontWeight: 700, fontSize: "0.875rem",
            }}>
              <Award style={{ width: 16, height: 16, color: "#D4AF37" }} /> ¡Sello institucional aplicado!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={handleSeal}
                disabled={!allFilled || sealing || rejecting}
                style={{
                  width: "100%", padding: "13px 20px", borderRadius: 12,
                  border: "none",
                  cursor: allFilled && !sealing && !rejecting ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: "0.875rem", fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  backgroundColor: allFilled && !sealing && !rejecting ? "#D4AF37" : "#F6F5F0",
                  color: allFilled && !sealing && !rejecting ? "white" : "#94a3b8",
                  transition: "background-color 0.15s",
                }}
              >
                {sealing ? <Spinner size={16} /> : <Award style={{ width: 16, height: 16 }} />}
                {sealing ? "Aplicando sello…" : allFilled ? "Aplicar Sello Institucional" : "Evalúa todas las habilidades para aprobar"}
              </button>
              <button
                onClick={handleReject}
                disabled={sealing || rejecting}
                style={{
                  width: "100%", padding: "10px 20px", borderRadius: 12,
                  border: "1.5px solid #fecaca", backgroundColor: "white",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: "0.85rem", fontWeight: 600, color: "#dc2626",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  opacity: sealing || rejecting ? 0.45 : 1,
                }}
              >
                {rejecting ? <Spinner size={15} /> : <X style={{ width: 15, height: 15 }} />}
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
  const [tab, setTab] = useState<"aprobacion" | "validacion" | "empresas" | "denuncias" | "cursos" | "solicitudes">(
    esAdmin ? "aprobacion" : "validacion"
  );
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

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.href = FONT_URL; link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

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
    } catch { /* noop */ }
    finally { setLoadingData(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const pendientes = solicitudes.filter((s) => s.estado === "pendiente");
  const aprobados  = solicitudes.filter((s) => s.estado === "aprobado");

  const handleAprobar  = async (id: number) => { try { await docenteApi.aprobarSolicitud(id);  await loadData(); } catch { /* noop */ } };
  const handleRechazar = async (id: number) => { try { await docenteApi.rechazarSolicitud(id); await loadData(); } catch { /* noop */ } };

  const handleCambiarEstadoReporte = async (id: number, estado: EstadoReporte) => {
    setUpdatingReporte(id);
    try {
      const actualizado = await reportesApi.updateEstado(id, estado);
      setReportes((prev) => prev.map((r) => r.id === id ? actualizado : r));
    } catch { /* noop */ }
    finally { setUpdatingReporte(null); }
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
    } finally { setEjecutandoAccion(false); }
  };

  const handleValidarCurso = async (id: number, estado: "aprobado" | "rechazado") => {
    setValidandoCurso(id);
    try {
      await cursosApi.validar(id, estado);
      setCursosParaValidar((prev) => prev.filter((c) => c.id !== id));
    } catch { /* noop */ }
    finally { setValidandoCurso(null); }
  };

  const handlePublishCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.link || !courseForm.specialty) return;
    setPublishingCourse(true);
    try {
      await cursosApi.crear({
        titulo: courseForm.title, url: courseForm.link,
        plataforma: courseForm.plataforma, especialidad: courseForm.specialty,
        nivel: courseForm.nivel, descripcion: courseForm.desc,
      });
      setCoursePublished(true);
    } catch { setCoursePublished(true); }
    finally { setPublishingCourse(false); }
  };

  const nombre = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "—";

  const tabList = [
    ...(esAdmin ? [{ id: "aprobacion" as const,  label: "Aprobación",  icon: UserCheck,     badge: pendientes.length }] : []),
    { id: "validacion" as const, label: "Validación",  icon: Star,         badge: estudiantes.filter((e) => (e.habilidades_pendientes?.length ?? 0) > 0).length },
    { id: "empresas"   as const, label: "Empresas",    icon: Building2,    badge: 0 },
    { id: "denuncias"  as const, label: "Denuncias",   icon: Flag,         badge: reportes.filter((r) => r.estado === "pendiente").length },
    { id: "cursos"     as const, label: "Cursos",      icon: BookOpen,     badge: cursosParaValidar.length },
    { id: "solicitudes" as const, label: "Solicitudes", icon: ClipboardCheck, badge: 0 },
  ];

  const filteredSolicitudes = solicitudes
    .filter((s) => s.estado === "pendiente")
    .filter((s) => !search || s.nombre.toLowerCase().includes(search.toLowerCase()));
  const filteredEstudiantes = estudiantes
    .filter((s) => (s.habilidades_pendientes?.length ?? 0) > 0)
    .filter((s) => !search || s.nombre.toLowerCase().includes(search.toLowerCase()) || s.especialidad.toLowerCase().includes(search.toLowerCase()));

  const kpis = [
    ...(esAdmin ? [{ label: "Por aprobar",  value: pendientes.length, urgent: pendientes.length > 0 }] : []),
    { label: "Por validar",  value: estudiantes.filter((e) => (e.habilidades_pendientes?.length ?? 0) > 0).length, urgent: true },
    ...(esAdmin ? [{ label: "Aprobados",    value: aprobados.length,  urgent: false }] : []),
    { label: "Denuncias",    value: reportes.filter((r) => r.estado === "pendiente").length, urgent: reportes.filter((r) => r.estado === "pendiente").length > 0 },
    { label: "Emp. revisión", value: 0,               urgent: false },
    { label: "Total alumnos", value: estudiantes.length, urgent: false },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div style={{ backgroundColor: "white", borderBottom: "1px solid #E8E4DC" }}>
        <div style={{ maxWidth: 940, margin: "0 auto", padding: "20px 20px 0" }}>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
            <div>
              <h1 style={{
                margin: 0, color: "#0d1b35",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700, fontSize: "1.3rem", lineHeight: 1.2,
              }}>
                Panel de Administración
              </h1>
              <p style={{ margin: "4px 0 0", color: "#8C7B6B", fontSize: "0.8rem" }}>
                Prof. {nombre} · Liceo Cardenal Caro
              </p>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
              backgroundColor: "#FFFBF0", border: "1px solid #fde68a",
              borderRadius: 20, padding: "5px 12px",
            }}>
              <Shield style={{ width: 11, height: 11, color: "#D4AF37" }} />
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#b45309" }}>
                Panel Institucional
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2" style={{ marginBottom: 16 }}>
            {kpis.map((k) => (
              <div key={k.label} style={{
                backgroundColor: k.urgent && k.value > 0 ? "#FFFBF0" : "#F6F5F0",
                borderRadius: 12,
                border: k.urgent && k.value > 0 ? "1px solid #fde68a" : "1px solid #E8E4DC",
                padding: "10px 8px", textAlign: "center",
              }}>
                <p style={{
                  margin: 0, lineHeight: 1,
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700, fontSize: "1.4rem",
                  color: k.urgent && k.value > 0 ? "#D4AF37" : "#0d1b35",
                }}>
                  {k.value}
                </p>
                <p style={{ ...S.label, marginTop: 4 }}>{k.label}</p>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", overflowX: "auto",
            borderBottom: "2px solid #E8E4DC", gap: 0,
            scrollbarWidth: "none",
          } as React.CSSProperties}>
            {tabList.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as typeof tab)}
                  style={{
                    flexShrink: 0,
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "10px 14px",
                    background: "none", border: "none",
                    borderBottom: active ? "2px solid #D4AF37" : "2px solid transparent",
                    marginBottom: -2, cursor: "pointer",
                    fontSize: "0.8rem", fontWeight: 600,
                    color: active ? "#0d1b35" : "#94a3b8",
                    whiteSpace: "nowrap",
                    transition: "color 0.15s",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <Icon style={{ width: 13, height: 13 }} />
                  {t.label}
                  {t.badge > 0 && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      minWidth: 18, height: 18, borderRadius: 9,
                      backgroundColor: active ? "#D4AF37" : "#ef4444",
                      color: "white", fontSize: "0.6rem", fontWeight: 800, padding: "0 4px",
                    }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "20px 16px" }}>

        {["aprobacion", "validacion"].includes(tab) && (
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...S.input, paddingLeft: 36 }}
              onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
              onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.backgroundColor = "#F6F5F0"; }}
            />
          </div>
        )}

        {loadingData && (
          <div style={{ display: "flex", justifyContent: "center", padding: "52px 0" }}>
            <Spinner />
          </div>
        )}

        {!loadingData && tab === "aprobacion" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <InfoBanner icon={Shield} color="blue"
              text="Los estudiantes que se registran requieren aprobación manual. Verifica que pertenezcan al Liceo Cardenal Caro." />

            {filteredSolicitudes.length === 0 ? (
              <EmptyState icon={UserCheck} text="No hay solicitudes de aprobación pendientes." />
            ) : (
              <div style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid #E8E4DC", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid #F1EDE5" }}>
                      {["Alumno", "Especialidad", "Solicitud", "Estado", ""].map((h, i) => (
                        <th
                          key={i}
                          style={{ textAlign: "left", padding: "10px 14px", ...S.label }}
                          className={i === 1 || i === 2 ? "hidden md:table-cell" : ""}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSolicitudes.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #F1EDE5" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.85rem", fontWeight: 700 }}>{s.nombre}</p>
                          <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "0.72rem" }}>{s.email}</p>
                        </td>
                        <td style={{ padding: "12px 14px" }} className="hidden md:table-cell">
                          <p style={{ margin: 0, color: "#475569", fontSize: "0.78rem" }}>{s.especialidad}</p>
                          <p style={{ margin: "1px 0 0", color: "#94a3b8", fontSize: "0.72rem" }}>{s.curso}</p>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#94a3b8", fontSize: "0.75rem" }} className="hidden md:table-cell">
                          {new Date(s.fecha_solicitud).toLocaleDateString("es-CL")}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ ...(statusStyle[s.estado] ?? statusStyle.pendiente), borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700 }}>
                            {statusLabel[s.estado] ?? s.estado}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {s.estado === "pendiente" ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => handleAprobar(s.id)}
                                title="Aprobar"
                                style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#F0FDF4", border: "1px solid #bbf7d0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              >
                                <CheckCircle style={{ width: 15, height: 15, color: "#15803d" }} />
                              </button>
                              <button
                                onClick={() => handleRechazar(s.id)}
                                title="Rechazar"
                                style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#FEF2F2", border: "1px solid #fecaca", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              >
                                <X style={{ width: 15, height: 15, color: "#dc2626" }} />
                              </button>
                            </div>
                          ) : (
                            <Eye style={{ width: 15, height: 15, color: "#E8E4DC" }} />
                          )}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <InfoBanner icon={Star} color="amber"
              text="Estos alumnos han solicitado que certifiques sus habilidades. Asigna el nivel y aplica el sello institucional, o recházala si no cumple los requisitos." />

            {filteredEstudiantes.length === 0 ? (
              <EmptyState icon={Star} text="No hay solicitudes de validación pendientes." />
            ) : (
              filteredEstudiantes.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={S.card}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {s.foto_perfil ? (
                        <img src={s.foto_perfil} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", border: "1px solid #E8E4DC" }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: "1.2rem", fontFamily: "'Playfair Display', serif" }}>
                            {s.nombre?.charAt(0)}
                          </span>
                        </div>
                      )}
                      {s.validado && (
                        <div style={{ position: "absolute", bottom: -4, right: -4, width: 18, height: 18, borderRadius: "50%", backgroundColor: "#D4AF37", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Award style={{ width: 10, height: 10, color: "white" }} />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div>
                          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.875rem", fontWeight: 700 }}>{s.nombre}</p>
                          <p style={{ margin: "2px 0 0", color: "#8C7B6B", fontSize: "0.75rem" }}>
                            {s.especialidad} · {s.curso}
                          </p>
                          <p style={{ margin: "3px 0 0", color: "#b45309", fontSize: "0.72rem", fontWeight: 600 }}>
                            {s.habilidades_pendientes?.length ?? 0} habilidad{(s.habilidades_pendientes?.length ?? 0) !== 1 ? "es" : ""} por validar
                          </p>
                        </div>
                        <span style={{ ...statusStyle.pendiente, borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock style={{ width: 11, height: 11 }} /> Pendiente
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button
                          onClick={() => setEvalStudent(s)}
                          style={{
                            flex: 1, padding: "8px 14px", borderRadius: 8,
                            border: "none", cursor: "pointer",
                            backgroundColor: "#0d1b35", color: "white",
                            fontSize: "0.78rem", fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          <Star style={{ width: 13, height: 13 }} />
                          Evaluar y Sellar
                        </button>
                        <button style={{
                          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                          border: "1px solid #E8E4DC", backgroundColor: "white",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <MessageSquare style={{ width: 15, height: 15, color: "#94a3b8" }} />
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <InfoBanner icon={Shield} text="Las empresas se registran directamente. Puedes suspender aquellas que incumplan las normas de la plataforma." />
            <EmptyState icon={Building2} text="Gestión de empresas próximamente." />
          </div>
        )}

        {!loadingData && tab === "denuncias" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(() => {
              const reportesFiltrados = mostrarResueltos ? reportes : reportes.filter((r) => r.estado !== "resuelto");
              const resueltos = reportes.filter((r) => r.estado === "resuelto").length;
              return (
                <>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    backgroundColor: "#FEF2F2", border: "1px solid #fecaca",
                    borderRadius: 10, padding: 12, marginBottom: 4,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 7, flex: 1 }}>
                      <Flag style={{ width: 14, height: 14, color: "#dc2626", flexShrink: 0, marginTop: 1 }} />
                      <p style={{ margin: 0, color: "#991b1b", fontSize: "0.78rem", lineHeight: 1.5 }}>
                        Centro de seguridad. Gestiona los reportes de la comunidad.
                      </p>
                    </div>
                    {resueltos > 0 && (
                      <button
                        onClick={() => setMostrarResueltos((v) => !v)}
                        style={{
                          flexShrink: 0, padding: "5px 12px", borderRadius: 8,
                          border: "1px solid #fecaca", backgroundColor: "white",
                          color: "#dc2626", fontSize: "0.72rem", fontWeight: 600,
                          cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {mostrarResueltos ? "Ocultar resueltos" : `Ver resueltos (${resueltos})`}
                      </button>
                    )}
                  </div>

                  {reportesFiltrados.length === 0 ? (
                    <EmptyState icon={Flag} text={reportes.length === 0 ? "No hay denuncias registradas." : "No hay denuncias activas. ¡Todo en orden!"} />
                  ) : (
                    reportesFiltrados.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          backgroundColor: "white", borderRadius: 14,
                          border: "1px solid #E8E4DC",
                          borderLeft: `3.5px solid ${reporteAccent[r.estado] ?? "#E8E4DC"}`,
                          padding: 16,
                        }}
                      >
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                            <span style={{ ...(statusStyle[r.estado] ?? statusStyle.pendiente), borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700 }}>
                              {statusLabel[r.estado] ?? r.estado}
                            </span>
                            <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                              {new Date(r.fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          <p style={{ margin: "0 0 4px", color: "#0d1b35", fontSize: "0.875rem", fontWeight: 700 }}>{r.motivo}</p>
                          <p style={{ margin: 0, color: "#8C7B6B", fontSize: "0.75rem" }}>
                            Reportado por: <span style={{ color: "#0d1b35", fontWeight: 600 }}>{r.reportado_por_nombre || `Usuario #${r.reportado_por}`}</span>
                            {" · "}
                            Denunciado: <span style={{ color: "#0d1b35", fontWeight: 600 }}>{r.usuario_reportado_nombre || `Usuario #${r.usuario_reportado}`}</span>
                          </p>
                          {r.descripcion && (
                            <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "0.78rem", lineHeight: 1.5, borderLeft: "2px solid #E8E4DC", paddingLeft: 10 }}>
                              {r.descripcion}
                            </p>
                          )}
                        </div>

                        <div style={{ borderTop: "1px solid #F1EDE5", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                          {r.estado !== "resuelto" && (
                            <div style={{ display: "flex", gap: 6 }}>
                              {r.estado === "pendiente" && (
                                <button
                                  onClick={() => handleCambiarEstadoReporte(r.id, "en_revision")}
                                  disabled={updatingReporte === r.id}
                                  style={{ flex: 1, padding: "7px 12px", borderRadius: 8, cursor: "pointer", border: "1px solid #fde68a", backgroundColor: "#FFFBF0", color: "#b45309", fontSize: "0.75rem", fontWeight: 600, opacity: updatingReporte === r.id ? 0.5 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                >
                                  {updatingReporte === r.id ? "Actualizando…" : "En revisión"}
                                </button>
                              )}
                              <button
                                onClick={() => handleCambiarEstadoReporte(r.id, "resuelto")}
                                disabled={updatingReporte === r.id}
                                style={{ flex: 1, padding: "7px 12px", borderRadius: 8, cursor: "pointer", border: "1px solid #bbf7d0", backgroundColor: "#F0FDF4", color: "#15803d", fontSize: "0.75rem", fontWeight: 600, opacity: updatingReporte === r.id ? 0.5 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                              >
                                {updatingReporte === r.id ? "Actualizando…" : "Marcar resuelto"}
                              </button>
                            </div>
                          )}
                          {r.estado === "resuelto" && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#15803d", fontSize: "0.75rem", fontWeight: 600 }}>
                              <CheckCircle style={{ width: 13, height: 13 }} /> Denuncia resuelta
                            </div>
                          )}
                          <button
                            onClick={() => setVerContenido({ reporte: r })}
                            style={{ padding: "7px 12px", borderRadius: 8, cursor: "pointer", border: "1px solid #bfdbfe", backgroundColor: "#EFF6FF", color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          >
                            <Eye style={{ width: 13, height: 13 }} />
                            Ver {r.publicacion_data ? "publicación reportada" : "perfil del denunciado"}
                          </button>
                          <button
                            onClick={() => setAccionUsuario({ reporteId: r.id, usuarioId: r.usuario_reportado, nombre: r.usuario_reportado_nombre || `Usuario #${r.usuario_reportado}` })}
                            style={{ padding: "7px 12px", borderRadius: 8, cursor: "pointer", border: "1px solid #fecaca", backgroundColor: "#FEF2F2", color: "#dc2626", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          >
                            <Shield style={{ width: 13, height: 13 }} />
                            Gestionar cuenta de {r.usuario_reportado_nombre || `Usuario #${r.usuario_reportado}`}
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </>
              );
            })()}
          </div>
        )}

        {!loadingData && tab === "cursos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
            {cursosParaValidar.length > 0 && (
              <div style={S.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BookOpen style={{ width: 12, height: 12, color: "#8C7B6B" }} />
                  </div>
                  <p style={{ ...S.label, margin: 0 }}>Inscripciones por validar</p>
                  <span style={{ marginLeft: "auto", ...statusStyle.pendiente, borderRadius: 20, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700 }}>
                    {cursosParaValidar.length}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cursosParaValidar.map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, backgroundColor: "#F6F5F0", borderRadius: 10, border: "1px solid #E8E4DC" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.curso_titulo}
                        </p>
                        <p style={{ margin: "2px 0 0", color: "#8C7B6B", fontSize: "0.72rem" }}>
                          {c.estudiante_nombre}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => handleValidarCurso(c.id, "aprobado")}
                          disabled={validandoCurso === c.id}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", backgroundColor: "#15803d", color: "white", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", opacity: validandoCurso === c.id ? 0.5 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleValidarCurso(c.id, "rechazado")}
                          disabled={validandoCurso === c.id}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #fecaca", backgroundColor: "white", color: "#dc2626", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", opacity: validandoCurso === c.id ? 0.5 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
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
              <EmptyState icon={BookOpen} text="No hay inscripciones pendientes de validar." sub="Para publicar nuevos cursos, ve a tu Perfil → Cursos." />
            )}
          </div>
        )}

        {!loadingData && tab === "solicitudes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <InfoBanner icon={AlertCircle} text="Los alumnos pueden solicitar actualizar sus niveles de competencia. Revisa y aprueba o rechaza cada solicitud." />
            <EmptyState icon={ClipboardCheck} text="No hay solicitudes de cambio de nivel pendientes." />
          </div>
        )}
      </div>

      <AnimatePresence>
        {verContenido && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "rgba(13,27,53,0.55)", backdropFilter: "blur(4px)" }}
            onClick={() => setVerContenido(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }}
              style={{ backgroundColor: "white", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", width: "100%", maxWidth: 480, overflow: "hidden" }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalNavStrip />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #F1EDE5" }}>
                <div>
                  <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Contenido reportado</p>
                  <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "0.72rem" }}>
                    Motivo: <span style={{ color: "#475569", fontWeight: 600 }}>{verContenido.reporte.motivo}</span>
                  </p>
                </div>
                <button onClick={() => setVerContenido(null)} style={{ backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
                  <X style={{ width: 14, height: 14, color: "#64748b" }} />
                </button>
              </div>

              <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
                {verContenido.reporte.publicacion_data ? (
                  <div>
                    <p style={{ ...S.label, marginBottom: 8 }}>Publicación</p>
                    <div style={{ backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 12, overflow: "hidden" }}>
                      {verContenido.reporte.publicacion_data.imagen_url && (
                        <img src={verContenido.reporte.publicacion_data.imagen_url} style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />
                      )}
                      <div style={{ padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#0d1b35", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#D4AF37", fontSize: "0.75rem", fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                              {verContenido.reporte.publicacion_data.autor_nombre.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.78rem", fontWeight: 700 }}>
                              {verContenido.reporte.publicacion_data.autor_nombre}
                            </p>
                            {verContenido.reporte.publicacion_data.fecha && (
                              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.68rem" }}>
                                {new Date(verContenido.reporte.publicacion_data.fecha).toLocaleDateString("es-CL")}
                              </p>
                            )}
                          </div>
                        </div>
                        <p style={{ margin: 0, color: "#334155", fontSize: "0.85rem", lineHeight: 1.6 }}>
                          {verContenido.reporte.publicacion_data.contenido}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 12, padding: 20, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#D4AF37", fontSize: "1.2rem", fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                        {(verContenido.reporte.usuario_reportado_nombre || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700 }}>
                        {verContenido.reporte.usuario_reportado_nombre}
                      </p>
                      <p style={{ margin: "3px 0 8px", color: "#8C7B6B", fontSize: "0.75rem" }}>
                        Este reporte es sobre el perfil del usuario
                      </p>
                      <button
                        onClick={() => { openPerfil(verContenido.reporte.usuario_reportado, "estudiante"); setVerContenido(null); }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "none", backgroundColor: "#0d1b35", color: "white", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        <Eye style={{ width: 13, height: 13 }} /> Ver perfil completo
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #fecaca", borderRadius: 10, padding: 14 }}>
                  <p style={{ margin: "0 0 5px", color: "#dc2626", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Descripción del denunciante
                  </p>
                  <p style={{ margin: 0, color: "#334155", fontSize: "0.85rem", lineHeight: 1.55 }}>
                    {verContenido.reporte.descripcion || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Sin descripción adicional.</span>}
                  </p>
                  <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: "0.72rem" }}>
                    Reportado por: <span style={{ color: "#475569", fontWeight: 600 }}>{verContenido.reporte.reportado_por_nombre}</span>
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setAccionUsuario({ reporteId: verContenido.reporte.id, usuarioId: verContenido.reporte.usuario_reportado, nombre: verContenido.reporte.usuario_reportado_nombre }); setVerContenido(null); }}
                    style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "1px solid #fecaca", backgroundColor: "#FEF2F2", color: "#dc2626", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    <Shield style={{ width: 13, height: 13 }} /> Gestionar cuenta
                  </button>
                  {verContenido.reporte.estado !== "resuelto" && (
                    <button
                      onClick={async () => { await handleCambiarEstadoReporte(verContenido.reporte.id, "resuelto"); setVerContenido(null); }}
                      style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "1px solid #bbf7d0", backgroundColor: "#F0FDF4", color: "#15803d", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      <CheckCircle style={{ width: 13, height: 13 }} /> Marcar resuelto
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
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "rgba(13,27,53,0.55)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }}
              style={{ backgroundColor: "white", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", width: "100%", maxWidth: 360, overflow: "hidden" }}
            >
              <ModalNavStrip />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #F1EDE5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#FEF2F2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Shield style={{ width: 15, height: 15, color: "#dc2626" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.875rem", fontWeight: 700 }}>Gestionar cuenta</p>
                    <p style={{ margin: "1px 0 0", color: "#8C7B6B", fontSize: "0.72rem" }}>{accionUsuario.nombre}</p>
                  </div>
                </div>
                <button onClick={() => setAccionUsuario(null)} style={{ backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
                  <X style={{ width: 14, height: 14, color: "#64748b" }} />
                </button>
              </div>

              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {mensajeAccion ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <CheckCircle style={{ width: 22, height: 22, color: "#D4AF37" }} />
                    </div>
                    <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{mensajeAccion}</p>
                  </div>
                ) : (
                  <>
                    <div style={{ backgroundColor: "#FFFBF0", border: "1px solid #fde68a", borderRadius: 12, padding: 14 }}>
                      <p style={{ margin: "0 0 4px", color: "#0d1b35", fontSize: "0.85rem", fontWeight: 700 }}>Suspensión temporal</p>
                      <p style={{ margin: "0 0 10px", color: "#8C7B6B", fontSize: "0.75rem" }}>
                        El usuario no podrá iniciar sesión durante el período seleccionado.
                      </p>
                      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                        {[7, 14, 30, 90].map((d) => (
                          <button key={d} onClick={() => setDiasSuspension(d)} style={{
                            flex: 1, padding: "6px 0", borderRadius: 8, cursor: "pointer",
                            border: diasSuspension === d ? "1.5px solid #f59e0b" : "1px solid #fde68a",
                            backgroundColor: diasSuspension === d ? "#f59e0b" : "white",
                            color: diasSuspension === d ? "white" : "#b45309",
                            fontSize: "0.72rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}>
                            {d}d
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleAccionUsuario("suspender")}
                        disabled={ejecutandoAccion}
                        style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", backgroundColor: "#f59e0b", color: "white", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", opacity: ejecutandoAccion ? 0.55 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {ejecutandoAccion ? "Aplicando…" : `Suspender ${diasSuspension} días`}
                      </button>
                    </div>

                    <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #fecaca", borderRadius: 12, padding: 14 }}>
                      <p style={{ margin: "0 0 4px", color: "#0d1b35", fontSize: "0.85rem", fontWeight: 700 }}>Bloqueo permanente</p>
                      <p style={{ margin: "0 0 10px", color: "#8C7B6B", fontSize: "0.75rem" }}>
                        La cuenta queda desactivada indefinidamente. Se puede reactivar más tarde.
                      </p>
                      <button
                        onClick={() => handleAccionUsuario("bloquear")}
                        disabled={ejecutandoAccion}
                        style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", backgroundColor: "#dc2626", color: "white", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", opacity: ejecutandoAccion ? 0.55 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
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
            onSealed={() => { setEvalStudent(null); loadData(); }}
            onRejected={() => { setEvalStudent(null); loadData(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
