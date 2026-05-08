import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, MapPin, Mail, Users, Briefcase,
  CheckCircle, MessageSquare, Heart, Share2,
  Clock, X, UserCheck, UserX,
  Award, Shield, Eye, PenSquare, Camera, MoreHorizontal, Trash2, Save,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { ofertasApi, feedApi, perfilApi, postulacionesApi } from "@/api/api";
import { usePerfil } from "@/app/context/PerfilContext";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
import { ReportModal } from "@/app/components/shared/ReportModal";
import type { OfertaLaboral, FeedPost } from "@/app/types";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

type Postulante = Record<string, any>;

const S = {
  card: {
    backgroundColor: "white", borderRadius: 16,
    border: "1px solid #E8E4DC", padding: 20,
    overflow: "hidden" as const,
  } as React.CSSProperties,
  input: {
    width: "100%", boxSizing: "border-box" as const,
    backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
    borderRadius: 10, padding: "9px 13px",
    fontSize: "0.855rem", color: "#0d1b35", outline: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "border-color 0.15s, background-color 0.15s",
  } as React.CSSProperties,
  label: {
    display: "block" as const, color: "#94a3b8",
    fontSize: "0.68rem", fontWeight: 700 as const,
    textTransform: "uppercase" as const, letterSpacing: "0.08em",
    marginBottom: 6,
  } as React.CSSProperties,
};

const estadoPostStyle: Record<string, React.CSSProperties> = {
  Pendiente:  { backgroundColor: "#FFFBF0", color: "#b45309", border: "1px solid #fde68a" },
  Contratado: { backgroundColor: "#F0FDF4", color: "#15803d", border: "1px solid #bbf7d0" },
  Negado:     { backgroundColor: "#FEF2F2", color: "#dc2626", border: "1px solid #fecaca" },
};

const estadoLabel: Record<string, string> = {
  Pendiente: "Pendiente", Contratado: "Aceptado", Negado: "Rechazado",
};

const tipoStyle: Record<string, React.CSSProperties> = {
  "Part-time": { backgroundColor: "#FFFBF0", color: "#b45309", border: "1px solid #fde68a" },
  "Full-time": { backgroundColor: "#F0FDF4", color: "#15803d", border: "1px solid #bbf7d0" },
  "Práctica":  { backgroundColor: "#EFF6FF", color: "#1d4ed8", border: "1px solid #bfdbfe" },
};

function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div className="animate-spin" style={{ width: size, height: size, borderRadius: "50%", border: "2.5px solid #E8E4DC", borderTopColor: "#D4AF37", flexShrink: 0 }} />
  );
}

function focusGold(el: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  el.currentTarget.style.borderColor = "#D4AF37";
  el.currentTarget.style.backgroundColor = "#FFFFFF";
}
function blurGold(el: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  el.currentTarget.style.borderColor = "#E8E4DC";
  el.currentTarget.style.backgroundColor = "#F6F5F0";
}

function CardHeading({ icon: Icon, title, right }: { icon?: React.ElementType; title: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {Icon && (
          <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon style={{ width: 12, height: 12, color: "#8C7B6B" }} />
          </div>
        )}
        <p style={{ ...S.label, margin: 0 }}>{title}</p>
      </div>
      {right}
    </div>
  );
}

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

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre_empresa: "", industria: "", descripcion: "",
    ubicacion: "", horario: "", que_buscamos: "",
    first_name: "", last_name: "", email: "",
  });
  const [saving, setSaving] = useState(false);

  const postMenuRef = useRef<HTMLDivElement>(null);
  const [loadingOfertas, setLoadingOfertas] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<OfertaLaboral | null>(null);
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [loadingPostulantes, setLoadingPostulantes] = useState(false);
  const [actualizando, setActualizando] = useState<number | null>(null);

  const nombre     = user?.nombre_empresa ?? (user ? `${user.first_name} ${user.last_name}`.trim() : "—");
  const industria  = user?.industria  ?? "Sin especificar";
  const descripcion = user?.descripcion || "";
  const ubicacion  = user?.ubicacion  || "Lo Espejo, RM";
  const horario    = user?.horario    || "Lun–Vie · 08:30–18:00 hrs";
  const queBuscamos = user?.que_buscamos || "";
  const fotoSrc    = user?.foto_perfil
    ? user.foto_perfil.startsWith("http") ? user.foto_perfil : `${BASE_URL}${user.foto_perfil}`
    : null;

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.href = FONT_URL; link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    ofertasApi.getMisOfertas()
      .then(setOfertas)
      .catch(() => setOfertas([]))
      .finally(() => setLoadingOfertas(false));

    if (user?.id) {
      feedApi.getPostsDeUsuario(user.id)
        .then((myPosts) => {
          setPosts(myPosts);
          const counts: Record<number, number> = {};
          myPosts.forEach((p) => { counts[p.id] = p.likes; });
          setLikeCounts(counts);
        })
        .catch(() => setPosts([]))
        .finally(() => setLoadingPosts(false));
    } else {
      setLoadingPosts(false);
    }
  }, [user?.id]);

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

  const handleOpenEdit = () => {
    setEditForm({
      nombre_empresa: user?.nombre_empresa ?? "",
      industria:      user?.industria      ?? "",
      descripcion:    user?.descripcion    ?? "",
      ubicacion:      user?.ubicacion      ?? "",
      horario:        user?.horario        ?? "",
      que_buscamos:   user?.que_buscamos   ?? "",
      first_name:     user?.first_name     ?? "",
      last_name:      user?.last_name      ?? "",
      email:          user?.email          ?? "",
    });
    setEditMode(true);
    setTab("perfil");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
      await perfilApi.updatePerfil(fd);
      await refreshUser();
      setEditMode(false);
    } catch { /* noop */ }
    finally { setSaving(false); }
  };

  const handleEliminarPost = async (id: number) => {
    setMenuPostId(null);
    setDeletingPostId(id);
    try {
      await feedApi.eliminarPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {}
    setDeletingPostId(null);
  };

  const toggleLike = async (id: number) => {
    const liked = likedPosts.includes(id);
    setLikedPosts((p) => liked ? p.filter((x) => x !== id) : [...p, id]);
    setLikeCounts((p) => ({ ...p, [id]: liked ? (p[id] ?? 0) - 1 : (p[id] ?? 0) + 1 }));
    try { await feedApi.likear(id); } catch {}
  };

  const abrirPostulantes = async (oferta: OfertaLaboral) => {
    setOfertaSeleccionada(oferta);
    setPostulantes([]);
    setLoadingPostulantes(true);
    try {
      const data = await postulacionesApi.getDeOferta(oferta.id);
      setPostulantes((data as unknown as Postulante[]).filter((p) => p.estado === "Pendiente"));
    } catch { setPostulantes([]); }
    finally { setLoadingPostulantes(false); }
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
    } catch {}
    finally { setActualizando(null); }
  };

  const TABS = [
    { id: "perfil"        as const, label: "Perfil" },
    { id: "empleos"       as const, label: `Empleos (${ofertas.length})` },
    { id: "publicaciones" as const, label: `Posts (${posts.length})` },
  ];

  return (
    <>
      <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        <div style={{ backgroundColor: "white", borderBottom: "1px solid #E8E4DC" }}>

          <div style={{
            height: 160, width: "100%", position: "relative", overflow: "hidden",
            backgroundColor: "#0d1b35",
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}>
            <div style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: "50%",
              background: "linear-gradient(145deg, transparent 40%, rgba(212,175,55,0.05) 100%)",
            }} />
            <div style={{
              position: "absolute", top: 14, left: 16,
              display: "flex", alignItems: "center", gap: 5,
              backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)",
              borderRadius: 999, padding: "5px 12px",
            }}>
              <CheckCircle style={{ width: 11, height: 11, color: "#16a34a", flexShrink: 0 }} />
              <span style={{ fontSize: "0.67rem", fontWeight: 700, color: "#1a2236", letterSpacing: "0.02em" }}>
                Empresa Verificada · Liceo Cardenal Caro
              </span>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: "#D4AF37" }} />
          </div>

          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>

              <label style={{ cursor: "pointer", position: "relative", flexShrink: 0, marginTop: -44 }}>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await perfilApi.uploadFoto(file);
                  await refreshUser();
                }} />
                <div style={{
                  width: 96, height: 96, borderRadius: 18,
                  border: "4px solid #FFFFFF",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  overflow: "hidden", backgroundColor: "#0d1b35",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  {fotoSrc ? (
                    <img src={fotoSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: "2rem", fontFamily: "'Playfair Display', serif" }}>
                      {nombre.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ position: "absolute", inset: -5, borderRadius: 22, border: "1.5px solid rgba(212,175,55,0.4)", pointerEvents: "none" }} />
                <div
                  style={{ position: "absolute", inset: 0, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.38)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}
                >
                  <Camera style={{ width: 18, height: 18, color: "white" }} />
                </div>
                <div style={{ position: "absolute", bottom: -4, right: -4, width: 26, height: 26, borderRadius: 9, backgroundColor: "#D4AF37", border: "2.5px solid white", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, boxShadow: "0 2px 8px rgba(212,175,55,0.4)" }}>
                  <Award style={{ width: 12, height: 12, color: "white" }} />
                </div>
              </label>

              <div style={{ flex: 1, paddingTop: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h1 style={{ margin: 0, color: "#0d1b35", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: "1.3rem", lineHeight: 1.2 }}>
                      {nombre}
                    </h1>
                    <p style={{ margin: "4px 0 0", color: "#475569", fontSize: "0.855rem", fontWeight: 500 }}>
                      {industria}
                    </p>
                    <p style={{ margin: "3px 0 0", color: "#8C7B6B", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin style={{ width: 10, height: 10 }} />
                      Lo Espejo, Región Metropolitana
                    </p>
                  </div>

                  {editMode ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={handleSave} disabled={saving} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 16px", borderRadius: 10, border: "none",
                        backgroundColor: saving ? "#E8E4DC" : "#0d1b35",
                        color: saving ? "#94a3b8" : "white",
                        fontSize: "0.8rem", fontWeight: 700,
                        cursor: saving ? "not-allowed" : "pointer",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        transition: "background-color 0.15s",
                      }}>
                        {saving ? <Spinner size={13} /> : <Save style={{ width: 13, height: 13 }} />}
                        {saving ? "Guardando…" : "Guardar"}
                      </button>
                      <button onClick={() => setEditMode(false)} style={{
                        display: "flex", alignItems: "center", padding: "8px 10px",
                        borderRadius: 10, border: "1px solid #E8E4DC",
                        backgroundColor: "#F6F5F0", color: "#64748b", cursor: "pointer",
                      }}>
                        <X style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={handleOpenEdit} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 10,
                      border: "1px solid #E8E4DC", backgroundColor: "white",
                      color: "#0d1b35", fontSize: "0.8rem", fontWeight: 600,
                      cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      <PenSquare style={{ width: 12, height: 12 }} />
                      Editar perfil
                    </button>
                  )}
                </div>
              </div>
            </div>

            {editMode && (
              <div style={{
                margin: "14px 0 0", padding: "9px 14px",
                backgroundColor: "#FFFBF0", border: "1px solid #fde68a",
                borderRadius: 10, fontSize: "0.78rem", color: "#92400e", fontWeight: 600,
              }}>
                Modo edición activo — guarda los cambios antes de salir
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", margin: "14px 0 0", backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 12 }}>
              {[
                { label: "Ofertas",       value: ofertas.length > 0 ? `${ofertas.length}` : "—" },
                { label: "Posts",         value: posts.length   > 0 ? `${posts.length}`   : "—" },
                { label: "Aliado Liceo",  value: "✓",  gold: true },
                { label: "Ubicación",     value: "Lo Espejo" },
              ].map((k, i) => (
                <div key={k.label} style={{ textAlign: "center", padding: "11px 8px", borderRight: i < 3 ? "1px solid #E8E4DC" : "none" }}>
                  <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: k.gold ? "#D4AF37" : "#0d1b35", margin: 0 }}>
                    {k.value}
                  </p>
                  <p style={{ ...S.label, marginTop: 2 }}>{k.label}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", borderBottom: "2px solid #E8E4DC", marginTop: 14 }}>
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  flex: 1, padding: "10px 4px",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "0.83rem", fontWeight: 600,
                  color: tab === t.id ? "#0d1b35" : "#94a3b8",
                  borderBottom: tab === t.id ? "2px solid #D4AF37" : "2px solid transparent",
                  marginBottom: -2, transition: "color 0.15s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px" }}>

          {tab === "perfil" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <div style={S.card}>
                <CardHeading icon={Building2} title="Sobre la empresa" right={
                  !editMode && (
                    <button onClick={handleOpenEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "#0d1b35", fontSize: "0.75rem", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>
                      Editar →
                    </button>
                  )
                } />
                {editMode ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={S.label}>Nombre de la empresa</label>
                      <input value={editForm.nombre_empresa} onChange={(e) => setEditForm((f) => ({ ...f, nombre_empresa: e.target.value }))} placeholder="Nombre de la empresa" style={S.input} onFocus={focusGold} onBlur={blurGold} />
                    </div>
                    <div>
                      <label style={S.label}>Industria / Rubro</label>
                      <input value={editForm.industria} onChange={(e) => setEditForm((f) => ({ ...f, industria: e.target.value }))} placeholder="ej. Construcción, TI, Electricidad..." style={S.input} onFocus={focusGold} onBlur={blurGold} />
                    </div>
                    <div>
                      <label style={S.label}>Descripción</label>
                      <textarea value={editForm.descripcion} onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))} rows={3} placeholder="Describe tu empresa, su historia y misión..." style={{ ...S.input, resize: "none" } as React.CSSProperties} onFocus={focusGold} onBlur={blurGold} />
                    </div>
                  </div>
                ) : (
                  <>
                    {descripcion ? (
                      <p style={{ margin: 0, color: "#475569", fontSize: "0.875rem", lineHeight: 1.7 }}>{descripcion}</p>
                    ) : (
                      <p style={{ color: "#8C7B6B", fontSize: "0.85rem", fontStyle: "italic", margin: 0 }}>
                        Aún no has agregado una descripción.{" "}
                        <button onClick={handleOpenEdit} style={{ color: "#0d1b35", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Editar perfil
                        </button>
                      </p>
                    )}
                    {industria && (
                      <div style={{ marginTop: 12 }}>
                        <span style={{ display: "inline-block", backgroundColor: "#F6F5F0", color: "#475569", border: "1px solid #E8E4DC", borderRadius: 20, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 600 }}>
                          {industria}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div style={S.card}>
                <CardHeading icon={Mail} title="Información de contacto" />
                {editMode ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={S.label}>Correo electrónico</label>
                      <input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} placeholder="contacto@empresa.cl" style={S.input} onFocus={focusGold} onBlur={blurGold} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={S.label}>Ubicación</label>
                        <input value={editForm.ubicacion} onChange={(e) => setEditForm((f) => ({ ...f, ubicacion: e.target.value }))} placeholder="ej. Lo Espejo, RM" style={S.input} onFocus={focusGold} onBlur={blurGold} />
                      </div>
                      <div>
                        <label style={S.label}>Horario de atención</label>
                        <input value={editForm.horario} onChange={(e) => setEditForm((f) => ({ ...f, horario: e.target.value }))} placeholder="ej. Lun–Vie 09:00–18:00" style={S.input} onFocus={focusGold} onBlur={blurGold} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { Icon: Mail,  label: user?.email ?? "contacto@empresa.cl" },
                      { Icon: MapPin, label: ubicacion },
                      { Icon: Clock, label: horario },
                    ].map(({ Icon, label }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon style={{ width: 13, height: 13, color: "#8C7B6B" }} />
                        </div>
                        <span style={{ color: "#475569", fontSize: "0.855rem" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={S.card}>
                <CardHeading icon={Award} title="¿Qué buscamos en un candidato?" right={
                  !editMode && (
                    <button onClick={handleOpenEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "#0d1b35", fontSize: "0.75rem", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>
                      Editar →
                    </button>
                  )
                } />
                {editMode ? (
                  <textarea value={editForm.que_buscamos} onChange={(e) => setEditForm((f) => ({ ...f, que_buscamos: e.target.value }))} rows={4} placeholder="Describe el perfil ideal: especialidad, disponibilidad, habilidades blandas..." style={{ ...S.input, resize: "none" } as React.CSSProperties} onFocus={focusGold} onBlur={blurGold} />
                ) : queBuscamos ? (
                  <p style={{ color: "#475569", fontSize: "0.875rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>{queBuscamos}</p>
                ) : (
                  <p style={{ color: "#8C7B6B", fontSize: "0.85rem", fontStyle: "italic", margin: 0 }}>
                    Aún no has descrito qué tipo de candidato buscas.{" "}
                    <button onClick={handleOpenEdit} style={{ color: "#0d1b35", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Editar perfil
                    </button>
                  </p>
                )}
              </div>

              {editMode && (
                <div style={S.card}>
                  <CardHeading title="Datos del representante" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={S.label}>Nombre</label>
                      <input value={editForm.first_name} onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))} placeholder="Nombre" style={S.input} onFocus={focusGold} onBlur={blurGold} />
                    </div>
                    <div>
                      <label style={S.label}>Apellido</label>
                      <input value={editForm.last_name} onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))} placeholder="Apellido" style={S.input} onFocus={focusGold} onBlur={blurGold} />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 16, backgroundColor: "#FFFBF0", border: "2px solid #D4AF37", borderRadius: 16, padding: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, backgroundColor: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield style={{ width: 20, height: 20, color: "white" }} />
                </div>
                <div>
                  <p style={{ margin: 0, color: "#0d1b35", fontWeight: 700, fontSize: "0.875rem" }}>
                    Empresa Aliada del Liceo Cardenal Caro
                  </p>
                  <p style={{ margin: "3px 0 0", color: "#8C7B6B", fontSize: "0.78rem" }}>
                    Comprometida con la inserción laboral técnica de Lo Espejo.
                  </p>
                  <p style={{ margin: "4px 0 0", color: "#b45309", fontSize: "0.75rem", fontWeight: 700 }}>
                    {ofertas.length} oferta{ofertas.length !== 1 ? "s" : ""} activa{ofertas.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "empleos" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loadingOfertas ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "52px 0" }}><Spinner /></div>
              ) : ofertas.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <Briefcase style={{ width: 22, height: 22, color: "#C9B99A" }} />
                  </div>
                  <p style={{ color: "#0d1b35", fontWeight: 700, fontSize: "0.9rem", margin: "0 0 4px" }}>No tienes ofertas activas</p>
                  <p style={{ color: "#8C7B6B", fontSize: "0.8rem", margin: 0 }}>Ve a "Publicar" para crear una oferta laboral</p>
                </div>
              ) : (
                <>
                  <p style={{ color: "#8C7B6B", fontSize: "0.78rem", marginBottom: 4 }}>
                    <span style={{ color: "#0d1b35", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{ofertas.length}</span> ofertas activas
                  </p>
                  {ofertas.map((job, i) => (
                    <motion.div key={job.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={S.card}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Briefcase style={{ width: 16, height: 16, color: "#D4AF37" }} />
                          </div>
                          <div>
                            <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.875rem", fontWeight: 700 }}>{job.titulo}</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>
                              <span style={{ ...(tipoStyle[job.tipo] ?? {}), borderRadius: 20, padding: "2px 9px", fontSize: "0.68rem", fontWeight: 700 }}>{job.tipo}</span>
                              {job.salario && <span style={{ color: "#8C7B6B", fontSize: "0.72rem", alignSelf: "center" }}>💰 {job.salario}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.4rem", lineHeight: 1, color: (job.postulaciones_count ?? 0) > 0 ? "#D4AF37" : "#0d1b35" }}>
                            {job.postulaciones_count ?? 0}
                          </p>
                          <p style={{ ...S.label, marginTop: 2 }}>postulantes</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid #F1EDE5" }}>
                        <span style={{ color: "#94a3b8", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock style={{ width: 11, height: 11 }} />
                          {new Date(job.fecha_publicacion).toLocaleDateString("es-CL")}
                        </span>
                        <button onClick={() => abrirPostulantes(job)} style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: "#0d1b35", color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          <Eye style={{ width: 13, height: 13 }} />
                          Ver postulantes
                          {(job.postulaciones_count ?? 0) > 0 && (
                            <span style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "#D4AF37", color: "#0d1b35", fontSize: "0.6rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {loadingPosts ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "52px 0" }}><Spinner /></div>
              ) : posts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <MessageSquare style={{ width: 22, height: 22, color: "#C9B99A" }} />
                  </div>
                  <p style={{ color: "#0d1b35", fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>No hay publicaciones aún.</p>
                </div>
              ) : (
                posts.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid #E8E4DC", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, backgroundColor: "#0d1b35", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {fotoSrc ? <img src={fotoSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Building2 style={{ width: 16, height: 16, color: "#D4AF37" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.85rem", fontWeight: 700 }}>{nombre}</p>
                          <CheckCircle style={{ width: 13, height: 13, color: "#D4AF37" }} />
                        </div>
                        <p style={{ margin: "1px 0 0", color: "#94a3b8", fontSize: "0.72rem" }}>
                          {new Date(p.fecha).toLocaleDateString("es-CL")}
                        </p>
                      </div>
                      {p.autor_id === user?.id && (
                        <div style={{ position: "relative", flexShrink: 0 }} ref={postMenuRef}>
                          <button onClick={() => setMenuPostId(menuPostId === p.id ? null : p.id)} disabled={deletingPostId === p.id}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#94a3b8", display: "flex" }}>
                            {deletingPostId === p.id ? <Spinner size={15} /> : <MoreHorizontal style={{ width: 16, height: 16 }} />}
                          </button>
                          {menuPostId === p.id && (
                            <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, width: 176, backgroundColor: "white", borderRadius: 12, border: "1px solid #E8E4DC", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden" }}>
                              <button onClick={() => handleEliminarPost(p.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, color: "#dc2626", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                <Trash2 style={{ width: 14, height: 14 }} />
                                Eliminar publicación
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "0 16px 12px" }}>
                      <p style={{ margin: 0, color: "#334155", fontSize: "0.875rem", lineHeight: 1.6 }}>{p.contenido}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 16px", borderTop: "1px solid #F1EDE5" }}>
                      <button onClick={() => toggleLike(p.id)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: likedPosts.includes(p.id) ? "#ef4444" : "#94a3b8", fontSize: "0.78rem", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <Heart style={{ width: 15, height: 15 }} fill={likedPosts.includes(p.id) ? "currentColor" : "none"} />
                        {likeCounts[p.id] ?? p.likes}
                      </button>
                      <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <MessageSquare style={{ width: 15, height: 15 }} />
                        {p.comentarios}
                      </button>
                      <button style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                        <Share2 style={{ width: 15, height: 15 }} />
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
        <ReportModal targetName={nombre} targetType="empresa" onClose={() => setShowReport(false)} />
      )}

      <AnimatePresence>
        {ofertaSeleccionada && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOfertaSeleccionada(null)}
              style={{ position: "fixed", inset: 0, backgroundColor: "rgba(13,27,53,0.45)", zIndex: 40 }}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              style={{ position: "fixed", top: 0, right: 0, height: "100%", width: "100%", maxWidth: 420, backgroundColor: "white", zIndex: 50, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(13,27,53,0.15)" }}
            >
              <div style={{ backgroundColor: "#0d1b35", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "18px 18px", borderBottom: "3px solid #D4AF37", padding: "20px 20px 16px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Postulantes a</p>
                    <p style={{ margin: "4px 0 0", color: "white", fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.05rem" }}>
                      {ofertaSeleccionada.titulo}
                    </p>
                  </div>
                  <button onClick={() => setOfertaSeleccionada(null)} style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
                    <X style={{ width: 14, height: 14, color: "rgba(255,255,255,0.7)" }} />
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {loadingPostulantes ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}><Spinner /></div>
                ) : postulantes.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 20px", textAlign: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                      <Users style={{ width: 22, height: 22, color: "#C9B99A" }} />
                    </div>
                    <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700 }}>Sin postulantes aún</p>
                    <p style={{ margin: "4px 0 0", color: "#8C7B6B", fontSize: "0.78rem" }}>Cuando alguien postule aparecerá aquí.</p>
                  </div>
                ) : (
                  <>
                    <p style={{ ...S.label, margin: "0 0 4px" }}>{postulantes.length} postulante{postulantes.length !== 1 ? "s" : ""}</p>
                    {postulantes.map((p) => (
                      <div key={p.id} style={{ backgroundColor: "white", border: "1px solid #E8E4DC", borderRadius: 14, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          {p.estudiante_foto ? (
                            <img src={p.estudiante_foto} style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid #E8E4DC" }} />
                          ) : (
                            <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: "1rem", fontFamily: "'Playfair Display', serif" }}>
                                {(p.estudiante_nombre || "?").charAt(0)}
                              </span>
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.875rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.estudiante_nombre || "Estudiante"}
                            </p>
                            {p.estudiante_especialidad && <p style={{ margin: "2px 0 0", color: "#8C7B6B", fontSize: "0.75rem" }}>{p.estudiante_especialidad}</p>}
                          </div>
                          <span style={{ ...(estadoPostStyle[p.estado] ?? estadoPostStyle.Pendiente), borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700, flexShrink: 0 }}>
                            {estadoLabel[p.estado] ?? p.estado}
                          </span>
                        </div>
                        {p.mensaje_estudiante && (
                          <div style={{ backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 10, padding: "8px 12px", marginBottom: 10 }}>
                            <p style={{ margin: 0, color: "#475569", fontSize: "0.78rem", lineHeight: 1.5, fontStyle: "italic" }}>"{p.mensaje_estudiante}"</p>
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          {p.estudiante_perfil_id && (
                            <button onClick={() => openPerfil(p.estudiante_perfil_id, "estudiante")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px 12px", borderRadius: 8, border: "1px solid #E8E4DC", backgroundColor: "#F6F5F0", color: "#475569", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              <Eye style={{ width: 12, height: 12 }} /> Ver perfil
                            </button>
                          )}
                          {p.estado !== "Contratado" && (
                            <button onClick={() => handleActualizarEstado(p.id, "Contratado")} disabled={actualizando === p.id} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px 12px", borderRadius: 8, border: "none", backgroundColor: "#15803d", color: "white", fontSize: "0.75rem", fontWeight: 700, cursor: actualizando === p.id ? "not-allowed" : "pointer", opacity: actualizando === p.id ? 0.6 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              {actualizando === p.id ? <Spinner size={12} /> : <UserCheck style={{ width: 12, height: 12 }} />}
                              Aceptar
                            </button>
                          )}
                          {p.estado !== "Negado" && (
                            <button onClick={() => handleActualizarEstado(p.id, "Negado")} disabled={actualizando === p.id} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #fecaca", backgroundColor: "white", color: "#dc2626", fontSize: "0.75rem", fontWeight: 600, cursor: actualizando === p.id ? "not-allowed" : "pointer", opacity: actualizando === p.id ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <UserX style={{ width: 13, height: 13 }} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
