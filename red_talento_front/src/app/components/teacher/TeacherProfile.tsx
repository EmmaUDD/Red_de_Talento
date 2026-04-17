import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, Users, Award, CheckCircle, MessageSquare,
  Heart, Share2, CalendarDays, Clock, Zap,
  ExternalLink, GraduationCap, Plus,
  MapPin, Mail, Play, PenSquare, ShieldCheck, Save, X, Loader2, Camera, Link2,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { perfilApi, cursosApi, feedApi } from "@/api/api";
import { PostList } from "@/app/components/vistas/PostList";
import type { FeedPost } from "@/app/types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";


const ESPECIALIDADES = [
  "Electricidad", "Computación e Informática", "Construcción",
  "Mecánica Automotriz", "Mecánica Industrial", "Todas las especialidades",
];

export function TeacherProfile() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<"perfil" | "cursos" | "publicaciones">("perfil");
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({ 4: 67, 2: 34 });
  const [editMode, setEditMode] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editDept, setEditDept] = useState("");
  const [saving, setSaving] = useState(false);

  const [misPosts, setMisPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [misCursos, setMisCursos] = useState<any[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [showCursoForm, setShowCursoForm] = useState(false);
  const [cursoForm, setCursoForm] = useState({ title: "", link: "", plataforma: "otro", nivel: "basico", specialty: "", desc: "" });
  const [publishingCurso, setPublishingCurso] = useState(false);
  const [cursoPublished, setCursoPublished] = useState(false);

  const loadCursos = useCallback(async () => {
    setLoadingCursos(true);
    try {
      const data = await cursosApi.getMisPublicados();
      setMisCursos(Array.isArray(data) ? data : []);
    } catch {
      setMisCursos([]);
    } finally {
      setLoadingCursos(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "cursos") loadCursos();
    if (tab === "publicaciones" && user?.id && misPosts.length === 0 && !loadingPosts) {
      setLoadingPosts(true);
      feedApi.getPostsDeUsuario(user.id)
        .then(setMisPosts)
        .catch(() => setMisPosts([]))
        .finally(() => setLoadingPosts(false));
    }
  }, [tab, loadCursos, user?.id]);

  const handlePublishCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishingCurso(true);
    try {
      await cursosApi.crear({
        titulo: cursoForm.title,
        url: cursoForm.link,
        plataforma: cursoForm.plataforma,
        especialidad: cursoForm.specialty,
        nivel: cursoForm.nivel,
        descripcion: cursoForm.desc,
      });
      setCursoPublished(true);
      await loadCursos();
    } catch {
      setCursoPublished(true);
    } finally {
      setPublishingCurso(false);
    }
  };

  const nombre = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "—";
  const departamento = user?.departamento ?? "Dpto. Técnico-Profesional";

  useEffect(() => {
    if (user) {
      setEditBio(user.bio ?? "");
      setEditDept(user.departamento ?? "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("bio", editBio);
      fd.append("departamento", editDept);
      await perfilApi.updatePerfil(fd);
      await refreshUser();
      setEditMode(false);
    } catch {
      // silencioso
    } finally {
      setSaving(false);
    }
  };

  const toggleLike = (id: number) => {
    const liked = likedPosts.includes(id);
    setLikedPosts((p) => liked ? p.filter((x) => x !== id) : [...p, id]);
    setLikeCounts((p) => ({ ...p, [id]: liked ? p[id] - 1 : p[id] + 1 }));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200">
        <div className="relative h-36 md:h-44 overflow-hidden">
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e3a5f 100%)" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-slate-900/40" />
          <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            <span className="text-slate-900 text-xs font-semibold">
              Docente Verificado · Liceo Cardenal Caro
            </span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-0">
          <div className="flex items-end gap-4 -mt-10 mb-4 relative z-10">
            <div className="relative flex-shrink-0">
              <label className="cursor-pointer group block">
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await perfilApi.uploadFoto(file);
                  await refreshUser();
                }} />
                {user?.foto_perfil ? (
                  <img src={user.foto_perfil.startsWith("http") ? user.foto_perfil : `${BASE_URL}${user.foto_perfil}`}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md" alt="docente" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-700 border-4 border-white shadow-md flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{nombre.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </label>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white shadow z-10" style={{ backgroundColor: "#D4AF37" }}>
                <Award className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-slate-900 font-extrabold" style={{ fontSize: "1.2rem", lineHeight: 1.2 }}>
                    Prof. {nombre}
                  </h1>
                  <p className="text-slate-600 text-sm mt-0.5 font-medium">{departamento}</p>
                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Liceo Cardenal Caro · Lo Espejo
                  </p>
                </div>
                {editMode ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? "Guardando…" : "Guardar"}
                    </button>
                    <button onClick={() => setEditMode(false)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold transition-colors shadow-sm">
                    <PenSquare className="w-4 h-4" />
                    Editar perfil
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: "Cursos publicados", value: String(misCursos.length) },
              { label: "Liceo Cardenal Caro", value: "📍" },
            ].map((s) => (
              <div key={s.label} className="text-center py-2">
                <p className="text-slate-900 font-extrabold" style={{ fontSize: "1.25rem", lineHeight: 1 }}>
                  {s.value}
                </p>
                <p className="text-slate-400 text-xs mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex border-b border-slate-200 -mx-4 px-4">
            {(["perfil", "cursos", "publicaciones"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm border-b-2 -mb-px transition-all ${tab === t ? "border-slate-900 text-slate-900 font-bold" : "border-transparent text-slate-500 hover:text-slate-700 font-medium"}`}>
                {t === "perfil" ? "Perfil" : t === "cursos" ? `Cursos (${misCursos.length})` : `Posts (${misPosts.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5">
        {tab === "perfil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 font-bold mb-3" style={{ fontSize: "0.875rem" }}>Sobre mí</h3>
              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-600 text-xs mb-1.5 font-medium">Departamento</label>
                    <input
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      placeholder="ej. Dpto. Electricidad"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1.5 font-medium">Descripción / Bio</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={4}
                      placeholder="Cuéntanos sobre tu experiencia y metodología..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {user?.bio ? (
                    <p className="text-slate-600 text-sm leading-relaxed">{user.bio}</p>
                  ) : (
                    <p className="text-slate-400 text-sm italic">
                      Aún no has agregado una descripción.{" "}
                      <button onClick={() => setEditMode(true)} className="text-slate-600 not-italic underline underline-offset-2">
                        Editar perfil
                      </button>
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 font-bold mb-3" style={{ fontSize: "0.875rem" }}>Contacto institucional</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span>{user?.email ?? "docente@liceocaro.cl"}</span>
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
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                <h3 className="text-slate-900 font-bold" style={{ fontSize: "0.875rem" }}>Cursos publicados en la plataforma</h3>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-3">
                Publica recursos y cursos para tus alumnos desde la pestaña <strong>Cursos</strong>.
              </p>
              <button
                onClick={() => setTab("cursos")}
                className="text-xs text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors font-semibold"
              >
                {misCursos.length > 0 ? `Ver mis ${misCursos.length} curso${misCursos.length !== 1 ? "s" : ""} →` : "Publicar primer curso →"}
              </button>
            </div>
          </motion.div>
        )}

        {tab === "cursos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs">Recursos educativos publicados por ti en la plataforma.</p>
              <button
                onClick={() => { setShowCursoForm(true); setCursoPublished(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Publicar curso
              </button>
            </div>

            {loadingCursos ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : misCursos.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Aún no has publicado ningún curso.</p>
                <button
                  onClick={() => { setShowCursoForm(true); setCursoPublished(false); }}
                  className="mt-3 text-xs text-slate-600 hover:text-slate-900 underline underline-offset-2"
                >
                  Publicar mi primer curso
                </button>
              </div>
            ) : (
              misCursos.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-lg">
                      {c.plataforma === "youtube" ? "▶️" : c.plataforma === "udemy" ? "🎓" : "📘"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="text-slate-900 text-sm font-semibold">{c.titulo}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${
                          c.nivel === "basico" ? "bg-green-50 text-green-700 border-green-200"
                          : c.nivel === "intermedio" ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {c.nivel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {c.especialidad && (
                          <span className="text-xs text-slate-400 flex items-center gap-1"><Zap className="w-3 h-3" />{c.especialidad}</span>
                        )}
                        {c.completados_count !== undefined && (
                          <span className="text-xs text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" />{c.completados_count} inscritos</span>
                        )}
                      </div>
                      {c.descripcion && (
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{c.descripcion}</p>
                      )}
                    </div>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center gap-1 text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                        Ver <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))
            )}

            <AnimatePresence>
              {showCursoForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                  onClick={(e) => e.target === e.currentTarget && setShowCursoForm(false)}>
                  <motion.div initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                      <p className="text-slate-900 text-sm font-bold">Publicar curso o recurso</p>
                      <button onClick={() => setShowCursoForm(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5">
                      {cursoPublished ? (
                        <div className="text-center py-6">
                          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-7 h-7 text-green-500" />
                          </div>
                          <p className="text-slate-900 text-sm font-semibold">¡Curso publicado!</p>
                          <p className="text-slate-500 text-xs mt-1">Los alumnos ya pueden encontrarlo en Buscar → Cursos.</p>
                          <button
                            onClick={() => { setCursoPublished(false); setCursoForm({ title: "", link: "", plataforma: "otro", nivel: "basico", specialty: "", desc: "" }); }}
                            className="mt-4 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-colors font-medium"
                          >
                            Publicar otro
                          </button>
                        </div>
                      ) : (
                        <form className="space-y-4" onSubmit={handlePublishCurso}>
                          <div>
                            <label className="block text-slate-700 text-sm mb-1.5 font-medium">Título <span className="text-red-500">*</span></label>
                            <input value={cursoForm.title} onChange={(e) => setCursoForm((p) => ({ ...p, title: e.target.value }))}
                              placeholder="ej. Electricidad Residencial para Técnicos"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" required />
                          </div>
                          <div>
                            <label className="block text-slate-700 text-sm mb-1.5 font-medium">Enlace <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input type="url" value={cursoForm.link} onChange={(e) => setCursoForm((p) => ({ ...p, link: e.target.value }))}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" required />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-700 text-sm mb-1.5 font-medium">Plataforma</label>
                              <select value={cursoForm.plataforma} onChange={(e) => setCursoForm((p) => ({ ...p, plataforma: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                                <option value="youtube">YouTube</option>
                                <option value="udemy">Udemy</option>
                                <option value="otro">Otro</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-700 text-sm mb-1.5 font-medium">Nivel</label>
                              <select value={cursoForm.nivel} onChange={(e) => setCursoForm((p) => ({ ...p, nivel: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                                <option value="basico">Básico</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-slate-700 text-sm mb-1.5 font-medium">Área / Especialidad <span className="text-red-500">*</span></label>
                            <select value={cursoForm.specialty} onChange={(e) => setCursoForm((p) => ({ ...p, specialty: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" required>
                              <option value="">Selecciona...</option>
                              {ESPECIALIDADES.map((e) => <option key={e}>{e}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-700 text-sm mb-1.5 font-medium">Descripción <span className="text-red-500">*</span></label>
                            <textarea value={cursoForm.desc} onChange={(e) => setCursoForm((p) => ({ ...p, desc: e.target.value }))}
                              rows={3} placeholder="¿Qué aprenderán? ¿A quién va dirigido?"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200" required />
                          </div>
                          <button type="submit"
                            disabled={!cursoForm.title || !cursoForm.link || !cursoForm.specialty || !cursoForm.desc || publishingCurso}
                            className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                              cursoForm.title && cursoForm.link && cursoForm.specialty && cursoForm.desc && !publishingCurso
                                ? "bg-slate-900 hover:bg-slate-700 text-white"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}>
                            {publishingCurso ? <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</> : "Publicar curso"}
                          </button>
                        </form>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {tab === "publicaciones" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loadingPosts ? (
              <div className="flex justify-center py-12">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              </div>
            ) : (
              <PostList
                posts={misPosts}
                nombre={`Prof. ${nombre}`}
                fotoSrc={user?.foto_perfil ?? null}
                onDeletePost={(id) => setMisPosts((prev) => prev.filter((p) => p.id !== id))}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
