import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useUser } from "../../context/UserContext";
import { apiRequest } from "../../../api/client";
import { FeedPostCard } from "./FeedPost";
import {
  Image, Briefcase, CalendarDays, Send, Award, Users,
  TrendingUp, Bell, Pin, CheckCircle,
} from "lucide-react";
 
interface BackendPost {
  id: number;
  autor: number;
  autor_nombre?: string;
  tipo: "post" | "empleo" | "evento";
  contenido: string;
  fecha: string;
}
 
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)} días`;
}
 
function PostComposer({ onPublished }: { onPublished: () => void }) {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [postType, setPostType] = useState<"post" | "empleo" | "evento">("post");
  const [loading, setLoading] = useState(false);
 
  const postTypes =
    user?.role === "company"
      ? [
          { id: "post", label: "Post", icon: Send },
          { id: "empleo", label: "Empleo", icon: Briefcase },
          { id: "evento", label: "Evento", icon: CalendarDays },
        ]
      : user?.role === "teacher"
      ? [
          { id: "post", label: "Anuncio", icon: Send },
          { id: "evento", label: "Evento", icon: CalendarDays },
        ]
      : [{ id: "post", label: "Publicación", icon: Send }];
 
  const handlePublish = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await apiRequest("/api/feed/", {
        method: "POST",
        body: JSON.stringify({ contenido: text, tipo: postType }),
      });
      setText("");
      onPublished();
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Award className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              user?.role === "student"
                ? "Comparte tu avance, proyecto o logro..."
                : user?.role === "teacher"
                ? "Publica un anuncio o evento para la comunidad..."
                : "Publica una oferta, oportunidad o novedad..."
            }
            rows={2}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 placeholder:text-slate-400 transition-all"
          />
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-1.5">
              {postTypes.map((t) => {
                const Icon = t.icon;
                const active = postType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setPostType(t.id as typeof postType)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                    style={{ fontWeight: active ? 600 : 500 }}
                  >
                    <Icon className="w-3 h-3" />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <button
              disabled={!text.trim() || loading}
              onClick={handlePublish}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                text.trim()
                  ? "bg-slate-900 hover:bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
              style={{ fontWeight: 600 }}
            >
              {loading ? "Publicando..." : "Publicar"}
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
          <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Tu perfil</p>
        </div>
        <div className="space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 text-xs">Completitud</span>
              <span className="text-xs" style={{ fontWeight: 700, color: "#D4AF37" }}>72%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full">
              <div className="h-full rounded-full" style={{ width: "72%", backgroundColor: "#D4AF37" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
function TeacherSidebar() {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4" style={{ color: "#D4AF37" }} />
          <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Pendientes</p>
        </div>
        <p className="text-slate-500 text-xs">Revisa la sección de validación para ver las solicitudes pendientes.</p>
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
          <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Tu actividad</p>
        </div>
        <p className="text-slate-500 text-xs">Publica ofertas y busca candidatos desde el menú lateral.</p>
      </div>
    </div>
  );
}
 
export function HomeFeed() {
  const { user } = useUser();
  const canModerate = user?.role === "teacher";
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [loading, setLoading] = useState(true);
 
  const loadPosts = async () => {
    try {
      const res = await apiRequest("/api/feed/");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    loadPosts();
  }, []);
 
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Feed */}
          <div className="flex-1 space-y-4">
            {/* Welcome */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>
                  Hola, {user?.name?.split(" ")[0]} 👋
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {user?.role === "student"
                    ? "Estudiante"
                    : user?.role === "teacher"
                    ? "Docente"
                    : "Empresa"}
                </p>
              </div>
              {user?.role === "student" && (
                <div className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border" style={{ borderColor: "#D4AF37", color: "#B8962E", backgroundColor: "#FFFBF0" }}>
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
                  <span style={{ fontWeight: 600 }}>Validado</span>
                </div>
              )}
            </div>
 
            {/* Composer */}
            <PostComposer onPublished={loadPosts} />
 
            {/* Posts */}
            {loading ? (
              <div className="text-center py-10 text-slate-400 text-sm">Cargando publicaciones...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No hay publicaciones aún. ¡Sé el primero!</div>
            ) : (
              posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <FeedPostCard
                    post={{
                      id: post.id,
                      type: post.tipo === "empleo" ? "job" : post.tipo === "evento" ? "event" : "post",
                      author: {
                        name: post.autor_nombre ?? `Usuario ${post.autor}`,
                        role: user?.role ?? "student",
                        avatar: null,
                        subtitle: "",
                      },
                      time: timeAgo(post.fecha),
                      content: post.contenido,
                      likes: 0,
                      comments: 0,
                    }}
                    canModerate={canModerate}
                    onDeleted={loadPosts}
                    postAutorId={post.autor}
                  />
                </motion.div>
              ))
            )}
          </div>
 
          {/* Sidebar */}
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