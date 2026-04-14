import { motion } from "motion/react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle, Award, Play, ChevronLeft, ChevronRight,
  Shield, Wrench, Zap, Users, Clock, Pencil, Save, X,
  PlusCircle, AlertCircle, Medal, Star, BookOpen, TrendingUp,
  ExternalLink, Heart, MessageSquare, Share2, QrCode,
} from "lucide-react";

type Level = "Alto" | "Medio" | "Bajo";

interface Skill {
  name: string;
  level: Level;
  percent: number;
  pendingValidation?: boolean;
  pendingLevel?: Level;
}

const projectImages = [
  { url: "https://images.unsplash.com/photo-1520229534044-62d7cd4e9b0f?w=600&h=400&fit=crop&auto=format", title: "Tablero trifásico", desc: "Taller Industrial · 2024" },
  { url: "https://images.unsplash.com/photo-1657558665549-bd7d82afed8c?w=600&h=400&fit=crop&auto=format", title: "Cañerías eléctricas", desc: "Práctica de taller · 2023" },
  { url: "https://images.unsplash.com/photo-1630599073777-2fc89fd57921?w=600&h=400&fit=crop&auto=format", title: "Montaje eléctrico", desc: "Colaboración grupal · 2024" },
];

const earnedBadges = [
  { name: "Instalador Cert.", icon: "⚡", date: "Jun 2024" },
  { name: "Equipo Estrella", icon: "🌟", date: "Ago 2024" },
  { name: "Seg. Industrial", icon: "🛡️", date: "Sep 2024" },
];

const courses = [
  { title: "Electricidad Residencial Avanzada", platform: "YouTube", dur: "8h 30min", enrolled: false, progress: 0 },
  { title: "Automatización con Arduino", platform: "Udemy", dur: "12h 45min", enrolled: true, progress: 45 },
  { title: "Seguridad Eléctrica Industrial", platform: "YouTube", dur: "4h 15min", enrolled: false, progress: 0 },
];

function LevelBadge({ level }: { level: Level }) {
  const cfg = {
    Alto: "bg-green-50 text-green-700 border-green-200",
    Medio: "bg-amber-50 text-amber-700 border-amber-200",
    Bajo: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs border ${cfg[level]}`} style={{ fontWeight: 600 }}>
      {level}
    </span>
  );
}

function SkillBar({ percent, level }: { percent: number; level: Level }) {
  const c = { Alto: "#10b981", Medio: "#f59e0b", Bajo: "#ef4444" };
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

function QRPanel({ onClose }: { onClose: () => void }) {
  const profileUrl = `${window.location.origin}/perfil/felipe-munoz`;
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
          <p className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Compartir perfil</p>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center p-4 bg-white border-2 border-slate-100 rounded-xl mb-4 mx-auto w-fit">
          <QRCodeSVG
            value={profileUrl}
            size={160}
            bgColor="#ffffff"
            fgColor="#0F172A"
            level="M"
            imageSettings={{
              src: "",
              x: undefined,
              y: undefined,
              height: 28,
              width: 28,
              excavate: true,
            }}
          />
        </div>
        <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Felipe Muñoz Rojas</p>
        <p className="text-slate-500 text-xs mt-0.5">Técnico en Electricidad · Liceo Cardenal Caro</p>
        <div className="flex items-center gap-1.5 justify-center mt-2 px-3 py-1.5 rounded-lg border border-slate-200 mx-auto w-fit">
          <CheckCircle className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
          <span className="text-xs" style={{ color: "#B8962E", fontWeight: 600 }}>Perfil validado institucionalmente</span>
        </div>
        <p className="text-slate-400 text-xs mt-4 leading-relaxed">
          Escanea el código QR para ver el perfil completo con evidencias y competencias validadas.
        </p>
        <button className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-colors" style={{ fontWeight: 500 }}>
          <Share2 className="w-4 h-4" />
          Copiar enlace
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

  const [bio, setBio] = useState("Apasionado por la electricidad industrial y domiciliaria. Experiencia en instalaciones de tableros, cableado estructurado y automatización básica. Disponible part-time y fines de semana.");
  const [availability, setAvailability] = useState("Part-time · Fines de semana");

  const [techSkills, setTechSkills] = useState<Skill[]>([
    { name: "Instalaciones Eléctricas", level: "Alto", percent: 90 },
    { name: "Lectura de Planos", level: "Alto", percent: 85 },
    { name: "Tableros Eléctricos", level: "Medio", percent: 65 },
    { name: "Automatización Básica", level: "Medio", percent: 60 },
    { name: "Iluminación LED", level: "Alto", percent: 80 },
  ]);

  const [softSkills] = useState<Skill[]>([
    { name: "Responsabilidad", level: "Alto", percent: 95 },
    { name: "Trabajo en Equipo", level: "Alto", percent: 88 },
    { name: "Puntualidad", level: "Alto", percent: 92 },
    { name: "Comunicación", level: "Medio", percent: 70 },
  ]);

  const requestValidation = (idx: number) => {
    setTechSkills((p) =>
      p.map((s, i) => {
        if (i !== idx) return s;
        const next: Level = s.level === "Bajo" ? "Medio" : s.level === "Medio" ? "Alto" : "Bajo";
        return { ...s, pendingValidation: true, pendingLevel: next };
      })
    );
  };

  const tabs = [
    { id: "perfil", label: "Perfil" },
    { id: "habilidades", label: "Competencias" },
    { id: "crecimiento", label: "Crecimiento" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ── Profile Header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-0">
          {/* Validation seal */}
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4 text-xs"
            style={{ backgroundColor: "#FFFBF0", border: "1px solid #D4AF37", color: "#B8962E", fontWeight: 700 }}
          >
            <CheckCircle className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
            Perfil Validado Institucionalmente · Liceo Cardenal Caro
          </div>

          <div className="flex items-start gap-4 mb-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1520229534044-62d7cd4e9b0f?w=200&h=200&fit=crop&auto=format"
                alt="avatar"
                className="w-20 h-20 rounded-xl object-cover border border-slate-200"
              />
              <div
                className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"
                style={{ backgroundColor: "#D4AF37" }}
              >
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
              {editMode && (
                <button className="absolute -top-2 -left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow border border-slate-200">
                  <Pencil className="w-3 h-3 text-slate-600" />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-slate-900" style={{ fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.2 }}>
                Felipe Muñoz Rojas
              </h1>
              <p className="text-slate-600 text-sm mt-0.5" style={{ fontWeight: 500 }}>Técnico en Electricidad</p>
              <p className="text-slate-500 text-xs mt-0.5">4° Medio TP · Liceo Cardenal Caro · Lo Espejo</p>

              {editMode ? (
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="mt-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option>Part-time · Fines de semana</option>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Solo fines de semana</option>
                  <option>Práctica laboral</option>
                </select>
              ) : (
                <span className="mt-2 inline-flex items-center gap-1 bg-slate-100 rounded-full px-2.5 py-1 text-xs text-slate-600">
                  <Clock className="w-3 h-3" /> {availability}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all border ${
                  editMode
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
                style={{ fontWeight: 600 }}
              >
                {editMode ? <><Save className="w-3.5 h-3.5" /> Guardar</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
              </button>
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all"
                style={{ fontWeight: 600 }}
              >
                <QrCode className="w-3.5 h-3.5" />
                QR
              </button>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex gap-2 overflow-x-auto pb-3">
            {["⚡ Instalador Cert.", "🛡️ Seg. Industrial", "🌟 Equipo Estrella"].map((b) => (
              <span
                key={b}
                className="flex-shrink-0 text-xs rounded-full px-3 py-1.5 border"
                style={{ borderColor: "#D4AF37", color: "#B8962E", backgroundColor: "#FFFBF0", fontWeight: 600 }}
              >
                {b}
              </span>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 -mx-4 px-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-sm transition-all border-b-2 -mb-px ${
                  tab === t.id
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
                style={{ fontWeight: tab === t.id ? 700 : 500 }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Edit mode banner */}
        {editMode && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3"
          >
            <Pencil className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-blue-700 text-xs" style={{ fontWeight: 600 }}>Modo edición activo</p>
              <p className="text-blue-600 text-xs">Los cambios en competencias requieren validación de un docente.</p>
            </div>
            <button onClick={() => setEditMode(false)} className="text-blue-400 hover:text-blue-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ── PERFIL TAB ── */}
        {tab === "perfil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Bio */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 mb-3" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Sobre mí</h3>
              {editMode ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              ) : (
                <p className="text-slate-600 text-sm leading-relaxed">{bio}</p>
              )}
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Contacto</h3>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Shield className="w-3 h-3" /> Datos protegidos
                </span>
              </div>
              <p className="text-slate-600 text-sm">f.mu***@alumno.lcc.cl</p>
              <p className="text-slate-400 text-xs mt-1">Solo visible para empresas verificadas con tu autorización</p>

              {/* Contact button */}
              <button className="mt-3 w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-sm transition-colors flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                <MessageSquare className="w-4 h-4" />
                Contactar
              </button>
            </div>

            {/* Video Pitch */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-slate-600" />
                  <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Video-Pitch (30 seg)</h3>
                </div>
                {editMode && (
                  <button className="text-xs text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50" style={{ fontWeight: 500 }}>
                    Actualizar
                  </button>
                )}
              </div>
              <div className="relative mx-4 mb-4 rounded-lg overflow-hidden bg-slate-900 aspect-video cursor-pointer group">
                <img
                  src="https://images.unsplash.com/photo-1520229534044-62d7cd4e9b0f?w=700&h=400&fit=crop&auto=format"
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-slate-900 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">0:28</div>
                <div
                  className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: "#D4AF37", color: "white", fontWeight: 700 }}
                >
                  ✓ Validado
                </div>
              </div>
              <div className="flex items-center gap-4 px-5 pb-4">
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 text-xs transition-colors">
                  <Heart className="w-4 h-4" /> 24
                </button>
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors">
                  <MessageSquare className="w-4 h-4" /> 5
                </button>
              </div>
            </div>

            {/* Project Gallery */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Galería de Evidencias</h3>
                {editMode && (
                  <button className="flex items-center gap-1 text-slate-600 text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50" style={{ fontWeight: 500 }}>
                    <PlusCircle className="w-3.5 h-3.5" /> Agregar
                  </button>
                )}
              </div>
              <div className="relative mx-4 mb-3 rounded-lg overflow-hidden aspect-video bg-slate-100">
                <img
                  src={projectImages[imgIdx].url}
                  alt={projectImages[imgIdx].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm" style={{ fontWeight: 600 }}>{projectImages[imgIdx].title}</p>
                  <p className="text-white/80 text-xs">{projectImages[imgIdx].desc}</p>
                </div>
                <button
                  onClick={() => setImgIdx((p) => (p === 0 ? projectImages.length - 1 : p - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center shadow"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  onClick={() => setImgIdx((p) => (p === projectImages.length - 1 ? 0 : p + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center shadow"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
              {/* Thumbnails */}
              <div className="flex gap-2 px-4 pb-4">
                {projectImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all ${
                      i === imgIdx ? "border-slate-900" : "border-transparent opacity-50 hover:opacity-75"
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── HABILIDADES TAB ── */}
        {tab === "habilidades" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <Shield className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <p className="text-slate-600 text-xs">Niveles certificados por docentes. Información protegida con acceso autorizado.</p>
            </div>

            {techSkills.some((s) => s.pendingValidation) && (
              <div className="flex items-center gap-3 border rounded-xl p-3" style={{ backgroundColor: "#FFFBF0", borderColor: "#D4AF37" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#D4AF37" }} />
                <p className="text-xs" style={{ color: "#B8962E" }}>Tienes solicitudes pendientes de revisión por un docente.</p>
              </div>
            )}

            {/* Tech Skills */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-500" />
                  <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Habilidades Técnicas</h3>
                </div>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "#FFFBF0", color: "#B8962E", fontWeight: 600, border: "1px solid #D4AF37" }}
                >
                  Certificadas
                </span>
              </div>
              <div className="space-y-4">
                {techSkills.map((skill, i) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-slate-300" />
                        <span className="text-slate-700 text-sm">{skill.name}</span>
                        {skill.pendingValidation && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pendiente
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <LevelBadge level={skill.pendingValidation ? skill.pendingLevel! : skill.level} />
                        {editMode && !skill.pendingValidation && (
                          <button
                            onClick={() => requestValidation(i)}
                            className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2"
                          >
                            Solicitar cambio
                          </button>
                        )}
                      </div>
                    </div>
                    <SkillBar percent={skill.percent} level={skill.level} />
                  </div>
                ))}
              </div>
              {editMode && (
                <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-slate-300 hover:text-slate-600 text-sm transition-all">
                  <PlusCircle className="w-4 h-4" /> Proponer nueva habilidad
                </button>
              )}
            </div>

            {/* Soft Skills */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Habilidades Blandas</h3>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                  Evaluadas
                </span>
              </div>
              <div className="space-y-4">
                {softSkills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-700 text-sm">{skill.name}</span>
                      <LevelBadge level={skill.level} />
                    </div>
                    <SkillBar percent={skill.percent} level={skill.level} />
                  </div>
                ))}
              </div>
            </div>

            {/* Institutional Seal */}
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
                <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.9rem" }}>Sello Institucional Liceo Cardenal Caro</p>
                <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                  Competencias verificadas en taller por personal docente calificado.
                </p>
                <p className="text-xs mt-1" style={{ color: "#B8962E", fontWeight: 600 }}>Prof. García Vidal · 15 Sep 2024</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CRECIMIENTO TAB ── */}
        {tab === "crecimiento" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Badges */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Medal className="w-4 h-4 text-slate-500" />
                <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Insignias Ganadas</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {earnedBadges.map((b) => (
                  <div
                    key={b.name}
                    className="flex-shrink-0 border rounded-xl p-4 text-center min-w-[100px]"
                    style={{ borderColor: "#D4AF37", backgroundColor: "#FFFBF0" }}
                  >
                    <span style={{ fontSize: "1.75rem" }}>{b.icon}</span>
                    <p className="text-slate-700 text-xs mt-2" style={{ fontWeight: 600, lineHeight: 1.3 }}>{b.name}</p>
                    <p className="text-slate-400 text-xs mt-1">{b.date}</p>
                  </div>
                ))}
                <div className="flex-shrink-0 border-2 border-dashed border-slate-200 rounded-xl p-4 text-center min-w-[100px] flex flex-col items-center justify-center">
                  <Star className="w-7 h-7 text-slate-200 mb-1" />
                  <p className="text-slate-400 text-xs">Próxima</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Progreso General</h3>
              </div>
              <div className="flex items-end gap-5">
                <div>
                  <p className="text-slate-900" style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, color: "#D4AF37" }}>72%</p>
                  <p className="text-slate-500 text-xs">Perfil completado</p>
                </div>
                <div className="flex-1 pb-1">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "72%" }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#D4AF37" }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5">Completa 2 cursos más para nivel Avanzado</p>
                </div>
              </div>
            </div>

            {/* Courses */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <h3 className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Cursos Recomendados</h3>
              </div>
              {courses.map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span style={{ fontSize: "1.1rem" }}>{c.platform === "YouTube" ? "▶️" : "🎓"}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-slate-900 text-sm" style={{ fontWeight: 600, lineHeight: 1.35 }}>{c.title}</h4>
                        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border ${c.platform === "YouTube" ? "bg-red-50 text-red-600 border-red-200" : "bg-purple-50 text-purple-600 border-purple-200"}`} style={{ fontWeight: 600 }}>
                          {c.platform}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5"><Clock className="w-3 h-3 inline mr-1" />{c.dur}</p>
                      {c.enrolled && c.progress > 0 && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.progress}%` }} />
                          </div>
                          <p className="text-slate-500 text-xs mt-1" style={{ fontWeight: 600 }}>{c.progress}% completado</p>
                        </div>
                      )}
                      <div className="flex justify-end mt-2">
                        <button
                          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            c.enrolled
                              ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                              : "border-slate-900 bg-slate-900 text-white hover:bg-slate-700"
                          }`}
                          style={{ fontWeight: 600 }}
                        >
                          {c.enrolled ? "Continuar" : "Inscribirse"} <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* QR Modal */}
      {showQR && <QRPanel onClose={() => setShowQR(false)} />}
    </div>
  );
}
