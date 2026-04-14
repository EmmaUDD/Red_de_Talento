import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BookOpen, Users, Award, CheckCircle, MessageSquare,
  Heart, Share2, CalendarDays, Clock, Star, Zap,
  ExternalLink, BarChart2, GraduationCap,
  MapPin, Play, PenSquare, ShieldCheck,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { apiRequest } from "../../../api/client";
 
interface PerfilDocente {
  id: number;
  usuario: { id: number; first_name: string; last_name: string; email: string };
  departamento: string;
  bio: string | null;
}
 
export function TeacherProfile() {
  const { user } = useUser();
  const isOwn = user?.role === "teacher";
  const [tab, setTab] = useState<"perfil" | "publicaciones">("perfil");
  const [perfil, setPerfil] = useState<PerfilDocente | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
 
  const userId = localStorage.getItem("user_id");
 
  useEffect(() => {
    if (!userId) return;
    // Intentar cargar el perfil del docente actual
    apiRequest(`/api/perfil/docente/${userId}/`)
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setPerfil(data);
          setBio(data.bio ?? "");
        }
      })
      .catch(() => {});
 
    // Cargar publicaciones del feed
    apiRequest("/api/feed/")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          // Filtrar solo las del usuario actual
          setPosts(data.filter((p: any) => String(p.autor) === userId));
        }
      })
      .catch(() => {});
  }, [userId]);
 
  const handleSave = async () => {
    if (!perfil) return;
    setSaving(true);
    try {
      const res = await apiRequest(`/api/perfil/docente/${perfil.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ bio }),
      });
      if (res.ok) {
        const data = await res.json();
        setPerfil(data);
        setEditMode(false);
      }
    } catch {}
    setSaving(false);
  };
 
  const toggleLike = (id: number) => {
    setLikedPosts((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };
 
  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)} días`;
  }
 
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200">
        {/* Cover */}
        <div className="relative h-36 md:h-44 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1758685734511-4f49ce9a382b?w=1200&h=300&fit=crop&auto=format"
            className="w-full h-full object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900/60" />
          <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            <span className="text-slate-900 text-xs" style={{ fontWeight: 600 }}>Docente Verificado · Liceo Cardenal Caro</span>
          </div>
        </div>
 
        <div className="max-w-3xl mx-auto px-4 pb-0">
          <div className="flex items-end gap-4 -mt-10 mb-4 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-slate-200 border-4 border-white shadow-md flex items-center justify-center flex-shrink-0">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.2 }}>
                    {perfil ? `${perfil.usuario.first_name} ${perfil.usuario.last_name}` : user?.name ?? "Docente"}
                  </h1>
                  <p className="text-slate-600 text-sm mt-0.5" style={{ fontWeight: 500 }}>
                    {perfil?.departamento ?? "Liceo Cardenal Caro"}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Liceo Cardenal Caro · Lo Espejo
                  </p>
                </div>
                {isOwn && (
                  <div className="flex gap-2">
                    {editMode ? (
                      <>
                        <button onClick={handleSave} disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm transition-colors" style={{ fontWeight: 600 }}>
                          {saving ? "Guardando..." : "Guardar"}
                        </button>
                        <button onClick={() => setEditMode(false)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm" style={{ fontWeight: 500 }}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEditMode(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm transition-colors" style={{ fontWeight: 600 }}>
                        <PenSquare className="w-4 h-4" /> Editar perfil
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
 
          {/* Tabs */}
          <div className="flex border-b border-slate-200 -mx-4 px-4">
            {(["perfil", "publicaciones"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm border-b-2 -mb-px transition-all ${tab === t ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                style={{ fontWeight: tab === t ? 700 : 500 }}>
                {t === "perfil" ? "Perfil" : `Publicaciones (${posts.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>
 
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        {tab === "perfil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Bio */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 mb-3" style={{ fontSize: "0.875rem", fontWeight: 700 }}>Sobre mí</h3>
              {editMode ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Escribe una descripción sobre ti..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              ) : (
                <p className="text-slate-600 text-sm leading-relaxed">
                  {perfil?.bio ?? "Sin descripción aún."}
                </p>
              )}
            </div>
 
            {/* Contact */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 mb-3" style={{ fontSize: "0.875rem", fontWeight: 700 }}>Contacto institucional</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span>{perfil?.departamento ?? "Liceo Cardenal Caro"}</span>
                </div>
                {perfil?.usuario.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span>{perfil.usuario.email}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
 
        {tab === "publicaciones" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No has publicado nada aún.</div>
            ) : posts.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-3 p-4 pb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{user?.name ?? "Docente"}</p>
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <p className="text-slate-400 text-xs">{timeAgo(p.fecha)}</p>
                  </div>
                </div>
                <div className="px-4 pb-3">
                  <p className="text-slate-700 text-sm leading-relaxed">{p.contenido}</p>
                </div>
                <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-4">
                  <button onClick={() => toggleLike(p.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${likedPosts.includes(p.id) ? "text-red-500" : "text-slate-400 hover:text-slate-600"}`}>
                    <Heart className="w-4 h-4" fill={likedPosts.includes(p.id) ? "currentColor" : "none"} />
                  </button>
                  <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}