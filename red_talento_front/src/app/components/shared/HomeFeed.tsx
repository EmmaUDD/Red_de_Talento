import { useState, useEffect, useRef } from "react";
import { usePerfil } from "@/app/context/PerfilContext";
import { motion } from "motion/react";
import { useAuth } from "@/app/context/AuthContext";
import { useNavigate } from "react-router";
import { feedApi, docenteApi, perfilApi, reportesApi } from "@/api/api";
import type { FeedPost } from "@/app/types";
import {
  Image, Briefcase, CalendarDays, Send, Award, Users,
  TrendingUp, Bell, Pin, CheckCircle, Heart, MessageSquare,
  MoreHorizontal, Loader2, Flag, Clock, MapPin, Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

function parseEvento(contenido: string) {
  const lines = contenido.split("\n");
  let titulo = "";
  let datetime = "";
  let lugar = "";
  const descLines: string[] = [];
  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith("📅")) titulo = l.replace("📅", "").trim();
    else if (l.startsWith("🗓")) datetime = l.replace("🗓", "").trim();
    else if (l.startsWith("📍")) lugar = l.replace("📍", "").trim();
    else if (l) descLines.push(l);
  }
  return { titulo, datetime, lugar, descripcion: descLines.join(" ").trim() };
}

function FeedPostCard({ post, canModerate, onDelete }: { post: FeedPost; canModerate: boolean; onDelete?: (id: number) => void }) {
  const { openPerfil } = usePerfil();
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.ya_likeado ?? false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<string[]>([]);
  const [showReporte, setShowReporte] = useState(false);
  const [motivoReporte, setMotivoReporte] = useState("");
  const [descripcionReporte, setDescripcionReporte] = useState("");
  const [reporteEstado, setReporteEstado] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwn = user?.id === post.autor_id;

  const handleOpenPerfil = () => {
    if (!post.autor_perfil_id) return;
    const tipo = post.autor_rol === "student" ? "estudiante" : post.autor_rol === "teacher" ? "docente" : "empresa";
    openPerfil(post.autor_perfil_id, tipo as "estudiante" | "empresa" | "docente");
  };

  const handleReportar = async () => {
    if (!motivoReporte || !post.autor_id) return;
    setReporteEstado("loading");
    try {
      await feedApi.reportar(post.autor_id, motivoReporte, descripcionReporte || motivoReporte, post.id);
      setReporteEstado("ok");
    } catch {
      setReporteEstado("error");
    }
  };

  const handleLike = async () => {
    try {
      await feedApi.likear(post.id);
      setLiked((l) => !l);
      setLikesCount((c) => (liked ? c - 1 : c + 1));
    } catch { /* silently fail */ }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setLocalComments((prev) => [...prev, commentText.trim()]);
    setCommentText("");
  };

  const handleEliminar = async () => {
    setShowMenu(false);
    setDeleting(true);
    try {
      await feedApi.eliminarPost(post.id);
      onDelete?.(post.id);
    } catch {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(post.fecha), { addSuffix: true, locale: es });
    } catch {
      return post.fecha;
    }
  })();

  const roleColors: Record<string, string> = {
    student: "bg-blue-50 text-blue-700",
    teacher: "bg-green-50 text-green-700",
    company: "bg-amber-50 text-amber-700",
  };
  const roleLabel: Record<string, string> = {
    student: "Estudiante",
    teacher: "Docente",
    company: "Empresa",
  };

  const typeConfig: Record<string, { label: string; className: string }> = {
    oferta: { label: "Empleo", className: "bg-amber-50 text-amber-700 border border-amber-200" },
    evento: { label: "Evento", className: "bg-purple-50 text-purple-700 border border-purple-200" },
    anuncio: { label: "Anuncio", className: "bg-green-50 text-green-700 border border-green-200" },
  };
  const typeTag = typeConfig[post.tipo];

  const accentBorder: Record<string, string> = {
    oferta: "border-l-amber-400",
    evento: "border-l-purple-400",
    anuncio: "border-l-green-400",
    post: "border-l-transparent",
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${accentBorder[post.tipo] ?? "border-l-transparent"} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <button
            onClick={handleOpenPerfil}
            disabled={!post.autor_perfil_id}
            className="flex items-center gap-2.5 text-left disabled:cursor-default min-w-0"
          >
            {post.autor_foto ? (
              <img src={post.autor_foto} alt={post.autor_nombre} className="w-9 h-9 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-slate-500" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-slate-900 text-sm font-semibold truncate">{post.autor_nombre}</p>
                {typeTag && (
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeTag.className}`} style={{ fontSize: "0.65rem" }}>
                    {typeTag.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${roleColors[post.autor_rol]}`} style={{ fontSize: "0.65rem" }}>
                  {roleLabel[post.autor_rol]}
                </span>
                <span className="text-slate-400" style={{ fontSize: "0.7rem" }}>{timeAgo}</span>
              </div>
            </div>
          </button>
          {(canModerate || isOwn) && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setShowMenu((s) => !s)}
                disabled={deleting}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                {deleting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <MoreHorizontal className="w-4 h-4" />}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
                  {isOwn && (
                    <button
                      onClick={handleEliminar}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar publicación
                    </button>
                  )}
                  {canModerate && !isOwn && (
                    <button
                      onClick={() => { setShowMenu(false); setShowReporte(true); setReporteEstado("idle"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Flag className="w-4 h-4" />
                      Reportar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {post.tipo === "evento" ? (() => {
          const ev = parseEvento(post.contenido);
          return (
            <div className="mt-1">
              <div className="rounded-xl overflow-hidden border border-purple-200">
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-extrabold" style={{ letterSpacing: "0.06em", fontSize: "0.6rem" }}>EVENTO</p>
                    <p className="text-white text-sm font-bold leading-tight">{ev.titulo || post.contenido.split("\n")[0]}</p>
                  </div>
                </div>
                {(ev.datetime || ev.lugar) && (
                  <div className="bg-purple-50 px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-purple-100">
                    {ev.datetime && (
                      <span className="flex items-center gap-1.5 text-purple-700 font-medium" style={{ fontSize: "0.75rem" }}>
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        {ev.datetime}
                      </span>
                    )}
                    {ev.lugar && (
                      <span className="flex items-center gap-1.5 text-purple-700 font-medium" style={{ fontSize: "0.75rem" }}>
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {ev.lugar}
                      </span>
                    )}
                  </div>
                )}
                {ev.descripcion && (
                  <div className="px-4 py-3 bg-white">
                    <p className="text-slate-600 text-sm leading-relaxed">{ev.descripcion}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })() : (
          <p className="text-slate-700 text-sm leading-relaxed">{post.contenido}</p>
        )}
      </div>

      {post.imagen_url && (
        <div className="border-t border-slate-100">
          <img src={post.imagen_url} alt="imagen del post" className="w-full max-h-72 object-cover" />
        </div>
      )}

      <div className="flex items-center px-4 py-2.5 border-t border-slate-100 gap-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-xs transition-colors ${liked ? "text-red-500 bg-red-50" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
          <span className="font-semibold">{likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-xs transition-colors ${showComments ? "text-blue-600 bg-blue-50" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="font-semibold">{post.comentarios + localComments.length}</span>
        </button>
        {!isOwn && (
          <button
            onClick={() => { setShowReporte((s) => !s); setReporteEstado("idle"); }}
            className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-xs transition-colors ml-auto ${showReporte ? "text-red-500 bg-red-50" : "text-slate-400 hover:bg-slate-50"}`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Reportar</span>
          </button>
        )}
      </div>
      {showReporte && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          {reporteEstado === "ok" ? (
            <p className="text-xs text-green-600 font-medium">Reporte enviado. Gracias por avisar.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">¿Por qué estás reportando esta publicación?</p>
              <select
                value={motivoReporte}
                onChange={(e) => setMotivoReporte(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Selecciona un motivo...</option>
                <option value="Contenido inapropiado">Contenido inapropiado</option>
                <option value="Spam">Spam</option>
                <option value="Información falsa">Información falsa</option>
                <option value="Acoso o intimidación">Acoso o intimidación</option>
                <option value="Otro">Otro</option>
              </select>
              <textarea
                value={descripcionReporte}
                onChange={(e) => setDescripcionReporte(e.target.value)}
                placeholder="Describe brevemente el problema (opcional)..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 placeholder:text-slate-400"
              />
              {reporteEstado === "error" && (
                <p className="text-xs text-red-500">Ocurrió un error. Intenta de nuevo.</p>
              )}
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setShowReporte(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReportar}
                  disabled={!motivoReporte || reporteEstado === "loading"}
                  className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold disabled:bg-slate-200 disabled:text-slate-400 hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  {reporteEstado === "loading" && <Loader2 className="w-3 h-3 animate-spin" />}
                  Enviar reporte
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          {localComments.map((c, i) => (
            <div key={i} className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-700">{c}</div>
          ))}
          <div className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Escribe un comentario..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PostComposer({ onPost }: { onPost: (p: FeedPost) => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [postType, setPostType] = useState<"post" | "oferta" | "evento">("post");
  const [loading, setLoading] = useState(false);
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postTypes: { id: "post" | "oferta" | "evento"; label: string; icon: typeof Send; redirect?: string }[] =
    user?.role === "company"
      ? [
          { id: "post" as const, label: "Post", icon: Send },
          { id: "oferta" as const, label: "Empleo", icon: Briefcase, redirect: "/publicar?tipo=empleo" },
          { id: "evento" as const, label: "Evento", icon: CalendarDays, redirect: "/publicar?tipo=evento" },
        ]
      : user?.role === "teacher"
      ? [
          { id: "post" as const, label: "Anuncio", icon: Send },
          { id: "evento" as const, label: "Evento", icon: CalendarDays, redirect: "/publicar-evento" },
        ]
      : [{ id: "post" as const, label: "Publicación", icon: Send }];

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleQuitarImagen = () => {
    setImagen(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePublicar = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await feedApi.crearPost(text.trim(), postType, imagen ?? undefined);
      const fullName = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "";
      const roleMap: Record<string, import("@/app/types").Role> = {
        student: "student", teacher: "teacher", company: "company",
      };
      const newPost: import("@/app/types").FeedPost = {
        id: Date.now(),
        autor_nombre: fullName,
        autor_rol: roleMap[user?.role ?? "student"] ?? "student",
        autor_foto: user?.foto_perfil,
        contenido: text.trim(),
        tipo: postType as import("@/app/types").FeedPost["tipo"],
        fecha: new Date().toISOString(),
        likes: 0, comentarios: 0, ya_likeado: false,
        imagen_url: preview ?? undefined,
      };
      onPost(newPost);
      setText("");
      handleQuitarImagen();
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        {user?.foto_perfil ? (
          <img src={user.foto_perfil} alt={user.first_name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4 text-slate-500" />
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              user?.role === "student" ? "Comparte tu avance, proyecto o logro..."
              : user?.role === "teacher" ? "Publica un anuncio o evento para la comunidad..."
              : "Publica una oferta, oportunidad o novedad..."
            }
            rows={2}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 placeholder:text-slate-400 transition-all"
          />
          {preview && (
            <div className="relative mt-2 inline-block">
              <img src={preview} alt="preview" className="max-h-48 rounded-lg border border-slate-200 object-cover" />
              <button
                onClick={handleQuitarImagen}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 text-white flex items-center justify-center text-xs hover:bg-slate-900 transition-colors"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {postTypes.map((t) => {
              const Icon = t.icon;
              const active = postType === t.id;
              return (
                <button key={t.id}
                  onClick={() => t.redirect ? navigate(t.redirect) : setPostType(t.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    active
                      ? "bg-slate-900 text-white font-semibold"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 font-medium"
                  }`}>
                  <Icon className="w-3 h-3" />
                  {t.label}
                </button>
              );
            })}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagenChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${imagen ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            >
              <Image className="w-3 h-3" />
              <span className="hidden sm:inline">Foto</span>
            </button>
            <button onClick={handlePublicar} disabled={!text.trim() || loading}
              className={`ml-auto px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${text.trim() ? "bg-slate-900 hover:bg-slate-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentSidebar() {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <Award className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-slate-900 text-sm font-semibold">Tu perfil</p>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed mb-3">
          Completa tu perfil con habilidades y video-pitch para destacar ante las empresas.
        </p>
        <a href="/perfil" className="block w-full py-2 rounded-lg text-center text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
          Ver mi perfil →
        </a>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <p className="text-slate-900 text-sm font-semibold">Empleos disponibles</p>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed mb-3">
          Revisa las ofertas activas de empresas aliadas del Liceo.
        </p>
        <a href="/empleos" className="block w-full py-2 rounded-lg text-center text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors">
          Ver empleos →
        </a>
      </div>
    </div>
  );
}

function TeacherSidebar() {
  const [porValidar, setPorValidar] = useState(0);
  const [solicitudes, setSolicitudes] = useState(0);
  const [denuncias, setDenuncias] = useState(0);

  useEffect(() => {
    Promise.all([
      perfilApi.getEstudiantes().catch(() => ({ results: [] })),
      docenteApi.getSolicitudes().catch(() => []),
      reportesApi.getAll().catch(() => []),
    ]).then(([ests, sols, reps]) => {
      const estudiantes = ests.results ?? [];
      setPorValidar(estudiantes.filter((e) => (e.habilidades_pendientes?.length ?? 0) > 0).length);
      setSolicitudes(sols.filter((s) => s.estado === "pendiente").length);
      setDenuncias(reps.filter((r) => r.estado === "pendiente").length);
    });
  }, []);

  const items = [
    { label: "Alumnos por validar", count: porValidar, color: "bg-amber-100 text-amber-700" },
    { label: "Solicitudes de registro", count: solicitudes, color: "bg-red-100 text-red-600" },
    { label: "Denuncias pendientes", count: denuncias, color: "bg-purple-100 text-purple-700" },
  ].filter((item) => item.count > 0);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4" style={{ color: "#D4AF37" }} />
          <p className="text-slate-900 text-sm font-semibold">Pendientes</p>
        </div>
        {items.length === 0 ? (
          <p className="text-slate-400 text-xs">Todo al día. No hay pendientes.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-slate-600 text-xs">{item.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Pin className="w-4 h-4 text-slate-400" />
          <p className="text-slate-900 text-sm font-semibold">Posts anclados</p>
        </div>
        <p className="text-slate-500 text-xs">Puedes anclar anuncios desde el menú de cada publicación.</p>
      </div>
    </div>
  );
}

function CompanySidebar() {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-slate-500" />
          <p className="text-slate-900 text-sm font-semibold">Buscar talento</p>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed mb-3">
          Encuentra candidatos validados por el Liceo Cardenal Caro según tu especialidad.
        </p>
        <a href="/buscar" className="block w-full py-2 rounded-lg text-center text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors">
          Buscar candidatos →
        </a>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <p className="text-slate-900 text-sm font-semibold">Publicar empleo</p>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed mb-3">
          Publica una oferta y llega directo a los estudiantes con el perfil que necesitas.
        </p>
        <a href="/publicar" className="block w-full py-2 rounded-lg text-center text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
          Crear oferta →
        </a>
      </div>
    </div>
  );
}

export function HomeFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedApi.getPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const canModerate = user?.role === "teacher";
  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "";
  const firstName = fullName.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              {user?.foto_perfil && (
                <img src={user.foto_perfil} alt={fullName} className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
              )}
              <div>
                <p className="text-slate-900 text-sm font-semibold">Hola, {firstName} 👋</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {user?.role === "student" ? `${user.especialidad} · ${user.curso}`
                    : user?.role === "teacher" ? `Docente · ${user.departamento ?? ""}`
                    : `${user?.nombre_empresa ?? ""} · ${user?.industria ?? ""}`}
                </p>
              </div>
              {user?.role === "student" && user.validado && (
                <div className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border"
                  style={{ borderColor: "#D4AF37", color: "#B8962E", backgroundColor: "#FFFBF0" }}>
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
                  <span className="font-semibold">Validado</span>
                </div>
              )}
            </div>

            <PostComposer onPost={(p) => setPosts((prev) => [p, ...prev])} />

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">No hay publicaciones todavía. ¡Sé el primero!</p>
              </div>
            ) : (
              posts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <FeedPostCard
                    post={post}
                    canModerate={canModerate}
                    onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                  />
                </motion.div>
              ))
            )}
          </div>

          <aside className="hidden lg:block w-64 flex-shrink-0">
            {user?.role === "student" && <StudentSidebar />}
            {user?.role === "teacher" && <TeacherSidebar />}
            {user?.role === "company" && <CompanySidebar />}
          </aside>
        </div>
      </div>
    </div>
  );
}
