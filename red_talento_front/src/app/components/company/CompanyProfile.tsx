import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, MapPin, Mail, Users, Briefcase,
  CheckCircle, MessageSquare, Heart, Share2,
  Clock, X, UserCheck, UserX, Loader2,
  Award, Shield, Eye, PenSquare, Camera, MoreHorizontal, Trash2,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { ofertasApi, feedApi, perfilApi, postulacionesApi } from "@/api/api";
import { usePerfil } from "@/app/context/PerfilContext";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
import { ReportModal } from "@/app/components/shared/ReportModal";
import type { OfertaLaboral, FeedPost } from "@/app/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Postulante = Record<string, any>;

export function CompanyProfile() {
  const { user, refreshUser } = useAuth();
  const { openPerfil } = usePerfil();
  const [tab, setTab] = useState<"perfil" | "empleos" | "publicaciones">("perfil");
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [showReport, setShowReport] = useState(false);
  const [ofertas, setOfertas] = useState<OfertaLaboral[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [menuPostId, setMenuPostId] = useState<number | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre_empresa: "",
    industria: "",
    descripcion: "",
    ubicacion: "",
    horario: "",
    que_buscamos: "",
    first_name: "",
    last_name: "",
    email: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const postMenuRef = useRef<HTMLDivElement>(null);
  const [loadingOfertas, setLoadingOfertas] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<OfertaLaboral | null>(null);
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [loadingPostulantes, setLoadingPostulantes] = useState(false);
  const [actualizando, setActualizando] = useState<number | null>(null);

  const nombre = user?.nombre_empresa ?? (user ? `${user.first_name} ${user.last_name}`.trim() : "—");
  const industria = user?.industria ?? "Sin especificar";
  const descripcion = user?.descripcion || "";
  const ubicacion = user?.ubicacion || "Lo Espejo, RM";
  const horario = user?.horario || "Lun–Vie · 08:30–18:00 hrs";
  const queBuscamos = user?.que_buscamos || "";

  useEffect(() => {
    ofertasApi.getMisOfertas()
      .then(setOfertas)
      .catch(() => setOfertas([]))
      .finally(() => setLoadingOfertas(false));

    feedApi.getPosts()
      .then((allPosts) => {
        setPosts(allPosts.slice(0, 5));
        const counts: Record<number, number> = {};
        allPosts.forEach((p) => { counts[p.id] = p.likes; });
        setLikeCounts(counts);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, []);

  useEffect(() => {
    if (menuPostId === null) return;
    const handler = (e: MouseEvent) => {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) {
        setMenuPostId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuPostId]);

  const handleEliminarPost = async (id: number) => {
    setMenuPostId(null);
    setDeletingPostId(id);
    try {
      await feedApi.eliminarPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {}
    setDeletingPostId(null);
  };

  const handleAbrirEdit = () => {
    setEditForm({
      nombre_empresa: user?.nombre_empresa ?? "",
      industria: user?.industria ?? "",
      descripcion: user?.descripcion ?? "",
      ubicacion: user?.ubicacion ?? "",
      horario: user?.horario ?? "",
      que_buscamos: user?.que_buscamos ?? "",
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      email: user?.email ?? "",
    });
    setShowEditModal(true);
  };

  const handleGuardarEdit = async () => {
    setSavingEdit(true);
    try {
      const fd = new FormData();
      fd.append("nombre_empresa", editForm.nombre_empresa);
      fd.append("industria", editForm.industria);
      fd.append("descripcion", editForm.descripcion);
      fd.append("ubicacion", editForm.ubicacion);
      fd.append("horario", editForm.horario);
      fd.append("que_buscamos", editForm.que_buscamos);
      fd.append("first_name", editForm.first_name);
      fd.append("last_name", editForm.last_name);
      fd.append("email", editForm.email);
      await perfilApi.updatePerfil(fd);
      await refreshUser();
      setShowEditModal(false);
    } catch { /* silently fail */ }
    finally { setSavingEdit(false); }
  };

  const toggleLike = async (id: number) => {
    const liked = likedPosts.includes(id);
    setLikedPosts((p) => liked ? p.filter((x) => x !== id) : [...p, id]);
    setLikeCounts((p) => ({ ...p, [id]: liked ? (p[id] ?? 0) - 1 : (p[id] ?? 0) + 1 }));
    try {
      await feedApi.likear(id);
    } catch {}
  };

  const abrirPostulantes = async (oferta: OfertaLaboral) => {
    setOfertaSeleccionada(oferta);
    setPostulantes([]);
    setLoadingPostulantes(true);
    try {
      const data = await postulacionesApi.getDeOferta(oferta.id);
      setPostulantes((data as unknown as Postulante[]).filter((p) => p.estado === "Pendiente"));
    } catch {
      setPostulantes([]);
    } finally {
      setLoadingPostulantes(false);
    }
  };

  const handleActualizarEstado = async (postulacionId: number, nuevoEstado: string) => {
    setActualizando(postulacionId);
    try {
      await postulacionesApi.actualizar(postulacionId, nuevoEstado);
      setPostulantes((prev) => prev.filter((p) => p.id !== postulacionId));
      if (nuevoEstado === "Contratado") {
        setOfertaSeleccionada(null);
        setOfertas((prev) => prev.filter((o) => o.id !== ofertaSeleccionada?.id));
      }
    } catch { /* silently fail */ }
    finally { setActualizando(null); }
  };


  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="bg-white border-b border-slate-200">
          <div className="relative h-36 md:h-44 overflow-hidden">
            <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #0f2557 0%, #1a3a7c 60%, #0f2557 100%)" }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-slate-900/40" />
            <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-slate-900 text-xs font-semibold">Empresa Verificada</span>
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
                  <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                    {user?.foto_perfil ? (
                      <img src={user.foto_perfil.startsWith("http") ? user.foto_perfil : `${BASE_URL}${user.foto_perfil}`}
                        className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </label>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white shadow bg-blue-500 z-10">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div className="flex-1 pb-1">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-slate-900 font-extrabold" style={{ fontSize: "1.2rem", lineHeight: 1.2 }}>{nombre}</h1>
                    <p className="text-slate-600 text-sm mt-0.5 font-medium">{industria}</p>
                    <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Lo Espejo, Región Metropolitana
                    </p>
                  </div>
                  <button onClick={handleAbrirEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold transition-colors shadow-sm">
                    <PenSquare className="w-4 h-4" />
                    Editar perfil
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: "Ofertas activas", value: ofertas.length.toString() },
                { label: "Publicaciones", value: posts.length.toString() },
                { label: "Aliado Liceo", value: "✓", gold: true },
                { label: "Lo Espejo", value: "📍" },
              ].map((k) => (
                <div key={k.label} className="text-center py-2">
                  <p className="text-slate-900 font-extrabold" style={{ fontSize: "1.25rem", lineHeight: 1, color: k.gold ? "#D4AF37" : undefined }}>
                    {k.value}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-tight">{k.label}</p>
                </div>
              ))}
            </div>

            <div className="flex border-b border-slate-200 -mx-4 px-4">
              {(["perfil", "empleos", "publicaciones"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm border-b-2 -mb-px transition-all ${tab === t ? "border-slate-900 text-slate-900 font-bold" : "border-transparent text-slate-500 hover:text-slate-700 font-medium"}`}>
                  {t === "perfil" ? "Perfil" : t === "empleos" ? `Empleos (${ofertas.length})` : `Posts (${posts.length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-5">
          {tab === "perfil" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-slate-900 font-bold mb-3" style={{ fontSize: "0.875rem" }}>Sobre la empresa</h3>
                {descripcion ? (
                  <p className="text-slate-600 text-sm leading-relaxed">{descripcion}</p>
                ) : (
                  <p className="text-slate-400 text-sm italic">
                    Aún no has agregado una descripción.{" "}
                    <button onClick={handleAbrirEdit} className="text-slate-600 underline underline-offset-2">Editar perfil</button>
                  </p>
                )}
                {industria && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">{industria}</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-slate-900 font-bold mb-4" style={{ fontSize: "0.875rem" }}>Información de contacto</h3>
                <div className="space-y-3">
                  {[
                    { icon: Mail, label: user?.email ?? "contacto@empresa.cl" },
                    { icon: MapPin, label: ubicacion },
                    { icon: Clock, label: horario },
                  ].map((c) => {
                    const Icon = c.icon;
                    return (
                      <div key={c.label} className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span>{c.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFFBF0" }}>
                    <Award className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  </div>
                  <h3 className="text-slate-900 font-bold" style={{ fontSize: "0.875rem" }}>¿Qué buscamos en un candidato?</h3>
                </div>
                {queBuscamos ? (
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{queBuscamos}</p>
                ) : (
                  <p className="text-slate-400 text-sm italic">
                    Aún no has descrito qué tipo de candidato buscas.{" "}
                    <button onClick={handleAbrirEdit} className="text-slate-600 underline underline-offset-2">Editar perfil</button>
                  </p>
                )}
              </div>

              <div className="rounded-xl p-5 flex items-center gap-4" style={{ backgroundColor: "#FFFBF0", border: "2px solid #D4AF37" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#D4AF37" }}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold" style={{ fontSize: "0.9rem" }}>Empresa Aliada del Liceo Cardenal Caro</p>
                  <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                    Comprometida con la inserción laboral técnica de Lo Espejo.
                  </p>
                  <p className="text-xs font-semibold mt-1" style={{ color: "#B8962E" }}>{ofertas.length} oferta{ofertas.length !== 1 ? "s" : ""} activa{ofertas.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "empleos" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {loadingOfertas ? (
                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" /></div>
              ) : ofertas.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  No tienes ofertas activas. Ve a "Publicar" para crear una.
                </div>
              ) : (
                <>
                  <p className="text-slate-500 text-sm">
                    <span className="text-slate-900 font-semibold">{ofertas.length}</span> ofertas activas
                  </p>
                  {ofertas.map((job, i) => (
                    <motion.div key={job.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="bg-white rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-slate-900 text-sm font-semibold">{job.titulo}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
                                {job.tipo}
                              </span>
                              {job.salario && <span className="text-xs text-slate-500">💰 {job.salario}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-slate-900 text-xs font-bold">{job.postulaciones_count ?? 0}</p>
                          <p className="text-slate-400 text-xs">postulantes</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-slate-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(job.fecha_publicacion).toLocaleDateString("es-CL")}
                        </p>
                        <button
                          onClick={() => abrirPostulantes(job)}
                          className="flex items-center gap-1.5 text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                          Ver postulantes
                          {(job.postulaciones_count ?? 0) > 0 && (
                            <span className="ml-0.5 w-5 h-5 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center" style={{ fontSize: "0.65rem" }}>
                              {job.postulaciones_count}
                            </span>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          )}

          {tab === "publicaciones" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {loadingPosts ? (
                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" /></div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">No hay publicaciones aún.</div>
              ) : (
                posts.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-3 p-4 pb-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-200 overflow-hidden border border-slate-100 flex-shrink-0 flex items-center justify-center">
                        {user?.foto_perfil ? (
                          <img src={user.foto_perfil} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-slate-900 text-sm font-semibold">{nombre}</p>
                          <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <p className="text-slate-400 text-xs">{new Date(p.fecha).toLocaleDateString("es-CL")}</p>
                      </div>
                      {p.autor_id === user?.id && (
                        <div className="relative flex-shrink-0" ref={postMenuRef}>
                          <button
                            onClick={() => setMenuPostId(menuPostId === p.id ? null : p.id)}
                            disabled={deletingPostId === p.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                          >
                            {deletingPostId === p.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <MoreHorizontal className="w-4 h-4" />}
                          </button>
                          {menuPostId === p.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
                              <button
                                onClick={() => handleEliminarPost(p.id)}
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

                    <div className="px-4 pb-3">
                      <p className="text-slate-700 text-sm leading-relaxed">{p.contenido}</p>
                    </div>

                    <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-4">
                      <button onClick={() => toggleLike(p.id)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${likedPosts.includes(p.id) ? "text-red-500" : "text-slate-400 hover:text-slate-600"}`}>
                        <Heart className="w-4 h-4" fill={likedPosts.includes(p.id) ? "currentColor" : "none"} />
                        <span className="text-xs">{likeCounts[p.id] ?? p.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">{p.comentarios}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </div>

      {showReport && (
        <ReportModal
          targetName={nombre}
          targetType="empresa"
          onClose={() => setShowReport(false)}
        />
      )}

      <AnimatePresence>
        {ofertaSeleccionada && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOfertaSeleccionada(null)}
              className="fixed inset-0 bg-slate-900/40 z-40"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
                <div>
                  <p className="text-slate-500 text-xs font-semibold">Postulantes a</p>
                  <p className="text-slate-900 text-base font-bold">{ofertaSeleccionada.titulo}</p>
                </div>
                <button onClick={() => setOfertaSeleccionada(null)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingPostulantes ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : postulantes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                      <Users className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-slate-600 text-sm font-semibold">Sin postulantes aún</p>
                    <p className="text-slate-400 text-xs mt-1">Cuando alguien postule a esta oferta aparecerá aquí.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-500 text-xs font-semibold">
                      {postulantes.length} postulante{postulantes.length !== 1 ? "s" : ""}
                    </p>
                    {postulantes.map((p) => {
                      const estadoConfig: Record<string, { label: string; color: string }> = {
                        Pendiente:   { label: "Pendiente",  color: "bg-amber-50 text-amber-700 border-amber-200" },
                        Contratado:  { label: "Aceptado",   color: "bg-green-50 text-green-700 border-green-200" },
                        Negado:      { label: "Rechazado",  color: "bg-red-50 text-red-600 border-red-200" },
                      };
                      const cfg = estadoConfig[p.estado] ?? estadoConfig.Pendiente;
                      return (
                        <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            {p.estudiante_foto ? (
                              <img src={p.estudiante_foto} className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-slate-600 text-sm font-bold">{(p.estudiante_nombre || "?").charAt(0)}</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-900 text-sm font-semibold truncate">{p.estudiante_nombre || "Estudiante"}</p>
                              {p.estudiante_especialidad && (
                                <p className="text-slate-500 text-xs">{p.estudiante_especialidad}</p>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>

                          {p.mensaje_estudiante && (
                            <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 rounded-lg px-3 py-2 mb-3 border border-slate-100">
                              "{p.mensaje_estudiante}"
                            </p>
                          )}

                          <div className="flex items-center gap-2">
                            {p.estudiante_perfil_id && (
                              <button
                                onClick={() => openPerfil(p.estudiante_perfil_id, "estudiante")}
                                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-1">
                                <Eye className="w-3 h-3" /> Ver perfil
                              </button>
                            )}
                            {p.estado !== "Contratado" && (
                              <button
                                onClick={() => handleActualizarEstado(p.id, "Contratado")}
                                disabled={actualizando === p.id}
                                className="flex-1 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                                {actualizando === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                                Aceptar
                              </button>
                            )}
                            {p.estado !== "Negado" && (
                              <button
                                onClick={() => handleActualizarEstado(p.id, "Negado")}
                                disabled={actualizando === p.id}
                                className="py-1.5 px-3 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                                <UserX className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <p className="text-slate-900 text-sm font-bold">Editar perfil de empresa</p>
                <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-6 max-h-[72vh] overflow-y-auto">

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-3 font-bold">Datos de la empresa</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-semibold">Nombre de la empresa</label>
                      <input
                        value={editForm.nombre_empresa}
                        onChange={(e) => setEditForm((f) => ({ ...f, nombre_empresa: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-semibold">Industria / Rubro</label>
                      <input
                        value={editForm.industria}
                        onChange={(e) => setEditForm((f) => ({ ...f, industria: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        placeholder="ej. Construcción, TI, Electricidad..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-semibold">Descripción / Sobre la empresa</label>
                      <textarea
                        value={editForm.descripcion}
                        onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))}
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                        placeholder="Describe tu empresa, su historia y misión..."
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-3 font-bold">Contacto y ubicación</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-semibold">Correo electrónico de contacto</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        placeholder="contacto@empresa.cl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5 font-semibold">Ubicación</label>
                        <input
                          value={editForm.ubicacion}
                          onChange={(e) => setEditForm((f) => ({ ...f, ubicacion: e.target.value }))}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                          placeholder="ej. Lo Espejo, RM"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5 font-semibold">Horario de atención</label>
                        <input
                          value={editForm.horario}
                          onChange={(e) => setEditForm((f) => ({ ...f, horario: e.target.value }))}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                          placeholder="ej. Lun–Vie 09:00–18:00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-3 font-bold">¿Qué buscamos en un candidato?</p>
                  <textarea
                    value={editForm.que_buscamos}
                    onChange={(e) => setEditForm((f) => ({ ...f, que_buscamos: e.target.value }))}
                    rows={4}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                    placeholder="Describe el perfil ideal: especialidad, disponibilidad, habilidades blandas, ubicación geográfica preferida..."
                  />
                </div>

                <div className="border-t border-slate-100" />

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-3 font-bold">Datos del representante</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-semibold">Nombre</label>
                      <input
                        value={editForm.first_name}
                        onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        placeholder="Nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-semibold">Apellido</label>
                      <input
                        value={editForm.last_name}
                        onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        placeholder="Apellido"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarEdit}
                  disabled={savingEdit || !editForm.nombre_empresa.trim() || !editForm.industria.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Guardar cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
