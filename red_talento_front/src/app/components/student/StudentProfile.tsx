import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle, Award, Play, Shield, Wrench, Zap, Users, Clock,
  Pencil, Save, X, PlusCircle, AlertCircle, Medal, Star, BookOpen,
  TrendingUp, ExternalLink, MessageSquare, QrCode, Share2, Camera,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  habilidadesApi, insigniasApi, cursosApi, disponibilidadApi,
  qrApi, perfilApi, evidenciasApi, postulacionesApi,
} from "@/api/api";
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
import type { Habilidad, Insignia, Curso, SkillLevel } from "@/app/types";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const S = {
  label: {
    fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: 0,
  } as React.CSSProperties,
  input: {
    width: "100%", boxSizing: "border-box" as const,
    backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
    borderRadius: 10, padding: "9px 12px", fontSize: "0.875rem",
    outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: "#334155",
  } as React.CSSProperties,
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 16,
    border: "1px solid #E8E4DC", padding: 20,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  } as React.CSSProperties,
  modalOverlay: {
    position: "fixed" as const, inset: 0, zIndex: 50,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16, backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
  } as React.CSSProperties,
  modalCard: {
    backgroundColor: "white", borderRadius: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    width: "100%", maxWidth: 400, overflow: "hidden",
  } as React.CSSProperties,
  modalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px", borderBottom: "1px solid #F0EDE8",
  } as React.CSSProperties,
};

function LevelBadge({ level }: { level: SkillLevel }) {
  const cfg: Record<SkillLevel, React.CSSProperties> = {
    Alto:  { backgroundColor: "#F0FDF4", color: "#15803d", border: "1px solid #bbf7d0" },
    Medio: { backgroundColor: "#FFFBEB", color: "#b45309", border: "1px solid #fde68a" },
    Bajo:  { backgroundColor: "#FEF2F2", color: "#b91c1c", border: "1px solid #fecaca" },
  };
  return (
    <span style={{ ...cfg[level], padding: "2px 9px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 700 }}>
      {level}
    </span>
  );
}

function SkillBar({ percent, level }: { percent: number; level: SkillLevel }) {
  const c: Record<SkillLevel, string> = { Alto: "#10b981", Medio: "#f59e0b", Bajo: "#ef4444" };
  return (
    <div style={{ width: "100%", height: 6, backgroundColor: "#F0EDE8", borderRadius: 99, overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }} whileInView={{ width: `${percent}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ height: "100%", borderRadius: 99, backgroundColor: c[level] }}
      />
    </div>
  );
}

function CardHeading({ icon: Icon, title, right }: { icon?: React.ElementType; title: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {Icon && (
          <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon style={{ width: 12, height: 12, color: "#8C7B6B" }} />
          </div>
        )}
        <p style={{ ...S.label }}>{title}</p>
      </div>
      {right}
    </div>
  );
}

function ModalCloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F6F5F0", border: "none", cursor: "pointer", color: "#64748b" }}>
      <X style={{ width: 14, height: 14 }} />
    </button>
  );
}

function QRPanel({ profileUrl, nombre, especialidad, onClose }: {
  profileUrl: string; nombre: string; especialidad: string; onClose: () => void;
}) {
  const handleCopy = () => { navigator.clipboard.writeText(profileUrl).catch(() => {}); };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={S.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ ...S.modalCard, maxWidth: 320, overflow: "hidden" }}>
        {/* Navy accent strip */}
        <div style={{ height: 5, backgroundColor: "#0d1b35", backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.3) 1px, transparent 1px)", backgroundSize: "8px 8px" }} />
        <div style={{ padding: "20px 24px 24px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <p style={{ ...S.label }}>Compartir perfil</p>
            <ModalCloseBtn onClose={onClose} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: 16, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 14, marginBottom: 16 }}>
            <QRCodeSVG value={profileUrl} size={152} bgColor="#F6F5F0" fgColor="#0d1b35" level="M" />
          </div>
          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>{nombre}</p>
          <p style={{ margin: "3px 0 0", color: "#6B5D52", fontSize: "0.75rem" }}>{especialidad} · Liceo Cardenal Caro</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, padding: "5px 12px", borderRadius: 999, border: "1px solid #D4AF37", backgroundColor: "#FFFBF0" }}>
            <CheckCircle style={{ width: 11, height: 11, color: "#D4AF37" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#B8962E" }}>Validado institucionalmente</span>
          </div>
          <p style={{ margin: "12px 0 0", color: "#94a3b8", fontSize: "0.72rem", lineHeight: 1.55 }}>
            Escanea para ver el perfil completo con evidencias y competencias validadas.
          </p>
          <button onClick={handleCopy} style={{
            marginTop: 14, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "10px 0", borderRadius: 10, border: "1px solid #E8E4DC",
            color: "#0d1b35", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
            backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            <Share2 style={{ width: 13, height: 13 }} /> Copiar enlace
          </button>
        </div>
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

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.href = FONT_URL; link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const handleAddSkill = async () => {
    if (!newSkillNombre.trim()) return;
    setAddingSkill(true);
    try {
      await habilidadesApi.crear(newSkillNombre.trim(), newSkillTipo);
      setNewSkillNombre(""); setNewSkillTipo("tecnica");
      setShowAddSkill(false);
      await loadData();
    } catch { } finally { setAddingSkill(false); }
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
      setHabilidades(habs); setInsignias(insigs); setCursos(curs); setMisCursos(misCurs);
      setDisponibilidad(Array.isArray(disp) && disp.length > 0 ? disp[0].disponibilidad : "");
      setEvidencias(evs);
      const celebradas = JSON.parse(localStorage.getItem("postulaciones_celebradas") ?? "[]") as number[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aceptada = misPostulaciones.find((p: any) => p.estado?.toLowerCase() === "contratado" && !celebradas.includes(p.id));
      if (aceptada) setEmpleoConseguido(aceptada);
    } catch { } finally { setLoadingData(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (user) { setBio(user.bio ?? ""); setVideoPitch(user.video_pitch ?? ""); } }, [user]);

  const handleSave = async () => {
    setSavingPerfil(true);
    try {
      const fd = new FormData();
      fd.append("bio", bio); fd.append("video_pitch", videoPitch);
      await perfilApi.updatePerfil(fd);
      await disponibilidadApi.set(disponibilidad);
      await refreshUser();
      setEditMode(false);
    } catch { } finally { setSavingPerfil(false); }
  };

  const handleSolicitarCambio = async (hab: Habilidad) => {
    const nivelSiguiente: SkillLevel = hab.nivel === "Bajo" ? "Medio" : hab.nivel === "Medio" ? "Alto" : "Bajo";
    try {
      await habilidadesApi.solicitarCambio(hab.id, nivelSiguiente);
      setPendingIds((prev) => new Set(prev).add(hab.id));
    } catch { }
  };

  const handleAddEvidencia = async () => {
    if (!evTitulo.trim() || !evImagen) return;
    setAddingEv(true);
    try {
      await evidenciasApi.crear(evTitulo.trim(), evDescripcion.trim(), evImagen);
      setEvTitulo(""); setEvDescripcion(""); setEvImagen(null);
      setShowAddEvidencia(false);
      await loadData();
    } catch { } finally { setAddingEv(false); }
  };

  const handleInscribirse = async (cursoId: number) => {
    try {
      await cursosApi.inscribirse(cursoId);
      setCursos((prev) => prev.map((c) => (c.id === cursoId ? { ...c, inscrito: true, progreso: 0 } : c)));
    } catch { }
  };

  const nombre = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "—";
  const especialidad = user?.especialidad ?? "Técnico";
  const curso = user?.curso ?? "";
  const profileUrl = user ? qrApi.getUrlPerfil(user.id) : window.location.href;
  const fotoSrc = user?.foto_perfil
    ? (user.foto_perfil.startsWith("http") ? user.foto_perfil : `${BASE_URL}${user.foto_perfil}`)
    : null;

  const techSkills = habilidades.filter((h) => h.tipo === "tecnica");
  const softSkills = habilidades.filter((h) => h.tipo === "blanda");
  const habValidadas = habilidades.filter((h) => h.validado).length;

  const dispLabel: Record<string, string> = {
    part_time: "Part-time", full_time: "Full-time",
    fines_de_semana: "Fines de semana", practicas: "Práctica laboral",
  };

  const TABS = [
    { id: "perfil"      as const, label: "Perfil"      },
    { id: "habilidades" as const, label: "Competencias" },
    { id: "crecimiento" as const, label: "Crecimiento"  },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DC" }}>

        {/* Cover — full width, orthogonal grid (student texture) */}
        <div style={{
          height: 160, position: "relative", overflow: "hidden", backgroundColor: "#0d1b35",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, transparent 60%, rgba(212,175,55,0.08) 100%)" }} />

          {/* Validated badge */}
          {user?.validado && (
            <div style={{
              position: "absolute", top: 14, right: 16,
              display: "inline-flex", alignItems: "center", gap: 5,
              backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)",
              borderRadius: 20, padding: "4px 12px",
            }}>
              <CheckCircle style={{ width: 12, height: 12, color: "#D4AF37" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#D4AF37" }}>Perfil Validado</span>
            </div>
          )}

          {/* Gold bottom line */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#D4AF37" }} />
        </div>

        {/* Identity container */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>

          {/* Avatar + name row */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: -44 }}>

            {/* Avatar — overlaps cover */}
            <div style={{ flexShrink: 0, position: "relative" }}>
              <label className="group" style={{ cursor: "pointer", display: "block", position: "relative" }}>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const updated = await perfilApi.uploadFoto(file);
                  await refreshUser();
                  if (updated.foto_perfil) {
                    const img = document.querySelector<HTMLImageElement>("#avatar-img");
                    if (img) img.src = updated.foto_perfil.startsWith("http") ? updated.foto_perfil : `${BASE_URL}${updated.foto_perfil}`;
                  }
                }} />
                {fotoSrc ? (
                  <img id="avatar-img" src={fotoSrc} alt="avatar" style={{
                    width: 96, height: 96, borderRadius: 18, objectFit: "cover",
                    border: "4px solid #FFFFFF", boxShadow: "0 4px 16px rgba(0,0,0,0.14)", display: "block",
                  }} />
                ) : (
                  <div style={{
                    width: 96, height: 96, borderRadius: 18, backgroundColor: "#0d1b35",
                    border: "4px solid #FFFFFF", boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2.1rem", fontWeight: 700, color: "#D4AF37" }}>
                      {nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {user?.validado && (
                  <div style={{ position: "absolute", inset: -5, borderRadius: 22, border: "1.5px solid rgba(212,175,55,0.45)", pointerEvents: "none" }} />
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ position: "absolute", inset: 0, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Camera style={{ width: 18, height: 18, color: "white" }} />
                </div>
              </label>
              {user?.validado && (
                <div style={{ position: "absolute", bottom: -4, right: -4, width: 26, height: 26, borderRadius: 8, backgroundColor: "#D4AF37", border: "3px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                  <CheckCircle style={{ width: 12, height: 12, color: "white" }} />
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 10, paddingTop: 48 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <h1 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: "1.4rem", lineHeight: 1.15, color: "#0d1b35" }}>
                    {nombre}
                  </h1>
                  <p style={{ margin: "3px 0 0", color: "#6B5D52", fontSize: "0.9rem", fontWeight: 600 }}>{especialidad}</p>
                  {curso && (
                    <p style={{ margin: "2px 0 0", color: "#8C7B6B", fontSize: "0.75rem" }}>
                      {curso} · Liceo Cardenal Caro
                    </p>
                  )}
                  {editMode ? (
                    <select value={disponibilidad} onChange={(e) => setDisponibilidad(e.target.value)}
                      style={{ marginTop: 8, ...S.input, width: "auto", padding: "5px 10px", fontSize: "0.75rem" }}>
                      <option value="">Sin especificar</option>
                      <option value="part_time">Part-time</option>
                      <option value="full_time">Full-time</option>
                      <option value="fines_de_semana">Fines de semana</option>
                      <option value="practicas">Práctica laboral</option>
                    </select>
                  ) : disponibilidad ? (
                    <span style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4, backgroundColor: "#EFF6FF", borderRadius: 999, padding: "3px 10px", fontSize: "0.72rem", color: "#1d4ed8", fontWeight: 600, border: "1px solid #bfdbfe" }}>
                      <Clock style={{ width: 10, height: 10 }} /> {dispLabel[disponibilidad] ?? disponibilidad}
                    </span>
                  ) : null}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 7 }}>
                  {editMode ? (
                    <>
                      <button onClick={handleSave} disabled={savingPerfil} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 10, border: "none", backgroundColor: "#0d1b35", color: "white", fontSize: "0.775rem", fontWeight: 700, cursor: "pointer", opacity: savingPerfil ? 0.65 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <Save style={{ width: 12, height: 12 }} />
                        {savingPerfil ? "Guardando…" : "Guardar"}
                      </button>
                      <button onClick={() => setEditMode(false)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 10, border: "1px solid #E8E4DC", backgroundColor: "white", color: "#6B5D52", fontSize: "0.775rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <X style={{ width: 12, height: 12 }} /> Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditMode(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 10, border: "none", backgroundColor: "#0d1b35", color: "white", fontSize: "0.775rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <Pencil style={{ width: 12, height: 12 }} /> Editar
                      </button>
                      <button onClick={() => setShowQR(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 10, border: "1px solid #E8E4DC", backgroundColor: "white", color: "#0d1b35", fontSize: "0.775rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <QrCode style={{ width: 12, height: 12 }} /> QR
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", margin: "14px 0 0", backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 12 }}>
            {[
              { label: "Competencias", value: habValidadas > 0 ? `${habValidadas}` : habilidades.length > 0 ? `${habilidades.length}` : "—" },
              { label: "Insignias", value: insignias.length > 0 ? `${insignias.length}` : "—" },
              { label: "Cursos", value: misCursos.length > 0 ? `${misCursos.length}` : "—" },
            ].map((k, i) => (
              <div key={k.label} style={{ textAlign: "center", padding: "11px 8px", borderRight: i < 2 ? "1px solid #E8E4DC" : "none" }}>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>{k.value}</p>
                <p style={{ ...S.label, marginTop: 2 }}>{k.label}</p>
              </div>
            ))}
          </div>

          {/* Insignias strip */}
          {insignias.length > 0 && (
            <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 12, paddingTop: 12 }}>
              {insignias.map((b) => (
                <span key={b.id} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.7rem", fontWeight: 700, backgroundColor: "#FFFBF0", border: "1px solid #D4AF37", color: "#B8962E", borderRadius: 999, padding: "4px 11px" }}>
                  {b.icono} {b.nombre}
                </span>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #E8E4DC", marginTop: insignias.length > 0 ? 0 : 14 }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "10px 4px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.82rem", fontWeight: 600,
                color: tab === t.id ? "#0d1b35" : "#94a3b8",
                borderBottom: tab === t.id ? "2px solid #D4AF37" : "2px solid transparent",
                marginBottom: -2, transition: "color 0.15s",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Edit mode notice */}
        {editMode && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "#FFFBF0", border: "1px solid #D4AF37", borderRadius: 12, padding: "10px 14px" }}>
            <Pencil style={{ width: 13, height: 13, color: "#B8962E", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.78rem", fontWeight: 700 }}>Modo edición activo</p>
              <p style={{ margin: 0, color: "#8C7B6B", fontSize: "0.72rem" }}>Los cambios en competencias requieren validación de un docente.</p>
            </div>
            <button onClick={() => setEditMode(false)} style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </motion.div>
        )}

        {loadingData && (
          <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
            <Loader className="animate-spin" style={{ width: 22, height: 22, color: "#D4AF37" }} />
          </div>
        )}

        {!loadingData && tab === "perfil" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Bio */}
            <div style={S.card}>
              <CardHeading title="Sobre mí" />
              {editMode ? (
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                  placeholder="Cuéntanos sobre ti, tus intereses y experiencia…"
                  style={{ ...S.input, resize: "none" }}
                  onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                  onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.backgroundColor = "#F6F5F0"; }} />
              ) : (
                <p style={{ margin: 0, color: "#4A3F35", fontSize: "0.875rem", lineHeight: 1.7 }}>
                  {bio || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Aún no has agregado una descripción.</span>}
                </p>
              )}
            </div>

            {/* Contact */}
            <div style={S.card}>
              <CardHeading title="Contacto" right={
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8", fontSize: "0.72rem" }}>
                  <Shield style={{ width: 11, height: 11 }} /> Protegido
                </span>
              } />
              <p style={{ margin: 0, color: "#4A3F35", fontSize: "0.875rem" }}>{user?.email ?? "—"}</p>
              <p style={{ margin: "3px 0 12px", color: "#94a3b8", fontSize: "0.72rem" }}>Solo visible para empresas verificadas con tu autorización</p>
              <button style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", backgroundColor: "#0d1b35", color: "white", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <MessageSquare style={{ width: 13, height: 13 }} /> Contactar
              </button>
            </div>

            {/* Video pitch */}
            <div style={{ ...S.card, padding: 0 }}>
              <div style={{ padding: "16px 20px 12px" }}>
                <CardHeading icon={Play} title="Video-Pitch" right={
                  <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>30 segundos recomendados</span>
                } />
              </div>
              {editMode ? (
                <div style={{ padding: "0 20px 20px" }}>
                  <input type="url" value={videoPitch} onChange={(e) => setVideoPitch(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..." style={S.input}
                    onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                    onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.backgroundColor = "#F6F5F0"; }} />
                  <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.72rem" }}>
                    Pega el enlace de tu video en YouTube, Vimeo u otra plataforma.
                  </p>
                </div>
              ) : videoPitch ? (
                <div style={{ padding: "0 20px 20px" }}>
                  {(() => {
                    const ytMatch = videoPitch.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                    const videoId = ytMatch?.[1];
                    return videoId ? (
                      <a href={videoPitch} target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", borderRadius: 12, overflow: "hidden", border: "1px solid #E8E4DC", position: "relative" }}
                        className="group">
                        <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt="miniatura video"
                          style={{ width: "100%", objectFit: "cover", aspectRatio: "16/9", display: "block" }} />
                        <div className="group-hover:bg-black/50 transition-colors" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.28)" }}>
                          <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Play style={{ width: 20, height: 20, color: "#0d1b35", marginLeft: 3 }} />
                          </div>
                        </div>
                      </a>
                    ) : (
                      <a href={videoPitch} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E4DC", color: "#0d1b35", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", backgroundColor: "#F6F5F0" }}>
                        <Play style={{ width: 13, height: 13, color: "#8C7B6B", flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{videoPitch}</span>
                        <ExternalLink style={{ width: 12, height: 12, color: "#8C7B6B", flexShrink: 0 }} />
                      </a>
                    );
                  })()}
                </div>
              ) : (
                <div style={{ margin: "0 20px 20px", borderRadius: 10, backgroundColor: "#F6F5F0", border: "2px dashed #E8E4DC", aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Play style={{ width: 26, height: 26, color: "#D4D0C8" }} />
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.75rem", textAlign: "center" }}>
                    Sin video-pitch. Activa edición para agregar un enlace.
                  </p>
                </div>
              )}
            </div>

            {/* Evidences gallery */}
            <div style={{ ...S.card, padding: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px" }}>
                <p style={{ ...S.label }}>Galería de Evidencias</p>
                {editMode && (
                  <button onClick={() => setShowAddEvidencia(true)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", fontWeight: 600, color: "#0d1b35", border: "1px solid #E8E4DC", backgroundColor: "white", borderRadius: 9, padding: "5px 11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <PlusCircle style={{ width: 12, height: 12 }} /> Agregar
                  </button>
                )}
              </div>
              {evidencias.length === 0 ? (
                <div style={{ margin: "0 20px 20px", borderRadius: 10, backgroundColor: "#F6F5F0", border: "2px dashed #E8E4DC", padding: "36px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <PlusCircle style={{ width: 24, height: 24, color: "#D4D0C8" }} />
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.75rem", textAlign: "center", lineHeight: 1.55 }}>
                    Aún no hay evidencias.<br />Activa edición para agregar fotos de proyectos.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, padding: "0 20px 20px" }}>
                  {evidencias.map((ev) => (
                    <button key={ev.id} onClick={() => setSelectedEv(ev)}
                      style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #E8E4DC", textAlign: "left", cursor: "pointer", backgroundColor: "white", padding: 0 }}
                      className="group">
                      <div style={{ aspectRatio: "4/3", overflow: "hidden" }}>
                        <img src={ev.imagen} alt={ev.titulo}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                          className="group-hover:scale-105" />
                      </div>
                      <div style={{ padding: "8px 10px" }}>
                        <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {ev.titulo}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {!loadingData && tab === "habilidades" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 12, padding: "10px 14px" }}>
              <Shield style={{ width: 13, height: 13, color: "#8C7B6B", flexShrink: 0 }} />
              <p style={{ margin: 0, color: "#6B5D52", fontSize: "0.75rem" }}>
                Niveles certificados por docentes. Información protegida con acceso autorizado.
              </p>
            </div>

            {pendingIds.size > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#FFFBF0", border: "1px solid #D4AF37", borderRadius: 12, padding: "10px 14px" }}>
                <AlertCircle style={{ width: 13, height: 13, color: "#D4AF37", flexShrink: 0 }} />
                <p style={{ margin: 0, color: "#B8962E", fontSize: "0.75rem" }}>
                  Tienes solicitudes pendientes de revisión por un docente.
                </p>
              </div>
            )}

            {/* Tech skills */}
            <div style={S.card}>
              <CardHeading icon={Wrench} title="Habilidades Técnicas" right={
                <span style={{ backgroundColor: "#FFFBF0", color: "#B8962E", border: "1px solid #D4AF37", fontSize: "0.68rem", fontWeight: 700, padding: "2px 9px", borderRadius: 999 }}>
                  Certificadas
                </span>
              } />
              {techSkills.length === 0 ? (
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.875rem", textAlign: "center", padding: "14px 0" }}>
                  Aún no tienes habilidades técnicas registradas.
                </p>
              ) : (
                <div>
                  {techSkills.map((skill, i) => {
                    const isPending = !skill.validado || pendingIds.has(skill.id);
                    const pct = skill.porcentaje ?? nivelAPorcentaje(skill.nivel);
                    return (
                      <div key={skill.id} style={{ paddingTop: i === 0 ? 0 : 12, paddingBottom: 12, borderBottom: i < techSkills.length - 1 ? "1px solid #F6F5F0" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: "#F6F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Zap style={{ width: 11, height: 11, color: "#8C7B6B" }} />
                            </div>
                            <span style={{ color: "#0d1b35", fontSize: "0.8125rem", fontWeight: 600 }}>{skill.nombre}</span>
                          </div>
                          {isPending ? (
                            <span style={{ backgroundColor: "#FFFBEB", color: "#b45309", border: "1px solid #fde68a", fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, display: "flex", alignItems: "center", gap: 3 }}>
                              <Clock style={{ width: 9, height: 9 }} /> Pendiente
                            </span>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <LevelBadge level={skill.nivel} />
                              {editMode && (
                                <button onClick={() => handleSolicitarCambio(skill)} style={{ color: "#8C7B6B", fontSize: "0.7rem", cursor: "pointer", background: "none", border: "none", textDecoration: "underline", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                  Cambiar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        {!isPending && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1 }}><SkillBar percent={pct} level={skill.nivel} /></div>
                            <span style={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: 600, width: 28, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {editMode && (
                <button onClick={() => { setNewSkillTipo("tecnica"); setShowAddSkill(true); }} style={{ marginTop: techSkills.length > 0 ? 4 : 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 0", border: "2px dashed #E8E4DC", borderRadius: 10, color: "#8C7B6B", fontSize: "0.8rem", cursor: "pointer", backgroundColor: "transparent", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <PlusCircle style={{ width: 13, height: 13 }} /> Proponer nueva habilidad técnica
                </button>
              )}
            </div>

            {/* Soft skills */}
            <div style={S.card}>
              <CardHeading icon={Users} title="Habilidades Blandas" right={
                <span style={{ backgroundColor: "#F6F5F0", color: "#4A3F35", border: "1px solid #E8E4DC", fontSize: "0.68rem", fontWeight: 700, padding: "2px 9px", borderRadius: 999 }}>
                  Evaluadas
                </span>
              } />
              {softSkills.length === 0 ? (
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.875rem", textAlign: "center", padding: "14px 0" }}>
                  Aún no tienes habilidades blandas registradas.
                </p>
              ) : (
                <div>
                  {softSkills.map((skill, i) => {
                    const isPending = !skill.validado || pendingIds.has(skill.id);
                    const pct = skill.porcentaje ?? nivelAPorcentaje(skill.nivel);
                    return (
                      <div key={skill.id} style={{ paddingTop: i === 0 ? 0 : 12, paddingBottom: 12, borderBottom: i < softSkills.length - 1 ? "1px solid #F6F5F0" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                          <span style={{ color: "#0d1b35", fontSize: "0.8125rem", fontWeight: 600 }}>{skill.nombre}</span>
                          {isPending ? (
                            <span style={{ backgroundColor: "#FFFBEB", color: "#b45309", border: "1px solid #fde68a", fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, display: "flex", alignItems: "center", gap: 3 }}>
                              <Clock style={{ width: 9, height: 9 }} /> Pendiente
                            </span>
                          ) : <LevelBadge level={skill.nivel} />}
                        </div>
                        {!isPending && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1 }}><SkillBar percent={pct} level={skill.nivel} /></div>
                            <span style={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: 600, width: 28, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {editMode && (
                <button onClick={() => { setNewSkillTipo("blanda"); setShowAddSkill(true); }} style={{ marginTop: softSkills.length > 0 ? 4 : 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 0", border: "2px dashed #E8E4DC", borderRadius: 10, color: "#8C7B6B", fontSize: "0.8rem", cursor: "pointer", backgroundColor: "transparent", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <PlusCircle style={{ width: 13, height: 13 }} /> Proponer nueva habilidad blanda
                </button>
              )}
            </div>

            {/* Institutional seal */}
            <div style={{ backgroundColor: "#FFFBF0", border: "2px solid #D4AF37", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, backgroundColor: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(212,175,55,0.3)" }}>
                <Award style={{ width: 24, height: 24, color: "white" }} />
              </div>
              <div>
                <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.88rem", fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>Sello Institucional · Liceo Cardenal Caro</p>
                <p style={{ margin: "3px 0 0", color: "#6B5D52", fontSize: "0.75rem", lineHeight: 1.5 }}>
                  Competencias verificadas en taller por personal docente calificado.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!loadingData && tab === "crecimiento" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Badges */}
            <div style={S.card}>
              <CardHeading icon={Medal} title="Insignias Ganadas" />
              {insignias.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "20px 0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, backgroundColor: "#F6F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Star style={{ width: 22, height: 22, color: "#D4D0C8" }} />
                  </div>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>Completa acciones para ganar insignias</p>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                  {insignias.map((b) => (
                    <div key={b.id} style={{ flexShrink: 0, minWidth: 96, border: "1px solid #D4AF37", backgroundColor: "#FFFBF0", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                      <span style={{ fontSize: "1.5rem" }}>{b.icono}</span>
                      <p style={{ margin: "7px 0 0", color: "#0d1b35", fontSize: "0.72rem", fontWeight: 700, lineHeight: 1.3 }}>{b.nombre}</p>
                      <p style={{ margin: "3px 0 0", color: "#94a3b8", fontSize: "0.65rem" }}>
                        {new Date(b.fecha_obtencion).toLocaleDateString("es-CL", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  ))}
                  <div style={{ flexShrink: 0, minWidth: 96, border: "2px dashed #E8E4DC", borderRadius: 14, padding: "14px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <Star style={{ width: 22, height: 22, color: "#D4D0C8" }} />
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.72rem" }}>Próxima</p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress */}
            <div style={S.card}>
              <CardHeading icon={TrendingUp} title="Progreso General" />
              {(() => {
                const validated = habilidades.filter((h) => h.validado).length;
                const total = habilidades.length || 1;
                const pct = Math.round((validated / total) * 100);
                return (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
                    <div>
                      <p style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: "2.8rem", lineHeight: 1, color: "#D4AF37" }}>
                        {pct}%
                      </p>
                      <p style={{ margin: "4px 0 0", color: "#6B5D52", fontSize: "0.72rem" }}>Habilidades validadas</p>
                    </div>
                    <div style={{ flex: 1, paddingBottom: 6 }}>
                      <div style={{ height: 8, backgroundColor: "#F0EDE8", borderRadius: 99, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.1 }}
                          style={{ height: "100%", borderRadius: 99, backgroundColor: "#D4AF37" }} />
                      </div>
                      <p style={{ margin: "5px 0 0", color: "#8C7B6B", fontSize: "0.7rem" }}>
                        {validated} de {total} habilidades validadas por docentes
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Completed courses */}
            {misCursos.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ ...S.label, marginBottom: 2 }}>Cursos Realizados</p>
                {misCursos.map((mc) => {
                  const estadoBadge =
                    mc.estado === "aprobado"   ? { label: "Completado", bg: "#F0FDF4", color: "#15803d", border: "#bbf7d0" }
                    : mc.estado === "rechazado" ? { label: "Rechazado",  bg: "#FEF2F2", color: "#b91c1c", border: "#fecaca" }
                    :                             { label: "Por Validar", bg: "#FFFBEB", color: "#b45309", border: "#fde68a" };
                  return (
                    <div key={mc.id} style={{ ...S.card, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "#F6F5F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.1rem" }}>
                        {mc.curso?.plataforma === "youtube" ? "▶️" : "🎓"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.8125rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {mc.curso?.titulo}
                        </p>
                        {mc.curso?.especialidad && <p style={{ margin: "2px 0 0", color: "#8C7B6B", fontSize: "0.72rem" }}>{mc.curso.especialidad}</p>}
                      </div>
                      <span style={{ backgroundColor: estadoBadge.bg, color: estadoBadge.color, border: `1px solid ${estadoBadge.border}`, fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px", borderRadius: 999, flexShrink: 0 }}>
                        {estadoBadge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recommended courses */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ ...S.label, marginBottom: 2 }}>Cursos Recomendados</p>
              {cursos.length === 0 ? (
                <div style={{ ...S.card, textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
                  No hay cursos disponibles en este momento.
                </div>
              ) : (
                cursos.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ ...S.card, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.1rem" }}>
                        {c.plataforma?.toLowerCase().includes("youtube") ? "▶️" : "🎓"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                          <h4 style={{ margin: 0, color: "#0d1b35", fontSize: "0.8125rem", fontWeight: 700, lineHeight: 1.35 }}>{c.titulo}</h4>
                          <span style={{ flexShrink: 0, fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, border: "1px solid", ...(c.plataforma?.toLowerCase().includes("youtube") ? { backgroundColor: "#FEF2F2", color: "#b91c1c", borderColor: "#fecaca" } : { backgroundColor: "#F5F3FF", color: "#6d28d9", borderColor: "#ddd6fe" }) }}>
                            {c.plataforma}
                          </span>
                        </div>
                        {c.duracion && <p style={{ margin: "3px 0 0", color: "#8C7B6B", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4 }}><Clock style={{ width: 10, height: 10 }} />{c.duracion}</p>}
                        {c.inscrito && (c.progreso ?? 0) > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ height: 5, backgroundColor: "#E8E4DC", borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ height: "100%", backgroundColor: "#1d4ed8", borderRadius: 99, width: `${c.progreso}%` }} />
                            </div>
                            <p style={{ margin: "3px 0 0", color: "#6B5D52", fontSize: "0.7rem", fontWeight: 600 }}>{c.progreso}% completado</p>
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                          {c.inscrito ? (
                            <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", fontWeight: 700, padding: "6px 12px", borderRadius: 9, border: "1px solid #E8E4DC", color: "#0d1b35", textDecoration: "none", backgroundColor: "#F6F5F0" }}>
                              Continuar <ExternalLink style={{ width: 11, height: 11 }} />
                            </a>
                          ) : (
                            <button onClick={() => handleInscribirse(c.id)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", fontWeight: 700, padding: "6px 12px", borderRadius: 9, border: "none", backgroundColor: "#0d1b35", color: "white", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              Inscribirse <ExternalLink style={{ width: 11, height: 11 }} />
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

      {/* Evidence detail */}
      {selectedEv && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={S.modalOverlay} onClick={(e) => e.target === e.currentTarget && setSelectedEv(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ ...S.modalCard, maxWidth: 440 }}>
            <div style={{ position: "relative" }}>
              <img src={selectedEv.imagen} alt={selectedEv.titulo} style={{ width: "100%", objectFit: "cover", maxHeight: 256, display: "block" }} />
              <button onClick={() => setSelectedEv(null)} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.5)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <h3 style={{ margin: 0, color: "#0d1b35", fontSize: "1rem", fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>{selectedEv.titulo}</h3>
              {selectedEv.descripcion && <p style={{ margin: "8px 0 0", color: "#4A3F35", fontSize: "0.875rem", lineHeight: 1.65 }}>{selectedEv.descripcion}</p>}
              <p style={{ margin: "10px 0 0", color: "#94a3b8", fontSize: "0.72rem" }}>
                {new Date(selectedEv.fecha_subida).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add evidence */}
      {showAddEvidencia && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={S.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowAddEvidencia(false)}>
          <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} style={S.modalCard}>
            <div style={S.modalHeader}>
              <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>Agregar evidencia</p>
              <ModalCloseBtn onClose={() => setShowAddEvidencia(false)} />
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Título *</label>
                <input type="text" value={evTitulo} onChange={(e) => setEvTitulo(e.target.value)}
                  placeholder="ej. Instalación eléctrica residencial" style={S.input}
                  onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                  onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.backgroundColor = "#F6F5F0"; }} />
              </div>
              <div>
                <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Descripción</label>
                <textarea value={evDescripcion} onChange={(e) => setEvDescripcion(e.target.value)}
                  rows={3} placeholder="Describe brevemente el proyecto o trabajo..."
                  style={{ ...S.input, resize: "none" }}
                  onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                  onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.backgroundColor = "#F6F5F0"; }} />
              </div>
              <div>
                <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Foto del proyecto *</label>
                <label style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px 0", borderRadius: 12, cursor: "pointer", border: `2px dashed ${evImagen ? "#D4AF37" : "#E8E4DC"}`, backgroundColor: evImagen ? "#FFFBF0" : "#F6F5F0", boxSizing: "border-box" as const }}>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setEvImagen(e.target.files?.[0] ?? null)} />
                  {evImagen ? (
                    <><CheckCircle style={{ width: 22, height: 22, color: "#D4AF37" }} />
                    <p style={{ margin: 0, color: "#B8962E", fontSize: "0.75rem", fontWeight: 700, textAlign: "center" }}>{evImagen.name}</p></>
                  ) : (
                    <><PlusCircle style={{ width: 22, height: 22, color: "#D4D0C8" }} />
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.75rem" }}>Haz clic para seleccionar una imagen</p></>
                  )}
                </label>
              </div>
              <button onClick={handleAddEvidencia} disabled={!evTitulo.trim() || !evImagen || addingEv} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", backgroundColor: evTitulo.trim() && evImagen && !addingEv ? "#0d1b35" : "#E8E4DC", color: evTitulo.trim() && evImagen && !addingEv ? "white" : "#94a3b8", fontSize: "0.875rem", fontWeight: 700, cursor: evTitulo.trim() && evImagen && !addingEv ? "pointer" : "not-allowed", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {addingEv ? "Subiendo…" : "Guardar evidencia"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add skill */}
      {showAddSkill && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={S.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowAddSkill(false)}>
          <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} style={S.modalCard}>
            <div style={S.modalHeader}>
              <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>
                Proponer habilidad {newSkillTipo === "tecnica" ? "técnica" : "blanda"}
              </p>
              <ModalCloseBtn onClose={() => setShowAddSkill(false)} />
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ margin: 0, color: "#6B5D52", fontSize: "0.78rem", lineHeight: 1.6 }}>
                La habilidad quedará en estado <strong>Pendiente</strong> hasta que un docente la valide.
              </p>
              <div>
                <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Nombre de la habilidad</label>
                <input type="text" value={newSkillNombre} onChange={(e) => setNewSkillNombre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  placeholder={newSkillTipo === "tecnica" ? "ej. Programación en Python" : "ej. Trabajo en equipo"}
                  style={S.input} autoFocus
                  onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                  onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.backgroundColor = "#F6F5F0"; }} />
              </div>
              <div>
                <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Tipo</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["tecnica", "blanda"] as const).map((t) => (
                    <button key={t} onClick={() => setNewSkillTipo(t)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: "0.8rem", fontWeight: 700, border: "1.5px solid", borderColor: newSkillTipo === t ? "#0d1b35" : "#E8E4DC", backgroundColor: newSkillTipo === t ? "#0d1b35" : "white", color: newSkillTipo === t ? "white" : "#6B5D52", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s" }}>
                      {t === "tecnica" ? "Técnica" : "Blanda"}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAddSkill} disabled={!newSkillNombre.trim() || addingSkill} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", backgroundColor: newSkillNombre.trim() && !addingSkill ? "#0d1b35" : "#E8E4DC", color: newSkillNombre.trim() && !addingSkill ? "white" : "#94a3b8", fontSize: "0.875rem", fontWeight: 700, cursor: newSkillNombre.trim() && !addingSkill ? "pointer" : "not-allowed", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {addingSkill ? "Enviando…" : "Enviar para validación"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* QR Panel */}
      {showQR && (
        <AnimatePresence>
          <QRPanel profileUrl={profileUrl} nombre={nombre} especialidad={especialidad} onClose={() => setShowQR(false)} />
        </AnimatePresence>
      )}

      {/* Job celebration */}
      <AnimatePresence>
        {empleoConseguido && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...S.modalOverlay, backgroundColor: "rgba(0,0,0,0.55)" }}>
            <motion.div initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              style={{ ...S.modalCard, maxWidth: 360 }}>
              <div style={{ padding: "32px 24px 24px", textAlign: "center", background: "linear-gradient(135deg, #D4AF37 0%, #F0D060 50%, #D4AF37 100%)" }}>
                <div style={{ fontSize: "2.75rem", marginBottom: 6 }}>🎉</div>
                <p style={{ margin: 0, color: "white", fontSize: "1.3rem", fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif", textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
                  ¡Felicitaciones!
                </p>
                <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", fontWeight: 500 }}>Has conseguido empleo</p>
              </div>
              <div style={{ padding: "20px 24px", textAlign: "center" }}>
                <p style={{ margin: 0, color: "#6B5D52", fontSize: "0.875rem" }}>Tu postulación a</p>
                <p style={{ margin: "4px 0 0", color: "#0d1b35", fontSize: "1rem", fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {empleoConseguido.oferta_titulo || "la oferta"}
                </p>
                {empleoConseguido.oferta_empresa_nombre && (
                  <p style={{ margin: "2px 0 0", color: "#6B5D52", fontSize: "0.875rem" }}>
                    en <strong>{empleoConseguido.oferta_empresa_nombre}</strong> fue aceptada.
                  </p>
                )}
                <div style={{ backgroundColor: "#FFFBF0", border: "1px solid #D4AF37", borderRadius: 12, padding: "10px 16px", margin: "16px 0" }}>
                  <p style={{ margin: 0, color: "#8C7B6B", fontSize: "0.775rem", lineHeight: 1.6 }}>
                    ¡Tu esfuerzo y dedicación dieron frutos! Esta es una nueva etapa en tu carrera profesional.
                  </p>
                </div>
                <button onClick={() => {
                  if (empleoConseguido?.id != null) {
                    const celebradas = JSON.parse(localStorage.getItem("postulaciones_celebradas") ?? "[]") as number[];
                    if (!celebradas.includes(empleoConseguido.id)) {
                      localStorage.setItem("postulaciones_celebradas", JSON.stringify([...celebradas, empleoConseguido.id]));
                    }
                  }
                  setEmpleoConseguido(null);
                }} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #D4AF37, #B8962E)", color: "white", fontSize: "0.875rem", fontWeight: 800, cursor: "pointer", fontFamily: "'Playfair Display', Georgia, serif" }}>
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

// Inline loader to avoid extra import
function Loader({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return (
    <svg style={style} className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
