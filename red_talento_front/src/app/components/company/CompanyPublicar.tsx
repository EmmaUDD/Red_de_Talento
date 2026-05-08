import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "react-router";
import {
  Briefcase, CalendarDays, Send, CheckCircle,
  Trash2, Eye, Clock, AlertCircle,
} from "lucide-react";
import { ofertasApi, feedApi } from "@/api/api";
import type { OfertaLaboral, TipoOferta, ModalidadOferta } from "@/app/types";

type PostType = "empleo" | "evento" | "anuncio";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap";

const postTypes = [
  { id: "empleo" as PostType, label: "Oferta de Empleo", icon: Briefcase, desc: "Publica una vacante para estudiantes o egresados" },
  { id: "evento" as PostType, label: "Evento", icon: CalendarDays, desc: "Jornada de visita, feria, charla u otro evento" },
  { id: "anuncio" as PostType, label: "Anuncio / Post", icon: Send, desc: "Novedad, logro, mensaje para la comunidad" },
];

const tipoStyle: Record<string, React.CSSProperties> = {
  "Part-time": { backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 20, fontSize: 11, padding: "2px 9px", fontWeight: 700 },
  "Full-time": { backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 20, fontSize: 11, padding: "2px 9px", fontWeight: 700 },
  "Práctica": { backgroundColor: "#fdf4ff", color: "#7e22ce", border: "1px solid #e9d5ff", borderRadius: 20, fontSize: 11, padding: "2px 9px", fontWeight: 700 },
};

const S: Record<string, React.CSSProperties> = {
  card: { backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14 },
  input: {
    width: "100%",
    boxSizing: "border-box" as const,
    backgroundColor: "#F6F5F0",
    border: "1.5px solid #E8E4DC",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: "0.9rem",
    color: "#0d1b35",
    outline: "none",
    fontFamily: "'Crimson Text', Georgia, serif",
  },
  label: {
    display: "block" as const,
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#4A3F35",
    marginBottom: 6,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    fontFamily: "'Crimson Text', Georgia, serif",
  },
};

export function CompanyPublicar() {
  const [searchParams] = useSearchParams();
  const tipoParam = searchParams.get("tipo") as PostType | null;
  const [postType, setPostType] = useState<PostType>(
    tipoParam && ["empleo", "evento", "anuncio"].includes(tipoParam) ? tipoParam : "empleo"
  );
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [misOfertas, setMisOfertas] = useState<OfertaLaboral[]>([]);
  const [loadingOfertas, setLoadingOfertas] = useState(true);

  const [form, setForm] = useState({
    titulo: "", tipo: "Part-time" as TipoOferta, especialidad: "",
    salario: "", ubicacion: "", modalidad: "Presencial" as ModalidadOferta,
    descripcion: "", fecha: "", hora: "", lugar: "",
  });

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  const loadMisOfertas = useCallback(async () => {
    setLoadingOfertas(true);
    try {
      const ofertas = await ofertasApi.getMisOfertas();
      setMisOfertas(ofertas);
    } catch {
      setMisOfertas([]);
    } finally {
      setLoadingOfertas(false);
    }
  }, []);

  useEffect(() => { loadMisOfertas(); }, [loadMisOfertas]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.descripcion) return;
    setPublishing(true);
    try {
      if (postType === "empleo") {
        await ofertasApi.crear({
          titulo: form.titulo,
          tipo: form.tipo,
          especialidad: form.especialidad || undefined,
          salario: form.salario || undefined,
          ubicacion: form.ubicacion || "Sin especificar",
          modalidad: form.modalidad,
          descripcion: form.descripcion,
          requisitos: [],
        });
        await loadMisOfertas();
      } else if (postType === "evento") {
        const partes: string[] = [`📅 ${form.titulo}`];
        if (form.fecha || form.hora) {
          const fechaStr = form.fecha
            ? new Date(form.fecha + "T00:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
            : "";
          const horaStr = form.hora ? `a las ${form.hora}` : "";
          partes.push(`🗓 ${[fechaStr, horaStr].filter(Boolean).join(" ")}`);
        }
        if (form.lugar) partes.push(`📍 ${form.lugar}`);
        partes.push(`\n${form.descripcion}`);
        await feedApi.crearPost(partes.join("\n"), "evento");
      } else {
        await feedApi.crearPost(`${form.titulo}\n\n${form.descripcion}`, "post");
      }
      setPublishedSuccess(true);
      setForm({ titulo: "", tipo: "Part-time", especialidad: "", salario: "", ubicacion: "", modalidad: "Presencial", descripcion: "", fecha: "", hora: "", lugar: "" });
      setTimeout(() => setPublishedSuccess(false), 3500);
    } catch {
      // silencioso
    } finally {
      setPublishing(false);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await ofertasApi.eliminar(id);
      setMisOfertas((p) => p.filter((o) => o.id !== id));
    } catch {}
  };

  const canSubmit = !!(form.titulo && form.descripcion && !publishing);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Crimson Text', Georgia, serif" }}>
<div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DC", padding: "20px 24px 18px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
            <div style={{ width: 32, height: 3, backgroundColor: "#D4AF37", borderRadius: 2 }} />
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.35rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>
              Publicar contenido
            </h1>
          </div>
          <p style={{ color: "#8C7B6B", fontSize: "0.9rem", marginTop: 4 }}>
            Crea empleos, eventos y anuncios para la comunidad del Liceo
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "22px 24px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: form area */}
          <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Post type selector */}
            <div style={{ ...S.card, padding: 18 }}>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.82rem", fontWeight: 700, color: "#0d1b35", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                ¿Qué deseas publicar?
              </p>
              <div className="grid grid-cols-3 gap-3">
                {postTypes.map((t) => {
                  const Icon = t.icon;
                  const active = postType === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setPostType(t.id)}
                      style={{
                        border: active ? "2px solid #D4AF37" : "2px solid #E8E4DC",
                        borderRadius: 12,
                        padding: "14px 10px",
                        textAlign: "center",
                        backgroundColor: active ? "#FFFBF0" : "#FFFFFF",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        margin: "0 auto 10px",
                        backgroundColor: active ? "#D4AF37" : "#F0EDE8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Icon style={{ width: 17, height: 17, color: active ? "#FFFFFF" : "#8C7B6B" }} />
                      </div>
                      <p style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: active ? "#0d1b35" : "#6B5D52",
                        margin: 0,
                        lineHeight: 1.3,
                      }}>
                        {t.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form card */}
            <div style={{ ...S.card, padding: 22 }}>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#0d1b35", marginBottom: 20 }}>
                {postType === "empleo" ? "Detalles de la oferta" : postType === "evento" ? "Detalles del evento" : "Redactar anuncio"}
              </p>

              <form onSubmit={handlePublish} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Título */}
                <div>
                  <label style={S.label}>
                    Título <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    value={form.titulo}
                    onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                    placeholder={
                      postType === "empleo" ? "ej. Técnico Electricista Junior"
                      : postType === "evento" ? "ej. Visita a planta industrial"
                      : "ej. ¡Bienvenidos a nuestros nuevos prácticos!"
                    }
                    style={S.input}
                  />
                </div>

                {/* Empleo fields */}
                {postType === "empleo" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={S.label}>Tipo de contrato</label>
                      <select
                        value={form.tipo}
                        onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as TipoOferta }))}
                        style={{ ...S.input, appearance: "none" as const }}
                      >
                        <option value="Part-time">Part-time</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Práctica">Práctica / Pasantía</option>
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Modalidad</label>
                      <select
                        value={form.modalidad}
                        onChange={(e) => setForm((p) => ({ ...p, modalidad: e.target.value as ModalidadOferta }))}
                        style={{ ...S.input, appearance: "none" as const }}
                      >
                        <option value="Presencial">Presencial</option>
                        <option value="Híbrido">Híbrido</option>
                        <option value="Remoto">Remoto</option>
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Especialidad</label>
                      <select
                        value={form.especialidad}
                        onChange={(e) => setForm((p) => ({ ...p, especialidad: e.target.value }))}
                        style={{ ...S.input, appearance: "none" as const }}
                      >
                        <option value="">Sin especificar</option>
                        <option value="Electricidad">Electricidad</option>
                        <option value="Computación e Informática">Computación</option>
                        <option value="Construcción">Construcción</option>
                        <option value="Mecánica Automotriz">Mecánica</option>
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Remuneración (CLP)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.salario}
                        onChange={(e) => setForm((p) => ({ ...p, salario: e.target.value }))}
                        placeholder="ej. 400000"
                        style={S.input}
                      />
                    </div>
                    <div className="col-span-2">
                      <label style={S.label}>Ubicación</label>
                      <input
                        value={form.ubicacion}
                        onChange={(e) => setForm((p) => ({ ...p, ubicacion: e.target.value }))}
                        placeholder="ej. Lo Espejo"
                        style={S.input}
                      />
                    </div>
                  </div>
                )}

                {/* Evento fields */}
                {postType === "evento" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={S.label}>Fecha</label>
                      <input
                        type="date"
                        value={form.fecha}
                        onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Hora</label>
                      <input
                        type="time"
                        value={form.hora}
                        onChange={(e) => setForm((p) => ({ ...p, hora: e.target.value }))}
                        style={S.input}
                      />
                    </div>
                    <div className="col-span-2">
                      <label style={S.label}>Lugar</label>
                      <input
                        value={form.lugar}
                        onChange={(e) => setForm((p) => ({ ...p, lugar: e.target.value }))}
                        placeholder="ej. Instalaciones de la empresa"
                        style={S.input}
                      />
                    </div>
                  </div>
                )}

<div>
                  <label style={S.label}>
                    Descripción <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                    rows={5}
                    placeholder="Describe los detalles relevantes..."
                    style={{ ...S.input, resize: "none" as const }}
                  />
                </div>

                {/* Info banner */}
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  backgroundColor: "#FFFBF0",
                  border: "1px solid #F5E6C0",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}>
                  <AlertCircle style={{ width: 15, height: 15, color: "#B8962E", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: "0.86rem", color: "#7A6030", lineHeight: 1.5, margin: 0 }}>
                    {postType === "empleo"
                      ? "Tu oferta aparecerá en el listado de empleos de la plataforma."
                      : "Tu publicación será revisada por el Liceo antes de aparecer en la plataforma."}
                  </p>
                </div>

                {/* Success banner */}
                <AnimatePresence>
                  {publishedSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        backgroundColor: "#FFFBF0",
                        border: "1.5px solid #D4AF37",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <CheckCircle style={{ width: 16, height: 16, color: "#D4AF37", flexShrink: 0 }} />
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>
                        ¡Publicado exitosamente!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

<button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    width: "100%",
                    padding: "13px 0",
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: canSubmit ? "#0d1b35" : "#E8E4DC",
                    color: canSubmit ? "#FFFFFF" : "#A8998A",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: "'Crimson Text', Georgia, serif",
                    transition: "background-color 0.15s",
                  }}
                >
                  {publishing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#FFFFFF" }} />
                      Publicando…
                    </>
                  ) : (
                    <>
                      <Send style={{ width: 16, height: 16 }} />
                      {postType === "empleo" ? "Publicar oferta" : "Enviar para revisión"}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Mis ofertas */}
            <div style={{ ...S.card, padding: 18 }}>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.88rem", fontWeight: 700, color: "#0d1b35", marginBottom: 14 }}>
                Mis ofertas activas
              </p>
              {loadingOfertas ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: "#E8E4DC", borderTopColor: "#D4AF37" }} />
                </div>
              ) : misOfertas.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <p style={{ fontSize: "0.82rem", color: "#A8998A" }}>Sin publicaciones activas</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {misOfertas.map((o) => (
                    <div key={o.id} style={{ backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 10, padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                        <div>
                          <span style={tipoStyle[o.tipo] ?? tipoStyle["Part-time"]}>{o.tipo}</span>
                          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.82rem", fontWeight: 700, color: "#0d1b35", marginTop: 6, marginBottom: 0 }}>
                            {o.titulo}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEliminar(o.id)}
                          style={{ color: "#C0B09A", background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}
                        >
                          <Trash2 style={{ width: 15, height: 15 }} />
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.78rem", color: "#8C7B6B" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Eye style={{ width: 12, height: 12 }} />
                          {o.postulaciones_count ?? 0} post.
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock style={{ width: 12, height: 12 }} />
                          {new Date(o.fecha_publicacion).toLocaleDateString("es-CL")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tip card — navy dot-grid */}
            <div style={{
              backgroundColor: "#0d1b35",
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
              borderRadius: 14,
              padding: 18,
              borderBottom: "3px solid #D4AF37",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#D4AF37" }} />
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                  Consejo
                </p>
              </div>
              <p style={{ fontSize: "0.86rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>
                Incluye la ubicación y el tipo de contrato para que los candidatos puedan filtrar tu oferta más fácilmente.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
