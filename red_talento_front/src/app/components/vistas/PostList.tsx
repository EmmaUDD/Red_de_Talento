import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, CalendarDays, Briefcase, Bell, MapPin, Clock, MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import type { FeedPost } from "@/app/types";
import { feedApi } from "@/api/api";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

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

const tipoConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  post:     { label: "Publicación", icon: FileText,    color: "bg-slate-100 text-slate-600 border-slate-200" },
  evento:   { label: "Evento",      icon: CalendarDays, color: "bg-blue-50 text-blue-700 border-blue-200" },
  oferta:   { label: "Oferta",      icon: Briefcase,    color: "bg-green-50 text-green-700 border-green-200" },
  anuncio:  { label: "Anuncio",     icon: Bell,         color: "bg-amber-50 text-amber-700 border-amber-200" },
};

function timeAgo(fecha: string) {
  try {
    return formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es });
  } catch {
    return "";
  }
}

function imageSrc(url: string) {
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

function PostCard({
  post,
  nombre,
  fotoSrc,
  onDelete,
}: {
  post: FeedPost;
  nombre: string;
  fotoSrc: string | null;
  onDelete?: (id: number) => void;
}) {
  const cfg = tipoConfig[post.tipo] ?? tipoConfig.post;
  const Icon = cfg.icon;
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Imagen adjunta */}
      {post.imagen_url && (
        <img
          src={imageSrc(post.imagen_url)}
          alt="imagen publicación"
          className="w-full max-h-72 object-cover"
        />
      )}

      <div className="p-4">
        {/* Cabecera: avatar + nombre + fecha + menú */}
        <div className="flex items-center gap-2.5 mb-3">
          {fotoSrc ? (
            <img src={fotoSrc} className="w-8 h-8 rounded-lg object-cover border border-slate-100 flex-shrink-0" alt={nombre} />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
              <span className="text-slate-600 text-xs font-bold">{nombre.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 text-xs font-semibold truncate">{nombre}</p>
            <p className="text-slate-400 text-xs">{timeAgo(post.fecha)}</p>
          </div>
          {/* Badge tipo */}
          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.color}`} style={{ fontWeight: 600 }}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>
          {/* Menú 3 puntos (solo si se proporciona onDelete) */}
          {onDelete && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setShowMenu((s) => !s)}
                disabled={deleting}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                {deleting
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <MoreHorizontal className="w-3.5 h-3.5" />}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={handleEliminar}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar publicación
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contenido */}
        {post.tipo === "evento" ? (() => {
          const ev = parseEvento(post.contenido);
          return (
            <div className="rounded-xl overflow-hidden border border-purple-200">
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/70 text-xs" style={{ fontWeight: 700, letterSpacing: "0.06em", fontSize: "0.6rem" }}>EVENTO</p>
                  <p className="text-white text-sm leading-tight" style={{ fontWeight: 700 }}>{ev.titulo || post.contenido.split("\n")[0]}</p>
                </div>
              </div>
              {(ev.datetime || ev.lugar) && (
                <div className="bg-purple-50 px-4 py-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-purple-100">
                  {ev.datetime && (
                    <span className="flex items-center gap-1.5 text-purple-700" style={{ fontSize: "0.72rem", fontWeight: 500 }}>
                      <Clock className="w-3 h-3" />{ev.datetime}
                    </span>
                  )}
                  {ev.lugar && (
                    <span className="flex items-center gap-1.5 text-purple-700" style={{ fontSize: "0.72rem", fontWeight: 500 }}>
                      <MapPin className="w-3 h-3" />{ev.lugar}
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
          );
        })() : (
          <p className="text-slate-700 text-sm leading-relaxed">{post.contenido}</p>
        )}
      </div>
    </div>
  );
}

export function PostList({
  posts,
  nombre,
  fotoSrc,
  onDeletePost,
}: {
  posts: FeedPost[];
  nombre: string;
  fotoSrc: string | null;
  onDeletePost?: (id: number) => void;
}) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">No hay publicaciones aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <PostCard
            post={post}
            nombre={nombre}
            fotoSrc={fotoSrc}
            onDelete={onDeletePost}
          />
        </motion.div>
      ))}
    </div>
  );
}
