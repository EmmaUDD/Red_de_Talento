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

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const S = {
  label: {
    fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: 0,
  } as React.CSSProperties,
  inputBase: {
    backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 10,
    padding: "9px 12px", fontSize: "0.85rem",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: "none", width: "100%", boxSizing: "border-box" as const,
    color: "#0d1b35",
  } as React.CSSProperties,
  card: {
    backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC",
    borderRadius: 16, fontFamily: "'Plus Jakarta Sans', sans-serif",
    overflow: "hidden",
  } as React.CSSProperties,
};

const accentLeft: Record<string, string> = {
  oferta: "#D4AF37",
  evento: "#7c3aed",
  anuncio: "#16a34a",
  post: "transparent",
};
const typeChip: Record<string, React.CSSProperties> = {
  oferta:  { backgroundColor: "#FFFBF0", color: "#b45309",  border: "1px solid #fde68a" },
  evento:  { backgroundColor: "#F5F3FF", color: "#6d28d9",  border: "1px solid #ddd6fe" },
  anuncio: { backgroundColor: "#F0FDF4", color: "#15803d",  border: "1px solid #bbf7d0" },
};
const typeLabel: Record<string, string> = { oferta: "Empleo", evento: "Evento", anuncio: "Anuncio" };
const roleChip: Record<string, React.CSSProperties> = {
  student: { backgroundColor: "#EFF6FF", color: "#1d4ed8" },
  teacher: { backgroundColor: "#F0FDF4", color: "#15803d" },
  company: { backgroundColor: "#FFFBF0", color: "#b45309" },
};
const roleLabel: Record<string, string> = { student: "Estudiante", teacher: "Docente", company: "Empresa" };

function parseEvento(contenido: string) {
  const lines = contenido.split("\n");
  let titulo = "", datetime = "", lugar = "";
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

function FeedPostCard({ post, canModerate, onDelete }: { post: FeedPost; canModerate: boolean; onDelete?: (id: string) => void }) {
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
    } catch { setReporteEstado("error"); }
  };

  const handleLike = async () => {
    try {
      const { likes, ya_likeado } = await feedApi.likear(post.id);
      setLiked(ya_likeado);
      setLikesCount(likes);
    } catch { }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setLocalComments((prev) => [...prev, commentText.trim()]);
    setCommentText("");
  };

  const handleEliminar = async () => {
    setShowMenu(false); setDeleting(true);
    try {
      await feedApi.eliminarPost(post.id);
      onDelete?.(post.id);
    } catch { setDeleting(false); }
  };

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(post.fecha), { addSuffix: true, locale: es }); }
    catch { return post.fecha; }
  })();

  // Resolve photo URL
  const fotoSrc = post.autor_foto
    ? (post.autor_foto.startsWith("http") ? post.autor_foto : `${BASE_URL}${post.autor_foto}`)
    : null;

  return (
    <div style={{
      ...S.card,
      borderLeftWidth: 3,
      borderLeftStyle: "solid",
      borderLeftColor: accentLeft[post.tipo] ?? "transparent",
    }}>
      <div style={{ padding: "14px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
          <button
            onClick={handleOpenPerfil}
            disabled={!post.autor_perfil_id}
            style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", background: "none", border: "none", cursor: post.autor_perfil_id ? "pointer" : "default", minWidth: 0, padding: 0 }}
          >
            {fotoSrc ? (
              <img src={fotoSrc} alt={post.autor_nombre}
                style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", border: "2px solid #F0EDE8", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid #F0EDE8" }}>
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#D4AF37" }}>
                  {post.autor_nombre.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ color: "#0d1b35", fontSize: "0.875rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {post.autor_nombre}
                </span>
                {typeChip[post.tipo] && (
                  <span style={{ ...typeChip[post.tipo], fontSize: "0.6rem", fontWeight: 700, padding: "2px 7px", borderRadius: 999, flexShrink: 0 }}>
                    {typeLabel[post.tipo]}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                <span style={{ ...roleChip[post.autor_rol], fontSize: "0.6rem", fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>
                  {roleLabel[post.autor_rol]}
                </span>
                <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>{timeAgo}</span>
              </div>
            </div>
          </button>

          {(canModerate || isOwn) && (
            <div style={{ position: "relative", flexShrink: 0 }} ref={menuRef}>
              <button
                onClick={() => setShowMenu((s) => !s)}
                disabled={deleting}
                style={{ padding: 6, borderRadius: 8, color: "#94a3b8", backgroundColor: "transparent", border: "none", cursor: "pointer", display: "flex" }}
              >
                {deleting ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : <MoreHorizontal style={{ width: 15, height: 15 }} />}
              </button>
              {showMenu && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, width: 180, backgroundColor: "white", borderRadius: 12, border: "1px solid #E8E4DC", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden" }}>
                  {isOwn && (
                    <button onClick={handleEliminar} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: "0.8rem", color: "#ef4444", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      <Trash2 style={{ width: 14, height: 14 }} /> Eliminar publicación
                    </button>
                  )}
                  {canModerate && !isOwn && (
                    <button onClick={() => { setShowMenu(false); setShowReporte(true); setReporteEstado("idle"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: "0.8rem", color: "#475569", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      <Flag style={{ width: 14, height: 14 }} /> Reportar
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
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #ddd6fe" }}>
              <div style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CalendarDays style={{ width: 15, height: 15, color: "white" }} />
                </div>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>EVENTO</p>
                  <p style={{ color: "white", fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>{ev.titulo || post.contenido.split("\n")[0]}</p>
                </div>
              </div>
              {(ev.datetime || ev.lugar) && (
                <div style={{ backgroundColor: "#F5F3FF", padding: "8px 16px", display: "flex", flexWrap: "wrap", gap: "6px 16px", borderTop: "1px solid #ede9fe" }}>
                  {ev.datetime && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#6d28d9", fontSize: "0.75rem", fontWeight: 500 }}>
                      <Clock style={{ width: 12, height: 12, flexShrink: 0 }} />{ev.datetime}
                    </span>
                  )}
                  {ev.lugar && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#6d28d9", fontSize: "0.75rem", fontWeight: 500 }}>
                      <MapPin style={{ width: 12, height: 12, flexShrink: 0 }} />{ev.lugar}
                    </span>
                  )}
                </div>
              )}
              {ev.descripcion && (
                <div style={{ padding: "10px 16px" }}>
                  <p style={{ margin: 0, color: "#475569", fontSize: "0.8125rem", lineHeight: 1.65 }}>{ev.descripcion}</p>
                </div>
              )}
            </div>
          );
        })() : (
          <p style={{ margin: 0, color: "#334155", fontSize: "0.875rem", lineHeight: 1.7 }}>{post.contenido}</p>
        )}
      </div>

      {post.imagen_url && (
        <div style={{ borderTop: "1px solid #F0EDE8" }}>
          <img src={post.imagen_url} alt="imagen del post" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", padding: "8px 10px", borderTop: "1px solid #F0EDE8", gap: 2 }}>
        <button onClick={handleLike} style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "6px 10px", borderRadius: 8, fontSize: "0.75rem",
          color: liked ? "#ef4444" : "#64748b",
          backgroundColor: liked ? "#FEF2F2" : "transparent",
          border: "none", cursor: "pointer", fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s",
        }}>
          <Heart style={{ width: 14, height: 14 }} fill={liked ? "currentColor" : "none"} />
          {likesCount}
        </button>
        <button onClick={() => setShowComments((s) => !s)} style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "6px 10px", borderRadius: 8, fontSize: "0.75rem",
          color: showComments ? "#1d4ed8" : "#64748b",
          backgroundColor: showComments ? "#EFF6FF" : "transparent",
          border: "none", cursor: "pointer", fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s",
        }}>
          <MessageSquare style={{ width: 14, height: 14 }} />
          {post.comentarios + localComments.length}
        </button>
        {!isOwn && (
          <button onClick={() => { setShowReporte((s) => !s); setReporteEstado("idle"); }} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 10px", borderRadius: 8, fontSize: "0.75rem",
            color: showReporte ? "#ef4444" : "#94a3b8",
            backgroundColor: showReporte ? "#FEF2F2" : "transparent",
            border: "none", cursor: "pointer", marginLeft: "auto",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            <Flag style={{ width: 13, height: 13 }} />
          </button>
        )}
      </div>

      {showReporte && (
        <div style={{ padding: "12px 16px", borderTop: "1px solid #F0EDE8", backgroundColor: "#FAFAF8" }}>
          {reporteEstado === "ok" ? (
            <p style={{ margin: 0, color: "#15803d", fontSize: "0.75rem", fontWeight: 600 }}>Reporte enviado. Gracias por avisar.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ ...S.label }}>¿Por qué reportas esta publicación?</p>
              <select value={motivoReporte} onChange={(e) => setMotivoReporte(e.target.value)} style={S.inputBase}>
                <option value="">Selecciona un motivo...</option>
                <option value="Contenido inapropiado">Contenido inapropiado</option>
                <option value="Spam">Spam</option>
                <option value="Información falsa">Información falsa</option>
                <option value="Acoso o intimidación">Acoso o intimidación</option>
                <option value="Otro">Otro</option>
              </select>
              <textarea value={descripcionReporte} onChange={(e) => setDescripcionReporte(e.target.value)}
                placeholder="Describe brevemente el problema (opcional)..." rows={2}
                style={{ ...S.inputBase, resize: "none" }} />
              {reporteEstado === "error" && <p style={{ margin: 0, color: "#ef4444", fontSize: "0.75rem" }}>Ocurrió un error. Intenta de nuevo.</p>}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setShowReporte(false)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #E8E4DC", backgroundColor: "white", color: "#64748b", fontSize: "0.75rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Cancelar
                </button>
                <button onClick={handleReportar} disabled={!motivoReporte || reporteEstado === "loading"} style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  backgroundColor: motivoReporte && reporteEstado !== "loading" ? "#ef4444" : "#E8E4DC",
                  color: motivoReporte && reporteEstado !== "loading" ? "white" : "#94a3b8",
                  fontSize: "0.75rem", fontWeight: 600, cursor: motivoReporte ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", gap: 5,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {reporteEstado === "loading" && <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />}
                  Enviar reporte
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showComments && (
        <div style={{ padding: "12px 16px", borderTop: "1px solid #F0EDE8", backgroundColor: "#FAFAF8", display: "flex", flexDirection: "column", gap: 8 }}>
          {localComments.map((c, i) => (
            <div key={i} style={{ backgroundColor: "white", borderRadius: 9, padding: "8px 12px", fontSize: "0.8rem", color: "#334155", border: "1px solid #E8E4DC", lineHeight: 1.55 }}>
              {c}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Escribe un comentario..."
              style={{ ...S.inputBase, flex: 1, padding: "8px 12px" }} />
            <button onClick={handleAddComment} disabled={!commentText.trim()} style={{
              padding: "8px 14px", borderRadius: 10, border: "none",
              backgroundColor: commentText.trim() ? "#0d1b35" : "#E8E4DC",
              color: commentText.trim() ? "white" : "#94a3b8",
              cursor: commentText.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", flexShrink: 0,
              transition: "background-color 0.15s",
            }}>
              <Send style={{ width: 13, height: 13 }} />
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
          { id: "post",   label: "Post",    icon: Send },
          { id: "oferta", label: "Empleo",  icon: Briefcase,    redirect: "/publicar?tipo=empleo" },
          { id: "evento", label: "Evento",  icon: CalendarDays, redirect: "/publicar?tipo=evento" },
        ]
      : user?.role === "teacher"
      ? [
          { id: "post",   label: "Anuncio", icon: Send },
          { id: "evento", label: "Evento",  icon: CalendarDays, redirect: "/publicar-evento" },
        ]
      : [{ id: "post", label: "Publicación", icon: Send }];

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleQuitarImagen = () => {
    setImagen(null); setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePublicar = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await feedApi.crearPost(text.trim(), postType, imagen ?? undefined);
      const fullName = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "";
      const newPost: import("@/app/types").FeedPost = {
        id: `temp-${Date.now()}`,
        autor_nombre: fullName,
        autor_rol: (user?.role ?? "student") as import("@/app/types").Role,
        autor_foto: user?.foto_perfil,
        contenido: text.trim(),
        tipo: postType as import("@/app/types").FeedPost["tipo"],
        fecha: new Date().toISOString(),
        likes: 0, comentarios: 0, ya_likeado: false,
        imagen_url: preview ?? undefined,
      };
      onPost(newPost);
      setText(""); handleQuitarImagen();
    } catch { }
    finally { setLoading(false); }
  };

  const placeholder =
    user?.role === "student" ? "Comparte tu avance, proyecto o logro..."
    : user?.role === "teacher" ? "Publica un anuncio o evento para la comunidad..."
    : "Publica una oferta, oportunidad o novedad...";

  const fotoSrc = user?.foto_perfil
    ? (user.foto_perfil.startsWith("http") ? user.foto_perfil : `${BASE_URL}${user.foto_perfil}`)
    : null;
  const firstName = (user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "").split(" ")[0];

  return (
    <div style={{ ...S.card, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {fotoSrc ? (
          <img src={fotoSrc} alt={firstName}
            style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "2px solid #F0EDE8" }} />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#0d1b35", border: "2px solid #F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#D4AF37" }}>
              {firstName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <textarea
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder={placeholder} rows={2}
            style={{ ...S.inputBase, resize: "none" }}
            onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
            onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.backgroundColor = "#F6F5F0"; }}
          />
          {preview && (
            <div style={{ position: "relative", marginTop: 8, display: "inline-block" }}>
              <img src={preview} alt="preview" style={{ maxHeight: 192, borderRadius: 10, border: "1px solid #E8E4DC", objectFit: "cover" }} />
              <button onClick={handleQuitarImagen} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", backgroundColor: "rgba(13,27,53,0.7)", color: "white", border: "none", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ×
              </button>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {postTypes.map((t) => {
              const Icon = t.icon;
              const active = postType === t.id;
              return (
                <button key={t.id}
                  onClick={() => t.redirect ? navigate(t.redirect) : setPostType(t.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "5px 10px", borderRadius: 8, fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: active ? "#0d1b35" : "#F6F5F0",
                    color: active ? "white" : "#6B5D52",
                    border: active ? "none" : "1px solid #E8E4DC",
                    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s",
                  }}>
                  <Icon style={{ width: 11, height: 11 }} /> {t.label}
                </button>
              );
            })}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImagenChange} />
            <button onClick={() => fileInputRef.current?.click()} style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600,
              backgroundColor: imagen ? "#EFF6FF" : "#F6F5F0",
              color: imagen ? "#1d4ed8" : "#6B5D52",
              border: imagen ? "1px solid #bfdbfe" : "1px solid #E8E4DC",
              cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              <Image style={{ width: 11, height: 11 }} /> Foto
            </button>
            <button onClick={handlePublicar} disabled={!text.trim() || loading} style={{
              marginLeft: "auto", padding: "7px 18px", borderRadius: 9, border: "none",
              backgroundColor: text.trim() ? "#0d1b35" : "#E8E4DC",
              color: text.trim() ? "white" : "#94a3b8",
              fontSize: "0.8rem", fontWeight: 700,
              cursor: text.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s",
            }}>
              {loading && <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />}
              Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarCard({ children, accentGold }: { children: React.ReactNode; accentGold?: boolean }) {
  return (
    <div style={{
      backgroundColor: "white", borderRadius: 14,
      border: "1px solid #E8E4DC",
      borderLeftWidth: accentGold ? 3 : 1,
      borderLeftColor: accentGold ? "#D4AF37" : "#E8E4DC",
      padding: 16, fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {children}
    </div>
  );
}

function SidebarLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <a href={href} style={{
      display: "block", width: "100%", padding: "8px 0",
      borderRadius: 9, textAlign: "center",
      fontSize: "0.775rem", fontWeight: 700,
      backgroundColor: primary ? "#0d1b35" : "white",
      color: primary ? "white" : "#0d1b35",
      border: primary ? "none" : "1.5px solid #E8E4DC",
      textDecoration: "none", fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {label}
    </a>
  );
}

function StudentSidebar() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <SidebarCard>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#FFFBF0", border: "1px solid #F5E6C0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award style={{ width: 13, height: 13, color: "#D4AF37" }} />
          </div>
          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.8rem", fontWeight: 700 }}>Tu perfil</p>
        </div>
        <p style={{ margin: "0 0 12px", color: "#6B5D52", fontSize: "0.75rem", lineHeight: 1.6 }}>
          Completa tu perfil con habilidades y video-pitch para destacar ante las empresas.
        </p>
        <SidebarLink href="/perfil" label="Ver mi perfil →" />
      </SidebarCard>
      <SidebarCard>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp style={{ width: 13, height: 13, color: "#8C7B6B" }} />
          </div>
          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.8rem", fontWeight: 700 }}>Empleos disponibles</p>
        </div>
        <p style={{ margin: "0 0 12px", color: "#6B5D52", fontSize: "0.75rem", lineHeight: 1.6 }}>
          Revisa las ofertas activas de empresas aliadas del Liceo.
        </p>
        <SidebarLink href="/empleos" label="Ver empleos →" primary />
      </SidebarCard>
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
    { label: "Alumnos por validar", count: porValidar, style: { backgroundColor: "#FFFBF0", color: "#b45309" } },
    { label: "Solicitudes de registro", count: solicitudes, style: { backgroundColor: "#FEF2F2", color: "#dc2626" } },
    { label: "Denuncias pendientes", count: denuncias, style: { backgroundColor: "#F5F3FF", color: "#7c3aed" } },
  ].filter((item) => item.count > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <SidebarCard accentGold>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Bell style={{ width: 13, height: 13, color: "#D4AF37" }} />
          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.8rem", fontWeight: 700 }}>Pendientes</p>
        </div>
        {items.length === 0 ? (
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.75rem" }}>Todo al día. No hay pendientes.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#6B5D52", fontSize: "0.775rem" }}>{item.label}</span>
                <span style={{ ...item.style, fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </SidebarCard>
      <SidebarCard>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Pin style={{ width: 13, height: 13, color: "#8C7B6B" }} />
          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.8rem", fontWeight: 700 }}>Posts anclados</p>
        </div>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.55 }}>
          Puedes anclar anuncios desde el menú de cada publicación.
        </p>
      </SidebarCard>
    </div>
  );
}

function CompanySidebar() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <SidebarCard>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users style={{ width: 13, height: 13, color: "#8C7B6B" }} />
          </div>
          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.8rem", fontWeight: 700 }}>Buscar talento</p>
        </div>
        <p style={{ margin: "0 0 12px", color: "#6B5D52", fontSize: "0.75rem", lineHeight: 1.6 }}>
          Encuentra candidatos validados por el Liceo Cardenal Caro según tu especialidad.
        </p>
        <SidebarLink href="/buscar" label="Buscar candidatos →" primary />
      </SidebarCard>
      <SidebarCard>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp style={{ width: 13, height: 13, color: "#8C7B6B" }} />
          </div>
          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.8rem", fontWeight: 700 }}>Publicar empleo</p>
        </div>
        <p style={{ margin: "0 0 12px", color: "#6B5D52", fontSize: "0.75rem", lineHeight: 1.6 }}>
          Publica una oferta y llega directo a los estudiantes con el perfil que necesitas.
        </p>
        <SidebarLink href="/publicar" label="Crear oferta →" />
      </SidebarCard>
    </div>
  );
}

export function HomeFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.href = FONT_URL; link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    feedApi.getPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const canModerate = user?.role === "teacher";
  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "";
  const firstName = fullName.split(" ")[0];

  const roleSubline =
    user?.role === "student" ? `${user.especialidad ?? ""} · ${user.curso ?? ""}`
    : user?.role === "teacher" ? `Docente · ${user.departamento ?? ""}`
    : `${user?.nombre_empresa ?? ""} · ${user?.industria ?? ""}`;

  const fotoSrc = user?.foto_perfil
    ? (user.foto_perfil.startsWith("http") ? user.foto_perfil : `${BASE_URL}${user.foto_perfil}`)
    : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

            <div style={{
              backgroundColor: "#FFFFFF", borderRadius: 16, border: "1px solid #E8E4DC",
              overflow: "hidden",
            }}>
              <div style={{
                height: 52,
                backgroundColor: "#0d1b35",
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }} />
              <div style={{ padding: "0 18px 0", marginTop: -26 }}>
                {fotoSrc ? (
                  <img src={fotoSrc} alt={fullName}
                    style={{ width: 52, height: 52, borderRadius: 13, objectFit: "cover", border: "3px solid #FFFFFF", flexShrink: 0, display: "block" }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: 13, backgroundColor: "#0d1b35", border: "3px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#D4AF37" }}>
                      {firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ padding: "8px 18px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ ...S.label, marginBottom: 2 }}>Bienvenido de vuelta</p>
                  <h2 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: "1.15rem", color: "#0d1b35", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {firstName}
                  </h2>
                  <p style={{ margin: "2px 0 0", color: "#8C7B6B", fontSize: "0.72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{roleSubline}</p>
                </div>
                {user?.role === "student" && user.validado && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 9, border: "1px solid #D4AF37", color: "#B8962E", backgroundColor: "#FFFBF0", flexShrink: 0 }}>
                    <CheckCircle style={{ width: 12, height: 12, color: "#D4AF37" }} />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>Validado</span>
                  </div>
                )}
              </div>
            </div>

            <PostComposer onPost={(p) => setPosts((prev) => [p, ...prev])} />

            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
                <Loader2 style={{ width: 22, height: 22, color: "#D4AF37" }} className="animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, backgroundColor: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Send style={{ width: 20, height: 20, color: "#8C7B6B" }} />
                </div>
                <p style={{ color: "#8C7B6B", fontSize: "0.875rem", margin: 0 }}>No hay publicaciones todavía. ¡Sé el primero!</p>
              </div>
            ) : (
              posts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <FeedPostCard
                    post={post}
                    canModerate={canModerate}
                    onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                  />
                </motion.div>
              ))
            )}
          </div>

          <aside className="hidden lg:block" style={{ width: 232, flexShrink: 0 }}>
            {user?.role === "student" && <StudentSidebar />}
            {user?.role === "teacher" && <TeacherSidebar />}
            {user?.role === "company" && <CompanySidebar />}
          </aside>

        </div>
      </div>
    </div>
  );
}
