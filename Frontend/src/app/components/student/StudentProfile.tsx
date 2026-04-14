import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle, Award, ChevronLeft, ChevronRight,
  Shield, Wrench, Zap, Users, Clock, Pencil, Save, X,
  PlusCircle, AlertCircle, Medal, Star, BookOpen, TrendingUp,
  QrCode, Share2,
} from "lucide-react";
import { apiRequest } from "../../../api/client";

type Level = "Alto" | "Medio" | "Bajo";

interface PerfilEstudiante {
  id: number;
  usuario: { id: number; first_name: string; last_name: string; email: string };
  especialidad: string;
  grado: string;
  video_pitch: string | null;
}

interface Habilidad {
  id: number;
  nombre: string;
  nivel: string;
  estado: string;
  estudiante: number;
}

interface Evidencia {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  fecha_subida: string;
}

interface Disponibilidad {
  id: number;
  disponibilidad: string;
}

const availabilityLabels: Record<string, string> = {
  part_time: "Part-time",
  full_time: "Full-time",
  fines_de_semana: "Fines de semana",
  practicas: "Prácticas",
};

function LevelBadge({ level }: { level: string }) {
  const cfg: Record<string, string> = {
    Alto: "bg-green-50 text-green-700 border-green-200",
    Medio: "bg-amber-50 text-amber-700 border-amber-200",
    Bajo: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs border ${cfg[level] ?? "bg-slate-100 text-slate-600 border-slate-200"}`} style={{ fontWeight: 600 }}>
      {level}
    </span>
  );
}

function SkillBar({ percent, level }: { percent: number; level: string }) {
  const c: Record<string, string> = { Alto: "#10b981", Medio: "#f59e0b", Bajo: "#ef4444" };
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: c[level] ?? "#94a3b8" }}
      />
    </div>
  );
}

function QRPanel({ onClose, profileId, name }: { onClose: () => void; profileId: number; name: string }) {
  const profileUrl = `${window.location.origin}/perfil/estudiante/${profileId}`;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs text-center">
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Compartir perfil</p>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center p-4 bg-white border-2 border-slate-100 rounded-xl mb-4 mx-auto w-fit">
          <QRCodeSVG value={profileUrl} size={160} bgColor="#ffffff" fgColor="#0F172A" level="M" />
        </div>
        <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{name}</p>
        <p className="text-slate-500 text-xs mt-0.5">Liceo Cardenal Caro</p>
        <button
          onClick={() => navigator.clipboard.writeText(profileUrl)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-colors" style={{ fontWeight: 500 }}>
          <Share2 className="w-4 h-4" /> Copiar enlace
        </button>
      </motion.div>
    </motion.div>
  );
}

export function StudentProfile() {
  const [tab, setTab] = useState<"perfil" | "habilidades" | "crecimiento">("perfil");
  const [imgIdx, setImgIdx] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Data del backend
  const [perfil, setPerfil] = useState<PerfilEstudiante | null>(null);
  const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario nueva habilidad
  const [newSkill, setNewSkill] = useState({ nombre: "", nivel: "Bajo" });
  const [addingSkill, setAddingSkill] = useState(false);
  const [savingSkill, setSavingSkill] = useState(false);

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return;
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const perfilRes = await apiRequest(`/api/perfil/estudiante/${userId}/`);
      if (perfilRes.ok) {
        const data = await perfilRes.json();
        setPerfil(data);
        // Cargar habilidades y evidencias del perfil
        const [habRes, evidRes] = await Promise.all([
          apiRequest(`/api/habilidades/`),
          apiRequest(`/api/evidencias/estudiante/${data.id}/`),
        ]);
        if (habRes.ok) {
          const habData = await habRes.json();
          setHabilidades(habData.filter((h: Habilidad) => h.estudiante === data.id));
        }
        if (evidRes.ok) setEvidencias(await evidRes.json());
        if (data.disponibilidad) setDisponibilidades(data.disponibilidad);
      }
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    // En la versión actual el backend no expone campos editables desde el frontend
    setEditMode(false);
  };

  const handleAddSkill = async () => {
    if (!newSkill.nombre || !perfil) return;
    setSavingSkill(true);
    try {
      const res = await apiRequest("/api/habilidades/", {
        method: "POST",
        body: JSON.stringify({ nombre: newSkill.nombre, nivel: newSkill.nivel, estudiante: perfil.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setHabilidades((p) => [...p, data]);
        setNewSkill({ nombre: "", nivel: "Bajo" });
        setAddingSkill(false);
      }
    } catch {}
    setSavingSkill(false);
  };

  const fullName = perfil ? `${perfil.usuario.first_name} ${perfil.usuario.last_name}` : "Estudiante";
  const tabs = [
    { id: "perfil", label: "Perfil" },
    { id: "habilidades", label: "Competencias" },
    { id: "crecimiento", label: "Crecimiento" },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Cargando perfil...</p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <p className="text-slate-400 text-sm">No se encontró el perfil de estudiante.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-0">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4 text-xs"
            style={{ backgroundColor: "#FFFBF0", border: "1px solid #D4AF37", color: "#B8962E", fontWeight: 700 }}>
            <CheckCircle className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
            Perfil Institucional · Liceo Cardenal Caro
          </div>

          <div className="flex items-start gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-xl bg-slate-200 border border-slate-200 flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white" style={{ backgroundColor: "#D4AF37" }}>
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-slate-900" style={{ fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.2 }}>{fullName}</h1>
              <p className="text-slate-600 text-sm mt-0.5" style={{ fontWeight: 500 }}>{perfil.especialidad}</p>
              <p className="text-slate-500 text-xs mt-0.5">{perfil.grado} · Liceo Cardenal Caro</p>
              {disponibilidades.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {disponibilidades.map((d) => (
                    <span key={d.id} className="inline-flex items-center gap-1 bg-slate-100 rounded-full px-2.5 py-1 text-xs text-slate-600">
                      <Clock className="w-3 h-3" /> {availabilityLabels[d.disponibilidad] ?? d.disponibilidad}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={() => { if (editMode) handleSave(); else setEditMode(true); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all border ${editMode ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                style={{ fontWeight: 600 }}>
                {editMode ? <><Save className="w-3.5 h-3.5" /> Guardar</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
              </button>
              <button onClick={() => setShowQR(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all"
                style={{ fontWeight: 600 }}>
                <QrCode className="w-3.5 h-3.5" /> QR
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 -mx-4 px-4">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-sm transition-all border-b-2 -mb-px ${tab === t.id ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                style={{ fontWeight: tab === t.id ? 700 : 500 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* ── PERFIL ── */}
        {tab === "perfil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 mb-2" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Información</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><span style={{ fontWeight: 600 }}>Especialidad:</span> {perfil.especialidad}</p>
                <p><span style={{ fontWeight: 600 }}>Grado:</span> {perfil.grado}</p>
                <p><span style={{ fontWeight: 600 }}>Email:</span> {perfil.usuario.email}</p>
                {perfil.video_pitch && (
                  <p><span style={{ fontWeight: 600 }}>Video pitch:</span>{" "}
                    <a href={perfil.video_pitch} target="_blank" rel="noreferrer" className="text-blue-600 underline">Ver video</a>
                  </p>
                )}
              </div>
            </div>

            {/* Evidencias */}
            {evidencias.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Galería de Evidencias</h3>
                </div>
                <div className="relative mx-4 mb-3 rounded-lg overflow-hidden aspect-video bg-slate-100">
                  <img
                    src={evidencias[imgIdx]?.imagen}
                    alt={evidencias[imgIdx]?.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm" style={{ fontWeight: 600 }}>{evidencias[imgIdx]?.titulo}</p>
                    <p className="text-white/80 text-xs">{evidencias[imgIdx]?.descripcion}</p>
                  </div>
                  {evidencias.length > 1 && (
                    <>
                      <button onClick={() => setImgIdx((p) => p === 0 ? evidencias.length - 1 : p - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center shadow">
                        <ChevronLeft className="w-4 h-4 text-slate-700" />
                      </button>
                      <button onClick={() => setImgIdx((p) => p === evidencias.length - 1 ? 0 : p + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center shadow">
                        <ChevronRight className="w-4 h-4 text-slate-700" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {evidencias.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                <p className="text-slate-400 text-sm">No hay evidencias publicadas aún.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── HABILIDADES ── */}
        {tab === "habilidades" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <Shield className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <p className="text-slate-600 text-xs">Niveles certificados por docentes del Liceo.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-500" />
                  <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Habilidades</h3>
                </div>
              </div>

              {habilidades.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No has registrado habilidades aún.</p>
              ) : (
                <div className="space-y-4">
                  {habilidades.map((h) => (
                    <div key={h.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-slate-300" />
                          <span className="text-slate-700 text-sm">{h.nombre}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${h.estado === "Aprobado" ? "bg-green-50 text-green-700" : h.estado === "Rechazado" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`} style={{ fontWeight: 600 }}>
                            {h.estado}
                          </span>
                        </div>
                        <LevelBadge level={h.nivel} />
                      </div>
                      <SkillBar percent={h.nivel === "Alto" ? 90 : h.nivel === "Medio" ? 60 : 30} level={h.nivel} />
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar habilidad */}
              {editMode && (
                <div className="mt-4">
                  {addingSkill ? (
                    <div className="space-y-2 border border-slate-200 rounded-xl p-3">
                      <input
                        value={newSkill.nombre}
                        onChange={(e) => setNewSkill((p) => ({ ...p, nombre: e.target.value }))}
                        placeholder="Nombre de la habilidad"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <select
                        value={newSkill.nivel}
                        onChange={(e) => setNewSkill((p) => ({ ...p, nivel: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                      >
                        <option value="Bajo">Bajo</option>
                        <option value="Medio">Medio</option>
                        <option value="Alto">Alto</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={handleAddSkill} disabled={savingSkill}
                          className="flex-1 py-2 rounded-lg bg-slate-900 text-white text-xs hover:bg-slate-700 disabled:opacity-50 transition-colors" style={{ fontWeight: 600 }}>
                          {savingSkill ? "Guardando..." : "Agregar"}
                        </button>
                        <button onClick={() => setAddingSkill(false)}
                          className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 transition-colors" style={{ fontWeight: 500 }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingSkill(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-slate-300 hover:text-slate-600 text-sm transition-all">
                      <PlusCircle className="w-4 h-4" /> Agregar habilidad
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── CRECIMIENTO ── */}
        {tab === "crecimiento" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Progreso</h3>
              </div>
              <div className="flex items-end gap-5">
                <div>
                  <p className="text-slate-900" style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, color: "#D4AF37" }}>
                    {habilidades.filter((h) => h.estado === "Aprobado").length}
                  </p>
                  <p className="text-slate-500 text-xs">Habilidades aprobadas</p>
                </div>
                <div className="flex-1 pb-1">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, habilidades.filter((h) => h.estado === "Aprobado").length * 20)}%` }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#D4AF37" }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5">Completa más habilidades para avanzar</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Medal className="w-4 h-4 text-slate-500" />
                <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Resumen de habilidades</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {["Aprobado", "Pendiente", "Rechazado"].map((estado) => {
                  const count = habilidades.filter((h) => h.estado === estado).length;
                  const color = estado === "Aprobado" ? "text-green-600" : estado === "Rechazado" ? "text-red-600" : "text-amber-600";
                  return (
                    <div key={estado} className="bg-slate-50 rounded-xl p-3">
                      <p className={`text-2xl ${color}`} style={{ fontWeight: 800 }}>{count}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{estado}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {showQR && <QRPanel onClose={() => setShowQR(false)} profileId={perfil.id} name={fullName} />}
    </div>
  );
}