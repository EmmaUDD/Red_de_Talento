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

const postTypes = [
  { id: "empleo" as PostType, label: "Oferta de Empleo", icon: Briefcase, desc: "Publica una vacante para estudiantes o egresados" },
  { id: "evento" as PostType, label: "Evento", icon: CalendarDays, desc: "Jornada de visita, feria, charla u otro evento" },
  { id: "anuncio" as PostType, label: "Anuncio / Post", icon: Send, desc: "Novedad, logro, mensaje para la comunidad" },
];

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

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-slate-900 font-bold" style={{ fontSize: "1.25rem" }}>Publicar contenido</h1>
          <p className="text-slate-500 text-sm mt-0.5">Crea empleos, eventos y anuncios para la comunidad del Liceo</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-slate-900 font-semibold mb-3" style={{ fontSize: "0.875rem" }}>¿Qué deseas publicar?</h3>
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
                      <p className={`text-xs ${active ? "text-slate-900 font-bold" : "text-slate-600 font-medium"}`}>{t.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 font-semibold mb-4" style={{ fontSize: "0.875rem" }}>
                {postType === "empleo" ? "Detalles de la oferta" : postType === "evento" ? "Detalles del evento" : "Redactar anuncio"}
              </h3>

              <form onSubmit={handlePublish} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-sm mb-1.5 font-medium">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.titulo}
                    onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                    placeholder={postType === "empleo" ? "ej. Técnico Electricista Junior" : postType === "evento" ? "ej. Visita a planta industrial" : "ej. ¡Bienvenidos a nuestros nuevos prácticos!"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {postType === "empleo" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 text-sm mb-1.5 font-medium">Tipo de contrato</label>
                      <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as TipoOferta }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none">
                        <option value="Part-time">Part-time</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Práctica">Práctica / Pasantía</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm mb-1.5 font-medium">Modalidad</label>
                      <select value={form.modalidad} onChange={(e) => setForm((p) => ({ ...p, modalidad: e.target.value as ModalidadOferta }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none">
                        <option value="Presencial">Presencial</option>
                        <option value="Híbrido">Híbrido</option>
                        <option value="Remoto">Remoto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm mb-1.5 font-medium">Especialidad</label>
                      <select value={form.especialidad} onChange={(e) => setForm((p) => ({ ...p, especialidad: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none">
                        <option value="">Sin especificar</option>
                        <option value="Electricidad">Electricidad</option>
                        <option value="Computación e Informática">Computación</option>
                        <option value="Construcción">Construcción</option>
                        <option value="Mecánica Automotriz">Mecánica</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm mb-1.5 font-medium">Remuneración (CLP)</label>
                      <input type="number" min="0" value={form.salario} onChange={(e) => setForm((p) => ({ ...p, salario: e.target.value }))}
                        placeholder="ej. 400000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-700 text-sm mb-1.5 font-medium">Ubicación</label>
                      <input value={form.ubicacion} onChange={(e) => setForm((p) => ({ ...p, ubicacion: e.target.value }))}
                        placeholder="ej. Lo Espejo"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none" />
                    </div>
                  </div>
                )}

                {postType === "evento" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 text-sm mb-1.5 font-medium">Fecha</label>
                      <input type="date" value={form.fecha} onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm mb-1.5 font-medium">Hora</label>
                      <input type="time" value={form.hora} onChange={(e) => setForm((p) => ({ ...p, hora: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-700 text-sm mb-1.5 font-medium">Lugar</label>
                      <input value={form.lugar} onChange={(e) => setForm((p) => ({ ...p, lugar: e.target.value }))}
                        placeholder="ej. Instalaciones de la empresa"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 text-sm mb-1.5 font-medium">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                    rows={4} placeholder="Describe los detalles relevantes..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200" />
                </div>

                <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {postType === "empleo" ? "Tu oferta aparecerá en el listado de empleos de la plataforma." : "Tu publicación será revisada por el Liceo antes de aparecer en la plataforma."}
                  </p>
                </div>

                <AnimatePresence>
                  {publishedSuccess && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-green-700 text-sm font-semibold">¡Publicado exitosamente!</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={!form.titulo || !form.descripcion || publishing}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${form.titulo && form.descripcion && !publishing ? "bg-slate-900 hover:bg-slate-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                  <Send className="w-4 h-4" />
                  {publishing ? "Publicando…" : postType === "empleo" ? "Publicar oferta" : "Enviar para revisión"}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-slate-900 font-semibold mb-3" style={{ fontSize: "0.875rem" }}>Mis ofertas activas</h3>
              {loadingOfertas ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                </div>
              ) : misOfertas.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-xs">Sin publicaciones activas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {misOfertas.map((o) => (
                    <div key={o.id} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                            {o.tipo}
                          </span>
                          <p className="text-slate-900 text-xs mt-1.5 font-semibold">{o.titulo}</p>
                        </div>
                        <button onClick={() => handleEliminar(o.id)}
                          className="text-slate-300 hover:text-red-400 flex-shrink-0 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {o.postulaciones_count ?? 0} post.</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                          {new Date(o.fecha_publicacion).toLocaleDateString("es-CL")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-xl p-4 text-white">
              <p className="text-sm font-semibold mb-1.5">💡 Tip</p>
              <p className="text-white/60 text-xs leading-relaxed">
                Incluye la ubicación y el tipo de contrato para que los candidatos puedan filtrar tu oferta más fácilmente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
