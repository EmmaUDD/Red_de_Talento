import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  FileText, CalendarDays, Briefcase, Bell,
  MapPin, Clock, MoreHorizontal, Trash2,
} from "lucide-react";
import type { FeedPost } from "@/app/types";
import { feedApi } from "@/api/api";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const S = {
  label: {
    fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: 0,
  } as React.CSSProperties,
};

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <div
      className="animate-spin"
      style={{ width: size, height: size, borderRadius: "50%", border: "2px solid #E8E4DC", borderTopColor: "#D4AF37", flexShrink: 0 }}
    />
  );
}

const tipoChip: Record<string, { label: string; icon: React.ElementType; style: React.CSSProperties; accentLeft: string }> = {
  post:    { label: "Publicación", icon: FileText,    style: { backgroundColor: "#F6F5F0", color: "#6B5D52",  border: "1px solid #E8E4DC"  }, accentLeft: "transparent" },
  evento:  { label: "Evento",      icon: CalendarDays, style: { backgroundColor: "#F5F3FF", color: "#6d28d9",  border: "1px solid #ddd6fe"  }, accentLeft: "#7c3aed"     },
  oferta:  { label: "Oferta",      icon: Briefcase,    style: { backgroundColor: "#FFFBF0", color: "#b45309",  border: "1px solid #fde68a"  }, accentLeft: "#D4AF37"     },
  anuncio: { label: "Anuncio",     icon: Bell,         style: { backgroundColor: "#F0FDF4", color: "#15803d",  border: "1px solid #bbf7d0"  }, accentLeft: "#16a34a"     },
};

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

function timeAgo(fecha: string) {
  try { return formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es }); }
  catch { return ""; }
}

function imageSrc(url: string) {
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

function PostCard({ post, nombre, fotoSrc, onDelete }: {
  post: FeedPost; nombre: string; fotoSrc: string | null; onDelete?: (id: number) => void;
}) {
  const cfg = tipoChip[post.tipo] ?? tipoChip.post;
  const Icon = cfg.icon;
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const handleEliminar = async () => {
    setShowMenu(false); setDeleting(true);
    try {
      await feedApi.eliminarPost(post.id);
      onDelete?.(post.id);
    } catch { setDeleting(false); }
  };

  return (
    <div style={{
      backgroundColor: "white", borderRadius: 14,
      border: "1px solid #E8E4DC",
      borderLeftWidth: 3, borderLeftStyle: "solid", borderLeftColor: cfg.accentLeft,
      overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
{post.imagen_url && (
        <img src={imageSrc(post.imagen_url)} alt="imagen publicación"
          style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block", borderBottom: "1px solid #F0EDE8" }} />
      )}

      <div style={{ padding: "14px 16px" }}>
<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          {fotoSrc ? (
            <img src={fotoSrc} alt={nombre}
              style={{ width: 32, height: 32, borderRadius: 9, objectFit: "cover", border: "1.5px solid #F0EDE8", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "#0d1b35", border: "1.5px solid #F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.85rem", fontWeight: 700, color: "#D4AF37" }}>
                {nombre.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.8rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {nombre}
            </p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.7rem" }}>{timeAgo(post.fecha)}</p>
          </div>

<div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, flexShrink: 0, ...cfg.style, fontSize: "0.62rem", fontWeight: 700 }}>
            <Icon style={{ width: 10, height: 10 }} />
            {cfg.label}
          </div>

{onDelete && (
            <div style={{ position: "relative", flexShrink: 0 }} ref={menuRef}>
              <button
                onClick={() => setShowMenu((s) => !s)}
                disabled={deleting}
                style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", transition: "background-color 0.1s" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F6F5F0"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                {deleting ? <Spinner size={13} /> : <MoreHorizontal style={{ width: 14, height: 14 }} />}
              </button>
              {showMenu && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", width: 180, backgroundColor: "white", border: "1px solid #E8E4DC", borderRadius: 12, boxShadow: "0 8px 24px rgba(13,27,53,0.1)", zIndex: 50, overflow: "hidden" }}>
                  <button
                    onClick={handleEliminar}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: "0.8rem", color: "#ef4444", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, transition: "background-color 0.1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FEF2F2"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                    Eliminar publicación
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

{post.tipo === "evento" ? (() => {
          const ev = parseEvento(post.contenido);
          return (
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #ddd6fe" }}>
              <div style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CalendarDays style={{ width: 13, height: 13, color: "white" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>EVENTO</p>
                  <p style={{ margin: 0, color: "white", fontSize: "0.85rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ev.titulo || post.contenido.split("\n")[0]}
                  </p>
                </div>
              </div>
              {(ev.datetime || ev.lugar) && (
                <div style={{ backgroundColor: "#F5F3FF", padding: "7px 14px", display: "flex", flexWrap: "wrap", gap: "4px 14px", borderTop: "1px solid #ede9fe" }}>
                  {ev.datetime && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#6d28d9", fontSize: "0.7rem", fontWeight: 500 }}>
                      <Clock style={{ width: 10, height: 10, flexShrink: 0 }} />{ev.datetime}
                    </span>
                  )}
                  {ev.lugar && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#6d28d9", fontSize: "0.7rem", fontWeight: 500 }}>
                      <MapPin style={{ width: 10, height: 10, flexShrink: 0 }} />{ev.lugar}
                    </span>
                  )}
                </div>
              )}
              {ev.descripcion && (
                <div style={{ padding: "10px 14px" }}>
                  <p style={{ margin: 0, color: "#475569", fontSize: "0.8rem", lineHeight: 1.65 }}>{ev.descripcion}</p>
                </div>
              )}
            </div>
          );
        })() : (
          <p style={{ margin: 0, color: "#334155", fontSize: "0.875rem", lineHeight: 1.7 }}>{post.contenido}</p>
        )}
      </div>
    </div>
  );
}

export function PostList({ posts, nombre, fotoSrc, onDeletePost }: {
  posts: FeedPost[]; nombre: string; fotoSrc: string | null; onDeletePost?: (id: number) => void;
}) {
  if (posts.length === 0) {
    return (
      <div style={{ backgroundColor: "white", border: "1px solid #E8E4DC", borderRadius: 14, padding: "40px 24px", textAlign: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <FileText style={{ width: 18, height: 18, color: "#C4BDB5" }} />
        </div>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.82rem" }}>No hay publicaciones aún.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <PostCard post={post} nombre={nombre} fotoSrc={fotoSrc} onDelete={onDeletePost} />
        </motion.div>
      ))}
    </div>
  );
}
