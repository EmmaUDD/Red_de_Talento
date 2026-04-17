import { motion } from "motion/react";
import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle, Award, Play,
  Shield, Wrench, Zap, Users, Clock, Pencil, Save, X,
  PlusCircle, AlertCircle, Medal, Star, BookOpen, TrendingUp,
  ExternalLink, MessageSquare, QrCode, Share2, Camera,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  habilidadesApi,
  insigniasApi,
  cursosApi,
  disponibilidadApi,
  qrApi,
  perfilApi,
  evidenciasApi,
  postulacionesApi,
} from "@/api/api";
import { AnimatePresence } from "motion/react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
import type { Habilidad, Insignia, Curso, SkillLevel } from "@/app/types";

function LevelBadge({ level }: { level: SkillLevel }) {
  const cfg: Record<SkillLevel, string> = {
    Alto: "bg-green-50 text-green-700 border-green-200",
    Medio: "bg-amber-50 text-amber-700 border-amber-200",
    Bajo: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg[level]}`}>
      {level}
    </span>
  );
}

function SkillBar({ percent, level }: { percent: number; level: SkillLevel }) {
  const c: Record<SkillLevel, string> = { Alto: "#10b981", Medio: "#f59e0b", Bajo: "#ef4444" };
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: c[level] }}
      />
    </div>
  );
}

function QRPanel({ profileUrl, nombre, especialidad, onClose }: {
  profileUrl: string;
  nombre: string;
  especialidad: string;
  onClose: () => void;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl).catch(() => {});
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs text-center"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-900 text-sm font-bold">Compartir perfil</p>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center p-4 bg-white border-2 border-slate-100 rounded-xl mb-4 mx-auto w-fit">
          <QRCodeSVG value={profileUrl} size={160} bgColor="#ffffff" fgColor="#0F172A" level="M" />
        </div>
        <p className="text-slate-900 text-sm font-semibold">{nombre}</p>
        <p className="text-slate-500 text-xs mt-0.5">{especialidad} · Liceo Cardenal Caro</p>
        <div className="flex items-center gap-1.5 justify-center mt-2 px-3 py-1.5 rounded-lg border border-slate-200 mx-auto w-fit">
          <CheckCircle className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
          <span className="text-xs font-semibold" style={{ color: "#B8962E" }}>Perfil validado institucionalmente</span>
        </div>
        <p className="text-slate-400 text-xs mt-4 leading-relaxed">
          Escanea el código QR para ver el perfil completo con evidencias y competencias validadas.
        </p>
        <button
          onClick={handleCopy}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Copiar enlace
        </button>
      </motion.div>
    </motion.div>
  );
}

function nivelAPorcentaje(nivel: SkillLevel): number {
  return nivel === "Alto" ? 88 : nivel === "Medio" ? 60 : 35;
}

export function StudentProfile() {
  const { user, refreshUser } = useAuth();

  const [tab, setTab] = useState<"perfil" | "habilidades" | "crecimiento">("perfil");
  const [editMode, setEditMode] = useState(false);
  const [showQR, setShowQR] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [empleoConseguido, setEmpleoConseguido] = useState<any | null>(null);

  const [bio, setBio] = useState("");
  const [videoPitch, setVideoPitch] = useState("");
  const [disponibilidad, setDisponibilidad] = useState("");
  const [savingPerfil, setSavingPerfil] = useState(false);

  const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
  const [insignias, setInsignias] = useState<Insignia[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [misCursos, setMisCursos] = useState<any[]>([]);
  const [evidencias, setEvidencias] = useState<{ id: number; titulo: string; descripcion: string; imagen: string; fecha_subida: string }[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [showAddEvidencia, setShowAddEvidencia] = useState(false);
  const [selectedEv, setSelectedEv] = useState<{ id: number; titulo: string; descripcion: string; imagen: string; fecha_subida: string } | null>(null);
  const [evTitulo, setEvTitulo] = useState("");
  const [evDescripcion, setEvDescripcion] = useState("");
  const [evImagen, setEvImagen] = useState<File | null>(null);
  const [addingEv, setAddingEv] = useState(false);

  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillNombre, setNewSkillNombre] = useState("");
  const [newSkillTipo, setNewSkillTipo] = useState<"tecnica" | "blanda">("tecnica");
  const [addingSkill, setAddingSkill] = useState(false);

  const handleAddSkill = async () => {
    if (!newSkillNombre.trim()) return;
    setAddingSkill(true);
    try {
      await habilidadesApi.crear(newSkillNombre.trim(), newSkillTipo);
      setNewSkillNombre("");
      setNewSkillTipo("tecnica");
      setShowAddSkill(false);
      await loadData();
    } catch {
      // silently fail
    } finally {
      setAddingSkill(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const me = await import("@/api/api").then(m => m.authApi.getMe());
      const profileId = (me as { profile_id?: number }).profile_id;
      const [habs, insigs, curs, misCurs, disp, evs, misPostulaciones] = await Promise.all([
        habilidadesApi.getMias(),
        insigniasApi.getMias(),
        cursosApi.getRecomendados(),
        cursosApi.getMisCursos().catch(() => []),
        disponibilidadApi.get(),
        profileId ? evidenciasApi.getMias(profileId) : Promise.resolve([]),
        postulacionesApi.getMias().catch(() => []),
      ]);
      setHabilidades(habs);
      setInsignias(insigs);
      setCursos(curs);
      setMisCursos(misCurs);
      setDisponibilidad(Array.isArray(disp) && disp.length > 0 ? disp[0].disponibilidad : "");
      setEvidencias(evs);
      const celebradas = JSON.parse(localStorage.getItem("postulaciones_celebradas") ?? "[]") as number[];
      const aceptada = misPostulaciones.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.estado?.toLowerCase() === "contratado" && !celebradas.includes(p.id)
      );
      if (aceptada) setEmpleoConseguido(aceptada);
    } catch {
      // datos vacíos si falla
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (user) {
      setBio(user.bio ?? "");
      setVideoPitch(user.video_pitch ?? "");
    }
  }, [user]);

  const handleSave = async () => {
    setSavingPerfil(true);
    try {
      const fd = new FormData();
      fd.append("bio", bio);
      fd.append("video_pitch", videoPitch);
      await perfilApi.updatePerfil(fd);
      await disponibilidadApi.set(disponibilidad);
      await refreshUser();
      setEditMode(false);
    } catch {
      // silently fail
    } finally {
      setSavingPerfil(false);
    }
  };

  const handleSolicitarCambio = async (hab: Habilidad) => {
    const nivelSiguiente: SkillLevel =
      hab.nivel === "Bajo" ? "Medio" : hab.nivel === "Medio" ? "Alto" : "Bajo";
    try {
      await habilidadesApi.solicitarCambio(hab.id, nivelSiguiente);
      setPendingIds((prev) => new Set(prev).add(hab.id));
    } catch {
      // silently fail
    }
  };

  const handleAddEvidencia = async () => {
    if (!evTitulo.trim() || !evImagen) return;
    setAddingEv(true);
    try {
      await evidenciasApi.crear(evTitulo.trim(), evDescripcion.trim(), evImagen);
      setEvTitulo(""); setEvDescripcion(""); setEvImagen(null);
      setShowAddEvidencia(false);
      await loadData();
    } catch {
      // silently fail
    } finally {
      setAddingEv(false);
    }
  };

  const handleInscribirse = async (cursoId: number) => {
    try {
      await cursosApi.inscribirse(cursoId);
      setCursos((prev) =>
        prev.map((c) => (c.id === cursoId ? { ...c, inscrito: true, progreso: 0 } : c))
      );
    } catch {
      // silently fail
    }
  };

  const nombre = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.username
    : "—";
  const especialidad = user?.especialidad ?? "Técnico";
  const curso = user?.curso ?? "";
  const profileUrl = user ? qrApi.getUrlPerfil(user.id) : window.location.href;

  const techSkills = habilidades.filter((h) => h.tipo === "tecnica");
  const softSkills = habilidades.filter((h) => h.tipo === "blanda");

  const tabs = [
    { id: "perfil", label: "Perfil" },
    { id: "habilidades", label: "Competencias" },
    { id: "crecimiento", label: "Crecimiento" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-0">
          {user?.validado && (
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4 text-xs font-bold"
              style={{ backgroundColor: "#FFFBF0", border: "1px solid #D4AF37", color: "#B8962E" }}
            >
              <CheckCircle className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
              Perfil Validado Institucionalmente · Liceo Cardenal Caro
            </div>
          )}

          <div className="flex items-start gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <label className="cursor-pointer group block">
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const updated = await perfilApi.uploadFoto(file);
                  await refreshUser();
                  if (updated.foto_perfil) {
                    const img = document.querySelector<HTMLImageElement>("#avatar-img");
                    if (img) img.src = updated.foto_perfil.startsWith("http") ? updated.foto_perfil : `${BASE_URL}${updated.foto_perfil}`;
                  }
                }} />
                {user?.foto_perfil ? (
                  <img id="avatar-img"
                    src={user.foto_perfil.startsWith("http") ? user.foto_perfil : `${BASE_URL}${user.foto_perfil}`}
                    alt="avatar"
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-200 flex items-center justify-center border border-slate-200">
                    <span className="text-slate-500 text-2xl font-bold">
                      {nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </label>
              {user?.validado && (
                <div
                  className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-10"
                  style={{ backgroundColor: "#D4AF37" }}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-slate-900 font-bold truncate" style={{ fontSize: "1.2rem", lineHeight: 1.2 }}>
                {nombre}
              </h1>
              <p className="text-slate-600 text-sm font-medium mt-0.5">{especialidad}</p>
              {curso && <p className="text-slate-500 text-xs mt-0.5">{curso} · Liceo Cardenal Caro · Lo Espejo</p>}

              {editMode ? (
                <select
                  value={disponibilidad}
                  onChange={(e) => setDisponibilidad(e.target.value)}
                  className="mt-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="">Sin especificar</option>
                  <option value="part_time">Part-time</option>
                  <option value="full_time">Full-time</option>
                  <option value="fines_de_semana">Fines de semana</option>
                  <option value="practicas">Práctica laboral</option>
                </select>
              ) : disponibilidad ? (
                <span className="mt-2 inline-flex items-center gap-1 bg-slate-100 rounded-full px-2.5 py-1 text-xs text-slate-600">
                  <Clock className="w-3 h-3" /> {{
                    part_time: "Part-time",
                    full_time: "Full-time",
                    fines_de_semana: "Fines de semana",
                    practicas: "Práctica laboral",
                  }[disponibilidad] ?? disponibilidad}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={savingPerfil}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border bg-slate-900 text-white border-slate-900 disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingPerfil ? "Guardando…" : "Guardar"}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all bg-slate-900 hover:bg-slate-700 text-white shadow-sm"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => setShowQR(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" /> QR
                  </button>
                </>
              )}
            </div>
          </div>

          {insignias.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-3">
              {insignias.map((b) => (
                <span
                  key={b.id}
                  className="flex-shrink-0 text-xs font-semibold rounded-full px-3 py-1.5 border"
                  style={{ borderColor: "#D4AF37", color: "#B8962E", backgroundColor: "#FFFBF0" }}
                >
                  {b.icono} {b.nombre}
                </span>
              ))}
            </div>
          )}

          <div className="flex border-b border-slate-200 -mx-4 px-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-sm transition-all border-b-2 -mb-px ${
                  tab === t.id
                    ? "border-slate-900 text-slate-900 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-700 font-medium"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {editMode && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3"
          >
            <Pencil className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-blue-700 text-xs font-semibold">Modo edición activo</p>
              <p className="text-blue-600 text-xs">Los cambios en competencias requieren validación de un docente.</p>
            </div>
            <button onClick={() => setEditMode(false)} className="text-blue-400 hover:text-blue-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {loadingData && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          </div>
        )}

        {!loadingData && tab === "perfil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 font-semibold mb-3" style={{ fontSize: "0.875rem" }}>Sobre mí</h3>
              {editMode ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Cuéntanos sobre ti, tus intereses y experiencia…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              ) : (
                <p className="text-slate-600 text-sm leading-relaxed">
                  {bio || <span className="text-slate-400 italic">Aún no has agregado una descripción.</span>}
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.875rem" }}>Contacto</h3>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Shield className="w-3 h-3" /> Datos protegidos
                </span>
              </div>
              <p className="text-slate-600 text-sm">{user?.email ?? "—"}</p>
              <p className="text-slate-400 text-xs mt-1">Solo visible para empresas verificadas con tu autorización</p>
              <button className="mt-3 w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Contactar
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-slate-600" />
                <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.875rem" }}>Video-Pitch (30 seg)</h3>
              </div>
              {editMode ? (
                <div className="px-5 pb-5">
                  <input
                    type="url"
                    value={videoPitch}
                    onChange={(e) => setVideoPitch(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                  <p className="text-slate-400 text-xs mt-1.5">Pega el enlace de tu video en YouTube, Vimeo u otra plataforma.</p>
                </div>
              ) : videoPitch ? (
                <div className="px-5 pb-5">
                  {(() => {
                    const ytMatch = videoPitch.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                    const videoId = ytMatch?.[1];
                    return videoId ? (
                      <a href={videoPitch} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-slate-200 relative group">
                        <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt="miniatura video" className="w-full object-cover aspect-video" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-5 h-5 text-slate-900 ml-0.5" />
                          </div>
                        </div>
                      </a>
                    ) : (
                      <a href={videoPitch} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                        <Play className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{videoPitch}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-auto" />
                      </a>
                    );
                  })()}
                </div>
              ) : (
                <div className="mx-4 mb-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 aspect-video flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Play className="w-8 h-8 text-slate-300" />
                  <p className="text-xs">Sin video-pitch. Activa edición para agregar un enlace.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.875rem" }}>Galería de Evidencias</h3>
                {editMode && (
                  <button onClick={() => setShowAddEvidencia(true)}
                    className="flex items-center gap-1 text-slate-600 text-xs font-medium border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                    <PlusCircle className="w-3.5 h-3.5" /> Agregar
                  </button>
                )}
              </div>
              {evidencias.length === 0 ? (
                <div className="mx-4 mb-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 py-10 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <PlusCircle className="w-8 h-8 text-slate-300" />
                  <p className="text-xs text-center leading-relaxed">
                    Aún no hay evidencias.<br />Activa edición para agregar fotos de proyectos o trabajos.
                  </p>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide">
                  {evidencias.map((ev) => (
                    <button key={ev.id} onClick={() => setSelectedEv(ev)}
                      className="flex-shrink-0 w-44 rounded-xl overflow-hidden border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all text-left group">
                      <div className="relative aspect-video overflow-hidden">
                        <img src={ev.imagen} alt={ev.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-slate-800 text-xs font-semibold leading-tight line-clamp-2">{ev.titulo}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {!loadingData && tab === "habilidades" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <Shield className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <p className="text-slate-600 text-xs">Niveles certificados por docentes. Información protegida con acceso autorizado.</p>
            </div>

            {pendingIds.size > 0 && (
              <div className="flex items-center gap-3 border rounded-xl p-3" style={{ backgroundColor: "#FFFBF0", borderColor: "#D4AF37" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#D4AF37" }} />
                <p className="text-xs" style={{ color: "#B8962E" }}>Tienes solicitudes pendientes de revisión por un docente.</p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-500" />
                  <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.875rem" }}>Habilidades Técnicas</h3>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "#FFFBF0", color: "#B8962E", border: "1px solid #D4AF37" }}
                >
                  Certificadas
                </span>
              </div>
              {techSkills.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Aún no tienes habilidades técnicas registradas.</p>
              ) : (
                <div className="space-y-4">
                  {techSkills.map((skill) => {
                    const isPending = !skill.validado || pendingIds.has(skill.id);
                    const pct = skill.porcentaje ?? nivelAPorcentaje(skill.nivel);
                    return (
                      <div key={skill.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-slate-300" />
                            <span className="text-slate-700 text-sm">{skill.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPending ? (
                              <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Pendiente
                              </span>
                            ) : (
                              <>
                                <LevelBadge level={skill.nivel} />
                                {editMode && (
                                  <button
                                    onClick={() => handleSolicitarCambio(skill)}
                                    className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2"
                                  >
                                    Solicitar cambio
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <SkillBar percent={isPending ? 0 : pct} level={skill.nivel} />
                      </div>
                    );
                  })}
                </div>
              )}
              {editMode && (
                <button
                  onClick={() => { setNewSkillTipo("tecnica"); setShowAddSkill(true); }}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-slate-300 hover:text-slate-600 text-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Proponer nueva habilidad técnica
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.875rem" }}>Habilidades Blandas</h3>
                </div>
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                  Evaluadas
                </span>
              </div>
              {softSkills.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Aún no tienes habilidades blandas registradas.</p>
              ) : (
                <div className="space-y-4">
                  {softSkills.map((skill) => {
                    const isPending = !skill.validado || pendingIds.has(skill.id);
                    const pct = skill.porcentaje ?? nivelAPorcentaje(skill.nivel);
                    return (
                      <div key={skill.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-slate-700 text-sm">{skill.nombre}</span>
                          {isPending ? (
                            <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pendiente
                            </span>
                          ) : (
                            <LevelBadge level={skill.nivel} />
                          )}
                        </div>
                        <SkillBar percent={isPending ? 0 : pct} level={skill.nivel} />
                      </div>
                    );
                  })}
                </div>
              )}
              {editMode && (
                <button
                  onClick={() => { setNewSkillTipo("blanda"); setShowAddSkill(true); }}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-slate-300 hover:text-slate-600 text-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Proponer nueva habilidad blanda
                </button>
              )}
            </div>

            <div
              className="rounded-xl p-5 flex items-center gap-4"
              style={{ backgroundColor: "#FFFBF0", border: "2px solid #D4AF37" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#D4AF37" }}
              >
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-slate-900 font-bold" style={{ fontSize: "0.9rem" }}>Sello Institucional Liceo Cardenal Caro</p>
                <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                  Competencias verificadas en taller por personal docente calificado.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!loadingData && tab === "crecimiento" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Medal className="w-4 h-4 text-slate-500" />
                <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.875rem" }}>Insignias Ganadas</h3>
              </div>
              {insignias.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-slate-400">
                  <Star className="w-10 h-10 text-slate-200" />
                  <p className="text-sm">Completa acciones para ganar insignias</p>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {insignias.map((b) => (
                    <div
                      key={b.id}
                      className="flex-shrink-0 border rounded-xl p-4 text-center min-w-[100px]"
                      style={{ borderColor: "#D4AF37", backgroundColor: "#FFFBF0" }}
                    >
                      <span style={{ fontSize: "1.75rem" }}>{b.icono}</span>
                      <p className="text-slate-700 text-xs font-semibold mt-2" style={{ lineHeight: 1.3 }}>{b.nombre}</p>
                      <p className="text-slate-400 text-xs mt-1">
                        {new Date(b.fecha_obtencion).toLocaleDateString("es-CL", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  ))}
                  <div className="flex-shrink-0 border-2 border-dashed border-slate-200 rounded-xl p-4 text-center min-w-[100px] flex flex-col items-center justify-center">
                    <Star className="w-7 h-7 text-slate-200 mb-1" />
                    <p className="text-slate-400 text-xs">Próxima</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.875rem" }}>Progreso General</h3>
              </div>
              {(() => {
                const validated = habilidades.filter((h) => h.validado).length;
                const total = habilidades.length || 1;
                const pct = Math.round((validated / total) * 100);
                return (
                  <div className="flex items-end gap-5">
                    <div>
                      <p className="font-extrabold" style={{ fontSize: "2.5rem", lineHeight: 1, color: "#D4AF37" }}>
                        {pct}%
                      </p>
                      <p className="text-slate-500 text-xs">Habilidades validadas</p>
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: "#D4AF37" }}
                        />
                      </div>
                      <p className="text-slate-400 text-xs mt-1.5">
                        {validated} de {total} habilidades validadas por docentes
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {misCursos.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.875rem" }}>Cursos Realizados</h3>
                </div>
                {misCursos.map((mc) => {
                  const estadoBadge =
                    mc.estado === "aprobado"
                      ? { label: "Completado", cls: "bg-green-50 text-green-700 border-green-200" }
                      : mc.estado === "rechazado"
                      ? { label: "Rechazado", cls: "bg-red-50 text-red-600 border-red-200" }
                      : { label: "Por Validar", cls: "bg-amber-50 text-amber-700 border-amber-200" };
                  return (
                    <div key={mc.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-base">
                        {mc.curso?.plataforma === "youtube" ? "▶️" : "🎓"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 text-sm font-semibold truncate">{mc.curso?.titulo}</p>
                        {mc.curso?.especialidad && (
                          <p className="text-slate-400 text-xs mt-0.5">{mc.curso.especialidad}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${estadoBadge.cls}`}>
                        {estadoBadge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <h3 className="text-slate-900 font-semibold" style={{ fontSize: "0.875rem" }}>Cursos Recomendados</h3>
              </div>
              {cursos.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
                  No hay cursos disponibles en este momento.
                </div>
              ) : (
                cursos.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <span style={{ fontSize: "1.1rem" }}>
                          {c.plataforma?.toLowerCase().includes("youtube") ? "▶️" : "🎓"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-slate-900 text-sm font-semibold" style={{ lineHeight: 1.35 }}>{c.titulo}</h4>
                          <span
                            className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                              c.plataforma?.toLowerCase().includes("youtube")
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-purple-50 text-purple-600 border-purple-200"
                            }`}
                          >
                            {c.plataforma}
                          </span>
                        </div>
                        {c.duracion && (
                          <p className="text-slate-400 text-xs mt-0.5">
                            <Clock className="w-3 h-3 inline mr-1" />{c.duracion}
                          </p>
                        )}
                        {c.inscrito && (c.progreso ?? 0) > 0 && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.progreso}%` }} />
                            </div>
                            <p className="text-slate-500 text-xs font-semibold mt-1">{c.progreso}% completado</p>
                          </div>
                        )}
                        <div className="flex justify-end mt-2">
                          {c.inscrito ? (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                            >
                              Continuar <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <button
                              onClick={() => handleInscribirse(c.id)}
                              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-900 bg-slate-900 text-white hover:bg-slate-700"
                            >
                              Inscribirse <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>

      {selectedEv && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSelectedEv(null)}
        >
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="relative">
              <img src={selectedEv.imagen} alt={selectedEv.titulo} className="w-full object-cover max-h-64" />
              <button onClick={() => setSelectedEv(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-slate-900 text-base font-bold">{selectedEv.titulo}</h3>
              {selectedEv.descripcion && (
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">{selectedEv.descripcion}</p>
              )}
              <p className="text-slate-400 text-xs mt-3">
                {new Date(selectedEv.fecha_subida).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showAddEvidencia && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowAddEvidencia(false)}
        >
          <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 text-sm font-bold">Agregar evidencia</h3>
              <button onClick={() => setShowAddEvidencia(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Título <span className="text-red-500">*</span></label>
                <input type="text" value={evTitulo} onChange={(e) => setEvTitulo(e.target.value)}
                  placeholder="ej. Instalación eléctrica residencial"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Descripción</label>
                <textarea value={evDescripcion} onChange={(e) => setEvDescripcion(e.target.value)}
                  rows={3} placeholder="Describe brevemente el proyecto o trabajo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Foto del proyecto <span className="text-red-500">*</span></label>
                <label className={`w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${evImagen ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => setEvImagen(e.target.files?.[0] ?? null)} />
                  {evImagen ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <p className="text-green-700 text-xs font-semibold text-center">{evImagen.name}</p>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-6 h-6 text-slate-300" />
                      <p className="text-slate-400 text-xs text-center">Haz clic para seleccionar una imagen</p>
                    </>
                  )}
                </label>
              </div>
              <button onClick={handleAddEvidencia} disabled={!evTitulo.trim() || !evImagen || addingEv}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${evTitulo.trim() && evImagen && !addingEv ? "bg-slate-900 hover:bg-slate-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                {addingEv ? "Subiendo…" : "Guardar evidencia"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showAddSkill && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowAddSkill(false)}
        >
          <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 text-sm font-bold">
                Proponer habilidad {newSkillTipo === "tecnica" ? "técnica" : "blanda"}
              </h3>
              <button onClick={() => setShowAddSkill(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-500 text-xs mb-4">
              La habilidad quedará en estado <strong>Pendiente</strong> hasta que un docente la valide.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Nombre de la habilidad</label>
                <input
                  type="text"
                  value={newSkillNombre}
                  onChange={(e) => setNewSkillNombre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  placeholder={newSkillTipo === "tecnica" ? "ej. Programación en Python" : "ej. Trabajo en equipo"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Tipo</label>
                <div className="flex gap-2">
                  {(["tecnica", "blanda"] as const).map((t) => (
                    <button key={t} onClick={() => setNewSkillTipo(t)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${newSkillTipo === t ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {t === "tecnica" ? "Técnica" : "Blanda"}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddSkill}
                disabled={!newSkillNombre.trim() || addingSkill}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${newSkillNombre.trim() && !addingSkill ? "bg-slate-900 hover:bg-slate-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
              >
                {addingSkill ? "Enviando…" : "Enviar para validación"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showQR && (
        <QRPanel
          profileUrl={profileUrl}
          nombre={nombre}
          especialidad={especialidad}
          onClose={() => setShowQR(false)}
        />
      )}

      <AnimatePresence>
        {empleoConseguido && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="relative px-6 pt-8 pb-6 text-center"
                style={{ background: "linear-gradient(135deg, #D4AF37 0%, #F0D060 50%, #D4AF37 100%)" }}>
                <div className="text-5xl mb-2">🎉</div>
                <p className="text-white text-xl font-extrabold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
                  ¡Felicitaciones!
                </p>
                <p className="text-white/90 text-sm font-medium mt-1">
                  Has conseguido empleo
                </p>
              </div>

              <div className="px-6 py-5 text-center">
                <p className="text-slate-700 text-sm leading-relaxed mb-1">
                  Tu postulación a
                </p>
                <p className="text-slate-900 text-base font-bold mb-1">
                  {empleoConseguido.oferta_titulo || "la oferta"}
                </p>
                {empleoConseguido.oferta_empresa_nombre && (
                  <p className="text-slate-500 text-sm mb-4">
                    en <span className="font-semibold">{empleoConseguido.oferta_empresa_nombre}</span> fue aceptada.
                  </p>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                  <p className="text-amber-800 text-xs font-medium leading-relaxed">
                    ¡Tu esfuerzo y dedicación dieron frutos! Esta es una nueva etapa en tu carrera profesional. ¡Mucho éxito!
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (empleoConseguido?.id != null) {
                      const celebradas = JSON.parse(localStorage.getItem("postulaciones_celebradas") ?? "[]") as number[];
                      if (!celebradas.includes(empleoConseguido.id)) {
                        localStorage.setItem("postulaciones_celebradas", JSON.stringify([...celebradas, empleoConseguido.id]));
                      }
                    }
                    setEmpleoConseguido(null);
                  }}
                  className="w-full py-3 rounded-xl text-white text-sm font-bold transition-colors"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #B8962E)" }}
                >
                  ¡Entendido, gracias! 🚀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
