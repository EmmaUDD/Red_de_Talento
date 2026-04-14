import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Building2, MapPin, Briefcase, CheckCircle, MessageSquare,
  Heart, Share2, Flag, Clock, ChevronRight, ExternalLink,
  Shield, Eye, PenSquare, Users,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { ReportModal } from "../shared/ReportModal";
import { apiRequest } from "../../../api/client";

interface PerfilEmpresa {
  id: number;
  usuario: { id: number; first_name: string; last_name: string; email: string };
  nombre_empresa: string;
  industria: string;
  rut: string | null;
}

interface Oferta {
  id: number;
  titulo: string;
  descripcion: string;
  especialidad_requerida: string;
  remuneracion: string | null;
  ubicacion: string | null;
  modalidad: string;
  activa: boolean;
  fecha_publicacion: string;
}

interface PostFeed {
  id: number;
  contenido: string;
  tipo: string;
  fecha: string;
  autor: number;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)} días`;
}

export function CompanyProfile() {
  const { user } = useUser();
  const isOwn = user?.role === "company";
  const [tab, setTab] = useState<"perfil" | "empleos" | "publicaciones">("perfil");
  const [perfil, setPerfil] = useState<PerfilEmpresa | null>(null);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [posts, setPosts] = useState<PostFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [industria, setIndustria] = useState("");
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return;
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const perfilRes = await apiRequest(`/api/perfil/empresa/${userId}/`);
      if (perfilRes.ok) {
        const data = await perfilRes.json();
        setPerfil(data);
        setIndustria(data.industria);

        // Cargar ofertas y publicaciones en paralelo
        const [ofertasRes, feedRes] = await Promise.all([
          apiRequest("/api/ofertas/"),
          apiRequest("/api/feed/"),
        ]);
        if (ofertasRes.ok) setOfertas(await ofertasRes.json());
        if (feedRes.ok) {
          const feedData = await feedRes.json();
          setPosts(feedData.filter((p: PostFeed) => String(p.autor) === userId));
        }
      }
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    if (!perfil) return;
    setSaving(true);
    try {
      const res = await apiRequest(`/api/perfil/empresa/${perfil.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ industria }),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Cargando perfil...</p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <p className="text-slate-400 text-sm">No se encontró el perfil de empresa.</p>
      </div>
    );
  }

  const activeJobs = ofertas.filter((o) => o.activa);

  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="bg-white border-b border-slate-200">
          {/* Cover */}
          <div className="relative h-36 md:h-44 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1565010640914-8d817b58d808?w=1200&h=300&fit=crop&auto=format"
              className="w-full h-full object-cover"
              alt="cover empresa"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/55" />
            <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-slate-900 text-xs" style={{ fontWeight: 600 }}>Empresa Verificada</span>
            </div>
            {!isOwn && (
              <button onClick={() => setShowReport(true)}
                className="absolute top-3 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-red-500 hover:bg-red-50 transition-colors">
                <Flag className="w-3.5 h-3.5" />
                <span className="text-xs" style={{ fontWeight: 600 }}>Reportar</span>
              </button>
            )}
          </div>

          <div className="max-w-3xl mx-auto px-4 pb-0">
            <div className="flex items-end gap-4 -mt-10 mb-4 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-slate-200 border-4 border-white shadow-md flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.2 }}>
                      {perfil.nombre_empresa}
                    </h1>
                    <p className="text-slate-600 text-sm mt-0.5" style={{ fontWeight: 500 }}>
                      {editMode ? (
                        <input
                          value={industria}
                          onChange={(e) => setIndustria(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      ) : perfil.industria}
                    </p>
                    {perfil.rut && (
                      <p className="text-slate-400 text-xs mt-0.5">RUT: {perfil.rut}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isOwn && (
                      editMode ? (
                        <>
                          <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm" style={{ fontWeight: 600 }}>
                            {saving ? "Guardando..." : "Guardar"}
                          </button>
                          <button onClick={() => setEditMode(false)}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm" style={{ fontWeight: 500 }}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setEditMode(true)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm transition-colors" style={{ fontWeight: 600 }}>
                          <PenSquare className="w-4 h-4" /> Editar perfil
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Ofertas activas", value: activeJobs.length },
                { label: "Publicaciones", value: posts.length },
                { label: "Industria", value: perfil.industria.split(" ")[0] },
              ].map((s) => (
                <div key={s.label} className="text-center py-2">
                  <p className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.25rem", lineHeight: 1 }}>{s.value}</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 -mx-4 px-4">
              {(["perfil", "empleos", "publicaciones"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm capitalize border-b-2 -mb-px transition-all ${tab === t ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                  style={{ fontWeight: tab === t ? 700 : 500 }}>
                  {t === "perfil" ? "Perfil" : t === "empleos" ? `Empleos (${activeJobs.length})` : `Posts (${posts.length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
          {/* ── PERFIL TAB ── */}
          {tab === "perfil" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-slate-900 mb-3" style={{ fontSize: "0.875rem", fontWeight: 700 }}>Información de la empresa</h3>
                <div className="space-y-2.5 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span>{perfil.nombre_empresa}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span>{perfil.industria}</span>
                  </div>
                  {perfil.rut && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <span>RUT: {perfil.rut}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl p-5 flex items-center gap-4" style={{ backgroundColor: "#FFFBF0", border: "2px solid #D4AF37" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#D4AF37" }}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.9rem" }}>Empresa registrada en la plataforma</p>
                  <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                    Comprometida con la inserción laboral técnica de los estudiantes del Liceo Cardenal Caro.
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#B8962E", fontWeight: 600 }}>
                    {activeJobs.length} oferta{activeJobs.length !== 1 ? "s" : ""} activa{activeJobs.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── EMPLEOS TAB ── */}
          {tab === "empleos" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <p className="text-slate-500 text-sm">
                <span className="text-slate-900" style={{ fontWeight: 600 }}>{activeJobs.length}</span> ofertas activas
              </p>
              {activeJobs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">No hay ofertas activas.</div>
              ) : activeJobs.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{job.titulo}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200" style={{ fontWeight: 600 }}>
                            {job.modalidad}
                          </span>
                          {job.remuneracion && (
                            <span className="text-xs text-slate-500">💰 {job.remuneracion}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(job.fecha_publicacion)}
                    </p>
                    {isOwn && (
                      <button className="flex items-center gap-1.5 text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors" style={{ fontWeight: 600 }}>
                        <Eye className="w-3.5 h-3.5" /> Ver postulantes
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── PUBLICACIONES TAB ── */}
          {tab === "publicaciones" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">No has publicado nada aún.</div>
              ) : posts.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center gap-3 p-4 pb-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{perfil.nombre_empresa}</p>
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

      {showReport && (
        <ReportModal targetName={perfil.nombre_empresa} targetType="empresa" onClose={() => setShowReport(false)} />
      )}
    </>
  );
}