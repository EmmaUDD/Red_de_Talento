import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase, CalendarDays, Send, CheckCircle, Plus,
  Trash2, Eye, Clock, MapPin, Building2, AlertCircle, X,
} from "lucide-react";
import { apiRequest } from "../../../api/client";

type PostType = "empleo" | "evento" | "anuncio";

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

export function CompanyPublicar() {
  const [postType, setPostType] = useState<PostType>("empleo");
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [remuneracion, setRemuneracion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [modalidad, setModalidad] = useState("presencial");
  const [disponibilidad, setDisponibilidad] = useState("");

  const loadOfertas = async () => {
    try {
      const res = await apiRequest("/api/ofertas/");
      if (res.ok) {
        const data = await res.json();
        setOfertas(data);
      }
    } catch {}
  };

  useEffect(() => {
    loadOfertas();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !descripcion) return;
    setLoading(true);

    try {
      if (postType === "empleo") {
        const res = await apiRequest("/api/ofertas/", {
          method: "POST",
          body: JSON.stringify({
            titulo,
            descripcion,
            especialidad_requerida: especialidad,
            remuneracion: remuneracion || null,
            ubicacion: ubicacion || null,
            modalidad,
            disponibilidad_requerida: disponibilidad || null,
          }),
        });
        if (res.ok) {
          setPublishedSuccess(true);
          setTitulo(""); setDescripcion(""); setEspecialidad("");
          setRemuneracion(""); setUbicacion("");
          loadOfertas();
          setTimeout(() => setPublishedSuccess(false), 3000);
        }
      } else {
        // Para eventos y anuncios usamos el feed
        const res = await apiRequest("/api/feed/", {
          method: "POST",
          body: JSON.stringify({
            contenido: `**${titulo}**\n\n${descripcion}`,
            tipo: postType === "evento" ? "evento" : "post",
          }),
        });
        if (res.ok) {
          setPublishedSuccess(true);
          setTitulo(""); setDescripcion("");
          setTimeout(() => setPublishedSuccess(false), 3000);
        }
      }
    } catch {
      alert("Error al publicar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const postTypes = [
    { id: "empleo", label: "Oferta de Empleo", icon: Briefcase, desc: "Publica una vacante para estudiantes o egresados" },
    { id: "evento", label: "Evento", icon: CalendarDays, desc: "Jornada de visita, feria, charla u otro evento" },
    { id: "anuncio", label: "Anuncio / Post", icon: Send, desc: "Novedad, logro, mensaje para la comunidad" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Publicar contenido</h1>
          <p className="text-slate-500 text-sm mt-0.5">Crea empleos, eventos y anuncios para la comunidad del Liceo</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-5">
        <AnimatePresence>
          {publishedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700 text-sm" style={{ fontWeight: 600 }}>¡Publicado exitosamente!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Type selector */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-slate-900 mb-3" style={{ fontSize: "0.875rem", fontWeight: 600 }}>¿Qué deseas publicar?</h3>
              <div className="grid grid-cols-3 gap-2">
                {postTypes.map((t) => {
                  const Icon = t.icon;
                  const active = postType === t.id;
                  return (
                    <button key={t.id} onClick={() => setPostType(t.id)}
                      className={`border-2 rounded-xl p-3 text-center transition-all ${active ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center ${active ? "bg-slate-900" : "bg-slate-100"}`}>
                        <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-500"}`} />
                      </div>
                      <p className={`text-xs ${active ? "text-slate-900" : "text-slate-600"}`} style={{ fontWeight: active ? 700 : 500 }}>{t.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form fields */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 mb-4" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                {postType === "empleo" ? "Detalles de la oferta" : postType === "evento" ? "Detalles del evento" : "Redactar anuncio"}
              </h3>

              <form onSubmit={handlePublish} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Título *</label>
                  <input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    placeholder={postType === "empleo" ? "Ej: Técnico Electricista Junior" : "Título del evento o anuncio"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Descripción *</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe los detalles..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {postType === "empleo" && (
                  <>
                    <div>
                      <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Especialidad requerida *</label>
                      <input
                        value={especialidad}
                        onChange={(e) => setEspecialidad(e.target.value)}
                        required
                        placeholder="Ej: Electricidad, Computación..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Remuneración</label>
                        <input
                          value={remuneracion}
                          onChange={(e) => setRemuneracion(e.target.value)}
                          placeholder="Ej: $450.000/mes"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Ubicación</label>
                        <input
                          value={ubicacion}
                          onChange={(e) => setUbicacion(e.target.value)}
                          placeholder="Ej: Lo Espejo"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Modalidad</label>
                        <select
                          value={modalidad}
                          onChange={(e) => setModalidad(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="presencial">Presencial</option>
                          <option value="online">Online</option>
                          <option value="semi_presencial">Semi-presencial</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Disponibilidad requerida</label>
                        <select
                          value={disponibilidad}
                          onChange={(e) => setDisponibilidad(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="">Sin preferencia</option>
                          <option value="part_time">Part-time</option>
                          <option value="full_time">Full-time</option>
                          <option value="fines_de_semana">Fines de semana</option>
                          <option value="practicas">Prácticas</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  {loading ? "Publicando..." : "Publicar"}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar — mis ofertas activas */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-slate-900 mb-3" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Mis ofertas activas</h3>
              {ofertas.length === 0 ? (
                <p className="text-slate-400 text-xs">No tienes ofertas publicadas aún.</p>
              ) : (
                <div className="space-y-3">
                  {ofertas.map((o) => (
                    <div key={o.id} className="border border-slate-200 rounded-lg p-3">
                      <p className="text-slate-900 text-xs" style={{ fontWeight: 600 }}>{o.titulo}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{o.especialidad_requerida}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${o.activa ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`} style={{ fontWeight: 600 }}>
                          {o.activa ? "Activa" : "Cerrada"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}