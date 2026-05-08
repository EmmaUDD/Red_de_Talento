import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, Users, Award, CheckCircle, Clock, Zap,
  ExternalLink, GraduationCap, Plus, MapPin, Mail,
  PenSquare, ShieldCheck, Save, X, Camera, Link2,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { perfilApi, cursosApi, feedApi } from "@/api/api";
import { PostList } from "@/app/components/vistas/PostList";
import type { FeedPost } from "@/app/types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const ESPECIALIDADES = [
  "Electricidad", "Computación e Informática", "Construcción",
  "Mecánica Automotriz", "Mecánica Industrial", "Todas las especialidades",
];

const S = {
  label: {
    fontSize: "0.68rem", fontWeight: 700 as const,
    color: "#94a3b8", textTransform: "uppercase" as const,
    letterSpacing: "0.08em", margin: 0,
  } as React.CSSProperties,
  input: {
    width: "100%", boxSizing: "border-box" as const,
    backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
    borderRadius: 10, padding: "9px 13px",
    fontSize: "0.855rem", color: "#0d1b35", outline: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "border-color 0.15s",
  } as React.CSSProperties,
  card: {
    backgroundColor: "white", borderRadius: 16,
    border: "1px solid #E8E4DC", padding: 20,
    overflow: "hidden" as const,
  } as React.CSSProperties,
};

function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="animate-spin"
      style={{
        width: size, height: size, borderRadius: "50%",
        border: "2.5px solid #E8E4DC", borderTopColor: "#D4AF37",
        flexShrink: 0,
      }}
    />
  );
}

function CardHeading({
  icon: Icon, title, right,
}: {
  icon?: React.ElementType; title: string; right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {Icon && (
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon style={{ width: 12, height: 12, color: "#8C7B6B" }} />
          </div>
        )}
        <p style={{ ...S.label }}>{title}</p>
      </div>
      {right}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", ...S.label, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function focusGold(el: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  el.currentTarget.style.borderColor = "#D4AF37";
  el.currentTarget.style.backgroundColor = "#FFFFFF";
}
function blurGold(el: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  el.currentTarget.style.borderColor = "#E8E4DC";
  el.currentTarget.style.backgroundColor = "#F6F5F0";
}

export function TeacherProfile() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<"perfil" | "cursos" | "publicaciones">("perfil");
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
  const [cursoForm, setCursoForm] = useState({
    title: "", link: "", plataforma: "otro", nivel: "basico", specialty: "", desc: "",
  });
  const [publishingCurso, setPublishingCurso] = useState(false);
  const [cursoPublished, setCursoPublished] = useState(false);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.href = FONT_URL; link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

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
    loadCursos();
    if (user?.id && misPosts.length === 0 && !loadingPosts) {
      setLoadingPosts(true);
      feedApi.getPostsDeUsuario(user.id)
        .then(setMisPosts)
        .catch(() => setMisPosts([]))
        .finally(() => setLoadingPosts(false));
    }
  }, [loadCursos, user?.id]);

  useEffect(() => {
    if (user) {
      setEditBio(user.bio ?? "");
      setEditDept(user.departamento ?? "");
    }
  }, [user]);

  const handlePublishCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishingCurso(true);
    try {
      await cursosApi.crear({
        titulo: cursoForm.title, url: cursoForm.link,
        plataforma: cursoForm.plataforma, especialidad: cursoForm.specialty,
        nivel: cursoForm.nivel, descripcion: cursoForm.desc,
      });
      setCursoPublished(true);
      await loadCursos();
    } catch {
      setCursoPublished(true);
    } finally {
      setPublishingCurso(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("bio", editBio);
      fd.append("departamento", editDept);
      await perfilApi.updatePerfil(fd);
      await refreshUser();
      setEditMode(false);
    } catch { /* noop */ }
    finally { setSaving(false); }
  };

  const nombre = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "—";
  const departamento = user?.departamento ?? "Dpto. Técnico-Profesional";
  const fotoSrc = user?.foto_perfil
    ? (user.foto_perfil.startsWith("http") ? user.foto_perfil : `${BASE_URL}${user.foto_perfil}`)
    : null;

  const TABS = [
    { id: "perfil" as const,       label: "Perfil" },
    { id: "cursos" as const,       label: `Cursos (${misCursos.length})` },
    { id: "publicaciones" as const, label: `Posts (${misPosts.length})` },
  ];

  const canSubmit = cursoForm.title && cursoForm.link && cursoForm.specialty && cursoForm.desc && !publishingCurso;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div style={{ backgroundColor: "white", borderBottom: "1px solid #E8E4DC" }}>

        <div style={{ height: 160, position: "relative", overflow: "hidden", backgroundColor: "#0d1b35" }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }} />
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: "50%",
            background: "linear-gradient(145deg, transparent 40%, rgba(212,175,55,0.05) 100%)",
          }} />
          <div style={{
            position: "absolute", top: 14, left: 16,
            display: "flex", alignItems: "center", gap: 6,
            backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)",
            borderRadius: 999, padding: "5px 12px",
          }}>
            <ShieldCheck style={{ width: 11, height: 11, color: "#16a34a", flexShrink: 0 }} />
            <span style={{ fontSize: "0.67rem", fontWeight: 700, color: "#1a2236", letterSpacing: "0.02em" }}>
              Docente Verificado · Liceo Cardenal Caro
            </span>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: "#D4AF37" }} />
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>

            {/* Avatar — overlaps cover by 44px */}
            <div style={{ marginTop: -44, flexShrink: 0, position: "relative" }}>
              <label className="group" style={{ cursor: "pointer", display: "block", position: "relative" }}>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await perfilApi.uploadFoto(file);
                  await refreshUser();
                }} />
                {fotoSrc ? (
                  <img src={fotoSrc} alt={nombre} style={{
                    width: 96, height: 96, borderRadius: 18,
                    objectFit: "cover",
                    border: "4px solid #FFFFFF",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    display: "block",
                  }} />
                ) : (
                  <div style={{
                    width: 96, height: 96, borderRadius: 18,
                    backgroundColor: "#0d1b35",
                    border: "4px solid #FFFFFF",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ color: "white", fontSize: "2rem", fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                      {nombre.charAt(0)}
                    </span>
                  </div>
                )}
                <div style={{
                  position: "absolute", inset: -5, borderRadius: 22,
                  border: "1.5px solid rgba(212,175,55,0.4)", pointerEvents: "none",
                }} />
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{
                  position: "absolute", inset: 0, borderRadius: 18,
                  backgroundColor: "rgba(0,0,0,0.38)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Camera style={{ width: 18, height: 18, color: "white" }} />
                </div>
              </label>
              <div style={{
                position: "absolute", bottom: -4, right: -4,
                width: 26, height: 26, borderRadius: 9,
                backgroundColor: "#D4AF37", border: "2.5px solid white",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10, boxShadow: "0 2px 8px rgba(212,175,55,0.4)",
              }}>
                <Award style={{ width: 12, height: 12, color: "white" }} />
              </div>
            </div>

            <div style={{ flex: 1, paddingTop: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h1 style={{
                    margin: 0, color: "#0d1b35",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 800, fontSize: "1.3rem", lineHeight: 1.2,
                  }}>
                    Prof. {nombre}
                  </h1>
                  <p style={{ margin: "4px 0 0", color: "#475569", fontSize: "0.855rem", fontWeight: 500 }}>
                    {departamento}
                  </p>
                  <p style={{ margin: "3px 0 0", color: "#8C7B6B", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin style={{ width: 10, height: 10 }} />
                    Liceo Cardenal Caro · Lo Espejo
                  </p>
                </div>

                {editMode ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleSave} disabled={saving} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 16px", borderRadius: 10, border: "none",
                      backgroundColor: saving ? "#E8E4DC" : "#0d1b35",
                      color: saving ? "#94a3b8" : "white",
                      fontSize: "0.8rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
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
                  <button onClick={() => setEditMode(true)} style={{
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

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            margin: "14px 0 0",
            backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
            borderRadius: 12,
          }}>
            {[
              { label: "Cursos", value: misCursos.length > 0 ? `${misCursos.length}` : "—" },
              { label: "Posts",  value: misPosts.length  > 0 ? `${misPosts.length}`  : "—" },
              { label: "Ubicación", value: "Lo Espejo" },
            ].map((k, i) => (
              <div key={k.label} style={{
                textAlign: "center", padding: "11px 8px",
                borderRight: i < 2 ? "1px solid #E8E4DC" : "none",
              }}>
                <p style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "0.95rem", fontWeight: 700, color: "#0d1b35", margin: 0,
                }}>
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
                marginBottom: -2,
                transition: "color 0.15s",
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
              <CardHeading icon={PenSquare} title="Sobre mí" right={
                !editMode && (
                  <button onClick={() => setEditMode(true)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#0d1b35", fontSize: "0.75rem", fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    padding: 0,
                  }}>
                    Editar →
                  </button>
                )
              } />
              {editMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Field label="Departamento">
                    <input
                      type="text" value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      placeholder="ej. Dpto. Electricidad"
                      style={S.input}
                      onFocus={focusGold} onBlur={blurGold}
                    />
                  </Field>
                  <Field label="Biografía">
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={4}
                      placeholder="Cuéntanos sobre tu experiencia y metodología..."
                      style={{ ...S.input, resize: "none" } as React.CSSProperties}
                      onFocus={focusGold} onBlur={blurGold}
                    />
                  </Field>
                </div>
              ) : (
                <p style={{ margin: 0, color: "#475569", fontSize: "0.875rem", lineHeight: 1.7 }}>
                  {user?.bio || (
                    <span style={{ color: "#8C7B6B" }}>
                      Aún no has agregado una descripción.{" "}
                      <button onClick={() => setEditMode(true)} style={{
                        color: "#0d1b35", fontWeight: 600, cursor: "pointer",
                        background: "none", border: "none", padding: 0,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        textDecoration: "underline",
                      }}>
                        Agregar bio
                      </button>
                    </span>
                  )}
                </p>
              )}
            </div>

            <div style={S.card}>
              <CardHeading icon={Mail} title="Contacto institucional" />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { Icon: Mail,   text: user?.email ?? "docente@liceocaro.cl" },
                  { Icon: MapPin, text: "Liceo Cardenal Caro, Lo Espejo, RM" },
                  { Icon: Clock,  text: "Disponible: Lun–Vie · 08:00–18:00 hrs" },
                ].map(({ Icon, text }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon style={{ width: 13, height: 13, color: "#8C7B6B" }} />
                    </div>
                    <span style={{ color: "#475569", fontSize: "0.855rem" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={S.card}>
              <CardHeading icon={GraduationCap} title="Cursos publicados" right={
                <button onClick={() => setTab("cursos")} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#0d1b35", fontSize: "0.75rem", fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0,
                }}>
                  Ver todos →
                </button>
              } />
              <p style={{ margin: "0 0 12px", color: "#8C7B6B", fontSize: "0.8rem", lineHeight: 1.55 }}>
                Publica recursos y cursos para tus alumnos desde la pestaña <strong style={{ color: "#0d1b35" }}>Cursos</strong>.
              </p>
              <button onClick={() => setTab("cursos")} style={{
                color: "#0d1b35", fontWeight: 700, fontSize: "0.78rem",
                background: "none", border: "none", padding: 0, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textDecoration: "underline", textUnderlineOffset: 3,
              }}>
                {misCursos.length > 0
                  ? `Ver mis ${misCursos.length} curso${misCursos.length !== 1 ? "s" : ""} →`
                  : "Publicar primer curso →"}
              </button>
            </div>
          </motion.div>
        )}

        {tab === "cursos" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ ...S.label, margin: 0 }}>
                {misCursos.length > 0
                  ? `${misCursos.length} recurso${misCursos.length !== 1 ? "s" : ""} publicado${misCursos.length !== 1 ? "s" : ""}`
                  : "Recursos educativos"}
              </p>
              <button
                onClick={() => { setShowCursoForm(true); setCursoPublished(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 10, border: "none",
                  backgroundColor: "#0d1b35", color: "white",
                  fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <Plus style={{ width: 13, height: 13 }} /> Publicar curso
              </button>
            </div>

            {loadingCursos ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                <Spinner />
              </div>
            ) : misCursos.length === 0 ? (
              <div style={{ ...S.card, padding: "44px 20px", textAlign: "center" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <BookOpen style={{ width: 22, height: 22, color: "#C9B99A" }} />
                </div>
                <p style={{ color: "#0d1b35", fontSize: "0.875rem", fontWeight: 700, margin: "0 0 4px" }}>
                  Sin cursos publicados
                </p>
                <p style={{ color: "#8C7B6B", fontSize: "0.8rem", margin: "0 0 14px" }}>
                  Comparte recursos con tus estudiantes
                </p>
                <button
                  onClick={() => { setShowCursoForm(true); setCursoPublished(false); }}
                  style={{
                    padding: "8px 18px", borderRadius: 10,
                    border: "1px solid #E8E4DC", backgroundColor: "white",
                    color: "#0d1b35", fontSize: "0.8rem", fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Publicar primer curso
                </button>
              </div>
            ) : (
              misCursos.map((c, i) => {
                const nivelStyle: React.CSSProperties =
                  c.nivel === "basico"
                    ? { backgroundColor: "#F0FDF4", color: "#15803d", border: "1px solid #bbf7d0" }
                    : c.nivel === "intermedio"
                    ? { backgroundColor: "#FFFBF0", color: "#b45309", border: "1px solid #fde68a" }
                    : { backgroundColor: "#FEF2F2", color: "#dc2626", border: "1px solid #fecaca" };

                return (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={S.card}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.3rem",
                      }}>
                        {c.plataforma === "youtube" ? "▶️" : c.plataforma === "udemy" ? "🎓" : "📘"}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                          <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.875rem", fontWeight: 700 }}>
                            {c.titulo}
                          </p>
                          <span style={{
                            fontSize: "0.67rem", padding: "3px 9px",
                            borderRadius: 20, flexShrink: 0, fontWeight: 700,
                            ...nivelStyle,
                          }}>
                            {c.nivel}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                          {c.especialidad && (
                            <span style={{ color: "#8C7B6B", fontSize: "0.74rem", display: "flex", alignItems: "center", gap: 4 }}>
                              <Zap style={{ width: 11, height: 11 }} />{c.especialidad}
                            </span>
                          )}
                          {c.completados_count !== undefined && (
                            <span style={{ color: "#94a3b8", fontSize: "0.74rem", display: "flex", alignItems: "center", gap: 4 }}>
                              <Users style={{ width: 11, height: 11 }} />{c.completados_count} inscritos
                            </span>
                          )}
                        </div>

                        {c.descripcion && (
                          <p style={{
                            margin: "6px 0 0", color: "#8C7B6B", fontSize: "0.75rem", lineHeight: 1.55,
                            overflow: "hidden", display: "-webkit-box",
                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          }}>
                            {c.descripcion}
                          </p>
                        )}
                      </div>

                      {c.url && (
                        <a
                          href={c.url} target="_blank" rel="noopener noreferrer"
                          style={{
                            flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
                            fontSize: "0.74rem", border: "1px solid #E8E4DC",
                            padding: "6px 10px", borderRadius: 9,
                            color: "#0d1b35", fontWeight: 700,
                            textDecoration: "none", backgroundColor: "#F6F5F0",
                          }}
                        >
                          Ver <ExternalLink style={{ width: 11, height: 11 }} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}

            <AnimatePresence>
              {showCursoForm && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{
                    position: "fixed", inset: 0, zIndex: 50,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 16,
                    backgroundColor: "rgba(13,27,53,0.55)", backdropFilter: "blur(4px)",
                  }}
                  onClick={(e) => e.target === e.currentTarget && setShowCursoForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }}
                    style={{
                      backgroundColor: "white", borderRadius: 20,
                      boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                      width: "100%", maxWidth: 440, overflow: "hidden",
                    }}
                  >
                    <div style={{
                      height: 5, backgroundColor: "#0d1b35",
                      backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.3) 1px, transparent 1px)",
                      backgroundSize: "10px 10px",
                    }} />

                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px 20px", borderBottom: "1px solid #F1EDE5",
                    }}>
                      <p style={{
                        margin: 0, color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700,
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}>
                        Publicar curso o recurso
                      </p>
                      <button
                        onClick={() => setShowCursoForm(false)}
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
                          cursor: "pointer", color: "#64748b",
                        }}
                      >
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    </div>

                    <div style={{ padding: 20 }}>
                      {cursoPublished ? (
                        <div style={{ textAlign: "center", padding: "24px 0" }}>
                          <div style={{
                            width: 56, height: 56, backgroundColor: "#F6F5F0",
                            border: "1px solid #E8E4DC",
                            borderRadius: 18,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 14px",
                          }}>
                            <CheckCircle style={{ width: 24, height: 24, color: "#D4AF37" }} />
                          </div>
                          <p style={{
                            margin: "0 0 5px", color: "#0d1b35", fontSize: "0.9rem", fontWeight: 700,
                            fontFamily: "'Playfair Display', serif",
                          }}>
                            ¡Curso publicado!
                          </p>
                          <p style={{ margin: "0 0 18px", color: "#8C7B6B", fontSize: "0.8rem", lineHeight: 1.5 }}>
                            Los alumnos ya pueden encontrarlo en Buscar → Cursos.
                          </p>
                          <button
                            onClick={() => {
                              setCursoPublished(false);
                              setCursoForm({ title: "", link: "", plataforma: "otro", nivel: "basico", specialty: "", desc: "" });
                            }}
                            style={{
                              padding: "9px 18px", borderRadius: 10,
                              border: "1px solid #E8E4DC", backgroundColor: "white",
                              color: "#0d1b35", fontSize: "0.8rem", fontWeight: 700,
                              cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                          >
                            Publicar otro
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handlePublishCurso} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <Field label="Título *">
                            <input
                              type="text" required value={cursoForm.title}
                              onChange={(e) => setCursoForm((p) => ({ ...p, title: e.target.value }))}
                              placeholder="ej. Electricidad Residencial para Técnicos"
                              style={S.input} onFocus={focusGold} onBlur={blurGold}
                            />
                          </Field>

                          <Field label="Enlace *">
                            <div style={{ position: "relative" }}>
                              <Link2 style={{
                                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                                width: 13, height: 13, color: "#94a3b8",
                              }} />
                              <input
                                type="url" required value={cursoForm.link}
                                onChange={(e) => setCursoForm((p) => ({ ...p, link: e.target.value }))}
                                placeholder="https://youtube.com/watch?v=..."
                                style={{ ...S.input, paddingLeft: 34 }}
                                onFocus={focusGold} onBlur={blurGold}
                              />
                            </div>
                          </Field>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <Field label="Plataforma">
                              <select
                                value={cursoForm.plataforma}
                                onChange={(e) => setCursoForm((p) => ({ ...p, plataforma: e.target.value }))}
                                style={{ ...S.input, padding: "9px 13px" }}
                                onFocus={focusGold} onBlur={blurGold}
                              >
                                <option value="youtube">YouTube</option>
                                <option value="udemy">Udemy</option>
                                <option value="otro">Otro</option>
                              </select>
                            </Field>
                            <Field label="Nivel">
                              <select
                                value={cursoForm.nivel}
                                onChange={(e) => setCursoForm((p) => ({ ...p, nivel: e.target.value }))}
                                style={{ ...S.input, padding: "9px 13px" }}
                                onFocus={focusGold} onBlur={blurGold}
                              >
                                <option value="basico">Básico</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                              </select>
                            </Field>
                          </div>

                          <Field label="Área / Especialidad *">
                            <select
                              required value={cursoForm.specialty}
                              onChange={(e) => setCursoForm((p) => ({ ...p, specialty: e.target.value }))}
                              style={{ ...S.input, padding: "9px 13px" }}
                              onFocus={focusGold} onBlur={blurGold}
                            >
                              <option value="">Selecciona...</option>
                              {ESPECIALIDADES.map((e) => <option key={e}>{e}</option>)}
                            </select>
                          </Field>

                          <Field label="Descripción *">
                            <textarea
                              required value={cursoForm.desc}
                              onChange={(e) => setCursoForm((p) => ({ ...p, desc: e.target.value }))}
                              rows={3} placeholder="¿Qué aprenderán? ¿A quién va dirigido?"
                              style={{ ...S.input, resize: "none" } as React.CSSProperties}
                              onFocus={focusGold} onBlur={blurGold}
                            />
                          </Field>

                          <button
                            type="submit" disabled={!canSubmit}
                            style={{
                              width: "100%", padding: "12px 0",
                              borderRadius: 12, border: "none",
                              fontSize: "0.875rem", fontWeight: 700,
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                              backgroundColor: canSubmit ? "#0d1b35" : "#F6F5F0",
                              color: canSubmit ? "white" : "#94a3b8",
                              cursor: canSubmit ? "pointer" : "not-allowed",
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              transition: "background-color 0.15s",
                            }}
                          >
                            {publishingCurso
                              ? <><Spinner size={15} /> Publicando...</>
                              : "Publicar curso"}
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
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {loadingPosts ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "52px 0" }}>
                <Spinner />
              </div>
            ) : (
              <PostList
                posts={misPosts}
                nombre={`Prof. ${nombre}`}
                fotoSrc={fotoSrc}
                onDeletePost={(id) => setMisPosts((prev) => prev.filter((p) => p.id !== id))}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
